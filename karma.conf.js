// Karma configuration
// Generated on Tue Jul 05 2016 16:21:32 GMT-0400 (EDT)
replaceAll = function(search, replacement, look) {
      var target = look;
      return target.replace(new RegExp(search, 'g'), replacement);
};
var today = new Date();
today.setDate(today.getDate());

var day = today.getDate();
var month = 1 + today.getMonth();

var dateOptions = {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'EDT', hour: '2-digit', minute: '2-digit', second: '2-digit'};
today = replaceAll(':', '.', today.toLocaleString(dateOptions));
today = replaceAll('/', ' ', today);
today = today.replace(month.toString(), "DAY");
today = today.replace(day.toString(), "MONTH");

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

today = today.replace("MONTH", months[month - 1]);
today = today.replace("DAY", day.toString());


module.exports = function(config) {
//  console.log('DISABLE: ' + typeof config.LOG_DISABLE);
  console.log("DISABLE: " + config.LOG_DISABLE);
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '/Users/audrey/Personal/Programming/Workspace/react/',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [/*'mocha',*/'jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'isomorphic/system/modules/ISC_core.js',
      'isomorphic/system/modules/ISC_Foundation.js',
      'isomorphic/system/modules/ISC_Containers.js',
      'isomorphic/system/modules/ISC_Grids.js',
      'isomorphic/system/modules/ISC_Forms.js',
      'isomorphic/system/modules/ISC_DataBinding.js',
      'node_modules/jquery/dist/jquery.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-touch/angular-touch.js',
      'node_modules/angular-animate/angular-animate.js',
      'node_modules/angular-ui-grid/ui-grid.min.js',
      //'templates/*.html',
      'app/app.module.js',
      'app/*.!(module).js', 
       {pattern: 'tests/*.spec.js', included: true} 
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      //'templates/*.html':['html2js', 'ng-html2js'],
		//'app/*.js':['coverage'],
                //'app/**/*.js':['coverage'],
     // 'app/**/!(*.mock|*.spec).js':'coverage',
      'app/!(*.mock|*.spec).js':'coverage'
    },
    
   /* ngHtml2JsPreprocessor: {
      moduleName: 'Templates',
      stripPrefix: '.*//*Workspace/LearnOLL/',
      cacheIdFromPath: function(filePath) {
        console.log("Path: " + filePath);
        return filePath.match(/\/templates\/.*\.html/);
      }
    },*/
    
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'coverage', 
      'progress',
      'junit'
    ],

    coverageReporter: {
      dir: 'build/reports/coverage',
      reporters: [
        {type: 'lcov', subdir: ('report-lcov/' + today)},
        {type: 'html', subdir: ('report-html/' + today)},
        {type: 'clover', subdir: 'report-clover', file: (today + '-clover.xml')},
        {type: 'text-summary'}
      //file: '',
      ],
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },
    
    junitReporter: {
      outputDir: 'build/reports/junit', // results will be saved as $outputDir/$browserName.xml
      outputFile: today + ".xml", // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: false, //true, // add browser name to report and classes names
      nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      properties: {} // key value pair of properties to add to the <properties> section of the report
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    //logLevel: config.LOG_DISABLE,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    //autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],// 'PhantomJS_Custom'],
    


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true//,
    //singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    //concurrency: Infinity
  });
  console.log(config.logLevel);
};
