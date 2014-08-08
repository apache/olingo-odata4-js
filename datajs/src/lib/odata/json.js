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

var utils        = require('./../datajs.js').utils;
var oDataUtils   = require('./utils.js');
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
var XXXparseDateTime = oDataUtils.XXXparseDateTime;

var isPrimitiveEdmType = oDataUtils.isPrimitiveEdmType;
var isGeographyEdmType = oDataUtils.isGeographyEdmType;
var isGeometryEdmType = oDataUtils.isGeometryEdmType;
//var parseDuration = oDataUtils.parseDuration;
//var parseTimezone = oDataUtils.parseTimezone;
//var payloadTypeOf = oDataUtils.payloadTypeOf;
//var traverse = oDataUtils.traverse;

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
        return readPayloadMinimal(json, model, recognizeDates);
    }
    else if (payloadFormat === 2) {
        // to do: using the EDM Model to get the type of each property instead of just guessing.
        return readPayloadFull(json, model, recognizeDates);
    }
    else {
        return json;
    }
};


var addType = function(data, name, value ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        data[fullName] = value;
    }
};

var addTypeNoEdm = function(data, name, value ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        if ( value.substring(0,4)==='Edm.') {
            data[fullName] = value.substring(4);
        } else {
            data[fullName] = value;
        }

    }
};

var addTypeColNoEdm = function(data, name, value ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        if ( value.substring(0,4)==='Edm.') {
            data[fullName] = 'Collection('+value.substring(4)+ ')';
        } else {
            data[fullName] = 'Collection('+value+ ')';
        }
    }
};


