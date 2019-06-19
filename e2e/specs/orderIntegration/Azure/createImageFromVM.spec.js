/*
Spec_Name: createImageFromVM.spec.js 
Description: This spec will cover E2E testing of Create Image From VM service order submit, approve and delete.
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

    IVMTemplate = require('../../../../testData/OrderIntegration/Azure/ImageFromVM.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Azure: Test cases for Image From VM', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Azure', category: 'Storage' };
    var modifiedParamMap = {};
    var modifiedParamMap1 = {};
    var servicename = "AutoIVMsrv" + util.getRandomString(5);
    var rgName = "gslautotc_azure_IFVMRG" + util.getRandomString(5);
    var vnName = "autovn" + util.getRandomString(5);
    var storageacc = "st" + util.getRandomNumber(5);
    var publicIPName = "testip" + util.getRandomString(5);
    var virtualMachineNameorder = "testVM" + util.getRandomString(5);
    var virtualMachineName = virtualMachineNameorder + "1";
    var rgName1, imageName;

    modifiedParamMap = { "Service Instance Name": servicename, "Virtual Network Name": vnName, "Diagnostics Storage Account Name": storageacc, "New Resource Group": rgName, "Public IP Address Name": publicIPName, "Virtual Machine Name": virtualMachineNameorder }

    var returnObj = {};

    beforeAll(function () {
        ordersPage = new Orders();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    afterAll(function () {

        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(returnObj);
        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Provisioning in Progress');
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Provisioning in Progress');
    });

    beforeEach(function () {
    rgName1 = "gslautotc_azure_imageRG" + util.getRandomString(5);
    imageName = "testimage" + util.getRandomString(5);
    modifiedParamMap1 = { "Service Instance Name": servicename, "New Resource Group": rgName1, "Image Name": imageName, "Resource Group For VM": rgName, "List Virtual Machines": virtualMachineName }
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });

    //Prerequisites: We need to create a Windows VM which can be used by Create Image.
    it('Azure: create a Windows VM', function () {
        var orderObject1 = JSON.parse(JSON.stringify(IVMTemplate.createWindowsVM));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject1.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject1.bluePrintName);


        orderFlowUtil.fillOrderDetails(IVMTemplate.createWindowsVM, modifiedParamMap);

        placeOrderPage.submitOrder();
        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        returnObj.servicename = servicename;
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        orderFlowUtil.approveOrder(returnObj);

        expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
        orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed', 100);

    })


    //Checking parameters on Main Parameters page
    it('Azure: TC-C178715 Verify that for Image from VM Service all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObject = JSON.parse(JSON.stringify(IVMTemplate.createImageFromVMRGNO));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

    });


    //Checking all parameters on Review Order Page
    it('Azure: TC-C178716 Verify that for Image from VM Service containing all parameters on Review Order page matches with input.', function () {

        var orderObject = JSON.parse(JSON.stringify(IVMTemplate.createImageFromVMRGNO));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(IVMTemplate.createImageFromVMRGNO, modifiedParamMap1);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName1);
        expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Resource Group For VM:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName(" List Virtual Machines:")).toEqual(virtualMachineName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Machine Location:")).toEqual(jsonUtil.getValue(orderObject, "Virtual Machine Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Delete VM After Image Creation:")).toEqual(jsonUtil.getValue(orderObject, "Delete VM After Image Creation"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Image Name:")).toEqual(imageName);
    });


    //Checking values on View Order Details
    it('Azure: TC-C178717 Verify that for Image from VM Service all values on ‘View Order Details’ page matches with input.', function () {

        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObject = JSON.parse(JSON.stringify(IVMTemplate.createImageFromVMRGNO));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(IVMTemplate.createImageFromVMRGNO, modifiedParamMap1);

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
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
         
        //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(orderObject.TotalCost);

        //Checking Service Configuration Parameters
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName1);
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Resource Group For VM")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("List Virtual Machines")).toEqual(virtualMachineName);
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Machine Location")).toEqual(jsonUtil.getValue(orderObject, "Virtual Machine Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Delete VM After Image Creation")).toEqual(jsonUtil.getValue(orderObject, "Delete VM After Image Creation"));
        expect(ordersPage.getTextBasedOnExactLabelName("Image Name")).toEqual(imageName);

        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
