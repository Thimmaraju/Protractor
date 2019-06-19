/*
Spec_Name: webAppOnLinxMySql.spec.js
Description: This spec will cover E2E testing of Web App On Linux + MySQL service order submit, approve and delete.
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

        WATemplate = require('../../../../testData/OrderIntegration/Azure/WebAppOnLinuxMySql.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Web App + MySQL', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Other Services', bluePrintName: 'Web App + MySQL' };
        var modifiedParamMap = {};
        var servicename = "AutoWAsrv" + util.getRandomString(5);
        var rgName, waName, aspName, serverName, dbName;

        beforeAll(function () {
                ordersPage = new Orders();
                catalogPage = new CatalogPage();
                placeOrderPage = new PlaceOrderPage();
                inventoryPage = new InventoryPage();
                browser.driver.manage().window().maximize();
        });

        beforeEach(function () {
        rgName = "gslautotc_azure_walinRG" + util.getRandomString(5);
        waName = "AutoWA" + util.getRandomString(5);
        aspName = "AutoASP" + util.getRandomString(5);
        serverName = "autoser" + util.getRandomNumber(5);
        dbName = "AutoDB" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "App Name": waName, "New App Service Plan": aspName, "Server Name": serverName, "Database Name": dbName };
                catalogPage.open();
                expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
                catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        });

        //E2E Web App order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-C186648 Verify if create new Web App + MySQL with New Resource Group, New App Service Plan with New Server and New Database is successful', function () {

                        var waObject = JSON.parse(JSON.stringify(WATemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(waObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(waObject.bluePrintName);
                        var returnObj = {};

                        orderFlowUtil.fillOrderDetails(WATemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(waObject, "New Resource Group Required"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                        // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(waObject, "Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName("App Name:")).toEqual(waName);
                        // expect(inventoryPage.getTextBasedOnLabelName("App Service Plan:")).toEqual(jsonUtil.getValue(waObject, "App Service Plan"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New App Service Plan:")).toEqual(aspName);
                        // expect(inventoryPage.getTextBasedOnLabelName("App Service Plan Location:")).toEqual(jsonUtil.getValue(waObject, "App Service Plan Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Runtime Stack Options:")).toEqual(jsonUtil.getValue(waObject, "Runtime Stack Options"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Select Runtime Stack:")).toEqual(jsonUtil.getValue(waObject, "Select Runtime Stack"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Server Admin Login Name:")).toEqual(jsonUtil.getValue(waObject, "Server Admin Login Name"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Server Version:")).toEqual(jsonUtil.getValue(waObject, "Server Version"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Database Name:")).toEqual(dbName);


                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        //orderFlowUtil.waitForDeleteOrderStatusChange(returnObj,'Completed');
                        //expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-C186625 verify that for Web App + MySQL Service all parameters on "Main Parameters" Page are present.', function () {
                var waObject = JSON.parse(JSON.stringify(WATemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(waObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(waObject.bluePrintName);
                expect(placeOrderPage.getTextEstimatedPrice()).toBe(waObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(waObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(waObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-C186626 verify that for Web App + MySQL Service all parameters on Review Order page matches with input.', function () {

                var waObject = JSON.parse(JSON.stringify(WATemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(waObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(waObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(WATemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(waObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(waObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(waObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName("App Name:")).toEqual(waName);
                expect(placeOrderPage.getTextBasedOnLabelName("App Service Plan:")).toEqual(jsonUtil.getValue(waObject, "App Service Plan"));
                expect(placeOrderPage.getTextBasedOnLabelName("New App Service Plan:")).toEqual(aspName);
                expect(placeOrderPage.getTextBasedOnLabelName("App Service Plan Location:")).toEqual(jsonUtil.getValue(waObject, "App Service Plan Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("Runtime Stack Options:")).toEqual(jsonUtil.getValue(waObject, "Runtime Stack Options"));
                expect(placeOrderPage.getTextBasedOnLabelName("Select Runtime Stack:")).toEqual(jsonUtil.getValue(waObject, "Select Runtime Stack"));
                expect(placeOrderPage.getTextBasedOnLabelName("Server Name:")).toEqual(serverName);
                expect(placeOrderPage.getTextBasedOnLabelName("Server Admin Login Name:")).toEqual(jsonUtil.getValue(waObject, "Server Admin Login Name"));
                expect(placeOrderPage.getTextBasedOnLabelName("Server Version:")).toEqual(jsonUtil.getValue(waObject, "Server Version"));
                expect(placeOrderPage.getTextBasedOnLabelName("Compute Generation:")).toEqual(jsonUtil.getValue(waObject, "Compute Generation"));
                expect(placeOrderPage.getTextBasedOnLabelName("VCore:")).toEqual(jsonUtil.getValue(waObject, "VCore"));
                expect(placeOrderPage.getTextBasedOnLabelName("Storage (Basic):")).toEqual(jsonUtil.getValue(waObject, "Storage (Basic)"));
                expect(placeOrderPage.getTextBasedOnLabelName("Backup Retention Period:")).toEqual(jsonUtil.getValue(waObject, "Backup Retention Period"));;
                expect(placeOrderPage.getTextBasedOnLabelName("Backup Redundancy Options:")).toEqual(jsonUtil.getValue(waObject, "Backup Redundancy Options"));
                expect(placeOrderPage.getTextBasedOnLabelName("Database Name:")).toEqual(dbName);
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(waObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName("Location:")).toEqual(jsonUtil.getValue(waObject, "Location"));

        });



        //Checking values on View Order Details
        it('Azure: TC-C186627 verify that for Web App + MySQL Service all values on ‘View Order Details’ page matches with input.', function () {

                var returnObj = {};
                returnObj.servicename = servicename;

                var waObject = JSON.parse(JSON.stringify(WATemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(waObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(waObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(WATemplate, modifiedParamMap);

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
                expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(waObject.provider);//Checking Provider
                //expect(ordersPage.getTextBasedOnExactLabelName("Order Status")).toBe('Approval In Progress');//Checking Order Status
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
                // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(waObject.bluePrintName);//Checking Service Offering Name
                //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(waObject.TotalCost);


                //Checking Service Configuration Parameters
                expect(ordersPage.getTextBasedOnExactLabelName("App Name")).toEqual(waName);
                expect(ordersPage.getTextBasedOnExactLabelName("App Service Plan")).toEqual(jsonUtil.getValue(waObject, "App Service Plan"));
                expect(ordersPage.getTextBasedOnExactLabelName("New App Service Plan")).toEqual(aspName);
                expect(ordersPage.getTextBasedOnExactLabelName("App Service Plan Location")).toEqual(jsonUtil.getValue(waObject, "App Service Plan Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Runtime Stack Options")).toEqual(jsonUtil.getValue(waObject, "Runtime Stack Options"));
                expect(ordersPage.getTextBasedOnExactLabelName("Select Runtime Stack")).toEqual(jsonUtil.getValue(waObject, "Select Runtime Stack"));
                expect(ordersPage.getTextBasedOnExactLabelName("Server Admin Login Name")).toEqual(jsonUtil.getValue(waObject, "Server Admin Login Name"));
                expect(ordersPage.getTextBasedOnExactLabelName("Server Version")).toEqual(jsonUtil.getValue(waObject, "Server Version"));
                expect(ordersPage.getTextBasedOnExactLabelName("Database Name")).toEqual(dbName);
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(waObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(waObject, "Location"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(waObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
