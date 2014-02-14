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
        static readonly string knownNamespace = "http://schemas.microsoft.com";
        static readonly string[] repeatingElements = 
            {
                "End", 
                "Property", 
                "PropertyRef", 
                "EntitySet", 
                "AssociationSet", 
                "FunctionImport", 
                "NavigationProperty", 
                "Parameter", 
                "Using", 
                "EntityContainer", 
                "EntityType", 
                "Association", 
                "ComplexType", 
                "Function", 
                "Schema"
            };

        public static JsonObject ReadCsdl(TextReader payload)
        {
            return BuildElementJsonObject(XElement.Load(payload));
        }

        /// <summary>
        /// Builds the extensions element object
        /// extensions = {
        /// name: string, // local name of the custom XML element
        /// namespace: string, // namespace URI of the custom XML element
        /// value: string, // value of the custom XML element
        /// attributes: array, // array of attribute extension objects of the custom XML element
        /// children: array // array of element extension objects of the custom XML element };
        /// </summary>
        /// <param name="customElement">The custom element to be made into an extension object</param>
        /// <returns>the custom element json object</returns>
        static JsonObject BuildExtensionsElementObject(XElement customElement)
        {
            string value;
            // customElement.Value contains the value of the element's children, but these are already
            // captured in the children propterty.
            if (customElement.HasElements)
            {
                value = null;
            }
            else
            {
                if (customElement.Value == "")
                {
                    value = null;
                }
                else
                {
                    value = customElement.Value;
                }
            }

            JsonObject jsonObject = BuildBaseExtensionsObject(customElement.Name.LocalName, customElement.Name.Namespace.ToString(), value);

            jsonObject["attributes"] = customElement.Attributes().Select(
                attribute => BuildBaseExtensionsObject(attribute.Name.LocalName, attribute.Name.Namespace.ToString(), attribute.Value)
                ).ToArray();
            jsonObject["children"] = customElement.Elements().Select(element => BuildExtensionsElementObject(element)).ToArray();

            return jsonObject;
        }

        /// <summary>
        /// Creates a generic extension object
        /// extensions = {
        /// name: string, // local name of the custom XML element or attribute
        /// namespace: string, // namespace URI of the custom XML element or attribute
        /// value: string, // value of the custom XML element or attribute }
        /// </summary>
        /// <param name="name">name of the object</param>
        /// <param name="objectNamespace">namespace of the obect</param>
        /// <param name="value">value of the object</param>
        /// <returns></returns>
        static JsonObject BuildBaseExtensionsObject(string name, string objectNamespace, string value)
        {
            JsonObject jsonObject = new JsonObject();

            jsonObject["name"] = name;
            jsonObject["namespace"] = objectNamespace;
            jsonObject["value"] = value;

            return jsonObject;
        }

        /// <summary>
        /// Build the attribute object 
        /// </summary>
        /// <param name="xmlAttributes">IEnumberable of XAttributes to build the attribute object</param>
        /// <returns>The JsonObject containing the name-value pairs for an element's attributes</returns>
        static JsonObject BuildAttributeJsonObject(IEnumerable<XAttribute> xmlAttributes)
        {
            JsonObject jsonObject = new JsonObject();
            List<JsonObject> extensions = new List<JsonObject>();

            foreach (XAttribute attribute in xmlAttributes)
            {
                if (!attribute.IsNamespaceDeclaration)
                {
                    string attributeNamespace = attribute.Name.Namespace.ToString();
                    if (string.IsNullOrEmpty(attributeNamespace) || attributeNamespace.StartsWith(knownNamespace, StringComparison.InvariantCultureIgnoreCase))
                    {
                        jsonObject[MakeFirstLetterLowercase(attribute.Name.LocalName)] = attribute.Value;
                    }
                    else
                    {
                        extensions.Add(BuildBaseExtensionsObject(attribute.Name.LocalName, attribute.Name.Namespace.ToString(), attribute.Value));
                    }
                }
            }

            if (extensions.Count > 0)
            {
                jsonObject["extensions"] = extensions.ToArray();
            }

            return jsonObject;
        }

        /// <summary>
        /// Creates a JsonObject from an XML container element with each attribute or subelement as a property
        /// </summary>
        /// <param name="container">The XML container</param>
        /// <param name="buildValue">Function that builds a value from a property element</param>
        /// <returns>The JsonObject containing the name-value pairs</returns>
        public static JsonObject BuildElementJsonObject(XElement container)
        {
            if (container == null)
            {
                return null;
            }

            JsonObject jsonObject = new JsonObject();
            List<JsonObject> extensions = new List<JsonObject>();

            if (container.HasAttributes || container.HasElements)
            {
                Dictionary<string, List<JsonObject>> repeatingObjectArrays = new Dictionary<string, List<JsonObject>>();
                JsonObject extensionObject = new JsonObject();

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
                                repeatingObjectArrays.Add(propertyName, new List<JsonObject>());
                            }
                            repeatingObjectArrays[propertyName].Add(BuildElementJsonObject(propertyElement));
                        }
                        else
                        {
                            jsonObject[propertyName] = BuildElementJsonObject(propertyElement);
                        }
                    }
                    else
                    {
                        extensions.Add(BuildExtensionsElementObject(propertyElement));
                    }
                }

                if (extensions.Count > 0)
                {
                    jsonObject["extensions"] = extensions.ToArray();
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