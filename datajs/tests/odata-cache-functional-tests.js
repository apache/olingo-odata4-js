/// <reference path="../src/datajs.js" />
/// <reference path="../src/odata-utils.js" />
/// <reference path="../src/cache.js" />
/// <reference path="common/djstest.js" />

(function (window, undefined) {
    OData.defaultHandler.accept = "application/json;q=0.9, application/atomsvc+xml;q=0.8, */*;q=0.1";
    var CustomDataSource = function (baseUri) {
        this.baseUri = baseUri;
    };

    CustomDataSource.prototype.read = function (index, count, success, error) {
        var that = this;
        var url = this.baseUri + "?$skip=" + index + "&$top=" + count;
        $(this).triggerHandler("request", { requestUri: url });
        $.ajax({
            url: url,
            dataType: "json",
            success: function (results) {
                $(that).triggerHandler("success", { data: results });
                success(results);
            },
            error: error
        });
    };

    CustomDataSource.prototype.count = function (success, error) {
        $.ajax({
            url: "./endpoints/CustomDataService.svc/Count",
            dataType: "json",
            success: success,
            error: error
        });
    },
    CustomDataSource.prototype.toString = function () {
        return this.baseUri;
    };

    var sources = [
        { source: "./endpoints/FoodStoreDataServiceV4.svc/Foods", countSupported: true },
        { source: new CustomDataSource("./endpoints/CustomDataService.svc/ReadRange"), countSupported: true }
    ];

    var itemsInCollection = 16;

    // Cache config variations for single readRange with fixed skip/take that spans the entire collection
    var pageSizes = [
        1,
        4,  // factor of total, <= server page size
        5,  // non-factor of total, <= server page size
        6,  // non-factor of total, > server page size
        8,  // factor of total, > server page size
        itemsInCollection,
        itemsInCollection + 1
    ];

    var cacheSizes = [
        -5,           // All you can store 
         0,           // Store nothing
         1024,        // 1 KB
         2.5 * 1024,  // 2.5 KB
         100 * 1024,  // 10 KB
         512 * 1024,  // 512 KB
         100 * 1024 * 1024, // 100 MB
         undefined    // Default to 1 MB
    ];

    // Skip/take variations for single readRange with fixed cache config
    var fixedPageSize = 6;

    var skipValues = [
        0,
        fixedPageSize - 1,
        fixedPageSize,
        fixedPageSize + 1,
        fixedPageSize * 2,
        itemsInCollection + 1,
        itemsInCollection + fixedPageSize + 1
    ];

    var takeValues = [
        0,
        fixedPageSize - 1,
        fixedPageSize,
        fixedPageSize + 1,
        fixedPageSize * 2,
        itemsInCollection + 1
    ];

    // Skip/take variations for multiple readRanges with fixed cache config
    var multipleReads = [
        { skip: 1, take: 2 },   // page 1
        {skip: 2, take: 7 },   // page 1, 2
        {skip: 3, take: 10 },  // page 1, 2, 3
        {skip: 6, take: 2}    // page 2
    ];

    var invalidSkipValues = [-5, NaN, undefined, Infinity, "not a valid value"];
    var invalidTakeValues = [-5, NaN, undefined, Infinity, "not a valid value"];
    var invalidPageSizes = [-5, NaN, Infinity, 0, "not a valid value"];

    // Prefetchsize variations for a single readRange
    var prefetchSizes = [
        -5,
        1,
        5,
        itemsInCollection,
        itemsInCollection + 1
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

    var validateExpectedRange = function (cache, data, source, skipValue, takeValue, finished) {
        /// <summary>Validates the data returned by readRange</summary>
        /// <param name="cache" type="Object">The cache object</param>
        /// <param name="data" type="Object">The data returned by the cache</param>
        /// <param name="source" type="Object">The base URI of the feed, or the custom data source</param>
        /// <param name="skipValue type="Integer">The skip value</param>
        /// <param name="takeValue" type="Integer">The take value</param>
        /// <param name="finished" type="Function">Callback function called after data is verified</param>
        var assertData = function (expectedData) {
            djstest.assertAreEqualDeep(data, expectedData, "Verify response data");
            finished();
        };

        if (typeof source === "string") {
            var expectedRangeUrl = source + "?$skip=" + skipValue + "&$top=" + takeValue;
            window.ODataReadOracle.readJsonAcrossServerPages(expectedRangeUrl, assertData);
        } else {
            source.read(skipValue, takeValue, assertData);
        }
    };

    var onidleValidation = function () {
        djstest.assert(true, "expected call to onidle");
        djstest.done();
    };

    var createSingleReadTestName = function (params) {
        return "Testing readRange of " + params.source + " [skip " + params.skip + " take " + params.take + "] with pageSize " +
            params.pageSize + ", prefetch " + params.prefetchSize + " and cacheSize " + params.cacheSize;
    };

    var createMultipleReadTestName = function (params) {
        return "Testing readRange of " + params.source + " [skip " + params.firstSkip + " take " + params.firstTake + ", " +
            (params.destroyCacheBetweenReads ? "cache.destroy(), " : "") +
            "skip " + params.secondSkip + " take " + params.secondTake + "] with pageSize " +
            params.pageSize + ", prefetch " + params.prefetchSize + " and cacheSize " + params.cacheSize;
    };

    var dataCacheSingleReadRangeTest = function (params) {
        djstest.assertsExpected(2);
        var options = { name: "cache" + new Date().valueOf(), source: params.source, pageSize: params.pageSize, prefetchSize: params.prefetchSize, cacheSize: params.cacheSize };

        if (params.mechanism) {
            options.mechanism = params.mechanism;
        }

        var cache = this.createAndAddCache(options);
        var session = typeof params.source === "string" ? this.observableHttpClient.newSession() : new Session(params.source);
        var cacheOracle = new CacheOracle(params.source, params.pageSize, itemsInCollection, params.cacheSize);
        cache.readRange(params.skip, params.take).then(function (data) {
            cacheOracle.verifyRequests(session.requests, session.responses, params.skip, params.take, "readRange requests");
            validateExpectedRange(cache, data, params.source, params.skip, params.take, function () {
                djstest.destroyCacheAndDone(cache);
            });
        }, makeUnexpectedErrorHandler(cache));
    };

    var dataCacheParallelReadRangeTest = function (params) {
        djstest.assertsExpected(2);
        var options = { name: "cache" + new Date().valueOf(), source: params.source, pageSize: params.pageSize, prefetchSize: params.prefetchSize, cacheSize: params.cacheSize };

        var cache = this.createAndAddCache(options);

        var firstReadRange = function (finished) {
            cache.readRange(params.firstSkip, params.firstTake).then(function (data) {
                validateExpectedRange(cache, data, params.source, params.firstSkip, params.firstTake, finished);
            }, makeUnexpectedErrorHandler(cache));
        };

        var secondReadRange = function (finished) {
            cache.readRange(params.secondSkip, params.secondTake).then(function (data) {
                validateExpectedRange(cache, data, params.source, params.secondSkip, params.secondTake, finished);
            }, makeUnexpectedErrorHandler(cache));
        };

        djstest.asyncDo([firstReadRange, secondReadRange], function () {
            djstest.destroyCacheAndDone(cache);
        });
    };

    var dataCacheSerialReadRangeTest = function (params) {
        djstest.assertsExpected(4);
        var options = { name: "cache" + new Date().valueOf(), source: params.source, pageSize: params.pageSize, prefetchSize: params.prefetchSize, cacheSize: params.cacheSize };

        var cacheOracle = new CacheOracle(params.source, params.pageSize, itemsInCollection, params.cacheSize);
        var secondRead = function () {
            session.clear();
            cache.readRange(params.secondSkip, params.secondTake).then(function (data) {
                cacheOracle.verifyRequests(session.requests, session.responses, params.secondSkip, params.secondTake, "Second readRange requests");
                validateExpectedRange(cache, data, params.source, params.secondSkip, params.secondTake, djstest.done);
            }, makeUnexpectedErrorHandler(cache));
        };

        var cache = this.createAndAddCache(options);
        var session = typeof params.source === "string" ? this.observableHttpClient.newSession() : new Session(params.source);
        cache.readRange(params.firstSkip, params.firstTake).then(function (data) {
            cacheOracle.verifyRequests(session.requests, session.responses, params.firstSkip, params.firstTake, "First readRange requests");
            validateExpectedRange(cache, data, params.source, params.firstSkip, params.firstTake, function () {
                if (params.destroyCacheBetweenReads === true) {
                    cache.clear().then(function () {
                        cacheOracle.clear();
                        secondRead();
                    }, function (err) {
                        djstest.fail("Error destroying the cache: " + djstest.toString(err));
                    });
                } else {
                    secondRead();
                }
            });
        }, makeUnexpectedErrorHandler(cache));
    };

    var dataCachePrefetchTest = function (params) {
        djstest.assertsExpected(2);
        var options = {
            name: "cache" + new Date().valueOf(),
            source: params.source,
            pageSize: params.pageSize,
            prefetchSize: params.prefetchSize,
            cacheSize: params.cacheSize,
            user: params.user,
            password: params.password
        };

        var cache = this.createAndAddCache(options);
        var session = typeof params.source === "string" ? this.observableHttpClient.newSession() : new Session(params.source);
        var cacheOracle = new CacheOracle(params.source, params.pageSize, itemsInCollection, params.cacheSize);

        cache.readRange(params.skip, params.take).then(function (data) {
            cacheOracle.verifyRequests(session.requests, session.responses, params.skip, params.take, "readRange requests");
            session.clear();
        }, makeUnexpectedErrorHandler(cache));

        cache.onidle = function () {
            var prefetchSize = params.prefetchSize < 0 ? itemsInCollection : params.prefetchSize;
            cacheOracle.verifyRequests(session.requests, session.responses, params.skip + params.take, prefetchSize, "prefetch requests", false, true);
            cache.onidle = false;
            djstest.destroyCacheAndDone(cache);
        };
    };

    var cleanDomStorage = function (done) {
        /// <summary>Cleans all the data saved in the browser's DOM Storage. Needs to be called asynchronously in the 
        /// setup and teardown methods to be consistent with indexedDb's cleanup method.</summary>
        /// <param name="done" type="Function">Function to be called after DOM storage is cleared.</param>
        if (window.localStorage) {
            window.localStorage.clear();
        }
        done();
    };

    var cleanIndexedDb = function (done) {
        /// <summary>Cleans all the data saved in the browser's IndexedDb Storage.</summary>
        /// <param name="done" type="Function">Function to be called after indexedDb is cleared.</param>
        var caches = this.caches;

        djstest.cleanStoreOnIndexedDb(caches, done);
    };

    var cleanupAllStorage = function (done) {
        /// <summary>Cleans up all available storage mechanisms in the browser.</summary>
        /// <param name="done" type="Function">Function to be called by each cleanup function after storage is cleared.</param>
        var that = this;
        var storeCleanup = [];

        $.each(CacheOracle.mechanisms, function (_, mechanism) {
            if (CacheOracle.isMechanismAvailable(mechanism)) {
                storeCleanup.push(function (done) {
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

    var storageMechanisms = {
        indexeddb: { cleanup: cleanIndexedDb },
        dom: { cleanup: cleanDomStorage },
        memory: { cleanup: function (done) { done(); } },
        best: { cleanup: function (done) { done(); } }
    };

    module("Functional", {
        setup: function () {
            this.createAndAddCache = function (options) {
                /// <summary>Returns a cache created from the options object and </summary>
                /// <param name="options" type="Object">Object to create a cache from.</param> 
                var cache = datajs.createDataCache(options);
                this.caches.push({ name: options.name, cache: cache });
                return cache;
            };

            this.observableHttpClient = new ObservableHttpClient();
            OData.defaultHttpClient = this.observableHttpClient;
            this.caches = [];
            var that = this;

            djstest.wait(function (done) {
                cleanupAllStorage.call(that, done);
            });
        },

        teardown: function () {
            OData.defaultHttpClient = this.observableHttpClient.provider;
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
                        })
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

    $.each(CacheOracle.mechanisms, function (_, mechanism) {
        var parameters = { mechanism: mechanism, source: sources[1].source, take: 5, skip: 0, pageSize: 5, prefetchSize: 5 };
        if (CacheOracle.isMechanismAvailable(mechanism)) {
            djstest.addTest(dataCacheSingleReadRangeTest, "Specified mechanism: " + parameters.mechanism + createSingleReadTestName(parameters), parameters);
        }
        else {
            djstest.addTest(function (params) {
                djstest.assertsExpected(1);
                var options = { name: "cache" + new Date().valueOf(), mechanism: params.mechanism, source: params.source };
                try {
                    var cache = this.createAndAddCache(options);
                    expectException(cache);
                }
                catch (e) {
                    if (mechanism === "indexeddb") {
                        djstest.assertAreEqual(e.message, "IndexedDB is not supported on this browser", "Validating expected error");
                    } else if (mechanism === "dom") {
                        djstest.assertAreEqual(e.message, "Web Storage not supported by the browser", "Validating expected error");
                    } else {
                        djstest.fail("Creating cache with mechanism " + mechanism + " should not fail: " + djstest.toString(e));
                    }

                    djstest.done();
                }
            }, "Invalid mechanism for browser: " + parameters.mechanism + createSingleReadTestName(parameters), parameters);
        }
    });

    $.each(sources, function (_, sourceObject) {
        $.each(pageSizes, function (_, pageSizeValue) {
            $.each(cacheSizes, function (_, cacheSizeValue) {
                var parameters = { source: sourceObject.source, skip: 0, take: itemsInCollection, pageSize: pageSizeValue, prefetchSize: 0, cacheSize: cacheSizeValue };
                djstest.addTest(dataCacheSingleReadRangeTest, createSingleReadTestName(parameters), parameters);
            });
        });

        $.each(skipValues, function (_, skipValue) {
            $.each(takeValues, function (_, takeValue) {
                var parameters = { source: sourceObject.source, take: takeValue, skip: skipValue, pageSize: 4, prefetchSize: 0, cacheSize: 0 };
                djstest.addTest(dataCacheSingleReadRangeTest, createSingleReadTestName(parameters), parameters);
            });
        });

        $.each(multipleReads, function (_, firstRange) {
            $.each(multipleReads, function (_, secondRange) {
                var parallelReadParams = { source: sourceObject.source, firstTake: firstRange.take, firstSkip: firstRange.skip, secondTake: secondRange.take, secondSkip: secondRange.skip, pageSize: 5, prefetchSize: 0, cacheSize: 0 };
                djstest.addTest(dataCacheParallelReadRangeTest, "Parallel: " + createMultipleReadTestName(parallelReadParams), parallelReadParams);

                $.each([false, true], function (_, destroyCacheBetweenReads) {
                    var serialReadParams = $.extend({}, parallelReadParams, { destroyCacheBetweenReads: destroyCacheBetweenReads });
                    djstest.addTest(dataCacheSerialReadRangeTest, "Serial: " + createMultipleReadTestName(serialReadParams), serialReadParams);
                });
            });
        });

        var getInvalidValueErrorMessage = function (invalidValue, parameterName) {
            /// <summary>Returns the expected error message for the specified invalid value.</summary>
            /// <param name="invalidValue type="Object">invalid value (anything other than zero or positive integer) to determine the error message from.</param>
            /// <param name="parameterName" type="String">The name of the parameter being verified.</param>
            /// <returns type="String">Error message expected.</returns>
            return (invalidValue === undefined || typeof invalidValue !== "number") ?
                        "'" + parameterName + "' must be a number." :
                        "'" + parameterName + "' must be greater than or equal to zero.";
        };

        $.each(invalidSkipValues, function (_, invalidSkipValue) {
            var parameters = { source: sourceObject.source, skip: invalidSkipValue, take: 1 };
            djstest.addTest(function (params) {
                djstest.assertsExpected(1);
                var options = { name: "cache" + new Date().valueOf(), source: params.source };
                var cache = this.createAndAddCache(options);
                try {
                    cache.readRange(params.skip, params.take);
                    expectException(cache);
                } catch (e) {
                    djstest.assertAreEqual(e.message, getInvalidValueErrorMessage(invalidSkipValue, "index"), "Error message validation");
                    djstest.destroyCacheAndDone(cache);
                }
            }, "Invalid skip: " + createSingleReadTestName(parameters), parameters);
        });

        $.each(invalidTakeValues, function (_, invalidTakeValue) {
            var parameters = { source: sourceObject.source, skip: 0, take: invalidTakeValue };
            djstest.addTest(function (params) {
                djstest.assertsExpected(1);
                var options = { name: "cache" + new Date().valueOf(), source: params.source };
                var cache = this.createAndAddCache(options);
                try {
                    cache.readRange(params.skip, params.take);
                    expectException(cache);
                } catch (e) {
                    djstest.assertAreEqual(e.message, getInvalidValueErrorMessage(invalidTakeValue, "count"), "Error message validation");
                    djstest.destroyCacheAndDone(cache);
                }
            }, "Invalid take: " + createSingleReadTestName(parameters), parameters);
        });

        $.each(invalidPageSizes, function (_, invalidPageSize) {
            var parameters = { source: sourceObject.source, skip: 0, take: 5, pageSize: invalidPageSize };
            djstest.addTest(function (params) {
                var options = { name: "cache", source: params.source, pageSize: params.pageSize };
                try {
                    var cache = this.createAndAddCache(options);
                    expectException(cache);
                } catch (e) {
                    var expectedError = typeof invalidPageSize === "number" ? "'pageSize' must be greater than zero." : getInvalidValueErrorMessage(invalidPageSize, "pageSize");
                    djstest.assertAreEqual(e.message, expectedError, "Error message validation");
                }
                djstest.done();
            }, "Invalid pageSize: " + createSingleReadTestName(parameters), parameters);
        });

        $.each(pageSizes, function (_, pageSize) {
            $.each(cacheSizes, function (_, cacheSize) {
                var parameters = { source: sourceObject.source, skip: 0, take: pageSize, pageSize: pageSize, prefetchSize: -1, cacheSize: cacheSize };
                djstest.addTest(dataCachePrefetchTest, "Prefetch: " + createSingleReadTestName(parameters), parameters);
            });
        });

        $.each(skipValues, function (_, skipValue) {
            var parameters = { source: sourceObject.source, skip: skipValue, take: fixedPageSize, pageSize: fixedPageSize, prefetchSize: -1, cacheSize: -1 };
            djstest.addTest(dataCachePrefetchTest, "Prefetch: " + createSingleReadTestName(parameters), parameters);
        });

        $.each(takeValues, function (_, takeValue) {
            var parameters = { source: sourceObject.source, skip: 0, take: takeValue, pageSize: fixedPageSize, prefetchSize: -1, cacheSize: -1 };
            djstest.addTest(dataCachePrefetchTest, "Prefetch: " + createSingleReadTestName(parameters), parameters);
        });

        $.each(prefetchSizes, function (_, prefetchSize) {
            var parameters = { source: sourceObject.source, skip: 0, take: fixedPageSize, pageSize: fixedPageSize, prefetchSize: prefetchSize, cacheSize: -1 };
            djstest.addTest(dataCachePrefetchTest, "Prefetch: " + createSingleReadTestName(parameters), parameters);
        });

        var fixedPrefetchSize = 5;

        djstest.addTest(function (params) {
            djstest.assertsExpected(1);
            var cache = this.createAndAddCache({
                name: "cache" + new Date().valueOf(),
                source: params.source,
                prefetchSize: fixedPrefetchSize,
                idle: onidleValidation,
                pageSize: 2,
                mechanism: "memory"
            });
            cache.readRange(0, 5);

        }, "onidle in constructor, prefetch size = " + fixedPrefetchSize + " on " + sourceObject.source, { source: sourceObject.source });

        djstest.addTest(function (params) {
            djstest.assertsExpected(1);
            var cache = this.createAndAddCache({
                name: "cache" + new Date().valueOf(),
                source: params.source,
                prefetchSize: fixedPrefetchSize,
                pageSize: 2,
                mechanism: "memory"
            });
            cache.onidle = onidleValidation;
            cache.readRange(0, 5);
        }, "onidle, prefetch size = " + fixedPrefetchSize + " on " + sourceObject.source, { source: sourceObject.source });

        djstest.addTest(function (params) {
            djstest.assertsExpected(1);
            var cache = this.createAndAddCache({
                name: "cache" + new Date().valueOf(),
                source: params.source,
                prefetchSize: fixedPrefetchSize,
                idle: function () { djstest.assert(false, "unexpected onidle call") },
                pageSize: 2,
                mechanism: "memory"
            });
            cache.onidle = onidleValidation;
            cache.readRange(0, 5);
        }, "onidle override, prefetch size = " + fixedPrefetchSize + " on " + sourceObject.source, { source: sourceObject.source });

        djstest.addTest(function (params) {
            var cache = this.createAndAddCache({ name: "cache" + new Date().valueOf(), source: params.source, pageSize: 1, prefetchSize: -1 });
            var observableSource = typeof params.source === "string" ? this.observableHttpClient : params.source;
            cache.readRange(0, 1).then(function (data) {
                // Let one prefetch request go out, to make sure the prefetcher is started, and then destroy the cache
                $(observableSource).one("success", function () {
                    var session = new Session(observableSource);
                    cache.clear().then(function () {
                        setTimeout(function () {
                            djstest.assertAreEqualDeep(session.requests, [], "Verify no prefetch requests are sent out after cache.clear() callback");
                            djstest.done();
                        }, 1000);
                    }, function (err) {
                        djstest.fail("Error destroying the cache: " + djstest.toString(err));
                    });
                });
            });
        }, "Testing cache.clear() halts the prefetcher" + sourceObject.source, { source: sourceObject.source });

        djstest.addTest(function (params) {
            var cache = this.createAndAddCache({ name: "cache" + new Date().valueOf(), source: params.source });
            if (params.countSupported) {
                cache.count().then(function (count) {
                    djstest.assertAreEqual(count, itemsInCollection, "All items accounted for");
                    djstest.destroyCacheAndDone(cache);
                }, makeUnexpectedErrorHandler(cache));
            }
            else {
                cache.count().then(function (count) {
                    djstest.assert(false, "Success should not be called, count not supported");
                    djstest.destroyCacheAndDone(cache);
                }, function (err) {
                    djstest.assertAreEqual(err.message, "HTTP request failed", "Validating expected error");
                    djstest.destroyCacheAndDone(cache);
                });
            }
        }, "Testing cache.count() on " + sourceObject.source, { source: sourceObject.source, countSupported: sourceObject.countSupported });

        djstest.addTest(function (params) {
            var cache = this.createAndAddCache({ name: "cache" + new Date().valueOf(), source: params.source, pageSize: 1, prefetchSize: 0 });
            var session = typeof params.source === "string" ? this.observableHttpClient.newSession() : new Session(params.source);
            cache.readRange(0, 1).cancel();
            setTimeout(function () {
                djstest.assertAreEqualDeep(session.requests, [], "Verify no requests are sent out after readRange is cancelled");
                djstest.done();
            }, 1000);
        }, "Testing cancel()" + sourceObject.source, { source: sourceObject.source });

        djstest.addTest(function (params) {
            djstest.assertsExpected(1);
            var cache = this.createAndAddCache({ name: "cache" + new Date().valueOf(), source: params.source, pageSize: 1, prefetchSize: 0 });
            cache.clear().then(function () {
                cache.clear().then(function () {
                    djstest.pass("Second clear succeeded");
                    djstest.done();
                }, makeUnexpectedErrorHandler(cache));
            }, makeUnexpectedErrorHandler(cache));
        }, "Testing .clear().then(cache.clear())" + sourceObject.source, { source: sourceObject.source });
    });

    var params = {
        source: "./endpoints/BasicAuthDataService.svc/Customers",
        skip: 0,
        take: 5,
        pageSize: 5,
        prefetchSize: -1,
        cacheSize: -1,
        user: "djsUser",
        password: "djsPassword"
    };
    djstest.addTest(dataCachePrefetchTest, createSingleReadTestName(params), params);
})(this);
