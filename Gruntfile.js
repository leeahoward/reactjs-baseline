module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Project settings
        project: {
          // configurable paths
          src: require('./bower.json').appPath || 'src',
          dev: 'dev',
          dist: 'dist'
        },


        browserify: {
            options: {
                transform: ['reactify'],
            },
            dev: {
                options: {
                    debug: true
                },
                files: {
                    '<%= project.dev %>/lib/js/<%= pkg.name %>/index.js': ['<%= project.src %>/index.jsx']
                }
            },
            dist: {
                files: {
                    '<%= project.dist %>/lib/js/<%= pkg.name %>/index.js': ['<%= project.src %>/index.jsx']
                }
            }
        },

        sass: {
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= project.dev %>/lib/css/<%= pkg.name %>/application.css': ['<%= project.src %>/sass/application.scss']
                }
                },
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    '<%= project.dist %>/lib/css/<%= pkg.name %>/application.css': ['<%= project.src %>/sass/application.scss']
                }
            }
        },

        bower:{
            install:{
                options:{
                    targetDir:'src/lib'
                }
                //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
            }
        },

        // @TODO: Find a cleaner way to do this given the target path
        copy: {
            // this copies over all bower supplied resources to the lib folder
            dev: {
                files: [
                    {
                        expand:true,
                        cwd: '<%= project.src %>/lib',
                        src: ['**/*.{js,css}'], 
                        dest: '<%= project.dev %>/lib/'
                    }
                ]
            },
            dist: {
                files: [{
                  expand: true,
                  dot: true,
                  cwd: '<%= project.dev %>',
                  dest: '<%= project.dist %>',
                  src: [
                    '*.{ico,png,txt,html,cfm,cfc}',
                    '.htaccess'
                  ]
                }]
            },

            styles: {
                expand: true,
                cwd: '<%= project.src %>/styles',
                dest: '<%= project.dev %>/styles/',
                src: '{,*/}*.css'
            }
        },

        // for dist we use a .min.* for lets repalce some placeholders in the
        // index.html template
        replace: {
            dev: {
                options: {
                    patterns: [
                        {
                            match: 'pkg_name',
                            replacement: '<%= pkg.name %>'
                        }
                    ]
                },
                files: [
                    {expand: true, flatten: true, src: ['<%= project.src %>/index.html'], dest: '<%= project.dev %>'}
                ]
            },
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'pkg_name',
                            replacement: '<%= pkg.name %>.min'
                        }
                    ]
                },
                files: [
                    {expand: true, flatten: true, src: ['<%= project.src %>/index.html'], dest: '<%= project.dist %>'}
                ]
            }
        },

        clean: {
            dev:  ['<%= project.dev %>'],
            dist: ['<%= project.dist %>']
        },

        /*
        cssmin: {
            dev: {
                add_banner: {
                    options: {
                    },
                    files: {
                        '<%= project.dev %>/css/<%= pkg.name %>.min.css': ['<%= project.dev %>/css/<%= pkg.name %>.css']
                    }
                }
            },
            dist: {
                options: {
                },
                files: {
                    'dist/css/<%= pkg.name %>.min.css': ['dist/css/<%= pkg.name %>.css']
                }
            }
        },
        */ 

        asciify: {
            // fonts; http://www.figlet.org/examples.html
            appname: {
                text: 'ReactJS Baseline'
            },
            options:{
                font:'puffy',
                log: false
            }
        },

        /*
        uglify: {
            options: {
                // the banner is inserted at the top of the output
            },
            dist: {
                files: {
                  '<% =project.dist %>/js/<%= pkg.name %>.min.js': ['dist/js/<%= pkg.name %>.js'],
                }
            }
        },
        */

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
          html: '<%= project.dev %>/index.html',
          options: {
            dest: '<%= project.dist %>'
          }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
          html: ['<%= project.dist %>/{,*/}*.html'],
          css: ['<%= project.dist %>/lib/**/*.css'],
          options: {
            assetsDirs: ['<%= project.dist %>']
          }
        },


        watch: {
            //when sass files change compile them and copy to dev
            sass: {
                files: ['<%= project.src %>/sass/{,*/}*.{scss,sass}'],
                tasks: ['compile_sass_to_css_dev']
            },

            //watch project css files - typically compiled from sass,scss
            styles: {
              files: ['<%= project.src %>/lib/<%= pkg.name %>/{,*/}*.css'],
              tasks: ['copy:styles']
            },

            //watch all jsx files and compile as needed - creates js files in dev
            jsx: {
              files: ['<%= project.src %>/{,*/}*.jsx'],
              tasks: ['compile_jsx_teplates_dev']
            },

            //watch html files and replace text - copies to dev folder
            html: {
              files: ['<%= project.src %>/{,*/}*.html'],
              tasks: ['replace_html_text_dev']
            },

            livereload: {
              options: {
                livereload: '<%= connect.options.livereload %>'
              },
              files: [
                '<%= project.dev %>/**/*.html',
                '<%= project.dev %>/lib/**/*.css',
                '<%= project.dev %>/lib/**/*.js',
                '<%= project.dev %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
              ]
            }
        },


        // The actual grunt server settings
        connect: {
          options: {
            port: 9003,
            // Change this to '0.0.0.0' to access the server from outside.
            hostname: 'localhost',
            livereload: 35730
          },
          livereload: {
            options: {
              open: true,
              base: [
                '<%= project.dev %>',
              ]
            }
          },
          dist: {
            options: {
              base: '<%= project.dist %>'
            }
          }
        }

  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('copy_bower_resources_dev', ['copy:dev']);
  grunt.registerTask('replace_html_text_dev', ['replace:dev']);
  grunt.registerTask('compile_jsx_teplates_dev', ['browserify:dev']);
  grunt.registerTask('compile_sass_to_css_dev', ['sass:dev']);

  grunt.registerTask('dev', [
    'clean:dev',                  //clean up
    'copy_bower_resources_dev',   //bower resources  - copy to dev
    'replace_html_text_dev',      //replace html text - copy to dev 
    'compile_jsx_teplates_dev',   //process jsx templates - copy to dev
    'compile_sass_to_css_dev'     //compile sass to css - copy to dev
  ]);

  grunt.registerTask('dist', [
    'clean:dist',       //clean up
    'dev',              //build the dev version
    'copy:dist',
    'useminPrepare',
    //'asciify',
    'concat',
    'uglify',
    'cssmin',
    'usemin'
  ]);


  grunt.registerTask('serve', [
    'dev',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('default', [
    'dev'
  ]);

};