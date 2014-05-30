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

/* {
    oldname:'store-memory.js',
    updated:'20140514 12:59'
}*/



var utils = require('./../datajs.js').utils;


// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;

// CONTENT START

var MemoryStore = function (name) {
    /// <summary>Constructor for store objects that use a sorted array as the underlying mechanism.</summary>
    /// <param name="name" type="String">Store name.</param>

    var holes = [];
    var items = [];
    var keys = {};

    this.name = name;

    var getErrorCallback = function (error) {
        return error || this.defaultError;
    };

    var validateKeyInput = function (key, error) {
        /// <summary>Validates that the specified key is not undefined, not null, and not an array</summary>
        /// <param name="key">Key value.</param>
        /// <param name="error" type="Function">Error callback.</param>
        /// <returns type="Boolean">True if the key is valid. False if the key is invalid and the error callback has been queued for execution.</returns>

        var messageString;

        if (key instanceof Array) {
            messageString = "Array of keys not supported";
        }

        if (key === undefined || key === null) {
            messageString = "Invalid key";
        }

        if (messageString) {
            delay(error, { message: messageString });
            return false;
        }
        return true;
    };

    this.add = function (key, value, success, error) {
        /// <summary>Adds a new value identified by a key to the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="value">Value that is going to be added to the store.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful add operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        /// <remarks>
        ///    This method errors out if the store already contains the specified key.
        /// </remarks>

        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            if (!keys.hasOwnProperty(key)) {
                this.addOrUpdate(key, value, success, error);
            } else {
                error({ message: "key already exists", key: key });
            }
        }
    };

    this.addOrUpdate = function (key, value, success, error) {
        /// <summary>Adds or updates a value identified by a key to the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="value">Value that is going to be added or updated to the store.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful add or update operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        /// <remarks>
        ///   This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
        /// </remarks>

        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            var index = keys[key];
            if (index === undefined) {
                if (holes.length > 0) {
                    index = holes.splice(0, 1);
                } else {
                    index = items.length;
                }
            }
            items[index] = value;
            keys[key] = index;
            delay(success, key, value);
        }
    };

    this.clear = function (success) {
        /// <summary>Removes all the data associated with this store object.</summary>
        /// <param name="success" type="Function" optional="no">Callback for a successful clear operation.</param>

        items = [];
        keys = {};
        holes = [];

        delay(success);
    };

    this.contains = function (key, success) {
        /// <summary>Checks whether a key exists in the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="success" type="Function" optional="no">Callback indicating whether the store contains the key or not.</param>

        var contained = keys.hasOwnProperty(key);
        delay(success, contained);
    };

    this.getAllKeys = function (success) {
        /// <summary>Gets all the keys that exist in the store.</summary>
        /// <param name="success" type="Function" optional="no">Callback for a successful get operation.</param>

        var results = [];
        for (var name in keys) {
            results.push(name);
        }
        delay(success, results);
    };

    this.read = function (key, success, error) {
        /// <summary>Reads the value associated to a key in the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful reads operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            var index = keys[key];
            delay(success, key, items[index]);
        }
    };

    this.remove = function (key, success, error) {
        /// <summary>Removes a key and its value from the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful remove operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            var index = keys[key];
            if (index !== undefined) {
                if (index === items.length - 1) {
                    items.pop();
                } else {
                    items[index] = undefined;
                    holes.push(index);
                }
                delete keys[key];

                // The last item was removed, no need to keep track of any holes in the array.
                if (items.length === 0) {
                    holes = [];
                }
            }

            delay(success);
        }
    };

    this.update = function (key, value, success, error) {
        /// <summary>Updates the value associated to a key in the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="value">New value.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful update operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        /// <remarks>
        ///    This method errors out if the specified key is not found in the store.
        /// </remarks>

        error = getErrorCallback(error);
        if (validateKeyInput(key, error)) {
            if (keys.hasOwnProperty(key)) {
                this.addOrUpdate(key, value, success, error);
            } else {
                error({ message: "key not found", key: key });
            }
        }
    };
};

MemoryStore.create = function (name) {
    /// <summary>Creates a store object that uses memory storage as its underlying mechanism.</summary>
    /// <param name="name" type="String">Store name.</param>
    /// <returns type="Object">Store object.</returns>
    return new MemoryStore(name);
};

MemoryStore.isSupported = function () {
    /// <summary>Checks whether the underlying mechanism for this kind of store objects is supported by the browser.</summary>
    /// <returns type="Boolean">True if the mechanism is supported by the browser; otherwise false.</returns>
    return true;
};

MemoryStore.prototype.close = function () {
    /// <summary>This function does nothing in MemoryStore as it does not have a connection model.</summary>
};

MemoryStore.prototype.defaultError = throwErrorCallback;

/// <summary>Identifies the underlying mechanism used by the store.</summary>
MemoryStore.prototype.mechanism = "memory";

// DATAJS INTERNAL START
module.exports = MemoryStore;
// DATAJS INTERNAL END

    // CONTENT END
