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

var odatajs = require('./../src/index-node.js');

describe('TEST Scenarios', function() {
    describe('Metadata', function() {
        it('Metadata I', function () {

          var oHeaders = {
              'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;odata.metadata=full',
              "Odata-Version": "4.0",
              "OData-MaxVersion": "4.0",
              "Prefer": "odata.allow-entityreferences"
          };
          var metadataRequest =
          {
              headers: oHeaders,
              requestUri: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata", 
              data: null,
          };
          odatajs.oData.read(metadataRequest, metaDatasuccess, errorFunc,odatajs.oData.metadataHandler);
        });
    });

});