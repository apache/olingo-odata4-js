/* {
    oldname:'odata-utils.js',
    updated:'20140514 12:59'
}*/
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

// odata-utils.js
var utils    = require('./../datajs.js').utils;

// Imports
var assigned = utils.assigned;
var contains = utils.contains;
var find = utils.find;
var isArray = utils.isArray;
var isDate = utils.isDate;
var isObject = utils.isObject;
var parseInt10 = utils.parseInt10;

// CONTENT START

var dataItemTypeName = function (value, metadata) {
    /// <summary>Gets the type name of a data item value that belongs to a feed, an entry, a complex type property, or a collection property.</summary>
    /// <param name="value">Value of the data item from which the type name is going to be retrieved.</param>
    /// <param name="metadata" type="object" optional="true">Object containing metadata about the data tiem.</param>
    /// <remarks>
    ///    This function will first try to get the type name from the data item's value itself if it is an object with a __metadata property; otherwise
    ///    it will try to recover it from the metadata.  If both attempts fail, it will return null.
    /// </remarks>
    /// <returns type="String">Data item type name; null if the type name cannot be found within the value or the metadata</returns>

    var valueTypeName = ((value && value.__metadata) || {}).type;
    return valueTypeName || (metadata ? metadata.type : null);
};

var EDM = "Edm.";
var EDM_BINARY = EDM + "Binary";
var EDM_BOOLEAN = EDM + "Boolean";
var EDM_BYTE = EDM + "Byte";
var EDM_DATETIME = EDM + "DateTime";
var EDM_DATETIMEOFFSET = EDM + "DateTimeOffset";
var EDM_DECIMAL = EDM + "Decimal";
var EDM_DOUBLE = EDM + "Double";
var EDM_GUID = EDM + "Guid";
var EDM_INT16 = EDM + "Int16";
var EDM_INT32 = EDM + "Int32";
var EDM_INT64 = EDM + "Int64";
var EDM_SBYTE = EDM + "SByte";
var EDM_SINGLE = EDM + "Single";
var EDM_STRING = EDM + "String";
var EDM_TIME = EDM + "Time";

var EDM_GEOGRAPHY = EDM + "Geography";
var EDM_GEOGRAPHY_POINT = EDM_GEOGRAPHY + "Point";
var EDM_GEOGRAPHY_LINESTRING = EDM_GEOGRAPHY + "LineString";
var EDM_GEOGRAPHY_POLYGON = EDM_GEOGRAPHY + "Polygon";
var EDM_GEOGRAPHY_COLLECTION = EDM_GEOGRAPHY + "Collection";
var EDM_GEOGRAPHY_MULTIPOLYGON = EDM_GEOGRAPHY + "MultiPolygon";
var EDM_GEOGRAPHY_MULTILINESTRING = EDM_GEOGRAPHY + "MultiLineString";
var EDM_GEOGRAPHY_MULTIPOINT = EDM_GEOGRAPHY + "MultiPoint";

var EDM_GEOMETRY = EDM + "Geometry";
var EDM_GEOMETRY_POINT = EDM_GEOMETRY + "Point";
var EDM_GEOMETRY_LINESTRING = EDM_GEOMETRY + "LineString";
var EDM_GEOMETRY_POLYGON = EDM_GEOMETRY + "Polygon";
var EDM_GEOMETRY_COLLECTION = EDM_GEOMETRY + "Collection";
var EDM_GEOMETRY_MULTIPOLYGON = EDM_GEOMETRY + "MultiPolygon";
var EDM_GEOMETRY_MULTILINESTRING = EDM_GEOMETRY + "MultiLineString";
var EDM_GEOMETRY_MULTIPOINT = EDM_GEOMETRY + "MultiPoint";

var GEOJSON_POINT = "Point";
var GEOJSON_LINESTRING = "LineString";
var GEOJSON_POLYGON = "Polygon";
var GEOJSON_MULTIPOINT = "MultiPoint";
var GEOJSON_MULTILINESTRING = "MultiLineString";
var GEOJSON_MULTIPOLYGON = "MultiPolygon";
var GEOJSON_GEOMETRYCOLLECTION = "GeometryCollection";

var primitiveEdmTypes = [
    EDM_STRING,
    EDM_INT32,
    EDM_INT64,
    EDM_BOOLEAN,
    EDM_DOUBLE,
    EDM_SINGLE,
    EDM_DATETIME,
    EDM_DATETIMEOFFSET,
    EDM_TIME,
    EDM_DECIMAL,
    EDM_GUID,
    EDM_BYTE,
    EDM_INT16,
    EDM_SBYTE,
    EDM_BINARY
];

var geometryEdmTypes = [
    EDM_GEOMETRY,
    EDM_GEOMETRY_POINT,
    EDM_GEOMETRY_LINESTRING,
    EDM_GEOMETRY_POLYGON,
    EDM_GEOMETRY_COLLECTION,
    EDM_GEOMETRY_MULTIPOLYGON,
    EDM_GEOMETRY_MULTILINESTRING,
    EDM_GEOMETRY_MULTIPOINT
];

