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

 /** @module cache */

//var odatajs = require('./odatajs/utils.js');
var utils =  require('./utils.js');
var deferred = require('./deferred.js');
var storeReq = require('./store.js');
var cacheSource = require('./cache/source.js');


var assigned = utils.assigned;
var delay = utils.delay;
var extend = utils.extend;
var djsassert = utils.djsassert;
var isArray = utils.isArray;
var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;
var undefinedDefault = utils.undefinedDefault;

var createDeferred = deferred.createDeferred;
var DjsDeferred = deferred.DjsDeferred;


var getJsonValueArraryLength = utils.getJsonValueArraryLength;
var sliceJsonValueArray = utils.sliceJsonValueArray;
var concatJsonValueArray = utils.concatJsonValueArray;



/** Appends a page's data to the operation data.
 * @param {Object} operation - Operation with  (i)ndex, (c)ount and (d)ata.
 * @param {Object} page - Page with (i)ndex, (c)ount and (d)ata.
 */
function appendPage(operation, page) {

    var intersection = intersectRanges(operation, page);
    var start = 0;
    var end = 0;
    if (intersection) {
        start = intersection.i - page.i;
        end = start + (operation.c - getJsonValueArraryLength(operation.d));
    }

    operation.d = concatJsonValueArray(operation.d, sliceJsonValueArray(page.d, start, end));
}

/** Returns the {(i)ndex, (c)ount} range for the intersection of x and y.
 * @param {Object} x - Range with (i)ndex and (c)ount members.
 * @param {Object} y - Range with (i)ndex and (c)ount members.
 * @returns {Object} The intersection (i)ndex and (c)ount; undefined if there is no intersection.
 */
function intersectRanges(x, y) {

    var xLast = x.i + x.c;
    var yLast = y.i + y.c;
    var resultIndex = (x.i > y.i) ? x.i : y.i;
    var resultLast = (xLast < yLast) ? xLast : yLast;
    var result;
    if (resultLast >= resultIndex) {
        result = { i: resultIndex, c: resultLast - resultIndex };
    }

    return result;
}

/** Checks whether val is a defined number with value zero or greater.
 * @param {Number} val - Value to check.
 * @param {String} name - Parameter name to use in exception.
 * @throws Throws an exception if the check fails
 */
function checkZeroGreater(val, name) {

    if (val === undefined || typeof val !== "number") {
        throw { message: "'" + name + "' must be a number." };
    }

    if (isNaN(val) || val < 0 || !isFinite(val)) {
        throw { message: "'" + name + "' must be greater than or equal to zero." };
    }
}

/** Checks whether val is undefined or a number with value greater than zero.
 * @param {Number} val - Value to check.
 * @param {String} name - Parameter name to use in exception.
 * @throws Throws an exception if the check fails
 */
function checkUndefinedGreaterThanZero(val, name) {

    if (val !== undefined) {
        if (typeof val !== "number") {
            throw { message: "'" + name + "' must be a number." };
        }

        if (isNaN(val) || val <= 0 || !isFinite(val)) {
            throw { message: "'" + name + "' must be greater than zero." };
        }
    }
}

/** Checks whether val is undefined or a number
 * @param {Number} val - Value to check.
 * @param {String} name - Parameter name to use in exception.
 * @throws Throws an exception if the check fails
 */
function checkUndefinedOrNumber(val, name) {
    if (val !== undefined && (typeof val !== "number" || isNaN(val) || !isFinite(val))) {
        throw { message: "'" + name + "' must be a number." };
    }
}

/** Performs a linear search on the specified array and removes the first instance of 'item'.
 * @param {Array} arr - Array to search.
 * @param {*} item - Item being sought.
 * @returns {Boolean} true if the item was removed otherwise false
 */
function removeFromArray(arr, item) {

    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === item) {
            arr.splice(i, 1);
            return true;
        }
    }

    return false;
}

/** Estimates the size of an object in bytes.
 * Object trees are traversed recursively
 * @param {Object} object - Object to determine the size of.
 * @returns {Number} Estimated size of the object in bytes.
 */
function estimateSize(object) {
    var size = 0;
    var type = typeof object;

    if (type === "object" && object) {
        for (var name in object) {
            size += name.length * 2 + estimateSize(object[name]);
        }
    } else if (type === "string") {
        size = object.length * 2;
    } else {
        size = 8;
    }
    return size;
}

/** Snaps low and high indices into page sizes and returns a range.
 * @param {Number} lowIndex - Low index to snap to a lower value.
 * @param {Number} highIndex - High index to snap to a higher value.
 * @param {Number} pageSize - Page size to snap to.
 * @returns {Object} A range with (i)ndex and (c)ount of elements.
 */
function snapToPageBoundaries(lowIndex, highIndex, pageSize) {
    lowIndex = Math.floor(lowIndex / pageSize) * pageSize;
    highIndex = Math.ceil((highIndex + 1) / pageSize) * pageSize;
    return { i: lowIndex, c: highIndex - lowIndex };
}

// The DataCache is implemented using state machines.  The following constants are used to properly
// identify and label the states that these machines transition to.
var CACHE_STATE_DESTROY  = "destroy";
var CACHE_STATE_IDLE     = "idle";
var CACHE_STATE_INIT     = "init";
var CACHE_STATE_READ     = "read";
var CACHE_STATE_PREFETCH = "prefetch";
var CACHE_STATE_WRITE    = "write";

