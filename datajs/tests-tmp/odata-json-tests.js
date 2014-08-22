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
    QUnit.module("odata-json-tests.js");

    djstest.addTest(function isArrayTest() {
        djstest.assert(window.odatajs.utils.isArray([]));
        djstest.assert(window.odatajs.utils.isArray([1, 2]));
        djstest.assert(!window.odatajs.utils.isArray({}));
        djstest.assert(!window.odatajs.utils.isArray("1,2,3,4"));
        djstest.assert(!window.odatajs.utils.isArray());
        djstest.assert(!window.odatajs.utils.isArray(null));
        djstest.done();
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


    function createPointValue(geoKind) { 
      return { 
        edmType : geoKind+'Point', value : {
          type: "Point",
          coordinates: [1.0, 2.0],
          crs: {
              type: "Point",
              properties: {
                  name: "EPSG:4326"
              }
          }
        }
      };
    }

    function createLineStringValue(geoKind) { 
      return  { 
        edmType : geoKind+'LineString', value : {
          "type": "LineString",
          "coordinates": [ [100.0, 0.0], [101.0, 1.0] ],
          crs: {
              type: "LineString",
              properties: {
                  name: "EPSG:4326"
              }
          }
        }
      };
    }

    function createPolygonValue(geoKind) { 
      return  {
        edmType : geoKind+'Polygon', value : {
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
        }
      };
    }

    function createMultiPointValue(geoKind) { 
      return  { 
        edmType : geoKind+'MultiPoint', value : {
          "type": "MultiPoint",
          "coordinates": [ [100.0, 0.0], [101.0, 1.0] ],
          crs: {
              type: "MultiPoint",
              properties: {
                  name: "EPSG:4326"
              }
          }
        }
      };
    }

    function createMultiLineStringValue(geoKind) { 
      return  { 
        edmType : geoKind+'MultiLineString', value : {
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
        }
      };
    }
    function createMultiPolygonStringValue(geoKind) { 
      return  { 
        edmType : geoKind+'MultiPolygon', value : {
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
            }
          };
        }

    function createWorkload(geoKind) { 
      return [
        createPointValue(geoKind),
        createLineStringValue(geoKind), 
        createPolygonValue(geoKind),
        createMultiPointValue(geoKind),
        createMultiLineStringValue(geoKind),
        createMultiPolygonStringValue(geoKind) 
      ];
    }

    function checkGeoKind(geoKind, full) {
      var workload = createWorkload(geoKind);
      for ( var i = 0; i < workload.length; i++) {
        var item = workload[i]; 
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
        if (full) {
          verifyReadJsonLightDataMetadataFull(input, expected, item.edmType + " was read properly.", {});
        } else {
          verifyReadJsonLightDataMetadataMinimal(input, expected, item.edmType + " was read properly.", {});
        }
      }
      
      djstest.done();
    }

    djstest.addTest(function jsonReadGeometryFull() {
      checkGeoKind('Geometry',true);
    });
    djstest.addTest(function jsonReadGeometryMinimal() {
      checkGeoKind('Geometry',false);
    });
    djstest.addTest(function jsonReadGeographyFull() {
      checkGeoKind('Geography',true);
    });
    djstest.addTest(function jsonReadGeographyMinimal() {
      checkGeoKind('Geography',false);
    });

})(window);
