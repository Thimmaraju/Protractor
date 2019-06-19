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
    kinesisDataFireHoseInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSKinesisDataFireHoseInstance.json');

describe('AWS - kinesis Data FireHose', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, streamName, kinesisDataFireHoseObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Other Services',
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
        kinesisDataFireHoseObject = JSON.parse(JSON.stringify(kinesisDataFireHoseInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        streamName = "mynewstream" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Delivery Stream Name": streamName };
    });

    it('TC-C184572 : AWS kinesis Data FireHose - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(kinesisDataFireHoseInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(kinesisDataFireHoseInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(kinesisDataFireHoseObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(kinesisDataFireHoseInstanceTemplate.BasePrice);

    });

    it('TC-C184573 : AWS kinesis Data FireHose - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(kinesisDataFireHoseInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(kinesisDataFireHoseInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(kinesisDataFireHoseInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Delivery Stream Name"]).toEqual(requiredReturnMap["Expected"]["Delivery Stream Name"]);
            expect(requiredReturnMap["Actual"]["Source"]).toEqual(requiredReturnMap["Expected"]["Source"]);
            expect(requiredReturnMap["Actual"]["Record Transformation"]).toEqual(requiredReturnMap["Expected"]["Record Transformation"]);
            expect(requiredReturnMap["Actual"]["Destination"]).toEqual(requiredReturnMap["Expected"]["Destination"]);
            expect(requiredReturnMap["Actual"]["S3 Bucket"]).toEqual(requiredReturnMap["Expected"]["S3 Bucket"]);
            expect(requiredReturnMap["Actual"]["Prefix"]).toEqual(requiredReturnMap["Expected"]["Prefix"]);
            expect(requiredReturnMap["Actual"]["Buffer Size"]).toEqual(requiredReturnMap["Expected"]["Buffer Size"]);
            expect(requiredReturnMap["Actual"]["Buffer Interval"]).toEqual(requiredReturnMap["Expected"]["Buffer Interval"]);
            expect(requiredReturnMap["Actual"]["S3 Compression"]).toEqual(requiredReturnMap["Expected"]["S3 Compression"]);
            expect(requiredReturnMap["Actual"]["S3 Encryption"]).toEqual(requiredReturnMap["Expected"]["S3 Encryption"]);
            expect(requiredReturnMap["Actual"]["Error Logging"]).toEqual(requiredReturnMap["Expected"]["Error Logging"]);
            expect(requiredReturnMap["Actual"]["IAM Role"]).toEqual(requiredReturnMap["Expected"]["IAM Role"]);
        });
    });

    it('TC-C184574 : AWS kinesis Data FireHose - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(kinesisDataFireHoseInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(kinesisDataFireHoseInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(kinesisDataFireHoseInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Delivery Stream Name")).toEqual(streamName);
        expect(ordersPage.getTextBasedOnLabelName("Source")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Source"));
        expect(ordersPage.getTextBasedOnLabelName("Record Transformation")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Record Transformation"));
        expect(ordersPage.getTextBasedOnLabelName("Destination")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Destination"));
        // expect(ordersPage.getTextBasedOnLabelName("S3 Bucket")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "demobuckkettt545"));
        //expect(ordersPage.getTextBasedOnLabelName("Prefix")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "kinesisdata"));
        expect(ordersPage.getTextBasedOnLabelName("Buffer Size")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Buffer Size"));
        expect(ordersPage.getTextBasedOnLabelName("Buffer Interval")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Buffer Interval"));
        //expect(ordersPage.getTextBasedOnLabelName("S3 Compression")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Disabled"));
        expect(ordersPage.getTextBasedOnLabelName("S3 Encryption")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "S3 Encryption"));
        expect(ordersPage.getTextBasedOnLabelName("Error Logging")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "Error Logging"));
        expect(ordersPage.getTextBasedOnLabelName("IAM Role")).toEqual(jsonUtil.getValue(kinesisDataFireHoseObject, "IAM Role"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(kinesisDataFireHoseInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C184575: AWS kinesisDataFireHose : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(kinesisDataFireHoseInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(kinesisDataFireHoseInstanceTemplate, modifiedParamMap);
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
                    ////expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        });
    }
})
