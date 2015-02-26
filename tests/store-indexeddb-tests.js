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
 
// store-indexeddb-tests.js

(function (window, undefined) {
    // DATAJS INTERNAL START
    var unexpectedSuccess = function (key, value) {
        djstest.fail("Unexpected call to success handler: key = " + key + ", value = " + value);
        djstest.done();
    };

    var unexpectedError = function (e) {
        djstest.fail("Unexpected call to error handler: " + djstest.toString(e));
        djstest.done();
    };

    var storeCounter = 0;
    var storeName = "test";

    var getNextStoreName = function () {
        storeCounter++;
        return getCurrentStoreName();
    };

    var getCurrentStoreName = function(){
        return storeName + storeCounter;
    };

    var oldWindowOnError;

    if (djstest.indexedDB) {
        module("Unit", {
            setup: function () {
                djstest.wait(function (done) {
                    djstest.cleanStoreOnIndexedDb([{ name: getNextStoreName() }], done);
                });

                // FireFox 7.0.1 bubbles an error event when there is an IndexedDB error, even when the error has been handled graciously.
                // This is a work around to keep QUnit from reporting false failures in IndexedDB negative tests.
                oldWindowOnError = window.onerror;
                window.onerror = null;
            },
            teardown: function () {
                var store = this.store;
                if (store) {
                    store.close();
                }

                djstest.wait(function (done) {
                    djstest.cleanStoreOnIndexedDb([store], done);
                });


                // Restore QUnit's onerror handler.
                window.onerror = oldWindowOnError;
            }
        });

        djstest.addTest(function testIndexedDBStoreConstructor() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            djstest.assertAreEqual(store.name, getCurrentStoreName());
            djstest.assertAreEqual(store.mechanism, "indexeddb");
            djstest.done();
        });

        djstest.addTest(function testIndexedDBStoreAddGet() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key", "value", function (key, value) {
                djstest.assertAreEqual(key, "key");
                djstest.assertAreEqual(value, "value");
                store.read("key", function (key, value) {
                    djstest.assertAreEqual(key, "key");
                    djstest.assertAreEqual(value, "value");
                    djstest.done();
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddUpdateGet() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key", "value", function (key, value) {
                store.update("key", "value2", function (key, value) {
                    djstest.assertAreEqual(key, "key");
                    djstest.assertAreEqual(value, "value2");
                    store.read("key", function (key, value) {
                        djstest.assertAreEqual(key, "key");
                        djstest.assertAreEqual(value, "value2");
                        djstest.done();
                    }, unexpectedError);
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddOrUpdateGet() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.addOrUpdate("key", "value", function (key, value) {
                djstest.assertAreEqual(key, "key");
                djstest.assertAreEqual(value, "value");
                store.addOrUpdate("key", "value2", function (key, value) {
                    djstest.assertAreEqual(key, "key");
                    djstest.assertAreEqual(value, "value2");
                    store.read("key", function (key, value) {
                        djstest.assertAreEqual(key, "key");
                        djstest.assertAreEqual(value, "value2");
                        djstest.done();
                    }, unexpectedError);
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddRemoveContains() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key", "value", function (key, value) {
                store.contains("key", function (result) {
                    djstest.assert(result);
                    store.remove("key", function () {
                        djstest.pass("key removed");
                        store.contains("key", function (result) {
                            djstest.assert(!result);
                            djstest.done();
                        }, unexpectedError);
                    }, unexpectedError);
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddConsecutiveGetAllKeys() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key", "value", function (key, value) {
                store.add("key2", "value2", function (key, value) {
                    store.add("key3", "value3", function (key, value) {
                        store.getAllKeys(function (keys) {
                            djstest.assertAreEqualDeep(keys, ["key", "key2", "key3"]);
                            djstest.done();
                        }, unexpectedError);
                    }, unexpectedError);
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddArrayClear() {
            var addedKeys = ["key", "key2", "key3"];
            var addedValues = ["value", "value2", "value3"];
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add(addedKeys, addedValues, function (keys, values) {
                djstest.assertAreEqualDeep(keys, addedKeys);
                djstest.assertAreEqualDeep(values, addedValues);
                store.clear(function () {
                    store.getAllKeys(function (keys) {
                        djstest.assertAreEqualDeep(keys, []);
                        djstest.done();
                    }, unexpectedError);
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddArrayUpdateArrayGetArray() {
            var addedKeys = ["key", "key2", "key3"];
            var addedValues = ["value", "value2", "value3"];
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add(addedKeys, addedValues, function (keys, values) {
                djstest.assertAreEqualDeep(keys, addedKeys);
                djstest.assertAreEqualDeep(values, addedValues);
                var updatedKeys = ["key", "key3"];
                var updatedValues = ["newValue", "newValue3"];
                store.update(updatedKeys, updatedValues, function (keys, values) {
                    djstest.assertAreEqualDeep(keys, updatedKeys);
                    djstest.assertAreEqualDeep(values, updatedValues);
                    store.read(addedKeys, function (keys, values) {
                        djstest.assertAreEqualDeep(keys, ["key", "key2", "key3"]);
                        djstest.assertAreEqualDeep(values, ["newValue", "value2", "newValue3"]);
                        djstest.done();
                    }, unexpectedError);
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddOrUpdateArrayGetArray() {
            var expectedKeys = ["key", "key2", "key3"];
            var expectedValues = ["value", "value2", "value3"];
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key2", "value", function (key, value) {
                store.addOrUpdate(expectedKeys, expectedValues, function (keys, values) {
                    djstest.assertAreEqualDeep(keys, expectedKeys);
                    djstest.assertAreEqualDeep(values, expectedValues);
                    store.read(keys, function (keys, values) {
                        djstest.assertAreEqualDeep(values, expectedValues);
                        djstest.done();
                    }, unexpectedError);
                }, unexpectedError);
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddDuplicate() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key", "value", function (key, value) {
                store.add("key", "value2", unexpectedSuccess, function (err) {
                    djstest.pass("Error callback called as expected");
                    djstest.done();
                });
            }, unexpectedError);
        });

        djstest.addTest(function testIndexedDBStoreAddArrayDuplicate() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add(["key", "key2", "key"], ["value", "value2", "value3"], unexpectedSuccess, function (err) {
                djstest.pass("Error callback called as expected");
                djstest.done();
            });
        });

        djstest.addTest(function testIndexedDBStoreGetArrayNonExistent() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key", "value", function (key, value) {
                store.read(["key", "badkey"], function (keys, values) {
                    djstest.assertAreEqualDeep(keys, ["key", "badkey"]);
                    djstest.assertAreEqualDeep(values, ["value", undefined]);
                    djstest.done();
                }, unexpectedError);
            });
        });

        djstest.addTest(function testIndexedDBStoreUpdateNonExistent() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.update("badkey", "badvalue", unexpectedSuccess, function (err) {
                djstest.pass("Error callback called as expected");
                djstest.done();
            });
        });

        djstest.addTest(function testIndexedDBStoreUpdateArrayNonExistent() {
            var store = this.store = window.odatajs.store.IndexedDBStore.create(getCurrentStoreName());
            store.add("key", "value", function (key, value) {
                store.update(["key", "badkey"], ["value", "badvalue"], unexpectedSuccess, function (err) {
                    djstest.pass("Error callback called as expected");
                    store.read("key", function (key, value) {
                        djstest.assertAreEqual(value, "value", "value was not changed");
                        djstest.done();
                    }, unexpectedError);
                });
            }, unexpectedError);
        });
    }
    // DATAJS INTERNAL END
})(this);