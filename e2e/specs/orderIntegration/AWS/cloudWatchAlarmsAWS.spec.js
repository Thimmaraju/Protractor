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
    cloudWatchAlarmInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSCloudWatchAlarmsInstance.json');

describe('AWS - CloudWatchAlarms', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, alarmName, cloudWatchAlarmObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Other Services',
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
        cloudWatchAlarmObject = JSON.parse(JSON.stringify(cloudWatchAlarmInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        alarmName = "TestAlarm" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": alarmName };
    });

    it('TC-C187091 : AWS cloudWatchAlarm - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudWatchAlarmInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(cloudWatchAlarmInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(cloudWatchAlarmObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(cloudWatchAlarmInstanceTemplate.BasePrice);
    });

    it('TC-C187092 : AWS cloudWatchAlarm - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudWatchAlarmInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudWatchAlarmInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(cloudWatchAlarmInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Evaluation Periods"]).toEqual(requiredReturnMap["Expected"]["Evaluation Periods"]);
            expect(requiredReturnMap["Actual"]["Operator"]).toEqual(requiredReturnMap["Expected"]["Operator"]);
            expect(requiredReturnMap["Actual"]["Threshold"]).toEqual(requiredReturnMap["Expected"]["Threshold"]);
            expect(requiredReturnMap["Actual"]["Namespace"]).toEqual(requiredReturnMap["Expected"]["Namespace"]);
            expect(requiredReturnMap["Actual"]["Dimension Name"]).toEqual(requiredReturnMap["Expected"]["Dimension Name"]);
            expect(requiredReturnMap["Actual"]["Metric Name"]).toEqual(requiredReturnMap["Expected"]["Metric Name"]);
            expect(requiredReturnMap["Actual"]["Dimension Value"]).toEqual(requiredReturnMap["Expected"]["Dimension Value"]);
            expect(requiredReturnMap["Actual"]["Period"]).toEqual(requiredReturnMap["Expected"]["Period"]);
            expect(requiredReturnMap["Actual"]["Statistic Type"]).toEqual(requiredReturnMap["Expected"]["Statistic Type"]);
            expect(requiredReturnMap["Actual"]["Standard Statistic Value"]).toEqual(requiredReturnMap["Expected"]["Standard Statistic Value"]);
            expect(requiredReturnMap["Actual"]["Statistic Unit"]).toEqual(requiredReturnMap["Expected"]["Statistic Unit"]);
            expect(requiredReturnMap["Actual"]["Treat Missing Data As"]).toEqual(requiredReturnMap["Expected"]["Treat Missing Data As"]);
        });
    });

    it('TC-C187093 : AWS cloudWatchAlarm - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudWatchAlarmInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudWatchAlarmInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(cloudWatchAlarmInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(alarmName);
        expect(ordersPage.getTextBasedOnLabelName("Evaluation Periods")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Evaluation Periods"));
        expect(ordersPage.getTextBasedOnLabelName("Operator")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Operator"));
        expect(ordersPage.getTextBasedOnLabelName("Threshold")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Threshold"));
        expect(ordersPage.getTextBasedOnLabelName("Namespace")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Namespace"));
        expect(ordersPage.getTextBasedOnLabelName("Dimension Name")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Dimension Name"));
        expect(ordersPage.getTextBasedOnLabelName("Metric Name")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Metric Name"));
        expect(ordersPage.getTextBasedOnExactLabelName("Period")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Period"));
        expect(ordersPage.getTextBasedOnLabelName("Statistic Type")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Statistic Type"));
        expect(ordersPage.getTextBasedOnLabelName("Standard Statistic Value")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Standard Statistic Value"));
        expect(ordersPage.getTextBasedOnLabelName("Statistic Unit")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Statistic Unit"));
        expect(ordersPage.getTextBasedOnLabelName("Treat Missing Data As")).toEqual(jsonUtil.getValue(cloudWatchAlarmObject, "Treat Missing Data As"));

        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(cloudWatchAlarmInstanceTemplate.TotalCost);
    });


    if (isProvisioningRequired == "true") {
        it('TC-C187094: AWS cloudWatchAlarm : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(cloudWatchAlarmInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName
            orderFlowUtil.fillOrderDetails(cloudWatchAlarmInstanceTemplate, modifiedParamMap);
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
                    orderFlowUtil.fillOrderDetails(cloudWatchAlarmInstanceTemplate, modifiedParamMap).then(function () {
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
                            expect(ordersPage.getTextBasedOnExactLabelName("Evaluation Periods")).toEqual(jsonUtil.getValueEditParameter(cloudWatchAlarmObject, "Evaluation Periods"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Operator")).toEqual(jsonUtil.getValueEditParameter(cloudWatchAlarmObject, "Operator"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Threshold")).toEqual(jsonUtil.getValueEditParameter(cloudWatchAlarmObject, "Threshold"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Standard Statistic Value")).toEqual(jsonUtil.getValueEditParameter(cloudWatchAlarmObject, "Standard Statistic Value"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Statistic Unit")).toEqual(jsonUtil.getValueEditParameter(cloudWatchAlarmObject, "Statistic Unit"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Treat Missing Data As")).toEqual(jsonUtil.getValueEditParameter(cloudWatchAlarmObject, "Treat Missing Data As"));
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