var geographyEdmTypes = [
    EDM_GEOGRAPHY,
    EDM_GEOGRAPHY_POINT,
    EDM_GEOGRAPHY_LINESTRING,
    EDM_GEOGRAPHY_POLYGON,
    EDM_GEOGRAPHY_COLLECTION,
    EDM_GEOGRAPHY_MULTIPOLYGON,
    EDM_GEOGRAPHY_MULTILINESTRING,
    EDM_GEOGRAPHY_MULTIPOINT
];

var forEachSchema = function (metadata, callback) {
    /// <summary>Invokes a function once per schema in metadata.</summary>
    /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
    /// <param name="callback" type="Function">Callback function to invoke once per schema.</param>
    /// <returns>
    /// The first truthy value to be returned from the callback; null or the last falsy value otherwise.
    /// </returns>

    if (!metadata) {
        return null;
    }

    if (isArray(metadata)) {
        var i, len, result;
        for (i = 0, len = metadata.length; i < len; i++) {
            result = forEachSchema(metadata[i], callback);
            if (result) {
                return result;
            }
        }

        return null;
    } else {
        if (metadata.dataServices) {
            return forEachSchema(metadata.dataServices.schema, callback);
        }

        return callback(metadata);
    }
};

var formatMilliseconds = function (ms, ns) {
    /// <summary>Formats a millisecond and a nanosecond value into a single string.</summary>
    /// <param name="ms" type="Number" mayBeNull="false">Number of milliseconds to format.</param>
    /// <param name="ns" type="Number" mayBeNull="false">Number of nanoseconds to format.</param>
    /// <returns type="String">Formatted text.</returns>
    /// <remarks>If the value is already as string it's returned as-is.</remarks>

    // Avoid generating milliseconds if not necessary.
    if (ms === 0) {
        ms = "";
    } else {
        ms = "." + formatNumberWidth(ms.toString(), 3);
    }
    if (ns > 0) {
        if (ms === "") {
            ms = ".000";
        }
        ms += formatNumberWidth(ns.toString(), 4);
    }
    return ms;
};

var formatDateTimeOffset = function (value) {
    /// <summary>Formats a DateTime or DateTimeOffset value a string.</summary>
    /// <param name="value" type="Date" mayBeNull="false">Value to format.</param>
    /// <returns type="String">Formatted text.</returns>
    /// <remarks>If the value is already as string it's returned as-is.</remarks>

    if (typeof value === "string") {
        return value;
    }

    var hasOffset = isDateTimeOffset(value);
    var offset = getCanonicalTimezone(value.__offset);
    if (hasOffset && offset !== "Z") {
        // We're about to change the value, so make a copy.
        value = new Date(value.valueOf());

        var timezone = parseTimezone(offset);
        var hours = value.getUTCHours() + (timezone.d * timezone.h);
        var minutes = value.getUTCMinutes() + (timezone.d * timezone.m);

        value.setUTCHours(hours, minutes);
    } else if (!hasOffset) {
        // Don't suffix a 'Z' for Edm.DateTime values.
        offset = "";
    }

    var year = value.getUTCFullYear();
    var month = value.getUTCMonth() + 1;
    var sign = "";
    if (year <= 0) {
        year = -(year - 1);
        sign = "-";
    }

    var ms = formatMilliseconds(value.getUTCMilliseconds(), value.__ns);

    return sign +
        formatNumberWidth(year, 4) + "-" +
        formatNumberWidth(month, 2) + "-" +
        formatNumberWidth(value.getUTCDate(), 2) + "T" +
        formatNumberWidth(value.getUTCHours(), 2) + ":" +
        formatNumberWidth(value.getUTCMinutes(), 2) + ":" +
        formatNumberWidth(value.getUTCSeconds(), 2) +
        ms + offset;
};

var formatDuration = function (value) {
    /// <summary>Converts a duration to a string in xsd:duration format.</summary>
    /// <param name="value" type="Object">Object with ms and __edmType properties.</param>
    /// <returns type="String">String representation of the time object in xsd:duration format.</returns>

    var ms = value.ms;

    var sign = "";
    if (ms < 0) {
        sign = "-";
        ms = -ms;
    }

    var days = Math.floor(ms / 86400000);
    ms -= 86400000 * days;
    var hours = Math.floor(ms / 3600000);
    ms -= 3600000 * hours;
    var minutes = Math.floor(ms / 60000);
    ms -= 60000 * minutes;
    var seconds = Math.floor(ms / 1000);
    ms -= seconds * 1000;

    return sign + "P" +
           formatNumberWidth(days, 2) + "DT" +
           formatNumberWidth(hours, 2) + "H" +
           formatNumberWidth(minutes, 2) + "M" +
           formatNumberWidth(seconds, 2) +
           formatMilliseconds(ms, value.ns) + "S";
};

var formatNumberWidth = function (value, width, append) {
    /// <summary>Formats the specified value to the given width.</summary>
    /// <param name="value" type="Number">Number to format (non-negative).</param>
    /// <param name="width" type="Number">Minimum width for number.</param>
    /// <param name="append" type="Boolean">Flag indicating if the value is padded at the beginning (false) or at the end (true).</param>
    /// <returns type="String">Text representation.</returns>
    var result = value.toString(10);
    while (result.length < width) {
        if (append) {
            result += "0";
        } else {
            result = "0" + result;
        }
    }

    return result;
};

