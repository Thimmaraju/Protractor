/*
Spec_Name: storageAccount.spec.js 
Description: This spec will cover E2E testing of Storage Account service order submit, approve and delete.
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

        SATemplate = require('../../../../testData/OrderIntegration/Azure/StorageAccount.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Storage Account', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Storage' };
        var modifiedParamMap = {};
        var servicename = "AutoStrsrv" + util.getRandomString(5);
        var rgName, saName, vnName;

        beforeAll(function () {
                ordersPage = new Orders();
                catalogPage = new CatalogPage();
                placeOrderPage = new PlaceOrderPage();
                inventoryPage = new InventoryPage();
                browser.driver.manage().window().maximize();
        });

        beforeEach(function () {
        rgName = "gslautotc_azure_saRG" + util.getRandomString(5);
        saName = "autosa" + util.getRandomNumber(5);
        vnName = "autovn" + util.getRandomString(5);
         
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Storage Account Name":saName, "Virtual Network Name": vnName };
                catalogPage.open();
                expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
                catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        });

        //E2E ExpressRoute Storage Account order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T367022-Sanity Verify if Create Blob Storage account with new resource group, Locally-Redundant-Storage replication type, Virtaul Network Enabled, Secure Transfer Enabled and Access Tier Cool is working fine', function () {

                        var orderObject = JSON.parse(JSON.stringify(SATemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        var returnObj = {};
                        var returnObj1 = {};
                        var modifiedParamMapedit = {};

                        orderFlowUtil.fillOrderDetails(SATemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Storage Account Name:  ")).toEqual(saName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Performance:  ")).toEqual(jsonUtil.getValue(orderObject, "Performance"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Storage Account Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Storage Account Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Account Kind:  ")).toEqual(jsonUtil.getValue(orderObject, "Account Kind"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Select Replication Type:  ")).toEqual(jsonUtil.getValue(orderObject, "Select Replications"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Secure Transfer Required:  ")).toEqual(jsonUtil.getValue(orderObject, "Secure Transfer Required"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Configure Virtual Network:  ")).toEqual(jsonUtil.getValue(orderObject, "Configure Virtual Networks"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Network Name:  ")).toEqual(vnName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Address Space:  ")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Name:  ")).toEqual(jsonUtil.getValue(orderObject, "Subnet Name"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Address Range:  ")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));


                        modifiedParamMapedit = { "Service Instance Name": servicename, "EditService": true };
                        
                        orderFlowUtil.editService(returnObj);
                        orderFlowUtil.fillOrderDetails(SATemplate, modifiedParamMapedit);
                        placeOrderPage.submitOrder();
                        
                        returnObj1.servicename = servicename;
                        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();


                        //Open Order page and Approve Order 
                        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

                        placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                        orderFlowUtil.approveOrder(returnObj1);
                        orderFlowUtil.waitForOrderStatusChange(returnObj1, "Completed", 50);

                        
                        //Delete Order Flow
                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T366858 verify that for Storage Account Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(SATemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                 catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });


        //Checking all parameters on Review Order Page
        it('Azure: TC-T366859-Sanity verify that for Storage Account Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(SATemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(SATemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Storage Account Name:")).toEqual(saName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Performance:")).toEqual(jsonUtil.getValue(orderObject, "Performance"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Storage Account Location:")).toEqual(jsonUtil.getValue(orderObject, "Storage Account Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Account Kind:")).toEqual(jsonUtil.getValue(orderObject, "Account Kind"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Select Replication Type:")).toEqual(jsonUtil.getValue(orderObject, "Select Replications"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Secure Transfer Required:")).toEqual(jsonUtil.getValue(orderObject, "Secure Transfer Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Configure Virtual Network:")).toEqual(jsonUtil.getValue(orderObject, "Configure Virtual Networks"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Network Name:")).toEqual(vnName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Address Space:")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Name:")).toEqual(jsonUtil.getValue(orderObject, "Subnet Name"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Address Range:")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));
        });


        //Checking values on View Order Details
        it('Azure: TC-T366860 verify that for Storage Account Service all values on ‘View Order Details’ page matches with input.', function () {

                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(SATemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(SATemplate, modifiedParamMap);

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
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Storage Account Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Storage Account Name")).toEqual(saName);
                expect(ordersPage.getTextBasedOnExactLabelName("Performance")).toEqual(jsonUtil.getValue(orderObject, "Performance"));
                expect(ordersPage.getTextBasedOnExactLabelName("Storage Account Location")).toEqual(jsonUtil.getValue(orderObject, "Storage Account Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Account Kind")).toEqual(jsonUtil.getValue(orderObject, "Account Kind"));
                expect(ordersPage.getTextBasedOnExactLabelName("Select Replication Type")).toEqual(jsonUtil.getValue(orderObject, "Select Replications"));
                expect(ordersPage.getTextBasedOnExactLabelName("Secure Transfer Required")).toEqual(jsonUtil.getValue(orderObject, "Secure Transfer Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("Configure Virtual Network")).toEqual(jsonUtil.getValue(orderObject, "Configure Virtual Networks"));
                expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network Name")).toEqual(vnName);
                expect(ordersPage.getTextBasedOnExactLabelName("Address Space")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                expect(ordersPage.getTextBasedOnExactLabelName("Subnet Name")).toEqual(jsonUtil.getValue(orderObject, "Subnet Name"));
                expect(ordersPage.getTextBasedOnExactLabelName("Subnet Address Range")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
