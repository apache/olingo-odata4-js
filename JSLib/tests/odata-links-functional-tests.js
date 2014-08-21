/// <reference path="common/djstest.js" />
/// <reference path="../src/odata.js" />
/// <reference path="common/ODataReadOracle.js" />

(function (window, undefined) {
    var unexpectedErrorHandler = function (err) {
        djstest.assert(false, "Unexpected call to error handler with error: " + djstest.toString(err));
        djstest.done();
    };

    var uriRegEx = /^([^:/?#]+:)?(\/\/[^/?#]*)?([^?#:]+)?(\?[^#]*)?(#.*)?/;
    var uriPartNames = ["scheme", "authority", "path", "query", "fragment"];

    var getURIInfo = function (uri) {
        /// <summary>Gets information about the components of the specified URI.</summary>
        /// <param name="uri" type="String">URI to get information from.</param>
        /// <returns type="Object">
        /// An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
        /// </returns>

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
        /// <summary>Normalizes a possibly relative URI with a base URI.</summary>
        /// <param name="uri" type="String">URI to normalize, absolute or relative.</param>
        /// <param name="base" type="String" mayBeNull="true">Base URI to compose with.</param>
        /// <returns type="String">The composed URI if relative; the original one if absolute.</returns>

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
        /// <summary>Merges the path of a relative URI and a base URI.</summary>
        /// <param name="uriInfo">URI component information for the relative URI.</param>
        /// <param name="baseInfo">URI component information for the base URI.</param>
        /// <returns type="String">A string with the merged path.</returns>

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

    var mimeTypes = [undefined, "application/json;odata.metadata=minimal"/*, "application/xml"*/];

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
                        window.ODataReadOracle.readLinksFeed(params.linksFeed,
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
                        window.ODataReadOracle.readLinksEntry(params.linksEntry,
                            function (expectedData) {
                                djstest.assertAreEqualDeep(data, expectedData, "Response data not same as expected");
                                djstest.done();
                            }, params.mimeType
                        );
                    },
                    unexpectedErrorHandler
                );
            }, "Testing valid read of " + readLinksEntry + " with " + mimeType, { linksEntry: readLinksEntry, mimeType: mimeType });

            djstest.addTest(function addLinksEntityTest(mimeType) {

                var request = {
                    requestUri: foodsFeed + "(1)/Category/$ref",
                    method: "PUT",
                    headers: djstest.clone(headers),
                    data: newCategoryLinks
                };


                odatajs.oData.request(request, function (data, response) {
                    var httpOperation = request.method + " " + request.requestUri;
                    djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code: " + httpOperation);
                    ODataReadOracle.readLinksEntry(request.requestUri, function (actualData) {
                        if (actualData && actualData["@odata.context"]) {
                            delete actualData["@odata.context"];
                        }
                        
                        djstest.assertAreEqualDeep(actualData, request.data, "Verify new links entry against the request: " + httpOperation);
                        djstest.done();
                    });
                }, unexpectedErrorHandler);

            }, "Add new links entity (mimeType = " + mimeType + " service = " + service + ")", mimeType);

            djstest.addTest(function addLinksFeedTest(mimeType) {

                var request = {
                    requestUri: categoriesFeed + "(2)/Foods/$ref",
                    method: "POST",
                    headers: djstest.clone(headers),
                    data: newFoodLinks
                };

                odatajs.oData.request(request, function (data, response) {

                    var httpOperation = request.method + " " + request.requestUri;
                    djstest.assertAreEqual(response.statusCode, httpStatusCode.noContent, "Verify response code: " + httpOperation);

                    odatajs.oData.read(request.requestUri, function (data, response) {
                        ODataReadOracle.readLinksFeed(request.requestUri, function (actualData) {
                            djstest.assertAreEqualDeep(actualData, response.data, "Verify updated links entry against the request: " + httpOperation);
                            djstest.done();
                        });
                    });
                }, unexpectedErrorHandler);
            }, "Update entity (mimeType = " + mimeType + " service = " + service + ")", mimeType);
        });
    });
})(this);