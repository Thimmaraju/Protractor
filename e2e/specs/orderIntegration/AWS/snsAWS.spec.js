
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

    snsInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSSNSInstance.json');

describe('AWS - SNS', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, topicName, SNSINSObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Applications',
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
        SNSINSObject = JSON.parse(JSON.stringify(snsInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        topicName = "topicnamesns" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Topic Name": topicName };
    });

    it('TC-C174122 : AWS SNS - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(snsInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(snsInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(SNSINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(snsInstanceTemplate.BasePrice);
    });

    it('TC-C174123 : AWS SNS - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(snsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(snsInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(snsInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Topic Name"]).toEqual(requiredReturnMap["Expected"]["Topic Name"]);
            expect(requiredReturnMap["Actual"]["Display Name"]).toEqual(requiredReturnMap["Expected"]["Display Name"]);
            expect(requiredReturnMap["Actual"]["Endpoint"]).toEqual(requiredReturnMap["Expected"]["Endpoint"]);
            expect(requiredReturnMap["Actual"]["Protocol"]).toEqual(requiredReturnMap["Expected"]["Protocol"]);
        });
    });

    it('TC-C172281 : AWS SNS - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(snsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(snsInstanceTemplate, modifiedParamMap);
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
        //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(snsInstanceTemplate.serviceNameSNS);
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(SNSINSObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(SNSINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Topic Name")).toEqual(topicName);
        expect(ordersPage.getTextBasedOnLabelName("Display Name")).toEqual(jsonUtil.getValue(SNSINSObject, "Display Name"));
        expect(ordersPage.getTextBasedOnLabelName("Endpoint")).toEqual(jsonUtil.getValue(SNSINSObject, "Endpoint"));
        expect(ordersPage.getTextBasedOnLabelName("Protocol")).toEqual(jsonUtil.getValue(SNSINSObject, "Protocol"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(snsInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C172282: AWS SNS - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(snsInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(snsInstanceTemplate, modifiedParamMap);
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
    }
})