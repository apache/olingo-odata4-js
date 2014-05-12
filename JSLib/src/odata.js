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

// odata.js

(function (window, undefined) {

    var datajs = window.datajs || {};
    var odata = window.OData || {};

    // Imports

    var assigned = datajs.assigned;
    var defined = datajs.defined;
    var throwErrorCallback = datajs.throwErrorCallback;

    var invokeRequest = odata.invokeRequest;
    var MAX_DATA_SERVICE_VERSION = odata.MAX_DATA_SERVICE_VERSION;
    var prepareRequest = odata.prepareRequest;
    var metadataParser = odata.metadataParser;

    // CONTENT START
    
    // to do: disable atom scenario
    var handlers = [odata.jsonHandler/*, odata.atomHandler*/, odata.xmlHandler, odata.textHandler];

    var dispatchHandler = function (handlerMethod, requestOrResponse, context) {
        /// <summary>Dispatches an operation to handlers.</summary>
        /// <param name="handlerMethod" type="String">Name of handler method to invoke.</param>
        /// <param name="requestOrResponse" type="Object">request/response argument for delegated call.</param>
        /// <param name="context" type="Object">context argument for delegated call.</param>

        var i, len;
        for (i = 0, len = handlers.length; i < len && !handlers[i][handlerMethod](requestOrResponse, context); i++) {
        }

        if (i === len) {
            throw { message: "no handler for data" };
        }
    };

    odata.defaultSuccess = function (data) {
        /// <summary>Default success handler for OData.</summary>
        /// <param name="data">Data to process.</param>

        window.alert(window.JSON.stringify(data));
    };

    odata.defaultError = throwErrorCallback;

    odata.defaultHandler = {
        read: function (response, context) {
            /// <summary>Reads the body of the specified response by delegating to JSON and ATOM handlers.</summary>
            /// <param name="response">Response object.</param>
            /// <param name="context">Operation context.</param>

            if (response && assigned(response.body) && response.headers["Content-Type"]) {
                dispatchHandler("read", response, context);
            }
        },

        write: function (request, context) {
            /// <summary>Write the body of the specified request by delegating to JSON and ATOM handlers.</summary>
            /// <param name="request">Reques tobject.</param>
            /// <param name="context">Operation context.</param>

            dispatchHandler("write", request, context);
        },

        maxDataServiceVersion: MAX_DATA_SERVICE_VERSION,
        accept: "application/json;q=0.9, application/atomsvc+xml;q=0.8, */*;q=0.1"
    };

    odata.defaultMetadata = [];

    odata.read = function (urlOrRequest, success, error, handler, httpClient, metadata) {
        /// <summary>Reads data from the specified URL.</summary>
        /// <param name="urlOrRequest">URL to read data from.</param>
        /// <param name="success" type="Function" optional="true">Callback for a successful read operation.</param>
        /// <param name="error" type="Function" optional="true">Callback for handling errors.</param>
        /// <param name="handler" type="Object" optional="true">Handler for data serialization.</param>
        /// <param name="httpClient" type="Object" optional="true">HTTP client layer.</param>
        /// <param name="metadata" type="Object" optional="true">Conceptual metadata for this request.</param>

        var request;
        if (urlOrRequest instanceof String || typeof urlOrRequest === "string") {
            request = { requestUri: urlOrRequest };
        } else {
            request = urlOrRequest;
        }

        return odata.request(request, success, error, handler, httpClient, metadata);
    };

    odata.request = function (request, success, error, handler, httpClient, metadata) {
        /// <summary>Sends a request containing OData payload to a server.</summary>
        /// <param name="request" type="Object">Object that represents the request to be sent.</param>
        /// <param name="success" type="Function" optional="true">Callback for a successful read operation.</param>
        /// <param name="error" type="Function" optional="true">Callback for handling errors.</param>
        /// <param name="handler" type="Object" optional="true">Handler for data serialization.</param>
        /// <param name="httpClient" type="Object" optional="true">HTTP client layer.</param>
        /// <param name="metadata" type="Object" optional="true">Conceptual metadata for this request.</param>

        success = success || odata.defaultSuccess;
        error = error || odata.defaultError;
        handler = handler || odata.defaultHandler;
        httpClient = httpClient || odata.defaultHttpClient;
        metadata = metadata || odata.defaultMetadata;

        // Augment the request with additional defaults.
        request.recognizeDates = defined(request.recognizeDates, odata.jsonHandler.recognizeDates);
        request.callbackParameterName = defined(request.callbackParameterName, odata.defaultHttpClient.callbackParameterName);
        request.formatQueryString = defined(request.formatQueryString, odata.defaultHttpClient.formatQueryString);
        request.enableJsonpCallback = defined(request.enableJsonpCallback, odata.defaultHttpClient.enableJsonpCallback);

        // Create the base context for read/write operations, also specifying complete settings.
        var context = {
            metadata: metadata,
            recognizeDates: request.recognizeDates,
            callbackParameterName: request.callbackParameterName,
            formatQueryString: request.formatQueryString,
            enableJsonpCallback: request.enableJsonpCallback
        };

        try {
            prepareRequest(request, handler, context);
            return invokeRequest(request, success, error, handler, httpClient, context);
        } catch (err) {
            error(err);
        }
    };

    odata.parseMetadata = function (csdlMetadataDocument) {
        /// <summary>Parses the csdl metadata to DataJS metatdata format. This method can be used when the metadata is retrieved using something other than DataJS</summary>
        /// <param name="atomMetadata" type="string">A string that represents the entire csdl metadata.</param>
        /// <returns type="Object">An object that has the representation of the metadata in Datajs format.</returns>

        return metadataParser(null, csdlMetadataDocument);
    };

    // Configure the batch handler to use the default handler for the batch parts.
    odata.batchHandler.partHandler = odata.defaultHandler;

    // CONTENT END
})(this);