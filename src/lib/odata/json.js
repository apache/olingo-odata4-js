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

/** @module odata/json */



var utils        = require('./../utils.js');
var oDataUtils   = require('./odatautils.js');
var oDataHandler = require('./handler.js');

var odataNs = "odata";
var odataAnnotationPrefix = odataNs + ".";
var contextUrlAnnotation = "@" + odataAnnotationPrefix + "context";

var assigned = utils.assigned;
var defined = utils.defined;
var isArray = utils.isArray;
//var isDate = utils.isDate;
var isObject = utils.isObject;
//var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;
var getFormatKind = utils.getFormatKind;
var convertByteArrayToHexString = utils.convertByteArrayToHexString;


var formatDateTimeOffset = oDataUtils.formatDateTimeOffset;
var formatDuration = oDataUtils.formatDuration;
var formatNumberWidth = oDataUtils.formatNumberWidth;
var getCanonicalTimezone = oDataUtils.getCanonicalTimezone;
var handler = oDataUtils.handler;
var isComplex = oDataUtils.isComplex;
var isPrimitive = oDataUtils.isPrimitive;
var isCollectionType = oDataUtils.isCollectionType;
var lookupComplexType = oDataUtils.lookupComplexType;
var lookupEntityType = oDataUtils.lookupEntityType;
var lookupSingleton = oDataUtils.lookupSingleton;
var lookupEntitySet = oDataUtils.lookupEntitySet;
var lookupDefaultEntityContainer = oDataUtils.lookupDefaultEntityContainer;
var lookupProperty = oDataUtils.lookupProperty;
var MAX_DATA_SERVICE_VERSION = oDataUtils.MAX_DATA_SERVICE_VERSION;
var maxVersion = oDataUtils.maxVersion;

var isPrimitiveEdmType = oDataUtils.isPrimitiveEdmType;
var isGeographyEdmType = oDataUtils.isGeographyEdmType;
var isGeometryEdmType = oDataUtils.isGeometryEdmType;

var PAYLOADTYPE_FEED = "f";
var PAYLOADTYPE_ENTRY = "e";
var PAYLOADTYPE_PROPERTY = "p";
var PAYLOADTYPE_COLLECTION = "c";
var PAYLOADTYPE_ENUMERATION_PROPERTY = "enum";
var PAYLOADTYPE_SVCDOC = "s";
var PAYLOADTYPE_ENTITY_REF_LINK = "erl";
var PAYLOADTYPE_ENTITY_REF_LINKS = "erls";

var PAYLOADTYPE_VALUE = "v";

var PAYLOADTYPE_DELTA = "d";
var DELTATYPE_FEED = "f";
var DELTATYPE_DELETED_ENTRY = "de";
var DELTATYPE_LINK = "l";
var DELTATYPE_DELETED_LINK = "dl";

var jsonMediaType = "application/json";
var jsonContentType = oDataHandler.contentType(jsonMediaType);

var jsonSerializableMetadata = ["@odata.id", "@odata.type"];





/** Extend JSON OData payload with metadata
 * @param handler - This handler.
 * @param text - Payload text (this parser also handles pre-parsed objects).
 * @param {Object} context - Object with parsing context.
 * @return An object representation of the OData payload.
 */
function jsonParser(handler, text, context) {
    var recognizeDates = defined(context.recognizeDates, handler.recognizeDates);
    var model = context.metadata;
    var json = (typeof text === "string") ? JSON.parse(text) : text;
    var metadataContentType;
    if (assigned(context.contentType) && assigned(context.contentType.properties)) {
        metadataContentType = context.contentType.properties["odata.metadata"]; //TODO convert to lower before comparism
    }

    var payloadFormat = getFormatKind(metadataContentType, 1); // none: 0, minimal: 1, full: 2

    // No errors should be throw out if we could not parse the json payload, instead we should just return the original json object.
    if (payloadFormat === 0) {
        return json;
    }
    else if (payloadFormat === 1) {
        return addMinimalMetadataToJsonPayload(json, model, recognizeDates);
    }
    else if (payloadFormat === 2) {
        // to do: using the EDM Model to get the type of each property instead of just guessing.
        return addFullMetadataToJsonPayload(json, model, recognizeDates);
    }
    else {
        return json;
    }
}


















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


