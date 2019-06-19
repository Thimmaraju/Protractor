"use strict";
"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    gcpCloudDNSTemplate = require('../../../../testData/OrderIntegration/Google/gcpCLoudDNSInstance.json');
	
describe('GCP - Cloud DNS', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, inventoryPage, serviceName, zoneName, zonename;
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
        inventoryPage = new InventoryPage();        
        browser.manage().window().setSize(1600, 1000);        
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
        serviceName = "auto-cloud-dns-" + util.getRandomString(5);
        zonename = "gcp-test-cbs" + util.getRandomString(5);
        zoneName = zonename.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Zone name": zoneName };
    });

    it('TC-C179963 : GCP DNS - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox('Network');
        catalogPage.clickConfigureButtonBasedOnName(gcpCloudDNSTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(gcpCloudDNSTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(gcpCloudDNSTemplate.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(gcpCloudDNSTemplate.BasePrice);
    });

    it('TC-C179966 : GCP DNS - Verify Summary details and Additional Details are listed in review Order page', function () {
        var NetworkINSObject = JSON.parse(JSON.stringify(gcpCloudDNSTemplate));
        catalogPage.clickProviderOrCategoryCheckbox('Network');
        catalogPage.clickConfigureButtonBasedOnName(gcpCloudDNSTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpCloudDNSTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            //expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe("$0.00 ONE TIME CHARGE + $5,577.60 / MONTH");
            expect(requiredReturnMap["Actual"]["Zone name"]).toEqual(requiredReturnMap["Expected"]["Zone name"]);
            expect(requiredReturnMap["Actual"]["DNS name"]).toEqual(requiredReturnMap["Expected"]["DNS name"]);
            expect(requiredReturnMap["Actual"]["Description"]).toEqual(requiredReturnMap["Expected"]["Description"]);
            expect(requiredReturnMap["Actual"]["DNSSEC State"]).toEqual(requiredReturnMap["Expected"]["DNSSEC State"]);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(gcpCloudDNSTemplate.EstimatedPrice);
         });
    });

    it('TC-C179967 : GCP DNS - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
	    var orderAmount;
        var NetworkINSObject = JSON.parse(JSON.stringify(gcpCloudDNSTemplate));
        catalogPage.clickProviderOrCategoryCheckbox('Network');
        catalogPage.clickConfigureButtonBasedOnName(gcpCloudDNSTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpCloudDNSTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        //ordersPage.clickordersLink();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
        //var orderAmount = ordersPage.getTextFirstAmountOrdersTable();	       
        ordersPage.getTextFirstAmountOrdersTable().then(function(text){
            orderAmount = text;
        });
        //ordersPage.clickFirstViewDetailsOrdersTable();
        orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);        
	//expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(gcpCloudDNSTemplate.serviceId);
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(NetworkINSObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);        
        util.waitForAngular();       
	    expect(ordersPage.getTextBasedOnLabelName("Zone name")).toEqual(zoneName);
        expect(ordersPage.getTextBasedOnLabelName("DNS name")).toEqual(jsonUtil.getValue(NetworkINSObject, "DNS name"));
        expect(ordersPage.getTextBasedOnLabelName("DNSSEC State")).toEqual(jsonUtil.getValue(NetworkINSObject,"DNSSEC State"));
        expect(ordersPage.getTextBasedOnLabelName("Description")).toEqual(jsonUtil.getValue(NetworkINSObject, "Description"));        
        ordersPage.clickBillOfMaterialsTabOrderDetails().then(function(){
            expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(gcpCloudDNSTemplate.TotalCost);
        });
    });

    if(isProvisioningRequired == "true"){
        it('TC-C179968: GCP DNS - E2E : Verify Service Provision, Add Recordset & Deletion is working fine from consume App', function () {
            var orderObject = {};
            var NetworkINSObject = JSON.parse(JSON.stringify(gcpCloudDNSTemplate));
            catalogPage.clickProviderOrCategoryCheckbox('Network');
            catalogPage.clickConfigureButtonBasedOnName(gcpCloudDNSTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(gcpCloudDNSTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            //browser.sleep(4000);
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            //browser.sleep(6000);
            orderFlowUtil.approveOrder(orderObject);
	    browser.sleep(70000);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
	    // Verify service can be deleted
            orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
            expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
            orderFlowUtil.approveDeletedOrder(orderObject);
            orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');        
            //Recordset flow            
            //inventoryPage.open();        
		// inventoryPage.searchOrderByServiceName(orderObject.servicename);
		// inventoryPage.clickExpandFirstRow().then(function () {
		// 	util.waitForAngular();
		// 	browser.executeScript('window.scrollTo(0,0);');
		// 	inventoryPage.clickOverflowActionButtonForAddRecordSet().then(function () {
		// 		inventoryPage.clickAddRecordSet().then(function () {
		// 			inventoryPage.fillDnsRecordSetDetails();
		// 		});
		// 	});
		// });
		// placeOrderPage.submitOrder();
		// //browser.sleep(5000);
		// orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		// orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();        
		// placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		// orderFlowUtil.approveOrder(orderObject);
		// orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
		// orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
		// 	if (status == 'Completed') {
		// 		//Verify updated details are reflected on order details apge.
		// 		ordersPage.clickFirstViewDetailsOrdersTable();
		// 		expect(ordersPage.getTextBasedOnLabelName("DNS name")).toEqual("auto-qa-test");
		// 		expect(ordersPage.getTextBasedOnLabelName("TTL")).toEqual("2");
		// 		expect(ordersPage.getTextBasedOnLabelName("IPv4 Address")).toEqual("192.168.22.10");
		// 		expect(ordersPage.getTextBasedOnLabelName("Resource Record Type")).toEqual("A");
		// 		expect(ordersPage.getTextBasedOnLabelName("TTL Unit")).toEqual("minutes");
		// 		//Verify service can be deleted
		// 		orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
		// 		expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
		// 		orderFlowUtil.approveDeletedOrder(orderObject);
		// 		orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
		// 		expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
		// 	}
		// })  

        });
    }
  
});
