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

    	'order#Integration': 'e2e/specs/orderIntegration/ordersIntegration.spec.js',
    	'order#Integration#ApprovalFlow': 'e2e/specs/orderIntegration/ApprovalFlowCommon.spec.js',
    	'order#Integration#VRA': 'e2e/specs/orderIntegration/vra/orderIntegrationVRA.spec.js',
    	'order#Integration#e2eVRA': 'e2e/specs/orderIntegration/vra/e2eVRA.spec.js',
    	'order#Integration#e2eAWS': 'e2e/specs/orderIntegration/AWS/e2eAWS.spec.js',
    	'order#Integration#e2eAzure': 'e2e/specs/orderIntegration/Azure/e2eAzure.spec.js',
    	'order#Integration#Azure': 'e2e/specs/orderIntegration/Azure/orderIntegrationAzure.spec.js',
    	'order#Integration#AWS': 'e2e/specs/orderIntegration/AWS/orderIntegrationAWS.spec.js',
    	'order#Integration#SL': 'e2e/specs/orderIntegration/Softlayer/orderIntegrationSL.spec.js',
        'smokeTestAmazon':'e2e/specs/smokeTest/smokeTestAmazon.spec.js',
        'smokeTestVRA':'e2e/specs/smokeTest/smokeTestVRA.spec.js',
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
        url:      'https://cb-qa-2.gravitant.net',
        username: 'cbadmn@outlook.com',
        password: 'Gravitant123#',
        postSlack: 'true'
    },

	plugins: [{
	    package: "jasmine2-protractor-utils",
	    disableHTMLReport: true,
	    disableScreenshot: false,
	    screenshotPath: "./testreports/screenshots",
	    screenshotOnExpectFailure:false,
	    screenshotOnSpecFailure:true,
	    clearFoldersBeforeTest: true
	  }],
    
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
