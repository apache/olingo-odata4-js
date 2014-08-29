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

  // copy
  grunt.config.merge( { 
    'copy' : {
      'release-lib' : {
        files: [
          { expand: true, cwd: 'build', src: ['<%= filename %>*.*'], dest: './../dist/<%= filename %>/lib/lib', filter: 'isFile'},
          { expand: true, src :'LICENSE',dest: './../dist/<%= filename %>/lib', filter: 'isFile' }
        ]
      },
      'release-doc' : {
        files: [
            { expand: true, cwd: 'build/doc', src: ['**'], dest: './../dist/<%= filename %>/doc/doc', filter: 'isFile'},
            { expand: true, src :'LICENSE',dest: './../dist/<%= filename %>/doc', filter: 'isFile' }
          ]
      },
      'release-sources' : {
        files: [
            { dot: true, expand: true, cwd: '', src: ['**'], dest: './../dist/<%= filename %>/sources',
            filter: function(srcPath)  {
              //no node_modules
              if (srcPath === 'node_modules' || contains(srcPath, 'node_modules\\')) {
                return false; 
              }
              if (srcPath === 'extern_modules' || contains(srcPath, 'extern_modules\\')) {
                return false; 
              }

              if (srcPath === 'build' || startsWith(srcPath, 'build\\')) {
                return false; 
              }

              if (endsWith(srcPath, '.gitignore')) {
                return false; 
              }
              if (endsWith(srcPath, 'localgrunt.config')) {
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
  

  // clean
  grunt.config.merge( { 
    'clean': {
      'release-dist': {
        options: { force: true },
        src: [ "./../dist/<%= filename %>"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");

  // zip
  grunt.config.merge( { 
    compress: { // build the zip files for the release 
      'release-lib': { // just the lib
        options: {archive: './../dist/<%= filename %>-lib.zip'},
        files: [{expand: true, cwd: './../dist/<%= filename %>/lib', src: ['**'],  dest: '/'}]
      },
      'release-doc': { // just the documentation
        options: {archive: './../dist/<%= filename %>-doc.zip'},
        files: [{expand: true, cwd: './../dist/<%= filename %>/doc', src: ['**'], dest: '/'}]
      },
      'release-sources' :  { // the full repository with out the git stuff
        options: { archive: './../dist/<%= filename %>-sources.zip'},
        files: [
          {expand: true, cwd: './../dist/<%= filename %>/sources', src: ['**'], dest: '/'},
        ]
      }
    },
  });



  grunt.loadNpmTasks('grunt-contrib-compress');

  //tasks
  grunt.registerTask('dist',[
    'build',
    'doc',
    'clean:release-dist',
    'copy:release-lib','copy:release-doc','copy:release-sources',
    'compress:release-lib','compress:release-doc','compress:release-sources']);
};

