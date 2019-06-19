
"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
	//testEnvironment = "QA 2",
	persistentDiskTemplate = require('../../../../testData/OrderIntegration/Google/persistentdisk.json'),
	isProvisioningRequired = browser.params.isProvisioningRequired;
	//persistentDiskEditTemplate = require('../../../../testData/OrderIntegration/Google/persistentdisk_Edit.json');
	
describe('GCP - Persistent Disk', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage,serviceName;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Google',
		category: 'Storage',
		catalogPageTitle: 'Search, Select and Configure',
		inputServiceNameWarning: "Parameter Warning:",
		orderSubmittedConfirmationMessage: 'Order Submitted !',
	};

	beforeAll(function () {
		ordersPage = new Orders();
		homePage = new HomePage();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		browser.driver.manage().window().maximize();		
	});

	beforeEach(function () {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		serviceName = "auto-persistentdisk-" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
	});

	it('TC- C179869 : Google Persistent Disk : Verify fields on Main Parameters page are working fine while provisioning a Google persistent disk service', function () {
		
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
		//Verify Service Name is displayed on Main parameter page.
		expect(placeOrderPage.getTextBluePrintName()).toContain(persistentDiskTemplate.descriptiveText);				
		placeOrderPage.setServiceNameText(serviceName);
		placeOrderPage.selectProviderAccount();
		//Verify Next button is enabled, provider name and category is as per service.
		expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
		//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
		//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe(persistentDiskTemplate.BasePrice);

	});

	it('TC- C179873: Google Persistent Disk : Verify Service Details are listed in Review Order page', function () {
		
		var persistentDiskInsObject = JSON.parse(JSON.stringify(persistentDiskTemplate));
		//Select provider to display related services		
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);
		//Fill order details.
		orderFlowUtil.fillOrderDetails(persistentDiskTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
           // expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            //expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe("$0.00 ONE TIME CHARGE + $25.296 / MONTH");                        
            expect(requiredReturnMap["Actual"]["Region"]).toEqual(requiredReturnMap["Expected"]["Region"]);
            expect(requiredReturnMap["Actual"]["Zone"]).toEqual(requiredReturnMap["Expected"]["Zone"]);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Source Type"]).toEqual(requiredReturnMap["Expected"]["Source Type"]);
            //expect(requiredReturnMap["Actual"]["Image"]).toContain(requiredReturnMap["Expected"]["Image"]);
            expect(requiredReturnMap["Actual"]["Disk Type"]).toEqual(requiredReturnMap["Expected"]["Disk Type"]);
            expect(requiredReturnMap["Actual"]["Size (GB)"]).toEqual(requiredReturnMap["Expected"]["Size (GB)"]);
            expect(requiredReturnMap["Actual"]["Disk Mode"]).toEqual(requiredReturnMap["Expected"]["Disk Mode"]);
			expect(requiredReturnMap["Actual"]["Encryption"]).toEqual(requiredReturnMap["Expected"]["Encryption"]);			            
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(persistentDiskTemplate.EstimatedPrice);
        });
		
	});

	it('TC- C179871: Google Persistent Disk : Verify Order Details once order is submitted from catalog page', function () {
		var orderObject = {};
		var orderAmount;
		var persistentDiskInsObject = JSON.parse(JSON.stringify(persistentDiskTemplate));
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);
		//var servicename = orderFlowUtil.fillOrderDetails(persistentDiskTemplate);
		orderFlowUtil.fillOrderDetails(persistentDiskTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		ordersPage.open();
		//ordersPage.clickordersLink();
		expect(util.getCurrentURL()).toMatch('orders');
		ordersPage.searchOrderById(orderObject.orderNumber);
		expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);        
        ordersPage.getTextFirstAmountOrdersTable().then(function(text){
            orderAmount = text;
        });
		ordersPage.clickFirstViewDetailsOrdersTable();
		//orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
		//Validate Service Instance Name on Order Detail page.
		expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
		//Validate Provider Name on Order Detail page.
		expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
		//Validate Order Status on Order Detail page.
		expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
		//Validate Service Offering Name on Order Detail page
		//expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(persistentDiskTemplate.serviceId);
		//Validate Team on Order Detail page
		//expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Team"));
		//Validate Order Type on Order Detail page
		//expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
		//Validate Placed By on Order Detail page
		//expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
		//Validate Approve Button is displayed Order Detail page
		expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);		
		//Validate Deny Button is displayed Order Detail page
		expect(ordersPage.isPresentDenyButtonOrderDetails()).toEqual(true);
		//Verify details from service configurations tab.		
		expect(ordersPage.getTextBasedOnLabelName("Zone")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Zone"));		
		expect(ordersPage.getTextBasedOnLabelName("Region")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Region"));
		//expect(placeOrderPage.getTextBasedOnLabelName("Name")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Name"));
		expect(ordersPage.getTextBasedOnLabelName("Source Type")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Source Type"));
		//expect(ordersPage.getTextBasedOnLabelName("Image")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Image"));
		expect(ordersPage.getTextBasedOnLabelName("Disk Type")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Disk Type"));
		expect(ordersPage.getTextBasedOnLabelName("Size (GB)")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Size (GB)"));
		expect(ordersPage.getTextBasedOnLabelName("Disk Mode")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Disk Mode"));
		expect(ordersPage.getTextBasedOnLabelName("Encryption")).toEqual(jsonUtil.getValue(persistentDiskInsObject, "Encryption"));		
		//verify details from Bill of Materials Page.	
		ordersPage.clickBillOfMaterialsTabOrderDetails().then(function(){
		    expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(persistentDiskTemplate.TotalCost);    
        });
	});

	if(isProvisioningRequired == "true"){	
		it('TC- C179874: Google Persistent Disk : E2E:Verify Google Persistent Disk Order Provisioning/Edit/Delete is working fine from consume Application', function () {
			var orderObject = {};
			//var persistentDiskInsObject = JSON.parse(JSON.stringify(persistentDiskTemplate));
			catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);        
			orderObject.servicename = serviceName;
			orderFlowUtil.fillOrderDetails(persistentDiskTemplate, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {            	
					//Edit service flow
					//var editInsObject = JSON.parse(JSON.stringify(persistentDiskEditTemplate));
					var modifiedParamMap = { "Service Instance Name": "", "Instance Name": "", "EditService" : true, "Size (GB)" : "70"};        				
					orderFlowUtil.editService(orderObject);    
					orderFlowUtil.fillOrderDetails(persistentDiskTemplate, modifiedParamMap).then(function(){					
						browser.sleep(5000);
					});
					placeOrderPage.submitOrder();
					orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();              
					expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');				
					placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
					orderFlowUtil.approveOrder(orderObject);
					orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
					orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
						if (status == 'Completed') {
							//Verify updated details are reflected on order details apge.						
							ordersPage.clickFirstViewDetailsOrdersTable();
							expect(ordersPage.getTextBasedOnLabelName("Size (GB)")).toEqual(modifiedParamMap["Size (GB)"]);						
							//Delete Service flow
							orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
							expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
							orderFlowUtil.approveDeletedOrder(orderObject);
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
						}
					});   


				}
			})

		});
	}	

});