// DataCacheOperation state machine states.
// Transitions on operations also depend on the cache current of the cache.
var OPERATION_STATE_CANCEL = "cancel";
var OPERATION_STATE_END    = "end";
var OPERATION_STATE_ERROR  = "error";
var OPERATION_STATE_START  = "start";
var OPERATION_STATE_WAIT   = "wait";

// Destroy state machine states
var DESTROY_STATE_CLEAR = "clear";

// Read / Prefetch state machine states
var READ_STATE_DONE   = "done";
var READ_STATE_LOCAL  = "local";
var READ_STATE_SAVE   = "save";
var READ_STATE_SOURCE = "source";

/** Creates a new operation object.
 * @class DataCacheOperation
 * @param {Function} stateMachine - State machine that describes the specific behavior of the operation.
 * @param {DjsDeferred} promise - Promise for requested values.
 * @param {Boolean} isCancelable - Whether this operation can be canceled or not.
 * @param {Number} index - Index of first item requested.
 * @param {Number} count - Count of items requested.
 * @param {Array} data - Array with the items requested by the operation.
 * @param {Number} pending - Total number of pending prefetch records.
 * @returns {DataCacheOperation} A new data cache operation instance.
 */
function DataCacheOperation(stateMachine, promise, isCancelable, index, count, data, pending) {

   var stateData;
    var cacheState;
    var that = this;

    that.p = promise;
    that.i = index;
    that.c = count;
    that.d = data;
    that.s = OPERATION_STATE_START;

    that.canceled = false;
    that.pending = pending;
    that.oncomplete = null;

    /** Transitions this operation to the cancel state and sets the canceled flag to true.
     * The function is a no-op if the operation is non-cancelable.
     * @method DataCacheOperation#cancel
     */
    that.cancel = function cancel() {

        if (!isCancelable) {
            return;
        }

        var state = that.s;
        if (state !== OPERATION_STATE_ERROR && state !== OPERATION_STATE_END && state !== OPERATION_STATE_CANCEL) {
            that.canceled = true;
            that.transition(OPERATION_STATE_CANCEL, stateData);
        }
    };

    /** Transitions this operation to the end state.
     * @method DataCacheOperation#complete
     */
    that.complete = function () {

        djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.complete() - operation is in the end state", that);
        that.transition(OPERATION_STATE_END, stateData);
    };

    /** Transitions this operation to the error state.
     * @method DataCacheOperation#error
     */
    that.error = function (err) {
        if (!that.canceled) {
            djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.error() - operation is in the end state", that);
            djsassert(that.s !== OPERATION_STATE_ERROR, "DataCacheOperation.error() - operation is in the error state", that);
            that.transition(OPERATION_STATE_ERROR, err);
        }
    };

    /** Executes the operation's current state in the context of a new cache state.
     * @method DataCacheOperation#run
     * @param {Object} state - New cache state.
     */
    that.run = function (state) {

        cacheState = state;
        that.transition(that.s, stateData);
    };

    /** Transitions this operation to the wait state.
     * @method DataCacheOperation#wait
     */
    that.wait = function (data) {

        djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.wait() - operation is in the end state", that);
        that.transition(OPERATION_STATE_WAIT, data);
    };

    /** State machine that describes all operations common behavior.
     * @method DataCacheOperation#operationStateMachine
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - Additional data passed to the state.
     */
    var operationStateMachine = function (opTargetState, cacheState, data) {

        switch (opTargetState) {
            case OPERATION_STATE_START:
                // Initial state of the operation. The operation will remain in this state until the cache has been fully initialized.
                if (cacheState !== CACHE_STATE_INIT) {
                    stateMachine(that, opTargetState, cacheState, data);
                }
                break;

            case OPERATION_STATE_WAIT:
                // Wait state indicating that the operation is active but waiting for an asynchronous operation to complete.
                stateMachine(that, opTargetState, cacheState, data);
                break;

            case OPERATION_STATE_CANCEL:
                // Cancel state.
                stateMachine(that, opTargetState, cacheState, data);
                that.fireCanceled();
                that.transition(OPERATION_STATE_END);
                break;

            case OPERATION_STATE_ERROR:
                // Error state. Data is expected to be an object detailing the error condition.
                stateMachine(that, opTargetState, cacheState, data);
                that.canceled = true;
                that.fireRejected(data);
                that.transition(OPERATION_STATE_END);
                break;

            case OPERATION_STATE_END:
                // Final state of the operation.
                if (that.oncomplete) {
                    that.oncomplete(that);
                }
                if (!that.canceled) {
                    that.fireResolved();
                }
                stateMachine(that, opTargetState, cacheState, data);
                break;

            default:
                // Any other state is passed down to the state machine describing the operation's specific behavior.

                if (true) {
                    // Check that the state machine actually handled the sate.
                    var handled = stateMachine(that, opTargetState, cacheState, data);
                    djsassert(handled, "Bad operation state: " + opTargetState + " cacheState: " + cacheState, this);
                } else {

                    stateMachine(that, opTargetState, cacheState, data);

                }

                break;
        }
    };



    /** Transitions this operation to a new state.
     * @method DataCacheOperation#transition
     * @param {Object} state - State to transition the operation to.
     * @param {Object} [data] - 
     */
    that.transition = function (state, data) {
        that.s = state;
        stateData = data;
        operationStateMachine(state, cacheState, data);
    };
    
    return that;
}

