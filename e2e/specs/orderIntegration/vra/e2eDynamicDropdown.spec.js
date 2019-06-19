/*************************************************
	AUTHOR: Franklin
**************************************************/
"use strict";
var logGenerator 	= 		require("../../../../helpers/logGenerator.js"),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    OrdersPage 		= 		require('../../../pageObjects/orders.pageObject.js'),
    jsonUtil 		= 		require('../../../../helpers/jsonUtil.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    logger 			= 		logGenerator.getApplicationLogger(),
    isProvisioningRequired = browser.params.isProvisioningRequired,
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	dynamicTemplate	= require('../../../../testData/OrderIntegration/VRA/dynamicDropdownCentOS.json');
	

describe('e2e Test cases for Dynamic dropdown for CentOS', function() {
	var catalogPage, placeOrderPage,ordersPage, serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
        providerName:               'VRA',
        category:		'Network',
        orderSubmittedConfirmationMessage: 'Order Submitted !',
        providerAccount:'vRA73 / vRA73',
        estimatedPrice:'N/A',
     };
	
    beforeAll(function() {
    	catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        ordersPage = new OrdersPage();
        browser.driver.manage().window().maximize();
    });
    
    beforeEach(function() {
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    	serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
	});
	
	 
    it('VRA : Dynamic Dropdown(CentOS) ---- Verify fields on Main Parameters page of Dynamic Dropdown(CentOS) is working fine', function () {
        catalogPage.clickConfigureButtonBasedOnName(dynamicTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        var dynamicTemplateObject = JSON.parse(JSON.stringify(dynamicTemplate));
        //expect(placeOrderPage.getTextBluePrintName()).toContain(dynamicTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(dynamicTemplate.EstimatedPrice);
    });
    
    it('VRA : Dynamic Dropdown(CentOS) ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var dynamicTemplateObject = JSON.parse(JSON.stringify(dynamicTemplate));
        catalogPage.clickConfigureButtonBasedOnName(dynamicTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(dynamicTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            logger.info("Actual Values: "+requiredReturnMap["Actual"]["Quantity"]);
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(requiredReturnMap["Actual"]["CPU"]).toEqual(requiredReturnMap["Expected"]["CPU"]);
			expect(requiredReturnMap["Actual"]["Memory (MB)"]).toEqual(requiredReturnMap["Expected"]["Memory (MB)"]);
			expect(requiredReturnMap["Actual"]["Storage (GB)"]).toEqual(requiredReturnMap["Expected"]["Storage (GB)"]);
			expect(requiredReturnMap["Actual"]["Select Template"]).toEqual(requiredReturnMap["Expected"]["Select Template"]);
        });
    });
    
    it('VRA : Dynamic Dropdown(CentOS) ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var dynamicTemplateObject = JSON.parse(JSON.stringify(dynamicTemplate));
        catalogPage.clickConfigureButtonBasedOnName(dynamicTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(dynamicTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        var orderId = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderId);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderId);
        var orderAmount = ordersPage.getTextFirstAmountOrdersTable();
        ordersPage.clickFirstViewDetailsOrdersTable();
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(dynamicTemplateObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
      //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        //expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toEqual(orderAmount);
    });
    
    if(isProvisioningRequired == "true") {
        it('TC-C176204: Verify Dynamic Dropdown(CentOS) blueprint working fine from consume App', function() {
            var orderObject = {};
            var DynamicObject = JSON.parse(JSON.stringify(dynamicTemplate));
            catalogPage.clickConfigureButtonBasedOnName(dynamicTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(dynamicTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            //orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
            //expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
            orderFlowUtil.verifyOrderStatus(orderObject).then(function(status){
                if(status == 'Completed'){
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })		
        });
    }       
})