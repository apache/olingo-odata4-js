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
    description: "Complex Property with metadata=none",
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
    description: "Complex Property with metadata=minimal",
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
        "@odata.type": "#Collection(String)",
        "value": ["ground cereal", "ground grain"]
    }
}, {
    description: "Complex Property with metadata=minimal",
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
    description: "Complex Property with metadata=full",
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


var callTestNoMetadata = function (testData) {
    var testData = testData;
    it(testData.description, function (done) {
        var request = {
            requestUri: testData.usedUrl,
            headers: {
                Accept: testData.header
            }
        };
        
        var success = function success(data) {
            assert.deepEqual(data, testData.expected, "test '" + testData.description + "' didn't return the expected data");
            done();
        };
        
        var errorFunc = function errorFunc(err) {
            assert.fail('errorFunc', 'success', 'success should called');
            done(err);
        };
        
        odatajs.oData.read(request, success, errorFunc);
    });
};

var callTestMetadata = function (testData, metadataContainer) {
    
    var testData = testData;
    it(testData.description, function (done) {
        
        var request = {
            requestUri: testData.usedUrl,
            headers: {
                Accept: testData.header
            }
        };
        
        var success = function success(data) {
            assert.deepEqual(data, testData.expected, "test '" + testData.description + "' didn't return the expected data");
            done();
        };
        
        var errorFunc = function errorFunc(err) {
            done(err);
        };
        
        odatajs.oData.read(request, success, errorFunc, null, null, metadataContainer.metadata);
    });
};

describe('TEST Scenario (needs c# test server on localhost:4002)', function () {
    
    describe('with odata.metadata=none', function () {
        for (var i = 0; i < testDataJsonParserMetadataNone.length; i++) {
            
            callTestNoMetadata(testDataJsonParserMetadataNone[i]);
            
        }
    });
    
    describe('with odata.metadata=minimal', function () {
        for (var i = 0; i < testDataJsonParserMetadataMinimal.length; i++) {
            callTestNoMetadata(testDataJsonParserMetadataMinimal[i]);
        }
    });
    
    
    describe('with odata.metadata=minimal to full', function () {
        var metadataContainer = {};
        
        function errorFunc(err) {
            assert.fail('errorFunc', 'success', 'success should called');
            //done(err);
        }
        
        before('load Metadata', function (done) {
            var metaDatasuccess = function (lmetadata) {
                
                metadataContainer.metadata = lmetadata;
                done();
            };
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
                data: null
            };
            
            odatajs.oData.read(metadataRequest, metaDatasuccess, errorFunc, odatajs.oData.metadataHandler);
        });
        
        for (var i = 0; i < testDataJsonParserMetadataMinimalToFull.length; i++) {
            callTestMetadata(testDataJsonParserMetadataMinimalToFull[i], metadataContainer);
        }
    });
    
    describe('with odata.metadata=full', function () {
        for (var i = 0; i < testDataJsonParserMetadataFull.length; i++) {
            callTestNoMetadata(testDataJsonParserMetadataFull[i]);
        }
    });
});


