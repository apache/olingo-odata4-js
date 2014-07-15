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

var odataNs = "odata";
var odataAnnotationPrefix = odataNs + ".";
var contextUrlAnnotation = "@" + odataAnnotationPrefix + "context";

var assigned = utils.assigned;
var defined = utils.defined;
var extend = utils.extend;
var isArray = utils.isArray;
var isDate = utils.isDate;
var isObject = utils.isObject;
var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;

var contentType = oDataUtils.contentType;
var formatDateTimeOffset = oDataUtils.formatDateTimeOffset;
var formatDuration = oDataUtils.formatDuration;
var formatJsonLight = oDataUtils.formatJsonLight;
var formatNumberWidth = oDataUtils.formatNumberWidth;
var getCanonicalTimezone = oDataUtils.getCanonicalTimezone;
var handler = oDataUtils.handler;
var isComplex = oDataUtils.isComplex;
var isCollectionType = oDataUtils.isCollectionType;
var lookupComplexType = oDataUtils.lookupComplexType;
var lookupEntityType = oDataUtils.lookupEntityType;
var lookupSingleton = oDataUtils.lookupSingleton;
var lookupEntitySet = oDataUtils.lookupEntitySet;
var lookupDefaultEntityContainer = oDataUtils.lookupDefaultEntityContainer;
var lookupProperty = oDataUtils.lookupProperty;
var MAX_DATA_SERVICE_VERSION = oDataUtils.MAX_DATA_SERVICE_VERSION;
var maxVersion = oDataUtils.maxVersion;
var parseDateTime = oDataUtils.parseDateTime;
var parseDuration = oDataUtils.parseDuration;
var parseTimezone = oDataUtils.parseTimezone;
var payloadTypeOf = oDataUtils.payloadTypeOf;
var traverse = oDataUtils.traverse;

// CONTENT START

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

    var recognizeDates = defined(context.recognizeDates, handler.recognizeDates);
    var inferJsonLightFeedAsObject = defined(context.inferJsonLightFeedAsObject, handler.inferJsonLightFeedAsObject);
    var model = context.metadata;
    var dataServiceVersion = context.dataServiceVersion;
    var json = (typeof text === "string") ? JSON.parse(text) : text;
    var metadataMap = { none : 0, minimal : 1, full : 2, all : 3 };

    var payloadFormat = 1;//minmal
    try {
        payloadFormat = metadataMap[context.contentType.properties["odata.metadata"]];//TODO convert to lower before comparism
    } catch(err) {
        payloadFormat = 1;
    }
    payloadFormat = (payloadFormat === undefined) ? 1 : payloadFormat;

    var demandedFormat = 1;//minmal
    try {
        demandedFormat = metadataMap[context.extendMetadataToLevel]; //TODO convert to lower before comparism
    } catch(err) {
        demandedFormat = 1;
    }
    demandedFormat = (demandedFormat === undefined) ? 1 : demandedFormat;

    if ( payloadFormat >= demandedFormat) {
        //there is no need to add additional metadata
        if (recognizeDates) {
            if (payloadFormat === 0) {
                //error no typeinformation in payload, conversion of dates not possible
            } else if (payloadFormat === 1) { //minimal
                //TODO use metadata in context to determine which properties need to be converted
            } else {
                return convertPrimitivetypesOnMetadataFull(json); //should be fast    
            }
        } else {
            return json;
        }
    } else {
        if (payloadFormat === 2) { 
            //demandedFormat is all
            //metaData=full, no metadata in context required
            //insert the missing type information for strings, bool, etc.
            //guess types for nummber as defined in the odata-json-format-v4.0.doc specification
            return extendMetadataFromPayload(json,context,recognizeDates);
        } else if (payloadFormat === 1) { //minmal
            if (!utils.isArray(model)) { // array was default for model in datajsV3 3.0 
                //TODO use metadata in context to determine which properties need to be converted
                // and extend the metadata
                return extendMetadataFromContext(json,context,model,demandedFormat, recognizeDates);
            } else {
                //error metadata in context required, TODO: throw a to be defined exception
            }
        } else {
            // the payload contains no context url only guessing possible
            return json;
        }
    }
};

var extendMetadataFromContext = function(json,context, model,demandedFormat,recognizeDates) {
    return jsonLightReadPayload(json, model, demandedFormat,recognizeDates, false, context.contentType.properties['odata.metadata']);
};

