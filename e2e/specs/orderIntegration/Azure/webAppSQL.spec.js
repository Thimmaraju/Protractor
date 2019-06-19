/*
Spec_Name: webAppSQL.spec.js
Description: This spec will cover E2E testing of Web App with SQL service order submit, approve and delete.
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".
Author: Nikita Sable
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

    WSTemplate = require('../../../../testData/OrderIntegration/Azure/webAppSQL.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Web App + SQL', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Azure', category: 'Other Services' };
    var modifiedParamMap = {};
    var servicename = "AutoWSsrv" + util.getRandomString(5);
    var rgName, waName, aspName, dbName, svName;

    beforeAll(function () {
        ordersPage = new Orders();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
    rgName = "gslautotc_azure_wasqlRG" + util.getRandomString(5);
    waName = "AutoWA" + util.getRandomString(5);
    aspName = "AutoASP" + util.getRandomString(5);
    dbName = "AutoDB" + util.getRandomString(5);
    svName = "autoserver" + util.getRandomString(5);
          svName = svName.toLowerCase();
    modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "App Name": waName, "New App Service Plan": aspName, "Server Name": svName, "Database Name": dbName };
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });

    //E2E Web App + SQL order Submit, Approve, Delete Service with New Resource Group.
    if (isProvisioningRequired == "true") {
        it('Azure: TC-T492763 Create WebApp+SQL with New Rg and Loc,valid Web App name,use ASP new, enter ASP name,Select Region,loc,Pricing,Application Insights as yes ,Select loc,new SQL DB, Enter valid Name, Select loc ,New Server as yes ,Server Name,Admin,Pass.,DTU,MSU,MDS', function () {

            var orderObject = JSON.parse(JSON.stringify(WSTemplate));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
            var returnObj = {};

            orderFlowUtil.fillOrderDetails(WSTemplate, modifiedParamMap);
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
            // expect(inventoryPage.getTextBasedOnLabelName("App Name:")).toEqual(waName);
            // expect(inventoryPage.getTextBasedOnLabelName("App Service Plan:")).toEqual(jsonUtil.getValue(orderObject, "App Service Plan"));
            // expect(inventoryPage.getTextBasedOnLabelName("New App Service Plan:")).toEqual(aspName);
            // expect(inventoryPage.getTextBasedOnLabelName("Location Options:")).toEqual(jsonUtil.getValue(orderObject, "Location Options"));
            // expect(inventoryPage.getTextBasedOnLabelName("Regions:")).toEqual(jsonUtil.getValue(orderObject, "Regions"));
            // expect(inventoryPage.getTextBasedOnLabelName("Application Insights:")).toEqual(jsonUtil.getValue(orderObject, "Application Insights"));
            // expect(inventoryPage.getTextBasedOnLabelName("Application Insights Location:")).toEqual(jsonUtil.getValue(orderObject, "Application Insights Location"));
            // expect(inventoryPage.getTextBasedOnLabelName("Create New SQL Database:")).toEqual(jsonUtil.getValue(orderObject, "Create New SQL Database"));
            // expect(inventoryPage.getTextBasedOnLabelName("Create New SQL Server:")).toEqual(jsonUtil.getValue(orderObject, "Create New SQL Server"));
            // expect(inventoryPage.getTextBasedOnLabelName("Server Name:")).toEqual(svName);
            // expect(inventoryPage.getTextBasedOnLabelName("New Server Location:")).toEqual(jsonUtil.getValue(orderObject, "New Server Location"));
            // expect(inventoryPage.getTextBasedOnLabelName("Administrator Login:")).toEqual(jsonUtil.getValue(orderObject, "Administrator Login"));
            // expect(inventoryPage.getTextBasedOnLabelName("DTU Type:")).toEqual(jsonUtil.getValue(orderObject, "DTU Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("Max Size Unit:")).toEqual(jsonUtil.getValue(orderObject, "Max Size Unit"));
            // expect(inventoryPage.getTextBasedOnLabelName("Max Data Size:")).toEqual(jsonUtil.getValue(orderObject, "Max Data Size"));
            // expect(inventoryPage.getTextBasedOnLabelName("Database Name:")).toEqual(dbName);
            // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
            // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Location"));


            returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
            orderFlowUtil.approveDeletedOrder(returnObj);
            //orderFlowUtil.waitForDeleteOrderStatusChange(returnObj,'Completed');
            //expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
        });
    }

    //Checking parameters on Main Parameters page
    it('Azure: TC-T492811 verify that for Web App + SQL Service all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObject = JSON.parse(JSON.stringify(WSTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
         catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

    });

    //Checking all parameters on Review Order Page
    it('Azure: TC-T492823 verify that for Web App + SQL Service all parameters on Review Order page matches with input.', function () {

        var orderObject = JSON.parse(JSON.stringify(WSTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(WSTemplate, modifiedParamMap);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName("App Name:")).toEqual(waName);
        expect(placeOrderPage.getTextBasedOnLabelName("App Service Plan:")).toEqual(jsonUtil.getValue(orderObject, "App Service Plan"));
        expect(placeOrderPage.getTextBasedOnLabelName("New App Service Plan:")).toEqual(aspName);
        expect(placeOrderPage.getTextBasedOnLabelName("Location Options:")).toEqual(jsonUtil.getValue(orderObject, "Location Options"));
        expect(placeOrderPage.getTextBasedOnLabelName("Regions:")).toEqual(jsonUtil.getValue(orderObject, "Regions"));
        expect(placeOrderPage.getTextBasedOnLabelName("Application Insights:")).toEqual(jsonUtil.getValue(orderObject, "Application Insights"));
        expect(placeOrderPage.getTextBasedOnLabelName("Application Insights Location:")).toEqual(jsonUtil.getValue(orderObject, "Application Insights Location"));
        expect(placeOrderPage.getTextBasedOnLabelName("Create New SQL Database:")).toEqual(jsonUtil.getValue(orderObject, "Create New SQL Database"));
        expect(placeOrderPage.getTextBasedOnLabelName("Create New SQL Server:")).toEqual(jsonUtil.getValue(orderObject, "Create New SQL Server"));
        expect(placeOrderPage.getTextBasedOnLabelName("Server Name:")).toEqual(svName);
        expect(placeOrderPage.getTextBasedOnLabelName("New Server Location:")).toEqual(jsonUtil.getValue(orderObject, "New Server Location"));
        expect(placeOrderPage.getTextBasedOnLabelName("Administrator Login:")).toEqual(jsonUtil.getValue(orderObject, "Administrator Login"));
        expect(placeOrderPage.getTextBasedOnLabelName("DTU Type:")).toEqual(jsonUtil.getValue(orderObject, "DTU Type"));
        expect(placeOrderPage.getTextBasedOnLabelName("Max Size Unit:")).toEqual(jsonUtil.getValue(orderObject, "Max Size Unit"));
        expect(placeOrderPage.getTextBasedOnLabelName("Max Data Size:")).toEqual(jsonUtil.getValue(orderObject, "Max Data Size"));
        expect(placeOrderPage.getTextBasedOnLabelName("Database Name:")).toEqual(dbName);
        expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName("Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
    });



    //Checking values on View Order Details
    it('Azure: TC-T492824 verify that for Web App + SQL Service all values on ‘View Order Details’ page matches with input.', function () {

        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObject = JSON.parse(JSON.stringify(WSTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(WSTemplate, modifiedParamMap);

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
        expect(ordersPage.getTextBasedOnExactLabelName("App Name")).toEqual(waName);
        expect(ordersPage.getTextBasedOnExactLabelName("App Service Plan")).toEqual(jsonUtil.getValue(orderObject, "App Service Plan"));
        expect(ordersPage.getTextBasedOnExactLabelName("New App Service Plan")).toEqual(aspName);
        expect(ordersPage.getTextBasedOnExactLabelName("Location Options")).toEqual(jsonUtil.getValue(orderObject, "Location Options"));
        expect(ordersPage.getTextBasedOnExactLabelName("Regions")).toEqual(jsonUtil.getValue(orderObject, "Regions"));
        expect(ordersPage.getTextBasedOnExactLabelName("Application Insights")).toEqual(jsonUtil.getValue(orderObject, "Application Insights"));
        expect(ordersPage.getTextBasedOnExactLabelName("Application Insights Location")).toEqual(jsonUtil.getValue(orderObject, "Application Insights Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Create New SQL Database")).toEqual(jsonUtil.getValue(orderObject, "Create New SQL Database"));
        expect(ordersPage.getTextBasedOnExactLabelName("Create New SQL Server")).toEqual(jsonUtil.getValue(orderObject, "Create New SQL Server"));
        expect(ordersPage.getTextBasedOnExactLabelName("Server Name")).toEqual(svName);
        expect(ordersPage.getTextBasedOnExactLabelName("New Server Location")).toEqual(jsonUtil.getValue(orderObject, "New Server Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Administrator Login")).toEqual(jsonUtil.getValue(orderObject, "Administrator Login"));
        expect(ordersPage.getTextBasedOnExactLabelName("DTU Type")).toEqual(jsonUtil.getValue(orderObject, "DTU Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("Max Size Unit")).toEqual(jsonUtil.getValue(orderObject, "Max Size Unit"));
        expect(ordersPage.getTextBasedOnExactLabelName("Max Data Size")).toEqual(jsonUtil.getValue(orderObject, "Max Data Size"));
        expect(ordersPage.getTextBasedOnExactLabelName("Database Name")).toEqual(dbName);
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));

        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
