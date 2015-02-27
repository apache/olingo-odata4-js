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

// version information 
exports.version = { major: 4, minor: 0, build: 0 };

// core stuff, always needed
exports.deferred = require('./lib/deferred.js');
exports.utils = require('./lib/utils.js');

// only needed for xml metadata 
exports.xml = require('./lib/xml.js');

// only need in browser case
exports.oData = require('./lib/odata.js');
exports.store = require('./lib/store.js');
exports.cache = require('./lib/cache.js');



