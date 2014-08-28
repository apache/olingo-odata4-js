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
 
//mockHttpClient.js
//this object allows for associating a uri with a requestVerfier and mock responses that will be sent back to the client of the httpStack.  
//It can be used to replace OData's httpClient for testing purposes.
//
//RequestVerifiers
//
//    A request verifier is a function associated to a particular URI that will be executed by the mockHttpClient when it receives a request with the matching URI.
//    the callback receives as its only parameter the request object passed to the mockHttpClient.
//
//    To register a request verifier, simply do 
//        
//            MockHttpClient.addRequestVerifier("http://someUri", function(request) {
//                djstest.assertAreEqual(request.requestUri,"http://someUri");
//            }
//
//Responses
//    Mock responses can be associated with a particular URI.  When the MockHttpClient receives a request with a URI mapped to a response, then it will, 
//    depending on the response status code invoke either the success or the error callbacks. 
//
//    To register a response,
//       
//           MockHttpClient.addResponse("http://someUri", {status: 200, body:"some body"});
//
//Exceptions
//    MockHttpClient will throw an exception if it receives a request to a URI that is not mapped to either a request verifier or a response.
//

function init(window, undefined) {

    var httpClient = {};

    var responses = {};
    var requestVerifiers = {};

    httpClient.addRequestVerifier = function (uri, verifier) {
        requestVerifiers[uri] = verifier;
        return this;
    };

    httpClient.addResponse = function (uri, response) {
        responses[uri] = response;
        return this;
    };

    httpClient.async = false;

    httpClient.clear = function () {
        /** Clears all registered responses and verifiers.
         * @returns this client
         */
        responses = {};
        requestVerifiers = {};
        this.async = false;
        return this;
    };

    httpClient.request = function (request, success, error) {
        var uri = request.requestUri;
        var verifier = requestVerifiers[uri];
        var response = responses[uri];

        if (verifier === undefined) {
            verifier = requestVerifiers["*"];
        }

        if (response === undefined) {
            response = responses["*"];
        }

        if (!verifier && !response) {
            throw { message: "neither verifier or response defined for uri: " + uri };
        }

        if (verifier) {
            verifier(request);
        }

        if (response) {
            response.requestUri = uri;
            if (response.statusCode >= 200 && response.statusCode <= 299) {
                if (this.async) {
                    setTimeout(function () {
                        success(response);
                    });
                } else {
                    success(response);
                }
            } else {
                if (this.async) {
                    setTimeout(function () {
                        error({ message: "failed test response", request: request, response: response });
                    });
                }
                else {
                    error({ message: "failed test response", request: request, response: response });
                }
            }
        }
    };

    httpClient.setAsync = function (value) {
        this.async = value;
        return this;
    };

    return httpClient;
}



if (typeof window !== 'undefined') {
    //in browser call init() directly window as context
    window.MockHttpClient = init(window);
} else {
    //expose function init to be called with a custom context
    module.exports.init = init;
}

