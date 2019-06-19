/*
Spec_Name: fileService.spec.js 
Description: This spec will cover E2E testing of File Service Service order submit, approve and delete.
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

    FSTemplate = require('../../../../testData/OrderIntegration/Azure/FileService.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for File Service', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap1 = {};
    var messageStrings = { providerName: 'Azure', category: 'Storage' };
    var modifiedParamMap = {};
    var servicename1 = "AutoSTsrv" + util.getRandomString(5);
    var rgName1 = "gslautotc_azureSARG101" + util.getRandomString(5);
    var SAName = "autosa" + util.getRandomNumber(5);
    var servicename = "AutoFSsrv" + util.getRandomString(5);
    var FSName = "autofsname" + util.getRandomNumber(5);
    modifiedParamMap = { "Service Instance Name": servicename, "Existing Resource Group List": rgName1, "Storage Account List": SAName, "File Share Name": FSName };
    modifiedParamMap1 = { "Service Instance Name": servicename1, "Storage Account Name": SAName, "New Resource Group": rgName1 };
   

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
        FSName = "autofsname" + util.getRandomNumber(5);
        modifiedParamMap = { "Service Instance Name": servicename, "Existing Resource Group List": rgName1, "Storage Account List": SAName, "File Share Name": FSName };
    });

    afterAll(function () {
        //Delete Storage Account Created in Prerequisite.
        var returnObj = {};
        returnObj.servicename = servicename1;
        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(returnObj);
        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');

    });


    it('Azure: Prerequisite for Storage Account: Create new Storage Account', function () {
        //Prerequisite: We need to create Storage Account, which will be used by File Service.

        var orderObject1 = JSON.parse(JSON.stringify(FSTemplate.createStorageAccount));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject1.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject1.bluePrintName);
        var returnObj1 = {};

        orderFlowUtil.fillOrderDetails(FSTemplate.createStorageAccount, modifiedParamMap1);

        placeOrderPage.submitOrder();
        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        orderFlowUtil.approveOrder(returnObj1);

        expect(orderFlowUtil.verifyOrderStatus(returnObj1)).toBe('Provisioning in Progress');
        orderFlowUtil.waitForOrderStatusChange(returnObj1, 'Completed');


    });


    //E2E File Service order Submit, Approve, Delete Service with Existing resource group.
    if (isProvisioningRequired == "true") {
        it('Azure: T444471-Verify File Storage service created, if user select existing resource group with existing storage account of General Purpose V1 storage account with Standard replication type, Virtual Network Disabled and Secure Transfer Disabled', function () {

            var orderObject = JSON.parse(JSON.stringify(FSTemplate.createFileService));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
            
            
            var returnObj = {};

            orderFlowUtil.fillOrderDetails(FSTemplate.createFileService, modifiedParamMap);
            placeOrderPage.submitOrder();

            returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            returnObj.servicename = servicename;
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

            orderFlowUtil.approveOrder(returnObj);
            //expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed', 100);

            inventoryPage.open();
            expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

            inventoryPage.searchOrderByServiceName(returnObj.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();

            //Checking Inventory Page Service Configuration
            // expect(inventoryPage.getTextBasedOnLabelName(" Existing Resource Group List:  ")).toEqual(rgName1);
            // expect(inventoryPage.getTextBasedOnLabelName(" Resource Group Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Resource Group Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Storage Account List:  ")).toEqual(SAName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Storage Account Location:  ")).toEqual(jsonUtil.getValue(orderObject, "Storage Account Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" File Share Name:  ")).toEqual(FSName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Replication Type:  ")).toEqual(jsonUtil.getValue(orderObject, "Replication Type"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Quota:  ")).toEqual(jsonUtil.getValue(orderObject, "Quota"));

            returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);

            orderFlowUtil.verifyOrderStatus(returnObj).then(function (status) {
                if (status == 'Completed') {
                    //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(returnObj);
                    orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
                }
            })
        });
    }

    //Checking parameters on Main Parameters page
    it('Azure: T444440-Verify that for File Storage, all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObject = JSON.parse(JSON.stringify(FSTemplate.createFileService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

    });


    //Checking all parameters on Review Order Page
    it('Azure: T444445-Verify that for File Storage Service Estimated Cost on ‘Review Order Details’ page matches with pricing Tier Selected.', function () {

        var orderObject = JSON.parse(JSON.stringify(FSTemplate.createFileService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        
       
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(FSTemplate.createFileService, modifiedParamMap);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName(" Existing Resource Group List:")).toEqual(rgName1);
        expect(placeOrderPage.getTextBasedOnLabelName(" Resource Group Location:")).toEqual(jsonUtil.getValue(orderObject, "Resource Group Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Storage Account List:")).toEqual(SAName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Storage Account Location:")).toEqual(jsonUtil.getValue(orderObject, "Storage Account Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" File Share Name:")).toEqual(FSName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Replication Type:")).toEqual(jsonUtil.getValue(orderObject, "Replication Type"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Quota:")).toEqual(jsonUtil.getValue(orderObject, "Quota"));


    });


    //Checking values on View Order Details
    it('Azure: T444443-Verify that for File Storage Service all values on ‘View Order Details’ page matches with input', function () {
       
        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObject = JSON.parse(JSON.stringify(FSTemplate.createFileService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(FSTemplate.createFileService, modifiedParamMap);

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
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnLabelName("Existing Resource Group List")).toEqual(rgName1);
        expect(ordersPage.getTextBasedOnLabelName("Resource Group Location")).toEqual(jsonUtil.getValue(orderObject, "Resource Group Location"));
        expect(ordersPage.getTextBasedOnLabelName("Storage Account List")).toEqual(SAName);
        expect(ordersPage.getTextBasedOnLabelName("Storage Account Location")).toEqual(jsonUtil.getValue(orderObject, "Storage Account Location"));
        expect(ordersPage.getTextBasedOnLabelName("File Share Name")).toEqual(FSName);
        expect(ordersPage.getTextBasedOnLabelName("Replication Type")).toEqual(jsonUtil.getValue(orderObject, "Replication Type"));
        expect(ordersPage.getTextBasedOnLabelName("Quota")).toEqual(jsonUtil.getValue(orderObject, "Quota"));

        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);


        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
