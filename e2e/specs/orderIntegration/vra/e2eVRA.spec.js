/*************************************************
	AUTHOR: Anupam Tayal
	MODIFIED BY : Deepthi
**************************************************/

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	isProvisioningRequired = browser.params.isProvisioningRequired,
    tier3TraditionalTemplate = require('../../../../testData/OrderIntegration/VRA/3tierTraditionalWorkload.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
	singleVMCentOSTemplate	= require('../../../../testData/OrderIntegration/VRA/singleVMCentOs.json');

describe('e2e Test cases for VRA -- CentOS and 3 tier', function() {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage, serviceName,userName; 
    var modifiedParamMap = {};
    var messageStrings = {
    		providerName:'VRA',
    		orderSubmittedConfirmationMessage: 'Order Submitted !'
    		};

    beforeAll(function() {
        orders = new Orders();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
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
		userName = browser.params.username;
    });
    
    it('Should Verify Create SingleVMCentOS service order and successful provisioning is working fine with default values - TC C160154', function() { 
    	var orderObject = {};
    	var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
    	orderObject.servicename = serviceName;
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	
    	orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//orders.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',30);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
					expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
					orderFlowUtil.approveDeletedOrder(orderObject);
					//orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
					//expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
				}
			})
		}
    });
	
	it('Should Verify Create SingleVMCentOS service order and successful provision is working fine with custom values - TC C160155 ', function() { 
		//CPU=2, Memory =1024 and Storage=8GB
		var orderObject = {};
    	var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
    	var censOsMap = {"Service Instance Name":serviceName, "CPU":"2","MEMORY":"1024","STORAGE":"5"};
    	orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, censOsMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//orders.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',30);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
					expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
					orderFlowUtil.approveDeletedOrder(orderObject);
					//orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
					//expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
				}
			})
		}
    });
    
	it('Should Verify Create 3 Tier traditional service order and successful provision is working fine with default value - TC C160156', function() { 
		var orderObject = {};
    	var tier3Object = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
    	orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate, modifiedParamMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//orders.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',90);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
					expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
					orderFlowUtil.approveDeletedOrder(orderObject);
					//orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
					//expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
				}
			})
		}
    });
    
	it('ShouldVerify Create 3 Tier traditional service order and successful provision is working fine with custom values - TC C160157', function() { 
		//CPU=2, Memory =1024 and Storage=5GB (App Server, DB Server and Web Server)
		var orderObject = {};
    	var tier3Object = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
    	var tier3Map = {"Service Instance Name":serviceName, "CPU":"2","Memory (MB)":"1024","Storage (GB)":"5","CPU":"2","Memory (MB)":"1024","Storage (GB)":"5","CPU":"2","Memory (MB)":"1024","Storage (GB)":"5"};
    	orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate,tier3Map);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//orders.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',90);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
					expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
					orderFlowUtil.approveDeletedOrder(orderObject);
					//orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
					//expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
				}
			})
		}
    });
	
	it('3Tier VRA ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var tier3Object = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
        catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        var orderId = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderAmount = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        orders.open();
        expect(util.getCurrentURL()).toMatch('orders');
        orders.searchOrderById(orderId);
        expect(orders.getTextFirstOrderIdOrdersTable()).toEqual(orderId);
        orders.clickFirstViewDetailsOrdersTable();
        expect(orders.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        //expect(orders.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(orders.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(orders.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(tier3Object, "Team"));
        //expect(orders.getTextOrderTypeOrderDetails()).toEqual("New");
      //expect(orders.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(orders.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(orders.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(orders.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        orders.clickServiceConfigurationsTabOrderDetails();
        let cpu = [jsonUtil.getValue(tier3Object, "Db CPU"), jsonUtil.getValue(tier3Object, "App CPU"), jsonUtil.getValue(tier3Object, "Web CPU")];
		let memory = [jsonUtil.getValue(tier3Object, "Db Memory (MB)"), jsonUtil.getValue(tier3Object, "App Memory (MB)"), jsonUtil.getValue(tier3Object, "Web Memory (MB)")];
		let storage = [jsonUtil.getValue(tier3Object, "Db Storage (GB)"), jsonUtil.getValue(tier3Object, "App Storage (GB)"), jsonUtil.getValue(tier3Object, "Web Storage (GB)")];
		expect(cpu).toContain(orders.getTextBasedOnLabelName("CPU"));
		expect(memory).toContain(orders.getTextBasedOnLabelName("Memory (MB)"));
		expect(storage).toContain(orders.getTextBasedOnLabelName("Storage (GB)"));
        orders.clickBillOfMaterialsTabOrderDetails();
        expect(orders.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
	});
	
	it('Cent OS VRA ---- Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var CentOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
        catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        var orderId = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderAmount = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        orders.open();
        expect(util.getCurrentURL()).toMatch('orders');
        orders.searchOrderById(orderId);
        expect(orders.getTextFirstOrderIdOrdersTable()).toEqual(orderId);
        orders.clickFirstViewDetailsOrdersTable();
        expect(orders.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        //expect(orders.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(orders.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(orders.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(CentOsObj, "Team"));
        //expect(orders.getTextOrderTypeOrderDetails()).toEqual("New");
      //expect(orders.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(orders.getTextSubmittedByOrderDetails()).toContain(catalogPage.extractUserFirstName());
        expect(orders.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(orders.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        orders.clickServiceConfigurationsTabOrderDetails();
        expect(orders.getTextBasedOnLabelName("CPUs")).toEqual(jsonUtil.getValue(CentOsObj, "CPUs"));
        expect(orders.getTextBasedOnLabelName("Image")).toEqual(jsonUtil.getValue(CentOsObj, "Image"));
        expect(orders.getTextBasedOnLabelName("Memory (MB)")).toEqual(jsonUtil.getValue(CentOsObj, "Memory (MB)"));
        expect(orders.getTextBasedOnLabelName("Size")).toEqual(jsonUtil.getValue(CentOsObj, "Size"));
        expect(orders.getTextBasedOnLabelName("Storage (GB)")).toEqual(jsonUtil.getValue(CentOsObj, "Storage (GB)"));
        orders.clickBillOfMaterialsTabOrderDetails();
        expect(orders.getEstimatedCostFromEstimatedCostTab()).toEqual(orderAmount);
	});

	it('Cent OS VRA ---- Verify Editing the VRA CentOS service', function () {
        var orderObject = {};
    	var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
    	orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//orders.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',30);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					//Function to edit the VRA service
					modifiedParamMap = {"Service Instance Name":"","Cart Service":"","Team":"","Cart Name":"","Environment":"","Application":"","Provider Account":"","CPUs":"2","Memory (MB)":"1024","Storage (GB)":"5"};
					orderFlowUtil.editService(orderObject);
					orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
					placeOrderPage.submitOrder();
					orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    				orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
					placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
					expect(orderFlowUtil.verifyOrderType(orderObject)).toBe('EditSOI');
					orderFlowUtil.approveOrder(orderObject);
					orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
					orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
						//Delete the Edited service
						if (status == 'Completed') {
							orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
							expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
							orderFlowUtil.approveDeletedOrder(orderObject);
							//orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
							//expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
						}
					});
				}
			});

		}
	});
	
	it('Cent OS VRA ---- Verify Editing the VRA 3 tier traditional workload service', function () {
        var orderObject = {};
    	var centOsObj = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
    	orderObject.servicename = serviceName;
    	orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate, modifiedParamMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//orders.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',30);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					
					//Function to edit the VRA service
					modifiedParamMap = {"Service Instance Name":"","Cart Service":"","Team":"","Cart Name":"","Environment":"","Application":"","Provider Account":"","App CPU":"2","App Memory (MB)":"1024","App Storage (GB)":"5"};
					orderFlowUtil.editService(orderObject);
					orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate,modifiedParamMap);
					placeOrderPage.submitOrder();
					orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    				orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
					placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
					expect(orderFlowUtil.verifyOrderType(orderObject)).toBe('EditSOI');
					orderFlowUtil.approveOrder(orderObject);
					orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
					orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
						//Delete the Edited service
						if (status == 'Completed') {
							orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
							expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
							orderFlowUtil.approveDeletedOrder(orderObject);
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
						}
					});
				}
			});

		}
	});
});
