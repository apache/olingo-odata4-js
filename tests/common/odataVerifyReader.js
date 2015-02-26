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
 

// Client for the odata.read verifier service

(function (window, undefined) {
    var jsonMime = "application/json";
    var universalMime = "*/*";

    var readFeed = function (url, success, mimeType, recognizeDates) {
        /** Calls the ReadFeed endpoint with the specified URL
         * @param {String} url - The URL to read the feed from
         * @param {Function} success - The success callback function
         * @param {String} mimeType - The MIME media type in the Accept header
         */
        var readMethod = getReadMethod(mimeType);
        verifyRequest("GET", readMethod, typeof url === "string" ? { url: url} : url, mimeType, recognizeDates, function (data) {
            success(data);
        });
    };

    var readEntry = function (url, success, mimeType, recognizeDates) {
        /** Calls the ReadEntry endpoint with the specified URL
         * @param {String} url - The URL to read the entry from
         * @param {Function} success - The success callback function
         * @param {String} mimeType - The MIME media type in the Accept header
         */
        var readMethod = getReadMethod(mimeType);
        verifyRequest("GET", readMethod, typeof url === "string" ? { url: url} : url, mimeType, recognizeDates, success);
    };

    var readLinksEntry = function (url, success) {
        /** Calls the ReadMetadata endpoint with the specified URL
         * @param {String} url - The URL to read the metadata from
         * @param {Function} success - The success callback function
         */
        readJson(
            url,
            success
        );
    };

    var readLinksFeed = function (url, success) {
        /** Calls the ReadMetadata endpoint with the specified URL
         * @param {String} url - The URL to read the metadata from
         * @param {Function} success - The success callback function
         */
        readJson(
            url,
            function (data) {
                success(data);
            }
        );
    };

    var readMetadata = function (url, success) {
        /** Calls the ReadMetadata endpoint with the specified URL
         * @param {String} url - The URL to read the metadata from
         * @param {Function} success - The success callback function
         */
        verifyRequest("GET", "ReadMetadata", typeof url === "string" ? { url: url} : url, null, null, success);
    };

    var readServiceDocument = function (url, success, mimeType) {
        /** Calls the ReadServiceDocument endpoint with the specified URL
         * @param {String} url - The URL to the service
         * @param {Function} success - The success callback function
         * @param {String} mimeType - The MIME type being tested
         */
        var readMethod = getReadMethod(mimeType);
        verifyRequest("GET", readMethod, typeof url === "string" ? { url: url} : url, mimeType, null, success);
    };

    var readJson = function (url, success) {
        $.ajax({
            url: url,
            accepts: null,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Accept", jsonMime);
                xhr.setRequestHeader("OData-MaxVersion", "4.0");
            },
            success: function (data) {
                success(data);
            }
        });
    };

    var readJsonAcrossServerPages = function (url, success) {
        var data = {};
        var readPage = function (url) {
            readJson(url, function (feedData) {
                var nextLink = feedData["@odata.nextLink"];
                if (nextLink) {
                    var index = url.indexOf(".svc/", 0);
                    if (index != -1) {
                        nextLink = url.substring(0, index + 5) + nextLink;
                    }
                }

                if (data.value && feedData.value) {
                    data.value = data.value.concat(feedData.value);
                }
                else {
                    for (var property in feedData) {
                        if (property != "@odata.nextLink") {
                            data[property] = feedData[property];
                        }
                    }
                }

                if (nextLink) {
                    readPage(nextLink);
                }
                else {
                    success(data);
                }
            });
        };

        readPage(url);
    };

    var getReadMethod = function (mimeType) {
        switch (mimeType) {
            case jsonMime:
            case universalMime:
            default:
                return "ReadJson";
        }
    };

    var verifyRequest = function (method, endpoint, data, mimeType, recognizeDates, success) {
        /** Requests a JSON object from the verifier service, removing WCF-specific artifacts
         * @param {String} method - The HTTP method (GET or POST)
         * @param {String} endpoint - The verifier endpoint
         * @param {Object} data - The data to send with the request
         * @param {Function} reviver - The reviver function to run on each deserialized object
         * @param {Function} success - Success callback
         */
        var url = "./common/ODataVerifyReader.svc/" + endpoint;
        if (mimeType) {
            data.mimeType = mimeType;
        }

        $.ajax({
            type: method,
            url: url,
            data: data,
            dataType: "text",
            success: function (data) {
                var json = JSON.parse(data);
                success(json);
            }
        });
    };

    var removeProperty = function (data, property) {
        /** Removes the specified property recursively from the given object
         * @param {Object} data - The object to operate on
         * @param {String} property - The name of the property to remove
         */
        if (typeof data === "object" && data !== null) {
            if (data[property]) {
                delete data[property];
            }

            for (var prop in data) {
                removeProperty(data[prop], property);
            }
        }
    };

    window.ODataVerifyReader = {
        readFeed: readFeed,
        readEntry: readEntry,
        readLinksEntry: readLinksEntry,
        readLinksFeed: readLinksFeed,
        readJson: readJson,
        readJsonAcrossServerPages: readJsonAcrossServerPages,
        readMetadata: readMetadata,
        readServiceDocument: readServiceDocument
    };
})(window);