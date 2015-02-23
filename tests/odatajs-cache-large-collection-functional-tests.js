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
    window.odatajs.oData.defaultHandler.accept = "application/json;q=0.9, */*;q=0.1";
    var largeCollectionFeed = "./endpoints/LargeCollectionService.svc/Customers";
    var itemsInCollection = 2 * 1024 * 1024;

    var cleanDomStorage = function (done) {
        /* Cleans all the data saved in the browser's DOM Storage. Needs to be called asynchronously in the 
         *  setup and teardown methods to be consistent with indexedDb's cleanup method.
         * @param {Function} done - Function to be called after DOM storage is cleared.
         */
        if (window.localStorage) {
            window.localStorage.clear();
        }
        done();
    };

    var cleanIndexedDb = function (done) {
        /** Cleans all the data saved in the browser's IndexedDb Storage.
         * @param {Function} done - Function to be called after DOM storage is cleared.
         */
        var caches = this.caches;

        djstest.cleanStoreOnIndexedDb(caches, done);
    };

    var makeUnexpectedErrorHandler = function () {
        return function (err) {
            djstest.assert(false, "Unexpected call to error handler with error: " + djstest.toString(err));
        };
    };

    var storageMechanisms = {
        indexeddb: { cleanup: cleanIndexedDb },
        dom: { cleanup: cleanDomStorage }
    };

    var cleanupAllStorage = function(done) {
        /** Cleans up all available storage mechanisms in the browser.
         * @param {Function} done - Function to be called by each cleanup function after storage is cleared.
         */
        var that = this;
        var storeCleanup = [];

        $.each(CacheVerifier.mechanisms, function(_, mechanism) {
            if (CacheVerifier.isMechanismAvailable(mechanism)) {
                storeCleanup.push(function(done) {
                    if (storageMechanisms[mechanism]) {
                        storageMechanisms[mechanism].cleanup.call(that, done);
                    } else {
                        done();
                    }
                });
            }
        });

        djstest.asyncDo(storeCleanup, done);
    };


    module("Functional", {
        setup: function () {
            this.observableHttpClient = new ObservableHttpClient();
            window.odatajs.oData.net.defaultHttpClient = this.observableHttpClient;
            this.caches = [];
            var that = this;

            djstest.wait(function (done) {
                cleanupAllStorage.call(that, done);
            });
        },

        teardown: function () {
            window.odatajs.oData.net.defaultHttpClient = this.observableHttpClient.provider;
            var clearActions = [];
            var that = this;

            $.each(this.caches, function (_, cacheObject) {
                cacheObject.cache.onidle = undefined;

                clearActions.push(function (done) {
                    cacheObject.cache.clear().then(function () {
                        done();
                    },
                        function (err) {
                            djstest.assert(false, "Unexpected call to error handler while attempting to clear with error: " + djstest.toString(err));
                        });
                });
            });

            djstest.wait(function (done) {
                djstest.asyncDo(clearActions, function () {
                    cleanupAllStorage.call(that, function () {
                        that.caches = [];
                        done();
                    });
                });
            });
        }
    });

    $.each(["dom", "indexeddb"], function (_, mechanism) {
        if (CacheVerifier.isMechanismAvailable(mechanism)) {
            $.each([-1, 10 * 1024 * 1024, 1024 * 10248], function (_, cacheSize) {
                var prefetchParameters = { mechanism: mechanism, feed: largeCollectionFeed, skip: 0, take: 5, pageSize: 1024, prefetchSize: -1, cacheSize: cacheSize };
                djstest.addTest(function (params) {

                    djstest.assertsExpected(3);
                    var options = { name: "cache" + new Date().valueOf(), source: params.feed, pageSize: params.pageSize, prefetchSize: params.prefetchSize,
                        mechanism: params.mechanism, cacheSize: params.cacheSize
                    };

                    var cache = odatajs.cache.createDataCache(options);
                    this.caches.push({ name: options.name,
                        cache: cache
                    });

                    cache.onidle = function () {
                        djstest.assert(true, "onidle Called");
                        djstest.done();
                    };

                    var cacheVerifier = new CacheVerifier(params.feed, params.pageSize, itemsInCollection);
                    var session = this.observableHttpClient.newSession();

                    cache.readRange(params.skip, params.take).then(function (data) {
                        var expectedRangeUrl = params.feed + "?$skip=" + params.skip + "&$top=" + params.take;
                        cacheVerifier.verifyRequests(session.requests, session.responses, params.skip, params.take, "largeCollection requests with prefetch", false, true);
                        window.ODataVerifyReader.readJsonAcrossServerPages(expectedRangeUrl, function (expectedData) {
                            djstest.assertAreEqualDeep(data, expectedData, "Verify response data");
                        });
                    }, function (err) {
                        makeUnexpectedErrorHandler(err)();
                    });
                }, "readRange and prefetch all to fill store on " + prefetchParameters.mechanism + " with cacheSize=" + prefetchParameters.cacheSize, prefetchParameters, 600000);

                $.each([500, 1024 * 10 /*Test reduced from 100 to 10 to work around slow running script error in IE8 and Safari (bug 2200)*/], function (_, pageSize) {
                    var largeReadParameters = { mechanism: mechanism, feed: largeCollectionFeed, skip: 0, take: 1024, pageSize: pageSize, prefetchSize: 0, cacheSize: cacheSize };
                    djstest.addTest(function (params) {

                        djstest.assertsExpected(2);
                        var options = { name: "cache" + new Date().valueOf(), source: params.feed, pageSize: params.pageSize, prefetchSize: params.prefetchSize,
                            mechanism: params.mechanism, cacheSize: params.cacheSize
                        };

                        var cache = odatajs.cache.createDataCache(options);
                        this.caches.push({ name: options.name, cache: cache });

                        var cacheVerifier = new CacheVerifier(params.feed, params.pageSize, itemsInCollection);
                        var session = this.observableHttpClient.newSession();

                        cache.readRange(params.skip, params.take).then(function (data) {
                            var expectedRangeUrl = params.feed + "?$skip=" + params.skip + "&$top=" + params.take;
                            cacheVerifier.verifyRequests(session.requests, session.responses, params.skip, params.take, "largeCollection requests without prefetch", false, false);
                            window.ODataVerifyReader.readJsonAcrossServerPages(expectedRangeUrl, function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Verify response data");
                                djstest.done();
                            });
                        }, function (err) {
                            makeUnexpectedErrorHandler(err)();
                            djstest.done();
                        });
                    }, "readRange of skip=" + largeReadParameters.skip + " take=" + largeReadParameters.take + " cacheSize=" + largeReadParameters.cacheSize + " and pageSize=" + largeReadParameters.pageSize +
                        " to fill store on " + largeReadParameters.mechanism, largeReadParameters, 600000);
                });
            });
        }
    });
})(this);