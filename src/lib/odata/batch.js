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

/** @module odata/batch */

var utils    = require('./../utils.js');
var odataUtils    = require('./odatautils.js');
var odataHandler = require('./handler.js');

var extend = utils.extend;
var isArray = utils.isArray;
var trimString = utils.trimString;

var contentType = odataHandler.contentType;
var handler = odataHandler.handler;
var isBatch = odataUtils.isBatch;
var MAX_DATA_SERVICE_VERSION = odataHandler.MAX_DATA_SERVICE_VERSION;
var normalizeHeaders = odataUtils.normalizeHeaders;
//TODO var payloadTypeOf = odata.payloadTypeOf;
var prepareRequest = odataUtils.prepareRequest;


// Imports

// CONTENT START
var batchMediaType = "multipart/mixed";
var responseStatusRegex = /^HTTP\/1\.\d (\d{3}) (.*)$/i;
var responseHeaderRegex = /^([^()<>@,;:\\"\/[\]?={} \t]+)\s?:\s?(.*)/;

/** Calculates a random 16 bit number and returns it in hexadecimal format.
 * @returns {String} A 16-bit number in hex format.
 */
function hex16() {

    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substr(1);
}

/** Creates a string that can be used as a multipart request boundary.
 * @param {String} [prefix] - 
 * @returns {String} Boundary string of the format: <prefix><hex16>-<hex16>-<hex16>
 */
function createBoundary(prefix) {

    return prefix + hex16() + "-" + hex16() + "-" + hex16();
}

/** Gets the handler for data serialization of individual requests / responses in a batch.
 * @param context - Context used for data serialization.
 * @returns Handler object
 */
function partHandler(context) {

    return context.handler.partHandler;
}

/** Gets the current boundary used for parsing the body of a multipart response.
 * @param context - Context used for parsing a multipart response.
 * @returns {String} Boundary string.
 */
function currentBoundary(context) {
    var boundaries = context.boundaries;
    return boundaries[boundaries.length - 1];
}

/** Parses a batch response.
 * @param handler - This handler.
 * @param {String} text - Batch text.
 * @param {Object} context - Object with parsing context.
 * @return An object representation of the batch.
 */
function batchParser(handler, text, context) {

    var boundary = context.contentType.properties["boundary"];
    return { __batchResponses: readBatch(text, { boundaries: [boundary], handlerContext: context }) };
}

/** Serializes a batch object representation into text.
 * @param handler - This handler.
 * @param {Object} data - Representation of a batch.
 * @param {Object} context - Object with parsing context.
 * @return An text representation of the batch object; undefined if not applicable.#
 */
function batchSerializer(handler, data, context) {

    var cType = context.contentType = context.contentType || contentType(batchMediaType);
    if (cType.mediaType === batchMediaType) {
        return writeBatch(data, context);
    }
}

/** Parses a multipart/mixed response body from from the position defined by the context.
 * @param {String}  text - Body of the multipart/mixed response.
 * @param context - Context used for parsing.
 * @return Array of objects representing the individual responses.
 */
function readBatch(text, context) {
    var delimiter = "--" + currentBoundary(context);

    // Move beyond the delimiter and read the complete batch
    readTo(text, context, delimiter);

    // Ignore the incoming line
    readLine(text, context);

    // Read the batch parts
    var responses = [];
    var partEnd = null;

    while (partEnd !== "--" && context.position < text.length) {
        var partHeaders = readHeaders(text, context);
        var partContentType = contentType(partHeaders["Content-Type"]);

        var changeResponses;
        if (partContentType && partContentType.mediaType === batchMediaType) {
            context.boundaries.push(partContentType.properties.boundary);
            try {
                changeResponses = readBatch(text, context);
            } catch (e) {
                e.response = readResponse(text, context, delimiter);
                changeResponses = [e];
            }
            responses.push({ __changeResponses: changeResponses });
            context.boundaries.pop();
            readTo(text, context, "--" + currentBoundary(context));
        } else {
            if (!partContentType || partContentType.mediaType !== "application/http") {
                throw { message: "invalid MIME part type " };
            }
            // Skip empty line
            readLine(text, context);
            // Read the response
            var response = readResponse(text, context, delimiter);
            try {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    partHandler(context.handlerContext).read(response, context.handlerContext);
                } else {
                    // Keep track of failed responses and continue processing the batch.
                    response = { message: "HTTP request failed", response: response };
                }
            } catch (e) {
                response = e;
            }

            responses.push(response);
        }

        partEnd = text.substr(context.position, 2);

        // Ignore the incoming line.
        readLine(text, context);
    }
    return responses;
}

/** Parses the http headers in the text from the position defined by the context.
 * @param {String} text - Text containing an http response's headers
 * @param context - Context used for parsing.
 * @returns Object containing the headers as key value pairs.
 * This function doesn't support split headers and it will stop reading when it hits two consecutive line breaks.
*/
function readHeaders(text, context) {
    var headers = {};
    var parts;
    var line;
    var pos;

    do {
        pos = context.position;
        line = readLine(text, context);
        parts = responseHeaderRegex.exec(line);
        if (parts !== null) {
            headers[parts[1]] = parts[2];
        } else {
            // Whatever was found is not a header, so reset the context position.
            context.position = pos;
        }
    } while (line && parts);

    normalizeHeaders(headers);

    return headers;
}

/** Parses an HTTP response.
 * @param {String} text -Text representing the http response.
 * @param context optional - Context used for parsing.
 * @param {String} delimiter -String used as delimiter of the multipart response parts.
 * @return Object representing the http response.
 */
function readResponse(text, context, delimiter) {
    // Read the status line.
    var pos = context.position;
    var match = responseStatusRegex.exec(readLine(text, context));

    var statusCode;
    var statusText;
    var headers;

    if (match) {
        statusCode = match[1];
        statusText = match[2];
        headers = readHeaders(text, context);
        readLine(text, context);
    } else {
        context.position = pos;
    }

    return {
        statusCode: statusCode,
        statusText: statusText,
        headers: headers,
        body: readTo(text, context, "\r\n" + delimiter)
    };
}

/** Returns a substring from the position defined by the context up to the next line break (CRLF).
 * @param {String} text - Input string.
 * @param context - Context used for reading the input string.
 * @returns {String} Substring to the first ocurrence of a line break or null if none can be found. 
 */
function readLine(text, context) {

    return readTo(text, context, "\r\n");
}

/** Returns a substring from the position given by the context up to value defined by the str parameter and increments the position in the context.
 * @param {String} text - Input string.
 * @param context - Context used for reading the input string.
 * @param {String} [str] - Substring to read up to.
 * @returns {String} Substring to the first ocurrence of str or the end of the input string if str is not specified. Null if the marker is not found.
 */
function readTo(text, context, str) {
    var start = context.position || 0;
    var end = text.length;
    if (str) {
        end = text.indexOf(str, start);
        if (end === -1) {
            return null;
        }
        context.position = end + str.length;
    } else {
        context.position = end;
    }

    return text.substring(start, end);
}

/** Serializes a batch request object to a string.
 * @param data - Batch request object in payload representation format
 * @param context - Context used for the serialization
 * @returns {String} String representing the batch request
 */
function writeBatch(data, context) {
    if (!isBatch(data)) {
        throw { message: "Data is not a batch object." };
    }

    var batchBoundary = createBoundary("batch_");
    var batchParts = data.__batchRequests;
    var batch = "";
    var i, len;
    for (i = 0, len = batchParts.length; i < len; i++) {
        batch += writeBatchPartDelimiter(batchBoundary, false) +
                 writeBatchPart(batchParts[i], context);
    }
    batch += writeBatchPartDelimiter(batchBoundary, true);

    // Register the boundary with the request content type.
    var contentTypeProperties = context.contentType.properties;
    contentTypeProperties.boundary = batchBoundary;

    return batch;
}

/** Creates the delimiter that indicates that start or end of an individual request.
 * @param {String} boundary Boundary string used to indicate the start of the request
 * @param {Boolean} close - Flag indicating that a close delimiter string should be generated
 * @returns {String} Delimiter string
 */
function writeBatchPartDelimiter(boundary, close) {
    var result = "\r\n--" + boundary;
    if (close) {
        result += "--";
    }

    return result + "\r\n";
}

/** Serializes a part of a batch request to a string. A part can be either a GET request or
 * a change set grouping several CUD (create, update, delete) requests.
 * @param part - Request or change set object in payload representation format
 * @param context - Object containing context information used for the serialization
 * @param {boolean} [nested] - 
 * @returns {String} String representing the serialized part
 * A change set is an array of request objects and they cannot be nested inside other change sets.
 */
function writeBatchPart(part, context, nested) {
    

    var changeSet = part.__changeRequests;
    var result;
    if (isArray(changeSet)) {
        if (nested) {
            throw { message: "Not Supported: change set nested in other change set" };
        }

        var changeSetBoundary = createBoundary("changeset_");
        result = "Content-Type: " + batchMediaType + "; boundary=" + changeSetBoundary + "\r\n";
        var i, len;
        for (i = 0, len = changeSet.length; i < len; i++) {
            result += writeBatchPartDelimiter(changeSetBoundary, false) +
                 writeBatchPart(changeSet[i], context, true);
        }

        result += writeBatchPartDelimiter(changeSetBoundary, true);
    } else {
        result = "Content-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n";
        var partContext = extend({}, context);
        partContext.handler = handler;
        partContext.request = part;
        partContext.contentType = null;

        prepareRequest(part, partHandler(context), partContext);
        result += writeRequest(part);
    }

    return result;
}

/** Serializes a request object to a string.
 * @param request - Request object to serialize
 * @returns {String} String representing the serialized request
 */
function writeRequest(request) {
    var result = (request.method ? request.method : "GET") + " " + request.requestUri + " HTTP/1.1\r\n";
    for (var name in request.headers) {
        if (request.headers[name]) {
            result = result + name + ": " + request.headers[name] + "\r\n";
        }
    }

    result += "\r\n";

    if (request.body) {
        result += request.body;
    }

    return result;
}



/** batchHandler (see {@link module:odata/batch~batchParser}) */
exports.batchHandler = handler(batchParser, batchSerializer, batchMediaType, MAX_DATA_SERVICE_VERSION);

/** batchSerializer (see {@link module:odata/batch~batchSerializer}) */
exports.batchSerializer = batchSerializer;

/** writeRequest (see {@link module:odata/batch~writeRequest}) */
exports.writeRequest = writeRequest;