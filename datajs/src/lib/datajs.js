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

/* {
    oldname:'datajs.js',
    updated:'20140514 12:59'
}*/

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