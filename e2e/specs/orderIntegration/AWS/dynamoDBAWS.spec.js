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
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

    dynamoDBInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSDynamoDBInstance.json');

describe('AWS - Dynamodb', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, dbTable, DynamodbINSObject;
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
        DynamodbINSObject = JSON.parse(JSON.stringify(dynamoDBInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        dbTable = "DBtable" + util.getRandomString(5)
        modifiedParamMap = {
            "Service Instance Name": serviceName,
            "Table Name": dbTable
        };
    });

    it('TC-C173496 : AWS Dynamodb - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(dynamoDBInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(dynamoDBInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(DynamodbINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(dynamoDBInstanceTemplate.BasePrice);
    });

    it('TC-C173498 :  AWS Dynamodb - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(dynamoDBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(dynamoDBInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Table Name"]).toEqual(requiredReturnMap["Expected"]["Table Name"]);
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(dynamoDBInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Resource Name"]).toEqual(requiredReturnMap["Expected"]["Resource Name"]);
            expect(requiredReturnMap["Actual"]["Partition Key"]).toEqual(requiredReturnMap["Expected"]["Partition Key"]);
            expect(requiredReturnMap["Actual"]["Partition Key Type"]).toEqual(requiredReturnMap["Expected"]["Partition Key Type"]);
            expect(requiredReturnMap["Actual"]["Sort Key"]).toEqual(requiredReturnMap["Expected"]["Sort Key"]);
            expect(requiredReturnMap["Actual"]["Sort Key Type"]).toEqual(requiredReturnMap["Expected"]["Sort Key Type"]);
            expect(requiredReturnMap["Actual"]["Read Capacity Units"]).toEqual(requiredReturnMap["Expected"]["Read Capacity Units"]);
            expect(requiredReturnMap["Actual"]["Write Capacity Units"]).toEqual(requiredReturnMap["Expected"]["Write Capacity Units"]);
            expect(requiredReturnMap["Actual"]["Time To Live"]).toEqual(requiredReturnMap["Expected"]["Time To Live"]);
            expect(requiredReturnMap["Actual"]["Stream View Type"]).toEqual(requiredReturnMap["Expected"]["Stream View Type"]);
            expect(requiredReturnMap["Actual"]["Use default settings"]).toEqual(requiredReturnMap["Expected"]["Use default settings"]);
        });
    });

    it('TC-C173768 :  AWS Dynamodb - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(dynamoDBInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(dynamoDBInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(dynamoDBInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(DynamodbINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(DynamodbINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Resource Name")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Resource Name"));
        expect(ordersPage.getTextBasedOnLabelName("Table Name")).toEqual(dbTable);
        expect(ordersPage.getTextBasedOnLabelName("Partition Key")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Partition Key"));
        expect(ordersPage.getTextBasedOnLabelName("Partition Key Type")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Partition Key Type"));
        expect(ordersPage.getTextBasedOnLabelName("Sort Key")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Sort Key"));
        expect(ordersPage.getTextBasedOnLabelName("Sort Key Type")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Sort Key Type"));
        expect(ordersPage.getTextBasedOnLabelName("Read Capacity Units")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Read Capacity Units"));
        expect(ordersPage.getTextBasedOnLabelName("Write Capacity Units")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Write Capacity Units"));
        expect(ordersPage.getTextBasedOnLabelName("Time To Live")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Time To Live"));
        expect(ordersPage.getTextBasedOnLabelName("Stream View Type")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Stream View Type"));
        expect(ordersPage.getTextBasedOnLabelName("Use default settings")).toEqual(jsonUtil.getValue(DynamodbINSObject, "Use default settings"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(dynamoDBInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C173769: AWS Dynamodb - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(dynamoDBInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(dynamoDBInstanceTemplate, modifiedParamMap);
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
                    orderFlowUtil.fillOrderDetails(dynamoDBInstanceTemplate, modifiedParamMap).then(function () {
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
                            //Verify updated details are reflected on order details apge.						
                            ordersPage.clickFirstViewDetailsOrdersTable();
                            expect(ordersPage.getTextBasedOnLabelName("Resource Name")).toEqual(jsonUtil.getValueEditParameter(DynamodbINSObject, "Resource Name"));
                            expect(ordersPage.getTextBasedOnLabelName("Read Capacity Units")).toEqual(jsonUtil.getValueEditParameter(DynamodbINSObject, "Read Capacity Units"));
                            expect(ordersPage.getTextBasedOnLabelName("Write Capacity Units")).toEqual(jsonUtil.getValueEditParameter(DynamodbINSObject, "Write Capacity Units"));
                            expect(ordersPage.getTextBasedOnLabelName("Time To Live")).toEqual(jsonUtil.getValueEditParameter(DynamodbINSObject, "Time To Live"));
                            expect(ordersPage.getTextBasedOnLabelName("Stream View Type")).toEqual(jsonUtil.getValueEditParameter(DynamodbINSObject, "Stream View Type"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Key")).toEqual(jsonUtil.getValueEditParameter(DynamodbINSObject, "Key"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Value")).toEqual(jsonUtil.getValueEditParameter(DynamodbINSObject, "Value"));
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