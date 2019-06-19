/*
Spec_Name: containerInstance.spec.js 
Description: This spec will cover E2E testing of Container Instance service order submit, approve and delete.
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

        CITemplate = require('../../../../testData/OrderIntegration/Azure/ContainerInstance.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Container Instance', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Compute' };
        var modifiedParamMap = {};
        var servicename = "AutoCIsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureCIRG101" + util.getRandomString(5);
        var ciName = "autoci" + util.getRandomNumber(5);
        var dnsName = "autoci" + util.getRandomNumber(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Container Name": ciName, "DNS Name Label": dnsName };
               

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
                rgName = "gslautotc_azureCIRG101" + util.getRandomString(5);
                ciName = "autoci" + util.getRandomNumber(5);
                dnsName = "autoci" + util.getRandomNumber(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Container Name": ciName, "DNS Name Label": dnsName };
                                
        });

        //E2E Container Instance order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T467502 Verify if create new Container Instance with New Resource Group, with Image for Public Registry, with Public IP with additional Ports enabled, "TCP", "Restart Policy - Always", "Environment Variables" is working fine.', function () {

                        var orderObject = JSON.parse(JSON.stringify(CITemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                     
                        var returnObj = {};

                        orderFlowUtil.fillOrderDetails(CITemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Container Name:  ")).toEqual(ciName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Container Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Container Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Container Image Type:  ")).toEqual(jsonUtil.getValue(orderObject, "Container Image Type"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Container Image:  ")).toEqual(jsonUtil.getValue(orderObject, "Container Image"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Operating System Type:  ")).toEqual(jsonUtil.getValue(orderObject, "Operating System Type"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Number Of Cores:  ")).toEqual(jsonUtil.getValue(orderObject, "Number Of Cores"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Memory (GB):  ")).toEqual(jsonUtil.getValue(orderObject, "Memory (GB)"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Public IP Address:  ")).toEqual(jsonUtil.getValue(orderObject, "Public IP Address"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" DNS Name Label:  ")).toEqual(dnsName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Port:  ")).toEqual(jsonUtil.getValue(orderObject, "Port"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Open Additional Ports:  ")).toEqual(jsonUtil.getValue(orderObject, "Open Additional Ports"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Port Protocol:  ")).toEqual(jsonUtil.getValue(orderObject, "Port Protocol"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Restart Policy:  ")).toEqual(jsonUtil.getValue(orderObject, "Restart Policy"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Environment Variable:  ")).toEqual(jsonUtil.getValue(orderObject, "Environment Variable"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Add Additional Environment Variables:  ")).toEqual(jsonUtil.getValue(orderObject, "Add Additional Environment Variables"));

                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }
        //Checking parameters on Main Parameters page
        it('Azure: TC-T467489 verify that for Container Instances Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(CITemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category


        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T467490 verify that for Container Instances Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(CITemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
               
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(CITemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Container Name:")).toEqual(ciName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Container Location:")).toEqual(jsonUtil.getValue(orderObject, "Container Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Container Image Type:")).toEqual(jsonUtil.getValue(orderObject, "Container Image Type"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Container Image:")).toEqual(jsonUtil.getValue(orderObject, "Container Image"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Operating System Type:")).toEqual(jsonUtil.getValue(orderObject, "Operating System Type"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Number Of Cores:")).toEqual(jsonUtil.getValue(orderObject, "Number Of Cores"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Memory (GB):")).toEqual(jsonUtil.getValue(orderObject, "Memory (GB)"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Public IP Address:")).toEqual(jsonUtil.getValue(orderObject, "Public IP Address"));
                expect(placeOrderPage.getTextBasedOnLabelName(" DNS Name Label:")).toEqual(dnsName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Port:")).toEqual(jsonUtil.getValue(orderObject, "Port"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Open Additional Ports:")).toEqual(jsonUtil.getValue(orderObject, "Open Additional Ports"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Port Protocol:")).toEqual(jsonUtil.getValue(orderObject, "Port Protocol"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Restart Policy:")).toEqual(jsonUtil.getValue(orderObject, "Restart Policy"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Environment Variable:")).toEqual(jsonUtil.getValue(orderObject, "Environment Variable"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Add Additional Environment Variables:")).toEqual(jsonUtil.getValue(orderObject, "Add Additional Environment Variables"));
        });


        //Checking values on View Order Details
        it('Azure: TC-T467491 verify that for Container Instance Service all values on ‘View Order Details’ page matches with input.', function () {
                
                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(CITemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(CITemplate, modifiedParamMap);

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
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
 
                //expect(ordersPage.getTextBasedOnLabelName("Total Cost")).toBe(orderObject.TotalCost);

                //Checking Service Configuration Parameters
                expect(ordersPage.getTextBasedOnLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnLabelName("Container Name")).toEqual(ciName);
                expect(ordersPage.getTextBasedOnLabelName("Container Location")).toEqual(jsonUtil.getValue(orderObject, "Container Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Container Image Type")).toEqual(jsonUtil.getValue(orderObject, "Container Image Type"));
                expect(ordersPage.getTextBasedOnExactLabelName("Container Image")).toEqual(jsonUtil.getValue(orderObject, "Container Image"));
                expect(ordersPage.getTextBasedOnLabelName("Operating System Type")).toEqual(jsonUtil.getValue(orderObject, "Operating System Type"));
                expect(ordersPage.getTextBasedOnLabelName("Number Of Cores")).toEqual(jsonUtil.getValue(orderObject, "Number Of Cores"));
                expect(ordersPage.getTextBasedOnLabelName("Memory (GB)")).toEqual(jsonUtil.getValue(orderObject, "Memory (GB)"));
                expect(ordersPage.getTextBasedOnLabelName("Public IP Address")).toEqual(jsonUtil.getValue(orderObject, "Public IP Address"));
                expect(ordersPage.getTextBasedOnLabelName("DNS Name Label")).toEqual(dnsName);
                expect(ordersPage.getTextBasedOnLabelName("Port")).toEqual(jsonUtil.getValue(orderObject, "Port"));
                expect(ordersPage.getTextBasedOnLabelName("Open Additional Ports")).toEqual(jsonUtil.getValue(orderObject, "Open Additional Ports"));
                expect(ordersPage.getTextBasedOnLabelName("Port Protocol")).toEqual(jsonUtil.getValue(orderObject, "Port Protocol"));
                expect(ordersPage.getTextBasedOnLabelName("Restart Policy")).toEqual(jsonUtil.getValue(orderObject, "Restart Policy"));
                expect(ordersPage.getTextBasedOnExactLabelName("Add Additional Environment Variables")).toEqual(jsonUtil.getValue(orderObject, "Add Additional Environment Variables"));

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
