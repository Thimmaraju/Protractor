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
    isProvisioningRequired = browser.params.isProvisioningRequired,
	appUrls 		= 		require('../../../../testData/appUrls.json'),
	centOsHideExpTemplate = 	require('../../../../testData/OrderIntegration/VRA/CentOsHideExpression.json');

describe('VRA : Cent Os Hide Expressions', function () {
	
	var catalogPage, placeOrderPage, ordersPage, serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
    		providerName:   'VRA',
    		category:		'Compute',
            estimatedPrice : 'USD 10.00 ONE TIME CHARGE + USD 130.00 / MONTH',
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
    
    it('VRA : Cent Os Hide Expressions ---- Verify fields on Main Parameters page of Cent Os Hide Expressions is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(centOsHideExpTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(centOsHideExpTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(centOsHideExpTemplate.EstimatedPrice);
    });
    
    it('VRA : Cent Os Hide Expressions ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var centOsHideExpTemplateObj = JSON.parse(JSON.stringify(centOsHideExpTemplate));
        catalogPage.clickConfigureButtonBasedOnName(centOsHideExpTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(centOsHideExpTemplate, modifiedParamMap).then(function (requiredReturnMap) {
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(requiredReturnMap["Actual"]["CPU"]).toEqual(requiredReturnMap["Expected"]["CPU"]);
            expect(requiredReturnMap["Actual"]["MEMORY"]).toEqual(requiredReturnMap["Expected"]["MEMORY"]);
            expect(requiredReturnMap["Actual"]["STORAGE"]).toEqual(requiredReturnMap["Expected"]["STORAGE"]);
            expect(requiredReturnMap["Actual"]["VIRTUAL MACHINE CDROM"]).toEqual(requiredReturnMap["Expected"]["VIRTUAL MACHINE CDROM"]);
            expect(requiredReturnMap["Actual"]["VIRTUAL MACHINE ADMIN ACCESS"]).toEqual(requiredReturnMap["Expected"]["VIRTUAL MACHINE ADMIN ACCESS"]);
            expect(requiredReturnMap["Actual"]["VIRTUAL MACHINE MACHINE SSH"]).toEqual(requiredReturnMap["Expected"]["VIRTUAL MACHINE MACHINE SSH"]);
        });
    });
    
    it('VRA : Cent Os Hide Expressions ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var centOsHideExpTemplateObj = JSON.parse(JSON.stringify(centOsHideExpTemplate));
        catalogPage.clickConfigureButtonBasedOnName(centOsHideExpTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(centOsHideExpTemplate, modifiedParamMap).then(function(requiredReturnMap){
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
           // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(centOsHideExpTemplateObj, "Team"));
            //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
          //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
            expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
            expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
            expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
            ordersPage.clickServiceConfigurationsTabOrderDetails();
            expect(ordersPage.getTextBasedOnLabelName("CPU")).toEqual((requiredReturnMap["Expected"]["CPU"]));
            expect(ordersPage.getTextBasedOnLabelName("MEMORY")).toEqual((requiredReturnMap["Expected"]["MEMORY"]));
            expect(ordersPage.getTextBasedOnLabelName("STORAGE")).toEqual((requiredReturnMap["Expected"]["STORAGE"]));
            expect(ordersPage.getTextBasedOnLabelName("VIRTUAL MACHINE CDROM")).toEqual((requiredReturnMap["Expected"]["VIRTUAL MACHINE CDROM"]));
            expect(ordersPage.getTextBasedOnLabelName("VIRTUAL MACHINE ADMIN ACCESS")).toEqual((requiredReturnMap["Expected"]["VIRTUAL MACHINE ADMIN ACCESS"]));
            expect(ordersPage.getTextBasedOnLabelName("VIRTUAL MACHINE MACHINE SSH")).toEqual((requiredReturnMap["Expected"]["VIRTUAL MACHINE MACHINE SSH"]));
            ordersPage.clickBillOfMaterialsTabOrderDetails();
            expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
        });
    });
    
    if(isProvisioningRequired == "true"){
        it("VRA : Cent Os Hide Expressions --- Verify provisioning of Cent Os Hide Expressions service is working fine from consume App", function(){
            var orderObject = {};
            var centOsHideExpTemplateObj = JSON.parse(JSON.stringify(centOsHideExpTemplate));
            catalogPage.clickConfigureButtonBasedOnName(centOsHideExpTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(centOsHideExpTemplate, modifiedParamMap);
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
        })	
    }	
})