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

    var cleanDomStorage = function () {
        /** Cleans all the data saved in the browser's DOM Storage.
        */
        if (window.localStorage) {
            window.localStorage.clear();
        }
    };

    var cleanMemoryStorage = function () {
        /** Clean memory storage is a no op.
        */
    };

    var cleanIndexedDbStorage = function () {
        var stores = this.stores;
        $.each(stores, function (_, store) {
            store.close();
        });

        djstest.wait(function (done) {
            djstest.cleanStoreOnIndexedDb(stores, done);
        });
    };

    var canCreateMemoryStore = function () {
        /** Checks whether memory storage is supported by the browser.
         * @returns {boolean} True
         */
        return true;
    };

    var canCreateDomStore = function () {
        /** Checks whether Web Storage (DOM Storage) is supported by the browser.
         * @returns {boolean} True if DOM Storage is supported by the browser; false otherwise.
         */
        return !!window.localStorage;
    };

    var canCreateIndexedDb = function () {
        /** Checks whether Web Storage (DOM Storage) is supported by the browser.
         * @returns {Boolean} True if IndexedDB is supported by the browser, false otherwise.
         */
        return !!djstest.indexedDB;
    };

    var canCreateStore = function (mechanism) {
        /** Determines whether a particular mechanism is supported by the browser.
         * @param {String} mechanism - Mechanism name.
         * @returns {Boolean} True if the mechanism is supported by the browser; otherwise false.
         */
        var implementation = mechanismImplementations[mechanism];
        return implementation && implementation.canCreate();
    };
    var makeUnexpectedErrorHandler = function (fail) {
        return function (err) {
            djstest.fail("error: " + err.name + " -- message: " + err.message);
            fail();
        };
    };

    var testJobDone = function (succeeded) {
        if (!succeeded) {
            djstest.fail("Job completed but some of the functions it called failed");
        }
        djstest.done();
    };

    var mechanismImplementations = {
        indexeddb: { factory: odatajs.IndexedDBStore, canCreate: canCreateIndexedDb, cleanup: cleanIndexedDbStorage },
        dom: { factory: odatajs.DomStore, canCreate: canCreateDomStore, cleanup: cleanDomStorage },
        memory: { factory: odatajs.MemoryStore, canCreate: canCreateMemoryStore, cleanup: cleanMemoryStorage }
    };

    var oldWindowOnError;

    for (var mechanism in mechanismImplementations) {
        module("Unit", {
            mechanism: mechanism,
            createStore: function (name) {
                var store = odatajs.store.createStore(name + "_" + this.mechanism, this.mechanism);
                this.stores.push(store);
                return store;
            },
            setup: function () {
                this.stores = [];
                mechanismImplementations[this.mechanism].cleanup.call(this);

                // FireFox 7.0.1 bubbles an error event when there is an IndexedDB error, even when the error has been handled graciously.
                // This is a work around to keep QUnit from reporting false failures in IndexedDB negative tests.
                if (this.mechanism === "indexeddb") {
                    oldWindowOnError = window.onerror;
                    window.onerror = null;
                }
            },
            teardown: function () {
                mechanismImplementations[this.mechanism].cleanup.call(this);
                this.stores = [];

                // Restore QUnit's onerror handler.
                if (this.mechanism === "indexeddb") {
                    window.onerror = oldWindowOnError;
                }
            }
        });

        if (!canCreateStore(mechanism)) {
            djstest.addTest(function (mechanism) {
                djstest.expectException(function () {
                    mechanismImplemenatations[mechanism].factory.create("my horrible not working store");
                });
                djstest.done();
            }, "Local storage mechanism " + mechanism + " not supported by this browser", mechanism);
        } else {

            djstest.addTest(function storeAddTest(mechanism) {
                var tuples = [
                    { key: "null", value: null },
                    { key: "undefined", value: undefined },
                    { key: "number", value: 12345.678 },
                    { key: "string", value: "String value" },
                    { key: "date", value: new Date() },
                    { key: "object", value: { p1: 1234, nested: { p1: "a", p2: "b"}} },
                    { key: "array", value: [1, 2, 3, 4, 5] },
                    { key: "key1", value: "some value" },
                    { key: "key1", value: "this should fail", error: true },
                    { key: ["key", "key2"], value: ["value", "value2"], error: mechanism !== "indexeddb" },
                    { key: ["key6", "key7", "key6"], value: ["value", "value2", "value3"], error: true }
                ];

                var store = this.createStore("store1");
                var job = new djstest.Job();

                $.each(tuples, function (_, tuple) {
                    job.queue(function task(success, fail) {

                        var unexpectedError = makeUnexpectedErrorHandler(fail);
                        djstest.log("running task");

                        store.add(tuple.key, tuple.value,
                            function (key, value) {
                                djstest.assertAreEqual(key, tuple.key, "Keys match for " + mechanism + " - key = " + key.toString());
                                djstest.assertAreEqualDeep(value, tuple.value, "Values match for " + mechanism + " - key = " + key.toString());

                                job.queueNext(function (success, fail) {
                                    store.read(tuple.key, function (key, value) {
                                        djstest.assertAreEqualDeep(value, tuple.value, "Key: " + key + " is present in the store");
                                        success();
                                    }, makeUnexpectedErrorHandler(fail));
                                });
                                success();
                            },
                            function (err) {
                                if (!tuple.error) {
                                    unexpectedError(err);
                                } else {
                                    djstest.pass("error handler was called as expected");
                                    success();
                                }
                            });
                    });
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });

            }, "Store Add Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeAddOrUpdateTest(mechanism) {
                var tuples = [
                    { key: "null", value: null },
                    { key: "undefined", value: undefined },
                    { key: "number", value: 12345.678 },
                    { key: "string", value: "String value" },
                    { key: "date", value: new Date() },
                    { key: "object", value: { p1: 1234, nested: { p1: "a", p2: "b"}} },
                    { key: "array", value: [1, 2, 3, 4, 5] },
                    { key: "key1", value: "some value" },
                    { key: "key1", value: "this should not fail" },
                    { key: ["key", "key2", "key3"], value: ["value", "value2", "value3"], error: mechanism !== "indexeddb" },
                    { key: ["key", "key2", "key3"], value: ["value4", "value5", "value6"], error: mechanism !== "indexeddb" },
                    { key: "key1", value: 456 }
                ];

                var store = this.createStore("store2");
                var job = new djstest.Job();

                $.each(tuples, function (_, tuple) {
                    job.queue(function (success, fail) {

                        var unexpectedError = makeUnexpectedErrorHandler(fail);

                        store.addOrUpdate(tuple.key, tuple.value,
                            function (key, value) {
                                djstest.assert(!tuple.error, "success should be called");
                                djstest.assertAreEqual(key, tuple.key, "Keys match");
                                djstest.assertAreEqualDeep(value, tuple.value, "Values match");

                                store.read(tuple.key, function (key, value) {
                                    djstest.assertAreEqual(key, tuple.key, "Keys match");
                                    djstest.assertAreEqualDeep(value, tuple.value, "Values match");
                                    success();
                                }, unexpectedError);
                            },
                            function (err) {
                                if (!tuple.error) {
                                    unexpectedError(err);
                                } else {
                                    djstest.pass("error handler was called as expected");
                                    success();
                                }
                            });
                    });
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });
            }, "Store Add or Update Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeContainsTest(mechanism) {
                var store = this.createStore("store3");
                var job = new djstest.Job();

                job.queue(function (success, fail) {
                    store.add("Key1", "Some value", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.contains("Key1", function (contained) {
                        djstest.assert(contained, "Key is present in the store");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.contains("Key2", function (contained) {
                        djstest.assert(!contained, "Key is not present in the store");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });

            }, "Store Contains Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeGetAllKeysTest(mechanism) {
                var store = this.createStore("store4");
                var store2 = this.createStore("store4_1");

                var expectedKeys = [];
                var job = new djstest.Job();

                var i;
                for (i = 1; i <= 20; i++) {
                    (function (i) {
                        job.queue(function (success, fail) {
                            store.add(i.toString(), "value" + i, success, makeUnexpectedErrorHandler(fail));
                        });

                        job.queue(function (success, fail) {
                            store2.add((i + 20).toString(), "value" + (i + 20), success, makeUnexpectedErrorHandler(fail));
                        });
                    })(i);

                    expectedKeys.push(i.toString());
                }

                job.queue(function (success, fail) {
                    store.getAllKeys(function (keys) {
                        expectedKeys.sort();
                        keys.sort();
                        djstest.assertAreEqualDeep(keys, expectedKeys, "All expected keys where returned");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    store2.close();
                    testJobDone(succeeded);
                });
            }, "Store Get All Keys Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeReadTest(mechanism) {
                var tuples = [
                    { key: "null", value: null },
                    { key: "undefined", value: undefined },
                    { key: "number", value: 12345.678 },
                    { key: "string", value: "String value" },
                    { key: "date", value: new Date() },
                    { key: "dateOffset", value: (function () {
                        var d = new Date();
                        d.__type = "Edm.DateTimeOffset";
                        d.__offset = "+03:30";
                        return d;
                    })()
                    },
                    { key: "complexDate", value: (function () {
                        var d = new Date();
                        d.nestedDate = new Date();
                        d.nestedDate.__type = "Edm.DateTimeOffset";
                        d.nestedDate.__offset = "+03:30";
                        return d;
                    })()
                    },
                    { key: "object", value: { p1: 1234, nested: { p1: "a", p2: "b", p3: new Date()}} },
                    { key: "array", value: [1, 2, 3, 4, 5] }
                ];

                var store = this.createStore("store5");
                var job = new djstest.Job();

                $.each(tuples, function (_, tuple) {
                    job.queue(function (success, fail) {
                        store.add(tuple.key, tuple.value,
                            function () {
                                job.queue(function (success, fail) {
                                    store.read(tuple.key, function (key, value) {
                                        djstest.assertAreEqual(key, tuple.key, "Keys match");
                                        djstest.assertAreEqualDeep(value, tuple.value, "Values match");
                                        success();
                                    }, makeUnexpectedErrorHandler(fail));
                                });
                                success();
                            },
                           function (err) {
                               if (!tuple.error) {
                                   djstest.fail(err.message);
                                   fail();
                               } else {
                                   djstest.pass("error handler was called as expected");
                                   success();
                               }
                           });
                    });
                });

                job.queue(function (success, fail) {
                    store.read("Unknown key", function (key, value) {
                        djstest.assertAreEqual(value, undefined, "Store get returns undefined for keys that do not exist in the store");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });

            }, "Store Read Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeReadArrayTest(mechanism) {
                var makeError = function (success, fail) {
                    return function (err) {
                        if (mechanism !== "indexeddb") {
                            djstest.pass("Error callback called as expected");
                            success();
                        } else {
                            djstest.fail(err.message);
                            fail();
                        }
                    };
                };

                var store = this.createStore("store6");
                var job = new djstest.Job();

                job.queue(function (success, fail) {
                    store.add(["key", "key2", "key3"], ["value", "value2", "value3"], success, makeError(success, fail));
                });

                job.queue(function (success, fail) {
                    store.read(["key", "key2", "key3"], function (keys, values) {
                        djstest.assertAreEqualDeep(keys, ["key", "key2", "key3"]);
                        djstest.assertAreEqualDeep(values, ["value", "value2", "value3"]);
                        success();
                    }, makeError(success, fail));
                });

                job.queue(function (success, fail) {
                    store.read(["key", "badkey"], function (keys, values) {
                        djstest.assertAreEqualDeep(keys, ["key", "badkey"]);
                        djstest.assertAreEqualDeep(values, ["value", undefined]);
                        success();
                    }, makeError(success, fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });
            }, "Store Read Array Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeRemoveTest(mechanism) {
                var store = this.createStore("store7");
                var job = new djstest.Job();

                job.queue(function (success, fail) {
                    store.add("Key1", "Some value", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.add("Key2", "Some value", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.remove("Key1", function () {
                        djstest.pass("Key1 was removed from the store");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.contains("Key1", function (contained) {
                        djstest.assert(!contained, "Key1 is not present in the store");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.remove("Key that has never been added", function () {
                        djstest.pass('"Key that has never been added" was removed from the store');
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.contains("Key2", function (contained) {
                        djstest.assert(contained, "Key2 is present in the store");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });
            }, "Store Remove Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeUpdateTest(mechanism) {
                var store = this.createStore("store8");

                var startKey = "Key1";
                var startValue = "start value";
                var updateKey = "Key2";
                var updatedValue = "updated value";

                var job = new djstest.Job();

                job.queue(function (success, fail) {
                    store.add(startKey, startValue, success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.add(updateKey, startValue, success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.update(updateKey, updatedValue, function (key, value) {
                        djstest.assertAreEqual(key, updateKey, "Updated keys match");
                        djstest.assertAreEqualDeep(value, updatedValue, "Updated values match");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.read(updateKey, function (key, value) {
                        djstest.assertAreEqual(key, updateKey, "Updated keys match after get");
                        djstest.assertAreEqualDeep(value, updatedValue, "Updated values match after get");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.read(startKey, function (key, value) {
                        djstest.assertAreEqual(key, startKey, "Non updated keys match after get");
                        djstest.assertAreEqualDeep(value, startValue, "Non updated values match after get");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });
            }, "Store Update Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeClearTest(mechanism) {
                var store = this.createStore("store9");
                var store2 = this.createStore("store9_1");

                var job = new djstest.Job();
                job.queue(function (success, fail) {
                    store.add("Key1", "value in store", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.add("Key2", "value in store", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.add("Key3", "value in store", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store2.add("Key1", "value in store2", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.clear(function () {
                        djstest.pass("Store was cleared");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.contains("Key1", function (contained) {
                        djstest.assert(!contained, "Key1 was removed from store");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store2.contains("Key1", function (contained) {
                        djstest.assert(contained, "Key1 still exists in store 2");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    store2.close();
                    testJobDone(succeeded);
                });
            }, "Store Clear Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeUpdateNonExistentTest(mechanism) {
                var store = this.createStore("store10");
                var job = new djstest.Job();

                job.queue(function (success, fail) {
                    store.add("key", "value", success, makeUnexpectedErrorHandler(fail));
                });

                job.queue(function (success, fail) {
                    store.update("badKey", "new value",
                        function () {
                            djstest.fail("Sucess handler called when not expected");
                            fail();
                        },
                        function (err) {
                            djstest.pass("Error callback called as expexted");
                            success();
                        });
                });

                job.queue(function (success, fail) {
                    store.update(["key", "badkey"], ["value", "badvalue"],
                        function () {
                            djstest.fail("Sucess handler called when not expected");
                            fail();
                        },
                        function (err) {
                            djstest.pass("Error callback called as expected");
                            success();
                        });
                });

                job.queue(function (success, fail) {
                    store.read("key", function (key, value) {
                        djstest.assertAreEqual(value, "value", "value was not changed");
                        success();
                    }, makeUnexpectedErrorHandler(fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });
            }, "Store Update Non-Existent Test with mechanism " + mechanism, mechanism);

            djstest.addTest(function storeUpdateArrayTest(mechanism) {
                var makeError = function (success, fail) {
                    return function (err) {
                        if (mechanism !== "indexeddb") {
                            djstest.pass("Error callback called as expected");
                            success();
                        } else {
                            djstest.fail(err.message);
                            fail();
                        }
                    };
                };

                var store = this.createStore("store11");
                var job = new djstest.Job();

                job.queue(function (success, fail) {
                    store.add(["key", "key2"], ["value1", "value2"], success, makeError(success, fail));
                });

                job.queue(function (success, fail) {
                    store.update(["key", "key2"], ["value1", "value4"], success, makeError(success, fail));
                });

                job.queue(function (success, fail) {
                    store.read(["key", "key2"], function (key, value) {
                        djstest.assertAreEqualDeep(value, ["value1", "value4"], "value was not changed");
                        success();
                    }, makeError(success, fail));
                });

                job.run(function (succeeded) {
                    store.close();
                    testJobDone(succeeded);
                });
            }, "Store Update Array Test with mechanism " + mechanism, mechanism);
        }
    }

    module("Unit");

    djstest.addTest(function CreateStoreTest() {
        var defaultExpected = canCreateDomStore() ? "dom" : "memory";
        var tests = [
            { mechanism: "dom", exception: !canCreateDomStore(), expected: "dom" },
            { mechanism: "memory", exception: false, expected: "memory" },
            { mechanism: "", exception: false, expected: defaultExpected },
            { mechanism: null, exception: false, expected: defaultExpected },
            { mechanism: "unknown", exception: true }
       ];

        var i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            var test = tests[i];
            try {

                var store = odatajs.store.createStore("testStore" + i, tests[i].mechanism);

                if (!test.exception) {
                    djstest.assertAreEqual(store.mechanism, test.expected, "Created store of the expected mechanism");
                } else {
                    djstest.fail("Didn't get the expected exception");
                }
            }
            catch (e) {
                djstest.assert(test.exception, "Expected exception");
            }
        }
        djstest.done();
    });

    djstest.addTest(function CreateBestStoreTest() {
        var bestMechanism;

        for (var name in mechanismImplementations) {
            if (!bestMechanism && canCreateStore(name) && name !== "indexeddb") {
                bestMechanism = name;
            }
        }

        if (bestMechanism) {
            var tests = [
                "best",
                undefined
            ];

            for (var i in tests) {
                var store = odatajs.store.createStore("best store ever " + i, tests[i]);
                djstest.assertAreEqual(store.mechanism, bestMechanism, "Mechanisms match");
            }
        } else {
            djstest.pass("This browser doesn't support any of the implemented local storage mechanisms");
        }
        djstest.done();
    });

})(this);
