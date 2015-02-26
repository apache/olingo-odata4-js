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

// odata-json-light-tests.js

(function (window, undefined) {

    // DATAJS INTERNAL START

    var mockHttpClient;

    module("Unit", {
        setup: function () {
            mockHttpClient = window.MockHttpClient.clear();
        }
    });

    var getSampleModel = function () {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "NS",
                    "entityType": [{
                        "name": "EntityType",
                        "key": { "propertyRef": [{ "name": "Id"}] },
                        "property": [
                                { "name": "Id", "type": "Edm.String" },
                                { "name": "P1", "type": "Edm.Int32" }
                         ]
                    }],
                    entityContainer: [{
                        name: "TestContainer",
                        isDefaultEntityContainer: "true",
                        entitySet: [{ "name": "EntityTypes", "entityType": "NS.EntityType"}]
                    }]
                }]
            }
        };
        return testModel;
    };

    var getSampleModelWithTwoKeys = function () {
        var testModel = getSampleModel();
        testModel.dataServices.schema[0].entityType[0].key = { "propertyRef": [{ "name": "Id" }, { "name": "P1"}] };
        return testModel;
    };

    var getSampleModelWithOneConcurrencyProperty = function () {
        var testModel = getSampleModel();
        testModel.dataServices.schema[0].entityType[0].property[0].concurrencyMode = "Fixed";
        return testModel;
    };
    
    var getSampleModelWithOneBinaryConcurrencyProperty = function () {
        var testModel = getSampleModel();
        testModel.dataServices.schema[0].entityType[0].property[1].concurrencyMode = "Fixed";
        testModel.dataServices.schema[0].entityType[0].property[1].type = "Edm.Binary";
        return testModel;
    };

    var getSampleModelWithMultipleConcurrencyProperties = function () {
        var testModel = getSampleModel();
        testModel.dataServices.schema[0].entityType[0].property[0].concurrencyMode = "Fixed";
        testModel.dataServices.schema[0].entityType[0].property[1].concurrencyMode = "Fixed";
        return testModel;
    };

    var getSampleModelWithDateTimeConcurrencyProperties = function () {
        var testModel = getSampleModel();
        testModel.dataServices.schema[0].entityType[0].property[1] = { "name": "P1", "type": "Edm.DateTime", concurrencyMode: "Fixed" };
        return testModel;
    };
    
    var getSampleModelWithDecimalProperty = function () {
        var testModel = getSampleModel();
        testModel.dataServices.schema[0].entityType[0].property[1] = { "name": "P1", "type": "Edm.Decimal"};
        return testModel;
    };

    var getSampleModelWithNavPropertiesAndInheritedTypes = function () {
        return {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "maxDataServiceVersion": "4.0",
                "schema": [
                    {
                        "namespace": "ODataDemo",
                        "entityType": [
                            {
                                "name": "Product",
                                "key": {
                                    "propertyRef": [
                                        {
                                            "name": "ID"
                                        }
                                    ]
                                },
                                "property": [
                                    {
                                        "name": "ID",
                                        "nullable": "false",
                                        "type": "Edm.Int32"
                                    }
                                ],
                                "navigationProperty": [
                                    {
                                        "name": "Category",
                                        "toRole": "Category_Products",
                                        "fromRole": "Product_Category",
                                        "relationship": "ODataDemo.Product_Category_Category_Products"
                                    }]
                            },
                            {
                                "name": "FeaturedProduct",
                                "baseType": "ODataDemo.Product",
                                "navigationProperty": [
                                    {
                                        "name": "Advertisement",
                                        "toRole": "Advertisement_FeaturedProduct",
                                        "fromRole": "FeaturedProduct_Advertisement",
                                        "relationship": "ODataDemo.FeaturedProduct_Advertisement_Advertisement_FeaturedProduct"
                                    }
                                ]
                            },
                            {
                                "name": "Advertisement",
                                "key": {
                                    "propertyRef": [
                                        {
                                            "name": "ID"
                                        }
                                    ]
                                },
                                "property": [
                                    {
                                        "name": "ID",
                                        "nullable": "false",
                                        "type": "Edm.Guid"
                                    }
                                ],
                                "navigationProperty": [
                                    {
                                        "name": "FeaturedProduct",
                                        "toRole": "FeaturedProduct_Advertisement",
                                        "fromRole": "Advertisement_FeaturedProduct",
                                        "relationship": "ODataDemo.FeaturedProduct_Advertisement_Advertisement_FeaturedProduct"
                                    }
                                ]
                            },
                            {
                                "name": "Category",
                                "key": {
                                    "propertyRef": [
                                        {
                                            "name": "ID"
                                        }
                                    ]
                                },
                                "property": [
                                    {
                                        "name": "ID",
                                        "nullable": "false",
                                        "type": "Edm.Int32"
                                    }
                                ],
                                "navigationProperty": [
                                    {
                                        "name": "Products",
                                        "toRole": "Product_Category",
                                        "fromRole": "Category_Products",
                                        "relationship": "ODataDemo.Product_Category_Category_Products"
                                    }
                                ]
                            }
                        ],
                        "association": [
                            {
                                "name": "Product_Category_Category_Products",
                                "end": [
                                    {
                                        "type": "ODataDemo.Category",
                                        "multiplicity": "0..1",
                                        "role": "Category_Products"
                                    },
                                    {
                                        "type": "ODataDemo.Product",
                                        "multiplicity": "*",
                                        "role": "Product_Category"
                                    }
                                ]
                            },
                            {
                                "name": "FeaturedProduct_Advertisement_Advertisement_FeaturedProduct",
                                "end": [
                                    {
                                        "type": "ODataDemo.Advertisement",
                                        "multiplicity": "0..1",
                                        "role": "Advertisement_FeaturedProduct"
                                    },
                                    {
                                        "type": "ODataDemo.FeaturedProduct",
                                        "multiplicity": "0..1",
                                        "role": "FeaturedProduct_Advertisement"
                                    }
                                ]
                            }
                        ],
                        "entityContainer": [
                            {
                                "name": "DemoService",
                                "isDefaultEntityContainer": "true",
                                "entitySet": [
                                    {
                                        "name": "Products",
                                        "entityType": "ODataDemo.Product"
                                    },
                                    {
                                        "name": "Advertisements",
                                        "entityType": "ODataDemo.Advertisement"
                                    },
                                    {
                                        "name": "Categories",
                                        "entityType": "ODataDemo.Category"
                                    }
                                ],
                                "associationSet": [
                                    {
                                        "name": "Products_Advertisement_Advertisements",
                                        "association": "ODataDemo.FeaturedProduct_Advertisement_Advertisement_FeaturedProduct",
                                        "end": [
                                            {
                                                "role": "FeaturedProduct_Advertisement",
                                                "entitySet": "Products"
                                            },
                                            {
                                                "role": "Advertisement_FeaturedProduct",
                                                "entitySet": "Advertisements"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "Products_Category_Categories",
                                        "association": "ODataDemo.Product_Category_Category_Products",
                                        "end": [
                                            {
                                                "role": "Product_Category",
                                                "entitySet": "Products"
                                            },
                                            {
                                                "role": "Category_Products",
                                                "entitySet": "Categories"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    };

    var failTest = function (err) {
        if (err && err.message) {
            djstest.fail(err.message);
        } else {
            djstest.fail("unexpected failure");
        }
        djstest.done();
    };

    var verifySerializedJsonLightData = function (actual, expected, message, requestUri) {
        mockHttpClient.addRequestVerifier("*", function (request) {
            djstest.assertAreEqualDeep(JSON.parse(request.body), expected, message);
            djstest.done();
        });

        odatajs.oData.request({
            requestUri: requestUri || "http://someUri",
            headers: { "Content-Type": "application/json" },
            method: "PUT",
            data: actual
        }, null, failTest, null, mockHttpClient);
    };

    var verifyReadJsonLightData = function (input, expected, message, model) {
        var response = { headers: { "Content-Type": "application/json;odata.metadata=full", DataServiceVersion: "4.0" }, body: JSON.stringify(input) };

        window.odatajs.oData.json.jsonHandler.read(response, { metadata: model });
        djstest.assertAreEqualDeep(response.data, expected, message);
    };

    var verifyReadJsonLightWithMinimalMetadata = function (input, expected, message, model) {
        var response = { headers: { "Content-Type": "application/json;odata.metadata=minimal", DataServiceVersion: "4.0" }, body: JSON.stringify(input) };

        OData.jsonHandler.read(response, { metadata: model });
        djstest.assertAreEqualDeep(response.data, expected, message);
    };


    djstest.addTest(function jsonLightReadEmptySvcDocTest() {
        var input = {
            "odata.metadata": "http://someUri/ODataService.svc/OData/$metadata",
            "value": []
        };

        var expected = {
            workspaces: [
                {
                    collections: []
                }
            ]
        };

        verifyReadJsonLightData(input, expected, "Json light links document was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadSvcDocTest() {
        var input = {
            "odata.metadata": "http://someUri/ODataService.svc/OData/$metadata",
            "value": [
                { "name": "Customers", "url": "Customers" },
                { "name": "Employees", "url": "http://someUri/ODataService.svc/OData/Employees" }
            ]
        };

        var expected = {
            workspaces: [
                {
                    collections: [
                        {
                            title: "Customers",
                            href: "http://someUri/ODataService.svc/OData/Customers"
                        },
                        {
                            title: "Employees",
                            href: "http://someUri/ODataService.svc/OData/Employees"
                        }
                    ]
                }
            ]
        };

        verifyReadJsonLightData(input, expected, "Json light links document was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadEntryMetadataUriTest() {
        var tests = {
            "Qualified entity set": {
                input: { "odata.metadata": "http://someUri/$metadata#Ns.Container.EntitySet/@Element" },
                expected: { __metadata: { type: null} }
            },
            "Unqualified entity set": {
                input: { "odata.metadata": "http://someUri/$metadata#Ns.Container.EntitySet/@Element" },
                expected: { __metadata: { type: null} }
            },
            "Qualified entity set with type cast": {
                input: { "odata.metadata": "http://someUri/$metadata#Ns.Container.EntitySet/TypeCast/@Element" },
                expected: { __metadata: { type: "TypeCast"} }
            },

            "Unqualified entity set with type cast": {
                input: { "odata.metadata": "http://someUri/$metadata#EntitySet/TypeCast/@Element" },
                expected: { __metadata: { type: "TypeCast"} }
            }
        };

        for (var name in tests) {
            var test = tests[name];
            verifyReadJsonLightData(test.input, test.expected, name + " - Json light entry metadata uri was read properly.");
        }
        djstest.done();
    });

    djstest.addTest(function jsonLightReadEntryMetadataUriWithMetadataDocumentTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Test.Catalog",
                    "entityContainer": [{
                        "name": "TestCatalog",
                        "isDefaultEntityContainer": "true",
                        "entitySet": [
                           { "name": "Titles", "entityType": "TestCatalog.Model.Title" }
                    ]
                    }, {
                        "name": "GenreCatalog",
                        "isDefaultEntityContainer": "false",
                        "entitySet": [
                           { "name": "Genres", "entityType": "TestCatalog.Model.Genre" }
                    ]
                    }]
                }]
            }
        };

        var tests = {
            "Qualified entity set": {
                input: { "odata.metadata": "http://someUri/$metadata#Test.Catalog.GenreCatalog.Genres/@Element" },
                expected: { __metadata: { type: "TestCatalog.Model.Genre"} }
            },
            "Unqualified entity set": {
                input: { "odata.metadata": "http://someUri/$metadata#Titles/@Element" },
                expected: { __metadata: { type: "TestCatalog.Model.Title"} }
            },
            "Qualified entity set with type cast": {
                input: { "odata.metadata": "http://someUri/$metadata#Test.Catalog.Titles/TestCatalog.Model.Songs/@Element" },
                expected: { __metadata: { type: "TestCatalog.Model.Songs"} }
            },
            "Unqualified entity set with type cast": {
                input: { "odata.metadata": "http://someUri/$metadata#Titles/TestCatalog.Model.Songs/@Element" },
                expected: { __metadata: { type: "TestCatalog.Model.Songs"} }
            },
            "Unqualified entity set in non default entity container": {
                input: { "odata.metadata": "http://someUri/$metadata#Generes/@Element" },
                expected: { __metadata: { type: null} }
            },
            "Unqualified entity set in non default entity container with type cast": {
                input: { "odata.metadata": "http://someUri/$metadata#Generes/TypeCast/@Element" },
                expected: { __metadata: { type: "TypeCast"} }
            }
        };

        for (var name in tests) {
            var test = tests[name];
            verifyReadJsonLightData(test.input, test.expected, name + " - Json light entry metadata uri was read properly.", testModel);
        }
        djstest.done();
    });

    djstest.addTest(function jsonLightReadTypeInPayloadWinsOverModelTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "NS",
                    "entityType": [{
                        "name": "EntityType",
                        "hasStream": "true",
                        "key": { "propertyRef": [{ "name": "Id"}] },
                        "property": [
                                { "name": "Id", "type": "Edm.String" },
                                { "name": "P1", "type": "Edm.String" },
                                { "name": "P2", "type": "NS.ComplexType" },
                                { "name": "P3", "type": "Edm.Int64" }
                            ]
                    }],
                    "complexType": [{
                        "name": "ComplexType",
                        "property": [
                            { "name": "C1", "type": "Edm.String" }
                        ]
                    }]
                }]
            }
        };

        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/NS.EntityType/@Element",
            P1: "Hello",
            P2: {
                "odata.type": "Instance",
                C1: "World"
            },
            "P2@odata.type": "Property",
            P3: "500",
            "P3@odata.type": "Property",
            P4: {
                "odata.type": "NS.ComplexType",
                C1: "!!"
            }
        };

        var expected = {
            __metadata: {
                type: "NS.EntityType",
                properties: {
                    P1: { type: "Edm.String" },
                    P2: {
                        type: "Instance",
                        properties: {
                            C1: { type: null }
                        }
                    },
                    P3: { type: "Property" },
                    P4: {
                        type: "NS.ComplexType",
                        properties: {
                            C1: { type: "Edm.String" }
                        }
                    }
                }
            },
            P1: "Hello",
            P2: {
                __metadata: {
                    type: "Instance"
                },
                C1: "World"
            },
            P3: "500",
            P4: {
                __metadata: {
                    type: "NS.ComplexType"
                },
                C1: "!!"
            }
        };

        verifyReadJsonLightData(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightReadObjectWithCollectionPropertyTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "NS",
                    "entityType": [{
                        "name": "EntityType",
                        "property": [
                                { "name": "p1", "type": "Collection(Edm.Int32)" }
                            ]
                    }]
                }]
            }
        };

        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/NS.EntityType/@Element",
            p1: [1, 2, 3],
            p2: [
                { c1: 100, c2: 200 },
                { c1: 400, c2: 500, "odata.type": "NS.OtherType" }
            ],
            "p2@odata.type": "Collection(NS.ComplexType)",
            p3: [5, 6, 7]
        };

        var expected = {
            __metadata: {
                type: "NS.EntityType",
                properties: {
                    p1: { type: "Collection(Edm.Int32)" },
                    p2: {
                        type: "Collection(NS.ComplexType)",
                        elements: [
                            {
                                type: "NS.ComplexType",
                                properties: {
                                    c1: { type: null },
                                    c2: { type: null }
                                }
                            },
                            {
                                type: "NS.OtherType",
                                properties: {
                                    c1: { type: null },
                                    c2: { type: null }
                                }
                            }
                        ]
                    },
                    p3: { type: null }
                }
            },
            p1: {
                __metadata: { type: "Collection(Edm.Int32)" },
                results: [1, 2, 3]
            },
            p2: {
                __metadata: { type: "Collection(NS.ComplexType)" },
                results: [
                    {
                        __metadata: {
                            type: "NS.ComplexType"
                        },
                        c1: 100,
                        c2: 200
                    },
                    {
                        __metadata: {
                            type: "NS.OtherType"
                        },
                        c1: 400,
                        c2: 500
                    }
                ]
            },
            p3: {
                __metadata: { type: null },
                results: [5, 6, 7]
            }
        };

        verifyReadJsonLightData(input, expected, "Json light object with collection porperties was read properly", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightReadEntryODataAnnotationsTest() {
        var input = {
            "odata.metadata": "http://someUri/$metadata#NS.Container.Set/TypeCast/@Element",
            "odata.id": "Customers(1)",
            "odata.etag": "etag-value",
            "odata.readLink": "read/Customers(1)",
            "odata.editLink": "Customers(1)",
            "odata.mediaReadLink": "Customers(1)/Image",
            "odata.mediaEditLink": "Customers(1)/$value",
            "odata.mediaETag": "stream-etag-value",
            "odata.mediaContentType": "image/jpg"
        };

        var expected = {
            __metadata: {
                id: "Customers(1)",
                type: "TypeCast",
                etag: "etag-value",
                self: "http://someUri/read/Customers(1)",
                edit: "http://someUri/Customers(1)",
                uri: "http://someUri/Customers(1)",
                media_src: "http://someUri/Customers(1)/Image",
                edit_media: "http://someUri/Customers(1)/$value",
                media_etag: "stream-etag-value",
                content_type: "image/jpg"
            }
        };

        verifyReadJsonLightData(input, expected, "Json light entry OData annotations were read properly");
        djstest.done();
    });


    djstest.addTest(function jsonLightReadObjectWithComplexPropertyTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Ns",
                    "entityType": [{
                        "name": "EntityType",
                        "property": [
                                { "name": "p1", "type": "Ns.ComplexType" }
                         ]
                    }],
                    "complexType": [{
                        "name": "ComplexType",
                        "property": [
                            { "name": "c1", "type": "Edm.Int16" },
                            { "name": "c2", "type": "Edm.Int32" },
                            { "name": "c3", "type": "Ns.ComplexType" }
                        ]
                    }]
                }]
            }
        };

        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/Ns.EntityType/@Element",
            p1: {
                c1: 100,
                c2: 200,
                c3: {
                    c1: 300,
                    c2: 400,
                    c3: {
                        c1: 500,
                        c2: 600,
                        c3: null
                    }
                }
            },
            p2: {
                "odata.type": "Ns.ComplexType2",
                c4: 800,
                "c4@odata.type": "Edm.Single",
                c5: 900,
                c6: {
                    c1: 1000,
                    c2: 2000,
                    c3: {
                        c1: 1100,
                        "c1@odata.type": "Edm.Double",
                        c2: 1200,
                        c3: null
                    }
                },
                "c6@odata.type": "Ns.ComplexType"
            },
            p3: {},
            "p3@odata.type": "Ns.ComplexType3"
        };

        var expected = {
            __metadata: {
                type: "Ns.EntityType",
                properties: {
                    p1: {
                        type: "Ns.ComplexType",
                        properties: {
                            c1: { type: "Edm.Int16" },
                            c2: { type: "Edm.Int32" },
                            c3: {
                                type: "Ns.ComplexType",
                                properties: {
                                    c1: { type: "Edm.Int16" },
                                    c2: { type: "Edm.Int32" },
                                    c3: {
                                        type: "Ns.ComplexType",
                                        properties: {
                                            c1: { type: "Edm.Int16" },
                                            c2: { type: "Edm.Int32" },
                                            c3: { type: "Ns.ComplexType" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    p2: {
                        type: "Ns.ComplexType2",
                        properties: {
                            c4: { type: "Edm.Single" },
                            c5: { type: null },
                            c6: {
                                type: "Ns.ComplexType",
                                properties: {
                                    c1: { type: "Edm.Int16" },
                                    c2: { type: "Edm.Int32" },
                                    c3: {
                                        type: "Ns.ComplexType",
                                        properties: {
                                            c1: { type: "Edm.Double" },
                                            c2: { type: "Edm.Int32" },
                                            c3: { type: "Ns.ComplexType" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    p3: { type: "Ns.ComplexType3" }
                }
            },
            p1: {
                __metadata: { type: "Ns.ComplexType" },
                c1: 100,
                c2: 200,
                c3: {
                    __metadata: { type: "Ns.ComplexType" },
                    c1: 300,
                    c2: 400,
                    c3: {
                        __metadata: { type: "Ns.ComplexType" },
                        c1: 500,
                        c2: 600,
                        c3: null
                    }
                }
            },
            p2: {
                __metadata: { type: "Ns.ComplexType2" },
                c4: 800,
                c5: 900,
                c6: {
                    __metadata: { type: "Ns.ComplexType" },
                    c1: 1000,
                    c2: 2000,
                    c3: {
                        __metadata: { type: "Ns.ComplexType" },
                        c1: 1100,
                        c2: 1200,
                        c3: null
                    }
                }
            },
            p3: { __metadata: { type: "Ns.ComplexType3"} }
        };

        verifyReadJsonLightData(input, expected, "Json light object with complex type properties was read properly", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightReadObjectWithNamedStreamProperty() {
        var input = {
            "odata.metadata": "http://someUri/$metadata#NS.Container.Set/TypeCast/@Element",
            "p1@odata.mediaReadLink": "Customers(1)/namedStream",
            "p1@odata.mediaEditLink": "Customers(1)/namedStream/$value",
            "p1@odata.mediaETag": "voice-etag-value",
            "p1@odata.mediaContentType": "audio/basic"
        };

        var expected = {
            __metadata: {
                type: "TypeCast",
                properties: {
                    p1: { type: null }
                }
            },
            p1: {
                __mediaresource: {
                    media_src: "http://someUri/Customers(1)/namedStream",
                    edit_media: "http://someUri/Customers(1)/namedStream/$value",
                    media_etag: "voice-etag-value",
                    content_type: "audio/basic"
                }
            }
        };

        verifyReadJsonLightData(input, expected, "Json light object with named stream properties was read properly");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadEntryWithDeferredNavigationPropertyTests() {
        var input = {
            "odata.metadata": "http://someUri/$metadata#NS.Container.Set/TypeCast/@Element",
            "p1@odata.navigationLinkUrl": "entitySet(1)/deferred",
            "p1@odata.associationLinkUrl": "entitySet(1)/$links/deferred"
        };

        var expected = {
            __metadata: {
                type: "TypeCast",
                properties: {
                    p1: {
                        type: null,
                        associationLinkUrl: "http://someUri/entitySet(1)/$links/deferred"
                    }
                }
            },
            p1: {
                __deferred: {
                    uri: "http://someUri/entitySet(1)/deferred"
                }
            }
        };

        verifyReadJsonLightData(input, expected, "Json light object with deferred navigation properties was read properly");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadEntryWithInlinedNavigationPropertiesTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Ns",
                    "entityType": [{
                        "name": "EntityType",
                        "navigationProperty": [
                            { "name": "p1", "relationship": "Ns.Rel1", "toRole": "p1s" },
                            { "name": "p2", "relationship": "Ns.Rel2", "toRole": "p2s" }
                        ]
                    }],
                    "association": [{
                        "name": "Rel1",
                        "end": [
                            { "type": "Ns.EntityType1", "role": "p1s" },
                            { "type": "Ns.EntityType", "role": "otherRole" }
                         ]
                    },
                    {
                        "name": "Rel2",
                        "end": [
                            { "type": "Ns.EntityType", "role": "otherRole" },
                            { "type": "Ns.EntityType2", "role": "p2s" }
                         ]
                    }]
                }]
            }
        };

        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/Ns.EntityType/@Element",
            p1: [
                { e1: 100, e2: 200 },
                { e1: 110, e2: 220 }
            ],
            "p1@odata.count": 50,
            "p1@odata.nextLink": "nextToken",
            p2: {
                e3: 300
            },
            p3: [
                { e4: 400, e5: 500 },
                { e4: 440, e5: 550 }
            ],
            "p3@odata.navigationLinkUrl": "http://someUri/entitySet(1)/p3",
            "p3@odata.associationLinkUrl": "http://someUri/entitySet(1)/$links/p3",
            p4: {
                e6: 600
            },
            "p4@odata.navigationLinkUrl": "http://someUri/entitySet(1)/p4",
            "p4@odata.associationLinkUrl": "http://someUri/entitySet(1)/$links/p4",
            p5: [
                {
                    "odata.id": 12345,
                    e7: 700,
                    e8: 800
                }
            ],
            p6: {
                "odata.id": 78910,
                e9: 900,
                "e9@odata.type": "Edm.Int32"
            }
        };

        var expected = {
            __metadata: {
                type: "Ns.EntityType",
                properties: {
                    p1: {
                        type: "Ns.EntityType1"
                    },
                    p2: {
                        type: "Ns.EntityType2"
                    },
                    p3: {
                        type: null,
                        navigationLinkUrl: "http://someUri/entitySet(1)/p3",
                        associationLinkUrl: "http://someUri/entitySet(1)/$links/p3"
                    },
                    p4: {
                        type: null,
                        navigationLinkUrl: "http://someUri/entitySet(1)/p4",
                        associationLinkUrl: "http://someUri/entitySet(1)/$links/p4"
                    },
                    p5: {
                        type: null
                    },
                    p6: {
                        type: null
                    }
                }
            },
            p1: {
                __count: 50,
                __next: "http://someUri/nextToken",
                results: [
            {
                __metadata: {
                    type: "Ns.EntityType1",
                    properties: {
                        e1: { type: null },
                        e2: { type: null }
                    }
                },
                e1: 100,
                e2: 200
            },
            {
                __metadata: {
                    type: "Ns.EntityType1",
                    properties: {
                        e1: { type: null },
                        e2: { type: null }
                    }
                },
                e1: 110,
                e2: 220
            }
          ]
            },
            p2: {
                __metadata: {
                    type: "Ns.EntityType2",
                    properties: {
                        e3: { type: null }
                    }
                },
                e3: 300
            },
            p3: {
                results: [
            {
                __metadata: {
                    type: null,
                    properties: {
                        e4: { type: null },
                        e5: { type: null }
                    }
                },
                e4: 400,
                e5: 500
            },
            {
                __metadata: {
                    type: null,
                    properties: {
                        e4: { type: null },
                        e5: { type: null }
                    }
                },
                e4: 440,
                e5: 550
            }
            ]
            },
            p4: {
                __metadata: {
                    type: null,
                    properties: {
                        e6: { type: null }
                    }
                },
                e6: 600
            },
            p5: {
                results: [
                {
                    __metadata: {
                        id: 12345,
                        type: null,
                        properties: {
                            e7: { type: null },
                            e8: { type: null }
                        }
                    },
                    e7: 700,
                    e8: 800
                }
            ]
            },
            p6: {
                __metadata: {
                    id: 78910,
                    type: null,
                    properties: {
                        e9: { type: "Edm.Int32" }
                    }
                },
                e9: 900
            }
        };

        verifyReadJsonLightData(input, expected, "Json light object with inlined navigation properties was read properly", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightReadStringPropertiesTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Ns",
                    "entityType": [{
                        "name": "EntityType",
                        "property": [
                                { "name": "p1", "type": "Edm.DateTime" },
                                { "name": "p2", "type": "Edm.DateTimeOffset" },
                                { "name": "p3", "type": "Edm.Time" }
                            ]
                    }]
                }]
            }
        };

        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/Ns.EntityType/@Element",
            p1: "2000-01-02T03:04:05",
            p2: "2000-01-02T03:04:05+01:00",
            p3: "P0Y0M05DT12H30M5S",
            p4: "hello world",
            p5: "2001-01-02T03:04:05",
            "p5@odata.type": "Edm.DateTime",
            p6: "2001-01-02T03:04:05+01:00",
            "p6@odata.type": "Edm.DateTimeOffset",
            p7: "P0Y0M05DT12H30M10S",
            "p7@odata.type": "Edm.Time"
        };

        var p2 = new Date("01/02/2000 02:04:05 GMT");
        p2.__edmType = "Edm.DateTimeOffset";
        p2.__offset = "+01:00";

        var p6 = new Date("01/02/2001 02:04:05 GMT");
        p2.__edmType = "Edm.DateTimeOffset";
        p2.__offset = "+01:00";

        var expected = {
            __metadata: {
                type: "Ns.EntityType",
                properties: {
                    p1: { type: "Edm.DateTime" },
                    p2: { type: "Edm.DateTimeOffset" },
                    p3: { type: "Edm.Time" },
                    p4: { type: null },
                    p5: { type: "Edm.DateTime" },
                    p6: { type: "Edm.DateTimeOffset" },
                    p7: { type: "Edm.Time" }
                }
            },
            p1: new Date("01/02/2000 03:04:05 GMT"),
            p3: { ms: 477005000, __edmType: "Edm.Time" },
            p2: p2,
            p4: "hello world",
            p5: new Date("01/02/2001 03:04:05 GMT"),
            p6: p6,
            p7: { ms: 477010000, __edmType: "Edm.Time" }
        };

        verifyReadJsonLightData(input, expected, "Json light object with string properties was read properly", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightReadRecognizeDateLiteralsTest() {
        var input = {
            p1: "2000-01-02T03:04:05",
            p2: "2000-01-02T03:04:05+01:00"
        };

        var p2 = new Date("01/02/2000 02:04:05 GMT");
        p2.__edmType = "Edm.DateTimeOffset";
        p2.__offset = "+01:00";

        var expected = {
            __metadata: {
                properties: {
                    p1: {
                        type: null
                    },
                    p2: {
                        type: null
                    }
                },
                type: null
            },
            p1: new Date("01/02/2000 03:04:05 GMT"),
            p2: p2
        };

        OData.jsonHandler.recognizeDates = true;
        verifyReadJsonLightData(input, expected, "Json light datetime literals were recognized. ");

        OData.jsonHandler.recognizeDates = false;

        expected.p1 = input.p1;
        expected.p2 = input.p2;

        verifyReadJsonLightData(input, expected, "Json light datetime literals were ignored");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadEmptyFeedTest() {
        var input = { "odata.metadata": "http://someUri#entitySet/Set", value: [] };
        var expected = { results: [] };

        verifyReadJsonLightData(input, expected, "Json light feed object was read properly");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadFeedTest() {
        var input = {
            "odata.metadata": "http://someUri#entitySet/Type",
            value: [
              { "odata.id": 12345 },
              { "odata.id": 56789 }
            ],
            "odata.count": 50,
            "odata.nextLink": "skipToken"
        };

        var expected = {
            __count: 50,
            __next: "http://someUri/skipToken",
            results: [
                {
                    __metadata: {
                        id: 12345,
                        type: "Type"
                    }
                },
                {
                    __metadata: {
                        id: 56789,
                        type: "Type"
                    }
                }
            ]
        };

        verifyReadJsonLightData(input, expected, "Json light feed object was read properly");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadFeedUsingMetadataTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Test.Catalog",
                    "entityContainer": [{
                        "name": "TestCatalog",
                        "isDefaultEntityContainer": "true",
                        "entitySet": [
                           { "name": "Titles", "entityType": "TestCatalog.Model.Title" }
                        ]
                    }
                    ]
                }
                ]
            }
        };

        var tests = {
            "Unqualified entity set": {
                input: { "odata.metadata": "http://someUri#Titles", value: [{}] },
                expected: { results: [{ __metadata: { type: "TestCatalog.Model.Title"}}] }
            },
            "Qualified entity set": {
                input: { "odata.metadata": "http://someUri#Test.Catalog.TestCatalog.Titles", value: [{}] },
                expected: { results: [{ __metadata: { type: "TestCatalog.Model.Title"}}] }
            },
            "Type casted entity set": {
                input: { "odata.metadata": "http://someUri#TestCatalog.Titles/TypeCast", value: [{}] },
                expected: { results: [{ __metadata: { type: "TypeCast"}}] }
            }
        };

        for (var name in tests) {
            var test = tests[name];
            verifyReadJsonLightData(test.input, test.expected, name + " - Json light feed was read properly.", testModel);
        }
        djstest.done();
    });

    djstest.addTest(function jsonLightReadInferFeedAsObjectTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Test.Catalog",
                    "entityContainer": [{
                        "name": "TestCatalog",
                        "isDefaultEntityContainer": "true",
                        "entitySet": [
                           { "name": "Titles", "entityType": "TestCatalog.Model.Title" }
                        ]
                    }
                    ]
                }
                ]
            }
        };

        var tests = {
            "Feed as object": {
                input: { "odata.metadata": "http://someUri#EntitySet", value: [] },
                expected: {
                    __metadata: {
                        type: "EntitySet",
                        properties: {
                            value: { type: null }
                        }
                    },
                    value: { __metadata: { type: null }, results: [] }
                }
            },
            "Feed as feed using value": {
                input: { "odata.metadata": "http://someUri#EntiySet", value: [{ "odata.id": 12345}] },
                expected: { results: [{ __metadata: { type: null, id: 12345}}] }
            },
            "Feed as feed using metadata": {
                input: { "odata.metadata": "http://someUri#Titles", value: [] },
                expected: { results: [] }
            },
            "Collection of primitive": {
                input: { "odata.metadata": "http://someUri#Collection(Edm.Int32)", value: [] },
                expected: { __metadata: { type: "Collection(Edm.Int32)" }, results: [] }
            },
            "Collection of complex": {
                input: { "odata.metadata": "http://someUri#Collection(My.Type)", value: [] },
                expected: { __metadata: { type: "Collection(My.Type)" }, results: [] }
            }
        };

        for (var name in tests) {
            var test = tests[name];
            var response = {
                headers: {
                    "Content-Type": "application/json;odata.metadata=full",
                    DataServiceVersion: "4.0"
                },
                body: JSON.stringify(test.input)
            };

            OData.jsonHandler.read(response, { metadata: testModel });
            djstest.assertAreEqualDeep(response.data, test.expected, name + " - Json light object was read properly ");
        }
        djstest.done();
    });

    djstest.addTest(function jsonLightReadEmptyLinksDocumentTest() {
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/$links/NavProp",
            value: []
        };

        var expected = {
            results: []
        };

        verifyReadJsonLightData(input, expected, "Json light links document was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadLinksDocumentTest() {
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/$links/NavProp",
            value: [
                        { url: "Products(1)" },
                        { url: "http://someUri/Products(2)" }
                     ]
        };

        var expected = {
            results: [
                        { uri: "http://someUri/Products(1)" },
                        { uri: "http://someUri/Products(2)" }
                    ]
        };

        verifyReadJsonLightData(input, expected, "Json light links document was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadSingleLinkDocumentTest() {
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/$links/NavProp/@Element",
            url: "Products(1)"
        };

        var expected = {
            uri: "http://someUri/Products(1)"
        };

        verifyReadJsonLightData(input, expected, "Json light single link document was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadTopLevelPrimitiveProperty() {
        var input = {
            "odata.metadata": "http://someUri#Edm.GeometryPoint",
            value: {
                type: "Point",
                coordinates: [1.0, 2.0],
                crs: {
                    type: name,
                    properties: {
                        name: "EPSG:4326"
                    }
                }
            }
        };

        var expected = {
            __metadata: {
                type: "Edm.GeometryPoint"
            },
            value: {
                type: "Point",
                coordinates: [1.0, 2.0],
                crs: {
                    type: name,
                    properties: {
                        name: "EPSG:4326"
                    }
                }
            }
        };

        verifyReadJsonLightData(input, expected, "Json light top level primitive property was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadTopLevelComplexTypeTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Ns",
                    "complexType": [{
                        "name": "ComplexType",
                        "property": [
                            { "name": "value", "type": "Collection(Ns.ComplexType2)" }
                        ]
                    }]
                }]
            }
        };

        var input = {
            "odata.metadata": "http://someUri#Ns.ComplexType",
            value: [{
                p1: 100,
                p2: 200
            }]
        };

        var expected = {
            __metadata: {
                type: "Ns.ComplexType",
                properties: {
                    value: {
                        type: "Collection(Ns.ComplexType2)",
                        elements: [
                            {
                                type: "Ns.ComplexType2",
                                properties: {
                                    p1: { type: null },
                                    p2: { type: null }
                                }
                            }
                        ]
                    }
                }
            },
            value: {
                __metadata: { type: "Collection(Ns.ComplexType2)" },
                results: [
                    {
                        __metadata: { type: "Ns.ComplexType2" },
                        p1: 100,
                        p2: 200
                    }
                ]
            }
        };

        verifyReadJsonLightData(input, expected, "Json light top level complex type property was read properly.", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightReadTopPrimitiveCollectionPropertyTest() {
        var input = {
            "odata.metadata": "http://someUri#Collection(Edm.GeometryPoint)",
            value: [{
                type: "Point",
                coordinates: [1.0, 2.0],
                crs: {
                    type: "name",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
            }]
        };

        var expected = {
            __metadata: {
                type: "Collection(Edm.GeometryPoint)"
            },
            results: [{
                type: "Point",
                coordinates: [1.0, 2.0],
                crs: {
                    type: "name",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
            }]
        };

        verifyReadJsonLightData(input, expected, "Json light top level primitive collection property was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadTopLevelComplexTypeCollectionTest() {
        var input = {
            "odata.metadata": "http://someUri#Collection(Ns.ComplexType2)",
            value: [{
                p1: 100,
                p2: 200,
                "p2@odata.type": "Edm.Int16"
            }]
        };

        var expected = {
            __metadata: {
                type: "Collection(Ns.ComplexType2)",
                elements: [
                    {
                        type: "Ns.ComplexType2",
                        properties: {
                            p1: { type: null },
                            p2: { type: "Edm.Int16" }
                        }
                    }
                ]
            },
            results: [
                {
                    __metadata: { type: "Ns.ComplexType2" },
                    p1: 100,
                    p2: 200
                }
             ]
        };

        verifyReadJsonLightData(input, expected, "Json light top level complex type collection property was read properly.");
        djstest.done();
    });

    djstest.addTest(function jsonLightReadFeedAdvertisedActionsTest() {

        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Ns",
                    "entityContainer": [{
                        "name": "EntityContainer",
                        "isDefaultEntityContainer": "true",
                        "entitySet": [
                           { "name": "EntitySet", "entityType": "Ns.EntityType" }
                        ]
                    }
                    ]
                }
                ]
            }
        };

        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet",
            "#action1": {
                target: "action1/item(0)",
                title: "Action1"
            },
            "#action2": {
                target: "action2/item(0)",
                title: "Action2"
            },
            value: []
        };

        var expected = {
            __metadata: {
                actions: [
                    {
                        metadata: "http://someUri/action1",
                        target: "http://someUri/action1/item(0)",
                        title: "Action1"
                    },
                   {
                       metadata: "http://someUri/action2",
                       target: "http://someUri/action2/item(0)",
                       title: "Action2"
                   }
                ]
            },
            results: []
        };

        verifyReadJsonLightData(input, expected, "Json light feed with advertised actions was read properly.", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightReadAdvertisedActionsAndFunctionsTest() {
        var testModel = {
            "version": "1.0",
            "dataServices": {
                "dataServiceVersion": "4.0",
                "schema": [{
                    "namespace": "Test.Catalog",
                    "entityContainer": [{
                        "name": "TestCatalog",
                        "isDefaultEntityContainer": "true",
                        "functionImport": [
                            { "name": "function1", "isSideEffecting": "false" },
                            { "name": "function2", "isSideEffecting": "false" },
                            { "name": "action1", "isSideEffecting": "true" },
                            { "name": "action2" }
                         ]
                    }, {
                        "name": "OtherCatalog",
                        "isDefaultEntityContainer": "false",
                        "functionImport": [
                            { "name": "function1", "isSideEffecting": "false" }
                         ]
                    }]
                }]
            }
        };

        var input = {
            "odata.metadata": "http://someUri/$metadata#EntitySet/@Element",
            "#function2": [
                {
                    target: "function2/item(0)",
                    title: "Function2 overload1"
                },
                {
                    target: "function2/item(0)",
                    title: "Function2 overload2"
                }
            ],
            "#action1": {
                target: "action1/item(0)",
                title: "Action1"
            },
            "#action2": {
                target: "action2/item(0)",
                title: "Action2"
            },
            "#function1": {
                target: "function1/item(0)",
                title: "Function1"
            },
            "#Test.Catalog.OtherCatalog.function1": {
                target: "Test.Catalog.OtherCatalog.function1/item(0)",
                title: "Function1 in other catalog"
            },
            "#action3": [
                {
                    target: "action3/item(0)",
                    title: "Unkown action overload1"
                },
                {
                    target: "http://otherUri/action3/item(0)",
                    title: "Unkown action overload2"
                }
            ]
        };

        var expected = {
            __metadata: {
                type: null,
                actions: [
                   {
                       metadata: "http://someUri/action1",
                       target: "http://someUri/action1/item(0)",
                       title: "Action1"
                   },
                   {
                       metadata: "http://someUri/action2",
                       target: "http://someUri/action2/item(0)",
                       title: "Action2"
                   },
                   {
                       metadata: "http://someUri/action3",
                       target: "http://someUri/action3/item(0)",
                       title: "Unkown action overload1"
                   },
                   {
                       metadata: "http://someUri/action3",
                       target: "http://otherUri/action3/item(0)",
                       title: "Unkown action overload2"
                   }
                ],
                functions: [
                    {
                        metadata: "http://someUri/function2",
                        target: "http://someUri/function2/item(0)",
                        title: "Function2 overload1"
                    },
                    {
                        metadata: "http://someUri/function2",
                        target: "http://someUri/function2/item(0)",
                        title: "Function2 overload2"
                    },
                    {
                        metadata: "http://someUri/function1",
                        target: "http://someUri/function1/item(0)",
                        title: "Function1"
                    },
                    {
                        metadata: "http://someUri/Test.Catalog.OtherCatalog.function1",
                        target: "http://someUri/Test.Catalog.OtherCatalog.function1/item(0)",
                        title: "Function1 in other catalog"
                    }
                ]
            }
        };

        verifyReadJsonLightData(input, expected, "Json light advertised actions and functions were read properly.", testModel);
        djstest.done();
    });

    djstest.addTest(function jsonLightSerializeEntryMetadataTest() {
        var data = {
            __metadata: {
                metadata: "http://someUri/$metadata#NS.Container/Set/@Element",
                id: "http://someUri/Customers(1)",
                etag: "etag-value",
                self: "http://someUri/read/Customers(1)",
                edit: "http://someUri/read/Customers(1)",
                media_src: "http://someUri/Customers(1)/Image",
                edit_media: "http://someUri/Customers(1)/$value",
                media_etag: "stream-etag-value",
                content_type: "image/jpg"
            }
        };

        var expected = {
            "odata.etag": "etag-value",
            "odata.mediaReadLink": "http://someUri/Customers(1)/Image",
            "odata.mediaEditLink": "http://someUri/Customers(1)/$value",
            "odata.mediaETag": "stream-etag-value",
            "odata.mediaContentType": "image/jpg"
        };

        verifySerializedJsonLightData(data, expected, " Json light entry metadata was serialized properly.");
    });

    djstest.addTest(function jsonLightSerializeCustomAnnotationsTest() {
        var data = {
            __metadata: {
                id: "id"
            },
            "odata.id": "id",
            "custom.annotation": "custom annotation value",
            "p1@ns1.primitive": "primitive",
            "p1@ns2.complex": { a1: 500 },
            "p1@ns3.ns4.value": 600,
            "p2@ns1.primitive": 400,
            "custom.annotation": "custom annotation value"
        };

        var expected = {
            "odata.id": "id",
            "custom.annotation": "custom annotation value",
            "p1@ns1.primitive": "primitive",
            "p1@ns2.complex": { a1: 500 },
            "p1@ns3.ns4.value": 600,
            "p2@ns1.primitive": 400
        };

        verifySerializedJsonLightData(data, expected, " Json light custom annotations were serialized properly.");
    });

    djstest.addTest(function jsonLightSerializeEntryCollectionPropertiesTest() {
        var data = {
            __metadata: {
                id: "id",
                properties: {
                    primitiveColArray: { type: "Collection(Edm.Int16)" },
                    primitiveColObject: { type: "Collection(Edm.Int32)" }
                }
            },
            primitiveColArray: [1, 2, 3, 4],
            primitiveColObject: {
                results: [5, 6, 7, 8]
            },
            complexColArray: [{ p1: 100 }, { p1: 200}],
            complexColObject: {
                results: [{ p1: 300 }, { p1: 400}]
            }
        };

        var expected = {
            "primitiveColArray@odata.type": "Collection(Edm.Int16)",
            primitiveColArray: [1, 2, 3, 4],
            "primitiveColObject@odata.type": "Collection(Edm.Int32)",
            primitiveColObject: [5, 6, 7, 8],
            complexColArray: [{ p1: 100 }, { p1: 200}],
            complexColObject: [{ p1: 300 }, { p1: 400}]
        };

        verifySerializedJsonLightData(data, expected, " Json light entry collection properties were serialized properly.");
    });

    djstest.addTest(function jsonLightSerializeEntryDeferredPropertyTest() {
        var data = {
            __metadata: {
                id: "id",
                properties: {
                    deferred: {
                        associationLinkUrl: "http://target/$links"
                    }
                }
            },
            deferred: {
                __deferred: { uri: "http://target" }
            }
        };

        var expected = {
            "deferred@odata.navigationLinkUrl": "http://target"
        };

        verifySerializedJsonLightData(data, expected, " Json light entry deferred property were serialized properly.");
    });

    djstest.addTest(function jsonLightSerializeEntryInlinePropertiesTest() {
        var data = {
            __metadata: {
                id: "id"
            },
            inlineEntry: {
                __metadata: { uri: "", properties: { p1: { type: "Edm.Int64"}} },
                p1: "300"
            },
            inlineBoundEntry: {
                __metadata: { uri: "http://entries(1)", properties: { p1: { type: "Edm.Int64"}} },
                p1: "400"
            },
            inlineFeedArray: [
                {
                    __metadata: { uri: "http://entries(2)" }
                },
                {
                    __metadata: { uri: "", properties: { p1: { type: "Edm.Int32"}} },
                    p1: "600"
                },
                {
                    __metadata: { uri: "http://entries(3)" }
                }
            ],
            inlineFeedObject: {
                __count: 50,
                __next: "next link",
                results: [
                    { __metadata: { uri: "" }, p1: "900" }
                ]
            },
            inlineEmptyFeedObject: {
                results: []
            }
        };

        var expected = {
            inlineEntry: {
                "p1@odata.type": "Edm.Int64",
                p1: "300"
            },
            "inlineBoundEntry@odata.bind": "http://entries(1)",
            inlineFeedArray: [{
                "p1@odata.type": "Edm.Int32",
                p1: "600"
            }],
            "inlineFeedArray@odata.bind": [
                "http://entries(2)",
                "http://entries(3)"
            ],
            inlineFeedObject: [{
                p1: "900"
            }],
            inlineEmptyFeedObject: []
        };

        verifySerializedJsonLightData(data, expected, " Json light entry inline properties were serialized properly.");

    });

    djstest.addTest(function jsonLightSerializeEntryComplexPropertyTest() {
        var data = {
            __metadata: {
                id: "id",
                properties: {
                    complexAsDeferredOnMetadata: {
                        type: "complexAsDeferredOnMetadata.type"
                    },
                    complexAsCol: {
                        type: "complexAsCol.type"
                    }
                }
            },
            complexAsDeferred: {
                __metadata: {
                    type: "complexAsDeferred.type"
                },
                __deferred: { uri: "http://uri" }
            },
            complexAsCol: {
                results: [1, 2, 3, 4]
            },
            complexAsNamedStream: {
                __metadata: {
                    type: "complexAsNamedStream"
                },
                __mediaresource: {
                    content_type: "content type",
                    media_src: "http://source"
                }
            },
            complexAsDeferredOnMetadata: {
                __deferred: { uri: "http://uri2" }
            }
        };

        var expected = {
            complexAsDeferred: {
                "odata.type": "complexAsDeferred.type",
                __deferred: { uri: "http://uri" }
            },
            complexAsCol: {
                "odata.type": "complexAsCol.type",
                results: [1, 2, 3, 4]
            },
            complexAsNamedStream: {
                "odata.type": "complexAsNamedStream",
                __mediaresource: {
                    content_type: "content type",
                    media_src: "http://source"
                }
            },
            complexAsDeferredOnMetadata: {
                "odata.type": "complexAsDeferredOnMetadata.type",
                __deferred: { uri: "http://uri2" }
            }
        };

        verifySerializedJsonLightData(data, expected, " Json light entry complex properties were serialized properly.");
    });

    djstest.addTest(function jsonLightSerializeEntryComplexPropertyMetadataTest() {
        var data = {
            __metadata: {
                id: "id",
                properties: {
                    complex: {
                        type: "this should be overriden",
                        properties: {
                            nested1: {
                                type: "types.complex.nested1",
                                properties: {
                                    nested2: {
                                        type: "types.complex.nested1.nested2"
                                    }
                                }
                            },
                            c1: {
                                type: "Edm.Int64"
                            }
                        }
                    }
                }
            },
            complex: {
                __metadata: {
                    type: "types.complex"
                },
                c1: "500",
                c2: "b",
                nested1: {
                    nested2: {
                    }
                }
            }
        };

        var expected = {
            complex: {
                "odata.type": "types.complex",
                "c1@odata.type": "Edm.Int64",
                c1: "500",
                c2: "b",
                nested1: {
                    "odata.type": "types.complex.nested1",
                    nested2: {
                        "odata.type": "types.complex.nested1.nested2"
                    }
                }
            }
        };

        verifySerializedJsonLightData(data, expected, " Json light entry complex property was serialized properly.");
    });

    djstest.addTest(function jsonLightSerializeLinksDocumentTest() {
        var tests = {
            "Empty uri string": {
                i: { uri: "" },
                e: { url: "" }
            },
            "Null uri string": {
                i: { uri: null },
                e: { url: null }
            },
            "Undefined uri string": {
                i: { uri: undefined },
                e: {}
            },
            "Uri": {
                i: { uri: "http://somUri/EntitySet(1)" },
                e: { url: "http://somUri/EntitySet(1)" }
            }
        };

        for (var name in tests) {
            verifySerializedJsonLightData(tests[name].i, tests[name].e, name + " - Json light links documents whas serialized properly.", "http://someUri/set(3)/$links/navprop");
        }
    });

    djstest.addTest(function jsonLightComputeLinksWithSingleKey() {
        var model = getSampleModel();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            Id: "MyId",
            P1: 42
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": { "Id": { "type": "Edm.String" }, "P1": { "type": "Edm.Int32"} },
                "id": "http://someUri/EntityTypes('MyId')",
                "edit": "http://someUri/EntityTypes('MyId')",
                "uri": "http://someUri/EntityTypes('MyId')",
                "self": "http://someUri/EntityTypes('MyId')"

            },
            "Id": "MyId",
            "P1": 42
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });

    djstest.addTest(function jsonLightComputeLinksWithMultipleKeys() {
        var model = getSampleModelWithTwoKeys();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            Id: "MyId",
            P1: 42
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": { "Id": { "type": "Edm.String" }, "P1": { "type": "Edm.Int32"} },
                "id": "http://someUri/EntityTypes(Id='MyId',P1=42)",
                "edit": "http://someUri/EntityTypes(Id='MyId',P1=42)",
                "uri": "http://someUri/EntityTypes(Id='MyId',P1=42)",
                "self": "http://someUri/EntityTypes(Id='MyId',P1=42)"
            },
            "Id": "MyId",
            "P1": 42
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });

    djstest.addTest(function jsonLightComputeLinksWithNonComputedEditLink() {
        var model = getSampleModel();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            "odata.editLink": "EntityTypes('notcomputed')",
            Id: "MyId",
            P1: 42
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": { "Id": { "type": "Edm.String" }, "P1": { "type": "Edm.Int32"} },
                "id": "http://someUri/EntityTypes('notcomputed')",
                "edit": "http://someUri/EntityTypes('notcomputed')",
                "uri": "http://someUri/EntityTypes('notcomputed')",
                "self": "http://someUri/EntityTypes('notcomputed')"
            },
            "Id": "MyId",
            "P1": 42
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });

    djstest.addTest(function jsonLightComputeLinksWithSingleConcurrencyProperty() {
        var model = getSampleModelWithOneConcurrencyProperty();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            Id: "MyId",
            P1: 42
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": { "Id": { "type": "Edm.String" }, "P1": { "type": "Edm.Int32"} },
                "id": "http://someUri/EntityTypes('MyId')",
                "edit": "http://someUri/EntityTypes('MyId')",
                "uri": "http://someUri/EntityTypes('MyId')",
                "self": "http://someUri/EntityTypes('MyId')",
                "etag": "W/\"'MyId'\""
            },
            "Id": "MyId",
            "P1": 42
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });

    djstest.addTest(function jsonLightComputeLinksWithSingleBinaryConcurrencyProperty() {
        var model = getSampleModelWithOneBinaryConcurrencyProperty();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            Id: "MyId",
            P1: "AAAAAAAAB9E="
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": { "Id": { "type": "Edm.String" }, "P1": { "type": "Edm.Binary"} },
                "id": "http://someUri/EntityTypes('MyId')",
                "edit": "http://someUri/EntityTypes('MyId')",
                "uri": "http://someUri/EntityTypes('MyId')",
                "self": "http://someUri/EntityTypes('MyId')",
                "etag": "W/\"X'00000000000007D1'\""
            },
            "Id": "MyId",
            "P1": "AAAAAAAAB9E="
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });

    djstest.addTest(function jsonLightComputeLinkWithMutipleConcurrencyProperty() {
        var model = getSampleModelWithMultipleConcurrencyProperties();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            Id: "MyId",
            P1: 42
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": { "Id": { "type": "Edm.String" }, "P1": { "type": "Edm.Int32"} },
                "id": "http://someUri/EntityTypes('MyId')",
                "edit": "http://someUri/EntityTypes('MyId')",
                "uri": "http://someUri/EntityTypes('MyId')",
                "self": "http://someUri/EntityTypes('MyId')",
                "etag": "W/\"'MyId',42\""
            },
            "Id": "MyId",
            "P1": 42
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });

    djstest.addTest(function jsonLightComputeLinkWithNullConcurrencyProperty() {
        var model = getSampleModelWithMultipleConcurrencyProperties();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            Id: "My Id'",
            P1: null
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": { "Id": { "type": "Edm.String" }, "P1": { "type": "Edm.Int32"} },
                "id": "http://someUri/EntityTypes('My%20Id''')",
                "edit": "http://someUri/EntityTypes('My%20Id''')",
                "uri": "http://someUri/EntityTypes('My%20Id''')",
                "self": "http://someUri/EntityTypes('My%20Id''')",
                "etag": "W/\"'My%20Id''',null\""
            },
            "Id": "My Id'",
            "P1": null
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });
    
    djstest.addTest(function jsonLightWithDecimalValue() {
        var model = getSampleModelWithDecimalProperty();
        var input = {
            "odata.metadata": "http://someUri/$metadata#EntityTypes/@Element",
            Id: "5",
            P1: "10.5"
        };

        var expected = {
            "__metadata": {
                "type": "NS.EntityType",
                "properties": {
                    "Id": {
                        "type": "Edm.String"
                    },
                    "P1": {
                        "type": "Edm.Decimal"
                    }
                },
                "id": "http:\/\/someUri\/EntityTypes('5')",
                "uri": "http:\/\/someUri\/EntityTypes('5')",
                "edit": "http:\/\/someUri\/EntityTypes('5')",
                "self": "http:\/\/someUri\/EntityTypes('5')"
            },
            "Id": "5",
            "P1": "10.5"
        };


        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });
    
    djstest.addTest(function jsonLightNavigationPropertyAndAssociationUriShouldBeComputedTest() {
        var model = getSampleModelWithNavPropertiesAndInheritedTypes();
        var input = {
            "odata.metadata": "http://someUri/$metadata#Products/@Element",
            ID: 5
        };

        var expected = {
            "__metadata": {
                "type": "ODataDemo.Product",
                "properties": {
                    "ID": {
                        "type": "Edm.Int32"
                    },
                    "Category": {
                        "type": "ODataDemo.Category",
                        "associationLinkUrl": "http:\/\/someUri\/Products(5)\/$links\/Category"
                    }
                },
                "id": "http:\/\/someUri\/Products(5)",
                "uri": "http:\/\/someUri\/Products(5)",
                "edit": "http:\/\/someUri\/Products(5)",
                "self": "http:\/\/someUri\/Products(5)"
            },
            "ID": 5,
            "Category": {
                "__deferred": {
                    "uri": "http:\/\/someUri\/Products(5)\/Category"
                }
            }
        };


        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });
    
    djstest.addTest(function jsonLightNullNavigationPropertyShouldNotBeComputedTest() {
        var model = getSampleModelWithNavPropertiesAndInheritedTypes();
        var input = {
            "odata.metadata": "http://someUri/$metadata#Products/@Element",
            ID: 5,
            Category: null
        };

        var expected = {
            "__metadata": {
                "type": "ODataDemo.Product",
                "properties": {
                    "ID": {
                        "type": "Edm.Int32"
                    },
                    "Category": {
                        "type": "ODataDemo.Category",
                        "associationLinkUrl": "http:\/\/someUri\/Products(5)\/$links\/Category",
                         "navigationLinkUrl": "http:\/\/someUri\/Products(5)\/Category"
                    }
                },
                "id": "http:\/\/someUri\/Products(5)",
                "uri": "http:\/\/someUri\/Products(5)",
                "edit": "http:\/\/someUri\/Products(5)",
                "self": "http:\/\/someUri\/Products(5)"
            },
            "ID": 5,
            "Category": null
        };


        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });
    
    djstest.addTest(function jsonLightUrisShouldBeComputedForExpandedEntities() {
        var model = getSampleModelWithNavPropertiesAndInheritedTypes();
        var input = {
            "odata.metadata": "http://someUri/$metadata#Products/@Element",
            ID: 5,
            Category: {
                ID: 1
            }            
        };

        var expected = {
            "__metadata": {
                "type": "ODataDemo.Product",
                "properties": {
                    "ID": {
                        "type": "Edm.Int32"
                    },
                    "Category": {
                        "type": "ODataDemo.Category",
                        "navigationLinkUrl": "http:\/\/someUri\/Products(5)\/Category",
                        "associationLinkUrl": "http:\/\/someUri\/Products(5)\/$links\/Category"
                    }
                },
                "id": "http:\/\/someUri\/Products(5)",
                "uri": "http:\/\/someUri\/Products(5)",
                "edit": "http:\/\/someUri\/Products(5)",
                "self": "http:\/\/someUri\/Products(5)"
            },
            "ID": 5,
            "Category": {
                "__metadata": {
                    "type": "ODataDemo.Category",
                    "properties": {
                        "ID": {
                            "type": "Edm.Int32"
                        },
                        "Products": {
                            "type": "ODataDemo.Product",
                            "associationLinkUrl": "http:\/\/someUri\/Categories(1)\/$links\/Products"
                        }
                    },
                    "id": "http:\/\/someUri\/Categories(1)",
                    "uri": "http:\/\/someUri\/Categories(1)",
                    "edit": "http:\/\/someUri\/Categories(1)",
                    "self": "http:\/\/someUri\/Categories(1)"
                },
                "ID": 1,
                "Products": {
                    "__deferred": {
                        "uri": "http:\/\/someUri\/Categories(1)\/Products"
                    }
                }
            }
        };

        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();
    });

    djstest.addTest(function jsonLightUrisShouldBeComputedForInheritedTypes() {
        var model = getSampleModelWithNavPropertiesAndInheritedTypes();
        var input = {
            "odata.metadata": "http:\/myexample.com\/MyService.svc\/$metadata#Products\/@Element",
            "odata.type": "ODataDemo.FeaturedProduct",
            "ID": 9
        };

        var expected = {
            "__metadata": {
                "type": "ODataDemo.FeaturedProduct",
                "properties": {
                    "ID": {
                        "type": "Edm.Int32"
                    },
                    "Advertisement": {
                        "type": "ODataDemo.Advertisement",
                        "associationLinkUrl": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/$links\/Advertisement"
                    },
                    "Category": {
                        "type": null,
                        "associationLinkUrl": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/$links\/Category"
                    }
                },
                "id": "http:\/myexample.com\/MyService.svc\/Products(9)",
                "uri": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct",
                "edit": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct",
                "self": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct"
            },
            "ID": 9,
            "Advertisement": {
                "__deferred": {
                    "uri": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/Advertisement"
                }
            },
            "Category": {
                "__deferred": {
                    "uri": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/Category"
                }
            }
        };
        verifyReadJsonLightWithMinimalMetadata(input, expected, "Json light type annotations in payload are preferred over type information in the metadata document", model);
        djstest.done();

    });
    
    
    djstest.addTest(function jsonLightUrisShouldBeComputedForExpandedTypesOnFeedWithInheritedTypes() {
        var model = getSampleModelWithNavPropertiesAndInheritedTypes();
      
        var input = {
             "odata.metadata": "http:\/myexample.com\/MyService.svc\/$metadata#Products",
             value: 
             [
                 {
                    "odata.type": "ODataDemo.FeaturedProduct",
                    "Category": {
                        "ID": 1
                    },
                    "ID": 9
                }
             ]                          
        };
        var expected = {
            "results": [
                {
                    "Advertisement": {
                        "__deferred": {
                            "uri": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/Advertisement"
                        }
                    },
                    "Category": {
                        "ID": 1,
                        "Products": {
                            "__deferred": {
                                "uri": "http:\/myexample.com\/MyService.svc\/Categories(1)\/Products"
                            }
                        },
                        "__metadata": {
                            "edit": "http:\/myexample.com\/MyService.svc\/Categories(1)",
                            "id": "http:\/myexample.com\/MyService.svc\/Categories(1)",
                            "properties": {
                                "ID": {
                                    "type": "Edm.Int32"
                                },
                                "Products": {
                                    "associationLinkUrl": "http:\/myexample.com\/MyService.svc\/Categories(1)\/$links\/Products",
                                    "type": "ODataDemo.Product"
                                }
                            },
                            "self": "http:\/myexample.com\/MyService.svc\/Categories(1)",
                            "type": "ODataDemo.Category",
                            "uri": "http:\/myexample.com\/MyService.svc\/Categories(1)"
                        }
                    },
                    "ID": 9,
                    "__metadata": {
                        "edit": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct",
                        "id": "http:\/myexample.com\/MyService.svc\/Products(9)",
                        "properties": {
                            "Advertisement": {
                                "associationLinkUrl": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/$links\/Advertisement",
                                "type": "ODataDemo.Advertisement"
                            },
                            "Category": {
                                "associationLinkUrl": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/$links\/Category",
                                "navigationLinkUrl": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct\/Category",
                                "type": "ODataDemo.Category"
                            },
                            "ID": {
                                "type": "Edm.Int32"
                            }
                        },
                        "self": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct",
                        "type": "ODataDemo.FeaturedProduct",
                        "uri": "http:\/myexample.com\/MyService.svc\/Products(9)\/ODataDemo.FeaturedProduct"
                    }
                }
            ]
        };
        verifyReadJsonLightWithMinimalMetadata(input, expected, "JsonLight with minimalmetadata uris should be computed for expanded types on feed with inherited types", model);
        djstest.done();

    });

    // DATAJS INTERNAL END
})(this);
