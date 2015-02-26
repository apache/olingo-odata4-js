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
'use strict';
 /** @module odata/utils */

var utils    = require('./../utils.js');

// Imports
var assigned = utils.assigned;
var contains = utils.contains;
var find = utils.find;
var isArray = utils.isArray;
var isDate = utils.isDate;
var isObject = utils.isObject;
var parseInt10 = utils.parseInt10;


/** Gets the type name of a data item value that belongs to a feed, an entry, a complex type property, or a collection property
 * @param {string} value - Value of the data item from which the type name is going to be retrieved.
 * @param {object} [metadata] - Object containing metadata about the data tiem.
 * @returns {string} Data item type name; null if the type name cannot be found within the value or the metadata
 * This function will first try to get the type name from the data item's value itself if it is an object with a __metadata property; otherwise
 * it will try to recover it from the metadata.  If both attempts fail, it will return null.
 */
var dataItemTypeName = function (value, metadata) {
    var valueTypeName = ((value && value.__metadata) || {}).type;
    return valueTypeName || (metadata ? metadata.type : null);
};

var EDM = "Edm.";
var EDM_BOOLEAN = EDM + "Boolean";
var EDM_BYTE = EDM + "Byte";
var EDM_SBYTE = EDM + "SByte";
var EDM_INT16 = EDM + "Int16";
var EDM_INT32 = EDM + "Int32";
var EDM_INT64 = EDM + "Int64";
var EDM_SINGLE = EDM + "Single";
var EDM_DOUBLE = EDM + "Double";
var EDM_DECIMAL = EDM + "Decimal";
var EDM_STRING = EDM + "String";

var EDM_BINARY = EDM + "Binary";
var EDM_DATE = EDM + "Date";
var EDM_DATETIMEOFFSET = EDM + "DateTimeOffset";
var EDM_DURATION = EDM + "Duration";
var EDM_GUID = EDM + "Guid";
var EDM_TIMEOFDAY = EDM + "Time";

var GEOGRAPHY = "Geography";
var EDM_GEOGRAPHY = EDM + GEOGRAPHY;
var EDM_GEOGRAPHY_POINT = EDM_GEOGRAPHY + "Point";
var EDM_GEOGRAPHY_LINESTRING = EDM_GEOGRAPHY + "LineString";
var EDM_GEOGRAPHY_POLYGON = EDM_GEOGRAPHY + "Polygon";
var EDM_GEOGRAPHY_COLLECTION = EDM_GEOGRAPHY + "Collection";
var EDM_GEOGRAPHY_MULTIPOLYGON = EDM_GEOGRAPHY + "MultiPolygon";
var EDM_GEOGRAPHY_MULTILINESTRING = EDM_GEOGRAPHY + "MultiLineString";
var EDM_GEOGRAPHY_MULTIPOINT = EDM_GEOGRAPHY + "MultiPoint";

var GEOGRAPHY_POINT = GEOGRAPHY + "Point";
var GEOGRAPHY_LINESTRING = GEOGRAPHY + "LineString";
var GEOGRAPHY_POLYGON = GEOGRAPHY + "Polygon";
var GEOGRAPHY_COLLECTION = GEOGRAPHY + "Collection";
var GEOGRAPHY_MULTIPOLYGON = GEOGRAPHY + "MultiPolygon";
var GEOGRAPHY_MULTILINESTRING = GEOGRAPHY + "MultiLineString";
var GEOGRAPHY_MULTIPOINT = GEOGRAPHY + "MultiPoint";

var GEOMETRY = "Geometry";
var EDM_GEOMETRY = EDM + GEOMETRY;
var EDM_GEOMETRY_POINT = EDM_GEOMETRY + "Point";
var EDM_GEOMETRY_LINESTRING = EDM_GEOMETRY + "LineString";
var EDM_GEOMETRY_POLYGON = EDM_GEOMETRY + "Polygon";
var EDM_GEOMETRY_COLLECTION = EDM_GEOMETRY + "Collection";
var EDM_GEOMETRY_MULTIPOLYGON = EDM_GEOMETRY + "MultiPolygon";
var EDM_GEOMETRY_MULTILINESTRING = EDM_GEOMETRY + "MultiLineString";
var EDM_GEOMETRY_MULTIPOINT = EDM_GEOMETRY + "MultiPoint";

