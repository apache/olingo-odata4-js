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

/// <summary>
/// Class used to parse csdl to create the metatdata object
/// </summary>
/// 

namespace DataJS.Tests
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Xml.Linq;


    public static class CsdlReader
    {
        static readonly string knownNamespace = "http://docs.oasis-open.org";
        static readonly string[] repeatingElements = 
            {
                "Action",
                "ActionImport",
                "Annotation",
                "Annotations",
                "Apply",
                "Binary",
                "Bool",
                "Cast",
                "Collection",
                "ComplexType",
                "Date",
                "DateTimeOffset",
                "Decimal",
                "Duration",
                "EntitySet",
                "EntityType",
                "EnumMember",
                "EnumType",
                "Float",
                "Function",
                "FunctionImport",
                "Guid",
                "If",
                "Int",
                "IsOf",
                "Key",
                "LabeledElement",
                "LabeledElementReference",
                "Member",
                "NavigationProperty",
                "NavigationPropertyBinding",
                "NavigationPropertyPath",
                "Null",
                "OnDelete",
                "Path",
                "Parameter",
                "Property",
                "PropertyPath",
                "PropertyRef",
                "PropertyValue",
                "Record",
                "ReferentialConstraint",
                "String",
                "Schema",
                "Singleton",
                "Term",
                "TimeOfDay",
                "TypeDefinition",
                "UrlRef",
                "Reference",
                "Include",
                "IncludeAnnotations"
            };

        public static Dictionary<string, object> ReadCsdl(TextReader payload)
        {
            return BuildElementJsonObject(XElement.Load(payload));
        }

        /// <summary>
        /// Build the attribute object 
        /// </summary>
        /// <param name="xmlAttributes">IEnumberable of XAttributes to build the attribute object</param>
        /// <returns>The JsonObject containing the name-value pairs for an element's attributes</returns>
        static Dictionary<string, object> BuildAttributeJsonObject(IEnumerable<XAttribute> xmlAttributes)
        {
            Dictionary<string, object> jsonObject = new Dictionary<string, object>();

            foreach (XAttribute attribute in xmlAttributes)
            {
                if (!attribute.IsNamespaceDeclaration)
                {
                    string attributeNamespace = attribute.Name.Namespace.ToString();
                    if (string.IsNullOrEmpty(attributeNamespace) ||
                        attributeNamespace.StartsWith(knownNamespace, StringComparison.InvariantCultureIgnoreCase))
                    {
                        jsonObject[MakeFirstLetterLowercase(attribute.Name.LocalName)] = attribute.Value;
                    }
                }
            }

            return jsonObject;
        }

        /// <summary>
        /// Creates a JsonObject from an XML container element with each attribute or subelement as a property
        /// </summary>
        /// <param name="container">The XML container</param>
        /// <param name="buildValue">Function that builds a value from a property element</param>
        /// <returns>The JsonObject containing the name-value pairs</returns>
        public static Dictionary<string, object> BuildElementJsonObject(XElement container)
        {
            if (container == null)
            {
                return null;
            }

            Dictionary<string, object> jsonObject = new Dictionary<string, object>();
            string keyName = MakeFirstLetterLowercase(container.Name.LocalName);

            if (container.HasAttributes || container.HasElements)
            {
                Dictionary<string, List<Dictionary<string, object>>> repeatingObjectArrays = new Dictionary<string, List<Dictionary<string, object>>>();

                jsonObject = BuildAttributeJsonObject(container.Attributes());

                foreach (XElement propertyElement in container.Elements())
                {
                    string propertyName = MakeFirstLetterLowercase(propertyElement.Name.LocalName);
                    string properyNamespace = propertyElement.Name.Namespace.ToString();

                    if (string.IsNullOrEmpty(properyNamespace) || properyNamespace.StartsWith(knownNamespace, StringComparison.InvariantCultureIgnoreCase))
                    {
                        // Check to see if the element is repeating and needs to be an array
                        if (repeatingElements.Contains(propertyElement.Name.LocalName))
                        {
                            // See if property was already created as an array, if not then create it
                            if (!repeatingObjectArrays.ContainsKey(propertyName))
                            {
                                repeatingObjectArrays.Add(propertyName, new List<Dictionary<string, object>>());
                            }

                            repeatingObjectArrays[propertyName].Add(BuildElementJsonObject(propertyElement));
                        }
                        else
                        {
                            jsonObject[propertyName] = BuildElementJsonObject(propertyElement);
                        }
                    }
                }

                foreach (string key in repeatingObjectArrays.Keys)
                {
                    jsonObject[key] = repeatingObjectArrays[key].ToArray();
                }
            }
            else
            {
                jsonObject[MakeFirstLetterLowercase(container.Name.LocalName)] = container.Value;
            }

            return jsonObject;
        }

        /// <summary>
        /// Makes the first letter of a string lowercase
        /// </summary>
        /// <param name="name">The string to be modified</param>
        /// <returns>Modified string</returns>
        private static string MakeFirstLetterLowercase(string str)
        {
            if (!string.IsNullOrWhiteSpace(str))
            {
                if (str.Length > 1 && !(str[1].ToString() == str[1].ToString().ToUpper()))
                {
                    return str[0].ToString().ToLower() + str.Substring(1);
                }
                else
                {
                    return str;
                }
            }

            return str;
        }
    }
}