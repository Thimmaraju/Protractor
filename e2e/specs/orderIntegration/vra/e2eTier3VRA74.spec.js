/********************
  Author : Pushpraj
 ********************/

"use strict";
var CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	Orders = require('../../../pageObjects/orders.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	jsonUtil 		= 	require('../../../../helpers/jsonUtil.js'),
	logGenerator 	= 	require("../../../../helpers/logGenerator.js"),
	logger 			= 	logGenerator.getApplicationLogger(),
	isProvisioningRequired = browser.params.isProvisioningRequired,
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	tier3VRA74Template = require('../../../../testData/OrderIntegration/VRA/3TierVRA74.json');
	
    
describe('e2e Test cases for 3 Tier VRA 7.4 Service', function() {
	var catalogPage, placeOrderPage,ordersPage,serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
			providerName:               'VRA',
			orderSubmittedConfirmationMessage : 'Order Submitted !',
			category:					'Backup & Disaster Recovery',
			estimatedPrice:  			'USD 90.00 ONE TIME CHARGE + USD 118.6292 / MONTH',
            providerAccount:'VRA74 / VRA74'
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
  
  	it('VRA : 3 Tier 7.4 ---- Verify fields on Main Parameters page is working fine', function(){
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);	
		catalogPage.clickConfigureButtonBasedOnName(tier3VRA74Template.bluePrintName);
    	expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
    	var XaaSObject = JSON.parse(JSON.stringify(tier3VRA74Template));
		expect(placeOrderPage.getTextBluePrintName()).toContain(tier3VRA74Template.descriptiveText);
    	placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
    	placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
    	expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
    	//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
    	//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
    	expect(placeOrderPage.getTextEstimatedPrice()).toBe(tier3VRA74Template.EstimatedPrice);
  	});

 	it('VRA : 3 Tier 7.4 ---- Verify Summary details and Additional Details are listed in review Order page', function() {
		var tier374Object = JSON.parse(JSON.stringify(tier3VRA74Template));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(tier3VRA74Template.bluePrintName);
        orderFlowUtil.fillOrderDetails(tier3VRA74Template, modifiedParamMap).then(function (requiredReturnMap) {
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
			let cpu = [jsonUtil.getValue(tier374Object, "DB CPU"), jsonUtil.getValue(tier374Object, "App CPU"), jsonUtil.getValue(tier374Object, "Web CPU")];
			let memory = [jsonUtil.getValue(tier374Object, "DB Memory (MB)"), jsonUtil.getValue(tier374Object, "App Memory (MB)"), jsonUtil.getValue(tier374Object, "Web Memory (MB)")];
			let storage = [jsonUtil.getValue(tier374Object, "DB Storage (GB)"), jsonUtil.getValue(tier374Object, "App Storage (GB)"), jsonUtil.getValue(tier374Object, "Web Storage (GB)")];
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("CPU")).toEqual(cpu);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Memory (MB)")).toEqual(memory);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Storage (GB)")).toEqual(storage);

			
        });
  	});	

  	it ('VRA : 3 Tier 7.4 ---- Verify Order is listed in Orders details page once it is submitted from catalog page',function(){
		var orderObject = {};
		var tier374Object = JSON.parse(JSON.stringify(tier3VRA74Template));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(tier3VRA74Template.bluePrintName);
        orderFlowUtil.fillOrderDetails(tier3VRA74Template, modifiedParamMap);
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
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(XaasObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        ordersPage.clickServiceConfigurationsTabOrderDetails();
		expect(ordersPage.getTextBasedOnLabelName("CPU")).toEqual(jsonUtil.getValue(tier374Object, "DB CPU"));
		expect(ordersPage.getTextBasedOnLabelName("Memory (MB)")).toEqual(jsonUtil.getValue(tier374Object, "DB Memory (MB)"));
		expect(ordersPage.getTextBasedOnLabelName("Storage (GB)")).toEqual(jsonUtil.getValue(tier374Object, "DB Storage (GB)"));
		expect(ordersPage.getTextBasedOnLabelName("CPU")).toEqual(jsonUtil.getValue(tier374Object, "App CPU"));
		expect(ordersPage.getTextBasedOnLabelName("Memory (MB)")).toEqual(jsonUtil.getValue(tier374Object, "App Memory (MB)"));
		expect(ordersPage.getTextBasedOnLabelName("Storage (GB)")).toEqual(jsonUtil.getValue(tier374Object, "App Storage (GB)"));
		expect(ordersPage.getTextBasedOnLabelName("CPU")).toEqual(jsonUtil.getValue(tier374Object, "Web CPU"));
		expect(ordersPage.getTextBasedOnLabelName("Memory (MB)")).toEqual(jsonUtil.getValue(tier374Object, "Web Memory (MB)"));
		expect(ordersPage.getTextBasedOnLabelName("Storage (GB)")).toEqual(jsonUtil.getValue(tier374Object, "Web Storage (GB)"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        //expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual("USD 208.62921");
        expect(ordersPage.getEstimatedCostFromBillOfMaterialsTab()).toEqual("USD 208.62921");
        
	});
	
	if(isProvisioningRequired == "true") {
		it('VRA : 3 Tier 7.4 --- Verify provisioning of VRA-3 Tier 7.4 is working fine from consume App', function() {
			var orderObject = {};
			var XaasObject = JSON.parse(JSON.stringify(tier3VRA74Template));
			catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
			catalogPage.clickConfigureButtonBasedOnName(tier3VRA74Template.bluePrintName);
			orderObject.servicename = serviceName;
			orderFlowUtil.fillOrderDetails(tier3VRA74Template, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//ordersPage.closeServiceDetailsSlider();
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
