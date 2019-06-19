/*************************************************
	AUTHOR: Pushpraj Singh
 **************************************************/

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	snowApi = require('../../../../helpers/snowApiRequests.js'),
	SNOWPage = require('../../../pageObjects/snow.pageObject.js'),
	isProvisioningRequired = browser.params.isProvisioningRequired,
	tier3TraditionalTemplate = require('../../../../testData/OrderIntegration/VRA/3tierTraditionalWorkload.json'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
	singleVMCentOSTemplate	= require('../../../../testData/OrderIntegration/VRA/singleVMCentOs.json');

describe('e2e Test cases for SNOW Droplet VRA -- CentOS', function() {
	var orders, homePage, dashBoard, catalogPage, placeOrderPage, serviceName,userName, snowPage, sampleOrder1; 
	var modifiedParamMap = {};
	var messageStrings = {
			providerName:'VRA',
			orderSubmittedConfirmationMessage: 'Order Submitted !'
	};

	beforeAll(function() {
		snowPage = new SNOWPage();
		orders = new Orders();
		homePage = new HomePage(); 
		dashBoard = new DashBoard();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		browser.driver.manage().window().maximize();
	});

	beforeEach(function() {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
		userName = browser.params.username;
	});

	it('Cent OS VRA ---- Verify provisoning the VRA CentOS service after approval from SNOW instance', function () {
		var orderObject = {};
		var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		orderObject.servicename = serviceName;
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
		sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		var orderObject = {"orderNumber":sampleOrder1};
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Approval In Progress');
		expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Approval In Progress');
		if(isProvisioningRequired == "true") {			
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
		}
	});

	it('Cent OS VRA ---- Verify Editing the VRA CentOS service after approval from SNOW instance', function () {
		var orderObject = {};
		var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		orderObject.servicename = serviceName;

		//Function to edit the VRA service
		modifiedParamMap = {"Service Instance Name":"","Cart Service":"","Team":"","Cart Name":"","Environment":"","Application":"","Provider Account":"","CPU":"2","MEMORY":"1024","STORAGE":"5"};
		orderFlowUtil.editService(orderObject);
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		placeOrderPage.submitOrder();
		sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
		placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
		expect(orderFlowUtil.verifyOrderType(orderObject)).toBe('EditSOI');
		var orderObject = {"orderNumber":sampleOrder1};
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Approval In Progress');
		expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Approval In Progress');
		if(isProvisioningRequired == "true") {
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
		}
	});

	it('Cent OS VRA ---- Verify deleting the VRA CentOS service after approval from SNOW instance', function () {
		var orderObject = {};
		var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		orderObject.servicename = serviceName;

		orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
		sampleOrder1 = inventoryPage.getDeleteOrderNumber();
		expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
		
		orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1,'Approval In Progress');
		expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Approval In Progress');

		if(isProvisioningRequired == "true") {
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
			
		}
		
	});

});
