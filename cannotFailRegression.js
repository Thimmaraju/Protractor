var jasmineReporters = require('jasmine-reporters');
var specName;


exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    suites: {
        'ApprovalFlowCommon':'e2e/specs/orderIntegration/ApprovalFlowCommon.spec.js',
        'ordersIntegration':'e2e/specs/orderIntegration/ordersIntegration.spec.js',
        'orderIntegrationAWS':'e2e/specs/orderIntegration/AWS/orderIntegrationAWS.spec.js',
        'orderIntegrationAzure':'e2e/specs/orderIntegration/Azure/orderIntegrationAzure.spec.js',
        'orderIntegrationSL':'e2e/specs/orderIntegration/Softlayer/orderIntegrationSL.spec.js',
        'orderIntegrationVRA':'e2e/specs/orderIntegration/vra/orderIntegrationVRA.spec.js',
        'e2eAWS':'e2e/specs/orderIntegration/AWS/e2eAWS.spec.js',
        'e2eAzure':'e2e/specs/orderIntegration/Azure/e2eAzure.spec.js',
        'e2eVRA':'e2e/specs/orderIntegration/vra/e2eVRA.spec.js',
        'linuxVirtualServerICD':'e2e/specs/orderIntegration/ICD/linuxvirtualICD.spec.js',
        'orderTrackingICD':'e2e/specs/orderIntegration/ICD/orderTrackingICD.spec.js',
        'e2eDynamic': "e2e/specs/orderIntegration/vra/e2eDynamic.spec.js",
        'e2e3TierWithCustomProperties': "e2e/specs/orderIntegration/vra/e2e3TierWithCustomProperties.spec.js",
        'e2eXaasOutputProperties': "e2e/specs/orderIntegration/vra/e2eXaasOutputProperties.spec.js",
        //'e2eVTSXaaS': "e2e/specs/orderIntegration/vra/e2eVTSXaaS.spec.js",   
        'orderTrackingICDPrivateCloud': "e2e/specs/orderIntegration/ICD/orderTrackingICD_Private_Cloud.spec.js",
        'orderTrackingICDLinuxVirtualServer': "e2e/specs/orderIntegration/ICD/orderTrackingICD_LinuxVirtualServer.spec.js",
        /*'snowAcrobatInstance':"e2e/specs/orderIntegration/SNOW/acrobatInstance.spec.js",
        'snowBelkinIpadMini':"e2e/specs/orderIntegration/SNOW/belkinIpadMini.spec.js",
        'snowDevelopmentLaptop':"e2e/specs/orderIntegration/SNOW/developmentLaptop.spec.js",
        'snowExecutiveDesktop':"e2e/specs/orderIntegration/SNOW/executiveDesktop.spec.js",
        'snowNewEmailAccount':"e2e/specs/orderIntegration/SNOW/newEmailAccount.spec.js",
        'snowProcureIphone6s':"e2e/specs/orderIntegration/SNOW/procureIphone6s.spec.js",
        'snowTelephoneExtension':"e2e/specs/orderIntegration/SNOW/telephoneExtension.spec.js"*/
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
        password: 'Gravitant123!',
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
