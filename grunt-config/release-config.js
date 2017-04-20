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

  function endsWith(hay, needle) {
    return hay.indexOf(needle, hay.length - needle.length) !== -1;
  }

  function startsWith(hay, needle) {
    return hay.indexOf(needle) === 0;
  }

  function contains(hay, needle) {
    return hay.indexOf(needle) > -1;
  }

   

  // clean
  grunt.config.merge( { 
    'priv-clean': {
      'release-dist': {
        options: { force: true },
        src: [ "./dist"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");

  // doc
  grunt.config.merge( { 
    'jsdoc' : { // generate documentation
      "release-doc-src" : {
        src: ['**/*.js'],
        options: {
          destination: './doc',
          verbose : false 
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  



  // zip
  grunt.config.merge( { 
    compress: { // build the zip files for the release 
      'release-dist': { // just the lib
        options: {archive: './dist/<%= artifactname %>-dist.zip'},
        files: [{expand: true, cwd: './dist', src: ['*.js', '*.map', '*.ts'],  dest: '/'}]
      },
      'release-doc': { // just the documentation
        options: {archive: './dist/<%= artifactname %>-doc.zip'},
        files: [{expand: true, cwd: './doc', src: ['**'], dest: '/'}]
      },
      'release-lib' :  { // the full repository with out the git stuff
        options: { archive: './dist/<%= artifactname %>-src.zip'},
        files: [
          {expand: true, cwd: './', src: ['**/*.jt', '**/*.ts'], dest: '/'},
        ]
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-compress');
 
};

