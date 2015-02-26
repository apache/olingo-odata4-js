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

    module("Unit");
    var foodsFeed = "./endpoints/FoodStoreDataServiceV4.svc/Foods";
    var collectionSize = 16;

    var thenFailTest = function (err) {
        if (err && err.message) {
            djstest.fail(err.message);
        } else {
            djstest.fail("unexepected promise failure");
        }

        djstest.done();
    };

    djstest.addTest(function dataCacheCountTest() {
        var cache = odatajs.cache.createDataCache({ name: "cache", source: foodsFeed });
        cache.count().then(function (count) {
            djstest.assertAreEqual(count, collectionSize, "expected count for Foods");
            djstest.destroyCacheAndDone(cache);
        }, thenFailTest);
    });

    djstest.addTest(function dataCacheCountOnLocalTest() {
        var cache = odatajs.cache.createDataCache({ name: "cache", source: foodsFeed, pageSize: collectionSize + 10, mechanism: "memory" });
        cache.readRange(0, collectionSize + 10).then(function (data) {
            var expectedCount = data.value ? data.value.length : 0;
            cache.count().then(function (count) {
                djstest.assertAreEqual(count, expectedCount, "expected count for expectedCount");
                djstest.destroyCacheAndDone(cache);
            }, thenFailTest);
        }, thenFailTest);
    });

    djstest.addTest(function dataCacheCountAbortTest() {
        // Abort before completion.
        var cache = odatajs.cache.createDataCache({ name: "cache", source: foodsFeed });
        var item = cache.count().then(thenFailTest, function (err) {
            djstest.assertAreEqual(true, err.canceled, "err.aborted is true");
            djstest.destroyCacheAndDone(cache);
        }).cancel();
    });

    var createNewCache = function (options) {

        var thenSuccess = null;

        var resolved = false;
        var rejected = false;

        var args = null;

        this.then = function (success) {
            if (resolved) {
                success.apply(null, args);
            } else if (!rejected) {
                thenSuccess = success;
            }
        };

        var resolve = function (/*args*/) {
            resolved = true;
            args = arguments;
            if (thenSuccess) {
                thenSuccess.apply(null, arguments);
            }
        };

        var cache = odatajs.cache.createDataCache(options);
        cache.clear().then(function () {
            var newCache = odatajs.cache.createDataCache(options);
            resolve(newCache);
        }, function (err) {
            rejected = true;
            thenFailTest(err);
        });

        return this;
    };

    djstest.addTest(function dataCacheReadRangeSingleTest() {
        // Read a new range.
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        createNewCache(options).
            then(function (cache) {
                cache.readRange(0, 1).
                    then(function (data) {
                        djstest.assertAreEqual(data.value.length, 1, "single item was read.");
                        djstest.assertAreEqual(data.value[0].FoodID, 0, "food id is 0.");
                        djstest.done();
                    }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadRangeExactPageTest() {
        // Read exactly one page.
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        createNewCache(options).
            then(function (cache) {
                cache.readRange(0, 2).
                    then(function (data) {
                        djstest.assertAreEqual(data.value.length, 2, "single item was read.");
                        djstest.assertAreEqual(data.value[0].FoodID, 0, "first food id is 0.");
                        djstest.assertAreEqual(data.value[1].FoodID, 1, "second food id is 1.");
                        djstest.done();
                    }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadRangeMultiplePageTest() {
        // Read multiple pages.
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        createNewCache(options).
            then(function (cache) {
                cache.readRange(0, 3).
                    then(function (data) {
                        djstest.assertAreEqual(data.value.length, 3, "single item was read.");
                        djstest.assertAreEqual(data.value[0].FoodID, 0, "first food id is 0.");
                        djstest.assertAreEqual(data.value[1].FoodID, 1, "second food id is 1.");
                        djstest.assertAreEqual(data.value[2].FoodID, 2, "third food id is 2.");
                        djstest.done();
                    }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadRangeSyncDelaysTest() {
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        var counter = 0;
        createNewCache(options).
            then(function (cache) {
                cache.readRange(0, 1).
                    then(function (data) {
                        djstest.assertAreEqual(counter, 0, "counter is zero for first set of results");
                        djstest.assertAreEqual(cache.stats.netReads, 1, "one request made to fulfill the readRange");
                        counter++;
                        cache.readRange(0, 1).
                            then(function (data) {
                                djstest.assertAreEqual(counter, 2, "counter is two because even sync results are delayed)");
                                djstest.assertAreEqual(cache.stats.netReads, 1, "no additional requests since requested data is in cache");
                                djstest.done();
                            }, thenFailTest);
                        djstest.assertAreEqual(counter, 1, "counter is one because readRange hasn't run (even if results are cached)");
                        counter++;
                    }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadRangesWithDestroyTest() {
        var options = { name: "cache", source: foodsFeed, pageSize: 2, prefetchSize: 0 };
        var counter = 0;
        createNewCache(options).then(function (cache) {
            cache.readRange(0, 1).then(function (data) {
                djstest.assertAreEqual(cache.stats.netReads, 1, "one request made to fulfill the readRange");
                cache.clear().then(function () {
                    djstest.assertAreEqual(cache.stats.netReads, 0, "stats cleared in destroy");
                    cache.readRange(0, 1).then(function (data) {
                        djstest.assertAreEqual(cache.stats.netReads, 1, "request made after destroy to fulfill the readRange");
                        djstest.done();
                    }, thenFailTest);
                }, thenFailTest);
            }, thenFailTest);
        }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadSimultaneousTest() {
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        var counter = 0;
        var theCache;
        var checkDataAndCount = function (data) {
            djstest.assertAreEqual(data.value.length, 1, "Single item returned");
            djstest.assertAreEqual(data.value[0].FoodID, 0, "FoodId is set to zero for first item");
            djstest.assertAreEqual(theCache.stats.netReads, 1, "single theCache.stats.netReads");
            djstest.assert(theCache.stats.prefetches <= 1, "theCache.stats.prefetches <= 1 - no repetitions");
            counter++;
            if (counter === 3) {
                djstest.done();
            }
        };

        createNewCache(options).
            then(function (cache) {
                theCache = cache;
                cache.readRange(0, 1).then(checkDataAndCount, thenFailTest);
                cache.readRange(0, 1).then(checkDataAndCount, thenFailTest);
                cache.readRange(0, 1).then(checkDataAndCount, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheMultipleClearTest() {
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        var counter = 0;
        var checkCount = function (data) {
            djstest.assert(true, "clear then was called");
            counter++;
            if (counter === 3) {
                djstest.done();
            }
        };

        createNewCache(options).
            then(function (cache) {
                cache.readRange(0, 1).then(function () {
                    cache.clear().then(checkCount, thenFailTest);
                    cache.clear().then(checkCount, thenFailTest);
                    cache.clear().then(checkCount, thenFailTest);
                }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheOnIdleIsFired() {
        var options = { name: "cache", source: foodsFeed, pageSize: 2, prefetchSize: 0 };

        createNewCache(options).
            then(function (cache) {
                var counter = 0;
                var clearSucceeded = false;

                var thenFailThisTest = function (err) {
                    if (err && err.message) {
                        djstest.fail(err.message);
                    } else {
                        djstest.fail("unexepected promise failure");
                    }
                };

                cache.onidle = function () {
                    counter++;
                    djstest.assertAreEqual(counter, 1, "onidle was called 1 times");
                    djstest.assert(clearSucceeded, "onidle was called after destroy");
                    djstest.done();
                };

                cache.readRange(0, 1).then(null, thenFailThisTest);
                cache.readRange(0, 1).then(null, thenFailThisTest);
                cache.readRange(3, 4).then(function () {
                    cache.readRange(5, 6).then(function () {
                        cache.clear().then(function () {
                            clearSucceeded = true;
                        }, thenFailThisTest);
                    }, thenFailThisTest);
                }, thenFailThisTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheOnIdleFiresOnErrorTest() {

        var errorResponse = false;
        var httpClient = {
            request: function (request, success, error) {
                var response = { statusCode: 200, headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, body: JSON.stringify({ d: [1, 2] }) };
                if (!errorResponse) {
                    errorResponse = true;
                    setTimeout(function () {
                        success(response);
                    }, 0);
                } else {
                    response.statusCode = 500;
                    response.body = "bad response";
                    setTimeout(function () {
                        error({ message: "HTTP request failed", request: request, response: response });
                    }, 0);
                }
            }
        };

        var options = { name: "cache", source: foodsFeed, pageSize: 2, prefetchSize: 0, httpClient: httpClient };

        createNewCache(options).
            then(function (cache) {
                var counter = 0;
                var errorHandlerCalled = false;

                var thenFailThisTest = function (err) {
                    if (err && err.message) {
                        if (errorResponse) {
                            djstest.assertAreEqual(err.message, "HTTP request failed", "Error is the expected one");
                            errorHandlerCalled = true;
                        } else {
                            djstest.fail(err.message);
                        }
                    } else {
                        djstest.fail("unexepected promise failure");
                    }
                };

                cache.onidle = function () {
                    counter++;
                    djstest.assertAreEqual(counter, 1, "onidle was called");
                    djstest.assert(errorHandlerCalled, "error handler was called before onidle");
                    cache.onidle = null;
                    cache.clear().then(function () {
                        djstest.done();
                    }, thenFailTest);
                };
                cache.readRange(0, 2).then(function () {
                    cache.readRange(2, 4).then(function () {
                        djstest.fail("unexpected readRange success");
                    }, thenFailThisTest);
                }, thenFailThisTest);
            }, thenFailTest);
    });


    djstest.addTest(function dataCacheOdataSourceNormalizedURITest() {
        var requestsMade = 0;
        var httpClient = {
            request: function (request, success, error) {
                var response = { statusCode: 200, headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, body: JSON.stringify({ value: [1, 2] }) };
                if (requestsMade === 0) {
                    djstest.pass("Cache made first request for data from the source");
                    requestsMade++;
                } else {
                    // In memory storage will make a second request from the new cache since two caches with the same name will coexist
                    if (window.mozIndexedDB || window.localStorage || requestsMade > 1) {
                        djstest.fail("Unexpected request to the source");
                    } else {
                        djstest.pass("In memory cache requested the data from the source");
                    }
                }
                setTimeout(function () {
                    success(response);
                }, 0);
            }
        };

        var options = { name: "cache", source: "http://exampleuri.com/my service.svc", pageSize: 2, prefetchSize: 0, httpClient: httpClient };

        createNewCache(options).
            then(function (cache) {
                cache.readRange(0, 2).then(function () {
                    options.source = "HtTp://ExampleURI.cOm/my%20service.svc";
                    var newCache = odatajs.cache.createDataCache(options);
                    newCache.readRange(0, 2).then(function (data) {
                        djstest.assertAreEqualDeep(data.value, [1, 2], "Got the expected data from the new cache instance");
                        newCache.clear().then(function () {
                            djstest.done();
                        }, thenFailTest);
                    }, thenFailTest);
                }, thenFailTest);
            }, thenFailTest);
    });


    djstest.addTest(function dataCachePrefetchAllTest() {
        var options = { name: "cache", source: foodsFeed, pageSize: 2, prefetchSize: -1 };
        var counter = 0;
        var theCache;

        var callback = function () {
            counter++;
            if (counter === 2) {
                djstest.assertAreEqual(1, theCache.stats.netReads, "single page to satisfy read (" + theCache.stats.netReads + ")");
                djstest.assert(theCache.stats.prefetches > 1, "theCache.stats.prefetches(" + theCache.stats.prefetches + ") > 1 - multiple prefetches");
                djstest.done();
            }
        };

        var checkDataAndCount = function (data) {
            djstest.assertAreEqual(data.value.length, 1, "Single item returned");
            djstest.assertAreEqual(data.value[0].FoodID, 0, "FoodId is set to zero for first item");
            djstest.assertAreEqual(1, theCache.stats.netReads, "single theCache.stats.netReads");
            djstest.assert(theCache.stats.prefetches <= 1, "theCache.stats.prefetches <= 1 - no repetitions");
            callback();
        };

        createNewCache(options).
            then(function (cache) {
                theCache = cache;
                cache.readRange(0, 1).then(checkDataAndCount, thenFailTest);
                cache.onidle = function () {
                    djstest.log("onidle fired");
                    callback();
                };
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadRangeTakeMoreThanCollectionCountTest() {
        // Read multiple pages.
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        createNewCache(options).
            then(function (cache) {
                cache.count().then(function (count) {
                    cache.readRange(0, count + 1).
                        then(function (data) {
                            djstest.assertAreEqual(data.value.length, count, "all items in the collection were read.");
                            cache.readRange(2, count + 1).
                                then(function (data) {
                                    djstest.assertAreEqual(data.value.length, count - 2, "all requested in the collection were read.");
                                    djstest.assertAreEqual(data.value[0].FoodID, 2, "first read food id is 2.");
                                    djstest.done();
                                }, thenFailTest);
                        }, thenFailTest);
                }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadRangeSkipMoreThanCollectionCountTest() {
        // Read multiple pages.
        var options = { name: "cache", source: foodsFeed, pageSize: 2 };
        createNewCache(options).
            then(function (cache) {
                cache.count().then(function (count) {
                    cache.readRange(count + 1, 5).
                        then(function (data) {
                            djstest.assertAreEqual(data.value.length, 0, "no items were read.");
                            djstest.done();
                        }, thenFailTest);
                }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheReadRangeTakeMoreThanPrefetchSizeTest() {
        // Read multiple pages.
        var options = { name: "cache", source: foodsFeed, pageSize: 2, prefetchSize: 1 };
        createNewCache(options).
            then(function (cache) {
                cache.readRange(0, 4).
                        then(function (data) {
                            djstest.assertAreEqual(data.value.length, 4, "all requested in the collection were read.");
                            djstest.assertAreEqual(data.value[0].FoodID, 0, "first food id is 0.");
                            djstest.assertAreEqual(data.value[1].FoodID, 1, "second food id is 1.");
                            djstest.assertAreEqual(data.value[2].FoodID, 2, "third food id is 2.");
                            djstest.assertAreEqual(data.value[3].FoodID, 3, "third food id is 3.");
                            djstest.done();
                        }, thenFailTest);
            }, thenFailTest);
    });

    djstest.addTest(function dataCacheRangeInvalidIndexAndCount() {
        var options = { name: "cache", source: foodsFeed, pageSize: 2, prefetchSize: 1 };
        var counter = 0;

        var thenFailSuccess = function () {
            djstest.fail("Call to success was unexpected");
            counter++;
            if (counter === tests.length) {
                djstest.done();
            }
        };

        var thenFailError = function () {
            djstest.fail("Call to error was unexpected");
            counter++;
            if (counter === tests.length) {
                djstest.done();
            }
        };

        var invalidValues = [-5, -1, null, undefined, NaN, Infinity, "5", "this is not a number"];
        var tests = [];
        $.each(invalidValues, function (_, value) {
            tests.push({ i: value, c: 0 });
            tests.push({ i: 0, c: value });
            tests.push({ i: value, c: value });
        });

        createNewCache(options).
            then(function (cache) {
                var i, len;
                for (i = 0, len = tests.length; i < len; i++) {
                    var test = tests[i];
                    try {
                        cache.readRange(test.i, test.c).then(thenFailSuccess, thenFailTest);
                    } catch (err) {
                        djstest.pass("Expected exception was thrown: " + err.message);
                        counter++;
                    }
                }
                if (counter === tests.length) {
                    djstest.done();
                }
            });
    });


    djstest.addTest(function cacheOptionsForCountTest() {
        var httpClient = {
            request: function (r, success, error) {
                window.setTimeout(function () {
                    success({ data: "10" });
                }, 1);
                return null;
            }
        };
        var cache = odatajs.cache.createDataCache({
            name: "mem", mechanism: "memory", source: "http://www.example.org/service/",
            httpClient: httpClient
        });
        cache.count().then(function (count) {
            djstest.assertAreEqual(count, 10, "count value");
            djstest.done();
        }, djstest.failAndDoneCallback("failed to get count"));
    });

    djstest.addTest(function dataCacheDestoryStopsThePrefetcherTest() {
        var oldHttpClientRequest = window.odatajs.oData.net.defaultHttpClient.request;
        var prefetchCount = 0;
        var theCache;

        window.odatajs.oData.net.defaultHttpClient.request = function (request, success, error) {
            prefetchCount++;
            djstest.assert(prefetchCount <= 3, "Expected prefetch request");
            if (prefetchCount === 3) {
                theCache.clear().then(function () {
                    djstest.assertAreEqual(prefetchCount, 3, "cache.clear() stopped the prefetcher");
                    djstest.done();
                    window.odatajs.oData.net.defaultHttpClient.request = oldHttpClientRequest;
                }, thenFailTest);
                return {
                    abort: function () { }
                };
            }
            return oldHttpClientRequest(request, success, error);
        };

        try {
            var options = { name: "cache", source: foodsFeed, pageSize: 1, prefetchSize: -1 };
            createNewCache(options).then(function (cache) {
                theCache = cache;
                cache.readRange(0, 0).then(null, thenFailTest);
            });
        } catch (e) {
            window.odatajs.oData.net.defaultHttpClient.request = oldHttpClientRequest;
            djstest.fail("Exception thrown,  prefetchSize: " + tests[count] + " error:  " + e.message);
            djstest.done();
        }
    });

    djstest.addTest(function dataCacheFilterTest() {
        var options = { name: "cache", source: foodsFeed, pageSize: 3, prefetchSize: -1 };
        var counter = 0;

        var singleItemPredicate = function (data) {
            return data.FoodID === 2;
        };

        var multipleItemPredicate = function (data) {
            return data.FoodID % 2 === 1;
        };

        var noItemPredicate = function (data) {
            return data.Name === "something i would never eat";
        };

        var allItemPredicate = function (data) {
            return data.FoodID >= 0;
        };

        var doneAfterAllTests = function () {
            counter++;
            if (counter === tests.length) {
                djstest.done();
            }
        };

        var last = collectionSize - 1;
        var tests = [
            { index: 0, count: -5, predicate: singleItemPredicate },    // Single match in entire collection
            {index: 2, count: 1, predicate: singleItemPredicate },     // Single match, single count
            {index: 3, count: 1, predicate: singleItemPredicate },     // Single match skipped, i.e. no matches
            {index: 0, count: -1, predicate: multipleItemPredicate },  // Multiple matches in entire collection
            {index: 0, count: 5, predicate: multipleItemPredicate },   // Multiple matches, take partial
            {index: 3, count: 5, predicate: multipleItemPredicate },   // Multiple matches, skip/take partial
            {index: 7, count: 10, predicate: multipleItemPredicate },  // Multiple matches, skip partial, take past end of collection
            {index: 13, count: 4, predicate: allItemPredicate },       // All items match, skip/take partial
            {index: 0, count: 20, predicate: noItemPredicate },        // No matches
            {index: 0, count: 0, predicate: allItemPredicate },        // Zero count
            {index: -5, count: 1, predicate: allItemPredicate },       // Negative index
            {index: last + 1, count: 1, predicate: allItemPredicate }, // Index past end of collection

            {index: last, count: -5, predicate: singleItemPredicate, backwards: true },        // Single match in entire collection
            {index: 2, count: 1, predicate: singleItemPredicate, backwards: true },            // Single match, single count
            {index: 1, count: 1, predicate: singleItemPredicate, backwards: true },            // Single match skipped, i.e. no matches
            {index: last, count: -1, predicate: multipleItemPredicate, backwards: true },      // Multiple matches in entire collection
            {index: last, count: 6, predicate: multipleItemPredicate, backwards: true },       // Multiple matches, take partial
            {index: last - 3, count: 5, predicate: multipleItemPredicate, backwards: true },   // Multiple matches, skip/take partial
            {index: 13, count: 10, predicate: multipleItemPredicate, backwards: true },        // Multiple matches, skip partial, take past end of collection
            {index: 4, count: 13, predicate: allItemPredicate, backwards: true },              // All items match, skip/take partial
            {index: last, count: 20, predicate: noItemPredicate, backwards: true },            // No matches
            {index: 0, count: 0, predicate: allItemPredicate, backwards: true },               // Zero count
            {index: -5, count: 1, predicate: allItemPredicate, backwards: true },              // Negative index
            {index: last + 1, count: 1, predicate: allItemPredicate, backwards: true },        // Index past end of collection

            {index: "foo", count: 1, predicate: singleItemPredicate, exception: { message: "'index' must be a valid number.", index: NaN} },
            { index: 0, count: "foo", predicate: multipleItemPredicate, exception: { message: "'count' must be a valid number.", count: NaN} }
        ];

        var testDescription = function(test) {
            return "filter [" + test.index + ", " + test.count + " " + (test.backwards ? "back" : "forward") + "] for predicate " + test.predicate;
        };

        var filterErrorCallback = function (err) {
            if (err && err.message) {
                djstest.fail(err.message);
            } else {
                djstest.fail("unexpected promise failure");
            }
            doneAfterAllTests();
        };

        /** Removes Safari-specific properties from an exception object
         * @param {Exception} err -The exception object to operate on
         * @returns {Exception} The original exception object with the Safari-specific properties removed
         */
        var removeSafariExceptionProperties = function (err) {

            var safariProperties = ["line", "expressionBeginOffset", "expressionEndOffset", "sourceId", "sourceURL"];

            var result = {};
            $.each(err, function (property, value) {
                if ($.inArray(property, safariProperties) === -1) {
                    result[property] = value;
                }
            });

            return result;
        };

        ODataVerifyReader.readJsonAcrossServerPages(foodsFeed, function (expectData) {
            $.each(tests, function (_, test) {
                createNewCache(options).then(function (cache) {
                    try {
                        var expectedResults = {};
                        if (test.backwards) {
                            cache.filterBack(test.index, test.count, test.predicate).then(function (results) {
                                expectedResults = CacheVerifier.getExpectedFilterResults(expectData, test.index, test.count, test.predicate, test.backwards);
                                djstest.assertAreEqualDeep(results, expectedResults, "results for " + testDescription(test));
                                doneAfterAllTests();
                            }, filterErrorCallback);
                        } else {
                            cache.filterForward(test.index, test.count, test.predicate).then(function (results) {
                                expectedResults = CacheVerifier.getExpectedFilterResults(expectData, test.index, test.count, test.predicate, test.backwards);
                                djstest.assertAreEqualDeep(results, expectedResults, "results for " + testDescription(test));
                                doneAfterAllTests();
                            }, filterErrorCallback);
                        }

                        if (test.exception) {
                            djstest.fail("expected exception for " + testDescription(test));
                            doneAfterAllTests();
                        }
                    } catch (err) {
                        if (test.exception) {
                            djstest.assertAreEqualDeep(removeSafariExceptionProperties(err), test.exception, "exception for " + testDescription(test));
                        } else {
                            djstest.fail("unexpected exception for " + testDescription(test) + ": " + djstest.toString(err));
                        }
                        doneAfterAllTests();
                    }
                }, thenFailTest);
            });
        });
    });

    djstest.addTest(function createDataCacheTest() {
        var cache;

        // Verify the defaults.
        cache = odatajs.cache.createDataCache({ name: "name", source: "src" });

        djstest.assertAreEqual(cache.onidle, undefined, "onidle is undefined");

        // Verify specific values.
        cache = odatajs.cache.createDataCache({ name: "name", source: "src", cacheSize: 1, pageSize: 2, prefetchSize: 3, idle: 123 });

        djstest.assertAreEqual(cache.onidle, 123, "onidle is as specified");

        // Verify 0 pageSize 
        djstest.expectException(function () {
            odatajs.cache.createDataCache({ name: "name", source: "src", cacheSize: 1, pageSize: 0, prefetchSize: 3, idle: 123 });
        }, "zero pageSize");

        // Verify negative pageSize
        djstest.expectException(function () {
            odatajs.cache.createDataCache({ name: "name", source: "src", cacheSize: 1, pageSize: -2, prefetchSize: 3, idle: 123 });
        }, "negative pageSize");

        // Verify NaN pageSize
        djstest.expectException(function () {
            cache = odatajs.cache.createDataCache({ name: "name", source: "src", cacheSize: 1, pageSize: "2", prefetchSize: 3, idle: 123 });
        }, "NaN pageSize");

        // Verify NaN cacheSize
        djstest.expectException(function () {
            cache = odatajs.cache.createDataCache({ name: "name", source: "src", cacheSize: "1", pageSize: 2, prefetchSize: 3, idle: 123 });
        }, "NaN cacheSize");

        // Verify NaN prefetchSize
        djstest.expectException(function () {
            cache = odatajs.cache.createDataCache({ name: "name", source: "src", cacheSize: 1, pageSize: 2, prefetchSize: "3", idle: 123 });
        }, "NaN prefetchSize");

        // Verify undefined name 
        djstest.expectException(function () {
            odatajs.cache.createDataCache({ source: "src", cacheSize: 1, pageSize: 1, prefetchSize: 3, idle: 123 });
        }, "undefined name");

        // Verify null name 
        djstest.expectException(function () {
            odatajs.cache.createDataCache({ name: null, source: "src", cacheSize: 1, pageSize: 1, prefetchSize: 3, idle: 123 });
        }, "null name");

        // Verify undefined source 
        djstest.expectException(function () {
            odatajs.cache.createDataCache({ name: "name", cacheSize: 1, pageSize: 1, prefetchSize: 3, idle: 123 });
        }, "undefined source");

        djstest.done();
    });

    djstest.addTest(function createDataCacheWithSourceTest() {
        var cacheSource = {
            count: function (success) {
                djstest.pass("cacheSource.count was called");
                success(0);
            },

            read: function (index, count, success, error) {
                djstest.assertAreEqual(index, 0, "index is the expected one");
                djstest.assertAreEqual(count, 10, "test is the expected one");
                djstest.assert(success, "success is defined");
                djstest.assert(error, "error is defined");
                djstest.pass("cacheSource.read was called");

                setTimeout(function () {
                    success([]);
                }, 0);
            }
        };

        var cache = odatajs.cache.createDataCache({ name: "name", source: cacheSource, mechanism: "memory", pageSize: 10 });
        cache.count().then(function () {
            cache.readRange(0, 5).then(function () {
                djstest.done();
            }, thenFailTest);
        }, thenFailTest);
    });

    djstest.addTest(function cacheInitializationFailTest() {
        // Tests various failure modes for cache initialization.
        var failures = ["read-settings", "write-settings", "v2"];
        var failureIndex = 0;

        var originalStore = odatajs.store.createStore;
        var restoreStore = function () {
            odatajs.store.createStore = originalStore;
        };

        var storeError = { message: "cacheInitializationFailTest error" };
        odatajs.store.createStore = function (name, mechanism) {
            return {
                addOrUpdate: function (key, value, successCallback, errorCallback) {
                    if (failures[failureIndex] === "write-settings") {
                        window.setTimeout(function () { errorCallback(storeError); }, 2);
                    } else {
                        djstest.fail("Error unaccounted for in addOrUpdate for " + failures[failureIndex]);
                        window.setTimeout(function () { errorCallback(storeError); }, 2);
                    }
                },
                read: function (key, successCallback, errorCallback) {
                    if (failures[failureIndex] === "read-settings") {
                        window.setTimeout(function () { errorCallback(storeError); }, 2);
                    } else if (failures[failureIndex] === "v2") {
                        window.setTimeout(function () {
                            successCallback("K", { version: "2.0" });
                        }, 2);
                    } else if (failures[failureIndex] === "write-settings") {
                        window.setTimeout(function () { successCallback(null, null); }, 2);
                    } else {
                        djstest.fail("Error unaccounted for read in " + failures[failureIndex]);
                        window.setTimeout(function () { errorCallback(storeError); }, 2);
                    }
                }
            };
        };

        var nextFailure = function () {
            djstest.log("Failure mode: " + failures[failureIndex]);
            var cache = odatajs.cache.createDataCache({ name: "name", source: "foo", mechanism: "memory", pageSize: 10 });
            try {
                // The first readRange should succeed, because the data cache isn't really initialized at this time.
                cache.readRange(1, 2).then(djstest.failAndDoneCallback("No function should succeed"), function (err) {
                    djstest.expectException(function () {
                        cache.readRange(1, 2);
                    }, "readRange after store is invalidated");

                    djstest.expectException(function () {
                        cache.count();
                    }, "count after store is invalidated");

                    djstest.expectException(function () {
                        cache.clear();
                    }, "clear after store is invalidated");

                    djstest.expectException(function () {
                        cache.filterForward(1, 2);
                    }, "filterForward after store is invalidated");

                    djstest.expectException(function () {
                        cache.filterBack(1, 2);
                    }, "filterBack after store is invalidated");

                    djstest.expectException(function () {
                        cache.toObservable();
                    }, "toObservable after store is invalidated");

                    failureIndex++;
                    if (failureIndex === failures.length) {
                        restoreStore();
                        djstest.done();
                    } else {
                        nextFailure();
                    }
                });
            } catch (outerError) {
                djstest.fail("Unexpected failure for first .readRange: " + window.JSON.stringify(outerError));
                restoreStore();
                djstest.done();
            }
        };

        nextFailure();
    });

    djstest.addTest(function createDataCacheWithSourceCallsErrorTest() {
        var cacheSource = {
            count: function () {
                djstest.fail("cacheSource.count was called");
            },

            read: function (index, count, success, error) {
                setTimeout(function () {
                    error({ message: "source error" });
                }, 0);
            }
        };

        var cache = odatajs.cache.createDataCache({ name: "name", source: cacheSource, mechanism: "memory", pageSize: 10 });
        cache.readRange(0, 5).then(function () {
            djstest.fail("unexpected call to then success");
            djstest.done();
        }, function (err) {
            djstest.assertAreEqual(err.message, "source error", "got the expected error");
            djstest.done();
        });
    });

    djstest.addTest(function toObservableMissingTest() {
        createNewCache({ name: "cache", source: "http://temp.org" }).then(function (cache) {
            var hiddenRx = window.Rx;
            try {
                window.Rx = null;
                var error = null;
                try {
                    cache.ToObservable();
                } catch (err) {
                    error = err;
                }

                djstest.assert(error !== null, "error !== null");
            } finally {
                window.Rx = hiddenRx;
            }

            djstest.assert(error !== null, "error !== null");
            djstest.destroyCacheAndDone(cache);
        });
    });

    djstest.addTest(function toObservableSinglePageTest() {
        createNewCache({ name: "cache", source: foodsFeed }).then(function (cache) {
            var lastId = -1;
            cache.ToObservable().subscribe(function (item) {
                djstest.assert(lastId < item.FoodID, "lastId < item.FoodID");
                lastId = item.FoodID;
            }, thenFailTest, function () {
                djstest.assert(lastId !== -1, "lastId !== -1");
                djstest.done();
            });
        });
    });

    djstest.addTest(function toObservableCaseSinglePageTest() {
        createNewCache({ name: "cache", source: foodsFeed }).then(function (cache) {
            var lastId = -1;
            cache.toObservable().subscribe(function (item) {
                djstest.assert(lastId < item.FoodID, "lastId < item.FoodID");
                lastId = item.FoodID;
            }, thenFailTest, function () {
                djstest.assert(lastId !== -1, "lastId !== -1");
                djstest.done();
            });
        });
    });

    djstest.addTest(function toObservableMultiplePageTest() {
        createNewCache({ name: "cache", source: foodsFeed, pageSize: 2 }).then(function (cache) {
            var lastId = -1;
            var callCount = 0;
            cache.toObservable().subscribe(function (item) {
                djstest.assert(lastId < item.FoodID, "lastId < item.FoodID");
                lastId = item.FoodID;
                callCount += 1;
            }, thenFailTest, function () {
                djstest.assert(lastId !== -1, "lastId !== -1");
                djstest.assert(callCount > 1, "callCount > 1");
                djstest.done();
            });
        });
    });

    djstest.addTest(function toObservableEarlyDisposeTest() {
        createNewCache({ name: "cache", source: foodsFeed, pageSize: 2 }).then(function (cache) {
            var lastId = -1;
            var callCount = 0;
            var complete = false;
            var observer = cache.toObservable().subscribe(function (item) {
                djstest.assert(complete === false, "complete === false");
                djstest.assert(lastId < item.FoodID, "lastId < item.FoodID");
                lastId = item.FoodID;
                callCount += 1;
                complete = true;
                observer.Dispose();
                djstest.done();
            }, thenFailTest);
        });
    });

    djstest.addTest(function toObservableFailureTest() {
        createNewCache({ name: "cache", source: foodsFeed, pageSize: 2 }).then(function (cache) {
            var lastId = -1;
            var complete = false;
            window.MockHttpClient.clear().addResponse("*", { statusCode: 500, body: "server error" });
            window.MockHttpClient.async = true;
            var savedClient = window.odatajs.oData.net.defaultHttpClient;
            window.odatajs.oData.net.defaultHttpClient = window.MockHttpClient;
            cache.toObservable().subscribe(function (item) {
                window.odatajs.oData.net.defaultHttpClient = savedClient;
                djstest.fail("Unexpected call to OnNext");
            }, function (err) {
                djstest.assert(complete === false, "complete === false");
                djstest.assert(err, "err defined");
                window.odatajs.oData.net.defaultHttpClient = savedClient;
                complete = true;
                djstest.done();
            }, function (complete) {
                djstest.fail("Unexpected call to complete. Error handler should be called.");
                window.odatajs.oData.net.defaultHttpClient = savedClient;
                complete = true;
                djstest.done();
            });
        });
    });

    // DATAJS INTERNAL START

    djstest.addTest(function createDeferredTest() {
        // Verify basic use of deferred object.
        var deferred = odatajs.deferred.createDeferred();
        deferred.then(function (val1, val2) {
            djstest.assertAreEqual(val1, 1, "val1 is as specified");
            djstest.assertAreEqual(val2, 2, "val2 is as specified");
            djstest.done();
        });
        deferred.resolve(1, 2);
    });

    djstest.addTest(function deferredThenTest() {
        // Verify then registration and chaining.
        var deferred = odatajs.deferred.createDeferred();
        deferred.then(function (val1, val2) {
            djstest.assertAreEqual(val1, 1, "val1 is as specified");
            djstest.assertAreEqual(val2, 2, "val2 is as specified");
            return "foo";
        }).then(function (foo) {
            // See Compatibility Note B in DjsDeferred remarks.
            djstest.assert(foo !== "foo", "argument for chained 'then' is *not* result of previous call");
            djstest.assert(foo === 1, "argument for chained 'then' is same as for previous call");

            var other = odatajs.deferred.createDeferred();
            other.then(null, function (err, msg) {
                djstest.assertAreEqual("error", err, "err is as specified");
                djstest.assertAreEqual("message", msg, "msg is as specified");

            }).then(null, function (err, msg) {
                djstest.log("chained errors are called");

                djstest.assertAreEqual("error", err, "err is as specified");
                djstest.assertAreEqual("message", msg, "msg is as specified");

                var multiple = odatajs.deferred.createDeferred();
                var count = 0;

                // See Compatibility Note A in DjsDeferred remarks.
                multiple.then(function () {
                    djstest.assertAreEqual(count, 0, "first base registration fires as #0");
                    count++;
                }).then(function () {
                    djstest.assertAreEqual(count, 1, "first chained registration fires as #1");
                    count++;
                });

                multiple.then(function () {
                    djstest.assertAreEqual(count, 2, "second base registration fires as #2");
                    count++;
                }).then(function () {
                    djstest.assertAreEqual(count, 3, "second chained registration fires as #3");
                    djstest.done();
                });

                multiple.resolve();
            });
            other.reject("error", "message");
        });

        deferred.resolve(1, 2);
    });

    djstest.addTest(function deferredResolveTest() {
        // Resolve with no arguments.
        var deferred = odatajs.deferred.createDeferred();
        deferred.then(function (arg) {
            djstest.assertAreEqual(arg, undefined, "resolve with no args shows up as undefined");

            // Resolve with no callbacks.
            var other = odatajs.deferred.createDeferred();
            other.resolve();
            djstest.done();
        });

        deferred.resolve();
    });

    djstest.addTest(function deferredRejectTest() {
        // Resolve with no arguments.   
        var deferred = odatajs.deferred.createDeferred();
        deferred.then(null, function (arg) {
            djstest.assertAreEqual(arg, undefined, "reject with no args shows up as undefined");

            // Resolve with no callbacks.
            var other = odatajs.deferred.createDeferred();
            other.reject();
            djstest.done();
        });

        deferred.reject();
    });

    djstest.addTest(function estimateSizeTest() {
        var tests = [
            { i: null, e: 8 },
            { i: undefined, e: 8 },
            { i: 0, e: 8 },
            { i: "abc", e: 6 },
            { i: [1, 2, 3], e: 30 },
            { i: { a1: null, a2: undefined, a3: 5, a4: "ab", a5: { b1: 5, b2: 6} }, e: 72 },
            { i: {}, e: 0 }
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var test = tests[i];
            djstest.assertAreEqual(odatajs.cache.estimateSize(test.i), test.e);
        }
        djstest.done();
    });

    djstest.addTest(function cacheOptionsTunnelTest() {
        var mockClient = window.MockHttpClient;
        var doneCalled = false;

        mockClient.clear().setAsync(true).addRequestVerifier("*", function (theRequest) {
            if (!doneCalled) {
                doneCalled = true;
                djstest.assertAreEqual(theRequest.user, "the-user", "theRequest.user");
                djstest.assertAreEqual(theRequest.password, "the-password", "theRequest.password");
                djstest.assertAreEqual(theRequest.enableJsonpCallback, false, "theRequest.enableJsonpCallback");
                djstest.assertAreEqual(theRequest.callbackParameterName, "p", "callbackParameterName");
                djstest.done();
            }
        });

        var cache = odatajs.cache.createDataCache({
            name: "cacheOptionsTunnel",
            source: "http://foo-bar/",
            user: "the-user",
            password: "the-password",
            enableJsonpCallback: false,
            callbackParameterName: "p",
            httpClient: mockClient
        });

        cache.readRange(0, 10).then(function (arr) {
            djstest.fail("unexpected callback into readRange in test cacheOptionsTunnelTest");
            if (!doneCalled) {
                doneCalled = true;
                djstest.done();
            }
        });
    });

    djstest.addTest(function dataCacheHandlesFullStoreTest() {

        var TestStore = function (name) {
            var that = new window.odatajs.store.MemoryStore(name);
            that.addOrUpdate = function (key, value, success, error) {
                if (key === "__settings") {
                    window.setTimeout(function () {
                        success(key, value);
                    }, 0);
                } else {
                    window.setTimeout(function () {
                        error({ name: "QUOTA_EXCEEDED_ERR" });
                    }, 0);
                }
            };
            return that;
        };

        TestStore.create = function (name) {
            return new TestStore(name);
        };

        TestStore.isSupported = function () {
            return true;
        };

        var cacheSource = {
            identifier: "testSource",
            count: function (success) {
                djstest.fail("cacheSource.count was called");
                success(5);
            },
            read: function (index, count, success, error) {
                djstest.assertAreEqual(index, 0, "index is the expected one");
                djstest.assertAreEqual(count, 5, "test is the expected one");

                setTimeout(function () {
                    success({ value: [1, 2, 3, 4, 5] });
                }, 0);
            }
        };

        var originalCreateStore = window.odatajs.store.createStore;

        window.odatajs.store.createStore = function (name, mechanism) {
            return TestStore(name);
        };

        try {
            var cache = odatajs.cache.createDataCache({
                name: "cache",
                pageSize: 5,
                prefetchSize: 0,
                source: cacheSource,
                mechanism: "teststore"
            });
        } finally {
            window.odatajs.store.createStore = originalCreateStore;
        }

        cache.readRange(0, 5).then(function (data) {
            djstest.assertAreEqual(data.value.length, 5, "5 items were read.");
            cache.readRange(0, 5).then(function (data) {
                djstest.assertAreEqual(data.value.length, 5, "5 items were read.");
                djstest.done();
            }, thenFailTest);
        }, thenFailTest);
    });

    // DATAJS INTERNAL END
})(this);