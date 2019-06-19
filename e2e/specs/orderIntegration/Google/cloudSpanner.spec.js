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

    gcpCloudSpannerTemplate = require('../../../../testData/OrderIntegration/Google/gcpCloudSpanner.json');

describe('GCP - Cloud Spanner', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Google',
        category: 'Databases',
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
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
	catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        serviceName = "auto-cloudSpanner-" + util.getRandomString(5);	
        modifiedParamMap = { "Service Instance Name": serviceName };
    });

    it('TC-C181989 : GCP Spanner - Verify fields on Main Parameters page is working fine', function () {
        
        catalogPage.clickConfigureButtonBasedOnName(gcpCloudSpannerTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(gcpCloudSpannerTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(gcpCloudSpannerTemplate.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
    });

    it('TC-C181990 : GCP Spanner - Verify Summary details and Additional Details are listed in review Order page', function () {
        var NetworkINSObject = JSON.parse(JSON.stringify(gcpCloudSpannerTemplate));
        
        catalogPage.clickConfigureButtonBasedOnName(gcpCloudSpannerTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpCloudSpannerTemplate, modifiedParamMap).then(function (requiredReturnMap) {
        	expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            //expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe("$0.00 ONE TIME CHARGE + $0.00 / MONTH");
            expect(requiredReturnMap["Actual"]["Instance name"]).toEqual(requiredReturnMap["Expected"]["Instance name"]);
            expect(requiredReturnMap["Actual"]["Instance ID"]).toEqual(requiredReturnMap["Expected"]["Instance ID"]);
            expect(requiredReturnMap["Actual"]["Description"]).toEqual(requiredReturnMap["Expected"]["Description"]);
            expect(requiredReturnMap["Actual"]["Configuration"]).toEqual(requiredReturnMap["Expected"]["Configuration"]);
            expect(requiredReturnMap["Actual"]["Location (Regional)"]).toEqual(requiredReturnMap["Expected"]["Location (Regional)"]);
            expect(requiredReturnMap["Actual"]["Nodes"]).toEqual(requiredReturnMap["Expected"]["Nodes"]);
         });
    });

    it('TC-C181991 : GCP Spanner - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
	var orderAmount;
        var NetworkINSObject = JSON.parse(JSON.stringify(gcpCloudSpannerTemplate));
        
        catalogPage.clickConfigureButtonBasedOnName(gcpCloudSpannerTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpCloudSpannerTemplate, modifiedParamMap);
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
        var orderAmount = ordersPage.getTextFirstAmountOrdersTable();
        ordersPage.clickFirstViewDetailsOrdersTable();
        orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        //expect(ordersPage.getTextOrderStatusOrderDetails()).toEqual("Approval In Progress");
	expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(gcpCloudSpannerTemplate.serviceId);
        expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(NetworkINSObject, "Team"));
        expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        //expect(ordersPage.isPresentCancelButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        //ordersPage.clickServiceConfigurationsTabOrderDetails();        
        expect(ordersPage.getTextBasedOnLabelName("Instance name")).toEqual(jsonUtil.getValue(NetworkINSObject, "Instance name"));
        expect(ordersPage.getTextBasedOnLabelName("Instance ID")).toEqual(jsonUtil.getValue(NetworkINSObject,"Instance ID"));
        expect(ordersPage.getTextBasedOnLabelName("Configuration")).toEqual(jsonUtil.getValue(NetworkINSObject, "Configuration"));
        expect(ordersPage.getTextBasedOnLabelName("Location (Regional)")).toEqual(jsonUtil.getValue(NetworkINSObject, "Location (Regional)"));
        expect(ordersPage.getTextBasedOnLabelName("Nodes")).toEqual(jsonUtil.getValue(NetworkINSObject, "Nodes"));
        ordersPage.clickBillOfMaterialsTabOrderDetails().then(function(){
            ordersPage.validatePriceForGoogleService(orderAmount).then(function(status){            
                  expect(status).toEqual(true);
            });    
        });
    });



    it('TC-C181992: GCP Spanner - E2E : Verify instance Order Provision & Deletion is working fine from consume App', function () {
        var orderObject = {};
        var NetworkINSObject = JSON.parse(JSON.stringify(gcpCloudSpannerTemplate));
        
        catalogPage.clickConfigureButtonBasedOnName(gcpCloudSpannerTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(gcpCloudSpannerTemplate, modifiedParamMap);
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
                orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                orderFlowUtil.approveDeletedOrder(orderObject);
                orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
            }
        })
    });
})
