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

// Instrument.js
// Instrumentation utilities

(function (window, undefined) {

    var warmedUp = false;
    var getBrowserMemorySize = function (success) {
        /// <summary>Gets the memory size (in bytes) of the browser process</summary>
        /// <param name="success" type="Function">The success callback</param>
        var makeRequest = function (success) {
            $.get("./common/Instrument.svc/GetBrowserMemorySize", function (data) {
                success(parseInt(data));
            }, "text");
        };

        if (window.CollectGarbage) {
            window.CollectGarbage();
        }

        if (!warmedUp) {
            // Make a dummy request to warm it up
            makeRequest(function () {
                warmedUp = true;
                makeRequest(success);
            });
        } else {
            makeRequest(success);
        }
    }

    window.Instrument = {
        getBrowserMemorySize: getBrowserMemorySize
    };

})(this);