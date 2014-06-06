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

/* {
    oldname:'odata-json.js',
    updated:'20140514 12:59'
}*/

var utils    = require('./../datajs.js').utils;
var oDataUtils    = require('./utils.js');
var oDataHandler    = require('./handler.js');
var oJsonLight    = require('./json-light.js');


var defined = utils.defined;
var extend = utils.extend;
var isArray = utils.isArray;
var isDate = utils.isDate;
var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;

var contentType = oDataUtils.contentType;
var jsonLightReadPayload = oDataUtils.jsonLightReadPayload;
var formatDateTimeOffset = oDataUtils.formatDateTimeOffset;
var formatDuration = oDataUtils.formatDuration;
var formatJsonLight = oDataUtils.formatJsonLight;
var formatNumberWidth = oDataUtils.formatNumberWidth;
var getCanonicalTimezone = oDataUtils.getCanonicalTimezone;
var handler = oDataUtils.handler;
var isComplex = oDataUtils.isComplex;
var lookupComplexType = oDataUtils.lookupComplexType;
var lookupEntityType = oDataUtils.lookupEntityType;
var MAX_DATA_SERVICE_VERSION = oDataUtils.MAX_DATA_SERVICE_VERSION;
var maxVersion = oDataUtils.maxVersion;
var parseDateTime = oDataUtils.parseDateTime;
var parseDuration = oDataUtils.parseDuration;
var parseTimezone = oDataUtils.parseTimezone;
var payloadTypeOf = oDataUtils.payloadTypeOf;
var traverse = oDataUtils.traverse;
var formatJsonLightRequestPayload = oJsonLight.formatJsonLightRequestPayload;

// CONTENT START

var jsonMediaType = "application/json";
var jsonContentType = oDataHandler.contentType(jsonMediaType);

var jsonReadAdvertisedActionsOrFunctions = function (value) {
    /// <summary>Reads and object containing action or function metadata and maps them into a single array of objects.</summary>
    /// <param name="value" type="Object">Object containing action or function metadata.</param>
    /// <returns type="Array">Array of objects containing metadata for the actions or functions specified in value.</returns>

    var result = [];
    for (var name in value) {
        var i, len;
        for (i = 0, len = value[name].length; i < len; i++) {
            result.push(extend({ metadata: name }, value[name][i]));
        }
    }
    return result;
};

var jsonApplyMetadata = function (value, metadata, dateParser, recognizeDates) {
    /// <summary>Applies metadata coming from both the payload and the metadata object to the value.</summary>
    /// <param name="value" type="Object">Data on which the metada is going to be applied.</param>
    /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
    /// <param name="dateParser" type="function">Function used for parsing datetime values.</param>
    /// <param name="recognizeDates" type="Boolean">
    ///     True if strings formatted as datetime values should be treated as datetime values. False otherwise.
    /// </param>
    /// <returns type="Object">Transformed data.</returns>

    if (value && typeof value === "object") {
        var dataTypeName;
        var valueMetadata = value.__metadata;

        if (valueMetadata) {
            if (valueMetadata.actions) {
                valueMetadata.actions = jsonReadAdvertisedActionsOrFunctions(valueMetadata.actions);
            }
            if (valueMetadata.functions) {
                valueMetadata.functions = jsonReadAdvertisedActionsOrFunctions(valueMetadata.functions);
            }
            dataTypeName = valueMetadata && valueMetadata.type;
        }

        var dataType = lookupEntityType(dataTypeName, metadata) || lookupComplexType(dataTypeName, metadata);
        var propertyValue;
        if (dataType) {
            var properties = dataType.property;
            if (properties) {
                var i, len;
                for (i = 0, len = properties.length; i < len; i++) {
                    var property = properties[i];
                    var propertyName = property.name;
                    propertyValue = value[propertyName];

                    if (property.type === "Edm.DateTime" || property.type === "Edm.DateTimeOffset") {
                        if (propertyValue) {
                            propertyValue = dateParser(propertyValue);
                            if (!propertyValue) {
                                throw { message: "Invalid date/time value" };
                            }
                            value[propertyName] = propertyValue;
                        }
                    } else if (property.type === "Edm.Time") {
                        value[propertyName] = parseDuration(propertyValue);
                    }
                }
            }
        } else if (recognizeDates) {
            for (var name in value) {
                propertyValue = value[name];
                if (typeof propertyValue === "string") {
                    value[name] = dateParser(propertyValue) || propertyValue;
                }
            }
        }
    }
    return value;
};

var isJsonLight = function (contentType) {
    /// <summary>Tests where the content type indicates a json light payload.</summary>
    /// <param name="contentType">Object with media type and properties dictionary.</param>
    /// <returns type="Boolean">True is the content type indicates a json light payload. False otherwise.</returns>

    if (contentType) {
        var odata = contentType.properties["odata.metadata"];
        return odata === "none" || odata === "minimal" || odata === "full";
    }
    return false;
};

var normalizeServiceDocument = function (data, baseURI) {
    /// <summary>Normalizes a JSON service document to look like an ATOM service document.</summary>
    /// <param name="data" type="Object">Object representation of service documents as deserialized.</param>
    /// <param name="baseURI" type="String">Base URI to resolve relative URIs.</param>
    /// <returns type="Object">An object representation of the service document.</returns>
    var workspace = { collections: [] };

    var i, len;
    for (i = 0, len = data.EntitySets.length; i < len; i++) {
        var title = data.EntitySets[i];
        var collection = {
            title: title,
            href: normalizeURI(title, baseURI)
        };

        workspace.collections.push(collection);
    }

    return { workspaces: [workspace] };
};