var getCanonicalTimezone = function (timezone) {
    /// <summary>Gets the canonical timezone representation.</summary>
    /// <param name="timezone" type="String">Timezone representation.</param>
    /// <returns type="String">An 'Z' string if the timezone is absent or 0; the timezone otherwise.</returns>

    return (!timezone || timezone === "Z" || timezone === "+00:00" || timezone === "-00:00") ? "Z" : timezone;
};

var getCollectionType = function (typeName) {
    /// <summary>Gets the type of a collection type name.</summary>
    /// <param name="typeName" type="String">Type name of the collection.</param>
    /// <returns type="String">Type of the collection; null if the type name is not a collection type.</returns>

    if (typeof typeName === "string") {
        var end = typeName.indexOf(")", 10);
        if (typeName.indexOf("Collection(") === 0 && end > 0) {
            return typeName.substring(11, end);
        }
    }
    return null;
};

var invokeRequest = function (request, success, error, handler, httpClient, context) {
    /// <summary>Sends a request containing OData payload to a server.</summary>
    /// <param name="request">Object that represents the request to be sent..</param>
    /// <param name="success">Callback for a successful read operation.</param>
    /// <param name="error">Callback for handling errors.</param>
    /// <param name="handler">Handler for data serialization.</param>
    /// <param name="httpClient">HTTP client layer.</param>
    /// <param name="context">Context used for processing the request</param>

    return httpClient.request(request, function (response) {
        try {
            if (response.headers) {
                normalizeHeaders(response.headers);
            }

            if (response.data === undefined && response.statusCode !== 204) {
                handler.read(response, context);
            }
        } catch (err) {
            if (err.request === undefined) {
                err.request = request;
            }
            if (err.response === undefined) {
                err.response = response;
            }
            error(err);
            return;
        }

        success(response.data, response);
    }, error);
};

var isBatch = function (value) {
    /// <summary>Tests whether a value is a batch object in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <returns type="Boolean">True is the value is a batch object; false otherwise.</returns>

    return isComplex(value) && isArray(value.__batchRequests);
};

// Regular expression used for testing and parsing for a collection type.
var collectionTypeRE = /Collection\((.*)\)/;

var isCollection = function (value, typeName) {
    /// <summary>Tests whether a value is a collection value in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <param name="typeName" type="Sting">Type name of the value. This is used to disambiguate from a collection property value.</param>
    /// <returns type="Boolean">True is the value is a feed value; false otherwise.</returns>

    var colData = value && value.results || value;
    return !!colData &&
        (isCollectionType(typeName)) ||
        (!typeName && isArray(colData) && !isComplex(colData[0]));
};

var isCollectionType = function (typeName) {
    /// <summary>Checks whether the specified type name is a collection type.</summary>
    /// <param name="typeName" type="String">Name of type to check.</param>
    /// <returns type="Boolean">True if the type is the name of a collection type; false otherwise.</returns>
    return collectionTypeRE.test(typeName);
};

var isComplex = function (value) {
    /// <summary>Tests whether a value is a complex type value in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <returns type="Boolean">True is the value is a complex type value; false otherwise.</returns>

    return !!value &&
        isObject(value) &&
        !isArray(value) &&
        !isDate(value);
};

var isDateTimeOffset = function (value) {
    /// <summary>Checks whether a Date object is DateTimeOffset value</summary>
    /// <param name="value" type="Date" mayBeNull="false">Value to check.</param>
    /// <returns type="Boolean">true if the value is a DateTimeOffset, false otherwise.</returns>
    return (value.__edmType === "Edm.DateTimeOffset" || (!value.__edmType && value.__offset));
};

var isDeferred = function (value) {
    /// <summary>Tests whether a value is a deferred navigation property in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <returns type="Boolean">True is the value is a deferred navigation property; false otherwise.</returns>

    if (!value && !isComplex(value)) {
        return false;
    }
    var metadata = value.__metadata || {};
    var deferred = value.__deferred || {};
    return !metadata.type && !!deferred.uri;
};

var isEntry = function (value) {
    /// <summary>Tests whether a value is an entry object in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <returns type="Boolean">True is the value is an entry object; false otherwise.</returns>

    return isComplex(value) && value.__metadata && "uri" in value.__metadata;
};

var isFeed = function (value, typeName) {
    /// <summary>Tests whether a value is a feed value in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <param name="typeName" type="Sting">Type name of the value. This is used to disambiguate from a collection property value.</param>
    /// <returns type="Boolean">True is the value is a feed value; false otherwise.</returns>

    var feedData = value && value.results || value;
    return isArray(feedData) && (
        (!isCollectionType(typeName)) &&
        (isComplex(feedData[0]))
    );
};

var isGeographyEdmType = function (typeName) {
    /// <summary>Checks whether the specified type name is a geography EDM type.</summary>
    /// <param name="typeName" type="String">Name of type to check.</param>
    /// <returns type="Boolean">True if the type is a geography EDM type; false otherwise.</returns>

    return contains(geographyEdmTypes, typeName);
};

var isGeometryEdmType = function (typeName) {
    /// <summary>Checks whether the specified type name is a geometry EDM type.</summary>
    /// <param name="typeName" type="String">Name of type to check.</param>
    /// <returns type="Boolean">True if the type is a geometry EDM type; false otherwise.</returns>

    return contains(geometryEdmTypes, typeName);
};

