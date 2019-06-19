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

    applicationELBInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSApplicationLoadBalancer.json');

describe('AWS - Application ELB', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, loadBalancerName, targetGroupName, AELBObject;
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
        AELBObject = JSON.parse(JSON.stringify(applicationELBInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        loadBalancerName = "ApplicationLoadBalancer" + util.getRandomString(5);
        targetGroupName = "TaregtGroupName" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": loadBalancerName, "Target Group Name": targetGroupName };
    });

    it('TC-175398 : AWS Application ELB - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(applicationELBInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(applicationELBInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(AELBObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(AELBObject.BasePrice);
    });

    it('TC-175399 : AWS Application ELB - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(applicationELBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(applicationELBInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(applicationELBInstanceTemplate.EstimatedPrice);
            expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Target Group Name"]).toEqual(requiredReturnMap["Expected"]["Target Group Name"]);
            expect(requiredReturnMap["Actual"]["Target Group Protocol"]).toEqual(requiredReturnMap["Expected"]["Target Group Protocol"]);
            expect(requiredReturnMap["Actual"]["Target Group Port"]).toEqual(requiredReturnMap["Expected"]["Target Group Port"]);
            expect(requiredReturnMap["Actual"]["Target Type"]).toEqual(requiredReturnMap["Expected"]["Target Type"]);
            expect(requiredReturnMap["Actual"]["IP"]).toEqual(requiredReturnMap["Expected"]["IP"]);
            expect(requiredReturnMap["Actual"]["Target Port"]).toEqual(requiredReturnMap["Expected"]["Target Port"]);
            expect(requiredReturnMap["Actual"]["Healthcheck Protocol"]).toEqual(requiredReturnMap["Expected"]["Healthcheck Protocol"]);
            expect(requiredReturnMap["Actual"]["Healthcheck Path"]).toEqual(requiredReturnMap["Expected"]["Healthcheck Path"]);
            expect(requiredReturnMap["Actual"]["Healthcheck Port"]).toEqual(requiredReturnMap["Expected"]["Healthcheck Port"]);
            expect(requiredReturnMap["Actual"]["Healthy Threshold"]).toEqual(requiredReturnMap["Expected"]["Healthy Threshold"]);
            expect(requiredReturnMap["Actual"]["Unhealthy Threshold"]).toEqual(requiredReturnMap["Expected"]["Unhealthy Threshold"]);
            expect(requiredReturnMap["Actual"]["Timeout In Seconds"]).toEqual(requiredReturnMap["Expected"]["Timeout In Seconds"]);
            expect(requiredReturnMap["Actual"]["Interval In Seconds"]).toEqual(requiredReturnMap["Expected"]["Interval In Seconds"]);
            expect(requiredReturnMap["Actual"]["Success Codes"]).toEqual(requiredReturnMap["Expected"]["Success Codes"]);
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            expect(requiredReturnMap["Actual"]["Availability Zones"]).toEqual(requiredReturnMap["Expected"]["Availability Zones"]);
            //expect(requiredReturnMap["Actual"]["Subnet"]).toEqual(requiredReturnMap["Expected"]["Subnet"]);
            expect(requiredReturnMap["Actual"]["Security Group"]).toEqual(requiredReturnMap["Expected"]["Security Group"]);
            expect(requiredReturnMap["Actual"]["Tag Value"]).toEqual(requiredReturnMap["Expected"]["Tag Value"]);
        });
    });

    it('TC-175400 : AWS Application ELB - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(applicationELBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(applicationELBInstanceTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();
        orderFlowUtil.currentRepeatCount = 0;
        orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(applicationELBInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(AELBObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(AELBObject, "AWS Region"));
        //expect(placeOrderPage.getTextBasedOnLabelName("Name")).toEqual(loadBalancerName);
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(AELBObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Availability Zones")).toEqual("us-east-1a, us-east-1b");
        expect(ordersPage.getTextBasedOnLabelName("Subnet")).toEqual("subnet-a68b538d (us-east-1a), subnet-c5f664b2 (us-east-1b)");
        expect(ordersPage.getTextBasedOnLabelName("Scheme")).toEqual(jsonUtil.getValue(AELBObject, "Scheme"));
        expect(ordersPage.getTextBasedOnLabelName("IP Address Type")).toEqual(jsonUtil.getValue(AELBObject, "IP Address Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("First Load Balancer Port")).toEqual(jsonUtil.getValue(AELBObject, "First Load Balancer Port"));
        expect(ordersPage.getTextBasedOnExactLabelName("First Load Balancer Protocol")).toEqual(jsonUtil.getValue(AELBObject, "First Load Balancer Protocol"));
        expect(ordersPage.getTextBasedOnExactLabelName("Second Load Balancer Port")).toEqual(jsonUtil.getValue(AELBObject, "Second Load Balancer Port"));
        expect(ordersPage.getTextBasedOnExactLabelName("Second Load Balancer Protocol")).toEqual(jsonUtil.getValue(AELBObject, "Second Load Balancer Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Tag Key")).toEqual(jsonUtil.getValue(AELBObject, "Tag Key"));
        expect(ordersPage.getTextBasedOnLabelName("Tag Value")).toEqual(jsonUtil.getValue(AELBObject, "Tag Value"));
        expect(ordersPage.getTextBasedOnLabelName("Security Group")).toEqual(jsonUtil.getValue(AELBObject, "Security Group"));
        expect(ordersPage.getTextBasedOnLabelName("Target Group Name")).toEqual(targetGroupName);
        expect(ordersPage.getTextBasedOnLabelName("Target Group Protocol")).toEqual(jsonUtil.getValue(AELBObject, "Target Group Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Target Group Port")).toEqual(jsonUtil.getValue(AELBObject, "Target Group Port"));
        expect(ordersPage.getTextBasedOnLabelName("Target Type")).toEqual(jsonUtil.getValue(AELBObject, "Target Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("IP")).toEqual(jsonUtil.getValue(AELBObject, "IP"));
        expect(ordersPage.getTextBasedOnLabelName("Target Port")).toEqual(jsonUtil.getValue(AELBObject, "Target Port"));
        expect(ordersPage.getTextBasedOnLabelName("Healthcheck Protocol")).toEqual(jsonUtil.getValue(AELBObject, "Healthcheck Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Healthcheck Path")).toEqual(jsonUtil.getValue(AELBObject, "Healthcheck Path"));
        expect(ordersPage.getTextBasedOnLabelName("Healthcheck Port")).toEqual(jsonUtil.getValue(AELBObject, "Healthcheck Port"));
        expect(ordersPage.getTextBasedOnLabelName("Healthy Threshold")).toEqual(jsonUtil.getValue(AELBObject, "Healthy Threshold"));
        expect(ordersPage.getTextBasedOnLabelName("Unhealthy Threshold")).toEqual(jsonUtil.getValue(AELBObject, "Unhealthy Threshold"));
        expect(ordersPage.getTextBasedOnLabelName("Timeout In Seconds")).toEqual(jsonUtil.getValue(AELBObject, "Timeout In Seconds"));
        expect(ordersPage.getTextBasedOnLabelName("Interval In Seconds")).toEqual(jsonUtil.getValue(AELBObject, "Interval In Seconds"));
        expect(ordersPage.getTextBasedOnLabelName("Success Codes")).toEqual(jsonUtil.getValue(AELBObject, "Success Codes"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(applicationELBInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-175401: AWS Application ELB - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(applicationELBInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(applicationELBInstanceTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.currentRepeatCount = 0;
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.currentRepeatCount = 0;
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        });
    }
})
