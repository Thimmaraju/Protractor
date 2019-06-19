/*
Spec_Name: keyVault.spec.js 
Description: This spec will cover E2E testing of Key Vault service order submit, approve and delete.
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

        KVTemplate = require('../../../../testData/OrderIntegration/Azure/KeyVault.json'),
        testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Key Vault', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var messageStrings = { providerName: 'Azure', category: 'Network' };
        var modifiedParamMap = {};
        var servicename = "AutoKVsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureRG101" + util.getRandomString(5);
        var kvName = "AutoKV" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Key Vault Name": kvName };

        beforeAll(function () {
                ordersPage = new Orders();
                catalogPage = new CatalogPage();
                placeOrderPage = new PlaceOrderPage();
                inventoryPage = new InventoryPage();
                browser.driver.manage().window().maximize();
        });

        beforeEach(function () {
                catalogPage.open();
                expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
                catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
                rgName = "gslautotc_azureRG101" + util.getRandomString(5);
                kvName = "AutoKV" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Key Vault Name": kvName };
        });

        //E2E Key Vault order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-C175694-Sanity Verify if create new Key Vault with New Resource Group, Access Ploicy(Application) and Pricing Tier(Premium)selected is successful ', function () {

                        var kvObject = JSON.parse(JSON.stringify(KVTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(kvObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(kvObject.bluePrintName);
                        var returnObj = {};

                        orderFlowUtil.fillOrderDetails(KVTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName("Key Vault Name:")).toEqual(kvName);
                        // expect(inventoryPage.getTextBasedOnLabelName("Key Vault Location:")).toEqual(jsonUtil.getValue(kvObject, "Key Vault Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Pricing Tier:")).toEqual(jsonUtil.getValue(kvObject, "Pricing Tier"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(kvObject, "New Resource Group Required"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                        // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(kvObject, "Location"));

                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-C175667 verify that for Key Vaults Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var kvObject = JSON.parse(JSON.stringify(KVTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(kvObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(kvObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(kvObject.BasePrice); //Checking EstimatedPrice(Base Price + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(kvObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(kvObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-C175668-Sanity verify that for Key Vault Service all parameters on Review Order page matches with input.', function () {
                var kvObject = JSON.parse(JSON.stringify(KVTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(kvObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(kvObject.bluePrintName);
                
                
                
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(KVTemplate, modifiedParamMap);


                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(kvObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(kvObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(kvObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName("Key Vault Name:")).toEqual(kvName);
                expect(placeOrderPage.getTextBasedOnLabelName("Key Vault Location:")).toEqual(jsonUtil.getValue(kvObject, "Key Vault Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("Pricing Tier:")).toEqual(jsonUtil.getValue(kvObject, "Pricing Tier"));
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(kvObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName("Location:")).toEqual(jsonUtil.getValue(kvObject, "Location"));
        });

        //Checking values on View Order Details
        it('Azure: TC-C175669 verify that for Key Vault Service all values on ‘View Order Details’ page matches with input.', function () {
                
                
                var returnObj = {};
                returnObj.servicename = servicename;

                var kvObject = JSON.parse(JSON.stringify(KVTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(kvObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(kvObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(KVTemplate, modifiedParamMap);

                placeOrderPage.submitOrder();
                returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                ordersPage.open();

                ordersPage.searchOrderById(returnObj.orderNumber);
                ordersPage.clickFirstViewDetailsOrdersTable();

                //Checking Order Details in View order details
                //expect(ordersPage.getTextBasedOnLabelName("Order Item ID")).toBe(returnObj.orderNumber);//Checking Order Number
                expect(ordersPage.getTextOrderServiceNameOrderDetails()).toBe(returnObj.servicename);//Checking Service Name
                expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(kvObject.provider);//Checking Provider
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
                //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(kvObject.bluePrintName);//Checking Service Offering Name
                //expect(ordersPage.getTextBasedOnLabelName("Total Cost")).toBe(kvObject.TotalCost);

                //Checking Service Configuration Parameters
                expect(ordersPage.getTextBasedOnLabelName("Key Vault Name")).toEqual(kvName);
                expect(ordersPage.getTextBasedOnLabelName("Key Vault Location")).toEqual(jsonUtil.getValue(kvObject, "Key Vault Location"));
                expect(ordersPage.getTextBasedOnLabelName("Pricing Tier")).toEqual(jsonUtil.getValue(kvObject, "Pricing Tier"));
                expect(ordersPage.getTextBasedOnLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(kvObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(kvObject, "Location"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(kvObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);
        });
});
