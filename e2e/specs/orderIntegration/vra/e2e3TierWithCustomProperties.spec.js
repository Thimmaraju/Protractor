/*************************************************
	AUTHOR: Prasanna
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
    isProvisioningRequired = browser.params.isProvisioningRequired,
    logger 			= 		logGenerator.getApplicationLogger(),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	threeTierCustomTemplate	= require('../../../../testData/OrderIntegration/VRA/3tierWithCustomProperties.json');
	

describe('e2e Test cases for 3Tier Custom Properties', function() {
	var catalogPage, placeOrderPage,ordersPage,serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
            providerName:               'VRA',
            category:		'Backup & Disaster Recovery',
            estimatedPrice : 'USD 90.00 ONE TIME CHARGE + USD 226.1492 / MONTH',
            orderSubmittedConfirmationMessage: 'Order Submitted !',
            providerAccount:'vRA73 / vRA73'
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
	
	 
    it('VRA : 3Tier Custom Properties ---- Verify fields on Main Parameters page of 3Tier Custom Properties is working fine', function () {
        catalogPage.clickConfigureButtonBasedOnName(threeTierCustomTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        var threeTierCustomTemplateObject = JSON.parse(JSON.stringify(threeTierCustomTemplate));
        expect(placeOrderPage.getTextBluePrintName()).toContain(threeTierCustomTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(threeTierCustomTemplate.EstimatedPrice);
    });
    
    it('VRA : 3Tier Custom Properties ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var threeTierCustomTemplateObject = JSON.parse(JSON.stringify(threeTierCustomTemplate));
        catalogPage.clickConfigureButtonBasedOnName(threeTierCustomTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(threeTierCustomTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            logger.info("Actual Values: "+requiredReturnMap["Actual"]["Quantity"]);
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName); 
            let cpu = [jsonUtil.getValue(threeTierCustomTemplateObject, "Db CPU"), jsonUtil.getValue(threeTierCustomTemplateObject, "App CPU"), jsonUtil.getValue(threeTierCustomTemplateObject, "Web CPU")];
			let memory = [jsonUtil.getValue(threeTierCustomTemplateObject, "Db Memory (MB)"), jsonUtil.getValue(threeTierCustomTemplateObject, "App Memory (MB)"), jsonUtil.getValue(threeTierCustomTemplateObject, "Web Memory (MB)")];
			let storage = [jsonUtil.getValue(threeTierCustomTemplateObject, "Db Storage (GB)"), jsonUtil.getValue(threeTierCustomTemplateObject, "App Storage (GB)"), jsonUtil.getValue(threeTierCustomTemplateObject, "Web Storage (GB)")];
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("CPU")).toEqual(cpu);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Memory (MB)")).toEqual(memory);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Storage (GB)")).toEqual(storage);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            });
    });
    
    it('VRA : 3Tier Custom Properties ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var threeTierCustomTemplateObject = JSON.parse(JSON.stringify(threeTierCustomTemplate));
        catalogPage.clickConfigureButtonBasedOnName(threeTierCustomTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(threeTierCustomTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        var orderId = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderAmount = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderId);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderId);
        ordersPage.clickFirstViewDetailsOrdersTable();
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(threeTierCustomTemplateObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
    });
    
    if(isProvisioningRequired == "true") {
        it('Verify 3Tier Custom Properties blueprint working fine from consume App', function() {
            var orderObject = {};
            var threeTierCustomTemplateObject = JSON.parse(JSON.stringify(threeTierCustomTemplate));
            catalogPage.clickConfigureButtonBasedOnName(threeTierCustomTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(threeTierCustomTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            //orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
            //expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed',50);
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