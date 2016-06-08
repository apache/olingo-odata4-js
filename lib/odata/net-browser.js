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

/** @module odata/net */
/*for browser*/


var utils    = require('./../utils.js');
// Imports.

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
    
    return !(request.method && request.method !== "GET");


}

/** Creates an IFRAME tag for loading the JSONP script
 * @param {String} url - The source URL of the script
 * @returns {HTMLElement} The IFRAME tag
 */
function createIFrame(url) {
    var iframe = window.document.createElement("IFRAME");
    iframe.style.display = "none";

    var attributeEncodedUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    var html = "<html><head><script type=\"text/javascript\" src=\"" + attributeEncodedUrl + "\"><\/script><\/head><body><\/body><\/html>";

    var body = window.document.getElementsByTagName("BODY")[0];
    body.appendChild(iframe);

    writeHtmlToIFrame(iframe, html);
    return iframe;
}

/** Creates a XmlHttpRequest object.
 * @returns {XmlHttpRequest} XmlHttpRequest object.
 */
function createXmlHttpRequest() {
    if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest();
    }
    var exception;
    if (window.ActiveXObject) {
        try {
            return new window.ActiveXObject("Msxml2.XMLHTTP.6.0");
        } catch (_) {
            try {
                return new window.ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (e) {
                exception = e;
            }
        }
    } else {
        exception = { message: "XMLHttpRequest not supported" };
    }
    throw exception;
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

/** Removes a callback used for a JSONP request.
 * @param {String} name - Function name to remove.
 * @param {Number} tick - Tick count used on the callback.
 */
function removeCallback(name, tick) {
    try {
        delete window[name];
    } catch (err) {
        window[name] = undefined;
        if (tick === ticks - 1) {
            ticks -= 1;
        }
    }
}

/** Removes an iframe.
 * @param {Object} iframe - The iframe to remove.
 * @returns {Object} Null value to be assigned to iframe reference.
 */
function removeIFrame(iframe) {
    if (iframe) {
        writeHtmlToIFrame(iframe, "");
        iframe.parentNode.removeChild(iframe);
    }

    return null;
}

/** Reads response headers into array.
 * @param {XMLHttpRequest} xhr - HTTP request with response available.
 * @param {Array} headers - Target array to fill with name/value pairs.
 */
function readResponseHeaders(xhr, headers) {

    var responseHeaders = xhr.getAllResponseHeaders().split(/\r?\n/);
    var i, len;
    for (i = 0, len = responseHeaders.length; i < len; i++) {
        if (responseHeaders[i]) {
            var header = responseHeaders[i].split(": ");
            headers[header[0]] = header[1];
        }
    }
}

/** Writes HTML to an IFRAME document.
 * @param {HTMLElement} iframe - The IFRAME element to write to.
 * @param {String} html - The HTML to write.
 */
function writeHtmlToIFrame(iframe, html) {
    var frameDocument = (iframe.contentWindow) ? iframe.contentWindow.document : iframe.contentDocument.document;
    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();
}

exports.defaultHttpClient = {
    callbackParameterName: "$callback",

    formatQueryString: "$format=json",

    enableJsonpCallback: false,

    /** Performs a network request.
     * @param {Object} request - Request description
     * @param {Function} success - Success callback with the response object.
     * @param {Function} error - Error callback with an error object.
     * @returns {Object} Object with an 'abort' method for the operation.
     */
    request: function createRequest() {

        var that = this;


        return function(request, success, error) {

        var result = {};
        var xhr = null;
        var done = false;
        var iframe;

        result.abort = function () {
            iframe = removeIFrame(iframe);
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

        var handleTimeout = function () {
            iframe = removeIFrame(iframe);
            if (!done) {
                done = true;
                xhr = null;
                error({ message: "Request timed out" });
            }
        };

        var name;
        var url = request.requestUri;
        var enableJsonpCallback = defined(request.enableJsonpCallback , that.enableJsonpCallback);
        var callbackParameterName = defined(request.callbackParameterName, that.callbackParameterName);
        var formatQueryString = defined(request.formatQueryString, that.formatQueryString);
        if (!enableJsonpCallback || isLocalUrl(url)) {

            xhr = createXmlHttpRequest();
            xhr.onreadystatechange = function () {
                if (done || xhr === null || xhr.readyState !== 4) {
                    return;
                }

                // Workaround for XHR behavior on IE.
                var statusText = xhr.statusText;
                var statusCode = xhr.status;
                if (statusCode === 1223) {
                    statusCode = 204;
                    statusText = "No Content";
                }

                var headers = [];
                readResponseHeaders(xhr, headers);

                var response = { requestUri: url, statusCode: statusCode, statusText: statusText, headers: headers, body: xhr.responseText };

                done = true;
                xhr = null;
                if (statusCode >= 200 && statusCode <= 299) {
                    success(response);
                } else {
                    error({ message: "HTTP request failed", request: request, response: response });
                }
            };

            xhr.open(request.method || "GET", url, true, request.user, request.password);

            // Set the name/value pairs.
            if (request.headers) {
                for (name in request.headers) {
                    xhr.setRequestHeader(name, request.headers[name]);
                }
            }

            // Set the timeout if available.
            if (request.timeoutMS) {
                xhr.timeout = request.timeoutMS;
                xhr.ontimeout = handleTimeout;
            }
            
            if(typeof request.body === 'undefined'){
                xhr.send();
            } else {
                xhr.send(request.body);
            }
        } else {
            if (!canUseJSONP(request)) {
                throw { message: "Request is not local and cannot be done through JSONP." };
            }

            var tick = ticks;
            ticks += 1;
            var tickText = tick.toString();
            var succeeded = false;
            var timeoutId;
            name = "handleJSONP_" + tickText;
            window[name] = function (data) {
                iframe = removeIFrame(iframe);
                if (!done) {
                    succeeded = true;
                    window.clearTimeout(timeoutId);
                    removeCallback(name, tick);

                    // Workaround for IE8 and IE10 below where trying to access data.constructor after the IFRAME has been removed
                    // throws an "unknown exception"
                    if (window.ActiveXObject) {
                        data = window.JSON.parse(window.JSON.stringify(data));
                    }


                    var headers;
                    if (!formatQueryString || formatQueryString == "$format=json") {
                        headers = { "Content-Type": "application/json;odata.metadata=minimal", "OData-Version": "4.0" };
                    } else {
                        // the formatQueryString should be in the format of "$format=xxx", xxx should be one of the application/json;odata.metadata=minimal(none or full)
                        // set the content-type with the string xxx which stars from index 8.
                        headers = { "Content-Type": formatQueryString.substring(8), "OData-Version": "4.0" };
                    }

                    // Call the success callback in the context of the parent window, instead of the IFRAME
                    delay(function () {
                        removeIFrame(iframe);
                        success({ body: data, statusCode: 200, headers: headers });
                    });
                }
            };

            // Default to two minutes before timing out, 1000 ms * 60 * 2 = 120000.
            var timeoutMS = (request.timeoutMS) ? request.timeoutMS : 120000;
            timeoutId = window.setTimeout(handleTimeout, timeoutMS);

            var queryStringParams = callbackParameterName + "=parent." + name;
            if (formatQueryString) {
                queryStringParams += "&" + formatQueryString;
            }

            var qIndex = url.indexOf("?");
            if (qIndex === -1) {
                url = url + "?" + queryStringParams;
            } else if (qIndex === url.length - 1) {
                url = url + queryStringParams;
            } else {
                url = url + "&" + queryStringParams;
            }

            iframe = createIFrame(url);
        }

        return result;
    }
    }()
};



exports.canUseJSONP = canUseJSONP;
exports.isAbsoluteUrl = isAbsoluteUrl;
exports.isLocalUrl = isLocalUrl;