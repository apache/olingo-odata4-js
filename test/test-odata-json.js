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
'use strict';

var odatajs = require('./../index.js');
var chai = require('chai');
var assert = chai.assert;

var callTest_None = function (testData, context) {
    var testData = testData;
    var context = {
        response: {requestUri: testData.usedUrl},
        contentType: {properties: {"odata.metadata": 'none'}},
        dataServiceVersion: "4.0"
    };
    it(testData.description, function () {
        var actual = odatajs.oData.json.jsonParser(
            odatajs.oData.json.jsonHandler,
            testData.input,
            context);
        assert.deepEqual(actual, testData.expected, "test '" + testData.description + "' didn't return the expected data");
    });
};

var callTest_Minimal = function (testData, context) {
    var testData = testData;
    var context = {
        response: {requestUri: testData.usedUrl},
        contentType: {properties: {"odata.metadata": 'minimal'}},
        dataServiceVersion: "4.0"
    };
    it(testData.description, function () {
        var actual = odatajs.oData.json.jsonParser(
            odatajs.oData.json.jsonHandler,
            testData.input,
            context);
        assert.deepEqual(actual, testData.expected, "test '" + testData.description + "' didn't return the expected data");
    });
};
var callTest_MinimalToFull = function (testData, context) {
    var testData = testData;
    var context = {
        response: {requestUri: testData.usedUrl},
        contentType: {properties: {"odata.metadata": 'minimal'}},
        dataServiceVersion: "4.0",
        metadata: testDataJsonParserMetadataMinimalToFullMetaData
    };
    it(testData.description, function () {
        var actual = odatajs.oData.json.jsonParser(
            odatajs.oData.json.jsonHandler,
            testData.input,
            context);
        assert.deepEqual(actual, testData.expected, "test '" + testData.description + "' didn't return the expected data");
    });
};

var callTest_Full = function (testData, context) {
    var testData = testData;
    var context = {
        response: {requestUri: testData.usedUrl},
        contentType: {properties: {"odata.metadata": 'full'}},
        dataServiceVersion: "4.0"
    };
    it(testData.description, function () {
        var actual = odatajs.oData.json.jsonParser(
            odatajs.oData.json.jsonHandler,
            testData.input,
            context);
        assert.deepEqual(actual, testData.expected, "test '" + testData.description + "' didn't return the expected data");
    });
};

var testDataJsonParserMetadataNone = [{
    description: "Feed with metadata=none",
    header: "application/json;odata.metadata=none",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods",
    input: '{"value":[{"FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams":3,"FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight":10,"AvailableUnits":1,"Packaging":{"Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"Length":2,"Height":1,"Width":3,"Volume":6.0},"AlternativeNames":["ground cereal","ground grain"],"Providers":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}],"SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}},{"FoodID":1,"Name":"sugar","UnitPrice":0.2,"ServingSize":1,"MeasurementUnit":"tsp","ProteinGrams":0,"FatGrams":0,"CarbohydrateGrams":4,"CaloriesPerServing":16,"IsAvailable":false,"ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID":"ffffffff-ffff-ffff-ffff-ffffffffffff","Weight":0.1,"AvailableUnits":0,"Packaging":{"Type":" ","Color":"BLUE","NumberPerPackage":-2147483648,"RequiresRefridgeration":true,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":-79228162514264337593543950335,"Height":-32768,"Width":-9223372036854775808,"Volume":-1.7976931348623157E+308}},"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"FoodID":2,"Name":"1 Chicken Egg","UnitPrice":0.55,"ServingSize":1,"MeasurementUnit":null,"ProteinGrams":6,"FatGrams":1,"CarbohydrateGrams":1,"CaloriesPerServing":70,"IsAvailable":true,"ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID":"00000000-0000-0000-0000-000000000000","Weight":0,"AvailableUnits":-128,"Packaging":{"Type":"18     - Carton","Color":" brown ","NumberPerPackage":0,"RequiresRefridgeration":true,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":null},"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"FoodID":3,"Name":"Brown Sugar","UnitPrice":1.6,"ServingSize":1,"MeasurementUnit":"TSP.","ProteinGrams":0,"FatGrams":0,"CarbohydrateGrams":5,"CaloriesPerServing":16,"IsAvailable":true,"ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight":4.5,"AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"FoodID":4,"Name":"Cobb Salad","UnitPrice":1.99,"ServingSize":-1,"MeasurementUnit":"cups","ProteinGrams":6,"FatGrams":1,"CarbohydrateGrams":3,"CaloriesPerServing":5,"IsAvailable":true,"ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight":5.674,"AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null,"Instructions":"1.) Open 2.) Eat","NumberOfIngredients":4}],"@odata.nextLink":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods?$skiptoken=4"}',
    expected: {
        "value": [{
            "FoodID": 0,
            "Name": "flour",
            "UnitPrice": 0.19999,
            "ServingSize": 1,
            "MeasurementUnit": "Cup",
            "ProteinGrams": 3,
            "FatGrams": 1,
            "CarbohydrateGrams": 20,
            "CaloriesPerServing": 140,
            "IsAvailable": true,
            "ExpirationDate": "2010-12-25T12:00:00Z",
            "ItemGUID": "27272727-2727-2727-2727-272727272727",
            "Weight": 10,
            "AvailableUnits": 1,
            "Packaging": {
                "Type": null,
                "Color": "",
                "NumberPerPackage": 2147483647,
                "RequiresRefridgeration": false,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "Length": 79228162514264337593543950335,
                    "Height": 32767,
                    "Width": 9223372036854775807,
                    "Volume": 1.7976931348623157E+308
                }
            },
            "CookedSize": {"Length": 2, "Height": 1, "Width": 3, "Volume": 6.0},
            "AlternativeNames": ["ground cereal", "ground grain"],
            "Providers": [{
                "Name": "Flour Provider",
                "Aliases": ["fp1", "flour provider1"],
                "Details": {"Telephone": "555-555-555", "PreferredCode": 1001}
            }, {"Name": "Ground Grains", "Aliases": [], "Details": null}],
            "SpatialData": {
                "type": "GeometryCollection",
                "geometries": [{"type": "Point", "coordinates": [5.0, 5.0]}],
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}}
            }
        }, {
            "FoodID": 1,
            "Name": "sugar",
            "UnitPrice": 0.2,
            "ServingSize": 1,
            "MeasurementUnit": "tsp",
            "ProteinGrams": 0,
            "FatGrams": 0,
            "CarbohydrateGrams": 4,
            "CaloriesPerServing": 16,
            "IsAvailable": false,
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID": "ffffffff-ffff-ffff-ffff-ffffffffffff",
            "Weight": 0.1,
            "AvailableUnits": 0,
            "Packaging": {
                "Type": " ",
                "Color": "BLUE",
                "NumberPerPackage": -2147483648,
                "RequiresRefridgeration": true,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "Length": -79228162514264337593543950335,
                    "Height": -32768,
                    "Width": -9223372036854775808,
                    "Volume": -1.7976931348623157E+308
                }
            },
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null
        }, {
            "FoodID": 2,
            "Name": "1 Chicken Egg",
            "UnitPrice": 0.55,
            "ServingSize": 1,
            "MeasurementUnit": null,
            "ProteinGrams": 6,
            "FatGrams": 1,
            "CarbohydrateGrams": 1,
            "CaloriesPerServing": 70,
            "IsAvailable": true,
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID": "00000000-0000-0000-0000-000000000000",
            "Weight": 0,
            "AvailableUnits": -128,
            "Packaging": {
                "Type": "18     - Carton",
                "Color": " brown ",
                "NumberPerPackage": 0,
                "RequiresRefridgeration": true,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": null
            },
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null
        }, {
            "FoodID": 3,
            "Name": "Brown Sugar",
            "UnitPrice": 1.6,
            "ServingSize": 1,
            "MeasurementUnit": "TSP.",
            "ProteinGrams": 0,
            "FatGrams": 0,
            "CarbohydrateGrams": 5,
            "CaloriesPerServing": 16,
            "IsAvailable": true,
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight": 4.5,
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null
        }, {
            "FoodID": 4,
            "Name": "Cobb Salad",
            "UnitPrice": 1.99,
            "ServingSize": -1,
            "MeasurementUnit": "cups",
            "ProteinGrams": 6,
            "FatGrams": 1,
            "CarbohydrateGrams": 3,
            "CaloriesPerServing": 5,
            "IsAvailable": true,
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight": 5.674,
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null,
            "Instructions": "1.) Open 2.) Eat",
            "NumberOfIngredients": 4
        }], "@odata.nextLink": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods?$skiptoken=4"
    }
}, {
    description: "Entry with metadata=none",
    header: "application/json;odata.metadata=none",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
    input: '{"FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams":3,"FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight":10,"AvailableUnits":1,"Packaging":{"Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"Length":2,"Height":1,"Width":3,"Volume":6.0},"AlternativeNames":["ground cereal","ground grain"],"Providers":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}],"SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}}',
    expected: {
        "FoodID": 0,
        "Name": "flour",
        "UnitPrice": 0.19999,
        "ServingSize": 1,
        "MeasurementUnit": "Cup",
        "ProteinGrams": 3,
        "FatGrams": 1,
        "CarbohydrateGrams": 20,
        "CaloriesPerServing": 140,
        "IsAvailable": true,
        "ExpirationDate": "2010-12-25T12:00:00Z",
        "ItemGUID": "27272727-2727-2727-2727-272727272727",
        "Weight": 10,
        "AvailableUnits": 1,
        "Packaging": {
            "Type": null,
            "Color": "",
            "NumberPerPackage": 2147483647,
            "RequiresRefridgeration": false,
            "ShipDate": "2000-12-29T00:00:00Z",
            "PackageDimensions": {
                "Length": 79228162514264337593543950335,
                "Height": 32767,
                "Width": 9223372036854775807,
                "Volume": 1.7976931348623157E+308
            }
        },
        "CookedSize": {"Length": 2, "Height": 1, "Width": 3, "Volume": 6.0},
        "AlternativeNames": ["ground cereal", "ground grain"],
        "Providers": [{
            "Name": "Flour Provider",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {"Telephone": "555-555-555", "PreferredCode": 1001}
        }, {"Name": "Ground Grains", "Aliases": [], "Details": null}],
        "SpatialData": {
            "type": "GeometryCollection",
            "geometries": [{"type": "Point", "coordinates": [5.0, 5.0]}],
            "crs": {"type": "name", "properties": {"name": "EPSG:4326"}}
        }
    }
}, {
    description: "Collection of Complex with metadata=none",
    header: "application/json;odata.metadata=none",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Providers",
    input: '{"value":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}]}',
    expected: {
        "value": [{
            "Name": "Flour Provider",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {"Telephone": "555-555-555", "PreferredCode": 1001}
        }, {"Name": "Ground Grains", "Aliases": [], "Details": null}]
    }
}, {
    description: "Collection of Simple with metadata=none",
    header: "application/json;odata.metadata=none",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/AlternativeNames",
    input: '{"value":["ground cereal","ground grain"]}',
    expected: {"value": ["ground cereal", "ground grain"]}
}, {
    description: "Collection Property with metadata=none",
    header: "application/json;odata.metadata=none",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Packaging",
    input: '{"Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}}',
    expected: {
        "Type": null,
        "Color": "",
        "NumberPerPackage": 2147483647,
        "RequiresRefridgeration": false,
        "ShipDate": "2000-12-29T00:00:00Z",
        "PackageDimensions": {
            "Length": 79228162514264337593543950335,
            "Height": 32767,
            "Width": 9223372036854775807,
            "Volume": 1.7976931348623157E+308
        }
    }
}, {
    description: "Simple Property with metadata=none",
    header: "application/json;odata.metadata=none",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Name",
    input: '{"value":"flour"}',
    expected: {"value": "flour"}
}];

