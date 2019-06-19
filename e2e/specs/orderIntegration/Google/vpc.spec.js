
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
	//testEnvironment = "QA 2",
	vpcTemplate = require('../../../../testData/OrderIntegration/Google/vpc.json');

describe('GCP - VPC Network', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage,serviceName,vpcName;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Google',
		category: 'Network',
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
		serviceName = "auto-vpcnetwork-" + util.getRandomString(5);
		vpcName = "auto-vpc-" + util.getRandomString(5).toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": vpcName };
	});

	it('TC-	C179875 : Google VPC Network : Verify fields on Main Parameters page are working fine', function () {

		catalogPage.clickConfigureButtonBasedOnName(vpcTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);		
		//Set service name
		placeOrderPage.setServiceNameText(serviceName);
		placeOrderPage.selectProviderAccount();
		//Verify Next button is enabled, provider name and category is as per service.
		expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
		//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
		//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
		//Verify Service Name is displayed on Main parameter page.
		expect(placeOrderPage.getTextBluePrintName()).toContain(vpcTemplate.descriptiveText);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe(vpcTemplate.BasePrice);
	});

	it('TC- C179876 : VPC Network : Verify Service Details are displayed in Review Order page', function () {
		var vpcInsObject = JSON.parse(JSON.stringify(vpcTemplate));
		//Select provider to display related services		
		catalogPage.clickConfigureButtonBasedOnName(vpcTemplate.bluePrintName);
		//Fill order details.
		orderFlowUtil.fillOrderDetails(vpcTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            //expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe("$0.00 ONE TIME CHARGE + $25.296 / MONTH");                        
            //expect(requiredReturnMap["Actual"]["Region"]).toEqual(requiredReturnMap["Expected"]["Region"]);            
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(vpcName);
            expect(requiredReturnMap["Actual"]["Routing Mode"]).toEqual(requiredReturnMap["Expected"]["Routing Mode"]);
			expect(requiredReturnMap["Actual"]["Subnet creation mode"]).toEqual(requiredReturnMap["Expected"]["Subnet creation mode"]);
			expect(requiredReturnMap["Actual"]["Enable Firewall Rules"]).toEqual(requiredReturnMap["Expected"]["Enable Firewall Rules"]);
			expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(vpcTemplate.EstimatedPrice); 
			            
        });
		
	});

	it('TC- C179877:VPC Network : Verify Order Details once order is submitted from catalog page', function () {
		var orderObject = {};
		var orderAmount;
		var vpcInsObject = JSON.parse(JSON.stringify(vpcTemplate));
		catalogPage.clickConfigureButtonBasedOnName(vpcTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(vpcTemplate, modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		ordersPage.open();		
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
		//expect(ordersPage.getTextOrderStatusOrderDetails()).toEqual("Approval In Progress");
		expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
		//Validate Service Offering Name on Order Detail page
		//expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(vpcTemplate.serviceId);
		//Validate Team on Order Detail page
		//expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(vpcInsObject, "Team"));
		//Validate Order Type on Order Detail page
		//expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
		//Validate Placed By on Order Detail page
		//expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
		//Validate Approve Button is displayed Order Detail page
		expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);		
		//Validate Deny Button is displayed Order Detail page
		expect(ordersPage.isPresentDenyButtonOrderDetails()).toEqual(true);
		//Verify details from service configurations tab.							
		//expect(ordersPage.getTextBasedOnLabelName("Region")).toEqual(jsonUtil.getValue(vpcInsObject, "Region"));
		expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(vpcName);
		expect(ordersPage.getTextBasedOnLabelName("Routing Mode")).toEqual(jsonUtil.getValue(vpcInsObject, "Routing Mode"));
		expect(ordersPage.getTextBasedOnLabelName("Subnet creation mode")).toEqual(jsonUtil.getValue(vpcInsObject, "Subnet creation mode"));
		expect(ordersPage.getTextBasedOnLabelName("Allow ICMP")).toEqual("False");
		expect(ordersPage.getTextBasedOnLabelName("Allow internal")).toEqual("False");
		expect(ordersPage.getTextBasedOnLabelName("Allow RDP")).toEqual("False");
		expect(ordersPage.getTextBasedOnLabelName("Allow SSH")).toEqual("False");      
		//verify details from Bill of Materials Page.	
		ordersPage.clickBillOfMaterialsTabOrderDetails().then(function(){
			expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(vpcTemplate.TotalCost);   
        });
	});

	if(isProvisioningRequired == "true"){
		it('TC- C179878: VPC Network : E2E:Verify Order Provisioning/Edit/Delete is working fine from consume Application', function () {		
			var orderObject = {};
			var vpcInsObject = JSON.parse(JSON.stringify(vpcTemplate));
			catalogPage.clickConfigureButtonBasedOnName(vpcTemplate.bluePrintName);
					
			orderObject.servicename = serviceName;
			orderFlowUtil.fillOrderDetails(vpcTemplate, modifiedParamMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			orderFlowUtil.approveOrder(orderObject);
			browser.sleep(100000);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					//Edit service Flow	
					var editInsObject = JSON.parse(JSON.stringify(vpcTemplate));
					var modifiedParamMap = {"EditService" : true, "Service" : "VPC Network"};        					
					orderFlowUtil.editService(orderObject);
					browser.sleep(4000);        
					orderFlowUtil.fillOrderDetails(vpcTemplate, modifiedParamMap).then(function(){
						//logger.info("Edit parameter details are filled.");
						browser.sleep(5000);
					});
					placeOrderPage.submitOrder();
					orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();              
					expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');      
					//New function
					placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
					orderFlowUtil.approveOrder(orderObject);
					browser.sleep(100000);
					orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
					orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
						if (status == 'Completed') {
							//Verify updated details are reflected on order details apge.
							ordersPage.clickFirstViewDetailsOrdersTable();
							expect(ordersPage.getTextBasedOnLabelName("Routing Mode")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "Routing Mode"));
							expect(ordersPage.getTextBasedOnExactLabelName("Subnet name")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "Subnet name"));
							expect(ordersPage.getTextBasedOnLabelName("Region")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "Region"));
							expect(ordersPage.getTextBasedOnLabelName("Subnet creation mode")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "Subnet creation mode"));
							expect(ordersPage.getTextBasedOnLabelName("IP address range")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "IP address range"));               
						}
						//delete the service
						orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
						expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
						orderFlowUtil.approveDeletedOrder(orderObject);
						browser.sleep(100000);
						orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
						expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
					});					
				}
			});			
		});	
	}	
});

