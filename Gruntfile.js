module.exports = function (grunt) {
  var config = {
    browserify: {
      dist: {
        src: [
          './src/**/*'
        ],
        dest: './dist/2d-engine.js',
        options: {
          alias: {
            '2d-engine': './src/index.js'
          }
        }
      },
      examples: {
        files: [{
          expand: true,
          src: [
            './dist/examples/**/main.js'
          ],
          ext: '.min.js',
          extDot: 'first'
        }],
        options: {

          external: [
            '2d-engine'
          ]
        }
      },
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
  };

  grunt.loadNpmTasks('grunt-browserify');

  grunt.initConfig(config);

  grunt.registerTask('default', ['browserify']);
};