// Some JSON implementations cannot produce the character sequence \/
// which is needed to format DateTime and DateTimeOffset into the
// JSON string representation defined by the OData protocol.
// See the history of this file for a candidate implementation of
// a 'formatJsonDateString' function.


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

/** Serializes a ODataJs payload structure to the wire format which can be send to the server
 * @param handler - This handler.
 * @param data - Data to serialize.
 * @param {Object} context - Object with serialization context.
 * @returns {String} The string representation of data.
 */
function jsonSerializer(handler, data, context) {

    var dataServiceVersion = context.dataServiceVersion || "4.0";
    var cType = context.contentType = context.contentType || jsonContentType;

    if (cType && cType.mediaType === jsonContentType.mediaType) {
        context.dataServiceVersion = maxVersion(dataServiceVersion, "4.0");
        var newdata = formatJsonRequestPayload(data);
        if (newdata) {
            return JSON.stringify(newdata,jsonReplacer);
        }
    }
    return undefined;
}




/** Convert OData objects for serialisation in to a new data structure
 * @param data - Data to serialize.
 * @returns {String} The string representation of data.
 */
function formatJsonRequestPayload(data) {
    if (!data) {
        return data;
    }

    if (isPrimitive(data)) {
        return data;
    }

    if (isArray(data)) {
        var newArrayData = [];
        var i, len;
        for (i = 0, len = data.length; i < len; i++) {
            newArrayData[i] = formatJsonRequestPayload(data[i]);
        }

        return newArrayData;
    }

    var newdata = {};
    for (var property in data) {
        if (isJsonSerializableProperty(property)) {
            newdata[property] = formatJsonRequestPayload(data[property]);
        }
    }

    return newdata;
}

/** Determine form the attribute name if the attribute is a serializable property
 * @param attribute
 * @returns {boolean}
 */
function isJsonSerializableProperty(attribute) {
    if (!attribute) {
        return false;
    }

    if (attribute.indexOf("@odata.") == -1) {
        return true;
    }

    var i, len;
    for (i = 0, len = jsonSerializableMetadata.length; i < len; i++) {
        var name = jsonSerializableMetadata[i];
        if (attribute.indexOf(name) != -1) {
            return true;
        }
    }

    return false;
}

/** Creates an object containing information for the json payload.
 * @param {String} kind - JSON payload kind
 * @param {String} type - Type name of the JSON payload.
 * @returns {Object} Object with kind and type fields.
 */
function jsonMakePayloadInfo(kind, type) {
    return { kind: kind, type: type || null };
}



