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

    redisInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSElasticacheRedisInstance.json');

describe('AWS - Elasticache Redis', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, redisName, RedisNSObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
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
        RedisNSObject = JSON.parse(JSON.stringify(redisInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        redisName = "Redis" + util.getRandomString(5);
        redisName = redisName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": redisName };
    });

    it('TC-C180116 : AWS ElastiCache Redis - Verify fields on Main Parameters page of Redis is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(redisInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(redisInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(RedisNSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(redisInstanceTemplate.BasePrice);
    });

    it('TC-C180117 :  AWS ElastiCache Redis - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(redisInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(redisInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(redisInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Cluster Mode Enabled"]).toEqual(requiredReturnMap["Expected"]["Cluster Mode Enabled"]);
            expect(requiredReturnMap["Actual"]["Engine Version Compatibility"]).toEqual(requiredReturnMap["Expected"]["Engine Version Compatibility"]);
            expect(requiredReturnMap["Actual"]["Port"]).toEqual(requiredReturnMap["Expected"]["Port"]);
            expect(requiredReturnMap["Actual"]["Parameter Group"]).toEqual(requiredReturnMap["Expected"]["Parameter Group"]);
            expect(requiredReturnMap["Actual"]["Node Type"]).toEqual(requiredReturnMap["Expected"]["Node Type"]);
            expect(requiredReturnMap["Actual"]["Number Of Replicas"]).toEqual(requiredReturnMap["Expected"]["Number Of Replicas"]);
            expect(requiredReturnMap["Actual"]["Subnet Group"]).toEqual(requiredReturnMap["Expected"]["Subnet Group"]);
            expect(requiredReturnMap["Actual"]["Preferred Availability Zone"]).toEqual(requiredReturnMap["Expected"]["Preferred Availability Zone"]);
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            expect(requiredReturnMap["Actual"]["Security Groups"]).toEqual(requiredReturnMap["Expected"]["Security Groups"]);
            expect(requiredReturnMap["Actual"]["Encryption At Rest"]).toEqual(requiredReturnMap["Expected"]["Encryption At Rest"]);
            expect(requiredReturnMap["Actual"]["Encryption In Transit"]).toEqual(requiredReturnMap["Expected"]["Encryption In Transit"]);
            expect(requiredReturnMap["Actual"]["Maintenance Window"]).toEqual(requiredReturnMap["Expected"]["Maintenance Window"]);
            expect(requiredReturnMap["Actual"]["Topic For SNS Notification"]).toEqual(requiredReturnMap["Expected"]["Topic For SNS Notification"]);

        });
    });

    it('TC-C180118 :  AWS ElastiCache Redis - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(redisInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(redisInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(redisInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(RedisNSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(RedisNSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(redisName);
        expect(ordersPage.getTextBasedOnLabelName("Cluster Mode Enabled")).toEqual(jsonUtil.getValue(RedisNSObject, "Cluster Mode Enabled"));
        expect(ordersPage.getTextBasedOnLabelName("Engine Version Compatibility")).toEqual(jsonUtil.getValue(RedisNSObject, "Engine Version Compatibility"));
        expect(ordersPage.getTextBasedOnLabelName("Port")).toEqual(jsonUtil.getValue(RedisNSObject, "Port"));
        expect(ordersPage.getTextBasedOnLabelName("Parameter Group")).toEqual(jsonUtil.getValue(RedisNSObject, "Parameter Group"));
        expect(ordersPage.getTextBasedOnLabelName("Node Type")).toEqual(jsonUtil.getValue(RedisNSObject, "Node Type"));
        expect(ordersPage.getTextBasedOnLabelName("Number Of Replicas")).toEqual(jsonUtil.getValue(RedisNSObject, "Number Of Replicas"));
        expect(ordersPage.getTextBasedOnLabelName("Subnet Group")).toEqual(jsonUtil.getValue(RedisNSObject, "Subnet Group"));
        expect(ordersPage.getTextBasedOnLabelName("Preferred Availability Zone")).toEqual(jsonUtil.getValue(RedisNSObject, "Preferred Availability Zone"));
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(RedisNSObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Security Groups")).toEqual(jsonUtil.getValue(RedisNSObject, "Security Groups"));
        expect(ordersPage.getTextBasedOnLabelName("Encryption At Rest")).toEqual(jsonUtil.getValue(RedisNSObject, "Encryption At Rest"));
        expect(ordersPage.getTextBasedOnLabelName("Encryption In Transit")).toEqual(jsonUtil.getValue(RedisNSObject, "Encryption In Transit"));
        expect(ordersPage.getTextBasedOnLabelName("Maintenance Window")).toEqual(jsonUtil.getValue(RedisNSObject, "Maintenance Window"));
        expect(ordersPage.getTextBasedOnLabelName("Topic For SNS Notification")).toEqual(jsonUtil.getValue(RedisNSObject, "Topic For SNS Notification"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(redisInstanceTemplate.TotalCost);
    });

    //Order Provisioning is taking more than 20 min,which is not advisable to run on Jenkins.
    //So as discussed in DSM we are commenting out this test case as of now.
    /*
     if (isProvisioningRequired == "true") {
         it('TC-C180119: AWS ElastiCache Redis - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(redisInstanceTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(redisInstanceTemplate, modifiedParamMap);
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
*/
})