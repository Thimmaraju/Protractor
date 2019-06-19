/*************************************************
	AUTHOR: Deepthi
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
	appUrls 		= 		require('../../../../testData/appUrls.json'),
	costCenterDetailsTemplate = 		require('../../../../testData/OrderIntegration/vra/costCenterDetails.json');

describe('VRA : Cost Center Details template', function () {
	
	var catalogPage, placeOrderPage, ordersPage, serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
    		providerName:'VRA',
    		category:		'Compute',
            estimatedPrice : 'N/A',
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
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    	serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
    
    it('VRA : Cost Center Details ---- Verify fields on Main Parameters page of Cost Center Details is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(costCenterDetailsTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        var costCenterObject = JSON.parse(JSON.stringify(costCenterDetailsTemplate));
        expect(placeOrderPage.getTextBluePrintName()).toContain(costCenterDetailsTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
    });
    
    it('VRA : Cost Center Details ---- Verify Summary details and Additional Details are listed in review Order page with ProjectId', function () {
        var costCenterObject = JSON.parse(JSON.stringify(costCenterDetailsTemplate));
        catalogPage.clickConfigureButtonBasedOnName(costCenterDetailsTemplate.bluePrintName);
        util.waitForAngular();
        browser.sleep(20000);
        orderFlowUtil.fillOrderDetails(costCenterDetailsTemplate, modifiedParamMap).then(function (requiredReturnMap) {
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(requiredReturnMap["Actual"]["Application Code"]).toEqual(requiredReturnMap["Expected"]["Application Code"]);
            expect(requiredReturnMap["Actual"]["Customer"]).toEqual(requiredReturnMap["Expected"]["Customer"]);
            expect(requiredReturnMap["Actual"]["Project Id"]).toEqual(requiredReturnMap["Expected"]["Project Id"]);
            expect(requiredReturnMap["Actual"]["Cost Center"]).toEqual(requiredReturnMap["Expected"]["Cost Center"]);
        });
    });
    
    it('VRA : Cost Center Details ---- Verify Order is listed in Orders details page once it is submitted from catalog page with ProjectId', function () {
        var costCenterObject = JSON.parse(JSON.stringify(costCenterDetailsTemplate));
        catalogPage.clickConfigureButtonBasedOnName(costCenterDetailsTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(costCenterDetailsTemplate, modifiedParamMap).then(function(requiredReturnMap){
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
            //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(costCenterObject, "Team"));
            expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
            //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
            expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
            expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
            expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
            ordersPage.clickServiceConfigurationsTabOrderDetails();
            expect(ordersPage.getTextBasedOnLabelName("Application Code")).toEqual((requiredReturnMap["Expected"]["Application Code"]));
            expect(ordersPage.getAllTextBasedOnLabelName("Customer")).toEqual((requiredReturnMap["Expected"]["Customer"]).toString().split(","));
            expect(ordersPage.getTextBasedOnLabelName("Project Id")).toEqual((requiredReturnMap["Expected"]["Project Id"]));
            expect(ordersPage.getTextBasedOnLabelName("Cost Center")).toEqual((requiredReturnMap["Expected"]["Cost Center"]));
            ordersPage.clickBillOfMaterialsTabOrderDetails();
            expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
        });
    });
	
	it("VRA : Cost Center Details --- Verify provisioning of Cost Center Details service is working fine from consume App with ProjectId", function(){
        var orderObject = {};
		var costCenterObject = JSON.parse(JSON.stringify(costCenterDetailsTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(costCenterDetailsTemplate.bluePrintName);
    	orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(costCenterDetailsTemplate, modifiedParamMap);
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
				//orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
                //expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
                orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
				expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
			}
		})		
    })	
    
    it('VRA : Cost Center Details ---- Verify Summary details and Additional Details are listed in review Order page without ProjectId', function () {
        modifiedParamMap = {"Service Instance Name":serviceName,"Use project Id":"","Project Id":""};
        var costCenterObject = JSON.parse(JSON.stringify(costCenterDetailsTemplate));
        catalogPage.clickConfigureButtonBasedOnName(costCenterDetailsTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(costCenterDetailsTemplate, modifiedParamMap).then(function (requiredReturnMap) {
        	expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(requiredReturnMap["Actual"]["Application Code"]).toEqual(requiredReturnMap["Expected"]["Application Code"]);
            expect(requiredReturnMap["Actual"]["Customer"]).toEqual(requiredReturnMap["Expected"]["Customer"]);
            //expect(requiredReturnMap["Actual"]["Project Id"]).toEqual(requiredReturnMap["Expected"]["Project Id"]);
            expect(requiredReturnMap["Actual"]["Cost Center"]).toEqual(requiredReturnMap["Expected"]["Cost Center"]);
        });
    });
    
    it('VRA : Cost Center Details ---- Verify Order is listed in Orders details page once it is submitted from catalog page without ProjectId', function () {
        modifiedParamMap = {"Service Instance Name":serviceName,"Use project Id":"","Project Id":""};
        var costCenterObject = JSON.parse(JSON.stringify(costCenterDetailsTemplate));
        catalogPage.clickConfigureButtonBasedOnName(costCenterDetailsTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(costCenterDetailsTemplate, modifiedParamMap).then(function(requiredReturnMap){
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
            expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(costCenterObject, "Team"));
            expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
            expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
            expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
            expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
            ordersPage.clickServiceConfigurationsTabOrderDetails();
            expect(ordersPage.getTextBasedOnLabelName("Application Code")).toEqual((requiredReturnMap["Expected"]["Application Code"]));
            expect(ordersPage.getTextBasedOnLabelName("Customer")).toEqual((requiredReturnMap["Expected"]["Customer"]));
            //expect(ordersPage.getTextBasedOnLabelName("Project Id")).toEqual((requiredReturnMap["Expected"]["Project Id"]));
            expect(ordersPage.getTextBasedOnLabelName("Cost Center")).toEqual((requiredReturnMap["Expected"]["Cost Center"]));
            ordersPage.clickBillOfMaterialsTabOrderDetails();
            expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
        });
    });
	
	it("VRA : Cost Center Details --- Verify provisioning of Cost Center Details service is working fine from consume App without ProjectId", function(){
        var orderObject = {};
        modifiedParamMap = {"Service Instance Name":serviceName,"Use project Id":"","Project Id":""};
		var costCenterObject = JSON.parse(JSON.stringify(costCenterDetailsTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(costCenterDetailsTemplate.bluePrintName);
    	orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(costCenterDetailsTemplate, modifiedParamMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    	placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		orderFlowUtil.approveOrder(orderObject);
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
		expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
		expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
		orderFlowUtil.verifyOrderStatus(orderObject).then(function(status){
			if(status == 'Completed'){
				orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
				expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
				orderFlowUtil.approveDeletedOrder(orderObject);
				orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
                expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
                orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
				expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
			}
		})		
	})	
})