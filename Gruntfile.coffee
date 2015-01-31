module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    coffee:
      compile:
        options:
          sourceMap: true
        files:
          'main.js': ['src/base/**/*.coffee', 'src/app/**/*.coffee', 'src/*.coffee']

    jade:
      compile:
        files:
          'index.html': ['src/**/*.jade']

    watch:
      options:
        atBegin: true
      coffee:
        files: ['src/**/*.coffee']
        tasks: ['coffee:compile']
      jade:
        files: ['src/**/*.jade']
        tasks: ['jade:compile']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['coffee', 'jade']
