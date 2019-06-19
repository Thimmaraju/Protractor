
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
	isProvisioningRequired = browser.params.isProvisioningRequired,
	cloudStorageTemplate = require('../../../../testData/OrderIntegration/Google/cloudstorage.json');
	
	
describe('GCP - Cloud Storage', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage,serviceName,bucketname,bucketName;
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
		//catalogPage.clickProviderOrCategoryCheckboxGcp(messageStrings.providerName);
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
		serviceName = "auto-cloud-storage-" + util.getRandomString(5);
		bucketname = "qabucket-" + util.getRandomString(5);
		bucketName = bucketname.toLowerCase()
        modifiedParamMap = { "Name": bucketName, "Service Instance Name": serviceName };
	});

	it('TC- C179921 : Google Cloud Storage : Verify fields on Main Parameters page are working fine.', function () {
		
		catalogPage.clickConfigureButtonBasedOnName(cloudStorageTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);		
		//Verify service description is available on main parameter page.
		expect(placeOrderPage.getTextBluePrintName()).toContain(cloudStorageTemplate.descriptiveText);
		placeOrderPage.setServiceNameText(serviceName);
		placeOrderPage.selectProviderAccount();	
		//Verify Next button is enabled, provider name and category is as per service.
		expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
		//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
		//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe(cloudStorageTemplate.BasePrice);

	});

	it('TC-C179922 : Google Cloud Storage : Verify Service Details are listed in Review Order page', function () {
		//browser.ignoreSynchronization = false;
		var cloudStorageInsObject = JSON.parse(JSON.stringify(cloudStorageTemplate));
		//Select provider to display related services		
		catalogPage.clickConfigureButtonBasedOnName(cloudStorageTemplate.bluePrintName);
		//Fill order details.
		orderFlowUtil.fillOrderDetails(cloudStorageTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            //Verify Additional Details            
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(bucketName);
            expect(requiredReturnMap["Actual"]["Storage Class"]).toEqual(requiredReturnMap["Expected"]["Storage Class"]);
            expect(requiredReturnMap["Actual"]["Location"]).toEqual(requiredReturnMap["Expected"]["Location"]);
            expect(requiredReturnMap["Actual"]["Encryption"]).toEqual(requiredReturnMap["Expected"]["Encryption"]);
            expect(requiredReturnMap["Actual"]["Key"]).toEqual(requiredReturnMap["Expected"]["Key"]);
			expect(requiredReturnMap["Actual"]["Value"]).toEqual(requiredReturnMap["Expected"]["Value"]);			
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(cloudStorageTemplate.EstimatedPrice);
        });
		
	});

	it('TC- C179923 : Google Cloud Storage : Verify Order Details once order is submitted from catalog page', function () {
		var orderObject = {};
		var orderAmount;
		var cloudStorageInsObject = JSON.parse(JSON.stringify(cloudStorageTemplate));
		catalogPage.clickConfigureButtonBasedOnName(cloudStorageTemplate.bluePrintName);
		//var servicename = orderFlowUtil.fillOrderDetails(cloudStorageTemplate);
		orderFlowUtil.fillOrderDetails(cloudStorageTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		ordersPage.open();		
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
		//expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(cloudStorageTemplate.serviceId);
		//Validate Team on Order Detail page
		//expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(cloudStorageInsObject, "Team"));
		//Validate Order Type on Order Detail page
		//expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
		//Validate Placed By on Order Detail page
		//expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
		//Validate Approve Button is displayed Order Detail page
		expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);		
		//Validate Deny Button is displayed Order Detail page
		expect(ordersPage.isPresentDenyButtonOrderDetails()).toEqual(true);
		//Verify details from service configurations tab.		
		//expect(placeOrderPage.getTextBasedOnLabelName("Name")).toEqual(bucketName);
		expect(ordersPage.getTextBasedOnLabelName("Storage Class")).toEqual(jsonUtil.getValue(cloudStorageInsObject, "Storage Class"));
		expect(ordersPage.getTextBasedOnLabelName("Location")).toEqual(jsonUtil.getValue(cloudStorageInsObject, "Location"));
		expect(ordersPage.getTextBasedOnLabelName("Encryption")).toEqual(jsonUtil.getValue(cloudStorageInsObject, "Encryption"));
		expect(ordersPage.getTextBasedOnLabelName("Key")).toEqual(jsonUtil.getValue(cloudStorageInsObject, "Key"));
		expect(ordersPage.getTextBasedOnLabelName("Value")).toEqual(jsonUtil.getValue(cloudStorageInsObject, "Value"));		
		//verify details from Bill of Materials Page.			
		ordersPage.clickBillOfMaterialsTabOrderDetails().then(function(){
            expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(cloudStorageTemplate.TotalCost);   
        });
	});

	if(isProvisioningRequired == "true"){
		it('TC-C179924 : Google Cloud Storage : E2E:Verify Google cloud storage Order Provisioning is working fine from consume Application', function () {
			var orderObject = {};
			var cloudStorageInsObject = JSON.parse(JSON.stringify(cloudStorageTemplate));
			catalogPage.clickConfigureButtonBasedOnName(cloudStorageTemplate.bluePrintName);        
			orderObject.servicename = serviceName;
			orderFlowUtil.fillOrderDetails(cloudStorageTemplate, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			//Edit and Delete flow
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {              	
					//Edit service flow					
					var modifiedParamMap = {"Service Instance Name": "", "EditService" : true, "Storage Class" : "Nearline"};
					orderFlowUtil.editService(orderObject);    
					orderFlowUtil.fillOrderDetails(cloudStorageTemplate, modifiedParamMap).then(function(){					
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
							expect(ordersPage.getTextBasedOnLabelName("Storage Class")).toEqual(modifiedParamMap["Storage Class"]);
							//Delete Service flow
							orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
							expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
							orderFlowUtil.approveDeletedOrder(orderObject);
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
						}
					}); 
				}
			});
		});
	}	
});