var isNamedStream = function (value) {
    /// <summary>Tests whether a value is a named stream value in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <returns type="Boolean">True is the value is a named stream; false otherwise.</returns>

    if (!value && !isComplex(value)) {
        return false;
    }
    var metadata = value.__metadata;
    var mediaResource = value.__mediaresource;
    return !metadata && !!mediaResource && !!mediaResource.media_src;
};

var isPrimitive = function (value) {
    /// <summary>Tests whether a value is a primitive type value in the library's internal representation.</summary>
    /// <param name="value">Value to test.</param>
    /// <remarks>
    ///    Date objects are considered primitive types by the library.
    /// </remarks>
    /// <returns type="Boolean">True is the value is a primitive type value.</returns>

    return isDate(value) ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean";
};

var isPrimitiveEdmType = function (typeName) {
    /// <summary>Checks whether the specified type name is a primitive EDM type.</summary>
    /// <param name="typeName" type="String">Name of type to check.</param>
    /// <returns type="Boolean">True if the type is a primitive EDM type; false otherwise.</returns>

    return contains(primitiveEdmTypes, typeName);
};

var navigationPropertyKind = function (value, propertyModel) {
    /// <summary>Gets the kind of a navigation property value.</summary>
    /// <param name="value">Value of the navigation property.</param>
    /// <param name="propertyModel" type="Object" optional="true">
    ///     Object that describes the navigation property in an OData conceptual schema.
    /// </param>
    /// <remarks>
    ///     The returned string is as follows
    /// </remarks>
    /// <returns type="String">String value describing the kind of the navigation property; null if the kind cannot be determined.</returns>

    if (isDeferred(value)) {
        return "deferred";
    }
    if (isEntry(value)) {
        return "entry";
    }
    if (isFeed(value)) {
        return "feed";
    }
    if (propertyModel && propertyModel.relationship) {
        if (value === null || value === undefined || !isFeed(value)) {
            return "entry";
        }
        return "feed";
    }
    return null;
};

var lookupProperty = function (properties, name) {
    /// <summary>Looks up a property by name.</summary>
    /// <param name="properties" type="Array" mayBeNull="true">Array of property objects as per EDM metadata.</param>
    /// <param name="name" type="String">Name to look for.</param>
    /// <returns type="Object">The property object; null if not found.</returns>

    return find(properties, function (property) {
        return property.name === name;
    });
};

var lookupInMetadata = function (name, metadata, kind) {
    /// <summary>Looks up a type object by name.</summary>
    /// <param name="name" type="String">Name, possibly null or empty.</param>
    /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
    /// <param name="kind" type="String">Kind of object to look for as per EDM metadata.</param>
    /// <returns>An type description if the name is found; null otherwise.</returns>

    return (name) ? forEachSchema(metadata, function (schema) {
        return lookupInSchema(name, schema, kind);
    }) : null;
};

var lookupEntitySet = function (entitySets, name) {
    /// <summary>Looks up a entity set by name.</summary>
    /// <param name="properties" type="Array" mayBeNull="true">Array of entity set objects as per EDM metadata.</param>
    /// <param name="name" type="String">Name to look for.</param>
    /// <returns type="Object">The entity set object; null if not found.</returns>

    return find(entitySets, function (entitySet) {
        return entitySet.name === name;
    });
};

var lookupComplexType = function (name, metadata) {
    /// <summary>Looks up a complex type object by name.</summary>
    /// <param name="name" type="String">Name, possibly null or empty.</param>
    /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
    /// <returns>A complex type description if the name is found; null otherwise.</returns>

    return lookupInMetadata(name, metadata, "complexType");
};

var lookupEntityType = function (name, metadata) {
    /// <summary>Looks up an entity type object by name.</summary>
    /// <param name="name" type="String">Name, possibly null or empty.</param>
    /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
    /// <returns>An entity type description if the name is found; null otherwise.</returns>

    return lookupInMetadata(name, metadata, "entityType");
};

var lookupDefaultEntityContainer = function (metadata) {
    /// <summary>Looks up an</summary>
    /// <param name="name" type="String">Name, possibly null or empty.</param>
    /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
    /// <returns>An entity container description if the name is found; null otherwise.</returns>

    return forEachSchema(metadata, function (schema) {
        return find(schema.entityContainer, function (container) {
            return parseBool(container.isDefaultEntityContainer);
        });
    });
};

var lookupEntityContainer = function (name, metadata) {
    /// <summary>Looks up an entity container object by name.</summary>
    /// <param name="name" type="String">Name, possibly null or empty.</param>
    /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
    /// <returns>An entity container description if the name is found; null otherwise.</returns>

    return lookupInMetadata(name, metadata, "entityContainer");
};

var lookupFunctionImport = function (functionImports, name) {
    /// <summary>Looks up a function import by name.</summary>
    /// <param name="properties" type="Array" mayBeNull="true">Array of function import objects as per EDM metadata.</param>
    /// <param name="name" type="String">Name to look for.</param>
    /// <returns type="Object">The entity set object; null if not found.</returns>

    return find(functionImports, function (functionImport) {
        return functionImport.name === name;
    });
};