var convertPrimitivetypesOnMetadataFull = function(data) {
    /// <summary>Converts some primitive data types in payload</summary>
    /// <param name="data">Date which will be extendet</param>
    /// <returns>An object representation of the OData payload.</returns>

    if ( utils.isObject(data) ) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (key.indexOf('@') === -1) {
                    if (utils.isArray(data[key])) {
                        for ( var i = 0; i < data[key].length; ++i) {
                            convertPrimitivetypesOnMetadataFull(data[key][i]);
                        }
                    } else if (utils.isObject(data[key])) {
                        if (data[key] !== null) {
                            convertPrimitivetypesOnMetadataFull(data[key]);
                        }
                    } else {
                        var type = data[key+'@odata.type'];
                        if ( type === undefined ) {
                            var typeFromObject = typeof data[key];
                            //TODO check the datatype                             
                        } else if ( type === '#DateTimeOffset' ) {
                           data[key] = oDataUtils.parseDateTimeOffset(data[key],true);
                        } else if ( type === '#DateTime' ) {
                           data[key] = oDataUtils.parseDateTimeOffset(data[key],true);
                        }
                        //TODO handle more types there 
                    }
                }
            }
        }
    }
    return data;
};


var addType = function(data, name, value ) {
    var fullName = name+'@odata.type';

    if ( data[fullName] === undefined) {
        data[fullName] = value;
    }
};

var extendMetadataFromPayload = function(data,context,recognizeDates) {
    /// <summary>Adds typeinformation for String, Boolean and numerical EDM-types. 
    /// The type is determined from the odata-json-format-v4.0.doc specification
    ///</summary>
    /// <param name="data">Date which will be extendet</param>
    /// <param name="context" type="Object">Object with parsing context.</param>
    /// <param name="recognizeDates" type="Boolean">
    ///     True if strings formatted as datetime values should be treated as datetime values. False otherwise.
    /// </param>
    /// <returns>An object representation of the OData payload.</returns>

    if ( utils.isObject(data) ) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (key.indexOf('@') === -1) {
                    if (utils.isArray(data[key])) {
                        for ( var i = 0; i < data[key].length; ++i) {
                            extendMetadataFromPayload(data[key][i], context, recognizeDates);
                        }
                    } else if (utils.isObject(data[key])) {
                        if (data[key] !== null) {
                            extendMetadataFromPayload(data[key],context, recognizeDates);
                        }
                    } else {
                        if (recognizeDates) {
                            var type = data[key+'@odata.type'];
                            if ( type === undefined ) {
                                var typeFromObject = typeof data[key];
                                //TODO check the datatype                             
                            } else if ( type === '#DateTimeOffset' ) {
                               data[key] = oDataUtils.parseDateTimeOffset(data[key],true);
                            } else if ( type === '#DateTime' ) {
                               data[key] = oDataUtils.parseDateTimeOffset(data[key],true);
                            }
                            //TODO handle more types there 
                        }
                        var typeFromObject = typeof data[key];
                        if ( typeFromObject === 'string' ) {
                           addType(data,key,'#String');
                        } else if (typeFromObject ==='boolean') {
                            addType(data,key,'#Bool');
                        } else if (typeFromObject ==='number') {
                            if ( data[key] % 1 === 0 ) { // has fraction 
                                addType(data,key,'#Integer');// the biggst integer
                            } else {
                                addType(data,key,'#Decimal');// the biggst float single,doulbe,decimal
                            }
                        }
                    }
                }
            }
        }
    }
    return data;
};



/*
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
            return formatDateTimeOffsetJSON(this);
        };
        result = JSON.stringify(data, jsonReplacer);
        result = result.replace(/\/Date\(([0-9.+-]+)\)\//g, "\\/Date($1)\\/");
    } finally {
        // Restore the original toJSON function
        Date.prototype.toJSON = dateToJSON;
    }
    return result;
};*/

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

var formatJsonLightRequestPayload = function (data) {
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
            newArrayData[i] = formatJsonLightRequestPayload(data[i]);
        }

        return newArrayData;
    }

    var newdata = {};
    for (var property in data) {
        if (isJsonLightSerializableProperty(property)) {
            newdata[property] = formatJsonLightRequestPayload(data[property]);
        }
    }

    return newdata;
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


var jsonLightMakePayloadInfo = function (kind, type) {
    /// <summary>Creates an object containing information for the json light payload.</summary>
    /// <param name="kind" type="String">JSON light payload kind, one of the PAYLOADTYPE_XXX constant values.</param>
    /// <param name="typeName" type="String">Type name of the JSON light payload.</param>
    /// <returns type="Object">Object with kind and type fields.</returns>

    /// <field name="kind" type="String">Kind of the JSON light payload. One of the PAYLOADTYPE_XXX constant values.</field>
    /// <field name="type" type="String">Data type of the JSON light payload.</field>

    return { kind: kind, type: type || null };
};

