module.exports = function(grunt) {
  grunt.config('rat', {
    options: { xml : true, tmpDir : './build/tmp' },
    src: {                      
      dir: './src',
    },
    test: {                      
      dir: './tests'
    },
    'src-manual': {                      
      options: { xml : false, tmpDir : './build/tmp' },
      dir: './src',
    },
    'test-manual': {                      
      options: { xml : false, tmpDir : './build/tmp' },
      dir: './tests'
    },

  });

 
  grunt.loadTasks('grunt-config/custom-tasks/rat/tasks');
  grunt.registerTask('custom-license-check',['rat:src','rat:test']);
};