/** Add metadata to an JSON payload complex object containing full metadata
 * @param {Object} data - Data structure to be extended
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addFullMetadataToJsonPayload(data, model, recognizeDates) {
    var type;
    if (utils.isObject(data)) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (key.indexOf('@') === -1) {
                    if (utils.isArray(data[key])) {
                        for (var i = 0; i < data[key].length; ++i) {
                            addFullMetadataToJsonPayload(data[key][i], model, recognizeDates);
                        }
                    } else if (utils.isObject(data[key])) {
                        if (data[key] !== null) {
                            //don't step into geo.. objects
                            type = data[key+'@odata.type'];
                            if (!type) {
                                //type unknown
                                addFullMetadataToJsonPayload(data[key], model, recognizeDates);
                            } else {
                                type = type.substring(1);
                                if  (isGeographyEdmType(type) || isGeometryEdmType(type)) {
                                    // don't add type info for geo* types
                                } else {
                                    addFullMetadataToJsonPayload(data[key], model, recognizeDates);
                                }
                            }
                        }
                    } else {
                        type = data[key + '@odata.type'];

                        // On .Net OData library, some basic EDM type is omitted, e.g. Edm.String, Edm.Int, and etc.
                        // For the full metadata payload, we need to full fill the @data.type for each property if it is missing.
                        // We do this is to help the OlingoJS consumers to easily get the type of each property.
                        if (!assigned(type)) {
                            // Guessing the "type" from the type of the value is not the right way here.
                            // To do: we need to get the type from metadata instead of guessing.
                            var typeFromObject = typeof data[key];
                            if (typeFromObject === 'string') {
                                addType(data, key, 'String');
                            } else if (typeFromObject === 'boolean') {
                                addType(data, key, 'Boolean');
                            } else if (typeFromObject === 'number') {
                                if (data[key] % 1 === 0) { // has fraction
                                    addType(data, key, 'Int32'); // the biggst integer
                                } else {
                                    addType(data, key, 'Decimal'); // the biggst float single,doulbe,decimal
                                }
                            }
                        }
                        else {
                            if (recognizeDates) {
                                convertDatesNoEdm(data, key, type.substring(1));
                            }
                        }
                    }
                }
            }
        }
    }

    return data;
}

/** Loop through the properties of an JSON payload object, look up the type info of the property and call
 * the appropriate add*MetadataToJsonPayloadObject function
 * @param {Object} data - Data structure to be extended
 * @param {String} objectInfoType - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function checkProperties(data, objectInfoType, baseURI, model, recognizeDates) {
    for (var name in data) {
        if (name.indexOf("@") === -1) {
            var curType = objectInfoType;
            var propertyValue = data[name];
            var property = lookupProperty(curType.property,name); //TODO SK add check for parent type

            while (( property === null) && (curType.baseType !== undefined)) {
                curType = lookupEntityType(curType.baseType, model);
                property = lookupProperty(curType.property,name);
            }

            if ( isArray(propertyValue)) {
                //data[name+'@odata.type'] = '#' + property.type;
                if (isCollectionType(property.type)) {
                    addTypeColNoEdm(data,name,property.type.substring(11,property.type.length-1));
                } else {
                    addTypeNoEdm(data,name,property.type);
                }


                for ( var i = 0; i < propertyValue.length; i++) {
                    addMetadataToJsonMinimalPayloadComplex(propertyValue[i], property, baseURI, model, recognizeDates);
                }
            } else if (isObject(propertyValue) && (propertyValue !== null)) {
                addMetadataToJsonMinimalPayloadComplex(propertyValue, property, baseURI, model, recognizeDates);
            } else {
                //data[name+'@odata.type'] = '#' + property.type;
                addTypeNoEdm(data,name,property.type);
                if (recognizeDates) {
                    convertDates(data, name, property.type);
                }
            }
        }
    }
}



/** Add metadata to an JSON payload object containing minimal metadata
 * @param {Object} data - Json response payload object
 * @param {Object} model - Object describing an OData conceptual schema
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 * @returns {Object} Object in the library's representation.
 */
function addMinimalMetadataToJsonPayload(data, model, recognizeDates) {

    if (!assigned(model) || isArray(model)) {
        return data;
    }

    var baseURI = data[contextUrlAnnotation];
    var payloadInfo = createPayloadInfo(data, model);

    switch (payloadInfo.detectedPayloadKind) {

        case PAYLOADTYPE_VALUE:
            if (payloadInfo.type !== null) {
                return addMetadataToJsonMinimalPayloadEntity(data, payloadInfo, baseURI, model, recognizeDates);
            } else {
                return addTypeNoEdm(data,'value', payloadInfo.typeName);
            }

        case PAYLOADTYPE_FEED:
            return addMetadataToJsonMinimalPayloadFeed(data, model, payloadInfo, baseURI, recognizeDates);

        case PAYLOADTYPE_ENTRY:
            return addMetadataToJsonMinimalPayloadEntity(data, payloadInfo, baseURI, model, recognizeDates);

        case PAYLOADTYPE_COLLECTION:
            return addMetadataToJsonMinimalPayloadCollection(data, model, payloadInfo, baseURI, recognizeDates);

        case PAYLOADTYPE_PROPERTY:
            if (payloadInfo.type !== null) {
                return addMetadataToJsonMinimalPayloadEntity(data, payloadInfo, baseURI, model, recognizeDates);
            } else {
                return addTypeNoEdm(data,'value', payloadInfo.typeName);
            }

        case PAYLOADTYPE_SVCDOC:
            return data;

        case PAYLOADTYPE_LINKS:
            return data;
    }

    return data;
}

