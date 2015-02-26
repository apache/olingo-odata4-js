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

// TestSynchronizer Client
// Use to log assert pass/fails and notify mstest a test has completed execution

(function (window, undefined) {
    var testRunId = "";
    var serviceRoot = "./common/TestLogger.svc/";
    var recording = null;
    var recordingLength = 0;
    var maxStringLength = 8192;
    var maxPostLength = 2097152;

    var callTestSynchronizer = function (methodName, parameterUrl) {
        /** Invokes a function on the test synchronizer.
         * @param {String} [partialUrl] - 
         * @returns {String} A response from the server, possibly null.
        
         * If the recording variable is assigned, then the call is logged
         * but nothing is invoked.
         */
        

        var partialUrl;
        if (testRunId) {
            partialUrl = methodName + "?testRunId=" + testRunId + "&" + parameterUrl;
        }
        else {
            partialUrl = methodName + "?" + parameterUrl;
        }

        var url = serviceRoot + partialUrl;

        if (recording) {
            if (url.length > maxStringLength) {
                url = url.substr(0, maxStringLength);
            }

            recordingLength += url.length;
            if (recordingLength > maxPostLength) {
                submitRecording();
                recording = [];
                recordingLength = url.length;
            }

            recording.push(url);
            return null;
        }

        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new window.XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0");
        }

        xhr.open("GET", url, false);
        xhr.send();
        return xhr.responseText;
    };

    var getLogPrefix = function (result) {
        /** Returns the log prefix for a given result
         * @param {Boolean} result - Whether the result is pass or fail. If null, the log line is assumed to be diagnostic
         */
        return "[" + getShortDate() + "] " + (result === true ? "[PASS] " : (result === false ? "[FAIL] " : ""));
    };

    var getShortDate = function () {
        /** Returns the current date and time formatted as "yyyy-mm-dd hh:mm:ss.nnn".*/
        var padToLength = function (number, length) {
            var result = number + "";
            var lengthDiff = length - result.length;
            for (var i = 0; i < lengthDiff; i++) {
                result = "0" + result;
            }

            return result;
        };

        var date = new Date();
        var day = padToLength(date.getDate(), 2);
        var month = padToLength(date.getMonth() + 1, 2);
        var year = date.getFullYear();

        var hours = padToLength(date.getHours(), 2);
        var minutes = padToLength(date.getMinutes(), 2);
        var seconds = padToLength(date.getSeconds(), 2);
        var milliseconds = padToLength(date.getMilliseconds(), 3);

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    };

    var submitRecording = function () {
        var body = { urls: recording };
        postToUrl("LogBatch", body);
    };

    var postToUrl = function (methodName, body) {
        /** POSTs body to the designated methodName.
        */
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new window.XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0");
        }

        var url = serviceRoot + methodName;
        xhr.open("POST", url, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(window.JSON.stringify(body));
        if (xhr.status < 200 || xhr.status > 299) {
            throw { message: "Unable to POST to url.\r\n" + xhr.responseText };
        }

        return xhr.responseText;
    };

    function LogAssert(result, message, name, expected, actual) {
        var parameterUrl = "pass=" + result + "&message=" + encodeURIComponent(message) + "&name=" + encodeURIComponent(name);

        if (!result) {
            parameterUrl += "&actual=" + encodeURIComponent(actual) + "&expected=" + encodeURIComponent(expected);
        }

        callTestSynchronizer("LogAssert", parameterUrl);
    }

    function LogTestStart(name) {
        callTestSynchronizer("LogTestStart", "name=" + encodeURIComponent(name) + "&startTime=" + encodeURIComponent(getShortDate()));
    }

    function LogTestDone(name, failures, total) {
        callTestSynchronizer("LogTestDone", "name=" + encodeURIComponent(name) + "&failures=" + failures + "&total=" + total + "&endTime=" + encodeURIComponent(getShortDate()));
    }

    function TestCompleted(failures, total) {
        return callTestSynchronizer("TestCompleted", "failures=" + failures + "&total=" + total);
    }

    var extractTestRunId = function () {
        /** Extracts the testRunId value from the window query string.
         * @returns {String} testRunId, possibly empty.
         */
        var i, len;
        var uri = window.location.search;
        if (uri) {
            var parameters = uri.split("&");
            for (i = 0, len = parameters.length; i < len; i++) {
                var index = parameters[i].indexOf("testRunId=");
                if (index >= 0) {
                    return parameters[i].substring(index + "testRunId=".length);
                }
            }
        }

        return "";
    };

    var init = function (qunit) {
        /** Initializes the test logger synchronizer.
        * @param context - Unit testing to hook into.
        * If there is no testRunId present, the QUnit functions are left as they are.
        */
        var logToConsole = function (context) {
            if (window.console && window.console.log) {
                window.console.log(context.result + ' :: ' + context.message);
            }
        };

        testRunId = extractTestRunId();
        if (!testRunId) {
            qunit.log = logToConsole;
        } else {
            recording = [];
            qunit.log = function (context) {
                logToConsole(context);

                var name = qunit.config.current.testName;
                if (!(context.actual && context.expected)) {
                    context.actual = context.result;
                    context.expected = true;
                }
                LogAssert(context.result, getLogPrefix(context.result) + context.message, name, window.JSON.stringify(context.expected), window.JSON.stringify(context.actual));
            };

            qunit.testStart = function (context) {
                LogTestStart(context.name);
            };

            qunit.testDone = function (context) {
                LogTestDone(context.name, context.failed, context.total);
            };

            qunit.done = function (context) {
                submitRecording();
                recording = null;

                var nextUrl = TestCompleted(context.failed, context.total);
                nextUrl = JSON.parse(nextUrl).d;
                if (nextUrl) {
                    window.location.href = nextUrl;
                }
            }
        }
    };

    window.TestSynchronizer = {
        init: init
    };
})(window);