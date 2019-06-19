/*
Spec_Name: managedDisk.spec.js 
Description: This spec will cover E2E testing of Managed Disks service order submit, approve and delete.
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

        MDTemplate = require('../../../../testData/OrderIntegration/Azure/ManagedDisk.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Managed Disk', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Storage' };
        var modifiedParamMap = {};
        var servicename = "AutoMDsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureMDRG101" + util.getRandomString(5);
        var diskName = "autodisk" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Managed Disk Name": diskName };

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
                rgName = "gslautotc_azureMDRG101" + util.getRandomString(5);
                diskName = "autodisk" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Managed Disk Name": diskName };
        });

        //E2E ExpressRoute Managed Disk order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T366912-Sanity Verify that for Managed Disk None(empty disk), Create new Disk with New Resource Group, Standard Account Type is successful.', function () {

                        var orderObject = JSON.parse(JSON.stringify(MDTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        var returnObj = {};

                        orderFlowUtil.fillOrderDetails(MDTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Managed Disk Name:  ")).toEqual(diskName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Account Type:  ")).toEqual(jsonUtil.getValue(orderObject, "Account Type"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Source Type:  ")).toEqual(jsonUtil.getValue(orderObject, "Source Type"));
                        // expect(element(by.xpath('//*[@id="service_configurations_diskSizeGb_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Disk Size Gb"));

                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T366901 verify that for Managed Disk Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(MDTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T366902-Sanity verify that for Managed Disk Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(MDTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(MDTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Managed Disk Name:")).toEqual(diskName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Account Type:")).toEqual(jsonUtil.getValue(orderObject, "Account Type"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Source Type:")).toEqual(jsonUtil.getValue(orderObject, "Source Type"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Disk Size Gb:")).toEqual(jsonUtil.getValue(orderObject, "Disk Size Gb"));
        });


        //Checking values on View Order Details
        it('Azure: TC-T366903 verify that for Managed Disk Service all values on ‘View Order Details’ page matches with input.', function () {

                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(MDTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(MDTemplate, modifiedParamMap);

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
                expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(orderObject.provider);//Checking Provider
                //expect(ordersPage.getTextOrderStatusOrderDetails()).toBe('Approval In Progress');//Checking Order Status
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type

                //expect(ordersPage.getTextBasedOnLabelName("Total Cost")).toBe(orderObject.TotalCost);
                //Checking Service Configuration Parameters
                expect(ordersPage.getTextBasedOnLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnLabelName("Managed Disk Name")).toEqual(diskName);
                expect(ordersPage.getTextBasedOnLabelName("Account Type")).toEqual(jsonUtil.getValue(orderObject, "Account Type"));
                expect(ordersPage.getTextBasedOnLabelName("Source Type")).toEqual(jsonUtil.getValue(orderObject, "Source Type"));
                expect(ordersPage.getTextBasedOnExactLabelName("Disk Size Gb")).toEqual(jsonUtil.getValue(orderObject, "Disk Size Gb"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
