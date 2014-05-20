/* {
    oldname:'cache.js',
    updated:'20140514 12:59'
}*/
/// <reference path="odata-utils.js" />

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

// cache.js




var utils = require('./datajs.js').utils;


var assigned = utils.assigned;
var delay = utils.delay;
var extend = utils.extend;
var djsassert = utils.djsassert;
var isArray = utils.isArray;
var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;
var undefinedDefault = utils.undefinedDefault;

var deferred = require('./datajs/deferred.js');

var createDeferred = deferred.createDeferred;
var DjsDeferred = deferred.DjsDeferred;
var ODataCacheSource = require('./cache/source').ODataCacheSource;

var getJsonValueArraryLength = utils.getJsonValueArraryLength;
var sliceJsonValueArray = utils.sliceJsonValueArray;
var concatJsonValueArray = utils.concatJsonValueArray;
var storeReq = require('./datajs.js').store;

// CONTENT START

var appendPage = function (operation, page) {
    /// <summary>Appends a page's data to the operation data.</summary>
    /// <param name="operation" type="Object">Operation with (i)ndex, (c)ount and (d)ata.</param>
    /// <param name="page" type="Object">Page with (i)ndex, (c)ount and (d)ata.</param>

    var intersection = intersectRanges(operation, page);
    var start = 0;
    var end = 0;
    if (intersection) {
        start = intersection.i - page.i;
        end = start + (operation.c - getJsonValueArraryLength(operation.d));
    }

    operation.d = concatJsonValueArray(operation.d, sliceJsonValueArray(page.d, start, end));
};

var intersectRanges = function (x, y) {
    /// <summary>Returns the {(i)ndex, (c)ount} range for the intersection of x and y.</summary>
    /// <param name="x" type="Object">Range with (i)ndex and (c)ount members.</param>
    /// <param name="y" type="Object">Range with (i)ndex and (c)ount members.</param>
    /// <returns type="Object">The intersection (i)ndex and (c)ount; undefined if there is no intersection.</returns>

    var xLast = x.i + x.c;
    var yLast = y.i + y.c;
    var resultIndex = (x.i > y.i) ? x.i : y.i;
    var resultLast = (xLast < yLast) ? xLast : yLast;
    var result;
    if (resultLast >= resultIndex) {
        result = { i: resultIndex, c: resultLast - resultIndex };
    }

    return result;
};

var checkZeroGreater = function (val, name) {
    /// <summary>Checks whether val is a defined number with value zero or greater.</summary>
    /// <param name="val" type="Number">Value to check.</param>
    /// <param name="name" type="String">Parameter name to use in exception.</param>

    if (val === undefined || typeof val !== "number") {
        throw { message: "'" + name + "' must be a number." };
    }

    if (isNaN(val) || val < 0 || !isFinite(val)) {
        throw { message: "'" + name + "' must be greater than or equal to zero." };
    }
};

var checkUndefinedGreaterThanZero = function (val, name) {
    /// <summary>Checks whether val is undefined or a number with value greater than zero.</summary>
    /// <param name="val" type="Number">Value to check.</param>
    /// <param name="name" type="String">Parameter name to use in exception.</param>

    if (val !== undefined) {
        if (typeof val !== "number") {
            throw { message: "'" + name + "' must be a number." };
        }

        if (isNaN(val) || val <= 0 || !isFinite(val)) {
            throw { message: "'" + name + "' must be greater than zero." };
        }
    }
};

var checkUndefinedOrNumber = function (val, name) {
    /// <summary>Checks whether val is undefined or a number</summary>
    /// <param name="val" type="Number">Value to check.</param>
    /// <param name="name" type="String">Parameter name to use in exception.</param>
    if (val !== undefined && (typeof val !== "number" || isNaN(val) || !isFinite(val))) {
        throw { message: "'" + name + "' must be a number." };
    }
};

var removeFromArray = function (arr, item) {
    /// <summary>Performs a linear search on the specified array and removes the first instance of 'item'.</summary>
    /// <param name="arr" type="Array">Array to search.</param>
    /// <param name="item">Item being sought.</param>
    /// <returns type="Boolean">Whether the item was removed.</returns>

    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === item) {
            arr.splice(i, 1);
            return true;
        }
    }

    return false;
};

