module.exports = function(grunt) {
  grunt.config('rat', {
    options: { xml : true, tmpDir : './build/tmp' },
    src: {                      
      dir: './src',
    },
    test: {                      
      dir: './tests'
    },
  });

 
  grunt.loadTasks('grunt-config/custom-tasks/rat/tasks');
  grunt.registerTask('license',['rat:src','rat:test']);
};