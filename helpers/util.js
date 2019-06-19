/**
 * Helper functions used by different specs are defined in this class
 */
"use strict";
var logGenerator = require("./logGenerator.js"),
	logger = logGenerator.getApplicationLogger();
var now = new Date();
var sysuserApikey = require("../testData/APIs/sysUserAPICreds.json");
var jsonUtil = require('./jsonUtil.js');

function getCurrentURL() {
	return browser.getCurrentUrl().then(function (currentUrl) {
		logger.info("the current URL is = " + currentUrl)
		return currentUrl;
	})
}

/**
 * This function Generates a random string which will be used to make any name (policy,content,identity,response or any other input)
 * unique
 */
function getRandomString(charLength) {
	var randomText = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < charLength; i++)
		randomText += possible.charAt(Math.floor(Math.random() * possible.length));
	return randomText;
}

/**
 * Returns a random integer between range [min, max] including both min and max
 * @param min - smallest integer of the range
 * @param max - largest integer of the range
 * @returns {*} - an integer between min and max (both inclusive)
 */
function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomNumber(numberLength) {
	return Math.floor(Math.pow(10, numberLength - 1) + Math.random() * 9 * Math.pow(10, numberLength - 1));
}

// This function requires webelement as parameter and will take you that particular webelement on page
function scrollToWebElement(el) {
	return browser.executeScript('arguments[0].scrollIntoView()', el.getWebElement());
}

// This function will scroll to bottom of page
function scrollToBottom() {
	return browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
}

function scrollToTop() {
	return browser.executeScript('window.scrollTo(0,0)');
}

// This Function is used to verify whether a String array is sorted based on 'ascending' or 'descending' passed value
function verifyStringSorting(el, sortValue) {
	return el.getText().then(function (name) {
		var sorted = [];
		for (var i = 0; i < name.length; i++) {
			if (name[i] != undefined && name[i] != '') {
				sorted.push(name[i].toLowerCase());
			}
		}
		if (sortValue == 'ascending') {
			for (var i = 0; i <= sorted.length - 2; i++) {
				if (sorted[i] > sorted[i + 1]) {
					return false;
				}
			}
		}
		if (sortValue == 'descending') {
			for (var i = 0; i <= sorted.length - 2; i++) {
				if (sorted[i] < sorted[i + 1]) {
					return false;
				}
			}
		}
		return true;
	})
}

// This Function is used to verify whether a String array is sorted based on 'ascending' or 'descending' passed value (With Attribute Name)
function verifyStringSortingWithAttrName(el, attrName, sortValue) {
	return el.getAttribute(attrName).then(function (name) {
		var sorted = [];
		for (var i = 0; i < name.length; i++) {
			if (name[i] != undefined && name[i] != '') {
				sorted.push(name[i].toLowerCase());
			}
		}
		if (sortValue == 'ascending') {
			for (var i = 0; i <= sorted.length - 2; i++) {
				if (sorted[i] > sorted[i + 1]) {
					return false;
				}
			}
		}
		if (sortValue == 'descending') {
			for (var i = 0; i <= sorted.length - 2; i++) {
				if (sorted[i] < sorted[i + 1]) {
					return false;
				}
			}
		}
		return true;
	})
}

// This Function is used to verify whether a Number array is sorted based on 'ascending' or 'descending' passed value
function verifyNumberSorting(el, sortValue) {
	return el.getText().then(function (order) {
		var neworder = [];
		for (var counter = 0; counter <= order.length - 1; counter++) {
			if (order[counter] != '-') {
				neworder.push(Number(order[counter]));
			}
		}
		if (sortValue == 'ascending') {
			for (var i = 0; i <= neworder.length - 1; i++) {
				if (neworder[i] > neworder[i + 1]) {
					return false;
				}
			}
		}
		if (sortValue == 'descending') {
			for (var i = 0; i <= neworder.length - 1; i++) {
				if (neworder[i] < neworder[i + 1]) {
					return false;
				}
			}
		}
		return true;
	});
}

function getbrowserType() {
	return browser.getCapabilities().then(function (cap) {
		return cap.get('browserName');
	});
}

function getOSType() {
	return browser.getCapabilities().then(function (cap) {
		return cap.get('platform');
	});
}