var readPayloadFull = function (data, model, recognizeDates) {
    /// <summary>Adds typeinformation for String, Boolean and numerical EDM-types. 
    /// The type is determined from the odata-json-format-v4.0.doc specification
    ///</summary>
    /// <param name="data">Date which will be extendet</param>
    /// <param name="recognizeDates" type="Boolean">
    ///     True if strings formatted as datetime values should be treated as datetime values. False otherwise.
    /// </param>
    /// <returns>An object representation of the OData payload.</returns>

    if (utils.isObject(data)) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (key.indexOf('@') === -1) {
                    if (utils.isArray(data[key])) {
                        for (var i = 0; i < data[key].length; ++i) {
                            readPayloadFull(data[key][i], model, recognizeDates);
                        }
                    } else if (utils.isObject(data[key])) {
                        if (data[key] !== null) {
                            //don't step into geo.. objects
                            var isGeo = false;
                            var type = data[key+'@odata.type'];
                            if (type && (isGeographyEdmType(type) || isGeometryEdmType(type))) {
                                // is gemometry type
                            } else {
                                readPayloadFull(data[key], model, recognizeDates);
                            }
                        }
                    } else {
                        var type = data[key + '@odata.type'];

                        // On .Net OData library, some basic EDM type is omitted, e.g. Edm.String, Edm.Int, and etc.
                        // For the full metadata payload, we need to full fill the @data.type for each property if it is missing. 
                        // We do this is to help the OlingoJS consumers to easily get the type of each property.
                        if (!assigned(type)) {
                            // Guessing the "type" from the type of the value is not the right way here. 
                            // To do: we need to get the type from metadata instead of guessing. 
                            var typeFromObject = typeof data[key];
                            if (typeFromObject === 'string') {
                                addType(data, key, '#String');
                            } else if (typeFromObject === 'boolean') {
                                addType(data, key, '#Boolean');
                            } else if (typeFromObject === 'number') {
                                if (data[key] % 1 === 0) { // has fraction 
                                    addType(data, key, '#Int32'); // the biggst integer
                                } else {
                                    addType(data, key, '#Decimal'); // the biggst float single,doulbe,decimal
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
        var newdata = formatJsonRequestPayload(data);
        if (newdata) {
            return JSON.stringify(newdata);
        }
    }

    return undefined;
};

var formatJsonRequestPayload = function (data) {
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


var jsonMakePayloadInfo = function (kind, type) {
    /// <summary>Creates an object containing information for the json payload.</summary>
    /// <param name="kind" type="String">JSON payload kind, one of the PAYLOADTYPE_XXX constant values.</param>
    /// <param name="typeName" type="String">Type name of the JSON payload.</param>
    /// <returns type="Object">Object with kind and type fields.</returns>

    /// <field name="kind" type="String">Kind of the JSON payload. One of the PAYLOADTYPE_XXX constant values.</field>
    /// <field name="type" type="String">Data type of the JSON payload.</field>

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
};

var createPayloadInfo = function (data, model) {
    /// <summary>Infers the information describing the JSON payload from its metadata annotation, structure, and data model.</summary>
    /// <param name="data" type="Object">Json response payload object.</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
    /// <remarks>
    ///     If the arguments passed to the function don't convey enough information about the payload to determine without doubt that the payload is a feed then it
    ///     will try to use the payload object structure instead.  If the payload looks like a feed (has value property that is an array or non-primitive values) then
    ///     the function will report its kind as PAYLOADTYPE_FEED unless the inferFeedAsComplexType flag is set to true. This flag comes from the user request
    ///     and allows the user to control how the library behaves with an ambigous JSON payload.
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
        return jsonMakePayloadInfo(PAYLOADTYPE_SVCDOC);
    }

    var fragment = metadataUri.substring(fragmentStart + 1);
    return parseContextUriFragment(fragment,model);
};

var readPayloadMinimal = function (data, model, recognizeDates) {
    /// <summary>Processe a JSON response payload with metadata-minimal</summary>
    /// <param name="data" type="Object">Json response payload object</param>
    /// <param name="model" type="Object">Object describing an OData conceptual schema</param>
    /// <param name="recognizeDates" type="Boolean">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
    /// <returns type="Object">Object in the library's representation.</returns>

    if (!assigned(model) || isArray(model)) {
        return data;
    }

    var baseURI = data[contextUrlAnnotation];
    var payloadInfo = createPayloadInfo(data, model);

    switch (payloadInfo.detectedPayloadKind) {
        case PAYLOADTYPE_VALUE:
            return readPayloadMinimalProperty(data, model, payloadInfo, baseURI, recognizeDates);
        case PAYLOADTYPE_FEED:
            return readPayloadMinimalFeed(data, model, payloadInfo, baseURI, recognizeDates);
        case PAYLOADTYPE_ENTRY:
            return readPayloadMinimalEntry(data, model, payloadInfo, baseURI, recognizeDates);
        case PAYLOADTYPE_COLLECTION:
            return readPayloadMinimalCollection(data, model, payloadInfo, baseURI, recognizeDates);
        case PAYLOADTYPE_PROPERTY:
            return readPayloadMinimalProperty(data, model, payloadInfo, baseURI, recognizeDates);
        case PAYLOADTYPE_SVCDOC:
            return data;
        case PAYLOADTYPE_LINKS:
            return data;
    }

    return data;
};

var jsonGetEntryKey = function (data, entityModel) {
    /// <summary>Gets the key of an entry.</summary>
    /// <param name="data" type="Object">JSON entry.</param>
    /// <paraFrom   Subject Received    Size    Categories  
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

var readPayloadMinimalProperty = function (data, model, collectionInfo, baseURI, recognizeDates) {
    if (collectionInfo.type !== null) {
        readPayloadMinimalObject(data, collectionInfo, baseURI, model, recognizeDates);
    } else {
        addTypeNoEdm(data,'value', collectionInfo.typeName);
        //data['value@odata.type'] = '#'+collectionInfo.typeName;
    }
    return data;
};

var readPayloadMinimalCollection = function (data, model, collectionInfo, baseURI, recognizeDates) {
    //data['@odata.type'] = '#Collection('+collectionInfo.typeName + ')';
    addTypeColNoEdm(data,'', collectionInfo.typeName);

    if (collectionInfo.type !== null) {
        var entries = [];

        var items = data.value;
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

                entry = readPayloadMinimalObject(item, entryInfo, baseURI, model, recognizeDates);
            } else {
                entry = readPayloadMinimalObject(item, collectionInfo, baseURI, model, recognizeDates);
            }
            
            entries.push(entry);
        }
        data.value = entries;
    }
    return data;
};
var readPayloadMinimalFeed = function (data, model, feedInfo, baseURI, recognizeDates) {
    var entries = [];
    var items = data.value;
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

            entry = readPayloadMinimalObject(item, entryInfo, baseURI, model, recognizeDates);
        } else {
            entry = readPayloadMinimalObject(item, feedInfo, baseURI, model, recognizeDates);
        }
        
        entries.push(entry);
    }
    data.value = entries;
    return data;
};

var readPayloadMinimalEntry = function (data, model, entryInfo, baseURI, recognizeDates) {
    return readPayloadMinimalObject(data, entryInfo, baseURI, model, recognizeDates);
};

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

var convertDates = function (data, propertyName,type) {
    if (type === 'Edm.Date') {
        data[propertyName] = oDataUtils.parseDate(data[propertyName], true);
    } else if (type === 'Edm.DateTimeOffset') {
        data[propertyName] = oDataUtils.parseDateTimeOffset(data[propertyName], true);
    } else if (type === 'Edm.Duration') {
        data[propertyName] = oDataUtils.parseDuration(data[propertyName], true);
    } else if (type === 'Edm.Time') {
        data[propertyName] = oDataUtils.parseTime(data[propertyName], true);
    }
};

var convertDatesNoEdm = function (data, propertyName,type) {
    if (type === 'Date') {
        data[propertyName] = oDataUtils.parseDate(data[propertyName], true);
    } else if (type === 'DateTimeOffset') {
        data[propertyName] = oDataUtils.parseDateTimeOffset(data[propertyName], true);
    } else if (type === 'Duration') {
        data[propertyName] = oDataUtils.parseDuration(data[propertyName], true);
    } else if (type === 'Time') {
        data[propertyName] = oDataUtils.parseTime(data[propertyName], true);
    }
};

var checkProperties = function (data, objectInfoType, baseURI, model, recognizeDates) {
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
                    readPayloadMinimalComplexObject(propertyValue[i], property, baseURI, model, recognizeDates);
                }
            } else if (isObject(propertyValue) && (propertyValue !== null)) {
                readPayloadMinimalComplexObject(propertyValue, property, baseURI, model, recognizeDates);
            } else {
                //data[name+'@odata.type'] = '#' + property.type;
                addTypeNoEdm(data,name,property.type);
                if (recognizeDates) {
                    convertDates(data, name, property.type);
                }
            }
        }
    }
};

