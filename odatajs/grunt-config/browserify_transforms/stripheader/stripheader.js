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
var through = require('through');

module.exports = function (file) {
  //if (/\.json$/.test(file)) return through();
  //console.log('strip header from ' + file);
  var data = "";


  return through(
    function (buf) { data += buf;    },
    function () {
      try {
        //console.log('\nin--------------\na'+data.substring(0,1000));
        var out = data.replace(/(\/\*(.|\n|\r)*?\*\/)/i,"");
        //console.log('\nout--------------\n'+out.substring(0,300));
        this.queue(out);
      } catch (er) {
        this.emit("error", new Error(er.toString().replace("Error: ", "") + " (" + file + ")"));
      }
      this.queue(null);
    }
  );
};

