// Copyright (c) Microsoft.  All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
// files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// CacheOracle.js
// This object verifies the operation of the cache.
// Internally it maintains a simple model of the cache implemented using a lookup array of the expected cached pages.

(function (window, undefined) {

    var CacheOracle = function (baseUri, pageSize, total) {
        /// <summary>Creates a new CacheOracle</summary>
        /// <param name="baseUri" type="String">The base URI of the collection</param>
        /// <param name="pageSize" type="Integer">The page size used in the cache</param>
        /// <param name="total" type="Integer">The total number of items in the collection</param>
        this.baseUri = baseUri;
        this.pageSize = pageSize;
        this.total = total;

        this.cachedPages = [];
    };

    CacheOracle.mechanisms = {
        memory: "memory",
        indexeddb: "indexeddb",
        dom: "dom",
        best: "best"
    };

    CacheOracle.isMechanismAvailable = function (mechanism) {
        /// <summary>Determines if the specified local storage mechanism is available</summary>
        /// <param name="mechanism">The name of the mechanism</param>
        /// <returns>Whether the mechanism is available</returns>
        switch (mechanism) {
            case CacheOracle.mechanisms.indexeddb:
                if (window.mozIndexedDB) {
                    return true;
                }
                else {
                    return false;
                }
                break;
            case CacheOracle.mechanisms.dom:
                if (window.localStorage) {
                    return true;
                }
                else {
                    return false;
                }
                break;
            case CacheOracle.mechanisms.memory:
            case CacheOracle.mechanisms.best:
            case undefined:
                return true;
            default:
                return false;
        }
    }

    CacheOracle.prototype.clear = function () {
        /// <summary>Clears the cache in the oracle</summary>
        this.cachedPages = [];
    }

    CacheOracle.prototype.verifyRequests = function (requests, responses, index, count, description) {
        /// <summary>Verifies the HTTP requests for a single data request, and updates the oracle with cached pages</summary>
        /// <param name="requests" type="Array">The sequence of request objects (from OData.defaultHttpClient)</param>
        /// <param name="responses" type="Array">The sequence of response objects (from OData.defaultHttpClient)</param>
        /// <param name="index" type="Integer">The starting index of the read</param>
        /// <param name="count" type="Integer">The count of items in the read</param>
        /// <param name="description" type="String">The description of the requests being verified</param>
        var that = this;

        var pageIndex = function (index) {
            /// <summary>Returns the page index that the given item index belongs to</summary>
            /// <param name="index" type="Integer">The item index</param>
            /// <returns>The page index</returns>
            return Math.floor(index / that.pageSize);
        }

        var minPage = pageIndex(index);
        var maxPage = Math.min(pageIndex(index + count - 1), pageIndex(that.total));

        // Workaround for Bug 2055: Calling readRange with count = 0 still fires a single HTTP request
        maxPage = Math.max(minPage, maxPage);

        var expectedUris = [];
        var responseIndex = 0;
        for (var page = minPage; page <= maxPage; page++) {
            if (!this.cachedPages[page]) {
                expectedUris.push(that.baseUri + "?$skip=" + page * that.pageSize + "&$top=" + (that.pageSize));

                // Handle server paging skipToken requests
                while (responses[responseIndex] && responses[responseIndex].data && responses[responseIndex].data.__next) {
                    expectedUris.push(responses[responseIndex].data.__next);
                    responseIndex++;
                }

                responseIndex++;
                this.cachedPages[page] = true;
            }
        }

        var actualUris = $.map(requests, function (r) { return r.requestUri; });
        djstest.assertAreEqualDeep(actualUris, expectedUris, description);
    };

    window.CacheOracle = CacheOracle;

})(this);