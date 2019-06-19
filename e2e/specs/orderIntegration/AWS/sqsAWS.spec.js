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
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

    sqsInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSSQSInstance.json');

describe('AWS - SQS', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, queueName, SQSINSObject;
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
        SQSINSObject = JSON.parse(JSON.stringify(sqsInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        queueName = "QueueName" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Queue Name": queueName };
    });

    it('TC-C174118 : AWS SQS - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(sqsInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(sqsInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(SQSINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(sqsInstanceTemplate.BasePrice);
    });

    it('TC-C174119 : AWS SQS - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(sqsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(sqsInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(sqsInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["Type Of Queue"]).toEqual(requiredReturnMap["Expected"]["Type Of Queue"]);
            expect(requiredReturnMap["Actual"]["Queue Name"]).toEqual(requiredReturnMap["Expected"]["Queue Name"]);
            expect(requiredReturnMap["Actual"]["Default Visibility Timeout"]).toEqual(requiredReturnMap["Expected"]["Default Visibility Timeout"]);
            expect(requiredReturnMap["Actual"]["Message Retention Period"]).toEqual(requiredReturnMap["Expected"]["Message Retention Period"]);
            expect(requiredReturnMap["Actual"]["Maximum Message Size"]).toEqual(requiredReturnMap["Expected"]["Maximum Message Size"]);
            expect(requiredReturnMap["Actual"]["Delivery Delay"]).toEqual(requiredReturnMap["Expected"]["Delivery Delay"]);
            expect(requiredReturnMap["Actual"]["Receive Message Wait Time"]).toEqual(requiredReturnMap["Expected"]["Receive Message Wait Time"]);
            expect(requiredReturnMap["Actual"]["Use Redrive Policy"]).toEqual(requiredReturnMap["Expected"]["Use Redrive Policy"]);
            expect(requiredReturnMap["Actual"]["Use SSE"]).toEqual(requiredReturnMap["Expected"]["Use SSE"]);
        });
    });

    it('TC-C174120 : AWS SQS - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(sqsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(sqsInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(sqsInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(SQSINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("Queue Name")).toEqual(queueName);
        expect(ordersPage.getTextBasedOnLabelName("Type Of Queue")).toEqual(jsonUtil.getValue(SQSINSObject, "Type Of Queue"));
        expect(ordersPage.getTextBasedOnLabelName("Default Visibility Timeout")).toEqual(jsonUtil.getValue(SQSINSObject, "Default Visibility Timeout"));
        expect(ordersPage.getTextBasedOnLabelName("Message Retention Period")).toEqual(jsonUtil.getValue(SQSINSObject, "Message Retention Period"));
        expect(ordersPage.getTextBasedOnLabelName("Maximum Message Size")).toEqual(jsonUtil.getValue(SQSINSObject, "Maximum Message Size"));
        expect(ordersPage.getTextBasedOnLabelName("Delivery Delay")).toEqual(jsonUtil.getValue(SQSINSObject, "Delivery Delay"));
        expect(ordersPage.getTextBasedOnLabelName("Receive Message Wait Time")).toEqual(jsonUtil.getValue(SQSINSObject, "Receive Message Wait Time"));
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(SQSINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Use Redrive Policy")).toEqual(jsonUtil.getValue(SQSINSObject, "Use Redrive Policy"));
        expect(ordersPage.getTextBasedOnLabelName("Use SSE")).toEqual(jsonUtil.getValue(SQSINSObject, "Use SSE"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(sqsInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C174121: AWS SQS - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(sqsInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(sqsInstanceTemplate, modifiedParamMap);
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
                    var modifiedParamMap = { "EditService": true };
                    orderFlowUtil.editService(orderObject);
                    orderFlowUtil.fillOrderDetails(sqsInstanceTemplate, modifiedParamMap).then(function () {
                        logger.info("Edit parameter details are filled.");
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
                            //Verify updated details are reflected on order details page.						
                            ordersPage.clickFirstViewDetailsOrdersTable();
                            expect(ordersPage.getTextBasedOnLabelName("Default Visibility Timeout")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Default Visibility Timeout"));
                            expect(ordersPage.getTextBasedOnLabelName("Message Retention Period")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Message Retention Period"));
                            expect(ordersPage.getTextBasedOnLabelName("Maximum Message Size")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Maximum Message Size"));
                            expect(ordersPage.getTextBasedOnLabelName("Delivery Delay")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Delivery Delay"));
                            expect(ordersPage.getTextBasedOnLabelName("Receive Message Wait Time")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Receive Message Wait Time"));
                            expect(ordersPage.getTextBasedOnLabelName("Use Redrive Policy")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Use Redrive Policy"));
                            expect(ordersPage.getTextBasedOnLabelName("Message Retention Period")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Message Retention Period"));
                            expect(ordersPage.getTextBasedOnLabelName("Maximum Receives")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Maximum Receives"));
                            expect(ordersPage.getTextBasedOnLabelName("Use SSE")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Use SSE"));
                            expect(ordersPage.getTextBasedOnLabelName("AWS KMS Customer Master Key")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "AWS KMS Customer Master Key"));
                            expect(ordersPage.getTextBasedOnLabelName("Data Key Reuse Period")).toEqual(jsonUtil.getValueEditParameter(SQSINSObject, "Data Key Reuse Period"));
                            //Delete Service flow
                            orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                            orderFlowUtil.approveDeletedOrder(orderObject);
                            orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                        }
                    });
                }
            })
        });
    }
})