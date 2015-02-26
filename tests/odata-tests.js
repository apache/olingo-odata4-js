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

// odata-tests.js
(function (window, undefined) {
    var northwindService = "http://services.odata.org/Northwind/Northwind.svc/";
    var localFeed = "./endpoints/FoodStoreDataService.svc/Foods";
    var northwindFeed = northwindService + "Suppliers";

    /** Count the number of IFRAMES in the page
     * @returns {Number} The number of IFRAMES
     */
    var countIFrames = function () {

        return document.getElementsByTagName("IFRAME").length;
    };

    module("Unit");

    var originalEnableJsonpCallback = OData.defaultHttpClient.enableJsonpCallback;

    /** Restores OData.defaultHttpClient.enableJsonpCallback to the library default.
     */
    var restoreJsonpCallback = function () {
        OData.defaultHttpClient.enableJsonpCallback = originalEnableJsonpCallback;
    };

    djstest.addTest(function checkApiTest() {
        var internals = window.odatajs.oData.canUseJSONP !== undefined;
        if (internals) {
            // Don't even bother - there is a very long list for inter-module communication.
            // {targetName: "OData", names: "..." }
            djstest.pass("Do not test public api's when internals are visible");
        } else {
            var apis = [
                { targetName: "datajs", names: "createDataCache,createStore,defaultStoreMechanism" },
                { targetName: "OData", names: "batchHandler,defaultError,defaultHandler,defaultHttpClient,defaultMetadata,defaultSuccess,jsonHandler,metadataHandler,read,request,textHandler,xmlHandler,parseMetadata" }
            ];

            for (var i = 0; i < apis.length; i++) {
                var target = window[apis[i].targetName];

                var actuals = [];
                for (var actual in target) {
                    actuals.push(actual);
                }

                actuals.sort();

                var names = apis[i].names.split(",");
                names.sort();

                djstest.assertAreEqual(actuals.join(), names.join(), "actual names for " + apis[i].targetName);
            }
        }

        djstest.done();
    });

    djstest.addTest(function simpleLocalReadTest() {
        odatajs.oData.read(localFeed, function (data, request) {
            djstest.assert(data !== null, "data !== null");
            djstest.assert(request !== null, "request !== null");
            djstest.done();
        });
    });

    djstest.addTest(function simpleLocalReadWithRequestTest() {
        odatajs.oData.read({ requestUri: localFeed, headers: { Accept: "application/json"} }, function (data, response) {
            djstest.assert(data !== null, "data !== null");
            djstest.assert(response !== null, "response !== null");
            djstest.assertAreEqual(data, response.data, "data === response.data");

            // Typically application/json;charset=utf-8, but browser may change the request charset (and thus response).
            var contentType = response.headers["Content-Type"];
            contentType = contentType.split(';')[0];
            djstest.assertAreEqual(contentType, "application/json", 'contentType === "application/json"');
            djstest.done();
        });
    });

    djstest.addTest(function simpleReadTest() {
        var oldEnableJsonpCallback = OData.defaultHttpClient.enableJsonpCallback;
        OData.defaultHttpClient.enableJsonpCallback = true;

        var iframesBefore = countIFrames();
        odatajs.oData.read(northwindService + "Regions", function (data, request) {
            djstest.assert(data !== null, "data !== null");
            djstest.assert(request !== null, "request !== null");

            // IFRAME recycling does not work in Opera because as soon as the IFRAME is added to the body, all variables
            // go out of scope
            if (!window.opera) {
                djstest.assertAreEqual(countIFrames() - iframesBefore, 0, "extra IFRAMEs (baseline: " + iframesBefore + ")");
            }

            OData.defaultHttpClient.enableJsonpCallback = oldEnableJsonpCallback;
            djstest.done();
        });
    });

    djstest.addTest(function simpleReadWithParamsTest() {
        OData.defaultHttpClient.enableJsonpCallback = true;
        odatajs.oData.read(northwindFeed + "?$top=3", function (data, request) {
            djstest.assert(data !== null, "data !== null");
            djstest.assert(request !== null, "request !== null");
            restoreJsonpCallback();
            djstest.done();
        }, djstest.failAndDoneCallback("Unable to read from " + northwindFeed, restoreJsonpCallback));
    });

    djstest.addTest(function simpleReadWithNoParamsTest() {
        OData.defaultHttpClient.enableJsonpCallback = true;
        odatajs.oData.read(northwindFeed + "?", function (data, request) {
            djstest.assert(data !== null, "data !== null");
            djstest.assert(request !== null, "request !== null");
            restoreJsonpCallback();
            djstest.done();
        }, djstest.failAndDoneCallback("Unable to read from " + northwindFeed, restoreJsonpCallback));
    });

    djstest.addTest(function jsonpTimeoutTest() {
        // Verifies that JSONP will timeout, and that the
        // enableJsonpCallback flag can be set on the request itself.
        var iframesBefore = countIFrames();
        odatajs.oData.request({
            requestUri: northwindFeed + "?$fail=true",
            timeoutMS: 100,
            enableJsonpCallback: true
        }, function (data, request) {
            djstest.fail("expected an error callback");
            djstest.done();
        }, function (err) {
            djstest.assert(err.message.indexOf("timeout") !== 1, "err.message[" + err.message + "].indexOf('timeout') !== 1");
            djstest.assertAreEqual(countIFrames() - iframesBefore, 0, "extra script tags (baseline: " + iframesBefore + ")");
            djstest.done();
        });
    });

    djstest.addTest(function requestDefaultsTest() {
        // Save current defaults.
        var oldError = OData.defaultError;
        var oldSuccess = OData.defaultSuccess;
        var oldDefaultHandler = OData.defaultHandler;
        var oldHttpClient = OData.defaultHttpClient;

        OData.defaultSuccess = function (data, response) {
            djstest.assertAreEqual(response.statusCode, 299, "success method reached when expected");
        };

        OData.defaultError = function (error) {
            var response = error.response;
            djstest.assertAreEqual(response.statusCode, 500, "error method reached when expected");
        };

        OData.defaultHandler = {
            read: function (response) {
                djstest.assertAreEqual(response.statusCode, 299, "default handler read method reached when expected");
            },
            accept: "test accept string"
        };

        OData.defaultHttpClient = MockHttpClient.clear();

        var testUris = [
            "requestDefaultsTest/request",
            "requestDefaultsTest/request1",
            "requestDefaultsTest/error"
        ];

        MockHttpClient.addRequestVerifier(testUris[0], function (request) {
            djstest.assertAreEqual(request.method, "GET", "request.method is GET");
            djstest.assert(request.headers, "request.headers is defined and not null");
            djstest.assertAreEqual(request.headers.Accept, "test accept string");
        });

        MockHttpClient.addResponse(testUris[1], { statusCode: 299, body: "test response" });
        MockHttpClient.addResponse(testUris[2], { statusCode: 500, body: "error response" });

        try {
            var i, len;
            for (i = 0, len = testUris.length; i < len; i++) {
                odatajs.oData.request({ requestUri: testUris[i] });
            }
        }
        finally {
            // Restore defaults.
            OData.defaultError = oldError;
            OData.defaultSuccess = oldSuccess;
            OData.defaultHandler = oldDefaultHandler;
            OData.defaultHttpClient = oldHttpClient;
        }

        djstest.assertsExpected(6);
        djstest.done();
    });

    djstest.addTest(function requestUpdateTest() {
        // Save current defaults.
        var testHandler = {
            read: function (response) {
                response.data = response.body;
            },
            write: function (request) {
                djstest.assertAreEqual(request.method, "POST", "handler write method, request has the correct method");
            }
        };

        var testSuccess = function (data, response) {
            djstest.assertAreEqual(data, "test response", "success callback has the correct data");
            djstest.assertAreEqual(response.status, 200, "success method reached when expected");
        };

        var testError = function (error) {
            var response = error.response;
            djstest.assertAreEqual(response.status, 500, "error method reached when expected");
        };

        MockHttpClient.addResponse("requestUpdateTest", { status: 200, body: "test response" });
        MockHttpClient.addResponse("requestUpdateTest", { status: 500, body: "error response" });

        odatajs.oData.request({ requestUri: "requestUpdateTest", method: "POST" }, testSuccess, testError, testHandler, MockHttpClient);

        djstest.done();
    });

    djstest.addTest(function parseMetadataTest() {
        var metadata = '<?xml version="1.0" encoding="utf-8"?>' +
            '<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">' +
            '<edmx:DataServices m:DataServiceVersion="4.0" m:MaxDataServiceVersion="4.0" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">' +
            '<Schema Namespace="ODataDemo" xmlns="http://schemas.microsoft.com/ado/2009/11/edm">' +
                '<EntityType Name="Product">' +
                    '<Key><PropertyRef Name="ID" /></Key>' +
                    '<Property Name="ID" Type="Edm.Int32" Nullable="false" />' +
                    '<Property Name="Name" Type="Edm.String" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="false" />' +
                    '<Property Name="Description" Type="Edm.String" m:FC_TargetPath="SyndicationSummary" m:FC_ContentKind="text" m:FC_KeepInContent="false" />' +
                    '<Property Name="ReleaseDate" Type="Edm.DateTime" Nullable="false" />' +
                    '<Property Name="DiscontinuedDate" Type="Edm.DateTime" />' +
                    '<Property Name="Rating" Type="Edm.Int32" Nullable="false" />' +
                    '<Property Name="Price" Type="Edm.Decimal" Nullable="false" />' +
                    '<NavigationProperty Name="Category" Relationship="ODataDemo.Product_Category_Category_Products" ToRole="Category_Products" FromRole="Product_Category" />' +
                '</EntityType>' +
                '<EntityType Name="Category">' +
                    '<Key>' +
                        '<PropertyRef Name="ID" />' +
                    '</Key>' +
                    '<Property Name="ID" Type="Edm.Int32" Nullable="false" />' +
                    '<Property Name="Name" Type="Edm.String" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="true" />' +
                    '<NavigationProperty Name="Products" Relationship="ODataDemo.Product_Category_Category_Products" ToRole="Product_Category" FromRole="Category_Products" />' +
                '</EntityType>' +
                '<Association Name="Product_Category_Category_Products"><End Type="ODataDemo.Category" Role="Category_Products" Multiplicity="0..1" />' +
                    '<End Type="ODataDemo.Product" Role="Product_Category" Multiplicity="*" />' +
                '</Association>' +
                '<EntityContainer Name="DemoService" m:IsDefaultEntityContainer="true">' +
                    '<EntitySet Name="Products" EntityType="ODataDemo.Product" />' +
                    '<EntitySet Name="Categories" EntityType="ODataDemo.Category" />' +
                    '<FunctionImport Name="Discount" IsBindable="true" m:IsAlwaysBindable="true">' +
                        '<Parameter Name="product" Type="ODataDemo.Product" />' +
                        '<Parameter Name="discountPercentage" Type="Edm.Int32" Nullable="false" />' +
                    '</FunctionImport>' +
                    '<AssociationSet Name="Products_Category_Categories" Association="ODataDemo.Product_Category_Category_Products">' +
                        '<End Role="Product_Category" EntitySet="Products" />' +
                        '<End Role="Category_Products" EntitySet="Categories" />' +
                    '</AssociationSet>' +
                '</EntityContainer>' +
             '</Schema></edmx:DataServices></edmx:Edmx>';

        var parsedMetadata = OData.parseMetadata(metadata);
        var expected =
        {
            "version": "1.0",
            "dataServices":
            {
                "maxDataServiceVersion": "4.0",
                "dataServiceVersion": "4.0",
                "schema": [
                    {
                        "namespace": "ODataDemo",
                        "entityType": [
                            {
                                "name": "Product",
                                "key": { "propertyRef": [{ "name": "ID"}] },
                                "property": [
                                    { "name": "ID", "nullable": "false", "type": "Edm.Int32" },
                                    { "name": "Name", "type": "Edm.String", "FC_KeepInContent": "false", "FC_ContentKind": "text", "FC_TargetPath": "SyndicationTitle" },
                                    { "name": "Description", "type": "Edm.String", "FC_KeepInContent": "false", "FC_ContentKind": "text", "FC_TargetPath": "SyndicationSummary" },
                                    { "name": "ReleaseDate", "nullable": "false", "type": "Edm.DateTime" }, { "name": "DiscontinuedDate", "type": "Edm.DateTime" },
                                    { "name": "Rating", "nullable": "false", "type": "Edm.Int32" }, { "name": "Price", "nullable": "false", "type": "Edm.Decimal"}],
                                "navigationProperty": [
                                    { "name": "Category", "fromRole": "Product_Category", "toRole": "Category_Products", "relationship": "ODataDemo.Product_Category_Category_Products" }
                                ]
                            }, {
                                "name": "Category",
                                "key": { "propertyRef": [{ "name": "ID"}] },
                                "property": [{ "name": "ID", "nullable": "false", "type": "Edm.Int32" }, { "name": "Name", "type": "Edm.String", "FC_KeepInContent": "true", "FC_ContentKind": "text", "FC_TargetPath": "SyndicationTitle"}],
                                "navigationProperty": [{ "name": "Products", "fromRole": "Category_Products", "toRole": "Product_Category", "relationship": "ODataDemo.Product_Category_Category_Products"}]
                            }],
                        "association": [{ "name": "Product_Category_Category_Products", "end": [{ "type": "ODataDemo.Category", "multiplicity": "0..1", "role": "Category_Products" }, { "type": "ODataDemo.Product", "multiplicity": "*", "role": "Product_Category"}]}],
                        "entityContainer": [{ "name": "DemoService", "isDefaultEntityContainer": "true", "entitySet": [{ "name": "Products", "entityType": "ODataDemo.Product" }, { "name": "Categories", "entityType": "ODataDemo.Category"}], "functionImport": [{ "name": "Discount", "isAlwaysBindable": "true", "isBindable": "true", "parameter": [{ "name": "product", "type": "ODataDemo.Product" }, { "name": "discountPercentage", "nullable": "false", "type": "Edm.Int32"}]}], "associationSet": [{ "name": "Products_Category_Categories", "association": "ODataDemo.Product_Category_Category_Products", "end": [{ "role": "Product_Category", "entitySet": "Products" }, { "role": "Category_Products", "entitySet": "Categories"}]}]}]
                    }]
            }
        };
        djstest.assertAreEqualDeep(expected, parsedMetadata, "metadata should be parsed to datajs format");
        djstest.done();
    });

})(this);
