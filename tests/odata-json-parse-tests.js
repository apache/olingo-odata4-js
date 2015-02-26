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
    function errorFunc() {
        djstest.fail('Errror');
    }

    function runWithMetadata(metaDatasuccess) {
        var oHeaders = {
            'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;odata.metadata=full',
            "Odata-Version": "4.0",
            "OData-MaxVersion": "4.0",
            "Prefer": "odata.allow-entityreferences"
        };
        var metadataRequest =
        {
            headers: oHeaders,
            //requestUri: "http://services.odata.org/OData/OData.svc/$metadata",
            requestUri: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata", //"http://localhost:6630/PrimitiveKeys.svc/$metadata",
            data: null
        };
        odatajs.oData.read(metadataRequest, metaDatasuccess, errorFunc,odatajs.oData.metadataHandler);
    }

    djstest.addTest(function test1() {
        var checkAll = function (metadata, input, expected) {
            var info = window.odatajs.oData.json.createPayloadInfo({ "@odata.context" : input}, metadata);
            djstest.assertAreEqual(info,expected, "Test context fragment: "+ input);
        };

        var checkLastTypeName = function (metadata, input, expectedKind, expectedLastTypeName) {
            var info = window.odatajs.oData.json.createPayloadInfo({ "@odata.context" : input}, metadata);
            djstest.assertAreEqual(info.detectedPayloadKind,expectedKind, "Test context fragment: "+ input);
            djstest.assertAreEqual(info.typeName,expectedLastTypeName, "Test context fragment: "+ input);
        };

        var checkProjection = function (metadata, input, expectedKind, expectedLastTypeName, projection) {
            var info = window.odatajs.oData.json.createPayloadInfo({ "@odata.context" : input}, metadata);
            djstest.assertAreEqual(info.detectedPayloadKind,expectedKind, "Test context fragment: "+ input);
            djstest.assertAreEqual(info.typeName,expectedLastTypeName, "Test context fragment: "+ input);
            djstest.assertAreEqual(info.projection,projection, "Test context fragment: "+ input);
        };

        var checkKind = function (metadata, input, expected) {
            var info = window.odatajs.oData.json.createPayloadInfo({ "@odata.context" : input}, metadata);
            djstest.assertAreEqual(info.detectedPayloadKind,expected, "Test context fragment: "+ input);
        };

        var success = function(metadata){
            //Chapter 10.1
            checkKind(metadata, '#', 's');
            //Chapter 10.2
            checkLastTypeName(metadata, '#Foods', 'f', 'DataJS.Tests.V4.Food');
            //Chapter 10.3
            checkLastTypeName(metadata, '#Foods/$entity', 'e', 'DataJS.Tests.V4.Food');
            //Chapter 10.4
            //checkKind(metadata, '#Singleton', '');
            //Chapter 10.5
            checkLastTypeName(metadata, '#Foods/DataJS.Tests.V4.Food', 'f', 'DataJS.Tests.V4.Food');
            //Chapter 10.6
            checkLastTypeName(metadata, '#Foods/DataJS.Tests.V4.Food/$entity', 'e', 'DataJS.Tests.V4.Food');
            //Chapter 10.7
            checkProjection(metadata, '#Foods(FoodID,Name)', 'f', 'DataJS.Tests.V4.Food','FoodID,Name');
            //Chapter 10.8
            checkProjection(metadata, '#Foods(FoodID,Name)/$entity', 'e', 'DataJS.Tests.V4.Food','FoodID,Name');
            //Chapter 10.9
            checkProjection(metadata, '#Foods(FoodID,Name,Category,Category+(CategoryID,Name))', 'f', 
                'DataJS.Tests.V4.Food','FoodID,Name,Category,Category+(CategoryID,Name)');
            //Chapter 10.10
            checkProjection(metadata, '#Foods(FoodID,Name,Category,Category+(CategoryID,Name))/$entity', 'e',
                'DataJS.Tests.V4.Food','FoodID,Name,Category,Category+(CategoryID,Name)');
            //Chapter 10.11
            checkKind(metadata, '#Collection($ref)', 'erls');
            //Chapter 10.12
            checkKind(metadata, '#$ref', 'erl');
            //Chapter 10.13
            checkKind(metadata, '#Foods(0)/Packaging', 'p', 'DataJS.Tests.V4.Package');
            //Chapter 10.14
            checkKind(metadata, '#Collection(Edm.String)', 'c',  'Edm.String');
            //Chapter 10.15
            checkKind(metadata, '#Edm.String', 'v');

            checkKind(metadata, '#Edm.Null', 'v');
            //TODO add tests for delta tokens
            djstest.done();
        };

        runWithMetadata(success);
    },'test createPayloadInfo');


})(this);
