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
 
module.exports = function(grunt) {

    grunt.registerMultiTask('sign', function() {
        var self = this;

        var path = require('path');
        var fs = require( "fs" );

        
        var globalDone = this.async();
        
        var options = this.options({ types : [] });
        var workLoad = [];
        
        // fill workLoad
        for(var i = 0; i < this.files.length; i++) {
          for(var ii = 0; ii < this.files[i].src.length; ii++) {
            for (var iii = 0; iii < options.types.length; iii++) {
                workLoad.push({
                    src :this.files[i].src[ii],
                    type: options.types[iii]
                });
            }
          }
        }
        
        function process() {
            if(workLoad.length <= 0) {
                globalDone();
                return;
            }

            var workItem = workLoad.pop();
            // make source file releative to cwd, since cwd is used as workdir from spawn
            var fileName =  path.relative(self.data.cwd,workItem.src);
            var taskOptions,pipeTo;
            console.log (fileName);
            if ( workItem.type === 'md5' ) {
                grunt.log.writeln('Signing ('+workItem.type+')' + fileName + " ...");
                pipeTo = workItem.src+'.md5';
                taskOptions = { 
                    cmd : 'openssl', 
                    //args: ['dgst','-md5','-out',fileName+'.md5',fileName],
                    args: ['dgst','-md5',fileName],
                    opts : { cwd :self.data.cwd }
                };
            } else if ( workItem.type === 'sha' ) {  
                grunt.log.writeln('Signing ('+workItem.type+')' + fileName + " ...");
                //gpg --print-md SHA512 odatajs-4.0.0-beta-01-RC02-doc.zip
                pipeTo = workItem.src+'.sha';
                taskOptions = { 
                    cmd : 'gpg', 
                    args: ['--print-md','SHA512',fileName],
                    opts : { cwd :self.data.cwd }
                };
            } else {
                grunt.fail.warn('Unknown sign type: "'+ workItem.type + '"', 1);
            }

            var task = grunt.util.spawn(taskOptions, function done(err,result) {
                    if (err) {
                        grunt.fail.warn('Sign: '+err);
                    }
                });
            //console.log('pipeTo'+pipeTo);
            //console.log('task'+JSON.stringify(task));
            var outStream = fs.createWriteStream(pipeTo/* ,{flags: 'w'}*/);
            
            /*task.stdout.on('data', function(data) {
                outStream.write(data.toString());
                //console.log('1'+data.toString());
            });*/
            task.stdout.pipe(outStream, { end: false });
            task.on('close', function (code) {
                grunt.log.ok('Signed ('+workItem.type+'):' + workItem.src);
                grunt.log.ok('with code ' + code);
                process();
            });
            
        }

        process();
    });
};