var testDataJsonParserMetadataMinimal = [{
    description: "Feed with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods","value":[{"FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams":3,"FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight":10,"AvailableUnits":1,"Packaging":{"Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"Length":2,"Height":1,"Width":3,"Volume":6.0},"AlternativeNames":["ground cereal","ground grain"],"Providers":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}],"SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}},{"FoodID":1,"Name":"sugar","UnitPrice":0.2,"ServingSize":1,"MeasurementUnit":"tsp","ProteinGrams":0,"FatGrams":0,"CarbohydrateGrams":4,"CaloriesPerServing":16,"IsAvailable":false,"ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID":"ffffffff-ffff-ffff-ffff-ffffffffffff","Weight":0.1,"AvailableUnits":0,"Packaging":{"Type":" ","Color":"BLUE","NumberPerPackage":-2147483648,"RequiresRefridgeration":true,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":-79228162514264337593543950335,"Height":-32768,"Width":-9223372036854775808,"Volume":-1.7976931348623157E+308}},"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"FoodID":2,"Name":"1 Chicken Egg","UnitPrice":0.55,"ServingSize":1,"MeasurementUnit":null,"ProteinGrams":6,"FatGrams":1,"CarbohydrateGrams":1,"CaloriesPerServing":70,"IsAvailable":true,"ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID":"00000000-0000-0000-0000-000000000000","Weight":0,"AvailableUnits":-128,"Packaging":{"Type":"18     - Carton","Color":" brown ","NumberPerPackage":0,"RequiresRefridgeration":true,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":null},"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"FoodID":3,"Name":"Brown Sugar","UnitPrice":1.6,"ServingSize":1,"MeasurementUnit":"TSP.","ProteinGrams":0,"FatGrams":0,"CarbohydrateGrams":5,"CaloriesPerServing":16,"IsAvailable":true,"ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight":4.5,"AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"@odata.type":"#DataJS.Tests.V4.PreparedFood","FoodID":4,"Name":"Cobb Salad","UnitPrice":1.99,"ServingSize":-1,"MeasurementUnit":"cups","ProteinGrams":6,"FatGrams":1,"CarbohydrateGrams":3,"CaloriesPerServing":5,"IsAvailable":true,"ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight":5.674,"AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null,"Instructions":"1.) Open 2.) Eat","NumberOfIngredients":4}],"@odata.nextLink":"Foods?$skiptoken=4"}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods",
        "value": [{
            "FoodID": 0,
            "Name": "flour",
            "UnitPrice": 0.19999,
            "ServingSize": 1,
            "MeasurementUnit": "Cup",
            "ProteinGrams": 3,
            "FatGrams": 1,
            "CarbohydrateGrams": 20,
            "CaloriesPerServing": 140,
            "IsAvailable": true,
            "ExpirationDate": "2010-12-25T12:00:00Z",
            "ItemGUID": "27272727-2727-2727-2727-272727272727",
            "Weight": 10,
            "AvailableUnits": 1,
            "Packaging": {
                "Type": null,
                "Color": "",
                "NumberPerPackage": 2147483647,
                "RequiresRefridgeration": false,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "Length": 79228162514264337593543950335,
                    "Height": 32767,
                    "Width": 9223372036854775807,
                    "Volume": 1.7976931348623157E+308
                }
            },
            "CookedSize": {"Length": 2, "Height": 1, "Width": 3, "Volume": 6.0},
            "AlternativeNames": ["ground cereal", "ground grain"],
            "Providers": [{
                "Name": "Flour Provider",
                "Aliases": ["fp1", "flour provider1"],
                "Details": {"Telephone": "555-555-555", "PreferredCode": 1001}
            }, {"Name": "Ground Grains", "Aliases": [], "Details": null}],
            "SpatialData": {
                "type": "GeometryCollection",
                "geometries": [{"type": "Point", "coordinates": [5.0, 5.0]}],
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}}
            }
        }, {
            "FoodID": 1,
            "Name": "sugar",
            "UnitPrice": 0.2,
            "ServingSize": 1,
            "MeasurementUnit": "tsp",
            "ProteinGrams": 0,
            "FatGrams": 0,
            "CarbohydrateGrams": 4,
            "CaloriesPerServing": 16,
            "IsAvailable": false,
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID": "ffffffff-ffff-ffff-ffff-ffffffffffff",
            "Weight": 0.1,
            "AvailableUnits": 0,
            "Packaging": {
                "Type": " ",
                "Color": "BLUE",
                "NumberPerPackage": -2147483648,
                "RequiresRefridgeration": true,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "Length": -79228162514264337593543950335,
                    "Height": -32768,
                    "Width": -9223372036854775808,
                    "Volume": -1.7976931348623157E+308
                }
            },
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null
        }, {
            "FoodID": 2,
            "Name": "1 Chicken Egg",
            "UnitPrice": 0.55,
            "ServingSize": 1,
            "MeasurementUnit": null,
            "ProteinGrams": 6,
            "FatGrams": 1,
            "CarbohydrateGrams": 1,
            "CaloriesPerServing": 70,
            "IsAvailable": true,
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID": "00000000-0000-0000-0000-000000000000",
            "Weight": 0,
            "AvailableUnits": -128,
            "Packaging": {
                "Type": "18     - Carton",
                "Color": " brown ",
                "NumberPerPackage": 0,
                "RequiresRefridgeration": true,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": null
            },
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null
        }, {
            "FoodID": 3,
            "Name": "Brown Sugar",
            "UnitPrice": 1.6,
            "ServingSize": 1,
            "MeasurementUnit": "TSP.",
            "ProteinGrams": 0,
            "FatGrams": 0,
            "CarbohydrateGrams": 5,
            "CaloriesPerServing": 16,
            "IsAvailable": true,
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight": 4.5,
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null
        }, {
            "@odata.type": "#DataJS.Tests.V4.PreparedFood",
            "FoodID": 4,
            "Name": "Cobb Salad",
            "UnitPrice": 1.99,
            "ServingSize": -1,
            "MeasurementUnit": "cups",
            "ProteinGrams": 6,
            "FatGrams": 1,
            "CarbohydrateGrams": 3,
            "CaloriesPerServing": 5,
            "IsAvailable": true,
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight": 5.674,
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null,
            "Instructions": "1.) Open 2.) Eat",
            "NumberOfIngredients": 4
        }],
        "@odata.nextLink": "Foods?$skiptoken=4"
    }
}, {
    description: "Entry with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods/$entity","FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams":3,"FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight":10,"AvailableUnits":1,"Packaging":{"Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"Length":2,"Height":1,"Width":3,"Volume":6.0},"AlternativeNames":["ground cereal","ground grain"],"Providers":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}],"SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods/$entity",
        "FoodID": 0,
        "Name": "flour",
        "UnitPrice": 0.19999,
        "ServingSize": 1,
        "MeasurementUnit": "Cup",
        "ProteinGrams": 3,
        "FatGrams": 1,
        "CarbohydrateGrams": 20,
        "CaloriesPerServing": 140,
        "IsAvailable": true,
        "ExpirationDate": "2010-12-25T12:00:00Z",
        "ItemGUID": "27272727-2727-2727-2727-272727272727",
        "Weight": 10,
        "AvailableUnits": 1,
        "Packaging": {
            "Type": null,
            "Color": "",
            "NumberPerPackage": 2147483647,
            "RequiresRefridgeration": false,
            "ShipDate": "2000-12-29T00:00:00Z",
            "PackageDimensions": {
                "Length": 79228162514264337593543950335,
                "Height": 32767,
                "Width": 9223372036854775807,
                "Volume": 1.7976931348623157E+308
            }
        },
        "CookedSize": {"Length": 2, "Height": 1, "Width": 3, "Volume": 6.0},
        "AlternativeNames": ["ground cereal", "ground grain"],
        "Providers": [{
            "Name": "Flour Provider",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {"Telephone": "555-555-555", "PreferredCode": 1001}
        }, {"Name": "Ground Grains", "Aliases": [], "Details": null}],
        "SpatialData": {
            "type": "GeometryCollection",
            "geometries": [{"type": "Point", "coordinates": [5.0, 5.0]}],
            "crs": {"type": "name", "properties": {"name": "EPSG:4326"}}
        }
    }
}, {
    description: "Collection of Complex with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Providers",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Providers","value":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}]}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Providers",
        "value": [{
            "Name": "Flour Provider",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {"Telephone": "555-555-555", "PreferredCode": 1001}
        }, {"Name": "Ground Grains", "Aliases": [], "Details": null}]
    }
}, {
    description: "Collection of Simple with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/AlternativeNames",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/AlternativeNames","value":["ground cereal","ground grain"]}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/AlternativeNames",
        "value": ["ground cereal", "ground grain"]
    }
}, {
    description: "Collection Property with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Packaging",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Packaging","Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Packaging",
        "Type": null,
        "Color": "",
        "NumberPerPackage": 2147483647,
        "RequiresRefridgeration": false,
        "ShipDate": "2000-12-29T00:00:00Z",
        "PackageDimensions": {
            "Length": 79228162514264337593543950335,
            "Height": 32767,
            "Width": 9223372036854775807,
            "Volume": 1.7976931348623157E+308
        }
    }
}, {
    description: "Simple Property with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Name",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Name","value":"flour"}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Name",
        "value": "flour"
    }
}];


