/*
Spec_Name: sqlElasticPool.spec.js 
Description: This spec will cover E2E testing of SQL Elastic Pool Service order submit, approve and delete.
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".   
Author: Moti Prasad Ale 
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

    SQETemplate = require('../../../../testData/OrderIntegration/Azure/SqlElasticPool.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for SQL Elastic Pool Service', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap1 = {};
    var messageStrings = { providerName: 'Azure', category: 'Storage' };
    var modifiedParamMap = {};
    var servicename = "AutoSQEsrv" + util.getRandomString(5);
    var rgName, srName, epName;

    beforeAll(function () {
        ordersPage = new Orders();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
    rgName = "gslautotc_azure_sqlepRG" + util.getRandomString(5);
    srName = "sqeservername" + util.getRandomNumber(5);
    epName = "AutoRGSQE" + util.getRandomString(5);
    modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Elastic Pool Name": epName, "Server Name": srName };
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });

    //E2E SQL Elastic Pool Service order Submit, Approve, Delete Service with New resource group.
    if (isProvisioningRequired == "true") {
        it('Azure: TC-T467559 Verify that SQL Elastic Pool service is able to create, with new Resource group, new server and basic type in configure pool.', function () {

            var orderObject = JSON.parse(JSON.stringify(SQETemplate));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

            var returnObj = {};

            orderFlowUtil.fillOrderDetails(SQETemplate, modifiedParamMap);
            placeOrderPage.submitOrder();

            returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            returnObj.servicename = servicename;
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

            orderFlowUtil.approveOrder(returnObj);
            expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed');

            inventoryPage.open();
            expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

            inventoryPage.searchOrderByServiceName(returnObj.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();

            //Checking Inventory Page Service Configuration
            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group Required:  ")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group:  ")).toEqual(rgName);
            // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Server Name:  ")).toEqual(srName);
            // expect(inventoryPage.getTextBasedOnLabelName(" New Server Location:  ")).toEqual(jsonUtil.getValue(orderObject, "New Server Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Administrator Login:  ")).toEqual(jsonUtil.getValue(orderObject, "Administrator Login"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Elastic Pool Name:  ")).toEqual(epName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Pool Pricing Tier:  ")).toEqual(jsonUtil.getValue(orderObject, "Pool Pricing Tier"));
            // expect(inventoryPage.getTextBasedOnLabelName(" EDTUs:  ")).toEqual(jsonUtil.getValue(orderObject, "EDTUs"));
            // expect(element(by.xpath('//*[@id="service_configurations_storageUnit_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Max Data Size Unit"));
            // expect(element(by.xpath('//*[@id="service_configurations_storageLimit_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Max Data Size"));
            // expect(element(by.xpath('//*[@id="service_configurations_databaseDtuMax_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Per Database Max eDTUs"));
            // expect(element(by.xpath('//*[@id="service_configurations_databaseDtuMin_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Per Database Min eDTUs"));

            returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
            orderFlowUtil.approveDeletedOrder(returnObj);
            orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
        });
    }

    //Checking parameters on Main Parameters page
    it('Azure: TC-T467531 Verify that for SQL Elastic Pool, all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObject = JSON.parse(JSON.stringify(SQETemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
         catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

    });


    //Checking all parameters on Review Order Page
    it('Azure: TC-T467538 Verify that for SQL Elastic Pool Service on Review Order page, View Order Details all values matches with input.', function () {

        var orderObject = JSON.parse(JSON.stringify(SQETemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(SQETemplate, modifiedParamMap);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Server Name:")).toEqual(srName);
        expect(placeOrderPage.getTextBasedOnLabelName(" New Server Location:")).toEqual(jsonUtil.getValue(orderObject, "New Server Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Administrator Login:")).toEqual(jsonUtil.getValue(orderObject, "Administrator Login"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Elastic Pool Name:")).toEqual(epName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Pool Pricing Tier:")).toEqual(jsonUtil.getValue(orderObject, "Pool Pricing Tier"));
        expect(placeOrderPage.getTextBasedOnLabelName(" EDTUs:")).toEqual(jsonUtil.getValue(orderObject, "EDTUs"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Max Data Size Unit:")).toEqual(jsonUtil.getValue(orderObject, "Max Data Size Unit"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Max Data Size:")).toEqual(jsonUtil.getValue(orderObject, "Max Data Size"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Per Database Max eDTUs:")).toEqual(jsonUtil.getValue(orderObject, "Per Database Max eDTUs"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Per Database Min eDTUs:")).toEqual(jsonUtil.getValue(orderObject, "Per Database Min eDTUs"));
    });


    //Checking values on View Order Details
    it('Azure: TC-T475633 Verify that for SQL Elastic Pool Service on View Order page all values matches with input.', function () {
        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObject = JSON.parse(JSON.stringify(SQETemplate));

        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(SQETemplate, modifiedParamMap);

        placeOrderPage.submitOrder();

        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        ordersPage.open();
        ordersPage.searchOrderById(returnObj.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();

        //Checking Order Details in View order details
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Item ID")).toBe(returnObj.orderNumber);//Checking Order Number
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toBe(returnObj.servicename);//Checking Service Name
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(orderObject.provider);//Checking Provider
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Status")).toBe('Approval In Progress');//Checking Order Status
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
         
        //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(orderObject.TotalCost);

        //Checking Additional Parameters
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Server Name")).toEqual(srName);
        expect(ordersPage.getTextBasedOnExactLabelName("New Server Location")).toEqual(jsonUtil.getValue(orderObject, "New Server Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Administrator Login")).toEqual(jsonUtil.getValue(orderObject, "Administrator Login"));
        expect(ordersPage.getTextBasedOnExactLabelName("Elastic Pool Name")).toEqual(epName);
        expect(ordersPage.getTextBasedOnExactLabelName("Pool Pricing Tier")).toEqual(jsonUtil.getValue(orderObject, "Pool Pricing Tier"));
        expect(ordersPage.getTextBasedOnExactLabelName("EDTUs")).toEqual(jsonUtil.getValue(orderObject, "EDTUs"));
        expect(ordersPage.getTextBasedOnExactLabelName("Max Data Size Unit")).toEqual(jsonUtil.getValue(orderObject, "Max Data Size Unit"));
        expect(ordersPage.getTextBasedOnExactLabelName("Max Data Size")).toEqual(jsonUtil.getValue(orderObject, "Max Data Size"));
        expect(ordersPage.getTextBasedOnExactLabelName("Per Database Max eDTUs")).toEqual(jsonUtil.getValue(orderObject, "Per Database Max eDTUs"));
        expect(ordersPage.getTextBasedOnExactLabelName("Per Database Min eDTUs")).toEqual(jsonUtil.getValue(orderObject, "Per Database Min eDTUs"));

        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);


        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
