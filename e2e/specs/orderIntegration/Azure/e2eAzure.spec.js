// This test file is for adding tests for order integration

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	virtualNetworkTemplate = require('../../../../testData/OrderIntegration/Azure/VirtualNetwork.json'),
	vmRedHatTemplate = require('../../../../testData/OrderIntegration/Azure/newLinuxVM.json');

describe('e2e Test cases for Azure', function() {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage,serviceName; 
    var modifiedParamMap = {};
    var messageStrings = {
            providerName:               'Azure'
     };

    beforeAll(function() {
        orders = new Orders();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
        browser.driver.manage().window().maximize();
       // ensureConsumeHome();
    });

    afterAll(function() {
    	
    });

    beforeEach(function() {
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    	serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
        
    it('Verify that user is able to provision virtual machine by selecting "New resource group required" as "Yes" and creating new resource group TC - C167553 ', function() {
    	var orderObject = {};
    	var vnObject = JSON.parse(JSON.stringify(vmRedHatTemplate.Scenario1));
    	catalogPage.clickConfigureButtonBasedOnName(vnObject.bluePrintName);
    	orderObject.servicename = serviceName;
    	var resourceGroup = "RGTestauto" + util.getRandomNumber(4); 
    	var storageAccountName = "teststorage"+ util.getRandomNumber(4);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroup,"Vm Size":"","Diagnostics Storage Account Name":storageAccountName};
    	orderFlowUtil.fillOrderDetails(vnObject,resourceGroupMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    	placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		orderFlowUtil.approveOrder(orderObject);
		
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
		expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
		orderFlowUtil.verifyOrderStatus(orderObject).then(function(status){
			if(status == 'Completed'){
				orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
				//expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
				orderFlowUtil.approveDeletedOrder(orderObject);
				orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
				expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
			}
		})		
    });
    
    it('Verify that user is able to provision virtual network by selecting "New resource group required" as "Yes" and creating new resource group TC-C167554', function() { 
    	var orderObject = {};
    	var vnObject = JSON.parse(JSON.stringify(virtualNetworkTemplate));
    	catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
    	catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
    	orderObject.servicename = serviceName;
    	var resourceGroup = "RGTestauto" + util.getRandomNumber(4); 
    	var storageAccountName = "teststorage"+ util.getRandomNumber(4);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroup,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
    	orderFlowUtil.fillOrderDetails(virtualNetworkTemplate,resourceGroupMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    	placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		orderFlowUtil.approveOrder(orderObject);
		
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
		expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
		orderFlowUtil.verifyOrderStatus(orderObject).then(function(status){
			if(status == 'Completed'){
				orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
				//expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
				orderFlowUtil.approveDeletedOrder(orderObject);
				orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
				expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
			}
		})	
    });
});
