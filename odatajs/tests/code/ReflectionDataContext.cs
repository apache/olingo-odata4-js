/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


namespace DataJS.Tests
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using Microsoft.OData.Service;
    using System.Globalization;
    using System.Linq;
    using System.Reflection;

    /// <summary>
    /// Provides a reflection-based, updatable data context.
    /// </summary>
    public abstract class ReflectionDataContext
    {
        // Fields
        private List<object> deletedObjects = new List<object>();
        private List<Action> pendingChanges;
        private static Dictionary<Type, Dictionary<string, IList>> resourceSetsByContextTypeStorage = new Dictionary<Type, Dictionary<string, IList>>();

        // Methods
        protected ReflectionDataContext()
        {
            this.MetadataHelper = new ReflectionMetadataHelper(this);
            this.pendingChanges = new List<Action>();
            if (!resourceSetsByContextTypeStorage.ContainsKey(base.GetType()))
            {
                resourceSetsByContextTypeStorage.Add(base.GetType(), new Dictionary<string, IList>());
                foreach (string resourceSetName in this.MetadataHelper.GetResourceSetNames())
                {
                    Type resourceType = this.MetadataHelper.GetResourceTypeOfSet(resourceSetName);
                    IList listOfTInstance = Activator.CreateInstance(typeof(List<>).MakeGenericType(new Type[] { resourceType })) as IList;
                    this.ResourceSetsStorage.Add(resourceSetName, listOfTInstance);
                }
            }
            this.EnsureDataIsInitialized();
        }

        public virtual void AddReferenceToCollection(object targetResource, string propertyName, object resourceToBeAdded)
        {
            ExceptionUtilities.CheckArgumentNotNull(targetResource, "targetResource");
            ExceptionUtilities.CheckArgumentNotNull(propertyName, "propertyName");
            ExceptionUtilities.CheckArgumentNotNull(resourceToBeAdded, "resourceToBeAdded");
            UpdatableToken targetToken = UpdatableToken.AssertIsToken(targetResource, "targetResource");
            targetResource = targetToken.Resource;
            resourceToBeAdded = UpdatableToken.AssertIsTokenAndResolve(resourceToBeAdded, "resourceToBeAdded");
            IList list = this.GetValue(targetToken, propertyName) as IList;
            ExceptionUtilities.CheckObjectNotNull(list, "Property '{0}' on type '{1}' was not a list", new object[] { propertyName, targetResource.GetType().Name });
            this.pendingChanges.Add(delegate {
                list.Add(resourceToBeAdded);
            });
        }

        public virtual void ClearChanges()
        {
            this.pendingChanges.Clear();
        }

        public void ClearData()
        {
            this.ResourceSetsStorage.Clear();
        }

        private static bool CompareETagValues(Dictionary<string, object> resourceCookieValues, IEnumerable<KeyValuePair<string, object>> concurrencyValues)
        {
            if (concurrencyValues.Count<KeyValuePair<string, object>>() != resourceCookieValues.Count)
            {
                return false;
            }
            foreach (KeyValuePair<string, object> keyValuePair in concurrencyValues)
            {
                if (!resourceCookieValues.ContainsKey(keyValuePair.Key))
                {
                    return false;
                }
                if (keyValuePair.Value == null)
                {
                    return (resourceCookieValues[keyValuePair.Key] == null);
                }
                if (!keyValuePair.Value.Equals(resourceCookieValues[keyValuePair.Key]))
                {
                    return false;
                }
            }
            return true;
        }

        public virtual object CreateResource(string containerName, string fullTypeName)
        {
            ExceptionUtilities.CheckArgumentNotNull(fullTypeName, "fullTypeName");
            UpdatableToken token = this.InstantiateResourceType(fullTypeName);
            if (containerName != null)
            {
                this.pendingChanges.Add(delegate {
                    this.GetResourceSetEntities(containerName).Add(token.Resource);
                });
            }
            return token;
        }

        private void DeleteAllReferences(object targetResource)
        {
            foreach (string currentSetName in this.MetadataHelper.GetResourceSetNames())
            {
                Type currentEntityType = this.MetadataHelper.GetResourceTypeOfSet(currentSetName);
                IList entitySetList = this.GetResourceSetEntities(currentSetName);
                foreach (NavigationPropertyInfo navigationProperty in this.MetadataHelper.GetNavigationProperties(GetResourceTypeFullName(currentEntityType)))
                {
                    if (navigationProperty.CollectionElementType != null)
                    {
                        foreach (object currentEntityInstance in entitySetList)
                        {
                            this.RemoveResourceFromCollectionOnTargetResourceMatch(targetResource, navigationProperty, currentEntityInstance);
                        }
                    }
                    else
                    {
                        ExceptionUtilities.CheckObjectNotNull(navigationProperty.PropertyInfo, "Invalid navigation property info", new object[0]);
                        foreach (object currentEntityInstance in entitySetList)
                        {
                            this.SetEntityReferenceToNullOnTargetResourceMatch(targetResource, navigationProperty, currentEntityInstance);
                        }
                    }
                }
            }
        }

        public virtual void DeleteResource(object targetResource)
        {
            ExceptionUtilities.CheckArgumentNotNull(targetResource, "targetResource");
            targetResource = UpdatableToken.AssertIsTokenAndResolve(targetResource, "targetResource");
            string resourceSetName = this.GetResourceSetOfTargetResource(targetResource);
            ExceptionUtilities.CheckObjectNotNull(resourceSetName, "Unable to find set of the resource to delete", new object[0]);
            this.deletedObjects.Add(targetResource);
            IList resourceSetList = this.GetResourceSetEntities(resourceSetName);
            this.DeleteAllReferences(targetResource);
            this.pendingChanges.Add(delegate {
                resourceSetList.Remove(targetResource);
            });
        }

        protected abstract void EnsureDataIsInitialized();

        protected virtual Type GetCollectionPropertyType(string fullTypeName, string propertyName)
        {
            Type type = this.MetadataHelper.FindClrTypeByFullName(fullTypeName);
            Type collectionType = null;
            if (type != null)
            {
                PropertyInfo property = type.GetProperty(propertyName);
                if (property != null)
                {
                    collectionType = property.PropertyType;
                }
            }
            return collectionType;
        }

        private Dictionary<string, object> GetConcurrencyValues(object targetResource)
        {
            Dictionary<string, object> etagValues = new Dictionary<string, object>();
            foreach (string etagProperty in this.MetadataHelper.GetETagPropertiesOfType(GetResourceTypeFullName(targetResource.GetType())))
            {
                etagValues.Add(etagProperty, targetResource.GetType().GetProperty(etagProperty).GetValue(targetResource, null));
            }
            return etagValues;
        }

        public virtual object GetResource(IQueryable query, string fullTypeName)
        {
            ExceptionUtilities.CheckArgumentNotNull(query, "query");
            object resource = null;
            foreach (object r in query)
            {
                ExceptionUtilities.Assert(resource == null, "Invalid Uri specified. The query '{0}' must refer to a single resource", new object[] { query.ToString() });
                resource = r;
            }
            if (resource == null)
            {
                return null;
            }
            if (fullTypeName != null)
            {
                this.ValidateResourceType(resource, fullTypeName);
            }
            return new UpdatableToken(resource);
        }

        public IList<T> GetResourceSetEntities<T>(string resourceSetName)
        {
            return (IList<T>) this.GetResourceSetEntities(resourceSetName);
        }

        internal IList GetResourceSetEntities(string resourceSetName)
        {
            IList entities;
            if (!this.ResourceSetsStorage.TryGetValue(resourceSetName, out entities))
            {
                Type elementType = this.MetadataHelper.GetResourceTypeOfSet(resourceSetName);
                entities = (IList) Activator.CreateInstance(typeof(List<>).MakeGenericType(new Type[] { elementType }));
                this.ResourceSetsStorage[resourceSetName] = entities;
            }
            return entities;
        }

        private string GetResourceSetOfTargetResource(object targetResource)
        {
            foreach (string currentResourceSetName in this.MetadataHelper.GetResourceSetNames())
            {
                if (this.GetResourceSetEntities(currentResourceSetName).Contains(targetResource))
                {
                    return currentResourceSetName;
                }
            }
            return null;
        }

        public static string GetResourceTypeFullName(Type type)
        {
            return type.FullName.Replace('+', '_');
        }

        public virtual object GetValue(object targetResource, string propertyName)
        {
            ExceptionUtilities.CheckArgumentNotNull(targetResource, "targetResource");
            ExceptionUtilities.CheckArgumentNotNull(propertyName, "propertyName");
            UpdatableToken token = UpdatableToken.AssertIsToken(targetResource, "targetResource");
            if (token.PendingPropertyUpdates.ContainsKey(propertyName))
            {
                return token.PendingPropertyUpdates[propertyName];
            }
            targetResource = token.Resource;
            PropertyInfo pi = targetResource.GetType().GetProperty(propertyName);
            ExceptionUtilities.CheckObjectNotNull(pi, "Cannot find the property '{0}' on type '{1}'", new object[] { propertyName, targetResource.GetType().Name });
            object value = pi.GetValue(targetResource, null);
            if ((value != null) && (pi.PropertyType.Assembly == base.GetType().Assembly))
            {
                ExceptionUtilities.Assert(!this.MetadataHelper.IsTypeAnEntityType(pi.PropertyType), "GetValue should never be called for reference properties. Type was '{0}', property was '{1}'", new object[] { pi.PropertyType.FullName, propertyName });
                value = new UpdatableToken(value);
            }
            return value;
        }

        private UpdatableToken InstantiateResourceType(string fullTypeName)
        {
            Type t = this.MetadataHelper.FindClrTypeByFullName(fullTypeName);
            object instance = Activator.CreateInstance(t);
            UpdatableToken token = new UpdatableToken(instance);
            foreach (PropertyInfo p in t.GetProperties())
            {
                object generatedValue;
                PropertyInfo property = p;
                if (this.IsCollectionProperty(property))
                {
                    Type collectionType = this.GetCollectionPropertyType(GetResourceTypeFullName(t), property.Name);
                    if (collectionType != null)
                    {
                        object newCollection = Activator.CreateInstance(collectionType);
                        token.PendingPropertyUpdates[property.Name] = newCollection;
                        this.pendingChanges.Add(delegate {
                            property.SetValue(instance, newCollection, null);
                        });
                    }
                }
                if (this.TryGetStoreGeneratedValue(fullTypeName, property.Name, out generatedValue))
                {
                    token.PendingPropertyUpdates[property.Name] = generatedValue;
                    this.pendingChanges.Add(delegate {
                        property.SetValue(instance, generatedValue, null);
                    });
                }
            }
            return token;
        }

        protected virtual bool IsCollectionProperty(PropertyInfo propertyInfo)
        {
            return ((typeof(IEnumerable).IsAssignableFrom(propertyInfo.PropertyType) && (propertyInfo.PropertyType != typeof(string))) && (propertyInfo.PropertyType != typeof(byte[])));
        }

        public virtual void RemoveReferenceFromCollection(object targetResource, string propertyName, object resourceToBeRemoved)
        {
            ExceptionUtilities.CheckArgumentNotNull(targetResource, "targetResource");
            ExceptionUtilities.CheckArgumentNotNull(propertyName, "propertyName");
            ExceptionUtilities.CheckArgumentNotNull(resourceToBeRemoved, "resourceToBeRemoved");
            UpdatableToken.AssertIsToken(targetResource, "targetResource");
            resourceToBeRemoved = UpdatableToken.AssertIsTokenAndResolve(resourceToBeRemoved, "resourceToBeRemoved");
            IList list = this.GetValue(targetResource, propertyName) as IList;
            ExceptionUtilities.CheckObjectNotNull(list, "Property '{0}' on type '{1}' was not a list", new object[] { propertyName, targetResource.GetType().Name });
            this.pendingChanges.Add(delegate {
                list.Remove(resourceToBeRemoved);
            });
        }

        private void RemoveResourceFromCollectionOnTargetResourceMatch(object targetResource, NavigationPropertyInfo navigationPropertyInfo, object currentEntityInstance)
        {
            IEnumerable childCollectionObject = navigationPropertyInfo.PropertyInfo.GetValue(currentEntityInstance, null) as IEnumerable;
            if (childCollectionObject.Cast<object>().Any<object>(delegate (object o) {
                return o == targetResource;
            }))
            {
                MethodInfo removeMethod = navigationPropertyInfo.PropertyInfo.PropertyType.GetMethod("Remove");
                this.pendingChanges.Add(delegate {
                    removeMethod.Invoke(childCollectionObject, new object[] { targetResource });
                });
            }
        }

        public virtual object ResetResource(object resource)
        {
            ExceptionUtilities.CheckArgumentNotNull(resource, "resource");
            UpdatableToken token = UpdatableToken.AssertIsToken(resource, "resource");
            resource = token.Resource;
            token = new UpdatableToken(resource);
            object newInstance = Activator.CreateInstance(resource.GetType());
            ExceptionUtilities.CheckObjectNotNull(newInstance, "Cannot reset resource because unable to creating new instance of type '{0}' returns null", new object[] { resource.GetType().Name });
            foreach (string propertyToReset in this.MetadataHelper.GetPropertiesToReset(GetResourceTypeFullName(resource.GetType())))
            {
                PropertyInfo pi = newInstance.GetType().GetProperty(propertyToReset);
                ExceptionUtilities.CheckObjectNotNull(pi, "Cannot reset resource because unable to find property '{0}'", new object[] { propertyToReset });
                object newValue = pi.GetValue(newInstance, null);
                this.pendingChanges.Add(delegate {
                    pi.SetValue(resource, newValue, null);
                });
                token.PendingPropertyUpdates[propertyToReset] = newValue;
            }
            return token;
        }

        public virtual object ResolveResource(object resource)
        {
            ExceptionUtilities.CheckArgumentNotNull(resource, "resource");
            return UpdatableToken.AssertIsTokenAndResolve(resource, "resource");
        }

        public virtual void SaveChanges()
        {
            foreach (Action pendingChange in this.pendingChanges)
            {
                pendingChange();
            }
            this.pendingChanges.Clear();
            foreach (object deleted in this.deletedObjects)
            {
                foreach (object entity in this.ResourceSetsStorage.SelectMany<KeyValuePair<string, IList>, object>(delegate (KeyValuePair<string, IList> p) {
                    return p.Value.Cast<object>();
                }))
                {
                    ExceptionUtilities.Assert(!object.ReferenceEquals(deleted, entity), "Found deleted entity!", new object[0]);
                    foreach (PropertyInfo propertyInfo in entity.GetType().GetProperties())
                    {
                        object value = propertyInfo.GetValue(entity, null);
                        ExceptionUtilities.Assert(!object.ReferenceEquals(deleted, value), "Found deleted entity!", new object[0]);
                        IEnumerable enumerable = value as IEnumerable;
                        if (enumerable != null)
                        {
                            foreach (object valueElement in enumerable.Cast<object>())
                            {
                                ExceptionUtilities.Assert(!object.ReferenceEquals(deleted, valueElement), "Found deleted entity!", new object[0]);
                            }
                        }
                    }
                }
            }
            this.deletedObjects.Clear();
        }

        protected virtual void SetCollectionPropertyValue(object targetResource, PropertyInfo propertyInfo, IEnumerable propertyValue)
        {
            object collection;
            ExceptionUtilities.CheckArgumentNotNull(targetResource, "targetResource");
            ExceptionUtilities.CheckArgumentNotNull(propertyInfo, "propertyInfo");
            ExceptionUtilities.CheckArgumentNotNull(propertyValue, "propertyValue");
            Type collectionType = this.GetCollectionPropertyType(GetResourceTypeFullName(propertyInfo.ReflectedType), propertyInfo.Name);
            ExceptionUtilities.CheckObjectNotNull(collectionType, "Could not infer collection type for property", new object[0]);
            propertyValue = propertyValue.Cast<object>().Select<object, object>(delegate (object o) {
                return UpdatableToken.ResolveIfToken(o);
            });
            ConstructorInfo enumerableConstructor = collectionType.GetConstructor(new Type[] { typeof(IEnumerable) });
            if (enumerableConstructor != null)
            {
                collection = enumerableConstructor.Invoke(new object[] { propertyValue });
            }
            else if (collectionType.IsGenericType && (collectionType.GetGenericArguments().Count<Type>() == 1))
            {
                Type typeArgument = collectionType.GetGenericArguments().Single<Type>();
                ConstructorInfo typedEnumerableConstructor = collectionType.GetConstructor(new Type[] { typeof(IEnumerable<>).MakeGenericType(new Type[] { typeArgument }) });
                if (typedEnumerableConstructor != null)
                {
                    object typedEnumerable = typeof(Enumerable).GetMethod("Cast").MakeGenericMethod(new Type[] { typeArgument }).Invoke(null, new object[] { propertyValue });
                    collection = typedEnumerableConstructor.Invoke(new object[] { typedEnumerable });
                }
                else
                {
                    MethodInfo typedAddMethod = collectionType.GetMethod("Add", new Type[] { typeArgument });
                    ExceptionUtilities.CheckObjectNotNull(typedAddMethod, "Could not find constructor or add method for type: " + collectionType.FullName, new object[0]);
                    collection = Activator.CreateInstance(collectionType);
                    foreach (object element in propertyValue)
                    {
                        typedAddMethod.Invoke(collection, new object[] { element });
                    }
                }
            }
            else
            {
                MethodInfo addMethod = collectionType.GetMethod("Add");
                ExceptionUtilities.CheckObjectNotNull(addMethod, "Could not find constructor or add method for type: " + collectionType.FullName, new object[0]);
                collection = Activator.CreateInstance(collectionType);
                foreach (object element in propertyValue)
                {
                    addMethod.Invoke(collection, new object[] { element });
                }
            }
            propertyInfo.SetValue(targetResource, collection, null);
        }

        public virtual void SetConcurrencyValues(object resourceCookie, bool? checkForEquality, IEnumerable<KeyValuePair<string, object>> concurrencyValues)
        {
            ExceptionUtilities.CheckArgumentNotNull(resourceCookie, "resourceCookie");
            ExceptionUtilities.ThrowDataServiceExceptionIfFalse(checkForEquality.HasValue, 0x1a1, "Missing concurrency token for update operation", new object[0]);
            ExceptionUtilities.Assert(checkForEquality.Value, "Should not be called with check for equality parameter equal to false", new object[0]);
            ExceptionUtilities.CheckArgumentNotNull(concurrencyValues, "concurrencyValues");
            if (concurrencyValues.Any<KeyValuePair<string, object>>())
            {
                resourceCookie = UpdatableToken.AssertIsTokenAndResolve(resourceCookie, "resourceCookie");
                ExceptionUtilities.ThrowDataServiceExceptionIfFalse(CompareETagValues(this.GetConcurrencyValues(resourceCookie), concurrencyValues), 0x19c, "Concurrency tokens do not match", new object[0]);
            }
        }

        private void SetEntityReferenceToNullOnTargetResourceMatch(object targetResource, NavigationPropertyInfo navigationPropertyInfo, object currentEntityInstance)
        {
            if (navigationPropertyInfo.PropertyInfo.GetValue(currentEntityInstance, null) == targetResource)
            {
                this.pendingChanges.Add(delegate {
                    navigationPropertyInfo.PropertyInfo.SetValue(currentEntityInstance, null, null);
                });
            }
        }

        public virtual void SetReference(object targetResource, string propertyName, object propertyValue)
        {
            ExceptionUtilities.CheckArgumentNotNull(targetResource, "targetResource");
            ExceptionUtilities.CheckArgumentNotNull(propertyName, "propertyName");
            if (propertyValue != null)
            {
                UpdatableToken.AssertIsToken(propertyValue, "propertyValue");
            }
            this.SetValue(targetResource, propertyName, propertyValue);
        }

        public virtual void SetValue(object targetResource, string propertyName, object propertyValue)
        {
            ExceptionUtilities.CheckArgumentNotNull(targetResource, "targetResource");
            ExceptionUtilities.CheckArgumentNotNull(propertyName, "propertyName");
            UpdatableToken token = UpdatableToken.AssertIsToken(targetResource, "targetResource");
            targetResource = token.Resource;
            token.PendingPropertyUpdates[propertyName] = propertyValue;
            this.pendingChanges.Add(delegate {
                object generatedValue;
                Type t = targetResource.GetType();
                PropertyInfo pi = t.GetProperty(propertyName);
                ExceptionUtilities.CheckObjectNotNull(pi, "Unable to find property '{0}' on type '{1}'", new object[] { propertyName, targetResource.GetType().Name });
                if (this.TryGetStoreGeneratedValue(GetResourceTypeFullName(t), propertyName, out generatedValue))
                {
                    propertyValue = generatedValue;
                }
                if (this.IsCollectionProperty(pi))
                {
                    ExceptionUtilities.CheckObjectNotNull(propertyValue, "Collection property value was null", new object[0]);
                    IEnumerable enumerable = propertyValue as IEnumerable;
                    ExceptionUtilities.CheckObjectNotNull(enumerable, "Collection property value was not an enumerable", new object[0]);
                    this.SetCollectionPropertyValue(targetResource, pi, enumerable);
                }
                else
                {
                    propertyValue = UpdatableToken.ResolveIfToken(propertyValue);
                    pi.SetValue(targetResource, propertyValue, null);
                }
            });
        }

        protected virtual bool TryGetStoreGeneratedValue(string fullTypeName, string propertyName, out object propertyValue)
        {
            propertyValue = null;
            return false;
        }

        private void ValidateResourceType(object targetResource, string fullTypeName)
        {
            ExceptionUtilities.Assert(this.MetadataHelper.FindClrTypeByFullName(fullTypeName).IsAssignableFrom(targetResource.GetType()), "Invalid uri specified. expected type: '{0}', actual type: '{1}'", new object[] { fullTypeName, targetResource.GetType().FullName });
        }

        // Properties
        internal ReflectionMetadataHelper MetadataHelper { get; set; }

        internal Dictionary<string, IList> ResourceSetsStorage
        {
            get
            {
                Dictionary<string, IList> resourceSetsLookup = null;
                Type currentContextType = base.GetType();
                ExceptionUtilities.Assert(resourceSetsByContextTypeStorage.TryGetValue(currentContextType, out resourceSetsLookup), "Cannot find resource sets by the context type '{0}'", new object[] { currentContextType });
                return resourceSetsLookup;
            }
        }

        #region Inner types.
    
        internal class ReflectionMetadataHelper
        {
            // Fields
            private ReflectionDataContext reflectionDataContext;

            // Methods
            public ReflectionMetadataHelper(ReflectionDataContext reflectionDataContext)
            {
                this.reflectionDataContext = reflectionDataContext;
            }

            public Type FindClrTypeByFullName(string resourceTypeFullName)
            {
                Type type = this.reflectionDataContext.GetType().Assembly.GetTypes().Where<Type>(delegate (Type t) {
                    return (ReflectionDataContext.GetResourceTypeFullName(t) == resourceTypeFullName);
                }).FirstOrDefault<Type>();
                ExceptionUtilities.CheckObjectNotNull(type, "Unable to find type '{0}'", new object[] { resourceTypeFullName });
                return type;
            }

            public string[] GetETagPropertiesOfType(string fullTypeName)
            {
                Type type = this.FindClrTypeByFullName(fullTypeName);
                List<string> etags = new List<string>();
                foreach (ETagAttribute customAttribute in type.GetCustomAttributes(typeof(ETagAttribute), true))
                {
                    etags.AddRange(customAttribute.PropertyNames);
                }
                
                return etags.ToArray();
            }

            public string[] GetKeyProperties(string fullTypeName)
            {
                Type type = this.FindClrTypeByFullName(fullTypeName);
                List<string> keyPropertyList = new List<string>();
                foreach (PropertyInfo keyProperty in type.GetProperties().Where(pi => pi.Name.Contains("ID")))
                {
                    keyPropertyList.Add(keyProperty.Name);
                }
                
                return keyPropertyList.ToArray();
            }

            public NavigationPropertyInfo[] GetNavigationProperties(string fullTypeName)
            {
                Type type = this.FindClrTypeByFullName(fullTypeName);
                var navigationProperties = new List<NavigationPropertyInfo>();
                var keyProperties = new List<string>(this.GetKeyProperties(fullTypeName));
                foreach (PropertyInfo pi in type.GetProperties())
                {
                    if (!keyProperties.Contains(pi.Name))
                    {
                        if (this.IsTypeAnEntityType(pi.PropertyType))
                        {
                            navigationProperties.Add(new NavigationPropertyInfo(pi, null));
                        }

                        if (pi.PropertyType.IsGenericType && ((pi.PropertyType.GetGenericTypeDefinition() == typeof(List<>)) || (pi.PropertyType.GetGenericTypeDefinition() == typeof(Collection<>))))
                        {
                            Type elementType = pi.PropertyType.GetGenericArguments()[0];
                            if (this.IsTypeAnEntityType(elementType))
                            {
                                navigationProperties.Add(new NavigationPropertyInfo(pi, elementType));
                            }
                        }
                    }
                }

                return navigationProperties.ToArray();
            }

            public string[] GetPropertiesToReset(string fullTypeName)
            {
                Type type = this.FindClrTypeByFullName(fullTypeName);
                var keyProperties = new List<string>(this.GetKeyProperties(fullTypeName));
                var navigationProperties = new List<string>(this.GetNavigationProperties(fullTypeName).Select(ni =>ni.PropertyInfo.Name));
                return type.GetProperties().Where(
                    pi => !keyProperties.Contains(pi.Name) && !navigationProperties.Contains(pi.Name)
                ).Select(pi => pi.Name).ToArray();
            }

            public string[] GetResourceSetNames()
            {
                return this.reflectionDataContext.GetType().GetProperties().Where(
                    pi => pi.PropertyType.IsGenericType && (pi.PropertyType.GetGenericTypeDefinition() == typeof(IQueryable<>))
                ).Select(pi => pi.Name).ToArray();
            }

            public Type GetResourceTypeOfSet(string resourceSetName)
            {
                PropertyInfo resourceSetPropertyInfo = this.reflectionDataContext.GetType().GetProperties().Where(pi => pi.Name == resourceSetName).FirstOrDefault();
                ExceptionUtilities.CheckObjectNotNull(resourceSetPropertyInfo, "Error finding type of set '{0}'", new object[] { resourceSetName });
                return resourceSetPropertyInfo.PropertyType.GetGenericArguments()[0];
            }

            public bool IsTypeAnEntityType(Type t)
            {
                foreach (string setName in this.GetResourceSetNames())
                {
                    if (this.GetResourceTypeOfSet(setName).IsAssignableFrom(t))
                    {
                        return true;
                    }
                }

                return false;
            }
        }

        internal static class ExceptionUtilities
        {
            // Methods
            public static void Assert(bool condition, string errorMessage, params object[] messageArguments)
            {
                if (!condition)
                {
                    throw new InvalidOperationException("Assertion failed: " + string.Format(CultureInfo.InvariantCulture, errorMessage, messageArguments));
                }
            }

            public static void CheckArgumentNotNull(object argument, string argumentName)
            {
                if (argument == null)
                {
                    throw new ArgumentNullException(argumentName);
                }
            }

            public static void CheckCollectionNotEmpty<TElement>(IEnumerable<TElement> argument, string argumentName)
            {
                CheckArgumentNotNull(argument, argumentName);
                if (!argument.Any<TElement>())
                {
                    throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "Collection argument '{0}' must have at least one element.", new object[] { argumentName }));
                }
            }

            public static void CheckObjectNotNull(object value, string exceptionMessageFormatText, params object[] messageArguments)
            {
                Assert(exceptionMessageFormatText != null, "message cannnot be null", new object[0]);
                Assert(messageArguments != null, "messageArguments cannnot be null", new object[0]);
                if (value == null)
                {
                    throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, exceptionMessageFormatText, messageArguments));
                }
            }

            public static void ThrowDataServiceExceptionIfFalse(bool condition, int statusCode, string errorMessage, params object[] messageArguments)
            {
                if (!condition)
                {
                    throw new DataServiceException(statusCode, string.Format(CultureInfo.InvariantCulture, errorMessage, messageArguments));
                }
            }
        }

        public class UpdatableToken
        {
            // Methods
            public UpdatableToken(object resource)
            {
                ExceptionUtilities.CheckArgumentNotNull(resource, "resource");
                this.Resource = resource;
                this.PendingPropertyUpdates = new Dictionary<string, object>();
            }

            public static UpdatableToken AssertIsToken(object resource, string name)
            {
                ExceptionUtilities.CheckArgumentNotNull(resource, "resource");
                UpdatableToken token = resource as UpdatableToken;
                ExceptionUtilities.CheckObjectNotNull(token, "{0} was not a token. Type was: '{1}'", new object[] { name, resource.GetType() });
                return token;
            }

            public static object AssertIsTokenAndResolve(object resource, string name)
            {
                return AssertIsToken(resource, name).Resource;
            }

            public static object ResolveIfToken(object resource)
            {
                UpdatableToken token = resource as UpdatableToken;
                if (token != null)
                {
                    resource = token.Resource;
                }
                return resource;
            }

            // Properties
            public IDictionary<string, object> PendingPropertyUpdates { get; set; }

            public object Resource { get; set; }
        }

        internal class NavigationPropertyInfo
        {
            // Methods
            internal NavigationPropertyInfo(PropertyInfo pi, Type collectionElementType)
            {
                this.PropertyInfo = pi;
                this.CollectionElementType = collectionElementType;
            }

            // Properties
            public Type CollectionElementType { get; set; }

            public PropertyInfo PropertyInfo { get; set; }
        }

        #endregion Inner types.
    }
}