/** Fires a resolved notification as necessary.
 * @method DataCacheOperation#fireResolved
 */
DataCacheOperation.prototype.fireResolved = function () {

    // Fire the resolve just once.
    var p = this.p;
    if (p) {
        this.p = null;
        p.resolve(this.d);
    }
};

/** Fires a rejected notification as necessary.
 * @method DataCacheOperation#fireRejected
 */
DataCacheOperation.prototype.fireRejected = function (reason) {

    // Fire the rejection just once.
    var p = this.p;
    if (p) {
        this.p = null;
        p.reject(reason);
    }
};

/** Fires a canceled notification as necessary.
 * @method DataCacheOperation#fireCanceled
 */
DataCacheOperation.prototype.fireCanceled = function () {

    this.fireRejected({ canceled: true, message: "Operation canceled" });
};


/** Creates a data cache for a collection that is efficiently loaded on-demand.
 * @class DataCache
 * @param options - Options for the data cache, including name, source, pageSize,
 * prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
 * @returns {DataCache} A new data cache instance.
 */
function DataCache(options) {

    var state = CACHE_STATE_INIT;
    var stats = { counts: 0, netReads: 0, prefetches: 0, cacheReads: 0 };

    var clearOperations = [];
    var readOperations = [];
    var prefetchOperations = [];

    var actualCacheSize = 0;                                             // Actual cache size in bytes.
    var allDataLocal = false;                                            // Whether all data is local.
    var cacheSize = undefinedDefault(options.cacheSize, 1048576);        // Requested cache size in bytes, default 1 MB.
    var collectionCount = 0;                                             // Number of elements in the server collection.
    var highestSavedPage = 0;                                            // Highest index of all the saved pages.
    var highestSavedPageSize = 0;                                        // Item count of the saved page with the highest index.
    var overflowed = cacheSize === 0;                                    // If the cache has overflowed (actualCacheSize > cacheSize or cacheSize == 0);
    var pageSize = undefinedDefault(options.pageSize, 50);               // Number of elements to store per page.
    var prefetchSize = undefinedDefault(options.prefetchSize, pageSize); // Number of elements to prefetch from the source when the cache is idling.
    var version = "1.0";
    var cacheFailure;

    var pendingOperations = 0;

    var source = options.source;
    if (typeof source === "string") {
        // Create a new cache source.
        source = new cacheSource.ODataCacheSource(options);
    }
    source.options = options;

    // Create a cache local store.
    var store = storeReq.createStore(options.name, options.mechanism);

    var that = this;

    that.onidle = options.idle;
    that.stats = stats;

    /** Counts the number of items in the collection.
     * @method DataCache#count
     * @returns {Object} A promise with the number of items.
     */
    that.count = function () {

        if (cacheFailure) {
            throw cacheFailure;
        }

        var deferred = createDeferred();
        var canceled = false;

        if (allDataLocal) {
            delay(function () {
                deferred.resolve(collectionCount);
            });

            return deferred.promise();
        }

        // TODO: Consider returning the local data count instead once allDataLocal flag is set to true.
        var request = source.count(function (count) {
            request = null;
            stats.counts++;
            deferred.resolve(count);
        }, function (err) {
            request = null;
            deferred.reject(extend(err, { canceled: canceled }));
        });

        return extend(deferred.promise(), {

             /** Aborts the count operation (used within promise callback)
              * @method DataCache#cancelCount
              */
            cancel: function () {
               
                if (request) {
                    canceled = true;
                    request.abort();
                    request = null;
                }
            }
        });
    };

    /** Cancels all running operations and clears all local data associated with this cache.
     * New read requests made while a clear operation is in progress will not be canceled.
     * Instead they will be queued for execution once the operation is completed.
     * @method DataCache#clear
     * @returns {Object} A promise that has no value and can't be canceled.
     */
    that.clear = function () {

        if (cacheFailure) {
            throw cacheFailure;
        }

        if (clearOperations.length === 0) {
            var deferred = createDeferred();
            var op = new DataCacheOperation(destroyStateMachine, deferred, false);
            queueAndStart(op, clearOperations);
            return deferred.promise();
        }
        return clearOperations[0].p;
    };

    /** Filters the cache data based a predicate.
     * Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
     * @method DataCache#filterForward
     * @param {Number} index - The index of the item to start filtering forward from.
     * @param {Number} count - Maximum number of items to include in the result.
     * @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
     * @returns {DjsDeferred} A promise for an array of results.
     */
    that.filterForward = function (index, count, predicate) {
        return filter(index, count, predicate, false);
    };

    /** Filters the cache data based a predicate.
     * Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
     * @method DataCache#filterBack
     * @param {Number} index - The index of the item to start filtering backward from.
     * @param {Number} count - Maximum number of items to include in the result.
     * @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
     * @returns {DjsDeferred} A promise for an array of results.
     */
    that.filterBack = function (index, count, predicate) {
        return filter(index, count, predicate, true);
    };

    /** Reads a range of adjacent records.
     * New read requests made while a clear operation is in progress will not be canceled.
     * Instead they will be queued for execution once the operation is completed.
     * @method DataCache#readRange
     * @param {Number} index - Zero-based index of record range to read.
     * @param {Number} count - Number of records in the range.
     * @returns {DjsDeferred} A promise for an array of records; less records may be returned if the
     * end of the collection is found.
     */
    that.readRange = function (index, count) {

        checkZeroGreater(index, "index");
        checkZeroGreater(count, "count");

        if (cacheFailure) {
            throw cacheFailure;
        }

        var deferred = createDeferred();

        // Merging read operations would be a nice optimization here.
        var op = new DataCacheOperation(readStateMachine, deferred, true, index, count, {}, 0);
        queueAndStart(op, readOperations);

        return extend(deferred.promise(), {
            cancel: function () {
                /** Aborts the readRange operation  (used within promise callback)
                 * @method DataCache#cancelReadRange
                 */
                op.cancel();
            }
        });
    };

    /** Creates an Observable object that enumerates all the cache contents.
     * @method DataCache#toObservable
     * @returns A new Observable object that enumerates all the cache contents.
     */
    that.ToObservable = that.toObservable = function () {
        if ( !utils.inBrowser()) {
            throw { message: "Only in broser supported" };
        }

        if (!window.Rx || !window.Rx.Observable) {
            throw { message: "Rx library not available - include rx.js" };
        }

        if (cacheFailure) {
            throw cacheFailure;
        }

        //return window.Rx.Observable.create(function (obs) {
        return new window.Rx.Observable(function (obs) {
            var disposed = false;
            var index = 0;

            var errorCallback = function (error) {
                if (!disposed) {
                    obs.onError(error);
                }
            };

            var successCallback = function (data) {
                if (!disposed) {
                    var i, len;
                    for (i = 0, len = data.value.length; i < len; i++) {
                        // The wrapper automatically checks for Dispose
                        // on the observer, so we don't need to check it here.
                        //obs.next(data.value[i]);
                        obs.onNext(data.value[i]);
                    }

                    if (data.value.length < pageSize) {
                        //obs.completed();
                        obs.onCompleted();
                    } else {
                        index += pageSize;
                        that.readRange(index, pageSize).then(successCallback, errorCallback);
                    }
                }
            };

            that.readRange(index, pageSize).then(successCallback, errorCallback);

            return { Dispose: function () { 
                obs.dispose(); // otherwise the check isStopped obs.onNext(data.value[i]);
                disposed = true; 
                } };
        });
    };

    /** Creates a function that handles a callback by setting the cache into failure mode.
     * @method DataCache~cacheFailureCallback
     * @param {String} message - Message text.
     * @returns {Function} Function to use as error callback.
     * This function will specifically handle problems with critical store resources
     * during cache initialization.
     */
    var cacheFailureCallback = function (message) {
        

        return function (error) {
            cacheFailure = { message: message, error: error };

            // Destroy any pending clear or read operations.
            // At this point there should be no prefetch operations.
            // Count operations will go through but are benign because they
            // won't interact with the store.
            djsassert(prefetchOperations.length === 0, "prefetchOperations.length === 0");
            var i, len;
            for (i = 0, len = readOperations.length; i < len; i++) {
                readOperations[i].fireRejected(cacheFailure);
            }
            for (i = 0, len = clearOperations.length; i < len; i++) {
                clearOperations[i].fireRejected(cacheFailure);
            }

            // Null out the operation arrays.
            readOperations = clearOperations = null;
        };
    };

    /** Updates the cache's state and signals all pending operations of the change.
     * @method DataCache~changeState
     * @param {Object} newState - New cache state.
     * This method is a no-op if the cache's current state and the new state are the same.
     */
    var changeState = function (newState) {

        if (newState !== state) {
            state = newState;
            var operations = clearOperations.concat(readOperations, prefetchOperations);
            var i, len;
            for (i = 0, len = operations.length; i < len; i++) {
                operations[i].run(state);
            }
        }
    };

    /** Removes all the data stored in the cache.
     * @method DataCache~clearStore
     * @returns {DjsDeferred} A promise with no value.
     */
    var clearStore = function () {
        djsassert(state === CACHE_STATE_DESTROY || state === CACHE_STATE_INIT, "DataCache.clearStore() - cache is not on the destroy or initialize state, current sate = " + state);

        var deferred = new DjsDeferred();
        store.clear(function () {

            // Reset the cache settings.
            actualCacheSize = 0;
            allDataLocal = false;
            collectionCount = 0;
            highestSavedPage = 0;
            highestSavedPageSize = 0;
            overflowed = cacheSize === 0;

            // version is not reset, in case there is other state in eg V1.1 that is still around.

            // Reset the cache stats.
            stats = { counts: 0, netReads: 0, prefetches: 0, cacheReads: 0 };
            that.stats = stats;

            store.close();
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });
        return deferred;
    };

    /** Removes an operation from the caches queues and changes the cache state to idle.
     * @method DataCache~dequeueOperation
     * @param {DataCacheOperation} operation - Operation to dequeue.
     * This method is used as a handler for the operation's oncomplete event.
    */
    var dequeueOperation = function (operation) {

        var removed = removeFromArray(clearOperations, operation);
        if (!removed) {
            removed = removeFromArray(readOperations, operation);
            if (!removed) {
                removeFromArray(prefetchOperations, operation);
            }
        }

        pendingOperations--;
        changeState(CACHE_STATE_IDLE);
    };

    /** Requests data from the cache source.
     * @method DataCache~fetchPage
     * @param {Number} start - Zero-based index of items to request.
     * @returns {DjsDeferred} A promise for a page object with (i)ndex, (c)ount, (d)ata.
     */
    var fetchPage = function (start) {

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.fetchPage() - cache is on the destroy state");
        djsassert(state !== CACHE_STATE_IDLE, "DataCache.fetchPage() - cache is on the idle state");

        var deferred = new DjsDeferred();
        var canceled = false;

        var request = source.read(start, pageSize, function (data) {
            var length = getJsonValueArraryLength(data);
            var page = { i: start, c: length, d: data };
            deferred.resolve(page);
        }, function (err) {
            deferred.reject(err);
        });

        return extend(deferred, {
            cancel: function () {
                if (request) {
                    request.abort();
                    canceled = true;
                    request = null;
                }
            }
        });
    };

    /** Filters the cache data based a predicate.
     * @method DataCache~filter
     * @param {Number} index - The index of the item to start filtering from.
     * @param {Number} count - Maximum number of items to include in the result.
     * @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
     * @param {Boolean} backwards - True if the filtering should move backward from the specified index, falsey otherwise.
     * Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
     * @returns {DjsDeferred} A promise for an array of results.
     */
    var filter = function (index, count, predicate, backwards) {

        index = parseInt10(index);
        count = parseInt10(count);

        if (isNaN(index)) {
            throw { message: "'index' must be a valid number.", index: index };
        }
        if (isNaN(count)) {
            throw { message: "'count' must be a valid number.", count: count };
        }

        if (cacheFailure) {
            throw cacheFailure;
        }

        index = Math.max(index, 0);

        var deferred = createDeferred();
        var returnData = {};
        returnData.value = [];
        var canceled = false;
        var pendingReadRange = null;

        var readMore = function (readIndex, readCount) {
            if (!canceled) {
                if (count > 0 && returnData.value.length >= count) {
                    deferred.resolve(returnData);
                } else {
                    pendingReadRange = that.readRange(readIndex, readCount).then(function (data) {
                        if (data["@odata.context"] && !returnData["@odata.context"]) {
                            returnData["@odata.context"] = data["@odata.context"];
                        }
                        
                        for (var i = 0, length = data.value.length; i < length && (count < 0 || returnData.value.length < count); i++) {
                            var dataIndex = backwards ? length - i - 1 : i;
                            var item = data.value[dataIndex];
                            if (predicate(item)) {
                                var element = {
                                    index: readIndex + dataIndex,
                                    item: item
                                };

                                backwards ? returnData.value.unshift(element) : returnData.value.push(element);
                            }
                        }

                        // Have we reached the end of the collection?
                        if ((!backwards && data.value.length < readCount) || (backwards && readIndex <= 0)) {
                            deferred.resolve(returnData);
                        } else {
                            var nextIndex = backwards ? Math.max(readIndex - pageSize, 0) : readIndex + readCount;
                            readMore(nextIndex, pageSize);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
            }
        };

        // Initially, we read from the given starting index to the next/previous page boundary
        var initialPage = snapToPageBoundaries(index, index, pageSize);
        var initialIndex = backwards ? initialPage.i : index;
        var initialCount = backwards ? index - initialPage.i + 1 : initialPage.i + initialPage.c - index;
        readMore(initialIndex, initialCount);

        return extend(deferred.promise(), {
            /** Aborts the filter operation (used within promise callback)
            * @method DataCache#cancelFilter
             */
            cancel: function () {

                if (pendingReadRange) {
                    pendingReadRange.cancel();
                }
                canceled = true;
            }
        });
    };

    /** Fires an onidle event if any functions are assigned.
     * @method DataCache~fireOnIdle
    */
    var fireOnIdle = function () {

        if (that.onidle && pendingOperations === 0) {
            that.onidle();
        }
    };

    /** Creates and starts a new prefetch operation.
     * @method DataCache~prefetch
     * @param {Number} start - Zero-based index of the items to prefetch.
     * This method is a no-op if any of the following conditions is true:
     *     1.- prefetchSize is 0
     *     2.- All data has been read and stored locally in the cache.
     *     3.- There is already an all data prefetch operation queued.
     *     4.- The cache has run out of available space (overflowed).
    */
    var prefetch = function (start) {
        

        if (allDataLocal || prefetchSize === 0 || overflowed) {
            return;
        }

        djsassert(state === CACHE_STATE_READ, "DataCache.prefetch() - cache is not on the read state, current state: " + state);

        if (prefetchOperations.length === 0 || (prefetchOperations[0] && prefetchOperations[0].c !== -1)) {
            // Merging prefetch operations would be a nice optimization here.
            var op = new DataCacheOperation(prefetchStateMachine, null, true, start, prefetchSize, null, prefetchSize);
            queueAndStart(op, prefetchOperations);
        }
    };

    /** Queues an operation and runs it.
     * @param {DataCacheOperation} op - Operation to queue.
     * @param {Array} queue - Array that will store the operation.
     */
    var queueAndStart = function (op, queue) {

        op.oncomplete = dequeueOperation;
        queue.push(op);
        pendingOperations++;
        op.run(state);
    };

    /** Requests a page from the cache local store.
     * @method DataCache~readPage    
     * @param {Number} key - Zero-based index of the reuqested page.
     * @returns {DjsDeferred} A promise for a found flag and page object with (i)ndex, (c)ount, (d)ata, and (t)icks.
     */
    var readPage = function (key) {

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.readPage() - cache is on the destroy state");

        var canceled = false;
        var deferred = extend(new DjsDeferred(), {
            /** Aborts the readPage operation. (used within promise callback)
             * @method DataCache#cancelReadPage
             */
            cancel: function () {
                canceled = true;
            }
        });

        var error = storeFailureCallback(deferred, "Read page from store failure");

        store.contains(key, function (contained) {
            if (canceled) {
                return;
            }
            if (contained) {
                store.read(key, function (_, data) {
                    if (!canceled) {
                        deferred.resolve(data !== undefined, data);
                    }
                }, error);
                return;
            }
            deferred.resolve(false);
        }, error);
        return deferred;
    };

    /** Saves a page to the cache local store.
     * @method DataCache~savePage    
     * @param {Number} key - Zero-based index of the requested page.
     * @param {Object} page - Object with (i)ndex, (c)ount, (d)ata, and (t)icks.
     * @returns {DjsDeferred} A promise with no value.
     */
    var savePage = function (key, page) {

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.savePage() - cache is on the destroy state");
        djsassert(state !== CACHE_STATE_IDLE, "DataCache.savePage() - cache is on the idle state");

        var canceled = false;

        var deferred = extend(new DjsDeferred(), {
            /** Aborts the savePage operation. (used within promise callback)
             * @method DataCache#cancelReadPage
             */
            cancel: function () {
                canceled = true;
            }
        });

        var error = storeFailureCallback(deferred, "Save page to store failure");

        var resolve = function () {
            deferred.resolve(true);
        };

        if (page.c > 0) {
            var pageBytes = estimateSize(page);
            overflowed = cacheSize >= 0 && cacheSize < actualCacheSize + pageBytes;

            if (!overflowed) {
                store.addOrUpdate(key, page, function () {
                    updateSettings(page, pageBytes);
                    saveSettings(resolve, error);
                }, error);
            } else {
                resolve();
            }
        } else {
            updateSettings(page, 0);
            saveSettings(resolve, error);
        }
        return deferred;
    };

    /** Saves the cache's current settings to the local store.
     * @method DataCache~saveSettings    
     * @param {Function} success - Success callback.
     * @param {Function} error - Errror callback.
     */
    var saveSettings = function (success, error) {

        var settings = {
            actualCacheSize: actualCacheSize,
            allDataLocal: allDataLocal,
            cacheSize: cacheSize,
            collectionCount: collectionCount,
            highestSavedPage: highestSavedPage,
            highestSavedPageSize: highestSavedPageSize,
            pageSize: pageSize,
            sourceId: source.identifier,
            version: version
        };

        store.addOrUpdate("__settings", settings, success, error);
    };

    /** Creates a function that handles a store error.
     * @method DataCache~storeFailureCallback    
     * @param {DjsDeferred} deferred - Deferred object to resolve.
     * @returns {Function} Function to use as error callback.
    
     * This function will specifically handle problems when interacting with the store.
     */
    var storeFailureCallback = function (deferred/*, message*/) {
        

        return function (/*error*/) {
            // var console = windo1w.console;
            // if (console && console.log) {
            //    console.log(message);
            //    console.dir(error);
            // }
            deferred.resolve(false);
        };
    };

    /** Updates the cache's settings based on a page object.
     * @method DataCache~updateSettings    
     * @param {Object} page - Object with (i)ndex, (c)ount, (d)ata.
     * @param {Number} pageBytes - Size of the page in bytes.
     */
    var updateSettings = function (page, pageBytes) {

        var pageCount = page.c;
        var pageIndex = page.i;

        // Detect the collection size.
        if (pageCount === 0) {
            if (highestSavedPage === pageIndex - pageSize) {
                collectionCount = highestSavedPage + highestSavedPageSize;
            }
        } else {
            highestSavedPage = Math.max(highestSavedPage, pageIndex);
            if (highestSavedPage === pageIndex) {
                highestSavedPageSize = pageCount;
            }
            actualCacheSize += pageBytes;
            if (pageCount < pageSize && !collectionCount) {
                collectionCount = pageIndex + pageCount;
            }
        }

        // Detect the end of the collection.
        if (!allDataLocal && collectionCount === highestSavedPage + highestSavedPageSize) {
            allDataLocal = true;
        }
    };

    /** State machine describing the behavior for cancelling a read or prefetch operation.
     * @method DataCache~cancelStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
     * This state machine contains behavior common to read and prefetch operations.
     */
    var cancelStateMachine = function (operation, opTargetState, cacheState, data) {
        

        var canceled = operation.canceled && opTargetState !== OPERATION_STATE_END;
        if (canceled) {
            if (opTargetState === OPERATION_STATE_CANCEL) {
                // Cancel state.
                // Data is expected to be any pending request made to the cache.
                if (data && data.cancel) {
                    data.cancel();
                }
            }
        }
        return canceled;
    };

    /** State machine describing the behavior of a clear operation.
     * @method DataCache~destroyStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
    
     * Clear operations have the highest priority and can't be interrupted by other operations; however,
     * they will preempt any other operation currently executing.
     */
    var destroyStateMachine = function (operation, opTargetState, cacheState) {
        

        var transition = operation.transition;

        // Signal the cache that a clear operation is running.
        if (cacheState !== CACHE_STATE_DESTROY) {
            changeState(CACHE_STATE_DESTROY);
            return true;
        }

        switch (opTargetState) {
            case OPERATION_STATE_START:
                // Initial state of the operation.
                transition(DESTROY_STATE_CLEAR);
                break;

            case OPERATION_STATE_END:
                // State that signals the operation is done.
                fireOnIdle();
                break;

            case DESTROY_STATE_CLEAR:
                // State that clears all the local data of the cache.
                clearStore().then(function () {
                    // Terminate the operation once the local store has been cleared.
                    operation.complete();
                });
                // Wait until the clear request completes.
                operation.wait();
                break;

            default:
                return false;
        }
        return true;
    };

    /** State machine describing the behavior of a prefetch operation.
     * @method DataCache~prefetchStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
    
     *  Prefetch operations have the lowest priority and will be interrupted by operations of
     *  other kinds. A preempted prefetch operation will resume its execution only when the state
     *  of the cache returns to idle.
     * 
     *  If a clear operation starts executing then all the prefetch operations are canceled,
     *  even if they haven't started executing yet.
     */
    var prefetchStateMachine = function (operation, opTargetState, cacheState, data) {
        

        // Handle cancelation
        if (!cancelStateMachine(operation, opTargetState, cacheState, data)) {

            var transition = operation.transition;

            // Handle preemption
            if (cacheState !== CACHE_STATE_PREFETCH) {
                if (cacheState === CACHE_STATE_DESTROY) {
                    if (opTargetState !== OPERATION_STATE_CANCEL) {
                        operation.cancel();
                    }
                } else if (cacheState === CACHE_STATE_IDLE) {
                    // Signal the cache that a prefetch operation is running.
                    changeState(CACHE_STATE_PREFETCH);
                }
                return true;
            }

            switch (opTargetState) {
                case OPERATION_STATE_START:
                    // Initial state of the operation.
                    if (prefetchOperations[0] === operation) {
                        transition(READ_STATE_LOCAL, operation.i);
                    }
                    break;

                case READ_STATE_DONE:
                    // State that determines if the operation can be resolved or has to
                    // continue processing.
                    // Data is expected to be the read page.
                    var pending = operation.pending;

                    if (pending > 0) {
                        pending -= Math.min(pending, data.c);
                    }

                    // Are we done, or has all the data been stored?
                    if (allDataLocal || pending === 0 || data.c < pageSize || overflowed) {
                        operation.complete();
                    } else {
                        // Continue processing the operation.
                        operation.pending = pending;
                        transition(READ_STATE_LOCAL, data.i + pageSize);
                    }
                    break;

                default:
                    return readSaveStateMachine(operation, opTargetState, cacheState, data, true);
            }
        }
        return true;
    };

    /** State machine describing the behavior of a read operation.
     * @method DataCache~readStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
    
     * Read operations have a higher priority than prefetch operations, but lower than
     * clear operations. They will preempt any prefetch operation currently running
     * but will be interrupted by a clear operation.
     *          
     * If a clear operation starts executing then all the currently running
     * read operations are canceled. Read operations that haven't started yet will
     * wait in the start state until the destory operation finishes.
     */
    var readStateMachine = function (operation, opTargetState, cacheState, data) {
        

        // Handle cancelation
        if (!cancelStateMachine(operation, opTargetState, cacheState, data)) {

            var transition = operation.transition;

            // Handle preemption
            if (cacheState !== CACHE_STATE_READ && opTargetState !== OPERATION_STATE_START) {
                if (cacheState === CACHE_STATE_DESTROY) {
                    if (opTargetState !== OPERATION_STATE_START) {
                        operation.cancel();
                    }
                } else if (cacheState !== CACHE_STATE_WRITE) {
                    // Signal the cache that a read operation is running.
                    djsassert(state == CACHE_STATE_IDLE || state === CACHE_STATE_PREFETCH, "DataCache.readStateMachine() - cache is not on the read or idle state.");
                    changeState(CACHE_STATE_READ);
                }

                return true;
            }

            switch (opTargetState) {
                case OPERATION_STATE_START:
                    // Initial state of the operation.
                    // Wait until the cache is idle or prefetching.
                    if (cacheState === CACHE_STATE_IDLE || cacheState === CACHE_STATE_PREFETCH) {
                        // Signal the cache that a read operation is running.
                        changeState(CACHE_STATE_READ);
                        if (operation.c >= 0) {
                            // Snap the requested range to a page boundary.
                            var range = snapToPageBoundaries(operation.i, operation.c, pageSize);
                            transition(READ_STATE_LOCAL, range.i);
                        } else {
                            transition(READ_STATE_DONE, operation);
                        }
                    }
                    break;

                case READ_STATE_DONE:
                    // State that determines if the operation can be resolved or has to
                    // continue processing.
                    // Data is expected to be the read page.
                    appendPage(operation, data);
                    var len = getJsonValueArraryLength(operation.d);
                    // Are we done?
                    if (operation.c === len || data.c < pageSize) {
                        // Update the stats, request for a prefetch operation.
                        stats.cacheReads++;
                        prefetch(data.i + data.c);
                        // Terminate the operation.
                        operation.complete();
                    } else {
                        // Continue processing the operation.
                        transition(READ_STATE_LOCAL, data.i + pageSize);
                    }
                    break;

                default:
                    return readSaveStateMachine(operation, opTargetState, cacheState, data, false);
            }
        }

        return true;
    };

    /** State machine describing the behavior for reading and saving data into the cache.
     * @method DataCache~readSaveStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
     * @param {Boolean} isPrefetch - Flag indicating whether a read (false) or prefetch (true) operation is running.
     * This state machine contains behavior common to read and prefetch operations.
    */
    var readSaveStateMachine = function (operation, opTargetState, cacheState, data, isPrefetch) {

        var error = operation.error;
        var transition = operation.transition;
        var wait = operation.wait;
        var request;

        switch (opTargetState) {
            case OPERATION_STATE_END:
                // State that signals the operation is done.
                fireOnIdle();
                break;

            case READ_STATE_LOCAL:
                // State that requests for a page from the local store.
                // Data is expected to be the index of the page to request.
                request = readPage(data).then(function (found, page) {
                    // Signal the cache that a read operation is running.
                    if (!operation.canceled) {
                        if (found) {
                            // The page is in the local store, check if the operation can be resolved.
                            transition(READ_STATE_DONE, page);
                        } else {
                            // The page is not in the local store, request it from the source.
                            transition(READ_STATE_SOURCE, data);
                        }
                    }
                });
                break;

            case READ_STATE_SOURCE:
                // State that requests for a page from the cache source.
                // Data is expected to be the index of the page to request.
                request = fetchPage(data).then(function (page) {
                    // Signal the cache that a read operation is running.
                    if (!operation.canceled) {
                        // Update the stats and save the page to the local store.
                        if (isPrefetch) {
                            stats.prefetches++;
                        } else {
                            stats.netReads++;
                        }
                        transition(READ_STATE_SAVE, page);
                    }
                }, error);
                break;

            case READ_STATE_SAVE:
                // State that saves a  page to the local store.
                // Data is expected to be the page to save.
                // Write access to the store is exclusive.
                if (cacheState !== CACHE_STATE_WRITE) {
                    changeState(CACHE_STATE_WRITE);
                    request = savePage(data.i, data).then(function (saved) {
                        if (!operation.canceled) {
                            if (!saved && isPrefetch) {
                                operation.pending = 0;
                            }
                            // Check if the operation can be resolved.
                            transition(READ_STATE_DONE, data);
                        }
                        changeState(CACHE_STATE_IDLE);
                    });
                }
                break;

            default:
                // Unknown state that can't be handled by this state machine.
                return false;
        }

        if (request) {
            // The operation might have been canceled between stack frames do to the async calls.
            if (operation.canceled) {
                request.cancel();
            } else if (operation.s === opTargetState) {
                // Wait for the request to complete.
                wait(request);
            }
        }

        return true;
    };

    // Initialize the cache.
    store.read("__settings", function (_, settings) {
        if (assigned(settings)) {
            var settingsVersion = settings.version;
            if (!settingsVersion || settingsVersion.indexOf("1.") !== 0) {
                cacheFailureCallback("Unsupported cache store version " + settingsVersion)();
                return;
            }

            if (pageSize !== settings.pageSize || source.identifier !== settings.sourceId) {
                // The shape or the source of the data was changed so invalidate the store.
                clearStore().then(function () {
                    // Signal the cache is fully initialized.
                    changeState(CACHE_STATE_IDLE);
                }, cacheFailureCallback("Unable to clear store during initialization"));
            } else {
                // Restore the saved settings.
                actualCacheSize = settings.actualCacheSize;
                allDataLocal = settings.allDataLocal;
                cacheSize = settings.cacheSize;
                collectionCount = settings.collectionCount;
                highestSavedPage = settings.highestSavedPage;
                highestSavedPageSize = settings.highestSavedPageSize;
                version = settingsVersion;

                // Signal the cache is fully initialized.
                changeState(CACHE_STATE_IDLE);
            }
        } else {
            // This is a brand new cache.
            saveSettings(function () {
                // Signal the cache is fully initialized.
                changeState(CACHE_STATE_IDLE);
            }, cacheFailureCallback("Unable to write settings during initialization."));
        }
    }, cacheFailureCallback("Unable to read settings from store."));

    return that;
}

/** Creates a data cache for a collection that is efficiently loaded on-demand.
 * @param options 
 * Options for the data cache, including name, source, pageSize, TODO check doku
 * prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
 * @returns {DataCache} A new data cache instance.
 */
function createDataCache (options) {
    checkUndefinedGreaterThanZero(options.pageSize, "pageSize");
    checkUndefinedOrNumber(options.cacheSize, "cacheSize");
    checkUndefinedOrNumber(options.prefetchSize, "prefetchSize");

    if (!assigned(options.name)) {
        throw { message: "Undefined or null name", options: options };
    }

    if (!assigned(options.source)) {
        throw { message: "Undefined source", options: options };
    }

    return new DataCache(options);
}


/** estimateSize (see {@link estimateSize}) */
exports.estimateSize = estimateSize;

/** createDataCache */  
exports.createDataCache = createDataCache;



