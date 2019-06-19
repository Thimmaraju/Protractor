/*
Spec_Name: loadBalancerspec.js 
Description: This spec will cover E2E testing of Loadbalancer service order submit, approve, edit and delete.
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

        LBTemplate = require('../../../../testData/OrderIntegration/Azure/LoadBalancer.json'),
        testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Load Balancer', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Storage' };
        var modifiedParamMapedit = {};
        var servicename = "AutoLBsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureLBRG101" + util.getRandomString(5);
        var lbName = "autolb" + util.getRandomString(5);
        var pipName = "autopip" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Load Balancer Name": lbName, "New Public Ip Name": pipName };       

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
                rgName = "gslautotc_azureLBRG101" + util.getRandomString(5);
                lbName = "autolb" + util.getRandomString(5);
                pipName = "autopip" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Load Balancer Name": lbName, "New Public Ip Name": pipName };
        });

        //E2E ExpressRoute Load Balancer order Submit, Approve, Edit and Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: TC-T367020-Sanity Verify if create new Public LoadBalancer with New Public IP and existing Resource Group is successful', function () {

                        var orderObject = JSON.parse(JSON.stringify(LBTemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        var returnObj = {};
                        var returnObj1 = {};

                        orderFlowUtil.fillOrderDetails(LBTemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName(" Load Balancer Name:  ")).toEqual(lbName);
                        // expect(inventoryPage.getTextBasedOnLabelName(" Load Balancer Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Load Balancer Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Load Balancer Type:  ")).toEqual(jsonUtil.getValue(orderObject, "Load Balancer Type"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" SKU:  ")).toEqual(jsonUtil.getValue(orderObject, "SKU"));
                        // expect(element(by.xpath('//*[@id="service_configurations_publicIpAddressAssignment_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Public Ip Address Assignment"));
                        // expect(element(by.xpath('//*[@id="service_configurations_publicIpAddress_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Public Ip Address"));
                        // expect(element(by.xpath('//*[@id="service_configurations_newPublicIpName_value"]')).getText()).toEqual(pipName);

                        //Editing Load Balancer Service

                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))), 15000);
                        modifiedParamMapedit = { "Service Instance Name": servicename, "EditService": true };


                        orderFlowUtil.fillOrderDetails(LBTemplate, modifiedParamMapedit);
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

                        // expect(inventoryPage.getTextBasedOnLabelName(" New Public IP Name:  ")).toEqual(jsonUtil.getValueEditParameter(LBTemplate, "New Public Ip Name"));
                        // expect(inventoryPage.getTextBasedOnLabelName(" Public IP Address Assignment:  ")).toEqual(jsonUtil.getValueEditParameter(LBTemplate, "Public Ip Address Assignment"));


                        //Deleting Load Balancer Service

                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: TC-T366937 verify that for Load Balancer Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(LBTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

        });

        //Checking all parameters on Review Order Page
        it('Azure: TC-T366938-Sanity verify that for Load Balancer Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(LBTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(LBTemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Load Balancer Name:")).toEqual(lbName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Load Balancer Location:")).toEqual(jsonUtil.getValue(orderObject, "Load Balancer Location"));
                expect(placeOrderPage.getTextBasedOnLabelName(" Load Balancer Type:")).toEqual(jsonUtil.getValue(orderObject, "Load Balancer Type"));
                expect(placeOrderPage.getTextBasedOnLabelName(" SKU:")).toEqual(jsonUtil.getValue(orderObject, "SKU"));


        });


        //Checking values on View Order Details
        it('Azure: TC-T366939 verify that for Load Balancer Service all values on ‘View Order Details’ page matches with input.', function () {

                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(LBTemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(LBTemplate, modifiedParamMap);

                placeOrderPage.submitOrder();
                returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                ordersPage.open();

                ordersPage.searchOrderById(returnObj.orderNumber);
                ordersPage.clickFirstViewDetailsOrdersTable();

                //Checking Order Details in View order details
                //Checking Order Number
                //expect(ordersPage.getTextBasedOnLabelName("Order Item ID")).toBe(returnObj.orderNumber);
                expect(ordersPage.getTextOrderServiceNameOrderDetails()).toBe(returnObj.servicename);//Checking Service Name
                expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(orderObject.provider);//Checking Provider
                //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type

                //expect(ordersPage.getTextBasedOnLabelName("Total Cost")).toBe(orderObject.TotalCost);
                //Checking Service Configuration Parameters
                expect(ordersPage.getTextBasedOnLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
                expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(ordersPage.getTextBasedOnLabelName("Load Balancer Name")).toEqual(lbName);
                expect(ordersPage.getTextBasedOnLabelName("Load Balancer Location")).toEqual(jsonUtil.getValue(orderObject, "Load Balancer Location"));
                expect(ordersPage.getTextBasedOnLabelName("Load Balancer Type")).toEqual(jsonUtil.getValue(orderObject, "Load Balancer Type"));
                expect(ordersPage.getTextBasedOnLabelName("SKU")).toEqual(jsonUtil.getValue(orderObject, "SKU"));
                expect(ordersPage.getTextBasedOnExactLabelName("Public IP Address")).toEqual(jsonUtil.getValue(orderObject, "Public Ip Address"));
                expect(ordersPage.getTextBasedOnExactLabelName("Public IP Address Assignment")).toEqual(jsonUtil.getValue(orderObject, "Public Ip Address Assignment"));
                expect(ordersPage.getTextBasedOnExactLabelName("New Public IP Name")).toEqual(pipName);

                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
