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