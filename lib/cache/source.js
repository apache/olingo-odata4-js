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

 /** @module cache/source */
 
var utils = require("./../utils.js");
var odataRequest = require("./../odata.js");

var parseInt10 = utils.parseInt10;
var normalizeURICase = utils.normalizeURICase;




/** Appends the specified escaped query option to the specified URI.
 * @param {String} uri - URI to append option to.
 * @param {String} queryOption - Escaped query option to append.
 */
function appendQueryOption(uri, queryOption) {
    var separator = (uri.indexOf("?") >= 0) ? "&" : "?";
    return uri + separator + queryOption;
}

/** Appends the specified segment to the given URI.
 * @param {String} uri - URI to append a segment to.
 * @param {String} segment - Segment to append.
 * @returns {String} The original URI with a new segment appended.
 */
function appendSegment(uri, segment) {
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
}

/** Builds a request object to GET the specified URI.
 * @param {String} uri - URI for request.
 * @param {Object} options - Additional options.
 */
function buildODataRequest(uri, options) {
    return {
        method: "GET",
        requestUri: uri,
        user: options.user,
        password: options.password,
        enableJsonpCallback: options.enableJsonpCallback,
        callbackParameterName: options.callbackParameterName,
        formatQueryString: options.formatQueryString
    };
}

/** Finds the index where the value of a query option starts.
 * @param {String} uri - URI to search in.
 * @param {String} name - Name to look for.
 * @returns {Number} The index where the query option starts.
 */
function findQueryOptionStart(uri, name) {
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
}

/** Gets data from an OData service.
 * @param {String} uri - URI to the OData service.
 * @param {Object} options - Object with additional well-known request options.
 * @param {Function} success - Success callback.
 * @param {Function} error - Error callback.
 * @returns {Object} Object with an abort method.
 */
function queryForData (uri, options, success, error) {
    return queryForDataInternal(uri, options, {}, success, error);
}

/** Gets data from an OData service taking into consideration server side paging.
 * @param {String} uri - URI to the OData service.
 * @param {Object} options - Object with additional well-known request options.
 * @param {Array} data - Array that stores the data provided by the OData service.
 * @param {Function} success - Success callback.
 * @param {Function} error - Error callback.
 * @returns {Object} Object with an abort method.
 */
function queryForDataInternal(uri, options, data, success, error) {

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
}

/** Creates a data cache source object for requesting data from an OData service.
 * @class ODataCacheSource
 * @param options - Options for the cache data source.
 * @returns {ODataCacheSource} A new data cache source instance.
 */
function ODataCacheSource (options) {
    var that = this;
    var uri = options.source;
    
    that.identifier = normalizeURICase(encodeURI(decodeURI(uri)));
    that.options = options;

    /** Gets the number of items in the collection.
     * @method ODataCacheSource#count
     * @param {Function} success - Success callback with the item count.
     * @param {Function} error - Error callback.
     * @returns {Object} Request object with an abort method.
     */
    that.count = function (success, error) {
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
            }, error, undefined, options.httpClient, options.metadata
        );
    };
    
    /** Gets a number of consecutive items from the collection.
     * @method ODataCacheSource#read
     * @param {Number} index - Zero-based index of the items to retrieve.
     * @param {Number} count - Number of items to retrieve.
     * @param {Function} success - Success callback with the requested items.
     * @param {Function} error - Error callback.
     * @returns {Object} Request object with an abort method.
    */
    that.read = function (index, count, success, error) {

        var queryOptions = "$skip=" + index + "&$top=" + count;
        return queryForData(appendQueryOption(uri, queryOptions), that.options, success, error);
    };

    return that;
}



/** ODataCacheSource (see {@link ODataCacheSource}) */
exports.ODataCacheSource = ODataCacheSource;