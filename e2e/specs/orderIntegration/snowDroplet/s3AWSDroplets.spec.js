/**
Spec_Name: s3AWS.spec.js 
Description: This spec will cover AWS S3 - E2E : Verify instance Order Provision, Edition and Deletion is working fine from consume App .   
Author: Pushpraj Singh
*/

"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
	SNOWPage = require('../../../pageObjects/snow.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	isProvisioningRequired = browser.params.isProvisioningRequired,
	appUrls = require('../../../../testData/appUrls.json'),
	logGenerator = require("../../../../helpers/logGenerator.js"),
	snowApi = require('../../../../helpers/snowApiRequests.js'),
	logger = logGenerator.getApplicationLogger(),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
	s3InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSS3Instance.json');

describe('AWS - S3', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, inventoryPage, bucketName, logBucketName, S3INSObject, snowPage, sampleOrder1;
	var modifiedParamMap = {};
	var messageStrings = {
			providerName: 'Amazon',
			category: 'Storage',
			catalogPageTitle: 'Search, Select and Configure',
			inputServiceNameWarning: "Parameter Warning:",
			orderSubmittedConfirmationMessage: 'Order Submitted !',
	};

	beforeAll(function () {
		snowPage = new SNOWPage();
		ordersPage = new Orders();
		homePage = new HomePage();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		inventoryPage = new InventoryPage();
		browser.driver.manage().window().maximize();
	});

	beforeEach(function () {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		S3INSObject = JSON.parse(JSON.stringify(s3InstanceTemplate));
		serviceName = "TestAutomation" + util.getRandomString(5);
		bucketName = "buckettestaut" + util.getRandomString(5);
		bucketName = bucketName.toLowerCase();
		logBucketName = "logbuckettestaut" + util.getRandomString(5);
		logBucketName = logBucketName.toLowerCase();
		modifiedParamMap = { "Service Instance Name": serviceName, "Bucket Name": bucketName, "Log Bucket Name": logBucketName };
	});

	if (isProvisioningRequired == "true") {
		it('TC-C172282 : AWS S3 - E2E : Verify instance Order Provision is working fine from consume App for snow droplet', function () {
			var orderObject = {};
			catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
			catalogPage.clickConfigureButtonBasedOnName(s3InstanceTemplate.bluePrintName);
			orderObject.servicename = serviceName
			orderFlowUtil.fillOrderDetails(s3InstanceTemplate, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			var orderObject = {"orderNumber":sampleOrder1};
			orderFlowUtil.waitForOrderStatusChange(orderObject,'Approval In Progress');
			expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Approval In Progress');

			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalControllerText()).toMatch('SNOW');
			expect(snowPage.getApprovalText()).toMatch('Requested');
			expect(snowPage.getRequestedStateText()).toMatch('Pending Approval');
			expect(snowPage.getOrderNumberText()).toMatch(sampleOrder1);
			expect(snowPage.getBrokerRequestTypeText()).toMatch('New Provision Request');
			snowPage.approveTheServiceNowRequestFromSnowPortal();
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Approved');
			snowPage.verifytheApprovalLinkFromSnowPortal(sampleOrder1);
			expect(snowPage.getApproverStatus()).toMatch('Approved');			
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');			
			//snowPage.navigateToSnowPortal(sampleOrder1);
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Closed Complete');
			inventoryPage.open();
			expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);
		});
	}

	if (isProvisioningRequired == "true") {
		it('TC-C172282 : AWS S3 - E2E : Verify instance Order Provision after editing the order is working fine from consume App for snow droplet', function () {
			var orderObject = {};
			catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
			catalogPage.clickConfigureButtonBasedOnName(s3InstanceTemplate.bluePrintName);
			//serviceName = "TestAutomationdzWsK";
			orderObject.servicename = serviceName;

			var modifiedParamMap = { "EditService": true };
			orderFlowUtil.editService(orderObject);
			orderFlowUtil.fillOrderDetails(s3InstanceTemplate, modifiedParamMap).then(function () {
				logger.info("Edit parameter details are filled.");
				browser.sleep(5000);
			});
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();

			var orderObject = {"orderNumber":sampleOrder1};
			orderFlowUtil.waitForOrderStatusChange(orderObject,'Approval In Progress');
			expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Approval In Progress');

			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalControllerText()).toMatch('SNOW');
			expect(snowPage.getApprovalText()).toMatch('Requested');
			expect(snowPage.getRequestedStateText()).toMatch('Pending Approval');
			expect(snowPage.getOrderNumberText()).toMatch(sampleOrder1);
			expect(snowPage.getBrokerRequestTypeText()).toMatch('Edit/Modify Request');
			snowPage.approveTheServiceNowRequestFromSnowPortal();
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Approved');
			snowPage.verifytheApprovalLinkFromSnowPortal(sampleOrder1);
			expect(snowPage.getApproverStatus()).toMatch('Approved');			
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');			
			//snowPage.navigateToSnowPortal(sampleOrder1);
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Closed Complete');
			inventoryPage.open();
			expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);
		});
	}

	if (isProvisioningRequired == "true") {
		it('TC-C172282 : AWS S3 - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
			var orderObject = {};
			orderObject.servicename = serviceName;
			orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
			sampleOrder1 = inventoryPage.getDeleteOrderNumber();
			
			orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1,'Approval In Progress');
			expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Approval In Progress');

			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalControllerText()).toMatch('SNOW');
			expect(snowPage.getApprovalText()).toMatch('Requested');
			expect(snowPage.getRequestedStateText()).toMatch('Pending Approval');
			expect(snowPage.getOrderNumberText()).toMatch(sampleOrder1);
			expect(snowPage.getBrokerRequestTypeText()).toMatch('Terminate Request');
			snowPage.approveTheServiceNowRequestFromSnowPortal();
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Approved');
			snowPage.verifytheApprovalLinkFromSnowPortal(sampleOrder1);
			expect(snowPage.getApproverStatus()).toMatch('Approved');			
			orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Closed Complete');

		});
	}

})