var GEOMETRY_POINT = GEOMETRY + "Point";
var GEOMETRY_LINESTRING = GEOMETRY + "LineString";
var GEOMETRY_POLYGON = GEOMETRY + "Polygon";
var GEOMETRY_COLLECTION = GEOMETRY + "Collection";
var GEOMETRY_MULTIPOLYGON = GEOMETRY + "MultiPolygon";
var GEOMETRY_MULTILINESTRING = GEOMETRY + "MultiLineString";
var GEOMETRY_MULTIPOINT = GEOMETRY + "MultiPoint";

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
    EDM_DATE,
    EDM_DATETIMEOFFSET,
    EDM_DURATION,
    EDM_TIMEOFDAY,
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

var geometryTypes = [
    GEOMETRY,
    GEOMETRY_POINT,
    GEOMETRY_LINESTRING,
    GEOMETRY_POLYGON,
    GEOMETRY_COLLECTION,
    GEOMETRY_MULTIPOLYGON,
    GEOMETRY_MULTILINESTRING,
    GEOMETRY_MULTIPOINT
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

var geographyTypes = [
    GEOGRAPHY,
    GEOGRAPHY_POINT,
    GEOGRAPHY_LINESTRING,
    GEOGRAPHY_POLYGON,
    GEOGRAPHY_COLLECTION,
    GEOGRAPHY_MULTIPOLYGON,
    GEOGRAPHY_MULTILINESTRING,
    GEOGRAPHY_MULTIPOINT
];

/** Invokes a function once per schema in metadata.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @param {Function} callback - Callback function to invoke once per schema.
 * @returns The first truthy value to be returned from the callback; null or the last falsy value otherwise.
 */
function forEachSchema(metadata, callback) {
    

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
}

/** Formats a millisecond and a nanosecond value into a single string.
 * @param {Number} ms - Number of milliseconds to format.
 * @param {Number} ns - Number of nanoseconds to format.
 * @returns {String} Formatted text.
 * If the value is already as string it's returned as-is.
 */
function formatMilliseconds(ms, ns) {

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
}

function formatDateTimeOffsetJSON(value) {
    return "\/Date(" + value.getTime() + ")\/";
}

/** Formats a DateTime or DateTimeOffset value a string.
 * @param {Date} value - Value to format
 * @returns {String} Formatted text.
 * If the value is already as string it's returned as-is
´*/
function formatDateTimeOffset(value) {

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
}

/** Converts a duration to a string in xsd:duration format.
 * @param {Object} value - Object with ms and __edmType properties.
 * @returns {String} String representation of the time object in xsd:duration format.
 */
function formatDuration(value) {

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
}

/** Formats the specified value to the given width.
 * @param {Number} value - Number to format (non-negative).
 * @param {Number} width - Minimum width for number.
 * @param {Boolean} append - Flag indicating if the value is padded at the beginning (false) or at the end (true).
 * @returns {String} Text representation.
 */
function formatNumberWidth(value, width, append) {
    var result = value.toString(10);
    while (result.length < width) {
        if (append) {
            result += "0";
        } else {
            result = "0" + result;
        }
    }

    return result;
}

/** Gets the canonical timezone representation.
 * @param {String} timezone - Timezone representation.
 * @returns {String} An 'Z' string if the timezone is absent or 0; the timezone otherwise.
 */
function getCanonicalTimezone(timezone) {

    return (!timezone || timezone === "Z" || timezone === "+00:00" || timezone === "-00:00") ? "Z" : timezone;
}

/** Gets the type of a collection type name.
 * @param {String} typeName - Type name of the collection.
 * @returns {String} Type of the collection; null if the type name is not a collection type.
 */
function getCollectionType(typeName) {

    if (typeof typeName === "string") {
        var end = typeName.indexOf(")", 10);
        if (typeName.indexOf("Collection(") === 0 && end > 0) {
            return typeName.substring(11, end);
        }
    }
    return null;
}

/** Sends a request containing OData payload to a server.
* @param request - Object that represents the request to be sent..
* @param success - Callback for a successful read operation.
* @param error - Callback for handling errors.
* @param handler - Handler for data serialization.
* @param httpClient - HTTP client layer.
* @param context - Context used for processing the request
*/
function invokeRequest(request, success, error, handler, httpClient, context) {

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
        // errors in success handler for sync requests result in error handler calls. So here we fix this. 
        try {
            success(response.data, response);
        } catch (err) {
            err.bIsSuccessHandlerError = true;
            throw err;
        }
    }, error);
}

