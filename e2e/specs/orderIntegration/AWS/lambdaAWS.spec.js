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

    lambdaInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSLambdaInstance.json');

describe('AWS - Lambda', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, lambdaFunctionName, LambdaINSObject;
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
        LambdaINSObject = JSON.parse(JSON.stringify(lambdaInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        lambdaFunctionName = "lambda" + util.getRandomString(5)
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": lambdaFunctionName };
    });

    it('TC-C178872 : AWS Lambda - Verify fields on Main Parameters page of Lambda is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(lambdaInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(lambdaInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(LambdaINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(lambdaInstanceTemplate.BasePrice);
    });

    it('TC-C178873 :  AWS Lamdda - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(lambdaInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(lambdaInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(lambdaInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Runtime"]).toEqual(requiredReturnMap["Expected"]["Runtime"]);
            //expect(requiredReturnMap["Actual"]["Role"]).toEqual(requiredReturnMap["Expected"]["Role"]);
            expect(requiredReturnMap["Actual"]["S3 Bucket"]).toEqual(requiredReturnMap["Expected"]["S3 Bucket"]);
            expect(requiredReturnMap["Actual"]["S3 Key"]).toEqual(requiredReturnMap["Expected"]["S3 Key"]);
            expect(requiredReturnMap["Actual"]["Handler"]).toEqual(requiredReturnMap["Expected"]["Handler"]);
            expect(requiredReturnMap["Actual"]["Timeout"]).toEqual(requiredReturnMap["Expected"]["Timeout"]);
            expect(requiredReturnMap["Actual"]["Tracing Config"]).toEqual(requiredReturnMap["Expected"]["Tracing Config"]);
            expect(requiredReturnMap["Actual"]["Memory"]).toEqual(requiredReturnMap["Expected"]["Memory"]);
            expect(requiredReturnMap["Actual"]["DLQ Resource"]).toEqual(requiredReturnMap["Expected"]["DLQ Resource"]);
            expect(requiredReturnMap["Actual"]["Concurrency"]).toEqual(requiredReturnMap["Expected"]["Concurrency"]);
            expect(requiredReturnMap["Actual"]["With VPC"]).toEqual(requiredReturnMap["Expected"]["With VPC"]);
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            //expect(requiredReturnMap["Actual"]["Subnets"]).toEqual(requiredReturnMap["Expected"]["Subnets"]);
            expect(requiredReturnMap["Actual"]["Security Groups"]).toEqual(requiredReturnMap["Expected"]["Security Groups"]);
            expect(requiredReturnMap["Actual"]["Encryption Configuration"]).toEqual(requiredReturnMap["Expected"]["Encryption Configuration"]);
            expect(requiredReturnMap["Actual"]["Layer selection"]).toEqual(requiredReturnMap["Expected"]["Layer selection"]);
            expect(requiredReturnMap["Actual"]["Layer"]).toEqual(requiredReturnMap["Expected"]["Layer"]);
            expect(requiredReturnMap["Actual"]["Version"]).toEqual(requiredReturnMap["Expected"]["Version"]);
        });
    });

    it('TC-C178874 :  AWS Lambda - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(lambdaInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(lambdaInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(lambdaInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(LambdaINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnExactLabelName("AWS Region")).toEqual(jsonUtil.getValue(LambdaINSObject, "AWS Region"));
        //expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(lambdaFunctionName);
        expect(ordersPage.getTextBasedOnExactLabelName("Runtime")).toEqual(jsonUtil.getValue(LambdaINSObject, "Runtime"));
        expect(ordersPage.getTextBasedOnExactLabelName("Role")).toEqual(jsonUtil.getValue(LambdaINSObject, "Role"));
        expect(ordersPage.getTextBasedOnExactLabelName("S3 Bucket")).toEqual(jsonUtil.getValue(LambdaINSObject, "S3 Bucket"));
        expect(ordersPage.getTextBasedOnExactLabelName("S3 Key")).toEqual(jsonUtil.getValue(LambdaINSObject, "S3 Key"));
        expect(ordersPage.getTextBasedOnExactLabelName("Handler")).toEqual(jsonUtil.getValue(LambdaINSObject, "Handler"));
        expect(ordersPage.getTextBasedOnExactLabelName("Timeout")).toEqual(jsonUtil.getValue(LambdaINSObject, "Timeout"));
        expect(ordersPage.getTextBasedOnExactLabelName("Tracing Config")).toEqual(jsonUtil.getValue(LambdaINSObject, "Tracing Config"));
        expect(ordersPage.getTextBasedOnExactLabelName("Memory")).toEqual(jsonUtil.getValue(LambdaINSObject, "Memory"));
        expect(ordersPage.getTextBasedOnExactLabelName("DLQ Resource")).toEqual(jsonUtil.getValue(LambdaINSObject, "DLQ Resource"));
        expect(ordersPage.getTextBasedOnExactLabelName("Concurrency")).toEqual(jsonUtil.getValue(LambdaINSObject, "Concurrency"));
        expect(ordersPage.getTextBasedOnExactLabelName("With VPC")).toEqual(jsonUtil.getValue(LambdaINSObject, "With VPC"));
        expect(ordersPage.getTextBasedOnExactLabelName("VPC")).toEqual(jsonUtil.getValue(LambdaINSObject, "VPC"));
        //expect(ordersPage.getTextBasedOnExactLabelName("Subnets")).toEqual("subnet-f3a23cff (us-east-1f),subnet-db6217be (us-east-1d)");
        expect(ordersPage.getTextBasedOnExactLabelName("Security Groups")).toEqual("sg-0293b6716a6781643, sg-0356cc1447f668f70");
        expect(ordersPage.getTextBasedOnExactLabelName("Encryption Configuration")).toEqual(jsonUtil.getValue(LambdaINSObject, "Encryption Configuration"));
        expect(ordersPage.getTextBasedOnExactLabelName("Layer selection")).toEqual(jsonUtil.getValue(LambdaINSObject, "Layer selection"));
        expect(ordersPage.getTextBasedOnExactLabelName("Layer")).toEqual(jsonUtil.getValue(LambdaINSObject, "Layer"));
        expect(ordersPage.getTextBasedOnExactLabelName("Version")).toEqual(jsonUtil.getValue(LambdaINSObject, "Version"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(lambdaInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C178875 : AWS Lambda - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(lambdaInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(lambdaInstanceTemplate, modifiedParamMap);
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
                    var modifiedParamMap = { "EditService": true };
                    orderFlowUtil.editService(orderObject);
                    orderFlowUtil.fillOrderDetails(lambdaInstanceTemplate, modifiedParamMap).then(function () {
                        logger.info("Edit parameter details are filled.");
                        browser.sleep(5000);
                    });
                    placeOrderPage.submitOrder();
                    orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                    expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                    placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                    orderFlowUtil.approveOrder(orderObject);
                    orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
                    orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                        if (status == 'Completed') {
                            //Verify updated details are reflected on order details page.						
                            ordersPage.clickFirstViewDetailsOrdersTable();
                            expect(ordersPage.getTextBasedOnExactLabelName("Description")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Description"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Runtime")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Runtime"));
                            expect(ordersPage.getTextBasedOnExactLabelName("S3 Key")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "S3 Key"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Handler")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Handler"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Timeout")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Timeout"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Memory")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Memory"));
                            expect(ordersPage.getTextBasedOnExactLabelName("DLQ Resource")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "DLQ Resource"));
                            expect(ordersPage.getTextBasedOnExactLabelName("SNS ARN")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "SNS ARN"));
                            expect(ordersPage.getTextBasedOnExactLabelName("With VPC")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "With VPC"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Key")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Key"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Value")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Value"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Layer")).toEqual(jsonUtil.getValueEditParameter(LambdaINSObject, "Layer"));

                            //Delete Service flow                     
                            orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                            orderFlowUtil.approveDeletedOrder(orderObject);
                            orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                        }
                    });
                }
            })
        });
    }
})
