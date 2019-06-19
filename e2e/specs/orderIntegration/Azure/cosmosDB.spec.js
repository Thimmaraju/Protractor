/*
Spec_Name: cosmosDB.spec.js 
Description: This spec will cover E2E testing of Cosmos DB service order submit, approve, edit and delete.
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
       
        CDBTemplate = require('../../../../testData/OrderIntegration/Azure/CosmosDB.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Cosmos DB Address', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Database' };
        var modifiedParamMaped = {};
        var servicename = "AutoCDBsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureCDB-RG101" + util.getRandomString(5);
        var acName = "autoacname" + util.getRandomNumber(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Account Name": acName };        

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
                rgName = "gslautotc_azureCDB-RG101" + util.getRandomString(5);
                acName = "autoacname" + util.getRandomNumber(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Account Name": acName };        

        });

        //E2E ExpressRoute Cosmos DB Address order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T386570 Verify for Cosmos DB service, if create SQL with new Resource Group is working fine.', function () {

                        var orderObject = JSON.parse(JSON.stringify(CDBTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                
                        var returnObj = {};
                        var returnObj1={};
                        orderFlowUtil.fillOrderDetails(CDBTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Account Name:  ")).toEqual(acName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Cosmos DB Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Cosmos DB Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" API:  ")).toEqual(jsonUtil.getValue(orderObject, "API"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Configure Virtual Network:  ")).toEqual(jsonUtil.getValue(orderObject, "Configure Virtual Network"));


                        // expect(element(by.xpath('//*[@id="service_configurations_virtualNetwork_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Virtual Network"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Network Name:  ")).toEqual(jsonUtil.getValue(orderObject, "Virtual Network Name"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Address Space:  ")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Name:  ")).toEqual(jsonUtil.getValue(orderObject, "Subnet Name"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Address Range:  ")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));

                        // edit order flow
                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))),15000);
                        modifiedParamMaped = {"Service Instance Name": servicename, "EditService": true};
                        orderFlowUtil.fillOrderDetails(CDBTemplate, modifiedParamMaped);
                        placeOrderPage.submitOrder();
                        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                        returnObj1.servicename = servicename;
                        
                        
                        //Open Order page and Approve Order 
                        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                        
                        // placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
                        placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                        //expect(orderFlowUtil.verifyOrderType(returnObj1)).toBe('EditSOI');
                        orderFlowUtil.approveOrder(returnObj1);
                        orderFlowUtil.waitForOrderStatusChange(returnObj1, "Completed", 50);
                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickViewService();

                        //expect(inventoryPage.getTextBasedOnLabelName("Configure Virtual Network")).toEqual(jsonUtil.getValueEditParameter(orderObject, "Configure Virtual Network"));
          

                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T386558 verify that for Cosmos DB Address Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(CDBTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T386559 verify that for Cosmos DB Address Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(CDBTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName); 
               
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(CDBTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Account Name:")).toEqual(acName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Cosmos DB Location:")).toEqual(jsonUtil.getValue(orderObject, "Cosmos DB Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" API:")).toEqual(jsonUtil.getValue(orderObject, "API"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Configure Virtual Network:")).toEqual(jsonUtil.getValue(orderObject, "Configure Virtual Network"));
                expect(element(by.xpath('//*[@id="virtualnetwork"]/following-sibling::span')).getText()).toEqual(jsonUtil.getValue(orderObject, "Virtual Network"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Network Name:")).toEqual(jsonUtil.getValue(orderObject, "Virtual Network Name"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Address Space:")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Name:")).toEqual(jsonUtil.getValue(orderObject, "Subnet Name"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Address Range:")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));
        });


        //Checking values on View Order Details
        it('Azure: TC-T386560 verify that for Cosmos DB Address Service all values on ‘View Order Details’ page matches with input.', function () {
        
                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(CDBTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(CDBTemplate, modifiedParamMap);

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
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
 
                //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(orderObject.TotalCost);


                //Checking Service Configuration Parameters
                ordersPage.clickServiceConfigurationsTabOrderDetails();
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Account Name")).toEqual(acName);
                expect(ordersPage.getTextBasedOnExactLabelName("Cosmos DB Location")).toEqual(jsonUtil.getValue(orderObject, "Cosmos DB Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("API")).toEqual(jsonUtil.getValue(orderObject, "API"));
                expect(ordersPage.getTextBasedOnExactLabelName("Configure Virtual Network")).toEqual(jsonUtil.getValue(orderObject, "Configure Virtual Network"));
                expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network")).toEqual(jsonUtil.getValue(orderObject, "Virtual Network"));
                expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network Name")).toEqual(jsonUtil.getValue(orderObject, "Virtual Network Name"));
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
