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

// odata-batch-tests.js

(function (window, undefined) {
    // DATAJS INTERNAL START
    var defaultAcceptString = "application/json;q=0.9, */*;q=0.1";

    var testPayload = {
        CategoryID : 42,
        Name: "New Category",
        ID : "odata",
        version: "4.0"
    };
    
    var jsonPayload = window.odatajs.oData.json.jsonSerializer(window.odatajs.oData.json.jsonHandler, testPayload, { "OData-Version": "4.0" });

    djstest.addTest(function writeRequestTest() {
        var request = {
            headers: { "Content-Type": "plain/text; charset=utf-8", Accept: "*/*", "OData-Version": "2.0" },
            requestUri: "http://temp.org",
            method: "GET",
            body: "test request"
        };
        var expected = "GET http://temp.org HTTP/1.1\r\n" +
                       "Content-Type: plain/text; charset=utf-8\r\n" +
                       "Accept: */*\r\n" +
                       "OData-Version: 2.0\r\n" +
                       "\r\n" +
                       "test request";

        var actual = window.odatajs.oData.batch.writeRequest(request);
        djstest.assertAreEqual(actual, expected, "WriteRequest serializes a request properly");
        djstest.done();
    });

    djstest.addTest(function serializeSimpleBatchTest() {

        var request = {
            requestUri: "http://temp.org",
            method: "POST",
            data: { __batchRequests: [
                { requestUri: "http://feed(1)", headers: {} },
                { requestUri: "http://feed(2)", headers: { "Accept": "application/json;odata.metadata=minimal" }, method: "GET" }
            ]
            }
        };

        var template = "\r\n--<batchBoundary>\r\n" +
                       "Content-Type: application/http\r\n" +
                       "Content-Transfer-Encoding: binary\r\n" +
                       "\r\n" +
                       "GET http://feed(1) HTTP/1.1\r\n" +
                       "Accept: " + defaultAcceptString + "\r\n" +
                       "OData-MaxVersion: 4.0\r\n" +
                       "\r\n" +
                       "\r\n--<batchBoundary>\r\n" +
                       "Content-Type: application/http\r\n" +
                       "Content-Transfer-Encoding: binary\r\n" +
                       "\r\n" +
                       "GET http://feed(2) HTTP/1.1\r\n" +
                       "Accept: application/json;odata.metadata=minimal\r\n" +
                       "OData-MaxVersion: 4.0\r\n" +
                       "\r\n" +
                       "\r\n--<batchBoundary>--\r\n";

        MockHttpClient.clear().addRequestVerifier(request.requestUri, function (request) {
            var cType = window.odatajs.oData.handler.contentType(request.headers["Content-Type"]);
            var boundary = cType.properties["boundary"];
            var expected = template.replace(/<batchBoundary>/g, boundary);

            djstest.assert(boundary, "Request content type has its boundary set");
            djstest.assertAreEqual(request.body, expected, "Request body is serialized properly");
            djstest.done();
        });

        odatajs.oData.request(request, null, null, window.odatajs.oData.batch.batchHandler, MockHttpClient);
    });

    djstest.addTest(function serializeComplexBatchTest() {

        var request = {
            requestUri: "http://temp.org",
            method: "POST",
            data: { __batchRequests: [
                { requestUri: "http://feed(1)", headers: {} },
                { requestUri: "http://feed(2)", headers: { "Accept": "application/json;odata.metadata=minimal" }, method: "GET" },
                { __changeRequests: [
                        { requestUri: "http://feed(1)", headers: {}, method: "POST", data: testPayload }
                        ]
                },
                { requestUri: "http://feed(1)", headers: {} }
            ]
            }
        };

        // 
        var template = "\r\n--<batchBoundary>\r\n" +
                       "Content-Type: application/http\r\n" +
                       "Content-Transfer-Encoding: binary\r\n" +
                       "\r\n" +
                       "GET http://feed(1) HTTP/1.1\r\n" +
                       "Accept: " + defaultAcceptString + "\r\n" +
                       "OData-MaxVersion: 4.0\r\n" +
                       "\r\n" +
                       "\r\n--<batchBoundary>\r\n" +
                       "Content-Type: application/http\r\n" +
                       "Content-Transfer-Encoding: binary\r\n" +
                       "\r\n" +
                       "GET http://feed(2) HTTP/1.1\r\n" +
                       "Accept: application/json;odata.metadata=minimal\r\n" +
                       "OData-MaxVersion: 4.0\r\n" +
                       "\r\n" +
                       "\r\n--<batchBoundary>\r\n" +
                       "Content-Type: multipart/mixed; boundary=<changesetBoundary>\r\n" +
                       "\r\n--<changesetBoundary>\r\n" +
                       "Content-Type: application/http\r\n" +
                       "Content-Transfer-Encoding: binary\r\n" +
                       "\r\n" +
                       "POST http://feed(1) HTTP/1.1\r\n" +
                       "Accept: " + defaultAcceptString + "\r\n" +
                       "OData-Version: 4.0\r\n" +
                       "Content-Type: application/json\r\n" +
                       "OData-MaxVersion: 4.0\r\n" +
                       "\r\n" +
                       jsonPayload +
                       "\r\n--<changesetBoundary>--\r\n" +
                       "\r\n--<batchBoundary>\r\n" +
                       "Content-Type: application/http\r\n" +
                       "Content-Transfer-Encoding: binary\r\n" +
                       "\r\n" +
                       "GET http://feed(1) HTTP/1.1\r\n" +
                       "Accept: " + defaultAcceptString + "\r\n" +
                       "OData-MaxVersion: 4.0\r\n" +
                       "\r\n" +
                       "\r\n--<batchBoundary>--\r\n";

        MockHttpClient.clear().addRequestVerifier(request.requestUri, function (request) {
            // Get the boundaries from the request.
            var start = request.body.indexOf("multipart/mixed");
            var end = request.body.indexOf("\r\n", start);

            var csetBoundary = window.odatajs.oData.handler.contentType(request.body.substring(start, end)).properties["boundary"];
            var batchBoundary = window.odatajs.oData.handler.contentType(request.headers["Content-Type"]).properties["boundary"];

            var expected = template.replace(/<batchBoundary>/g, batchBoundary);
            expected = expected.replace(/<changesetBoundary>/g, csetBoundary);

            djstest.assert(batchBoundary, "Request content type has its boundary set");
            djstest.assert(csetBoundary, "Changeset content type has its boundary set");
            djstest.assertAreEqual(request.body, expected, "Request body is serialized properly");
            djstest.done();
        });

        odatajs.oData.request(request, null, null, window.odatajs.oData.batch.batchHandler, MockHttpClient);
    });

    djstest.addTest(function serializeChangeSetTest() {
        var request = {
            requestUri: "http://temp.org",
            method: "POST",
            data: {
                __batchRequests: [
                    { __changeRequests: [
                        { requestUri: "http://feed(1)", headers: {}, method: "POST", data: testPayload }
                        ]
                    }
            ]
            }
        };

        var template = "\r\n--<batchBoundary>\r\n" +
                       "Content-Type: multipart/mixed; boundary=<changesetBoundary>\r\n" +
                       "\r\n--<changesetBoundary>\r\n" +
                       "Content-Type: application/http\r\n" +
                       "Content-Transfer-Encoding: binary\r\n" +
                       "\r\n" +
                       "POST http://feed(1) HTTP/1.1\r\n" +
                       "Accept: " + defaultAcceptString + "\r\n" +
                       "OData-Version: 4.0\r\n" +
                       "Content-Type: application/json\r\n" +
                       "OData-MaxVersion: 4.0\r\n" +
                       "\r\n" +
                       jsonPayload +
                       "\r\n--<changesetBoundary>--\r\n" +
                       "\r\n--<batchBoundary>--\r\n";

        MockHttpClient.clear().addRequestVerifier(request.requestUri, function (request) {
            // Get the boundaries from the request.
            var start = request.body.indexOf("multipart/mixed");
            var end = request.body.indexOf("\r\n", start);

            var csetBoundary = window.odatajs.oData.handler.contentType(request.body.substring(start, end)).properties["boundary"];
            var batchBoundary = window.odatajs.oData.handler.contentType(request.headers["Content-Type"]).properties["boundary"];

            var expected = template.replace(/<batchBoundary>/g, batchBoundary);
            expected = expected.replace(/<changesetBoundary>/g, csetBoundary);

            djstest.assert(batchBoundary, "Request content type has its boundary set");
            djstest.assert(csetBoundary, "Changeset content type has its boundary set");
            djstest.assertAreEqual(request.body, expected, "Request body is serialized properly");
            djstest.done();
        });

        odatajs.oData.request(request, null, null, window.odatajs.oData.batch.batchHandler, MockHttpClient);
    });

    djstest.addTest(function serializeNestedChangeSetsTest() {
        var request = {
            requestUri: "http://temp.org",
            method: "POST",
            data: testPayload
        };

        djstest.expectException(function () {
            odatajs.oData.request(request, null, null, window.odatajs.oData.batch.batchHandler);
        });

        djstest.done();
    });

    djstest.addTest(function serializeNonBatchObjectTest() {
        var request = {
            requestUri: "http://temp.org",
            method: "POST",
            data: {
                __batchRequests: [
                    { __changeRequests: [
                        { __changeRequests: [
                            { requestUri: "http://feed(2)", headers: { "Content-Type": "application/json", "OData-Version": "4.0" }, method: "PUT", data: testPayload }
                        ]
                        }
                    ]
                    }
            ]
            }
        };

        djstest.expectException(function () {
            odatajs.oData.request(request, null, null, window.odatajs.oData.batch.batchHandler);
        });

        djstest.done();
    });

    djstest.addTest(function readSimpleBatchTest() {
        var response = {
            statusCode: 202,
            statusText: "Accepted",
            headers: {
                "Content-Type": "multipart/mixed; boundary=batchresponse_b61ab173-39c7-45ea-ade4-941efae85ab9"
            },
            body: "--batchresponse_b61ab173-39c7-45ea-ade4-941efae85ab9\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 201 Created\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;odata.metadata=minimal;odata.streaming=true;IEEE754Compatible=false;charset=utf-8\r\n\
X-Content-Type-Options: nosniff\r\n\
Cache-Control: no-cache\r\n\
Location: http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(42)\r\n\
\r\n\
{\"@odata.context\":\"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Categories/$entity\",\"Icon@odata.mediaContentType\":\"image/gif\",\"CategoryID\":42,\"Name\":\"New Category\"}\r\n\
--batchresponse_b61ab173-39c7-45ea-ade4-941efae85ab9\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 201 Created\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;odata.metadata=minimal;odata.streaming=true;IEEE754Compatible=false;charset=utf-8\r\n\
X-Content-Type-Options: nosniff\r\n\
Cache-Control: no-cache\r\n\
Location: http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(43)\r\n\
\r\n\
{\"@odata.context\":\"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Categories/$entity\",\"Icon@odata.mediaContentType\":\"image/gif\",\"CategoryID\":43,\"Name\":\"New Category\"}\r\n\
--batchresponse_b61ab173-39c7-45ea-ade4-941efae85ab9--\r\n\
"
        };

        MockHttpClient.clear().addResponse("http://testuri.org", response);
        odatajs.oData.read("http://testuri.org", function (data, response) {
            djstest.assert(data.__batchResponses, "data.__batchResponses is defined");
            djstest.assertAreEqual(data.__batchResponses[0].headers["Location"], "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(42)", "part 1 of the response was read");
            djstest.assertAreEqual(data.__batchResponses[1].headers["Location"], "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(43)", "part 2 of the response was read");
            djstest.assertAreEqual(data.__batchResponses[0].data["CategoryID"], 42, "part 1 data of the response was read");
            djstest.assertAreEqual(data.__batchResponses[1].data["CategoryID"], 43, "part 2 data of the response was read");
            djstest.done();
        }, null, window.odatajs.oData.batch.batchHandler, MockHttpClient);
    });

    djstest.addTest(function readBatchWithChangesetTest() {
        var response = {
            statusCode: 202,
            statusText: "Accepted",
            headers: {
                "Content-Type": "multipart/mixed; boundary=batchresponse_fb681875-73dc-4e62-9898-a0af89021341"
            },
            body: "--batchresponse_fb681875-73dc-4e62-9898-a0af89021341\r\n\
Content-Type: multipart/mixed; boundary=changesetresponse_905a1494-fd76-4846-93f9-a3431f0bf5a2\r\n\
\r\n\
--changesetresponse_905a1494-fd76-4846-93f9-a3431f0bf5a2\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 201 OK\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;odata.metadata=minimal;odata.streaming=true;IEEE754Compatible=false;charset=utf-8\r\n\
X-Content-Type-Options: nosniff\r\n\
Cache-Control: no-cache\r\n\
Location: http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(42)\r\n\
\r\n\
{\"@odata.context\":\"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Categories/$entity\",\"Icon@odata.mediaContentType\":\"image/gif\",\"CategoryID\":42,\"Name\":\"New Category\"}\r\n\
--changesetresponse_905a1494-fd76-4846-93f9-a3431f0bf5a2\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 204 No Content\r\n\
X-Content-Type-Options: nosniff\r\n\
Cache-Control: no-cache\r\n\
OData-Version: 4.0;\r\n\
\r\n\
\r\n\
--changesetresponse_905a1494-fd76-4846-93f9-a3431f0bf5a2--\r\n\
--batchresponse_fb681875-73dc-4e62-9898-a0af89021341\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 201 Created\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;odata.metadata=minimal;odata.streaming=true;IEEE754Compatible=false;charset=utf-8\r\n\
X-Content-Type-Options: nosniff\r\n\
Cache-Control: no-cache\r\n\
Location: http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(41)\r\n\
\r\n\
{\"@odata.context\":\"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Categories/$entity\",\"Icon@odata.mediaContentType\":\"image/gif\",\"CategoryID\":41,\"Name\":\"New Category\"}\r\n\
--batchresponse_fb681875-73dc-4e62-9898-a0af89021341\r\n\
Content-Type: multipart/mixed; boundary=changesetresponse_92cc2ae8-a5f2-47fc-aaa3-1ff9e7453b07\r\n\
\r\n\
--changesetresponse_92cc2ae8-a5f2-47fc-aaa3-1ff9e7453b07\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 201 OK\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;odata.metadata=minimal;odata.streaming=true;IEEE754Compatible=false;charset=utf-8\r\n\
X-Content-Type-Options: nosniff\r\n\
Cache-Control: no-cache\r\n\
Location: http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(43)\r\n\
\r\n\
{\"@odata.context\":\"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Categories/$entity\",\"Icon@odata.mediaContentType\":\"image/gif\",\"CategoryID\":43,\"Name\":\"New Category\"}\r\n\
--changesetresponse_92cc2ae8-a5f2-47fc-aaa3-1ff9e7453b07\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 204 No Content\r\n\
X-Content-Type-Options: nosniff\r\n\
Cache-Control: no-cache\r\n\
OData-Version: 4.0;\r\n\
\r\n\
\r\n\
--changesetresponse_92cc2ae8-a5f2-47fc-aaa3-1ff9e7453b07--\r\n\
--batchresponse_fb681875-73dc-4e62-9898-a0af89021341--\r\n\
"
        };

        MockHttpClient.clear().addResponse("http://testuri.org", response);
        odatajs.oData.read("http://testuri.org", function (data, response) {

            var batchResponses = data.__batchResponses;
            djstest.assert(batchResponses, "data contains the batch responses");

            var changesetResponses = batchResponses[0].__changeResponses;
            djstest.assert(changesetResponses, "batch response 1 contains the change set responses");
            var changesetResponses3 = batchResponses[2].__changeResponses;
            djstest.assert(changesetResponses3, "batch response 3 contains the change set responses");
            
            djstest.assertAreEqual(batchResponses[0].data, undefined, "No data defined for batch response 1");
            djstest.assertAreEqual(changesetResponses[0].headers["Location"], "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(42)", "part 1 of the changeset response of the response 1 was read");
            djstest.assertAreEqual(changesetResponses[0].data["CategoryID"], 42, "part 1 data of the changeset response of the response 1 was read");
            djstest.assertAreEqual(changesetResponses[1].data, undefined, "No data defined for no content only response in part 2 of the changeset response of the response 1");
            
            djstest.assertAreEqual(batchResponses[1].headers["Location"], "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(41)", "response 2 was read");
            djstest.assertAreEqual(batchResponses[1].data["CategoryID"], 41, "response 2 data was read");
            
            djstest.assertAreEqual(batchResponses[2].data, undefined, "No data defined for");
            djstest.assertAreEqual(changesetResponses3[0].headers["Location"], "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(43)", "part 1 of the changeset response of the response 3 was read");
            djstest.assertAreEqual(changesetResponses3[0].data["CategoryID"], 43, "part 1 data of the changeset response of the response 3 was read");
            djstest.assertAreEqual(changesetResponses3[1].data, undefined, "No data defined for no content only response in part 2 of the changeset response of the response 3");
            djstest.done();
        }, null, window.odatajs.oData.batch.batchHandler, MockHttpClient);
    });

    djstest.addTest(function readBatchWithErrorPartTest() {
        var response = {
            statusCode: 202,
            statusText: "Accepted",
            headers: {
                "Content-Type": "multipart/mixed; boundary=batchresponse_9402a3ab-260f-4fa4-af01-0b30db397c8d"
            },
            body: "--batchresponse_9402a3ab-260f-4fa4-af01-0b30db397c8d\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Cache-Control: no-cache\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;charset=utf-8\r\n\
Location: http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(1)\r\n\
\r\n\
{\"error\":{\"code\":\"\",\"message\":\"Resource not found for the segment 'Categories(1)'.\"}}\r\n\
--batchresponse_9402a3ab-260f-4fa4-af01-0b30db397c8d\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 400 Bad Request\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json\r\n\
{\"error\":{\"code\":\"\",\"message\":\"Error processing request stream.'.\"}}\r\n\
--batchresponse_9402a3ab-260f-4fa4-af01-0b30db397c8d--\r\n\
"
        };

        MockHttpClient.clear().addResponse("http://testuri.org", response);
        odatajs.oData.read("http://testuri.org", function (data, response) {
            var batchResponses = data.__batchResponses;
            djstest.assert(batchResponses, "data.__batchResponses is defined");
            djstest.assertAreEqual(batchResponses.length, 2, "batch contains two responses");
            djstest.assertAreEqual(batchResponses[0].headers["Location"], "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(1)", "part 1 of the response was read");
            djstest.assert(batchResponses[1].response, "part 2 of the response was read");
            djstest.done();
        }, null, window.odatajs.oData.batch.batchHandler, MockHttpClient);
    });


    djstest.addTest(function readMalformedMultipartResponseThrowsException() {
        var response = {
            statusCode: 202,
            statusText: "Accepted",
            headers: {
                "Content-Type": "multipart/mixed; boundary=batchresponse_fb681875-73dc-4e62-9898-a0af89021341"
            },
            body: "--batchresponse_fb681875-73dc-4e62-9898-a0af89021341\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Cache-Control: no-cache\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;charset=utf-8\r\n\
Location: http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(1)\r\n\
\r\n\
{\"error\":{\"code\":\"\",\"message\":\"Resource not found for the segment 'Categories(1)'.\"}}\r\n\
--batchresponse_fb681875-73dc-4e62-9898-a0af89021341\r\n\
Content-Type: multipart/mixed; boundary=changesetresponse_2f9c6ba7-b330-4e7c-bf2a-db521996c243\r\n\
\r\n\
--changesetresponse_2f9c6ba7-b330-4e7c-bf2a-db521996c243\r\n\
Content-Type: application/http\r\n\
Content-Transfer-Encoding: binary\r\n\
\r\n\
HTTP/1.1 404 Not Found\r\n\
X-Content-Type-Options: nosniff\r\n\
OData-Version: 4.0;\r\n\
Content-Type: application/json;odata.metadata=minimal;odata.streaming=true;IEEE754Compatible=false;charset=utf-8\r\n\
\r\n\
{\"error\":{\"code\":\"\",\"message\":\GET operation cannot be specified in a change set. Only PUT, POST and DELETE operations can be specified in a change set..'.\"}}\r\n\
--changesetresponse_2f9c6ba7-b330-4e7c-bf2a-db521996c243--\r\n\
--batchresponse_fb681875-73dc-4e62-9898-a0af89021341--\r\n\
"
        };

        MockHttpClient.clear().addResponse("http://testuri.org", response);
        odatajs.oData.read("http://testuri.org", function (data, response) {
            var batchResponses = data.__batchResponses;
            djstest.assert(batchResponses, "data.__batchResponses is defined");
            djstest.assertAreEqual(batchResponses.length, 2, "batch contains two responses");
            djstest.assertAreEqual(batchResponses[0].headers["Location"], "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Categories(1)", "part 1 of the response was read");

            var error = batchResponses[1].__changeResponses[0];
            djstest.assert(error.response.body.indexOf("GET operation cannot be specified in a change set") > -1, "Response contains expected message");
            djstest.done();
        }, null, window.odatajs.oData.batch.batchHandler, MockHttpClient);
        djstest.done();
    });

    djstest.addTest(function batchRequestContextIsPushedToThePartsHandlersTest() {
        var testHandler = {
            read: function (response, context) {
                djstest.assert(context.recognizeDates, "Recognize dates was set properly on the part request context");
            },
            write: function (request, context) {
                djstest.assert(context.recognizeDates, "Recognize dates was set properly on the part request context");
            }
        };

        var batch = {
            headers: {},
            __batchRequests: [
                { requestUri: "http://someUri" },
                { __changeRequests: [
                     { requestUri: "http://someUri", method: "POST", data: { p1: 500} }
                  ]
                }
            ]
        };

        var request = { requestUri: "http://someuri", headers: {}, data: batch };
        var response = {
            statusCode: 202,
            statusText: "Accepted",
            headers: {
                "Content-Type": "multipart/mixed; boundary=batchresponse_fb681875-73dc-4e62-9898-a0af89021341"
            },
            body: '--batchresponse_fb681875-73dc-4e62-9898-a0af89021341\r\n' +
                  'Content-Type: application/http\r\n' +
                  'Content-Transfer-Encoding: binary\r\n' +
                  '\r\n' +
                  'HTTP/1.1 200 OK\r\n' +
                  'Cache-Control: no-cache\r\n' +
                  'OData-Version: 1.0;\r\n' +
                  'Content-Type: application/json\r\n' +
                  '\r\n' +
                  '{ "p1": 500 }\r\n' +
                  '\r\n' +
                  '--batchresponse_fb681875-73dc-4e62-9898-a0af89021341--\r\n'
        };

        var oldPartHandler = window.odatajs.oData.batch.batchHandler.partHandler;

        window.odatajs.oData.batch.batchHandler.partHandler = testHandler;

        window.odatajs.oData.batch.batchHandler.write(request, { recognizeDates: true });
        window.odatajs.oData.batch.batchHandler.read(response, { recognizeDates: true });

        window.odatajs.oData.batch.batchHandler.partHandler = oldPartHandler;

        djstest.done();
    });


    // DATAJS INTERNAL END
})(this);
