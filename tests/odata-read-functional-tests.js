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
    var unexpectedErrorHandler = function (err) {
        djstest.assert(false, "Unexpected call to error handler with error: " + djstest.toString(err));
        djstest.done();
    };

    var validServiceDocumentAcceptHeaders = [
            "*/*",
            "application/json",
            undefined
          ];

    var validMetadataAcceptHeaders = [
            "*/*",
            "application/xml",
            undefined
          ];

    var invalidServiceDocumentAcceptHeaders = [
        "application/atom+xml"
    ];

    var invalidMetadataAcceptHeaders = [
            "application/json"
        ];

    var handlerAcceptStrings = [
        "*/*",
        "application/json",
         undefined
      ];

    var httpStatusCode = {
        notFound: 404,
        badRequest: 400,
        unsupportedMediaType: 415
    };

    var service = "./endpoints/FoodStoreDataServiceV4.svc/";
    var epmService = "./endpoints/EpmDataService.svc/";
    var feed = service + "Foods";
    var categoriesFeed = service + "Categories";

    var expectedErrorMessage = "HTTP request failed";

    module("Functional", {
        setup: function () {
            djstest.wait(function (done) {
                $.post(service + "ResetData", done);
            });
            window.odatajs.oData.json.jsonHandler.recognizeDates = false;
        }
    });

    for (var i = 0; i < handlerAcceptStrings.length; i++) {

        djstest.addTest(function readFullFeedTest(handlerAccept) {
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: feed, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readFeed(feed,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                );
        }, "Testing valid read of full feed collection with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readMaxAndNullValueEntryTest(handlerAccept) {
            var endPoint = feed + "(0)";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endPoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                );
        }, "Testing valid read of entry with max numbers, complex types, and null and empty strings " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readMinAndZeroValueEntryTest(handlerAccept) {
            var endPoint = feed + "(1)";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: "./endpoints/FoodStoreDataServiceV4.svc/Foods(1)", headers: { Accept: handlerAccept} },
                function (data, response) {
                    window.ODataVerifyReader.readEntry(endPoint,
                        function (expectedData) {
                            djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                            djstest.done();
                        }, handlerAccept
                    );
                },
                unexpectedErrorHandler);
        }, "Testing valid read of minimum and zero values " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readNullNestedComplexTypeEntryTest(handlerAccept) {
            var endPoint = feed + "(2)";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endPoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                 );
        }, "Testing valid read of null nested complex type and navigation property " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readNullComplexTypeEntryTest(handlerAccept) {
            var endPoint = feed + "(3)";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endPoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                 );
        }, "Testing valid read of null top level complex type" + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readNullPropertiesDerivedEntryTest(handlerAccept) {
            djstest.assertsExpected(1);
            var endPoint = feed + "(4)";
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endPoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                );
        }, "Testing valid read of derived type null properties with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readNextComplexTypeDerivedEntryTest(handlerAccept) {

            djstest.assertsExpected(1);
            var endPoint = feed + "(5)";
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endPoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                 );
        }, "Testing valid read of derived type with full nested complex type properties with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readEntryWithInlineFeedTest(handlerAccept) {
            var endpoint = categoriesFeed + "(0)?$expand=Foods";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data.value, expectedData.value, "Verify inline feed");
                                djstest.assertAreEqualDeep(data, expectedData, "Verify entry");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                );
        }, "Testing read of entry with inline feed with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readFeedWithEmptyInlineFeedTest(handlerAccept) {
            var endpoint = categoriesFeed + "?$filter=Name eq 'Empty Category'&$expand=Foods";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readFeed(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data.value, expectedData.value, "Verify inline feed");
                                djstest.assertAreEqualDeep(data, expectedData, "Verify feed");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
               );
        }, "Testing read of entry with empty inline feed with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readEntryWithInlineEntryTest(handlerAccept) {
            var endpoint = feed + "(0)?$expand=Category";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data.Category, expectedData.Category, "Verify inline entry");
                                djstest.assertAreEqualDeep(data, expectedData, "Verify entry");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
               );
        }, "Testing read of entry with inline entry with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readFeedWithNullInlineEntryTest(handlerAccept) {
            var endpoint = feed + "?$expand=Category&$filter=Category eq null";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readFeed(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data.value, expectedData.value, "Verify inline data");
                                djstest.assertAreEqualDeep(data, expectedData, "Verify feed");
                                djstest.done();
                            }, handlerAccept);
                    },
                    unexpectedErrorHandler
               );
        }, "Testing read of feed with null inline entry with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readFeedWithInlineCountTest(handlerAccept) {
            var endpoint = feed + "?$count=true";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readFeed(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqual(data["@odata.count"], expectedData["@odata.count"], "Verify count in response data");
                                djstest.assertAreEqualDeep(data, expectedData, "Verify feed");
                                djstest.done();
                            }, handlerAccept
                        );
                    },
                    unexpectedErrorHandler
                );
        }, "Testing read of collection with inline count with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function selectSinglePropertyOnEntryTest(handlerAccept) {
            var endpoint = feed + "(0)?$select=Name";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                function (data, response) {
                    window.ODataVerifyReader.readEntry(endpoint,
                        function (expectedData) {
                            djstest.assertAreEqualDeep(data, expectedData, "Verify select result");
                            djstest.done();
                        }, handlerAccept
                    );
                },
                unexpectedErrorHandler);
        }, "Select single property of entry " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function selectComplexTypeOnFeedTest(handlerAccept) {
            var endpoint = feed + "?$select=Packaging";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                function (data, response) {
                    window.ODataVerifyReader.readFeed(endpoint,
                        function (expectedData) {
                            djstest.assertAreEqualDeep(data, expectedData, "Verify select result");
                            djstest.done();
                        }, handlerAccept
                    );
                },
                unexpectedErrorHandler);
        }, "Select single complex type property of feed " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function selectMultiplePropertiesOnEntryTest(handlerAccept) {
            var endpoint = feed + "(3)?$select=Packaging,ExpirationDate,IsAvailable";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                function (data, response) {
                    window.ODataVerifyReader.readEntry(endpoint,
                        function (expectedData) {
                            djstest.assertAreEqualDeep(data, expectedData, "Verify select result");
                            djstest.done();
                        }, handlerAccept
                    );
                },
                unexpectedErrorHandler);
        }, "Select multiple primitive properties of feed " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readPagedCategoriesCollectionTest(handlerAccept) {
            var endpoint = categoriesFeed;
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readFeed(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Verify response data");
                                djstest.done();
                            }, handlerAccept
                        );
                    }, unexpectedErrorHandler);
        }, "Testing read of paged collection with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readPagedCollectionWithInlineCountTest(handlerAccept) {
            var endpoint = categoriesFeed + "?$count=true";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readFeed(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqual(data["@odata.context"], expectedData["@odata.context"], "Verify count in response data");
                                djstest.assertAreEqualDeep(data, expectedData, "Verify feed");
                                djstest.done();
                            }, handlerAccept
                        );
                    }, unexpectedErrorHandler);
        }, "Testing read of paged collection with inline count with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readEntryWithNamedStreams(handlerAccept) {
            var endpoint = feed + "(1)?$expand=Category";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Verify entry");
                                djstest.done();
                            }, handlerAccept
                        );
                    }, unexpectedErrorHandler);
        }, "Testing read of entry with named streams " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readEntryWithCollectionProperties(handlerAccept) {
            var endpoint = feed + "(0)";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        window.ODataVerifyReader.readEntry(endpoint,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Verify entry");
                                djstest.done();
                            }, handlerAccept
                        );
                    }, unexpectedErrorHandler);
        }, "Testing read of entry with collection properties " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function invalidEntryReadTest(handlerAccept) {
            var endPoint = feed + "(16)";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        djstest.assert(false, "We should not get here because data is not valid.");
                        djstest.done()
                    },
                    function (err) {
                        djstest.assertAreEqual(err.message, expectedErrorMessage, "Error message");
                        djstest.assertAreEqual(err.response.statusCode, httpStatusCode.notFound, "Response status code");
                        djstest.done();
                    });
        }, "Testing invalid entry read with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function invalidFeedReadTest(handlerAccept) {
            var endPoint = feed + "Invalid";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                    function (data, response) {
                        djstest.assert(false, "We should not get here because data is not valid.");
                        djstest.done();
                    },
                    function (err) {
                        djstest.assertAreEqual(err.message, expectedErrorMessage, "Error message");
                        djstest.assertAreEqual(err.response.statusCode, httpStatusCode.notFound, "Response status code");
                        djstest.done();
                    });
        }, "Testing invalid feed read with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function standardErrorReadTest(handlerAccept) {
            var endPoint = feed + "?$foo=bar";
            djstest.assertsExpected(2);
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} },
                                    function (data, response) {
                                        djstest.assert(false, "We should not get here because data is not valid.");
                                        djstest.done()
                                    },
                                    function (err) {
                                        djstest.assertAreEqual(err.message, expectedErrorMessage, "Error message");
                                        djstest.assertAreEqual(err.response.statusCode, httpStatusCode.badRequest, "Response status code");
                                        djstest.done();
                                    });
        }, "Testing standard error read with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function inStreamErrorReadTest(handlerAccept) {
            var endPoint = "./endpoints/ErrorDataService.svc/Entities";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endPoint, headers: { Accept: handlerAccept} }, function (data, response) {
                djstest.assert(false, "Unexpected call to success handler with response: " + djstest.toString(response));
                djstest.done()
            }, function (err) {
                djstest.assert(err.response.body.indexOf("An error occurred while processing this request") > -1, "Error handler was called with the correct response body");
                djstest.done();
            });
        }, "Testing in-stream error read with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        var user = "djsUser";
        var password = "djsPassword";

        djstest.addTest(function readFullFeedBasicAuthTest(handlerAccept) {
            var endpoint = "./endpoints/BasicAuthDataService.svc/Customers";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept }, user: user, password: password }, function (data, response) {
                window.ODataVerifyReader.readFeed({ url: endpoint, user: user, password: password }, function (expectedData) {
                    djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                    djstest.done();
                }, handlerAccept);
            }, unexpectedErrorHandler);
        }, "Testing valid read of full feed collection on basic auth with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);

        djstest.addTest(function readEntryBasicAuthTest(handlerAccept) {
            var endpoint = "./endpoints/BasicAuthDataService.svc/Customers(1)";
            djstest.assertsExpected(1);
            odatajs.oData.read({ requestUri: endpoint, headers: { Accept: handlerAccept }, user: user, password: password }, function (data, response) {
                window.ODataVerifyReader.readEntry({ url: endpoint, user: user, password: password }, function (expectedData) {
                    djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                    djstest.done();
                }, handlerAccept);
            }, unexpectedErrorHandler);
        }, "Testing valid read of entry on basic auth with " + handlerAcceptStrings[i], handlerAcceptStrings[i]);
    }

    var services = [
            service,
            epmService
        ];

    $.each(services, function (_, serviceName) {
        $.each(validServiceDocumentAcceptHeaders, function (_, validServiceDocumentAcceptHeader) {
            var parameters = { handlerAccept: validServiceDocumentAcceptHeader, serviceName: serviceName };

            djstest.addTest(function validReadServiceDocumentTest(params) {
                djstest.assertsExpected(1);
                odatajs.oData.read({ requestUri: params.serviceName, headers: { Accept: params.handlerAccept} },
                        function (data, response) {
                            window.ODataVerifyReader.readServiceDocument(serviceName,
                                function (expectedData) {
                                    djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                    djstest.done();
                                }, params.handlerAccept
                            );
                        },
                        unexpectedErrorHandler
                    );
            }, "Testing valid read of service document " + parameters.handlerAccept + " on service " + parameters.serviceName, parameters);
        });

        $.each(invalidServiceDocumentAcceptHeaders, function (_, invalidServiceDocumentAcceptHeader) {
            var parameters = { handlerAccept: invalidServiceDocumentAcceptHeader, serviceName: serviceName };

            djstest.addTest(function invalidReadServiceDocumentTest(params) {
                djstest.assertsExpected(2);
                odatajs.oData.read({ requestUri: params.serviceName, headers: { Accept: params.handlerAccept} },
                        function success(data, response) {
                            djstest.fail("Reading service document should produce error with " + params.handlerAccept);
                            djstest.done();
                        },
                        function (err) {
                            djstest.assertAreEqual(err.message, expectedErrorMessage, "Error message");
                            djstest.assertAreEqual(err.response.statusCode, httpStatusCode.unsupportedMediaType, "Response status code");
                            djstest.done();
                        }
                    );
            }, "Testing read of service document with invalid MIME type " + parameters.invalidServiceDocumentAcceptHeader + " on service " + serviceName, parameters);
        });

        //to do:
        $.each(validMetadataAcceptHeaders, function (_, validMetadataAcceptHeader) {
            var parameters = { handlerAccept: validMetadataAcceptHeader, serviceName: serviceName };

            djstest.addTest(function validReadMetadataTest(params) {
                djstest.assertsExpected(1);
                var endPoint = params.serviceName + "$metadata";
                odatajs.oData.read({ requestUri: endPoint, headers: { Accept: params.handlerAccept} },
                        function (data, response) {
                            window.ODataVerifyReader.readMetadata(endPoint,
                                function (expectedData) {
                                    djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                    djstest.done();
                                }
                            );
                        },
                        unexpectedErrorHandler,
                    odatajs.oData.metadataHandler
                    );
            }, "Testing valid read metadata " + parameters.handlerAccept + " on service " + parameters.serviceName, parameters);
        });

        $.each(invalidMetadataAcceptHeaders, function (_, invalidMetadataAcceptHeader) {
            var parameters = { handlerAccept: invalidMetadataAcceptHeader, serviceName: serviceName };
            djstest.addTest(function invlaidReadMetadataTest(params) {
                djstest.assertsExpected(2);
                var endPoint = params.serviceName + "$metadata";
                odatajs.oData.read({ requestUri: endPoint, headers: { Accept: params.handlerAccept} },
                        function success(data, response) {
                            djstest.fail("Reading metadata should produce error with " + params.handlerAccept);
                            djstest.done();
                        },
                        function (err) {
                            djstest.assertAreEqual(err.message, expectedErrorMessage, "Error message");
                            djstest.assertAreEqual(err.response.statusCode, httpStatusCode.unsupportedMediaType, "Response status code");
                            djstest.done();
                        },
                    odatajs.oData.metadataHandler
                    );
            }, "Testing read metadata with invalid MIME type " + parameters.handlerAccept + " on service " + parameters.serviceName, parameters);
        });
    });

    // To do: update the test data for enabling the annotation test
    djstest.addFullTest(true, function metadataElementExtensionsTest() {
        var csdlFile = "./endpoints/CustomAnnotations.xml";
        var modifyTypeHttpClient = {};
        var originalHttpClient = window.odatajs.oData.net.defaultHttpClient;

        // Modify the content-type of the response so that it is accepted by the metadataHandler.
        // By default, the content-type of CustomAnnotations.xml comes back as text/xml
        modifyTypeHttpClient.request = function (request, success, error) {
            return originalHttpClient.request(request, function (response) {
                response.headers["Content-Type"] = "application/xml";
                success(response);
            }, error);
        };

        window.odatajs.oData.net.defaultHttpClient = modifyTypeHttpClient;

        odatajs.oData.read({ requestUri: csdlFile, headers: { Accept: "text/xml"} },
            function (data) {
                window.ODataVerifyReader.readMetadata(csdlFile,
                    function (expectedData) {
                        djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                        djstest.done();
                    }
                )
            },
            unexpectedErrorHandler, OData.metadataHandler
         );
    });

    djstest.addTest(function verifyNonDefaultReadMethodCalled() {
        var endPoint = feed + "(0)";
        djstest.assertsExpected(2);
        odatajs.oData.read(
                { requestUri: endPoint },
                function success(data, response) {
                    djstest.assert(true, "Test executed");
                    djstest.done();
                },
                null,
                {
                    read: function (response) {
                        djstest.assert(true, "Non-default read reached");
                        djstest.done();
                    },
                    accept: "*/*"
                }
            );
    }, "Testing nondefault read is called.");

})(this);