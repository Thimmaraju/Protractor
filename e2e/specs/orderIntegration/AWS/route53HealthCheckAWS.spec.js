
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

    healthCheckInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSRoute53HealthCheck.json');

describe('AWS - Route 53 : HealthCheck', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, healthCheckName, HCheckINSObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Network',
        catalogPageTitle: 'Search, Select and Configure',
        inputserviceNameWarning: "Parameter Warning:",
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
        HCheckINSObject = JSON.parse(JSON.stringify(healthCheckInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        healthCheckName = "healthCheck" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": healthCheckName };
    });

    it('TC-C174644 : Route 53 HealthCheck - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(healthCheckInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(healthCheckInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(HCheckINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(healthCheckInstanceTemplate.BasePrice);
    });


    it('TC-C174645 : Route 53 HealthCheck - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(healthCheckInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(healthCheckInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(healthCheckInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(healthCheckName);
            expect(requiredReturnMap["Actual"]["What to monitor"]).toEqual(requiredReturnMap["Expected"]["What to monitor"]);
            expect(requiredReturnMap["Actual"]["Specify endpoint by"]).toEqual(requiredReturnMap["Expected"]["Specify endpoint by"]);
            expect(requiredReturnMap["Actual"]["Protocol"]).toEqual(requiredReturnMap["Expected"]["Protocol"]);
            expect(requiredReturnMap["Actual"]["Domain Name"]).toEqual(requiredReturnMap["Expected"]["Domain Name"]);
            expect(requiredReturnMap["Actual"]["Request Interval"]).toEqual(requiredReturnMap["Expected"]["Request Interval"]);
            expect(requiredReturnMap["Actual"]["Port"]).toEqual(requiredReturnMap["Expected"]["Port"]);
            expect(requiredReturnMap["Actual"]["Select type of endpoint"]).toEqual(requiredReturnMap["Expected"]["Select type of endpoint"]);
            expect(requiredReturnMap["Actual"]["Failure threshold"]).toEqual(requiredReturnMap["Expected"]["Failure threshold"]);
            expect(requiredReturnMap["Actual"]["Latency graphs"]).toEqual(requiredReturnMap["Expected"]["Latency graphs"]);
            expect(requiredReturnMap["Actual"]["Invert health check status"]).toEqual(requiredReturnMap["Expected"]["Invert health check status"]);
            expect(requiredReturnMap["Actual"]["Health checker regions"]).toEqual(requiredReturnMap["Expected"]["Health checker regions"]);
            expect(requiredReturnMap["Actual"]["Create Alarm"]).toEqual(requiredReturnMap["Expected"]["Create Alarm"]);
            expect(requiredReturnMap["Actual"]["Key"]).toEqual(requiredReturnMap["Expected"]["Key"]);
            expect(requiredReturnMap["Actual"]["Value"]).toEqual(requiredReturnMap["Expected"]["Value"]);
        });
    });

    it('TC-C174646 : Route 53 HealthCheck - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(healthCheckInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(healthCheckInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(healthCheckInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(HCheckINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(HCheckINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(healthCheckName);
        expect(ordersPage.getTextBasedOnLabelName("What to monitor")).toEqual(jsonUtil.getValue(HCheckINSObject, "What to monitor"));
        expect(ordersPage.getTextBasedOnLabelName("Specify endpoint by")).toEqual(jsonUtil.getValue(HCheckINSObject, "Specify endpoint by"));
        expect(ordersPage.getTextBasedOnLabelName("Protocol")).toEqual(jsonUtil.getValue(HCheckINSObject, "Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Domain Name")).toEqual(jsonUtil.getValue(HCheckINSObject, "Domain Name"));
        expect(ordersPage.getTextBasedOnLabelName("Request Interval")).toEqual(jsonUtil.getValue(HCheckINSObject, "Request Interval"));
        expect(ordersPage.getTextBasedOnLabelName("Port")).toEqual(jsonUtil.getValue(HCheckINSObject, "Port"));
        expect(ordersPage.getTextBasedOnLabelName("Select type of endpoint")).toEqual(jsonUtil.getValue(HCheckINSObject, "Select type of endpoint"));
        expect(ordersPage.getTextBasedOnLabelName("Failure threshold")).toEqual(jsonUtil.getValue(HCheckINSObject, "Failure threshold"));
        expect(ordersPage.getTextBasedOnLabelName("Latency graphs")).toEqual(jsonUtil.getValue(HCheckINSObject, "Latency graphs"));
        expect(ordersPage.getTextBasedOnLabelName("Invert health check status")).toEqual(jsonUtil.getValue(HCheckINSObject, "Invert health check status"));
        expect(ordersPage.getTextBasedOnLabelName("Health checker regions")).toEqual(jsonUtil.getValue(HCheckINSObject, "Health checker regions"));
        expect(ordersPage.getTextBasedOnLabelName("Create Alarm")).toEqual(jsonUtil.getValue(HCheckINSObject, "Create Alarm"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(healthCheckInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C174647 : Route 53 HealthCheck - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(healthCheckInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName
            orderFlowUtil.fillOrderDetails(healthCheckInstanceTemplate, modifiedParamMap);
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
                    orderFlowUtil.fillOrderDetails(healthCheckInstanceTemplate, modifiedParamMap).then(function () {
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
                            expect(ordersPage.getTextBasedOnLabelName("Domain Name")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Domain Name"));
                            expect(ordersPage.getTextBasedOnLabelName("Invert health check status")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Invert health check status"));
                            expect(ordersPage.getTextBasedOnLabelName("Create Alarm")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Create Alarm"));
                            expect(ordersPage.getTextBasedOnLabelName("Alarm Name")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Alarm Name"));
                            expect(ordersPage.getTextBasedOnLabelName("Send notification to")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Send notification to"));
                            expect(ordersPage.getTextBasedOnLabelName("Topic ARN")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Topic ARN"));
                            expect(ordersPage.getTextBasedOnLabelName("Threshold")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Threshold"));
                            expect(ordersPage.getTextBasedOnLabelName("Key")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Key"));
                            expect(ordersPage.getTextBasedOnLabelName("Value")).toEqual(jsonUtil.getValueEditParameter(HCheckINSObject, "Value"));
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