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
    'npm-clean': {
      'release-dist': {
        options: { force: true },
        src: [ "./../dist/<%= artifactname %>*"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");

  // doc
  grunt.config.merge( { 
    'jsdoc' : { // generate documentation
      "release-doc-src" : {
        src: ['src/**/*.js'], 
        options: {
          destination: './../dist/<%= artifactname %>/doc',
          verbose : false 
        }
      },
    },
  });

  // copy
  grunt.config.merge( { 
    'copy' : {
      'release-lib' : {
        files: [
          { expand: true, cwd: 'build/lib', src: ['<%= artifactname %>*.*'], dest: './../dist/<%= artifactname %>/lib/lib', filter: 'isFile'},
          { expand: true, src :'LICENSE',dest: './../dist/<%= artifactname %>/lib', filter: 'isFile' },
          { expand: true, src :'NOTICE',dest: './../dist/<%= artifactname %>/lib', filter: 'isFile' },
          { expand: true, src :'DEPENDENCIES',dest: './../dist/<%= artifactname %>/lib', filter: 'isFile' },
          { expand: true, src :'README.md',dest: './../dist/<%= artifactname %>/lib', filter: 'isFile' }
        ]
      },
      'release-doc' : {
        files: [
            { expand: true, cwd: 'build/doc-src', src: ['**'], dest: './../dist/<%= artifactname %>/doc/doc', filter: 'isFile'},
            { expand: true, src :'LICENSE',dest: './../dist/<%= artifactname %>/doc', filter: 'isFile' },
            { expand: true, src :'NOTICE',dest: './../dist/<%= artifactname %>/doc', filter: 'isFile' },
            { expand: true, src :'DEPENDENCIES',dest: './../dist/<%= artifactname %>/doc', filter: 'isFile' },
            { expand: true, src :'README.md',dest: './../dist/<%= artifactname %>/doc', filter: 'isFile' }
          ]
      },
      'release-sources' : {
        files: [
            { expand: true, src :'LICENSE',dest: './../dist/<%= artifactname %>/sources', filter: 'isFile' },
            { expand: true, src :'NOTICE',dest: './../dist/<%= artifactname %>/sources', filter: 'isFile' },
            { expand: true, src :'DEPENDENCIES',dest: './../dist/<%= artifactname %>/sources', filter: 'isFile' },
            { dot: true, expand: true, cwd: './', src: ['**'], dest: './../dist/<%= artifactname %>/sources/odatajs',
            filter: function(srcPath)  {
              // no node_modules
              if (srcPath === 'node_modules' || contains(srcPath, 'node_modules\\')|| contains(srcPath, 'node_modules/')) {
                return false; 
              }
              if (srcPath === 'extern-tools' || contains(srcPath, 'extern-tools\\')|| contains(srcPath, 'extern-tools/')) {
                return false; 
              }

              if (contains(srcPath, 'demo\\scripts\\datajs-') || 
                  contains(srcPath, 'demo/scripts/datajs-')) {
                return false; 
              }
              if (contains(srcPath, 'demo\\scripts\\odatajs-') || 
                  contains(srcPath, 'demo/scripts/odatajs-')) {
                return false; 
              }

              // no c# files
              if (srcPath === 'obj' || contains(srcPath, 'obj')|| contains(srcPath, 'obj')) {
                return false; 
              }

              if (srcPath === 'bin' || contains(srcPath, 'bin')|| contains(srcPath, 'bin')) {
                return false; 
              }

              if (srcPath === 'packages' || contains(srcPath, 'packages')|| contains(srcPath, 'packages')) {
                return false; 
              }

              // no build retults
              if (srcPath === 'build' || contains(srcPath, 'build')|| contains(srcPath, 'build')) {
                return false; 
              }

              if (endsWith(srcPath, '.gitignore')) {
                return false; 
              }
              if (endsWith(srcPath, 'localgrunt.config')) {
                return false; 
              }
              if (endsWith(srcPath, 'JSLib.suo')) {
                return false; 
              }
              if (endsWith(srcPath, 'JSLib.csproj.user')) {
                return false; 
              }
              
              console.log(' + ' + srcPath);
              return true;
            }},
          ]
      },
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  



  // zip
  grunt.config.merge( { 
    compress: { // build the zip files for the release 
      'release-lib': { // just the lib
        options: {archive: './../dist/<%= artifactname %>/<%= artifactname %>-lib.zip'},
        files: [{expand: true, cwd: './../dist/<%= artifactname %>/lib', src: ['**'],  dest: '/'}]
      },
      'release-doc': { // just the documentation
        options: {archive: './../dist/<%= artifactname %>/<%= artifactname %>-doc.zip'},
        files: [{expand: true, cwd: './../dist/<%= artifactname %>/doc', src: ['**'], dest: '/'}]
      },
      'release-sources' :  { // the full repository with out the git stuff
        options: { archive: './../dist/<%= artifactname %>/<%= artifactname %>-sources.zip'},
        files: [
          {expand: true, cwd: './../dist/<%= artifactname %>/sources', src: ['**'], dest: '/'},
        ]
      }
    },
  });

  
  
  /*
  //sign
  grunt.config.merge( { 
    sign : {
      'release-lib': { // just the lib
        options: {archive: './../dist/<%= artifactname %>/<%= artifactname %>-lib.zip'},
        files: [{expand: true, cwd: './../dist/<%= artifactname %>/lib', src: ['**'],  dest: '/'}]
      },
    }
  });
*/

  grunt.loadNpmTasks('grunt-contrib-compress');

  //tasks
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

