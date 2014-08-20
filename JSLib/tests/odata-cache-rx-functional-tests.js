/// <reference path="../src/datajs.js" />
/// <reference path="../src/odata-utils.js" />
/// <reference path="../src/cache.js" />
/// <reference path="common/djstest.js" />
/// <reference path="common/ODataReadOracle.js" />
/// <reference path="common/rx.js" />

(function (window, undefined) {
    OData.defaultHandler.accept = "application/json;q=0.9, application/atomsvc+xml;q=0.8, */*;q=0.1";
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
        function (observable) { return observable.Take(0); },
        function (observable) { return observable.Take(1); },
        function (observable) { return observable.Skip(1); },
        function (observable) { return observable.Skip(2).Take(4); },
        function (observable) { return observable.Select(function (item) { return item.Name; }); },
        function (observable) { return observable.Where(function (item) { return item.FoodID % 2 === 1; }); }
    ];

    var assertObservables = function (actual, expected, done) {
        /// <summary>Asserts two finite observables generate the same sequence</summary>
        /// <param name="actual" type="IObservable">The actual observable</param>
        /// <param name="expected" type="IObservable">The expected observable</param>
        /// <param name="done" type="Function">The callback function when asserts are done</param>
        var toArray = function (observable, callback) {
            var arr = [];
            observable.Subscribe(
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
                    var cache = odatajs.createDataCache(options);

                    ODataReadOracle.readJsonAcrossServerPages(params.feedUri, function (collection) {
                        assertObservables(params.operator(cache.toObservable()), params.operator(window.Rx.Observable.FromArray(collection.value)), function () {
                            djstest.destroyCacheAndDone(cache);
                        });
                    });
                }, "feed: " + params.feedUri + ", pageSize: " + params.pageSize + ", operator: " + params.operator.toString(), params);
            });
        });
    });
})(this);