var estimateSize = function (obj) {
    /// <summary>Estimates the size of an object in bytes.</summary>
    /// <param name="obj" type="Object">Object to determine the size of.</param>
    /// <returns type="Integer">Estimated size of the object in bytes.</returns>
    var size = 0;
    var type = typeof obj;

    if (type === "object" && obj) {
        for (var name in obj) {
            size += name.length * 2 + estimateSize(obj[name]);
        }
    } else if (type === "string") {
        size = obj.length * 2;
    } else {
        size = 8;
    }
    return size;
};

var snapToPageBoundaries = function (lowIndex, highIndex, pageSize) {
    /// <summary>Snaps low and high indices into page sizes and returns a range.</summary>
    /// <param name="lowIndex" type="Number">Low index to snap to a lower value.</param>
    /// <param name="highIndex" type="Number">High index to snap to a higher value.</param>
    /// <param name="pageSize" type="Number">Page size to snap to.</param>
    /// <returns type="Object">A range with (i)ndex and (c)ount of elements.</returns>

    lowIndex = Math.floor(lowIndex / pageSize) * pageSize;
    highIndex = Math.ceil((highIndex + 1) / pageSize) * pageSize;
    return { i: lowIndex, c: highIndex - lowIndex };
};

// The DataCache is implemented using state machines.  The following constants are used to properly
// identify and label the states that these machines transition to.

// DataCache state constants

var CACHE_STATE_DESTROY = "destroy";
var CACHE_STATE_IDLE = "idle";
var CACHE_STATE_INIT = "init";
var CACHE_STATE_READ = "read";
var CACHE_STATE_PREFETCH = "prefetch";
var CACHE_STATE_WRITE = "write";

// DataCacheOperation state machine states.
// Transitions on operations also depend on the cache current of the cache.

var OPERATION_STATE_CANCEL = "cancel";
var OPERATION_STATE_END = "end";
var OPERATION_STATE_ERROR = "error";
var OPERATION_STATE_START = "start";
var OPERATION_STATE_WAIT = "wait";

// Destroy state machine states

var DESTROY_STATE_CLEAR = "clear";

// Read / Prefetch state machine states

var READ_STATE_DONE = "done";
var READ_STATE_LOCAL = "local";
var READ_STATE_SAVE = "save";
var READ_STATE_SOURCE = "source";

