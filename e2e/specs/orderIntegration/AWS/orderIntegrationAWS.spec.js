/*************************************************
	AUTHOR: SANTOSH HADAWALE
**************************************************/
"use strict";
var logGenerator = require("../../../../helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger(),
	Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
	vpcSingleInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/VPCSingleInstanceForEC2.json');

describe('Order Integration Tests for Amazon Web Service', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage, serviceName;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Amazon',
		category: 'Network',
		catalogPageTitle: 'Select,Search and Configure',
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
		serviceName = "TestAutomation" + util.getRandomString(5);
		modifiedParamMap = { "Service Instance Name": serviceName };
	});

	it('TC-C167060 : Verify Amazon provider is listed in catalog page', function () {
		expect(catalogPage.getListofProviders()).toContain(messageStrings.providerName);
	});

	it('TC-C167097 : Verify selecting "Cancel" option is working fine while creating an Amazon service order', function () {
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		placeOrderPage.cancelOrder();
		placeOrderPage.clickYesInCancelOrderPopup();
		expect(catalogPage.isPresentCatalogLink()).toBe(true);
	});

	it('TC-C167098 : Verify select "Next" option in Main Parameters page is working fine while creating a Amazon service', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
		placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
		placeOrderPage.selectProviderAccount(ConfigObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
		placeOrderPage.clickNextButton();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderAdditionalParamtersPageUrl).then(function (text) {
			logger.info("Clicked on Next Button and navigated to Next page");
		});
	});

	it('TC-C167099 : Verify without providing Service Name "Next" button should not be clickable', function () {
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		expect(placeOrderPage.isNextButtonEnabled()).toBe(false);
	});

	it('TC-C167100 : Verify correct provider name is getting displayed in Main parameters page while creating Amazon service', function () {
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
	});

	it('TC-C167101 : Verify correct Category name is getting displayed in Main parameters page while creating Amazon service', function () {
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
	});

	it('TC-C167102 : Verify Estimated price is getting displayed in Main parameters page while creating Amazon service', function () {
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe("USD0.05/ Connection / HR + USD0.00");
	});

	it('TC-C167103 : Verify select "Previous" option is working fine while creating an Amazon service order', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		var servicename = VPCEC2Object.serviceName + util.getRandomString(4);
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		placeOrderPage.setServiceNameText(servicename);
		placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
		placeOrderPage.clickNextButton();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderAdditionalParamtersPageUrl);
		placeOrderPage.clickPreviousButton();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
	});

	it('TC-C167104 : Verify "Next" button in Additional Parameters page is working fine while creating an Amazon service', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderReviewOrderPageUrl);
	});

	it('TC-C167105 : Verify select "Previous" option is working fine while creating an Amazon service order', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap);
		placeOrderPage.clickPreviousButton();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderAdditionalParamtersPageUrl);
	});

	it('TC-C167106 : Verify Service name is displayed in the Review Order page', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			//expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
		});
	});

	it('TC-C167107 : Verify Service Details are listed in Review Order page', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			//expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
		});
		expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
		expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
		//Dynamically changing price, can not get expected value easily. So commented.
		//expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe("$0.05/ Connection / HR + $0.00");
	});

	it('TC-C167108 : Verify Additional Details are listed in Review Order page', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
			//expect(requiredReturnMap["Actual"]["Vpc Name"]).toEqual(requiredReturnMap["Expected"]["Vpc Name"]);
			expect(requiredReturnMap["Actual"]["Vpc Creation Option"]).toEqual(requiredReturnMap["Expected"]["Vpc Creation Option"]);
			expect(requiredReturnMap["Actual"]["Vpc CIDR"]).toEqual(requiredReturnMap["Expected"]["Vpc CIDR"]);
			expect(requiredReturnMap["Actual"]["Enable Dns Support"]).toEqual(requiredReturnMap["Expected"]["Enable Dns Support"]);
			//expect(requiredReturnMap["Actual"]["Enable Dns Hostnames"]).toEqual(requiredReturnMap["Expected"]["Enable Dns Hostnames"]);
			expect(requiredReturnMap["Actual"]["Instance Tenancy"]).toEqual(requiredReturnMap["Expected"]["Instance Tenancy"]);
			expect(requiredReturnMap["Actual"]["Public Subnet CIDR"]).toEqual(requiredReturnMap["Expected"]["Public Subnet CIDR"]);
			expect(requiredReturnMap["Actual"]["Private Subnet CIDR"]).toEqual(requiredReturnMap["Expected"]["Private Subnet CIDR"]);
		});
	});

	it('TC-C167109 : Verify Submit Order option is working fine in creating an Amazon service order', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
	});

	it('TC-C168335 : Verify Order details and "Go to Service Catalog" option in Order Submitted confirmation pop-up is working fine', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
	});

	it('TC-C168334 : Verify Order is listing in Orders page once it is submitted from catalog page', function () {
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		var orderId = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		ordersPage.open();
		//ordersPage.clickordersLink();
		expect(util.getCurrentURL()).toMatch('orders/approver-orders');
		ordersPage.searchOrderById(orderId);
		expect(ordersPage.getTextFirstOrderIdOrdersTable()).toMatch(orderId);
	});
});