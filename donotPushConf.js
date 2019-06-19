var jasmineReporters = require('jasmine-reporters');

exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    /**
     * usage example:
     * protractor protractor.conf.js --specs=e2e/home.spec.js
     */
    suites: {

        //'store': 'e2e/specs/store/store.spec.js',
        //'storeMainPage': 'e2e/specs/store/storeCatalogMainPage.spec.js'
        'storeSearchPage': 'e2e/specs/store/searchWIP2.spec.js'
    },
    capabilities:
    {
        'browserName': 'chrome',
        chromeOptions: {
            args: [
                'disable-extensions'
            ]
        }
    },

    framework: 'jasmine2',
    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval : 5000000,
        allScriptsTimeout: 20000000,
        useAllAngular2AppRoots: true
    },

    params: {
        url:      'https://cb-qa-4.gravitant.net',
        username: 'cbadmn@outlook.com',
        password: 'Gravitant123#',
        postSlack: 'false'
    },

    onPrepare: async function () {
        require('./helpers/onPrepare.js');

        ensureConsumeHome();

        var myReporter = {
            suiteStarted: function(result) {
                console.log("Suite started: " + result.description);
            },
            specStarted: function(result) {
                console.log("Test started: " + result.description);
            },
            specDone: function(result) {
                console.log("Test "+result.status+": " + result.description);
                for(var i = 0; i < result.failedExpectations.length; i++)
                    console.log("Failure reason: " + result.failedExpectations[i].message);
                console.log("-------------------------------------------------------------------------------------------");
            },
            suiteDone: function(result) {
                console.log("Suite completed: " + result.description);
                console.log("===========================================================================================");
            }
        };

        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            savePath: 'testreports',
            consolidate: true,
            useDotNotation: true
        }));

    },

    onComplete: async function(){
        require('./updateTestRail.js');
        require('./helpers/utilToolsIntegration.js');

        await postToSlack().then(function () {
            generateHTMLReport('Store Test Suite');
        });

        /*
        Commented below functionality as it is encountering errors when enabling postToSlack function.
        This needs to be fixed.
         */

        // addRunAndUpdateResults().then(function(runId){
        //     console.log('Generated TestRail Report ID: '+runId);
        // });
    }
};
