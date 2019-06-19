/*
Spec_Name: appServicePlan.spec.js 
Description: This spec will cover E2E testing of App Service Plan service order submit, approve and delete.
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

        ASPtemplate = require('../../../../testData/OrderIntegration/Azure/asp.json'),
        testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for App Service Plan ', function () {
        var ordersPage, catalogPage, inventoryPage, placeOrderPage;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'Azure', category: 'Other services' };
        var modifiedParamMap = {};
        var servicename = "AutoASPsrv" + util.getRandomString(5);
        var rgName = "gslautotc_azureASPRG101" + util.getRandomString(5);
        var aspName = "autoASP" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "App Service Plan Name": aspName };

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
                rgName = "gslautotc_azureASPRG101" + util.getRandomString(5);
                aspName = "autoASP" + util.getRandomString(5);
                modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "App Service Plan Name": aspName };
        });

        //E2E App Service Plan  order Submit, Approve, Delete Service with New Resource Group.
        if (isProvisioningRequired == "true") {
                it('Azure: T350392-Sanity Verify that for App Service Plan  Service,if service is created with new resource group with valid name and location,create valid App Service Plan  Name and App Service Plan  Location', function () {

                        var orderObject = JSON.parse(JSON.stringify(ASPtemplate));
                        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                        
                        var returnObj = {};
                       
                        orderFlowUtil.fillOrderDetails(ASPtemplate, modifiedParamMap);

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
                        // expect(inventoryPage.getTextBasedOnLabelName("App Service Plan Name:")).toEqual(aspName);
                        // expect(inventoryPage.getTextBasedOnLabelName("Operating System:")).toEqual(jsonUtil.getValue(orderObject, "Operating System"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Use App Environment:")).toEqual(jsonUtil.getValue(orderObject, "Use App Environment"));
                        // expect(inventoryPage.getTextBasedOnLabelName("App Service Location:")).toEqual(jsonUtil.getValue(orderObject, "App Service Location"));
                        // expect(inventoryPage.getTextBasedOnLabelName("Pricing Tier:")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));

                        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                });
        }

        //Checking parameters on Main Parameters page
        it('Azure: T350413- verify that for App Service Plan  Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(ASPtemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

                // orderFlowUtil.fillPartialOrderDetails(ASPtemplate, "Main Parameters");
                expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        });

        //Checking all parameters on Review Order Page
        it('Azure: T350414-Sanity verify that for App Service Plan  Service all parameters on Review Order page matches with input.', function () {

                var orderObject = JSON.parse(JSON.stringify(ASPtemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                var returnObj = {};
                returnObj.servicename = servicename;
                orderFlowUtil.fillOrderDetails(ASPtemplate, modifiedParamMap);

                //Checking Service Details in ReviewOrder
                //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
                expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
                //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

                //Checking Additional Details in ReviewOrder
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
                expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
                expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("App Service Plan Name:")).toEqual(aspName);
                expect(placeOrderPage.getTextBasedOnLabelName("Operating System:")).toEqual(jsonUtil.getValue(orderObject, "Operating System"));
                expect(placeOrderPage.getTextBasedOnLabelName("Use App Environment:")).toEqual(jsonUtil.getValue(orderObject, "Use App Environment"));
                expect(placeOrderPage.getTextBasedOnLabelName("App Service Location:")).toEqual(jsonUtil.getValue(orderObject, "App Service Location"));
                expect(placeOrderPage.getTextBasedOnLabelName("Pricing Tier:")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));
        });


        //Checking values on View Order Details
        it('Azure: T350415- verify that for App Service Plan  Service all values on ‘View Order Details’ page matches with input.', function () {
                
                var returnObj = {};
                returnObj.servicename = servicename;

                var orderObject = JSON.parse(JSON.stringify(ASPtemplate));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                orderFlowUtil.fillOrderDetails(ASPtemplate, modifiedParamMap);

                placeOrderPage.submitOrder();
                returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                ordersPage.open();
                //browser.wait(EC.visibilityOf(element(by.css('[id^="Order_Id_"]'))), 10000);

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
                expect(ordersPage.getTextBasedOnExactLabelName("App Service Plan Name")).toEqual(aspName);
                expect(ordersPage.getTextBasedOnExactLabelName("Operating System")).toEqual(jsonUtil.getValue(orderObject, "Operating System"));
                expect(ordersPage.getTextBasedOnExactLabelName("Use App Environment")).toEqual(jsonUtil.getValue(orderObject, "Use App Environment"));
                expect(ordersPage.getTextBasedOnExactLabelName("App Service Location")).toEqual(jsonUtil.getValue(orderObject, "App Service Location"));
                expect(ordersPage.getTextBasedOnExactLabelName("Pricing Tier")).toEqual(jsonUtil.getValue(orderObject, "Pricing Tier"));


                //Checking Bill Of Material
                ordersPage.clickBillOfMaterialsTabOrderDetails();
                expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

                //Deny Order
                orderFlowUtil.denyOrder(returnObj);

        });
});