/** Add metadata to an JSON payload feed object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {Object} model - Metadata model
 * @param {String} feedInfo - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadFeed(data, model, feedInfo, baseURI, recognizeDates) {
    var entries = [];
    var items = data.value;
    var i,len;
    var entry;
    for (i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        if ( defined(item['@odata.type'])) { // in case of mixed feeds
            var typeName = item['@odata.type'].substring(1);
            var type = lookupEntityType( typeName, model);
            var entryInfo = {
                contentTypeOdata : feedInfo.contentTypeOdata,
                detectedPayloadKind : feedInfo.detectedPayloadKind,
                name : feedInfo.name,
                type : type,
                typeName : typeName
            };

            entry = addMetadataToJsonMinimalPayloadEntity(item, entryInfo, baseURI, model, recognizeDates);
        } else {
            entry = addMetadataToJsonMinimalPayloadEntity(item, feedInfo, baseURI, model, recognizeDates);
        }

        entries.push(entry);
    }
    data.value = entries;
    return data;
}


/** Add metadata to an JSON payload entity object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {String} objectInfo - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadEntity(data, objectInfo, baseURI, model, recognizeDates) {
    addType(data,'',objectInfo.typeName);

    var keyType = objectInfo.type;
    while ((defined(keyType)) && ( keyType.key === undefined) && (keyType.baseType !== undefined)) {
        keyType = lookupEntityType(keyType.baseType, model);
    }

    if (keyType.key !== undefined) {
        var lastIdSegment = objectInfo.name + jsonGetEntryKey(data, keyType);
        data['@odata.id'] = baseURI.substring(0, baseURI.lastIndexOf("$metadata")) + lastIdSegment;
        data['@odata.editLink'] = lastIdSegment;
    }

    //var serviceURI = baseURI.substring(0, baseURI.lastIndexOf("$metadata"));

    checkProperties(data, objectInfo.type, baseURI, model, recognizeDates);

    return data;
}

/** Add metadata to an JSON payload complex object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {String} property - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadComplex(data, property, baseURI, model, recognizeDates) {
    var type = property.type;
    if (isCollectionType(property.type)) {
        type =property.type.substring(11,property.type.length-1);
    }

    addType(data,'',property.type);

    var propertyType = lookupComplexType(type, model);
    if (propertyType === null)  {
        return; //TODO check what to do if the type is not known e.g. type #GeometryCollection
    }

    checkProperties(data, propertyType, baseURI, model, recognizeDates);
}

/** Add metadata to an JSON payload collection object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {Object} model - Metadata model
 * @param {String} collectionInfo - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadCollection(data, model, collectionInfo, baseURI, recognizeDates) {

    addTypeColNoEdm(data,'', collectionInfo.typeName);

    if (collectionInfo.type !== null) {
        var entries = [];

        var items = data.value;
        var i,len;
        var entry;
        for (i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if ( defined(item['@odata.type'])) { // in case of mixed collections
                var typeName = item['@odata.type'].substring(1);
                var type = lookupEntityType( typeName, model);
                var entryInfo = {
                    contentTypeOdata : collectionInfo.contentTypeOdata,
                    detectedPayloadKind : collectionInfo.detectedPayloadKind,
                    name : collectionInfo.name,
                    type : type,
                    typeName : typeName
                };

                entry = addMetadataToJsonMinimalPayloadEntity(item, entryInfo, baseURI, model, recognizeDates);
            } else {
                entry = addMetadataToJsonMinimalPayloadEntity(item, collectionInfo, baseURI, model, recognizeDates);
            }

            entries.push(entry);
        }
        data.value = entries;
    }
    return data;
}

/** Add an OData type tag to an JSON payload object
 * @param {Object} data - Data structure to be extended
 * @param {String} name - Name of the property whose type is set
 * @param {String} value - Type name
 */
function addType(data, name, value ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        data[fullName] = '#' + value;
    }
}

/** Add an OData type tag to an JSON payload object collection (without "Edm." namespace)
 * @param {Object} data - Data structure to be extended
 * @param {String} name - Name of the property whose type is set
 * @param {String} typeName - Type name
 */
function addTypeColNoEdm(data, name, typeName ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        if ( typeName.substring(0,4)==='Edm.') {
            data[fullName] = '#Collection('+typeName.substring(4)+ ')';
        } else {
            data[fullName] = '#Collection('+typeName+ ')';
        }
    }
}


/** Add an OData type tag to an JSON payload object (without "Edm." namespace)
 * @param {Object} data - Data structure to be extended
 * @param {String} name - Name of the property whose type is set
 * @param {String} value - Type name
 */
