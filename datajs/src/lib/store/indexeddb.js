/* {
    oldname:'store-indexeddb.js',
    updated:'20140514 12:59'
}*/
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

// store-indexeddb.js

var utils = require('./../datajs.js').utils;


// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;

// CONTENT START

var indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.indexedDB;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {};

var IDBT_READ_ONLY = IDBTransaction.READ_ONLY || "readonly";
var IDBT_READ_WRITE = IDBTransaction.READ_WRITE || "readwrite";

var getError = function (error, defaultError) {
    /// <summary>Returns either a specific error handler or the default error handler</summary>
    /// <param name="error" type="Function">The specific error handler</param>
    /// <param name="defaultError" type="Function">The default error handler</param>
    /// <returns type="Function">The error callback</returns>

    return function (e) {
        var errorFunc = error || defaultError;
        if (!errorFunc) {
            return;
        }

        // Old api quota exceeded error support.
        if (Object.prototype.toString.call(e) === "[object IDBDatabaseException]") {
            if (e.code === 11 /* IndexedDb disk quota exceeded */) {
                errorFunc({ name: "QuotaExceededError", error: e });
                return;
            }
            errorFunc(e);
            return;
        }

        var errName;
        try {
            var errObj = e.target.error || e;
            errName = errObj.name;
        } catch (ex) {
            errName = (e.type === "blocked") ? "IndexedDBBlocked" : "UnknownError";
        }
        errorFunc({ name: errName, error: e });
    };
};

var openStoreDb = function (store, success, error) {
    /// <summary>Opens the store object's indexed db database.</summary>
    /// <param name="store" type="IndexedDBStore">The store object</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>

    var storeName = store.name;
    var dbName = "_datajs_" + storeName;

    var request = indexedDB.open(dbName);
    request.onblocked = error;
    request.onerror = error;

    request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
        }
    };

    request.onsuccess = function (event) {
        var db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
            // Should we use the old style api to define the database schema?
            if ("setVersion" in db) {
                var versionRequest = db.setVersion("1.0");
                versionRequest.onsuccess = function () {
                    var transaction = versionRequest.transaction;
                    transaction.oncomplete = function () {
                        success(db);
                    };
                    db.createObjectStore(storeName, null, false);
                };
                versionRequest.onerror = error;
                versionRequest.onblocked = error;
                return;
            }

            // The database doesn't have the expected store.
            // Fabricate an error object for the event for the schema mismatch
            // and error out.
            event.target.error = { name: "DBSchemaMismatch" };
            error(event);
            return;
        }

        db.onversionchange = function(event) {
            event.target.close();
        };
        success(db);
    };
};

var openTransaction = function (store, mode, success, error) {
    /// <summary>Opens a new transaction to the store</summary>
    /// <param name="store" type="IndexedDBStore">The store object</param>
    /// <param name="mode" type="Short">The read/write mode of the transaction (constants from IDBTransaction)</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>

    var storeName = store.name;
    var storeDb = store.db;
    var errorCallback = getError(error, store.defaultError);

    if (storeDb) {
        success(storeDb.transaction(storeName, mode));
        return;
    }

    openStoreDb(store, function (db) {
        store.db = db;
        success(db.transaction(storeName, mode));
    }, errorCallback);
};

var IndexedDBStore = function (name) {
    /// <summary>Creates a new IndexedDBStore.</summary>
    /// <param name="name" type="String">The name of the store.</param>
    /// <returns type="Object">The new IndexedDBStore.</returns>
    this.name = name;
};

IndexedDBStore.create = function (name) {
    /// <summary>Creates a new IndexedDBStore.</summary>
    /// <param name="name" type="String">The name of the store.</param>
    /// <returns type="Object">The new IndexedDBStore.</returns>
    if (IndexedDBStore.isSupported()) {
        return new IndexedDBStore(name);
    }

    throw { message: "IndexedDB is not supported on this browser" };
};

IndexedDBStore.isSupported = function () {
    /// <summary>Returns whether IndexedDB is supported.</summary>
    /// <returns type="Boolean">True if IndexedDB is supported, false otherwise.</returns>
    return !!indexedDB;
};

IndexedDBStore.prototype.add = function (key, value, success, error) {
    /// <summary>Adds a key/value pair to the store</summary>
    /// <param name="key" type="String">The key</param>
    /// <param name="value" type="Object">The value</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = [];
    var values = [];

    if (key instanceof Array) {
        keys = key;
        values = value;
    } else {
        keys = [key];
        values = [value];
    }

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onabort = getError(error, defaultError, key, "add");
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(key, value);
            }
        };

        for (var i = 0; i < keys.length && i < values.length; i++) {
            transaction.objectStore(name).add({ v: values[i] }, keys[i]);
        }
    }, error);
};

