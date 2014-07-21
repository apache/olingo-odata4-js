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
 
// odata-handler-tests.js

(function (window, undefined) {

    djstest.addTest(function createUpdateDeleteTest() {
        // This is a simple create-update-delete cycle as a high-level test.

        var serviceUri = "./endpoints/FoodStoreDataServiceV4.svc/";
        var baseUri = serviceUri + "Categories";
        var testItem;
        var handledData = { CategoryID: 1001, Name: "Name #1001" };
        var uri;

        var itemCreatedCallback = function (data, response) {
            djstest.assert(response.headers["Location"], "location URL in the headers");
            djstest.assert(data.Name, "Name #1001");
            
            uri = response.headers["Location"];
            testItem = handledData;
            testItem.Name = "Updated name";
            
            OData.request({
                method: "PUT",
                data: testItem,
                requestUri: uri,
            }, itemUpdatedCallback);
        };

        var itemUpdatedCallback = function (data, response) {
            djstest.assertAreEqual(response.statusCode, 204, "Expecting no content on update");
            OData.request({
                method: "DELETE",
                requestUri: uri
            }, itemDeletedCallback);
        };

        var itemDeletedCallback = function (data, response) {
            djstest.done();
        };

        $.post(serviceUri + "ResetData", function () {
            OData.request({
                requestUri: baseUri,
                method: "POST",
                data: { CategoryID: 1001, Name: "Name #1001" }
            }, itemCreatedCallback);
        });
    });

    djstest.addTest(function errorHandlerTest() {
        djstest.assertsExpected(1);
        OData.read("./endpoints/FoodStoreDataServiceV4.svc/Categories?$reserved-misused=true",
            function (data) {
                djstest.fail("expected an error callback");
                djstest.done();
            },
            function (err) {
                djstest.assert(err.response.body, "err.response.body is assigned");
                djstest.done();
            });
    });

    djstest.addTest(function textHandlerParseTest() {
        djstest.assertsExpected(1);
        MockHttpClient.clear().addResponse("textHandlerParseTest", {
            statusCode: 200,
            body: " text ",
            headers: { "Content-Type": "text/plain" }
        });
        OData.read("textHandlerParseTest", function (data) {
            djstest.assertAreEqual(data, " text ", "data matches");
            djstest.done();
        }, function (err) {
            djstest.fail("expected success");
            djstest.done();
        }, undefined, MockHttpClient);
    });

    djstest.addTest(function textHandlerParseEmptyTest() {
        djstest.assertsExpected(1);
        MockHttpClient.clear().addResponse("textHandlerParseTest", {
            statusCode: 200,
            body: "",
            headers: { "Content-Type": "text/plain" }
        });
        OData.read("textHandlerParseTest", function (data) {
            djstest.assertAreEqual(data, "", "data matches");
            djstest.done();
        }, function (err) {
            djstest.fail("expected success");
            djstest.done();
        }, undefined, MockHttpClient);
    });

    djstest.addTest(function textHandlerSerializeTest() {
        djstest.assertsExpected(1);
        MockHttpClient.clear().addRequestVerifier("uri", function (request) {
            djstest.assertAreEqual(request.body, "text", "text in request");
        }).addResponse("uri", { statusCode: 200, body: "", headers: { "Content-Type": "text/plain"} });
        OData.request({ requestUri: "uri", method: "POST", data: "text", headers: { "Content-Type": "text/plain"} }, function (data) {
            djstest.done();
        }, function (err) {
            djstest.fail("expected success");
            djstest.done();
        }, undefined, MockHttpClient);
    });

    djstest.addTest(function textHandlerSerializeBlankTest() {
        djstest.assertsExpected(1);
        MockHttpClient.clear().addRequestVerifier("uri", function (request) {
            djstest.assertAreEqual(request.body, "", "text in request");
        }).addResponse("uri", { statusCode: 200, body: "", headers: { "Content-Type": "text/plain"} });
        OData.request({ requestUri: "uri", method: "POST", data: "", headers: { "Content-Type": "text/plain"} }, function (data) {
            djstest.done();
        }, function (err) {
            djstest.fail("expected success");
            djstest.done();
        }, undefined, MockHttpClient);
    });

    // DATAJS INTERNAL START
    djstest.addTest(function handlerReadTest() {
        var tests = [
            {
                response: { headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, body: "response 0" },
                shouldHit: true,
                context: { contentType: OData.handler.contentType("application/json"), dataServiceVersion: "4.0" }
            },
            {
                response: { headers: { "Content-Type": "application/json" }, body: "response 1" },
                shouldHit: true,
                context: { contentType: OData.handler.contentType("application/json"), dataServiceVersion: "" }
            },
            {
                response: { headers: { "Content-Type": "otherMediaType" }, body: "response 2" },
                shouldHit: false,
                context: { contentType: OData.handler.contentType("otherMediaType"), dataServiceVersion: "" }
            },
            {
                response: { headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, body: "response 3" },
                shouldHit: true,
                context: { contentType: OData.handler.contentType("application/json"), dataServiceVersion: "4.0" }
            },
            {
                response: { body: "response 4" },
                shouldHit: false,
                context: { contentType: OData.handler.contentType("application/json"), dataServiceVersion: "" }
            },
            {
                response: null,
                shouldHit: false,
                context: {}
            },
            {
                response: undefined,
                shouldHit: false,
                context: {}
            }
        ];

        var i;
        var test;
        var testRead = function (handler, body, context) {
            djstest.assert(test.shouldHit, "method should be hit on item #" + i);
            djstest.assertAreEqual(handler, testHandler, "handler matches target on item #" + i);
            djstest.assertAreEqualDeep(context, test.context, "context matches target on item #" + i);
            djstest.assertAreEqual(body, test.response.body, "body matches target on item #" + i);
            return body;
        };

        var testHandler = OData.handler.handler(testRead, null, "application/json", "4.0");

        var len, expectedAssertCount = 0;
        for (i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            test.context.handler = testHandler;
            test.context.response = test.response;
            if (test.shouldHit) {
                expectedAssertCount += 4;
            }

            testHandler.read(test.response, {});
        }

        djstest.assertsExpected(expectedAssertCount);
        djstest.done();
    });

    djstest.addTest(function handlerWriteTest() {
        var tests = [
            {
                request: { headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, data: "request 0" },
                shouldHit: true,
                context: { contentType: OData.handler.contentType("application/json"), dataServiceVersion: "4.0" }
            },
            {
                request: { headers: { "Content-Type": "application/json" }, data: "request 1" },
                shouldHit: true,
                context: { contentType: OData.handler.contentType("application/json"), dataServiceVersion: undefined }
            },
            {
                request: { headers: { "Content-Type": "otherMediaType" }, data: "request 2" },
                shouldHit: false,
                context: { contentType: OData.handler.contentType("otherMediaType"), dataServiceVersion: undefined }
            },
            {
                request: { headers: {}, data: "request 3" },
                shouldHit: true,
                context: { contentType: null, dataServiceVersion: undefined }
            },
            {
                request: { headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, data: "request 4" },
                shouldHit: true,
                context: { contentType: OData.handler.contentType("application/json"), dataServiceVersion: "4.0" }
            },
            {
                request: null,
                shouldHit: false,
                context: {}
            },
            {
                request: undefined,
                shouldHit: false,
                context: {}
            }
        ];

        var test;
        var testWrite = function (handler, data, context) {
            djstest.assert(test.shouldHit, "method should be hit");
            djstest.assertAreEqual(handler, testHandler, "handler matches target");
            djstest.assertAreEqualDeep(context, test.context, "context matches target");
            djstest.assertAreEqual(data, test.request.data, "body matches target");
            return data;
        };

        var testHandler = OData.handler.handler(null, testWrite, "application/json", "4.0");

        var i, len, expectedAssertCount = 0;
        for (i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            test.context.handler = testHandler;
            test.context.request = test.request;
            if (test.shouldHit) {
                expectedAssertCount += 4;
            }
            testHandler.write(test.request);
        }

        djstest.assertsExpected(expectedAssertCount);
        djstest.done();
    });

    djstest.addTest(function handlerWriteUpdatesRequestContentTypeTest() {
        var testWrite = function (handler, data, context) {
            context.contentType = OData.handler.contentType("my new content type");
            return data;
        };

        var testHandler = OData.handler.handler(null, testWrite, "application/json", "4.0");

        var tests = [
            { request: { headers: { "Content-Type": "application/json" }, data: "request 0" }, expected: "application/json" },
            { request: { headers: {}, data: "request 1" }, expected: "my new content type" }
        ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            testHandler.write(tests[i].request);
            djstest.assertAreEqual(tests[i].request.headers["Content-Type"], tests[i].expected, "request content type is the expected");
        }
        djstest.done();
    });

    djstest.addTest(function contentTypeTest() {
        var tests = [
            { contentType: "application/json;param1=value1;param2=value2", expected: { mediaType: "application/json", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/json; param1=value1; param2=value2", expected: { mediaType: "application/json", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/json;param1=value1; param2=value2", expected: { mediaType: "application/json", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/json; param1=value1;param2=value2", expected: { mediaType: "application/json", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/json", expected: { mediaType: "application/json", properties: {}} },
            { contentType: ";param1=value1;param2=value2", expected: { mediaType: "", properties: { param1: "value1", param2: "value2"}} }
        ];

        var i, len, cTypeString;
        for (i = 0, len = tests.length; i < len; i++) {
            var actual = OData.handler.contentType(tests[i].contentType);
            djstest.assertAreEqual(actual.mediaType, tests[i].expected.mediaType, "Content type media type is parsed correctly");
            djstest.assertAreEqualDeep(actual.properties, tests[i].expected.properties, "Content type properties are parsed correctly");
        }

        djstest.assert(!OData.handler.contentType(undefined), "contentType returns undefined for undefined input");
        djstest.assert(!OData.handler.contentType(null), "contentType returns undefined for null input");

        djstest.done();
    });

    djstest.addTest(function contentTypeToStringTest() {
        var tests = [
            { contentType: { mediaType: "application/json", properties: { param1: "value1", param2: "value2"} }, expected: "application/json;param1=value1;param2=value2" },
            { contentType: { mediaType: "application/json", properties: {} }, expected: "application/json" },
            { contentType: { mediaType: "", properties: { param1: "value1", param2: "value2"} }, expected: ";param1=value1;param2=value2" }
        ];

        var i, len, cTypeString;
        for (i = 0, len = tests.length; i < len; i++) {
            cTypeString = OData.handler.contentTypeToString(tests[i].contentType);
            djstest.assertAreEqual(cTypeString, tests[i].expected, "contentTypeToString returns the correct contentType string");
        }

        djstest.done();
    });
    // DATAJS INTERNAL END
})(this);