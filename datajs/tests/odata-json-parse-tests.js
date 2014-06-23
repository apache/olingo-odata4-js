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
            data: null,
        };
        OData.read(metadataRequest, metaDatasuccess, errorFunc,OData.metadataHandler);
    };

    djstest.addTest(function test1() {
        var checkLastTypeName = function (metadata, input, expected) {
            var info = OData.jsonLight.jsonLightPayloadInfo({ "@odata.context" : input}, metadata)
            djstest.assertAreEqual(info.lastTypeName,expected, "Test context fragment: "+ input);

        };

        var checkKind = function (metadata, input, expected) {
            var info = OData.jsonLight.jsonLightPayloadInfo({ "@odata.context" : input}, metadata)
            djstest.assertAreEqual(info.detectedPayloadKind,expected, "Test context fragment: "+ input);
        };
        var success = function(metadata){
            //Chapter 10.1
            checkKind(metadata, '#', 's');
            //Chapter 10.2
            checkKind(metadata, '#Foods', 'f');
            //Chapter 10.3
            checkKind(metadata, '#Foods/$entity', 'e');
            //Chapter 10.4
            //checkKind(metadata, '#Singleton', '');
            //Chapter 10.5
            checkKind(metadata, '#Foods/DataJS.Tests.V4.Food', 'f');
            //Chapter 10.6
            checkKind(metadata, '#Foods/DataJS.Tests.V4.Food/$entity', 'e');
            //Chapter 10.7
            checkKind(metadata, '#Foods(FoodID,Name)', 'f');
            //Chapter 10.8
            checkKind(metadata, '#Foods(FoodID,Name)/$entity', 'e');
            //Chapter 10.9
            checkKind(metadata, '#Foods(FoodID,Name,Category,Category+(CategoryID,Name))', 'f');
            //Chapter 10.10
            checkKind(metadata, '#Foods(FoodID,Name,Category,Category+(CategoryID,Name))/$entity', 'e');
            //Chapter 10.11
            checkKind(metadata, '#Collection($ref)', 'erls');
            //Chapter 10.12
            checkKind(metadata, '#$ref', 'erl');
            //Chapter 10.13
            checkKind(metadata, '#Foods(0)/Packaging', 'p');
            //Chapter 10.14
            checkKind(metadata, '#Collection(Edm.String)', 'c');
            //Chapter 10.15
            checkKind(metadata, '#Edm.String', 'v');
            //TODO add tests for delta tokens



            checkLastTypeName(metadata, '#Foods', 'DataJS.Tests.V4.Food');
            djstest.done();
        };

        runWithMetadata(success);
    },'simple');


})(this);
