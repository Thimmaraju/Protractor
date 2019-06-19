/**
Spec_Name: cosmosDBDroplets.spec.js 
Description: This spec will cover E2E testing of Cosmos DB service order submit, approve, edit and delete.   
Author: Pushpraj Singh
*/

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
	SNOWPage = require('../../../pageObjects/snow.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
	isProvisioningRequired = browser.params.isProvisioningRequired,
	appUrls = require('../../../../testData/appUrls.json'),
	util = require('../../../../helpers/util.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	snowApi = require('../../../../helpers/snowApiRequests.js'),
	logGenerator 	= 		require("../../../../helpers/logGenerator.js"),
	logger 			= 		logGenerator.getApplicationLogger(),
	EC = protractor.ExpectedConditions,

CDBTemplate = require('../../../../testData/OrderIntegration/Azure/CosmosDB.json'),
testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Cosmos DB Address', function () {
	var ordersPage, catalogPage, inventoryPage, placeOrderPage, snowPage, sampleOrder1;
	var modifiedParamMap = {};
	var messageStrings = { providerName: 'Azure', category: 'Database' };
	var modifiedParamMaped = {};
	var servicename = "AutoCDBsrv" + util.getRandomString(5);
	var rgName = "gslautotc_azureCDB-RG101" + util.getRandomString(5);
	var acName = "autoacname" + util.getRandomNumber(5);
	modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Account Name": acName };        

	beforeAll(function () {
		snowPage = new SNOWPage();
		ordersPage = new Orders();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		inventoryPage = new InventoryPage();
		browser.driver.manage().window().maximize();
	});

	beforeEach(function () {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		rgName = "gslautotc_azureCDB-RG101" + util.getRandomString(5);
		acName = "autoacname" + util.getRandomNumber(5);
		modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Account Name": acName };        

	});

	if (isProvisioningRequired == "true") {
		it('Azure: Verify for Cosmos DB service with snow-droplet, create service is working fine.', function () {

			var orderObject = JSON.parse(JSON.stringify(CDBTemplate));
			catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
			catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

			var returnObj = {};
			var returnObj1={};
			orderFlowUtil.fillOrderDetails(CDBTemplate, modifiedParamMap);

			placeOrderPage.submitOrder();
			returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			returnObj.servicename = servicename;
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
			orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');			
			//snowPage.navigateToSnowPortal(sampleOrder1);
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Closed Complete');

			inventoryPage.open();
			expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

			inventoryPage.searchOrderByServiceName(returnObj.servicename);
			element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
			inventoryPage.clickViewService();

		});
	}

	if (isProvisioningRequired == "true") {
		it('Azure: Verify for Cosmos DB service with snow-droplet, edit service is working fine.', function () {

			var orderObject = JSON.parse(JSON.stringify(CDBTemplate));
			catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
			catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

			var returnObj = {};
			var returnObj1={};
			returnObj.servicename = servicename;

			// edit order flow
			inventoryPage.open();
			inventoryPage.searchOrderByServiceName(returnObj.servicename);
			element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
			inventoryPage.clickEditServiceIcon();
			browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))),15000);
			modifiedParamMaped = {"Service Instance Name": servicename, "EditService": true};
			orderFlowUtil.fillOrderDetails(CDBTemplate, modifiedParamMaped);
			placeOrderPage.submitOrder();
			returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			returnObj1.servicename = servicename;
			sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

			//Open Order page and Approve Order 
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

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
			orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');			
			//snowPage.navigateToSnowPortal(sampleOrder1);
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Closed Complete');

			inventoryPage.open();
			expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

			inventoryPage.searchOrderByServiceName(returnObj.servicename);
			element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
			inventoryPage.clickViewService();
			
		});
	}

	if (isProvisioningRequired == "true") {
		it('Azure: Verify for Cosmos DB service with snow-droplet, delete service is working fine.', function () {

			var orderObject = JSON.parse(JSON.stringify(CDBTemplate));
			catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
			catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

			var returnObj = {};
			var returnObj1={};
			returnObj.servicename = servicename;
			returnObj1.servicename = servicename;
			inventoryPage.open();
			inventoryPage.searchOrderByServiceName(returnObj.servicename);
			element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
			inventoryPage.clickViewService();
			returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);	
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
			orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
			expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');	
			//snowPage.navigateToSnowPortal(sampleOrder1);
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Closed Complete');
			
		});
		
	}

});
