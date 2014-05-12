//SK name /odata/odata-handler.js
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

// odata-handler.js

var utils    = require('./../datajs.js').utils;
var oDataUtils    = require('./utils.js');


// Imports.
var assigned = utils.assigned;
var extend = utils.extend;
var trimString = utils.trimString;

var maxVersion = oDataUtils.maxVersion;

// CONTENT START

var MAX_DATA_SERVICE_VERSION = "3.0";

var contentType = function (str) {
    /// <summary>Parses a string into an object with media type and properties.</summary>
    /// <param name="str" type="String">String with media type to parse.</param>
    /// <returns>null if the string is empty; an object with 'mediaType' and a 'properties' dictionary otherwise.</returns>

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
};

var contentTypeToString = function (contentType) {
    /// <summary>Serializes an object with media type and properties dictionary into a string.</summary>
    /// <param name="contentType">Object with media type and properties dictionary to serialize.</param>
    /// <returns>String representation of the media type object; undefined if contentType is null or undefined.</returns>

    if (!contentType) {
        return undefined;
    }

    var result = contentType.mediaType;
    var property;
    for (property in contentType.properties) {
        result += ";" + property + "=" + contentType.properties[property];
    }
    return result;
};

var createReadWriteContext = function (contentType, dataServiceVersion, context, handler) {
    /// <summary>Creates an object that is going to be used as the context for the handler's parser and serializer.</summary>
    /// <param name="contentType">Object with media type and properties dictionary.</param>
    /// <param name="dataServiceVersion" type="String">String indicating the version of the protocol to use.</param>
    /// <param name="context">Operation context.</param>
    /// <param name="handler">Handler object that is processing a resquest or response.</param>
    /// <returns>Context object.</returns>

    var rwContext = {};
    extend(rwContext, context);
    extend(rwContext, {
        contentType: contentType,
        dataServiceVersion: dataServiceVersion,
        handler: handler
    });

    return rwContext;
};

var fixRequestHeader = function (request, name, value) {
    /// <summary>Sets a request header's value. If the header has already a value other than undefined, null or empty string, then this method does nothing.</summary>
    /// <param name="request">Request object on which the header will be set.</param>
    /// <param name="name" type="String">Header name.</param>
    /// <param name="value" type="String">Header value.</param>
    if (!request) {
        return;
    }

    var headers = request.headers;
    if (!headers[name]) {
        headers[name] = value;
    }
};

var fixDataServiceVersionHeader = function (request, version) {
    /// <summary>Sets the DataServiceVersion header of the request if its value is not yet defined or of a lower version.</summary>
    /// <param name="request">Request object on which the header will be set.</param>
    /// <param name="version" type="String">Version value.</param>
    /// <remarks>
    /// If the request has already a version value higher than the one supplied the this function does nothing.
    /// </remarks>

    if (request) {
        var headers = request.headers;
        var dsv = headers["DataServiceVersion"];
        headers["DataServiceVersion"] = dsv ? maxVersion(dsv, version) : version;
    }
};

var getRequestOrResponseHeader = function (requestOrResponse, name) {
    /// <summary>Gets the value of a request or response header.</summary>
    /// <param name="requestOrResponse">Object representing a request or a response.</param>
    /// <param name="name" type="String">Name of the header to retrieve.</param>
    /// <returns type="String">String value of the header; undefined if the header cannot be found.</returns>

    var headers = requestOrResponse.headers;
    return (headers && headers[name]) || undefined;
};

var getContentType = function (requestOrResponse) {
    /// <summary>Gets the value of the Content-Type header from a request or response.</summary>
    /// <param name="requestOrResponse">Object representing a request or a response.</param>
    /// <returns type="Object">Object with 'mediaType' and a 'properties' dictionary; null in case that the header is not found or doesn't have a value.</returns>

    return contentType(getRequestOrResponseHeader(requestOrResponse, "Content-Type"));
};

