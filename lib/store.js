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
//'use strict';

 /** @module store */





exports.defaultStoreMechanism = "best";

/** Creates a new store object.
 * @param {String} name - Store name.
 * @param {String} [mechanism] - 
 * @returns {Object} Store object.
*/
exports.createStore = function (name, mechanism) {


    if (!mechanism) {
        mechanism = exports.defaultStoreMechanism;
    }

    if (mechanism === "best") {
        mechanism = (DomStore.isSupported()) ? "dom" : "memory";
    }

    var factory = mechanisms[mechanism];
    if (factory) {
        return factory.create(name);
    }

    throw { message: "Failed to create store", name: name, mechanism: mechanism };
};

exports.DomStore       = DomStore       = require('./store/dom.js');
exports.IndexedDBStore = IndexedDBStore = require('./store/indexeddb.js');
exports.MemoryStore    = MemoryStore    = require('./store/memory.js');

var mechanisms = {
    indexeddb: IndexedDBStore,
    dom: DomStore,
    memory: MemoryStore
};

exports.mechanisms = mechanisms;




