/// <summary>
/// Class used to parse the Content section of the feed to return the properties data and metadata
/// </summary>

namespace DataJS.Tests
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.ServiceModel.Syndication;
    using Microsoft.Spatial;
    using System.Xml;
    using System.Xml.Linq;

    public static class AtomReader
    {
        const string atomXmlNs = "http://www.w3.org/2005/Atom";
        const string gmlXmlNs = "http://www.opengis.net/gml";
        const string odataRelatedPrefix = "http://schemas.microsoft.com/ado/2007/08/dataservices/related";
        const string odataRelatedLinksPrefix = "http://schemas.microsoft.com/ado/2007/08/dataservices/relatedlinks";
        const string odataXmlNs = "http://schemas.microsoft.com/ado/2007/08/dataservices";
        const string odataMetaXmlNs = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata";
        const string odataEditMediaPrefix = "http://schemas.microsoft.com/ado/2007/08/dataservices/edit-media";
        const string odataMediaResourcePrefix = "http://schemas.microsoft.com/ado/2007/08/dataservices/mediaresource";

        const string hrefAttribute = "href";
        const string titleElement = "title";
        const string workspaceElement = "workspace";
        const string workspacesProperty = "workspaces";
        const string collectionElement = "collection";
        const string collectionsProperty = "collections";
        const string extensionsProperty = "extensions";
        static string baseUri = string.Empty;

        /// <summary>
        /// Creates a service document object
        /// </summary>
        /// <param name="container">The XML container</param>
        /// <param name="uri">Uri to append to the href value</param>
        /// <returns>The service document JsonObject</returns>
        public static JsonObject ReadServiceDocument(TextReader payload, string baseUri)
        {
            JsonObject jsonObject = new JsonObject();
            XElement container = XElement.Load(payload);

            if (container != null && container.HasElements)
            {
                jsonObject["workspaces"] =
                    container
                        .Elements()
                            .Where(element => element.Name.LocalName.Equals(workspaceElement))
                            .Select(element => ReadWorkspaceObject(element, baseUri))
                            .ToArray();

                jsonObject["extensions"] =
                    container
                        .Elements()
                            .Where(element => !element.Name.LocalName.Equals(workspaceElement))
                            .Select(element => ReadExtensionElement(element))
                            .ToArray();
            }

            return jsonObject;
        }

        public static JsonObject ReadEntry(TextReader payload)
        {
            SyndicationItem item = SyndicationItem.Load(XmlReader.Create(payload));
            return ReadEntry(item);
        }

        public static JsonObject ReadFeed(TextReader payload)
        {
            SyndicationFeed feed = SyndicationFeed.Load(XmlReader.Create(payload));
            JsonObject feedData = new JsonObject();
            JsonObject feedMetadata = new JsonObject();

            feedData["results"] = feed.Items.Select(item => ReadEntry(item)).ToArray();
            feedData["__metadata"] = feedMetadata;

            feedMetadata["feed_extensions"] = feed.AttributeExtensions.Select(pair => ReadExtension(pair)).ToArray();

            if (feed.Id != null)
            {
                feedMetadata["uri"] = feed.Id;
                feedMetadata["uri_extensions"] = new JsonObject[] { };
            }

            if (feed.Title != null)
            {
                feedMetadata["title"] = feed.Title.Text;
                feedMetadata["title_extensions"] = GetTitleExtensions(feed.Title);
            }

            SyndicationLink feedSelfLink = GetLink("self", feed.Links);
            if (feedSelfLink != null)
            {
                feedMetadata["self"] = feedSelfLink.GetAbsoluteUri().AbsoluteUri;
                feedMetadata["self_extensions"] = GetLinkExtensions(feedSelfLink);
            }

            long? count = GetInlineCount(feed);
            if (count.HasValue)
            {
                feedData["__count"] = count.Value;
            }

            SyndicationLink feedNextLink = GetLink("next", feed.Links);
            if (feedNextLink != null)
            {
                feedData["__next"] = feedNextLink.GetAbsoluteUri().AbsoluteUri;
                feedMetadata["next_extensions"] = GetLinkExtensions(feedNextLink);
            }

            return feedData;
        }

        private static JsonObject ReadEntry(SyndicationItem item)
        {
            SyndicationLink entryEditLink = GetLink("edit", item.Links);
            SyndicationCategory entryCategory = item.Categories.FirstOrDefault();

            XElement propertiesElement = GetPropertiesElement(item);
            JsonObject entryData = ReadObject(propertiesElement);
            entryData = JsonObject.Merge(entryData, ReadNavigationProperties(item));
            entryData = JsonObject.Merge(entryData, ReadNamedStreams(item));

            JsonObject propertiesMetadata = ReadPropertiesMetadata(propertiesElement);
            propertiesMetadata = JsonObject.Merge(propertiesMetadata, ReadNavigationPropertiesMetadata(item));
            propertiesMetadata = JsonObject.Merge(propertiesMetadata, ReadNamedStreamMetadata(item));

            JsonObject entryMetadata = new JsonObject();
            entryData["__metadata"] = entryMetadata;
            entryMetadata["properties"] = propertiesMetadata;

            if (item.Id != null)
            {
                entryMetadata["uri"] = item.Id;
                entryMetadata["uri_extensions"] = new JsonObject[] { };
            }

            if (entryCategory != null)
            {
                entryMetadata["type"] = entryCategory.Name;
                entryMetadata["type_extensions"] = new JsonObject[] { };
            }

            if (entryEditLink != null)
            {
                entryMetadata["edit"] = entryEditLink.GetAbsoluteUri().AbsoluteUri;
                entryMetadata["edit_link_extensions"] = GetLinkExtensions(entryEditLink);
            }

            return entryData;
        }

        private static JsonObject ReadExtension(KeyValuePair<XmlQualifiedName, string> pair)
        {
            return ReaderUtils.CreateExtension(pair.Key.Name, pair.Key.Namespace, pair.Value);
        }

        private static string GetCollectionType(string type)
        {
            if (type != null && type.StartsWith("Collection("))
            {
                int start = 11;
                int end = type.IndexOf(")") - 11;
                return type.Substring(start, end);
            }
            return null;
        }

        /// <summary>
        /// Find the m:properties element within a feed entry
        /// </summary>
        /// <param name="item">The feed entry</param>
        /// <returns>The m:properties element</returns>
        private static XElement GetPropertiesElement(SyndicationItem item)
        {
            // Check if the m:properties element is within the content element
            XmlSyndicationContent xmlContent = item.Content as XmlSyndicationContent;
            if (xmlContent != null)
            {
                XElement contentElement = XElement.Load(xmlContent.GetReaderAtContent());
                return contentElement.Elements().FirstOrDefault(e => e.Name == XName.Get("properties", odataMetaXmlNs));
            }
            // If we're here, then we are dealing with a feed that has an MLE
            // i.e. the m:properties element is a peer of the content element, and shows up
            // in the elementExtensions instead
            SyndicationElementExtension propertiesElementExtension = item.ElementExtensions.FirstOrDefault(e => e.OuterName.Equals("properties"));
            if (propertiesElementExtension != null)
            {
                XNode propertiesElement = XNode.ReadFrom(propertiesElementExtension.GetReader());
                return (XElement)propertiesElement;
            }

            throw new NotSupportedException("Unsupported feed entry format");
        }

        /// <summary>
        /// Gets the inline count within a feed
        /// </summary>
        /// <param name="feed">The feed</param>
        /// <returns>The inline count, or null if none exists</returns>
        private static long? GetInlineCount(SyndicationFeed feed)
        {
            SyndicationElementExtension countElementExtension = feed.ElementExtensions.SingleOrDefault(extension =>
                extension.OuterName.Equals("count", StringComparison.OrdinalIgnoreCase) &&
                extension.OuterNamespace.Equals(odataMetaXmlNs));

            if (countElementExtension != null)
            {
                XElement countElement = (XElement)XNode.ReadFrom(countElementExtension.GetReader());
                return XmlConvert.ToInt64(countElement.Value);
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// Gets the link with the specified relationship type
        /// </summary>
        /// <param name="rel">Relationship type</param>
        /// <param name="links">The set of links to search from</param>
        /// <returns>The link with the specified relationship type, or null if none exists</returns>
        private static SyndicationLink GetLink(string rel, IEnumerable<SyndicationLink> links)
        {
            return links.SingleOrDefault(link => link.RelationshipType.Equals(rel, StringComparison.InvariantCultureIgnoreCase));
        }

        private static IEnumerable<SyndicationLink> GetLinks(string rel, IEnumerable<SyndicationLink> links)
        {
            return links.Where(link => link.RelationshipType.StartsWith(rel, StringComparison.Ordinal));
        }

        //TODO refactor the extraction of extensions into extension elements and extension attribute methods.
        private static JsonObject[] GetLinkExtensions(SyndicationLink link)
        {
            List<JsonObject> extensions = new List<JsonObject>();
            //TODO: fix the inclusion of title as extension.  Title attribute is not required in the link element and its
            //inclusion as an extension should be tested for the precesence of the attribute in the xml element.  Unfortunately,
            //SyndicationLink doesn't allow for accessing the underlying XML document.. perhaps using an AtomFormatter10?? 
            extensions.Add(ReaderUtils.CreateExtension("title", null, link.Title));
            extensions.AddRange(link.AttributeExtensions.Select(pair => ReadExtension(pair)));

            return extensions.ToArray();
        }

        private static JsonObject[] GetTitleExtensions(TextSyndicationContent title)
        {
            List<JsonObject> extensions = new List<JsonObject>();
            extensions.Add(ReaderUtils.CreateExtension("type", null, title.Type));
            extensions.AddRange(title.AttributeExtensions.Select(pair => ReadExtension(pair)));

            return extensions.ToArray();
        }

        /// <summary>
        /// Gets the "type" value from a property element
        /// </summary>
        /// <param name="propertyElement">The property element</param>
        /// <returns>The "type" value, or default (Edm.String) if none specified</returns>
        private static string GetTypeAttribute(XElement propertyElement)
        {
            XAttribute typeAttribute = propertyElement.Attribute(XName.Get("type", odataMetaXmlNs));
            if (typeAttribute == null)
            {
                if (propertyElement.HasElements)
                {
                    return null;
                }
                return "Edm.String";
            }
            return typeAttribute.Value;
        }

        private static bool HasTypeAttribute(XElement propertyElement)
        {
            return propertyElement.Attribute(XName.Get("type", odataMetaXmlNs)) != null;
        }

        private static bool IsCollectionProperty(XElement propertyElement)
        {
            string type = GetTypeAttribute(propertyElement);
            if (type != null && type.StartsWith("Collection("))
            {
                return true;

            }
            return propertyElement.Elements().Count(pe => pe.Name == XName.Get("element", odataXmlNs)) > 1;
        }

        private static JsonObject ReadWorkspaceObject(XElement container, string baseUri)
        {
            JsonObject jsonObject = new JsonObject();

            jsonObject["collections"] =
                container
                    .Elements()
                        .Where(element => element.Name.LocalName.Equals("collection"))
                        .Select(element => ReadWorkspaceCollections(element, baseUri))
                        .ToArray();

            jsonObject["extensions"] =
                container
                    .Elements()
                        .Where(element =>
                            !(element.Name.LocalName.Equals("collection") ||
                              element.Name.LocalName.Equals("title")))
                        .Select(element => ReadExtensionElement(element))
                        .ToArray();

            jsonObject["title"] =
                container
                    .Elements()
                    .Where(element => element.Name.LocalName.Equals("title"))
                    .First()
                    .Value;

            return jsonObject;
        }

        private static JsonObject ReadWorkspaceCollections(XElement container, string baseUri)
        {
            JsonObject jsonObject = new JsonObject();
            string title = string.Empty;

            jsonObject["extensions"] =
                container
                    .Elements()
                        .Where(element =>
                            !(element.Name.LocalName.Equals(collectionElement) ||
                              element.Name.LocalName.Equals(titleElement)))
                        .Select(element => ReadExtensionElement(element))
                        .ToArray();

            jsonObject["title"] =
                container
                    .Elements()
                        .Where(element => element.Name.LocalName.Equals("title"))
                        .First()
                        .Value;

            IEnumerable<XAttribute> hrefAttributes =
                container
                    .Attributes()
                        .Where(element => element.Name.LocalName.Equals("href"));

            jsonObject["href"] = baseUri + hrefAttributes.First().Value;

            return jsonObject;
        }

        private static JsonObject ReadExtensionElement(XElement element)
        {
            JsonObject jsonObject = ReaderUtils.CreateExtension(element.Name.LocalName, element.BaseUri, null);
            jsonObject.Remove("value");
            jsonObject["attributes"] = ReadExtensionAttributes(element);
            jsonObject["children"] = element.Elements().Select(child => ReadExtensionElement(element)).ToArray();

            return jsonObject;
        }

        private static JsonObject ReadExtensionAttribute(XAttribute attribute)
        {
            return ReaderUtils.CreateExtension(attribute.Name.LocalName, attribute.BaseUri, attribute.Value);
        }

        private static JsonObject[] ReadExtensionAttributes(XElement container)
        {
            List<JsonObject> attributes = new List<JsonObject>();
            foreach (XAttribute attribute in container.Attributes())
            {
                attributes.Add(ReadExtensionAttribute(attribute));
            }
            return attributes.ToArray();
        }

        private static JsonObject ReadNamedStreamMetadata(SyndicationItem item)
        {
            JsonObject propertiesMetadata = new JsonObject();
            JsonObject streamMetadata;
            string propertyName;

            foreach (SyndicationLink link in GetLinks(odataEditMediaPrefix, item.Links))
            {
                streamMetadata = new JsonObject();
                streamMetadata["edit_media_extensions"] = GetLinkExtensions(link);
                streamMetadata["media_src_extensions"] = new JsonObject[0];

                propertyName = link.RelationshipType.Substring(odataEditMediaPrefix.Length + 1);
                propertiesMetadata[propertyName] = streamMetadata;
            }

            foreach (SyndicationLink link in GetLinks(odataMediaResourcePrefix, item.Links))
            {
                streamMetadata = new JsonObject();
                streamMetadata["media_src_extensions"] = GetLinkExtensions(link);

                propertyName = link.RelationshipType.Substring(odataMediaResourcePrefix.Length + 1);
                if (propertiesMetadata.ContainsKey(propertyName))
                {
                    streamMetadata = JsonObject.Merge((JsonObject)propertiesMetadata[propertyName], streamMetadata);
                }
                propertiesMetadata[propertyName] = streamMetadata;
            }
            return propertiesMetadata;
        }

        private static JsonObject ReadNamedStreams(SyndicationItem item)
        {
            // Not very elegant, but quick and easy, do it in two passes.
            JsonObject streams = new JsonObject();
            JsonObject streamValue;
            JsonObject mediaResource;
            string propertyName;

            foreach (SyndicationLink link in GetLinks(odataEditMediaPrefix, item.Links))
            {
                propertyName = link.RelationshipType.Substring(odataEditMediaPrefix.Length + 1);
                streamValue = new JsonObject();
                mediaResource = new JsonObject();

                streams[propertyName] = streamValue;

                streamValue["__mediaresource"] = mediaResource;

                mediaResource["edit_media"] = link.GetAbsoluteUri().AbsoluteUri;
                mediaResource["content_type"] = link.MediaType;
                mediaResource["media_src"] = link.GetAbsoluteUri().AbsoluteUri;

                var etagAttributeName = new XmlQualifiedName("etag", odataMetaXmlNs);
                if (link.AttributeExtensions.ContainsKey(etagAttributeName))
                {
                    mediaResource["media_etag"] = link.AttributeExtensions[etagAttributeName];
                    link.AttributeExtensions.Remove(etagAttributeName);
                }
            }

            foreach (SyndicationLink link in GetLinks(odataMediaResourcePrefix, item.Links))
            {
                propertyName = link.RelationshipType.Substring(odataMediaResourcePrefix.Length + 1);
                mediaResource = new JsonObject();
                mediaResource["content_type"] = link.MediaType;
                mediaResource["media_src"] = link.GetAbsoluteUri().AbsoluteUri;

                if (streams.ContainsKey(propertyName))
                {
                    streamValue = streams[propertyName] as JsonObject;
                    mediaResource = JsonObject.Merge(streamValue["__mediaresource"] as JsonObject, mediaResource);
                }
                else
                {
                    streamValue = new JsonObject();
                }
                streamValue["__mediaresource"] = mediaResource;
                streams[propertyName] = streamValue;
            }
            return streams;
        }

        private static JsonObject ReadNavigationProperties(SyndicationItem item)
        {
            JsonObject navProperties = new JsonObject();
            SyndicationElementExtension inline;

            string propertyName;
            JsonObject propertyValue = null;

            foreach (SyndicationLink link in GetLinks(odataRelatedPrefix, item.Links))
            {
                propertyName = link.RelationshipType.Substring(odataRelatedPrefix.Length + 1);
                inline = link.ElementExtensions.SingleOrDefault(e =>
                    odataMetaXmlNs.Equals(e.OuterNamespace, StringComparison.Ordinal) &&
                    e.OuterName.Equals("inline", StringComparison.Ordinal));

                if (inline != null)
                {
                    XElement inlineElement = (XElement)XNode.ReadFrom(inline.GetReader());
                    XElement innerElement = inlineElement.Elements().FirstOrDefault();

                    if (innerElement != null)
                    {
                        // By default the inner feed/entry does not have the xml:base attribute, so we need to
                        // add it so that the parsed SyndicationFeed or SyndicationItem retains the baseUri
                        if (link.BaseUri != null)
                        {
                            innerElement.SetAttributeValue(XNamespace.Xml + "base", link.BaseUri.OriginalString);
                        }

                        // We are converting to a string before creating the reader to strip out extra indenting,
                        // otherwise the reader creates extra XmlText nodes that SyndicationFeed/SyndicationItem cannot handle
                        try
                        {
                            propertyValue = ReadFeed(new StringReader(innerElement.ToString()));
                        }
                        catch (XmlException)
                        {
                            // Try with entry instead .. 

                            propertyValue = ReadEntry(new StringReader(innerElement.ToString()));
                        }
                    }
                }
                else
                {
                    JsonObject deferred = new JsonObject();
                    deferred["uri"] = link.GetAbsoluteUri().AbsoluteUri;

                    propertyValue = new JsonObject();
                    propertyValue["__deferred"] = deferred;
                }
                navProperties[propertyName] = propertyValue;
            }
            return navProperties;
        }

        private static JsonObject ReadNavigationPropertiesMetadata(SyndicationItem item)
        {
            JsonObject propertiesMetadata = new JsonObject();
            JsonObject navMetadata;
            string propertyName;

            foreach (SyndicationLink link in GetLinks(odataRelatedPrefix, item.Links))
            {
                navMetadata = new JsonObject();
                navMetadata["extensions"] = GetLinkExtensions(link).Where(e =>
                    !(string.Equals(e["name"] as string, "inline", StringComparison.Ordinal) &&
                        string.Equals(e["namespaceURI"] as string, odataMetaXmlNs, StringComparison.Ordinal))
                ).ToArray();

                propertyName = link.RelationshipType.Substring(odataRelatedPrefix.Length + 1);
                propertiesMetadata[propertyName] = navMetadata;
            }

            foreach (SyndicationLink link in GetLinks(odataRelatedLinksPrefix, item.Links))
            {
                navMetadata = new JsonObject();
                navMetadata["associationuri"] = link.GetAbsoluteUri().AbsoluteUri;
                navMetadata["associationuri_extensions"] = link.GetAbsoluteUri().AbsoluteUri;

                propertyName = link.RelationshipType.Substring(odataRelatedLinksPrefix.Length + 1);
                if (propertiesMetadata.ContainsKey(propertyName))
                {
                    navMetadata = JsonObject.Merge(propertiesMetadata[propertyName] as JsonObject, navMetadata);
                }
                propertiesMetadata[propertyName] = navMetadata;
            }

            return propertiesMetadata;
        }

        private static JsonObject ReadPropertiesMetadata(XElement container)
        {
            JsonObject json = null;
            if (container != null && container.Elements().Any(e => e.Name.NamespaceName == odataXmlNs))
            {
                json = new JsonObject();
                foreach (XElement propertyElement in container.Elements())
                {
                    json[propertyElement.Name.LocalName] = ReadPropertyMetadata(propertyElement);
                }
            }
            return json;
        }

        private static JsonObject ReadPropertyMetadata(XElement property)
        {
            var metadata = ReaderUtils.CreateEntryPropertyMetadata(GetTypeAttribute(property));

            if (IsCollectionProperty(property))
            {
                string collectionType = GetCollectionType(GetTypeAttribute(property));
                if (collectionType == null)
                {
                    metadata["type"] = "Collection()";
                }

                List<JsonObject> elements = new List<JsonObject>();
                foreach (XElement item in property.Elements(XName.Get("element", odataXmlNs)))
                {
                    string itemType =
                        HasTypeAttribute(item) ? GetTypeAttribute(item) :
                        IsCollectionProperty(item) ? "Collection()" : collectionType;

                    var itemMetadata = ReaderUtils.CreateEntryPropertyMetadata(itemType);
                    if (item.Elements().Any(e => e.Name.NamespaceName == odataXmlNs))
                    {
                        itemMetadata["properties"] = ReadPropertiesMetadata(item);
                    }
                    elements.Add(itemMetadata);
                }
                metadata["elements"] = elements.ToArray();
            }
            else if (property != null && property.Elements().Any(e => e.Name.NamespaceName == odataXmlNs))
            {
                metadata["properties"] = ReadPropertiesMetadata(property);
            }

            return metadata;
        }

        /// <summary>
        /// Creates a JsonObject from an XML container element (e.g. the m:properties element) of an OData ATOM feed entry. 
        /// </summary>
        /// <param name="container">The XML container</param>
        /// <param name="buildValue">Function that builds a value from a property element</param>
        /// <returns>The JsonObject containing the name-value pairs</returns>
        private static JsonObject ReadObject(XElement container)
        {
            if (container == null)
            {
                return null;
            }

            var json = new JsonObject();
            foreach (XElement propertyElement in container.Elements())
            {
                json[propertyElement.Name.LocalName] = ReadDataItem(propertyElement);
            }
            return json;
        }

        private static JsonObject ReadCollectionProperty(XElement property, string typeName)
        {
            var collectionType = GetCollectionType(typeName);

            var json = new JsonObject();
            var results = new List<object>();

            foreach (XElement item in property.Elements())
            {
                object resultItem = ReadDataItem(item);
                results.Add(resultItem);

                JsonObject complexValue = resultItem as JsonObject;
                if (complexValue != null)
                {
                    var metadata = complexValue["__metadata"] as JsonObject;
                    if (!string.IsNullOrEmpty(collectionType) && metadata["type"] == null)
                    {
                        metadata["type"] = collectionType;
                    }
                }
            }

            json["results"] = results;
            json["__metadata"] = ReaderUtils.CreateEntryPropertyMetadata(typeName, false);

            return json;
        }

        private static JsonObject ReadComplexProperty(XElement container, string typeName)
        {
            JsonObject json = ReadObject(container);
            json["__metadata"] = ReaderUtils.CreateEntryPropertyMetadata(GetTypeAttribute(container), false);
            return json;
        }

        private static JsonObject ReadJsonSpatialProperty(XElement container, XElement gmlValue, bool isGeography)
        {
            GmlFormatter gmlFormatter = GmlFormatter.Create();
            GeoJsonObjectFormatter jsonformatter = GeoJsonObjectFormatter.Create();

            bool ignoreCrc = !gmlValue.Attributes().Any(a => a.Name.LocalName == "srsName");

            ISpatial spatialValue;
            if (isGeography)
            {
                spatialValue = gmlFormatter.Read<Geography>(gmlValue.CreateReader());
            }
            else
            {
                spatialValue = gmlFormatter.Read<Geometry>(gmlValue.CreateReader());
            }

            IDictionary<string, object> geoJsonData = jsonformatter.Write(spatialValue);
            JsonObject json = new JsonObject();

            Queue<object> geoJsonScopes = new Queue<object>();
            Queue<object> jsonScopes = new Queue<object>();

            geoJsonScopes.Enqueue(geoJsonData);
            jsonScopes.Enqueue(json);

            Func<object, object> convertScope = (scope) =>
            {
                object newScope =
                        scope is List<object> || scope is object[] ? (object)new List<Object>() :
                        scope is IDictionary<string, object> ? (object)new JsonObject() :
                        null;

                if (newScope != null)
                {
                    geoJsonScopes.Enqueue(scope);
                    jsonScopes.Enqueue(newScope);
                }

                return newScope ?? scope;
            };

            while (jsonScopes.Count > 0)
            {
                if (jsonScopes.Peek() is JsonObject)
                {
                    var currentGeoJson = (IDictionary<string, object>)geoJsonScopes.Dequeue();
                    var currentJson = (JsonObject)jsonScopes.Dequeue();

                    foreach (var item in currentGeoJson)
                    {
                        if (!ignoreCrc || item.Key != "crs")
                        {
                            currentJson[item.Key] = convertScope(item.Value);
                        }
                    }
                }
                else
                {
                    var currentGeoJson = (IEnumerable<object>)geoJsonScopes.Dequeue();
                    var currentJson = (List<object>)jsonScopes.Dequeue();

                    foreach (var item in currentGeoJson)
                    {
                        currentJson.Add(convertScope(item));
                    }
                }
            }
            json["__metadata"] = ReaderUtils.CreateEntryPropertyMetadata(GetTypeAttribute(container), false);
            return json;
        }

        public static object ReadDataItem(XElement item)
        {
            string typeName = GetTypeAttribute(item);
            XElement gmlRoot = item.Elements().SingleOrDefault(e => e.Name.NamespaceName == gmlXmlNs);

            if (gmlRoot != null)
            {
                bool isGeography = typeName.StartsWith("Edm.Geography");
                return ReadJsonSpatialProperty(item, gmlRoot, isGeography);
            }

            bool isCollection = IsCollectionProperty(item);
            if (item.HasElements || isCollection)
            {
                // Complex type, Collection Type: parse recursively
                return isCollection ? ReadCollectionProperty(item, typeName) : ReadComplexProperty(item, typeName);
            }

            // Primitive type: null value
            XNamespace mNamespace = item.GetNamespaceOfPrefix("m");
            XAttribute nullAttribute = mNamespace == null ? null : item.Attribute(mNamespace.GetName("null"));
            if (nullAttribute != null && nullAttribute.Value.Equals("true", StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            // Primitive type: check type and parse value accordingly
            string value = item.Value;
            switch (typeName)
            {
                case "Edm.Byte":
                    return XmlConvert.ToByte(value);
                case "Edm.Int16":
                    return XmlConvert.ToInt16(value);
                case "Edm.Int32":
                    return XmlConvert.ToInt32(value);
                case "Edm.SByte":
                    return XmlConvert.ToSByte(value);
                case "Edm.Boolean":
                    return XmlConvert.ToBoolean(value);
                case "Edm.Double":
                    return XmlConvert.ToDouble(value);
                case "Edm.Single":
                    return XmlConvert.ToSingle(value);
                case "Edm.Guid":
                    return XmlConvert.ToGuid(value);
                case "Edm.DateTime":
                    return new JsDate(XmlConvert.ToDateTime(value, XmlDateTimeSerializationMode.Utc));
                case "Edm.DateTimeOffset":
                    return new JsDate(XmlConvert.ToDateTimeOffset(value));
                case "Edm.Time":
                    throw new NotSupportedException(typeName + " is not supported");
                // Decimal and Int64 values are sent as strings over the wire.  This is the same behavior as WCF Data Services JSON serializer.
                case "Edm.Decimal":
                case "Edm.Int64":
                case "":
                default:
                    return value;
            }
        }
    }
}