/*
Spec_Name: eventHub.spec.js 
Description: This spec will cover E2E testing of Event Hub service order submit, approve and delete.
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

        EHTemplate = require('../../../../testData/OrderIntegration/Azure/eh.json'),
        testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Event Hub', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var modifiedParamMapedit = {};
        var messageStrings = { providerName: 'Azure', category: 'Other Services' };
        var modifiedParamMap = {};
        var servicename = "AutoEHsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureEHRG101" + util.getRandomString(5);
        var ehName = "autoEH" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Event Hub Namespace Name": ehName };
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
                rgName = "gslautotc_azureEHRG101" + util.getRandomString(5);
                ehName = "autoEH" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Event Hub Namespace Name": ehName };
        });

        //E2E Event Hub order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T395401 Verify if Event Hub with new resource group, Standard pricing tier, valid throughput units, enabled auto-inflate and valid "specify_upper_limit" is created successfully', function () {

                        var orderObject = JSON.parse(JSON.stringify(EHTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        var returnObj = {};
                        var returnObj1 = {};
                        

                        orderFlowUtil.fillOrderDetails(EHTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Event Hub Namespace Name:  ")).toEqual(ehName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Event Hub Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Event Hub Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Pricing Tier:  ")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Throughput Units:  ")).toEqual(jsonUtil.getValue(orderObject, "Throughput Units"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Enable Auto Inflate:  ")).toEqual(jsonUtil.getValue(orderObject, "Enable Auto Inflate"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Specify Upper Limit:  ")).toEqual(jsonUtil.getValue(orderObject, "Specify Upper Limit"));
                 

                        //Edit order flow
                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))),15000);
                        modifiedParamMapedit = { "Service Instance Name": servicename, "EditService": true };
                        orderFlowUtil.fillOrderDetails(EHTemplate, modifiedParamMapedit);
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

                        // expect(inventoryPage.getTextBasedOnLabelName("Throughput Units")).toEqual(jsonUtil.getValueEditParameter(EHTemplate, "Throughput Units"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Specify Upper Limit")).toEqual(jsonUtil.getValueEditParameter(EHTemplate, "Specify Upper Limit"));

                        //Delete Order Flow  
                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T383471 verify that for Event Hub Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(EHTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T383519 verify that for Event Hub Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(EHTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
               
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(EHTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Event Hub Namespace Name:")).toEqual(ehName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Event Hub Namespace Location:")).toEqual(jsonUtil.getValue(orderObject, "Event Hub Namespace Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Pricing Tier:")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Throughput Units:")).toEqual(jsonUtil.getValue(orderObject, "Throughput Units"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Enable Auto Inflate:")).toEqual(jsonUtil.getValue(orderObject, "Enable Auto Inflate"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Specify Upper Limit:")).toEqual(jsonUtil.getValue(orderObject, "Specify Upper Limit"));
        });


        //Checking values on View Order Details
        it('Azure: TC-T383495 verify that for Event Hub Service all values on ‘View Order Details’ page matches with input.', function () {
                
                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(EHTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(EHTemplate, modifiedParamMap);

                placeOrderPage.submitOrder();
                returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                ordersPage.open();

                ordersPage.searchOrderById(returnObj.orderNumber);
                ordersPage.clickFirstViewDetailsOrdersTable();

                //Checking Order Details in View order details
                //expect(ordersPage.getTextBasedOnLabelName("Order Item ID")).toBe(returnObj.orderNumber);//Checking Order Number
                expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(orderObject.provider);//Checking Provider
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
 
                //expect(ordersPage.getTextBasedOnLabelName("Total Cost")).toBe(orderObject.TotalCost);


                //Checking Service Configuration Parameters
                ordersPage.clickServiceConfigurationsTabOrderDetails();
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Event Hub Namespace Name")).toEqual(ehName);
                expect(ordersPage.getTextBasedOnExactLabelName("Event Hub Namespace Location")).toEqual(jsonUtil.getValue(orderObject, "Event Hub Namespace Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Pricing Tier")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));
                expect(ordersPage.getTextBasedOnExactLabelName("Throughput Units")).toEqual(jsonUtil.getValue(orderObject, "Throughput Units"));
                expect(ordersPage.getTextBasedOnExactLabelName("Enable Auto Inflate")).toEqual(jsonUtil.getValue(orderObject, "Enable Auto Inflate"));
                expect(ordersPage.getTextBasedOnExactLabelName("Specify Upper Limit")).toEqual(jsonUtil.getValue(orderObject, "Specify Upper Limit"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                //expect(placeOrderPage.getTextBasedOnLabelName(" TOTAL COST ")).toBe(orderObject.TotalCost);
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
