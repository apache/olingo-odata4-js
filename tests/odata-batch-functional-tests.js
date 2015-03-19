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

    var determineExpected = function (batchRequests) {
        var expected = 0;
        $.each(batchRequests, function (_, batchRequest) {
            // 2 assertions per request: response code and data
            if (batchRequest.__changeRequests) {
                expected += batchRequest.__changeRequests.length * 2;
            } else {
                expected += 2;
            }
        });

        // 2 more assertions than the number of requests in batch: response code and batch response length
        return expected + 2;
    };

    var verifyBatchRequest = function (serviceRoot, batchRequests, elementTypes, done) {
        odatajs.oData.request({ requestUri: serviceRoot + "/$batch", method: "POST", data: { __batchRequests: batchRequests} },
            function (data, response) {
                djstest.assertAreEqual(response.statusCode, httpStatusCode.accepted, "Verify response code");
                djstest.assertAreEqual(data.__batchResponses.length, batchRequests.length, "Verify batch response count");
                verifyBatchResponses(batchRequests, elementTypes, serviceRoot, data.__batchResponses, done);
            },
            unexpectedErrorHandler, odatajs.oData.batch.batchHandler);
    };

    var verifyBatchResponses = function (batchRequests, elementTypes, serviceRoot, batchResponses, done) {
        forEachAsync(batchRequests, function (index, batchRequest, doneOne) {
            if (batchRequest.requestUri) {
                var readFeedOrEntry = elementTypes[index] == "feed" ? ODataVerifyReader.readFeed : ODataVerifyReader.readEntry;
                djstest.assertAreEqual(batchResponses[index].statusCode, httpStatusCode.ok, "Verify response code for: GET " + batchRequest.requestUri);
                readFeedOrEntry(serviceRoot + "/" + batchRequest.requestUri, function (expectedData) {
                    djstest.assertAreEqualDeep(batchResponses[index].data, expectedData, "Verify data for: GET " + batchRequest.requestUri);
                    doneOne();
                }, batchRequests[index].headers.Accept);
            }
            else if (batchRequest.__changeRequests) {
                verifyChangeResponses(batchRequest.__changeRequests, batchResponses[index].__changeResponses, function () { doneOne(); });
            }
        }, done);
    };

    var verifyChangeResponses = function (changeRequests, changeResponses, done) {
        forEachAsync(changeRequests, function (index, changeRequest, doneOne) {
            var httpOperation = changeRequest.method + " " + changeRequest.requestUri;
            var changeResponse = changeResponses[index];

            if (changeRequest.method == "POST") {
                djstest.assertAreEqual(changeResponse.statusCode, httpStatusCode.created, "Verify response code for: " + httpOperation);
                ODataVerifyReader.readEntry(changeResponse.headers["Location"], function (expectedData) {
                    djstest.assertAreEqualDeep(changeResponse.data, expectedData, "Verify response data for: " + httpOperation);
                    doneOne();
                }, changeRequest.headers.Accept);
            }
            else if (changeRequest.method == "PUT") {
                djstest.assertAreEqual(changeResponse.statusCode, httpStatusCode.noContent, "Verify response code for: " + httpOperation);
                djstest.assertAreEqual(changeResponse.body, "", "Verify empty body for: " + httpOperation);
                doneOne();
            }
            else if (changeRequest.method == "DELETE") {
                djstest.assertAreEqual(changeResponse.statusCode, httpStatusCode.noContent, "Verify response code for: " + httpOperation);
                djstest.assertAreEqual(changeResponse.body, "", "Verify empty body for: " + httpOperation);
                doneOne();
            }
        }, done);
    };

    var forEachAsync = function (array, callback, done) {
        var count = 0;
        var doneOne = function () {
            count++;
            if (count == array.length) {
                done();
            }
        };

        $.each(array, function (index, element) { callback(index, element, doneOne); });
    };

    var cloneHeadersWithContentId = function (mimeHeaders, count) {
        var headers = djstest.clone(mimeHeaders);
        if (!headers) { headers = {} };
        headers["Content-ID"] = count;
        return headers;
    };

    var service = "./endpoints/FoodStoreDataServiceV4.svc";
    var batchUri = service + "/$batch";

    var httpStatusCode = {
        ok: 200,
        created: 201,
        accepted: 202,
        noContent: 204
    };

    var mimeTypes = [undefined, "application/json;odata.metadata=minimal"];

    module("Functional", {
        setup: function () {
            djstest.wait(function (done) {
                $.post(service + "/ResetData", done);
            });
        }
    });

    $.each(mimeTypes, function (_, mimeType) {
        var acceptHeaders = mimeType ? { Accept: mimeType} : undefined;
        var mimeHeaders = mimeType ? { "Content-Type": mimeType, Accept: mimeType} : undefined;

        djstest.addTest(function multipleRetrieves(acceptHeaders) {
            var uriSegments = ["Foods(0)", "Foods?$filter=FoodID eq 1", "Foods?$top=2"];
            var elementTypes = ["entry", "feed", "feed"];

            var batchRequests = $.map(uriSegments, function (uriSegment) {
                return { requestUri: uriSegment, method: "GET", headers: acceptHeaders }
            });

            djstest.assertsExpected(determineExpected(batchRequests));
            verifyBatchRequest(service, batchRequests, elementTypes, function () { djstest.done(); });
        }, "Multiple retrieves: mimeType = " + mimeType, acceptHeaders);

        djstest.addTest(function multipleChangesets(params) {
            var batchRequests = [
                    {
                        __changeRequests: [
                            { requestUri: "Categories", method: "POST", headers: cloneHeadersWithContentId(params.mimeHeaders, 1), data:
                                { CategoryID: 42, Name: "New Category" }
                            }
                        ]
                    },
                    {
                        __changeRequests: [
                            { requestUri: "Categories(1)", method: "PUT", headers: cloneHeadersWithContentId(params.mimeHeaders, 2), data:
                                { CategoryID: 1, Name: "Updated Category" }
                            },
                            { requestUri: "Categories(0)", method: "DELETE", headers: cloneHeadersWithContentId(params.mimeHeaders, 3) }
                        ]
                    }
                ];
            var elementTypes = [null, null];

            djstest.assertsExpected(determineExpected(batchRequests));
            verifyBatchRequest(service, batchRequests, elementTypes, function () { djstest.done(); });
        }, "Multiple changesets: mimeType = " + mimeType, { acceptHeaders: acceptHeaders, mimeHeaders: mimeHeaders });

        djstest.addTest(function multipleRetrievesAndChangesets(params) {
            // Header needs to be cloned because it is mutable; this means that after processing one request in the batch
            // the header object will be modified
            var batchRequests = [
                    { requestUri: "Foods(0)", method: "GET", headers: djstest.clone(params.acceptHeaders) },
                    { requestUri: "Foods?$filter=FoodID eq 1", method: "GET", headers: djstest.clone(params.acceptHeaders) },
                    {
                        __changeRequests: [
                            { requestUri: "Categories", method: "POST", headers: cloneHeadersWithContentId(params.mimeHeaders, 1), data:
                                { CategoryID: 42, Name: "New Category" }
                            }
                        ]
                    },
                    { requestUri: "Foods?$top=2", method: "GET", headers: djstest.clone(params.acceptHeaders) },
                    {
                        __changeRequests: [
                            { requestUri: "Categories(1)", method: "PUT", headers: cloneHeadersWithContentId(params.mimeHeaders, 2), data:
                                { CategoryID: 1, Name: "Updated Category" }
                            },
                            { requestUri: "Categories(0)", method: "DELETE", headers: cloneHeadersWithContentId(params.mimeHeaders, 3) }
                        ]
                    }
                ];
            var elementTypes = ["entry", "feed", null, "feed", null];

            djstest.assertsExpected(determineExpected(batchRequests));
            verifyBatchRequest(service, batchRequests, elementTypes, function () { djstest.done(); });
        }, "Multiple retrieves and changesets: mimeType = " + mimeType, { acceptHeaders: acceptHeaders, mimeHeaders: mimeHeaders });

        djstest.addTest(function singleRetrieve(acceptHeaders) {
            var batchRequests = [{ requestUri: "Foods(2)", method: "GET", headers: acceptHeaders}];
            var elementTypes = ["entry"];

            djstest.assertsExpected(determineExpected(batchRequests));
            verifyBatchRequest(service, batchRequests, elementTypes, function () { djstest.done(); });
        }, "Single retrieve: mimeType = " + mimeType, acceptHeaders);

        djstest.addTest(function singleChangeset(params) {
            var batchRequests = [
                    {
                        __changeRequests: [
                            { requestUri: "Categories", method: "POST", headers: cloneHeadersWithContentId(params.mimeHeaders, 1), data:
                                { CategoryID: 42, Name: "New Category" }
                            },
                            { requestUri: "Categories(1)", method: "PUT", headers: cloneHeadersWithContentId(params.mimeHeaders, 2), data:
                                { CategoryID: 1, Name: "Updated Category" }
                            }
                        ]
                    }
                ];
            var elementTypes = [null];

            djstest.assertsExpected(determineExpected(batchRequests));
            verifyBatchRequest(service, batchRequests, elementTypes, function () { djstest.done(); });
        }, "Single changeset: mimeType = " + mimeType, { acceptHeaders: acceptHeaders, mimeHeaders: mimeHeaders });

        djstest.addTest(function singleRetrieveAndChangeset(params) {
            var batchRequests = [
                    { requestUri: "Foods(0)", method: "GET", headers: djstest.clone(params.acceptHeaders) },
                    {
                        __changeRequests: [
                            { requestUri: "Categories", method: "POST", headers: cloneHeadersWithContentId(params.mimeHeaders, 1), data:
                                { CategoryID: 42, Name: "New Category" }
                            },
                            { requestUri: "Categories(1)", method: "PUT", headers: cloneHeadersWithContentId(params.mimeHeaders, 2), data:
                                { CategoryID: 1, Name: "Updated Category" }
                            }
                        ]
                    }
                ];
            var elementTypes = ["entry", null];

            djstest.assertsExpected(determineExpected(batchRequests));
            verifyBatchRequest(service, batchRequests, elementTypes, function () { djstest.done(); });
        }, "Single retrieve and changeset: mimeType = " + mimeType, { acceptHeaders: acceptHeaders, mimeHeaders: mimeHeaders });

        djstest.addTest(function retrieveInsideChangeset(params) {

            var batchRequests = [
                    { requestUri: "Foods(0)", method: "GET" },
                    { __changeRequests: [
                            { requestUri: "Categories", method: "POST", headers: cloneHeadersWithContentId(params.mimeHeaders, 1), data: { CategoryID: 42, Name: "New Category"} },
                            { requestUri: "Categories(1)", method: "PUT", headers: cloneHeadersWithContentId(params.mimeHeaders, 2), data: { CategoryID: 1, Name: "Updated Category"} }
                        ]
                    },
                    { requestUri: "Foods(1)", method: "GET" },
                    { __changeRequests: [
                            { requestUri: "Categories", method: "POST", headers: cloneHeadersWithContentId(params.mimeHeaders, 3), data: { CategoryID: 42, Name: "New Category"} },
                            { requestUri: "Categories(1)", method: "PUT", headers: cloneHeadersWithContentId(params.mimeHeaders, 4), data: { CategoryID: 1, Name: "Updated Category"} },
                            { requestUri: "Foods", method: "GET" }
                        ]
                    }
                ];

            odatajs.oData.request({ requestUri: batchUri, method: "POST", data: { __batchRequests: batchRequests} },
            function (data, response) {
                var batchResponses = data.__batchResponses;
                var error = batchResponses[3].__changeResponses[0];
                djstest.assert(error.response.body.indexOf("An error occurred while processing this request.") > -1, "Response contains expected message");
                // Verify that the responses prior to the error are the expected ones.
                batchRequests.splice(3, 1);
                batchResponses.splice(3, 1);
                verifyBatchResponses(batchRequests, ["entry", null], service, batchResponses, function () { djstest.done(); });
            }, unexpectedErrorHandler, odatajs.oData.batch.batchHandler);
        }, "Retrieve inside changeset： mimeType = " + mimeType, {mimeHeaders: mimeHeaders });
    });

    /*On Odata V4 spec, the POST/PUT/Delete operations are allowed outside of changesets.*/
    djstest.addTest(function updateOutsideChangeset() {
        var batchRequests = [{ requestUri: "Categories", method: "POST", data: { CategoryID: 42, Name: "New Category"}}];

        djstest.assertsExpected(1);
        odatajs.oData.request({ requestUri: batchUri, method: "POST", data: { __batchRequests: batchRequests} },
            function (data, response) {
                djstest.assert(response.body.indexOf("An error occurred while processing this request.") == -1, "Verify that there is no error occurred.");
                djstest.done();
            }, unexpectedErrorHandler, odatajs.oData.batch.batchHandler
        );
    }, "Update outside changeset");
})(this);