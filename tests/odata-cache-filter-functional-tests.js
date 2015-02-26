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
    odatajs.oData.defaultHandler.accept = "application/json;q=0.9, */*;q=0.1";
    var feeds = [
        { feed: "./endpoints/FoodStoreDataServiceV4.svc/Foods" }
    ];

    var itemsInCollection = 16;

    var pageSize = 3;
    var readRangeStart = pageSize + 1;
    var readRangeTake = pageSize;

    // Indices for filterForward after an initial readRange has partially filled the cache
    var filterForwardAfterReadIndices = [
        readRangeStart - 1, // before items in the cache
        readRangeStart, // beginning of items in the cache
        readRangeStart + readRangeTake, // last item prefetched in the cache
        readRangeStart + readRangeTake + 1 // past range already in cache
    ];

    // Indices for filterBack after an initial readRange has partially filled the cache
    var filterBackAfterReadIndices = [
        readRangeStart - 1, // before items in the cache
        readRangeStart, // beginning of items in the cache
        readRangeStart + readRangeTake, // last item prefetched in the cache
        readRangeStart + readRangeTake + 1 // past range already in cache
    ];

    // Counts for filterForward after a readRange has partially filled the cache
    var filterForwardAfterReadCounts = [
        -5, // Get all items
        3, // Subset of all items found in the cache
        itemsInCollection
    ];

    // Counts for filterBack after a readRange has partially filled the cache
    var filterBackAfterReadCounts = [
        -5, // Get all items
        3, // Subset of all items found in the cache
        itemsInCollection
    ];

    // Indices for single filterForward
    var singleFilterForwardIndices = [
        -5,
        itemsInCollection - 1,
        itemsInCollection, // beyond the end of the collection
        itemsInCollection + pageSize // more than one page beyond the collection
    ];

    // Indices for single filterBack
    var singleFilterBackIndices = [
        -1,
        0,
        itemsInCollection - 1
    ];

    // Count for single filterForward
    var singleFilterForwardCounts = [
        5,
        itemsInCollection + 1 // more than number of items in collection
    ];

    // Count for single filterBack
    var singleFilterBackCounts = [
        5,
        itemsInCollection + 1 // more than number of items in collection
    ];

    // Index/count variations for multiple filterForwards
    var multipleFilterForwards = [
        { index: 0, count: -1 },  // everything
        {index: 2, count: 5 },   // range in first half
        {index: 4, count: 7 },   // range in the middle to overlap first and second half
        {index: 9, count: 4}    // range in second half
    ];

    // Index/count variations for multiple filterBacks
    var multipleFilterBacks = [
        { index: itemsInCollection - 1, count: -1 },  // everything
        {index: itemsInCollection - 2, count: 5 },   // range in second half
        {index: itemsInCollection - 4, count: 7 },   // range in the middle to overlap first and second half
        {index: itemsInCollection - 9, count: 4}    // range in first half
    ];


    var invalidIndices = [NaN, undefined, Infinity, "not a valid value"];
    var invalidCounts = [NaN, undefined, Infinity, "not a valid value"];

    // Predicate which returns all items in the collection
    var getAllItemsPredicate = function (item) {
        return true;
    };

    // Predicate which returns none of the items in the collection
    var getNoItemsPredicate = function (item) {
        return false;
    };

    var getEveryThirdPredicate = function (item) {
        return ((item.FoodID % 3) === 0);
    };

    var filterPredicates = [
        getAllItemsPredicate,
        getNoItemsPredicate,
        getEveryThirdPredicate
    ];

    var expectException = function (cache) {
        djstest.assert(false, "We should not get here because the an exception is expected.");
        djstest.destroyCacheAndDone(cache);
    };

    var makeUnexpectedErrorHandler = function (cache) {
        return function (err) {
            djstest.assert(false, "Unexpected call to error handler with error: " + djstest.toString(err));
            if (cache) {
                djstest.destroyCacheAndDone(cache);
            } else {
                djstest.done();
            }
        };
    };

    /** Runs filter and validates the results and network requests
     * @param {Object} feed - The feed being read from
     * @param {Object} cache - The cache to perform the filter on
     * @param {Integer} index - The index value
     * @param {Integer} count - The count value
     * @param {Object} predicate - Filter string to append to the feed to validate the predicate
     * @param {Function} finished - Callback function called after data is verified
     * @param {Boolean} backwards - Use filterBack
     * @param {Object} session - Session object to validate the network requests
     * @param {Object} cacheVerifier - CacheVerifier object to validate the network requests
     */
    var validateFilterResultsAndRequests = function (feed, cache, index, count, predicate, finished, backwards, session, cacheVerifier) {

        if (count < 0) {
            count = itemsInCollection;
        }

        if (index < 0) {
            index = 0;
        }

        window.ODataVerifyReader.readJsonAcrossServerPages(feed, function (expectData) {
            if (backwards) {
                cache.filterBack(index, count, predicate).then(function (actualResults) {
                    var expectedResults = CacheVerifier.getExpectedFilterResults(expectData, index, count, predicate, backwards);
                    djstest.assertAreEqualDeep(actualResults, expectedResults, "results for " + "filterBack requests");

                    if (session && cacheVerifier) {
                        // If the count is not satisfied in the expected results, read to the beginning of the collection
                        // otherwise read to the first expected index
                        var firstIndex = 0; 
                        if (expectedResults.value.length != 0) {
                            firstIndex = (expectedResults.value.length < count) ? 0 : expectedResults.value[0].index;
                        }
                        // The effective count is the number of items between the first and last index
                        var expectedCount = index - firstIndex + 1;
                        cacheVerifier.verifyRequests(session.requests, session.responses, firstIndex, expectedCount, "filterBack requests", backwards);
                    }
                    finished();
                });
            }
            else {
                cache.filterForward(index, count, predicate).then(function (actualResults) {
                    var expectedResults = CacheVerifier.getExpectedFilterResults(expectData, index, count, predicate, backwards);
                    djstest.assertAreEqualDeep(actualResults, expectedResults, "results for " + "filterForward requests");

                    if (session && cacheVerifier) {
                        if (expectedResults.value.length > 0) {
                            // If the count is not satisfied in the expected results, read to the end of the collection
                            // otherwise read to the last index
                            var lastIndex = (expectedResults.value.length < count) ? itemsInCollection : expectedResults.value[expectedResults.value.length - 1].index + 1;
                            // One request is made if the index is outside the range of the collection if the end of the collection has not yet been found
                            var expectedCount = (index < itemsInCollection) ? (lastIndex - index) : 1;
                        }
                        else {
                            var expectedCount = itemsInCollection;
                        }

                        cacheVerifier.verifyRequests(session.requests, session.responses, index, expectedCount, "filterForward requests", backwards);
                    }
                    finished();
                });
            }
        });
    };

    var createMultipleFilterTestName = function (scenarioName, params) {
        return "Testing " + scenarioName + (params.backwards ? "filterBack: " : "filterForward: ") + " of " + params.feed + " with predicate " + params.predicate + " [index " +
            params.firstIndex + ", count " + params.firstCount + "] and [index " + params.secondIndex + ", count " + params.secondCount +
            "] with pageSize " + params.pageSize + ", and prefetch " + params.prefetchSize;
    };

    var createSingleFilterTestName = function (scenarioName, params) {
        return "Testing " + scenarioName + (params.backwards ? "filterBack: " : "filterForward: ") + " of " + params.feed + " with predicate " + params.predicate + " [index " +
            params.index + ", count " + params.count + "] with pageSize " + params.pageSize + ", and prefetch " + params.prefetchSize;
    };

    var singleFilterTest = function (params) {
        djstest.assertsExpected(2);
        var options = { name: "cache" + new Date().valueOf(), source: params.feed, pageSize: params.pageSize, prefetchSize: params.prefetchSize };

        var cache = odatajs.cache.createDataCache(options);
        var cacheVerifier = new CacheVerifier(params.feed, params.pageSize, itemsInCollection);
        var session = this.observableHttpClient.newSession();
        validateFilterResultsAndRequests(params.feed, cache, params.index, params.count, params.predicate, function () { djstest.destroyCacheAndDone(cache) }, params.backwards, session, cacheVerifier);
    };

    var filterAfterReadRangeTest = function (params) {
        djstest.assertsExpected(3);
        var options = { name: "cache" + new Date().valueOf(), source: params.feed, pageSize: params.pageSize, prefetchSize: params.prefetchSize };

        var cache = odatajs.cache.createDataCache(options);
        var cacheVerifier = new CacheVerifier(params.feed, params.pageSize, itemsInCollection);
        var session = this.observableHttpClient.newSession();

        cache.readRange(params.skip, params.take).then(function (data) {
            cacheVerifier.verifyRequests(session.requests, session.responses, params.skip, params.take, "readRange requests");
            session.clear();
            validateFilterResultsAndRequests(params.feed, cache, params.index, params.count, params.predicate, function () { djstest.destroyCacheAndDone(cache); }, params.backwards, session, cacheVerifier);
        });
    };

    var parallelFilterTest = function (params) {
        djstest.assertsExpected(2);
        var options = { name: "cache" + new Date().valueOf(), source: params.feed, pageSize: params.pageSize, prefetchSize: params.prefetchSize };

        var cache = odatajs.cache.createDataCache(options);

        var firstfilter = function (finished) {
            validateFilterResultsAndRequests(params.feed, cache, params.firstIndex, params.firstCount, params.predicate, finished, params.backwards);
        };

        var secondfilter = function (finished) {
            validateFilterResultsAndRequests(params.feed, cache, params.secondIndex, params.secondCount, params.predicate, finished, params.backwards);
        };

        djstest.asyncDo([firstfilter, secondfilter], function () {
            djstest.destroyCacheAndDone(cache);
        });
    };

    var serialFilterTest = function (params) {
        djstest.assertsExpected(4);
        var options = { name: "cache" + new Date().valueOf(), source: params.feed, pageSize: params.pageSize, prefetchSize: params.prefetchSize };

        var cache = odatajs.cache.createDataCache(options);
        var cacheVerifier = new CacheVerifier(params.feed, params.pageSize, itemsInCollection);
        var session = this.observableHttpClient.newSession();

        var filterMethod = function (index, count, predicate, backwards) {
            if (backwards) {
                return cache.filterBack(index, count, predicate);
            }
            else {
                return cache.filterForward(index, count, predicate)
            }
        };

        filterMethod(params.firstIndex, params.firstCount, params.predicate, params.backwards).then(
            function (results) {
                validateFilterResultsAndRequests(params.feed, cache, params.firstIndex, params.firstCount, params.predicate,
                function () {
                    session.clear();
                    validateFilterResultsAndRequests(params.feed, cache, params.secondIndex, params.secondCount, params.predicate, function () { djstest.destroyCacheAndDone(cache) }, params.backwards, session, cacheVerifier);
                }, params.backwards, session, cacheVerifier);
            });
    };

    module("Functional", {
        setup: function () {
            this.observableHttpClient = new ObservableHttpClient();
            window.odatajs.oData.net.defaultHttpClient = this.observableHttpClient;
        },

        teardown: function () {
            window.odatajs.oData.net.defaultHttpClient = this.observableHttpClient.provider;
        }
    });

    $.each(filterPredicates, function (_, filterPredicate) {
        $.each(feeds, function (_, feedObject) {
            $.each(filterForwardAfterReadCounts, function (_, filterCount) {
                $.each(filterForwardAfterReadIndices, function (_, filterIndex) {
                    var parameters = { index: filterIndex, count: filterCount, predicate: filterPredicate, feed: feedObject.feed, take: readRangeTake,
                        skip: readRangeStart, pageSize: pageSize, prefetchSize: 0, backwards: false
                    };
                    djstest.addTest(filterAfterReadRangeTest, createSingleFilterTestName("after readRange, ", parameters), parameters);
                });
            });

            $.each(filterBackAfterReadCounts, function (_, filterCount) {
                $.each(filterBackAfterReadIndices, function (_, filterIndex) {
                    var parameters = { index: filterIndex, count: filterCount, predicate: filterPredicate, feed: feedObject.feed, take: readRangeTake,
                        skip: readRangeStart, pageSize: pageSize, prefetchSize: 0, backwards: true
                    };
                    djstest.addTest(filterAfterReadRangeTest, createSingleFilterTestName("After readRange, ", parameters), parameters);
                });
            });
        });

        $.each(singleFilterForwardIndices, function (_, filterIndex) {
            $.each(singleFilterForwardCounts, function (_, filterCount) {
                var parameters = { index: filterIndex, count: filterCount, predicate: filterPredicate, feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 0, backwards: false };
                djstest.addTest(singleFilterTest, createSingleFilterTestName("single ", parameters), parameters);
            });
        });

        $.each(singleFilterBackIndices, function (_, filterIndex) {
            $.each(singleFilterBackCounts, function (_, filterCount) {
                var parameters = { index: filterIndex, count: filterCount, predicate: filterPredicate, feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 0, backwards: true };
                djstest.addTest(singleFilterTest, createSingleFilterTestName("single ", parameters), parameters);
            });
        });

        $.each(multipleFilterForwards, function (_, firstFilter) {
            $.each(multipleFilterForwards, function (_, secondFilter) {
                var serialParameters = { firstIndex: firstFilter.index, firstCount: firstFilter.count, secondIndex: secondFilter.index, secondCount: secondFilter.count,
                    predicate: filterPredicate, feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 0, backwards: false
                };
                djstest.addTest(serialFilterTest, createMultipleFilterTestName("serial ", serialParameters), serialParameters);
            });
        });

        $.each(multipleFilterBacks, function (_, firstFilter) {
            $.each(multipleFilterBacks, function (_, secondFilter) {
                var serialParameters = { firstIndex: firstFilter.index, firstCount: firstFilter.count, secondIndex: secondFilter.index, secondCount: secondFilter.count,
                    predicate: filterPredicate, feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 0, backwards: true
                };
                djstest.addTest(serialFilterTest, createMultipleFilterTestName("serial ", serialParameters), serialParameters);
            });
        });

        $.each(multipleFilterForwards, function (_, firstFilter) {
            $.each(multipleFilterForwards, function (_, secondFilter) {
                var parallelParameters = { firstIndex: firstFilter.index, firstCount: firstFilter.count, secondIndex: secondFilter.index, secondCount: secondFilter.count,
                    predicate: filterPredicate, feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 6, backwards: false
                };
                djstest.addTest(parallelFilterTest, createMultipleFilterTestName("parallel ", parallelParameters), parallelParameters);
            });
        });

        $.each(multipleFilterBacks, function (_, firstFilter) {
            $.each(multipleFilterBacks, function (_, secondFilter) {
                var parallelParameters = { firstIndex: firstFilter.index, firstCount: firstFilter.count, secondIndex: secondFilter.index, secondCount: secondFilter.count,
                    predicate: filterPredicate, feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 6, backwards: true
                };
                djstest.addTest(parallelFilterTest, createMultipleFilterTestName("parallel ", parallelParameters), parallelParameters);
            });
        });

        $.each([true, false], function (_, isBackwards) {
            var zeroCountParameters = { index: 0, count: 0, predicate: filterPredicate, feed: feeds[0].feed, take: readRangeTake,
                skip: readRangeStart, pageSize: pageSize, prefetchSize: 0, backwards: isBackwards
            };
            djstest.addTest(singleFilterTest, createSingleFilterTestName("Count 0 ", zeroCountParameters), zeroCountParameters);
        });
    });

    $.each([true, false], function (_, backwards) {
        $.each(invalidIndices, function (_, invalidIndex) {
            var invalidIndexParameters = { index: invalidIndex, count: -1, predicate: filterPredicates[0], feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 0, backwards: backwards };

            djstest.addTest(
                function (params) {
                    djstest.assertsExpected(1);
                    var options = { name: "cache" + new Date().valueOf(), source: params.feed };
                    var cache = odatajs.cache.createDataCache(options);
                    try {
                        params.backwards ?
                            cache.filterForward(params.index, params.count, params.predicate).then(function (results) {
                                djstest.log(results);
                            }) :
                            cache.filterForward(params.index, params.count, params.predicate).then(function (results) {
                                djstest.log(results);
                            });
                        expectException(cache);
                    } catch (e) {
                        djstest.assertAreEqual(e.message, "'index' must be a valid number.", "Error message validation");
                        djstest.destroyCacheAndDone(cache);
                    }
                }, createSingleFilterTestName("invalid index ", invalidIndexParameters), invalidIndexParameters);
        });

        $.each(invalidCounts, function (_, invalidCount) {
            var invalidCountParameters = { index: 0, count: invalidCount, predicate: filterPredicates[0], feed: feeds[0].feed, pageSize: pageSize, prefetchSize: 0, backwards: backwards };

            djstest.addTest(
                function (params) {
                    djstest.assertsExpected(1);
                    var options = { name: "cache" + new Date().valueOf(), source: params.feed };
                    var cache = odatajs.cache.createDataCache(options);
                    try {
                        params.backwards ?
                            cache.filterBack(params.index, params.count, params.predicate).then(function (results) {
                                djstest.log(results);
                            }) :
                            cache.filterForward(params.index, params.count, params.predicate).then(function (results) {
                                djstest.log(results);
                            });
                        expectException(cache);
                    } catch (e) {
                        djstest.assertAreEqual(e.message, "'count' must be a valid number.", "Error message validation");
                        djstest.destroyCacheAndDone(cache);
                    }
                }, createSingleFilterTestName("invalid count ", invalidCountParameters), invalidCountParameters);
        });
    });
})(this);