var lookupNavigationPropertyType = function (navigationProperty, metadata) {
    /// <summary>Looks up the target entity type for a navigation property.</summary>
    /// <param name="navigationProperty" type="Object"></param>
    /// <param name="metadata" type="Object"></param>
    /// <returns type="String">The entity type name for the specified property, null if not found.</returns>

    var result = null;
    if (navigationProperty) {
        var rel = navigationProperty.relationship;
        var association = forEachSchema(metadata, function (schema) {
            // The name should be the namespace qualified name in 'ns'.'type' format.
            var nameOnly = removeNamespace(schema["namespace"], rel);
            var associations = schema.association;
            if (nameOnly && associations) {
                var i, len;
                for (i = 0, len = associations.length; i < len; i++) {
                    if (associations[i].name === nameOnly) {
                        return associations[i];
                    }
                }
            }
            return null;
        });

        if (association) {
            var end = association.end[0];
            if (end.role !== navigationProperty.toRole) {
                end = association.end[1];
                // For metadata to be valid, end.role === navigationProperty.toRole now.
            }
            result = end.type;
        }
    }
    return result;
};

var lookupNavigationPropertyEntitySet = function (navigationProperty, sourceEntitySetName, metadata) {
    /// <summary>Looks up the target entityset name for a navigation property.</summary>
    /// <param name="navigationProperty" type="Object"></param>
    /// <param name="metadata" type="Object"></param>
    /// <returns type="String">The entityset name for the specified property, null if not found.</returns>

    if (navigationProperty) {
        var rel = navigationProperty.relationship;
        var associationSet = forEachSchema(metadata, function (schema) {
            var containers = schema.entityContainer;
            for (var i = 0; i < containers.length; i++) {
                var associationSets = containers[i].associationSet;
                if (associationSets) {
                    for (var j = 0; j < associationSets.length; j++) {
                        if (associationSets[j].association == rel) {
                            return associationSets[j];
                        }
                    }
                }
            }
            return null;
        });
        if (associationSet && associationSet.end[0] && associationSet.end[1]) {
            return (associationSet.end[0].entitySet == sourceEntitySetName) ? associationSet.end[1].entitySet : associationSet.end[0].entitySet;
        }
    }
    return null;
};

var getEntitySetInfo = function (entitySetName, metadata) {
    /// <summary>Gets the entitySet info, container name and functionImports for an entitySet</summary>
    /// <param name="navigationProperty" type="Object"></param>
    /// <param name="metadata" type="Object"></param>
    /// <returns type="Object">The info about the entitySet.</returns>

    var info = forEachSchema(metadata, function (schema) {
        var containers = schema.entityContainer;
        for (var i = 0; i < containers.length; i++) {
            var entitySets = containers[i].entitySet;
            if (entitySets) {
                for (var j = 0; j < entitySets.length; j++) {
                    if (entitySets[j].name == entitySetName) {
                        return { entitySet: entitySets[j], containerName: containers[i].name, functionImport: containers[i].functionImport };
                    }
                }
            }
        }
        return null;
    });

    return info;
};

var removeNamespace = function (ns, fullName) {
    /// <summary>Given an expected namespace prefix, removes it from a full name.</summary>
    /// <param name="ns" type="String">Expected namespace.</param>
    /// <param name="fullName" type="String">Full name in 'ns'.'name' form.</param>
    /// <returns type="String">The local name, null if it isn't found in the expected namespace.</returns>

    if (fullName.indexOf(ns) === 0 && fullName.charAt(ns.length) === ".") {
        return fullName.substr(ns.length + 1);
    }

    return null;
};

var lookupInSchema = function (name, schema, kind) {
    /// <summary>Looks up a schema object by name.</summary>
    /// <param name="name" type="String">Name (assigned).</param>
    /// <param name="schema">Schema object as per EDM metadata.</param>
    /// <param name="kind" type="String">Kind of object to look for as per EDM metadata.</param>
    /// <returns>An entity type description if the name is found; null otherwise.</returns>

    if (name && schema) {
        // The name should be the namespace qualified name in 'ns'.'type' format.
        var nameOnly = removeNamespace(schema["namespace"], name);
        if (nameOnly) {
            return find(schema[kind], function (item) {
                return item.name === nameOnly;
            });
        }
    }
    return null;
};

var maxVersion = function (left, right) {
    /// <summary>Compares to version strings and returns the higher one.</summary>
    /// <param name="left" type="String">Version string in the form "major.minor.rev"</param>
    /// <param name="right" type="String">Version string in the form "major.minor.rev"</param>
    /// <returns type="String">The higher version string.</returns>

    if (left === right) {
        return left;
    }

    var leftParts = left.split(".");
    var rightParts = right.split(".");

    var len = (leftParts.length >= rightParts.length) ?
        leftParts.length :
        rightParts.length;

    for (var i = 0; i < len; i++) {
        var leftVersion = leftParts[i] && parseInt10(leftParts[i]);
        var rightVersion = rightParts[i] && parseInt10(rightParts[i]);
        if (leftVersion > rightVersion) {
            return left;
        }
        if (leftVersion < rightVersion) {
            return right;
        }
    }
};

