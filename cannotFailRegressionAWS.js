var jasmineReporters = require('jasmine-reporters');
var specName;


exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    suites: {
        'AWS-dynamoDB': 'e2e/specs/orderIntegration/AWS/dynamoDBAWS.spec.js',
        'AWS-efs': 'e2e/specs/orderIntegration/AWS/efsAWS.spec.js',
        'AWS-rds': 'e2e/specs/orderIntegration/AWS/rdsAWS.spec.js',
        'AWS-s3': 'e2e/specs/orderIntegration/AWS/s3AWS.spec.js',
        'AWS-sns': 'e2e/specs/orderIntegration/AWS/snsAWS.spec.js',
        'AWS-sqs': 'e2e/specs/orderIntegration/AWS/sqsAWS.spec.js',
        'AWS-kms': 'e2e/specs/orderIntegration/AWS/kmsAWS.spec.js',
        'AWS-ebs': 'e2e/specs/orderIntegration/AWS/ebsAWS.spec.js',
        'AWS-route53RecordSet': 'e2e/specs/orderIntegration/AWS/route53RecordSetAWS.spec.js',
        'AWS-route53HostedZone': 'e2e/specs/orderIntegration/AWS/route53HostedZoneAWS.spec.js',
        'AWS-route53HealthCheck': 'e2e/specs/orderIntegration/AWS/route53HealthCheckAWS.spec.js',
        'AWS-applicationLoadBalancer': 'e2e/specs/orderIntegration/AWS/applicationLoadBalancerAWS.spec.js',
        'AWS-networkLoadBalancer': 'e2e/specs/orderIntegration/AWS/networkELBAWS.spec.js',
        'AWS-cloudWatchLogs': 'e2e/specs/orderIntegration/AWS/cloudWatchLogs.spec.js',
        'AWS-cloudFrontWebDistribution': 'e2e/specs/orderIntegration/AWS/cloudFrontWebDistribution.spec.js',
        'AWS-cloudFrontRTMPDistribution': 'e2e/specs/orderIntegration/AWS/cloudFrontRTMPDistribution.spec.js',
        'AWS-cloudTrail': 'e2e/specs/orderIntegration/AWS/cloudTrail.spec.js',
        'AWS-lambda': 'e2e/specs/orderIntegration/AWS/lambdaAWS.spec.js',
        'AWS-config': 'e2e/specs/orderIntegration/AWS/configAWS.spec.js',
        'AWS-elasticSearch': 'e2e/specs/orderIntegration/AWS/elasticSearchAWS.spec.js',
        'AWS-elasticacheRedis': 'e2e/specs/orderIntegration/AWS/elasticacheRedisAWS.spec.js',
        'AWS-elasticacheSubnet': 'e2e/specs/orderIntegration/AWS/elasticacheSubnetAWS.spec.js',
        'AWS-elasticacheMemcached': 'e2e/specs/orderIntegration/AWS/elasticacheMemcachedAWS.spec.js',
        'AWS-glacier': 'e2e/specs/orderIntegration/AWS/glacierAWS.spec.js',
        'AWS-redshift': 'e2e/specs/orderIntegration/AWS/redshiftAWS.spec.js',
        'AWS-redshiftParameterGroup': 'e2e/specs/orderIntegration/AWS/redshiftParameterGroup.spec.js',
        'AWS-redshiftSubnetGroup': 'e2e/specs/orderIntegration/AWS/redshiftSubnetGroup.spec.js',
        'AWS-networkSecurityGroup': 'e2e/specs/orderIntegration/AWS/networkSecurityGroup.spec.js',
        'AWS-kinesisDataFirehose': 'e2e/specs/orderIntegration/AWS/kinesisDataFireHoseAWS.spec.js',
        'AWS-dataPipeline': 'e2e/specs/orderIntegration/AWS/dataPipelineAWS.spec.js',
        'AWS-cloudWatchAlarms': 'e2e/specs/orderIntegration/AWS/cloudWatchAlarmsAWS.spec.js',
        'AWS-rdsEventSubscription': 'e2e/specs/orderIntegration/AWS/rdsEventSubscriptionAWS.spec.js',
        'AWS-rdsDBOptionGroup': 'e2e/specs/orderIntegration/AWS/rdsDBOptionGroupAWS.spec.js',
        'AWS-rdsDBParameterGroup': 'e2e/specs/orderIntegration/AWS/rdsDBParameterGroupAWS.spec.js',
        'AWS-rdsDBSubnetGroup': 'e2e/specs/orderIntegration/AWS/rdsDBSubnetGroupAWS.spec.js',
        'AWS-elasticContainerService':'e2e/specs/orderIntegration/AWS/elasticContainerServiceAWS.spec.js',
        'AWS-elasticContainerRegistry':'e2e/specs/orderIntegration/AWS/elasticContainerRegistryAWS.spec.js',
        'AWS-vpc':'e2e/specs/orderIntegration/AWS/vpcAWS.spec.js',
        'AWS-ec2':'e2e/specs/orderIntegration/AWS/ec2AWS.spec.js',
        'AWS-reservedInstance':'e2e/specs/orderIntegration/AWS/reservedInstanceAWS.spec.js',
        'AWS-shoppingCart': 'e2e/specs/orderIntegration/AWS/aws_shoppingcart.spec.js', 
        'AWS-BudgetOrderService': 'e2e/specs/orderIntegration/AWS/aws_BudgetOrderService.spec.js'    
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
        password: '********',
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
            modifyReportFileName: function (generatedFileName, suite) {
                // this will produce distinct file names for each capability,
                // e.g. 'firefox.SuiteName' and 'chrome.SuiteName'
                specName = generatedFileName;
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