/// <summary>Creates an object containing information for the context</summary>
/// ...
/// <returns type="Object">Object with type information
/// attribute detectedPayloadKind(optional): see constants starting with PAYLOADTYPE_
/// attribute deltaKind(optional): deltainformation, one of the following valus DELTATYPE_FEED | DELTATYPE_DELETED_ENTRY | DELTATYPE_LINK | DELTATYPE_DELETED_LINK
/// attribute typeName(optional): name of the type
/// attribute type(optional): object containing type information for entity- and complex-types ( null if a typeName is a primitive)
///  </returns>
var parseContextUriFragment = function( fragments, model ) {
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

                    var type = lookupEntityType(ret.typeName, model);
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

            if (jsonLightIsPrimitiveType(fragment)) {
                ret.typeName = fragment;
                ret.type = null;
                ret.detectedPayloadKind = PAYLOADTYPE_VALUE;
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
                var type = lookupEntityType(ret.typeName, model);
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
                    ret.typeName = property.type;
                    ret.type = lookupComplexType(ret.typeName, model);
                    ret.name = fragment;
                    ret.detectedPayloadKind = PAYLOADTYPE_PROPERTY;
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
};

var jsonLightPayloadInfo = function (data, model) {
    /// <summary>Infers the information describing the JSON light payload from its metadata annotation, structure, and data model.</summary>
    /// <param name="data" type="Object">Json light response payload object.</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
    /// <remarks>
    ///     If the arguments passed to the function don't convey enough information about the payload to determine without doubt that the payload is a feed then it
    ///     will try to use the payload object structure instead.  If the payload looks like a feed (has value property that is an array or non-primitive values) then
    ///     the function will report its kind as PAYLOADTYPE_FEED unless the inferFeedAsComplexType flag is set to true. This flag comes from the user request
    ///     and allows the user to control how the library behaves with an ambigous JSON light payload.
    /// </remarks>
    /// <returns type="Object">
    ///     Object with kind and type fields. Null if there is no metadata annotation or the payload info cannot be obtained..
    /// </returns>

    var metadataUri = data[contextUrlAnnotation];
    if (!metadataUri || typeof metadataUri !== "string") {
        return null;
    }

    var fragmentStart = metadataUri.lastIndexOf("#");
    if (fragmentStart === -1) {
        return jsonLightMakePayloadInfo(PAYLOADTYPE_SVCDOC);
    }

    var fragment = metadataUri.substring(fragmentStart + 1);
    return parseContextUriFragment(fragment,model);
};

var jsonLightReadPayload = function (data, model, demandedFormat,recognizeDates, inferFeedAsComplexType, contentTypeOdata) {
    /// <summary>Converts a JSON light response payload object into its library's internal representation.</summary>
    /// <param name="data" type="Object">Json light response payload object.</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
    /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <param name="inferFeedAsComplexType" type="Boolean">True if a JSON light payload that looks like a feed should be reported as a complex type property instead.</param>
    /// <param name="contentTypeOdata" type="string">Includes the type of json ( minimalmetadata, fullmetadata .. etc )</param>
    /// <returns type="Object">Object in the library's representation.</returns>

    if (!isComplex(data)) {
        return data;
    }

    contentTypeOdata = contentTypeOdata || "minimal";
    var baseURI = data[contextUrlAnnotation];
    var payloadInfo = jsonLightPayloadInfo(data, model, inferFeedAsComplexType);
    if (assigned(payloadInfo)) {
        payloadInfo.contentTypeOdata = contentTypeOdata;
    }
    var typeName = null;
    if (payloadInfo) {
        delete data[contextUrlAnnotation];

        typeName = payloadInfo.type;
        switch (payloadInfo.detectedPayloadKind) {
            case PAYLOADTYPE_FEED:
                return jsonLightReadFeed(data, payloadInfo, baseURI, model, demandedFormat,recognizeDates);
            case PAYLOADTYPE_COLLECTION:
                return jsonLightReadTopCollectionProperty(data, typeName, baseURI, model, recognizeDates);
            case PAYLOADTYPE_PRIMITIVE:
                return jsonLightReadTopPrimitiveProperty(data, typeName, baseURI, recognizeDates);
            case PAYLOADTYPE_SVCDOC:
                return jsonLightReadSvcDocument(data, baseURI);
            case PAYLOADTYPE_LINKS:
                return jsonLightReadLinksDocument(data, baseURI);
        }
    }
    return jsonLightReadObject(data, payloadInfo, baseURI, model, recognizeDates);
};

var jsonLightGetEntryKey = function (data, entityModel) {
    /// <summary>Gets the key of an entry.</summary>
    /// <param name="data" type="Object">JSON light entry.</param>
    /// <param name="entityModel" type="String">Object describing the entry Model</param>
    /// <returns type="string">Entry instance key.</returns>

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
};



var jsonLightReadFeed = function (data, feedInfo, baseURI, model, demandedFormat,recognizeDates) {
    var entries = [];
    var items = data.value;
    for (i = 0, len = items.length; i < len; i++) {
        //TODO SK check if items[i] has @odata.type and use this type instead of  feedinfo
        
        if ( items[i]['@odata.type'] !== undefined) {
            var typeName = items[i]['@odata.type'].substring(1);
            var type = lookupEntityType( typeName, model);
            var entryInfo = {
                contentTypeOdata : feedInfo.contentTypeOdata,
                detectedPayloadKind : feedInfo.detectedPayloadKind,
                name : feedInfo.name,
                type : type,
                typeName : typeName
            };

            entry = jsonLightReadObject(items[i], entryInfo, baseURI, model, demandedFormat,recognizeDates);
        } else {
            entry = jsonLightReadObject(items[i], feedInfo, baseURI, model, demandedFormat,recognizeDates);
        }
        
        entries.push(entry);
    }
    data.value = entries;
    return data;
};













/*
var jsonNormalizeData = function (data, baseURI) {
    /// <summary>
    /// Normalizes the specified data into an intermediate representation.
    /// like the latest supported version.
    /// </summary>
    /// <param name="data" optional="false">Data to update.</param>
    /// <param name="baseURI" optional="false">URI to use as the base for normalizing references.</param>

    var isSvcDoc = isComplex(data) && !data.__metadata && isArray(data.EntitySets);
    return isSvcDoc ? normalizeServiceDocument(data, baseURI) : data;
};*/

var formatLiteral = function (value, type) {
    /// <summary>Formats a value according to Uri literal format</summary>
    /// <param name="value">Value to be formatted.</param>
    /// <param name="type">Edm type of the value</param>
    /// <returns type="string">Value after formatting</returns>

    value = "" + formatRowLiteral(value, type);
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
};

var formatRowLiteral = function (value, type) {
    switch (type) {
        case "Edm.Binary":
            return convertByteArrayToHexString(value);
        default:
            return value;
    }
};

var checkProperties = function(data,objectInfoType,baseURI,model, demandedFormat, recognizeDates) {
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
                data[name+'@odata.type'] = '#' + property.type;
                for ( var i = 0; i < propertyValue.length; i++) {
                    jsonLightReadComplexObject(propertyValue[0], property,baseURI,model,demandedFormat, recognizeDates);
                }
            } else if (isObject(propertyValue) && (propertyValue !== null)) {
                jsonLightReadComplexObject(propertyValue, property,baseURI,model,demandedFormat, recognizeDates);
            } else {
                if (demandedFormat === 3)  {
                    data[name+'@odata.type'] = '#' + property.type;
                } else {
                    if ( property.type != "Edm.String" &&
                         property.type != "Edm.Boolean" &&
                         property.type != "Edm.Int32" &&
                         property.type != "Edm.Single" &&
                         property.type != "Edm.Double" ) {
                         data[name+'@odata.type'] = '#' + property.type;
                    }
                }
            }
        }
    }
};

