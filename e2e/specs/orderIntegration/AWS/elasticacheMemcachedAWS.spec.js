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

    memcachedInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSElastiCacheMemcached.json');

describe('AWS - ElastiCache Memcached', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, name, MemcachedINSObject;
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
        MemcachedINSObject = JSON.parse(JSON.stringify(memcachedInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        name = "namememcached" + util.getRandomString(5);
        name = name.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": name };
    });

    it('TC-C179952 : AWS ElastiCache Memcached - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(memcachedInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(memcachedInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(MemcachedINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(memcachedInstanceTemplate.BasePrice);
    });

    it('TC-C179953 : AWS ElastiCache Memcached - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(memcachedInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(memcachedInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(memcachedInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Engine Version Compatibility"]).toEqual(requiredReturnMap["Expected"]["Engine Version Compatibility"]);
            expect(requiredReturnMap["Actual"]["Port"]).toEqual(requiredReturnMap["Expected"]["Port"]);
            expect(requiredReturnMap["Actual"]["Parameter Group"]).toEqual(requiredReturnMap["Expected"]["Parameter Group"]);
            expect(requiredReturnMap["Actual"]["Node Type"]).toEqual(requiredReturnMap["Expected"]["Node Type"]);
            expect(requiredReturnMap["Actual"]["Number Of Nodes"]).toEqual(requiredReturnMap["Expected"]["Number Of Nodes"]);
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            expect(requiredReturnMap["Actual"]["Subnet Group"]).toEqual(requiredReturnMap["Expected"]["Subnet Group"]);
            expect(requiredReturnMap["Actual"]["Preferred Availability Zones"]).toEqual(requiredReturnMap["Expected"]["Preferred Availability Zones"]);
            expect(requiredReturnMap["Actual"]["Security Group"]).toEqual(requiredReturnMap["Expected"]["Security Group"]);
            expect(requiredReturnMap["Actual"]["Maintenance Window"]).toEqual(requiredReturnMap["Expected"]["Maintenance Window"]);
            expect(requiredReturnMap["Actual"]["Topic For SNS Notification"]).toEqual(requiredReturnMap["Expected"]["Topic For SNS Notification"]);
            expect(requiredReturnMap["Actual"]["SNS Topic Arn"]).toEqual(requiredReturnMap["Expected"]["SNS Topic Arn"]);
        });
    });

    it('TC-C179954 : AWS ElastiCache Memcached - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(memcachedInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(memcachedInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(memcachedInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(MemcachedINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(MemcachedINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(name);
        expect(ordersPage.getTextBasedOnLabelName("Engine Version Compatibility")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Engine Version Compatibility"));
        expect(ordersPage.getTextBasedOnLabelName("Port")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Port"));
        expect(ordersPage.getTextBasedOnLabelName("Parameter Group")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Parameter Group"));
        expect(ordersPage.getTextBasedOnLabelName("Node Type")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Node Type"));
        expect(ordersPage.getTextBasedOnLabelName("Number Of Nodes")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Number Of Nodes"));
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(MemcachedINSObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Subnet Group")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Subnet Group"));
        expect(ordersPage.getTextBasedOnLabelName("Preferred Availability Zones")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Preferred Availability Zones"));
        expect(ordersPage.getTextBasedOnLabelName("Security Group")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Security Group"));
        expect(ordersPage.getTextBasedOnLabelName("Maintenance Window")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Maintenance Window"));
        expect(ordersPage.getTextBasedOnLabelName("Topic For SNS Notification")).toEqual(jsonUtil.getValue(MemcachedINSObject, "Topic For SNS Notification"));
        expect(ordersPage.getTextBasedOnLabelName("SNS Topic Arn")).toEqual(jsonUtil.getValue(MemcachedINSObject, "SNS Topic Arn"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(memcachedInstanceTemplate.TotalCost);
    });

    //Order Provisioning taking more than 15-20 min,which is not advisable to run on Jenkins.
    //So as discussed in DSM we are commenting out this test case as of now.
    /*
     if (isProvisioningRequired == "true") {
         it('TC-C179955: AWS ElastiCache Memcached - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(memcachedInstanceTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(memcachedInstanceTemplate, modifiedParamMap);
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
});

