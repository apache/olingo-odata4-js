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

    var localDjstest = {};

    // Initialize indexedDB if the window object is available
    localDjstest.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.indexedDB;

    /** Cleans all the test data saved in the IndexedDb database.
     * @param {Array} storeObjects - Array of store objects with a property that is the name of the store
     * @param {Function} done - Callback function
     */
    localDjstest.cleanStoreOnIndexedDb = function (storeObjects, done) {
        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {};

        function deleteObjectStores(db) {
            for ( var i = 0 ; i < db.objectStoreNames.length ; i ++) {
                db.deleteObjectStore(db.objectStoreNames[i]);
            }
        }
        var job;

        if (localDjstest.indexedDB) {
            job = new djstest.Job();
            for ( var i = 0 ; i < storeObjects.length ; i ++) {
                var storeObject = storeObjects[i];
                job.queue((function (storeObject) {
                    return function (success, fail) {
                        var dbname = "_datajs_" + storeObject.name;
                        var request = localDjstest.indexedDB.open(dbname);
                        request.onsuccess = function (event) {
                            var db = request.result;

                            if ("setVersion" in db) {
                                var versionRequest = db.setVersion("0.1");
                                versionRequest.onsuccess = function (event) {
                                    var transaction = versionRequest.transaction;
                                    transaction.oncomplete = function () {
                                        db.close();
                                        success();
                                    };
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
                            var deleteRequest = localDjstest.indexedDB.deleteDatabase(dbname);
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
            }
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


    // Disable caching to ensure that every test-related AJAX request is actually being sent,
    // and set up a default error handler
    if (typeof window !== undefined) {
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
    return localDjstest;
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

