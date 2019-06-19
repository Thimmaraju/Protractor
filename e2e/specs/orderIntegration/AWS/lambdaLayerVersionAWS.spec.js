"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

    lambdaLayerVersionTemplate = require('../../../../testData/OrderIntegration/AWS/AWSLambdaLayerVersion.json');

describe('AWS - Lambda Layer Version', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, lambdaLayerVerFunctionName, LambdaLayerVerINSObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Compute',
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
        LambdaLayerVerINSObject = JSON.parse(JSON.stringify(lambdaLayerVersionTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        lambdaLayerVerFunctionName = "lambdalayerversion" + util.getRandomString(5)
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": lambdaLayerVerFunctionName };
    });

    it('TC-C227334 : AWS Lambda Layer Version - Verify fields on Main Parameters page of Lambda Layer Version is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(lambdaLayerVersionTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(lambdaLayerVersionTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(LambdaLayerVerINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(lambdaLayerVersionTemplate.BasePrice);
    });

    it('TC-C227335 :  AWS Lambda Layer Version - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(lambdaLayerVersionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(lambdaLayerVersionTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(lambdaLayerVersionTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Compatible runtimes"]).toEqual(requiredReturnMap["Expected"]["Compatible runtimes"]);
            expect(requiredReturnMap["Actual"]["S3 Bucket"]).toEqual(requiredReturnMap["Expected"]["S3 Bucket"]);
            expect(requiredReturnMap["Actual"]["S3 Key"]).toEqual(requiredReturnMap["Expected"]["S3 Key"]);
            expect(requiredReturnMap["Actual"]["Description"]).toEqual(requiredReturnMap["Expected"]["Description"]);
        });
    });

    it('TC-C227336:  AWS Lambda Layer Version - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(lambdaLayerVersionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(lambdaLayerVersionTemplate, modifiedParamMap);
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
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnExactLabelName("AWS Region")).toEqual(jsonUtil.getValue(LambdaLayerVerINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(lambdaLayerVerFunctionName);
        expect(ordersPage.getTextBasedOnExactLabelName("Compatible runtimes")).toEqual("Python-3.7, Ruby-2.5");
        expect(ordersPage.getTextBasedOnExactLabelName("S3 Bucket")).toEqual(jsonUtil.getValue(LambdaLayerVerINSObject, "S3 Bucket"));
        expect(ordersPage.getTextBasedOnExactLabelName("S3 Key")).toEqual(jsonUtil.getValue(LambdaLayerVerINSObject, "S3 Key"));
        expect(ordersPage.getTextBasedOnExactLabelName("Description")).toEqual(jsonUtil.getValue(LambdaLayerVerINSObject, "Description"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(lambdaLayerVersionTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C227337 : AWS Lambda Layer Version - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(lambdaLayerVersionTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(lambdaLayerVersionTemplate, modifiedParamMap);
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
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        });
    }
})