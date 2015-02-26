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
    odatajs.oData.defaultHandler.accept = "application/json;q=0.9, */*;q=0.1";
    var feeds = [
        { uri: "./endpoints/FoodStoreDataServiceV4.svc/Foods" }
    ];

    var itemsInCollection = 16;
    var pageSizes = [
        1,
        4,  // factor of total, <= server page size
        5,  // non-factor of total, <= server page size
        6,  // non-factor of total, > server page size
        8,  // factor of total, > server page size
        itemsInCollection,
        itemsInCollection + 1
    ];

    var operatorTests = [
        function (observable) {
            return observable.take(0);
        },
        function (observable) {
            return observable.take(1);
        },
        function (observable) {
            return observable.skip(1);
        },
        function (observable) {
            return observable.skip(2).take(4);
        },
        function (observable) {
            return observable.select(function (item) { return item.Name; });
        },
        function (observable) {
            return observable.where(function (item) { return item.FoodID % 2 === 1; });
        }
    ];

    /** Asserts two finite observables generate the same sequence
     * @param {Object} actual - The actual observable
     * @param {Object} expected - The expected observable
     * @param {Function} done - The callback function when asserts are done
     */
    var assertObservables = function (actual, expected, done) {

        var toArray = function (observable, callback) {
            var arr = [];
            observable.subscribe(
                function (item) { arr.push(item); },
                function (err) { arr.push({ "__error__": err }); },
                function () { callback(arr); });
        };

        toArray(actual, function (actualSequence) {
            toArray(expected, function (expectedSequence) {
                djstest.assertAreEqualDeep(actualSequence, expectedSequence, "Verify observable sequence");
                done();
            });
        });
    };

    module("Functional");
    $.each(feeds, function (_, feed) {
        $.each(pageSizes, function (_, pageSize) {
            $.each(operatorTests, function (_, operator) {
                var params = { feedUri: feed.uri, pageSize: pageSize, operator: operator };
                djstest.addTest(function (params) {
                    djstest.assertsExpected(1);
                    var options = { name: "cache" + new Date().valueOf(), source: params.feedUri, pageSize: params.pageSize, prefetchSize: 0 };
                    var cache = odatajs.cache.createDataCache(options);

                    ODataVerifyReader.readJsonAcrossServerPages(params.feedUri, function (collection) {
                        assertObservables(params.operator(cache.toObservable()), params.operator(window.Rx.Observable.fromArray(collection.value)), function () {
                            djstest.destroyCacheAndDone(cache);
                        });
                    });
                }, "feed: " + params.feedUri + ", pageSize: " + params.pageSize + ", operator: " + params.operator.toString(), params);
            });
        });
    });
})(this);