// The regular expression corresponds to something like this:
// /Date(123+60)/
//
// This first number is date ticks, the + may be a - and is optional,
// with the second number indicating a timezone offset in minutes.
//
// On the wire, the leading and trailing forward slashes are
// escaped without being required to so the chance of collisions is reduced;
// however, by the time we see the objects, the characters already
// look like regular forward slashes.
var jsonDateRE = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/;

var minutesToOffset = function (minutes) {
    /// <summary>Formats the given minutes into (+/-)hh:mm format.</summary>
    /// <param name="minutes" type="Number">Number of minutes to format.</param>
    /// <returns type="String">The minutes in (+/-)hh:mm format.</returns>

    var sign;
    if (minutes < 0) {
        sign = "-";
        minutes = -minutes;
    } else {
        sign = "+";
    }

    var hours = Math.floor(minutes / 60);
    minutes = minutes - (60 * hours);

    return sign + formatNumberWidth(hours, 2) + ":" + formatNumberWidth(minutes, 2);
};

var parseJsonDateString = function (value) {
    /// <summary>Parses the JSON Date representation into a Date object.</summary>
    /// <param name="value" type="String">String value.</param>
    /// <returns type="Date">A Date object if the value matches one; falsy otherwise.</returns>

    var arr = value && jsonDateRE.exec(value);
    if (arr) {
        // 0 - complete results; 1 - ticks; 2 - sign; 3 - minutes
        var result = new Date(parseInt10(arr[1]));
        if (arr[2]) {
            var mins = parseInt10(arr[3]);
            if (arr[2] === "-") {
                mins = -mins;
            }

            // The offset is reversed to get back the UTC date, which is
            // what the API will eventually have.
            var current = result.getUTCMinutes();
            result.setUTCMinutes(current - mins);
            result.__edmType = "Edm.DateTimeOffset";
            result.__offset = minutesToOffset(mins);
        }
        if (!isNaN(result.valueOf())) {
            return result;
        }
    }

    // Allow undefined to be returned.
};

// Some JSON implementations cannot produce the character sequence \/
// which is needed to format DateTime and DateTimeOffset into the
// JSON string representation defined by the OData protocol.
// See the history of this file for a candidate implementation of
// a 'formatJsonDateString' function.

var jsonParser = function (handler, text, context) {
    /// <summary>Parses a JSON OData payload.</summary>
    /// <param name="handler">This handler.</param>
    /// <param name="text">Payload text (this parser also handles pre-parsed objects).</param>
    /// <param name="context" type="Object">Object with parsing context.</param>
    /// <returns>An object representation of the OData payload.</returns>

    var dataServiceVersion = context.dataServiceVersion;
    var json = (typeof text === "string") ? JSON.parse(text) : text;

    if ((maxVersion("4.0", dataServiceVersion) === dataServiceVersion)) {
        return json;
    }

    return undefined;
};

var jsonToString = function (data) {
    /// <summary>Converts the data into a JSON string.</summary>
    /// <param name="data">Data to serialize.</param>
    /// <returns type="String">The JSON string representation of data.</returns>

    var result; // = undefined;
    // Save the current date.toJSON function
    var dateToJSON = Date.prototype.toJSON;
    try {
        // Set our own date.toJSON function
        Date.prototype.toJSON = function () {
            return formatDateTimeOffset(this);
        };
        result = JSON.stringify(data, jsonReplacer);
    } finally {
        // Restore the original toJSON function
        Date.prototype.toJSON = dateToJSON;
    }
    return result;
};

var jsonSerializer = function (handler, data, context) {
    /// <summary>Serializes the data by returning its string representation.</summary>
    /// <param name="handler">This handler.</param>
    /// <param name="data">Data to serialize.</param>
    /// <param name="context" type="Object">Object with serialization context.</param>
    /// <returns type="String">The string representation of data.</returns>

    var dataServiceVersion = context.dataServiceVersion || "4.0";
    var cType = context.contentType = context.contentType || jsonContentType;

    if (cType && cType.mediaType === jsonContentType.mediaType) {
        context.dataServiceVersion = maxVersion(dataServiceVersion, "4.0");
        var newdata = formatJsonLightRequestPayload(data);
        if (newdata) {
            return JSON.stringify(newdata);
        }
    }

    return undefined;
};

var jsonReplacer = function (_, value) {
    /// <summary>JSON replacer function for converting a value to its JSON representation.</summary>
    /// <param value type="Object">Value to convert.</param>
    /// <returns type="String">JSON representation of the input value.</returns>
    /// <remarks>
    ///   This method is used during JSON serialization and invoked only by the JSON.stringify function.
    ///   It should never be called directly.
    /// </remarks>

    if (value && value.__edmType === "Edm.Time") {
        return formatDuration(value);
    } else {
        return value;
    }
};

var jsonNormalizeData = function (data, baseURI) {
    /// <summary>
    /// Normalizes the specified data into an intermediate representation.
    /// like the latest supported version.
    /// </summary>
    /// <param name="data" optional="false">Data to update.</param>
    /// <param name="baseURI" optional="false">URI to use as the base for normalizing references.</param>

    var isSvcDoc = isComplex(data) && !data.__metadata && isArray(data.EntitySets);
    return isSvcDoc ? normalizeServiceDocument(data, baseURI) : data;
};

var jsonHandler = oDataHandler.handler(jsonParser, jsonSerializer, jsonMediaType, MAX_DATA_SERVICE_VERSION);
jsonHandler.recognizeDates = false;

exports.jsonHandler = jsonHandler;



// DATAJS INTERNAL START
exports.jsonParser = jsonParser;
exports.jsonSerializer = jsonSerializer;
exports.jsonNormalizeData = jsonNormalizeData;
exports.normalizeServiceDocument = normalizeServiceDocument;
exports.parseJsonDateString = parseJsonDateString;
// DATAJS INTERNAL END


