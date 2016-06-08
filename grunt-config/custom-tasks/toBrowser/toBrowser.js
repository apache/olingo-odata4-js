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

  var stripHeader = function(input) { 
    return input.replace(/(\/\*(.|\n|\r)*?\*\/)/i,"");
  };

  grunt.registerMultiTask('toBrowser', function() {
      var self = this;

      var path = require('path');
      var fs = require( 'fs' );
      
      var globalDone = this.async();
      
      var options = this.options({ });
      
      var workLoad = [];
      var writeToLogOk = function(data) { grunt.log.ok(data.toString()); };

      
      // fill workLoad
      for(var i = 0; i < this.files.length; i++) {
        for(var ii = 0; ii < this.files[i].src.length; ii++) {


          var srcFile = this.files[i].src[ii];
          
          var srcPath = srcFile.substring(0,srcFile.lastIndexOf('/')+1);
          var srcName = srcFile.substring(srcFile.lastIndexOf('/')+1,srcFile.length-3);

          //console.log('exists :'+srcPath+srcName+'-browser.js' );
          tarName = srcName;
        //   if (srcName.indexOf('-browser') > 0) {
        //     tarName = tarName.substring(0,srcName.indexOf('-browser'));
        //     //console.log('new srcName :'+srcName );
        //   } else if (grunt.file.exists(srcPath+srcName+'-browser.js')) {
        //     //console.log('exists :yes');
        //     continue; //skip that file
        //   }
          

          workLoad.push({
                  srcPath : srcPath,
                  srcName : srcName,
                  tarName : tarName
              });

        }
      
        var concat = '{';
        for(var x = 0; x < workLoad.length; x++) {
          console.log('workLoad :'+JSON.stringify(workLoad[x] ));
          var src = grunt.file.read(workLoad[x].srcPath+workLoad[x].srcName+'.js');
          // remove the first comment
          src = stripHeader(src);
        
          if (x > 0) {
            concat+= ', ';
          }

          concat+= '"' + workLoad[x].tarName + '" : ';
          concat+= 'function(exports, module, require) {';
          concat+= src +'}';
        }
        concat+= '}';

        var tpl = grunt.file.read('./grunt-config/custom-tasks/toBrowser/wrapper-tpl.js');
        var init = stripHeader(grunt.file.read(options.index));

        tpl = tpl.replace('\'<% initFunction %>\'',init);
        tpl = tpl.replace('\'<% filesAsFunctionList %>\'',concat);

        grunt.file.write(this.files[i].dest, tpl);
      }

      globalDone();
  });
};

