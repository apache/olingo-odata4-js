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

// odata-net-tests.js
(function (window, undefined) {
    module("Unit");
    djstest.addTest(function httpClientSendRequestTest() {
        var tests = [
            { url: "http://localhost/test1", response: { headers: {}, status: 200, body: "test"} },
            { url: "http://localhost/test2", response: { headers: {}, status: 204, body: "test"} },
            { url: "http://localhost/test3", response: { headers: {}, status: 299, body: "test"} },
            { url: "http://localhost/test4", response: { headers: {}, status: 500, body: "error"} }
        ];

        djstest.assertsExpected(12);

        var sentCount = 0;
        MockXMLHttpRequest.onAfterSend = function () {
            sentCount++;
        };

        var oldXmlHttpRequest = window.XMLHttpRequest;
        var oldEnableJsonpCallback = window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback;
        try {
            window.XMLHttpRequest = MockXMLHttpRequest.XMLHttpRequest;
            var i, len;
            for (i = 0, len = tests.length; i < len; i++) {
                MockXMLHttpRequest.addResponse(tests[i].url, tests[i].response);

                window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = false;
                //Need a closure to capture the current test being executed. 
                (function (test) {
                    window.odatajs.oData.net.defaultHttpClient.request(
                    { requestUri: test.url, headers: {} },
                    function (response) {
                        djstest.assert(response.statusCode >= 200 & response.statusCode <= 299, "response status is in the success range");
                        djstest.assertAreEqual(response.body, test.response.body, "response body is the expected one");
                        djstest.assertAreEqualDeep(response.headers, [], "response headers are the expected ones");
                    },
                    function (error) {
                        djstest.assert(error.response.statusCode > 299, "response status is in the error range");
                        djstest.assertAreEqual(error.response.body, test.response.body, "response body is the expected one");
                        djstest.assertAreEqualDeep(error.response.headers, [], "response headers are the expected ones");
                    });
                })(tests[i]);
            }
        }
        finally {
            //Cleanup and finish the test after all requests have been sent and processed. Poll every 50 ms
            var timer = setInterval(function () {
                if (sentCount === tests.length) {
                    clearInterval(timer);
                    window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = oldEnableJsonpCallback;
                    window.XMLHttpRequest = oldXmlHttpRequest;
                    MockXMLHttpRequest.reset();
                    djstest.done();
                }
            }, 50);
        }
    });

    djstest.addTest(function httpClientRequestTimeoutTest() {
        var oldXmlHttpRequest = window.XMLHttpRequest;
        var testDone = false;

        djstest.assertsExpected(1);

        var oldEnableJsonpCallback = window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback;
        try {
            window.XMLHttpRequest = MockXMLHttpRequest.XMLHttpRequest;
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = false;

            window.odatajs.oData.net.defaultHttpClient.request(
               { requestUri: "http://test1", timeoutMS: 10, headers: { MockTimeOut: true} },
               function (response) {
                   djstest.fail("success method was hit when not expected");
                   testDone = true;
               },
               function (error) {
                   djstest.assertAreEqual(error.message, "Request timed out", "error method executes and error is the expected one");
                   testDone = true;
               });
        }
        finally {
            //Cleanup and finish the test after all requests have been sent and processed. Poll every 50 ms
            var timer = setInterval(function () {
                if (testDone) {
                    clearInterval(timer);
                    window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = oldEnableJsonpCallback;
                    window.XMLHttpRequest = oldXmlHttpRequest;
                    MockXMLHttpRequest.reset();
                    djstest.done();
                }
            }, 50);
        }
    });

    djstest.addTest(function httpClientRequestAbortTest() {

        var oldXmlHttpRequest = window.XMLHttpRequest;

        djstest.assertsExpected(1);

        var oldEnableJsonpCallback = window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback;
        try {
            window.XMLHttpRequest = MockXMLHttpRequest.XMLHttpRequest;
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = false;

            var result = window.odatajs.oData.net.defaultHttpClient.request(
               { requestUri: "http://test1", headers: { MockNoOp: true} },
               function (response) {
                   djstest.fail("success method was hit when not expected");
               },
               function (error) {
                   djstest.assertAreEqual(error.message, "Request aborted", "error method executes and error is the expected one");
               });

            result.abort();
        }
        finally {
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = oldEnableJsonpCallback;
            window.XMLHttpRequest = oldXmlHttpRequest;
            MockXMLHttpRequest.reset();
            djstest.done();
        }
    });

    djstest.addTest(function httpClientRequestAbortOnCompletedRequestTest() {

        var oldXmlHttpRequest = window.XMLHttpRequest;
        var testDone = false;

        djstest.assertsExpected(1);

        var oldEnableJsonpCallback = window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback;
        try {
            window.XMLHttpRequest = MockXMLHttpRequest.XMLHttpRequest;
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = false;

            MockXMLHttpRequest.addResponse("http://test1", { headers: {}, status: 200, body: "test body" });

            MockXMLHttpRequest.onAfterSend = function () {
                result.abort();
                testDone = true;
            };

            var result = window.odatajs.oData.net.defaultHttpClient.request(
               { requestUri: "http://test1", headers: {} },
               function (response) {
                   djstest.pass("success method was hit");
               },
               function (error) {
                   djstest.fail("success method was hit when not expected - [" + error.message + "]");
               });
        }
        finally {
            // Cleanup after test is done, poll eavery 50ms
            var timer = setInterval(function () {
                if (testDone) {
                    clearInterval(timer);
                    window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = oldEnableJsonpCallback;
                    window.XMLHttpRequest = oldXmlHttpRequest;
                    MockXMLHttpRequest.reset();
                    djstest.done();
                }
            }, 50);
        }
    });

    djstest.addTest(function httpClientRequestSendsRequestCorrectlyTest() {
        var tests = [
            {
                request: { requestUri: "http://test1", headers: {}, body: "test" },
                expected: { headers: {}, url: "http://test1", method: "GET", body: "test", async: true, user: undefined, password: undefined }
            },
            {
                request: { requestUri: "http://test2", headers: {}, method: "POST", body: "test" },
                expected: { headers: {}, url: "http://test2", method: "POST", body: "test", async: true, user: undefined, password: undefined }
            },
            {
                request: { requestUri: "http://test3", headers: { header1: "value1", header2: "value2" }, body: "test" },
                expected: { headers: { header1: "value1", header2: "value2" }, url: "http://test3", method: "GET", body: "test", async: true, user: undefined, password: undefined }
            }
        ];

        var oldXmlHttpRequest = window.XMLHttpRequest;
        var oldEnableJsonpCallback = window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback;
        try {
            window.XMLHttpRequest = MockXMLHttpRequest.XMLHttpRequest;
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = false;
            var i, len;

            for (i = 0, len = tests.length; i < len; i++) {

                MockXMLHttpRequest.addRequestVerifier(tests[i].request.requestUri, function (request) {
                    djstest.assertAreEqualDeep(request, tests[i].expected, "request matches target");
                });

                window.odatajs.oData.net.defaultHttpClient.request(
                    tests[i].request,
                    function (response) { });
            }
        }
        finally {
            // Restore original values.
            window.odatajs.oData.net.defaultHttpClient.enableJsonpCallback = oldEnableJsonpCallback;
            window.XMLHttpRequest = oldXmlHttpRequest;
        }
        djstest.done();
    });

    // DATAJS INTERNAL START
    djstest.addTest(function canUseJSONPTest() {
        var tests = [
            { pass: true, input: {} },
            { pass: true, input: { method: "GET"} },
            { pass: false, input: { method: "PUT"} },
            { pass: false, input: { method: "get"} },
            { pass: true, input: { accept: "*/*"} },
            { pass: true, input: { accept: "application/json"} },
            { pass: true, input: { accept: "text/javascript"} },
            { pass: true, input: { accept: "application/javascript"} },
            { pass: true, input: { accept: "application/xml"} },
            { pass: true, input: { headers: { Accept: "application/xml"}} }
        ];
        for (var i = 0; i < tests.length; i++) {
            var actual = window.odatajs.oData.net.canUseJSONP(tests[i].input);
            djstest.assert(actual === tests[i].pass, "test " + i + " didn't actually match pass (" + tests[i].pass + ")");
        }
        djstest.done();
    });

    djstest.addTest(function isAbsoluteUrlTest() {
        djstest.assert(window.odatajs.oData.net.isAbsoluteUrl("http://something/"));
        djstest.assert(window.odatajs.oData.net.isAbsoluteUrl("http://malformed url/"));
        djstest.assert(window.odatajs.oData.net.isAbsoluteUrl("https://localhost/"));
        djstest.assert(window.odatajs.oData.net.isAbsoluteUrl("file://another-protocol/"));
        djstest.assert(!window.odatajs.oData.net.isAbsoluteUrl("/path"));
        djstest.assert(!window.odatajs.oData.net.isAbsoluteUrl("?query-string"));
        djstest.assert(!window.odatajs.oData.net.isAbsoluteUrl(""));
        djstest.assert(!window.odatajs.oData.net.isAbsoluteUrl("mailto:someone"));
        djstest.done();
    });

    djstest.addTest(function isLocalUrlTest() {
        var thisUrl = window.location.href;
        var localUrls = [
            "", ".", "/howdy.htm", "  ", "?queryparam",
            thisUrl, thisUrl + "/foo", thisUrl + "?something-else"
        ];
        var remoteUrls = [
            "http://www.microsoft.com/",
            "https://www.microsoft.com/",
            "https://" + window.location.host,
            "https://" + window.location.hostname,
        // 21 is FTP, so the test shouldn't collide
            "http://" + window.location.hostname + ":21"
        ];
        var i, len;
        for (i = 0, len = localUrls.length; i < len; i++) {
            djstest.assert(window.odatajs.oData.net.isLocalUrl(localUrls[i]), "is local: [" + localUrls[i] + "]");
        }
        for (i = 0, len = remoteUrls.length; i < len; i++) {
            djstest.assert(!window.odatajs.oData.net.isLocalUrl(remoteUrls[i]), "is not local: [" + remoteUrls[i] + "]");
        }
        djstest.done();
    });

    // DATAJS INTERNAL END

    djstest.addTest(function userPasswordTest() {
        odatajs.oData.request({
            requestUri: "./endpoints/FoodStoreDataServiceV4.svc/UserNameAndPassword",
            user: "the-user",
            password: "the-password"
        }, function (data) {
            djstest.assertAreEqualDeep(data.value, "Basic dGhlLXVzZXI6dGhlLXBhc3N3b3Jk", "response matches");
            djstest.done();
        }, function (err) {
            djstest.fail("error: " + err.message);
            djstest.done();
        });
    });

})(this);
