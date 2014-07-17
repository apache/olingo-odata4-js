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
 
var utils = require("./../datajs.js").utils;
var odataRequest = require("./../odata.js");

var parseInt10 = utils.parseInt10;
var normalizeURICase = utils.normalizeURICase;

var appendQueryOption = function (uri, queryOption) {
    /// <summary>Appends the specified escaped query option to the specified URI.</summary>
    /// <param name="uri" type="String">URI to append option to.</param>
    /// <param name="queryOption" type="String">Escaped query option to append.</param>
    var separator = (uri.indexOf("?") >= 0) ? "&" : "?";
    return uri + separator + queryOption;
};

var appendSegment = function (uri, segment) {
    /// <summary>Appends the specified segment to the given URI.</summary>
    /// <param name="uri" type="String">URI to append a segment to.</param>
    /// <param name="segment" type="String">Segment to append.</param>
    /// <returns type="String">The original URI with a new segment appended.</returns>

    var index = uri.indexOf("?");
    var queryPortion = "";
    if (index >= 0) {
        queryPortion = uri.substr(index);
        uri = uri.substr(0, index);
    }

    if (uri[uri.length - 1] !== "/") {
        uri += "/";
    }
    return uri + segment + queryPortion;
};

var buildODataRequest = function (uri, options) {
    /// <summary>Builds a request object to GET the specified URI.</summary>
    /// <param name="uri" type="String">URI for request.</param>
    /// <param name="options" type="Object">Additional options.</param>

    return {
        method: "GET",
        requestUri: uri,
        user: options.user,
        password: options.password,
        enableJsonpCallback: options.enableJsonpCallback,
        callbackParameterName: options.callbackParameterName,
        formatQueryString: options.formatQueryString
    };
};

var findQueryOptionStart = function (uri, name) {
    /// <summary>Finds the index where the value of a query option starts.</summary>
    /// <param name="uri" type="String">URI to search in.</param>
    /// <param name="name" type="String">Name to look for.</param>
    /// <returns type="Number">The index where the query option starts.</returns>

    var result = -1;
    var queryIndex = uri.indexOf("?");
    if (queryIndex !== -1) {
        var start = uri.indexOf("?" + name + "=", queryIndex);
        if (start === -1) {
            start = uri.indexOf("&" + name + "=", queryIndex);
        }
        if (start !== -1) {
            result = start + name.length + 2;
        }
    }
    return result;
};

var queryForData = function (uri, options, success, error) {
    /// <summary>Gets data from an OData service.</summary>
    /// <param name="uri" type="String">URI to the OData service.</param>
    /// <param name="options" type="Object">Object with additional well-known request options.</param>
    /// <param name="success" type="Function">Success callback.</param>
    /// <param name="error" type="Function">Error callback.</param>
    /// <returns type="Object">Object with an abort method.</returns>

    var request = queryForDataInternal(uri, options, {}, success, error);
    return request;
};

    var queryForDataInternal = function (uri, options, data, success, error) {
        /// <summary>Gets data from an OData service taking into consideration server side paging.</summary>
        /// <param name="uri" type="String">URI to the OData service.</param>
        /// <param name="options" type="Object">Object with additional well-known request options.</param>
        /// <param name="data" type="Array">Array that stores the data provided by the OData service.</param>
        /// <param name="success" type="Function">Success callback.</param>
        /// <param name="error" type="Function">Error callback.</param>
        /// <returns type="Object">Object with an abort method.</returns>

        var request = buildODataRequest(uri, options);
        var currentRequest = odataRequest.request(request, function (newData) {
            var nextLink = newData["@odata.nextLink"];
            if (nextLink) {
                var index = uri.indexOf(".svc/", 0);
                if (index != -1) {
                    nextLink = uri.substring(0, index + 5) + nextLink;
                }
            }

            if (data.value && newData.value) {
                data.value = data.value.concat(newData.value);
            }
            else {
                for (var property in newData) {
                    if (property != "@odata.nextLink") {
                        data[property] = newData[property];
                    }
                }
            }

            if (nextLink) {
                currentRequest = queryForDataInternal(nextLink, options, data, success, error);
            }
            else {
                success(data);
            }
        }, error, undefined, options.httpClient, options.metadata);

        return {
            abort: function () {
                currentRequest.abort();
            }
        };
    };

var ODataCacheSource = function (options) {
    /// <summary>Creates a data cache source object for requesting data from an OData service.</summary>
    /// <param name="options">Options for the cache data source.</param>
    /// <returns type="ODataCacheSource">A new data cache source instance.</returns>

    var that = this;
    var uri = options.source;
    
    that.identifier = normalizeURICase(encodeURI(decodeURI(uri)));
    that.options = options;

    that.count = function (success, error) {
        /// <summary>Gets the number of items in the collection.</summary>
        /// <param name="success" type="Function">Success callback with the item count.</param>
        /// <param name="error" type="Function">Error callback.</param>
        /// <returns type="Object">Request object with an abort method./<param>

        var options = that.options;
        return odataRequest.request(
            buildODataRequest(appendSegment(uri, "$count"), options),
            function (data) {
                var count = parseInt10(data.toString());
                if (isNaN(count)) {
                    error({ message: "Count is NaN", count: count });
                } else {
                    success(count);
                }
            }, error, undefined, options.httpClient, options.metadata);
    };

    that.read = function (index, count, success, error) {
        /// <summary>Gets a number of consecutive items from the collection.</summary>
        /// <param name="index" type="Number">Zero-based index of the items to retrieve.</param>
        /// <param name="count" type="Number">Number of items to retrieve.</param>
        /// <param name="success" type="Function">Success callback with the requested items.</param>
        /// <param name="error" type="Function">Error callback.</param>
        /// <returns type="Object">Request object with an abort method./<param>

        var queryOptions = "$skip=" + index + "&$top=" + count;
        return queryForData(appendQueryOption(uri, queryOptions), that.options, success, error);
    };

    return that;
};

exports.ODataCacheSource = ODataCacheSource;
