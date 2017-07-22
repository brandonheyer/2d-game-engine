module.exports = function (grunt) {
  var config = {
    browserify: {
      dev: {
        src: [
          './src/index.js'
        ],
        dest: './dist/js/2d-engine.js',
        options: {
          watch: true,
          keepAlive: true,
          browserifyOptions: {
            debug: true
          },
          transform: [
            [
              "babelify",
              {
                "presets": [
                  "es2015"
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
