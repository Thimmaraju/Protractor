"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    isProvisioningRequired = browser.params.isProvisioningRequired,
    pubSubTemplate = require('../../../../testData/OrderIntegration/Google/pubsub.json');

describe('GCP - Pub/Sub', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, topicName;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Google',
        category: 'Applications',
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
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
        serviceName = "auto-pub-sub-" + util.getRandomString(5);
        topicName = "autom-" + util.getRandomString(5).toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": topicName };
    });

    it('TC-C187503 : Google Pub/Sub : Verify fields on Main Parameters page are working fine while provisioning a Google Load Balancing', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(pubSubTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(pubSubTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(pubSubTemplate.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(pubSubTemplate.BasePrice);
    });

    it('TC-C187504 : Google Pub/Sub : Verify Service Details are listed in Review Order page', function () {
        var pubsubObj = JSON.parse(JSON.stringify(pubSubTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(pubSubTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(pubSubTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //Basic Details
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            //Additional Details
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(pubSubTemplate.EstimatedPrice);
            /*expect(requiredReturnMap["Actual"]["Subscription name"]).toEqual(requiredReturnMap["Expected"]["Subscription name"]);           
	        expect(requiredReturnMap["Actual"]["Delivery Type"]).toEqual(requiredReturnMap["Expected"]["Delivery Type"]);
	        expect(requiredReturnMap["Actual"]["Acknowledgment Deadline"]).toEqual(requiredReturnMap["Expected"]["Acknowledgment Deadline"]); */
        });
    });

    it('TC-C187507 : Google Pub/Sub : Verify Order Details once order is submitted from catalog page ', function () {

        var orderObject = {};
        var orderAmount;
        var pubsubObj = JSON.parse(JSON.stringify(pubSubTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(pubSubTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(pubSubTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
        ordersPage.getTextFirstAmountOrdersTable().then(function (text) {
            orderAmount = text;
        });
        ordersPage.clickFirstViewDetailsOrdersTable();
        expect(ordersPage.getTextBasedOnLabelName("Service Name")).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(pubSubTemplate.serviceId);
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(pubsubObj, "Team"));
        //expect(ordersPage.getTextBasedOnLabelName("Order Type")).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        /* expect(ordersPage.getTextBasedOnLabelName("Subscription name")).toEqual(jsonUtil.getValue(pubsubObj, "Subscription name"));
         expect(ordersPage.getTextBasedOnLabelName("Delivery Type")).toEqual(jsonUtil.getValue(pubsubObj, "Delivery Type"));
         expect(ordersPage.getTextBasedOnLabelName("Acknowledgment Deadline")).toEqual(jsonUtil.getValue(pubsubObj, "Acknowledgment Deadline"));*/

        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(topicName);
        //Verify estimated price
        ordersPage.clickBillOfMaterialsTabOrderDetails().then(function () {
            expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(pubSubTemplate.TotalCost);
        });

    });
    if (isProvisioningRequired == "true") {
        it('TC-C187515 : Google Pub/Sub : E2E: Verify Order Provisioning is working fine from consume Application', function () {
            var orderObject = {};
            var pubsubObj = JSON.parse(JSON.stringify(pubSubTemplate));
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(pubSubTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(pubSubTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        });
    }
});
