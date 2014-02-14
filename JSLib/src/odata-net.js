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

// odata-net.js

(function (window, undefined) {

    var datajs = window.datajs || {};
    var odata = window.OData || {};

    // Imports.

    var defined = datajs.defined;
    var delay = datajs.delay;

    // CONTENT START
    var ticks = 0;

    var canUseJSONP = function (request) {
        /// <summary>
        /// Checks whether the specified request can be satisfied with a JSONP request.
        /// </summary>
        /// <param name="request">Request object to check.</param>
        /// <returns type="Boolean">true if the request can be satisfied; false otherwise.</returns>

        // Requests that 'degrade' without changing their meaning by going through JSONP
        // are considered usable.
        //
        // We allow data to come in a different format, as the servers SHOULD honor the Accept
        // request but may in practice return content with a different MIME type.
        if (request.method && request.method !== "GET") {
            return false;
        }

        return true;
    };

    var createIFrame = function (url) {
        /// <summary>Creates an IFRAME tag for loading the JSONP script</summary>
        /// <param name="url" type="String">The source URL of the script</param>
        /// <returns type="HTMLElement">The IFRAME tag</returns>
        var iframe = window.document.createElement("IFRAME");
        iframe.style.display = "none";

        var attributeEncodedUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/\</g, "&lt;");
        var html = "<html><head><script type=\"text/javascript\" src=\"" + attributeEncodedUrl + "\"><\/script><\/head><body><\/body><\/html>";

        var body = window.document.getElementsByTagName("BODY")[0];
        body.appendChild(iframe);

        writeHtmlToIFrame(iframe, html);
        return iframe;
    };

    var createXmlHttpRequest = function () {
        /// <summary>Creates a XmlHttpRequest object.</summary>
        /// <returns type="XmlHttpRequest">XmlHttpRequest object.</returns>
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
    };

    var isAbsoluteUrl = function (url) {
        /// <summary>Checks whether the specified URL is an absolute URL.</summary>
        /// <param name="url" type="String">URL to check.</param>
        /// <returns type="Boolean">true if the url is an absolute URL; false otherwise.</returns>

        return url.indexOf("http://") === 0 ||
            url.indexOf("https://") === 0 ||
            url.indexOf("file://") === 0;
    };

    var isLocalUrl = function (url) {
        /// <summary>Checks whether the specified URL is local to the current context.</summary>
        /// <param name="url" type="String">URL to check.</param>
        /// <returns type="Boolean">true if the url is a local URL; false otherwise.</returns>

        if (!isAbsoluteUrl(url)) {
            return true;
        }

        // URL-embedded username and password will not be recognized as same-origin URLs.
        var location = window.location;
        var locationDomain = location.protocol + "//" + location.host + "/";
        return (url.indexOf(locationDomain) === 0);
    };

    var removeCallback = function (name, tick) {
        /// <summary>Removes a callback used for a JSONP request.</summary>
        /// <param name="name" type="String">Function name to remove.</param>
        /// <param name="tick" type="Number">Tick count used on the callback.</param>
        try {
            delete window[name];
        } catch (err) {
            window[name] = undefined;
            if (tick === ticks - 1) {
                ticks -= 1;
            }
        }
    };

    var removeIFrame = function (iframe) {
        /// <summary>Removes an iframe.</summary>
        /// <param name="iframe" type="Object">The iframe to remove.</param>
        /// <returns type="Object">Null value to be assigned to iframe reference.</returns>
        if (iframe) {
            writeHtmlToIFrame(iframe, "");
            iframe.parentNode.removeChild(iframe);
        }

        return null;
    };

    var readResponseHeaders = function (xhr, headers) {
        /// <summary>Reads response headers into array.</summary>
        /// <param name="xhr" type="XMLHttpRequest">HTTP request with response available.</param>
        /// <param name="headers" type="Array">Target array to fill with name/value pairs.</param>

        var responseHeaders = xhr.getAllResponseHeaders().split(/\r?\n/);
        var i, len;
        for (i = 0, len = responseHeaders.length; i < len; i++) {
            if (responseHeaders[i]) {
                var header = responseHeaders[i].split(": ");
                headers[header[0]] = header[1];
            }
        }
    };

    var writeHtmlToIFrame = function (iframe, html) {
        /// <summary>Writes HTML to an IFRAME document.</summary>
        /// <param name="iframe" type="HTMLElement">The IFRAME element to write to.</param>
        /// <param name="html" type="String">The HTML to write.</param>
        var frameDocument = (iframe.contentWindow) ? iframe.contentWindow.document : iframe.contentDocument.document;
        frameDocument.open();
        frameDocument.write(html);
        frameDocument.close();
    };

    odata.defaultHttpClient = {
        callbackParameterName: "$callback",

        formatQueryString: "$format=json",

        enableJsonpCallback: false,

        request: function (request, success, error) {
            /// <summary>Performs a network request.</summary>
            /// <param name="request" type="Object">Request description.</request>
            /// <param name="success" type="Function">Success callback with the response object.</param>
            /// <param name="error" type="Function">Error callback with an error object.</param>
            /// <returns type="Object">Object with an 'abort' method for the operation.</returns>

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
            var enableJsonpCallback = defined(request.enableJsonpCallback, this.enableJsonpCallback);
            var callbackParameterName = defined(request.callbackParameterName, this.callbackParameterName);
            var formatQueryString = defined(request.formatQueryString, this.formatQueryString);
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

                xhr.send(request.body);
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
                        // Adding dataServiceVersion in case of json light ( data.d doesn't exist )
                        if (data.d === undefined) {
                            headers = { "Content-Type": "application/json;odata=minimalmetadata", dataServiceVersion: "3.0" };
                        } else {
                            headers = { "Content-Type": "application/json" };
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
                if (this.formatQueryString) {
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
    };

    // DATAJS INTERNAL START
    odata.canUseJSONP = canUseJSONP;
    odata.isAbsoluteUrl = isAbsoluteUrl;
    odata.isLocalUrl = isLocalUrl;
    // DATAJS INTERNAL END

    // CONTENT END
})(this);