/**
 * This function returns current date time string in 'yyyy/mm/dd hh:mm UTC' format.
 */

function getCurrentDateTimeUTCFormat() {

	// new Date(value) has some problem in IE browser. Hence not running this code on IE
	return 0;

	if (browserType() == 'chrome') {
		var currentDateTime = new Date();
		var date = '' + (currentDateTime.getUTCDate());
		var month = '' + (currentDateTime.getUTCMonth() + 1);
		var year = currentDateTime.getUTCFullYear();
		var minutes = currentDateTime.getUTCMinutes();
		var hours = currentDateTime.getUTCHours();
		var seconds = currentDateTime.getUTCSeconds();

		if (month.length < 2) month = '0' + month;
		if (date.length < 2) date = '0' + date;
		logger.info(year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ' ' + 'UTC');
		return year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ' ' + 'UTC';

	}
	else {
		logger.info('Brower: Not chrome: skipping Modification time check');
		return 0
	}
}

/**
 * Returns the date of the previous day in JSON format
 * @returns {number}
 */
function getDatePreviousDay() {
	return now.toJSON(now.setHours((now.getHours() - 24)));
}

function getDatePreviousWeek() {
	return now.toJSON(now.setHours((now.getHours() - (24 * 7))));
}

function getDatePreviousMonth() {
	return now.toJSON(now.setMonth((now.getMonth() - 1)));
}

function getDatePreviousThreeMonths() {
	return now.toJSON(now.setMonth((now.getMonth() - 3)));
}

function getDatePreviousSixMonths() {
	return now.toJSON(now.setMonth((now.getMonth() - 6)));
}

function getDatePreviousYear() {
	return now.toJSON(now.setMonth((now.getMonth() - 12)));
}

function waitForAngular() {
	var EC = protractor.ExpectedConditions;
	browser.waitForAngular();
	//browser.wait(EC.invisibilityOf(element(by.css('carbon-loading'))), 300000);
	//browser.wait(EC.invisibilityOf(element(by.css('.bx--loading'))), 300000);
	//browser.wait(EC.invisibilityOf(element(by.css('.bx--loading__svg'))), 300000);
	return element.all(by.css('.bx--loading__svg')).then(function(textArray){
		for (var i = 0; i < textArray.length; i++) {
			browser.wait(EC.invisibilityOf(textArray[i]), 5*60*1000);
		}

	});
}

function getLoggedInUserName(userName) {
	var str1 = username.replace("@",",");
	var str2 = str1.replace(".com"," ");
	console.log(str2);
}

function getDropDownLabelIndexBasedOnName(jsonObject, labelName) {

	for (var index = 0; index < jsonObject.dropdownLabels.length; index++) {
		if (jsonObject.dropdownLabels[index].label == labelName) {
			logger.info('Index of ' + labelName + ' is: ' + index);
			return index;
		}
	}
}

function getTextInputLabelIndexBasedOnName(jsonFileObject, labelName) {
	var jsonObject = jsonFileObject;
	var paramLabelName = labelName;
	for (var i = 0; i < jsonObject.textinputdetails.length; i++) {
		if (jsonObject.textinputdetails[i].label == paramLabelName) {
			logger.info('Index of ' + paramLabelName + ' is: ' + i);
			return i;
		}
	}
}

function getRadioButtonLabelIndexBasedOnName(jsonFileObject, labelName) {
	var jsonObject = jsonFileObject;
	var paramLabelName = labelName;
	for (var i = 0; i < jsonObject.radioButtonLabels.length; i++) {
		if (jsonObject.radioButtonLabels[i].label == paramLabelName) {
			logger.info('Index of ' + paramLabelName + ' is: ' + i);
			return i;
		}
	}
}

