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
    classicELBInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSClassicELBInstance.json');

describe('AWS - classicELB', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, inventoryPage, serviceName, lbName, ClassicELBObject;

    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
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
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        ClassicELBObject = JSON.parse(JSON.stringify(classicELBInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        lbName = "LBName" + util.getRandomString(5)
        modifiedParamMap = { "Service Instance Name": serviceName, "Load Balancer Name": lbName };
    });

    it('TC-C175375 : AWS classicELB - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(classicELBInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(classicELBInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText("TestAutomation" + util.getRandomString(4));
        placeOrderPage.selectProviderAccount(ClassicELBObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(classicELBInstanceTemplate.BasePrice);

    });

    it('TC-C175376 : AWS classicELB-  Verify Summary details and Additional Details are listed in review Order page.png', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(classicELBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(classicELBInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(classicELBInstanceTemplate.EstimatedPrice);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Name"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Name"]);
            expect(requiredReturnMap["Actual"]["Scheme"]).toEqual(requiredReturnMap["Expected"]["Scheme"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Protocol 1"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Protocol 1"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Port 1"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Port 1"]);
            expect(requiredReturnMap["Actual"]["Instance Protocol 1"]).toEqual(requiredReturnMap["Expected"]["Instance Protocol 1"]);
            expect(requiredReturnMap["Actual"]["Instance Port 1"]).toEqual(requiredReturnMap["Expected"]["Instance Port 1"]);
            expect(requiredReturnMap["Actual"]["Policy Name 1"]).toEqual(requiredReturnMap["Expected"]["Policy Name 1"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Protocol 2"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Protocol 2"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Port 2"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Port 2"]);
            expect(requiredReturnMap["Actual"]["Instance Protocol 2"]).toEqual(requiredReturnMap["Expected"]["Instance Protocol 2"]);
            expect(requiredReturnMap["Actual"]["Instance Port 2"]).toEqual(requiredReturnMap["Expected"]["Instance Port 2"]);
            expect(requiredReturnMap["Actual"]["Policy Name 2"]).toEqual(requiredReturnMap["Expected"]["Policy Name 2"]);

            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            expect(requiredReturnMap["Actual"]["Availability Zone"]).toEqual(requiredReturnMap["Expected"]["Availability Zone"]);
            //expect(requiredReturnMap["Actual"]["Subnet"]).toEqual(requiredReturnMap["Expected"]["Subnet"]);
            expect(requiredReturnMap["Actual"]["Security Groups"]).toEqual(requiredReturnMap["Expected"]["Securities Groups"]);
            expect(requiredReturnMap["Actual"]["Select Policy Type"]).toEqual(requiredReturnMap["Expected"]["Select Policy Type"]);
            expect(requiredReturnMap["Actual"]["LB Cookie Stickiness Policy Name"]).toEqual(requiredReturnMap["Expected"]["LB Cookie Stickiness Policy Name"]);
            expect(requiredReturnMap["Actual"]["Cookie Expiration Period"]).toEqual(requiredReturnMap["Expected"]["Cookie Expiration Period"]);
            expect(requiredReturnMap["Actual"]["Enable Logging"]).toEqual(requiredReturnMap["Expected"]["Enable Logging"]);
            expect(requiredReturnMap["Actual"]["Ping Protocol"]).toEqual(requiredReturnMap["Expected"]["Ping Protocol"]);
            expect(requiredReturnMap["Actual"]["Ping Port"]).toEqual(requiredReturnMap["Expected"]["Ping Port"]);
            expect(requiredReturnMap["Actual"]["Ping Path"]).toEqual(requiredReturnMap["Expected"]["Ping Path"]);
            expect(requiredReturnMap["Actual"]["Response Timeout"]).toEqual(requiredReturnMap["Expected"]["Response Timeout"]);
            expect(requiredReturnMap["Actual"]["Interval"]).toEqual(requiredReturnMap["Expected"]["Interval"]);
            expect(requiredReturnMap["Actual"]["Healthy Threshold"]).toEqual(requiredReturnMap["Expected"]["Healthy Threshold"]);
            expect(requiredReturnMap["Actual"]["Unhealthy Threshold"]).toEqual(requiredReturnMap["Expected"]["Unhealthy Threshold"]);
            expect(requiredReturnMap["Actual"]["Instance Id"]).toEqual(requiredReturnMap["Expected"]["Instance Id"]);
            expect(requiredReturnMap["Actual"]["Cross Zone"]).toEqual(requiredReturnMap["Expected"]["Cross Zone"]);
            expect(requiredReturnMap["Actual"]["Connection Draining Policy Enabled"]).toEqual(requiredReturnMap["Expected"]["Connection Draining Policy Enabled"]);
            expect(requiredReturnMap["Actual"]["Idle Timeout"]).toEqual(requiredReturnMap["Expected"]["Idle Timeout"]);

        });
    });

    it('TC-C175377 : AWS classicELB - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(classicELBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(classicELBInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(classicELBInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(CloudTrailObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(ClassicELBObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Name")).toEqual(lbName);
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Protocol 1")).toEqual(jsonUtil.getValue(ClassicELBObject, "Load Balancer Protocol 1"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Port 1")).toEqual(jsonUtil.getValue(ClassicELBObject, "Load Balancer Port 1"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Protocol 1")).toEqual(jsonUtil.getValue(ClassicELBObject, "Instance Protocol 1"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Port 1")).toEqual(jsonUtil.getValue(ClassicELBObject, "Instance Port 1"));
        expect(ordersPage.getTextBasedOnLabelName("Policy Name 1")).toEqual(jsonUtil.getValue(ClassicELBObject, "Policy Name 1"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Protocol 2")).toEqual(jsonUtil.getValue(ClassicELBObject, "Load Balancer Protocol 2"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Port 2")).toEqual(jsonUtil.getValue(ClassicELBObject, "Load Balancer Port 2"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Protocol 2")).toEqual(jsonUtil.getValue(ClassicELBObject, "Instance Protocol 2"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Port 2")).toEqual(jsonUtil.getValue(ClassicELBObject, "Instance Port 2"));
        expect(ordersPage.getTextBasedOnLabelName("Policy Name 2")).toEqual(jsonUtil.getValue(ClassicELBObject, "Policy Name 2"));
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(ClassicELBObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Availability Zone")).toEqual("us-east-1a, us-east-1b");
        expect(ordersPage.getTextBasedOnLabelName("Subnet")).toEqual("subnet-f3a23cff (us-east-1f), subnet-c5f664b2 (us-east-1b)");
        expect(ordersPage.getTextBasedOnLabelName("Security Groups")).toEqual("sg-4e88232a");
        expect(ordersPage.getTextBasedOnLabelName("Select Policy Type")).toEqual(jsonUtil.getValue(ClassicELBObject, "Select Policy Type"));
        expect(ordersPage.getTextBasedOnLabelName("LB Cookie Stickiness Policy Name")).toEqual(jsonUtil.getValue(ClassicELBObject, "LB Cookie Stickiness Policy Name"));
        expect(ordersPage.getTextBasedOnLabelName("Cookie Expiration Period")).toEqual(jsonUtil.getValue(ClassicELBObject, "Cookie Expiration Period"));
        expect(ordersPage.getTextBasedOnLabelName("Enable Logging")).toEqual(jsonUtil.getValue(ClassicELBObject, "Enable Logging"));
        expect(ordersPage.getTextBasedOnLabelName("Ping Protocol")).toEqual(jsonUtil.getValue(ClassicELBObject, "Ping Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Ping Port")).toEqual(jsonUtil.getValue(ClassicELBObject, "Ping Port"));
        expect(ordersPage.getTextBasedOnLabelName("Ping Path")).toEqual(jsonUtil.getValue(ClassicELBObject, "Ping Path"));
        expect(ordersPage.getTextBasedOnLabelName("Response Timeout")).toEqual(jsonUtil.getValue(ClassicELBObject, "Response Timeout"));
        expect(ordersPage.getTextBasedOnLabelName("Interval")).toEqual(jsonUtil.getValue(ClassicELBObject, "Interval"));
        expect(ordersPage.getTextBasedOnLabelName("Healthy Threshold")).toEqual(jsonUtil.getValue(ClassicELBObject, "Healthy Threshold"));
        expect(ordersPage.getTextBasedOnLabelName("Unhealthy Threshold")).toEqual(jsonUtil.getValue(ClassicELBObject, "Unhealthy Threshold"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Id")).toEqual(jsonUtil.getValue(ClassicELBObject, "Instance Id"));
        expect(ordersPage.getTextBasedOnLabelName("Cross Zone")).toEqual(jsonUtil.getValue(ClassicELBObject, "Cross Zone"));
        expect(ordersPage.getTextBasedOnLabelName("Connection Draining Policy Enabled")).toEqual(jsonUtil.getValue(ClassicELBObject, "Connection Draining Policy Enabled"));
        expect(ordersPage.getTextBasedOnLabelName("Idle Timeout")).toEqual(jsonUtil.getValue(ClassicELBObject, "Idle Timeout"));

        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(classicELBInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C175378 : AWS classicELB - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(classicELBInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(classicELBInstanceTemplate, modifiedParamMap);
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
});