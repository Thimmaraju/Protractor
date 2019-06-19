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

    networkELBInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSNetworkLoadBalancer.json');

describe('AWS - Network Load Balancer', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, loadBalancerName, targetGroupName, NetworkELBINSObject;
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
        NetworkELBINSObject = JSON.parse(JSON.stringify(networkELBInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        loadBalancerName = "NetworkLoadBalancer" + util.getRandomString(5);
        targetGroupName = "TaregtGroupName" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": loadBalancerName, "Target Group Name": targetGroupName };
    });

    it('TC-C175412 : AWS Network ELB - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(networkELBInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        var NetworkELBINSObject = JSON.parse(JSON.stringify(networkELBInstanceTemplate));
        expect(placeOrderPage.getTextBluePrintName()).toContain(networkELBInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(NetworkELBINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(networkELBInstanceTemplate.BasePrice);
    });

    it('TC-175413 : AWS Network ELB - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(networkELBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(networkELBInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(networkELBInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Scheme"]).toEqual(requiredReturnMap["Expected"]["Scheme"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Protocol"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Protocol"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Port"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Port"]);
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            expect(requiredReturnMap["Actual"]["Availability Zone"]).toEqual(requiredReturnMap["Expected"]["Availability Zone"]);
            //expect(requiredReturnMap["Actual"]["Subnet"]).toEqual(requiredReturnMap["Expected"]["Subnet"]);
            expect(requiredReturnMap["Actual"]["Tag Key"]).toEqual(requiredReturnMap["Expected"]["Tag Key"]);
            expect(requiredReturnMap["Actual"]["Tag Value"]).toEqual(requiredReturnMap["Expected"]["Tag Value"]);
            expect(requiredReturnMap["Actual"]["Target Group Name"]).toEqual(requiredReturnMap["Expected"]["Target Group Name"]);
            expect(requiredReturnMap["Actual"]["Target Group Protocol"]).toEqual(requiredReturnMap["Expected"]["Target Group Protocol"]);
            expect(requiredReturnMap["Actual"]["Target Group Port"]).toEqual(requiredReturnMap["Expected"]["Target Group Port"]);
            expect(requiredReturnMap["Actual"]["Target Type"]).toEqual(requiredReturnMap["Expected"]["Target Type"]);
            expect(requiredReturnMap["Actual"]["IP"]).toEqual(requiredReturnMap["Expected"]["IP"]);
            expect(requiredReturnMap["Actual"]["Target Port"]).toEqual(requiredReturnMap["Expected"]["Target Port"]);
            expect(requiredReturnMap["Actual"]["Healthcheck Protocol"]).toEqual(requiredReturnMap["Expected"]["Healthcheck Protocol"]);
            expect(requiredReturnMap["Actual"]["Healthcheck Port"]).toEqual(requiredReturnMap["Expected"]["Healthcheck Port"]);
            expect(requiredReturnMap["Actual"]["Healthy Threshold"]).toEqual(requiredReturnMap["Expected"]["Healthy Threshold"]);
            expect(requiredReturnMap["Actual"]["Interval"]).toEqual(requiredReturnMap["Expected"]["Interval"]);
        });
    });

    it('TC-C175414 : AWS Network ELB - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(networkELBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(networkELBInstanceTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
        var orderAmount = ordersPage.getTextFirstAmountOrdersTable();
        ordersPage.clickFirstViewDetailsOrdersTable();
        orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(networkELBInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(loadBalancerName);
        expect(ordersPage.getTextBasedOnLabelName("Scheme")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Scheme"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Protocol")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Load Balancer Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Port")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Load Balancer Port"));
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Availability Zone")).toEqual("us-east-1a, us-east-1b");
        expect(ordersPage.getTextBasedOnLabelName("Subnet")).toEqual("subnet-a68b538d (us-east-1a), subnet-c5f664b2 (us-east-1b)");
        expect(ordersPage.getTextBasedOnLabelName("Tag Key")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Tag Key"));
        expect(ordersPage.getTextBasedOnLabelName("Tag Value")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Tag Value"));
        expect(ordersPage.getTextBasedOnLabelName("Target Group Name")).toEqual(targetGroupName);
        expect(ordersPage.getTextBasedOnLabelName("Target Group Protocol")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Target Group Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Target Group Port")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Target Group Port"));
        expect(ordersPage.getTextBasedOnLabelName("Target Type")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Target Type"));
        expect(ordersPage.getTextBasedOnLabelName("IP")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "IP"));
        expect(ordersPage.getTextBasedOnLabelName("Target Port")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Target Port"));
        expect(ordersPage.getTextBasedOnLabelName("Healthcheck Protocol")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Healthcheck Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Healthcheck Port")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Healthcheck Port"));
        expect(ordersPage.getTextBasedOnLabelName("Healthy Threshold")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Healthy Threshold"));
        expect(ordersPage.getTextBasedOnLabelName("Interval")).toEqual(jsonUtil.getValue(NetworkELBINSObject, "Interval"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(networkELBInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-175415: AWS Network ELB - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(networkELBInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(networkELBInstanceTemplate, modifiedParamMap);
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
