'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('rat', 'Run Apache Rat', function () {
    var path = require('path');
    var chalk = require('chalk');
    var childProcess = require('child_process');
    var xml2js = require('xml2js');
    var fs = require('fs');

    var cb = this.async();

    var options = this.options({ xml : true, tmpDir : './build/tmp'});
    var dir = this.data.dir;
    var out = options.tmpDir + '/' + (options.xml ? 'rat.xml' : 'rat.txt');

    var pathToRat =  path.resolve(__dirname,'./../extern_modules/apache-rat-0.10/apache-rat-0.10.jar');
    
    //sample command java -jar apache-rat-0.10.jar -x -d ./src > ./build/tmp/rat.txt
    var cmd = 'java -jar ' + pathToRat+ ' ';
    cmd += options.xml ? ' -x' : '';
    cmd += ' --force -d ' + dir + ' > ' + out;

    grunt.verbose.writeln('Directory: '+dir);

    var cp = childProcess.exec(cmd, options.execOptions, function (err, stdout, stderr) {
      if (err) {
        grunt.fail.warn('rat --> ' + err, 1); //exit grunt with error code 1
      }
      
      
      
      if (!options.xml) {
        grunt.fail.warn('rat --> ' + 'No XML output: checkRatLogFile skipped!', 1); 
      }

      var xml = grunt.file.read(out);
      var parser = new xml2js.Parser();

      parser.parseString(xml, function (err, result) {

          if (err) {
            grunt.fail.warn('rat --> ' + err, 1); 
          }
          
          if (checkRatLogFile(result)) {
            grunt.fail.warn('rat --> ' + 'Missing or Invalied license header detected ( see "'+out+'")', 1);
          }

          
      });
      cb(); 
      
    }.bind(this));

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
    }

    var captureOutput = function (child, output) {
      if (grunt.option('color') === false) {
        child.on('data', function (data) {
          output.write(chalk.stripColor(data));
        });
      } else {
        child.pipe(output);
      }
    };

    grunt.verbose.writeln('Command:', chalk.yellow(cmd));

    captureOutput(cp.stdout, process.stdout);
      captureOutput(cp.stderr, process.stderr);

    if (options.stdin) {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.pipe(cp.stdin);
    }
  });
};

