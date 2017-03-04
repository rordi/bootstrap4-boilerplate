module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt);
    require("time-grunt")(grunt);

    // ====================================================
    // bootstrap native js (bootstrap w/o jquery)
    // ====================================================

    var jsLibs = [
        'bower_components/bootstrap.native/dist/polyfill.js',
        'bower_components/bootstrap.native/dist/bootstrap-native-v4.js',
    ];

    // ====================================================
    // fonts setup
    // ====================================================

    var fonts = [
        'bower_components/font-awesome/fonts/*'
    ];

    // ====================================================
    // sass / css setup
    // ====================================================

    // All paths that should be considered when searching for sass dependencies
    var sassPaths = [
        'scss',
        'bower_components'
    ];

    // All css files that should be minified and combined into web/css/app.css
    var cssFiles = [
        "dist/css/app.css", // this file is created by grunt-sass
    ];

    // ====================================================
    // file path check
    // ====================================================

    // check that all files and path defined above are reachable / exist
    var files = [];
    files = files.concat(jsLibs, fonts, sassPaths);
    var filefail = false;
    var path = "";
    var tail = "";
    for(i = 0; i < files.length; i+=1) {
        path = files[i];
        if(path.indexOf("*") > -1) {
            tail = path.lastIndexOf("/");
            path = path.substr(0, tail);
        }
        if(!grunt.file.exists(path) && !grunt.file.isLink(path) && !grunt.file.isDir(path)) {
            filefail = true;
            grunt.log.write("WARNING: path referenced in Gruntfile.js does not exist: " + files[i] + "\n");
            grunt.log.write("   -->   is file: " + grunt.file.exists(path) + " /  is link: " + grunt.file.isLink(path) + " /  is dir: " + grunt.file.isDir(path) + "\n\n");
        }
    }
    if(filefail) {
        grunt.fail.warn("File check raised warnings. Review and fix issues (recommended) or use --force to continue. If you run grunt for the first time, make sure you run 'bower update' first.");
    }

    // ====================================================
    // Grunt task configurations
    // ====================================================

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        // ----------------------------------------------------
        // grunt-copy configuration
        // ----------------------------------------------------

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: fonts,
                        dest: "dist/fonts/",
                        flatten: true
                    },
                ]
            }
        },

        // ----------------------------------------------------
        // grunt-sass css compilation configuration
        // ----------------------------------------------------

        sass: {
            options: {
                includePaths: sassPaths
            },
            dist: {
                options: {
                    outputStyle: "compressed"
                },
                files: {
                    "dist/css/app.css": "scss/app.scss"
                }
            }
        },

        // ----------------------------------------------------
        // grunt-cssmin css minification configuration
        // ----------------------------------------------------

        cssmin: {
            options: {
                processImport: true, //load and process all @import resources
                keepBreaks: false,
                keepSpecialComments: 0 //remove all comments
            },
            target: {
                files: {
                    "dist/css/app.css": cssFiles
                }
            }
        },

        // ----------------------------------------------------
        // grunt-postcss auto vendor prefixing
        // ----------------------------------------------------

        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')
                ]
            },
            dist: {
                src: "dist/css/*.css"
            }
        },

        // ----------------------------------------------------
        // grunt-uglify javascript minification configuration
        // ----------------------------------------------------

        uglify: {
            options: {
                sourceMap: false,
                banner: "/*! minified with grunt, <%= grunt.template.today(\"dd-mm-yyyy\") %> - please contact EDIQO LLC for license information */\n",
                compress: {},
                mangle: true,  // "false" for development only - set to "true" for deployment -- avoids mangling var and function names
                beautify: false  // "true" for development only - set to "false" for deployment -- avoids compressing whitespaces and linebreaks
            },
            dist: {
                files: {
                    "dist/js/libs.min.js": [jsLibs]
                }
            }
        },

        // ----------------------------------------------------
        // grunt-watch configuration
        // ----------------------------------------------------

        watch: {
            css: {
                files: ["scss/*.scss", "scss/*/*.scss"],
                tasks: ["sass", "cssmin", "postcss"]
            },
            scripts: {
                files: ["js/*.js", "js/*/*.js"],
                tasks: ["uglify"],
                options: {
                    spawn: false,
                    debounceDelay: 500
                }
            }
        }

    }); //end of grunt tasks configs


    // ====================================================
    // Grunt modules loader
    // ====================================================

    grunt.loadNpmTasks("grunt-available-tasks"); // list available commands
    grunt.loadNpmTasks("grunt-contrib-watch"); // default grunt watch task
    grunt.loadNpmTasks("grunt-contrib-copy"); // copy files and folders
    grunt.loadNpmTasks("grunt-sass"); // compile sass code to css code
    grunt.loadNpmTasks("grunt-postcss"); // post-process css to auto add vendor prefixing
    grunt.loadNpmTasks("grunt-contrib-cssmin"); // concatenate and minify css code
    grunt.loadNpmTasks("grunt-contrib-uglify"); // concatenate and minify javascript


    // ====================================================
    // Grunt command shortcuts & alises
    // ====================================================
    // define grunt task CLI command shortcuts
    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("css", ["copy","sass","cssmin","postcss"]);
    grunt.registerTask("js", ["uglify"]);
    grunt.registerTask("all", ["js", "css"]);

};
