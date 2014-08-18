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

var init = function (window) {
    var djstest = {};


    djstest.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.indexedDB;

    djstest.cleanStoreOnIndexedDb = function (storeObjects, done) {
        /** Cleans all the test data saved in the IndexedDb database.
         * @param {Array} storeNames - Array of store objects with a property that is the name of the store
         * @param {Function} done - Callback function
         */

        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {};

        var deleteObjectStores = function (db) {
            $.each(db.objectStoreNames, function (_, storeName) {
                db.deleteObjectStore(storeName);
            });
        };

        if (djstest.indexedDB) {
            var job = new djstest.Job();
            $.each(storeObjects, function (_, storeObject) {
                job.queue((function (storeObject) {
                    return function (success, fail) {
                        var dbname = "_datajs_" + storeObject.name;
                        var request = djstest.indexedDB.open(dbname);
                        request.onsuccess = function (event) {
                            var db = request.result;

                            if ("setVersion" in db) {
                                var versionRequest = db.setVersion("0.1");
                                versionRequest.onsuccess = function (event) {
                                    var transaction = versionRequest.transaction;
                                    transaction.oncomplete = function () {
                                        db.close();
                                        success();
                                    }
                                    deleteObjectStores(db);
                                };
                                versionRequest.onerror = function (e) {
                                    djstest.fail("Error on cleanup - code: " + e.code + " name: " + e.name + "message: " + message);
                                    fail();
                                };
                                return;
                            }

                            // new api cleanup
                            db.close();
                            var deleteRequest = djstest.indexedDB.deleteDatabase(dbname);
                            deleteRequest.onsuccess = function (event) {
                                djstest.log("djstest indexeddb cleanup - deleted database " + dbname);
                                success();
                            };
                            deleteRequest.onerror = function (e) {
                                djstest.fail("djstest indexeddb cleanup - error deleting database " + dbname);
                                fail();
                            };
                            djstest.log("djstest indexeddb cleanup - requested deletion of database " + dbname);
                        };

                        request.onerror = function (e) {
                            djstest.fail(e.code + ": " + e.message);
                        };
                    };
                })(storeObject));
            });
        }

        if (job) {
            job.run(function (succeeded) {
                if (!succeeded) {
                    djstest.fail("cleanup job failed");
                }
                done();
            });
        }
        else {
            done();
        }
    };

    djstest.Job = function () {
        /** Constructs a Job object that allows for enqueuing and synchronizing the execution of functions.
         * @returns {Object} Job object
         */
        var currentTask = -1;
        var tasks = [];

        var failedTasks = 0;

        this.queue = function (fn) {
            /** Adds a function to the job queue regardless if the queue is already executing or not.
             * @param {Function} fn - Function to execute.
             */
            tasks.push(fn);
        };

        this.queueNext = function (fn) {
            /** Adds a function to the front of the job queue regardless if the queue is already executing or not.
             * @param {Function} fn - Function to execute.
             */
            if (currentTask < 0) {
                tasks.unshift(fn);
            } else {
                tasks.splice(currentTask + 1, 0, fn);
            }
        };

        this.run = function (done) {
            /** Starts the execution of this job.
             * @param {Function} done - Callback invoked when the job has finished executing all of its enqueued tasks.
            */
            /// This method does nothing if called on a unit of work that is already executing.
            

            if (currentTask >= 0) {
                return;
            }

            if (tasks.length === 0) {
                done(true);
                return;
            }

            var makeTaskDoneCallBack = function (failed) {
                return function () {
                    // Track the failed task and continue the execution of the job. 
                    if (failed) {
                        failedTasks++;
                    }
                    currentTask++;
                    if (currentTask === tasks.length) {
                        done(failedTasks === 0);
                    } else {
                        runNextTask();
                    }
                };
            };

            var runNextTask = function () {
                /** Executes the next function in the queue.
                */
                defer(function () {
                    try {
                        tasks[currentTask](makeTaskDoneCallBack(false), makeTaskDoneCallBack(true));
                    } catch (e) {
                        makeTaskDoneCallBack(true)();
                    }
                });
            };

            currentTask = 0;
            runNextTask();
        };
    };

    var defer = function (fn) {
        /** Defers the execution of an arbitrary function that takes no parameters.
         * @param {Function} fn - Function to schedule for later execution.
         */
        setTimeout(fn, 0);
    }

    var exposeDateValues = function (data) {
        /** Exposes date values for Date objects to facilitate debugging
         * @param {Object} data - The object to operate on
         */
        if (typeof data === "object") {
            if (data instanceof Date) {
                data["__date__"] = data.toUTCString();
            }
            else {
                for (var prop in data) {
                    exposeDateValues(data[prop]);
                }
            }
        }

        return data;
    }

    var extractFunctionName = function (text) {
        /** Determines the name of a function.
         * @param {String} text - Function text.
         * @returns {String} The name of the function from text if found; the original text otherwise.
         */
        var index = text.indexOf("function ");
        if (index < 0) {
            return text;
        }

        var nameStart = index + "function ".length;
        var parensIndex = text.indexOf("(", nameStart);
        if (parensIndex < 0) {
            return text;
        }

        var result = text.substr(nameStart, parensIndex - nameStart);
        if (result.indexOf("test") === 0) {
            result = result.substr("test".length);
        }

        return result;
    };

    var removeMetadata = function (data) {
        /** Removes metadata annotations from the specified object.
         * @param data - Object to remove metadata from; possibly null.
         */
        if (typeof data === "object" && data !== null) {
            delete data["__metadata"];
            for (prop in data) {
                removeMetadata(data[prop]);
            }
        }
    };

    djstest.addFullTest = function (disable, fn, name, arg, timeout) {
        /** Add the unit test cases
         * @param disable - Indicate whether this test case should be disabled
        */
        if (disable != true) {
            djstest.addTest(fn, name, arg, timeout);
        }
    };


    djstest.addTest = function (fn, name, arg, timeout) {
        if (!name) {
            name = extractFunctionName(fn.toString());
        }

        test(name, function () {
            if (!timeout) {
                timeout = 20000;
            }

            QUnit.config.testTimeout = timeout;
            QUnit.stop();
            fn.call(this, arg);
        });
    };

    djstest.assert = function (test, message) {
        /** Asserts that a condition is true.
         * @param {Boolean} test - Condition to test.
         * @param {String} message - Text message for condition being tested.
         */
        QUnit.ok(test, message);
    };

    djstest.assertAreEqual = function (actual, expected, message) {
        /** Asserts that the values of the expected and actualobjects are equal.
        */
        QUnit.equal(actual, expected, message);
    };

    djstest.assertAreEqualDeep = function (actual, expected, message) {
        /** Asserts that the actual and expected objects are the same.
        */
        QUnit.deepEqual(exposeDateValues(actual), exposeDateValues(expected), message);
    };

    djstest.assertWithoutMetadata = function (actual, expected, message) {
        removeMetadata(actual)
        removeMetadata(expected);
        djstest.assertAreEqualDeep(actual, expected, message);
    };

    djstest.asyncDo = function (asyncActions, done) {
        /** Calls each async action in asyncActions, passing each action a function which keeps a count and
         * calls the passed done function when all async actions complete
         * @param {Array} asyncActions -Array of asynchronous actions to be executed, 
         * each taking a single parameter - the callback function to call when the action is done.</param>
         * @param {Function} done - Function to be executed in the last async action to complete.
         */
        var count = 0;
        var doneOne = function () {
            count++;
            if (count >= asyncActions.length) {
                done();
            }
        };

        if (asyncActions.length > 0) {
            $.each(asyncActions, function (_, asyncAction) {
                asyncAction(doneOne);
            });
        } else {
            done();
        }
    }

    djstest.clone = function (object) {
        /** Makes a deep copy of an object.
        */
        return $.extend(true, {}, object);
    };

    djstest.destroyCacheAndDone = function (cache) {
        /** Destroys the cache and then completes the test
        * @param cache - The cache to destroy
        */
        cache.clear().then(function () {
            djstest.done();
        }, function (err) {
            djstest.fail("Failed to destroy cache: " + djstest.toString(err));
            djstest.done();
        });
    };

    djstest.done = function () {
        /** Indicates that the currently running test has finished.
        */
        QUnit.start();
    };

    djstest.expectException = function (testFunction, message) {
        /** Test passes if and only if an exception is thrown.
        */
        try {
            testFunction();
            djstest.fail("Expected exception but function succeeded: " + " " + message);
        }
        catch (e) {
            // Swallow exception.
            djstest.pass("Thrown exception expected");
        }
    };

    djstest.assertsExpected = function (asserts) {
        /** Indicates the expected number of asserts, fails test if number is not met.
         * @param {Number} asserts - Number of asserts expected in test.
         */
        expect(asserts);
    }

    djstest.fail = function (message) {
        /** Marks the current test as failed.
         * @param {String} message - Failure message.
         */
        QUnit.ok(false, message);
    };

    djstest.failAndDoneCallback = function (message, cleanupCallback) {
        /** Returns a function that when invoked will fail this test and be done with it.
         * @param {String} message - Failure message.
         * @param {Function} [cleanupCallback] - 
         * @returns {Function} A new function.
        */
        return function (err) {
            message = "" + message + (err) ? window.JSON.stringify(err) : "";
            djstest.fail(message);
            if (cleanupCallback) {
                try {
                    cleanupCallback();
                } catch (e) {
                    djstest.fail("error during cleanupCallback: " + window.JSON.stringify(e));
                }
            }

            djstest.done();
        };
    };

    djstest.log = function (message) {
        /** Logs a test message.
         * @param {String} message - Test message.
         */
        var context = { result: true, actual: true, expected: true, message: message };
        QUnit.log(context);
    };

    djstest.pass = function (message) {
        /** Marks the current test as failed.
         * @param {String} message - Failure message.
         */
        QUnit.ok(true, message);
    };

    djstest.toString = function (obj) {
        /** Dumps the object as a string
         * @param {Object} obj - Object to dump
         */
        return QUnit.jsDump.parse(obj);
    };

    djstest.wait = function (fn) {
        /** Executes the function, pausing test execution until the callback is called
         * @param {Function} fn - Function to execute; takes one parameter which is the callback
         * This function is typically used in asynchronous setup/teardown methods</remarks>
         */
        QUnit.stop();
        fn(function () {
            QUnit.start();
        });
    };

    // Disable caching to ensure that every test-related AJAX request is actually being sent,
    // and set up a default error handler
    if (window !== undefined) {//TODO improve
        $.ajaxSetup({
            cache: false,
            error: function (jqXHR, textStatus, errorThrown) {
                // Work around bug in IE-Mobile on Windows Phone 7
                if (jqXHR.status !== 1223) {
                    var err = {
                        status: jqXHR.status,
                        statusText: jqXHR.statusText,
                        responseText: jqXHR.responseText
                    };
                    djstest.fail("AJAX request failed with: " + djstest.toString(err));
                }
                djstest.done();
            }
        });
    }

    return djstest;
};

if (typeof window !== 'undefined') {
    //in browser call init() directly window as context
    window.djstest = init(window);
} else {
    //expose function init to be called with a custom context
    module.exports.init = init;
}

