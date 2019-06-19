/********************
  Author : Deepthi
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
	vtsXaaSTemplate = require('../../../../testData/OrderIntegration/VRA/VTSXaasBlueprint.json');
	
    
describe('e2e Test cases for XaaS VTS', function() {
	var catalogPage, placeOrderPage,ordersPage,serviceName;
	var modifiedParamMap = {};
    var messageStrings = {
			providerName:               'VRA',
			orderSubmittedConfirmationMessage : 'Order Submitted !',
			category:					'Compute',
			estimatedPrice:  			'USD 10.00 ONE TIME CHARGE + USD 30.00 / MONTH',
            providerAccount:'vRA73 / vRA73'
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
  
  	it('VRA : VTS - XAAS ---- Verify fields on Main Parameters page of XAAS is working fine', function(){
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);	
		catalogPage.clickConfigureButtonBasedOnName(vtsXaaSTemplate.bluePrintName);
    	expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
    	var XaaSObject = JSON.parse(JSON.stringify(vtsXaaSTemplate));
		//expect(placeOrderPage.getTextBluePrintName()).toContain(vtsXaaSTemplate.descriptiveText);
    	placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
    	placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
    	expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
    	//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
    	//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
    	expect(placeOrderPage.getTextEstimatedPrice()).toBe(vtsXaaSTemplate.EstimatedPrice);
  	});

 	it('VRA : XAAS ---- Verify Summary details and Additional Details are listed in review Order page', function() {
		var XaaSObject = JSON.parse(JSON.stringify(vtsXaaSTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(vtsXaaSTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(vtsXaaSTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
			expect(requiredReturnMap["Actual"]["Template"]).toEqual(requiredReturnMap["Expected"]["Template"]);
			expect(requiredReturnMap["Actual"]["Data Center"]).toEqual(requiredReturnMap["Expected"]["Data Center"]);
			expect(requiredReturnMap["Actual"]["Network Zone"]).toEqual(requiredReturnMap["Expected"]["Network Zone"]);
			expect(requiredReturnMap["Actual"]["VM Environment"]).toEqual(requiredReturnMap["Expected"]["VM Environment"]);
			expect(requiredReturnMap["Actual"]["VCPU"]).toEqual(requiredReturnMap["Expected"]["VCPU"]);
			expect(requiredReturnMap["Actual"]["RAM (GiB)"]).toEqual(requiredReturnMap["Expected"]["RAM (GiB)"]);
			expect(requiredReturnMap["Actual"]["OS Primary Storage Size (GiB)"]).toEqual(requiredReturnMap["Expected"]["OS Primary Storage Size (GiB)"]);
			expect(requiredReturnMap["Actual"]["Patch Day"]).toEqual(requiredReturnMap["Expected"]["Patch Day"]);
			expect(requiredReturnMap["Actual"]["Patch Window"]).toEqual(requiredReturnMap["Expected"]["Patch Window"]);
			expect(requiredReturnMap["Actual"]["DNS"]).toEqual(requiredReturnMap["Expected"]["DNS"]);
			expect(requiredReturnMap["Actual"]["Application Code"]).toEqual(requiredReturnMap["Expected"]["Application Code"]);
			expect(requiredReturnMap["Actual"]["Cost Center"]).toEqual(requiredReturnMap["Expected"]["Cost Center"]);
			expect(requiredReturnMap["Actual"]["Commitment Item"]).toEqual(requiredReturnMap["Expected"]["Commitment Item"]);
			expect(requiredReturnMap["Actual"]["Cloud Request ID"]).toEqual(requiredReturnMap["Expected"]["Cloud Request ID"]);
        });
  	});	

  	 it('VRA : XAAS ---- Verify Order is listed in Orders details page once it is submitted from catalog page',function(){
		var orderObject = {};
		var XaasObject = JSON.parse(JSON.stringify(vtsXaaSTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(vtsXaaSTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(vtsXaaSTemplate, modifiedParamMap);
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
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(XaasObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        ordersPage.clickServiceConfigurationsTabOrderDetails();
		expect(ordersPage.getTextBasedOnLabelName("Template")).toEqual(jsonUtil.getValue(XaasObject, "Template"));
		expect(ordersPage.getTextBasedOnLabelName("Data Center")).toEqual(jsonUtil.getValue(XaasObject, "Data Center"));
		expect(ordersPage.getTextBasedOnLabelName("Network Zone")).toEqual(jsonUtil.getValue(XaasObject, "Network Zone"));
		expect(ordersPage.getTextBasedOnLabelName("VM Environment")).toEqual(jsonUtil.getValue(XaasObject, "VM Environment"));
		expect(ordersPage.getTextBasedOnLabelName("VCPU")).toEqual(jsonUtil.getValue(XaasObject, "VCPU"));
		expect(ordersPage.getTextBasedOnLabelName("RAM (GiB)")).toEqual(jsonUtil.getValue(XaasObject, "RAM (GiB)"));
		expect(ordersPage.getTextBasedOnLabelName("OS Primary Storage Size (GiB)")).toEqual(jsonUtil.getValue(XaasObject, "OS Primary Storage Size (GiB)"));
		expect(ordersPage.getTextBasedOnLabelName("Patch Day")).toEqual(jsonUtil.getValue(XaasObject, "Patch Day"));
		expect(ordersPage.getTextBasedOnLabelName("Patch Window")).toEqual(jsonUtil.getValue(XaasObject, "Patch Window"));
		expect(ordersPage.getTextBasedOnLabelName("DNS")).toEqual(jsonUtil.getValue(XaasObject, "DNS"));
		expect(ordersPage.getTextBasedOnLabelName("Application Code")).toEqual(jsonUtil.getValue(XaasObject, "Application Code"));
		expect(ordersPage.getTextBasedOnLabelName("Customer")).toContain(jsonUtil.getValue(XaasObject, "Customer"));
		expect(ordersPage.getTextBasedOnLabelName("Cost Center")).toEqual(jsonUtil.getValue(XaasObject, "Cost Center"));
		expect(ordersPage.getTextBasedOnLabelName("Commitment Item")).toEqual(jsonUtil.getValue(XaasObject, "Commitment Item"));
		expect(ordersPage.getTextBasedOnLabelName("Cloud Request ID")).toEqual(jsonUtil.getValue(XaasObject, "Cloud Request ID"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
	});
	
	if(isProvisioningRequired == "true") {
		it('VRA : XAAS --- Verify provisioning of VRA-XAAS is working fine from consume App', function() {
			var orderObject = {};
			var XaasObject = JSON.parse(JSON.stringify(vtsXaaSTemplate));
			catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
			catalogPage.clickConfigureButtonBasedOnName(vtsXaaSTemplate.bluePrintName);
			orderObject.servicename = serviceName;
			orderFlowUtil.fillOrderDetails(vtsXaaSTemplate, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			ordersPage.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed'); 
			//Now there is no delete implementation for this service. Delete will be implemented once the feature is available  
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
	}
});
