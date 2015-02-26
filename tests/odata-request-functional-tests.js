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

    var verifyRequest = function (request, done) {
        if (request.method == "POST") {
            verifyPost(request, done);
        }
        else if (request.method == "PUT") {
            verifyPut(request, done);
        }
        else if (request.method == "PATCH") {
            verifyPatch(request, done);
        }
    };

    var tryRemoveOdataType = function (data) {
        if (data && data["@odata.type"]) {
            delete data["@odata.type"];
        }

        return data;
    };

    var verifyPost = function (request, done) {
        var httpOperation = request.method + " " + request.requestUri;
        djstest.log(httpOperation);
        odatajs.oData.request(request, function (data, response) {
            djstest.log("Status code:" + response.statusCode);
            djstest.assertAreEqual(response.statusCode, httpStatusCode.created, "Verify response code: " + httpOperation);
            djstest.log("Uri:" + request.requestUri);
            ODataVerifyReader.readEntry(response.headers["Location"], function (expectedData) {
                djstest.assertAreEqualDeep(response.data, expectedData, "Verify new entry against response: " + httpOperation);
                done();
            }, request.headers.Accept);
        }, unexpectedErrorHandler);
    };

    var verifyPut = function(request, done) {
        var httpOperation = request.method + " " + request.requestUri;
        djstest.log(httpOperation);
        odatajs.oData.request(request, function(data, response) {
            djstest.log("Status code:" + response.statusCode);
            djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code: " + httpOperation);
            djstest.log("Uri:" + request.requestUri);
            ODataVerifyReader.readEntry(request.requestUri, function(actualData) {
                var requestData = tryRemoveOdataType(request.data);
                djstest.assertAreEqualDeep(subset(actualData, requestData), requestData, "Verify updated entry: " + httpOperation);
                done();
            }, request.headers.Accept);
        }, unexpectedErrorHandler);
    };

    var verifyPatch = function (request, done) {
        var httpOperation = request.method + " " + request.requestUri;
        djstest.log(httpOperation);
        ODataVerifyReader.readEntry(request.requestUri, function (originalData) {
            odatajs.oData.request(request, function (data, response) {
                djstest.log("Status code:" + response.statusCode);
                djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code");
                djstest.log("Uri:" + request.requestUri);
                ODataVerifyReader.readEntry(request.requestUri, function (actualData) {

                    // Merge the original data with the updated data to get the expected data
                    var expectedData = $.extend(true, {}, originalData, request.data);
                    djstest.assertAreEqualDeep(actualData, tryRemoveOdataType(expectedData), "Verify merged data");
                    done();
                }, request.headers["Content-Type"]);
            }, unexpectedErrorHandler);
        }, request.headers["Content-Type"]);
    };

    // Returns a subset of object with the same set of properties (recursive) as the subsetObject
    var subset = function (object, subsetObject) {
        if (typeof (object) == "object" && typeof (subsetObject) == "object") {
            var result = {};
            for (var subsetProp in subsetObject) {
                result[subsetProp] = subset(object[subsetProp], subsetObject[subsetProp]);
            }
            return result;
        }
        else {
            return object;
        }
    };

    var foodData = {
        "@odata.type": "#DataJS.Tests.V4.Food",
        FoodID: 42,
        Name: "olive oil",
        UnitPrice: 3.14,
        ServingSize: 1,
        MeasurementUnit: "",
        ProteinGrams: 5,
        FatGrams: 9,
        CarbohydrateGrams: 2,
        CaloriesPerServing: 6,
        IsAvailable: true,
        ExpirationDate: "2010-12-25T12:00:00Z",
        ItemGUID: "27272727-2727-2727-2727-272727272727",
        Weight: 10,
        AvailableUnits: 1,
        Packaging: {
            Type: "Can",
            Color: null,
            NumberPerPackage: 1,
            RequiresRefridgeration: false,
            PackageDimensions: {
                Length: 4,
                Height: 3,
                Width: 2,
                Volume: 1
            },
            ShipDate: "2010-12-25T12:00:00Z"
        }
    };

    var testServices = {
        V4: "./endpoints/FoodStoreDataServiceV4.svc"
    };

    var testData = {
        V4: $.extend(true, {}, foodData, {
            AlternativeNames: ["name1", "name2"],
            Providers:
                    [{
                        Name: "Provider",
                        Aliases: ["alias1"],
                        Details: {
                            Telephone: "555-555-555",
                            PreferredCode: 999
                        }
                    },
                    {
                        Name: "Provider2",
                        Aliases: [],
                        Details: null
                    }
                ]
        })
    };

    var mimeTypes = [undefined, "application/json;odata.metadata=minimal"];

    var httpStatusCode = {
        created: 201,
        noContent: 204,
        notFound: 404
    };

    $.each(testServices, function (serviceName, service) {
        var newFood = testData[serviceName];

        var foodsFeed = service + "/Foods";
        var categoriesFeed = service + "/Categories";

        module("Functional", {
            setup: function () {
                djstest.log("Resetting data");
                djstest.wait(function (done) {
                    $.post(service + "/ResetData", done);
                });
            }
        });

        $.each(mimeTypes, function (_, mimeType) {
            // Provide coverage for both undefined and specific DSVs
            // For all other cases DSV = undefined is a valid scenario
            var dataServiceVersions = ["4.0"];

            $.each(dataServiceVersions, function (_, dataServiceVersion) {
                var headers;
                if (mimeType || dataServiceVersion) {
                    headers = {
                        "Content-Type": mimeType,
                        Accept: mimeType,
                        "OData-Version": dataServiceVersion
                    };
                }

                djstest.addTest(function addEntityTest(headers) {
                    var request = {
                        requestUri: categoriesFeed,
                        method: "POST",
                        headers: headers,
                        data: {
                            CategoryID: 42,
                            Name: "New Category"
                        }
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Add new entity to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function addEntityWithUTF16CharTest(headers) {
                    var request = {
                        requestUri: categoriesFeed,
                        method: "POST",
                        headers: headers,
                        data: {
                            CategoryID: 42,
                            Name: "\u00f6 New Category \u00f1"
                        }
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Add new entity with UTF-16 character to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function addLinkedEntityTest(headers) {
                    var request = {
                        requestUri: categoriesFeed + "(0)/Foods",
                        method: "POST",
                        headers: headers,
                        data: newFood
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Add new linked entity to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function addEntityWithInlineFeedTest(headers) {
                    var request = {
                        requestUri: categoriesFeed,
                        method: "POST",
                        headers: headers,
                        data: {
                            CategoryID: 42,
                            Name: "Olive Products",
                            Foods: [newFood]
                        }
                    };

                    djstest.assertsExpected(3);
                    verifyRequest(request, function () {
                        ODataVerifyReader.readEntry(foodsFeed + "(" + newFood.FoodID + ")", function (actualData) {
                            djstest.assertAreEqual(actualData.Name, newFood.Name, "Verify inline entities were added");
                            djstest.done();
                        }, headers ? headers.Accept : undefined);
                    });
                }, "Add new entity with inline feed to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function addEntityWithInlineEntryTest(headers) {
                    var request = {
                        requestUri: foodsFeed,
                        method: "POST",
                        headers: headers,
                        data: $.extend({}, newFood, {
                            Category: {
                                CategoryID: 42,
                                Name: "Olive Products"
                            }
                        })
                    };

                    djstest.assertsExpected(3);
                    verifyRequest(request, function () {
                        ODataVerifyReader.readEntry(categoriesFeed + "(" + request.data.Category.CategoryID + ")", function (actualData) {
                            djstest.assertAreEqual(actualData.Name, request.data.Category.Name, "Verify inline entities were added");
                            djstest.done();
                        }, headers ? headers.Accept : undefined);
                    });
                }, "Add new entity with inline entry to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function updateEntityTest(headers) {
                    var request = {
                        requestUri: categoriesFeed + "(0)",
                        method: "PUT",
                        headers: headers,
                        data: {
                            CategoryID: 0,
                            Name: "Updated Category"
                        }
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Update entity to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                if (serviceName === "V4") {
                    djstest.addTest(function updateEntityTest(headers) {
                        var request = {
                            requestUri: foodsFeed + "(0)",
                            method: "PATCH",
                            headers: headers,
                            data: {
                                "@odata.type": "#DataJS.Tests.V4.Food",
                                AlternativeNames: ["one", "two"]
                            }
                        };

                        djstest.assertsExpected(2);
                        verifyRequest(request, djstest.done);
                    }, "Update collection property to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);
                }

                djstest.addTest(function updatePrimitivePropertyTest(headers) {
                    var request = {
                        requestUri: categoriesFeed + "(0)/Name",
                        method: "PUT",
                        headers: headers,
                        data: { value: "Updated Category" }
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Update primitive property to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function updateLinkedEntityTest(headers) {
                    var request = {
                        requestUri: categoriesFeed + "(0)/Foods(0)",
                        method: "PUT",
                        headers: headers,
                        data: {
                            "@odata.type": "#DataJS.Tests.V4.Food",
                            Name: "Updated Food"
                        }
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Update linked entity to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function mergeEntityTest(headers) {
                    var request = {
                        requestUri: categoriesFeed + "(0)",
                        method: "PATCH",
                        headers: headers,
                        data: { Name: "Merged Category" }
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Merge entity to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function mergeLinkedEntityTest(headers) {
                    var request = {
                        requestUri: categoriesFeed + "(0)/Foods(0)",
                        method: "PATCH",
                        headers: headers,
                        data: {
                            "@odata.type": "#DataJS.Tests.V4.Food",
                            Name: "Merged Food"
                        }
                    };

                    djstest.assertsExpected(2);
                    verifyRequest(request, djstest.done);
                }, "Merge linked entity to " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);

                djstest.addTest(function deleteEntityTest(headers) {
                    var endpoint = categoriesFeed + "(0)";
                    djstest.assertsExpected(2);
                    odatajs.oData.request({
                        requestUri: endpoint,
                        method: "DELETE",
                        headers: headers
                    }, function (data, response) {
                        djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code");
                        $.ajax({
                            url: endpoint,
                            error: function (xhr) {
                                djstest.assertAreEqual(xhr.status, httpStatusCode.notFound, "Verify response code of attempted retrieval after delete");
                                djstest.done();
                            },
                            success: function () {
                                djstest.fail("Delete failed: querying the endpoint did not return expected response code");
                                djstest.done();
                            }
                        });
                    }, unexpectedErrorHandler);
                }, "Delete entity from " + serviceName + " service using mimeType = " + mimeType + " and DSV = " + dataServiceVersion, headers);
            });
        });
    });
})(this);