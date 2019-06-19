/*
Spec_Name: networkSecurityGroup.spec.js 
Description: This spec will cover E2E testing of Network Security Group service order submit, approve and delete.
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

        NSGTemplate = require('../../../../testData/OrderIntegration/Azure/nsg.json'),
        testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Network security Group', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Other services' };
        var modifiedParamMap = {};
        var servicename = "AutoNSGsrv" + util.getRandomString(5);
        var rgName, nsgName;

        beforeAll(function () {
                ordersPage = new Orders();
                catalogPage = new CatalogPage();
                placeOrderPage = new PlaceOrderPage();
                inventoryPage = new InventoryPage();
                browser.driver.manage().window().maximize();
        });

        beforeEach(function () {
        rgName = "gslautotc_azure_nsgRG" + util.getRandomString(5);
        nsgName = "autoNSG" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Network Security Group Name": nsgName };
                catalogPage.open();
                expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
                catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        });

        //E2E Network Security Group order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T392678 Verify that for Network Security Group Service, if service is created with new resource group with valid name and location,create valid Network Security Group Name and Network Security Group Location', function () {

                        var orderObject = JSON.parse(JSON.stringify(NSGTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                       catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                        var returnObj = {};

                        orderFlowUtil.fillOrderDetails(NSGTemplate, modifiedParamMap);

                        placeOrderPage.submitOrder();
                        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                        returnObj.servicename = servicename;
                        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                        orderFlowUtil.approveOrder(returnObj);
//                         expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Network Security Group Name:  ")).toEqual(nsgName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Network Security Group Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Network Security Group Location"));


                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T393146 verify that for Network Security Group Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(NSGTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                 catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T393250 verify that for Network Security Group Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(NSGTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(NSGTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Network Security Group Name:")).toEqual(nsgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Network Security Group Location:")).toEqual(jsonUtil.getValue(orderObject, "Network Security Group Location"));

        });


        //Checking values on View Order Details
        it('Azure: TC-T393263 verify that for Network Security Group Service all values on ‘View Order Details’ page matches with input.', function () {

                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(NSGTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(NSGTemplate, modifiedParamMap);

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
                expect(ordersPage.getTextBasedOnExactLabelName("Network Security Group Name")).toEqual(nsgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Network Security Group Location")).toEqual(jsonUtil.getValue(orderObject, "Network Security Group Location"));


                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);


                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
