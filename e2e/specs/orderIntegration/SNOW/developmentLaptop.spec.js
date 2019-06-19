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
	developmentLaptopTemplate = require('../../../../testData/OrderIntegration/SNOW/DevelopmentLaptop.json');

describe('SNOW : Development Laptop Template', function () {
	
	var snowPage, catalogPage, placeOrderPage, ordersPage, serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
    		providerName:'Managed ServiceNow IT services',
    		category:		'Other Services',
            estimatedPrice : 'USD 1,200.00 ONE TIME CHARGE + USD 0.00 / MONTH',
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
    
    it('SNOW :Development Laptop ---- Verify fields on Main Parameters page of Development Laptop is working fine', function () {
        catalogPage.clickConfigureButtonBasedOnName(developmentLaptopTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        var developmentLaptopObject = JSON.parse(JSON.stringify(developmentLaptopTemplate));
        expect(placeOrderPage.getTextBluePrintName()).toContain(developmentLaptopTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(developmentLaptopTemplate.EstimatedPrice);
    });
    
    it('SNOW :Development Laptop ---- Verify Summary details and Additional Details are listed in review Order page', function () {
        var developmentLaptopObject = JSON.parse(JSON.stringify(developmentLaptopTemplate));
        catalogPage.clickConfigureButtonBasedOnName(developmentLaptopTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(developmentLaptopTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
            expect(requiredReturnMap["Actual"]["What size solid state drive do you want?"]).toEqual(requiredReturnMap["Expected"]["What size solid state drive do you want?"]);
            expect(requiredReturnMap["Actual"]["Please specify an operating system"]).toEqual(requiredReturnMap["Expected"]["Please specify an operating system"]);
        });
    });
    
    it('SNOW :Development Laptop ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var developmentLaptopObject = JSON.parse(JSON.stringify(developmentLaptopTemplate));
        catalogPage.clickConfigureButtonBasedOnName(developmentLaptopTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(developmentLaptopTemplate, modifiedParamMap);
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
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(developmentLaptopObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
      //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnLabelName("What size solid state drive do you want?")).toEqual(jsonUtil.getValue(developmentLaptopObject, "What size solid state drive do you want?"));
        expect(ordersPage.getTextBasedOnLabelName("Please specify an operating system")).toEqual(jsonUtil.getValue(developmentLaptopObject, "Please specify an operating system")); 
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        //expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual('(USD100.00)');                
    });
	
    if(isProvisioningRequired == "false") {
        it("SNOW : Development Laptop ---- Verify provisioning of Development Laptop service is working fine from consume App", function(){
            var orderObject = {};
            var acrobatObject = JSON.parse(JSON.stringify(developmentLaptopTemplate));
            catalogPage.clickConfigureButtonBasedOnName(developmentLaptopTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            var estimatedPrice;
            placeOrderPage.getTextEstimatedPriceForSnow().then(function(text){
            	estimatedPrice = text;
            }); 
            orderFlowUtil.fillOrderDetails(developmentLaptopTemplate, modifiedParamMap);
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