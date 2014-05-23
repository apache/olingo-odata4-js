module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: grunt.file.read('src/banner.txt'),
    filename : '<%= pkg.name %>-<%= pkg.version %>',

    browserify: {
      datajs: {
        files: {
          'build/<%= filename %>.js': ['src/index.js'],
        },
        options: {
          browserifyOptions: {
          } ,
          bundleOptions: {
            debug: true
          },
        }
      }
    },
    /*
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap : true,
        sourceMapName :  'build/<%= filename %>.map',
        sourceMapIncludeSources :true,
        --sourceMapIn : 'build/<%= filename %>.split_map',--
      },
      build: {
        src: 'build/<%= filename %>.js',
        dest: 'build/<%= filename %>.min.js'
      }
    },*/
    copy: {
      saveOrig : {
        files: [
          // includes files within path
          {expand: false, flatten: true,src: './build/<%= filename %>.js', dest: 'demo/jscripts/<%= filename %>.bu_js'},
        ]
      },
      toDemo: {
        files: [
          // includes files within path
          {expand: false, flatten: true,src: './build/<%= filename %>.js', dest: 'demo/jscripts/<%= filename %>.js'},
          {expand: false, flatten: true,src: './build/<%= filename %>.min.js', dest: 'demo/jscripts/<%= filename %>.min.js'},
          {expand: false, flatten: true,src: './build/<%= filename %>.map', dest: 'demo/jscripts/<%= filename %>.map'},
          {expand: false, flatten: true,src: './build/<%= filename %>.split_map', dest: 'demo/jscripts/<%= filename %>.split_map'},
        ]
      }
    },
    connect: {
      proxies: [{
        context: "/tests/endpoints/",  // When the url contains this...
        host: "localhost",
        changeOrigin: true,
        https: false,
        port: 46541,
        rejectUnauthorized: false, 
      }/*,{
        context: "/tests/common/",  // When the url contains this...
        host: "localhost",
        changeOrigin: true,
        https: false,
        port: 46541,
        rejectUnauthorized: false, 
      }*/],
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
      test: {
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
      },
    },
    open: {
      demo: {
        path: "http://<%= connect.demo.options.hostname %>:<%= connect.demo.options.port %>/demo.html",
        options: {
          delay : 500,
        }
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-browserify');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-connect-proxy");
  grunt.loadNpmTasks("grunt-contrib-connect");

  

  // Default task.
  grunt.registerTask('build', ['browserify:datajs', 'copy:toDemo']);
  grunt.registerTask('run', ['configureProxies', 'connect:demo']);
  grunt.registerTask('test', ['configureProxies', 'connect:test']);
};

