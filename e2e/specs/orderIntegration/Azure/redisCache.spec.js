/*
Spec_Name: redisCache.spec.js 
Description: This spec will cover testing of Redis Cache service order submit, approve and reject
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".   
Author: Nikita Sable
*/

"use strict";


var Orders = require('../../../pageObjects/orders.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    EC = protractor.ExpectedConditions,
    RCTemplate = require('../../../../testData/OrderIntegration/Azure/redisCache.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";



describe('Azure: Test cases for Redis Cache', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Azure', category: 'Databases' };
    var servicename = "AutoRCsrv" + util.getRandomString(5);
    var rgName, rcName;

    beforeAll(function () {
        ordersPage = new Orders();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
    rgName = "gslautotc_azure_rcRG" + util.getRandomString(5);
    rcName = "autoRC" + util.getRandomString(5);
    modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Redis Cache Name": rcName };
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });


    //Checking parameters on Main Parameters page
    it('Azure: TC-T495406 verify that for Redis Cache Service all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObject = JSON.parse(JSON.stringify(RCTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

    });

    //Checking all parameters on Review Order Page
    it('Azure: TC-T495407 verify that for Redis Cache Service all parameters on Review Order page matches with input.', function () {

        var orderObject = JSON.parse(JSON.stringify(RCTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        var returnObj = {};
        returnObj.servicename = servicename;

        orderFlowUtil.fillOrderDetails(RCTemplate, modifiedParamMap);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Redis Cache Name:")).toEqual(rcName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Redis Cache Location:")).toEqual(jsonUtil.getValue(orderObject, "Redis Cache Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Pricing Tier:")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));


    });


    //Checking values on View Order Details
    it('Azure: TC-T495408 verify that for Redis Cache Service all values on ‘View Order Details’ page matches with input.', function () {

        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObject = JSON.parse(JSON.stringify(RCTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(RCTemplate, modifiedParamMap);

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

        //Checking Service Configuration Parameters
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Redis Cache Name")).toEqual(rcName);
        expect(ordersPage.getTextBasedOnExactLabelName("Redis Cache Location")).toEqual(jsonUtil.getValue(orderObject, "Redis Cache Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Pricing Tier")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));



        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
