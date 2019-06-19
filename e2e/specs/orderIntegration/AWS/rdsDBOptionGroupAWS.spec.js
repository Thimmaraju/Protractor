
"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    isProvisioningRequired = browser.params.isProvisioningRequired,
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

    dbOptionGroupInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSRDSDBOptionGroup.json');

describe('AWS - RDS DB Option Group', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, name, DBOptionGroupINSObject;
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
        DBOptionGroupINSObject = JSON.parse(JSON.stringify(dbOptionGroupInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        name = "optiongroup" + util.getRandomString(5);
        name = name.toLocaleLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": name };
    });

    it('TC-C188094 : AWS RDS DB Option Group - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(dbOptionGroupInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(dbOptionGroupInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(DBOptionGroupINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(dbOptionGroupInstanceTemplate.BasePrice);
    });

    it('TC-C188095: AWS RDS DB Option Group - Verify Summary details and Additional Details are listed in review Order page', function () {
        var DBOptionGroupINSObject = JSON.parse(JSON.stringify(dbOptionGroupInstanceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(dbOptionGroupInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(dbOptionGroupInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(dbOptionGroupInstanceTemplate.EstimatedPrice);
            expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Description"]).toEqual(requiredReturnMap["Expected"]["Description"]);
            expect(requiredReturnMap["Actual"]["Engine"]).toEqual(requiredReturnMap["Expected"]["Engine"]);
            expect(requiredReturnMap["Actual"]["Major Engine Version"]).toEqual(requiredReturnMap["Expected"]["Major Engine Version"]);
        });
    });

    it('TC-C188096 : AWS RDS DB Option Group - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        var DBOptionGroupINSObject = JSON.parse(JSON.stringify(dbOptionGroupInstanceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(dbOptionGroupInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(dbOptionGroupInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(dbOptionGroupInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(DBOptionGroupINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(DBOptionGroupINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(name);
        expect(ordersPage.getTextBasedOnLabelName("Description")).toEqual(jsonUtil.getValue(DBOptionGroupINSObject, "Description"));
        expect(ordersPage.getTextBasedOnLabelName("Engine")).toEqual(jsonUtil.getValue(DBOptionGroupINSObject, "Engine"));
        expect(ordersPage.getTextBasedOnLabelName("Major Engine Version")).toEqual(jsonUtil.getValue(DBOptionGroupINSObject, "Major Engine Version"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(dbOptionGroupInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C188097: AWS RDS DB Option Group - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(dbOptionGroupInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(dbOptionGroupInstanceTemplate, modifiedParamMap);
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