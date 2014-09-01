module.exports = function(grunt) {
  'use strict';
/*
  var x = grunt.file.isMatch( { dot : true} ,
    '**node_modules/**',
    ['node_modules/1']
    );
  console.log('X: '+ x);
  process.exit(1);*/

  var init = {
    pkg: grunt.file.readJSON('package.json'),
    banner: grunt.file.read('src/banner.txt'),
    filename : '<%= pkg.name %>-<%= pkg.version %>-<%= pkg.postfix %>',


    browserify: { // convert code from nodejs style to brower style
      src: {
        files: {
          'build/<%= filename %>.js': ['src/index.js'],
        },
        options: { 
          transform: ['./grunt-config/browserify_transforms/stripheader/stripheader.js'], // remove apache license headers before contatenating
          browserifyOptions: { } ,
          bundleOptions: { },
        }
      }
    },
    uglify: { // uglify and minify the lib
      options: {
        sourceMap : true,
        sourceMapName : 'build/<%= filename %>.map',
        sourceMapIncludeSources : true,
      },
      build: {
        src: 'build/<%= filename %>.js',
        dest: 'build/<%= filename %>.min.js'
      }
    },
    concat : { // add the apache license headers
      options : {
        banner : '<%= banner %>'
      },
      licence: {
        src: 'build/<%= filename %>.js',
        dest: 'build/<%= filename %>.js',
      },
      licence_min: {
        src: 'build/<%= filename %>.min.js',
        dest: 'build/<%= filename %>.min.js',
      },
    },
    copy: { // copy odatajs library files to demo folder withch contains samples
      forDemo: {
        files: [{ expand: true, cwd: 'build/', src: ['<%= filename %>*.*'], dest: 'demo/scripts/', filter: 'isFile'}]
      }
    },
    connect: { // not used, start a testing server
      demo: {
        options: {
          port: 4001 ,
          hostname: "localhost",
          base: "demo",
          keepalive : true,
          middleware: function (connect, options) {
            return [
              require("grunt-connect-proxy/lib/utils").proxyRequest ,
              connect.static(options.base),   // static content
              connect.directory(options.base) // browse directories
            ];
          },
        },
      },
      // start a node webserver with proxy to host the qunit-test html files
      'test-browser': {             
        options: {
          port: 4003 ,
          hostname: "localhost",
          base: "",
          keepalive : true,
          //changeOrigin: true,
          middleware: function (connect, options) {
            return [
              require("grunt-connect-proxy/lib/utils").proxyRequest ,
              connect.static(options.base),   // static content
              connect.directory(options.base) // browse directories
            ];
          },
        },
        // proxy all request going to /tests/endpoints/ to the .net data services
        proxies: [{
          context: "/tests/endpoints/",  // When the url contains this...
          host: "localhost",
          changeOrigin: true,
          https: false,
          port: 46541,
          rejectUnauthorized: false, 
        }],
      },
    },
    'node-qunit': {   
      //used to run some background qunit test on node         
      'default-tests': {
        setup: {
          log: {
            summary: true,
            assertions: true,
            errors: true,
            globalSummary: true,
            coverage: false,
            globalCoverage: false,
            testing: true
          },
          coverage: false,
          deps: null,
          namespace: null
        },
        deps: '',
        code: './tests-tmp/common/node-test-setup.js',
        tests: ['./tests-tmp/odata-json-tests.js'],
        done: function(err, res){
            !err && publishResults("node", res, this.async());
        }
      },
    },
    'jsdoc' : { // generate documentation
        'src' : {
            src: ['src/**/*.js'], 
            options: {
                destination: 'build/doc-src',
                verbose : false 
            }
        },
        test : {
            src: ['tests/**/*.js'], 
            options: {
                destination: 'build/doc-test',
                verbose : false 
            }
        }
    },
    'npm-clean': {
      tmp: {
        src: [ "build/tmp"]
      },
      doc: {
        src: ["build/doc"],
          options: {
                force: true
            }
      },
      "doc-test": {
        src: ["build/doc-test"],
          options: {
                force: true
            }
      },
    },
    curl: {
      'license': {
        src: {
          url: 'http://apache.org/licenses/LICENSE-2.0.txt',
          proxy: 'http://proxy:8080'
        },
        dest: 'LICENSE'
      }
    } 
  };
  
  /*** Join local configuration for proxies and local test servers ***/
  if (grunt.file.exists('localgrunt.config')) {
    console.log("merge localgrunt.config");
    var localGrundConfig = grunt.file.read('localgrunt.config');
    init.connect['test-browser'].proxies = init.connect['test-browser'].proxies.concat(JSON.parse(localGrundConfig).proxies);
  }

  /*** Init ***/
  grunt.initConfig(init);

  /*** Load tasks from npm modules ***/
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-connect-proxy");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks("grunt-jsdoc");

  //    Start Qunit tests direcly in node js, internally qunit (npm qunit) 
  //    is used, no phantomjs instance required
  grunt.loadNpmTasks('grunt-node-qunit'); 
  //grunt.loadNpmTasks('grunt-contrib-clean');

  //    Load the custom-* tasks from the grunt-config directory
  grunt.loadTasks('grunt-config');

  //    rename some tasks to avoid name clashes with the user tasks
  //grunt.renameTask('clean','npm-clean');
  

  /*** E N D U S E R   T A S K S ***/

  //grunt.registerTask('clean', ['npm-clean:doc','npm-clean:tmp']);

  //    Runs the license header check to verify the any source file contains a license header
  grunt.registerTask('license-check', ['custom-license-check']);

  //    Create documentation in /build/doc
  grunt.registerTask('doc', [/*'npm-clean:doc',*/'jsdoc:src']);
  grunt.registerTask('doc-test', [/*'npm-clean:doc-test',*/'jsdoc:test']);

  //    Build the odatajs library
  grunt.registerTask('build', ['browserify:src', 'uglify:build', 'concat','copy:forDemo']);


  grunt.registerTask('test-browser', ['configureProxies:test-browser', 'connect:test-browser']);
  grunt.registerTask('test-node', ['node-qunit:default-tests']);
  //grunt.registerTask('release', ['build','doc','compress']);
  grunt.registerTask('update-legal', ['curl:license']);

  
};