var DataCacheOperation = function (stateMachine, promise, isCancelable, index, count, data, pending) {
    /// <summary>Creates a new operation object.</summary>
    /// <param name="stateMachine" type="Function">State machine that describes the specific behavior of the operation.</param>
    /// <param name="promise" type ="DjsDeferred">Promise for requested values.</param>
    /// <param name="isCancelable" type ="Boolean">Whether this operation can be canceled or not.</param>
    /// <param name="index" type="Number">Index of first item requested.</param>
    /// <param name="count" type="Number">Count of items requested.</param>
    /// <param name="data" type="Array">Array with the items requested by the operation.</param>
    /// <param name="pending" type="Number">Total number of pending prefetch records.</param>
    /// <returns type="DataCacheOperation">A new data cache operation instance.</returns>

    /// <field name="p" type="DjsDeferred">Promise for requested values.</field>
    /// <field name="i" type="Number">Index of first item requested.</field>
    /// <field name="c" type="Number">Count of items requested.</field>
    /// <field name="d" type="Array">Array with the items requested by the operation.</field>
    /// <field name="s" type="Array">Current state of the operation.</field>
    /// <field name="canceled" type="Boolean">Whether the operation has been canceled.</field>
    /// <field name="pending" type="Number">Total number of pending prefetch records.</field>
    /// <field name="oncomplete" type="Function">Callback executed when the operation reaches the end state.</field>

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

    that.cancel = function () {
        /// <summary>Transitions this operation to the cancel state and sets the canceled flag to true.</summary>
        /// <remarks>The function is a no-op if the operation is non-cancelable.</summary>

        if (!isCancelable) {
            return;
        }

        var state = that.s;
        if (state !== OPERATION_STATE_ERROR && state !== OPERATION_STATE_END && state !== OPERATION_STATE_CANCEL) {
            that.canceled = true;
            transition(OPERATION_STATE_CANCEL, stateData);
        }
    };

    that.complete = function () {
        /// <summary>Transitions this operation to the end state.</summary>

        djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.complete() - operation is in the end state", that);
        transition(OPERATION_STATE_END, stateData);
    };

    that.error = function (err) {
        /// <summary>Transitions this operation to the error state.</summary>
        if (!that.canceled) {
            djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.error() - operation is in the end state", that);
            djsassert(that.s !== OPERATION_STATE_ERROR, "DataCacheOperation.error() - operation is in the error state", that);
            transition(OPERATION_STATE_ERROR, err);
        }
    };

    that.run = function (state) {
        /// <summary>Executes the operation's current state in the context of a new cache state.</summary>
        /// <param name="state" type="Object">New cache state.</param>

        cacheState = state;
        that.transition(that.s, stateData);
    };

    that.wait = function (data) {
        /// <summary>Transitions this operation to the wait state.</summary>

        djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.wait() - operation is in the end state", that);
        transition(OPERATION_STATE_WAIT, data);
    };

    var operationStateMachine = function (opTargetState, cacheState, data) {
        /// <summary>State machine that describes all operations common behavior.</summary>
        /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
        /// <param name="cacheState" type="Object">Current cache state.</param>
        /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param>

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
                transition(OPERATION_STATE_END);
                break;

            case OPERATION_STATE_ERROR:
                // Error state. Data is expected to be an object detailing the error condition.
                stateMachine(that, opTargetState, cacheState, data);
                that.canceled = true;
                that.fireRejected(data);
                transition(OPERATION_STATE_END);
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
                // DATAJS INTERNAL START 
                if (true) {
                    // Check that the state machine actually handled the sate.
                    var handled = stateMachine(that, opTargetState, cacheState, data);
                    djsassert(handled, "Bad operation state: " + opTargetState + " cacheState: " + cacheState, this);
                } else {
                    // DATAJS INTERNAL END 
                    stateMachine(that, opTargetState, cacheState, data);
                    // DATAJS INTERNAL START
                }
                // DATAJS INTERNAL END
                break;
        }
    };

    var transition = function (state, data) {
        /// <summary>Transitions this operation to a new state.</summary>
        /// <param name="state" type="Object">State to transition the operation to.</param>
        /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param>

        that.s = state;
        stateData = data;
        operationStateMachine(state, cacheState, data);
    };

    that.transition = transition;

    return that;
};

DataCacheOperation.prototype.fireResolved = function () {
    /// <summary>Fires a resolved notification as necessary.</summary>

    // Fire the resolve just once.
    var p = this.p;
    if (p) {
        this.p = null;
        p.resolve(this.d);
    }
};

DataCacheOperation.prototype.fireRejected = function (reason) {
    /// <summary>Fires a rejected notification as necessary.</summary>

    // Fire the rejection just once.
    var p = this.p;
    if (p) {
        this.p = null;
        p.reject(reason);
    }
};

DataCacheOperation.prototype.fireCanceled = function () {
    /// <summary>Fires a canceled notification as necessary.</summary>

    this.fireRejected({ canceled: true, message: "Operation canceled" });
};


