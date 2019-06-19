var jasmineReporters = require('jasmine-reporters');


exports.config = {

    //seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,
    directConnect : true,

    suites: {
        	'AWS_shoppingcart': 'e2e/specs/orderIntegration/AWS/aws_shoppingcart.spec.js',   
        	'e2e': 'e2e/specs/orderIntegration/Azure/dnsZones.spec.js',
        	'budget': 'e2e/specs/orderIntegration/AWS/aws_BudgetOrderService.spec.js',
    },

    capabilities:
    {
        'browserName': 'chrome',

        // allows different specs to run in parallel.
        // If this is set to be true, specs will be sharded by file
        // (i.e. all files to be run by this set of capabilities will run in parallel).
        // Default is false.
        shardTestFiles: false,

        // Maximum number of browser instances that can run in parallel for this
        // set of capabilities. This is only needed if shardTestFiles is true.
        // Default is 1.
        maxInstances: 1,

       chromeOptions: {
            args: [
                //'disable-extensions', 'disable-infobars', 'no-sandbox', '--disable-web-security','--disable-dev-shm-usage'
                'start-maximized', 'disable-extensions', 'disable-infobars', 'no-sandbox','--disable-dev-shm-usage'
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
        password: 'Gravitant123$',
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
        toolsIntegrator.postToSlack();

    }
};
