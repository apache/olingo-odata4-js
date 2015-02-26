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

    var verifyRequest = function (request, done) {
        if (request.method == "POST") {
            if (request.headers && request.headers["X-HTTP-Method"] == "MERGE") {
                verifyMerge(request, done);
            }
            else {
                verifyPost(request, done);
            }
        }
        else if (request.method == "PUT") {
            verifyPut(request, done);
        }
    };

    var verifyPost = function (request, done) {
        var httpOperation = request.method + " " + request.requestUri;
        odatajs.oData.request(request, function (data, response) {
            djstest.assertAreEqual(response.statusCode, httpStatusCode.created, "Verify response code: " + httpOperation);
            ODataVerifyReader.readJson(data.__metadata.uri, function (expectedData) {
                djstest.assertAreEqualDeep(response.data, expectedData, "Verify new entry against response: " + httpOperation);
                done();
            }, request.headers.Accept);
        }, unexpectedErrorHandler);
    };

    var verifyPut = function (request, done) {
        var httpOperation = request.method + " " + request.requestUri;
        odatajs.oData.request(request, function (data, response) {
            djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code: " + httpOperation);
            ODataVerifyReader.readJson(request.requestUri, function (actualData) {
                djstest.assertAreEqualDeep(actualData, request.data, "Verify updated entry: " + httpOperation);
                done();
            }, request.headers.Accept);
        }, unexpectedErrorHandler);
    };

    var verifyMerge = function (request, done) {
        var httpOperation = request.method + " " + request.requestUri;
        ODataVerifyReader.readJson(request.requestUri, function (originalData) {
            odatajs.oData.request(request, function (data, response) {
                djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code");
                ODataVerifyReader.readJson(request.requestUri, function (actualData) {
                    // Merge the original data with the updated data to get the expected data
                    var expectedData = $.extend(true, {}, originalData, request.data);
                    djstest.assertAreEqualDeep(actualData, expectedData, "Verify merged data");
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

    var service = "./endpoints/FoodStoreDataService.svc";
    var foodsFeed = service + "/Foods";
    var categoriesFeed = service + "/Categories";
    //var mimeTypes = [undefined, "application/json", "application/atom+xml"];
    var mimeTypes = ["application/json", "application/atom+xml"];

    var httpStatusCode = {
        created: 201,
        noContent: 204,
        notFound: 404
    };

    var newFood = {
        "__metadata": {
            type: "DataJS.Tests.Food"
        },
        FoodID: 42,
        Name: "olive oil",
        UnitPrice: 3.14,
        ServingSize: "1",
        MeasurementUnit: "Cup",
        ProteinGrams: 5,
        FatGrams: 9,
        CarbohydrateGrams: 2,
        CaloriesPerServing: "6",
        IsAvailable: true,
        ExpirationDate: new Date("2011/05/03 12:00:00 PM"),
        ItemGUID: "27272727-2727-2727-2727-272727272727",
        Weight: 10,
        AvailableUnits: 1,
        Packaging: {
            Type: "Can",
            Color: "White",
            NumberPerPackage: 1,
            RequiresRefridgeration: false,
            PackageDimensions: {
                Length: "4",
                Height: 3,
                Width: "2",
                Volume: 1
            },
            ShipDate: new Date("2011/01/01 12:00:00 PM")
        }
    };

    var newFoodLinks = {
        uri: foodsFeed + "(1)"
    };

    module("Functional", {
        setup: function () {
            $.ajax({ async: false, type: "POST", url: service + "/ResetData" });
        }
    });

    $.each(mimeTypes, function (_, mimeType) {
        var headers = mimeType ? { "Content-Type": mimeType, Accept: mimeType} : undefined;

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

                    verifyRequest(request, function () {
                        odatajs.oData.read({ requestUri: categoriesFeed + "(42)", headers: { Accept: mimeType} }, function (actualData, response) {
                            actualData.CategoryID = 27;
                            var newRequest = {
                                requestUri: categoriesFeed,
                                method: "POST",
                                headers: headers,
                                data: actualData
                            };
                            verifyRequest(newRequest, function () { djstest.done(); });
                        }, request.headers["Content-Type"]);
                    });

                }, "Post, read posted data, post read data (mimeType = " + mimeType + ")", headers);

        djstest.addTest(function addLinkedEntityTest(headers) {
            var request = {
                requestUri: categoriesFeed + "(0)/Foods",
                method: "POST",
                headers: headers,
                data: newFood
            };

            verifyRequest(request, function () {
                odatajs.oData.read({ requestUri: categoriesFeed + "(0)/Foods(42)", headers: { Accept: mimeType} }, function (actualData, response) {
                    actualData.FoodID = 94;
                    var newRequest = {
                        requestUri: categoriesFeed + "(0)/Foods",
                        method: "POST",
                        headers: headers,
                        data: actualData
                    };
                    verifyRequest(newRequest, function () { djstest.done(); });
                }, request.headers["Content-Type"]);
            });
        }, "POST, read, POST an entry " + mimeType + ")", headers);


        djstest.addTest(function addLinkedEntityTest(headers) {
            var request = {
                requestUri: categoriesFeed + "(0)/Foods(0)",
                method: "PUT",
                headers: headers,
                data: newFood
            };

            verifyRequest(request, function () {
                odatajs.oData.read({ requestUri: categoriesFeed + "(0)/Foods(0)", headers: { Accept: mimeType} }, function (actualData, response) {
                    var newRequest = {
                        requestUri: categoriesFeed + "(0)/Foods(0)",
                        method: "PUT",
                        headers: headers,
                        data: {
                            "__metadata": { type: "DataJS.Tests.Food" },
                            Name: "New Food" 
                        }
                    };
                    verifyRequest(newRequest, function () { djstest.done(); });
                });
            });
        }, "PUT, read, PUT a new linked entry " + mimeType + ")", headers);

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

            verifyRequest(request, function () {
                odatajs.oData.read({ requestUri: foodsFeed + "(" + newFood.FoodID + ")", headers: { Accept: mimeType} }, function (actualData, response) {
                    var newRequest = {
                        requestUri: categoriesFeed,
                        method: "POST",
                        headers: headers,
                        data: {
                            CategoryID: 27,
                            Name: "Olive Products",
                            Foods: [actualData]
                        }
                    };
                    verifyRequest(newRequest, function () { djstest.done(); });
                });
            });

        }, "POST, read, POST an entity with inline feed " + mimeType + ")", headers);

        djstest.addTest(function addEntityWithInlineEntryTest(headers) {
            var request = {
                requestUri: foodsFeed,
                method: "POST",
                headers: headers,
                data: $.extend({}, newFood, {
                    Category: {
                        "__metadata": { uri: "" },
                        CategoryID: 42,
                        Name: "Olive Products"
                    }
                })
            };

            verifyRequest(request, function () {
                odatajs.oData.read({ requestUri: foodsFeed + "(" + newFood.FoodID + ")", headers: { Accept: mimeType} }, function (actualData, response) {
                    actualData.FoodID = 76;
                    var newRequest = {
                        requestUri: foodsFeed,
                        method: "POST",
                        headers: headers,
                        data: $.extend({}, actualData, {
                            Category: {
                                "__metadata": { uri: "" },
                                CategoryID: 27,
                                Name: "Olive Products"
                            }
                        })
                    };
                    verifyRequest(newRequest, function () { djstest.done(); });
                });
            });
        }, "Add new entity with inline entry (mimeType = " + mimeType + ")", headers);

        djstest.addTest(function addEntityTest(headers) {
            var request = {
                requestUri: categoriesFeed + "(1)",
                method: "PUT",
                headers: headers,
                data: {
                    CategoryID: 1,
                    Name: "New Category"
                }
            };

            verifyRequest(request, function () {
                odatajs.oData.read({ requestUri: categoriesFeed + "(1)", headers: { Accept: mimeType} }, function (actualData, response) {
                    actualData.CategoryID = 2;
                    var newRequest = {
                        requestUri: categoriesFeed + "(2)",
                        method: "PUT",
                        headers: headers,
                        data: actualData
                    };
                    verifyRequest(newRequest, function () { djstest.done(); });
                }, request.headers["Content-Type"]);
            });

        }, "Put, read put data, put read data (mimeType = " + mimeType + ")", headers);

        djstest.addTest(function addEntityTest(headers) {
            odatajs.oData.read({ requestUri: foodsFeed + "(0)", headers: { Accept: mimeType} },
                function (actualData, response) {
                    actualData.CategoryID = 216;
                    var request = {
                        requestUri: foodsFeed,
                        method: "POST",
                        headers: headers,
                        data: actualData
                    };
                    verifyRequest(request,
                        function () {
                            odatajs.oData.read({ requestUri: foodsFeed + "(216)", headers: { Accept: mimeType} },
                                function (data, response) {
                                    ODataVerifyReader.readJson(foodsFeed + "(216)",
                                        function (expectedData) {
                                            djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                            djstest.done();
                                        });
                                });
                        });
                });
        }, "Read data with dates, post read data with dates to new ID, read new ID data with dates" + mimeType + ")", headers);

        djstest.addTest(function addEntityTest(headers) {
            odatajs.oData.read({ requestUri: categoriesFeed + "(0)", headers: { Accept: mimeType} }, 
                function (actualData, response) {
                    actualData.CategoryID = 81;
                    var request = {
                        requestUri: categoriesFeed,
                        method: "POST",
                        headers: headers,
                        data: actualData
                    };
                    verifyRequest(request, 
                        function () { 
                            odatajs.oData.read({ requestUri: categoriesFeed + "(81)", headers: { Accept: mimeType} }, 
                                function (data, response) {
                                    ODataVerifyReader.readJson(categoriesFeed + "(81)",
                                        function (expectedData) {
                                            djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                            djstest.done();
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }, "Read existing data, post existing data to new idea, read new ID data" + mimeType + ")", headers);


        djstest.addTest(function addEntityTest(headers) {
            odatajs.oData.read({ requestUri: categoriesFeed + "(0)", headers: { Accept: mimeType} },
                function (actualData, response) {
                    actualData.CategoryID = 81;
                    var request = {
                        requestUri: categoriesFeed,
                        method: "POST",
                        headers: headers,
                        data: actualData
                    };
                    verifyRequest(request,
                        function () {
                            odatajs.oData.read({ requestUri: categoriesFeed + "(81)", headers: { Accept: mimeType} },
                                function (data, response) {
                                    ODataVerifyReader.readJson(categoriesFeed + "(81)",
                                        function (expectedData) {
                                            djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                            djstest.done();
                                        });
                                });
                        });
                });
        }, "Read existing data, post existing data to new idea, read new ID data" + mimeType + ")", headers);
    });
})(this);