function generateRuntimeSpecString(suitesList) {
	var specArray = [];
	var suitesArray = suitesList.split(",");
	var suitesLength = suitesArray.length;
	for (var i = 0; i < suitesLength; i++) {
		//Common Specsfile
		if (suitesArray[i] == "ApprovalFlowCommon")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/ApprovalFlowCommon.spec.js");
		if (suitesArray[i] == "ordersIntegration")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/ordersIntegration.spec.js");
		//Orders Specs
		if (suitesArray[i] == "orders")
			specArray.splice(i, 0, "e2e/specs/orders/orders.spec.js");
		if (suitesArray[i] == "shoppingBagOrders")
			specArray.splice(i, 0, "e2e/specs/orders/shoppingBagOrders.spec.js");
		
		//Store Specs
		if (suitesArray[i] == "configurationPageToShowHideFields")
			specArray.splice(i, 0, "e2e/specs/store/configurationPageToShowHideFields.spec.js");
		if (suitesArray[i] == "storeCatalogMainPage")
			specArray.splice(i, 0, "e2e/specs/store/storeCatalogMainPage.spec.js");
		if (suitesArray[i] == "store")
			specArray.splice(i, 0, "e2e/specs/store/store.spec.js");
		if (suitesArray[i] == "currencyConversion")
			specArray.splice(i, 0, "e2e/specs/store/currencyConversion.spec.js");
		
		//AWS Specs
		if (suitesArray[i] == "e2eAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/e2eAWS.spec.js");
		if (suitesArray[i] == "orderIntegrationAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/orderIntegrationAWS.spec.js");
		if (suitesArray[i] == "dynamoDBAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/dynamoDBAWS.spec.js");
		if (suitesArray[i] == "efsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/efsAWS.spec.js");
		if (suitesArray[i] == "rdsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/rdsAWS.spec.js");
		if (suitesArray[i] == "s3AWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/s3AWS.spec.js");
		if (suitesArray[i] == "snsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/snsAWS.spec.js");
		if (suitesArray[i] == "sqsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/sqsAWS.spec.js");
		if (suitesArray[i] == "kmsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/kmsAWS.spec.js");
		if (suitesArray[i] == "ebsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/ebsAWS.spec.js");
		if (suitesArray[i] == "route53RecordSetAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/route53RecordSetAWS.spec.js");
		if (suitesArray[i] == "route53HostedZoneAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/route53HostedZoneAWS.spec.js");
		if (suitesArray[i] == "route53HealthCheckAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/route53HealthCheckAWS.spec.js");
		if (suitesArray[i] == "cloudTrailAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/cloudTrail.spec.js");
		if (suitesArray[i] == "cloudFrontRTMPAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/cloudFrontRTMPDistribution.spec.js");
		if (suitesArray[i] == "cloudFrontWebAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/cloudFrontWebDistribution.spec.js");
		if (suitesArray[i] == "cloudWatchLogsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/cloudWatchLogs.spec.js");
		if (suitesArray[i] == "networkELBAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/networkELBAWS.spec.js");
		if (suitesArray[i] == "applicationELBAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/applicationLoadBalancerAWS.spec.js");
		if (suitesArray[i] == "classicELBAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/classicELBAWS.spec.js");
		if (suitesArray[i] == "lambdaAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/lambdaAWS.spec.js");
		if (suitesArray[i] == "configAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/configAWS.spec.js");
		if (suitesArray[i] == "elasticSearchAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/elasticSearchAWS.spec.js");
		if (suitesArray[i] == "redshiftParamGroupAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/redshiftParameterGroup.spec.js");
		if (suitesArray[i] == "redshiftSubnetGroupAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/redshiftSubnetGroup.spec.js");
		if (suitesArray[i] == "elasticacheMemcachedAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/elasticacheMemcachedAWS.spec.js");
		if (suitesArray[i] == "elasticacheRedisAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/elasticacheRedisAWS.spec.js");
		if (suitesArray[i] == "elasticacheSubnetAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/elasticacheSubnetAWS.spec.js");
		if (suitesArray[i] == "glacierAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/glacierAWS.spec.js");
		if (suitesArray[i] == "ec2NetworkInterfaceAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/ec2NetworkInterfaceAWS.spec.js");
		if (suitesArray[i] == "networkSecurityGroupAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/networkSecurityGroup.spec.js");
		if (suitesArray[i] == "kinesisDataFireHoseAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/kinesisDataFireHoseAWS.spec.js");
		if (suitesArray[i] == "dataPipelineAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/dataPipelineAWS.spec.js");
		if (suitesArray[i] == "cloudWatchAlarmsAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/cloudWatchAlarmsAWS.spec.js");
		if (suitesArray[i] == "redshiftAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/redshiftAWS.spec.js");
		if (suitesArray[i] == "rdsEventSubscription")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/rdsEventSubscriptionAWS.spec.js");
		if (suitesArray[i] == "rdsDBOptionGroup")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/rdsDBOptionGroupAWS.spec.js");
		if (suitesArray[i] == "rdsDBParameterGroup")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/rdsDBParameterGroupAWS.spec.js");
		if (suitesArray[i] == "rdsDBSubnetGroup")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/rdsDBSubnetGroupAWS.spec.js");
	    if (suitesArray[i] == "elasticContainerService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/elasticContainerServiceAWS.spec.js");	
		if (suitesArray[i] == "elasticContainerRegistry")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/elasticContainerRegistryAWS.spec.js");
		if (suitesArray[i] == "vpcAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/vpcAWS.spec.js");
		if (suitesArray[i] == "ec2AWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/ec2AWS.spec.js");
		if (suitesArray[i] == "reservedInstanceAWS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/reservedInstanceAWS.spec.js");
		if (suitesArray[i] == "shoppingCartAws")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/aws_shoppingcart.spec.js");
		if (suitesArray[i] == "budgetOrderServiceAws")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/aws_BudgetOrderService.spec.js");
		if (suitesArray[i] == "lambdaLayerVersion")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/AWS/lambdaLayerVersionAWS.spec.js");

		//Google Specs
		if (suitesArray[i] == "computeGCP")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/computeGCP.spec.js");
		if (suitesArray[i] == "persistentdisk")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/persistentdisk.spec.js");
		if (suitesArray[i] == "vpc")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/vpc.spec.js");
		if (suitesArray[i] == "cloudStorage")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/cloudstorage.spec.js");
		if (suitesArray[i] == "cloudDns")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/CloudDnsGCP.spec.js");
		if (suitesArray[i] == "vmPowerStates")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/vmPowerOptions.spec.js");
		if (suitesArray[i] == "cloudSpanner")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/cloudSpanner.spec.js");
		if (suitesArray[i] == "udpLoadBalancing")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/LoadBalancingGCP.spec.js");
		if (suitesArray[i] == "tcpLoadBalancing")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/tcpLoadBalancing.spec.js");
		if (suitesArray[i] == "pubSub")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/pubsub.spec.js");
		if (suitesArray[i] == "gcpCart")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/gcp_shoppingcart.spec.js");
		if (suitesArray[i] == "gcpBudget")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/budgetaryUnit.spec.js");
		if (suitesArray[i] == "gcpMultiUserBudget")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Google/budgetaryUnitMultiUser.spec.js");	

		//Azure Specs

		if (suitesArray[i] == "e2eAzure")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/e2eAzure.spec.js");
		if (suitesArray[i] == "orderIntegrationAzure")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/orderIntegrationAzure.spec.js");
		if (suitesArray[i] == "AzureAppServiceEnvironment")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/appServiceEnvironment.spec.js");
		if (suitesArray[i] == "AzureAppServicePlan")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/appServicePlan.spec.js");
		if (suitesArray[i] == "AzureAvailabilitySet")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/availabilitySet.spec.js");
		if (suitesArray[i] == "AzureBudgetOrder")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/azureBudgetOrder.spec.js");
		if (suitesArray[i] == "AzureCartFeatures")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/azureCartFeatures.spec.js");
		if (suitesArray[i] == "AzureBatchAccount")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/batchAccount.spec.js");
		if (suitesArray[i] == "AzureContainerInstance")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/containerInstance.spec.js");
		if (suitesArray[i] == "AzureContainerRegistry")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/containerRegistry.spec.js");
		if (suitesArray[i] == "AzureCosmosDB")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/cosmosDB.spec.js");
		if (suitesArray[i] == "AzureCreateImageFromVM")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/createImageFromVM.spec.js");
		if (suitesArray[i] == "AzureDdosPlan")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/ddosProtectionPlan.spec.js");
		if (suitesArray[i] == "AzureDnsZones")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/dnsZones.spec.js");
		if (suitesArray[i] == "AzureEventHub")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/eventHub.spec.js");
		if (suitesArray[i] == "AzureExpressRouteCircuit")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/expressRouteCircuit.spec.js");
		if (suitesArray[i] == "AzureFileService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/fileService.spec.js");
		if (suitesArray[i] == "AzureKeyVault")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/keyVault.spec.js");
		if (suitesArray[i] == "AzureLinuxVM")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/linuxVM.spec.js");
		if (suitesArray[i] == "AzureLinuxVMoperations")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/linuxVMoperations.spec.js");
		if (suitesArray[i] == "AzureLoadBalancer")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/loadBalancer.spec.js");
		if (suitesArray[i] == "AzureManagedDisk")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/managedDisk.spec.js");
		if (suitesArray[i] == "AzureMultiUserBudget")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/multiUserBudgetService.spec.js");	
		if (suitesArray[i] == "AzureNetworkInterface")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/networkInterface.spec.js");
		if (suitesArray[i] == "AzureNetworkSecurityGroup")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/networkSecurityGroup.spec.js");
		if (suitesArray[i] == "AzureNhNamespace")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/nhNamespace.spec.js");
		if (suitesArray[i] == "AzureNotificationHub")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/notificationHub.spec.js");
		if (suitesArray[i] == "AzurePublicIP")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/publicIP.spec.js");
		if (suitesArray[i] == "AzureQueueService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/queueService.spec.js");
		if (suitesArray[i] == "AzureRecoveryServiceVault")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/recoveryServiceVault.spec.js");
		if (suitesArray[i] == "AzureRedisCache")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/redisCache.spec.js");
		if (suitesArray[i] == "AzureRelay")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/relay.spec.js");
		if (suitesArray[i] == "AzureServiceBus")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/serviceBus.spec.js");
		if (suitesArray[i] == "AzureShoppingBag")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/azureShoppingBagOrders.spec.js");
		if (suitesArray[i] == "AzureSqlDatabase")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/sqlDatabase.spec.js");
		if (suitesArray[i] == "AzureSqlElasticPool")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/sqlElasticPool.spec.js");
		if (suitesArray[i] == "AzureSqlServer")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/sqlServer.spec.js");
		if (suitesArray[i] == "AzureStorageAccount")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/storageAccount.spec.js");
		if (suitesArray[i] == "AzureTableStorage")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/tableStorage.spec.js");
		if (suitesArray[i] == "AzureVirtualNetworkGateway")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/virtualNetworkGateway.spec.js");
		if (suitesArray[i] == "AzureVirtualNetwork")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/virtualNetwork.spec.js");
		if (suitesArray[i] == "AzureWebAppOnLinxMySql")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/webAppOnLinxMySql.spec.js");
		if (suitesArray[i] == "AzureWebApp")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/webApp.spec.js");
		if (suitesArray[i] == "AzureWebAppSQL")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/webAppSQL.spec.js");
		if (suitesArray[i] == "AzureWindowsVM")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/windowsVM.spec.js");
		if (suitesArray[i] == "AzureWindowsVMoperations")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/windowsVMoperations.spec.js");
		if (suitesArray[i] == "AzureApplicationSecurityGroup")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Azure/applicationSecurityGroup.spec.js");


		//VRA Specs
		if (suitesArray[i] == "e2eVRA")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eVRA.spec.js");
		if (suitesArray[i] == "orderIntegrationVRA")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/orderIntegrationVRA.spec.js");
		if (suitesArray[i] == "e2eXaaS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eXaaS.spec.js");
		if (suitesArray[i] == "e2eDynamic")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eDynamic.spec.js");
		if (suitesArray[i] == "e2eXaasOutputProperties")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eXaasOutputProperties.spec.js");
		if (suitesArray[i] == "e2e3TierWithCustomProperties")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2e3TierWithCustomProperties.spec.js");
		if (suitesArray[i] == "e2eDynamicDropdown")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eDynamicDropdown.spec.js");
		if (suitesArray[i] == "e2eVTSXaaS")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eVTSXaaS.spec.js");
		if (suitesArray[i] == "e2eCostCenterDetails")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eCostCenterDetails.spec.js");
		if (suitesArray[i] == "e2eAddAmazonAcct")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eAddAmazonAcct.spec.js");
		if (suitesArray[i] == "e2e3tierWithDiffInputs")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2e3tierWithDiffInputs.spec.js");
		if (suitesArray[i] == "e2eCentOsHideExpressions")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eCentOsHideExp.spec.js");
		if (suitesArray[i] == "e2eCentOS66VRA74")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eCentOS66VRA74.spec.js");
		if (suitesArray[i] == "e2eTier3VRA74")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eTier3VRA74.spec.js");
		if (suitesArray[i] == "e2eCentOSCustomAttributeVRA74")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/e2eCentOSCustomAttributeVRA74.spec.js");
		if (suitesArray[i] == "privateCloudShoppingBagOrders")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/vra/privateCloudShoppingBagOrders.spec.js");
		
			
		 //Budgetary Units specs
		if (suitesArray[i] == "budgetaryUnitDetails")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/budget/budgetaryUnitDetails.spec.js");
		
		//Snow-Droplet specs
		if (suitesArray[i] == "AzureDnsZonesDroplets")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/snowDroplet/dnsZonesDroplets.spec.js");
		if (suitesArray[i] == "AzureCosmosDBDroplets")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/snowDroplet/cosmosDBDroplets.spec.js");
		if (suitesArray[i] == "AwsS3SnowDroplets")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/snowDroplet/s3AWSDroplets.spec.js.spec.js");
		if (suitesArray[i] == "centos65VRADroplets")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/snowDroplet/centos65VRADroplets.spec.js");
		
		
		//Softlayer Specs
		if (suitesArray[i] == "orderIntegrationSL")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/orderIntegrationSL.spec.js");
		if (suitesArray[i] == "blockStorageEndurance")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/blockStorageEndurance.spec.js");
		if (suitesArray[i] == "citrixNetscalerVPX")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/citrixNetscalerVPX.spec.js");
		if (suitesArray[i] == "CloudLoadBalancer")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/CloudLoadBalancer.spec.js");
		if (suitesArray[i] == "dnsForwardZoneService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/dnsForwardZoneService.spec.js");
		if (suitesArray[i] == "fileStorageEndurance")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/fileStorageEndurance.spec.js");
		if (suitesArray[i] == "localLoadBalancer")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/localLoadBalancer.spec.js");
		if (suitesArray[i] == "securityGroupRuleService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/securityGroupRuleService.spec.js");
		if (suitesArray[i] == "securityGroupService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/securityGroupService.spec.js");
		if (suitesArray[i] == "networkGatewayAppliance")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/networkGatewayAppliance.spec.js");
		if (suitesArray[i] == "objectStorageAccountSwift")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/objectStorageAccountSwift.spec.js");
		if (suitesArray[i] == "hardwareFirewall")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/hardwareFirewall.spec.js");
		if (suitesArray[i] == "hardwareFirewallPolicy")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/hardwareFirewallPolicy.spec.js");
		if (suitesArray[i] == "contentDeliveryNetwork")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/contentDeliveryNetwork.spec.js");
		if (suitesArray[i] == "autoScaleGroup")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/autoScaleGroup.spec.js");
		if (suitesArray[i] == "autoScalePolicy")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/autoScalePolicy.spec.js");
		if (suitesArray[i] == "recordForForwardZoneDnsService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/recordForForwardZoneDnsService.spec.js");
		if (suitesArray[i] == "ipSecVPN")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/ipSecVPN.spec.js");
		if (suitesArray[i] == "multiVLANFirewall")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/multiVLANFirewall.spec.js");
		if (suitesArray[i] == "dedicatedHost")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/dedicatedHost.spec.js");
		if (suitesArray[i] == "subnet")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/subnet.spec.js");
		if (suitesArray[i] == "fileStoragePerformance")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/fileStoragePerformance.spec.js");
		if (suitesArray[i] == "blockStoragePerformance")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/blockStoragePerformance.spec.js");
		if (suitesArray[i] == "dnsReverseRecord")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/dnsReverseRecord.spec.js");
		if (suitesArray[i] == "hardwareFirewallShared")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/hardwareFirewallShared.spec.js");
		if (suitesArray[i] == "autoScaleGroupPolicyTrigger")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/autoScaleGroupPolicyTrigger.spec.js");
		if (suitesArray[i] == "objectStorageAccountS3")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/objectStorageAccountS3.spec.js");
		if (suitesArray[i] == "SSLCertificate")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/SSLCertificate.spec.js");
		if (suitesArray[i] == "virtualServerPower")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/virtualServerPower.spec.js");
		if (suitesArray[i] == "dedicatedVirtualServer")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/dedicatedVirtualServer.spec.js");
		if (suitesArray[i] == "softlayerShoppingBagOrders")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/softlayerShoppingBagOrders.spec.js");
		if (suitesArray[i] == "softlayerMultiUserIPSecVPN")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/softlayerMultiUserIPSecVPN.spec.js");
		if (suitesArray[i] == "softlayerBudgetOrderService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/softlayerBudgetOrderService.spec.js");
		if (suitesArray[i] == "registryService")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/registryService.spec.js");
		if (suitesArray[i] == "djangoApp")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/Softlayer/djangoApp.spec.js");

		//ICD Specs
		if (suitesArray[i] == "linuxvirtualICD")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/ICD/linuxvirtualICD.spec.js");
		if (suitesArray[i] == "orderTrackingICD")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/ICD/orderTrackingICD.spec.js");
		if (suitesArray[i] == "orderTrackingICDPrivateCloud")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/ICD/orderTrackingICD_Private_Cloud.spec.js");
		if (suitesArray[i] == "orderTrackingICDLinuxVirtualServer")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/ICD/orderTrackingICD_LinuxVirtualServer.spec.js");

		//SNOW Specs
		if (suitesArray[i] == "snowAcrobatInstance")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/SNOW/acrobatInstance.spec.js");
		if (suitesArray[i] == "snowBelkinIpadMiniCase")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/SNOW/belkinIpadMini.spec.js");
		if (suitesArray[i] == "snowDevelopmentLaptop")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/SNOW/developmentLaptop.spec.js");
		if (suitesArray[i] == "snowExecutiveDesktop")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/SNOW/executiveDesktop.spec.js");
		if (suitesArray[i] == "snowNewEmailAccount")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/SNOW/newEmailAccount.spec.js");
		if (suitesArray[i] == "snowIphone6s")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/SNOW/procureIphone6s.spec.js");
		if (suitesArray[i] == "snowTelephoneExtension")
			specArray.splice(i, 0, "e2e/specs/orderIntegration/SNOW/telephoneExtension.spec.js");

	}
	return specArray;
}

