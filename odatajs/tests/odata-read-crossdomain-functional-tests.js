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

(function (window, undefined) {

    var unexpectedErrorHandler = function (err) {
        djstest.assert(false, "Unexpected call to error handler with error: " + djstest.toString(err));
        djstest.done();
    };

    var fixConstructors = function (obj) {
        /** Fix the constructors of the supplied object graph.
        */
        
        /// When using IE9 or a non-IE browser, the JSONP support in the library creates objects in a separate IFRAME,
        /// causing the constructor property to be different to that of objects created by the verifier. This function
        /// stringifies and then re-parses the object, which fixes the constructors.
        
        if (!window.ActiveXObject || window.DOMParser) {
            return window.JSON.parse(window.JSON.stringify(obj));
        } else {
            return obj;
        }
    };

    var handlerAcceptStrings = [
        "*/*",
        "application/json",
        undefined
    ];

    var formatJsonStrings = [
        "application/json",
        "application/json;odata.metadata=none",
        "application/json;odata.metadata=minimal",
        "application/json;odata.metadata=full", // to do: all the full metadata scenarios fail currently, need to fix.
        undefined
    ];
    var azureOdataService = "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/";
    var azureOdataFeed = azureOdataService + "Categories";
    var crossDomainTimeout = 45000;

    module("CrossDomain", {
        setup: function () {
            this.oldEnableJsonpCallback = window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback;
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = true;
        },
        teardown: function () {
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = this.oldEnableJsonpCallback;
        }
    });

    for (var i = 0; i < handlerAcceptStrings.length; i++) {
        for (var j = 0; j < formatJsonStrings.length; j++) {
            djstest.addTest(function readCrossDomainFullFeedTest(params) {
                djstest.assertsExpected(1);
                var request = { requestUri: azureOdataFeed, headers: { Accept: params.handlerAccept}, enableJsonpCallback: true };
                if (params.formatJsonString != undefined) {
                    request.formatQueryString = "$format=" + params.formatJsonString;
                }

                djstest.log("Reading data over the wire.");
                odatajs.oData.read(request, function (data, response) {
                    djstest.log("Verifying data over the wire from verifiert.");
                    window.ODataVerifyReader.readFeed(azureOdataFeed, function (expectedData) {
                        data = fixConstructors(data);
                        djstest.assertWithoutMetadata(data, expectedData, "Response data not same as expected");
                        djstest.done();
                    }, params.formatJsonString);
                }, unexpectedErrorHandler);
            }, "Testing valid read of cross domain feed collection with " + handlerAcceptStrings[i] + "," + formatJsonStrings[j], { handlerAccept: handlerAcceptStrings[i], formatJsonString: formatJsonStrings[j] }, crossDomainTimeout);
        }

        djstest.addTest(function readCrossDomainEntryTest(handlerAccept) {
            var endPoint = azureOdataFeed + "(1)";
            djstest.assertsExpected(1);
            djstest.log("Reading data over the wire.");
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} }, function (data, response) {
                djstest.log("Verifying data over the wire from verifier.");
                window.ODataVerifyReader.readEntry(endPoint, function (expectedData) {
                    data = fixConstructors(data);
                    djstest.assertWithoutMetadata(data, expectedData, "Response data not same as expected");
                    djstest.done();
                }, "application/json");
            }, unexpectedErrorHandler);
        }, "Testing valid read of cross domain entry with " + handlerAcceptStrings[i], handlerAcceptStrings[i], crossDomainTimeout);
    }

    var prefetchSizes = [-1, 0, 15];
    var cacheSizes = [-1, 0, 15];
    var skipValues = [
        0,
        14, // < pageSize
        15, // = pageSize
        16 // > pageSize but < pageSize + prefetchSize
    ];

    var createTestName = function (params) {
        return "Testing ReadRange of " + params.feed + " skip " + params.skip + " take " + params.take + " with pageSize " +
            params.pageSize + ", prefetch " + params.prefetchSize + " and cacheSize " + params.cacheSize;
    };

    var dataCacheReadRangeSingleTest = function (params) {
        var options = { name: "cache", source: params.feed, pageSize: params.pageSize, prefetchSize: params.prefetchSize, cacheSize: params.cacheSize };
        window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = true;
        var cache = odatajs.cache.createDataCache(options);
        cache.readRange(params.skip, params.take).then(function (data) {
            validateExpectedRange(cache, data, params.feed, params.skip, params.take);
        }, unexpectedErrorHandler);
    };

    var validateExpectedRange = function (cache, data, feed, skipValue, takeValue) {
        var expectedRangeUrl = feed + "?$skip=" + skipValue + "&$top=" + takeValue;
        window.ODataVerifyReader.readFeed(expectedRangeUrl, function (expectedData) {
            if (expectedData.results) {
                expectedData = expectedData.results;
            }
            data = fixConstructors(data);
            djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
            djstest.destroyCacheAndDone(cache);
        });
    };

    $.each(prefetchSizes, function (_, prefetchSizeValue) {
        $.each(cacheSizes, function (_, cacheSizeValue) {
            var parameters = { feed: "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/Categories", skip: 0, take: 5, pageSize: 15, prefetchSize: prefetchSizeValue, cacheSize: cacheSizeValue };
            djstest.addTest(dataCacheReadRangeSingleTest, createTestName(parameters), parameters);
        });
    });

    $.each(skipValues, function (_, skipValue) {
        var parameters = { feed: "http://odatasampleservices.azurewebsites.net/V4/OData/OData.svc/Categories", skip: skipValue, take: 14, pageSize: 5, prefetchSize: 5, cacheSize: 5 };
        djstest.addTest(dataCacheReadRangeSingleTest, createTestName(parameters), parameters, crossDomainTimeout);
    });
})(this);
