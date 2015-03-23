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

/** @module store/memory */


var utils = require('./../utils.js');

// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;

/** Constructor for store objects that use a sorted array as the underlying mechanism.
 * @class MemoryStore
 * @constructor
 * @param {String} name - Store name.
 */
function MemoryStore(name) {

    var holes = [];
    var items = [];
    var keys = {};

    this.name = name;

    var getErrorCallback = function (error) {
        return error || this.defaultError;
    };

    /** Validates that the specified key is not undefined, not null, and not an array
     * @param key - Key value.
     * @param {Function} error - Error callback.
     * @returns {Boolean} True if the key is valid. False if the key is invalid and the error callback has been queued for execution.
     */
    function validateKeyInput(key, error) {

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
    }

    /** This method errors out if the store already contains the specified key.
     * @summary Adds a new value identified by a key to the store.
     * @method module:store/memory~MemoryStore#add
     * @param {String} key - Key string.
     * @param value - Value that is going to be added to the store.
     * @param {Function} success - Callback for a successful add operation.
     * @param {Function} error - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    this.add = function (key, value, success, error) {
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            if (!keys.hasOwnProperty(key)) {
                this.addOrUpdate(key, value, success, error);
            } else {
                error({ message: "key already exists", key: key });
            }
        }
    };

    /** This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
     * @summary Adds or updates a value identified by a key to the store.
     * @method module:store/memory~MemoryStore#addOrUpdate
     * @param {String} key - Key string.
     * @param value - Value that is going to be added or updated to the store.
     * @param {Function} success - Callback for a successful add or update operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
    */
    this.addOrUpdate = function (key, value, success, error) {
        
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

    /** Removes all the data associated with this store object.
     * @method module:store/memory~MemoryStore#clear
     * @param {Function} success - Callback for a successful clear operation.
     */
    this.clear = function (success) {
        items = [];
        keys = {};
        holes = [];
        delay(success);
    };

    /** Checks whether a key exists in the store.
     * @method module:store/memory~MemoryStore#contains
     * @param {String} key - Key string.
     * @param {Function} success - Callback indicating whether the store contains the key or not.
     */
    this.contains = function (key, success) {
        var contained = keys.hasOwnProperty(key);
        delay(success, contained);
    };

    /** Gets all the keys that exist in the store.
     * @method module:store/memory~MemoryStore#getAllKeys
     * @param {Function} success - Callback for a successful get operation.
     */
    this.getAllKeys = function (success) {

        var results = [];
        for (var name in keys) {
            results.push(name);
        }
        delay(success, results);
    };

    /** Reads the value associated to a key in the store.
     * @method module:store/memory~MemoryStore#read
     * @param {String} key - Key string.
     * @param {Function} success - Callback for a successful reads operation.
     * @param {Function} error - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    this.read = function (key, success, error) {
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            var index = keys[key];
            delay(success, key, items[index]);
        }
    };

    /** Removes a key and its value from the store.
     * @method module:store/memory~MemoryStore#remove
     * @param {String} key - Key string.
     * @param {Function} success - Callback for a successful remove operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    this.remove = function (key, success, error) {
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

    /** Updates the value associated to a key in the store.
     * @method module:store/memory~MemoryStore#update
     * @param {String} key - Key string.
     * @param value - New value.
     * @param {Function} success - Callback for a successful update operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
     * This method errors out if the specified key is not found in the store.
     */
    this.update = function (key, value, success, error) {
        error = getErrorCallback(error);
        if (validateKeyInput(key, error)) {
            if (keys.hasOwnProperty(key)) {
                this.addOrUpdate(key, value, success, error);
            } else {
                error({ message: "key not found", key: key });
            }
        }
    };
}

/** Creates a store object that uses memory storage as its underlying mechanism.
 * @method MemoryStore.create
 * @param {String} name - Store name.
 * @returns {Object} Store object.
 */
MemoryStore.create = function (name) {
    return new MemoryStore(name);
};

/** Checks whether the underlying mechanism for this kind of store objects is supported by the browser.
 * @method MemoryStore.isSupported
 * @returns {Boolean} True if the mechanism is supported by the browser; otherwise false.
 */
MemoryStore.isSupported = function () {
    return true;
};

/** This function does nothing in MemoryStore as it does not have a connection model.
*/
MemoryStore.prototype.close = function () {
};

MemoryStore.prototype.defaultError = throwErrorCallback;

/** Identifies the underlying mechanism used by the store.
*/
MemoryStore.prototype.mechanism = "memory";


/** MemoryStore (see {@link MemoryStore}) */
module.exports = MemoryStore;