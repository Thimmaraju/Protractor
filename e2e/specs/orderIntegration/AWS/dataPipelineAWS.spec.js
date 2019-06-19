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
    pipelineInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSDataPipeline.json');

describe('AWS Data Pipeline', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, dataPipeline, DataPipelineINSObject;
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
        DataPipelineINSObject = JSON.parse(JSON.stringify(pipelineInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        dataPipeline = "DataPipeline" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": dataPipeline };
    });

    it('TC-C187091 : AWS Data Pipeline - Verify fields on Main Parameters page are working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(pipelineInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(pipelineInstanceTemplate.descriptiveText);
        //placeOrderPage.setServiceNameText(serviceName);
        //placeOrderPage.selectProviderAccount(pipelineInstanceTemplate.providerAccount);
        //expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(pipelineInstanceTemplate.BasePrice);
    });

    it('TC-C187092 : AWS Data Pipeline - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(pipelineInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(pipelineInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(pipelineInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Description"]).toEqual(requiredReturnMap["Expected"]["Description"]);
            expect(requiredReturnMap["Actual"]["Source"]).toEqual(requiredReturnMap["Expected"]["Source"]);
            expect(requiredReturnMap["Actual"]["AWS CLI Command"]).toEqual(requiredReturnMap["Expected"]["AWS CLI Command"]);
            expect(requiredReturnMap["Actual"]["Run"]).toEqual(requiredReturnMap["Expected"]["Run"]);
            expect(requiredReturnMap["Actual"]["S3 Location For Logs"]).toEqual(requiredReturnMap["Expected"]["S3 Location For Logs"]);
            expect(requiredReturnMap["Actual"]["IAM Roles"]).toEqual(requiredReturnMap["Expected"]["IAM Roles"]);
        });
    });

    it('TC-C187093 : AWS Data Pipeline - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(pipelineInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(pipelineInstanceTemplate, modifiedParamMap);
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
        //expect(ordersPage.getTextBasedOnExactLabelName("Service Offering Name")).toEqual(pipelineInstanceTemplate.bluePrintName);
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(DataPipelineINSObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(DataPipelineINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(dataPipeline);
        expect(ordersPage.getTextBasedOnLabelName("Description")).toEqual(jsonUtil.getValue(DataPipelineINSObject, "Description"));
        expect(ordersPage.getTextBasedOnLabelName("Source")).toEqual(jsonUtil.getValue(DataPipelineINSObject, "Source"));
        expect(ordersPage.getTextBasedOnLabelName("AWS CLI Command")).toEqual(jsonUtil.getValue(DataPipelineINSObject, "AWS CLI Command"));
        expect(ordersPage.getTextBasedOnExactLabelName("Run")).toEqual(jsonUtil.getValue(DataPipelineINSObject, "Run"));
        expect(ordersPage.getTextBasedOnLabelName("S3 Location For Logs")).toEqual(jsonUtil.getValue(DataPipelineINSObject, "S3 Location For Logs"));
        expect(ordersPage.getTextBasedOnLabelName("IAM Roles")).toEqual(jsonUtil.getValue(DataPipelineINSObject, "IAM Roles"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(pipelineInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C187094 : AWS Data Pipeline - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(pipelineInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName
            orderFlowUtil.fillOrderDetails(pipelineInstanceTemplate, modifiedParamMap);
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
                    orderFlowUtil.fillOrderDetails(pipelineInstanceTemplate, modifiedParamMap).then(function () {
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
                            expect(ordersPage.getTextBasedOnLabelName("AWS CLI Command")).toEqual(jsonUtil.getValueEditParameter(DataPipelineINSObject, "AWS CLI Command"));
                            expect(ordersPage.getTextBasedOnLabelName("S3 Location For Logs")).toEqual(jsonUtil.getValueEditParameter(DataPipelineINSObject, "S3 Location For Logs"));
                            expect(ordersPage.getTextBasedOnLabelName("IAM Roles")).toEqual(jsonUtil.getValueEditParameter(DataPipelineINSObject, "IAM Roles"));
                            expect(ordersPage.getTextBasedOnLabelName("Pipeline Role")).toEqual(jsonUtil.getValueEditParameter(DataPipelineINSObject, "Pipeline Role"));
                            expect(ordersPage.getTextBasedOnLabelName("EC2 Instance Role")).toEqual(jsonUtil.getValueEditParameter(DataPipelineINSObject, "EC2 Instance Role"));
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
