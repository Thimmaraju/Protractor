var jasmineReporters = require('jasmine-reporters');
var specName;


exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    suites: {
        'GCP1':'e2e/specs/orderIntegration/Google/pubsub.spec.js',
        'GCP2':'e2e/specs/orderIntegration/Google/cloudstorage.spec.js',
        'GCP3':'e2e/specs/orderIntegration/Google/CloudDnsGCP.spec.js',
        'GCP4':'e2e/specs/orderIntegration/Google/persistentdisk.spec.js',
        'GCP5':'e2e/specs/orderIntegration/Google/vpc.spec.js',
        'GCP6':'e2e/specs/orderIntegration/Google/LoadBalancingGCP.spec.js',
        'GCP7':'e2e/specs/orderIntegration/Google/tcpLoadBalancing.spec.js',
        'GCP8':'e2e/specs/orderIntegration/Google/computeGCP.spec.js'
        
    },
    capabilities:
        {
            'browserName': 'chrome',
            shardTestFiles: false,
            maxInstances: 1,
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
        defaultTimeoutInterval: 5000000,
        allScriptsTimeout: 20000000,
        useAllAngular2AppRoots: true
    },

    params: {
        url: 'https://cb-qa-2.gravitant.net',
        username: 'cbadmn@outlook.com',
        password: 'Gravitant123#',
        postSlack: 'true',
        isProvisioningRequired : 'false'
    },

    plugins: [{
        package: "jasmine2-protractor-utils",
        disableHTMLReport: true,
        disableScreenshot: false,
        screenshotPath: "./testreports/screenshots",
        screenshotOnExpectFailure: false,
        screenshotOnSpecFailure: true,
        clearFoldersBeforeTest: false
    }],

    onPrepare: function () {
        require('./helpers/onPrepare.js');
        ensureConsumeHome();

        var myReporter = {
            suiteStarted: function (result) {
                console.log("Suite started: " + result.description);
            },
            specStarted: function (result) {
                console.log("Test started: " + result.description);
            },
            specDone: function (result) {
                console.log("Test " + result.status + ": " + result.description);
                for (var i = 0; i < result.failedExpectations.length; i++)
                    console.log("Failure reason: " + result.failedExpectations[i].message);
                console.log("-------------------------------------------------------------------------------------------");
            },
            suiteDone: function (result) {
                console.log("Suite completed: " + result.description);
                console.log("===========================================================================================");
            }
        };
        jasmine.getEnv().addReporter(myReporter);

        var number;
        do {
            number = Math.floor(Math.random() * 999);
        } while (number < 100);
        var junitReporter = new jasmineReporters.JUnitXmlReporter({
            consolidateAll: false,
            savePath: 'testreports',
            useDotNotation: true,
            //filePrefix: number,
            modifyReportFileName: function(generatedFileName, suite) {
                // this will produce distinct file names for each capability,
                // e.g. 'firefox.SuiteName' and 'chrome.SuiteName'
                specName=generatedFileName;
                return generatedFileName;
            }
        });
        jasmine.getEnv().addReporter(junitReporter);

        // jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
        //     savePath: 'testreports',
        //     consolidate: true,
        //     useDotNotation: true
        // }));

    },
    onComplete: async function () {
        // var toolsIntegrator = require('./helpers/utilToolsIntegration.js');
        // toolsIntegrator.generateHTMLReport('CannotFail AWS Regression Suite', specName);
        // toolsIntegrator.postToSlack(specName);

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