var readPayloadMinimalComplexObject = function (data, property, baseURI, model, recognizeDates) {
    var type = property.type;
    if (isCollectionType(property.type)) {
        type =property.type.substring(11,property.type.length-1);
    }

    //data['@odata.type'] = '#'+type;
    addType(data,'',property.type);


    var propertyType = lookupComplexType(type, model);
    if (propertyType === null)  {
        return; //TODO check what to do if the type is not known e.g. type #GeometryCollection
    }
  
    checkProperties(data, propertyType, baseURI, model, recognizeDates);
};

var readPayloadMinimalObject = function (data, objectInfo, baseURI, model, recognizeDates) {
    //data['@odata.type'] = '#'+objectInfo.typeName;
    addType(data,'',objectInfo.typeName);

    var keyType = objectInfo.type;
    while ((defined(keyType)) && ( keyType.key === undefined) && (keyType.baseType !== undefined)) {
        keyType = lookupEntityType(keyType.baseType, model);
    }

    //if ((keyType !== undefined) && (keyType.key !== undefined)) { 
    if (keyType.key !== undefined) { 
        var lastIdSegment = objectInfo.name + jsonGetEntryKey(data, keyType);
        data['@odata.id'] = baseURI.substring(0, baseURI.lastIndexOf("$metadata")) + lastIdSegment;
        data['@odata.editLink'] = lastIdSegment;
    }

    var serviceURI = baseURI.substring(0, baseURI.lastIndexOf("$metadata"));
    //json ComputeUrisIfMissing(data, entryInfo, actualType, serviceURI, dataModel, baseTypeModel);

    checkProperties(data, objectInfo.type, baseURI, model, recognizeDates);
    
    return data;
};

var jsonSerializableMetadata = ["@odata.id", "@odata.type"];

var isJsonSerializableProperty = function (property) {
    if (!property) {
        return false;
    }

    if (property.indexOf("@odata.") == -1) {
        return true;
    } 

    var i, len;
    for (i = 0, len = jsonSerializableMetadata.length; i < len; i++) {
        var name = jsonSerializableMetadata[i];
        if (property.indexOf(name) != -1) {
            return true;
        }
    }

    return false;
};

var jsonIsPrimitiveType = function (typeName) {
    /// <summary>Determines whether a type name is a primitive type in a JSON payload.</summary>
    /// <param name="typeName" type="String">Type name to test.</param>
    /// <returns type="Boolean">True if the type name an EDM primitive type or an OData spatial type; false otherwise.</returns>

    return isPrimitiveEdmType(typeName) || isGeographyEdmType(typeName) || isGeometryEdmType(typeName);
};


var jsonHandler = oDataHandler.handler(jsonParser, jsonSerializer, jsonMediaType, MAX_DATA_SERVICE_VERSION);
jsonHandler.recognizeDates = false;

exports.jsonHandler = jsonHandler;
exports.jsonParser = jsonParser;
exports.jsonSerializer = jsonSerializer;
exports.parseJsonDateString = parseJsonDateString;
