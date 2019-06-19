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
	addAmazonTemplate = 	require('../../../../testData/OrderIntegration/VRA/addAmazonAccount.json');

describe('VRA : Add Amazon Account template', function () {
	
	var catalogPage, placeOrderPage, ordersPage, serviceName,amznAcctName;
	var modifiedParamMap = {};
    var messageStrings = {
    		providerName:   'VRA',
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
        amznAcctName = "testAddAmazon"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName,"Name":amznAcctName};
    });
    
    it('VRA : Add Amazon Account ---- Verify fields on Main Parameters page of Add Amazon Account is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(addAmazonTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(addAmazonTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
    });
    
    it('VRA : Add Amazon Account ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var addAmazonTemplateObj = JSON.parse(JSON.stringify(addAmazonTemplate));
        catalogPage.clickConfigureButtonBasedOnName(addAmazonTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(addAmazonTemplate, modifiedParamMap).then(function (requiredReturnMap) {
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(placeOrderPage.getTextBasedOnSpanName("AWS access key:")).toEqual(requiredReturnMap["Expected"]["Access Key"]);
            expect(placeOrderPage.getTextBasedOnSpanName("Account name:")).toEqual(requiredReturnMap["Expected"]["Account name"]);
            //expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("AWS secret key:")).toEqual(requiredReturnMap["Expected"]["Secret Key"]);
        });
    });
    
    it('VRA : Add Amazon Account ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var addAmazonTemplateObj = JSON.parse(JSON.stringify(addAmazonTemplate));
        catalogPage.clickConfigureButtonBasedOnName(addAmazonTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(addAmazonTemplate, modifiedParamMap).then(function(requiredReturnMap){
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
            //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(addAmazonTemplateObj, "Team"));
            //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
            //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
            expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
            expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
            expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
            ordersPage.clickServiceConfigurationsTabOrderDetails();
            expect(ordersPage.getTextBasedOnLabelName("AWS access key")).toEqual((requiredReturnMap["Expected"]["Access Key"]));
            expect(ordersPage.getTextBasedOnLabelName("Account name")).toEqual((requiredReturnMap["Expected"]["Account name"]));
            //expect(ordersPage.getTextBasedOnLabelName("Secret Key")).toEqual((requiredReturnMap["Expected"]["Secret Key"]));
            ordersPage.clickBillOfMaterialsTabOrderDetails();
            expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(messageStrings.estimatedPrice);
        });
    });
	
    if(isProvisioningRequired == "true") {
        it("VRA : Add Amazon Account --- Verify provisioning of Add Amazon Account service is working fine from consume App", function(){
            var orderObject = {};
            var addAmazonTemplateObj = JSON.parse(JSON.stringify(addAmazonTemplate));
            catalogPage.clickConfigureButtonBasedOnName(addAmazonTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(addAmazonTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            /*orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');*/
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