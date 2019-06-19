	"use strict";
	var Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	ordersPage = require('../../../pageObjects/orders.pageObject.js'),
	isProvisioningRequired = browser.params.isProvisioningRequired,
	regressionType = browser.params.regressionType,
	testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	lvsInstanceTemplate	= require('../../../../testData/OrderIntegration/ICD/LinuxVirtualServer.json');

	describe('Order Integration Tests for Linux Virtual server', function() {
	var ordersPage, homePage, catalogPage, placeOrderPage, orders, dashBoard, inventoryPage, serviceName,hostName;
	var modifiedParamMap = {}; 
	var messageStrings = {
	    providerName:               'ICD',
	    category:                   'Compute',
	    catalogPageTitle:           'Store',
	    inputServiceNameWarning:    "Parameter Warning:",
	    orderSubmittedConfirmationMessage : 'Order Submitted !',
	    serviceOffering:	'Linux Virtual Server',
	    estimatedCost:	'USD 0.00 ONE TIME CHARGE + USD 52.08 / MONTH',
	    providerAccount: "icd-TEAM1 / icd-TEAM1",
	};

	beforeAll(function() {
		ordersPage = new Orders();
		homePage = new HomePage();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		browser.driver.manage().window().maximize();
	});

	beforeEach(function() {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		serviceName = "TestAutomation"+util.getRandomString(5);
		hostName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
	});

	it('Verify Main Parameters page is working fine while creating a ICD service',function(){
		catalogPage.clickConfigureButtonBasedOnName(lvsInstanceTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
		placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
		placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
		expect(placeOrderPage.getTextBluePrintName()).toContain("Creates new Linux machine on a virtual server with configuration specified in order");
		expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
		//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);		
		//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe(lvsInstanceTemplate.EstimatedPrice);
	});

	it('Verify Service Detail are listed in Review Order page',function(){
		var orderObject = {};
		var LVSINSObject = JSON.parse(JSON.stringify(lvsInstanceTemplate));
		catalogPage.clickConfigureButtonBasedOnName(lvsInstanceTemplate.bluePrintName); 
		orderObject.servicename = serviceName;
		orderFlowUtil.fillOrderDetails(lvsInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
			expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);	
			//expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);	
			//expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);	
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedCost);
			expect(requiredReturnMap["Actual"]["Number of Virtual Compute Units (vCUs)"]).toEqual(requiredReturnMap["Expected"]["Number of Virtual Compute Units (vCUs)"]);
			expect(requiredReturnMap["Actual"]["Purpose of Service Request"]).toEqual(requiredReturnMap["Expected"]["Purpose of Service Request"]);
			expect(requiredReturnMap["Actual"]["Service Level"]).toEqual(requiredReturnMap["Expected"]["Service Level"]);
			expect(requiredReturnMap["Actual"]["Memory (GB)"]).toEqual(requiredReturnMap["Expected"]["Memory (GB)"]);
			expect(requiredReturnMap["Actual"]["Operating System Version"]).toEqual(requiredReturnMap["Expected"]["Operating System Version"]);
			expect(requiredReturnMap["Actual"]["Security Zone"]).toEqual(requiredReturnMap["Expected"]["Security Zone"]);
		});
	});

	it('Verify Order is listed in Orders Details page once it is submitted from catalog page',function(){
		var orderObject = {};
		var LVSINSObject = JSON.parse(JSON.stringify(lvsInstanceTemplate));
		catalogPage.clickConfigureButtonBasedOnName(lvsInstanceTemplate.bluePrintName);		
		orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(lvsInstanceTemplate, modifiedParamMap);	
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		var orderId = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		var orderStatus = 'Approval In Progress';
		var orderType = 'New';
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		ordersPage.open();
		var actualPrice = ordersPage.getTextFirstAmountOrdersTable();
	    expect(util.getCurrentURL()).toMatch('orders'); 
	    ordersPage.searchOrderById(orderId);
	    expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
    	//expect(ordersPage.isPresentCancelButtonOrderDetails()).toEqual(true);
    	expect(ordersPage.isPresentDenyButtonOrderDetails()).toEqual(true);
    	
	    //Checking Order Details in View order details
	    expect(ordersPage.getTextFirstOrderIdOrdersTable()).toMatch(orderId);//Checking Order Number
	    ordersPage.clickFirstViewDetailsOrdersTable();
	    expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);//Checking Service Name		
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(messageStrings.providerName);//Checking Provider
		//expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(LVSINSObject,"Team"));
        //expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toBe(orderStatus);//Checking Order Status
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe(orderType);//Checking Order Type
        //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(messageStrings.serviceOffering);//Checking Service Offering Name
        //expect(ordersPage.getTextTotalCostOrderDetails()).toBe("N/A");
       // //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        
        //Checking Service Configurations in View order details
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnLabelName("Operating System Version")).toEqual(jsonUtil.getValue(lvsInstanceTemplate,"Operating System Version"));
        expect(ordersPage.getTextBasedOnLabelName("Number of Virtual Compute Units (vCUs)")).toEqual(jsonUtil.getValue(lvsInstanceTemplate,"Number of Virtual Compute Units (vCUs)"));
        expect(ordersPage.getTextBasedOnLabelName("Security Zone")).toEqual(jsonUtil.getValue(lvsInstanceTemplate,"Security Zone"));
        expect(ordersPage.getTextBasedOnLabelName("Service Level")).toEqual(jsonUtil.getValue(lvsInstanceTemplate,"Service Level"));
        expect(ordersPage.getTextBasedOnLabelName("Purpose of Service Request")).toEqual(jsonUtil.getValue(lvsInstanceTemplate,"Purpose of Service Request"));
        expect(ordersPage.getTextBasedOnLabelName("Memory (GB)")).toEqual(jsonUtil.getValue(lvsInstanceTemplate,"Memory (GB)"));
        
        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        //expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe("N/A");
	});

	if(isProvisioningRequired == "true"){
		it('E2E:Verify Linux Virtual server Order Provision is working fine from consume App', function() {
			var orderObject = {};
			var LVSINSObject = JSON.parse(JSON.stringify(lvsInstanceTemplate));
			catalogPage.clickConfigureButtonBasedOnName(lvsInstanceTemplate.bluePrintName);
			orderObject.servicename = serviceName;
			orderFlowUtil.fillOrderDetails(lvsInstanceTemplate, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			//There is no Delete for ICD in inventory page as of now. Hence commenting out this part...
			/*orderFlowUtil.verifyOrderStatus(orderObject).then(function(status){
				if(status == 'Completed'){
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
					expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
					orderFlowUtil.approveDeletedOrder(orderObject);
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
				}
			})*/		
		});
	}
})