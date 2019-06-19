
"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	isProvisioningRequired = browser.params.isProvisioningRequired,
	appUrls = require('../../../../testData/appUrls.json'),
	logGenerator = require("../../../../helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger(),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

	s3InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSS3Instance.json');

describe('AWS - S3', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, bucketName, logBucketName, S3INSObject;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Amazon',
		category: 'Storage',
		catalogPageTitle: 'Search, Select and Configure',
		inputServiceNameWarning: "Parameter Warning:",
		orderSubmittedConfirmationMessage: 'Order Submitted !',
	};

	beforeAll(function () {
		ordersPage = new Orders();
		homePage = new HomePage();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
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

	it('TC-C172279 : AWS S3 - Verify fields on Main Parameters page is working fine', function () {
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(s3InstanceTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
		expect(placeOrderPage.getTextBluePrintName()).toContain(s3InstanceTemplate.descriptiveText);
		placeOrderPage.setServiceNameText(serviceName);
		placeOrderPage.selectProviderAccount(S3INSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
		expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
		//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
		//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe(s3InstanceTemplate.BasePrice);
	});

	it('TC-C172280 : AWS S3 - Verify Summary details and Additional Details are listed in review Order page', function () {
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(s3InstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(s3InstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
			//expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
			//expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(s3InstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
			expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
			expect(requiredReturnMap["Actual"]["Bucket Name"]).toEqual(bucketName);
			expect(requiredReturnMap["Actual"]["Versioning"]).toEqual(requiredReturnMap["Expected"]["Versioning"]);
			expect(requiredReturnMap["Actual"]["Server Access Logging"]).toEqual(requiredReturnMap["Expected"]["Server Access Logging"]);
			expect(requiredReturnMap["Actual"]["Default Encryption"]).toEqual(requiredReturnMap["Expected"]["Default Encryption"]);
			expect(requiredReturnMap["Actual"]["Access Control"]).toEqual(requiredReturnMap["Expected"]["Access Control"]);
			expect(requiredReturnMap["Actual"]["Transfer Acceleration"]).toEqual(requiredReturnMap["Expected"]["Transfer Acceleration"]);
		});
	});


	it('TC-C172281 : AWS S3 - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
		var orderObject = {};
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(s3InstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(s3InstanceTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		ordersPage.open();
		expect(util.getCurrentURL()).toMatch('orders');
		ordersPage.searchOrderById(orderObject.orderNumber);
		expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
		ordersPage.clickFirstViewDetailsOrdersTable();
		orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
		expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
		expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
		expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
		// expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(s3InstanceTemplate.bluePrintName);
		// expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(S3INSObject, "Team"));
		// expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
		//expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
		expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
		util.waitForAngular();
		expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(S3INSObject, "AWS Region"));
		expect(ordersPage.getTextBasedOnLabelName("Bucket Name")).toEqual(bucketName);
		expect(ordersPage.getTextBasedOnLabelName("Access Control")).toEqual(jsonUtil.getValue(S3INSObject, "Access Control"));
		expect(ordersPage.getTextBasedOnLabelName("Server Access Logging")).toEqual(jsonUtil.getValue(S3INSObject, "Server Access Logging"));
		expect(ordersPage.getTextBasedOnLabelName("Versioning")).toEqual(jsonUtil.getValue(S3INSObject, "Versioning"));
		expect(ordersPage.getTextBasedOnLabelName("Transfer Acceleration")).toEqual(jsonUtil.getValue(S3INSObject, "Transfer Acceleration"));
		expect(ordersPage.getTextBasedOnLabelName("Default Encryption")).toEqual(jsonUtil.getValue(S3INSObject, "Default Encryption"));
		ordersPage.clickBillOfMaterialsTabOrderDetails();
		expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(s3InstanceTemplate.TotalCost);
	});

	if (isProvisioningRequired == "true") {
		it('TC-C172282 : AWS S3 - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
			var orderObject = {};
			catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
			catalogPage.clickConfigureButtonBasedOnName(s3InstanceTemplate.bluePrintName);
			orderObject.servicename = serviceName
			orderFlowUtil.fillOrderDetails(s3InstanceTemplate, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					var modifiedParamMap = { "EditService": true };
					orderFlowUtil.editService(orderObject);
					orderFlowUtil.fillOrderDetails(s3InstanceTemplate, modifiedParamMap).then(function () {
						logger.info("Edit parameter details are filled.");
						browser.sleep(5000);
					});
					placeOrderPage.submitOrder();
					orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
					expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
					placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
					orderFlowUtil.approveOrder(orderObject);
					orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
					orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
						if (status == 'Completed') {
							//Verify updated details are reflected on order details page.						
							ordersPage.clickFirstViewDetailsOrdersTable();
							expect(ordersPage.getTextBasedOnLabelName("Versioning")).toEqual(jsonUtil.getValueEditParameter(S3INSObject, "Versioning"));
							expect(ordersPage.getTextBasedOnLabelName("Transfer Acceleration")).toEqual(jsonUtil.getValueEditParameter(S3INSObject, "Transfer Acceleration"));
							expect(ordersPage.getTextBasedOnLabelName("Default Encryption")).toEqual(jsonUtil.getValueEditParameter(S3INSObject, "Default Encryption"));
							expect(ordersPage.getTextBasedOnLabelName("Access Control")).toEqual(jsonUtil.getValueEditParameter(S3INSObject, "Access Control"));
							expect(ordersPage.getTextBasedOnLabelName("Key")).toEqual(jsonUtil.getValueEditParameter(S3INSObject, "Key"));
							expect(ordersPage.getTextBasedOnLabelName("Value")).toEqual(jsonUtil.getValueEditParameter(S3INSObject, "Value"));
							//Delete Service flow
							orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
							//expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
							orderFlowUtil.approveDeletedOrder(orderObject);
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
						}
					});
				}
			})
		});
	}
})
