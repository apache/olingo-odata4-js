/// <reference path="../src/datajs.js" />
/// <reference path="../src/odata-utils.js" />
/// <reference path="../src/cache.js" />
/// <reference path="common/CacheOracle.js" />
/// <reference path="common/djstest.js" />

(function (window, undefined) {

    var slowHttpClient = {
        latency: 750,
        provider: OData.defaultHttpClient,
        request: function (request, success, error) {
            setTimeout(function () {
                slowHttpClient.provider.request(request, success, error);
            }, slowHttpClient.latency);
        }
    };

    var feeds = [
        { uri: "./endpoints/FoodStoreDataServiceV4.svc/Foods" }
    ];

    module("Functional", {
        setup: function () {
            OData.defaultHttpClient = slowHttpClient;
        },
        teardown: function () {
            OData.defaultHttpClient = slowHttpClient.provider;
        }
    });

    var cacheReadRangeWallClockTest = function (totalReads, interval, mechanism, source, pageSize, prefetchSize, generateRange, threshold) {
        /// <summary>Cache readRange wall-clock test</summary>
        /// <remarks>
        /// The average time computed by the wall-clock test does *not* include the initial readRange
        /// </remarks>
        /// <param name="totalReads">Number of reads to collect data from</param>
        /// <param name="interval">Interval (milliseconds) between reads</param>
        /// <param name="mechanism">The cache store mechanism</param>
        /// <param name="source">The feed source</param>
        /// <param name="pageSize">The page size</param>
        /// <param name="prefetchSize">The prefetch size</param>
        /// <param name="generateRange">The range generator function: given the read index, returns the readRange index and count</param>
        /// <param name="threshold">The average read time threshold for test to pass; if not specified, defaults to the slowHttpClient latency</param>
        /// <returns>The test function</param>
        return function () {
            var cache = odatajs.createDataCache({ name: "cache" + new Date().valueOf(), source: source, pageSize: pageSize, prefetchSize: prefetchSize });
            var totalTime = 0;
            var readCount = 0;

            var callReadRange = function () {
                var range = generateRange(readCount);
                var startTime = new Date().valueOf();
                cache.readRange(range.index, range.count).then(function (data) {
                    var duration = (new Date().valueOf()) - startTime;
                    djstest.log("readRange " + readCount + " [" + range.index + ", " + range.count + "]: " + duration + "ms");

                    // The first readRange is not counted
                    totalTime += (readCount > 0) ? duration : 0;
                    readCount += 1;

                    if (readCount < totalReads) {
                        setTimeout(callReadRange, interval);
                    } else {
                        // The first readRange is not counted
                        var averageTime = totalTime / (totalReads - 1);
                        var actualThreshold = threshold === undefined ? slowHttpClient.latency : threshold;
                        djstest.assert(averageTime < actualThreshold, "Average: " + averageTime + "ms, Threshold: " + actualThreshold + "ms");
                        djstest.destroyCacheAndDone(cache);
                    }
                }, function (err) {
                    djstest.fail("Unexpected call to error handler with error: " + djstest.toString(err));
                    djstest.destroyCacheAndDone(cache);
                });
            };

            callReadRange();
        };
    };

    $.each(CacheOracle.mechanisms, function (_, mechanism) {
        if (mechanism !== "best" && CacheOracle.isMechanismAvailable(mechanism)) {
            $.each(feeds, function (_, feed) {
                djstest.addTest(cacheReadRangeWallClockTest(2, 1000, mechanism, feed.uri, 5, 0, function () {
                    return { index: 0, count: 5 };
                }), "Cache small single-page wall-clock test with " + mechanism + " on " + feed.uri);

                djstest.addTest(cacheReadRangeWallClockTest(5, 1000, mechanism, feed.uri, 3, -1, function (readCount) {
                    return { index: readCount * 3, count: 3 };
                }), "Cache page-by-page wall-clock test with " + mechanism + " on " + feed.uri);

                djstest.addTest(cacheReadRangeWallClockTest(5, 1000, mechanism, feed.uri, 3, -1, function (readCount) {
                    return { index: readCount, count: 3 };
                }), "Cache line-by-line wall-clock test with " + mechanism + " on " + feed.uri);
            });

            var largeFeedUri = "./endpoints/LargeCollectionService.svc/Customers";
            djstest.addTest(cacheReadRangeWallClockTest(2, 1000, mechanism, largeFeedUri, 100, 0, function () {
                return { index: 0, count: 500 };
            }), "Cache large single-page wall-clock test with " + mechanism + " on " + largeFeedUri, undefined, 60000);
        }
    });
})(this);