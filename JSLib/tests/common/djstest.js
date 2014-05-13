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

(function (window, undefined) {
    var djstest = {};

    window.djstest = djstest;

    djstest.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.indexedDB;

    djstest.cleanStoreOnIndexedDb = function (storeObjects, done) {
        /// <summary>Cleans all the test data saved in the IndexedDb database.</summary>
        /// <param name="storeNames" type="Array">Array of store objects with a property that is the name of the store</param>
        /// <param name="done" type="Function">Callback function</param>

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
        /// <summary>Constructs a Job object that allows for enqueuing and synchronizing the execution of functions.</summary>
        /// <returns type="Object">Job object</returns>
        var currentTask = -1;
        var tasks = [];

        var failedTasks = 0;

        this.queue = function (fn) {
            /// <summary>Adds a function to the job queue regardless if the queue is already executing or not.</summary>
            /// <param name="fn" type="Function">Function to execute.</param>
            tasks.push(fn);
        };

        this.queueNext = function (fn) {
            /// <summary>Adds a function to the front of the job queue regardless if the queue is already executing or not.</summary>
            /// <param name="fn" type="Function">Function to execute.</param>
            if (currentTask < 0) {
                tasks.unshift(fn);
            } else {
                tasks.splice(currentTask + 1, 0, fn);
            }
        };

        this.run = function (done) {
            /// <summary>Starts the execution of this job.</summary>
            /// <param name="done" type="Function">Callback invoked when the job has finished executing all of its enqueued tasks.</param>
            /// <remarks>
            /// This method does nothing if called on a unit of work that is already executing.
            /// </remarks>

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
                /// <summary>Executes the next function in the queue.</summary>
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
        /// <summary>Defers the execution of an arbitrary function that takes no parameters.</summary>
        /// <param name="fn" type="Function">Function to schedule for later execution.</param>
        setTimeout(fn, 0);
    }

    var exposeDateValues = function (data) {
        /// <summary>Exposes date values for Date objects to facilitate debugging</summary>
        /// <param name="data" type="Object">The object to operate on</param>
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
        /// <summary>Determines the name of a function.</summary>
        /// <param name="text" type="String">Function text.</param>
        /// <returns type="String">The name of the function from text if found; the original text otherwise.</returns>

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
        /// <summary>Removes metadata annotations from the specified object.</summary>
        /// <param name="data">Object to remove metadata from; possibly null.</param>

        if (typeof data === "object" && data !== null) {
            delete data["__metadata"];
            for (prop in data) {
                removeMetadata(data[prop]);
            }
        }
    };

    djstest.addFullTest = function (disable, fn, name, arg, timeout) {
        /// <summary>Add the unit test cases</summary>
        /// <param name="disable">Indicate whether this test case should be disabled</param>
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
        /// <summary>Asserts that a condition is true.</summary>
        /// <param name="test" type="Boolean">Condition to test.</param>
        /// <param name="message" type="String">Text message for condition being tested.</param>
        QUnit.ok(test, message);
    };

    djstest.assertAreEqual = function (actual, expected, message) {
        /// <summary>Asserts that the values of the expected and actualobjects are equal.</summary>
        QUnit.equal(actual, expected, message);
    };

    djstest.assertAreEqualDeep = function (actual, expected, message) {
        /// <summary>Asserts that the actual and expected objects are the same.</summary>
        QUnit.deepEqual(exposeDateValues(actual), exposeDateValues(expected), message);
    };

    djstest.assertWithoutMetadata = function (actual, expected, message) {
        removeMetadata(actual)
        removeMetadata(expected);
        djstest.assertAreEqualDeep(actual, expected, message);
    };

    djstest.asyncDo = function (asyncActions, done) {
        /// <summary>Calls each async action in asyncActions, passing each action a function which keeps a count and
        /// calls the passed done function when all async actions complete.</summary>
        /// <param name="asyncActions" type="Array">Array of asynchronous actions to be executed, 
        /// each taking a single parameter - the callback function to call when the action is done.</param>
        /// <param name="done" type="Function">Function to be executed in the last async action to complete.</param>
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
        /// <summary>Makes a deep copy of an object.</summary>
        return $.extend(true, {}, object);
    };

    djstest.destroyCacheAndDone = function (cache) {
        /// <summary>Destroys the cache and then completes the test</summary>
        /// <param name="cache">The cache to destroy</param>
        cache.clear().then(function () {
            djstest.done();
        }, function (err) {
            djstest.fail("Failed to destroy cache: " + djstest.toString(err));
            djstest.done();
        });
    };

    djstest.done = function () {
        /// <summary>Indicates that the currently running test has finished.</summary>
        QUnit.start();
    };

    djstest.expectException = function (testFunction, message) {
        /// <summary>Test passes if and only if an exception is thrown.</summary>
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
        /// <summary>Indicates the expected number of asserts, fails test if number is not met.</summary>
        /// <param name="asserts" type="Number">Number of asserts expected in test.</param>
        expect(asserts);
    }

    djstest.fail = function (message) {
        /// <summary>Marks the current test as failed.</summary>
        /// <param name="message" type="String">Failure message.</param>
        QUnit.ok(false, message);
    };

    djstest.failAndDoneCallback = function (message, cleanupCallback) {
        /// <summary>Returns a function that when invoked will fail this test and be done with it.</summary>
        /// <param name="message" type="String">Failure message.</param>
        /// <param name="cleanupCallback" type="Function" optional="true">Optional cleanup function in case of failure.</param>
        /// <returns type="Function">A new function.</returns>

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
        /// <summary>Logs a test message.</summary>
        /// <param name="message" type="String">Test message.</param>
        var context = { result: true, actual: true, expected: true, message: message };
        QUnit.log(context);
    };

    djstest.pass = function (message) {
        /// <summary>Marks the current test as failed.</summary>
        /// <param name="message" type="String">Failure message.</param>
        QUnit.ok(true, message);
    };

    djstest.toString = function (obj) {
        /// <summary>Dumps the object as a string</summary>
        /// <param name="obj" type="Object">Object to dump</param>
        return QUnit.jsDump.parse(obj);
    };

    djstest.wait = function (fn) {
        /// <summary>Executes the function, pausing test execution until the callback is called</summary>
        /// <param name="fn" type="Function">Function to execute; takes one parameter which is the callback</param>
        /// <remarks>This function is typically used in asynchronous setup/teardown methods</remarks>
        QUnit.stop();
        fn(function () {
            QUnit.start();
        });
    };

    // Disable caching to ensure that every test-related AJAX request is actually being sent,
    // and set up a default error handler
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
})(window);