/** Tests whether a value is a batch object in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a batch object; false otherwise.
 */
function isBatch(value) {

    return isComplex(value) && isArray(value.__batchRequests);
}

// Regular expression used for testing and parsing for a collection type.
var collectionTypeRE = /Collection\((.*)\)/;

/** Tests whether a value is a collection value in the library's internal representation.
 * @param value - Value to test.
 * @param {String} typeName - Type name of the value. This is used to disambiguate from a collection property value.
 * @returns {Boolean} True is the value is a feed value; false otherwise.
 */
function isCollection(value, typeName) {

    var colData = value && value.results || value;
    return !!colData &&
        (isCollectionType(typeName)) ||
        (!typeName && isArray(colData) && !isComplex(colData[0]));
}

/** Checks whether the specified type name is a collection type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is the name of a collection type; false otherwise.
 */
function isCollectionType(typeName) {
    return collectionTypeRE.test(typeName);
}

/** Tests whether a value is a complex type value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a complex type value; false otherwise.
 */
function isComplex(value) {

    return !!value &&
        isObject(value) &&
        !isArray(value) &&
        !isDate(value);
}

/** Checks whether a Date object is DateTimeOffset value
 * @param {Date} value - Value to check
 * @returns {Boolean} true if the value is a DateTimeOffset, false otherwise.
 */
function isDateTimeOffset(value) {
    return (value.__edmType === "Edm.DateTimeOffset" || (!value.__edmType && value.__offset));
}

/** Tests whether a value is a deferred navigation property in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a deferred navigation property; false otherwise.
 */
function isDeferred(value) {

    if (!value && !isComplex(value)) {
        return false;
    }
    var metadata = value.__metadata || {};
    var deferred = value.__deferred || {};
    return !metadata.type && !!deferred.uri;
}

/** Tests whether a value is an entry object in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is an entry object; false otherwise.
 */
function isEntry(value) {

    return isComplex(value) && value.__metadata && "uri" in value.__metadata;
}

/** Tests whether a value is a feed value in the library's internal representation.
 * @param value - Value to test.
 * @param {String} typeName - Type name of the value. This is used to disambiguate from a collection property value.
 * @returns {Boolean} True is the value is a feed value; false otherwise.
 */
function isFeed(value, typeName) {

    var feedData = value && value.results || value;
    return isArray(feedData) && (
        (!isCollectionType(typeName)) &&
        (isComplex(feedData[0]))
    );
}

/** Checks whether the specified type name is a geography EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a geography EDM type; false otherwise.
 */
function isGeographyEdmType(typeName) {
    //check with edm
    return contains(geographyEdmTypes, typeName) ||
        (typeName.indexOf('.') === -1 && contains(geographyTypes, typeName));
        
}

/** Checks whether the specified type name is a geometry EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a geometry EDM type; false otherwise.
 */
function isGeometryEdmType(typeName) {
    return contains(geometryEdmTypes, typeName) ||
        (typeName.indexOf('.') === -1 && contains(geometryTypes, typeName));
}



/** Tests whether a value is a named stream value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a named stream; false otherwise.
 */
function isNamedStream(value) {

    if (!value && !isComplex(value)) {
        return false;
    }
    var metadata = value.__metadata;
    var mediaResource = value.__mediaresource;
    return !metadata && !!mediaResource && !!mediaResource.media_src;
}

/** Tests whether a value is a primitive type value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a primitive type value.
 * Date objects are considered primitive types by the library.
 */
function isPrimitive(value) {

    return isDate(value) ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean";
}

/** Checks whether the specified type name is a primitive EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a primitive EDM type; false otherwise.
 */
function isPrimitiveEdmType(typeName) {

    return contains(primitiveEdmTypes, typeName);
}

