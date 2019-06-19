/*
Spec_Name: batchAccount.spec.js 
Description: This spec will cover E2E testing of Batch Account Service order submit, approve and delete.
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".   
Author: Atiksha Batra
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

    BATemplate = require('../../../../testData/OrderIntegration/Azure/BatchAccount.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Batch Account', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Azure', category: 'Compute', bluePrintName: 'Batch Account' };
    var modifiedParamMapedit = {};
    var servicename = "AutoBAsrv" + util.getRandomString(5);
    var rgName = "gslautotc_azureBARG101" + util.getRandomString(5);
    var baName = "autoba" + util.getRandomString(5);
    var saName = "autosa" + util.getRandomString(5);
    var  saNameEdit = "autosa" + util.getRandomString(5);
    baName = baName.toLowerCase();
    saName = saName.toLowerCase();
    saNameEdit = saNameEdit.toLowerCase();
    modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Batch Account Name": baName, "Storage Account Name": saName };
      

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
        rgName = "gslautotc_azureBARG101" + util.getRandomString(5);
        baName = "autoba" + util.getRandomString(5);
        saName = "autosa" + util.getRandomString(5);
        saNameEdit = "autosa" + util.getRandomString(5);
        baName = baName.toLowerCase();
        saName = saName.toLowerCase();
        saNameEdit = saNameEdit.toLowerCase();
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": rgName, "Batch Account Name": baName, "Storage Account Name": saName };
               
    });

    //E2E Batch Account order Submit, Approve, Delete Service with New Resource Group.
    if (isProvisioningRequired == "true") {
        it('Azure: TC-T491762 Verify if create new Batch Accounts with New Resource Group, New Storage Account, Batch Service Pool Allocation Mode is successful', function () {

            var orderObject = JSON.parse(JSON.stringify(BATemplate));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
             var returnObj = {};
             var returnObj1 = {};
            orderFlowUtil.fillOrderDetails(BATemplate, modifiedParamMap);

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
            // expect(inventoryPage.getTextBasedOnLabelName("Batch Account Name:")).toEqual(baName);
            // expect(inventoryPage.getTextBasedOnLabelName("Batch Account Location:")).toEqual(jsonUtil.getValue(orderObject, "Batch Account Location"));
            // expect(inventoryPage.getTextBasedOnLabelName("Storage Account Name:")).toEqual(saName);
            // expect(inventoryPage.getTextBasedOnLabelName("Storage Account:")).toEqual(jsonUtil.getValue(orderObject, "Storage Account"));
            // expect(inventoryPage.getTextBasedOnLabelName("Account Kind:")).toEqual(jsonUtil.getValue(orderObject, "Account Kind"));
            // expect(inventoryPage.getTextBasedOnLabelName("Performance:")).toEqual(jsonUtil.getValue(orderObject, "Performance"));
            // expect(inventoryPage.getTextBasedOnLabelName("Replication Type:")).toEqual(jsonUtil.getValue(orderObject, "Replication Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("Pool Allocation Mode:")).toEqual(jsonUtil.getValue(orderObject, "Pool Allocation Mode"));
            // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
            // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Location"));

            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(returnObj.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickEditServiceIcon();
            
             browser.sleep(10000);
             inventoryPage.clickNextButton();
            // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))), 20000);
            modifiedParamMapedit = { "Service Instance Name": servicename,"EditService": true,"Storage Account Name":saNameEdit };

            orderFlowUtil.fillOrderDetails(BATemplate, modifiedParamMapedit);
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

            //expect(inventoryPage.getTextBasedOnLabelName("Storage Account Name:")).toEqual(saNameEdit);
            // expect(inventoryPage.getTextBasedOnLabelName("Account Kind:")).toEqual(jsonUtil.getValueEditParameter(BATemplate, "Account Kind"));
            // expect(inventoryPage.getTextBasedOnLabelName("Replication Type:")).toEqual(jsonUtil.getValueEditParameter(BATemplate, "Replication Type"));

            returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
            orderFlowUtil.approveDeletedOrder(returnObj1);
            //orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1,'Provisioning in Progress');
            //expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Provisioning in Progress');
        });
    }

    //Checking parameters on Main Parameters page
    it('Azure: TC-T491730 verify that for Batch Accounts Service all parameters on "Main Parameters" Page are present..', function () {
        var orderObject = JSON.parse(JSON.stringify(BATemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

    });

    //Checking all parameters on Review Order Page
    it('Azure: TC-T491731 verify that for Batch Account Service all parameters on Review Order page matches with input.', function () {

        var orderObject = JSON.parse(JSON.stringify(BATemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(BATemplate, modifiedParamMap);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName("Batch Account Name:")).toEqual(baName);
        expect(placeOrderPage.getTextBasedOnLabelName("Batch Account Location:")).toEqual(jsonUtil.getValue(orderObject, "Batch Account Location"));
        expect(placeOrderPage.getTextBasedOnLabelName("Storage Account Name:")).toEqual(saName);
        expect(placeOrderPage.getTextBasedOnLabelName("Storage Account:")).toEqual(jsonUtil.getValue(orderObject, "Storage Account"));
        expect(placeOrderPage.getTextBasedOnLabelName("Account Kind:")).toEqual(jsonUtil.getValue(orderObject, "Account Kind"));
        expect(placeOrderPage.getTextBasedOnLabelName("Performance:")).toEqual(jsonUtil.getValue(orderObject, "Performance"));
        expect(placeOrderPage.getTextBasedOnLabelName("Replication Type:")).toEqual(jsonUtil.getValue(orderObject, "Replication Type"));
        expect(placeOrderPage.getTextBasedOnLabelName("Pool Allocation Mode:")).toEqual(jsonUtil.getValue(orderObject, "Pool Allocation Mode"));
        expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName("New Resource Group:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName("Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
    });



    //Checking values on View Order Details
    it('Azure: TC-T491732 verify that for Batch Account Service all values on ‘View Order Details’ page matches with input.', function () {
         var returnObj = {};
        returnObj.servicename = servicename;

        var orderObject = JSON.parse(JSON.stringify(BATemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(BATemplate, modifiedParamMap);

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
        expect(ordersPage.getTextBasedOnExactLabelName("Batch Account Name")).toEqual(baName);
        expect(ordersPage.getTextBasedOnExactLabelName("Batch Account Location")).toEqual(jsonUtil.getValue(orderObject, "Batch Account Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Storage Account Name")).toEqual(saName);
        expect(ordersPage.getTextBasedOnExactLabelName("Storage Account")).toEqual(jsonUtil.getValue(orderObject, "Storage Account"));
        expect(ordersPage.getTextBasedOnExactLabelName("Account Kind")).toEqual(jsonUtil.getValue(orderObject, "Account Kind"));
        expect(ordersPage.getTextBasedOnExactLabelName("Performance")).toEqual(jsonUtil.getValue(orderObject, "Performance"));
        expect(ordersPage.getTextBasedOnExactLabelName("Replication Type")).toEqual(jsonUtil.getValue(orderObject, "Replication Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("Pool Allocation Mode")).toEqual(jsonUtil.getValue(orderObject, "Pool Allocation Mode"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));

        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
