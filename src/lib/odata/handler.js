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

/** @module odata/handler */


var utils    = require('./../utils.js');
var oDataUtils    = require('./odatautils.js');

// Imports.
var assigned = utils.assigned;
var extend = utils.extend;
var trimString = utils.trimString;
var maxVersion = oDataUtils.maxVersion;
var MAX_DATA_SERVICE_VERSION = "4.0";

/** Parses a string into an object with media type and properties.
 * @param {String} str - String with media type to parse.
 * @return null if the string is empty; an object with 'mediaType' and a 'properties' dictionary otherwise.
 */
function contentType(str) {

    if (!str) {
        return null;
    }

    var contentTypeParts = str.split(";");
    var properties = {};

    var i, len;
    for (i = 1, len = contentTypeParts.length; i < len; i++) {
        var contentTypeParams = contentTypeParts[i].split("=");
        properties[trimString(contentTypeParams[0])] = contentTypeParams[1];
    }

    return { mediaType: trimString(contentTypeParts[0]), properties: properties };
}

/** Serializes an object with media type and properties dictionary into a string.
 * @param contentType - Object with media type and properties dictionary to serialize.
 * @return String representation of the media type object; undefined if contentType is null or undefined.
 */
function contentTypeToString(contentType) {
    if (!contentType) {
        return undefined;
    }

    var result = contentType.mediaType;
    var property;
    for (property in contentType.properties) {
        result += ";" + property + "=" + contentType.properties[property];
    }
    return result;
}

/** Creates an object that is going to be used as the context for the handler's parser and serializer.
 * @param contentType - Object with media type and properties dictionary.
 * @param {String} dataServiceVersion - String indicating the version of the protocol to use.
 * @param context - Operation context.
 * @param handler - Handler object that is processing a resquest or response.
 * @return Context object.
 */
function createReadWriteContext(contentType, dataServiceVersion, context, handler) {

    var rwContext = {};
    extend(rwContext, context);
    extend(rwContext, {
        contentType: contentType,
        dataServiceVersion: dataServiceVersion,
        handler: handler
    });

    return rwContext;
}

/** Sets a request header's value. If the header has already a value other than undefined, null or empty string, then this method does nothing.
 * @param request - Request object on which the header will be set.
 * @param {String} name - Header name.
 * @param {String} value - Header value.
 */
function fixRequestHeader(request, name, value) {
    if (!request) {
        return;
    }

    var headers = request.headers;
    if (!headers[name]) {
        headers[name] = value;
    }
}

/** Sets the DataServiceVersion header of the request if its value is not yet defined or of a lower version.
 * @param request - Request object on which the header will be set.
 * @param {String} version - Version value.
 *  If the request has already a version value higher than the one supplied the this function does nothing.
 */
function fixDataServiceVersionHeader(request, version) {   

    if (request) {
        var headers = request.headers;
        var dsv = headers["OData-Version"];
        headers["OData-Version"] = dsv ? maxVersion(dsv, version) : version;
    }
}

/** Gets the value of a request or response header.
 * @param requestOrResponse - Object representing a request or a response.
 * @param {String} name - Name of the header to retrieve.
 * @returns {String} String value of the header; undefined if the header cannot be found.
 */
function getRequestOrResponseHeader(requestOrResponse, name) {

    var headers = requestOrResponse.headers;
    return (headers && headers[name]) || undefined;
}

/** Gets the value of the Content-Type header from a request or response.
 * @param requestOrResponse - Object representing a request or a response.
 * @returns {Object} Object with 'mediaType' and a 'properties' dictionary; null in case that the header is not found or doesn't have a value.
 */
function getContentType(requestOrResponse) {

    return contentType(getRequestOrResponseHeader(requestOrResponse, "Content-Type"));
}

var versionRE = /^\s?(\d+\.\d+);?.*$/;
/** Gets the value of the DataServiceVersion header from a request or response.
 * @param requestOrResponse - Object representing a request or a response.
 * @returns {String} Data service version; undefined if the header cannot be found.
 */
function getDataServiceVersion(requestOrResponse) {

    var value = getRequestOrResponseHeader(requestOrResponse, "OData-Version");
    if (value) {
        var matches = versionRE.exec(value);
        if (matches && matches.length) {
            return matches[1];
        }
    }

    // Fall through and return undefined.
}

