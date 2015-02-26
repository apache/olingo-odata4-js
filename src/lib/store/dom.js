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
'use strict';

/** @module store/dom */



var utils = require('./../utils.js');

// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;

var localStorage = null;

/** This method is used to override the Date.toJSON method and is called only by
 * JSON.stringify.  It should never be called directly.
 * @summary Converts a Date object into an object representation friendly to JSON serialization.
 * @returns {Object} Object that represents the Date.
 */
function domStoreDateToJSON() {
    var newValue = { v: this.valueOf(), t: "[object Date]" };
    // Date objects might have extra properties on them so we save them.
    for (var name in this) {
        newValue[name] = this[name];
    }
    return newValue;
}

/** This method is used during JSON parsing and invoked only by the reviver function.
 * It should never be called directly.
 * @summary JSON reviver function for converting an object representing a Date in a JSON stream to a Date object
 * @param value _
 * @param value - Object to convert.
 * @returns {Date} Date object.
 */
function domStoreJSONToDate(_, value) {
    if (value && value.t === "[object Date]") {
        var newValue = new Date(value.v);
        for (var name in value) {
            if (name !== "t" && name !== "v") {
                newValue[name] = value[name];
            }
        }
        value = newValue;
    }
    return value;
}

/** Qualifies the key with the name of the store.
 * @param {Object} store - Store object whose name will be used for qualifying the key.
 * @param {String} key - Key string.
 * @returns {String} Fully qualified key string.
 */
function qualifyDomStoreKey(store, key) {
    return store.name + "#!#" + key;
}

/** Gets the key part of a fully qualified key string.
 * @param {Object} store - Store object whose name will be used for qualifying the key.
 * @param {String} key - Fully qualified key string.
 * @returns {String} Key part string
 */
function unqualifyDomStoreKey(store, key) {
    return key.replace(store.name + "#!#", "");
}

/** Constructor for store objects that use DOM storage as the underlying mechanism.
 * @class DomStore
 * @constructor
 * @param {String} name - Store name.
 */
function DomStore(name) {
    this.name = name;
}

/** Creates a store object that uses DOM Storage as its underlying mechanism.
 * @method module:store/dom~DomStore.create
 * @param {String} name - Store name.
 * @returns {Object} Store object.
 */
DomStore.create = function (name) {

    if (DomStore.isSupported()) {
        localStorage = localStorage || window.localStorage;
        return new DomStore(name);
    }

    throw { message: "Web Storage not supported by the browser" };
};

/** Checks whether the underlying mechanism for this kind of store objects is supported by the browser.
 * @method DomStore.isSupported
 * @returns {Boolean} - True if the mechanism is supported by the browser; otherwise false.
*/
DomStore.isSupported = function () {
    return !!window.localStorage;
};

/** Adds a new value identified by a key to the store.
 * @method module:store/dom~DomStore#add
 * @param {String} key - Key string.
 * @param value - Value that is going to be added to the store.
 * @param {Function} success - Callback for a successful add operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 * This method errors out if the store already contains the specified key.
 */
DomStore.prototype.add = function (key, value, success, error) {
    error = error || this.defaultError;
    var store = this;
    this.contains(key, function (contained) {
        if (!contained) {
            store.addOrUpdate(key, value, success, error);
        } else {
            delay(error, { message: "key already exists", key: key });
        }
    }, error);
};

