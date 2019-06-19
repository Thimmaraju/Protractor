/**
Spec_Name: dnsZoneDroplets.spec.js 
Description: This spec will cover E2E testing of DNS Zone service order from "snow droplet" submit, approve and delete.
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

DZTemplate = require('../../../../testData/OrderIntegration/Azure/DnsZone.json'),
testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for DNS Zone', function () {
	var ordersPage, catalogPage, inventoryPage, snowPage, placeOrderPage, sampleOrder1;
	var modifiedParamMap = {};
	var messageStrings = { providerName: 'Azure', category: 'Network' };
	var modifiedParamMap = {};
	var servicename = "AutoDNSsrv" + util.getRandomString(5);
	var rgName = "gslautotc_azureDNS-RG101" + util.getRandomString(5);
	var dnsName = "autodns.new" + util.getRandomString(5);
	modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "DNS Zone Name": dnsName };                        


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
		rgName = "gslautotc_azureDNS-RG101" + util.getRandomString(5);
		dnsName = "autodns.new" + util.getRandomString(5);
		modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "DNS Zone Name": dnsName };                        

	});

	//E2E ExpressRoute DNS Zone order Submit, Approve, Delete Service with New Resource Group.
	if (isProvisioningRequired == "true") {
		it('Azure: TC-T386503 Verify if create new DNS Zone with New Resource Group is working fine.', function () {
			var orderObject = JSON.parse(JSON.stringify(DZTemplate));
			catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
			catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
			var returnObj = {};
			orderFlowUtil.fillOrderDetails(DZTemplate, modifiedParamMap);
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
		});
	}
	
	//E2E ExpressRoute DNS Zone Delete Service for submitted order and Approval from SnowPortal with New Resource Group.
	if (isProvisioningRequired == "true") {
		it('Azure: TC-T386503 Verify if Delete DNS Zone Group is working fine.', function () {			
			var returnObj = {};
			inventoryPage.open();
			//servicename = "AutoDNSsrvZFFzr";
			returnObj.servicename = servicename;
			expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);
			inventoryPage.searchOrderByServiceName(returnObj.servicename);
			element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
			inventoryPage.clickViewService();
			returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
			sampleOrder1 = inventoryPage.getDeleteOrderNumber();
			//snowPage.navigateToSnowPortal(sampleOrder1);
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
			orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
			expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');			
			//snowPage.navigateToSnowPortal(sampleOrder1);
			snowPage.logInToSnowDropletPortalAndSearchOrder(sampleOrder1);
			expect(snowPage.getApprovalText()).toMatch('Approved');
			expect(snowPage.getRequestedStateText()).toMatch('Closed Complete');
		});
	}
	
});
