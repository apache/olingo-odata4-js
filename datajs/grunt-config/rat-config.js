module.exports = function(grunt) {
  grunt.config('rat', {
    options: { xml : true, tmpDir : './build/tmp' },
    src: {                      
      dir: './src',
    },
    test: {                      
      dir: './tests'
    },
    all: {
      all: ['./src','./tests']
    }
  });

  
  //grunt.loadNpmTasks('custom-tasks/rat');
  grunt.loadTasks('grunt-config/custom-tasks/rat/tasks');
  grunt.registerTask('license',['rat:src']);
};