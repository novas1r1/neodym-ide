/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
          files: [ "js/**/**/*.js"],
          tasks: [ 'browserify' ]
    },
    browserify: {
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        autoWatch: true,
        options: {
          files: ['tests/unit/**/*.spec.js']
        }
      }
    },
    jshint: {
        all: ['Gruntfile.js', 'js/controllers/**/*.js', 'js/services/**/*.js', 'js/directives/**/*.js', 'js/filters/**/*.js'],
        options: {
            reporter: require('jshint-html-reporter'),
            reporterOutput: 'js/misc/reports/jshint-report.html'
        }
    },
    nodewebkit: {
      options: {
        platforms: ['win64'],
        buildDir: '../code/builds',
      },
      src: ['../code/**/*']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  //how to?
  grunt.registerTask('browser', ['browserify']);

  //working
  grunt.registerTask('analyze', ['jshint']);

  //working
  grunt.registerTask('test', ['karma']);

  //working
  grunt.registerTask('build', ['nodewebkit']);

  grunt.registerTask('default', ['jshint', 'karma']);
};