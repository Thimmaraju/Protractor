
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

    eventSubscriptionInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSRDSEventSubscription.json');

describe('AWS - RDS Event Subscription', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, name, EventSubscriptionINSObject;
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
        EventSubscriptionINSObject = JSON.parse(JSON.stringify(eventSubscriptionInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        name = "subscription" + util.getRandomString(5);
        name = name.toLocaleLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": name };
    });

    it('TC-C189834 : AWS RDS Event Subscription - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(eventSubscriptionInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(eventSubscriptionInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(EventSubscriptionINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(eventSubscriptionInstanceTemplate.BasePrice);
    });

    it('TC-C189835: AWS RDS Event Subscription - Verify Summary details and Additional Details are listed in review Order page', function () {
        var EventSubscriptionINSObject = JSON.parse(JSON.stringify(eventSubscriptionInstanceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(eventSubscriptionInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(eventSubscriptionInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(eventSubscriptionInstanceTemplate.EstimatedPrice);
            expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["ARN"]).toEqual(requiredReturnMap["Expected"]["ARN"]);
            expect(requiredReturnMap["Actual"]["Send notifications to"]).toEqual(requiredReturnMap["Expected"]["Send notifications to"]);
            expect(requiredReturnMap["Actual"]["Source Type"]).toEqual(requiredReturnMap["Expected"]["Source Type"]);
            expect(requiredReturnMap["Actual"]["Source Type To Include"]).toEqual(requiredReturnMap["Expected"]["Source Type To Include"]);
            expect(requiredReturnMap["Actual"]["Specific Event"]).toEqual(requiredReturnMap["Expected"]["Specific Event"]);
        });

    });

    it('TC-C189836 : AWS RDS Event Subscription - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        var EventSubscriptionINSObject = JSON.parse(JSON.stringify(eventSubscriptionInstanceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(eventSubscriptionInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(eventSubscriptionInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(eventSubscriptionInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(EventSubscriptionINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOexpect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(EventSubscriptionINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(name);
        expect(ordersPage.getTextBasedOnLabelName("ARN")).toEqual(jsonUtil.getValue(EventSubscriptionINSObject, "ARN"));
        expect(ordersPage.getTextBasedOnLabelName("Send notifications to")).toEqual(jsonUtil.getValue(EventSubscriptionINSObject, "Send notifications to"));
        expect(ordersPage.getTextBasedOnLabelName("Source Type")).toEqual(jsonUtil.getValue(EventSubscriptionINSObject, "Source Type"));
        expect(ordersPage.getTextBasedOnLabelName("Source Type To Include")).toEqual(jsonUtil.getValue(EventSubscriptionINSObject, "Source Type To Include"));
        expect(ordersPage.getTextBasedOnLabelName("Specific Event")).toEqual(jsonUtil.getValue(EventSubscriptionINSObject, "Specific Event"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(eventSubscriptionInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C189837: AWS RDS Event Subscription - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(eventSubscriptionInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(eventSubscriptionInstanceTemplate, modifiedParamMap);
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