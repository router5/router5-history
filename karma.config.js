// var argv = require('yargs').argv;

// var sauce  = argv.sauce;
// var travis = !!process.env.TRAVIS_JOB_NUMBER;

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],

        autoWatch: false,
        singleRun: true,

        // browsers: ['Firefox'],
        browsers: ['Firefox'],

        files: [
            'node_modules/router5/dist/browser/router5.js',
            'dist/browser/router5-history.js',
            'test/create-router.js',
            'test/main.js'
        ],

        preprocessors: {
          'dist/browser/router5-history.js': ['coverage']
        },

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-mocha-reporter',
            'karma-coverage',
            'karma-coveralls'
        ],

        reporters: ['mocha', 'coverage', 'coveralls'],

        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {type: 'lcov'}
            ],
        }
    });
};