var normalHeaders = {
    // Headers shared by request and response
    "content-type": "Content-Type",
    "content-encoding": "Content-Encoding",
    "content-length": "Content-Length",
    "odata-version": "OData-Version",
    
    // Headers used by request
    "accept": "Accept",
    "accept-charset": "Accept-Charset",
    "if-match": "If-Match",
    "if-none-match": "If-None-Match",
    "odata-isolation": "OData-Isolation",
    "odata-maxversion": "OData-MaxVersion",
    "prefer": "Prefer",
    
    // Headers used by response
    "etag": "ETag",
    "location": "Location",
    "odata-entityid": "OData-EntityId",
    "preference-applied": "Preference-Applied",
    "retry-after": "Retry-After"
};

var normalizeHeaders = function (headers) {
    /// <summary>Normalizes headers so they can be found with consistent casing.</summary>
    /// <param name="headers" type="Object">Dictionary of name/value pairs.</param>

    for (var name in headers) {
        var lowerName = name.toLowerCase();
        var normalName = normalHeaders[lowerName];
        if (normalName && name !== normalName) {
            var val = headers[name];
            delete headers[name];
            headers[normalName] = val;
        }
    }
};

var parseBool = function (propertyValue) {
    /// <summary>Parses a string into a boolean value.</summary>
    /// <param name="propertyValue">Value to parse.</param>
    /// <returns type="Boolean">true if the property value is 'true'; false otherwise.</returns>

    if (typeof propertyValue === "boolean") {
        return propertyValue;
    }

    return typeof propertyValue === "string" && propertyValue.toLowerCase() === "true";
};


// The captured indices for this expression are:
// 0     - complete input
// 1,2,3 - year with optional minus sign, month, day
// 4,5,6 - hours, minutes, seconds
// 7     - optional milliseconds
// 8     - everything else (presumably offset information)
var parseDateTimeRE = /^(-?\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?(.*)$/;

var parseDateTimeMaybeOffset = function (value, withOffset, nullOnError) {
    /// <summary>Parses a string into a DateTime value.</summary>
    /// <param name="value" type="String">Value to parse.</param>
    /// <param name="withOffset" type="Boolean">Whether offset is expected.</param>
    /// <returns type="Date">The parsed value.</returns>

    // We cannot parse this in cases of failure to match or if offset information is specified.
    var parts = parseDateTimeRE.exec(value);
    var offset = (parts) ? getCanonicalTimezone(parts[8]) : null;

    if (!parts || (!withOffset && offset !== "Z")) {
        if (nullOnError) {
            return null;
        }
        throw { message: "Invalid date/time value" };
    }

    // Pre-parse years, account for year '0' being invalid in dateTime.
    var year = parseInt10(parts[1]);
    if (year <= 0) {
        year++;
    }

    // Pre-parse optional milliseconds, fill in default. Fail if value is too precise.
    var ms = parts[7];
    var ns = 0;
    if (!ms) {
        ms = 0;
    } else {
        if (ms.length > 7) {
            if (nullOnError) {
                return null;
            }
            throw { message: "Cannot parse date/time value to given precision." };
        }

        ns = formatNumberWidth(ms.substring(3), 4, true);
        ms = formatNumberWidth(ms.substring(0, 3), 3, true);

        ms = parseInt10(ms);
        ns = parseInt10(ns);
    }

    // Pre-parse other time components and offset them if necessary.
    var hours = parseInt10(parts[4]);
    var minutes = parseInt10(parts[5]);
    var seconds = parseInt10(parts[6]) || 0;
    if (offset !== "Z") {
        // The offset is reversed to get back the UTC date, which is
        // what the API will eventually have.
        var timezone = parseTimezone(offset);
        var direction = -(timezone.d);
        hours += timezone.h * direction;
        minutes += timezone.m * direction;
    }

    // Set the date and time separately with setFullYear, so years 0-99 aren't biased like in Date.UTC.
    var result = new Date();
    result.setUTCFullYear(
        year,                       // Year.
        parseInt10(parts[2]) - 1,   // Month (zero-based for Date.UTC and setFullYear).
        parseInt10(parts[3])        // Date.
        );
    result.setUTCHours(hours, minutes, seconds, ms);

    if (isNaN(result.valueOf())) {
        if (nullOnError) {
            return null;
        }
        throw { message: "Invalid date/time value" };
    }

    if (withOffset) {
        result.__edmType = "Edm.DateTimeOffset";
        result.__offset = offset;
    }

    if (ns) {
        result.__ns = ns;
    }

    return result;
};

var parseDateTime = function (propertyValue, nullOnError) {
    /// <summary>Parses a string into a DateTime value.</summary>
    /// <param name="propertyValue" type="String">Value to parse.</param>
    /// <returns type="Date">The parsed value.</returns>

    return parseDateTimeMaybeOffset(propertyValue, false, nullOnError);
};

var parseDateTimeOffset = function (propertyValue, nullOnError) {
    /// <summary>Parses a string into a DateTimeOffset value.</summary>
    /// <param name="propertyValue" type="String">Value to parse.</param>
    /// <returns type="Date">The parsed value.</returns>
    /// <remarks>
    /// The resulting object is annotated with an __edmType property and
    /// an __offset property reflecting the original intended offset of
    /// the value. The time is adjusted for UTC time, as the current
    /// timezone-aware Date APIs will only work with the local timezone.
    /// </remarks>

    return parseDateTimeMaybeOffset(propertyValue, true, nullOnError);
};

// The captured indices for this expression are:
// 0       - complete input
// 1       - direction
// 2,3,4   - years, months, days
// 5,6,7,8 - hours, minutes, seconds, miliseconds

var parseTimeRE = /^([+-])?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?)?/;

