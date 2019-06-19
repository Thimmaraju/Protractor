var jasmineReporters = require('jasmine-reporters');
var specName;


exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    suites: {
        //'orderIntegrationAzure1':'e2e/specs/orderIntegration/Azure/orderIntegrationAzure.spec.js',
        // //'e2eAzure':'e2e/specs/orderIntegration/Azure/e2eAzure.spec.js',
        'e2eAzure_AppServiceEnvironment':'e2e/specs/orderIntegration/Azure/appServiceEnvironment.spec.js',
        'e2eAzure_AppServicePlan':'e2e/specs/orderIntegration/Azure/appServicePlan.spec.js',
        'e2eAzure_AvailabilitySet':'e2e/specs/orderIntegration/Azure/availabilitySet.spec.js',
        'e2eAzure_BatchAccount':'e2e/specs/orderIntegration/Azure/batchAccount.spec.js',
        'e2eAzure_ContainerInstance':'e2e/specs/orderIntegration/Azure/containerInstance.spec.js',
        'e2eAzure_ContainerRegistry':'e2e/specs/orderIntegration/Azure/containerRegistry.spec.js',
        'e2eAzure_CosmosDB':'e2e/specs/orderIntegration/Azure/cosmosDB.spec.js',
        'e2eAzure_CreateImageFromVM':'e2e/specs/orderIntegration/Azure/createImageFromVM.spec.js',
        'e2eAzure_DnsZones':'e2e/specs/orderIntegration/Azure/dnsZones.spec.js',
        'e2eAzure_DDosPlan':'e2e/specs/orderIntegration/Azure/ddosProtectionPlan.spec.js',
        'e2eAzure_EventHub':'e2e/specs/orderIntegration/Azure/eventHub.spec.js',
        'e2eAzure_ExpressRouteCircuit':'e2e/specs/orderIntegration/Azure/expressRouteCircuit.spec.js',
        'e2eAzure_FileService':'e2e/specs/orderIntegration/Azure/fileService.spec.js',
        'e2eAzure_Keyvault':'e2e/specs/orderIntegration/Azure/keyVault.spec.js',
        'e2eAzure_LinuxVirtualMachine':'e2e/specs/orderIntegration/Azure/linuxVM.spec.js',
        'e2eAzure_LinuxVirtualMachineOperations':'e2e/specs/orderIntegration/Azure/linuxVMoperations.spec.js',
        'e2eAzure_LoadBalancer':'e2e/specs/orderIntegration/Azure/loadBalancer.spec.js',
        'e2eAzure_ManagedDisk':'e2e/specs/orderIntegration/Azure/managedDisk.spec.js',
        'e2eAzure_NetworkInterface':'e2e/specs/orderIntegration/Azure/networkInterface.spec.js',
        'e2eAzure_NetworkSecurityGroup':'e2e/specs/orderIntegration/Azure/networkSecurityGroup.spec.js',
        'e2eAzure_NotificationHubNamespace':'e2e/specs/orderIntegration/Azure/nhNamespace.spec.js',
        'e2eAzure_NotificationHub':'e2e/specs/orderIntegration/Azure/notificationHub.spec.js',
        'e2eAzure_PublicIP':'e2e/specs/orderIntegration/Azure/publicIP.spec.js',
        'e2eAzure_QueueService':'e2e/specs/orderIntegration/Azure/queueService.spec.js',
        'e2eAzure_RecoveryServiceVault':'e2e/specs/orderIntegration/Azure/recoveryServiceVault.spec.js',
        'e2eAzure_RedisCache':'e2e/specs/orderIntegration/Azure/redisCache.spec.js',
        'e2eAzure_Relay':'e2e/specs/orderIntegration/Azure/relay.spec.js',
        'e2eAzure_ServiceBus':'e2e/specs/orderIntegration/Azure/serviceBus.spec.js',
        'e2eAzure_SqlDatabase':'e2e/specs/orderIntegration/Azure/sqlDatabase.spec.js',
        'e2eAzure_SqlElasticPool':'e2e/specs/orderIntegration/Azure/sqlElasticPool.spec.js',
        'e2eAzure_SqlServer':'e2e/specs/orderIntegration/Azure/sqlServer.spec.js',
        'e2eAzure_StorageAccount':'e2e/specs/orderIntegration/Azure/storageAccount.spec.js',
        'e2eAzure_TableStorage':'e2e/specs/orderIntegration/Azure/tableStorage.spec.js',
        'e2eAzure_VirtualNetwork':'e2e/specs/orderIntegration/Azure/virtualNetwork.spec.js',
        'e2eAzure_WebApp':'e2e/specs/orderIntegration/Azure/webApp.spec.js',
        'e2eAzure_WebAppOnLinuxMySql':'e2e/specs/orderIntegration/Azure/webAppOnLinxMySql.spec.js',
        'e2eAzure_WebAppSql':'e2e/specs/orderIntegration/Azure/webAppSQL.spec.js',
        'e2eAzure_WindowsVirtualMachine':'e2e/specs/orderIntegration/Azure/windowsVM.spec.js',
        'e2eAzure_WindowsVirtualMachineOperations':'e2e/specs/orderIntegration/Azure/windowsVMoperations.spec.js'

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
