/*
Spec_Name: publicIP.spec.js 
Description: This spec will cover E2E testing of Public IPv4 Address service order submit, approve and delete.
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

        PIPTemplate = require('../../../../testData/OrderIntegration/Azure/PublicIP.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Public IP Address', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Storage' };
        var modifiedParamMap = {};
        var modifiedParamMapedit = {};
        
        var servicename = "AutoPIPsrv" + util.getRandomString(5);
        var rgName, pipName, dnsName;

        beforeAll(function () {
                ordersPage = new Orders();
                catalogPage = new CatalogPage();
                placeOrderPage = new PlaceOrderPage();
                inventoryPage = new InventoryPage();
                browser.driver.manage().window().maximize();
        });

        beforeEach(function () {
        rgName = "gslautotc_azure_pipRG" + util.getRandomString(5);
        pipName = "autopip" + util.getRandomString(5);
        dnsName = "autodns" + util.getRandomNumber(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Public IP Address Name": pipName, "DNS Name Label": dnsName };
                catalogPage.open();
                expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
                catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        });

        //E2E ExpressRoute Public IP Address order Submit, Approve, Delete Service with New Resource Group.
if(isProvisioningRequired== "true"){       
                it('Azure: TC-T366918 Verify if able to create Static IPv4 Public IP Address with New Resource group', function () {

                        var orderObject = JSON.parse(JSON.stringify(PIPTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        var returnObj = {};
                        var returnObj1 ={};
                        orderFlowUtil.fillOrderDetails(PIPTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Public IP Address Name:  ")).toEqual(pipName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Public IP Address Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Public IP Address Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" IP Version:  ")).toEqual(jsonUtil.getValue(orderObject, "IP Version"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" IP Address Assignment Type:  ")).toEqual(jsonUtil.getValue(orderObject, "IP Address Assignment Type"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Idle Timeout:  ")).toEqual(jsonUtil.getValue(orderObject, "Idle Timeout"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" DNS Name Label:  ")).toEqual(dnsName);
        // edit order flow

                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))),15000);
                        modifiedParamMapedit = { "Service Instance Name": servicename, "EditService": true };
                        orderFlowUtil.fillOrderDetails(PIPTemplate, modifiedParamMapedit);
                        placeOrderPage.submitOrder();
                        
                        returnObj1.servicename = servicename;
                        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();



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
                        // expect(inventoryPage.getTextBasedOnLabelName("IP Address Assignment Type")).toEqual(jsonUtil.getValueEditParameter(PIPTemplate, "IP Address Assignment Type"));


                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                });
        }
        //Checking parameters on Main Parameters page
        it('Azure: TC-T367005 verify that for Public IP Address Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(PIPTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T367006 verify that for Public IP Address Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(PIPTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(PIPTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Public IP Address Name:")).toEqual(pipName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Public IP Address Location:")).toEqual(jsonUtil.getValue(orderObject, "Public IP Address Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" IP Version:")).toEqual(jsonUtil.getValue(orderObject, "IP Version"));
                expect(placeOrderPage.getTextBasedOnLabelName(" IP Address Assignment Type:")).toEqual(jsonUtil.getValue(orderObject, "IP Address Assignment Type"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Idle Timeout:")).toEqual(jsonUtil.getValue(orderObject, "Idle Timeout"));
                expect(placeOrderPage.getTextBasedOnLabelName(" DNS Name Label:")).toEqual(dnsName);
        });


        //Checking values on View Order Details
        it('Azure: TC-T367007 verify that for Public IP Address Service all values on ‘View Order Details’ page matches with input.', function () {

                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(PIPTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(PIPTemplate, modifiedParamMap);

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
                //expect(ordersPage.getTextOrderStatusOrderDetails()).toBe('Approval In Progress');//Checking Order Status
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
 
                //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(orderObject.TotalCost);

                //Checking Service Configuration Parameters
                expect(ordersPage.getTextBasedOnLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnLabelName("Public IP Address Name")).toEqual(pipName);
                expect(ordersPage.getTextBasedOnLabelName("Public IP Address Location")).toEqual(jsonUtil.getValue(orderObject, "Public IP Address Location"));
                expect(ordersPage.getTextBasedOnLabelName("IP Version")).toEqual(jsonUtil.getValue(orderObject, "IP Version"));
                expect(ordersPage.getTextBasedOnLabelName("IP Address Assignment Type")).toEqual(jsonUtil.getValue(orderObject, "IP Address Assignment Type"));
                expect(ordersPage.getTextBasedOnLabelName("Idle Timeout")).toEqual(jsonUtil.getValue(orderObject, "Idle Timeout"));
                expect(ordersPage.getTextBasedOnLabelName("DNS Name Label")).toEqual(dnsName);

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
