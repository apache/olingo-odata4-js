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


// Because this code contains a init function to be useable directly inside the browser as well as in nodejs
// we define the @namespace djstest here instead of the a @module name djstest

/** Create namespace djstest in window.djstest when this file is loaded as JavaScript by the browser
 * @namespace djstest
 */


var init = function init () {
    var djstest = {};
  

    /** Constructs a Job object that allows for enqueuing and synchronizing the execution of functions.
     * @class Job
     * @constructor
     * @returns {Object} Job object
     */
    djstest.Job = function () {
        
        var currentTask = -1;
        var tasks = [];

        var failedTasks = 0;

        /** Adds a function to the job queue regardless if the queue is already executing or not.
         * @method djstest.Job#queue
         * @param {Function} fn - Function to execute.
         */
        this.queue = function (fn) {
            
            tasks.push(fn);
        };

        /** Adds a function to the front of the job queue regardless if the queue is already executing or not.
         * @method djstest.Job#queueNext
         * @param {Function} fn - Function to execute.
         */
        this.queueNext = function (fn) {
        
            if (currentTask < 0) {
                tasks.unshift(fn);
            } else {
                tasks.splice(currentTask + 1, 0, fn);
            }
        };

        /** Starts the execution of this job.
         * @method djstest.Job#run
         * @param {Function} done - Callback invoked when the job has finished executing all of its enqueued tasks.
         */
        this.run = function (done) {
            /// This method does nothing if called on a unit of work that is already executing.
            if (currentTask >= 0) {
                return;
            }

            if (tasks.length === 0) {
                done(true);
                return;
            }

            /**
             * @method djstest.Job~makeTaskDoneCallBack
            */
            function makeTaskDoneCallBack(failed) {
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
            }

            /** Executes the next function in the queue.
             * @method djstest.Job~runNextTask
            */
            function runNextTask() {
                defer(function () {
                    try {
                        tasks[currentTask](makeTaskDoneCallBack(false), makeTaskDoneCallBack(true));
                    } catch (e) {
                        makeTaskDoneCallBack(true)();
                    }
                });
            }

            currentTask = 0;
            runNextTask();
        };
    };

    /** Defers the execution of an arbitrary function that takes no parameters.
     * @memberof djstest
     * @inner
     * @param {Function} fn - Function to schedule for later execution.
     */
    function defer(fn) {
        setTimeout(fn, 0);
    }

    /** Exposes date values for Date objects to facilitate debugging
     * @memberof djstest
     * @inner
     * @param {Object} data - The object to operate on
     */
    function exposeDateValues(data) {
     
        if (typeof data === "object") {
            if (data instanceof Date) {
                data.__date__ = data.toUTCString();
            }
            else {
                for (var prop in data) {
                    exposeDateValues(data[prop]);
                }
            }
        }

        return data;
    }

    /** Determines the name of a function.
     * @memberof djstest
     * @inner
     * @param {String} text - Function text.
     * @returns {String} The name of the function from text if found; the original text otherwise.
     */
    function extractFunctionName(text) {

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
    }

    /** Removes metadata annotations from the specified object.
     * @memberof djstest
     * @inner
     * @param data - Object to remove metadata from; possibly null.
     */
    function removeMetadata(data) {

        if (typeof data === "object" && data !== null) {
            delete data.__metadata;
            for (var prop in data) {
                removeMetadata(data[prop]);
            }
        }
    }

    /** Add the unit test cases
     * @param disable - Indicate whether this test case should be disabled
    */
    /**
     * storeObjects
     * @param disable - Indicate whether this test case should be disabled
     * @param fn - Textfunction
     * @param name - Name for logging
     * @param arg - Agruments
     * @param timeout - Timeout
     */
    djstest.addFullTest = function (disable, fn, name, arg, timeout) {

        if (disable !== true) {
            djstest.addTest(fn, name, arg, timeout);
        }
    };

    /** Add the unit test cases
     * @param fn - Textfunction
     * @param name - Name for logging
     * @param arg - Agruments
     * @param timeout - Timeout
    */
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

    /** Asserts that a condition is true.
     * @param {Boolean} test - Condition to test.
     * @param {String} message - Text message for condition being tested.
     */
    djstest.assert = function (test, message) {
        
        QUnit.ok(test, message);
    };

    /** Asserts that the values of the expected and actualobjects are equal.
     * @memberof djstest
     * @inner
     */
    djstest.assertAreEqual = function (actual, expected, message) {
        QUnit.equal(actual, expected, message);
    };

    /** Asserts that the actual and expected objects are the same.
     */
    djstest.assertAreEqualDeep = function (actual, expected, message) {
        QUnit.deepEqual(exposeDateValues(actual), exposeDateValues(expected), message);
    };

    /** Asserts that the actual and expected objects are the same but removes the metadata bevore
     */
    djstest.assertWithoutMetadata = function (actual, expected, message) {
        removeMetadata(actual);
        removeMetadata(expected);
        djstest.assertAreEqualDeep(actual, expected, message);
    };

    /** Calls each async action in asyncActions, passing each action a function which keeps a count and
     * calls the passed done function when all async actions complete
     * @param {Array} asyncActions -Array of asynchronous actions to be executed, 
     * each taking a single parameter - the callback function to call when the action is done.</param>
     * @param {Function} done - Function to be executed in the last async action to complete.
     */
    djstest.asyncDo = function (asyncActions, done) {

        var count = 0;
        var doneOne = function () {
            count++;
            if (count >= asyncActions.length) {
                done();
            }
        };

        if (asyncActions.length > 0) {
            for ( var i = 0; i < asyncActions.length; i++) {
                asyncActions[i](doneOne);
            }
        } else {
            done();
        }
    };

    /** Makes a deep copy of an object.
     */
    djstest.clone = function (object) {
        if ( object === undefined ) {
            return undefined;
        } else if (object === null) {
            return null;
        } else if (typeof(object) !== 'object') {
            return object;
        } else {
            var ret = {};
            for(var key in object) {
                if(object.hasOwnProperty(key)) {
                    ret[key] = this.clone(object[key]);
                }
            }
            return ret;
        }
        throw("Error cloning an object");
    };

    /** Destroys the cache and then completes the test
     * @param cache - The cache to destroy
     */
    djstest.destroyCacheAndDone = function (cache) {
     
        cache.clear().then(function () {
            djstest.done();
        }, function (err) {
            djstest.fail("Failed to destroy cache: " + djstest.toString(err));
            djstest.done();
        });
    };

    /** Indicates that the currently running test has finished.
     */
    djstest.done = function () {
      
        QUnit.start();
    };

    /** Test passes if and only if an exception is thrown.
     */
    djstest.expectException = function (testFunction, message) {
     
        try {
            testFunction();
            djstest.fail("Expected exception but function succeeded: " + " " + message);
        }
        catch (e) {
            // Swallow exception.
            djstest.pass("Thrown exception expected");
        }
    };

    /** Indicates the expected number of asserts, fails test if number is not met.
     * @param {Number} asserts - Number of asserts expected in test.
     */
    djstest.assertsExpected = function (asserts) {
        
        expect(asserts);
    };
    /** Marks the current test as failed.
     * @param {String} message - Failure message.
     */
    djstest.fail = function (message) {

        QUnit.ok(false, message);
    };

    /** Returns a function that when invoked will fail this test and be done with it.
     * @param {String} message - Failure message.
     * @param {Function} [cleanupCallback] - 
     * @returns {Function} A new function.
     */
    djstest.failAndDoneCallback = function (message, cleanupCallback) {

        return function (err) {
            message = "" + message + (err) ? JSON.stringify(err) : "";
            djstest.fail(message);
            if (cleanupCallback) {
                try {
                    cleanupCallback();
                } catch (e) {
                    djstest.fail("error during cleanupCallback: " + JSON.stringify(e));
                }
            }

            djstest.done();
        };
    };

    /** Logs a test message.
     * @param {String} message - Test message.
     */
    djstest.log = function (message) {

        var context = { result: true, actual: true, expected: true, message: message };
        QUnit.log(context);
    };

    /** Marks the current test as failed.
     * @param {String} message - Failure message.
     */
    djstest.pass = function (message) {
        QUnit.ok(true, message);
    };

    /** Dumps the object as a string
     * @param {Object} obj - Object to dump
     */
    djstest.toString = function (obj) {

        return QUnit.jsDump.parse(obj);
    };

    /** Executes the function, pausing test execution until the callback is called
     * @param {Function} fn - Function to execute; takes one parameter which is the callback
     * This function is typically used in asynchronous setup/teardown methods</remarks>
     */
    djstest.wait = function (fn) {
        QUnit.stop();
        fn(function () {
            QUnit.start();
        });
    };

    return djstest;
};

//export djstest

if (typeof window !== 'undefined') {
    //expose to browsers window object
    if ( window.djstest === undefined) {
        window.djstest = init();
    } else {
        var tmp = init();
        $.extend( window.djstest,tmp);
    }
} else {
    //expose in commonjs style
    module.exports = init();
}