function addTypeNoEdm(data, name, value ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        if ( value.substring(0,4)==='Edm.') {
            data[fullName] = '#' + value.substring(4);
        } else {
            data[fullName] = '#' + value;
        }
    }
    return data;
}
/** Convert the date/time format of an property from the JSON payload object (without "Edm." namespace)
 * @param {Object} data - Data structure to be extended
 * @param propertyName - Name of the property to be changed
 * @param type - Type
 */
function convertDates(data, propertyName,type) {
    if (type === 'Edm.Date') {
        data[propertyName] = oDataUtils.parseDate(data[propertyName], true);
    } else if (type === 'Edm.DateTimeOffset') {
        data[propertyName] = oDataUtils.parseDateTimeOffset(data[propertyName], true);
    } else if (type === 'Edm.Duration') {
        data[propertyName] = oDataUtils.parseDuration(data[propertyName], true);
    } else if (type === 'Edm.Time') {
        data[propertyName] = oDataUtils.parseTime(data[propertyName], true);
    }
}

/** Convert the date/time format of an property from the JSON payload object
 * @param {Object} data - Data structure to be extended
 * @param propertyName - Name of the property to be changed
 * @param type - Type
 */
function convertDatesNoEdm(data, propertyName,type) {
    if (type === 'Date') {
        data[propertyName] = oDataUtils.parseDate(data[propertyName], true);
    } else if (type === 'DateTimeOffset') {
        data[propertyName] = oDataUtils.parseDateTimeOffset(data[propertyName], true);
    } else if (type === 'Duration') {
        data[propertyName] = oDataUtils.parseDuration(data[propertyName], true);
    } else if (type === 'Time') {
        data[propertyName] = oDataUtils.parseTime(data[propertyName], true);
    }
}

/** Formats a value according to Uri literal format
 * @param value - Value to be formatted.
 * @param type - Edm type of the value
 * @returns {string} Value after formatting
 */
function formatLiteral(value, type) {

    value = "" + formatRawLiteral(value, type);
    value = encodeURIComponent(value.replace("'", "''"));
    switch ((type)) {
        case "Edm.Binary":
            return "X'" + value + "'";
        case "Edm.DateTime":
            return "datetime" + "'" + value + "'";
        case "Edm.DateTimeOffset":
            return "datetimeoffset" + "'" + value + "'";
        case "Edm.Decimal":
            return value + "M";
        case "Edm.Guid":
            return "guid" + "'" + value + "'";
        case "Edm.Int64":
            return value + "L";
        case "Edm.Float":
            return value + "f";
        case "Edm.Double":
            return value + "D";
        case "Edm.Geography":
            return "geography" + "'" + value + "'";
        case "Edm.Geometry":
            return "geometry" + "'" + value + "'";
        case "Edm.Time":
            return "time" + "'" + value + "'";
        case "Edm.String":
            return "'" + value + "'";
        default:
            return value;
    }
}

/** convert raw byteArray to hexString if the property is an binary property
 * @param value - Value to be formatted.
 * @param type - Edm type of the value
 * @returns {string} Value after formatting
 */
function formatRawLiteral(value, type) {
    switch (type) {
        case "Edm.Binary":
            return convertByteArrayToHexString(value);
        default:
            return value;
    }
}

/** Formats the given minutes into (+/-)hh:mm format.
 * @param {Number} minutes - Number of minutes to format.
 * @returns {String} The minutes in (+/-)hh:mm format.
 */
function minutesToOffset(minutes) {

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
}

/** Parses the JSON Date representation into a Date object.
 * @param {String} value - String value.
 * @returns {Date} A Date object if the value matches one; falsy otherwise.
 */
function parseJsonDateString(value) {

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
}

/** Creates an object containing information for the context
 * @param {String} fragments - Uri fragment
 * @param {Object} model - Object describing an OData conceptual schema
 * @returns {Object} type(optional)  object containing type information for entity- and complex-types ( null if a typeName is a primitive)
 */