IndexedDBStore.prototype.addOrUpdate = function (key, value, success, error) {
    /// <summary>Adds or updates a key/value pair in the store</summary>
    /// <param name="key" type="String">The key</param>
    /// <param name="value" type="Object">The value</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = [];
    var values = [];

    if (key instanceof Array) {
        keys = key;
        values = value;
    } else {
        keys = [key];
        values = [value];
    }

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onabort = getError(error, defaultError);
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(key, value);
            }
        };

        for (var i = 0; i < keys.length && i < values.length; i++) {
            var record = { v: values[i] };
            transaction.objectStore(name).put(record, keys[i]);
        }
    }, error);
};

IndexedDBStore.prototype.clear = function (success, error) {
    /// <summary>Clears the store</summary>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    var name = this.name;
    var defaultError = this.defaultError;
    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onerror = getError(error, defaultError);
        transaction.oncomplete = function () {
            success();
        };

        transaction.objectStore(name).clear();
    }, error);
};

IndexedDBStore.prototype.close = function () {
    /// <summary>Closes the connection to the database</summary>
    if (this.db) {
        this.db.close();
        this.db = null;
    }
};

IndexedDBStore.prototype.contains = function (key, success, error) {
    /// <summary>Returns whether the store contains a key</summary>
    /// <param name="key" type="String">The key</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    var name = this.name;
    var defaultError = this.defaultError;
    openTransaction(this, IDBT_READ_ONLY, function (transaction) {
        var objectStore = transaction.objectStore(name);
        var request = objectStore["get"](key);

        transaction.oncomplete = function () {
            success(!!request.result);
        };
        transaction.onerror = getError(error, defaultError);
    }, error);
};

IndexedDBStore.prototype.defaultError = throwErrorCallback;

IndexedDBStore.prototype.getAllKeys = function (success, error) {
    /// <summary>Gets all the keys from the store</summary>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    var name = this.name;
    var defaultError = this.defaultError;
    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        var results = [];

        transaction.oncomplete = function () {
            success(results);
        };

        var request = transaction.objectStore(name).openCursor();

        request.onerror = getError(error, defaultError);
        request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                results.push(cursor.key);
                // Some tools have issues because continue is a javascript reserved word.
                cursor["continue"].call(cursor);
            }
        };
    }, error);
};

/// <summary>Identifies the underlying mechanism used by the store.</summary>
IndexedDBStore.prototype.mechanism = "indexeddb";

IndexedDBStore.prototype.read = function (key, success, error) {
    /// <summary>Reads the value for the specified key</summary>
    /// <param name="key" type="String">The key</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    /// <remarks>If the key does not exist, the success handler will be called with value = undefined</remarks>
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = (key instanceof Array) ? key : [key];

    openTransaction(this, IDBT_READ_ONLY, function (transaction) {
        var values = [];

        transaction.onerror = getError(error, defaultError, key, "read");
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(keys[0], values[0]);
            }
        };

        for (var i = 0; i < keys.length; i++) {
            // Some tools have issues because get is a javascript reserved word. 
            var objectStore = transaction.objectStore(name);
            var request = objectStore["get"].call(objectStore, keys[i]);
            request.onsuccess = function (event) {
                var record = event.target.result;
                values.push(record ? record.v : undefined);
            };
        }
    }, error);
};

IndexedDBStore.prototype.remove = function (key, success, error) {
    /// <summary>Removes the specified key from the store</summary>
    /// <param name="key" type="String">The key</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = (key instanceof Array) ? key : [key];

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onerror = getError(error, defaultError);
        transaction.oncomplete = function () {
            success();
        };

        for (var i = 0; i < keys.length; i++) {
            // Some tools have issues because continue is a javascript reserved word.
            var objectStore = transaction.objectStore(name);
            objectStore["delete"].call(objectStore, keys[i]);
        }
    }, error);
};

IndexedDBStore.prototype.update = function (key, value, success, error) {
    /// <summary>Updates a key/value pair in the store</summary>
    /// <param name="key" type="String">The key</param>
    /// <param name="value" type="Object">The value</param>
    /// <param name="success" type="Function">The success callback</param>
    /// <param name="error" type="Function">The error callback</param>
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = [];
    var values = [];

    if (key instanceof Array) {
        keys = key;
        values = value;
    } else {
        keys = [key];
        values = [value];
    }

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onabort = getError(error, defaultError);
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(key, value);
            }
        };

        for (var i = 0; i < keys.length && i < values.length; i++) {
            var request = transaction.objectStore(name).openCursor(IDBKeyRange.only(keys[i]));
            var record = { v: values[i] };
            request.pair = { key: keys[i], value: record };
            request.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    cursor.update(event.target.pair.value);
                } else {
                    transaction.abort();
                }
            };
        }
    }, error);
};

// DATAJS INTERNAL START
module.exports = IndexedDBStore;
// DATAJS INTERNAL END

// CONTENT END
