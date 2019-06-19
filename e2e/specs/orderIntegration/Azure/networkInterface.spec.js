/*
Spec_Name: networkInterface.spec.js 
Description: This spec will cover E2E testing of Network Interface Service order submit, approve and delete.
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

    VNTemplate = require('../../../../testData/OrderIntegration/Azure/VN.json'),
    NICTemplate = require('../../../../testData/OrderIntegration/Azure/NetworkInterface.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Network Interface', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap1 = {};
    var messageStrings = { providerName: 'Azure', category: 'Storage' };
    var modifiedParamMap = {};
    var servicename1 = "AutoVNsrv" + util.getRandomString(5);
    var rgName1 = "AutoRGvn" + util.getRandomString(5);
    var vnName = "autovn" + util.getRandomString(5);
    var subnetName = "autosubnet" + util.getRandomNumber(5);
    var servicename = "AutoNICsrv" + util.getRandomString(5);
    var rgName = "gslautotc_azureRGnic" + util.getRandomString(5);
    var nsgName = "autonsg" + util.getRandomString(5);
    var ipName = "autoip" + util.getRandomString(5);
    modifiedParamMap = { "Service Instance Name": servicename, "Virtual Network List": vnName, "New Resource Group": rgName, "Subnet List": subnetName, "Network Security Group Name": nsgName, "IPv6 Name": ipName };   

    modifiedParamMap1 = { "Service Instance Name": servicename1, "Virtual Network Name": vnName, "New Resource Group": rgName1, "Subnet Name": subnetName };
    

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
        rgName = "gslautotc_azureRGnic" + util.getRandomString(5);
        nsgName = "autonsg" + util.getRandomString(5);
        ipName = "autoip" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": servicename, "Virtual Network List": vnName, "New Resource Group": rgName, "Subnet List": subnetName, "Network Security Group Name": nsgName, "IPv6 Name": ipName };
    });

    afterAll(function () {
        //Delete Virtual Network Created in Prerequisite.
        var returnObj = {};
        returnObj.servicename = servicename1;
        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(returnObj);
        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');

    });


    it('Azure: Sanity Prerequisite for Network Interface: Create new VN', function () {
        //Prerequisite: We need to create Virtual Network, which will be used by Network Interface.

        var orderObject1 = JSON.parse(JSON.stringify(VNTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject1.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject1.bluePrintName);;
        var returnObj1 = {};

        orderFlowUtil.fillOrderDetails(VNTemplate, modifiedParamMap1);

        placeOrderPage.submitOrder();
        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        orderFlowUtil.approveOrder(returnObj1);

        expect(orderFlowUtil.verifyOrderStatus(returnObj1)).toBe('Provisioning in Progress');
        orderFlowUtil.waitForOrderStatusChange(returnObj1, 'Completed');


    });


    //E2E Network Interface order Submit, Approve, Delete Service with New resource group.
    if (isProvisioningRequired == "true") {
        it('Azure: TC-C180289-Sanity Verify that for Network Interface Service,if service is created with newresource group with location, valid Network Interface name, Network Interface Location,selected VN, Subnet,Subnet Prefix ,NSG as create New ,select new NSG name', function () {

            var orderObject = JSON.parse(JSON.stringify(NICTemplate));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);;

            var returnObj = {};

            orderFlowUtil.fillOrderDetails(NICTemplate, modifiedParamMap);
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
            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group Required: ")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group: ")).toEqual(rgName);
            // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(orderObject, "Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Network Interface Name: ")).toEqual(jsonUtil.getValue(orderObject, "Network Interface Name"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Network Interface Location: ")).toEqual(jsonUtil.getValue(orderObject, "Network Interface Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Network List: ")).toEqual(vnName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Subnet List: ")).toEqual(subnetName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Address Prefix: ")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Prefix"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Private IP Address Assignment Type: ")).toEqual(jsonUtil.getValue(orderObject, "Private IP Address Assignment Type"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Private IP Address: ")).toEqual(jsonUtil.getValue(orderObject, "Private IP Address"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Create Network Security Group: ")).toEqual(jsonUtil.getValue(orderObject, "Create Network Security Group"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Network Security Group Name: ")).toEqual(nsgName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Use Private IPv6 Address: ")).toEqual(jsonUtil.getValue(orderObject, "Use Private IPv6 Address"));
            // expect(inventoryPage.getTextBasedOnLabelName(" IPv6 Name: ")).toEqual(ipName);

            returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
            orderFlowUtil.approveDeletedOrder(returnObj);
            orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');
        });
    }

    //Checking parameters on Main Parameters page
    it('Azure: TC-T404900 Verify that for Network Interface, all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObject = JSON.parse(JSON.stringify(NICTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);;

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObject.Category); //Checking Category

    });


    //Checking all parameters on Review Order Page
    it('Azure: TC-T404909-Sanity Verify that for Network Interface Service all parameters on Review Order page matches with input', function () {

        var orderObject = JSON.parse(JSON.stringify(NICTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);;
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(NICTemplate, modifiedParamMap);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Network Interface Name:")).toEqual(jsonUtil.getValue(orderObject, "Network Interface Name"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Network Interface Location:")).toEqual(jsonUtil.getValue(orderObject, "Network Interface Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Network List:")).toEqual(vnName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Subnet List:")).toEqual(subnetName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Address Prefix:")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Prefix"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Private IP Address Assignment Type:")).toEqual(jsonUtil.getValue(orderObject, "Private IP Address Assignment Type"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Private IP Address:")).toEqual(jsonUtil.getValue(orderObject, "Private IP Address"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Create Network Security Group:")).toEqual(jsonUtil.getValue(orderObject, "Create Network Security Group"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Network Security Group Name:")).toEqual(nsgName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Use Private IPv6 Address:")).toEqual(jsonUtil.getValue(orderObject, "Use Private IPv6 Address"));
        expect(placeOrderPage.getTextBasedOnLabelName(" IPv6 Name:")).toEqual(ipName);

    });


    //Checking values on View Order Details
    it('Azure: TC-T404910 Verify that for Network Interface Service all values on ‘View Order Details’ page matches with input', function () {

        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObject = JSON.parse(JSON.stringify(NICTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(NICTemplate, modifiedParamMap);

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
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(orderObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(orderObject, "Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Network Interface Name")).toEqual(jsonUtil.getValue(orderObject, "Network Interface Name"));
        expect(ordersPage.getTextBasedOnExactLabelName("Network Interface Location")).toEqual(jsonUtil.getValue(orderObject, "Network Interface Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network List")).toEqual(vnName);
        expect(ordersPage.getTextBasedOnExactLabelName("Subnet List")).toEqual(subnetName);
        expect(ordersPage.getTextBasedOnExactLabelName("Subnet Address Prefix")).toEqual(jsonUtil.getValue(orderObject, "Subnet Address Prefix"));
        expect(ordersPage.getTextBasedOnExactLabelName("Private IP Address Assignment Type")).toEqual(jsonUtil.getValue(orderObject, "Private IP Address Assignment Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("Private IP Address")).toEqual(jsonUtil.getValue(orderObject, "Private IP Address"));
        expect(ordersPage.getTextBasedOnExactLabelName("Create Network Security Group")).toEqual(jsonUtil.getValue(orderObject, "Create Network Security Group"));
        expect(ordersPage.getTextBasedOnExactLabelName("Network Security Group Name")).toEqual(nsgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Use Private IPv6 Address")).toEqual(jsonUtil.getValue(orderObject, "Use Private IPv6 Address"));
        expect(ordersPage.getTextBasedOnExactLabelName("IPv6 Name")).toEqual(ipName);

        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObject.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
