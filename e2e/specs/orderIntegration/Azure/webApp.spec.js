/*
Spec_Name: webApp.spec.js
Description: This spec will cover E2E testing of Web App service order submit, approve and delete.
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

        WATemplate = require('../../../../testData/OrderIntegration/Azure/WebApp.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Web App', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Network' };
        var modifiedParamMap = {};
        var servicename = "AutoWAsrv" + util.getRandomString(5);
        var rgName, waName, aspName;

        beforeAll(function () {
                ordersPage = new Orders();
                catalogPage = new CatalogPage();
                placeOrderPage = new PlaceOrderPage();
                inventoryPage = new InventoryPage();
                browser.driver.manage().window().maximize();
        });

        beforeEach(function () {
        rgName = "gslautotc_azure_waRG" + util.getRandomString(5);
        waName = "AutoWA" + util.getRandomString(5);
        aspName = "AutoASP" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "App Name": waName, "New App Service Plan": aspName };
                catalogPage.open();
                expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
                catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        });

        //E2E Web App order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-C176018 Verify if create new Web App with New Resource Group, and Linux OS with new App Service Plan is successful', function () {

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
                        // expect(inventoryPage.getTextBasedOnLabelName("App Name:")).toEqual(waName);
                        // expect(inventoryPage.getTextBasedOnLabelName("Operating System:")).toEqual(jsonUtil.getValue(waObject, "Operating System"));
                        // expect(inventoryPage.getTextBasedOnLabelName("App Service Plan:")).toEqual(jsonUtil.getValue(waObject, "App Service Plan"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New App Service Plan:")).toEqual(aspName);
                        // expect(inventoryPage.getTextBasedOnLabelName("Locations:")).toEqual(jsonUtil.getValue(waObject, "Locations"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Pricing Tier For Linux:")).toEqual(jsonUtil.getValue(waObject, "Pricing Tier For Linux"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Runtime Stack Options:")).toEqual(jsonUtil.getValue(waObject, "Runtime Stack Options"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Select Runtime Stack:")).toEqual(jsonUtil.getValue(waObject, "Select Runtime Stack"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(waObject, "New Resource Group Required"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                        // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(waObject, "Location"));


                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        //orderFlowUtil.waitForDeleteOrderStatusChange(returnObj,'Completed');
                        //expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-C175514 verify that for Web App Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var waObject = JSON.parse(JSON.stringify(WATemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(waObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(waObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(waObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(waObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(waObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-C175515 verify that for Web App Service all parameters on Review Order page matches with input.', function () {

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
                expect(placeOrderPage.getTextBasedOnLabelName("Operating System:")).toEqual(jsonUtil.getValue(waObject, "Operating System"));
                expect(placeOrderPage.getTextBasedOnLabelName("App Service Plan:")).toEqual(jsonUtil.getValue(waObject, "App Service Plan"));
                expect(placeOrderPage.getTextBasedOnLabelName("New App Service Plan:")).toEqual(aspName);
                expect(placeOrderPage.getTextBasedOnLabelName("Locations:")).toEqual(jsonUtil.getValue(waObject, "Locations"));
                expect(placeOrderPage.getTextBasedOnLabelName("Pricing Tier For Linux:")).toEqual(jsonUtil.getValue(waObject, "Pricing Tier For Linux"));
                expect(placeOrderPage.getTextBasedOnLabelName("Runtime Stack Options:")).toEqual(jsonUtil.getValue(waObject, "Runtime Stack Options"));
                expect(placeOrderPage.getTextBasedOnLabelName("Select Runtime Stack:")).toEqual(jsonUtil.getValue(waObject, "Select Runtime Stack"));
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(waObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName("Location:")).toEqual(jsonUtil.getValue(waObject, "Location"));
        });



        //Checking values on View Order Details
        it('Azure: TC-C175514 verify that for Web App Service all values on ‘View Order Details’ page matches with input.', function () {

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
                expect(ordersPage.getTextBasedOnExactLabelName("Operating System")).toEqual(jsonUtil.getValue(waObject, "Operating System"));
                expect(ordersPage.getTextBasedOnExactLabelName("App Service Plan")).toEqual(jsonUtil.getValue(waObject, "App Service Plan"));
                expect(ordersPage.getTextBasedOnExactLabelName("New App Service Plan")).toEqual(aspName);
                expect(ordersPage.getTextBasedOnExactLabelName("Locations")).toEqual(jsonUtil.getValue(waObject, "Locations"));
                expect(ordersPage.getTextBasedOnExactLabelName("Pricing Tier For Linux")).toEqual(jsonUtil.getValue(waObject, "Pricing Tier For Linux"));
                expect(ordersPage.getTextBasedOnExactLabelName("Runtime Stack Options")).toEqual(jsonUtil.getValue(waObject, "Runtime Stack Options"));
                expect(ordersPage.getTextBasedOnExactLabelName("Select Runtime Stack")).toEqual(jsonUtil.getValue(waObject, "Select Runtime Stack"));
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
