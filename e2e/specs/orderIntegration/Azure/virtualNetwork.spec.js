/*
Spec_Name: virtualNetwork.spec.js 
Description: This spec will cover E2E testing of Virtual Network service order submit, approve, edit and delete.
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

        VNTemplate = require('../../../../testData/OrderIntegration/Azure/VN.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Virtual Network', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Network' };
        var modifiedParamMapedit = {};
        var servicename = "AutoVNsrv" + util.getRandomString(5);
        var rgName, vnName, subName;

        beforeAll(function () {
                ordersPage = new Orders();
                catalogPage = new CatalogPage();
                placeOrderPage = new PlaceOrderPage();
                inventoryPage = new InventoryPage();
                browser.driver.manage().window().maximize();
        });

        beforeEach(function () {
        rgName = "gslautotc_azure_vnRG" + util.getRandomString(5);
        vnName = "autovn" + util.getRandomString(5);
        subName = "autosub" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Virtual Network Name": vnName, "Subnet Name": subName };
                catalogPage.open();
                expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
                catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        });

        //E2E ExpressRoute Virtual Network order Submit, Approve, Edit and Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T475422 Verify that for Virtual Network, create new Virtual Network with New Resource Group is working fine', function () {

                        var orderObject = JSON.parse(JSON.stringify(VNTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                         catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        var returnObj = {};
                        var returnObj1 = {};

                        orderFlowUtil.fillOrderDetails(VNTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Network Name:  ")).toEqual(vnName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Network Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Virtual Network Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Address Space:  ")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Name:  ")).toEqual(subName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Address Range:  ")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" DDoS Protection:  ")).toEqual(jsonUtil.getValue(orderObject, "DDoS Protection"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Service Endpoints:  ")).toEqual(jsonUtil.getValue(orderObject, "Service Endpoints"));

                        //Editing Virtual Network Service

                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))),15000);
                        modifiedParamMapedit = { "Service Instance Name": servicename, "EditService": true };
                        

                        orderFlowUtil.fillOrderDetails(VNTemplate, modifiedParamMapedit);
                        placeOrderPage.submitOrder();

                        returnObj1.servicename = servicename;
                        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

                        //Get details on pop up after submit
                        var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                        var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
                        var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();


                        //Open Order page and Approve Order 
                        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

                        // placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
                        placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                        //expect(orderFlowUtil.verifyOrderType(returnObj1)).toBe('EditSOI');
                        orderFlowUtil.approveOrder(returnObj1);
                        orderFlowUtil.waitForOrderStatusChange(returnObj1, "Completed", 50);
                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj1.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickViewService();

                        // expect(inventoryPage.getTextBasedOnLabelName("Service Endpoints")).toEqual(jsonUtil.getValueEditParameter(VNTemplate, "Service Endpoints"));


                        //Deleting Virtual Network Service


                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T466501 verify that for Virtual Network Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(VNTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                 catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });


        //Checking all parameters on Review Order Page
        it('Azure: TC-T466502 verify that for Virtual Network Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(VNTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                 catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(VNTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Network Name:")).toEqual(vnName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Network Location:")).toEqual(jsonUtil.getValue(orderObject, "Virtual Network Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Address Space:")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Name:")).toEqual(subName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Address Range:")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));
                expect(placeOrderPage.getTextBasedOnLabelName(" DDoS Protection:")).toEqual(jsonUtil.getValue(orderObject, "DDoS Protection"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Service Endpoints:")).toEqual(jsonUtil.getValue(orderObject, "Service Endpoints"));
        });


        //Checking values on View Order Details
        it('Azure: TC-T466503 verify that for Virtual Network Service all values on ‘View Order Details’ page matches with input.', function () {

                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(VNTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(VNTemplate, modifiedParamMap);

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
                expect(ordersPage.getTextBasedOnLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnLabelName("Virtual Network Name")).toEqual(vnName);
                expect(ordersPage.getTextBasedOnLabelName("Virtual Network Location")).toEqual(jsonUtil.getValue(orderObject, "Virtual Network Location"));
                expect(ordersPage.getTextBasedOnLabelName("Address Space")).toEqual(jsonUtil.getValue(orderObject, "Address Space"));
                expect(ordersPage.getTextBasedOnLabelName("Subnet Name")).toEqual(subName);
                expect(ordersPage.getTextBasedOnLabelName("Subnet Address Range")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Range"));
                expect(ordersPage.getTextBasedOnLabelName("DDoS Protection")).toEqual(jsonUtil.getValue(orderObject, "DDoS Protection"));
                expect(ordersPage.getTextBasedOnExactLabelName("Service Endpoints")).toEqual(jsonUtil.getValue(orderObject, "Service Endpoints"));
                // expect(ordersPage.getTextBasedOnExactLabelName("Services")).toEqual("Microsoft.Storage,Microsoft.Sql,Microsoft.AzureCosmosDB,Microsoft.KeyVault,Microsoft.EventHub,Microsoft.ServiceBus");

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
