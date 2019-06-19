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
    logger 			= 		logGenerator.getApplicationLogger(),
    isProvisioningRequired = browser.params.isProvisioningRequired,
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	xaasOutputTemplate	= require('../../../../testData/OrderIntegration/VRA/xaasOutputProperties.json');
	

describe('e2e Test cases for XaaS OutPut properties', function() {
	var catalogPage, placeOrderPage,ordersPage,serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
            providerName:   'VRA',
            category:		'Compute',
            estimatedPrice : 'USD 10.00 ONE TIME CHARGE + USD 100.00 / MONTH',
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
	
	 
    it('VRA : XAAS Output Properties ---- Verify fields on Main Parameters page of XAAS Output Properties is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(xaasOutputTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        var xaasOutputTemplateObject = JSON.parse(JSON.stringify(xaasOutputTemplate));
        expect(placeOrderPage.getTextBluePrintName()).toContain(xaasOutputTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(xaasOutputTemplate.EstimatedPrice);
    });
    
    it('VRA : XAAS Output Properties ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var xaasOutputTemplateObject = JSON.parse(JSON.stringify(xaasOutputTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(xaasOutputTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(xaasOutputTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            logger.info("Actual Values: "+requiredReturnMap["Actual"]["Quantity"]);
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            });
    });
    
    it('VRA : XAAS Output Properties ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var xaasOutputTemplateObject = JSON.parse(JSON.stringify(xaasOutputTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(xaasOutputTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(xaasOutputTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        var orderId = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderAmount = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderId);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderId);
        //var orderAmount = ordersPage.getTextFirstAmountOrdersTable();
        ordersPage.clickFirstViewDetailsOrdersTable();
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(xaasOutputTemplateObject, "Team"));
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
        it('Verify XAAS Output Properties blueprint working fine from consume App', function() {
            var orderObject = {};
            var xaasOutputTemplateObject = JSON.parse(JSON.stringify(xaasOutputTemplate));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(xaasOutputTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(xaasOutputTemplate, modifiedParamMap);
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