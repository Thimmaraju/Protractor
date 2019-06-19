var jasmineReporters = require('jasmine-reporters');
var specName;


exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    suites: {
       'SL1-blockStorageEndurance': 'e2e/specs/orderIntegration/Softlayer/blockStorageEndurance.spec.js',
       'SL2-blockStoragePerformance': 'e2e/specs/orderIntegration/Softlayer/blockStoragePerformance.spec.js',
       'SL3-fileStorageEndurance': 'e2e/specs/orderIntegration/Softlayer/fileStorageEndurance.spec.js',
       'SL4-fileStoragePerformance': 'e2e/specs/orderIntegration/Softlayer/fileStoragePerformance.spec.js', 
       'SL5-localLoadBalancer': 'e2e/specs/orderIntegration/Softlayer/localLoadBalancer.spec.js',
       'SL6-citrixNetscalerVPX': 'e2e/specs/orderIntegration/Softlayer/citrixNetscalerVPX.spec.js',
       'SL7-cloudLoadBalancer': 'e2e/specs/orderIntegration/Softlayer/CloudLoadBalancer.spec.js',
       'SL8-CDN': 'e2e/specs/orderIntegration/Softlayer/contentDeliveryNetwork.spec.js',
       'SL9-DNSForwardzone': 'e2e/specs/orderIntegration/Softlayer/dnsForwardZoneService.spec.js',
       'SL10-RecordforDNSForwardzone': 'e2e/specs/orderIntegration/Softlayer/recordForForwardZoneDnsService.spec.js',
       'SL11-dnsReverseRecord': 'e2e/specs/orderIntegration/Softlayer/dnsReverseRecord.spec.js',
       'SL12-dnsSecondaryZoneService': 'e2e/specs/orderIntegration/Softlayer/dnsSecondaryZoneService.spec.js',
       'SL13-hardwareFirewall': 'e2e/specs/orderIntegration/Softlayer/hardwareFirewall.spec.js',
       'SL14-hardwareFirewallShared': 'e2e/specs/orderIntegration/Softlayer/hardwareFIrewallShared.spec.js',
       'SL15-hardwareFirewallPolicy': 'e2e/specs/orderIntegration/Softlayer/hardwareFirewallPolicy.spec.js',
       'SL16-multiVLANFirewall': 'e2e/specs/orderIntegration/Softlayer/multiVLANFirewall.spec.js',
       'SL17-networkGatewayAppliance': 'e2e/specs/orderIntegration/Softlayer/networkGatewayAppliance.spec.js',
       'SL18-securityGroupRule': 'e2e/specs/orderIntegration/Softlayer/securityGroupRuleService.spec.js',
       'SL19-securityGroup': 'e2e/specs/orderIntegration/Softlayer/securityGroupService.spec.js',
       'SL20-subnet': 'e2e/specs/orderIntegration/Softlayer/subnet.spec.js',
       'SL21-dedicatedhost': 'e2e/specs/orderIntegration/Softlayer/dedicatedHost.spec.js',
       'SL22-ipSecVPN': 'e2e/specs/orderIntegration/Softlayer/ipSecVPN.spec.js',
       'SL23-autoScaleGroup': 'e2e/specs/orderIntegration/Softlayer/autoScaleGroup.spec.js',
       'SL24-autoScalePolicy': 'e2e/specs/orderIntegration/Softlayer/autoScalePolicy.spec.js',
       'SL25-autoScaleGroupPolicyTrigger': 'e2e/specs/orderIntegration/Softlayer/autoScaleGroupPolicyTrigger.spec.js',
       'SL26-VMPowerOperation':'e2e/specs/orderIntegration/Softlayer/virtualServerPower.spec.js',
       'SL27-SSLCertificate':'e2e/specs/orderIntegration/Softlayer/SSLCertificate.spec.js',
       'SL28-objectStorageS3': 'e2e/specs/orderIntegration/Softlayer/objectStorageAccountS3.spec.js',
       'SL29-dedicatedVirtualServer': 'e2e/specs/orderIntegration/Softlayer/dedicatedVirtualServer.spec.js',
       'SL30-softlayerShoppingBagOrders': 'e2e/specs/orderIntegration/Softlayer/softlayerShoppingBagOrders.spec.js',
       'SL31-softlayerBudgetOrderService': 'e2e/specs/orderIntegration/Softlayer/softlayerBudgetOrderService.spec.js',
       'SL32-softlayerMultiUserIPSecVPN': 'e2e/specs/orderIntegration/Softlayer/softlayerMultiUserIPSecVPN.spec.js',
       'SL33-registryService': 'e2e/specs/orderIntegration/Softlayer/registryService.spec.js',
       'SL34-djangoApp': 'e2e/specs/orderIntegration/Softlayer/djangoApp.spec.js',
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
        url: 'https://cb-qa-4-release.gravitant.net',
        username: 'cbadmn@outlook.com',
        password: 'Gravitant123$',
        isProvisioningRequired: 'true',
        postSlack: 'true'
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