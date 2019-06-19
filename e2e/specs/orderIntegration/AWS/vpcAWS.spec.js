
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

	vpcInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSVPCInstance.json');

describe('AWS - VPC', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, VpcINSObject, vpcName, publicSubnet;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Amazon',
		category: 'Network',
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
		VpcINSObject = JSON.parse(JSON.stringify(vpcInstanceTemplate));
		serviceName = "TestAutomation" + util.getRandomString(5);
		vpcName = "testvpcauto" + util.getRandomString(5);
		publicSubnet = "publicSubnet" + util.getRandomString(5);
		modifiedParamMap = { "Service Instance Name": serviceName, "VPC Name": vpcName, "Public Subnet Name": publicSubnet };
	});

	it('TC-C191616 : AWS VPC - Verify fields on Main Parameters page is working fine', function () {
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcInstanceTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
		expect(placeOrderPage.getTextBluePrintName()).toContain(vpcInstanceTemplate.descriptiveText);
		placeOrderPage.setServiceNameText(serviceName);
		placeOrderPage.selectProviderAccount(VpcINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
		expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
		//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
		//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe(vpcInstanceTemplate.BasePrice);
	});

	it('TC-C191617 : AWS VPC - Verify Summary details and Additional Details are listed in review Order page', function () {
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
			//expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
			//expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(vpcInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
			expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
			expect(requiredReturnMap["Actual"]["VPC Configuration"]).toEqual(requiredReturnMap["Expected"]["VPC Configuration"]);
			expect(requiredReturnMap["Actual"]["IPv4 CIDR Block"]).toEqual(requiredReturnMap["Expected"]["IPv4 CIDR Block"]);
			expect(requiredReturnMap["Actual"]["IPv6 CIDR Block"]).toEqual(requiredReturnMap["Expected"]["IPv6 CIDR Block"]);
			expect(requiredReturnMap["Actual"]["VPC Name"]).toEqual(vpcName);
			expect(requiredReturnMap["Actual"]["Public Subnet's IPv4 CIDR"]).toEqual(requiredReturnMap["Expected"]["Public Subnet's IPv4 CIDR"]);
			expect(requiredReturnMap["Actual"]["Availability Zone For Public Subnet"]).toEqual(requiredReturnMap["Expected"]["Availability Zone For Public Subnet"]);
			expect(requiredReturnMap["Actual"]["Public Subnet Name"]).toEqual(publicSubnet);
			expect(requiredReturnMap["Actual"]["Enable DNS Hostnames"]).toEqual(requiredReturnMap["Expected"]["Enable DNS Hostnames"]);
			expect(requiredReturnMap["Actual"]["Hardware Tenancy"]).toEqual(requiredReturnMap["Expected"]["Hardware Tenancy"]);
			expect(requiredReturnMap["Actual"]["Key"]).toEqual(requiredReturnMap["Expected"]["Key"]);
			expect(requiredReturnMap["Actual"]["Value"]).toEqual(requiredReturnMap["Expected"]["Value"]);
		});
	});


	it('TC-C191619 : AWS VPC - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
		var orderObject = {};
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		catalogPage.clickConfigureButtonBasedOnName(vpcInstanceTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcInstanceTemplate, modifiedParamMap);
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
		// expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(vpcInstanceTemplate.bluePrintName);
		// expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(VpcINSObject, "Team"));
		// expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
		expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
		util.waitForAngular();
		expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(VpcINSObject, "AWS Region"));
		expect(ordersPage.getTextBasedOnLabelName("VPC Configuration")).toEqual(jsonUtil.getValue(VpcINSObject, "VPC Configuration"));
		expect(ordersPage.getTextBasedOnLabelName("IPv4 CIDR Block")).toEqual(jsonUtil.getValue(VpcINSObject, "IPv4 CIDR Block"));
		expect(ordersPage.getTextBasedOnLabelName("IPv6 CIDR Block")).toEqual(jsonUtil.getValue(VpcINSObject, "IPv6 CIDR Block"));
		expect(ordersPage.getTextBasedOnLabelName("VPC Name")).toEqual(vpcName);
		//expect(ordersPage.getTextBasedOnLabelName("Public Subnet's IPv4 CIDR")).toEqual(jsonUtil.getValue(VpcINSObject, "Public Subnet's IPv4 CIDR"));
		expect(ordersPage.getTextBasedOnLabelName("Availability Zone For Public Subnet")).toEqual(jsonUtil.getValue(VpcINSObject, "Availability Zone For Public Subnet"));
		expect(ordersPage.getTextBasedOnLabelName("Public Subnet Name")).toEqual(publicSubnet);
		expect(ordersPage.getTextBasedOnLabelName("Enable DNS Hostnames")).toEqual(jsonUtil.getValue(VpcINSObject, "Enable DNS Hostnames"));
		expect(ordersPage.getTextBasedOnLabelName("Hardware Tenancy")).toEqual(jsonUtil.getValue(VpcINSObject, "Hardware Tenancy"));
		expect(ordersPage.getTextBasedOnLabelName("Key")).toEqual(jsonUtil.getValue(VpcINSObject, "Key"));
		expect(ordersPage.getTextBasedOnLabelName("Value")).toEqual(jsonUtil.getValue(VpcINSObject, "Value"));
		ordersPage.clickBillOfMaterialsTabOrderDetails();
		expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(vpcInstanceTemplate.TotalCost);
	});

	if (isProvisioningRequired == "true") {
		it('TC-C191620 : AWS VPC - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
			var orderObject = {};
			catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
			catalogPage.clickConfigureButtonBasedOnName(vpcInstanceTemplate.bluePrintName);
			orderObject.servicename = serviceName
			orderFlowUtil.fillOrderDetails(vpcInstanceTemplate, modifiedParamMap);
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
					var publicSubnetNew = "publicSubnetEdit" + util.getRandomString(5);
					var modifiedParamMap = { "EditService": true, "Public Subnet Name": publicSubnetNew };
					orderFlowUtil.editService(orderObject);
					orderFlowUtil.fillOrderDetails(vpcInstanceTemplate, modifiedParamMap).then(function () {
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
							expect(ordersPage.getTextBasedOnLabelName("Public Subnet Name")).toEqual(publicSubnetNew);
							expect(ordersPage.getTextBasedOnLabelName("Enable DNS Hostnames")).toEqual(jsonUtil.getValueEditParameter(VpcINSObject, "Enable DNS Hostnames"));
							expect(ordersPage.getTextBasedOnLabelName("Key")).toEqual(jsonUtil.getValueEditParameter(VpcINSObject, "Key"));
							expect(ordersPage.getTextBasedOnLabelName("Value")).toEqual(jsonUtil.getValueEditParameter(VpcINSObject, "Value"));
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