/************************************************
	AUTHOR: SANTOSH HADAWALE
************************************************/
"use strict";
var logGenerator = require("./helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger(),
	jasmineReporters = require('jasmine-reporters'),
	Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter'),
	util = require("./helpers/util.js"),
	browser = process.env.Browser,
	environment = process.env.Environment,
	username = process.env.Email,
	password = process.env.Password,
	suitesList = process.env.Suites,
	isProvisioningRequired = process.env.isProvisioningRequired,
	postSlack = process.env.POST_TO_SLACK,
	currentDirectory = process.cwd();

if(browser == null)
	browser = "chrome"
	//browser = "firefox"
if(environment == null)
	environment = "cb-qa-4-release"
if(username == null)
	username = "cbadmn@outlook.com"
if(password == null)
	password = "Gravitant123$"
if(suitesList == null)
	suitesList = "currencyConversion"//"orderTrackingICDPrivateProviders,e2eDynamic,ApprovalFlowCommon,ordersIntegration,e2eAWS,orderIntegrationAWS,e2eAzure,orderIntegrationAzure,e2eVRA,orderIntegrationVRA,e2eXaaS,orderIntegrationSL,linuxvirtualICD,orderTrackingICD,e2eSNOW,dynamoDBAWS,ec2PowerStates,efsAWS,rdsAWS,s3AWS,snsAWS,sqsAWS,kmsAWS,ebsAWS,route53RecordSetAWS,route53PrivateHostedZoneAWS,route53PublicHostedZoneAWS,route53HealthCheckAWS,computeGCP,persistentdisk,vpc,gcpCart,blockStorageEndurance,citrixNetscalerVPX,CloudLoadBalancer,dnsForwardZoneService,fileStorageEndurance,localLoadBalancer,securityGroupRuleService,securityGroupService,snowAcrobatInstance,snowBelkinIpadMiniCase,snowDevelopmentLaptop,snowExecutiveDesktop,snowNewEmailAccount,snowIphone6s,snowTelephoneExtension,hardwareFirewallPolicy,hardwareFirewall,objectStorageAccountSwift,networkGatewayAppliance,contentDeliveryNetwork,snowAcrobatInstance,snowBelkinIpadMiniCase,snowDevelopmentLaptop,snowExecutiveDesktop,snowNewEmailAccount,snowIphone6s,snowTelephoneExtension,applicationELBAWS,networkELBAWS,cloudWatchLogsAWS,cloudFrontWebAWS,cloudFrontRTMPAWS,cloudTrailAWS,shoppingCartAws,autoScaleGroup,autoScalePolicy,recordForForwardZoneDnsService,dedicatedHost,multiVLANFirewall,ipSecVPN,cloudStorage,cloudDns,hardwareFirewallShared,dnsReverseRecord,blockStoragePerformance,fileStoragePerformance,autoScaleGroupPolicyTrigger,AzureApplicationSecurityGroup,AzureAppServiceEnvironment,AzureAppServicePlan,AzureAvailabilitySet,AzureBudgetOrder,AzureCartFeatures,AzureBatchAccount,AzureContainerInstance,AzureContainerRegistry,AzureCosmosDB,AzureCreateImageFromVM,AzureDdosPlan,AzureDnsZones,AzureEventHub,AzureExpressRouteCircuit,AzureFileService,AzureKeyVault,AzureLinuxVM,AzureLinuxVMoperations,AzureLoadBalancer,AzureManagedDisk,AzureMultiUserBudget,AzureNetworkInterface,AzureNetworkSecurityGroup,AzureNhNamespace,AzureNotificationHub,AzurePublicIP,AzureQueueService,AzureRecoveryServiceVault,AzureRedisCache,AzureRelay,AzureServiceBus,AzureShoppingBag,AzureSqlDatabase,AzureSqlElasticPool,AzureSqlServer,AzureStorageAccount,AzureTableStorage,AzureVirtualNetworkGateway,AzureVirtualNetwork,AzureWebAppOnLinxMySql,AzureWebApp,AzureWebAppSQL,AzureWindowsVM,AzureWindowsVMoperations,virtualServerPower,objectStorageAccountS3,SSLCertificate,dedicatedVirtualServer,softlayerShoppingBagOrders,softlayerMultiUserIPSecVPN,softlayerBudgetOrderService,registryService,djangoApp";
if(isProvisioningRequired == null)
	isProvisioningRequired = "false";
if(postSlack == null)
	postSlack = "false";

	
logger.info("******Printing Environment Variables*******")
logger.info("Test browser: "+browser)
logger.info("Test environment: "+environment)
logger.info("Username: "+username)
logger.info("Suites: "+suitesList)
logger.info("Provisioning: "+isProvisioningRequired)
logger.info("Post to Slack: "+postSlack)
logger.info("*******************************************")
var specArray = util.generateRuntimeSpecString(suitesList);
logger.info(specArray);

exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 1740000,
    useAllAngular2AppRoots: true,
    //directConnect: true,
    specs: specArray,
    
    /* capabilities: {
        browserName: browser,
        chromeOptions: {args: ["--headless","--disable-gpu","--window-size=1500,2000",'disable-extensions',"--test-type","--no-sandbox"]}
        //chromeOptions: {args: ['disable-extensions',"--test-type","--no-sandbox"]}

    },
    capabilities: {
        'browserName': browser,
        'moz:firefoxOptions': {
          'args': ['--safe-mode']
        }
      },*/
    
    framework: 'jasmine2',
    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval : 3000000,
        allScriptsTimeout: 20000000,
        useAllAngular2AppRoots: true
    },
    
    params: {
        url: "https://"+environment+".gravitant.net",
		username: username,
		password: password,
		postSlack: postSlack,
		isProvisioningRequired : isProvisioningRequired
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
					logger.info("Suite started: " + result.description);
		        },		        
		        specStarted: function(result) {
		        	logger.info("Test started: " + result.description);
		        },		        
		        specDone: function(result) {
		        	logger.info("Test "+result.status+": " + result.description);
		        	for(var i = 0; i < result.failedExpectations.length; i++)
		        		logger.info("Failure reason: " + result.failedExpectations[i].message);
		        	logger.info("-------------------------------------------------------------------------------------------");
		        },		        
				suiteDone: function(result) {
					logger.info("Suite completed: " + result.description);
					logger.info("===========================================================================================");
		        }	        
			 };
		jasmine.getEnv().addReporter(myReporter);
        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            savePath: 'testreports',
            consolidate: true,
            useDotNotation: true
        }));
        
        jasmine.getEnv().addReporter(
                new Jasmine2HtmlReporter({
                  savePath: 'screenshotreports',
                  takeScreenshots: true,
                  takeScreenshotsOnlyOnFailures: true,
                  fileNamePrefix: 'Regression_OrderIntegration',
                  fixedScreenshotName: true
                })
        );        
    },
    onComplete: async function(){
    	var reportGenerator =  require('./helpers/utilToolsIntegration.js');
		await postToSlack().then(function () {
            reportGenerator.generateHTMLReport('Order Integration Suite');
        });
    }
};

if(browser=="chrome"){
	exports.config["capabilities"] = {
        browserName: browser,
        //chromeOptions: {args: ["--headless","--disable-gpu","--window-size=1080,1920",'disable-extensions',"--test-type","--no-sandbox"]}
        chromeOptions: {args: ['disable-extensions',"--test-type","--no-sandbox"]}

    }

}else if(browser="firefox"){
	exports.config["capabilities"] = {
        'browserName': browser,
        'moz:firefoxOptions': {
     //  'args': ['--safe-mode']
        'args': ['--headless']
        }
      }

}

