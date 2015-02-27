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
  grunt.registerMultiTask('rat', 'Run Apache Rat', function () {
    var async = require("async");
    var chalk = require('chalk');
    var childProcess = require('child_process');
    var path = require('path');
    var fs = require('fs');
    var xml2js = require('xml2js');

    var globalCB = this.async();
    
    var ratJarFile =  path.resolve(__dirname,'./../_extern-tools/apache-rat-0.11/apache-rat-0.11.jar');
    var options = this.options({ xml : true, dest : './_dist/tmp'});

    //check output directory
    if(!fs.existsSync(options.dest)){
      grunt.file.mkdir(options.dest,0766);
    }
    
    //collect directories which should be checked
    var checkDirs = [];
    for(var i = 0; i < this.files.length; i++) {
      for(var ii = 0; ii < this.files[i].src.length; ii++) {
        var checkDir = {
          dir : this.files[i].src[ii],
          options : {
            xml : options.xml,
            dest : options.dest,
            tag : this.files[i].options.tag,
            exclude : options.exclude || this.files[i].options.exclude
          }
        };
        checkDirs.push(checkDir);
      }
    }

    var processDirectory = function processDirectory(data,cb) {
      var checkDir = data.dir; 
      var options = data.options;
      var outPutFile = options.dest + '/'+ 'rat_' + (options.tag ? options.tag:'') + (options.xml ? '.xml' : '.txt');
      
      //sample command java -jar apache-rat-0.10.jar -x -d ./src > ./_dist/tmp/rat.txt
      var cmd = 'java -jar ' + ratJarFile+ ' ';
      cmd += options.xml ? ' -x' : '';
      cmd += ' --force -d ' + checkDir;
      //cmd += ' -E ./grunt-config/custom-tasks/rat/.rat-excludes'
      if (options.exclude)  {
        for (var i = 0;  i< options.exclude.length; i ++) {
          cmd += ' -e '+ options.exclude[i];
        }
      }
      cmd +=  ' > ' + outPutFile;

      grunt.verbose.writeln('Command:', chalk.yellow(cmd));
      var cp = childProcess.exec(cmd, options.execOptions, function (error, stdout, stderr) {
        if (error) {
          grunt.fail.warn('rat --> ' + error, 1); //exit grunt with error code 1
        }
        checkOutFile(outPutFile,data,cb);
      });
    };

    var checkOutFile = function(outFile,data,cb) {
      //check out files
      if (path.extname(outFile) !== '.xml') {
        //grunt.log.writeln(chalk.yellow('\nrat --> ' + 'No XML output: ('+outFile+') skipped!\n'));
        cb();
        return;
      }

      var xml = grunt.file.read(outFile);
      var parser = new xml2js.Parser();

      parser.parseString(xml, function (err, result) {
          if (err) {
            grunt.fail.warn('rat --> XML parse error: ' + err, 1); 
          }
          
          if (checkRatLogFile(result)) {
            grunt.fail.warn('rat --> check license error:  ' + 'Missing or Invalied license header detected ( see "'+outFile+'")', 1);
          }
          
          grunt.log.ok('rat --> check on ' + data.dir + ' ok -> see'  + outFile);
      });
      cb();
    };

    var checkRatLogFile = function(result) {
      var list = result['rat-report']['resource'];
      for (var i = 0; i < list.length; i++ ){
        var item = list[i];

        var headerType = list[i]['header-type'];
        var attr = headerType[0]['$'];
        if (attr.name.trim() !== 'AL') {
          return true;
        }
      }
      return false;
    };

    var captureOutput = function (child, output) {
      if (grunt.option('color') === false) {
        child.on('data', function (data) {
          output.write(chalk.stripColor(data));
        });
      } else {
        child.pipe(output);
      }
    };

    //files
    async.each(checkDirs,
      function (checkDir,cb) {
        processDirectory(checkDir,cb);
      },
      function(err) {
        grunt.log.ok('rat --> finished');
        globalCB();
      }
    );

    
  /*
    captureOutput(cp.stdout, process.stdout);
      captureOutput(cp.stderr, process.stderr);

    if (options.stdin) {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.pipe(cp.stdin);
    }*/
  });
};

