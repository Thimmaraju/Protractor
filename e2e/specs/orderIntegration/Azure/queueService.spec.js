/*
Spec_Name: queueService.spec.js 
Description: This spec will cover E2E testing of Queue Service order submit, approve and delete.
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".   
Author:  Nikita Sable
*/

"use strict";


var Orders = require('../../../pageObjects/orders.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    appUrls = require('../../../../testData/appUrls.json'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    EC = protractor.ExpectedConditions,

    QSTemplate = require('../../../../testData/OrderIntegration/Azure/queueService.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";
describe('Azure: Test cases for Queue Service', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMapSA = {};
    var modifiedParamMapQS = {};
    var messageStrings = { providerName: 'Azure', category: 'Storage' };
    var servicename = "AutoQSsrv" + util.getRandomString(5);
    var servicenameSA = "AutoSAsrv" + util.getRandomString(5);
    var rgName = "gslautotc_azure_qsaRG" + util.getRandomString(5);
    var saName = "autosa" + util.getRandomString(5);
    saName = saName.toLowerCase();
    var queueName;
    modifiedParamMapSA = { "Service Instance Name": servicenameSA, "New Resource Group": rgName, "Storage Account Name": saName }


    beforeAll(function () {
        ordersPage = new Orders();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
    queueName = "queue101" + util.getRandomString(5);
             queueName = queueName.toLowerCase();
    modifiedParamMapQS = { "Service Instance Name": servicename, "Existing Resource Group List": rgName, "Storage Account List": saName, "Queue Name": queueName }
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });
    afterAll(function () {
        //Delete Storage Account Created in Prerequisite.
        var returnObj = {};
        returnObj.servicename = servicenameSA;
        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(returnObj);
        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');

    });
    it('Azure: Prerequisites:   Creates storage account to be used in Queue service', function () {

        //Prerequisites:   Create storage account to be used in Queue service.

        var orderObjectSA = JSON.parse(JSON.stringify(QSTemplate.StorageAccount));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectSA.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObjectSA.bluePrintName);
        var returnObj = {};

        orderFlowUtil.fillOrderDetails(QSTemplate.StorageAccount, modifiedParamMapSA);

        placeOrderPage.submitOrder();
        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        returnObj.servicename = servicenameSA;
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        orderFlowUtil.approveOrder(returnObj);

        //expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
        orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed', 100);
    });

    if (isProvisioningRequired == "true") {
        it('Azure: T453512 - Verify for Queue Service , if service is created with select Existing RG with SA, select Storage Account (with account kind as Storage (general purpose v2)),storage Account Location, replication type as standard_LRS,Enter valid Queue Name', function () {
            var orderObjectQS = JSON.parse(JSON.stringify(QSTemplate.queueService));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectQS.Category);
            catalogPage.clickConfigureButtonBasedOnName(orderObjectQS.bluePrintName);
            var returnObj1 = {};
            orderFlowUtil.fillOrderDetails(QSTemplate.queueService, modifiedParamMapQS);

            placeOrderPage.submitOrder();

            returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            returnObj1.servicename = servicename;
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

            orderFlowUtil.approveOrder(returnObj1);
            //expect(orderFlowUtil.verifyOrderStatus(returnObj1)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(returnObj1, 'Completed', 100);

            inventoryPage.open();
            expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

            inventoryPage.searchOrderByServiceName(returnObj1.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();

            //Checking Inventory Page Service Configuration
            // expect(inventoryPage.getTextBasedOnLabelName("Existing Resource Group List: ")).toEqual(rgName);
            // expect(inventoryPage.getTextBasedOnLabelName("Resource Group Location: ")).toEqual(jsonUtil.getValue(orderObjectQS, "Resource Group Location"));
            // expect(inventoryPage.getTextBasedOnLabelName("Storage Account List: ")).toEqual(saName);
            // expect(inventoryPage.getTextBasedOnLabelName("Storage Account Location: ")).toEqual(jsonUtil.getValue(orderObjectQS, "Storage Account Location"));
            // expect(inventoryPage.getTextBasedOnLabelName("Replication Type: ")).toEqual(jsonUtil.getValue(orderObjectQS, "Replication Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("Queue Name: ")).toEqual(queueName);

            returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
            orderFlowUtil.approveDeletedOrder(returnObj1);
            orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
        });
    }


    it('Azure: T448479 Verify that for Queue Storage Service, all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObjectQS = JSON.parse(JSON.stringify(QSTemplate.queueService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectQS.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObjectQS.bluePrintName);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObjectQS.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObjectQS.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObjectQS.Category); //Checking Category

    });


    //Checking all parameters on Review Order Page
    it('Azure: T448488 Verify that for Queue Storage Service all parameters on Review Order page matches with input', function () {

        var orderObjectQS = JSON.parse(JSON.stringify(QSTemplate.queueService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectQS.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObjectQS.bluePrintName);
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(QSTemplate.queueService, modifiedParamMapQS);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObjectQS.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObjectQS.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObjectQS.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName("Existing Resource Group List:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName("Resource Group Location:")).toEqual(jsonUtil.getValue(orderObjectQS, "Resource Group Location"));
        expect(placeOrderPage.getTextBasedOnLabelName("Storage Account List:")).toEqual(saName);
        expect(placeOrderPage.getTextBasedOnLabelName("Storage Account Location:")).toEqual(jsonUtil.getValue(orderObjectQS, "Storage Account Location"));
        expect(placeOrderPage.getTextBasedOnLabelName("Replication Type:")).toEqual(jsonUtil.getValue(orderObjectQS, "Replication Type"));
        expect(placeOrderPage.getTextBasedOnLabelName("Queue Name:")).toEqual(queueName);
    });
    it('Azure: T448489 - Verify that for Queue Storage Service all values on ‘View Order Details’ page matches with input', function () {

        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObjectQS = JSON.parse(JSON.stringify(QSTemplate.queueService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectQS.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObjectQS.bluePrintName);
        orderFlowUtil.fillOrderDetails(QSTemplate.queueService, modifiedParamMapQS);

        placeOrderPage.submitOrder();
        browser.wait(EC.visibilityOf(element(by.xpath('//h2[contains(text(),"Order Submitted !")]'))), 40000);

        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        ordersPage.open();

        ordersPage.searchOrderById(returnObj.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();

        //Checking Order Details in View order details
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Item ID")).toBe(returnObj.orderNumber);//Checking Order Number
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toBe(returnObj.servicename);//Checking Service Name
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(orderObjectQS.provider);//Checking Provider
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Status")).toBe('Approval In Progress');//Checking Order Status
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
        //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(orderObjectQS.TotalCost);

        //Checking Service Configuration Parameters
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnExactLabelName("Existing Resource Group List")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Resource Group Location")).toEqual(jsonUtil.getValue(orderObjectQS, "Resource Group Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Storage Account List")).toEqual(saName);
        expect(ordersPage.getTextBasedOnExactLabelName("Storage Account Location")).toEqual(jsonUtil.getValue(orderObjectQS, "Storage Account Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Replication Type")).toEqual(jsonUtil.getValue(orderObjectQS, "Replication Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("Queue Name")).toEqual(queueName);
        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObjectQS.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
