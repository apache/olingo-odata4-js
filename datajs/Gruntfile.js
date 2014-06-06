module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: grunt.file.read('src/banner.txt'),
    filename : '<%= pkg.name %>-<%= pkg.version %>',


    browserify: {
      // start with index.js and follow all required source in order pack them together 
      datajs: {
        files: {
          'build/<%= filename %>.js': ['src/index.js'],
        },
        options: {
          browserifyOptions: {
          } ,
          bundleOptions: {
          },
        }
      }
    },
    uglify: {
      options: {
        sourceMap : true,
        sourceMapName :  'build/<%= filename %>.map',
        sourceMapIncludeSources :true,
      },
      // uglify and compress the packed sources
      build: {
        src: 'build/<%= filename %>.js',
        dest: 'build/<%= filename %>.min.js'
      }
    },
    connect: {
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
          port: 4002 ,
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
        code: './tests/node-test-setup.js',
        tests: ['./tests/odata-json-tests.js'],
        done: function(err, res){
            !err && publishResults("node", res, this.async());
        }
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-connect-proxy");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks('grunt-node-qunit');
  

  // Default task.
  grunt.registerTask('build', ['browserify:datajs', 'uglify:build']);
  grunt.registerTask('test-browser', ['configureProxies:test-browser', 'connect:test-browser']);
  grunt.registerTask('test-node', ['node-qunit:default-tests']);
};

