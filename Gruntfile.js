module.exports = function (grunt) {
  var config = {
    browserify: {
      dist: {
        src: [
          './src/**/*'
        ],
        dest: './dist/2d-engine.js',
        options: {
          browserifyOptions: {
            debug: true
          },
          transform: [
            [
              'babelify',
              {
                'presets': [
                  'env'
                ]
              }
            ]
          ]
        }
      }
    }
  };

  grunt.loadNpmTasks('grunt-browserify');

  grunt.initConfig(config);

  grunt.registerTask('default', ['browserify']);
};
