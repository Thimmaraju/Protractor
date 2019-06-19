/*************************************************
	AUTHOR: Pushpraj
**************************************************/
"use strict";
var logGenerator 	= 		require("../../../../helpers/logGenerator.js"),
	CatalogPage 	= 		require('../../../pageObjects/catalog.pageObject.js'),
	OrdersPage 		= 		require('../../../pageObjects/orders.pageObject.js'),
	PlaceOrderPage 	= 		require('../../../pageObjects/placeOrder.pageObject.js'),
	orderFlowUtil 	= 		require('../../../../helpers/orderFlowUtil.js'),
	util 			= 		require('../../../../helpers/util.js'),
	jsonUtil 		= 		require('../../../../helpers/jsonUtil.js'),
    logger 			= 		logGenerator.getApplicationLogger(),
    isProvisioningRequired = browser.params.isProvisioningRequired,
	appUrls 		= 		require('../../../../testData/appUrls.json'),
	centOsCustomAttributeVRA74Template = 	require('../../../../testData/OrderIntegration/VRA/CentOsCustomAttributeVRA74.json');

describe('VRA : Cent Os Custom Attribute VRA 7.4 template -- 7.4 VRA service', function () {
	
	var catalogPage, placeOrderPage, ordersPage, serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
    		providerName:   'VRA',
    		category:		'Compute',
            estimatedPrice : 'USD 20.00 ONE TIME CHARGE + USD 20.0009765 / MONTH',
            orderSubmittedConfirmationMessage: 'Order Submitted !',
            providerAccount:'VRA74 / VRA74'
    };
    
    beforeAll(function() {
    	catalogPage = new CatalogPage();
    	placeOrderPage = new PlaceOrderPage();
    	ordersPage = new OrdersPage();
        browser.driver.manage().window().maximize();
    });
    
    beforeEach(function() {
    	catalogPage.open();
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
    
    it('VRA : CentOs Custom Attribute VRA 74 ---- Verify fields on Main Parameters page of CentOs Custom Attribute VRA 74 is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(centOsCustomAttributeVRA74Template.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(centOsCustomAttributeVRA74Template.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(centOsCustomAttributeVRA74Template.EstimatedPrice);
    });
    
    it('VRA : CentOs Custom Attribute VRA 74 ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var centOsCustomAttributeVRA74TemplateObj = JSON.parse(JSON.stringify(centOsCustomAttributeVRA74Template));
        catalogPage.clickConfigureButtonBasedOnName(centOsCustomAttributeVRA74Template.bluePrintName);
        orderFlowUtil.fillOrderDetails(centOsCustomAttributeVRA74Template, modifiedParamMap).then(function (requiredReturnMap) {
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(requiredReturnMap["Actual"]["CPUs"]).toEqual(requiredReturnMap["Expected"]["CPUs"]);
            expect(requiredReturnMap["Actual"]["Memory (MB)"]).toEqual(requiredReturnMap["Expected"]["Memory (MB)"]);
            expect(requiredReturnMap["Actual"]["Storage (GB)"]).toEqual(requiredReturnMap["Expected"]["Storage (GB)"]);
        });
    });
    
    it('VRA : CentOs Custom Attribute VRA 74 ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var centOsCustomAttributeVRA74TemplateObj = JSON.parse(JSON.stringify(centOsCustomAttributeVRA74Template));
        catalogPage.clickConfigureButtonBasedOnName(centOsCustomAttributeVRA74Template.bluePrintName);
        orderFlowUtil.fillOrderDetails(centOsCustomAttributeVRA74Template, modifiedParamMap).then(function(requiredReturnMap){
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
            //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(centOsCustomAttributeVRA74TemplateObj, "Team"));
            //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
          //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
            expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
            expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
            expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
            ordersPage.clickServiceConfigurationsTabOrderDetails();
            expect(ordersPage.getTextBasedOnLabelName("CPUs")).toEqual((requiredReturnMap["Expected"]["CPUs"]));
            expect(ordersPage.getTextBasedOnLabelName("Memory (MB)")).toEqual((requiredReturnMap["Expected"]["Memory (MB)"]));
            expect(ordersPage.getTextBasedOnLabelName("Storage (GB)")).toEqual((requiredReturnMap["Expected"]["Storage (GB)"]));
            ordersPage.clickBillOfMaterialsTabOrderDetails();
            expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
        });
    });
    
    if(isProvisioningRequired == "true"){
        it("VRA : CentOs Custom Attribute VRA 74 --- Verify provisioning of CentOs Custom Attribute VRA 74 service is working fine from consume App", function(){
            var orderObject = {};
            var centOsCustomAttributeVRA74TemplateObj = JSON.parse(JSON.stringify(centOsCustomAttributeVRA74Template));
            catalogPage.clickConfigureButtonBasedOnName(centOsCustomAttributeVRA74Template.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(centOsCustomAttributeVRA74Template, modifiedParamMap);
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
            });		
        });	
    }	
});