var DataCache = function (options) {
    /// <summary>Creates a data cache for a collection that is efficiently loaded on-demand.</summary>
    /// <param name="options">
    /// Options for the data cache, including name, source, pageSize,
    /// prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
    /// </param>
    /// <returns type="DataCache">A new data cache instance.</returns>

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
        source = new ODataCacheSource(options);
    }
    source.options = options;

    // Create a cache local store.
    var store = storeReq.createStore(options.name, options.mechanism);

    var that = this;

    that.onidle = options.idle;
    that.stats = stats;

    that.count = function () {
        /// <summary>Counts the number of items in the collection.</summary>
        /// <returns type="Object">A promise with the number of items.</returns>

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
            cancel: function () {
                /// <summary>Aborts the count operation.</summary>
                if (request) {
                    canceled = true;
                    request.abort();
                    request = null;
                }
            }
        });
    };

    that.clear = function () {
        /// <summary>Cancels all running operations and clears all local data associated with this cache.</summary>
        /// <remarks>
        /// New read requests made while a clear operation is in progress will not be canceled.
        /// Instead they will be queued for execution once the operation is completed.
        /// </remarks>
        /// <returns type="Object">A promise that has no value and can't be canceled.</returns>

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

    that.filterForward = function (index, count, predicate) {
        /// <summary>Filters the cache data based a predicate.</summary>
        /// <param name="index" type="Number">The index of the item to start filtering forward from.</param>
        /// <param name="count" type="Number">Maximum number of items to include in the result.</param>
        /// <param name="predicate" type="Function">Callback function returning a boolean that determines whether an item should be included in the result or not.</param>
        /// <remarks>
        /// Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
        /// </remarks>
        /// <returns type="DjsDeferred">A promise for an array of results.</returns>
        return filter(index, count, predicate, false);
    };

    that.filterBack = function (index, count, predicate) {
        /// <summary>Filters the cache data based a predicate.</summary>
        /// <param name="index" type="Number">The index of the item to start filtering backward from.</param>
        /// <param name="count" type="Number">Maximum number of items to include in the result.</param>
        /// <param name="predicate" type="Function">Callback function returning a boolean that determines whether an item should be included in the result or not.</param>
        /// <remarks>
        /// Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
        /// </remarks>
        /// <returns type="DjsDeferred">A promise for an array of results.</returns>
        return filter(index, count, predicate, true);
    };

    that.readRange = function (index, count) {
        /// <summary>Reads a range of adjacent records.</summary>
        /// <param name="index" type="Number">Zero-based index of record range to read.</param>
        /// <param name="count" type="Number">Number of records in the range.</param>
        /// <remarks>
        /// New read requests made while a clear operation is in progress will not be canceled.
        /// Instead they will be queued for execution once the operation is completed.
        /// </remarks>
        /// <returns type="DjsDeferred">
        /// A promise for an array of records; less records may be returned if the
        /// end of the collection is found.
        /// </returns>

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
                /// <summary>Aborts the readRange operation.</summary>
                op.cancel();
            }
        });
    };

    that.ToObservable = that.toObservable = function () {
        /// <summary>Creates an Observable object that enumerates all the cache contents.</summary>
        /// <returns>A new Observable object that enumerates all the cache contents.</returns>
        if (!window.Rx || !window.Rx.Observable) {
            throw { message: "Rx library not available - include rx.js" };
        }

        if (cacheFailure) {
            throw cacheFailure;
        }

        return window.Rx.Observable.CreateWithDisposable(function (obs) {
            var disposed = false;
            var index = 0;

            var errorCallback = function (error) {
                if (!disposed) {
                    obs.OnError(error);
                }
            };

            var successCallback = function (data) {
                if (!disposed) {
                    var i, len;
                    for (i = 0, len = data.value.length; i < len; i++) {
                        // The wrapper automatically checks for Dispose
                        // on the observer, so we don't need to check it here.
                        obs.OnNext(data.value[i]);
                    }

                    if (data.value.length < pageSize) {
                        obs.OnCompleted();
                    } else {
                        index += pageSize;
                        that.readRange(index, pageSize).then(successCallback, errorCallback);
                    }
                }
            };

            that.readRange(index, pageSize).then(successCallback, errorCallback);

            return { Dispose: function () { disposed = true; } };
        });
    };

    var cacheFailureCallback = function (message) {
        /// <summary>Creates a function that handles a callback by setting the cache into failure mode.</summary>
        /// <param name="message" type="String">Message text.</param>
        /// <returns type="Function">Function to use as error callback.</returns>
        /// <remarks>
        /// This function will specifically handle problems with critical store resources
        /// during cache initialization.
        /// </remarks>

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

    var changeState = function (newState) {
        /// <summary>Updates the cache's state and signals all pending operations of the change.</summary>
        /// <param name="newState" type="Object">New cache state.</param>
        /// <remarks>This method is a no-op if the cache's current state and the new state are the same.</remarks>

        if (newState !== state) {
            state = newState;
            var operations = clearOperations.concat(readOperations, prefetchOperations);
            var i, len;
            for (i = 0, len = operations.length; i < len; i++) {
                operations[i].run(state);
            }
        }
    };

    var clearStore = function () {
        /// <summary>Removes all the data stored in the cache.</summary>
        /// <returns type="DjsDeferred">A promise with no value.</returns>
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

    var dequeueOperation = function (operation) {
        /// <summary>Removes an operation from the caches queues and changes the cache state to idle.</summary>
        /// <param name="operation" type="DataCacheOperation">Operation to dequeue.</param>
        /// <remarks>This method is used as a handler for the operation's oncomplete event.</remarks>

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

    var fetchPage = function (start) {
        /// <summary>Requests data from the cache source.</summary>
        /// <param name="start" type="Number">Zero-based index of items to request.</param>
        /// <returns type="DjsDeferred">A promise for a page object with (i)ndex, (c)ount, (d)ata.</returns>

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

    var filter = function (index, count, predicate, backwards) {
        /// <summary>Filters the cache data based a predicate.</summary>
        /// <param name="index" type="Number">The index of the item to start filtering from.</param>
        /// <param name="count" type="Number">Maximum number of items to include in the result.</param>
        /// <param name="predicate" type="Function">Callback function returning a boolean that determines whether an item should be included in the result or not.</param>
        /// <param name="backwards" type="Boolean">True if the filtering should move backward from the specified index, falsey otherwise.</param>
        /// <remarks>
        /// Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
        /// </remarks>
        /// <returns type="DjsDeferred">A promise for an array of results.</returns>
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
            cancel: function () {
                /// <summary>Aborts the filter operation</summary>
                if (pendingReadRange) {
                    pendingReadRange.cancel();
                }
                canceled = true;
            }
        });
    };

    var fireOnIdle = function () {
        /// <summary>Fires an onidle event if any functions are assigned.</summary>

        if (that.onidle && pendingOperations === 0) {
            that.onidle();
        }
    };

    var prefetch = function (start) {
        /// <summary>Creates and starts a new prefetch operation.</summary>
        /// <param name="start" type="Number">Zero-based index of the items to prefetch.</param>
        /// <remarks>
        /// This method is a no-op if any of the following conditions is true:
        ///     1.- prefetchSize is 0
        ///     2.- All data has been read and stored locally in the cache.
        ///     3.- There is already an all data prefetch operation queued.
        ///     4.- The cache has run out of available space (overflowed).
        /// <remarks>

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

    var queueAndStart = function (op, queue) {
        /// <summary>Queues an operation and runs it.</summary>
        /// <param name="op" type="DataCacheOperation">Operation to queue.</param>
        /// <param name="queue" type="Array">Array that will store the operation.</param>

        op.oncomplete = dequeueOperation;
        queue.push(op);
        pendingOperations++;
        op.run(state);
    };

    var readPage = function (key) {
        /// <summary>Requests a page from the cache local store.</summary>
        /// <param name="key" type="Number">Zero-based index of the reuqested page.</param>
        /// <returns type="DjsDeferred">A promise for a found flag and page object with (i)ndex, (c)ount, (d)ata, and (t)icks.</returns>

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.readPage() - cache is on the destroy state");

        var canceled = false;
        var deferred = extend(new DjsDeferred(), {
            cancel: function () {
                /// <summary>Aborts the readPage operation.</summary>
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

    var savePage = function (key, page) {
        /// <summary>Saves a page to the cache local store.</summary>
        /// <param name="key" type="Number">Zero-based index of the requested page.</param>
        /// <param name="page" type="Object">Object with (i)ndex, (c)ount, (d)ata, and (t)icks.</param>
        /// <returns type="DjsDeferred">A promise with no value.</returns>

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.savePage() - cache is on the destroy state");
        djsassert(state !== CACHE_STATE_IDLE, "DataCache.savePage() - cache is on the idle state");

        var canceled = false;

        var deferred = extend(new DjsDeferred(), {
            cancel: function () {
                /// <summary>Aborts the readPage operation.</summary>
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

    var saveSettings = function (success, error) {
        /// <summary>Saves the cache's current settings to the local store.</summary>
        /// <param name="success" type="Function">Success callback.</param>
        /// <param name="error" type="Function">Errror callback.</param>

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

    var storeFailureCallback = function (deferred/*, message*/) {
        /// <summary>Creates a function that handles a store error.</summary>
        /// <param name="deferred" type="DjsDeferred">Deferred object to resolve.</param>
        /// <param name="message" type="String">Message text.</param>
        /// <returns type="Function">Function to use as error callback.</returns>
        /// <remarks>
        /// This function will specifically handle problems when interacting with the store.
        /// </remarks>

        return function (/*error*/) {
            // var console = window.console;
            // if (console && console.log) {
            //    console.log(message);
            //    console.dir(error);
            // }
            deferred.resolve(false);
        };
    };

    var updateSettings = function (page, pageBytes) {
        /// <summary>Updates the cache's settings based on a page object.</summary>
        /// <param name="page" type="Object">Object with (i)ndex, (c)ount, (d)ata.</param>
        /// <param name="pageBytes" type="Number">Size of the page in bytes.</param>

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

    var cancelStateMachine = function (operation, opTargetState, cacheState, data) {
        /// <summary>State machine describing the behavior for cancelling a read or prefetch operation.</summary>
        /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
        /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
        /// <param name="cacheState" type="Object">Current cache state.</param>
        /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param>
        /// <remarks>
        /// This state machine contains behavior common to read and prefetch operations.
        /// </remarks>

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

    var destroyStateMachine = function (operation, opTargetState, cacheState) {
        /// <summary>State machine describing the behavior of a clear operation.</summary>
        /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
        /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
        /// <param name="cacheState" type="Object">Current cache state.</param>
        /// <remarks>
        /// Clear operations have the highest priority and can't be interrupted by other operations; however,
        /// they will preempt any other operation currently executing.
        /// </remarks>

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

    var prefetchStateMachine = function (operation, opTargetState, cacheState, data) {
        /// <summary>State machine describing the behavior of a prefetch operation.</summary>
        /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
        /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
        /// <param name="cacheState" type="Object">Current cache state.</param>
        /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param>
        /// <remarks>
        /// Prefetch operations have the lowest priority and will be interrupted by operations of
        /// other kinds. A preempted prefetch operation will resume its execution only when the state
        /// of the cache returns to idle.
        ///
        /// If a clear operation starts executing then all the prefetch operations are canceled,
        /// even if they haven't started executing yet.
        /// </remarks>

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

    var readStateMachine = function (operation, opTargetState, cacheState, data) {
        /// <summary>State machine describing the behavior of a read operation.</summary>
        /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
        /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
        /// <param name="cacheState" type="Object">Current cache state.</param>
        /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param>
        /// <remarks>
        /// Read operations have a higher priority than prefetch operations, but lower than
        /// clear operations. They will preempt any prefetch operation currently running
        /// but will be interrupted by a clear operation.
        ///
        /// If a clear operation starts executing then all the currently running
        /// read operations are canceled. Read operations that haven't started yet will
        /// wait in the start state until the destory operation finishes.
        /// </remarks>

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

    var readSaveStateMachine = function (operation, opTargetState, cacheState, data, isPrefetch) {
        /// <summary>State machine describing the behavior for reading and saving data into the cache.</summary>
        /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
        /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
        /// <param name="cacheState" type="Object">Current cache state.</param>
        /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param>
        /// <param name="isPrefetch" type="Boolean">Flag indicating whether a read (false) or prefetch (true) operation is running.
        /// <remarks>
        /// This state machine contains behavior common to read and prefetch operations.
        /// </remarks>

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
};

exports.createDataCache = function (options) {
    /// <summary>Creates a data cache for a collection that is efficiently loaded on-demand.</summary>
    /// <param name="options">
    /// Options for the data cache, including name, source, pageSize,
    /// prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
    /// </param>
    /// <returns type="DataCache">A new data cache instance.</returns>
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
};

// DATAJS INTERNAL START
//window.datajs.estimateSize = estimateSize;
exports.estimateSize = estimateSize;
// DATAJS INTERNAL END
