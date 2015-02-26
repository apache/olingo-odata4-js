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

    var service = "./endpoints/EpmDataService.svc";
    var metadataUri = service + "/$metadata";

    var httpStatusCode = {
        ok: 200,
        created: 201,
        noContent: 204
    };

    var acceptHeaders = { Accept: "application/json" };
    var mimeHeaders = { "Content-Type": "application/json", Accept: "application/json" };
    var keepInContentVariations = [true, false];
    var feedUris = { "true": service + "/ReplicatedEntries", "false": service + "/MappedEntries" };
    var typeNames = { "true": "DataJS.Tests.ReplicatedEntry", "false": "DataJS.Tests.MappedEntry" };
    var selectProperties = ["Published", "Author", "CustomElement", "NestedElement1", "Published,Author,CustomElement,NestedElement1"];

    var newEntry = {
        UnmappedField: "Unmapped100",
        Author: {
            Email: "AuthorEmail100",
            Name: "AuthorName100",
            Uri: "http://www.example.com/AuthorUri100",
            Contributor: {
                Email: "ContributorEmail100",
                Name: "ContributorName100",
                Uri: "http://www.example.com/ContributorUri1000"
            }
        },
        Published: "2100-01-01T00:00:00-08:00",
        Rights: "Rights100",
        Summary: "<xmlElement xmlns=\"http://www.example.com/dummy\" attr=\"value100\">Summary100</xmlElement>",
        Title: "Title<b>100</b>",
        Updated: "2100-01-01T00:00:00-08:00",
        CustomElement: "CustomElement100",
        CustomAttribute: "CustomAttribute100",
        NestedElement1: "NestedElement1_100",
        NestedElement2: "NestedElement2_100",
        CommonAttribute1: "CommonAttribute1_100",
        CommonAttribute2: "CommonAttribute2_100",
        Location: {
            Lat: 1.23,
            Long: 4.56
        }
    };

    var newSpecialValuesEntry = $.extend(true, {}, newEntry, {
        Author: {
            Email: null,
            Name: "",
            Uri: " ",
            Contributor: {
                Email: null,
                Name: "",
                Uri: " "
            }
        },
        Rights: null,
        Summary: "",
        Title: " ",
        CustomElement: null,
        NestedElement1: "",
        NestedElement2: " ",
        CustomAttribute: null,
        CommonAttribute1: "",
        CommonAttribute2: " "
    });

    var nullComplexTypeEntry = $.extend(true, {}, newEntry, {
        Author: { Contributor: null },
        Location: null
    });

    var testEntries = [
        { data: newEntry, description: "entry" },
        { data: newSpecialValuesEntry, description: "entry containing null and empty string" },
        { data: nullComplexTypeEntry, description: "entry containing null complex type value" }
    ];

    var serviceMetadata;
    var getMetadata = function (callback) {
        /** Common function for tests to get and cache metadata, to reduce network calls made by tests
        */
        if (!serviceMetadata) {
            odatajs.oData.read(metadataUri, function (metadata) {
                serviceMetadata = metadata;
                callback(metadata);
            }, unexpectedErrorHandler, odatajs.oData.metadataHandler);
        }
        else {
            callback(serviceMetadata);
        }
    };

    module("Functional", {
        setup: function () {
            djstest.wait(function (done) {
                $.post(service + "/ResetData", done);
            });
            odatajs.oData.defaultMetadata = [];
            odatajs.oData.jsonHandler.recognizeDates = false;
        }
    });

    $.each(selectProperties, function (_, selectProperty) {
        djstest.addTest(function getSelectPropertiesOnEntry(propertyToSelect) {
            var entryUri = feedUris["true"] + "(0)?$select=" + propertyToSelect;
            djstest.assertsExpected(2);
            getMetadata(function (metadata) {
                odatajs.oData.defaultMetadata.push(metadata);
                odatajs.oData.read({ requestUri: entryUri, headers: acceptHeaders }, function (data, response) {
                    djstest.assertAreEqual(response.statusCode, httpStatusCode.ok, "Verify response code");
                    ODataVerifyReader.readJson(entryUri, function (expectedData) {
                        djstest.assertWithoutMetadata(data, expectedData, "Verify data");
                        djstest.done();
                    })
                }, unexpectedErrorHandler);
            }, unexpectedErrorHandler, odatajs.oData.metadataHandler);
        }, "GET with mapped properties selecting " + selectProperty + " with keepInContent = true", selectProperty);
    });

    $.each(keepInContentVariations, function (_, keepInContent) {
        var feedUri = feedUris[keepInContent];

        $.each(testEntries, function (entryIndex, testEntry) {
            var params = {
                feedUri: feedUri,
                testEntry: $.extend(true, {}, testEntry, {
                    data: {
                        "__metadata": { type: typeNames[keepInContent] }
                    }
                })
            };

            djstest.addTest(function getMappedEntry(params) {
                var entryUri = params.feedUri + "(" + entryIndex + ")";
                djstest.assertsExpected(2);
                getMetadata(function (metadata) {
                    odatajs.oData.defaultMetadata.push(metadata);
                    odatajs.oData.read({ requestUri: entryUri, headers: acceptHeaders }, function (data, response) {
                        djstest.assertAreEqual(response.statusCode, httpStatusCode.ok, "Verify response code");
                        ODataVerifyReader.readJson(entryUri, function (expectedData) {
                            djstest.assertWithoutMetadata(data, expectedData, "Verify data");
                            djstest.done();
                        })
                    }, unexpectedErrorHandler);
                }, unexpectedErrorHandler, odatajs.oData.metadataHandler);
            }, "GET " + params.testEntry.description + " with mapped properties: keepInContent = " + keepInContent, params);

            djstest.addTest(function postMappedEntry(params) {
                var postEntry = $.extend(true, {}, params.testEntry.data, { ID: 100 });
                djstest.assertsExpected(2);
                getMetadata(function (metadata) {
                    odatajs.oData.request({ requestUri: params.feedUri, method: "POST", headers: djstest.clone(mimeHeaders), data: postEntry }, function (data, response) {
                        djstest.assertAreEqual(response.statusCode, httpStatusCode.created, "Verify response code");
                        ODataVerifyReader.readJson(feedUri + "(" + postEntry.ID + ")", function (actualData) {
                            djstest.assertWithoutMetadata(actualData, postEntry, "Verify new entry data against server");
                            djstest.done();
                        })
                    }, unexpectedErrorHandler, undefined, undefined, metadata);
                }, unexpectedErrorHandler, odatajs.oData.metadataHandler);
            }, "POST " + params.testEntry.description + " with mapped properties: keepInContent = " + keepInContent, params);

            djstest.addTest(function putMappedEntry(params) {
                var entryUri = params.feedUri + "(0)";
                djstest.assertsExpected(2);
                getMetadata(function (metadata) {
                    odatajs.oData.defaultMetadata.push(metadata);
                    odatajs.oData.request({ requestUri: entryUri, method: "PUT", headers: djstest.clone(mimeHeaders), data: params.testEntry.data }, function (data, response) {
                        djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code");
                        ODataVerifyReader.readJson(entryUri, function (actualData) {
                            djstest.assertWithoutMetadata(actualData, $.extend({ ID: 0 }, params.testEntry.data), "Verify updated entry data against server");
                            djstest.done();
                        })
                    }, unexpectedErrorHandler);
                }, unexpectedErrorHandler, odatajs.oData.metadataHandler);
            }, "PUT " + params.testEntry.description + " with mapped properties: keepInContent = " + keepInContent, params);
        });
    });

    var descriptions = ["base type", "derived type"];
    $.each(descriptions, function (index, _) {
        djstest.addTest(function getHierarchicalEntry(index) {
            var entryUri = service + "/HierarchicalEntries(" + index + ")";
            djstest.assertsExpected(2);
            getMetadata(function (metadata) {
                odatajs.oData.read({ requestUri: entryUri, headers: acceptHeaders }, function (data, response) {
                    djstest.assertAreEqual(response.statusCode, httpStatusCode.ok, "Verify response code");
                    ODataVerifyReader.readJson(entryUri, function (expectedData) {
                        djstest.assertWithoutMetadata(data, expectedData, "Verify data");
                        djstest.done();
                    })
                }, unexpectedErrorHandler, undefined, undefined, metadata);
            }, unexpectedErrorHandler, odatajs.oData.metadataHandler);
        }, "GET " + descriptions[index] + " with mapped properties: keepInContent = false", index);
    });

    $.each([false, true], function (_, recognizeDates) {
        djstest.addTest(function readDateTimeWithMetadataTest(params) {
            var foodStoreDataService = "./endpoints/FoodStoreDataServiceV4.svc";
            var specialDaysEndpoint = foodStoreDataService + "/SpecialDays";

            djstest.assertsExpected(1);
            odatajs.oData.jsonHandler.recognizeDates = params.recognizeDates;
            odatajs.oData.read(foodStoreDataService + "/$metadata", function (metadata) {
                odatajs.oData.read({ requestUri: specialDaysEndpoint, headers: { Accept: params.accept} }, function (data, response) {
                    // Because our verifier isn't metadata aware, it is not 100% correct, so we will pass in recognizeDates = true
                    // in all cases and manually fix up the property that was incorrectly converted
                    window.ODataVerifyReader.readFeed(specialDaysEndpoint, function (expectedData) {
                        // Fix up the string property that has a "date-like" string deliberately injected
                        expectedData.results[2].Name = "/Date(" + expectedData.results[2].Name.valueOf() + ")/";
                        djstest.assertAreEqualDeep(data, expectedData, "Verify response data");
                        djstest.done();
                    }, params.accept, true);
                }, unexpectedErrorHandler, undefined, undefined, metadata);
            }, unexpectedErrorHandler, odatajs.oData.metadataHandler);
        }, "GET metadata-aware JSON dates with recognizeDates=" + recognizeDates, { recognizeDates: recognizeDates, accept: "application/json;odata.metadata=minimal" });
    });
})(this);