var versionRE = /^\s?(\d+\.\d+);?.*$/;
var getDataServiceVersion = function (requestOrResponse) {
    /// <summary>Gets the value of the DataServiceVersion header from a request or response.</summary>
    /// <param name="requestOrResponse">Object representing a request or a response.</param>
    /// <returns type="String">Data service version; undefined if the header cannot be found.</returns>

    var value = getRequestOrResponseHeader(requestOrResponse, "DataServiceVersion");
    if (value) {
        var matches = versionRE.exec(value);
        if (matches && matches.length) {
            return matches[1];
        }
    }

    // Fall through and return undefined.
};

var handlerAccepts = function (handler, cType) {
    /// <summary>Checks that a handler can process a particular mime type.</summary>
    /// <param name="handler">Handler object that is processing a resquest or response.</param>
    /// <param name="cType">Object with 'mediaType' and a 'properties' dictionary.</param>
    /// <returns type="Boolean">True if the handler can process the mime type; false otherwise.</returns>

    // The following check isn't as strict because if cType.mediaType = application/; it will match an accept value of "application/xml";
    // however in practice we don't not expect to see such "suffixed" mimeTypes for the handlers.
    return handler.accept.indexOf(cType.mediaType) >= 0;
};

var handlerRead = function (handler, parseCallback, response, context) {
    /// <summary>Invokes the parser associated with a handler for reading the payload of a HTTP response.</summary>
    /// <param name="handler">Handler object that is processing the response.</param>
    /// <param name="parseCallback" type="Function">Parser function that will process the response payload.</param>
    /// <param name="response">HTTP response whose payload is going to be processed.</param>
    /// <param name="context">Object used as the context for processing the response.</param>
    /// <returns type="Boolean">True if the handler processed the response payload and the response.data property was set; false otherwise.</returns>

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
};

var handlerWrite = function (handler, serializeCallback, request, context) {
    /// <summary>Invokes the serializer associated with a handler for generating the payload of a HTTP request.</summary>
    /// <param name="handler">Handler object that is processing the request.</param>
    /// <param name="serializeCallback" type="Function">Serializer function that will generate the request payload.</param>
    /// <param name="response">HTTP request whose payload is going to be generated.</param>
    /// <param name="context">Object used as the context for serializing the request.</param>
    /// <returns type="Boolean">True if the handler serialized the request payload and the request.body property was set; false otherwise.</returns>
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
            fixDataServiceVersionHeader(request, writeContext.dataServiceVersion || "1.0");

            fixRequestHeader(request, "Content-Type", contentTypeToString(writeContext.contentType));
            fixRequestHeader(request, "MaxDataServiceVersion", handler.maxDataServiceVersion);
            return true;
        }
    }

    return false;
};

var handler = function (parseCallback, serializeCallback, accept, maxDataServiceVersion) {
    /// <summary>Creates a handler object for processing HTTP requests and responses.</summary>
    /// <param name="parseCallback" type="Function">Parser function that will process the response payload.</param>
    /// <param name="serializeCallback" type="Function">Serializer function that will generate the request payload.</param>
    /// <param name="accept" type="String">String containing a comma separated list of the mime types that this handler can work with.</param>
    /// <param name="maxDataServiceVersion" type="String">String indicating the highest version of the protocol that this handler can work with.</param>
    /// <returns type="Object">Handler object.</returns>

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
};

var textParse = function (handler, body /*, context */) {
    return body;
};

var textSerialize = function (handler, data /*, context */) {
    if (assigned(data)) {
        return data.toString();
    } else {
        return undefined;
    }
};

exports.textHandler = handler(textParse, textSerialize, "text/plain", MAX_DATA_SERVICE_VERSION);

// DATAJS INTERNAL START
exports.contentType = contentType;
exports.contentTypeToString = contentTypeToString;
exports.handler = handler;
exports.createReadWriteContext = createReadWriteContext;
exports.fixRequestHeader = fixRequestHeader;
exports.getRequestOrResponseHeader = getRequestOrResponseHeader;
exports.getContentType = getContentType;
exports.getDataServiceVersion = getDataServiceVersion;
exports.MAX_DATA_SERVICE_VERSION = MAX_DATA_SERVICE_VERSION;
// DATAJS INTERNAL END
