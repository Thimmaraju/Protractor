var jasmineReporters = require('jasmine-reporters');


exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    suites: {
//    	'indiviualservices':'e2e/specs/inventory/individual_service_actions.spec.js'
    	'placeOrders':'e2e/specs/inventory/placeOrders.spec.js',
    	'sort':'e2e/specs/inventory/sort.spec.js',
    	'pagination':'e2e/specs/inventory/pagination.spec.js',
    	'filters':'e2e/specs/inventory/filters.spec.js',
    	'search':'e2e/specs/inventory/search.spec.js',
    	'vra_edit_flow_d2ops':'e2e/specs/inventory/vra_edit_flow_d2ops.js',
    	'vra_e2e_d2ops_flow':'e2e/specs/inventory/vra_e2e_d2ops_flow.js',
    	'delete_orders':'e2e/specs/inventory/delete_orders.js'
    	
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
        url:      'https://cb-qa-d2ops-test.gravitant.net',
        username: 'cloud.brokertest@gmail.com',
        password: 'Cloudbroker',
        postSlack: 'false'
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
        jasmine.getEnv().addReporter(myReporter);
        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            savePath: 'testreports',
            consolidate: true,
            useDotNotation: true
        }));
            
    },
    onComplete: async function(){
    	var toolsIntegrator =  require('./helpers/utilToolsIntegration.js');
        toolsIntegrator.generateHTMLReport('CannotFail Regression  Suite');
//        toolsIntegrator.postToSlack();

        /*Commented as HTML reports were not generated
         * require('./updateTestRail.js');
        require('./helpers/utilToolsIntegration.js');
        await postToSlack().then(function () {
            generateHTMLReport('Cannot-Fail-Test-Execution');
        });*/
        /*
        Commented below functionality as it is encountering errors when enabling postToSlack function.
        This needs to be fixed.
         */

        // addRunAndUpdateResults().then(function(runId){
        //     console.log('Generated TestRail Report ID: '+runId);
        // });
    }
};