function parseContextUriFragment( fragments, model ) {
    var ret = {};

    if (fragments.indexOf('/') === -1 ) {
        if (fragments.length === 0) {
            // Capter 10.1
            ret.detectedPayloadKind = PAYLOADTYPE_SVCDOC;
            return ret;
        } else if (fragments === 'Edm.Null') {
            // Capter 10.15
            ret.detectedPayloadKind = PAYLOADTYPE_VALUE;
            ret.isNullProperty = true;
            return ret;
        } else if (fragments === 'Collection($ref)') {
            // Capter 10.11
            ret.detectedPayloadKind = PAYLOADTYPE_ENTITY_REF_LINKS;
            return ret;
        } else if (fragments === '$ref') {
            // Capter 10.12
            ret.detectedPayloadKind = PAYLOADTYPE_ENTITY_REF_LINK;
            return ret;
        } else {
            //TODO check for navigation resource
        }
    }

    ret.type = undefined;
    ret.typeName = undefined;

    var fragmentParts = fragments.split("/");
    var type;

    for(var i = 0; i < fragmentParts.length; ++i) {
        var fragment = fragmentParts[i];
        if (ret.typeName === undefined) {
            //preparation
            if ( fragment.indexOf('(') !== -1 ) {
                //remove the query function, cut fragment to matching '('
                var index = fragment.length - 2 ;
                for ( var rCount = 1; rCount > 0 && index > 0; --index) {
                    if ( fragment.charAt(index)=='(') {
                        rCount --;
                    } else if ( fragment.charAt(index)==')') {
                        rCount ++;
                    }
                }

                if (index === 0) {
                    //TODO throw error
                }

                //remove the projected entity from the fragment; TODO decide if we want to store the projected entity
                var inPharenthesis = fragment.substring(index+2,fragment.length - 1);
                fragment = fragment.substring(0,index+1);

                if (utils.startsWith(fragment, 'Collection')) {
                    ret.detectedPayloadKind = PAYLOADTYPE_COLLECTION;
                    // Capter 10.14
                    ret.typeName = inPharenthesis;

                    type = lookupEntityType(ret.typeName, model);
                    if ( type !== null) {
                        ret.type = type;
                        continue;
                    }
                    type = lookupComplexType(ret.typeName, model);
                    if ( type !== null) {
                        ret.type = type;
                        continue;
                    }

                    ret.type = null;//in case of #Collection(Edm.String) only lastTypeName is filled
                    continue;
                } else {
                    // projection: Capter 10.7, 10.8 and 10.9
                    ret.projection = inPharenthesis;
                }
            }


            if (jsonIsPrimitiveType(fragment)) {
                ret.typeName = fragment;
                ret.type = null;
                ret.detectedPayloadKind = PAYLOADTYPE_VALUE;
                continue;
            }

            var container = lookupDefaultEntityContainer(model);

            //check for entity
            var entitySet = lookupEntitySet(container.entitySet, fragment);
            if ( entitySet !== null) {
                ret.typeName = entitySet.entityType;
                ret.type = lookupEntityType( ret.typeName, model);
                ret.name = fragment;
                ret.detectedPayloadKind = PAYLOADTYPE_FEED;
                // Capter 10.2
                continue;
            }

            //check for singleton
            var singleton = lookupSingleton(container.singleton, fragment);
            if ( singleton !== null) {
                ret.typeName = singleton.entityType;
                ret.type = lookupEntityType( ret.typeName, model);
                ret.name = fragment;
                ret.detectedPayloadKind =  PAYLOADTYPE_ENTRY;
                // Capter 10.4
                continue;
            }



            //TODO throw ERROR
        } else {
            //check for $entity
            if (utils.endsWith(fragment, '$entity') && (ret.detectedPayloadKind === PAYLOADTYPE_FEED)) {
                //TODO ret.name = fragment;
                ret.detectedPayloadKind = PAYLOADTYPE_ENTRY;
                // Capter 10.3 and 10.6
                continue;
            }

            //check for derived types
            if (fragment.indexOf('.') !== -1) {
                // Capter 10.6
                ret.typeName = fragment;
                type = lookupEntityType(ret.typeName, model);
                if ( type !== null) {
                    ret.type = type;
                    continue;
                }
                type = lookupComplexType(ret.typeName, model);
                if ( type !== null) {
                    ret.type = type;
                    continue;
                }

                //TODO throw ERROR invalid type
            }

            //check for property value
            if ( ret.detectedPayloadKind === PAYLOADTYPE_FEED || ret.detectedPayloadKind === PAYLOADTYPE_ENTRY) {
                var property = lookupProperty(ret.type.property, fragment);
                if (property !== null) {
                    //PAYLOADTYPE_COLLECTION
                    ret.typeName = property.type;


                    if (utils.startsWith(property.type, 'Collection')) {
                        ret.detectedPayloadKind = PAYLOADTYPE_COLLECTION;
                        var tmp12 =  property.type.substring(10+1,property.type.length - 1);
                        ret.typeName = tmp12;
                        ret.type = lookupComplexType(tmp12, model);
                        ret.detectedPayloadKind = PAYLOADTYPE_COLLECTION;
                    } else {
                        ret.type = lookupComplexType(property.type, model);
                        ret.detectedPayloadKind = PAYLOADTYPE_PROPERTY;
                    }

                    ret.name = fragment;
                    // Capter 10.15
                }
                continue;
            }

            if (fragment === '$delta') {
                ret.deltaKind = DELTATYPE_FEED;
                continue;
            } else if (utils.endsWith(fragment, '/$deletedEntity')) {
                ret.deltaKind = DELTATYPE_DELETED_ENTRY;
                continue;
            } else if (utils.endsWith(fragment, '/$link')) {
                ret.deltaKind = DELTATYPE_LINK;
                continue;
            } else if (utils.endsWith(fragment, '/$deletedLink')) {
                ret.deltaKind = DELTATYPE_DELETED_LINK;
                continue;
            }
            //TODO throw ERROr
        }
    }

    return ret;
}


