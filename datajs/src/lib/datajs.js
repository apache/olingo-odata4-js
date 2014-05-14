/* {
    oldname:'datajs.js',
    updated:'20140514 12:59'
}*/
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

// datajs.js

//var utils = require('./lib/utils.js');
//var xml = require('./lib/xml.js');
//var deferred = require('./lib/deferred.js');
//var odata = require('./lib/odata.js');


//expose all external usable functions via self.apiFunc = function
exports.version = {
    major: 1,
    minor: 1,
    build: 1
};


exports.deferred = require('./datajs/deferred.js');
exports.utils = require('./datajs/utils.js');
exports.xml = require('./datajs/xml.js');


/*
function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
*/


/*
(function (window, undefined) {

    var datajs = window.datajs || {};
    var odata = window.OData || {};

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define('datajs', datajs);
        define('OData', odata);
    } else {
        window.datajs = datajs;
        window.OData = odata;
    }

    datajs.version = {
        major: 1,
        minor: 1,
        build: 1
    };

    // INCLUDE: utils.js
    // INCLUDE: xml.js

    // INCLUDE: deferred.js

    // INCLUDE: odata-utils.js
    // INCLUDE: odata-net.js
    // INCLUDE: odata-handler.js
    // INCLUDE: odata-gml.js
    // INCLUDE: odata-xml.js
    // INCLUDE: odata-atom.js
    // INCLUDE: odata-metadata.js
    // INCLUDE: odata-json-light.js
    // INCLUDE: odata-json.js
    // INCLUDE: odata-batch.js
    // INCLUDE: odata.js

    // INCLUDE: store-dom.js
    // INCLUDE: store-indexeddb.js
    // INCLUDE: store-memory.js
    // INCLUDE: store.js

    // INCLUDE: cache-source.js
    // INCLUDE: cache.js

})(this);*/