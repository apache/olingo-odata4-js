// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
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

    var CacheOracle = function (baseUri, pageSize, total, cacheSize) {
        /// <summary>Creates a new CacheOracle</summary>
        /// <param name="baseUri" type="String">The base URI of the collection</param>
        /// <param name="pageSize" type="Integer">The page size used in the cache</param>
        /// <param name="total" type="Integer">The total number of items in the collection</param>
        /// <param name="cacheSize" type="Integer">Cache size in bytes</param>
        this.baseUri = baseUri;
        this.pageSize = pageSize;
        this.total = total;
        this.cacheSize = (cacheSize !== undefined) ? cacheSize : 1024 * 1024;
        this.actualSize = 0;
        this.actualCount = 0;
        this.cachedPages = [];
        this.exactPageCount = (total % pageSize === 0);
        this.maxPage = Math.floor(total / pageSize);
        this.overflowed = this.cacheSize === 0;
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
                if (window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.indexedDB) {
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
        this.actualSize = 0;
        this.actualCount = 0;
        this.overflowed = this.cacheSize === 0;
    }

    CacheOracle.prototype.verifyRequests = function (requests, responses, index, count, description, backwards, isPrefetch) {
        /// <summary>Verifies the HTTP requests for a single data request, and updates the oracle with cached pages</summary>
        /// <param name="requests" type="Array">The sequence of request objects (from OData.defaultHttpClient)</param>
        /// <param name="responses" type="Array">The sequence of response objects (from OData.defaultHttpClient)</param>
        /// <param name="index" type="Integer">The starting index of the read</param>
        /// <param name="count" type="Integer">The count of items in the read</param>
        /// <param name="description" type="String">The description of the requests being verified</param>
        /// <param name="backwards" type="Boolean">Whether or not filterBack is being verified</param>
        /// <param name="isPrefetch" type="Boolean">Whether the requests being verified come from the prefetcher</param>
        var that = this;

        index = (index < 0 ? 0 : index);
        var pageIndex = function (index) {
            /// <summary>Returns the page index that the given item index belongs to</summary>
            /// <param name="index" type="Integer">The item index</param>
            /// <returns>The page index</returns>
            return Math.floor(index / that.pageSize);
        };

        var estimateSize = function (obj) {
            /// <summary>Estimates the size of an object in bytes.</summary>
            /// <param name="obj" type="Object">Object to determine the size of.</param>
            /// <returns type="Number">Estimated size of the object in bytes.</returns>

            var size = 0;
            var type = typeof obj;

            if (type === "object" && obj) {
                for (var name in obj) {
                    size += name.length * 2 + estimateSize(obj[name]);
                }
            } else if (type === "string") {
                size = obj.length * 2;
            } else {
                size = 8;
            }
            return size;
        };

        var expectedUris = [];
        var responseIndex = 0;
        if (count >= 0) {
            var minPage = pageIndex(index);
            var maxPage = Math.min(pageIndex(index + count - 1), pageIndex(this.total));

            // In the case that the index is outside the range of the collection the minPage will be greater than the maxPage  
            maxPage = Math.max(minPage, maxPage);

            if (!(isPrefetch && !this.exactPageCount && minPage > this.maxPage)) {
                for (var page = minPage; page <= maxPage && this.actualCount <= this.total && !(isPrefetch && this.overflowed); page++) {
                    if (!this.cachedPages[page]) {

                        expectedUris.push(that.baseUri + "?$skip=" + page * this.pageSize + "&$top=" + (this.pageSize));

                        var actualPageSize = 0;
                        var actualPageCount = 0;
                        if (responses[responseIndex] && responses[responseIndex].data) {
                            actualPageSize += estimateSize(responses[responseIndex].data);
                            actualPageCount += responses[responseIndex].data.value.length;
                            // Handle server paging skipToken requests
                            while (responses[responseIndex].data["@odata.nextLink"]) {
                                var nextLink = responses[responseIndex].data["@odata.nextLink"];
                                if (nextLink) {
                                    var index = that.baseUri.indexOf(".svc/", 0);
                                    if (index != -1) {
                                        nextLink = that.baseUri.substring(0, index + 5) + nextLink;
                                    }
                                }

                                expectedUris.push(nextLink);
                                responseIndex++;
                                actualPageSize += estimateSize(responses[responseIndex].data);
                                actualPageCount += responses[responseIndex].data.value.length;
                            }

                            actualPageSize += 24; // 24 byte overhead for the pages (i)ndex, and (c)ount fields
                        }

                        responseIndex++;

                        this.overflowed = this.cacheSize >= 0 && this.actualSize + actualPageSize > this.cacheSize;
                        if (!this.overflowed) {
                            this.cachedPages[page] = true;
                            this.actualSize += actualPageSize;
                            this.actualCount += actualPageCount;
                        }
                    }
                }
            }
        }

        if (backwards) {
            expectedUris.reverse();
        }

        var actualUris = $.map(requests, function (r) { return r.requestUri; });
        djstest.assertAreEqualDeep(actualUris, expectedUris, description);
    };

    CacheOracle.getExpectedFilterResults = function (data, filterIndex, filterCount, predicate, backwards) {
        /// <summary>Verifies the cache filter returns the correct data</summary>
        /// <param name="collection" type="Array">Array of items in the collection</param>
        /// <param name="filterIndex" type="Integer">The index value</param>
        /// <param name="filterCount" type="Integer">The count value</param>
        /// <param name="predicate" type="Function">Predicate to be applied in filter, takes an item</param>
        /// <param name="backwards" type="Boolean">Whether or not filterBackwards is being verified</param>
        if (!data || !data.value) {
            return data;
        }

        var value = [];
        if (filterCount !== 0) {
            // Convert [item0, item1, ...] into [{ index: 0, item: item0 }, { index: 1, item: item1 }, ...]
            var indexedCollection = $.map(data.value, function (item, index) {
                return { index: index, item: item };
            });

            var grepPredicate = function (element, index) {
                return predicate(element.item);
            };

            var index = filterIndex < 0 ? 0 : filterIndex;
            var count = filterCount < 0 ? indexedCollection.length : filterCount;

            value = backwards ?
            // Slice up to 'index', filter, then slice 'count' number of items from the end
                $.grep(indexedCollection.slice(0, index + 1), grepPredicate).slice(-count) :
            // Slice from 'index' to the end, filter, then slice 'count' number of items from the beginning
                $.grep(indexedCollection.slice(index), grepPredicate).slice(0, count);
        }

        var expectedResults = {};
        for (var property in data) {
            if (property == "value") {
                expectedResults[property] = value;
            } else {
                expectedResults[property] = data[property];
            }
        }

        return expectedResults;
    };

    window.CacheOracle = CacheOracle;

})(this);