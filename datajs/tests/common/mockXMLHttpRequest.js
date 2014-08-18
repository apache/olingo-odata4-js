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

 // mockXMLHttpRequest.js
//
// This file provides a window.MockXMLHttpRequest object that can be used
// to replace or wrap the browser's XMLHttpRequest object for testing.
//
// Typically the object is installed, a test run, and then the original
// object restored. The addResponse and addRequest verifier can be
// used to set up callbacks; reset is used to clear those values.
//
// For a sample demonstrating how to use this functionality, see
// the httpClientSendRequestTest test in odata-net-tests.js.

(function (window, undefined) {

    if (!window.MockXMLHttpRequest) {
        window.MockXMLHttpRequest = {};
    }

    var mockXMLHttpRequest = window.MockXMLHttpRequest;

    var responses = {};
    var verifiers = {};

    mockXMLHttpRequest.addResponse = function (uri, response) {
        /** Adds a new response to be returned for the specified uri (* for 'anything').
         * @param {String} uri - URI to match (* to match anything not otherwise specified).
         * @param {Object} response - Response object.
         */
        responses = responses || {};
        responses[uri] = response;

        return this;
    };

    mockXMLHttpRequest.addRequestVerifier = function (uri, verifier) {
        /** Adds a new request verifier to be invoked for the specified uri (* for 'anything').
         * @param {String} uri - URI to match (* to match anything not otherwise specified).
         * @param {Function} response - Verifier callback that takes the request.
        */
        verifiers = verifiers || {};
        verifiers[uri] = verifier;

        return this;
    };

    mockXMLHttpRequest.reset = function () {
        /** Resets all configuration from the mock XHR object.
        */

        responses = {};
        verifiers = {};

        mockXMLHttpRequest.onCreate = undefined;
        mockXMLHttpRequest.onAfterSend = undefined;

        return this;
    };

    var xmlHttpRequest = function () {
        //properties
        this.readyState = 0;
        this.responseXML = undefined;

        //events
        this.ontimeout = undefined;
        this.onreadystatechange = undefined;

        if (mockXMLHttpRequest.onCreate) {
            mockXMLHttpRequest.onCreate(this);
        }
    };

    xmlHttpRequest.prototype.open = function (method, url, async, user, password) {
        if (!method) {
            throw { method: "method parameter is not defined, empty, or null " };
        }
        if (!url) {
            throw { message: "url parameter is not defined, empty, or null " };
        }

        this._request = {
            headers: {},
            url: url,
            method: method,
            async: async,
            user: user,
            password: password
        };
    };

    xmlHttpRequest.prototype.getAllResponseHeaders = function () {
        if (!this._response) {
            throw { message: "_response property is undefined, did you forget to call send() or map the request url to a response?" };
        }

        var result = "";
        var header;
        for (header in this._response.headers) {
            result = result + header + ": " + this._response.headers[header] + "\n\r";
        }
        //remove trailing LFCR
        return result.substring(0, result.length - 2);
    };

    xmlHttpRequest.prototype.getResponseHeader = function (header) {
        if (!this._response) {
            throw { message: "_response property is undefined, did you forget to call send() or map the request url to a response?" };
        }
        return this._response.headers[header];
    };

    xmlHttpRequest.prototype.abort = function () {
        //do nothing for now.
    };

    xmlHttpRequest.prototype.setRequestHeader = function (header, value) {
        if (!this._request) {
            throw { message: "_request property is undefined, did you forget to call open() first?" };
        }
        this._request.headers[header] = value;
    };

    xmlHttpRequest.prototype.send = function (data) {
        if (!this._request) {
            throw { message: "_request property is undefined, did you forget to call open() first?" };
        }

        if (this._request.headers["MockNoOp"]) {
            return;
        }

        if (this._request.headers["MockTimeOut"]) {
            if (!this.timeout) {
                throw { message: "timeout property is not set" };
            }

            if (this.ontimeout) {
                (function (xhr) {
                    setTimeout(function () {
                        xhr.ontimeout();
                    }, xhr.timeout);
                })(this);
            }
            return;
        }

        var url = this._request.url;
        var verifier = verifiers[url];
        var response = responses[url];

        if (!verifier) {
            verifier = verifiers["*"];
        }

        if (!response) {
            response = responses["*"];
        }

        if (!verifier && !response) {
            throw { message: "neither verifier or response defined for url: " + url };
        }

        this._request.body = data;

        if (verifier) {
            verifier(this._request);
        }

        if (response) {
            // Execute the respone after a 30ms delay.
            this._response = response;
            sendResponseDelay(this, response, 60);
        }
    };

    var sendResponseDelay = function (xhr, response, delay) {
        setTimeout(function () {
            xhr.status = response.status;
            xhr.responseText = response.body;
            xhr.responseBody = response.body;

            xhr.readyState = 4;
            if (xhr.onreadystatechange) {
                xhr.onreadystatechange();
                if (mockXMLHttpRequest.onAfterSend) {
                    mockXMLHttpRequest.onAfterSend();
                }
            }
        }, delay);
    };

    mockXMLHttpRequest.XMLHttpRequest = xmlHttpRequest;

})(this);