/** Gets the kind of a navigation property value.
 * @param value - Value of the navigation property.
 * @param {Object} [propertyModel] - Object that describes the navigation property in an OData conceptual schema.
 * @returns {String} String value describing the kind of the navigation property; null if the kind cannot be determined.
 */
function navigationPropertyKind(value, propertyModel) {

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
}

/** Looks up a property by name.
 * @param {Array} properties - Array of property objects as per EDM metadata (may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The property object; null if not found.
 */
function lookupProperty(properties, name) {

    return find(properties, function (property) {
        return property.name === name;
    });
}

/** Looks up a type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @param {String} kind - Kind of object to look for as per EDM metadata.
 * @returns An type description if the name is found; null otherwise
 */
function lookupInMetadata(name, metadata, kind) {

    return (name) ? forEachSchema(metadata, function (schema) {
        return lookupInSchema(name, schema, kind);
    }) : null;
}

/** Looks up a entity set by name.
 * @param {Array} entitySets - Array of entity set objects as per EDM metadata( may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
function lookupEntitySet(entitySets, name) {

    return find(entitySets, function (entitySet) {
        return entitySet.name === name;
    });
}

/** Looks up a entity set by name.
 * @param {Array} singletons - Array of entity set objects as per EDM metadata (may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
function lookupSingleton(singletons, name) {

    return find(singletons, function (singleton) {
        return singleton.name === name;
    });
}

/** Looks up a complex type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns A complex type description if the name is found; null otherwise.
 */
function lookupComplexType(name, metadata) {

    return lookupInMetadata(name, metadata, "complexType");
}

/** Looks up an entity type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity type description if the name is found; null otherwise.
 */
function lookupEntityType(name, metadata) {

    return lookupInMetadata(name, metadata, "entityType");
}


/** Looks up an
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity container description if the name is found; null otherwise.
 */
function lookupDefaultEntityContainer(metadata) {

    return forEachSchema(metadata, function (schema) {
        if (isObject(schema.entityContainer)) { 
            return schema.entityContainer;
        }
    });
}

/** Looks up an entity container object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity container description if the name is found; null otherwise.
 */
function lookupEntityContainer(name, metadata) {

    return lookupInMetadata(name, metadata, "entityContainer");
}

/** Looks up a function import by name.
 * @param {Array} functionImports - Array of function import objects as per EDM metadata (May be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
function lookupFunctionImport(functionImports, name) {
    return find(functionImports, function (functionImport) {
        return functionImport.name === name;
    });
}

/** Looks up the target entity type for a navigation property.
 * @param {Object} navigationProperty - 
 * @param {Object} metadata - 
 * @returns {String} The entity type name for the specified property, null if not found.
 */
