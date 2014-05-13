// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
// files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// odata-xml.js

(function (window, undefined) {

    var datajs = window.datajs || {};
    var odata = window.OData || {};

    // Imports.

    var djsassert = datajs.djsassert;
    var http = datajs.http;
    var isArray = datajs.isArray;
    var isDate = datajs.isDate;
    var isObject = datajs.isObject;
    var normalizeURI = datajs.normalizeURI;
    var parseInt10 = datajs.parseInt10;
    var xmlAppendChild = datajs.xmlAppendChild;
    var xmlAppendChildren = datajs.xmlAppendChildren;
    var xmlAttributes = datajs.xmlAttributes;
    var xmlBaseURI = datajs.xmlBaseURI;
    var xmlChildElements = datajs.xmlChildElements;
    var xmlDom = datajs.xmlDom;
    var xmlFirstChildElement = datajs.xmlFirstChildElement;
    var xmlInnerText = datajs.xmlInnerText;
    var xmlLocalName = datajs.xmlLocalName;
    var xmlNamespaceURI = datajs.xmlNamespaceURI;
    var xmlNewAttribute = datajs.xmlNewAttribute;
    var xmlNewElement = datajs.xmlNewElement;
    var xmlNodeValue = datajs.xmlNodeValue;
    var xmlNS = datajs.xmlNS;
    var xmlnsNS = datajs.xmlnsNS;
    var xmlParse = datajs.xmlParse;
    var xmlQualifiedName = datajs.xmlQualifiedName;
    var xmlSerialize = datajs.xmlSerialize;
    var xmlSiblingElement = datajs.xmlSiblingElement;
    var w3org = datajs.w3org;

    var dataItemTypeName = odata.dataItemTypeName;
    var EDM_BINARY = odata.EDM_BINARY;
    var EDM_BOOLEAN = odata.EDM_BOOLEAN;
    var EDM_BYTE = odata.EDM_BYTE;
    var EDM_DATETIME = odata.EDM_DATETIME;
    var EDM_DATETIMEOFFSET = odata.EDM_DATETIMEOFFSET;
    var EDM_DECIMAL = odata.EDM_DECIMAL;
    var EDM_DOUBLE = odata.EDM_DOUBLE;
    var EDM_GEOGRAPHY = odata.EDM_GEOGRAPHY;
    var EDM_GEOGRAPHY_POINT = odata.EDM_GEOGRAPHY_POINT;
    var EDM_GEOGRAPHY_LINESTRING = odata.EDM_GEOGRAPHY_LINESTRING;
    var EDM_GEOGRAPHY_POLYGON = odata.EDM_GEOGRAPHY_POLYGON;
    var EDM_GEOGRAPHY_COLLECTION = odata.EDM_GEOGRAPHY_COLLECTION;
    var EDM_GEOGRAPHY_MULTIPOLYGON = odata.EDM_GEOGRAPHY_MULTIPOLYGON;
    var EDM_GEOGRAPHY_MULTILINESTRING = odata.EDM_GEOGRAPHY_MULTILINESTRING;
    var EDM_GEOGRAPHY_MULTIPOINT = odata.EDM_GEOGRAPHY_MULTIPOINT;
    var EDM_GEOMETRY = odata.EDM_GEOMETRY;
    var EDM_GEOMETRY_POINT = odata.EDM_GEOMETRY_POINT;
    var EDM_GEOMETRY_LINESTRING = odata.EDM_GEOMETRY_LINESTRING;
    var EDM_GEOMETRY_POLYGON = odata.EDM_GEOMETRY_POLYGON;
    var EDM_GEOMETRY_COLLECTION = odata.EDM_GEOMETRY_COLLECTION;
    var EDM_GEOMETRY_MULTIPOLYGON = odata.EDM_GEOMETRY_MULTIPOLYGON;
    var EDM_GEOMETRY_MULTILINESTRING = odata.EDM_GEOMETRY_MULTILINESTRING;
    var EDM_GEOMETRY_MULTIPOINT = odata.EDM_GEOMETRY_MULTIPOINT;
    var EDM_GUID = odata.EDM_GUID;
    var EDM_INT16 = odata.EDM_INT16;
    var EDM_INT32 = odata.EDM_INT32;
    var EDM_INT64 = odata.EDM_INT64;
    var EDM_SBYTE = odata.EDM_SBYTE;
    var EDM_SINGLE = odata.EDM_SINGLE;
    var EDM_STRING = odata.EDM_STRING;
    var EDM_TIME = odata.EDM_TIME;
    var GEOJSON_POINT = odata.GEOJSON_POINT;
    var GEOJSON_LINESTRING = odata.GEOJSON_LINESTRING;
    var GEOJSON_POLYGON = odata.GEOJSON_POLYGON;
    var GEOJSON_MULTIPOINT = odata.GEOJSON_MULTIPOINT;
    var GEOJSON_MULTILINESTRING = odata.GEOJSON_MULTILINESTRING;
    var GEOJSON_MULTIPOLYGON = odata.GEOJSON_MULTIPOLYGON;
    var GEOJSON_GEOMETRYCOLLECTION = odata.GEOJSON_GEOMETRYCOLLECTION;
    var formatDateTimeOffset = odata.formatDateTimeOffset;
    var formatDuration = odata.formatDuration;
    var getCollectionType = odata.getCollectionType;
    var gmlNewODataSpatialValue = odata.gmlNewODataSpatialValue;
    var gmlReadODataSpatialValue = odata.gmlReadODataSpatialValue;
    var gmlXmlNs = odata.gmlXmlNs;
    var handler = odata.handler;
    var isCollection = odata.isCollection;
    var isCollectionType = odata.isCollectionType;
    var isDeferred = odata.isDeferred;
    var isNamedStream = odata.isNamedStream;
    var isGeographyEdmType = odata.isGeographyEdmType;
    var isGeometryEdmType = odata.isGeometryEdmType;
    var isPrimitive = odata.isPrimitive;
    var isPrimitiveEdmType = odata.isPrimitiveEdmType;
    var lookupComplexType = odata.lookupComplexType;
    var lookupProperty = odata.lookupProperty;
    var maxVersion = odata.maxVersion;
    var navigationPropertyKind = odata.navigationPropertyKind;
    var MAX_DATA_SERVICE_VERSION = odata.MAX_DATA_SERVICE_VERSION;
    var parseBool = odata.parseBool;
    var parseDateTime = odata.parseDateTime;
    var parseDateTimeOffset = odata.parseDateTimeOffset;
    var parseDuration = odata.parseDuration;
    var parseTimezone = odata.parseTimezone;

    // CONTENT START

    var xmlMediaType = "application/xml";

    var ado = http + "docs.oasis-open.org/odata/";      // http://docs.oasis-open.org/odata/
    var adoDs = ado + "ns";                             // http://docs.oasis-open.org/odata/ns

    var edmxNs = adoDs + "/edmx";                       // http://docs.oasis-open.org/odata/ns/edmx
    var edmNs1 = adoDs + "/edm";                        // http://docs.oasis-open.org/odata/ns/edm

    var odataXmlNs = adoDs;                             // http://docs.oasis-open.org/odata/ns
    var odataMetaXmlNs = adoDs + "/metadata";           // http://docs.oasis-open.org/odata/ns/metadata
    var odataRelatedPrefix = adoDs + "/related/";       // http://docs.oasis-open.org/odata/ns/related
    var odataScheme = adoDs + "/scheme";                // http://docs.oasis-open.org/odata/ns/scheme

    var odataPrefix = "d";
    var odataMetaPrefix = "m";

    var createAttributeExtension = function (domNode, useNamespaceURI) {
        /// <summary>Creates an extension object for the specified attribute.</summary>
        /// <param name="domNode">DOM node for the attribute.</param>
        /// <param name="useNamespaceURI" type="Boolean">Flag indicating if the namespaceURI property should be added to the extension object instead of the namespace property.</param>
        /// <remarks>
        ///    The useNamespaceURI flag is used to prevent a breaking change from older versions of datajs in which extension
        ///    objects created for Atom extension attributes have the namespaceURI property instead of the namespace one.
        ///    
        ///    This flag and the namespaceURI property should be deprecated in future major versions of the library.
        /// </remarks>
        /// <returns type="Object">The new extension object.</returns>

        djsassert(domNode.nodeType === 2, "createAttributeExtension - domNode is not an attribute node!!");
        var extension = { name: xmlLocalName(domNode), value: domNode.value };
        extension[useNamespaceURI ? "namespaceURI" : "namespace"] = xmlNamespaceURI(domNode);

        return extension;
    };

    var createElementExtension = function (domNode, useNamespaceURI) {
        /// <summary>Creates an extension object for the specified element.</summary>
        /// <param name="domNode">DOM node for the element.</param>
        /// <param name="useNamespaceURI" type="Boolean">Flag indicating if the namespaceURI property should be added to the extension object instead of the namespace property.</param>
        /// <remarks>
        ///    The useNamespaceURI flag is used to prevent a breaking change from older versions of datajs in which extension
        ///    objects created for Atom extension attributes have the namespaceURI property instead of the namespace one.
        ///    
        ///    This flag and the namespaceURI property should be deprecated in future major versions of the library.
        /// </remarks>
        /// <returns type="Object">The new extension object.</returns>

        djsassert(domNode.nodeType === 1, "createAttributeExtension - domNode is not an element node!!");

        var attributeExtensions = [];
        var childrenExtensions = [];

        var i, len;
        var attributes = domNode.attributes;
        for (i = 0, len = attributes.length; i < len; i++) {
            var attr = attributes[i];
            if (xmlNamespaceURI(attr) !== xmlnsNS) {
                attributeExtensions.push(createAttributeExtension(attr, useNamespaceURI));
            }
        }

        var child = domNode.firstChild;
        while (child != null) {
            if (child.nodeType === 1) {
                childrenExtensions.push(createElementExtension(child, useNamespaceURI));
            }
            child = child.nextSibling;
        }

        var extension = {
            name: xmlLocalName(domNode),
            value: xmlInnerText(domNode),
            attributes: attributeExtensions,
            children: childrenExtensions
        };

        extension[useNamespaceURI ? "namespaceURI" : "namespace"] = xmlNamespaceURI(domNode);
        return extension;
    };

    var isCollectionItemElement = function (domElement) {
        /// <summary>Checks whether the domElement is a collection item.</summary>
        /// <param name="domElement">DOM element possibliy represnting a collection item.</param>
        /// <returns type="Boolean">True if the domeElement belongs to the OData metadata namespace and its local name is "element"; false otherwise.</returns>

        return xmlNamespaceURI(domElement) === odataXmlNs && xmlLocalName(domElement) === "element";
    };

    var makePropertyMetadata = function (type, extensions) {
        /// <summary>Creates an object containing property metadata.</summary>
        /// <param type="String" name="type">Property type name.</param>
        /// <param type="Array" name="extensions">Array of attribute extension objects.</param>
        /// <returns type="Object">Property metadata object cotaining type and extensions fields.</returns>

        return { type: type, extensions: extensions };
    };

    var odataInferTypeFromPropertyXmlDom = function (domElement) {
        /// <summary>Infers type of a property based on its xml DOM tree.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <returns type="String">Inferred type name; null if the type cannot be determined.</returns>

        if (xmlFirstChildElement(domElement, gmlXmlNs)) {
            return EDM_GEOMETRY;
        }

        var firstChild = xmlFirstChildElement(domElement, odataXmlNs);
        if (!firstChild) {
            return EDM_STRING;
        }

        if (isCollectionItemElement(firstChild)) {
            var sibling = xmlSiblingElement(firstChild, odataXmlNs);
            if (sibling && isCollectionItemElement(sibling)) {
                // More than one <element> tag have been found, it can be safely assumed that this is a collection property.
                return "Collection()";
            }
        }

        return null;
    };

    var xmlReadODataPropertyAttributes = function (domElement) {
        /// <summary>Reads the attributes of a property DOM element in an OData XML document.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <returns type="Object">Object containing the property type, if it is null, and its attribute extensions.</returns>

        var type = null;
        var isNull = false;
        var extensions = [];

        xmlAttributes(domElement, function (attribute) {
            var nsURI = xmlNamespaceURI(attribute);
            var localName = xmlLocalName(attribute);
            var value = xmlNodeValue(attribute);

            if (nsURI === odataMetaXmlNs) {
                if (localName === "null") {
                    isNull = (value.toLowerCase() === "true");
                    return;
                }

                if (localName === "type") {
                    type = value;
                    return;
                }
            }

            if (nsURI !== xmlNS && nsURI !== xmlnsNS) {
                extensions.push(createAttributeExtension(attribute, true));
                return;
            }
        });

        return { type: (!type && isNull ? EDM_STRING : type), isNull: isNull, extensions: extensions };
    };

    var xmlReadODataProperty = function (domElement) {
        /// <summary>Reads a property DOM element in an OData XML document.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <returns type="Object">Object with name, value, and metadata for the property.</returns>

        if (xmlNamespaceURI(domElement) !== odataXmlNs) {
            // domElement is not a proprety element because it is not in the odata xml namespace.
            return null;
        }

        var propertyName = xmlLocalName(domElement);
        var propertyAttributes = xmlReadODataPropertyAttributes(domElement);

        var propertyIsNull = propertyAttributes.isNull;
        var propertyType = propertyAttributes.type;

        var propertyMetadata = makePropertyMetadata(propertyType, propertyAttributes.extensions);
        var propertyValue = propertyIsNull ? null : xmlReadODataPropertyValue(domElement, propertyType, propertyMetadata);

        return { name: propertyName, value: propertyValue, metadata: propertyMetadata };
    };

    var xmlReadODataPropertyValue = function (domElement, propertyType, propertyMetadata) {
        /// <summary>Reads the value of a property in an OData XML document.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object that will store metadata about the property.</param>
        /// <returns>Property value.</returns>

        if (!propertyType) {
            propertyType = odataInferTypeFromPropertyXmlDom(domElement);
            propertyMetadata.type = propertyType;
        }

        var isGeograhpyType = isGeographyEdmType(propertyType);
        if (isGeograhpyType || isGeometryEdmType(propertyType)) {
            return xmlReadODataSpatialPropertyValue(domElement, propertyType, isGeograhpyType);
        }

        if (isPrimitiveEdmType(propertyType)) {
            return xmlReadODataEdmPropertyValue(domElement, propertyType);
        }

        if (isCollectionType(propertyType)) {
            return xmlReadODataCollectionPropertyValue(domElement, propertyType, propertyMetadata);
        }

        return xmlReadODataComplexPropertyValue(domElement, propertyType, propertyMetadata);
    };

    var xmlReadODataSpatialPropertyValue = function (domElement, propertyType, isGeography) {
        /// <summary>Reads the value of an spatial property in an OData XML document.</summary>
        /// <param name="property">DOM element for the spatial property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>Spatial property value in GeoJSON format.</returns>

        var gmlRoot = xmlFirstChildElement(domElement, gmlXmlNs);
        djsassert(gmlRoot, "xmlReadODataSpatialPropertyValue - domElement doesn't have a child element that belongs to the gml namespace!!");

        var value = gmlReadODataSpatialValue(gmlRoot, isGeography);
        value.__metadata = { type: propertyType };
        return value;
    };

    var xmlReadODataEdmPropertyValue = function (domNode, propertyType) {
        /// <summary>Reads the value of an EDM property in an OData XML document.</summary>
        /// <param name="donNode">DOM node for the EDM property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <returns>EDM property value.</returns>

        var propertyValue = xmlNodeValue(domNode) || "";

        switch (propertyType) {
            case EDM_BOOLEAN:
                return parseBool(propertyValue);
            case EDM_BINARY:
            case EDM_DECIMAL:
            case EDM_GUID:
            case EDM_INT64:
            case EDM_STRING:
                return propertyValue;
            case EDM_BYTE:
            case EDM_INT16:
            case EDM_INT32:
            case EDM_SBYTE:
                return parseInt10(propertyValue);
            case EDM_DOUBLE:
            case EDM_SINGLE:
                return parseFloat(propertyValue);
            case EDM_TIME:
                return parseDuration(propertyValue);
            case EDM_DATETIME:
                return parseDateTime(propertyValue);
            case EDM_DATETIMEOFFSET:
                return parseDateTimeOffset(propertyValue);
        }

        return propertyValue;
    };

    var xmlReadODataComplexPropertyValue = function(domElement, propertyType, propertyMetadata) {
        /// <summary>Reads the value of a complex type property in an OData XML document.</summary>
        /// <param name="property">DOM element for the complex type property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object that will store metadata about the property.</param>
        /// <returns type="Object">Complex type property value.</returns>

        var propertyValue = { __metadata: { type: propertyType } };
        xmlChildElements(domElement, function(child) {
            var childProperty = xmlReadODataProperty(child);
            var childPropertyName = childProperty.name;

            propertyMetadata.properties = propertyMetadata.properties || {};
            propertyMetadata.properties[childPropertyName] = childProperty.metadata;
            propertyValue[childPropertyName] = childProperty.value;
        });

        return propertyValue;
    };

    var xmlReadODataCollectionPropertyValue = function (domElement, propertyType, propertyMetadata) {
        /// <summary>Reads the value of a collection property in an OData XML document.</summary>
        /// <param name="property">DOM element for the collection property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object that will store metadata about the property.</param>
        /// <returns type="Object">Collection property value.</returns>

        var items = [];
        var itemsMetadata = propertyMetadata.elements = [];
        var collectionType = getCollectionType(propertyType);

        xmlChildElements(domElement, function (child) {
            if (isCollectionItemElement(child)) {
                var itemAttributes = xmlReadODataPropertyAttributes(child);
                var itemExtensions = itemAttributes.extensions;
                var itemType = itemAttributes.type || collectionType;
                var itemMetadata = makePropertyMetadata(itemType, itemExtensions);

                var item = xmlReadODataPropertyValue(child, itemType, itemMetadata);

                items.push(item);
                itemsMetadata.push(itemMetadata);
            }
        });

        return { __metadata: { type: propertyType === "Collection()" ? null : propertyType }, results: items };
    };

    var readODataXmlDocument = function (xmlRoot, baseURI) {
        /// <summary>Reads an OData link(s) producing an object model in return.</summary>
        /// <param name="xmlRoot">Top-level element to read.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the XML payload.</param>
        /// <returns type="Object">The object model representing the specified element.</returns>

        if (xmlNamespaceURI(xmlRoot) === odataXmlNs) {
            baseURI = xmlBaseURI(xmlRoot, baseURI);
            var localName = xmlLocalName(xmlRoot);

            if (localName === "links") {
                return readLinks(xmlRoot, baseURI);
            }
            if (localName === "uri") {
                return readUri(xmlRoot, baseURI);
            }
        }
        return undefined;
    };

    var readLinks = function (linksElement, baseURI) {
        /// <summary>Deserializes an OData XML links element.</summary>
        /// <param name="linksElement">XML links element.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the XML payload.</param>
        /// <returns type="Object">A new object representing the links collection.</returns>

        var uris = [];

        xmlChildElements(linksElement, function (child) {
            if (xmlLocalName(child) === "uri" && xmlNamespaceURI(child) === odataXmlNs) {
                uris.push(readUri(child, baseURI));
            }
        });

        return { results: uris };
    };

    var readUri = function (uriElement, baseURI) {
        /// <summary>Deserializes an OData XML uri element.</summary>
        /// <param name="uriElement">XML uri element.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the XML payload.</param>
        /// <returns type="Object">A new object representing the uri.</returns>

        var uri = xmlInnerText(uriElement) || "";
        return { uri: normalizeURI(uri, baseURI) };
    };

    var xmlODataInferSpatialValueGeoJsonType = function (value, edmType) {
        /// <summary>Infers the GeoJSON type from the spatial property value and the edm type name.</summary>
        /// <param name="value" type="Object">Spatial property value in GeoJSON format.</param>
        /// <param name="edmType" type="String" mayBeNull="true" optional="true">Spatial property edm type.<param>
        /// <remarks>
        ///   If the edmType parameter is null, undefined, "Edm.Geometry" or "Edm.Geography", then the function returns
        ///   the GeoJSON type indicated by the value's type property.
        ///
        ///   If the edmType parameter is specified or is not one of the base spatial types, then it is used to
        ///   determine the GeoJSON type and the value's type property is ignored.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the spatial value. </returns>

        if (edmType === EDM_GEOMETRY || edmType === EDM_GEOGRAPHY) {
            return value && value.type;
        }

        if (edmType === EDM_GEOMETRY_POINT || edmType === EDM_GEOGRAPHY_POINT) {
            return GEOJSON_POINT;
        }

        if (edmType === EDM_GEOMETRY_LINESTRING || edmType === EDM_GEOGRAPHY_LINESTRING) {
            return GEOJSON_LINESTRING;
        }

        if (edmType === EDM_GEOMETRY_POLYGON || edmType === EDM_GEOGRAPHY_POLYGON) {
            return GEOJSON_POLYGON;
        }

        if (edmType === EDM_GEOMETRY_COLLECTION || edmType === EDM_GEOGRAPHY_COLLECTION) {
            return GEOJSON_GEOMETRYCOLLECTION;
        }

        if (edmType === EDM_GEOMETRY_MULTIPOLYGON || edmType === EDM_GEOGRAPHY_MULTIPOLYGON) {
            return GEOJSON_MULTIPOLYGON;
        }

        if (edmType === EDM_GEOMETRY_MULTILINESTRING || edmType === EDM_GEOGRAPHY_MULTILINESTRING) {
            return GEOJSON_MULTILINESTRING;
        }

        if (edmType === EDM_GEOMETRY_MULTIPOINT || edmType === EDM_GEOGRAPHY_MULTIPOINT) {
            return GEOJSON_MULTIPOINT;
        }

        djsassert(false, "gmlInferGeoJsonType - edm type <" + edmType + "> was unexpected!!");
        return null;
    };

    var xmlNewODataMetaElement = function (dom, name, children) {
        /// <summary>Creates a new DOM element in the OData metadata namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the OData metadata element to create.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <returns>New DOM element in the OData metadata namespace.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>

        return xmlNewElement(dom, odataMetaXmlNs, xmlQualifiedName(odataMetaPrefix, name), children);
    };

    var xmlNewODataMetaAttribute = function (dom, name, value) {
        /// <summary>Creates a new DOM attribute in the odata namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the OData attribute to create.</param>
        /// <param name="value">Attribute value.</param>
        /// <returns>New DOM attribute in the odata namespace.</returns>

        return xmlNewAttribute(dom, odataMetaXmlNs, xmlQualifiedName(odataMetaPrefix, name), value);
    };

    var xmlNewODataElement = function (dom, name, children) {
        /// <summary>Creates a new DOM element in the OData namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the OData element to create.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <returns>New DOM element in the OData namespace.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>

        return xmlNewElement(dom, odataXmlNs, xmlQualifiedName(odataPrefix, name), children);
    };

    var xmlNewODataPrimitiveValue = function (value, typeName) {
        /// <summary>Returns the string representation of primitive value for an OData XML document.</summary>
        /// <param name="value">Primivite value to format.</param>
        /// <param name="typeName" type="String" optional="true">Type name of the primitive value.</param>
        /// <returns type="String">Formatted primitive value.</returns>

        if (typeName === EDM_DATETIME || typeName === EDM_DATETIMEOFFSET || isDate(value)) {
            return formatDateTimeOffset(value);
        }
        if (typeName === EDM_TIME) {
            return formatDuration(value);
        }
        return value.toString();
    };

    var xmlNewODataElementInfo = function (domElement, dataServiceVersion) {
        /// <summary>Creates an object that represents a new DOM element for an OData XML document and the data service version it requires.</summary>
        /// <param name="domElement">New DOM element for an OData XML document.</param>
        /// <param name="dataServiceVersion" type="String">Required data service version by the new DOM element.</param>
        /// <returns type="Object">Object containing new DOM element and its required data service version.</returns>

        return { element: domElement, dsv: dataServiceVersion };
    };

    var xmlNewODataProperty = function (dom, name, typeName, children) {
        /// <summary>Creates a new DOM element for an entry property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>
        /// <returns>New DOM element in the OData namespace for the entry property.</returns>

        var typeAttribute = typeName ? xmlNewODataMetaAttribute(dom, "type", typeName) : null;
        var property = xmlNewODataElement(dom, name, typeAttribute);
        return xmlAppendChildren(property, children);
    };

    var xmlNewODataEdmProperty = function (dom, name, value, typeName) {
        /// <summary>Creates a new DOM element for an EDM property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value">Property value.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the EDM property and the
        ///     required data service version for this property.
        /// </returns>

        var propertyValue = xmlNewODataPrimitiveValue(value, typeName);
        var property = xmlNewODataProperty(dom, name, typeName, propertyValue);
        return xmlNewODataElementInfo(property, /*dataServiceVersion*/"4.0");
    };

    var xmlNewODataNullProperty = function (dom, name, typeName, model) {
        /// <summary>Creates a new DOM element for a null property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <remarks>
        ///     If no typeName is specified, then it will be assumed that this is a primitive type property.
        /// </remarks>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the null property and the 
        ///     required data service version for this property.
        /// </returns>

        var nullAttribute = xmlNewODataMetaAttribute(dom, "null", "true");
        var property = xmlNewODataProperty(dom, name, typeName, nullAttribute);
        var dataServiceVersion = lookupComplexType(typeName, model) ? "2.0" : "1.0";

        return xmlNewODataElementInfo(property, dataServiceVersion);
    };

    var xmlNewODataCollectionProperty = function (dom, name, value, typeName, collectionMetadata, collectionModel, model) {
        /// <summary>Creates a new DOM element for a collection property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value">Property value either as an array or an object representing a collection in the library's internal representation.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="collectionMetadata" type="Object" optional="true">Object containing metadata about the collection property.</param>
        /// <param name="collectionModel" type="Object" optional="true">Object describing the collection property in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the collection property and the
        ///     required data service version for this property.
        /// </returns>

        var itemTypeName = getCollectionType(typeName);
        var items = isArray(value) ? value : value.results;
        var itemMetadata = typeName ? { type: itemTypeName} : {};
        itemMetadata.properties = collectionMetadata.properties;

        var xmlProperty = xmlNewODataProperty(dom, name, itemTypeName ? typeName : null);

        var i, len;
        for (i = 0, len = items.length; i < len; i++) {
            var itemValue = items[i];
            var item = xmlNewODataDataElement(dom, "element", itemValue, itemMetadata, collectionModel, model);

            xmlAppendChild(xmlProperty, item.element);
        }
        return xmlNewODataElementInfo(xmlProperty, /*dataServiceVersion*/"4.0");
    };

    var xmlNewODataComplexProperty = function (dom, name, value, typeName, propertyMetadata, propertyModel, model) {
        /// <summary>Creates a new DOM element for a complex type property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value">Property value as an object in the library's internal representation.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="propertyMetadata" type="Object" optional="true">Object containing metadata about the complex type property.</param>
        /// <param name="propertyModel" type="Object" optional="true">Object describing the complex type property in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the complex type property and the
        ///     required data service version for this property.
        /// </returns>

        var xmlProperty = xmlNewODataProperty(dom, name, typeName);
        var complexTypePropertiesMetadata = propertyMetadata.properties || {};
        var complexTypeModel = lookupComplexType(typeName, model) || {};

        var dataServiceVersion = "4.0";

        for (var key in value) {
            if (key !== "__metadata") {
                var memberValue = value[key];
                var memberModel = lookupProperty(complexTypeModel.property, key);
                var memberMetadata = complexTypePropertiesMetadata[key] || {};
                var member = xmlNewODataDataElement(dom, key, memberValue, memberMetadata, memberModel, model);

                dataServiceVersion = maxVersion(dataServiceVersion, member.dsv);
                xmlAppendChild(xmlProperty, member.element);
            }
        }
        return xmlNewODataElementInfo(xmlProperty, dataServiceVersion);
    };

    var xmlNewODataSpatialProperty = function (dom, name, value, typeName, isGeography) {
        /// <summary>Creates a new DOM element for an EDM spatial property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value" type="Object">GeoJSON object containing the property value.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the EDM property and the
        ///     required data service version for this property.
        /// </returns>

        var geoJsonType = xmlODataInferSpatialValueGeoJsonType(value, typeName);

        var gmlRoot = gmlNewODataSpatialValue(dom, value, geoJsonType, isGeography);
        var xmlProperty = xmlNewODataProperty(dom, name, typeName, gmlRoot);

        return xmlNewODataElementInfo(xmlProperty, "4.0");
    };

    var xmlNewODataDataElement = function (dom, name, value, dataItemMetadata, dataItemModel, model) {
        /// <summary>Creates a new DOM element for a data item in an entry, complex property, or collection property.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Data item name.</param>
        /// <param name="value" optional="true" mayBeNull="true">Value of the data item, if any.</param>
        /// <param name="dataItemMetadata" type="Object" optional="true">Object containing metadata about the data item.</param>
        /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the appropriate namespace for the data item and the
        ///     required data service version for it.
        /// </returns>

        var typeName = dataItemTypeName(value, dataItemMetadata, dataItemModel);
        if (isPrimitive(value)) {
            return xmlNewODataEdmProperty(dom, name, value, typeName || EDM_STRING);
        }

        var isGeography = isGeographyEdmType(typeName);
        if (isGeography || isGeometryEdmType(typeName)) {
            return xmlNewODataSpatialProperty(dom, name, value, typeName, isGeography);
        }

        if (isCollection(value, typeName)) {
            return xmlNewODataCollectionProperty(dom, name, value, typeName, dataItemMetadata, dataItemModel, model);
        }

        if (isNamedStream(value)) {
            return null;
        }

        // This may be a navigation property.
        var navPropKind = navigationPropertyKind(value, dataItemModel);
        if (navPropKind !== null) {
            return null;
        }

        if (value === null) {
            return xmlNewODataNullProperty(dom, name, typeName);
        }

        djsassert(isObject(value), "xmlNewODataEntryProperty - property '" + name + "' is not an object");
        return xmlNewODataComplexProperty(dom, name, value, typeName, dataItemMetadata, dataItemModel, model);
    };

    var odataNewLinkDocument = function (data) {
        /// <summary>Writes the specified data into an OData XML document.</summary>
        /// <param name="data">Data to write.</param>
        /// <returns>The root of the DOM tree built.</returns>

        if (data && isObject(data)) {
            var dom = xmlDom();
            return xmlAppendChild(dom, xmlNewODataElement(dom, "uri", data.uri));
        }
        // Allow for undefined to be returned.
    };

    var xmlParser = function (handler, text) {
        /// <summary>Parses an OData XML document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Document text.</param>
        /// <returns>An object representation of the document; undefined if not applicable.</returns>

        if (text) {
            var doc = xmlParse(text);
            var root = xmlFirstChildElement(doc);
            if (root) {
                return readODataXmlDocument(root);
            }
        }

        // Allow for undefined to be returned.
    };

    var xmlSerializer = function (handler, data, context) {
        /// <summary>Serializes an OData XML object into a document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data" type="Object">Representation of feed or entry.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>A text representation of the data object; undefined if not applicable.</returns>

        var cType = context.contentType = context.contentType || contentType(xmlMediaType);
        if (cType && cType.mediaType === xmlMediaType) {
            return xmlSerialize(odataNewLinkDocument(data));
        }
        return undefined;
    };

    odata.xmlHandler = handler(xmlParser, xmlSerializer, xmlMediaType, MAX_DATA_SERVICE_VERSION);

    // DATAJS INTERNAL START
    odata.adoDs = adoDs;
    odata.createAttributeExtension = createAttributeExtension;
    odata.createElementExtension = createElementExtension;
    odata.edmxNs = edmxNs;
    odata.edmNs1 = edmNs1;
    odata.odataMetaXmlNs = odataMetaXmlNs;
    odata.odataMetaPrefix = odataMetaPrefix;
    odata.odataXmlNs = odataXmlNs;
    odata.odataPrefix = odataPrefix;
    odata.odataScheme = odataScheme;
    odata.odataRelatedPrefix = odataRelatedPrefix;
    odata.xmlNewODataElement = xmlNewODataElement;
    odata.xmlNewODataElementInfo = xmlNewODataElementInfo;
    odata.xmlNewODataMetaAttribute = xmlNewODataMetaAttribute;
    odata.xmlNewODataMetaElement = xmlNewODataMetaElement;
    odata.xmlNewODataDataElement = xmlNewODataDataElement;
    odata.xmlReadODataEdmPropertyValue = xmlReadODataEdmPropertyValue;
    odata.xmlReadODataProperty = xmlReadODataProperty;

    // DATAJS INTERNAL END

    // CONTENT END
})(this);