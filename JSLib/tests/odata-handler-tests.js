/// <reference path="../src/odata-handler.js"/>
/// <reference path="../src/odata.js"/>
/// <reference path="imports/jquery.js"/>
/// <reference path="common/djstest.js" />

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
            
            odatajs.oData.request({
                method: "PUT",
                data: testItem,
                requestUri: uri,
            }, itemUpdatedCallback);
        };

        var itemUpdatedCallback = function (data, response) {
            djstest.assertAreEqual(response.statusCode, 204, "Expecting no content on update");
            odatajs.oData.request({
                method: "DELETE",
                requestUri: uri
            }, itemDeletedCallback);
        };

        var itemDeletedCallback = function (data, response) {
            djstest.done();
        };

        $.post(serviceUri + "ResetData", function () {
            odatajs.oData.request({
                requestUri: baseUri,
                method: "POST",
                data: { CategoryID: 1001, Name: "Name #1001" }
            }, itemCreatedCallback);
        });
    });

    djstest.addTest(function errorHandlerTest() {
        djstest.assertsExpected(1);
        odatajs.oData.read("./endpoints/FoodStoreDataServiceV4.svc/Categories?$reserved-misused=true",
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
        odatajs.oData.read("textHandlerParseTest", function (data) {
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
        odatajs.oData.read("textHandlerParseTest", function (data) {
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
        odatajs.oData.request({ requestUri: "uri", method: "POST", data: "text", headers: { "Content-Type": "text/plain"} }, function (data) {
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
        odatajs.oData.request({ requestUri: "uri", method: "POST", data: "", headers: { "Content-Type": "text/plain"} }, function (data) {
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
                context: { contentType: OData.contentType("application/json"), dataServiceVersion: "4.0" }
            },
            {
                response: { headers: { "Content-Type": "application/json" }, body: "response 1" },
                shouldHit: true,
                context: { contentType: OData.contentType("application/json"), dataServiceVersion: "" }
            },
            {
                response: { headers: { "Content-Type": "otherMediaType" }, body: "response 2" },
                shouldHit: false,
                context: { contentType: OData.contentType("otherMediaType"), dataServiceVersion: "" }
            },
            {
                response: { headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, body: "response 3" },
                shouldHit: true,
                context: { contentType: OData.contentType("application/json"), dataServiceVersion: "4.0" }
            },
            {
                response: { body: "response 4" },
                shouldHit: false,
                context: { contentType: OData.contentType("application/json"), dataServiceVersion: "" }
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

        var testHandler = OData.handler(testRead, null, "application/json", "4.0");

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
                context: { contentType: OData.contentType("application/json"), dataServiceVersion: "4.0" }
            },
            {
                request: { headers: { "Content-Type": "application/json" }, data: "request 1" },
                shouldHit: true,
                context: { contentType: OData.contentType("application/json"), dataServiceVersion: undefined }
            },
            {
                request: { headers: { "Content-Type": "otherMediaType" }, data: "request 2" },
                shouldHit: false,
                context: { contentType: OData.contentType("otherMediaType"), dataServiceVersion: undefined }
            },
            {
                request: { headers: {}, data: "request 3" },
                shouldHit: true,
                context: { contentType: null, dataServiceVersion: undefined }
            },
            {
                request: { headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, data: "request 4" },
                shouldHit: true,
                context: { contentType: OData.contentType("application/json"), dataServiceVersion: "4.0" }
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

        var testHandler = OData.handler(null, testWrite, "application/json", "4.0");

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
            context.contentType = OData.contentType("my new content type");
            return data;
        };

        var testHandler = OData.handler(null, testWrite, "application/json", "4.0");

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
            { contentType: "application/atom+xml;param1=value1;param2=value2", expected: { mediaType: "application/atom+xml", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/atom+xml; param1=value1; param2=value2", expected: { mediaType: "application/atom+xml", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/atom+xml;param1=value1; param2=value2", expected: { mediaType: "application/atom+xml", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/atom+xml; param1=value1;param2=value2", expected: { mediaType: "application/atom+xml", properties: { param1: "value1", param2: "value2"}} },
            { contentType: "application/atom+xml", expected: { mediaType: "application/atom+xml", properties: {}} },
            { contentType: ";param1=value1;param2=value2", expected: { mediaType: "", properties: { param1: "value1", param2: "value2"}} }
        ];

        var i, len, cTypeString;
        for (i = 0, len = tests.length; i < len; i++) {
            var actual = OData.contentType(tests[i].contentType);
            djstest.assertAreEqual(actual.mediaType, tests[i].expected.mediaType, "Content type media type is parsed correctly");
            djstest.assertAreEqualDeep(actual.properties, tests[i].expected.properties, "Content type properties are parsed correctly");
        }

        djstest.assert(!window.odatajs.oData.contentType(undefined), "contentType returns undefined for undefined input");
        djstest.assert(!window.odatajs.oData.contentType(null), "contentType returns undefined for null input");

        djstest.done();
    });

    djstest.addTest(function contentTypeToStringTest() {
        var tests = [
            { contentType: { mediaType: "application/atom+xml", properties: { param1: "value1", param2: "value2"} }, expected: "application/atom+xml;param1=value1;param2=value2" },
            { contentType: { mediaType: "application/atom+xml", properties: {} }, expected: "application/atom+xml" },
            { contentType: { mediaType: "", properties: { param1: "value1", param2: "value2"} }, expected: ";param1=value1;param2=value2" }
        ];

        var i, len, cTypeString;
        for (i = 0, len = tests.length; i < len; i++) {
            cTypeString = OData.contentTypeToString(tests[i].contentType);
            djstest.assertAreEqual(cTypeString, tests[i].expected, "contentTypeToString returns the correct contentType string");
        }

        djstest.done();
    });
    // DATAJS INTERNAL END
})(this);