/** This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
 * @summary Adds or updates a value identified by a key to the store.
 * @method module:store/dom~DomStore#addOrUpdate
 * @param {String} key - Key string.
 * @param value - Value that is going to be added or updated to the store.
 * @param {Function} success - Callback for a successful add or update operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.addOrUpdate = function (key, value, success, error) {
    error = error || this.defaultError;

    if (key instanceof Array) {
        error({ message: "Array of keys not supported" });
    } else {
        var fullKey = qualifyDomStoreKey(this, key);
        var oldDateToJSON = Date.prototype.toJSON;
        try {
            var storedValue = value;
            if (storedValue !== undefined) {
                // Dehydrate using json
                Date.prototype.toJSON = domStoreDateToJSON;
                storedValue = window.JSON.stringify(value);
            }
            // Save the json string.
            localStorage.setItem(fullKey, storedValue);
            delay(success, key, value);
        }
        catch (e) {
            if (e.code === 22 || e.number === 0x8007000E) {
                delay(error, { name: "QUOTA_EXCEEDED_ERR", error: e });
            } else {
                delay(error, e);
            }
        }
        finally {
            Date.prototype.toJSON = oldDateToJSON;
        }
    }
};

/** In case of an error, this method will not restore any keys that might have been deleted at that point.
 * @summary Removes all the data associated with this store object.
 * @method module:store/dom~DomStore#clear
 * @param {Function} success - Callback for a successful clear operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.clear = function (success, error) {

    error = error || this.defaultError;
    try {
        var i = 0, len = localStorage.length;
        while (len > 0 && i < len) {
            var fullKey = localStorage.key(i);
            var key = unqualifyDomStoreKey(this, fullKey);
            if (fullKey !== key) {
                localStorage.removeItem(fullKey);
                len = localStorage.length;
            } else {
                i++;
            }
        }
        delay(success);
    }
    catch (e) {
        delay(error, e);
    }
};

/** This function does nothing in DomStore as it does not have a connection model
 * @method module:store/dom~DomStore#close
 */
DomStore.prototype.close = function () {
};

/** Checks whether a key exists in the store.
 * @method module:store/dom~DomStore#contains
 * @param {String} key - Key string.
 * @param {Function} success - Callback indicating whether the store contains the key or not.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
*/
DomStore.prototype.contains = function (key, success, error) {
    error = error || this.defaultError;
    try {
        var fullKey = qualifyDomStoreKey(this, key);
        var value = localStorage.getItem(fullKey);
        delay(success, value !== null);
    } catch (e) {
        delay(error, e);
    }
};

DomStore.prototype.defaultError = throwErrorCallback;

/** Gets all the keys that exist in the store.
 * @method module:store/dom~DomStore#getAllKeys
 * @param {Function} success - Callback for a successful get operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.getAllKeys = function (success, error) {

    error = error || this.defaultError;

    var results = [];
    var i, len;

    try {
        for (i = 0, len = localStorage.length; i < len; i++) {
            var fullKey = localStorage.key(i);
            var key = unqualifyDomStoreKey(this, fullKey);
            if (fullKey !== key) {
                results.push(key);
            }
        }
        delay(success, results);
    }
    catch (e) {
        delay(error, e);
    }
};

/** Identifies the underlying mechanism used by the store.*/
DomStore.prototype.mechanism = "dom";

/** Reads the value associated to a key in the store.
 * @method module:store/dom~DomStore#read
 * @param {String} key - Key string.
 * @param {Function} success - Callback for a successful reads operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.read = function (key, success, error) {

    error = error || this.defaultError;

    if (key instanceof Array) {
        error({ message: "Array of keys not supported" });
    } else {
        try {
            var fullKey = qualifyDomStoreKey(this, key);
            var value = localStorage.getItem(fullKey);
            if (value !== null && value !== "undefined") {
                // Hydrate using json
                value = window.JSON.parse(value, domStoreJSONToDate);
            }
            else {
                value = undefined;
            }
            delay(success, key, value);
        } catch (e) {
            delay(error, e);
        }
    }
};

/** Removes a key and its value from the store.
 * @method module:store/dom~DomStore#remove
 * @param {String} key - Key string.
 * @param {Function} success - Callback for a successful remove operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.remove = function (key, success, error) {
    error = error || this.defaultError;

    if (key instanceof Array) {
        error({ message: "Batches not supported" });
    } else {
        try {
            var fullKey = qualifyDomStoreKey(this, key);
            localStorage.removeItem(fullKey);
            delay(success);
        } catch (e) {
            delay(error, e);
        }
    }
};

/** Updates the value associated to a key in the store.
 * @method module:store/dom~DomStore#update
 * @param {String} key - Key string.
 * @param value - New value.
 * @param {Function} success - Callback for a successful update operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked
 * This method errors out if the specified key is not found in the store.
 */
DomStore.prototype.update = function (key, value, success, error) {
    error = error || this.defaultError;
    var store = this;
    this.contains(key, function (contained) {
        if (contained) {
            store.addOrUpdate(key, value, success, error);
        } else {
            delay(error, { message: "key not found", key: key });
        }
    }, error);
};

module.exports = DomStore;