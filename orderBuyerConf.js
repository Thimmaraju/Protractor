var jasmineReporters = require('jasmine-reporters');

exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    /**
     * usage example:
     * protractor protractor.conf.js --specs=e2e/home.spec.js
     */
    /**
     * MuraliT-11/15: Commented below specs to test Jenkins integration with slack.
     * Will reset all once debugging is finished.
     */
    suites: {
        'general#orders': 'e2e/specs/orders/ordersBuyerLogin.spec.js'
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
        username: '',
		password: ''
    },

    onPrepare: function () {
        require('./helpers/onPrepare.js');
        // require('./helpers/APIs/registerUsers.js');
        // await registerUsers().then(function(body){
        //     console.log(body)
        // });
        ensureConsumeHome();
        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            savePath: 'testreports',
            consolidate: true,
            useDotNotation: true
        }));
    }
    /*onComplete: async function(){
        require('./updateTestRail.js')
        await addRunAndUpdateResults().then(function(runId){
            console.log(runId);
        })
    }*/
};