function cmpValues(jsonObject, locatorName, text) {

	var flag = false;
	var expValue;

	var fieldArr = locatorName.split("_");
	expValue = jsonUtil.getValue(jsonObject, fieldArr[0]);

	if (text == expValue) {
		logger.info("The value for " + fieldArr[0] + " is succesfully validated on Orders Service Details as :" + expValue);
		flag = true;
	}

	return flag;

}


module.exports = {
	getCurrentURL: getCurrentURL,
	getRandomString: getRandomString,
	getRandomInteger: getRandomInteger,
	scrollToWebElement: scrollToWebElement,
	scrollToBottom: scrollToBottom,
	scrollToTop: scrollToTop,
	verifyStringSorting: verifyStringSorting,
	verifyStringSortingWithAttrName: verifyStringSortingWithAttrName,
	verifyNumberSorting: verifyNumberSorting,
	getbrowserType: getbrowserType,
	getCurrentDateTimeUTCFormat: getCurrentDateTimeUTCFormat,
	getOSType: getOSType,
	waitForAngular: waitForAngular,
	getLoggedInUserName: getLoggedInUserName,
	getRandomNumber: getRandomNumber,
	getDropDownLabelIndexBasedOnName: getDropDownLabelIndexBasedOnName,
	getTextInputLabelIndexBasedOnName: getTextInputLabelIndexBasedOnName,
	getRadioButtonLabelIndexBasedOnName: getRadioButtonLabelIndexBasedOnName,
	generateRuntimeSpecString: generateRuntimeSpecString,
	getDatePreviousDay: getDatePreviousDay,
	getDatePreviousWeek: getDatePreviousWeek,
	getDatePreviousMonth: getDatePreviousMonth,
	getDatePreviousThreeMonths: getDatePreviousThreeMonths,
	getDatePreviousSixMonths: getDatePreviousSixMonths,
	getDatePreviousYear: getDatePreviousYear,
	cmpValues: cmpValues
};
