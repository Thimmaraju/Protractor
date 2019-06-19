"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

    riInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSReservedInstance.json');

describe('AWS EC2 Reserved Instance', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, RIINSObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Compute',
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
        RIINSObject = JSON.parse(JSON.stringify(riInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
    });

    it('TC : AWS EC2 Reserved Instance - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(riInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(riInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(RIINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(riInstanceTemplate.BasePrice);
    });

    it('TC : AWS EC2 Reserved Instance - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(riInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(riInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(riInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Availability Zone"]).toEqual(requiredReturnMap["Expected"]["Availability Zone"]);
            expect(requiredReturnMap["Actual"]["Platform"]).toEqual(requiredReturnMap["Expected"]["Platform"]);
            expect(requiredReturnMap["Actual"]["Instance Type"]).toEqual(requiredReturnMap["Expected"]["Instance Type"]);
            expect(requiredReturnMap["Actual"]["Instance Tenancy"]).toEqual(requiredReturnMap["Expected"]["Instance Tenancy"]);
            expect(requiredReturnMap["Actual"]["Offering Class"]).toEqual(requiredReturnMap["Expected"]["Offering Class"]);
            expect(requiredReturnMap["Actual"]["Offering Type"]).toEqual(requiredReturnMap["Expected"]["Offering Type"]);
            expect(requiredReturnMap["Actual"]["Terms"]).toEqual(requiredReturnMap["Expected"]["Terms"]);
            expect(requiredReturnMap["Actual"]["Offering Id"]).toEqual(requiredReturnMap["Expected"]["Offering Id"]);
            expect(requiredReturnMap["Actual"]["Quantity"]).toEqual(requiredReturnMap["Expected"]["Quantity"]);
        });
    });

    it('TC : AWS EC2 Reserved Instance - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(riInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(riInstanceTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();
        orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(riInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(RIINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(RIINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Availability Zone")).toEqual(jsonUtil.getValue(RIINSObject, "Availability Zone"));
        expect(ordersPage.getTextBasedOnLabelName("Platform")).toEqual(jsonUtil.getValue(RIINSObject, "Platform"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Type")).toEqual(jsonUtil.getValue(RIINSObject, "Instance Type"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Tenancy")).toEqual(jsonUtil.getValue(RIINSObject, "Instance Tenancy"));
        expect(ordersPage.getTextBasedOnLabelName("Offering Class")).toEqual(jsonUtil.getValue(RIINSObject, "Offering Class"));
        expect(ordersPage.getTextBasedOnLabelName("Offering Type")).toEqual(jsonUtil.getValue(RIINSObject, "Offering Type"));
        expect(ordersPage.getTextBasedOnLabelName("Terms")).toEqual(jsonUtil.getValue(RIINSObject, "Terms"));
        expect(ordersPage.getTextBasedOnLabelName("Offering Id")).toEqual(jsonUtil.getValue(RIINSObject, "Offering Id"));
        expect(ordersPage.getTextBasedOnLabelName("Quantity")).toEqual(jsonUtil.getValue(RIINSObject, "Quantity"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(riInstanceTemplate.TotalCost);
    });

    //Resource creation is expensive for Reserved Instance.
    //So as discussed in DSM we are commenting out this test case as of now.
    /*
    if (isProvisioningRequired == "true") {
        it('TC : AWS EC2 Reserved Instance - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(riInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(riInstanceTemplate, modifiedParamMap);
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
                    //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        });
    }*/
})