/** Infers the information describing the JSON payload from its metadata annotation, structure, and data model.
 * @param {Object} data - Json response payload object.
 * @param {Object} model - Object describing an OData conceptual schema.
 * If the arguments passed to the function don't convey enough information about the payload to determine without doubt that the payload is a feed then it
 * will try to use the payload object structure instead.  If the payload looks like a feed (has value property that is an array or non-primitive values) then
 * the function will report its kind as PAYLOADTYPE_FEED unless the inferFeedAsComplexType flag is set to true. This flag comes from the user request
 * and allows the user to control how the library behaves with an ambigous JSON payload.
 * @return Object with kind and type fields. Null if there is no metadata annotation or the payload info cannot be obtained..
 */
function createPayloadInfo(data, model) {
    var metadataUri = data[contextUrlAnnotation];
    if (!metadataUri || typeof metadataUri !== "string") {
        return null;
    }

    var fragmentStart = metadataUri.lastIndexOf("#");
    if (fragmentStart === -1) {
        return jsonMakePayloadInfo(PAYLOADTYPE_SVCDOC);
    }

    var fragment = metadataUri.substring(fragmentStart + 1);
    return parseContextUriFragment(fragment,model);
}
/** Gets the key of an entry.
 * @param {Object} data - JSON entry.
 * @param {Object} data - EDM entity model for key loockup.
 * @returns {string} Entry instance key.
 */
function jsonGetEntryKey(data, entityModel) {

    var entityInstanceKey;
    var entityKeys = entityModel.key[0].propertyRef;
    var type;
    entityInstanceKey = "(";
    if (entityKeys.length == 1) {
        type = lookupProperty(entityModel.property, entityKeys[0].name).type;
        entityInstanceKey += formatLiteral(data[entityKeys[0].name], type);
    } else {
        var first = true;
        for (var i = 0; i < entityKeys.length; i++) {
            if (!first) {
                entityInstanceKey += ",";
            } else {
                first = false;
            }
            type = lookupProperty(entityModel.property, entityKeys[i].name).type;
            entityInstanceKey += entityKeys[i].name + "=" + formatLiteral(data[entityKeys[i].name], type);
        }
    }
    entityInstanceKey += ")";
    return entityInstanceKey;
}
/** Determines whether a type name is a primitive type in a JSON payload.
 * @param {String} typeName - Type name to test.
 * @returns {Boolean} True if the type name an EDM primitive type or an OData spatial type; false otherwise.
 */
function jsonIsPrimitiveType(typeName) {
    return isPrimitiveEdmType(typeName) || isGeographyEdmType(typeName) || isGeometryEdmType(typeName);
}


var jsonHandler = oDataHandler.handler(jsonParser, jsonSerializer, jsonMediaType, MAX_DATA_SERVICE_VERSION);
jsonHandler.recognizeDates = false;

exports.createPayloadInfo = createPayloadInfo;
exports.jsonHandler = jsonHandler;
exports.jsonParser = jsonParser;
exports.jsonSerializer = jsonSerializer;
exports.parseJsonDateString = parseJsonDateString;