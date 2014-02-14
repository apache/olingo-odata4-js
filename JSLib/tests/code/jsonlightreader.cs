/// <summary>
/// Class used to parse the Content section of the feed to return the properties data and metadata
/// </summary>

namespace DataJS.Tests
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Net;
    using System.Web.Script.Serialization;
    using System.Xml;
    using Microsoft.Data.Edm;
    using Microsoft.Data.Edm.Csdl;

    public static class JsonLightReader
    {
        private static Dictionary<string, string> nameMap = new Dictionary<string, string>() {
            {"readLink", "self"},
            {"editLink", "edit"},
            {"nextLink", "__next"},
            {"mediaReadLink", "media_src"},
            {"mediaEditLink", "edit_media"},
            {"mediaContentType", "content_type"},
            {"mediaETag", "media_etag"},
            {"count", "__count"},
            {"media_src", "mediaReadLink"},
            {"edit_media", "mediaEditLink"},
            {"content_type", "mediaContentType"},
            {"media_etag", "mediaETag"},
            {"url", "uri"}
        };

        public static JsonObject ReadJsonLight(TextReader payload)
        {
            var serializer = new JavaScriptSerializer();
            serializer.RegisterConverters(new JavaScriptConverter[] { new JsonObjectConverter() });

            var json = serializer.Deserialize<JsonObject>(payload.ReadToEnd());

            IEdmModel model = null;
            string metadataFragment = null;
            string metadataURI = json["odata.metadata"] as string;

            if (metadataURI != null)
            {
                int fragmentStart = metadataURI.IndexOf("#");
                string metadataUrl = metadataURI;

                if (fragmentStart > 0)
                {
                    metadataUrl = metadataURI.Substring(0, fragmentStart);
                    metadataFragment = metadataURI.Substring(fragmentStart + 1);
                }
                model = GetEndpointModel(metadataUrl);
            }
        }

        private static IEdmModel GetEndpointModel(string modelUrl)
        {
            using (WebResponse response = ReaderUtils.CreateRequest(modelUrl).GetResponse())
            {
                return EdmxReader.Parse(XmlReader.Create(response.GetResponseStream()));
            }
        }

        private static JsonObject ReadObject(JsonObject jsonLight, IEdmModel model)
        {
            var json = new JsonObject();
            var metadata = json["__metadata"] = new JsonObject();

            foreach (var item in jsonLight)
            {
                string name = item.Key;
                if (name.IndexOf(".", StringComparison.OrdinalIgnoreCase) == -1)
                {
                    if (item.Value is JsonObject)
                    {
                        json[item.Key] = ReadObject((JsonObject)item.Value, model);
                    }
                }
            }

            return json;
        }

        private static JsonObject ReadObjectProperties(IEnumerable<KeyValuePair<string, object>> properties, JsonObject json)
        {
            return json;
        }

        private static JsonObject ApplyPayloadAnnotationsToObject(IEnumerable<KeyValuePair<string, object>> annotations, JsonObject json)
        {
            foreach (var item in annotations)
            {
                ApplyPayloadAnnotationToObject(item.Key, item.Value, json);
            }
            return json;
        }

        private static JsonObject ApplyPayloadAnnotationToObject(string annotation, object value, JsonObject json)
        {
            int index = annotation.IndexOf("@", StringComparison.OrdinalIgnoreCase);
            string target = null;
            string name = annotation;

            if (index > 0)
            {
                target = annotation.Substring(0, index);
                name = annotation.Substring(index + 1);
            }

            if (name.StartsWith("odata.", StringComparison.Ordinal))
            {
                return ApplyODataPayloadAnnotation(name, target, value, json);
            }

            json["annotation"] = value;
            return json;
        }

        private static JsonObject ApplyODataPayloadAnnotation(string annotation, string target, string targetType, object value, Uri baseUri, JsonObject json)
        {
            string name = annotation.Substring("odata.".Length);
            switch (name)
            {
                case "navigationLinkUrl":
                    return ApplyNavigationUrlAnnotation(name, target, targetType, value, baseUri, json);
                case "nextLink":
                case "count":
                    return ApplyFeedAnnotation(name, target, value, baseUri, json);
                case "mediaReadLink":
                case "mediaEditLink":
                case "mediaContentType":
                case "mediaETag":
                    return ApplyMediaAnnotation(name, target, targetType, value, baseUri, json);
                default:
                    return ApplyMetadataAnnotation(name, target, targetType, value, baseUri, json);
            }
        }

        private static JsonObject ApplyNavigationUrlAnnotation(string name, string target, string targetType, object value, Uri baseUri, JsonObject json)
        {
            JsonObject propertiesMetadata = GetOrCreatePropertiesMetadata(json);
            JsonObject propertyMetadata = GetOrCreateObjectProperty(propertiesMetadata, target);

            string uri = NormalizeUri((string)value, baseUri);

            if (json.ContainsKey(target))
            {
                propertyMetadata["navigationLinkUrl"] = uri;
            }
            else
            {
                JsonObject navProp = new JsonObject();
                JsonObject deferred = new JsonObject();

                deferred["uri"] = uri;
                navProp["__deferred"] = deferred;
                json[target] = navProp;

                if (!propertyMetadata.ContainsKey("type"))
                {
                    propertyMetadata["type"] = targetType;
                }
            }
            return json;
        }

        private static JsonObject ApplyFeedAnnotation(string name, string target, object value, Uri baseUri, JsonObject json)
        {
            string mappedName = MapODataName(name);
            JsonObject feed = (target == null) ? json : (JsonObject)json[target];
            feed[mappedName] = (name == "nextLink") ? NormalizeUri((string)value, baseUri) : value;
            return json;
        }

        private static JsonObject ApplyMediaAnnotation(string name, string target, string targetType, object value, Uri baseUri, JsonObject json)
        {
            string mappedName = MapODataName(name);
            object theValue = value;

            if (name == "mediaReadLink" || name == "mediaEditLink")
            {
                theValue = NormalizeUri((string)value, baseUri);
            }

            if (target != null)
            {
                JsonObject propertiesMetadata = GetOrCreatePropertiesMetadata(json);
                JsonObject propertyMetadata = GetOrCreateObjectProperty(propertiesMetadata, target);
                JsonObject namedStream = GetOrCreateObjectProperty(json, target);
                JsonObject mediaResource = GetOrCreateObjectProperty(namedStream, "__mediaresource");

                if (!propertyMetadata.ContainsKey("type") || propertyMetadata["type"] == null)
                {
                    propertyMetadata["type"] = targetType;
                }
                mediaResource[mappedName] = theValue;
            }
            else
            {
                JsonObject metadata = GetOrCreateObjectMetadata(json);
                metadata[mappedName] = value;
            }
            return json;
        }

        private static JsonObject ApplyMetadataAnnotation(string name, string target, string targetType, object value, Uri baseUri, JsonObject json)
        {
            string mappedName = MapODataName(name);
            JsonObject metadata = GetOrCreateObjectMetadata(json);

            if (name == "editLink")
            {
                metadata["uri"] = NormalizeUri((string)value, baseUri);
                metadata[mappedName] = metadata["uri"];
                return json;
            }

            if (name == "readLink" || name == "associationLinkUrl")
            {
                metadata[mappedName] = NormalizeUri((string)value, baseUri);
                return json;
            }

            if (target != null)
            {
                JsonObject propertiesMetadata = GetOrCreatePropertiesMetadata(json);
                JsonObject propertyMetadata = GetOrCreateObjectProperty(propertiesMetadata, target);

                if (name == "type")
                {
                    if (!propertyMetadata.ContainsKey("type") || propertyMetadata["type"] == null)
                    {
                        propertyMetadata["type"] = targetType;
                        return json;
                    }
                }
                propertyMetadata[mappedName] = value;
                return json;
            }
            metadata[mappedName] = value;
            return json;
        }

        private static string MapODataName(string name)
        {
            return nameMap.ContainsKey(name) ? nameMap[name] : name;
        }

        private static JsonObject GetOrCreateObjectProperty(JsonObject json, string name)
        {
            if (!json.ContainsKey(name))
            {
                json[name] = new JsonObject();
            }
            return (JsonObject)json[name];
        }

        private static JsonObject GetOrCreateObjectMetadata(JsonObject json)
        {
            return GetOrCreateObjectProperty(json, "__metadata");
        }

        private static JsonObject GetOrCreatePropertiesMetadata(JsonObject json)
        {
            JsonObject metadata = GetOrCreateObjectMetadata(json);
            return GetOrCreateObjectProperty(metadata, "properties");
        }

        private static string NormalizeUri(string uri, Uri baseUri)
        {
            Uri tmpUri = new Uri(uri, UriKind.RelativeOrAbsolute);

            if (!tmpUri.IsAbsoluteUri && baseUri != null)
            {
                tmpUri = new Uri(baseUri, tmpUri);
                return tmpUri.AbsoluteUri;
            }
            return tmpUri.OriginalString;
        }

        private class JsonObjectConverter : JavaScriptConverter
        {
            public override object Deserialize(IDictionary<string, object> dictionary, System.Type type, JavaScriptSerializer serializer)
            {
                var json = new JsonObject();
                foreach (var item in dictionary)
                {
                    object value = item.Value;
                    if (value is IDictionary<string, object>)
                    {
                        value = serializer.ConvertToType<JsonObject>(value);
                    }
                    json[item.Key] = value;
                }
                return json;
            }

            public override IDictionary<string, object> Serialize(object obj, JavaScriptSerializer serializer)
            {
                throw new System.NotImplementedException();
            }

            public override IEnumerable<Type> SupportedTypes
            {
                get { return new Type[] { typeof(JsonObject) }; }
            }
        }

    }
}