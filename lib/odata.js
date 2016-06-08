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

 /** @module odata */

// Imports
var utils = require('./utils.js');

var odataUtils    = exports.utils     = require('./odata/odatautils.js');
var odataHandler  = exports.handler   = require('./odata/handler.js');
var odataMetadata = exports.metadata  = require('./odata/metadata.js');
var webNet = require('./odata/net-browser.js');
var odataNet      = exports.net       = utils.inBrowser() ? webNet : require('' + './odata/net.js');
var odataJson     = exports.json      = require('./odata/json.js');
                    exports.batch     = require('./odata/batch.js');
                    

var assigned = utils.assigned;

var defined = utils.defined;
var throwErrorCallback = utils.throwErrorCallback;

var invokeRequest = odataUtils.invokeRequest;
var MAX_DATA_SERVICE_VERSION = odataHandler.MAX_DATA_SERVICE_VERSION;
var prepareRequest = odataUtils.prepareRequest;
var metadataParser = odataMetadata.metadataParser;

// CONTENT START

var handlers = [odataJson.jsonHandler, odataHandler.textHandler];

/** Dispatches an operation to handlers.
 * @param {String} handlerMethod - Name of handler method to invoke.
 * @param {Object} requestOrResponse - request/response argument for delegated call.
 * @param {Object} context - context argument for delegated call.
 */
function dispatchHandler(handlerMethod, requestOrResponse, context) {

    var i, len;
    for (i = 0, len = handlers.length; i < len && !handlers[i][handlerMethod](requestOrResponse, context); i++) {
    }

    if (i === len) {
        throw { message: "no handler for data" };
    }
}

/** Default success handler for OData.
 * @param data - Data to process.
 */
exports.defaultSuccess = function (data) {

    window.alert(window.JSON.stringify(data));
};

exports.defaultError = throwErrorCallback;

exports.defaultHandler = {

        /** Reads the body of the specified response by delegating to JSON handlers.
        * @param response - Response object.
        * @param context - Operation context.
        */
        read: function (response, context) {

            if (response && assigned(response.body) && response.headers["Content-Type"]) {
                dispatchHandler("read", response, context);
            }
        },

        /** Write the body of the specified request by delegating to JSON handlers.
        * @param request - Reques tobject.
        * @param context - Operation context.
        */
        write: function (request, context) {

            dispatchHandler("write", request, context);
        },

        maxDataServiceVersion: MAX_DATA_SERVICE_VERSION,
        accept: "application/json;q=0.9, */*;q=0.1"
    };

exports.defaultMetadata = []; //TODO check why is the defaultMetadata an Array? and not an Object.

/** Reads data from the specified URL.
 * @param urlOrRequest - URL to read data from.
 * @param {Function} [success] - 
 * @param {Function} [error] - 
 * @param {Object} [handler] - 
 * @param {Object} [httpClient] - 
 * @param {Object} [metadata] - 
 */
exports.read = function (urlOrRequest, success, error, handler, httpClient, metadata) {

    var request;
    if (urlOrRequest instanceof String || typeof urlOrRequest === "string") {
        request = { requestUri: urlOrRequest };
    } else {
        request = urlOrRequest;
    }

    return exports.request(request, success, error, handler, httpClient, metadata);
};

/** Sends a request containing OData payload to a server.
 * @param {Object} request - Object that represents the request to be sent.
 * @param {Function} [success] - 
 * @param {Function} [error] - 
 * @param {Object} [handler] - 
 * @param {Object} [httpClient] - 
 * @param {Object} [metadata] - 
 */
exports.request = function (request, success, error, handler, httpClient, metadata) {

    success = success || exports.defaultSuccess;
    error = error || exports.defaultError;
    handler = handler || exports.defaultHandler;
    httpClient = httpClient || odataNet.defaultHttpClient;
    metadata = metadata || exports.defaultMetadata;

    // Augment the request with additional defaults.
    request.recognizeDates = utils.defined(request.recognizeDates, odataJson.jsonHandler.recognizeDates);
    request.callbackParameterName = utils.defined(request.callbackParameterName, odataNet.defaultHttpClient.callbackParameterName);
    request.formatQueryString = utils.defined(request.formatQueryString, odataNet.defaultHttpClient.formatQueryString);
    request.enableJsonpCallback = utils.defined(request.enableJsonpCallback, odataNet.defaultHttpClient.enableJsonpCallback);

    // Create the base context for read/write operations, also specifying complete settings.
    var context = {
        metadata: metadata,
        recognizeDates: request.recognizeDates,
        callbackParameterName: request.callbackParameterName,
        formatQueryString: request.formatQueryString,
        enableJsonpCallback: request.enableJsonpCallback
    };

    try {
        odataUtils.prepareRequest(request, handler, context);
        return odataUtils.invokeRequest(request, success, error, handler, httpClient, context);
    } catch (err) {
        // errors in success handler for sync requests are catched here and result in error handler calls. 
        // So here we fix this and throw that error further.
        if (err.bIsSuccessHandlerError) {
            throw err;
        } else {
            error(err);
        }
    }

};

/** Parses the csdl metadata to ODataJS metatdata format. This method can be used when the metadata is retrieved using something other than odatajs
 * @param {string} csdlMetadataDocument - A string that represents the entire csdl metadata.
 * @returns {Object} An object that has the representation of the metadata in odatajs format.
 */
exports.parseMetadata = function (csdlMetadataDocument) {

    return metadataParser(null, csdlMetadataDocument);
};

// Configure the batch handler to use the default handler for the batch parts.
exports.batch.batchHandler.partHandler = exports.defaultHandler;
exports.metadataHandler =  odataMetadata.metadataHandler;
exports.jsonHandler =  odataJson.jsonHandler;