var testDataJsonParserMetadataMinimalToFullMetaData = {
    "version": "4.0",
    "dataServices": {
        "schema": [{
            "namespace": "DataJS.Tests.V4",
            "entityType": [{
                "name": "Category",
                "key": [{"propertyRef": [{"name": "CategoryID"}]}],
                "property": [{"name": "CategoryID", "type": "Edm.Int32", "nullable": "false"}, {
                    "name": "Name",
                    "type": "Edm.String"
                }],
                "navigationProperty": [{
                    "name": "Foods",
                    "type": "Collection(DataJS.Tests.V4.Food)",
                    "partner": "Category"
                }]
            }, {
                "name": "Food",
                "key": [{"propertyRef": [{"name": "FoodID"}]}],
                "property": [{"name": "FoodID", "type": "Edm.Int32", "nullable": "false"}, {
                    "name": "Name",
                    "type": "Edm.String"
                }, {"name": "UnitPrice", "type": "Edm.Double", "nullable": "false"}, {
                    "name": "ServingSize",
                    "type": "Edm.Decimal",
                    "nullable": "false"
                }, {"name": "MeasurementUnit", "type": "Edm.String"}, {
                    "name": "ProteinGrams",
                    "type": "Edm.Byte",
                    "nullable": "false"
                }, {"name": "FatGrams", "type": "Edm.Int16", "nullable": "false"}, {
                    "name": "CarbohydrateGrams",
                    "type": "Edm.Int32",
                    "nullable": "false"
                }, {"name": "CaloriesPerServing", "type": "Edm.Int64", "nullable": "false"}, {
                    "name": "IsAvailable",
                    "type": "Edm.Boolean",
                    "nullable": "false"
                }, {"name": "ExpirationDate", "type": "Edm.DateTimeOffset", "nullable": "false"}, {
                    "name": "ItemGUID",
                    "type": "Edm.Guid",
                    "nullable": "false"
                }, {"name": "Weight", "type": "Edm.Single", "nullable": "false"}, {
                    "name": "AvailableUnits",
                    "type": "Edm.SByte",
                    "nullable": "false"
                }, {"name": "Packaging", "type": "DataJS.Tests.V4.Package"}, {
                    "name": "CookedSize",
                    "type": "DataJS.Tests.V4.CookedDimensions"
                }, {
                    "name": "AlternativeNames",
                    "type": "Collection(Edm.String)",
                    "nullable": "false"
                }, {
                    "name": "Providers",
                    "type": "Collection(DataJS.Tests.V4.Provider)",
                    "nullable": "false"
                }, {"name": "SpatialData", "type": "Edm.GeometryCollection", "SRID": "Variable"}],
                "navigationProperty": [{"name": "Category", "type": "DataJS.Tests.V4.Category", "partner": "Foods"}]
            }, {
                "name": "PreparedFood",
                "baseType": "DataJS.Tests.V4.Food",
                "property": [{"name": "Instructions", "type": "Edm.String"}, {
                    "name": "NumberOfIngredients",
                    "type": "Edm.Single",
                    "nullable": "false"
                }]
            }],
            "complexType": [{
                "name": "Package",
                "property": [{"name": "Type", "type": "Edm.String"}, {
                    "name": "Color",
                    "type": "Edm.String"
                }, {
                    "name": "NumberPerPackage",
                    "type": "Edm.Int32",
                    "nullable": "false"
                }, {"name": "RequiresRefridgeration", "type": "Edm.Boolean", "nullable": "false"}, {
                    "name": "ShipDate",
                    "type": "Edm.DateTimeOffset",
                    "nullable": "false"
                }, {"name": "PackageDimensions", "type": "DataJS.Tests.V4.Dimensions"}]
            }, {
                "name": "Dimensions",
                "property": [{"name": "Length", "type": "Edm.Decimal", "nullable": "false"}, {
                    "name": "Height",
                    "type": "Edm.Int16",
                    "nullable": "false"
                }, {"name": "Width", "type": "Edm.Int64", "nullable": "false"}, {
                    "name": "Volume",
                    "type": "Edm.Double",
                    "nullable": "false"
                }]
            }, {
                "name": "CookedDimensions",
                "property": [{"name": "Length", "type": "Edm.Decimal", "nullable": "false"}, {
                    "name": "Height",
                    "type": "Edm.Int16",
                    "nullable": "false"
                }, {"name": "Width", "type": "Edm.Int64", "nullable": "false"}, {
                    "name": "Volume",
                    "type": "Edm.Double",
                    "nullable": "false"
                }]
            }, {
                "name": "Provider",
                "property": [{"name": "Name", "type": "Edm.String"}, {
                    "name": "Aliases",
                    "type": "Collection(Edm.String)",
                    "nullable": "false"
                }, {"name": "Details", "type": "DataJS.Tests.V4.ProviderDetails"}]
            }, {
                "name": "ProviderDetails",
                "property": [{"name": "Telephone", "type": "Edm.String"}, {
                    "name": "PreferredCode",
                    "type": "Edm.Int32",
                    "nullable": "false"
                }]
            }],
            "action": [{"name": "ResetData", "returnType": {"type": "Edm.String"}}],
            "function": [{
                "name": "FoodsAvailable",
                "isComposable": "true",
                "returnType": {"type": "Collection(Edm.String)"}
            }, {
                "name": "PackagingTypes",
                "isComposable": "true",
                "returnType": {"type": "Collection(DataJS.Tests.V4.Package)"}
            }, {"name": "UserNameAndPassword", "returnType": {"type": "Edm.String"}}],
            "entityContainer": {
                "name": "FoodContainer",
                "entitySet": [{
                    "name": "Categories",
                    "entityType": "DataJS.Tests.V4.Category",
                    "navigationPropertyBinding": [{"path": "Foods", "target": "Foods"}]
                }, {
                    "name": "Foods",
                    "entityType": "DataJS.Tests.V4.Food",
                    "navigationPropertyBinding": [{"path": "Category", "target": "Categories"}]
                }],
                "actionImport": [{"name": "ResetData", "action": "DataJS.Tests.V4.ResetData"}],
                "functionImport": [{
                    "name": "FoodsAvailable",
                    "function": "DataJS.Tests.V4.FoodsAvailable"
                }, {
                    "name": "PackagingTypes",
                    "function": "DataJS.Tests.V4.PackagingTypes"
                }, {"name": "UserNameAndPassword", "function": "DataJS.Tests.V4.UserNameAndPassword"}]
            }
        }]
    }
};
var testDataJsonParserMetadataMinimalToFull = [{
    description: "Feed with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods","value":[{"FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams":3,"FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight":10,"AvailableUnits":1,"Packaging":{"Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"Length":2,"Height":1,"Width":3,"Volume":6.0},"AlternativeNames":["ground cereal","ground grain"],"Providers":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}],"SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}},{"FoodID":1,"Name":"sugar","UnitPrice":0.2,"ServingSize":1,"MeasurementUnit":"tsp","ProteinGrams":0,"FatGrams":0,"CarbohydrateGrams":4,"CaloriesPerServing":16,"IsAvailable":false,"ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID":"ffffffff-ffff-ffff-ffff-ffffffffffff","Weight":0.1,"AvailableUnits":0,"Packaging":{"Type":" ","Color":"BLUE","NumberPerPackage":-2147483648,"RequiresRefridgeration":true,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":-79228162514264337593543950335,"Height":-32768,"Width":-9223372036854775808,"Volume":-1.7976931348623157E+308}},"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"FoodID":2,"Name":"1 Chicken Egg","UnitPrice":0.55,"ServingSize":1,"MeasurementUnit":null,"ProteinGrams":6,"FatGrams":1,"CarbohydrateGrams":1,"CaloriesPerServing":70,"IsAvailable":true,"ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID":"00000000-0000-0000-0000-000000000000","Weight":0,"AvailableUnits":-128,"Packaging":{"Type":"18     - Carton","Color":" brown ","NumberPerPackage":0,"RequiresRefridgeration":true,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":null},"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"FoodID":3,"Name":"Brown Sugar","UnitPrice":1.6,"ServingSize":1,"MeasurementUnit":"TSP.","ProteinGrams":0,"FatGrams":0,"CarbohydrateGrams":5,"CaloriesPerServing":16,"IsAvailable":true,"ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight":4.5,"AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null},{"@odata.type":"#DataJS.Tests.V4.PreparedFood","FoodID":4,"Name":"Cobb Salad","UnitPrice":1.99,"ServingSize":-1,"MeasurementUnit":"cups","ProteinGrams":6,"FatGrams":1,"CarbohydrateGrams":3,"CaloriesPerServing":5,"IsAvailable":true,"ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight":5.674,"AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames":[],"Providers":[],"SpatialData":null,"Instructions":"1.) Open 2.) Eat","NumberOfIngredients":4}],"@odata.nextLink":"Foods?$skiptoken=4"}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods",
        "value": [{
            "FoodID": 0,
            "Name": "flour",
            "UnitPrice": 0.19999,
            "ServingSize": 1,
            "MeasurementUnit": "Cup",
            "ProteinGrams": 3,
            "FatGrams": 1,
            "CarbohydrateGrams": 20,
            "CaloriesPerServing": 140,
            "IsAvailable": true,
            "ExpirationDate": "2010-12-25T12:00:00Z",
            "ItemGUID": "27272727-2727-2727-2727-272727272727",
            "Weight": 10,
            "AvailableUnits": 1,
            "Packaging": {
                "Type": null,
                "Color": "",
                "NumberPerPackage": 2147483647,
                "RequiresRefridgeration": false,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "Length": 7.922816251426434e+28,
                    "Height": 32767,
                    "Width": 9223372036854776000,
                    "Volume": 1.7976931348623157e+308,
                    "@odata.type": "#DataJS.Tests.V4.Dimensions",
                    "Length@odata.type": "#Decimal",
                    "Height@odata.type": "#Int16",
                    "Width@odata.type": "#Int64",
                    "Volume@odata.type": "#Double"
                },
                "@odata.type": "#DataJS.Tests.V4.Package",
                "Type@odata.type": "#String",
                "Color@odata.type": "#String",
                "NumberPerPackage@odata.type": "#Int32",
                "RequiresRefridgeration@odata.type": "#Boolean",
                "ShipDate@odata.type": "#DateTimeOffset"
            },
            "CookedSize": {
                "Length": 2,
                "Height": 1,
                "Width": 3,
                "Volume": 6,
                "@odata.type": "#DataJS.Tests.V4.CookedDimensions",
                "Length@odata.type": "#Decimal",
                "Height@odata.type": "#Int16",
                "Width@odata.type": "#Int64",
                "Volume@odata.type": "#Double"
            },
            "AlternativeNames": ["ground cereal", "ground grain"],
            "Providers": [{
                "Name": "Flour Provider",
                "Aliases": ["fp1", "flour provider1"],
                "Details": {
                    "Telephone": "555-555-555",
                    "PreferredCode": 1001,
                    "@odata.type": "#DataJS.Tests.V4.ProviderDetails",
                    "Telephone@odata.type": "#String",
                    "PreferredCode@odata.type": "#Int32"
                },
                "@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
                "Name@odata.type": "#String",
                "Aliases@odata.type": "#Collection(String)"
            }, {
                "Name": "Ground Grains",
                "Aliases": [],
                "Details": null,
                "@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
                "Name@odata.type": "#String",
                "Aliases@odata.type": "#Collection(String)",
                "Details@odata.type": "#DataJS.Tests.V4.ProviderDetails"
            }],
            "SpatialData": {
                "type": "GeometryCollection",
                "geometries": [{"type": "Point", "coordinates": [5, 5]}],
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "@odata.type": "#Edm.GeometryCollection"
            },
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
            "@odata.editLink": "Foods(0)",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Double",
            "ServingSize@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "ProteinGrams@odata.type": "#Byte",
            "FatGrams@odata.type": "#Int16",
            "CarbohydrateGrams@odata.type": "#Int32",
            "CaloriesPerServing@odata.type": "#Int64",
            "IsAvailable@odata.type": "#Boolean",
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ItemGUID@odata.type": "#Guid",
            "Weight@odata.type": "#Single",
            "AvailableUnits@odata.type": "#SByte",
            "AlternativeNames@odata.type": "#Collection(String)",
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)"
        }, {
            "FoodID": 1,
            "Name": "sugar",
            "UnitPrice": 0.2,
            "ServingSize": 1,
            "MeasurementUnit": "tsp",
            "ProteinGrams": 0,
            "FatGrams": 0,
            "CarbohydrateGrams": 4,
            "CaloriesPerServing": 16,
            "IsAvailable": false,
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID": "ffffffff-ffff-ffff-ffff-ffffffffffff",
            "Weight": 0.1,
            "AvailableUnits": 0,
            "Packaging": {
                "Type": " ",
                "Color": "BLUE",
                "NumberPerPackage": -2147483648,
                "RequiresRefridgeration": true,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "Length": -7.922816251426434e+28,
                    "Height": -32768,
                    "Width": -9223372036854776000,
                    "Volume": -1.7976931348623157e+308,
                    "@odata.type": "#DataJS.Tests.V4.Dimensions",
                    "Length@odata.type": "#Decimal",
                    "Height@odata.type": "#Int16",
                    "Width@odata.type": "#Int64",
                    "Volume@odata.type": "#Double"
                },
                "@odata.type": "#DataJS.Tests.V4.Package",
                "Type@odata.type": "#String",
                "Color@odata.type": "#String",
                "NumberPerPackage@odata.type": "#Int32",
                "RequiresRefridgeration@odata.type": "#Boolean",
                "ShipDate@odata.type": "#DateTimeOffset"
            },
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null,
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(1)",
            "@odata.editLink": "Foods(1)",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Double",
            "ServingSize@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "ProteinGrams@odata.type": "#Byte",
            "FatGrams@odata.type": "#Int16",
            "CarbohydrateGrams@odata.type": "#Int32",
            "CaloriesPerServing@odata.type": "#Int64",
            "IsAvailable@odata.type": "#Boolean",
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ItemGUID@odata.type": "#Guid",
            "Weight@odata.type": "#Single",
            "AvailableUnits@odata.type": "#SByte",
            "CookedSize@odata.type": "#DataJS.Tests.V4.CookedDimensions",
            "AlternativeNames@odata.type": "#Collection(String)",
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "SpatialData@odata.type": "#GeometryCollection"
        }, {
            "FoodID": 2,
            "Name": "1 Chicken Egg",
            "UnitPrice": 0.55,
            "ServingSize": 1,
            "MeasurementUnit": null,
            "ProteinGrams": 6,
            "FatGrams": 1,
            "CarbohydrateGrams": 1,
            "CaloriesPerServing": 70,
            "IsAvailable": true,
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID": "00000000-0000-0000-0000-000000000000",
            "Weight": 0,
            "AvailableUnits": -128,
            "Packaging": {
                "Type": "18     - Carton",
                "Color": " brown ",
                "NumberPerPackage": 0,
                "RequiresRefridgeration": true,
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": null,
                "@odata.type": "#DataJS.Tests.V4.Package",
                "Type@odata.type": "#String",
                "Color@odata.type": "#String",
                "NumberPerPackage@odata.type": "#Int32",
                "RequiresRefridgeration@odata.type": "#Boolean",
                "ShipDate@odata.type": "#DateTimeOffset",
                "PackageDimensions@odata.type": "#DataJS.Tests.V4.Dimensions"
            },
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null,
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(2)",
            "@odata.editLink": "Foods(2)",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Double",
            "ServingSize@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "ProteinGrams@odata.type": "#Byte",
            "FatGrams@odata.type": "#Int16",
            "CarbohydrateGrams@odata.type": "#Int32",
            "CaloriesPerServing@odata.type": "#Int64",
            "IsAvailable@odata.type": "#Boolean",
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ItemGUID@odata.type": "#Guid",
            "Weight@odata.type": "#Single",
            "AvailableUnits@odata.type": "#SByte",
            "CookedSize@odata.type": "#DataJS.Tests.V4.CookedDimensions",
            "AlternativeNames@odata.type": "#Collection(String)",
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "SpatialData@odata.type": "#GeometryCollection"
        }, {
            "FoodID": 3,
            "Name": "Brown Sugar",
            "UnitPrice": 1.6,
            "ServingSize": 1,
            "MeasurementUnit": "TSP.",
            "ProteinGrams": 0,
            "FatGrams": 0,
            "CarbohydrateGrams": 5,
            "CaloriesPerServing": 16,
            "IsAvailable": true,
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight": 4.5,
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null,
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(3)",
            "@odata.editLink": "Foods(3)",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Double",
            "ServingSize@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "ProteinGrams@odata.type": "#Byte",
            "FatGrams@odata.type": "#Int16",
            "CarbohydrateGrams@odata.type": "#Int32",
            "CaloriesPerServing@odata.type": "#Int64",
            "IsAvailable@odata.type": "#Boolean",
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ItemGUID@odata.type": "#Guid",
            "Weight@odata.type": "#Single",
            "AvailableUnits@odata.type": "#SByte",
            "Packaging@odata.type": "#DataJS.Tests.V4.Package",
            "CookedSize@odata.type": "#DataJS.Tests.V4.CookedDimensions",
            "AlternativeNames@odata.type": "#Collection(String)",
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "SpatialData@odata.type": "#GeometryCollection"
        }, {
            "@odata.type": "#DataJS.Tests.V4.PreparedFood",
            "FoodID": 4,
            "Name": "Cobb Salad",
            "UnitPrice": 1.99,
            "ServingSize": -1,
            "MeasurementUnit": "cups",
            "ProteinGrams": 6,
            "FatGrams": 1,
            "CarbohydrateGrams": 3,
            "CaloriesPerServing": 5,
            "IsAvailable": true,
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight": 5.674,
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames": [],
            "Providers": [],
            "SpatialData": null,
            "Instructions": "1.) Open 2.) Eat",
            "NumberOfIngredients": 4,
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(4)",
            "@odata.editLink": "Foods(4)",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Double",
            "ServingSize@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "ProteinGrams@odata.type": "#Byte",
            "FatGrams@odata.type": "#Int16",
            "CarbohydrateGrams@odata.type": "#Int32",
            "CaloriesPerServing@odata.type": "#Int64",
            "IsAvailable@odata.type": "#Boolean",
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ItemGUID@odata.type": "#Guid",
            "Weight@odata.type": "#Single",
            "AvailableUnits@odata.type": "#SByte",
            "Packaging@odata.type": "#DataJS.Tests.V4.Package",
            "CookedSize@odata.type": "#DataJS.Tests.V4.CookedDimensions",
            "AlternativeNames@odata.type": "#Collection(String)",
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "SpatialData@odata.type": "#GeometryCollection",
            "Instructions@odata.type": "#String",
            "NumberOfIngredients@odata.type": "#Single"
        }],
        "@odata.nextLink": "Foods?$skiptoken=4"
    }
}, {
    description: "Entry with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods/$entity","FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams":3,"FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight":10,"AvailableUnits":1,"Packaging":{"Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"Length":2,"Height":1,"Width":3,"Volume":6.0},"AlternativeNames":["ground cereal","ground grain"],"Providers":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}],"SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods/$entity",
        "FoodID": 0,
        "Name": "flour",
        "UnitPrice": 0.19999,
        "ServingSize": 1,
        "MeasurementUnit": "Cup",
        "ProteinGrams": 3,
        "FatGrams": 1,
        "CarbohydrateGrams": 20,
        "CaloriesPerServing": 140,
        "IsAvailable": true,
        "ExpirationDate": "2010-12-25T12:00:00Z",
        "ItemGUID": "27272727-2727-2727-2727-272727272727",
        "Weight": 10,
        "AvailableUnits": 1,
        "Packaging": {
            "Type": null,
            "Color": "",
            "NumberPerPackage": 2147483647,
            "RequiresRefridgeration": false,
            "ShipDate": "2000-12-29T00:00:00Z",
            "PackageDimensions": {
                "Length": 7.922816251426434e+28,
                "Height": 32767,
                "Width": 9223372036854776000,
                "Volume": 1.7976931348623157e+308,
                "@odata.type": "#DataJS.Tests.V4.Dimensions",
                "Length@odata.type": "#Decimal",
                "Height@odata.type": "#Int16",
                "Width@odata.type": "#Int64",
                "Volume@odata.type": "#Double"
            },
            "@odata.type": "#DataJS.Tests.V4.Package",
            "Type@odata.type": "#String",
            "Color@odata.type": "#String",
            "NumberPerPackage@odata.type": "#Int32",
            "RequiresRefridgeration@odata.type": "#Boolean",
            "ShipDate@odata.type": "#DateTimeOffset"
        },
        "CookedSize": {
            "Length": 2,
            "Height": 1,
            "Width": 3,
            "Volume": 6,
            "@odata.type": "#DataJS.Tests.V4.CookedDimensions",
            "Length@odata.type": "#Decimal",
            "Height@odata.type": "#Int16",
            "Width@odata.type": "#Int64",
            "Volume@odata.type": "#Double"
        },
        "AlternativeNames": ["ground cereal", "ground grain"],
        "Providers": [{
            "Name": "Flour Provider",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {
                "Telephone": "555-555-555",
                "PreferredCode": 1001,
                "@odata.type": "#DataJS.Tests.V4.ProviderDetails",
                "Telephone@odata.type": "#String",
                "PreferredCode@odata.type": "#Int32"
            },
            "@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "Name@odata.type": "#String",
            "Aliases@odata.type": "#Collection(String)"
        }, {
            "Name": "Ground Grains",
            "Aliases": [],
            "Details": null,
            "@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "Name@odata.type": "#String",
            "Aliases@odata.type": "#Collection(String)",
            "Details@odata.type": "#DataJS.Tests.V4.ProviderDetails"
        }],
        "SpatialData": {
            "type": "GeometryCollection",
            "geometries": [{"type": "Point", "coordinates": [5, 5]}],
            "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
            "@odata.type": "#Edm.GeometryCollection"
        },
        "@odata.type": "#DataJS.Tests.V4.Food",
        "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
        "@odata.editLink": "Foods(0)",
        "FoodID@odata.type": "#Int32",
        "Name@odata.type": "#String",
        "UnitPrice@odata.type": "#Double",
        "ServingSize@odata.type": "#Decimal",
        "MeasurementUnit@odata.type": "#String",
        "ProteinGrams@odata.type": "#Byte",
        "FatGrams@odata.type": "#Int16",
        "CarbohydrateGrams@odata.type": "#Int32",
        "CaloriesPerServing@odata.type": "#Int64",
        "IsAvailable@odata.type": "#Boolean",
        "ExpirationDate@odata.type": "#DateTimeOffset",
        "ItemGUID@odata.type": "#Guid",
        "Weight@odata.type": "#Single",
        "AvailableUnits@odata.type": "#SByte",
        "AlternativeNames@odata.type": "#Collection(String)",
        "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)"
    }
}, {
    description: "Collection of Complex with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Providers",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Providers","value":[{"Name":"Flour Provider","Aliases":["fp1","flour provider1"],"Details":{"Telephone":"555-555-555","PreferredCode":1001}},{"Name":"Ground Grains","Aliases":[],"Details":null}]}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Providers",
        "value": [{
            "Name": "Flour Provider",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {
                "Telephone": "555-555-555",
                "PreferredCode": 1001,
                "@odata.type": "#DataJS.Tests.V4.ProviderDetails",
                "Telephone@odata.type": "#String",
                "PreferredCode@odata.type": "#Int32"
            },
            "@odata.type": "#DataJS.Tests.V4.Provider",
            "Name@odata.type": "#String",
            "Aliases@odata.type": "#Collection(String)"
        }, {
            "Name": "Ground Grains",
            "Aliases": [],
            "Details": null,
            "@odata.type": "#DataJS.Tests.V4.Provider",
            "Name@odata.type": "#String",
            "Aliases@odata.type": "#Collection(String)",
            "Details@odata.type": "#DataJS.Tests.V4.ProviderDetails"
        }],
        "@odata.type": "#Collection(DataJS.Tests.V4.Provider)"
    }
}, {
    description: "Collection of Simple with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/AlternativeNames",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/AlternativeNames","value":["ground cereal","ground grain"]}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/AlternativeNames",
        "value": ["ground cereal", "ground grain"],
        "@odata.type": "#Collection(String)"
    }
}, {
    description: "Collection Property with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Packaging",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Packaging","Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"Length":79228162514264337593543950335,"Height":32767,"Width":9223372036854775807,"Volume":1.7976931348623157E+308}}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Packaging",
        "Type": null,
        "Color": "",
        "NumberPerPackage": 2147483647,
        "RequiresRefridgeration": false,
        "ShipDate": "2000-12-29T00:00:00Z",
        "PackageDimensions": {
            "Length": 7.922816251426434e+28,
            "Height": 32767,
            "Width": 9223372036854776000,
            "Volume": 1.7976931348623157e+308,
            "@odata.type": "#DataJS.Tests.V4.Dimensions",
            "Length@odata.type": "#Decimal",
            "Height@odata.type": "#Int16",
            "Width@odata.type": "#Int64",
            "Volume@odata.type": "#Double"
        },
        "@odata.type": "#DataJS.Tests.V4.Package",
        "Type@odata.type": "#String",
        "Color@odata.type": "#String",
        "NumberPerPackage@odata.type": "#Int32",
        "RequiresRefridgeration@odata.type": "#Boolean",
        "ShipDate@odata.type": "#DateTimeOffset"
    }
}, {
    description: "Simple Property with metadata=minimal",
    header: "application/json;odata.metadata=minimal",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Name",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Name","value":"flour"}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Name",
        "value": "flour",
        "value@odata.type": "#String"
    }
}];


