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
  'use strict';
  var pkg = grunt.file.readJSON('package.json');

  // Build artifact base name
  //<%= pkg.name %>-<%= pkg.version %>-<%= pkg.postfix %>-<%= pkg.releaseCandidate %>'
  var artifactname = pkg.name + '-' + pkg.version +
     (pkg.postfix.length > 0 ? "-" : "") + pkg.postfix +
     (pkg.releaseCandidate.length > 0 ? "-" : "") + pkg.releaseCandidate;

  //options
  var init = {
    pkg: pkg,
    banner: grunt.file.read('grunt-config/banner.txt'),
    artifactname : artifactname,

    "toBrowser" : {
      "release" : {
          options: { index : "src/index-browser.js" },
          src: ["src/lib/**/*.js", '!**/*-node.*'], 
          dest: "build/lib/<%= artifactname %>.js",
      }
    },
    "uglify": { // uglify and minify the lib
      options: {
        sourceMap : true,
        sourceMapName : "build/lib/<%= artifactname %>.map",
        sourceMapIncludeSources : true,
        banner : "<%= banner %>",
      },
      "browser": {
          src: "build/lib/<%= artifactname %>.js",
          dest: "build/lib/<%= artifactname %>.min.js"
      }
    },
    "jsdoc" : {
      "src" : {
          src: ["src/**/*.js"], 
          options: { destination: "build/doc-src", verbose : false }
      },
      "test" : {
          src: ["tests/**/*.js"], 
          options: { destination: "build/doc-test", verbose : false }
      }
    },
    "nugetpack" : { // create nuget pagckage
      "dist": {
          src: 'grunt-config/nugetpack.nuspec',
          dest: 'build/'
      }
    },
    "copy" : {
      "to-latest" : {
          src :"build/lib/<%= artifactname %>.js",
          dest: "build/lib/odatajs-latest.js"
      }
    },
    "npm-clean": {
      options: {force: true},
      "build": {
          src: [ "build"]
      },
    },
    "curl": {
      "license": {
          src: {
            url: "http://apache.org/licenses/LICENSE-2.0.txt",
            proxy: "http://proxy:8080"
          },
          dest: "LICENSE"
      }
    }
  };
  
  //    Join local configuration for proxies and local test servers
  if (grunt.file.exists('localgrunt.config')) {
    console.log("merge localgrunt.config");
    var localGrundConfig = grunt.file.read('localgrunt.config');
    init.connect['test-browser'].proxies = init.connect['test-browser'].proxies.concat(JSON.parse(localGrundConfig).proxies);
  }

  //    Init config
  grunt.initConfig(init);

  //    Load tasks from npm modules ***/
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-nuget");

  //    Load the custom-* tasks from the grunt-config directory
  grunt.loadTasks('grunt-config/custom-tasks');

  //    Load the custom-* tasks from the grunt-config directory
  grunt.loadTasks('grunt-config');

  //    rename some tasks to avoid name clashes with the user tasks
  grunt.renameTask('clean','npm-clean');
  
  grunt.registerTask('clearEnv', 'clear JAVA_TOOL_OPTIONS', function() {
    process.env['JAVA_TOOL_OPTIONS'] = ''; 
  });

  //    E N D U S E R   T A S K S 

  grunt.registerTask('clean', ['npm-clean:build']);

  //    Runs the license header check to verify the any source file contains a license header
  grunt.registerTask('license-check', ['rat:manual']);

  //    Create documentation in /build/doc
  grunt.registerTask('doc', ['clearEnv', 'jsdoc:src']);
  grunt.registerTask('doc-test', ['clearEnv', 'jsdoc:test']);
  
  //grunt.registerTask('test-browser', ['configureProxies:test-browser', 'connect:test-browser']);
  //grunt.registerTask('test-node', ['node-qunit:default-tests']);
  //grunt.registerTask('release', ['build','doc','compress']);
  //grunt.registerTask('update-legal', ['curl:license']);

  //    Build the odatajs library
  grunt.registerTask('build', ['clean:lib','toBrowser:release', 'uglify:browser', 'copy:to-latest', 'nugetpack']);

  grunt.registerTask('get-licence', ['curl:license']);

  //    R E L E A S E    T A S K S 
  grunt.registerTask('release',[
    'npm-clean:release-dist',
    'build',
    'doc',
    'copy:release-lib','copy:release-doc','copy:release-sources',
    'rat:dist', // check the license headers
    'compress:release-lib','compress:release-doc','compress:release-sources',
  ]);

  
  grunt.registerTask('release:sign',[
    'sign:release','sign:asc','sign:asc-verify'
  ]);

};

