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
        browsers: sauce ? Object.keys(customLaunchers) : ['Firefox'],

        files: [
            'temp/test/index.js'
        ],

        preprocessors: {
          'temp/test/*.js': ['coverage']
        },

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-mocha-reporter',
            'karma-coverage',
            'karma-coveralls'
        ].concat(sauce ? 'karma-sauce-launcher' : []),

        reporters: ['mocha', 'coverage', 'coveralls'],

        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {type: 'lcov'}
            ],
        },

        customLaunchers: customLaunchers
    });
};