var isEdmDurationValue = function(value) {
    parseTimeRE.test(value);
};

var parseDuration = function (duration) {
    /// <summary>Parses a string in xsd:duration format.</summary>
    /// <param name="duration" type="String">Duration value.</param>
    /// <remarks>
    /// This method will throw an exception if the input string has a year or a month component.
    /// </remarks>
    /// <returns type="Object">Object representing the time</returns>

    var parts = parseTimeRE.exec(duration);

    if (parts === null) {
        throw { message: "Invalid duration value." };
    }

    var years = parts[2] || "0";
    var months = parts[3] || "0";
    var days = parseInt10(parts[4] || 0);
    var hours = parseInt10(parts[5] || 0);
    var minutes = parseInt10(parts[6] || 0);
    var seconds = parseFloat(parts[7] || 0);

    if (years !== "0" || months !== "0") {
        throw { message: "Unsupported duration value." };
    }

    var ms = parts[8];
    var ns = 0;
    if (!ms) {
        ms = 0;
    } else {
        if (ms.length > 7) {
            throw { message: "Cannot parse duration value to given precision." };
        }

        ns = formatNumberWidth(ms.substring(3), 4, true);
        ms = formatNumberWidth(ms.substring(0, 3), 3, true);

        ms = parseInt10(ms);
        ns = parseInt10(ns);
    }

    ms += seconds * 1000 + minutes * 60000 + hours * 3600000 + days * 86400000;

    if (parts[1] === "-") {
        ms = -ms;
    }

    var result = { ms: ms, __edmType: "Edm.Time" };

    if (ns) {
        result.ns = ns;
    }
    return result;
};

var parseTimezone = function (timezone) {
    /// <summary>Parses a timezone description in (+|-)nn:nn format.</summary>
    /// <param name="timezone" type="String">Timezone offset.</param>
    /// <returns type="Object">
    /// An object with a (d)irection property of 1 for + and -1 for -,
    /// offset (h)ours and offset (m)inutes.
    /// </returns>

    var direction = timezone.substring(0, 1);
    direction = (direction === "+") ? 1 : -1;

    var offsetHours = parseInt10(timezone.substring(1));
    var offsetMinutes = parseInt10(timezone.substring(timezone.indexOf(":") + 1));
    return { d: direction, h: offsetHours, m: offsetMinutes };
};

var prepareRequest = function (request, handler, context) {
    /// <summary>Prepares a request object so that it can be sent through the network.</summary>
    /// <param name="request">Object that represents the request to be sent.</param>
    /// <param name="handler">Handler for data serialization</param>
    /// <param name="context">Context used for preparing the request</param>

    // Default to GET if no method has been specified.
    if (!request.method) {
        request.method = "GET";
    }

    if (!request.headers) {
        request.headers = {};
    } else {
        normalizeHeaders(request.headers);
    }

    if (request.headers.Accept === undefined) {
        request.headers.Accept = handler.accept;
    }

    if (assigned(request.data) && request.body === undefined) {
        handler.write(request, context);
    }

    if (!assigned(request.headers["OData-MaxVersion"])) {
        request.headers["OData-MaxVersion"] = handler.maxDataServiceVersion || "4.0";
    }
};

var traverseInternal = function (item, owner, callback) {
    /// <summary>Traverses a tree of objects invoking callback for every value.</summary>
    /// <param name="item" type="Object">Object or array to traverse.</param>
    /// <param name="callback" type="Function">
    /// Callback function with key and value, similar to JSON.parse reviver.
    /// </param>
    /// <returns type="Object">The object with traversed properties.</returns>
    /// <remarks>Unlike the JSON reviver, this won't delete null members.</remarks>

    if (item && typeof item === "object") {
        for (var name in item) {
            var value = item[name];
            var result = traverseInternal(value, name, callback);
            result = callback(name, result, owner);
            if (result !== value) {
                if (value === undefined) {
                    delete item[name];
                } else {
                    item[name] = result;
                }
            }
        }
    }

    return item;
};

var traverse = function (item, callback) {
    /// <summary>Traverses a tree of objects invoking callback for every value.</summary>
    /// <param name="item" type="Object">Object or array to traverse.</param>
    /// <param name="callback" type="Function">
    /// Callback function with key and value, similar to JSON.parse reviver.
    /// </param>
    /// <returns type="Object">The traversed object.</returns>
    /// <remarks>Unlike the JSON reviver, this won't delete null members.</remarks>

    return callback("", traverseInternal(item, "", callback));
};

