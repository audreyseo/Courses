module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: {ownership: '/*\n Web App <%= pkg.name %> by <%= pkg.author %> on <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'},
    processhtml: {
      dev: {
        options: {
          process: true,
          strip: true
        },
        files: {
          'public/index.html': ['index.html']
        }
      },
      prod: {
      	options: {
          process: true,
          strip: true
        },
        files: {
          'public/index.html': ['index.html']
        }
      }
    },
    concat: {
    	dev: {
    		files: {
    			"public/js/app.js": ["app/app.module.js"],
    			"public/js/factory.js": ["app/*.factory.js"],
    			"public/js/controller.js": ["app/*.controller.js"],
    			"public/js/directive.js": ["app/*.directive.js"],
    			"public/js/service.js": ["app/*.service.js"],
    			"public/js/filter.js": ["app/*.filter.js"],
    			"public/js/jquery.js": ["js/jquery.js"] //, "node_modules/bootstrap/dist/js/bootstrap.min.js"]
    		}
    	},
      prod: {
        files: {
          "public/js/app.js":["app/app.module.js", "app/*!(.module).js"],
          "public/js/jquery.js": ["js/animation.js", "node_modules/bootstrap/dist/js/bootstrap.min.js"]
        }
      }
    },
    uglify: {
      options: {
        banner: "<%= banner.ownership %>"
      },
      prod:
      {
        files:
        {
          "public/js/app.min.js":["app/app.module.js","app/c*.js", "app/fcm-*.js"],
          "public/js/jquery.min.js": ["public/js/jquery.js"],
        }
      }
    },
    less: {
      dev: {
      	options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: 'public/css/<%= pkg.name %>.css.map'
        },
        files: {
          "public/css/pretty.css": "less/*.less",
        }
      },
      pretty: {
      	options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'pretty.css.map',
          sourceMapFilename: 'public/css/pretty.css.map'
        },
        src: "less/*.less",
        dest: "public/css/pretty.css"
      }
    },
    cssmin:
    {
      options: {banner: "<%= banner.ownership %>"},
      dev:
      {
        files:
        {
          "public/css/pretty.min.css": "public/css/pretty.css"
//          "public/css/bootstrap.min.css": "public/css/bootstrap.css"
        }
      }
    },
    srcs: {src: ['app/app.module.js', 'app/app.config.js', 'app/*!(.mocks|.spec).js', 'app/**/*(!(.mocks|.spec)).js'], 
           test: 'app/**/*.spec.js'},
    exec: {
      exitCodes: [0, 1], 
      copyPages: {
        cmd: function() {
          return 'cp templates/*.html public/templates/* ; cp server.js public/';
        }
      },
      serve: {
        cmd: function() {
          return 'node server.js';
        }
      },
      movereports: {
        exitCodes: [0, 1], 
        cmd: function() {
          var templateA = 'mv build/reports/';
          var templateB = "* build/reports/";
          var string1 = templateA + 'coverage/report-';
          var string2 = templateB + 'old/coverage/report-';
          var strings = ["clover/", "html/", "lcov/"];
          var command = "";
          for (var report in strings) {
            var name = strings[report];
            command += string1 + name + string2 + name + " ;";
          }
          string1 = templateA + 'junit/';
          string2 = templateB + 'old/junit/';

          command += string1 + "*.xml" + string2 + ";";
          return command;
        }
      }
    },

    config: {
      LOG_DEBUG: "DEBUG",
      LOG_INFO: "INFO",
      LOG_DISABLE: "OFF"
    },
    
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      shh: {
      	configFile: 'karma.conf.js',
      	logLevel: 'OFF',
      	browsers: ['Chrome']
      },
      chrome: {
        browsers: ['Chrome']
      },
      chromes: {
      	configFile: 'karma.conf.js',
        logLevel: this.config.LOG_INFO,
        autoWatch: true,
        singleRun: false,
        concurrency: "Infinity",
        browsers: ['Chrome']
      },
      chrometest: {
      	configFile: 'karma.conf.js',
      	logLevel: this.config.LOG_DEBUG,
        browsers: ['Chrome']
      },
      dev: {
      	configFile: 'karma.conf.js',
      	coverageReporter: {
          type: 'text-summary'
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'app/*.js', 'tests/**/*.js'],
      options: {
        reporter: require('jshint-stylish'),
        globals: {
          jQuery: true
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });
  grunt.loadNpmTasks('grunt-exec');
  //grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-processhtml');

  // MY TASKS:
	
  // Moving and proofreading-related tasks
  grunt.registerTask('clean', ['exec:movereports']);
  grunt.registerTask('proofread', ['jshint']);
  
  // Server
  grunt.registerTask('serve', ['exec:serve']);
	
  // Testing
  grunt.registerTask('test', ['clean', 'karma:chrome']);
  grunt.registerTask('shh', ['clean', 'karma:shh']);
  grunt.registerTask('buildtest', ['clean', 'karma:chrometest']);
  grunt.registerTask('default', ['jshint', 'karma:chrome']);
  grunt.registerTask('dev', ['jshint', 'karma:dev']);
  
  // Building tasks
  grunt.registerTask('dev', ['processhtml:dev', 'concat:dev','less:pretty', 'cssmin:dev']);
  grunt.registerTask('devs', ['dev', 'serve']);
  grunt.registerTask('build', ['processhtml:prod', 'concat:prod','less:pretty', 'uglify:prod', 'cssmin:dev']);
  grunt.registerTask('builds', ['build', 'serve']); 
};

replaceAll = function(search, replacement, look) {
      var target = look;
      return target.replace(new RegExp(search, 'g'), replacement);
};
function todaysDate() {
            var today = new Date();
            today.setDate(today.getDate());

            var day = today.getDate();
            var month = 1 + today.getMonth();

            var dateOptions = {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'EDT', hour: '2-digit', minute: '2-digit', second: '2-digit'};
            //today = today.toLocaleFormat("%a %e %B %Y %I.%M.%S %p %Z");
            today = replaceAll(':', '.', today.toLocaleString(dateOptions));
            ////console.log("Today: " + today);
            today = replaceAll('/', ' ', today);
            ////console.log('Month: ' + month.toString());
            today = today.replace(month.toString(), "DAY");
            today = today.replace(day.toString(), "MONTH");
            ////console.log("Today: " + today);
            
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            today = today.replace("MONTH", months[month - 1]);
            today = today.replace("DAY", day.toString());
}