/** Checks that a handler can process a particular mime type.
 * @param handler - Handler object that is processing a resquest or response.
 * @param cType - Object with 'mediaType' and a 'properties' dictionary.
 * @returns {Boolean} True if the handler can process the mime type; false otherwise.
 *
 * The following check isn't as strict because if cType.mediaType = application/; it will match an accept value of "application/xml";
 * however in practice we don't not expect to see such "suffixed" mimeTypes for the handlers.
 */
function handlerAccepts(handler, cType) {
    return handler.accept.indexOf(cType.mediaType) >= 0;
}

/** Invokes the parser associated with a handler for reading the payload of a HTTP response.
 * @param handler - Handler object that is processing the response.
 * @param {Function} parseCallback - Parser function that will process the response payload.
 * @param response - HTTP response whose payload is going to be processed.
 * @param context - Object used as the context for processing the response.
 * @returns {Boolean} True if the handler processed the response payload and the response.data property was set; false otherwise.
 */
function handlerRead(handler, parseCallback, response, context) {

    if (!response || !response.headers) {
        return false;
    }

    var cType = getContentType(response);
    var version = getDataServiceVersion(response) || "";
    var body = response.body;

    if (!assigned(body)) {
        return false;
    }

    if (handlerAccepts(handler, cType)) {
        var readContext = createReadWriteContext(cType, version, context, handler);
        readContext.response = response;
        response.data = parseCallback(handler, body, readContext);
        return response.data !== undefined;
    }

    return false;
}

/** Invokes the serializer associated with a handler for generating the payload of a HTTP request.
 * @param handler - Handler object that is processing the request.
 * @param {Function} serializeCallback - Serializer function that will generate the request payload.
 * @param request - HTTP request whose payload is going to be generated.
 * @param context - Object used as the context for serializing the request.
 * @returns {Boolean} True if the handler serialized the request payload and the request.body property was set; false otherwise.
 */
function handlerWrite(handler, serializeCallback, request, context) {
    if (!request || !request.headers) {
        return false;
    }

    var cType = getContentType(request);
    var version = getDataServiceVersion(request);

    if (!cType || handlerAccepts(handler, cType)) {
        var writeContext = createReadWriteContext(cType, version, context, handler);
        writeContext.request = request;

        request.body = serializeCallback(handler, request.data, writeContext);

        if (request.body !== undefined) {
            fixDataServiceVersionHeader(request, writeContext.dataServiceVersion || "4.0");

            fixRequestHeader(request, "Content-Type", contentTypeToString(writeContext.contentType));
            fixRequestHeader(request, "OData-MaxVersion", handler.maxDataServiceVersion);
            return true;
        }
    }

    return false;
}

/** Creates a handler object for processing HTTP requests and responses.
 * @param {Function} parseCallback - Parser function that will process the response payload.
 * @param {Function} serializeCallback - Serializer function that will generate the request payload.
 * @param {String} accept - String containing a comma separated list of the mime types that this handler can work with.
 * @param {String} maxDataServiceVersion - String indicating the highest version of the protocol that this handler can work with.
 * @returns {Object} Handler object.
 */
function handler(parseCallback, serializeCallback, accept, maxDataServiceVersion) {

    return {
        accept: accept,
        maxDataServiceVersion: maxDataServiceVersion,

        read: function (response, context) {
            return handlerRead(this, parseCallback, response, context);
        },

        write: function (request, context) {
            return handlerWrite(this, serializeCallback, request, context);
        }
    };
}

function textParse(handler, body /*, context */) {
    return body;
}

function textSerialize(handler, data /*, context */) {
    if (assigned(data)) {
        return data.toString();
    } else {
        return undefined;
    }
}




exports.textHandler = handler(textParse, textSerialize, "text/plain", MAX_DATA_SERVICE_VERSION);
exports.contentType = contentType;
exports.contentTypeToString = contentTypeToString;
exports.handler = handler;
exports.createReadWriteContext = createReadWriteContext;
exports.fixRequestHeader = fixRequestHeader;
exports.getRequestOrResponseHeader = getRequestOrResponseHeader;
exports.getContentType = getContentType;
exports.getDataServiceVersion = getDataServiceVersion;
exports.MAX_DATA_SERVICE_VERSION = MAX_DATA_SERVICE_VERSION;