// DATAJS INTERNAL START
exports.dataItemTypeName = dataItemTypeName;
exports.EDM_BINARY = EDM_BINARY;
exports.EDM_BOOLEAN = EDM_BOOLEAN;
exports.EDM_BYTE = EDM_BYTE;
exports.EDM_DATETIME = EDM_DATETIME;
exports.EDM_DATETIMEOFFSET = EDM_DATETIMEOFFSET;
exports.EDM_DECIMAL = EDM_DECIMAL;
exports.EDM_DOUBLE = EDM_DOUBLE;
exports.EDM_GEOGRAPHY = EDM_GEOGRAPHY;
exports.EDM_GEOGRAPHY_POINT = EDM_GEOGRAPHY_POINT;
exports.EDM_GEOGRAPHY_LINESTRING = EDM_GEOGRAPHY_LINESTRING;
exports.EDM_GEOGRAPHY_POLYGON = EDM_GEOGRAPHY_POLYGON;
exports.EDM_GEOGRAPHY_COLLECTION = EDM_GEOGRAPHY_COLLECTION;
exports.EDM_GEOGRAPHY_MULTIPOLYGON = EDM_GEOGRAPHY_MULTIPOLYGON;
exports.EDM_GEOGRAPHY_MULTILINESTRING = EDM_GEOGRAPHY_MULTILINESTRING;
exports.EDM_GEOGRAPHY_MULTIPOINT = EDM_GEOGRAPHY_MULTIPOINT;
exports.EDM_GEOMETRY = EDM_GEOMETRY;
exports.EDM_GEOMETRY_POINT = EDM_GEOMETRY_POINT;
exports.EDM_GEOMETRY_LINESTRING = EDM_GEOMETRY_LINESTRING;
exports.EDM_GEOMETRY_POLYGON = EDM_GEOMETRY_POLYGON;
exports.EDM_GEOMETRY_COLLECTION = EDM_GEOMETRY_COLLECTION;
exports.EDM_GEOMETRY_MULTIPOLYGON = EDM_GEOMETRY_MULTIPOLYGON;
exports.EDM_GEOMETRY_MULTILINESTRING = EDM_GEOMETRY_MULTILINESTRING;
exports.EDM_GEOMETRY_MULTIPOINT = EDM_GEOMETRY_MULTIPOINT;
exports.EDM_GUID = EDM_GUID;
exports.EDM_INT16 = EDM_INT16;
exports.EDM_INT32 = EDM_INT32;
exports.EDM_INT64 = EDM_INT64;
exports.EDM_SBYTE = EDM_SBYTE;
exports.EDM_SINGLE = EDM_SINGLE;
exports.EDM_STRING = EDM_STRING;
exports.EDM_TIME = EDM_TIME;
exports.GEOJSON_POINT = GEOJSON_POINT;
exports.GEOJSON_LINESTRING = GEOJSON_LINESTRING;
exports.GEOJSON_POLYGON = GEOJSON_POLYGON;
exports.GEOJSON_MULTIPOINT = GEOJSON_MULTIPOINT;
exports.GEOJSON_MULTILINESTRING = GEOJSON_MULTILINESTRING;
exports.GEOJSON_MULTIPOLYGON = GEOJSON_MULTIPOLYGON;
exports.GEOJSON_GEOMETRYCOLLECTION = GEOJSON_GEOMETRYCOLLECTION;
exports.forEachSchema = forEachSchema;
exports.formatDateTimeOffset = formatDateTimeOffset;
exports.formatDuration = formatDuration;
exports.formatNumberWidth = formatNumberWidth;
exports.getCanonicalTimezone = getCanonicalTimezone;
exports.getCollectionType = getCollectionType;
exports.invokeRequest = invokeRequest;
exports.isBatch = isBatch;
exports.isCollection = isCollection;
exports.isCollectionType = isCollectionType;
exports.isComplex = isComplex;
exports.isDateTimeOffset = isDateTimeOffset;
exports.isDeferred = isDeferred;
exports.isEntry = isEntry;
exports.isFeed = isFeed;
exports.isGeographyEdmType = isGeographyEdmType;
exports.isGeometryEdmType = isGeometryEdmType;
exports.isNamedStream = isNamedStream;
exports.isPrimitive = isPrimitive;
exports.isPrimitiveEdmType = isPrimitiveEdmType;
exports.lookupComplexType = lookupComplexType;
exports.lookupDefaultEntityContainer = lookupDefaultEntityContainer;
exports.lookupEntityContainer = lookupEntityContainer;
exports.lookupEntitySet = lookupEntitySet;
exports.lookupEntityType = lookupEntityType;
exports.lookupFunctionImport = lookupFunctionImport;
exports.lookupNavigationPropertyType = lookupNavigationPropertyType;
exports.lookupNavigationPropertyEntitySet = lookupNavigationPropertyEntitySet;
exports.lookupInSchema = lookupInSchema;
exports.lookupProperty = lookupProperty;
exports.lookupInMetadata = lookupInMetadata;
exports.getEntitySetInfo = getEntitySetInfo;
exports.maxVersion = maxVersion;
exports.navigationPropertyKind = navigationPropertyKind;
exports.normalizeHeaders = normalizeHeaders;
exports.parseBool = parseBool;
exports.parseDateTime = parseDateTime;
exports.parseDateTimeOffset = parseDateTimeOffset;
exports.parseDuration = parseDuration;
exports.parseTimezone = parseTimezone;
exports.parseInt10 = parseInt10;
exports.prepareRequest = prepareRequest;
exports.removeNamespace = removeNamespace;
exports.traverse = traverse;
// DATAJS INTERNAL END

