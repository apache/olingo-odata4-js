/* {
    oldname:'store-dom.js',
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

// store-dom.js

var utils = require('./../datajs.js').utils;

// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;

// CONTENT START

var localStorage = null;

var domStoreDateToJSON = function () {
    /// <summary>Converts a Date object into an object representation friendly to JSON serialization.</summary>
    /// <returns type="Object">Object that represents the Date.</returns>
    /// <remarks>
    ///   This method is used to override the Date.toJSON method and is called only by
    ///   JSON.stringify.  It should never be called directly.
    /// </remarks>

    var newValue = { v: this.valueOf(), t: "[object Date]" };
    // Date objects might have extra properties on them so we save them.
    for (var name in this) {
        newValue[name] = this[name];
    }
    return newValue;
};

var domStoreJSONToDate = function (_, value) {
    /// <summary>JSON reviver function for converting an object representing a Date in a JSON stream to a Date object</summary>
    /// <param value="Object">Object to convert.</param>
    /// <returns type="Date">Date object.</returns>
    /// <remarks>
    ///   This method is used during JSON parsing and invoked only by the reviver function.
    ///   It should never be called directly.
    /// </remarks>

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
};

var qualifyDomStoreKey = function (store, key) {
    /// <summary>Qualifies the key with the name of the store.</summary>
    /// <param name="store" type="Object">Store object whose name will be used for qualifying the key.</param>
    /// <param name="key" type="String">Key string.</param>
    /// <returns type="String">Fully qualified key string.</returns>

    return store.name + "#!#" + key;
};

var unqualifyDomStoreKey = function (store, key) {
    /// <summary>Gets the key part of a fully qualified key string.</summary>
    /// <param name="store" type="Object">Store object whose name will be used for qualifying the key.</param>
    /// <param name="key" type="String">Fully qualified key string.</param>
    /// <returns type="String">Key part string</returns>

    return key.replace(store.name + "#!#", "");
};

var DomStore = function (name) {
    /// <summary>Constructor for store objects that use DOM storage as the underlying mechanism.</summary>
    /// <param name="name" type="String">Store name.</param>
    this.name = name;
};

DomStore.create = function (name) {
    /// <summary>Creates a store object that uses DOM Storage as its underlying mechanism.</summary>
    /// <param name="name" type="String">Store name.</param>
    /// <returns type="Object">Store object.</returns>

    if (DomStore.isSupported()) {
        localStorage = localStorage || window.localStorage;
        return new DomStore(name);
    }

    throw { message: "Web Storage not supported by the browser" };
};

DomStore.isSupported = function () {
    /// <summary>Checks whether the underlying mechanism for this kind of store objects is supported by the browser.</summary>
    /// <returns type="Boolean">True if the mechanism is supported by the browser; otherwise false.</summary>
    return !!window.localStorage;
};

DomStore.prototype.add = function (key, value, success, error) {
    /// <summary>Adds a new value identified by a key to the store.</summary>
    /// <param name="key" type="String">Key string.</param>
    /// <param name="value">Value that is going to be added to the store.</param>
    /// <param name="success" type="Function" optional="no">Callback for a successful add operation.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
    /// <remarks>
    ///    This method errors out if the store already contains the specified key.
    /// </remarks>

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

DomStore.prototype.addOrUpdate = function (key, value, success, error) {
    /// <summary>Adds or updates a value identified by a key to the store.</summary>
    /// <param name="key" type="String">Key string.</param>
    /// <param name="value">Value that is going to be added or updated to the store.</param>
    /// <param name="success" type="Function" optional="no">Callback for a successful add or update operation.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
    /// <remarks>
    ///   This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
    /// </remarks>

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

DomStore.prototype.clear = function (success, error) {
    /// <summary>Removes all the data associated with this store object.</summary>
    /// <param name="success" type="Function" optional="no">Callback for a successful clear operation.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
    /// <remarks>
    ///    In case of an error, this method will not restore any keys that might have been deleted at that point.
    /// </remarks>

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

DomStore.prototype.close = function () {
    /// <summary>This function does nothing in DomStore as it does not have a connection model</summary>
};

DomStore.prototype.contains = function (key, success, error) {
    /// <summary>Checks whether a key exists in the store.</summary>
    /// <param name="key" type="String">Key string.</param>
    /// <param name="success" type="Function" optional="no">Callback indicating whether the store contains the key or not.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
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

DomStore.prototype.getAllKeys = function (success, error) {
    /// <summary>Gets all the keys that exist in the store.</summary>
    /// <param name="success" type="Function" optional="no">Callback for a successful get operation.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>

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

/// <summary>Identifies the underlying mechanism used by the store.</summary>
DomStore.prototype.mechanism = "dom";

DomStore.prototype.read = function (key, success, error) {
    /// <summary>Reads the value associated to a key in the store.</summary>
    /// <param name="key" type="String">Key string.</param>
    /// <param name="success" type="Function" optional="no">Callback for a successful reads operation.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
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

DomStore.prototype.remove = function (key, success, error) {
    /// <summary>Removes a key and its value from the store.</summary>
    /// <param name="key" type="String">Key string.</param>
    /// <param name="success" type="Function" optional="no">Callback for a successful remove operation.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
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

DomStore.prototype.update = function (key, value, success, error) {
    /// <summary>Updates the value associated to a key in the store.</summary>
    /// <param name="key" type="String">Key string.</param>
    /// <param name="value">New value.</param>
    /// <param name="success" type="Function" optional="no">Callback for a successful update operation.</param>
    /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
    /// <remarks>
    ///    This method errors out if the specified key is not found in the store.
    /// </remarks>

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

// DATAJS INTERNAL START
exports.DomStore = DomStore;
// DATAJS INTERNAL END
