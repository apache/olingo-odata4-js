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

// odata-gml.js

(function (window, undefined) {

    var datajs = window.odatajs || {};
    var odata = window.OData || {};

    // Imports.

    var contains = odatajs.contains;
    var djsassert = odatajs.djsassert;
    var http = odatajs.http;
    var isArray = odatajs.isArray;
    var xmlAppendChild = odatajs.xmlAppendChild;
    var xmlAttributeValue = odatajs.xmlAttributeValue;
    var xmlChildElements = odatajs.xmlChildElements;
    var xmlFirstChildElement = odatajs.xmlFirstChildElement;
    var xmlInnerText = odatajs.xmlInnerText;
    var xmlLocalName = odatajs.xmlLocalName;
    var xmlNamespaceURI = odatajs.xmlNamespaceURI;
    var xmlNewElement = odatajs.xmlNewElement;
    var xmlQualifiedName = odatajs.xmlQualifiedName;
    var GEOJSON_POINT = odata.GEOJSON_POINT;
    var GEOJSON_LINESTRING = odata.GEOJSON_LINESTRING;
    var GEOJSON_POLYGON = odata.GEOJSON_POLYGON;
    var GEOJSON_MULTIPOINT = odata.GEOJSON_MULTIPOINT;
    var GEOJSON_MULTILINESTRING = odata.GEOJSON_MULTILINESTRING;
    var GEOJSON_MULTIPOLYGON = odata.GEOJSON_MULTIPOLYGON;
    var GEOJSON_GEOMETRYCOLLECTION = odata.GEOJSON_GEOMETRYCOLLECTION;

    // CONTENT START
    var gmlOpenGis = http + "www.opengis.net";           // http://www.opengis.net
    var gmlXmlNs = gmlOpenGis + "/gml";                 // http://www.opengis.net/gml
    var gmlSrsPrefix = gmlOpenGis + "/def/crs/EPSG/0/"; // http://www.opengis.net/def/crs/EPSG/0/

    var gmlPrefix = "gml";

    var gmlCreateGeoJSONOBject = function (type, member, data) {
        /// <summary>Creates a GeoJSON object with the specified type, member and value.</summary>
        /// <param name="type" type="String">GeoJSON object type.</param>
        /// <param name="member" type="String">Name for the data member in the GeoJSON object.</param>
        /// <param name="data">Data to be contained by the GeoJSON object.</param>
        /// <returns type="Object">GeoJSON object.</returns>

        var result = { type: type };
        result[member] = data;
        return result;
    };

    var gmlSwapLatLong = function (coordinates) {
        /// <summary>Swaps the longitude and latitude in the coordinates array.</summary>
        /// <param name="coordinates" type="Array">Array of doubles descrbing a set of coordinates.</param>
        /// <returns type="Array">Array of doubles with the latitude and longitude components swapped.</returns>

        if (isArray(coordinates) && coordinates.length >= 2) {
            var tmp = coordinates[0];
            coordinates[0] = coordinates[1];
            coordinates[1] = tmp;
        }
        return coordinates;
    };

    var gmlReadODataMultiItem = function (domElement, type, member, members, valueReader, isGeography) {
        /// <summary>
        ///    Reads a GML DOM element that represents a composite structure like a multi-point or a
        ///    multi-geometry returnig its GeoJSON representation.
        /// </summary>
        /// <param name="domElement">GML DOM element.</param>
        /// <param name="type" type="String">GeoJSON object type.</param>
        /// <param name="member" type="String">Name for the child element representing a single item in the composite structure.</param>
        /// <param name="members" type="String">Name for the child element representing a collection of items in the composite structure.</param>
        /// <param name="valueReader" type="Function">Callback function invoked to get the coordinates of each item in the comoposite structure.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">GeoJSON object.</returns>

        var coordinates = gmlReadODataMultiItemValue(domElement, member, members, valueReader, isGeography);
        return gmlCreateGeoJSONOBject(type, "coordinates", coordinates);
    };

    var gmlReadODataMultiItemValue = function (domElement, member, members, valueReader, isGeography) {
        /// <summary>
        ///    Reads the value of a GML DOM element that represents a composite structure like a multi-point or a
        ///    multi-geometry returnig its items.
        /// </summary>
        /// <param name="domElement">GML DOM element.</param>
        /// <param name="type" type="String">GeoJSON object type.</param>
        /// <param name="member" type="String">Name for the child element representing a single item in the composite structure.</param>
        /// <param name="members" type="String">Name for the child element representing a collection of items in the composite structure.</param>
        /// <param name="valueReader" type="Function">Callback function invoked to get the transformed value of each item in the comoposite structure.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing the transformed value of each item in the multi-item.</returns>

        var items = [];

        xmlChildElements(domElement, function (child) {
            if (xmlNamespaceURI(child) !== gmlXmlNs) {
                return;
            }

            var localName = xmlLocalName(child);

            if (localName === member) {
                var valueElement = xmlFirstChildElement(child, gmlXmlNs);
                if (valueElement) {
                    var value = valueReader(valueElement, isGeography);
                    if (value) {
                        items.push(value);
                    }
                }
                return;
            }

            if (localName === members) {
                xmlChildElements(child, function (valueElement) {
                    if (xmlNamespaceURI(valueElement) !== gmlXmlNs) {
                        return;
                    }

                    var value = valueReader(valueElement, isGeography);
                    if (value) {
                        items.push(value);
                    }
                });
            }
        });
        return items;
    };

    var gmlReadODataCollection = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-geometry returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiGeometry object in GeoJSON format.</returns>

        var geometries = gmlReadODataMultiItemValue(domElement, "geometryMember", "geometryMembers", gmlReadODataSpatialValue, isGeography);
        return gmlCreateGeoJSONOBject(GEOJSON_GEOMETRYCOLLECTION, "geometries", geometries);
    };

    var gmlReadODataLineString = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a line string returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">LineString object in GeoJSON format.</returns>

        return gmlCreateGeoJSONOBject(GEOJSON_LINESTRING, "coordinates", gmlReadODataLineValue(domElement, isGeography));
    };

    var gmlReadODataMultiLineString = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-line string returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiLineString object in GeoJSON format.</returns>

        return gmlReadODataMultiItem(domElement, GEOJSON_MULTILINESTRING, "curveMember", "curveMembers", gmlReadODataLineValue, isGeography);
    };

    var gmlReadODataMultiPoint = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-point returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiPoint object in GeoJSON format.</returns>

        return gmlReadODataMultiItem(domElement, GEOJSON_MULTIPOINT, "pointMember", "pointMembers", gmlReadODataPointValue, isGeography);
    };

    var gmlReadODataMultiPolygon = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-polygon returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiPolygon object in GeoJSON format.</returns>

        return gmlReadODataMultiItem(domElement, GEOJSON_MULTIPOLYGON, "surfaceMember", "surfaceMembers", gmlReadODataPolygonValue, isGeography);
    };

    var gmlReadODataPoint = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a point returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">Point object in GeoJSON format.</returns>

        return gmlCreateGeoJSONOBject(GEOJSON_POINT, "coordinates", gmlReadODataPointValue(domElement, isGeography));
    };

    var gmlReadODataPolygon = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a polygon returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">Polygon object in GeoJSON format.</returns>

        return gmlCreateGeoJSONOBject(GEOJSON_POLYGON, "coordinates", gmlReadODataPolygonValue(domElement, isGeography));
    };

    var gmlReadODataLineValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a line returning its set of coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate of the line.</returns>

        var coordinates = [];

        xmlChildElements(domElement, function (child) {
            var nsURI = xmlNamespaceURI(child);

            if (nsURI !== gmlXmlNs) {
                return;
            }

            var localName = xmlLocalName(child);

            if (localName === "posList") {
                coordinates = gmlReadODataPosListValue(child, isGeography);
                return;
            }
            if (localName === "pointProperty") {
                coordinates.push(gmlReadODataPointWrapperValue(child, isGeography));
                return;
            }
            if (localName === "pos") {
                coordinates.push(gmlReadODataPosValue(child, isGeography));
                return;
            }
        });

        return coordinates;
    };

    var gmlReadODataPointValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a point returning its coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array of doubles containing the point coordinates.</returns>

        var pos = xmlFirstChildElement(domElement, gmlXmlNs, "pos");
        return pos ? gmlReadODataPosValue(pos, isGeography) : [];
    };

    var gmlReadODataPointWrapperValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element wrapping an element representing a point returning its coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array of doubles containing the point coordinates.</returns>

        var point = xmlFirstChildElement(domElement, gmlXmlNs, "Point");
        return point ? gmlReadODataPointValue(point, isGeography) : [];
    };

    var gmlReadODataPolygonValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a polygon returning its set of coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing an array of array of doubles for each ring of the polygon.</returns>

        var coordinates = [];
        var exteriorFound = false;
        xmlChildElements(domElement, function (child) {
            if (xmlNamespaceURI(child) !== gmlXmlNs) {
                return;
            }

            // Only the exterior and the interior rings are interesting
            var localName = xmlLocalName(child);
            if (localName === "exterior") {
                exteriorFound = true;
                coordinates.unshift(gmlReadODataPolygonRingValue(child, isGeography));
                return;
            }
            if (localName === "interior") {
                coordinates.push(gmlReadODataPolygonRingValue(child, isGeography));
                return;
            }
        });

        if (!exteriorFound && coordinates.length > 0) {
            // Push an empty exterior ring.
            coordinates.unshift([[]]);
        }

        return coordinates;
    };

    var gmlReadODataPolygonRingValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a linear ring in a GML Polygon element.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate of the linear ring.</returns>

        var value = [];
        xmlChildElements(domElement, function (child) {
            if (xmlNamespaceURI(child) !== gmlXmlNs || xmlLocalName(child) !== "LinearRing") {
                return;
            }
            value = gmlReadODataLineValue(child, isGeography);
        });
        return value;
    };

    var gmlReadODataPosListValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a list of positions retruning its set of coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        ///
        ///    The positions described by the list are assumed to be 2D, so 
        ///    an exception will be thrown if the list has an odd number elements.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate in the list.</returns>

        var coordinates = gmlReadODataPosValue(domElement, false);
        var len = coordinates.length;

        if (len % 2 !== 0) {
            throw { message: "GML posList element has an uneven number of numeric values" };
        }

        var value = [];
        for (var i = 0; i < len; i += 2) {
            var pos = coordinates.slice(i, i + 2);
            value.push(isGeography ? gmlSwapLatLong(pos) : pos);
        }
        return value;
    };

    var gmlReadODataPosValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML element describing a position or a set of coordinates in an OData spatial property value.</summary>
        /// <param name="property">DOM element for the GML element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array of doubles containing the coordinates.</returns>

        var value = [];
        var delims = " \t\r\n";
        var text = xmlInnerText(domElement);

        if (text) {
            var len = text.length;
            var start = 0;
            var end = 0;

            while (end <= len) {
                if (delims.indexOf(text.charAt(end)) !== -1) {
                    var coord = text.substring(start, end);
                    if (coord) {
                        value.push(parseFloat(coord));
                    }
                    start = end + 1;
                }
                end++;
            }
        }

        return isGeography ? gmlSwapLatLong(value) : value;
    };

    var gmlReadODataSpatialValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element a spatial value in an OData XML document.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each position coordinates in the resulting GeoJSON object.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate of the polygon.</returns>

        var localName = xmlLocalName(domElement);
        var reader;

        switch (localName) {
            case "Point":
                reader = gmlReadODataPoint;
                break;
            case "Polygon":
                reader = gmlReadODataPolygon;
                break;
            case "LineString":
                reader = gmlReadODataLineString;
                break;
            case "MultiPoint":
                reader = gmlReadODataMultiPoint;
                break;
            case "MultiCurve":
                reader = gmlReadODataMultiLineString;
                break;
            case "MultiSurface":
                reader = gmlReadODataMultiPolygon;
                break;
            case "MultiGeometry":
                reader = gmlReadODataCollection;
                break;
            default:
                throw { message: "Unsupported element: " + localName, element: domElement };
        }

        var value = reader(domElement, isGeography);
        // Read the CRS
        // WCF Data Services qualifies the srsName attribute withing the GML namespace; however
        // other end points might no do this as per the standard.

        var srsName = xmlAttributeValue(domElement, "srsName", gmlXmlNs) ||
                      xmlAttributeValue(domElement, "srsName");

        if (srsName) {
            if (srsName.indexOf(gmlSrsPrefix) !== 0) {
                throw { message: "Unsupported srs name: " + srsName, element: domElement };
            }

            var crsId = srsName.substring(gmlSrsPrefix.length);
            if (crsId) {
                value.crs = {
                    type: "name",
                    properties: {
                        name: "EPSG:" + crsId
                    }
                };
            }
        }
        return value;
    };

    var gmlNewODataSpatialValue = function (dom, value, type, isGeography) {
        /// <summary>Creates a new GML DOM element for the value of an OData spatial property or GeoJSON object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">Spatial property value in GeoJSON format.</param>
        /// <param name="type" type="String">String indicating the GeoJSON type of the value to serialize.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the spatial value. </returns>

        var gmlWriter;

        switch (type) {
            case GEOJSON_POINT:
                gmlWriter = gmlNewODataPoint;
                break;
            case GEOJSON_LINESTRING:
                gmlWriter = gmlNewODataLineString;
                break;
            case GEOJSON_POLYGON:
                gmlWriter = gmlNewODataPolygon;
                break;
            case GEOJSON_MULTIPOINT:
                gmlWriter = gmlNewODataMultiPoint;
                break;
            case GEOJSON_MULTILINESTRING:
                gmlWriter = gmlNewODataMultiLineString;
                break;
            case GEOJSON_MULTIPOLYGON:
                gmlWriter = gmlNewODataMultiPolygon;
                break;
            case GEOJSON_GEOMETRYCOLLECTION:
                gmlWriter = gmlNewODataGeometryCollection;
                break;
            default:
                djsassert(false, "gmlNewODataSpatialValue - Unknown GeoJSON type <" + type + ">!!");
                return null;
        }

        var gml = gmlWriter(dom, value, isGeography);

        // Set the srsName attribute if applicable.
        var crs = value.crs;
        if (crs) {
            if (crs.type === "name") {
                var properties = crs.properties;
                var name = properties && properties.name;
                if (name && name.indexOf("ESPG:") === 0 && name.length > 5) {
                    var crsId = name.substring(5);
                    var srsName = xmlNewAttribute(dom, null, "srsName", gmlPrefix + crsId);
                    xmlAppendChild(gml, srsName);
                }
            }
        }

        return gml;
    };

    var gmlNewODataElement = function (dom, name, children) {
        /// <summary>Creates a new DOM element in the GML namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the GML element to create.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <returns>New DOM element in the GML namespace.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>

        return xmlNewElement(dom, gmlXmlNs, xmlQualifiedName(gmlPrefix, name), children);
    };

    var gmlNewODataPosElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML pos DOM element.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="coordinates" type="Array">Array of doubles describing the coordinates of the pos element.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the coordinates use a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first coordinate is the Longitude and
        ///    will be serialized as the second component of the <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New pos DOM element in the GML namespace.</returns>

        var posValue = isArray(coordinates) ? coordinates : [];

        // If using a geographic reference system, then the first coordinate is the longitude and it has to
        // swapped with the latitude.
        posValue = isGeography ? gmlSwapLatLong(posValue) : posValue;

        return gmlNewODataElement(dom, "pos", posValue.join(" "));
    };

    var gmlNewODataLineElement = function (dom, name, coordinates, isGeography) {
        /// <summary>Creates a new GML DOM element representing a line.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Name of the element to create.</param>
        /// <param name="coordinates" type="Array">Array of array of doubles describing the coordinates of the line element.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the coordinates use a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var element = gmlNewODataElement(dom, name);
        if (isArray(coordinates)) {
            var i, len;
            for (i = 0, len = coordinates.length; i < len; i++) {
                xmlAppendChild(element, gmlNewODataPosElement(dom, coordinates[i], isGeography));
            }

            if (len === 0) {
                xmlAppendChild(element, gmlNewODataElement(dom, "posList"));
            }
        }
        return element;
    };

    var gmlNewODataPointElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML Point DOM element.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON Point object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON Point.</returns>

        return gmlNewODataElement(dom, "Point", gmlNewODataPosElement(dom, coordinates, isGeography));
    };

    var gmlNewODataLineStringElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML LineString DOM element.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="coordinates" type="Array">Array of array of doubles describing the coordinates of the line element.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON LineString.</returns>

        return gmlNewODataLineElement(dom, "LineString", coordinates, isGeography);
    };

    var gmlNewODataPolygonRingElement = function (dom, name, coordinates, isGeography) {
        /// <summary>Creates a new GML DOM element representing a polygon ring.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Name of the element to create.</param>
        /// <param name="coordinates" type="Array">Array of array of doubles describing the coordinates of the polygon ring.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the coordinates use a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var ringElement = gmlNewODataElement(dom, name);
        if (isArray(coordinates) && coordinates.length > 0) {
            var linearRing = gmlNewODataLineElement(dom, "LinearRing", coordinates, isGeography);
            xmlAppendChild(ringElement, linearRing);
        }
        return ringElement;
    };

    var gmlNewODataPolygonElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML Polygon DOM element for a GeoJSON Polygon object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="coordinates" type="Array">Array of array of array of doubles describing the coordinates of the polygon.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var len = coordinates && coordinates.length;
        var element = gmlNewODataElement(dom, "Polygon");

        if (isArray(coordinates) && len > 0) {
            xmlAppendChild(element, gmlNewODataPolygonRingElement(dom, "exterior", coordinates[0], isGeography));

            var i;
            for (i = 1; i < len; i++) {
                xmlAppendChild(element, gmlNewODataPolygonRingElement(dom, "interior", coordinates[i], isGeography));
            }
        }
        return element;
    };

    var gmlNewODataPoint = function (dom, value, isGeography) {
        /// <summary>Creates a new GML Point DOM element for a GeoJSON Point object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON Point object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON Point.</returns>

        return gmlNewODataPointElement(dom, value.coordinates, isGeography);
    };

    var gmlNewODataLineString = function (dom, value, isGeography) {
        /// <summary>Creates a new GML LineString DOM element for a GeoJSON LineString object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON LineString object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON LineString.</returns>

        return gmlNewODataLineStringElement(dom, value.coordinates, isGeography);
    };

    var gmlNewODataPolygon = function (dom, value, isGeography) {
        /// <summary>Creates a new GML Polygon DOM element for a GeoJSON Polygon object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON Polygon object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON Polygon.</returns>

        return gmlNewODataPolygonElement(dom, value.coordinates, isGeography);
    };

    var gmlNewODataMultiItem = function (dom, name, members, items, itemWriter, isGeography) {
        /// <summary>Creates a new GML DOM element for a composite structure like a multi-point or a multi-geometry.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Name of the element to create.</param>
        /// <param name="items" type="Array">Array of items in the composite structure.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the multi-item uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each of the items is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var len = items && items.length;
        var element = gmlNewODataElement(dom, name);

        if (isArray(items) && len > 0) {
            var membersElement = gmlNewODataElement(dom, members);
            var i;
            for (i = 0; i < len; i++) {
                xmlAppendChild(membersElement, itemWriter(dom, items[i], isGeography));
            }
            xmlAppendChild(element, membersElement);
        }
        return element;
    };

    var gmlNewODataMultiPoint = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiPoint DOM element for a GeoJSON MultiPoint object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON MultiPoint object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON MultiPoint.</returns>

        return gmlNewODataMultiItem(dom, "MultiPoint", "pointMembers", value.coordinates, gmlNewODataPointElement, isGeography);
    };

    var gmlNewODataMultiLineString = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiCurve DOM element for a GeoJSON MultiLineString object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON MultiLineString object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON MultiLineString.</returns>

        return gmlNewODataMultiItem(dom, "MultiCurve", "curveMembers", value.coordinates, gmlNewODataLineStringElement, isGeography);
    };

    var gmlNewODataMultiPolygon = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiSurface DOM element for a GeoJSON MultiPolygon object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON MultiPolygon object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON MultiPolygon.</returns>

        return gmlNewODataMultiItem(dom, "MultiSurface", "surfaceMembers", value.coordinates, gmlNewODataPolygonElement, isGeography);
    };

    var gmlNewODataGeometryCollectionItem = function (dom, value, isGeography) {
        /// <summary>Creates a new GML element for an item in a geometry collection object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="item" type="Object">GeoJSON object in the geometry collection.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        return gmlNewODataSpatialValue(dom, value, value.type, isGeography);
    };

    var gmlNewODataGeometryCollection = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiGeometry DOM element for a GeoJSON GeometryCollection object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON GeometryCollection object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON GeometryCollection.</returns>

        return gmlNewODataMultiItem(dom, "MultiGeometry", "geometryMembers", value.geometries, gmlNewODataGeometryCollectionItem, isGeography);
    };

    // DATAJS INTERNAL START
    odata.gmlNewODataSpatialValue = gmlNewODataSpatialValue;
    odata.gmlReadODataSpatialValue = gmlReadODataSpatialValue;
    odata.gmlXmlNs = gmlXmlNs;
    // DATAJS INTERNAL END

    // CONTENT END
})(this);