var testDataJsonParserMetadataFull = [{
    description: "Feed with metadata=full",
    header: "application/json;odata.metadata=full",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods","value":[{"@odata.type":"#DataJS.Tests.V4.Food","@odata.id":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)","@odata.editLink":"Foods(0)","FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize@odata.type":"#Decimal","ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams@odata.type":"#Byte","ProteinGrams":3,"FatGrams@odata.type":"#Int16","FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing@odata.type":"#Int64","CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate@odata.type":"#DateTimeOffset","ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID@odata.type":"#Guid","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight@odata.type":"#Single","Weight":10,"AvailableUnits@odata.type":"#SByte","AvailableUnits":1,"Packaging":{"@odata.type":"#DataJS.Tests.V4.Package","Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate@odata.type":"#DateTimeOffset","ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"@odata.type":"#DataJS.Tests.V4.Dimensions","Length@odata.type":"#Decimal","Length":79228162514264337593543950335,"Height@odata.type":"#Int16","Height":32767,"Width@odata.type":"#Int64","Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"@odata.type":"#DataJS.Tests.V4.CookedDimensions","Length@odata.type":"#Decimal","Length":2,"Height@odata.type":"#Int16","Height":1,"Width@odata.type":"#Int64","Width":3,"Volume":6.0},"AlternativeNames@odata.type":"#Collection(String)","AlternativeNames":["ground cereal","ground grain"],"Providers@odata.type":"#Collection(DataJS.Tests.V4.Provider)","Providers":[{"@odata.type":"#DataJS.Tests.V4.Provider","Name":"Flour Provider","Aliases@odata.type":"#Collection(String)","Aliases":["fp1","flour provider1"],"Details":{"@odata.type":"#DataJS.Tests.V4.ProviderDetails","Telephone":"555-555-555","PreferredCode":1001}},{"@odata.type":"#DataJS.Tests.V4.Provider","Name":"Ground Grains","Aliases@odata.type":"#Collection(String)","Aliases":[],"Details":null}],"SpatialData@odata.type":"#GeometryCollection","SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}},"Category@odata.navigationLink":"Foods(0)/Category"},{"@odata.type":"#DataJS.Tests.V4.Food","@odata.id":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(1)","@odata.editLink":"Foods(1)","FoodID":1,"Name":"sugar","UnitPrice":0.2,"ServingSize@odata.type":"#Decimal","ServingSize":1,"MeasurementUnit":"tsp","ProteinGrams@odata.type":"#Byte","ProteinGrams":0,"FatGrams@odata.type":"#Int16","FatGrams":0,"CarbohydrateGrams":4,"CaloriesPerServing@odata.type":"#Int64","CaloriesPerServing":16,"IsAvailable":false,"ExpirationDate@odata.type":"#DateTimeOffset","ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID@odata.type":"#Guid","ItemGUID":"ffffffff-ffff-ffff-ffff-ffffffffffff","Weight@odata.type":"#Single","Weight":0.1,"AvailableUnits@odata.type":"#SByte","AvailableUnits":0,"Packaging":{"@odata.type":"#DataJS.Tests.V4.Package","Type":" ","Color":"BLUE","NumberPerPackage":-2147483648,"RequiresRefridgeration":true,"ShipDate@odata.type":"#DateTimeOffset","ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"@odata.type":"#DataJS.Tests.V4.Dimensions","Length@odata.type":"#Decimal","Length":-79228162514264337593543950335,"Height@odata.type":"#Int16","Height":-32768,"Width@odata.type":"#Int64","Width":-9223372036854775808,"Volume":-1.7976931348623157E+308}},"CookedSize":null,"AlternativeNames@odata.type":"#Collection(String)","AlternativeNames":[],"Providers@odata.type":"#Collection(DataJS.Tests.V4.Provider)","Providers":[],"SpatialData":null,"Category@odata.navigationLink":"Foods(1)/Category"},{"@odata.type":"#DataJS.Tests.V4.Food","@odata.id":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(2)","@odata.editLink":"Foods(2)","FoodID":2,"Name":"1 Chicken Egg","UnitPrice":0.55,"ServingSize@odata.type":"#Decimal","ServingSize":1,"MeasurementUnit":null,"ProteinGrams@odata.type":"#Byte","ProteinGrams":6,"FatGrams@odata.type":"#Int16","FatGrams":1,"CarbohydrateGrams":1,"CaloriesPerServing@odata.type":"#Int64","CaloriesPerServing":70,"IsAvailable":true,"ExpirationDate@odata.type":"#DateTimeOffset","ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID@odata.type":"#Guid","ItemGUID":"00000000-0000-0000-0000-000000000000","Weight@odata.type":"#Single","Weight":0,"AvailableUnits@odata.type":"#SByte","AvailableUnits":-128,"Packaging":{"@odata.type":"#DataJS.Tests.V4.Package","Type":"18     - Carton","Color":" brown ","NumberPerPackage":0,"RequiresRefridgeration":true,"ShipDate@odata.type":"#DateTimeOffset","ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":null},"CookedSize":null,"AlternativeNames@odata.type":"#Collection(String)","AlternativeNames":[],"Providers@odata.type":"#Collection(DataJS.Tests.V4.Provider)","Providers":[],"SpatialData":null,"Category@odata.navigationLink":"Foods(2)/Category"},{"@odata.type":"#DataJS.Tests.V4.Food","@odata.id":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(3)","@odata.editLink":"Foods(3)","FoodID":3,"Name":"Brown Sugar","UnitPrice":1.6,"ServingSize@odata.type":"#Decimal","ServingSize":1,"MeasurementUnit":"TSP.","ProteinGrams@odata.type":"#Byte","ProteinGrams":0,"FatGrams@odata.type":"#Int16","FatGrams":0,"CarbohydrateGrams":5,"CaloriesPerServing@odata.type":"#Int64","CaloriesPerServing":16,"IsAvailable":true,"ExpirationDate@odata.type":"#DateTimeOffset","ExpirationDate":"2011-12-28T00:00:00Z","ItemGUID@odata.type":"#Guid","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight@odata.type":"#Single","Weight":4.5,"AvailableUnits@odata.type":"#SByte","AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames@odata.type":"#Collection(String)","AlternativeNames":[],"Providers@odata.type":"#Collection(DataJS.Tests.V4.Provider)","Providers":[],"SpatialData":null,"Category@odata.navigationLink":"Foods(3)/Category"},{"@odata.type":"#DataJS.Tests.V4.PreparedFood","@odata.id":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(4)","@odata.editLink":"Foods(4)/DataJS.Tests.V4.PreparedFood","FoodID":4,"Name":"Cobb Salad","UnitPrice":1.99,"ServingSize@odata.type":"#Decimal","ServingSize":-1,"MeasurementUnit":"cups","ProteinGrams@odata.type":"#Byte","ProteinGrams":6,"FatGrams@odata.type":"#Int16","FatGrams":1,"CarbohydrateGrams":3,"CaloriesPerServing@odata.type":"#Int64","CaloriesPerServing":5,"IsAvailable":true,"ExpirationDate@odata.type":"#DateTimeOffset","ExpirationDate":"2000-12-29T00:00:00Z","ItemGUID@odata.type":"#Guid","ItemGUID":"01234567-89ab-cdef-0123-456789abcdef","Weight@odata.type":"#Single","Weight":5.674,"AvailableUnits@odata.type":"#SByte","AvailableUnits":127,"Packaging":null,"CookedSize":null,"AlternativeNames@odata.type":"#Collection(String)","AlternativeNames":[],"Providers@odata.type":"#Collection(DataJS.Tests.V4.Provider)","Providers":[],"SpatialData":null,"Instructions":"1.) Open 2.) Eat","NumberOfIngredients@odata.type":"#Single","NumberOfIngredients":4,"Category@odata.navigationLink":"Foods(4)/DataJS.Tests.V4.PreparedFood/Category"}],"@odata.nextLink":"Foods?$skiptoken=4"}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods",
        "value": [{
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
            "@odata.editLink": "Foods(0)",
            "FoodID": 0,
            "Name": "flour",
            "UnitPrice": 0.19999,
            "ServingSize@odata.type": "#Decimal",
            "ServingSize": 1,
            "MeasurementUnit": "Cup",
            "ProteinGrams@odata.type": "#Byte",
            "ProteinGrams": 3,
            "FatGrams@odata.type": "#Int16",
            "FatGrams": 1,
            "CarbohydrateGrams": 20,
            "CaloriesPerServing@odata.type": "#Int64",
            "CaloriesPerServing": 140,
            "IsAvailable": true,
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ExpirationDate": "2010-12-25T12:00:00Z",
            "ItemGUID@odata.type": "#Guid",
            "ItemGUID": "27272727-2727-2727-2727-272727272727",
            "Weight@odata.type": "#Single",
            "Weight": 10,
            "AvailableUnits@odata.type": "#SByte",
            "AvailableUnits": 1,
            "Packaging": {
                "@odata.type": "#DataJS.Tests.V4.Package",
                "Type": null,
                "Color": "",
                "NumberPerPackage": 2147483647,
                "RequiresRefridgeration": false,
                "ShipDate@odata.type": "#DateTimeOffset",
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "@odata.type": "#DataJS.Tests.V4.Dimensions",
                    "Length@odata.type": "#Decimal",
                    "Length": 7.922816251426434e+28,
                    "Height@odata.type": "#Int16",
                    "Height": 32767,
                    "Width@odata.type": "#Int64",
                    "Width": 9223372036854776000,
                    "Volume": 1.7976931348623157e+308,
                    "Volume@odata.type": "#Int32"
                },
                "Color@odata.type": "#String",
                "NumberPerPackage@odata.type": "#Int32",
                "RequiresRefridgeration@odata.type": "#Boolean"
            },
            "CookedSize": {
                "@odata.type": "#DataJS.Tests.V4.CookedDimensions",
                "Length@odata.type": "#Decimal",
                "Length": 2,
                "Height@odata.type": "#Int16",
                "Height": 1,
                "Width@odata.type": "#Int64",
                "Width": 3,
                "Volume": 6,
                "Volume@odata.type": "#Int32"
            },
            "AlternativeNames@odata.type": "#Collection(String)",
            "AlternativeNames": ["ground cereal", "ground grain"],
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "Providers": [{
                "@odata.type": "#DataJS.Tests.V4.Provider",
                "Name": "Flour Provider",
                "Aliases@odata.type": "#Collection(String)",
                "Aliases": ["fp1", "flour provider1"],
                "Details": {
                    "@odata.type": "#DataJS.Tests.V4.ProviderDetails",
                    "Telephone": "555-555-555",
                    "PreferredCode": 1001,
                    "Telephone@odata.type": "#String",
                    "PreferredCode@odata.type": "#Int32"
                },
                "Name@odata.type": "#String"
            }, {
                "@odata.type": "#DataJS.Tests.V4.Provider",
                "Name": "Ground Grains",
                "Aliases@odata.type": "#Collection(String)",
                "Aliases": [],
                "Details": null,
                "Name@odata.type": "#String"
            }],
            "SpatialData@odata.type": "#GeometryCollection",
            "SpatialData": {
                "type": "GeometryCollection",
                "geometries": [{"type": "Point", "coordinates": [5, 5]}],
                "crs": {
                    "type": "name",
                    "properties": {"name": "EPSG:4326"}
                }
            },
            "Category@odata.navigationLink": "Foods(0)/Category",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "CarbohydrateGrams@odata.type": "#Int32",
            "IsAvailable@odata.type": "#Boolean"
        }, {
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(1)",
            "@odata.editLink": "Foods(1)",
            "FoodID": 1,
            "Name": "sugar",
            "UnitPrice": 0.2,
            "ServingSize@odata.type": "#Decimal",
            "ServingSize": 1,
            "MeasurementUnit": "tsp",
            "ProteinGrams@odata.type": "#Byte",
            "ProteinGrams": 0,
            "FatGrams@odata.type": "#Int16",
            "FatGrams": 0,
            "CarbohydrateGrams": 4,
            "CaloriesPerServing@odata.type": "#Int64",
            "CaloriesPerServing": 16,
            "IsAvailable": false,
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID@odata.type": "#Guid",
            "ItemGUID": "ffffffff-ffff-ffff-ffff-ffffffffffff",
            "Weight@odata.type": "#Single",
            "Weight": 0.1,
            "AvailableUnits@odata.type": "#SByte",
            "AvailableUnits": 0,
            "Packaging": {
                "@odata.type": "#DataJS.Tests.V4.Package",
                "Type": " ",
                "Color": "BLUE",
                "NumberPerPackage": -2147483648,
                "RequiresRefridgeration": true,
                "ShipDate@odata.type": "#DateTimeOffset",
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": {
                    "@odata.type": "#DataJS.Tests.V4.Dimensions",
                    "Length@odata.type": "#Decimal",
                    "Length": -7.922816251426434e+28,
                    "Height@odata.type": "#Int16",
                    "Height": -32768,
                    "Width@odata.type": "#Int64",
                    "Width": -9223372036854776000,
                    "Volume": -1.7976931348623157e+308,
                    "Volume@odata.type": "#Int32"
                },
                "Type@odata.type": "#String",
                "Color@odata.type": "#String",
                "NumberPerPackage@odata.type": "#Int32",
                "RequiresRefridgeration@odata.type": "#Boolean"
            },
            "CookedSize": null,
            "AlternativeNames@odata.type": "#Collection(String)",
            "AlternativeNames": [],
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "Providers": [],
            "SpatialData": null,
            "Category@odata.navigationLink": "Foods(1)/Category",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "CarbohydrateGrams@odata.type": "#Int32",
            "IsAvailable@odata.type": "#Boolean"
        }, {
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(2)",
            "@odata.editLink": "Foods(2)",
            "FoodID": 2,
            "Name": "1 Chicken Egg",
            "UnitPrice": 0.55,
            "ServingSize@odata.type": "#Decimal",
            "ServingSize": 1,
            "MeasurementUnit": null,
            "ProteinGrams@odata.type": "#Byte",
            "ProteinGrams": 6,
            "FatGrams@odata.type": "#Int16",
            "FatGrams": 1,
            "CarbohydrateGrams": 1,
            "CaloriesPerServing@odata.type": "#Int64",
            "CaloriesPerServing": 70,
            "IsAvailable": true,
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID@odata.type": "#Guid",
            "ItemGUID": "00000000-0000-0000-0000-000000000000",
            "Weight@odata.type": "#Single",
            "Weight": 0,
            "AvailableUnits@odata.type": "#SByte",
            "AvailableUnits": -128,
            "Packaging": {
                "@odata.type": "#DataJS.Tests.V4.Package",
                "Type": "18     - Carton",
                "Color": " brown ",
                "NumberPerPackage": 0,
                "RequiresRefridgeration": true,
                "ShipDate@odata.type": "#DateTimeOffset",
                "ShipDate": "2000-12-29T00:00:00Z",
                "PackageDimensions": null,
                "Type@odata.type": "#String",
                "Color@odata.type": "#String",
                "NumberPerPackage@odata.type": "#Int32",
                "RequiresRefridgeration@odata.type": "#Boolean"
            },
            "CookedSize": null,
            "AlternativeNames@odata.type": "#Collection(String)",
            "AlternativeNames": [],
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "Providers": [],
            "SpatialData": null,
            "Category@odata.navigationLink": "Foods(2)/Category",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Decimal",
            "CarbohydrateGrams@odata.type": "#Int32",
            "IsAvailable@odata.type": "#Boolean"
        }, {
            "@odata.type": "#DataJS.Tests.V4.Food",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(3)",
            "@odata.editLink": "Foods(3)",
            "FoodID": 3,
            "Name": "Brown Sugar",
            "UnitPrice": 1.6,
            "ServingSize@odata.type": "#Decimal",
            "ServingSize": 1,
            "MeasurementUnit": "TSP.",
            "ProteinGrams@odata.type": "#Byte",
            "ProteinGrams": 0,
            "FatGrams@odata.type": "#Int16",
            "FatGrams": 0,
            "CarbohydrateGrams": 5,
            "CaloriesPerServing@odata.type": "#Int64",
            "CaloriesPerServing": 16,
            "IsAvailable": true,
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ExpirationDate": "2011-12-28T00:00:00Z",
            "ItemGUID@odata.type": "#Guid",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight@odata.type": "#Single",
            "Weight": 4.5,
            "AvailableUnits@odata.type": "#SByte",
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames@odata.type": "#Collection(String)",
            "AlternativeNames": [],
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "Providers": [],
            "SpatialData": null,
            "Category@odata.navigationLink": "Foods(3)/Category",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "CarbohydrateGrams@odata.type": "#Int32",
            "IsAvailable@odata.type": "#Boolean"
        }, {
            "@odata.type": "#DataJS.Tests.V4.PreparedFood",
            "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(4)",
            "@odata.editLink": "Foods(4)/DataJS.Tests.V4.PreparedFood",
            "FoodID": 4,
            "Name": "Cobb Salad",
            "UnitPrice": 1.99,
            "ServingSize@odata.type": "#Decimal",
            "ServingSize": -1,
            "MeasurementUnit": "cups",
            "ProteinGrams@odata.type": "#Byte",
            "ProteinGrams": 6,
            "FatGrams@odata.type": "#Int16",
            "FatGrams": 1,
            "CarbohydrateGrams": 3,
            "CaloriesPerServing@odata.type": "#Int64",
            "CaloriesPerServing": 5,
            "IsAvailable": true,
            "ExpirationDate@odata.type": "#DateTimeOffset",
            "ExpirationDate": "2000-12-29T00:00:00Z",
            "ItemGUID@odata.type": "#Guid",
            "ItemGUID": "01234567-89ab-cdef-0123-456789abcdef",
            "Weight@odata.type": "#Single",
            "Weight": 5.674,
            "AvailableUnits@odata.type": "#SByte",
            "AvailableUnits": 127,
            "Packaging": null,
            "CookedSize": null,
            "AlternativeNames@odata.type": "#Collection(String)",
            "AlternativeNames": [],
            "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
            "Providers": [],
            "SpatialData": null,
            "Instructions": "1.) Open 2.) Eat",
            "NumberOfIngredients@odata.type": "#Single",
            "NumberOfIngredients": 4,
            "Category@odata.navigationLink": "Foods(4)/DataJS.Tests.V4.PreparedFood/Category",
            "FoodID@odata.type": "#Int32",
            "Name@odata.type": "#String",
            "UnitPrice@odata.type": "#Decimal",
            "MeasurementUnit@odata.type": "#String",
            "CarbohydrateGrams@odata.type": "#Int32",
            "IsAvailable@odata.type": "#Boolean",
            "Instructions@odata.type": "#String"
        }],
        "@odata.nextLink": "Foods?$skiptoken=4"
    }
}, {
    description: "Entry with metadata=full",
    header: "application/json;odata.metadata=full",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods/$entity","@odata.type":"#DataJS.Tests.V4.Food","@odata.id":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)","@odata.editLink":"Foods(0)","FoodID":0,"Name":"flour","UnitPrice":0.19999,"ServingSize@odata.type":"#Decimal","ServingSize":1,"MeasurementUnit":"Cup","ProteinGrams@odata.type":"#Byte","ProteinGrams":3,"FatGrams@odata.type":"#Int16","FatGrams":1,"CarbohydrateGrams":20,"CaloriesPerServing@odata.type":"#Int64","CaloriesPerServing":140,"IsAvailable":true,"ExpirationDate@odata.type":"#DateTimeOffset","ExpirationDate":"2010-12-25T12:00:00Z","ItemGUID@odata.type":"#Guid","ItemGUID":"27272727-2727-2727-2727-272727272727","Weight@odata.type":"#Single","Weight":10,"AvailableUnits@odata.type":"#SByte","AvailableUnits":1,"Packaging":{"@odata.type":"#DataJS.Tests.V4.Package","Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate@odata.type":"#DateTimeOffset","ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"@odata.type":"#DataJS.Tests.V4.Dimensions","Length@odata.type":"#Decimal","Length":79228162514264337593543950335,"Height@odata.type":"#Int16","Height":32767,"Width@odata.type":"#Int64","Width":9223372036854775807,"Volume":1.7976931348623157E+308}},"CookedSize":{"@odata.type":"#DataJS.Tests.V4.CookedDimensions","Length@odata.type":"#Decimal","Length":2,"Height@odata.type":"#Int16","Height":1,"Width@odata.type":"#Int64","Width":3,"Volume":6.0},"AlternativeNames@odata.type":"#Collection(String)","AlternativeNames":["ground cereal","ground grain"],"Providers@odata.type":"#Collection(DataJS.Tests.V4.Provider)","Providers":[{"@odata.type":"#DataJS.Tests.V4.Provider","Name":"Flour Provider","Aliases@odata.type":"#Collection(String)","Aliases":["fp1","flour provider1"],"Details":{"@odata.type":"#DataJS.Tests.V4.ProviderDetails","Telephone":"555-555-555","PreferredCode":1001}},{"@odata.type":"#DataJS.Tests.V4.Provider","Name":"Ground Grains","Aliases@odata.type":"#Collection(String)","Aliases":[],"Details":null}],"SpatialData@odata.type":"#GeometryCollection","SpatialData":{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[5.0,5.0]}],"crs":{"type":"name","properties":{"name":"EPSG:4326"}}},"Category@odata.navigationLink":"Foods(0)/Category"}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods/$entity",
        "@odata.type": "#DataJS.Tests.V4.Food",
        "@odata.id": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)",
        "@odata.editLink": "Foods(0)",
        "FoodID": 0,
        "Name": "flour",
        "UnitPrice": 0.19999,
        "ServingSize@odata.type": "#Decimal",
        "ServingSize": 1,
        "MeasurementUnit": "Cup",
        "ProteinGrams@odata.type": "#Byte",
        "ProteinGrams": 3,
        "FatGrams@odata.type": "#Int16",
        "FatGrams": 1,
        "CarbohydrateGrams": 20,
        "CaloriesPerServing@odata.type": "#Int64",
        "CaloriesPerServing": 140,
        "IsAvailable": true,
        "ExpirationDate@odata.type": "#DateTimeOffset",
        "ExpirationDate": "2010-12-25T12:00:00Z",
        "ItemGUID@odata.type": "#Guid",
        "ItemGUID": "27272727-2727-2727-2727-272727272727",
        "Weight@odata.type": "#Single",
        "Weight": 10,
        "AvailableUnits@odata.type": "#SByte",
        "AvailableUnits": 1,
        "Packaging": {
            "@odata.type": "#DataJS.Tests.V4.Package",
            "Type": null,
            "Color": "",
            "NumberPerPackage": 2147483647,
            "RequiresRefridgeration": false,
            "ShipDate@odata.type": "#DateTimeOffset",
            "ShipDate": "2000-12-29T00:00:00Z",
            "PackageDimensions": {
                "@odata.type": "#DataJS.Tests.V4.Dimensions",
                "Length@odata.type": "#Decimal",
                "Length": 7.922816251426434e+28,
                "Height@odata.type": "#Int16",
                "Height": 32767,
                "Width@odata.type": "#Int64",
                "Width": 9223372036854776000,
                "Volume": 1.7976931348623157e+308,
                "Volume@odata.type": "#Int32"
            },
            "Color@odata.type": "#String",
            "NumberPerPackage@odata.type": "#Int32",
            "RequiresRefridgeration@odata.type": "#Boolean"
        },
        "CookedSize": {
            "@odata.type": "#DataJS.Tests.V4.CookedDimensions",
            "Length@odata.type": "#Decimal",
            "Length": 2,
            "Height@odata.type": "#Int16",
            "Height": 1,
            "Width@odata.type": "#Int64",
            "Width": 3,
            "Volume": 6,
            "Volume@odata.type": "#Int32"
        },
        "AlternativeNames@odata.type": "#Collection(String)",
        "AlternativeNames": ["ground cereal", "ground grain"],
        "Providers@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
        "Providers": [{
            "@odata.type": "#DataJS.Tests.V4.Provider",
            "Name": "Flour Provider",
            "Aliases@odata.type": "#Collection(String)",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {
                "@odata.type": "#DataJS.Tests.V4.ProviderDetails",
                "Telephone": "555-555-555",
                "PreferredCode": 1001,
                "Telephone@odata.type": "#String",
                "PreferredCode@odata.type": "#Int32"
            },
            "Name@odata.type": "#String"
        }, {
            "@odata.type": "#DataJS.Tests.V4.Provider",
            "Name": "Ground Grains",
            "Aliases@odata.type": "#Collection(String)",
            "Aliases": [],
            "Details": null,
            "Name@odata.type": "#String"
        }],
        "SpatialData@odata.type": "#GeometryCollection",
        "SpatialData": {
            "type": "GeometryCollection",
            "geometries": [{"type": "Point", "coordinates": [5, 5] }],
            "crs": {
                "type": "name",
                "properties": {"name": "EPSG:4326"}
            }
        },
        "Category@odata.navigationLink": "Foods(0)/Category",
        "FoodID@odata.type": "#Int32",
        "Name@odata.type": "#String",
        "UnitPrice@odata.type": "#Decimal",
        "MeasurementUnit@odata.type": "#String",
        "CarbohydrateGrams@odata.type": "#Int32",
        "IsAvailable@odata.type": "#Boolean"
    }
}, {
    description: "Collection of Complex with metadata=full",
    header: "application/json;odata.metadata=full",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Providers",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Providers","@odata.type":"#Collection(DataJS.Tests.V4.Provider)","value":[{"@odata.type":"#DataJS.Tests.V4.Provider","Name":"Flour Provider","Aliases@odata.type":"#Collection(String)","Aliases":["fp1","flour provider1"],"Details":{"@odata.type":"#DataJS.Tests.V4.ProviderDetails","Telephone":"555-555-555","PreferredCode":1001}},{"@odata.type":"#DataJS.Tests.V4.Provider","Name":"Ground Grains","Aliases@odata.type":"#Collection(String)","Aliases":[],"Details":null}]}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Providers",
        "@odata.type": "#Collection(DataJS.Tests.V4.Provider)",
        "value": [{
            "@odata.type": "#DataJS.Tests.V4.Provider",
            "Name": "Flour Provider",
            "Aliases@odata.type": "#Collection(String)",
            "Aliases": ["fp1", "flour provider1"],
            "Details": {
                "@odata.type": "#DataJS.Tests.V4.ProviderDetails",
                "Telephone": "555-555-555",
                "PreferredCode": 1001,
                "Telephone@odata.type": "#String",
                "PreferredCode@odata.type": "#Int32"
            },
            "Name@odata.type": "#String"
        }, {
            "@odata.type": "#DataJS.Tests.V4.Provider",
            "Name": "Ground Grains",
            "Aliases@odata.type": "#Collection(String)",
            "Aliases": [],
            "Details": null,
            "Name@odata.type": "#String"
        }]
    }
}, {
    description: "Collection of Simple with metadata=full",
    header: "application/json;odata.metadata=full",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/AlternativeNames",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/AlternativeNames","@odata.type":"#Collection(String)","value":["ground cereal","ground grain"]}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/AlternativeNames",
        "@odata.type": "#Collection(String)",
        "value": ["ground cereal", "ground grain"]
    }
}, {
    description: "Collection Property with metadata=full",
    header: "application/json;odata.metadata=full",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Packaging",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Packaging","@odata.type":"#DataJS.Tests.V4.Package","Type":null,"Color":"","NumberPerPackage":2147483647,"RequiresRefridgeration":false,"ShipDate@odata.type":"#DateTimeOffset","ShipDate":"2000-12-29T00:00:00Z","PackageDimensions":{"@odata.type":"#DataJS.Tests.V4.Dimensions","Length@odata.type":"#Decimal","Length":79228162514264337593543950335,"Height@odata.type":"#Int16","Height":32767,"Width@odata.type":"#Int64","Width":9223372036854775807,"Volume":1.7976931348623157E+308}}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Packaging",
        "@odata.type": "#DataJS.Tests.V4.Package",
        "Type": null,
        "Color": "",
        "NumberPerPackage": 2147483647,
        "RequiresRefridgeration": false,
        "ShipDate@odata.type": "#DateTimeOffset",
        "ShipDate": "2000-12-29T00:00:00Z",
        "PackageDimensions": {
            "@odata.type": "#DataJS.Tests.V4.Dimensions",
            "Length@odata.type": "#Decimal",
            "Length": 7.922816251426434e+28,
            "Height@odata.type": "#Int16",
            "Height": 32767,
            "Width@odata.type": "#Int64",
            "Width": 9223372036854776000,
            "Volume": 1.7976931348623157e+308,
            "Volume@odata.type": "#Int32"
        },
        "Color@odata.type": "#String",
        "NumberPerPackage@odata.type": "#Int32",
        "RequiresRefridgeration@odata.type": "#Boolean"
    }
}, {
    description: "Simple Property with metadata=full",
    header: "application/json;odata.metadata=full",
    usedUrl: "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/Foods(0)/Name",
    input: '{"@odata.context":"http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Name","value":"flour"}',
    expected: {
        "@odata.context": "http://localhost:4002/tests/endpoints/FoodStoreDataServiceV4.svc/$metadata#Foods(0)/Name",
        "value": "flour",
        "value@odata.type": "#String"
    }
}];


