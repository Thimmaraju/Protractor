/*
Spec_Name: notificationHub.spec.js 
Description: This spec will cover E2E testing of Notification Hub service order submit, approve, edit and delete.
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

        NHTemplate = require('../../../../testData/OrderIntegration/Azure/nh.json'),
        testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Notification Hub', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Other Services' };
        var modifiedParamMapedit = {};
        var servicename = "AutoNHsrv" + util.getRandomString(5);

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
        });

        //E2E Notification Hub order Submit, Approve, Edit,  Delete Service with new Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: T393911-Sanity Verify that for Notification Hub Service,if service is created with new resource group with valid name and location,create valid Notification Hub name enter valid Namespace Name, select Namespace Location and Pricing Tier', function () {

                        var orderObject = JSON.parse(JSON.stringify(NHTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        var returnObj = {};
                        var returnObj1 = {};
                        var rgName = "gslautotc_azure_nhRG" + util.getRandomString(5);
                        var nsName = "autoNS" + util.getRandomString(5);
                        var nhName = "autoNH" + util.getRandomString(5);
                        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Notification Hub Name": nhName, "New Namespace Name": nsName };

                        orderFlowUtil.fillOrderDetails(NHTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Notification Hub Name:  ")).toEqual(nhName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" New Namespace Name:  ")).toEqual(nsName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Namespace Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Namespace Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Namespace Pricing Tier: ")).toEqual(jsonUtil.getValue(orderObject, "Namespace Pricing Tier"));

                        //Editing Notification Hub Namespace Service

                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.sleep(10000);
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))), 20000);
                        modifiedParamMapedit = { "Service Instance Name": servicename, "EditService": true };

                        orderFlowUtil.fillOrderDetails(NHTemplate, modifiedParamMapedit);
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

                        // expect(inventoryPage.getTextBasedOnLabelName(" Namespace Pricing Tier:  ")).toEqual(jsonUtil.getValueEditParameter(NHTemplate, "Namespace Pricing Tier"));

                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T379402 verify that for Notification Hub Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(NHTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                 catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T379411-Sanity verify that for Notification Hub Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(NHTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                var rgName = "gslautotc_azure_nhRG" + util.getRandomString(5);
                var nsName = "autoNS" + util.getRandomString(5);
                var nhName = "autoNH" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Notification Hub Name": nhName, "New Namespace Name": nsName };
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(NHTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Notification Hub Name:")).toEqual(nhName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Namespace Name:")).toEqual(nsName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Namespace Location:")).toEqual(jsonUtil.getValue(orderObject, "Namespace Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Namespace Pricing Tier")).toEqual(jsonUtil.getValue(orderObject, "Namespace Pricing Tier"));
        });


        //Checking values on View Order Details
        it('Azure: TC-T379412 verify that for Notification Hub Service all values on ‘View Order Details’ page matches with input.', function () {
                var rgName = "gslautotc_azure_nhRG" + util.getRandomString(5);
                var nsName = "autoNS" + util.getRandomString(5);
                var nhName = "autoNH" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Notification Hub Name": nhName, "New Namespace Name": nsName };

                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(NHTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(NHTemplate, modifiedParamMap);

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
                expect(ordersPage.getTextBasedOnExactLabelName("Notification Hub Name")).toEqual(nhName);
                expect(ordersPage.getTextBasedOnExactLabelName("New Namespace Name")).toEqual(nsName);
                expect(ordersPage.getTextBasedOnExactLabelName("Namespace Location")).toEqual(jsonUtil.getValue(orderObject, "Namespace Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Namespace Pricing Tier")).toEqual(jsonUtil.getValue(orderObject, "Namespace Pricing Tier"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);


                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
