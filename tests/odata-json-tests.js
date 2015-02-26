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
   
    
    djstest.addTest(function isArrayTest() {
        //also on node
        djstest.assert(odatajs.utils.isArray([]));
        djstest.assert(odatajs.utils.isArray([1, 2]));
        djstest.assert(!odatajs.utils.isArray({}));
        djstest.assert(!odatajs.utils.isArray("1,2,3,4"));
        djstest.assert(!odatajs.utils.isArray());
        djstest.assert(!odatajs.utils.isArray(null));
        djstest.done();
    });

    djstest.addTest(function jsonParserTest() {
        var tests = [
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" }, expected: {} },
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" }, expected: { "@odata.context": "http://foo/OData.svc/$metadata#Products(0)/Name", value: "Bread"} },
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
             { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
              { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
              { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
              { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
              { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var data = JSON.stringify(tests[i].expected);
            var actual = window.odatajs.oData.json.jsonParser(window.odatajs.oData.json.jsonHandler, data, tests[i].context);
            djstest.assertAreEqualDeep(actual, tests[i].expected, "test " + i + "didn't return the expected data");
        }

        djstest.done();
    });

    djstest.addTest(function jsonSerializerTest() {
        var tests = [
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" }, expected: { value: ""} },
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" }, expected: { value: []} },
            { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
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
           { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
               expected: {
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
           },
           { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
               expected: {
                   "@odata.id": "Foods(4)",
                   "@odata.type": "#DataJS.Tests.V4.Food",
                   ID: 0,
                   Name: "Bread",
                   Description: "Whole grain bread",
                   ReleaseDate: "1992-01-01T00:00:00Z",
                   DiscontinuedDate: null,
                   Rating: 4,
                   Price: 2.5
               },
               data: {
                   "@odata.context": "http://base.org/$metadata#Foods/$entity",
                   "@odata.id": "Foods(4)",
                   "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                   "@odata.editLink": "Foods(0)",
                   "@odata.type": "#DataJS.Tests.V4.Food",
                   "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink",
                   "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink",
                   "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType",
                   "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag",
                   ID: 0,
                   Name: "Bread",
                   Description: "Whole grain bread",
                   ReleaseDate: "1992-01-01T00:00:00Z",
                   DiscontinuedDate: null,
                   Rating: 4,
                   Price: 2.5
               }
           },
           { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
               expected: {
                   "@odata.id": "Foods(4)",
                   value : [{
                       "@odata.id": "Foods(4)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       ID: 0,
                       ComplexInLayerOne:
                       {
                           "@odata.id": "Foods(4)",
                           "@odata.type": "#DataJS.Tests.V4.Food",
                           ID: 1,
                           ComplexInLayerTwo:
                           {
                               "@odata.id": "Foods(4)",
                               "@odata.type": "#DataJS.Tests.V4.Food",
                               ID: 2,
                               ComplexInLayerThreeList: [
                               {
                                   "@odata.id": "Foods(4)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               },
                               {
                                   "@odata.id": "Foods(4)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               }],
                               Name: "BreadInLayer2",
                               Description: "Whole grain bread inLayer2",
                               ReleaseDate: "1992-01-01T00:00:00Z",
                               DiscontinuedDate: null,
                               Rating: 6,
                               Price: 4.5
                           },
                           Name: ["BreadInLayer1", "BreadInLayer12", "BreadInLayer13"],
                           Description: "Whole grain bread inLayer1",
                           ReleaseDate: "1992-01-01T00:00:00Z",
                           DiscontinuedDate: null,
                           Rating: 5,
                           Price: 3.5
                       },
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 4,
                       Price: 2.5
                   },
                   {
                       "@odata.id": "Foods(4)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       ID: 0,
                       ComplexInLayerOne:
                       {
                           "@odata.id": "Foods(4)",
                           "@odata.type": "#DataJS.Tests.V4.Food",
                           ID: 1,
                           ComplexInLayerTwo:
                           {
                               "@odata.id": "Foods(4)",
                               "@odata.type": "#DataJS.Tests.V4.Food",
                               ID: 2,
                               ComplexInLayerThreeList: [
                               {
                                   "@odata.id": "Foods(4)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               },
                               {
                                   "@odata.id": "Foods(4)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               }],
                               Name: "BreadInLayer2",
                               Description: "Whole grain bread inLayer2",
                               ReleaseDate: "1992-01-01T00:00:00Z",
                               DiscontinuedDate: null,
                               Rating: 6,
                               Price: 4.5
                           },
                           Name: ["BreadInLayer1", "BreadInLayer12", "BreadInLayer13"],
                           Description: "Whole grain bread inLayer1",
                           ReleaseDate: "1992-01-01T00:00:00Z",
                           DiscontinuedDate: null,
                           Rating: 5,
                           Price: 3.5
                       },
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 4,
                       Price: 2.5
                   }]
               },
               data: {
                   "@odata.context": "http://base.org/$metadata#Foods/$entity",
                   "@odata.id": "Foods(4)",
                   "@odata.editLink": "Foods(0)",
                   value : [{
                       "@odata.context": "http://base.org/$metadata#Foods/$entity",
                       "@odata.id": "Foods(4)",
                       "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                       "@odata.editLink": "Foods(0)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink",
                       "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink",
                       "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType",
                       "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag",
                       ID: 0,
                       ComplexInLayerOne:
                       {
                           "@odata.context": "http://base.org/$metadata#Foods/$entity",
                           "@odata.id": "Foods(4)",
                           "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                           "@odata.editLink": "Foods(0)",
                           "@odata.type": "#DataJS.Tests.V4.Food",
                           "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer1",
                           "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer1",
                           "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer1",
                           "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer1",
                           ID: 1,
                           ComplexInLayerTwo:
                           {
                               "@odata.context": "http://base.org/$metadata#Foods/$entity",
                               "@odata.id": "Foods(4)",
                               "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                               "@odata.editLink": "Foods(0)",
                               "@odata.type": "#DataJS.Tests.V4.Food",
                               "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer2",
                               "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer2",
                               "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer2",
                               "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer2",
                               ID: 2,
                               ComplexInLayerThreeList: [
                               {
                                   "@odata.context": "http://base.org/$metadata#Foods/$entity",
                                   "@odata.id": "Foods(4)",
                                   "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                                   "@odata.editLink": "Foods(0)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer3",
                                   "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer3",
                                   "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer3",
                                   "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer3",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               },
                               {
                                   "@odata.context": "http://base.org/$metadata#Foods/$entity",
                                   "@odata.id": "Foods(4)",
                                   "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                                   "@odata.editLink": "Foods(0)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer3",
                                   "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer3",
                                   "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer3",
                                   "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer3",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               }],
                               Name: "BreadInLayer2",
                               Description: "Whole grain bread inLayer2",
                               ReleaseDate: "1992-01-01T00:00:00Z",
                               DiscontinuedDate: null,
                               Rating: 6,
                               Price: 4.5
                           },
                           Name: ["BreadInLayer1", "BreadInLayer12", "BreadInLayer13"],
                           Description: "Whole grain bread inLayer1",
                           ReleaseDate: "1992-01-01T00:00:00Z",
                           DiscontinuedDate: null,
                           Rating: 5,
                           Price: 3.5
                       },
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 4,
                       Price: 2.5
                   },
                   {
                       "@odata.context": "http://base.org/$metadata#Foods/$entity",
                       "@odata.id": "Foods(4)",
                       "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                       "@odata.editLink": "Foods(0)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink",
                       "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink",
                       "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType",
                       "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag",
                       ID: 0,
                       ComplexInLayerOne:
                       {
                           "@odata.context": "http://base.org/$metadata#Foods/$entity",
                           "@odata.id": "Foods(4)",
                           "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                           "@odata.editLink": "Foods(0)",
                           "@odata.type": "#DataJS.Tests.V4.Food",
                           "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer1",
                           "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer1",
                           "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer1",
                           "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer1",
                           ID: 1,
                           ComplexInLayerTwo:
                           {
                               "@odata.context": "http://base.org/$metadata#Foods/$entity",
                               "@odata.id": "Foods(4)",
                               "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                               "@odata.editLink": "Foods(0)",
                               "@odata.type": "#DataJS.Tests.V4.Food",
                               "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer2",
                               "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer2",
                               "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer2",
                               "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer2",
                               ID: 2,
                               ComplexInLayerThreeList: [
                               {
                                   "@odata.context": "http://base.org/$metadata#Foods/$entity",
                                   "@odata.id": "Foods(4)",
                                   "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                                   "@odata.editLink": "Foods(0)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer3",
                                   "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer3",
                                   "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer3",
                                   "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer3",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               },
                               {
                                   "@odata.context": "http://base.org/$metadata#Foods/$entity",
                                   "@odata.id": "Foods(4)",
                                   "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                                   "@odata.editLink": "Foods(0)",
                                   "@odata.type": "#DataJS.Tests.V4.Food",
                                   "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer3",
                                   "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer3",
                                   "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer3",
                                   "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer3",
                                   ID: 3,
                                   Name: "BreadInLayer3",
                                   Description: "Whole grain bread inLayer3",
                                   ReleaseDate: "1992-01-01T00:00:00Z",
                                   DiscontinuedDate: null,
                                   Rating: 7,
                                   Price: 5.5
                               }],
                               Name: "BreadInLayer2",
                               Description: "Whole grain bread inLayer2",
                               ReleaseDate: "1992-01-01T00:00:00Z",
                               DiscontinuedDate: null,
                               Rating: 6,
                               Price: 4.5
                           },
                           Name: ["BreadInLayer1", "BreadInLayer12", "BreadInLayer13"],
                           Description: "Whole grain bread inLayer1",
                           ReleaseDate: "1992-01-01T00:00:00Z",
                           DiscontinuedDate: null,
                           Rating: 5,
                           Price: 3.5
                       },
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 4,
                       Price: 2.5
                   }]
               }
           },
           { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
               expected: {
                   "@odata.id": "Foods(4)",
                   "@odata.type": "#DataJS.Tests.V4.Food",
                   ID: 0,
                   ComplexInLayerOne:
                   {
                       "@odata.id": "Foods(4)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       ID: 1,
                       ComplexInLayerTwo:
                       {
                           "@odata.id": "Foods(4)",
                           "@odata.type": "#DataJS.Tests.V4.Food",
                           ID: 2,
                           ComplexInLayerThree:
                           {
                               "@odata.id": "Foods(4)",
                               "@odata.type": "#DataJS.Tests.V4.Food",
                               ID: 3,
                               Name: "BreadInLayer3",
                               Description: "Whole grain bread inLayer3",
                               ReleaseDate: "1992-01-01T00:00:00Z",
                               DiscontinuedDate: null,
                               Rating: 7,
                               Price: 5.5
                           },
                           Name: "BreadInLayer2",
                           Description: "Whole grain bread inLayer2",
                           ReleaseDate: "1992-01-01T00:00:00Z",
                           DiscontinuedDate: null,
                           Rating: 6,
                           Price: 4.5
                       },
                       Name: "BreadInLayer1",
                       Description: "Whole grain bread inLayer1",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 5,
                       Price: 3.5
                   },
                   Name: "Bread",
                   Description: "Whole grain bread",
                   ReleaseDate: "1992-01-01T00:00:00Z",
                   DiscontinuedDate: null,
                   Rating: 4,
                   Price: 2.5
               },
               data: {
                   "@odata.context": "http://base.org/$metadata#Foods/$entity",
                   "@odata.id": "Foods(4)",
                   "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                   "@odata.editLink": "Foods(0)",
                   "@odata.type": "#DataJS.Tests.V4.Food",
                   "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink",
                   "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink",
                   "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType",
                   "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag",
                   ID: 0,
                   ComplexInLayerOne:
                   {
                       "@odata.context": "http://base.org/$metadata#Foods/$entity",
                       "@odata.id": "Foods(4)",
                       "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                       "@odata.editLink": "Foods(0)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer1",
                       "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer1",
                       "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer1",
                       "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer1",
                       ID: 1,
                       ComplexInLayerTwo:
                       {
                           "@odata.context": "http://base.org/$metadata#Foods/$entity",
                           "@odata.id": "Foods(4)",
                           "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                           "@odata.editLink": "Foods(0)",
                           "@odata.type": "#DataJS.Tests.V4.Food",
                           "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer2",
                           "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer2",
                           "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer2",
                           "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer2",
                           ID: 2,
                           ComplexInLayerThree:
                           {
                               "@odata.context": "http://base.org/$metadata#Foods/$entity",
                               "@odata.id": "Foods(4)",
                               "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                               "@odata.editLink": "Foods(0)",
                               "@odata.type": "#DataJS.Tests.V4.Food",
                               "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink/layer3",
                               "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink/layer3",
                               "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType/layer3",
                               "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag/layer3",
                               ID: 3,
                               Name: "BreadInLayer3",
                               Description: "Whole grain bread inLayer3",
                               ReleaseDate: "1992-01-01T00:00:00Z",
                               DiscontinuedDate: null,
                               Rating: 7,
                               Price: 5.5
                           },
                           Name: "BreadInLayer2",
                           Description: "Whole grain bread inLayer2",
                           ReleaseDate: "1992-01-01T00:00:00Z",
                           DiscontinuedDate: null,
                           Rating: 6,
                           Price: 4.5
                       },
                       Name: "BreadInLayer1",
                       Description: "Whole grain bread inLayer1",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 5,
                       Price: 3.5
                   },
                   Name: "Bread",
                   Description: "Whole grain bread",
                   ReleaseDate: "1992-01-01T00:00:00Z",
                   DiscontinuedDate: null,
                   Rating: 4,
                   Price: 2.5
               }
           },
           { context: { response: { requestUri: "http://base.org" }, dataServiceVersion: "4.0" },
               expected: {
                   value: [{
                       "@odata.id": "Foods(4)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       ID: 0,
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 4,
                       Price: 2.5
                   },
                   {
                       "@odata.id": "Foods(2)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       ID: 1,
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1999-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 6,
                       Price: 3.5
                   }]
               },
               data: {
                   value: [{
                       "@odata.context": "http://base.org/$metadata#Foods/$entity",
                       "@odata.id": "Foods(4)",
                       "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                       "@odata.editLink": "Foods(0)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink",
                       "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink",
                       "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType",
                       "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag",
                       ID: 0,
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1992-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 4,
                       Price: 2.5
                   },
                   {
                       "@odata.context": "http://base.org/$metadata#Foods/$entity",
                       "@odata.id": "Foods(2)",
                       "@odata.etag": "W/MjAxMy0wNS0yN1QxMTo1OFo=",
                       "@odata.editLink": "Foods(2)",
                       "@odata.type": "#DataJS.Tests.V4.Food",
                       "@odata.mediaEditLink": "http://base.org/$metadata#Foods/mediaEditLink2",
                       "@odata.mediaReadLink": "http://base.org/$metadata#Foods/mediaReadLink2",
                       "@odata.mediaContentType": "http://base.org/$metadata#Foods/mediaContentType2",
                       "@odata.mediaEtag": "http://base.org/$metadata#Foods/mediaEtag2",
                       ID: 1,
                       Name: "Bread",
                       Description: "Whole grain bread",
                       ReleaseDate: "1999-01-01T00:00:00Z",
                       DiscontinuedDate: null,
                       Rating: 6,
                       Price: 3.5
                   }]
               }
           }
          ];
        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var data = tests[i].data ? tests[i].data : tests[i].expected;
            var actual = window.odatajs.oData.json.jsonSerializer(window.odatajs.oData.json.jsonHandler, data, tests[i].context);
            var expected = JSON.stringify(tests[i].expected);
            djstest.assertAreEqualDeep(actual, expected, "test " + i + "didn't return the expected data");
        }
        djstest.done();
    });

    djstest.addTest(function normalizeHeadersReadTest() {
        // Verifies that headers are normalized for reading.
        // See issue at http://datajs.codeplex.com/workitem/148
        MockHttpClient.clear();

        MockHttpClient.clear().addResponse("/foo", {
            statusCode: 200,
            body: { "@odata.context": "http://foo", value: [] },
            headers: { "unknown": "u", "Content-Encoding": "compress, gzip", "Content-Length": "8042",
                "Content-Type": "application/json", "OData-Version": "4.0", "Etag": "Vetag", "Location": "foo", "OData-EntityId": "entityId",
                "Preference-Applied": "prefered", "Retry-After": "retry"
            }
        });

        odatajs.oData.read("/foo", function (data, response) {
            // djstest.assertAreEqual(data.results.length, 2, "data.results.length has two entries");
            djstest.assertAreEqual(response.headers.unknown, "u", "u unmodified");
            djstest.assertAreEqual(response.headers["Content-Encoding"], "compress, gzip", "Content-Encoding available");
            djstest.assertAreEqual(response.headers["Content-Length"], "8042", "Content-Length available");
            djstest.assertAreEqual(response.headers["Content-Type"], "application/json", "Content-Type available");
            djstest.assertAreEqual(response.headers["ETag"], "Vetag", "Content-Type available");
            djstest.assertAreEqual(response.headers["Location"], "foo", "Content-Type available");
            djstest.assertAreEqual(response.headers["OData-EntityId"], "entityId", "OData-EntityId available");
            djstest.assertAreEqual(response.headers["Preference-Applied"], "prefered", "Preference-Applied available");
            djstest.assertAreEqual(response.headers["Retry-After"], "retry", "Retry available");
            djstest.assertAreEqual(response.headers["OData-Version"], "4.0", "OData-Version available");
            djstest.done();
        }, undefined, undefined, MockHttpClient);
    });

    djstest.addTest(function normalizeHeadersWriteTest() {

        // Verifies that headers are normalized for writing.
        // See issue at http://datajs.codeplex.com/workitem/148

        MockHttpClient.clear().addRequestVerifier("/foo", function (request) {
            djstest.assertAreEqual(request.headers.Accept, "application/json", "Accept available");
            djstest.assertAreEqual(request.headers["Content-Type"], "application/json", "json found");
            djstest.assertAreEqual(request.headers["Content-Encoding"], "compress, gzip", "Content-Encoding available");
            djstest.assertAreEqual(request.headers["Content-Length"], "8042", "Content-Length available");
            djstest.assertAreEqual(request.headers["OData-Version"], "4.0", "OData-Version available");
            djstest.assertAreEqual(request.headers["Accept-Charset"], "Accept-Charset", "Accept-Charset available");
            djstest.assertAreEqual(request.headers["If-Match"], "true", "If-Match available");
            djstest.assertAreEqual(request.headers["If-None-Match"], "false", "If-None-Match available");
            djstest.assertAreEqual(request.headers["OData-Isolation"], "isolation", "OData-Isolation available");
            djstest.assertAreEqual(request.headers["OData-MaxVersion"], "4.0", "OData-MaxVersion available");
            djstest.assertAreEqual(request.headers["Prefer"], "prefer", "prefer available");
            djstest.done();
        });

        var request = {
            method: "POST",
            requestUri: "/foo",
            data: { value: 123 },
            headers: { "Accept": "application/json", "Content-Encoding": "compress, gzip", "Content-Length": "8042", "content-type": "application/json", "OData-Version": "4.0",
                "accept-charset": "Accept-Charset", "if-match": "true", "if-none-match": "false", "odata-isolation": "isolation",
                "odata-maxversion": "4.0", "prefer": "prefer"
            }
        };
        odatajs.oData.request(request, function (data) { }, undefined, undefined, MockHttpClient);

    });

    var verifyReadJsonLightDataMetadataFull = function (input, expected, message, model) {
        var response = { 
          headers: { 
            "Content-Type": "application/json;odata.metadata=full",
             DataServiceVersion: "4.0"
          },
          body: JSON.stringify(input) 
        };

        window.odatajs.oData.json.jsonHandler.read(response, { metadata: model });
        djstest.assertAreEqualDeep(response.data, expected, message);
    };


    var verifyReadJsonLightDataMetadataMinimal= function (input, expected, message, model) {
        var response = { 
          headers: { 
            "Content-Type": "application/json;odata.metadata=minimal",
             DataServiceVersion: "4.0"
          },
          body: JSON.stringify(input) 
        };

        window.odatajs.oData.json.jsonHandler.read(response, { metadata: model });
        djstest.assertAreEqualDeep(response.data, expected, message);
    };

    var getPointValue =  { edmType : '#GeographyPoint', value : {
                type: "Point",
                coordinates: [1.0, 2.0],
                crs: {
                    type: "Point",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
              }};

    var getLineStringValue =  { edmType : '#GeographyLineString', value : {
                "type": "LineString",
                "coordinates": [ [100.0, 0.0], [101.0, 1.0] ],
                crs: {
                    type: "LineString",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
              }};

    var getPolygonValue =  { edmType : '#GeographyPolygon', value : {
                "type": "Polygon",
                "coordinates": [
                  [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
                  [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
                  ],
                crs: {
                    type: "Polygon",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
              }};

    var getMultiPointValue =  { edmType : '#GeographyMultiPoint', value : {
                "type": "MultiPoint",
                "coordinates": [ [100.0, 0.0], [101.0, 1.0] ],
                crs: {
                    type: "MultiPoint",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
              }};

    var getMultiLineStringValue =  { edmType : '#GeographyMultiLineString', value : {
                  "type": "MultiLineString",
                  "coordinates": [
                      [ [100.0, 0.0], [101.0, 1.0] ],
                      [ [102.0, 2.0], [103.0, 3.0] ]
                    ],
                crs: {
                    type: "MultiLineString",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
              }};
      var getMultiPolygonStringValue =  { edmType : '#GeographyMultiPolygon', value : {
                  "type": "MultiPolygon",
                  "coordinates": [
                    [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
                    [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                     [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
                    ],
                crs: {
                    type: "MultiPolygon",
                    properties: {
                        name: "EPSG:4326"
                    }
                }
              }};

      var getWorkload = [getPointValue, getLineStringValue, getPolygonValue, getMultiPointValue, getMultiLineStringValue, getMultiPolygonStringValue ];


      djstest.addTest(function jsonReadGeometryPointFull() {

        for ( var i = 0; i < getWorkload.length; i++) {
          var item = getWorkload[i]; 
          var input = {
            "@odata.context": "http://someUri#Edm."+item.edmType,
            "value@odata.type" : item.edmType,
            value: item.value
          }; 

          var expected = {
            "@odata.context": "http://someUri#Edm."+item.edmType,
            "value@odata.type" : item.edmType,
            value: item.value
          };
          verifyReadJsonLightDataMetadataFull(input, expected, "Json light top level primitive property was read properly.");
        }
        
        djstest.done();
    });


    djstest.addTest(function jsonReadGeometryPointMinimal() {
      for ( var i = 0; i < getWorkload.length; i++) {
        var item = getWorkload[i]; 
        var input = {
            "@odata.context": "http://someUri#Edm."+item.edmType,
            value: item.value
        };

        var expected = {
            "@odata.context": "http://someUri#Edm."+item.edmType,
            value: item.value,
            "value@odata.type" : item.edmType
        };

        verifyReadJsonLightDataMetadataMinimal(input, expected, "Json light top level primitive property was read properly.", {});
      }
      djstest.done();
    });

})(this);
