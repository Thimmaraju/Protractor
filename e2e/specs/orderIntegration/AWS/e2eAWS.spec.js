/*************************************************
	AUTHOR: SANTOSH HADAWALE
**************************************************/
"use strict";
var CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	Orders = require('../../../pageObjects/orders.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
	isProvisioningRequired = browser.params.isProvisioningRequired,
	vpcSingleInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/VPCSingleInstanceForEC2.json'),
	ec2InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSEC2Instance.json');

describe('e2e Test cases for AWS', function () {
	var orders,catalogPage, placeOrderPage, serviceName;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Amazon'
	};

	beforeAll(function () {
		catalogPage = new CatalogPage();
		orders = new Orders();
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

	it('TC-C167628 : Verify AWS IAAS Provision Network VPC is working fine from consume App', function () {
		var orderObject = {};
		var VPCEC2Object = JSON.parse(JSON.stringify(vpcSingleInstanceTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		catalogPage.clickConfigureButtonBasedOnName(vpcSingleInstanceTemplate.bluePrintName);
		orderObject.servicename = serviceName;
		orderFlowUtil.fillOrderDetails(vpcSingleInstanceTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Provisioning in Progress');
			orders.closeServiceDetailsSlider();
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
					//expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
					orderFlowUtil.approveDeletedOrder(orderObject);
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
				}
			})
		}
	});

	it('TC-C167627 : Verify AWS IAAS Provision EC2 is working fine from consume App', function () {
		var orderObject = {};
		var AWSEC2Object = JSON.parse(JSON.stringify(ec2InstanceTemplate));
		catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
		orderObject.servicename = serviceName;
		orderFlowUtil.fillOrderDetails(ec2InstanceTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Provisioning in Progress');
			orders.closeServiceDetailsSlider();
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
					//expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
					orderFlowUtil.approveDeletedOrder(orderObject);
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
				}
			})
		}	
	});
})