/// <reference path="common/djstest.js" />
/// <reference path="../src/odata.js" />
/// <reference path="common/Instrument.js" />
/// <reference path="common/ODataReadOracle.js" />

(function (window, undefined) {
    var unexpectedErrorHandler = function (err) {
        djstest.assert(false, "Unexpected call to error handler with error: " + djstest.toString(err));
        djstest.done();
    };

    var timedHttpClient = {
        duration: 0,
        provider: OData.defaultHttpClient,
        request: function (request, success, error) {
            var startTime = new Date();
            return timedHttpClient.provider.request(request, function () {
                timedHttpClient.duration = new Date() - startTime;
                success.apply(this, arguments);
            }, error);
        }
    };

    var largeCollectionService = "./endpoints/LargeCollectionService.svc/";

    // null "service" indicates the feed is read-only
    var feeds = [
        // will add atom format test after enabling atom scenario
        { service: largeCollectionService, uri: largeCollectionService + "Customers", mimeType: "application/json;odata.metadata=minimal" },
        { service: largeCollectionService, uri: largeCollectionService + "Customers", mimeType: "application/json;odata.metadata=full" },
        { service: largeCollectionService, uri: largeCollectionService + "Customers", mimeType: "application/json;odata.metadata=none" },
        { service: largeCollectionService, uri: largeCollectionService + "Suppliers", mimeType: "application/json" },
        { service: null, uri: "http://odata.netflix.com/Catalog/Titles", mimeType: "application/json" }
    ];

    module("Performance", {
        setup: function () {
            djstest.wait(function (done) {
                $.post(largeCollectionService + "ResetData", done);
            });
        },
        teardown: function () {
            OData.defaultHttpClient = timedHttpClient.provider;
        }
    });

    OData.defaultHttpClient.enableJsonpCallback = true;
    $.each(feeds, function (_, feed) {
        $.each([5, 500], function (_, items) {
            var params = $.extend({}, feed, { items: items, readUri: feed.uri + "?$top=" + items });
            djstest.addTest(function readPerfTest(params) {
                var measureRead = function (metadata) {
                    var startTime = new Date();
                    OData.read({ requestUri: params.readUri, headers: { Accept: params.mimeType }, enableJsonpCallback: true }, function () {
                        var duration = new Date() - startTime - timedHttpClient.duration;
                        djstest.pass("Duration: " + duration + " ms (Network: " + timedHttpClient.duration + " ms)");
                        djstest.done();
                    }, unexpectedErrorHandler, undefined, undefined, metadata);
                };

                OData.defaultHttpClient = timedHttpClient;
                djstest.assertsExpected(1);
                if (params.metadata) {
                    OData.read(params.service + "$metadata", measureRead, unexpectedErrorHandler, OData.metadataHandler);
                } else {
                    measureRead();
                }
            }, "Time to read (once) " + params.readUri + " with " + params.mimeType, params);

            djstest.addTest(function readParallelMemoryTest(params) {
                var total = 10;
                var count = 0;
                var measureRead = function (metadata) {
                    Instrument.getBrowserMemorySize(function (memoryBefore) {
                        for (var i = 0; i < total; i++) {
                            OData.read({ requestUri: params.readUri, headers: { Accept: params.mimeType }, enableJsonpCallback: true }, function (_, response) {
                                count++;
                                if (count >= total) {
                                    Instrument.getBrowserMemorySize(function (memoryAfter) {
                                        var memory = memoryAfter - memoryBefore;
                                        djstest.pass("Memory: " + memory + " bytes (Network: " + response.headers["Content-Length"] + " bytes)");
                                        djstest.done();
                                    });
                                }
                            }, unexpectedErrorHandler, undefined, undefined, metadata);
                        }
                    });
                };

                djstest.assertsExpected(1);
                if (params.metadata) {
                    OData.read(params.service + "$metadata", measureRead, unexpectedErrorHandler, OData.metadataHandler);
                } else {
                    measureRead();
                }
            }, "Memory to read (x10 parallel) " + params.readUri + " with " + params.mimeType, params, 300000);

            djstest.addTest(function readSerialMemoryTest(params) {
                var total = 10;
                var count = 0;
                var measureRead = function (metadata) {
                    Instrument.getBrowserMemorySize(function (memoryBefore) {
                        var makeRequest = function () {
                            OData.read({ requestUri: params.readUri, headers: { Accept: params.mimeType }, enableJsonpCallback: true }, function (_, response) {
                                count++;
                                if (count < total) {
                                    setTimeout(makeRequest, 0);
                                } else {
                                    Instrument.getBrowserMemorySize(function (memoryAfter) {
                                        var memory = memoryAfter - memoryBefore;
                                        djstest.pass("Memory: " + memory + " bytes (Network: " + response.headers["Content-Length"] + " bytes)");
                                        djstest.done();
                                    });
                                }
                            }, unexpectedErrorHandler, undefined, undefined, metadata);
                        };

                        makeRequest();
                    });
                };

                djstest.assertsExpected(1);
                if (params.metadata) {
                    OData.read(params.service + "$metadata", measureRead, unexpectedErrorHandler, OData.metadataHandler);
                } else {
                    measureRead();
                }
            }, "Memory to read (x10 serial) " + params.readUri + " with " + params.mimeType, params, 300000);
        });

        if (feed.service) {
            var params = $.extend({}, feed, {
                request: {
                    requestUri: feed.uri,
                    method: "POST",
                    headers: { "Content-Type": feed.mimeType, Accept: feed.mimeType },
                    data: {
                        ID: -1,
                        Name: "New Entity"
                    }
                }
            });

            djstest.addTest(function postPerfTest(params) {
                var measurePost = function (metadata) {
                    var startTime = new Date();
                    OData.request(params.request, function () {
                        var duration = new Date() - startTime - timedHttpClient.duration;
                        djstest.pass("Duration: " + duration + " ms (Network: " + timedHttpClient.duration + " ms)");
                        djstest.done();
                    }, unexpectedErrorHandler, undefined, undefined, metadata);
                };

                OData.defaultHttpClient = timedHttpClient;
                djstest.assertsExpected(1);

                if (params.metadata) {
                    OData.read(params.service + "$metadata", measurePost, unexpectedErrorHandler, OData.metadataHandler);
                } else {
                    measurePost();
                }
            }, "Time to POST " + params.uri + " with " + params.mimeType, params);

            djstest.addTest(function postParallelMemoryTest(params) {
                var total = 10;
                var count = 0;
                var measurePost = function (metadata) {
                    Instrument.getBrowserMemorySize(function (memoryBefore) {
                        for (var i = 0; i < total; i++) {
                            OData.request(params.request, function (_, response) {
                                count++;
                                if (count >= total) {
                                    Instrument.getBrowserMemorySize(function (memoryAfter) {
                                        var memory = memoryAfter - memoryBefore;
                                        djstest.pass("Memory: " + memory + " bytes (Network: " + response.headers["Content-Length"] + " bytes)");
                                        djstest.done();
                                    });
                                }
                            }, unexpectedErrorHandler, undefined, undefined, metadata);
                        }
                    });
                };

                OData.defaultHttpClient = timedHttpClient;
                djstest.assertsExpected(1);

                if (params.metadata) {
                    OData.read(params.service + "$metadata", measurePost, unexpectedErrorHandler, OData.metadataHandler);
                } else {
                    measurePost();
                }
            }, "Memory to POST (x10 parallel) " + params.uri + " with " + params.mimeType, params);

            djstest.addTest(function postSerialMemoryTest(params) {
                var total = 10;
                var count = 0;
                var measurePost = function (metadata) {
                    Instrument.getBrowserMemorySize(function (memoryBefore) {
                        var makeRequest = function () {
                            OData.request(params.request, function (_, response) {
                                count++;
                                if (count < total) {
                                    setTimeout(makeRequest, 0);
                                } else {
                                    Instrument.getBrowserMemorySize(function (memoryAfter) {
                                        var memory = memoryAfter - memoryBefore;
                                        djstest.pass("Memory: " + memory + " bytes (Network: " + response.headers["Content-Length"] + " bytes)");
                                        djstest.done();
                                    });
                                }
                            }, unexpectedErrorHandler, undefined, undefined, metadata);
                        };

                        makeRequest();
                    });
                };

                OData.defaultHttpClient = timedHttpClient;
                djstest.assertsExpected(1);

                if (params.metadata) {
                    OData.read(params.service + "$metadata", measurePost, unexpectedErrorHandler, OData.metadataHandler);
                } else {
                    measurePost();
                }
            }, "Memory to POST (x10 serial) " + params.uri + " with " + params.mimeType, params);
        }
    });
})(this);