function lookupNavigationPropertyType(navigationProperty, metadata) {

    var result = null;
    if (navigationProperty) {
        var rel = navigationProperty.relationship;
        var association = forEachSchema(metadata, function (schema) {
            // The name should be the namespace qualified name in 'ns'.'type' format.
            var nameOnly = removeNamespace(schema.namespace, rel);
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
}

/** Looks up the target entityset name for a navigation property.
 * @param {Object} navigationProperty - 
 * @param {Object} sourceEntitySetName -
 * @param {Object} metadata -
 * metadata
 * @returns {String} The entityset name for the specified property, null if not found.
 */
function lookupNavigationPropertyEntitySet(navigationProperty, sourceEntitySetName, metadata) {

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
}

/** Gets the entitySet info, container name and functionImports for an entitySet
 * @param {Object} entitySetName -
 * @param {Object} metadata - 
 * @returns {Object} The info about the entitySet.
 */
function getEntitySetInfo(entitySetName, metadata) {

    var info = forEachSchema(metadata, function (schema) {
        var container = schema.entityContainer;
        var entitySets = container.entitySet;
        if (entitySets) {
            for (var j = 0; j < entitySets.length; j++) {
                if (entitySets[j].name == entitySetName) {
                    return { entitySet: entitySets[j], containerName: container.name, functionImport: container.functionImport };
                }
            }
        }
        return null;
    });

    return info;
}

/** Given an expected namespace prefix, removes it from a full name.
 * @param {String} ns - Expected namespace.
 * @param {String} fullName - Full name in 'ns'.'name' form.
 * @returns {String} The local name, null if it isn't found in the expected namespace.
 */
function removeNamespace(ns, fullName) {

    if (fullName.indexOf(ns) === 0 && fullName.charAt(ns.length) === ".") {
        return fullName.substr(ns.length + 1);
    }

    return null;
}

/** Looks up a schema object by name.
 * @param {String} name - Name (assigned).
 * @param schema - Schema object as per EDM metadata.
 * @param {String} kind - Kind of object to look for as per EDM metadata.
 * @returns An entity type description if the name is found; null otherwise.
 */
function lookupInSchema(name, schema, kind) {

    if (name && schema) {
        // The name should be the namespace qualified name in 'ns'.'type' format.
        var nameOnly = removeNamespace(schema.namespace, name);
        if (nameOnly) {
            return find(schema[kind], function (item) {
                return item.name === nameOnly;
            });
        }
    }
    return null;
}

/** Compares to version strings and returns the higher one.
 * @param {String} left - Version string in the form "major.minor.rev"
 * @param {String} right - Version string in the form "major.minor.rev"
 * @returns {String} The higher version string.
 */
function maxVersion(left, right) {

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
}

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
    "content-id": "Content-ID",
    "content-transfer-encoding": "Content-Transfer-Encoding",
    
    // Headers used by response
    "etag": "ETag",
    "location": "Location",
    "odata-entityid": "OData-EntityId",
    "preference-applied": "Preference-Applied",
    "retry-after": "Retry-After"
};

/** Normalizes headers so they can be found with consistent casing.
 * @param {Object} headers - Dictionary of name/value pairs.
 */
function normalizeHeaders(headers) {

    for (var name in headers) {
        var lowerName = name.toLowerCase();
        var normalName = normalHeaders[lowerName];
        if (normalName && name !== normalName) {
            var val = headers[name];
            delete headers[name];
            headers[normalName] = val;
        }
    }
}

/** Parses a string into a boolean value.
 * @param propertyValue - Value to parse.
 * @returns {Boolean} true if the property value is 'true'; false otherwise.
 */
function parseBool(propertyValue) {

    if (typeof propertyValue === "boolean") {
        return propertyValue;
    }

    return typeof propertyValue === "string" && propertyValue.toLowerCase() === "true";
}


// The captured indices for this expression are:
// 0     - complete input
// 1,2,3 - year with optional minus sign, month, day
// 4,5,6 - hours, minutes, seconds
// 7     - optional milliseconds
// 8     - everything else (presumably offset information)
var parseDateTimeRE = /^(-?\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?(.*)$/;

/** Parses a string into a DateTime value.
 * @param {String} value - Value to parse.
 * @param {Boolean} withOffset - Whether offset is expected.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed value.
 */
function parseDateTimeMaybeOffset(value, withOffset, nullOnError) {

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
}

/** Parses a string into a Date object.
 * @param {String} propertyValue - Value to parse.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed with year, month, day set, time values are set to 0
 */
function parseDate(propertyValue, nullOnError) {
    var parts = propertyValue.split('-');

    if (parts.length != 3 && nullOnError) {
        return null;
    }
    return new Date(
        parseInt10(parts[0]),       // Year.
        parseInt10(parts[1]) - 1,   // Month (zero-based for Date.UTC and setFullYear).
        parseInt10(parts[2],
        0,0,0,0)        // Date.
        );

}

var parseTimeOfDayRE = /^(\d+):(\d+)(:(\d+)(.(\d+))?)?$/;

/**Parses a time into a Date object.
 * @param propertyValue
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {{h: Number, m: Number, s: Number, ms: Number}}
 */
function parseTimeOfDay(propertyValue, nullOnError) {
    var parts = parseTimeOfDayRE.exec(propertyValue);


    return {
        'h' :parseInt10(parts[1]),
        'm' :parseInt10(parts[2]),
        's' :parseInt10(parts[4]),
        'ms' :parseInt10(parts[6])
     };
}

/** Parses a string into a DateTimeOffset value.
 * @param {String} propertyValue - Value to parse.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed value.
 * The resulting object is annotated with an __edmType property and
 * an __offset property reflecting the original intended offset of
 * the value. The time is adjusted for UTC time, as the current
 * timezone-aware Date APIs will only work with the local timezone.
 */
function parseDateTimeOffset(propertyValue, nullOnError) {
    

    return parseDateTimeMaybeOffset(propertyValue, true, nullOnError);
}

// The captured indices for this expression are:
// 0       - complete input
// 1       - direction
// 2,3,4   - years, months, days
// 5,6,7,8 - hours, minutes, seconds, miliseconds

var parseTimeRE = /^([+-])?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?)?/;

function isEdmDurationValue(value) {
    parseTimeRE.test(value);
}

/** Parses a string in xsd:duration format.
 * @param {String} duration - Duration value.

 * This method will throw an exception if the input string has a year or a month component.

 * @returns {Object} Object representing the time
 */
function parseDuration(duration) {

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
}

/** Parses a timezone description in (+|-)nn:nn format.
 * @param {String} timezone - Timezone offset.
 * @returns {Object} An object with a (d)irection property of 1 for + and -1 for -, offset (h)ours and offset (m)inutes.
 */
function parseTimezone(timezone) {

    var direction = timezone.substring(0, 1);
    direction = (direction === "+") ? 1 : -1;

    var offsetHours = parseInt10(timezone.substring(1));
    var offsetMinutes = parseInt10(timezone.substring(timezone.indexOf(":") + 1));
    return { d: direction, h: offsetHours, m: offsetMinutes };
}

/** Prepares a request object so that it can be sent through the network.
* @param request - Object that represents the request to be sent.
* @param handler - Handler for data serialization
* @param context - Context used for preparing the request
*/
function prepareRequest(request, handler, context) {

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

    if (request.async === undefined) {
        request.async = true;
    }

}

/** Traverses a tree of objects invoking callback for every value.
 * @param {Object} item - Object or array to traverse.
 * @param {Object} owner - Pass through each callback
 * @param {Function} callback - Callback function with key and value, similar to JSON.parse reviver.
 * @returns {Object} The object with traversed properties.
 Unlike the JSON reviver, this won't delete null members.
*/
function traverseInternal(item, owner, callback) {

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
}

/** Traverses a tree of objects invoking callback for every value.
 * @param {Object} item - Object or array to traverse.
 * @param {Function} callback - Callback function with key and value, similar to JSON.parse reviver.
 * @returns {Object} The traversed object.
 * Unlike the JSON reviver, this won't delete null members.
*/
function traverse(item, callback) {

    return callback("", traverseInternal(item, "", callback));
}

exports.dataItemTypeName = dataItemTypeName;
exports.EDM_BINARY = EDM_BINARY;
exports.EDM_BOOLEAN = EDM_BOOLEAN;
exports.EDM_BYTE = EDM_BYTE;
exports.EDM_DATE = EDM_DATE;
exports.EDM_DATETIMEOFFSET = EDM_DATETIMEOFFSET;
exports.EDM_DURATION = EDM_DURATION;
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
exports.EDM_TIMEOFDAY = EDM_TIMEOFDAY;
exports.GEOJSON_POINT = GEOJSON_POINT;
exports.GEOJSON_LINESTRING = GEOJSON_LINESTRING;
exports.GEOJSON_POLYGON = GEOJSON_POLYGON;
exports.GEOJSON_MULTIPOINT = GEOJSON_MULTIPOINT;
exports.GEOJSON_MULTILINESTRING = GEOJSON_MULTILINESTRING;
exports.GEOJSON_MULTIPOLYGON = GEOJSON_MULTIPOLYGON;
exports.GEOJSON_GEOMETRYCOLLECTION = GEOJSON_GEOMETRYCOLLECTION;
exports.forEachSchema = forEachSchema;
exports.formatDateTimeOffset = formatDateTimeOffset;
exports.formatDateTimeOffsetJSON = formatDateTimeOffsetJSON;
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
exports.lookupSingleton = lookupSingleton;
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


exports.parseDate = parseDate;
exports.parseDateTimeOffset = parseDateTimeOffset;
exports.parseDuration = parseDuration;
exports.parseTimeOfDay = parseTimeOfDay;

exports.parseInt10 = parseInt10;
exports.prepareRequest = prepareRequest;
exports.removeNamespace = removeNamespace;
exports.traverse = traverse;


