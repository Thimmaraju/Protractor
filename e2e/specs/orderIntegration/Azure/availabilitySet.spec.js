/*
Spec_Name: Availability Set .spec.js 
Description: This spec will cover E2E testing of Availability Set  service order submit, approve and delete.
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

        AVtemplate = require('../../../../testData/OrderIntegration/Azure/av.json'),
        testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Availability Set ', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Other services' };
        var modifiedParamMap = {};
        var servicename = "AutoAVsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureAVRG101" + util.getRandomString(5);
        var avName = "autoAV" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Availability Set Name": avName };        
       

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
                rgName = "gslautotc_azureAVRG101" + util.getRandomString(5);
                avName = "autoAV" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Availability Set Name": avName };
        });

        //E2E Availability Set  order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: T368884- Verify that for Availability Set  Service,if service is created with new resource group with valid name and location,create valid Availability Set  Name and Availability Set  Location', function () {

                        var orderObject = JSON.parse(JSON.stringify(AVtemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        
                        var returnObj = {};

                        orderFlowUtil.fillOrderDetails(AVtemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName("Availability Set Name:")).toEqual(avName);
                        // expect(inventoryPage.getTextBasedOnLabelName("Availability Set Location:")).toEqual(jsonUtil.getValue(orderObject, "Availability Set Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Fault Domains:")).toEqual(jsonUtil.getValue(orderObject, "Fault Domains"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Update Domains:")).toEqual(jsonUtil.getValue(orderObject, "Update Domains"));

                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: T368860- verify that for Availability Set  Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(AVtemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: T372015- verify that for Availability Set  Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(AVtemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(AVtemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName("Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("Availability Set Name:")).toEqual(avName);
                expect(placeOrderPage.getTextBasedOnLabelName("Availability Set Location:")).toEqual(jsonUtil.getValue(orderObject, "Availability Set Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("Fault Domains:")).toEqual(jsonUtil.getValue(orderObject, "Fault Domains"));
                expect(placeOrderPage.getTextBasedOnLabelName("Update Domains:")).toEqual(jsonUtil.getValue(orderObject, "Update Domains"));
        });


        //Checking values on View Order Details
        it('Azure: T368873 verify that for Availability Set  Service all values on ‘View Order Details’ page matches with input.', function () {
               
                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(AVtemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(AVtemplate, modifiedParamMap);

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
                ordersPage.clickServiceConfigurationsTabOrderDetails();
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Name")).toEqual(avName);
                expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Location")).toEqual(jsonUtil.getValue(orderObject, "Availability Set Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Fault Domains")).toEqual(jsonUtil.getValue(orderObject, "Fault Domains"));
                expect(ordersPage.getTextBasedOnExactLabelName("Update Domains")).toEqual(jsonUtil.getValue(orderObject, "Update Domains"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
