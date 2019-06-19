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
        'general#orders': 'e2e/specs/orders/orders.spec.js',
        'catalogPage': 'e2e/specs/catalog/catalog.spec.js',
        'catalogDetails': 'e2e/specs/catalog/catalogDetails.spec.js',
        'order#Integration': 'e2e/specs/orderIntegration/ordersIntegration.spec.js',
        'order#Integration#ApprovalFlow': 'e2e/specs/orderIntegration/ApprovalFlowCommon.spec.js',
        'order#Integration#VRA': 'e2e/specs/orderIntegration/vra/orderIntegrationVRA.spec.js',
        'order#Integration#e2eVRA': 'e2e/specs/orderIntegration/vra/e2eVRA.spec.js',
        'order#Integration#e2eAWS': 'e2e/specs/orderIntegration/AWS/e2eAWS.spec.js',
        'order#Integration#e2eAzure': 'e2e/specs/orderIntegration/Azure/e2eAzure.spec.js',
        'order#Integration#Azure': 'e2e/specs/orderIntegration/Azure/orderIntegrationAzure.spec.js',
        'order#Integration#AWS': 'e2e/specs/orderIntegration/AWS/orderIntegrationAWS.spec.js',
        'customer1#aws': 'e2e/specs/customer1/cust1_aws.spec.js',
        'customer1#vra': 'e2e/specs/customer1/cust1_vra.spec.js',
        'customer1': 'e2e/specs/customer1/cust1.spec.js',
        'smokeTestAmazon': 'e2e/specs/smokeTest/smokeTestAmazon.spec.js',
        'smokeTestVRA': 'e2e/specs/smokeTest/genericValidation.spec.js',
        'smokeTestVRA': 'e2e/specs/smokeTest/smokeTestVRA.spec.js',
        'store': 'e2e/specs/store/store.spec.js',
        'order#AWSRds': 'e2e/specs/orderIntegration/AWS/rdsAWS.spec.js',
        'order#AWSS3': 'e2e/specs/orderIntegration/AWS/s3AWS.spec.js',
        'order#AWSEfs': 'e2e/specs/orderIntegration/AWS/efsAWS.spec.js',
        'order#AWSSns': 'e2e/specs/orderIntegration/AWS/snsAWS.spec.js',
        'order#AWSSqs': 'e2e/specs/orderIntegration/AWS/sqsAWS.spec.js',
        'order#AWSDynamoDB': 'e2e/specs/orderIntegration/AWS/dynamoDBAWS.spec.js',
        'order#AWSRoute53Recordset': 'e2e/specs/orderIntegration/AWS/route53RecordSetAWS.spec.js',
        'order#AWSRoute53HostedZone': 'e2e/specs/orderIntegration/AWS/route53HostedZoneAWS.spec.js',
        'order#AWSRoute53HealthCheck': 'e2e/specs/orderIntegration/AWS/route53HealthCheckAWS.spec.js',
        'order#AWSKms': 'e2e/specs/orderIntegration/AWS/kmsAWS.spec.js',
        'order#AWSebs': 'e2e/specs/orderIntegration/AWS/ebsAWS.spec.js',
        'order#AWCloudFrontRTMPDistribution': 'e2e/specs/orderIntegration/AWS/cloudFrontRTMPDistribution.spec.js',
        'order#AWCloudFrontWebDistribution': 'e2e/specs/orderIntegration/AWS/cloudFrontWebDistribution.spec.js',
        'order#AWCloudTrail': 'e2e/specs/orderIntegration/AWS/cloudTrail.spec.js',
        'order#AWSCloudWatchLogs': 'e2e/specs/orderIntegration/AWS/cloudWatchLogsAWS.spec.js',
        'order#AWSNetworkELB': 'e2e/specs/orderIntegration/AWS/networkELBAWS.spec.js',
        'order#AWSApplicationELB': 'e2e/specs/orderIntegration/AWS/applicationLoadBalancerAWS.spec.js',
        'order#AWSClassicELB': 'e2e/specs/orderIntegration/AWS/classicELBAWS.spec.js',
        'order#AWSLambda': 'e2e/specs/orderIntegration/AWS/lambdaAWS.spec.js',
        'order#AWSConfig': 'e2e/specs/orderIntegration/AWS/configAWS.spec.js',
        'order#AWSElasticSearch': 'e2e/specs/orderIntegration/AWS/elasticSearchAWS.spec.js',
        'order#AWSRedshiftParameterGroup': 'e2e/specs/orderIntegration/AWS/redshiftParameterGroup.spec.js',
        'order#AWSRedshiftSubnetGroup': 'e2e/specs/orderIntegration/AWS/redshiftSubnetGroup.spec.js',
        'order#AWSElastiCacheMemcached': 'e2e/specs/orderIntegration/AWS/elasticacheMemcachedAWS.spec.js',
        'order#AWSelastiCacheSubnet': 'e2e/specs/orderIntegration/AWS/elasticacheSubnetAWS.spec.js',
        'order#AWSelastiCacheRedis': 'e2e/specs/orderIntegration/AWS/elasticacheRedisAWS.spec.js',
        'order#AWSglacier': 'e2e/specs/orderIntegration/AWS/glacierAWS.spec.js',
        'order#AWSec2NetworkInterface': 'e2e/specs/orderIntegration/AWS/ec2NetworkInterfaceAWS.spec.js',
        'order#AWSNetworkSecurityGroup': 'e2e/specs/orderIntegration/AWS/networkSecurityGroup.spec.js',
        'order#AWSKinesisDataFireHose': 'e2e/specs/orderIntegration/AWS/kinesisDataFireHoseAWS.spec.js',
        'order#AWSDataPipeline': 'e2e/specs/orderIntegration/AWS/dataPipelineAWS.spec.js',
        'order#AWSCloudWatchAlarms': 'e2e/specs/orderIntegration/AWS/cloudWatchAlarmsAWS.spec.js',
        'order#AWSRedshift': 'e2e/specs/orderIntegration/AWS/redshiftAWS.spec.js',
        'order#AWSRDSEventSubscription': 'e2e/specs/orderIntegration/AWS/rdsEventSubscriptionAWS.spec.js',
        'order#AWSRDSDBOptionGroup': 'e2e/specs/orderIntegration/AWS/rdsDBOptionGroupAWS.spec.js',
        'order#AWSRDSDBParameterGroup': 'e2e/specs/orderIntegration/AWS/rdsDBParameterGroupAWS.spec.js',
        'order#AWSRDSDBSubnetGroup': 'e2e/specs/orderIntegration/AWS/rdsDBSubnetGroupAWS.spec.js',
        'order#AWSElasticContainerService': 'e2e/specs/orderIntegration/AWS/elasticContainerServiceAWS.spec.js',
        'order#AWSElasticContainerRegistry': 'e2e/specs/orderIntegration/AWS/elasticContainerRegistryAWS.spec.js',
        'order#AWSVpc': 'e2e/specs/orderIntegration/AWS/vpcAWS.spec.js',
        'order#AWSEC2': 'e2e/specs/orderIntegration/AWS/ec2AWS.spec.js',
        'order#AWSReservedInstance': 'e2e/specs/orderIntegration/AWS/reservedInstanceAWS.spec.js',
        'order#shoppingCartAws': 'e2e/specs/orderIntegration/AWS/aws_shoppingcart.spec.js', 
        'order#BudgetOrderServiceAws': 'e2e/specs/orderIntegration/AWS/aws_BudgetOrderService.spec.js',       
        'order#AWSLambdaLayerVersion': 'e2e/specs/orderIntegration/AWS/lambdaLayerVersionAWS.spec.js',
        'order#GcpPD': 'e2e/specs/orderIntegration/Google/persistentdisk.spec.js',
        'order#GcpVPC': 'e2e/specs/orderIntegration/Google/vpc.spec.js',
        'order#GcpCompute': 'e2e/specs/orderIntegration/Google/computeGCP.spec.js',
        'order#GcpCloudStorage': 'e2e/specs/orderIntegration/Google/cloudstorage.spec.js',
        'order#GcpCloudDNS': 'e2e/specs/orderIntegration/Google/CloudDnsGCP.spec.js',
        'order#GcpVmPowerOptions': 'e2e/specs/orderIntegration/Google/vmPowerOptions.spec.js',
        'order#GcpCloudSpanner': 'e2e/specs/orderIntegration/Google/cloudSpanner.spec.js',
        'order#GcpUdpLoadBalancing': 'e2e/specs/orderIntegration/Google/LoadBalancingGCP.spec.js',
        'order#GcpTcpLoadBalancer': 'e2e/specs/orderIntegration/Google/tcpLoadBalancing.spec.js',
        'order#GcpPubSub': 'e2e/specs/orderIntegration/Google/pubsub.spec.js',
        'order#GcpCart': 'e2e/specs/orderIntegration/Google/gcp_shoppingcart.spec.js',
	'order#GcpBudget': 'e2e/specs/orderIntegration/Google/budgetaryUnit.spec.js',
	'order#GcpBudgetMultiUser': 'e2e/specs/orderIntegration/Google/budgetaryUnitMultiUser.spec.js'
    },
    capabilities:
    {
        'browserName': 'chrome',
        chromeOptions: {
            args: [
                'disable-extensions',
                '--window-size=1920,1080'
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
        username: '*******',
        password: '********'
    },

    onPrepare: async function () {
        require('./helpers/onPrepare.js');
        // require('./helpers/APIs/registerUsers.js');
        // await registerUsers().then(function(body){
        //     console.log(body)
        // });
        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            savePath: 'testreports',
            consolidate: true,
            useDotNotation: true
        }));
        ensureConsumeHome();
    },
    onComplete: async function () {
        require('./updateTestRail.js')
        await addRunAndUpdateResults().then(function (runId) {
            console.log(runId);
        })
    }
};
