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

module.exports = function (grunt) {


  grunt.config('rat', {
    dist: {
      options: {
        dest: './tmp',
        exclude: [ /* .rat-excludes */]
      },
      files: [
        /*{ src: ['./../<%= artifactname %>/doc'], options:{ tag:"dist-doc"}},generated*/
        { src: ['./lib'], options: { tag: "lib" } },
        { src: ['./tests'], options: { tag: "tests" } },
        { src: ['./demo'], options: { tag: "demo" } },
        { src: ['./grunt-config'], options: { tag: "grunt-config" } },
        { src: ['./dist'], options: { tag: "dist-lib" } }
      ]
    },
    manual: {  // with txt output
      options: {
        xml: false,
        dest: './tmp',
        exclude: [ /* .rat-excludes */]
      },
      files: [
        { src: ['./lib'], options: { tag: "lib" } },
        { src: ['./tests'], options: { tag: "tests" } },
        { src: ['./demo'], options: { tag: "demo" } },
        { src: ['./grunt-config'], options: { tag: "grunt-config" } },
        { src: ['./dist'], options: { tag: "dist-lib" } }
      ]
    }
  });


};