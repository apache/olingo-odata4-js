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

(function (window, undefined) {
    var unexpectedErrorHandler = function (err) {
        djstest.assert(false, "Unexpected call to error handler with error: " + djstest.toString(err));
        djstest.done();
    };

    var uriRegEx = /^([^:/?#]+:)?(\/\/[^/?#]*)?([^?#:]+)?(\?[^#]*)?(#.*)?/;
    var uriPartNames = ["scheme", "authority", "path", "query", "fragment"];

    var getURIInfo = function (uri) {
        /** Gets information about the components of the specified URI.
         * @param {String} uri - URI to get information from.
         * @returns {Object}
         * An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
         */

        var result = { isAbsolute: false };

        if (uri) {
            var matches = uriRegEx.exec(uri);
            if (matches) {
                var i, len;
                for (i = 0, len = uriPartNames.length; i < len; i++) {
                    if (matches[i + 1]) {
                        result[uriPartNames[i]] = matches[i + 1];
                    }
                }
            }
            if (result.scheme) {
                result.isAbsolute = true;
            }
        }

        return result;
    };

    var normalizeURI = function (uri, base) {
        /** Normalizes a possibly relative URI with a base URI.
         * @param {String} uri - URI to normalize, absolute or relative.
         * @param {String} base - Base URI to compose with (may be null)
         * @returns {String} The composed URI if relative; the original one if absolute.
         */

        if (!base) {
            return uri;
        }

        var uriInfo = getURIInfo(uri);
        if (uriInfo.isAbsolute) {
            return uri;
        }

        var baseInfo = getURIInfo(base);
        var normInfo = {};

        if (uriInfo.authority) {
            normInfo.authority = uriInfo.authority;
            normInfo.path = uriInfo.path;
            normInfo.query = uriInfo.query;
        } else {
            if (!uriInfo.path) {
                normInfo.path = baseInfo.path;
                normInfo.query = uriInfo.query || baseInfo.query;
            } else {
                if (uriInfo.path.charAt(0) === '/') {
                    normInfo.path = uriInfo.path;
                } else {
                    normInfo.path = mergeUriPathWithBase(uriInfo, baseInfo);
                }

                normInfo.query = uriInfo.query;
            }

            normInfo.authority = baseInfo.authority;
        }

        normInfo.scheme = baseInfo.scheme;
        normInfo.fragment = uriInfo.fragment;

        return "".concat(
            normInfo.scheme || "",
            normInfo.authority || "",
            normInfo.path || "",
            normInfo.query || "",
            normInfo.fragment || "");
    };

    var mergeUriPathWithBase = function (uriInfo, baseInfo) {
        /** Merges the path of a relative URI and a base URI.
         * @param uriInfo - URI component information for the relative URI.
         * @param baseInfo - URI component information for the base URI.
         * @returns {String} A string with the merged path.
         */

        var basePath = "/";
        if (baseInfo.path) {
            var end = baseInfo.path.lastIndexOf("/");
            basePath = baseInfo.path.substring(0, end);

            if (basePath.charAt(basePath.length - 1) !== "/") {
                basePath = basePath + "/";
            }
        }

        return basePath + uriInfo.path;
    };

    var services = [
        "./endpoints/FoodStoreDataServiceV4.svc"
    ];

    var mimeTypes = [undefined, "application/json;odata.metadata=minimal"];

    var httpStatusCode = {
        created: 201,
        noContent: 204,
        notFound: 404
    };

    $.each(services, function (_, service) {

        var foodsFeed = service + "/Foods";
        var categoriesFeed = service + "/Categories";

        var baseLinkUri = normalizeURI(service.substr(2), window.location.href);

        var newFoodLinks = {
            "@odata.id": baseLinkUri + "/Foods" + "(1)"
        };

        var newCategoryLinks = {
            "@odata.id": baseLinkUri + "/Categories" + "(2)"
        };


        module("Functional", {
            setup: function () {
                djstest.wait(function (done) {
                    $.post(service + "/ResetData", done);
                });
            }
        });

        var readLinksFeed = categoriesFeed + "(1)/Foods/$ref";
        var readLinksEntry = foodsFeed + "(0)/Category/$ref";

        $.each(mimeTypes, function (_, mimeType) {

            var headers = mimeType ? { "Content-Type": mimeType, Accept: mimeType} : undefined;

            djstest.addTest(function readValidLinksFeedTests(params) {
                djstest.assertsExpected(1);
                odatajs.oData.read({ requestUri: params.linksFeed, headers: headers },
                    function (data, response) {
                        window.ODataVerifyReader.readLinksFeed(params.linksFeed,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, params.mimeType
                        );
                    },
                    unexpectedErrorHandler
                );
            }, "Testing valid read of " + readLinksFeed + " with " + mimeType, { linksFeed: readLinksFeed, mimeType: mimeType });

            djstest.addTest(function readValidLinksEntryTest(params) {
                djstest.assertsExpected(1);
                odatajs.oData.read({ requestUri: params.linksEntry, headers: headers },
                    function (data, response) {
                        window.ODataVerifyReader.readLinksEntry(params.linksEntry,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, params.mimeType
                        );
                    },
                    unexpectedErrorHandler
                );
            }, "Testing valid read of " + readLinksEntry + " with " + mimeType, { linksEntry: readLinksEntry, mimeType: mimeType });

            djstest.addTest(function updateLinksEntityTest(mimeType) {

                var request = {
                    requestUri: foodsFeed + "(1)/Category/$ref",
                    method: "PUT",
                    headers: djstest.clone(headers),
                    data: newCategoryLinks
                };


                odatajs.oData.request(request, function (data, response) {
                    var httpOperation = request.method + " " + request.requestUri;
                    djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code: " + httpOperation);
                    ODataVerifyReader.readLinksEntry(request.requestUri, function (actualData) {
                        if (actualData && actualData["@odata.context"]) {
                            delete actualData["@odata.context"];
                        }
                        
                        djstest.assertAreEqualDeep(actualData, request.data, "Verify new links entry against the request: " + httpOperation);
                        djstest.done();
                    });
                }, unexpectedErrorHandler);

            }, "Update links entity (mimeType = " + mimeType + " service = " + service + ")", mimeType);

            djstest.addTest(function addDeleteLinksFeedTest(mimeType) {

                var request = {
                    requestUri: categoriesFeed + "(2)/Foods/$ref",
                    method: "POST",
                    headers: djstest.clone(headers),
                    data: newFoodLinks
                };

                var deleteAndVerify = function (){
                
                    // delete by id
                    var deletionRequest = {
                        requestUri: categoriesFeed + "(2)/Foods/$ref?$id=" + newFoodLinks["@odata.id"],
                        method: "DELETE",
                        headers: djstest.clone(headers),
                        data: null
                    };

                    odatajs.oData.request(deletionRequest, function (data, response) {
                        var httpOperation = deletionRequest.method + " " + deletionRequest.requestUri;
                        djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code: " + httpOperation);

                        odatajs.oData.read(request.requestUri, function (data, response) {
                           var httpOperation = "Read " + request.requestUri;
                           djstest.assertAreEqual(0, response.data.value.length, "Verify links against the request: " + httpOperation);
                           djstest.done();
                        },unexpectedErrorHandler);
                    }, unexpectedErrorHandler);
                };

                // add
                odatajs.oData.request(request, function (data, response) {

                    var httpOperation = request.method + " " + request.requestUri;
                    djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code: " + httpOperation);

                    odatajs.oData.read(request.requestUri, function (data, response) {
                        ODataVerifyReader.readLinksFeed(request.requestUri, function (actualData) {
                            djstest.assertAreEqualDeep(actualData, response.data, "Verify updated links entry against the request: " + httpOperation);
                            deleteAndVerify();
                        });
                    });
                }, unexpectedErrorHandler);
                
            }, "Add & Delete entity (mimeType = " + mimeType + " service = " + service + ")", mimeType);
            
        });
    });
})(this);