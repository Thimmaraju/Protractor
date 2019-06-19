/*
Spec_Name: expressRouteCircuit.spec.js 
Description: This spec will cover E2E testing of ExpressRoute Circuit service order submit, approve and delete.
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

        ERCTemplate = require('../../../../testData/OrderIntegration/Azure/expressrc.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for ExpressRoute Circuit', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Network' };
        var modifiedParamMap = {};
        var modifiedParamMapedit = {};
        var servicename = "AutoERCsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureERCRG101" + util.getRandomString(5);
        var ercName = "AutoERC" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Circuit Name": ercName };      

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
                rgName = "gslautotc_azureERCRG101" + util.getRandomString(5);
                ercName = "AutoERC" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Circuit Name": ercName };
        });

        //E2E ExpressRoute Circuit order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-C175460 Verify if create new ExpressRoute Circuit with New Resource Group, same RG location and Resource Location is successful', function () {

                        var ercObject = JSON.parse(JSON.stringify(ERCTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(ercObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(ercObject.bluePrintName);
                        var returnObj = {};
                        var returnObj1 = {};

                        orderFlowUtil.fillOrderDetails(ERCTemplate, modifiedParamMap);

                        placeOrderPage.submitOrder();
                        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                        returnObj.servicename = servicename;
                        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                        orderFlowUtil.approveOrder(returnObj);
                        orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed');

                        //inventoryPage.open();
                        //expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

                        //inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        //element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
                        //inventoryPage.clickViewService();

                        //Checking Inventory Page Service Configuration
                        // expect(inventoryPage.getTextBasedOnLabelName("Circuit Name:")).toEqual(ercName);
                        // expect(inventoryPage.getTextBasedOnLabelName("Circuit Location:")).toEqual(jsonUtil.getValue(ercObject, "Circuit Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Provider:")).toEqual(jsonUtil.getValue(ercObject, "Provider"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Peering Location:")).toEqual(jsonUtil.getValue(ercObject, "Peering Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Bandwidth:")).toEqual(jsonUtil.getValue(ercObject, "Bandwidth"));
                        // expect(inventoryPage.getTextBasedOnLabelName("SKU:")).toEqual(jsonUtil.getValue(ercObject, "SKU"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Billing Model:")).toEqual(jsonUtil.getValue(ercObject, "Billing Model"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Allow Classic Operations:")).toEqual(jsonUtil.getValue(ercObject, "Allow Classic Operations"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(ercObject, "New Resource Group Required"));
                        // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                        // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(ercObject, "Location"));

                        //Edit order flow
                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))),15000);
                        modifiedParamMapedit = { "Service Instance Name": servicename, "EditService": true };
                        orderFlowUtil.fillOrderDetails(ercObject, modifiedParamMapedit);
                        placeOrderPage.submitOrder();

                        returnObj1.servicename = servicename;
                        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();


                        //Open Order page and Approve Order 
                        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                        placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                        //expect(orderFlowUtil.verifyOrderType(returnObj1)).toBe('EditSOI');
                        orderFlowUtil.approveOrder(returnObj1);
                        orderFlowUtil.waitForOrderStatusChange(returnObj1, 'Completed', 50);
                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj1.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickViewService();

                        //Delete Order Flow  
                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-C175432 verify that for ExpressRoute Circuit Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var ercObject = JSON.parse(JSON.stringify(ERCTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(ercObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(ercObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(ercObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(ercObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(ercObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-C175433 verify that for ExpressRoute Circuit Service all parameters on Review Order page matches with input.', function () {
                
                var ercObject = JSON.parse(JSON.stringify(ERCTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(ercObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(ercObject.bluePrintName);
                
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(ERCTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(ercObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(ercObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(ercObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName("Circuit Name:")).toEqual(ercName);
                expect(placeOrderPage.getTextBasedOnLabelName("Circuit Location:")).toEqual(jsonUtil.getValue(ercObject, "Circuit Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("Provider:")).toEqual(jsonUtil.getValue(ercObject, "Provider"));
                expect(placeOrderPage.getTextBasedOnLabelName("Peering Location:")).toEqual(jsonUtil.getValue(ercObject, "Peering Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("Bandwidth:")).toEqual(jsonUtil.getValue(ercObject, "Bandwidth"));
                expect(placeOrderPage.getTextBasedOnLabelName("SKU:")).toEqual(jsonUtil.getValue(ercObject, "SKU"));
                expect(placeOrderPage.getTextBasedOnLabelName("Billing Model:")).toEqual(jsonUtil.getValue(ercObject, "Billing Model"));
                expect(placeOrderPage.getTextBasedOnLabelName("Allow Classic Operations:")).toEqual(jsonUtil.getValue(ercObject, "Allow Classic Operations"));
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(ercObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName("Location:")).toEqual(jsonUtil.getValue(ercObject, "Location"));
        });


        //Checking values on View Order Details
        it('Azure: TC-C175434 verify that for ExpressRoute Circuit Service all values on ‘View Order Details’ page matches with input.', function () {
                
                var returnObj = {};
                returnObj.servicename = servicename;

                var ercObject = JSON.parse(JSON.stringify(ERCTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(ercObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(ercObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(ERCTemplate, modifiedParamMap);

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
                expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(ercObject.provider);//Checking Provider
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
                //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(ercObject.bluePrintName);//Checking Service Offering Name
                //expect(ordersPage.getTextBasedOnLabelName("Total Cost")).toBe(ercObject.TotalCost);

                //Checking Service Configuration Parameters
                expect(ordersPage.getTextBasedOnLabelName("Circuit Name")).toEqual(ercName);
                expect(ordersPage.getTextBasedOnLabelName("Circuit Location")).toEqual(jsonUtil.getValue(ercObject, "Circuit Location"));
                //expect(ordersPage.getTextBasedOnExactLabelName("Provider")).toEqual(jsonUtil.getValue(ercObject, "Provider"));
                expect(ordersPage.getTextBasedOnLabelName("Peering Location")).toEqual(jsonUtil.getValue(ercObject, "Peering Location"));
                expect(ordersPage.getTextBasedOnLabelName("Bandwidth")).toEqual(jsonUtil.getValue(ercObject, "Bandwidth"));
                expect(ordersPage.getTextBasedOnLabelName("SKU")).toEqual(jsonUtil.getValue(ercObject, "SKU"));
                expect(ordersPage.getTextBasedOnLabelName("Billing Model")).toEqual(jsonUtil.getValue(ercObject, "Billing Model"));
                expect(ordersPage.getTextBasedOnLabelName("Allow Classic Operations")).toEqual(jsonUtil.getValue(ercObject, "Allow Classic Operations"));
                expect(ordersPage.getTextBasedOnLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(ercObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(ercObject, "Location"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(ercObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
