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
/** @module odata/net */


var http = require('http');
var utils    = require('./../utils.js');
var url = require("url");


var defined = utils.defined;
var delay = utils.delay;

var ticks = 0;

/* Checks whether the specified request can be satisfied with a JSONP request.
 * @param request - Request object to check.
 * @returns {Boolean} true if the request can be satisfied; false otherwise.

 * Requests that 'degrade' without changing their meaning by going through JSONP
 * are considered usable.
 *
 * We allow data to come in a different format, as the servers SHOULD honor the Accept
 * request but may in practice return content with a different MIME type.
 */
function canUseJSONP(request) {
    return false;
}



/** Checks whether the specified URL is an absolute URL.
 * @param {String} url - URL to check.
 * @returns {Boolean} true if the url is an absolute URL; false otherwise.
*/
function isAbsoluteUrl(url) {
    return url.indexOf("http://") === 0 ||
           url.indexOf("https://") === 0 ||
           url.indexOf("file://") === 0;
}

/** Checks whether the specified URL is local to the current context.
 * @param {String} url - URL to check.
 * @returns {Boolean} true if the url is a local URL; false otherwise.
 */
function isLocalUrl(url) {

    if (!isAbsoluteUrl(url)) {
        return true;
    }

    // URL-embedded username and password will not be recognized as same-origin URLs.
    var location = window.location;
    var locationDomain = location.protocol + "//" + location.host + "/";
    return (url.indexOf(locationDomain) === 0);
}


/** Reads response headers into array.
 * @param {Object} inHeader
 * @param {Array} outHeader
 */
function readResponseHeaders(inHeader, outHeader) {
    for (var property in inHeader) {
        
        if (inHeader.hasOwnProperty(property)) {
            outHeader[property] = inHeader[property];
        }
    }
}

    



exports.defaultHttpClient = {
    formatQueryString: "$format=json",

    
    /** Performs a network request.
     * @param {Object} request - Request description
     * @param {Function} success - Success callback with the response object.
     * @param {Function} error - Error callback with an error object.
     * @returns {Object} Object with an 'abort' method for the operation.
     */
    request: function (request, success, error) {

        var result = {};
        var done = false;
        
        var options = url.parse(request.requestUri);
        options.method = request.method || "GET";
        options.headers = {};
        //options.auth = request.user + ':' + request.password;
        //add headers
        var name;
        if (request.headers) {
            for (name in request.headers) {
                options.headers[name] = request.headers[name];
            }
        }   
        

        var xhr = http.request(options);

        result.abort = function () {
            if (done) {
                return;
            }

            done = true;
            if (xhr) {
                xhr.abort();
                xhr = null;
            }

            error({ message: "Request aborted" });
        };

        // Set the timeout if available.
        if (request.timeoutMS) {
            xhr.setTimeout(request.timeoutMS,function () {
                if (!done) {
                    done = true;
                    xhr = null;
                    error({ message: "Request timed out" });
                }
            });
        }

        xhr.on('error', function(e) {
            var response = { requestUri: url, statusCode: 400, statusText: e.message };
            error({ message: "HTTP request failed", request: request, response: response });
        });
             

        xhr.on('response', function (resp) {
            if (done || xhr === null) {
                return;
            }

            var headers = [];
            readResponseHeaders(resp.headers, headers);
                        
            var body = '';

            resp.on('data', function(chunk) {
                body+=chunk;
            });
            resp.on('end', function() {
                // do what you do
                var response = { requestUri: url, statusCode: resp.statusCode, statusText: '', headers: headers, body: body };

                done = true;
                xhr = null;
                if (resp.statusCode >= 200 && resp.statusCode <= 299) {
                    success(response);
                } else {
                    error({ message: "HTTP request failed", request: request, response: response });
                }   
            });
        });

        //xhr.open(request.method || "GET", url, true,);
        if (request.body) {
            xhr.write(request.body);
        }
        xhr.end();

        return result;
    }
};



exports.canUseJSONP = canUseJSONP;
exports.isAbsoluteUrl = isAbsoluteUrl;
exports.isLocalUrl = isLocalUrl;