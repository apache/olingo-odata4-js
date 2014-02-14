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

// Client for the odata.read oracle service

(function (window, undefined) {
    var jsonMime = "application/json;odata=verbose";
    var universalMime = "*/*";
    var atomMime = "application/atom+xml";

    var readFeed = function (url, success, mimeType, recognizeDates) {
        /// <summary>Calls the ReadFeed endpoint with the specified URL</summary>
        /// <param name="url" type="String">The URL to read the feed from</param>
        /// <param name="success" type="Function">The success callback function</param>
        /// <param name="mimeType" type="String">The MIME media type in the Accept header</param>
        var readMethod = getReadMethod(mimeType, "ReadFeed");
        oracleRequest("GET", readMethod, typeof url === "string" ? { url: url} : url, mimeType, recognizeDates, function (data) {
            if (!data.results) {
                data = { results: data };
            }
            success(data);
        });
    };

    var readEntry = function (url, success, mimeType, recognizeDates) {
        /// <summary>Calls the ReadEntry endpoint with the specified URL</summary>
        /// <param name="url" type="String">The URL to read the entry from</param>
        /// <param name="success" type="Function">The success callback function</param>
        /// <param name="mimeType" type="String">The MIME media type in the Accept header</param>
        var readMethod = getReadMethod(mimeType, "ReadEntry");
        oracleRequest("GET", readMethod, typeof url === "string" ? { url: url} : url, mimeType, recognizeDates, success);
    };

    var readFeedLoopback = function (atomFeedXml, success, recognizeDates) {
        /// <summary>Calls the ReadFeedLoopback endpoint with the specified atom feed xml</summary>
        /// <param name="atomFeedXml" type="String">The atom feed xml</param>
        /// <param name="success" type="Function">The success callback function</param>
        oracleRequest("POST", "ReadFeedLoopback", atomFeedXml, atomMime, recognizeDates, success);
    };

    var readEntryLoopback = function (atomEntryXml, success, recognizeDates) {
        /// <summary>Calls the ReadEntryLoopback endpoint with the specified atom entry xml</summary>
        /// <param name="atomEntryXml" type="String">The atom entry xml</param>
        /// <param name="success" type="Function">The success callback function</param>
        oracleRequest("POST", "ReadEntryLoopback", atomEntryXml, atomMime, recognizeDates, success);
    };

    var readLinksEntry = function (url, success) {
        /// <summary>Calls the ReadMetadata endpoint with the specified URL</summary>
        /// <param name="url" type="String">The URL to read the metadata from</param>
        /// <param name="success" type="Function">The success callback function</param>
        readJson(
            url,
            success
        );
    };

    var readLinksFeed = function (url, success) {
        /// <summary>Calls the ReadMetadata endpoint with the specified URL</summary>
        /// <param name="url" type="String">The URL to read the metadata from</param>
        /// <param name="success" type="Function">The success callback function</param>
        readJson(
            url,
            function (data) {
                if (!data.results) {
                    data = { results: data };
                }
                success(data);
            }
        );
    };

    var readMetadata = function (url, success) {
        /// <summary>Calls the ReadMetadata endpoint with the specified URL</summary>
        /// <param name="url" type="String">The URL to read the metadata from</param>
        /// <param name="success" type="Function">The success callback function</param>
        $.getJSON(
            "./common/ODataReadOracle.svc/ReadMetadata?url=" + escape(url),
            function (data) {
                removeProperty(data.d, "__type");
                success(data.d);
            }
        );
    };

    var readServiceDocument = function (url, success, mimeType) {
        /// <summary>Calls the ReadServiceDocument endpoint with the specified URL</summary>
        /// <param name="url" type="String">The URL to the service</param>
        /// <param name="success" type="Function">The success callback function</param>
        /// <param name="mimeType" type="String">The MIME type being tested</param>

        $.getJSON(
            "./common/ODataReadOracle.svc/ReadServiceDocument?url=" + escape(url) + "&mimeType=" + mimeType,
            function (data) {
                removeProperty(data.d, "__type");
                if (mimeType == jsonMime) {
                    removeProperty(data.d, "extensions");
                    $.each(data.d["workspaces"], function (_, workspace) {
                        delete workspace["title"];
                    });
                }
                success(data.d);
            }
        );
    };

    var readJson = function (url, success) {
        $.ajax({
            url: url,
            accepts: null,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Accept", jsonMime);
                xhr.setRequestHeader("MaxDataServiceVersion", "3.0");
            },
            success: function (data) {
                success(data.d);
            }
        });
    };

    var readJsonAcrossServerPages = function (url, success) {
        var data = [];
        var readPage = function (url) {
            readJson(url, function (feedData) {
                var results = feedData.results || feedData;
                var next = feedData.__next;

                data = data.concat(results);
                if (next) {
                    readPage(next);
                } else {
                    success(data);
                }
            });
        };

        readPage(url);
    }

    var getReadMethod = function (mimeType, defaultEndpoint) {
        switch (mimeType) {
            case universalMime:
            case atomMime:
                return defaultEndpoint;
            case jsonMime:
            default:
                return "ReadJson";
        }
    }

    var oracleRequest = function (method, endpoint, data, mimeType, recognizeDates, success) {
        /// <summary>Requests a JSON object from the oracle service, removing WCF-specific artifacts</summary>
        /// <param name="method" type="String">The HTTP method (GET or POST)</param>
        /// <param name="endpoint" type="String">The oracle endpoint</param>
        /// <param name="data" type="Object">The data to send with the request</param>
        /// <param name="reviver" type="Function">The reviver function to run on each deserialized object</param>
        /// <param name="success" type="Function">Success callback</param>
        var reviver = mimeType === jsonMime || mimeType === undefined ? (recognizeDates ? odataDateReviver : undefined) : oracleDateReviver;
        var url = "./common/ODataReadOracle.svc/" + endpoint;
        $.ajax({
            type: method,
            url: url,
            data: data,
            dataType: "text",
            success: function (data) {
                var json = JSON.parse(data, reviver);
                removeProperty(json.d, "__type");
                success(json.d);
            }
        });
    };

    var removeProperty = function (data, property) {
        /// <summary>Removes the specified property recursively from the given object</summary>
        /// <param name="data" type="Object">The object to operate on</param>
        /// <param name="property" type="String">The name of the property to remove</param>
        if (typeof data === "object" && data !== null) {
            if (data[property]) {
                delete data[property];
            }

            for (prop in data) {
                removeProperty(data[prop], property);
            }
        }
    }

    var oracleDateReviver = function (key, value) {
        /// <summary>Revives date objects received from the oracle service</summary>
        if (value && value["__type"] && value["__type"].search("JsDate") > -1) {
            var data = new Date(value.milliseconds);
            if (value["__edmType"]) {
                data["__edmType"] = value["__edmType"];
            }

            if (value["__offset"]) {
                data["__offset"] = value["__offset"];
            }

            return data;
        }

        return value;
    }

    var odataDateReviver = function (key, value) {
        /// <summary>Revives date objects received from OData JSON payloads</summary>
        var regexp = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/;
        var matches = regexp.exec(value);
        if (matches) {
            var milliseconds = parseInt(matches[1], 10);
            if (!isNaN(milliseconds)) {
                var result = new Date(milliseconds);
                if (matches[2]) {
                    var sign = matches[2];
                    var offsetMinutes = parseInt(matches[3], 10);
                    if (sign === "-") {
                        offsetMinutes = -offsetMinutes;
                    }

                    result.setUTCMinutes(result.getUTCMinutes() - offsetMinutes);
                    result["__edmType"] = "Edm.DateTimeOffset";
                    result["__offset"] = minutesToOffset(offsetMinutes);
                }
                return result;
            }
        }

        return value;
    }

    var minutesToOffset = function (minutes) {
        var padIfNeeded = function (value) {
            var result = value.toString(10);
            return result.length < 2 ? "0" + result : result;
        };

        var sign;
        if (minutes < 0) {
            sign = "-";
            minutes = -minutes;
        } else {
            sign = "+";
        }

        var hours = Math.floor(minutes / 60);
        minutes = minutes - (60 * hours);

        return sign + padIfNeeded(hours) + ":" + padIfNeeded(minutes);
    };

    window.ODataReadOracle = {
        readFeed: readFeed,
        readEntry: readEntry,
        readFeedLoopback: readFeedLoopback,
        readEntryLoopback: readEntryLoopback,
        readLinksEntry: readLinksEntry,
        readLinksFeed: readLinksFeed,
        readJson: readJson,
        readJsonAcrossServerPages: readJsonAcrossServerPages,
        readMetadata: readMetadata,
        readServiceDocument: readServiceDocument
    };
})(window);