var testDataJsonParser1 = [
    {context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"}, expected: {}},
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            "@odata.context": "http://foo/OData.svc/$metadata",
            value: [
                {
                    name: "Products",
                    kind: "EntitySet",
                    url: "Products"
                },
                {
                    name: "ProductDetails",
                    kind: "EntitySet",
                    url: "ProductDetails"
                }
            ]
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            value: [
                {
                    name: "Products",
                    kind: "EntitySet",
                    url: "http://foo/OData.svc/Products"
                },
                {
                    name: "ProductDetails",
                    kind: "EntitySet",
                    url: "http://foo/OData.svc/ProductDetails"
                }
            ]
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {"@odata.context": "http://foo/OData.svc/$metadata#Products(0)/Name", value: "Bread"}
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            "@odata.context": "http://foo/OData.svc/$metadata#Products",
            value: [
                {
                    "@odata.type": "#ODataDemo.Product",
                    "@odata.id": "http://foo/OData.svc/Products(0)",
                    "@odata.editLink": "Products(0)",
                    "Categories@odata.navigationLink": "Products(0)/Categories",
                    "Categories@odata.associationLink": "Products(0)/Categories/$ref",
                    "Supplier@odata.navigationLink": "Products(0)/Supplier",
                    "Supplier@odata.associationLink": "Products(0)/Supplier/$ref",
                    "ProductDetail@odata.navigationLink": "Products(0)/ProductDetail",
                    "ProductDetail@odata.associationLink": "Products(0)/ProductDetail/$ref",
                    ID: 0,
                    Name: "Bread",
                    Description: "Whole grain bread",
                    "ReleaseDate@odata.type": "#DateTimeOffset",
                    ReleaseDate: "1992-01-01T00:00:00Z",
                    DiscontinuedDate: null,
                    "Rating@odata.type": "#Int16",
                    Rating: 4,
                    Price: 2.5
                }]
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            "@odata.context": "http://foo/OData.svc/$metadata#Products",
            value: [
                {
                    ID: 0,
                    Name: "Bread",
                    Description: "Whole grain bread",
                    ReleaseDate: "1992-01-01T00:00:00Z",
                    DiscontinuedDate: null,
                    Rating: 4,
                    Price: 2.5
                }]
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            value: [
                {
                    ID: 0,
                    Name: "Bread",
                    Description: "Whole grain bread",
                    ReleaseDate: "1992-01-01T00:00:00Z",
                    DiscontinuedDate: null,
                    Rating: 4,
                    Price: 2.5
                }]
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            "@odata.context": "http://foo/OData.svc/$metadata#Products/$entry",
            "@odata.type": "#ODataDemo.Product",
            "@odata.id": "http://foo/OData.svc/Products(0)",
            "@odata.editLink": "Products(0)",
            "Categories@odata.navigationLink": "Products(0)/Categories",
            "Categories@odata.associationLink": "Products(0)/Categories/$ref",
            "Supplier@odata.navigationLink": "Products(0)/Supplier",
            "Supplier@odata.associationLink": "Products(0)/Supplier/$ref",
            "ProductDetail@odata.navigationLink": "Products(0)/ProductDetail",
            "ProductDetail@odata.associationLink": "Products(0)/ProductDetail/$ref",
            ID: 0,
            Name: "Bread",
            Description: "Whole grain bread",
            "ReleaseDate@odata.type": "#DateTimeOffset",
            ReleaseDate: "1992-01-01T00:00:00Z",
            DiscontinuedDate: null,
            "Rating@odata.type": "#Int16",
            Rating: 4,
            Price: 2.5
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            "@odata.context": "http://foo/OData.svc/$metadata#Products/$entry",
            ID: 0,
            Name: "Bread",
            Description: "Whole grain bread",
            ReleaseDate: "1992-01-01T00:00:00Z",
            DiscontinuedDate: null,
            Rating: 4,
            Price: 2.5
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            ID: 0,
            Name: "Bread",
            Description: "Whole grain bread",
            ReleaseDate: "1992-01-01T00:00:00Z",
            DiscontinuedDate: null,
            Rating: 4,
            Price: 2.5
        }
    },
    {
        context: {response: {requestUri: "http://base.org"}, dataServiceVersion: "4.0"},
        expected: {
            "@odata.context": "http://foo/$metadata#Customer(-10)/PrimaryContactInfo/AlternativeNames",
            "@odata.type": "#Collection(String)",
            value: [
                "グぁマせぺﾈソぁぼソひバたぴソ歹九ﾈボボяポソ畚クяせべ歹珱Я欲タハバミ裹ぼボをｦ歹んひ九ひ匚ぁａ",
                "qckrnuruxcbhjfimnsykgfquffobcadpsaocixoeljhspxrhebkudppgndgcrlyvynqhbujrnvyxyymhnroemigogsqulvgallta",
                "btsnhqrjqryqzgxducl",
                "qbtlssjhunufmzdv",
                "ボんЯぜチべゼボボほａ匚ミぼ九ぁひチ珱黑ミんぁタび暦クソソボゾんんあゼぞひタボタぜん弌ひべ匚",
                "vicqasfdkxsuyuzspjqunxpyfuhlxfhgfqnlcpdfivqnxqoothnfsbuykfguftgulgldnkkzufssbae",
                "九ソミせボぜゾボёａをぜЯまゾタぜタひ縷ダんａバたゼソ",
                "ぽマタぁぁ黑ソゼミゼ匚ｚソダマぁァゾぽミａタゾ弌ミゼタそｚぺポせ裹バポハハｦぺチあマ匚ミ",
                "hssiißuamtctgqhglmusexyikhcsqctusonubxorssyizhyqpbtbdßjnelxqttkhdalabibuqhiubtßsptrmzelud",
                "gbjssllxzzxkmßppyyrhgmoeßizlcmsuqqnvjßudszevtfunflqzqcuubukypßqjcix"
            ]
        }
    }
];


/*-----------------------------------------------*/
/*-----------------------------------------------*/
/*-----------------------------------------------*/
/*-----------------------------------------------*/
/*-----------------------------------------------*/
/*-----------------------------------------------*/
/*-----------------------------------------------*/
describe('TEST odata-json.js', function () {
    describe('with odata.metadata=none', function () {
        for (var i = 0; i < testDataJsonParserMetadataNone.length; i++) {
            callTest_None(testDataJsonParserMetadataNone[i], context);
        }
    });
    
    describe('with odata.metadata=minimal', function () {
        for (var i = 0; i < testDataJsonParserMetadataMinimal.length; i++) {
            callTest_Minimal(testDataJsonParserMetadataMinimal[i], context);
        }
    });
    
    describe('with odata.metadata=minimal to full', function () {
        for (var i = 0; i < testDataJsonParserMetadataMinimalToFull.length; i++) {
            callTest_MinimalToFull(testDataJsonParserMetadataMinimalToFull[i], context);
        }
    });
    
    describe('with odata.metadata=full', function () {
        for (var i = 0; i < testDataJsonParserMetadataFull.length; i++) {
            callTest_Full(testDataJsonParserMetadataFull[i], context);
        }
    });
});