var jsonLightReadComplexObject = function (data, property, baseURI, model, demandedFormat, recognizeDates) {
    var type = property.type;
    if (isCollectionType(property.type)) {
        type =property.type.substring(11,property.type.length-1);
    }

    data['@odata.type'] = '#'+type;

    var propertyType = lookupComplexType(type, model);
    if (propertyType === null)  {
        return; //TODO check what to do if the type is not known e.g. type #GeometryCollection
    }
  
    checkProperties(data,propertyType ,baseURI,model, demandedFormat, recognizeDates);
};

var jsonLightReadObject = function (data, objectInfo, baseURI, model, demandedFormat, recognizeDates) {
    //var obj = {};

    data['@odata.type'] = '#'+objectInfo.typeName;

    var keyType = objectInfo.type;
    while (( keyType.key === undefined) && (keyType.baseType !== undefined)) {
        keyType = lookupEntityType(keyType.baseType, model);
    }

    var lastIdSegment = objectInfo.name + jsonLightGetEntryKey(data, keyType);
    data['@odata.id'] = baseURI.substring(0, baseURI.lastIndexOf("$metadata")) + lastIdSegment;
    data['@odata.editLink'] = lastIdSegment;

    var serviceURI = baseURI.substring(0, baseURI.lastIndexOf("$metadata"));
    //jsonLightComputeUrisIfMissing(data, entryInfo, actualType, serviceURI, dataModel, baseTypeModel);

    checkProperties(data,objectInfo.type,baseURI,model, demandedFormat, recognizeDates);
    
    return data;
};


var jsonHandler = oDataHandler.handler(jsonParser, jsonSerializer, jsonMediaType, MAX_DATA_SERVICE_VERSION);
jsonHandler.recognizeDates = false;
jsonHandler.useJsonLight = true;
jsonHandler.inferJsonLightFeedAsObject = false;

exports.jsonHandler = jsonHandler;

exports.jsonParser = jsonParser;
exports.jsonSerializer = jsonSerializer;

exports.parseJsonDateString = parseJsonDateString;
exports.jsonLightPayloadInfo = jsonLightPayloadInfo;


