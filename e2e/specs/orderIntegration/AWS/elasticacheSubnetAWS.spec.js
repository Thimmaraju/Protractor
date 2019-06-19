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

    subnetInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSElasticacheSubnetInstance.json');

describe('AWS - Elasticache Subnet', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, subnetName, SubnetINSObject;
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
        SubnetINSObject = JSON.parse(JSON.stringify(subnetInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        subnetName = "Subnet" + util.getRandomString(5);
        subnetName = subnetName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": subnetName };
    });

    it('TC-C180395 : AWS ElastiCache Subnet - Verify fields on Main Parameters page of Subnet is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(subnetInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(subnetInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(SubnetINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(subnetInstanceTemplate.BasePrice);
    });

    it('TC-C180396 :  AWS ElastiCache Subnet - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(subnetInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(subnetInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(subnetInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Description"]).toEqual(requiredReturnMap["Expected"]["Description"]);
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            //expect(requiredReturnMap["Actual"]["Subnet Id"]).toEqual(requiredReturnMap["Expected"]["Subnet Id"]);
        });
    });

    it('TC-C180397 :  AWS ElastiCache Subnet - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(subnetInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(subnetInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(subnetInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(SubnetINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(SubnetINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(subnetName);
        expect(ordersPage.getTextBasedOnLabelName("Description")).toEqual(jsonUtil.getValue(SubnetINSObject, "Description"));
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(SubnetINSObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Subnet Id")).toEqual("subnet-f3a23cff (us-east-1f), subnet-db6217be (us-east-1d)");
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(subnetInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C180398: AWS ElastiCache Subnet - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(subnetInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(subnetInstanceTemplate, modifiedParamMap);
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
