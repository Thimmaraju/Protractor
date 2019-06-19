/*************************************************
	AUTHOR: Prasanna, Deepthi
	MODIFIED BY : Santosh
**************************************************/
"use strict";
var logGenerator 	= 		require("../../../../helpers/logGenerator.js"),
	SNOWPage		= 		require('../../../pageObjects/snow.pageObject.js'),
	CatalogPage 	= 		require('../../../pageObjects/catalog.pageObject.js'),
	OrdersPage 		= 		require('../../../pageObjects/orders.pageObject.js'),
	PlaceOrderPage 	= 		require('../../../pageObjects/placeOrder.pageObject.js'),
	orderFlowUtil 	= 		require('../../../../helpers/orderFlowUtil.js'),
	util 			= 		require('../../../../helpers/util.js'),
	jsonUtil 		= 		require('../../../../helpers/jsonUtil.js'),
	logger 			= 		logGenerator.getApplicationLogger(),
	snowApi 		= 		require('../../../../helpers/snowApiRequests.js'),
    appUrls 		= 		require('../../../../testData/appUrls.json'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	telephoneExtensionTemplate = require('../../../../testData/OrderIntegration/SNOW/TelephoneExtension.json');

describe('SNOW : Telephone Extension template', function () {
	
	var snowPage, catalogPage, placeOrderPage, ordersPage, serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
    		providerName:'Managed ServiceNow IT services',
    		category:		'Other Services',
            estimatedPrice : 'USD 195.00 ONE TIME CHARGE + USD 0.00 / MONTH',
            orderSubmittedConfirmationMessage: 'Order Submitted !'
           };
    
    beforeAll(function() {
    	snowPage = new SNOWPage();
    	catalogPage = new CatalogPage();
    	placeOrderPage = new PlaceOrderPage();
    	ordersPage = new OrdersPage();
        browser.driver.manage().window().maximize();
    });
    
    beforeEach(function() {
    	catalogPage.open();
    	if(testEnvironment == "Customer 1"){
    		messageStrings.providerName = "servicenow";
    	}
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    	serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
    
    afterAll(function(){
    	isAngularApp(true);
    })
    
    it('SNOW : Telephone Extension ---- Verify fields on Main Parameters page of Development Laptop is working fine', function () {
        catalogPage.clickConfigureButtonBasedOnName(telephoneExtensionTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        var telephoneExtObject = JSON.parse(JSON.stringify(telephoneExtensionTemplate));
        expect(placeOrderPage.getTextBluePrintName()).toContain(telephoneExtensionTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(telephoneExtensionTemplate.EstimatedPrice);
    });
    
    it('SNOW : Telephone Extension ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var telephoneExtObject = JSON.parse(JSON.stringify(telephoneExtensionTemplate));
        catalogPage.clickConfigureButtonBasedOnName(telephoneExtensionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(telephoneExtensionTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(requiredReturnMap["Actual"]["Quantity"]).toEqual(requiredReturnMap["Expected"]["Quantity"]);
        });
    });
    
    it('SNOW : Telephone Extension ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var telephoneExtObject = JSON.parse(JSON.stringify(telephoneExtensionTemplate));
        catalogPage.clickConfigureButtonBasedOnName(telephoneExtensionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(telephoneExtensionTemplate, modifiedParamMap);
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
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(telephoneExtObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
      //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnLabelName("Quantity")).toEqual(jsonUtil.getValue(telephoneExtObject, "Quantity"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        //expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual("USD195.00");
    });
	
    if(isProvisioningRequired == "false") {
        it("SNOW : Telephone Extension ---- Verify provisioning of New Email Account service is working fine from consume App", function(){
            var orderObject = {};
            var telephoneExtObject = JSON.parse(JSON.stringify(telephoneExtensionTemplate));
            catalogPage.clickConfigureButtonBasedOnName(telephoneExtensionTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            var estimatedPrice;
            placeOrderPage.getTextEstimatedPriceForSnow().then(function(text){
            	estimatedPrice = text;
            });
            orderFlowUtil.fillOrderDetails(telephoneExtensionTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            var orderID = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.orderNumber = orderID;
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
            ordersPage.closeServiceDetailsSlider();
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
            orderID.then(function(order){
                logger.info("Order ID: "+order);
                let srNumber = snowApi.getSnowSRTicketNumber(order);
                srNumber.then(function(ticketID){
                    logger.info("Ticket ID: "+ticketID);
                })
                snowPage.logInToSnowPortalAndCompleteTheRequest(srNumber, estimatedPrice).then(function(state){
                    logger.info("Final Request State: "+state);
                    //isAngularApp(true);
                    orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
                    expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
                });			
            })
        })
    }	
})