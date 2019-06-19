"use strict";
var CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	Orders = require('../../../pageObjects/orders.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	jsonUtil 		= 		require('../../../../helpers/jsonUtil.js'),
	logGenerator 	= 		require("../../../../helpers/logGenerator.js"),
	logger 			= 		logGenerator.getApplicationLogger(),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	XaaSTemplate = require('../../../../testData/OrderIntegration/VRA/vRAXaaS.json');
	
    
describe('e2e Test cases for XaaS', function() {
	var catalogPage, placeOrderPage,ordersPage,serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
			providerName:               'VRA',
			orderSubmittedConfirmationMessage : 'Order Submitted !',
			category:					'Other Services',
			estimatedPrice:  			'$10.00 ONE TIME CHARGE + $372.00 / MONTH'
     };
  	beforeAll(function() {
	    ordersPage = new Orders();
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
    });
  
  	it('VRA : XAAS ---- Verify fields on Main Parameters page of XAAS is working fine', function(){
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);	
		util.scrollToBottom();
		catalogPage.clickConfigureButtonBasedOnName(XaaSTemplate.bluePrintName);
    	expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
    	var XaaSObject = JSON.parse(JSON.stringify(XaaSTemplate));
		expect(placeOrderPage.getTextBluePrintName()).toContain(XaaSTemplate.descriptiveText);
    	placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
    	expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
    	expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
    	expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
  	});

 	it('VRA : XAAS ---- Verify Summary details and Additional Details are listed in review Order page', function() {
		var XaaSObject = JSON.parse(JSON.stringify(XaaSTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		util.scrollToBottom();
        catalogPage.clickConfigureButtonBasedOnName(XaaSTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(XaaSTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
			expect(requiredReturnMap["Actual"]["CatalogItemName"]).toEqual(requiredReturnMap["Expected"]["CatalogItemName"]);
			expect(requiredReturnMap["Actual"]["Storage"]).toEqual(requiredReturnMap["Expected"]["Storage"]);
        });
  	});	

  	it ('VRA : XAAS ---- Verify Order is listed in Orders details page once it is submitted from catalog page',function(){
		var orderObject = {};
		var XaasObject = JSON.parse(JSON.stringify(XaaSTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		util.scrollToBottom();
        catalogPage.clickConfigureButtonBasedOnName(XaaSTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(XaaSTemplate, modifiedParamMap);
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
        expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(XaasObject, "Team"));
        expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
      //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        ordersPage.clickServiceConfigurationsTabOrderDetails();
		expect(ordersPage.getTextBasedOnLabelName("CatalogItemName")).toEqual(jsonUtil.getValue(XaasObject, "CatalogItemName"));
		expect(ordersPage.getTextBasedOnLabelName("Storage")).toEqual(jsonUtil.getValue(XaasObject, "Storage"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
	});
	
	it('VRA : XAAS --- Verify provisioning of VRA-XAAS is working fine from consume App', function() {
		var orderObject = {};
		var XaasObject = JSON.parse(JSON.stringify(XaaSTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		util.scrollToBottom();
	   	catalogPage.clickConfigureButtonBasedOnName((XaaSTemplate.bluePrintName));
	  	orderObject.servicename = serviceName;
	   	orderFlowUtil.fillOrderDetails(XaaSTemplate, modifiedParamMap);
	   	placeOrderPage.submitOrder();
	   	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
	   	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
	   	expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
	   	placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
	   	orderFlowUtil.approveOrder(orderObject);
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
		ordersPage.closeServiceDetailsSlider();
	   	expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
	   	/*orderFlowUtil.waitForOrderStatusChange(orderObject,'Failed');
	   	expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Failed');*/
	   	/*orderFlowUtil.verifyOrderStatus(orderObject).then(function(status){
			if(status == 'Completed'){
				orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
			   	expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
			   	orderFlowUtil.approveDeletedOrder(orderObject);
			   	orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
			   	expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
		   	}
	   	});*/	
 	});
});
