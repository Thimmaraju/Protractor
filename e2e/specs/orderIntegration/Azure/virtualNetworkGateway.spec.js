/*
Spec_Name: Virtual Network Gateway.spec.js 
Description: This spec will cover E2E testing of Virtual Network Gateway Service order submit, approve and delete.
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".   
Author:  Nikita Sable
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

    VNGTemplate = require('../../../../testData/OrderIntegration/Azure/VirtualNetworkGateway.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";
describe('Azure: Test cases for  Virtual Network Gateway Service', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMapVN = {};
    var modifiedParamMapVNG = {};
    var messageStrings = { providerName: 'Azure', category: 'Storage' };
    var servicename = "AutoVNGsrv" + util.getRandomString(5);
    var servicenameVN = "AutoVNsrv" + util.getRandomString(5);
    var rgName = "gslautotc_azure_vngRG" + util.getRandomString(5);
    var vnName = "autovn" + util.getRandomString(5);
        vnName = vnName.toLowerCase();
    var vngName, ipName;
    modifiedParamMapVN = { "Service Instance Name": servicenameVN, "New Resource Group": rgName, "Virtual Network Name": vnName }


    beforeAll(function () {
        ordersPage = new Orders();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
    vngName = "vng101" + util.getRandomString(5);
          vngName = vngName.toLowerCase();
    ipName = "ipName101" + util.getRandomString(5);
    modifiedParamMapVNG = { "Service Instance Name": servicename, "Existing Resource Group List": rgName, "Virtual Network List": vnName, "Virtual Network Gateway Name": vngName, "New Public IP Name": ipName }
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });
    afterAll(function () {
        //Delete Virtual Netwaaork Created in Prerequisite.
        var returnObj = {};
        returnObj.servicename = servicenameVN;
        returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(returnObj);
        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Completed');
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj)).toBe('Completed');

    });
    it('Azure: Prerequisites:   Creates Virtual Network to be used in Virtual Network Gateway service', function () {

        //Prerequisites:   Create Virtual Network to be used in Virtual Network Gateway service.

        var orderObjectVN = JSON.parse(JSON.stringify(VNGTemplate.VirtualNetwork));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectVN.Category);
         catalogPage.clickConfigureButtonBasedOnName(orderObjectVN.bluePrintName);
        var returnObj = {};

        orderFlowUtil.fillOrderDetails(VNGTemplate.VirtualNetwork, modifiedParamMapVN);

        placeOrderPage.submitOrder();
        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        returnObj.servicename = servicenameVN;
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        orderFlowUtil.approveOrder(returnObj);

        expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
        orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed', 100);
    });

    if (isProvisioningRequired == "true") {
        it(' Azure: T526333- Verify for Virtual Network Gateway Service , if service is created with select Existing RG with SA, select Storage Account (with account kind as Storage (general purpose v2)),storage Account Location, replication type as standard_LRS,Enter valid Virtual Network Gateway Name', function () {
            var orderObjectVNG = JSON.parse(JSON.stringify(VNGTemplate.VNGService));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectVNG.Category);
            catalogPage.clickConfigureButtonBasedOnName(orderObjectVNG.bluePrintName);
            var returnObj1 = {};
            orderFlowUtil.fillOrderDetails(VNGTemplate.VNGService, modifiedParamMapVNG);

            placeOrderPage.submitOrder();

            returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            returnObj1.servicename = servicename;
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

            orderFlowUtil.approveOrder(returnObj1);
            expect(orderFlowUtil.verifyOrderStatus(returnObj1)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(returnObj1, 'Completed', 100);

            inventoryPage.open();
            expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

            inventoryPage.searchOrderByServiceName(returnObj1.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();

            //Checking Inventory Page Service Configuration
            // expect(inventoryPage.getTextBasedOnLabelName("Existing Resource Group List: ")).toEqual(rgName);
            // expect(inventoryPage.getTextBasedOnLabelName("Resource Group Location: ")).toEqual(jsonUtil.getValue(orderObjectVNG, "Resource Group Location"));
            // expect(inventoryPage.getTextBasedOnLabelName("Virtual Network Gateway Name: ")).toEqual(vngName);
            // expect(inventoryPage.getTextBasedOnLabelName("Gateway Type: ")).toEqual(jsonUtil.getValue(orderObjectVNG, "Gateway Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("VPN Type: ")).toEqual(jsonUtil.getValue(orderObjectVNG, "VPN Type"));
            // expect(element(by.xpath('//*[@id="service_configurations_sku_value"]')).getText()).toEqual(jsonUtil.getValue(orderObjectVNG, "SKU"));
            // expect(inventoryPage.getTextBasedOnLabelName("Virtual Network List: ")).toEqual(vnName);
            // expect(inventoryPage.getTextBasedOnLabelName("Gateway Subnet Address Range: ")).toEqual(jsonUtil.getValue(orderObjectVNG, "Gateway Subnet Address Range"));
            // expect(inventoryPage.getTextBasedOnLabelName("Public IP Address Configuration: ")).toEqual(jsonUtil.getValue(orderObjectVNG, "Public IP Address Configuration"));
            // expect(inventoryPage.getTextBasedOnLabelName("New Public IP Name: ")).toEqual(ipName);
            returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
            orderFlowUtil.verifyOrderStatus(returnObj1).then(function (status) {
                if (status == 'Completed') {
                    //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(returnObj1);
                    orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed', 150);
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
                }
            })
        });
    }


    it('Azure: T526315 Verify that for Virtual Network Gateway Storage Service, all parameters on ‘Main Parameters’ Page are present.', function () {
        var orderObjectVNG = JSON.parse(JSON.stringify(VNGTemplate.VNGService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectVNG.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObjectVNG.bluePrintName);

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObjectVNG.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(orderObjectVNG.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(orderObjectVNG.Category); //Checking Category

    });


    //Checking all parameters on Review Order Page
    it('Azure: T526324 Verify that for Virtual Network Gateway Service all parameters on Review Order page matches with input', function () {

        var orderObjectVNG = JSON.parse(JSON.stringify(VNGTemplate.VNGService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectVNG.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObjectVNG.bluePrintName);
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(VNGTemplate.VNGService, modifiedParamMapVNG);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(orderObjectVNG.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(orderObjectVNG.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(orderObjectVNG.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName("Existing Resource Group List:")).toEqual(rgName);
        expect(placeOrderPage.getTextBasedOnLabelName("Resource Group Location:")).toEqual(jsonUtil.getValue(orderObjectVNG, "Resource Group Location"));
        expect(placeOrderPage.getTextBasedOnLabelName("Virtual Network Gateway Name:")).toEqual(vngName);
        expect(placeOrderPage.getTextBasedOnLabelName("Gateway Type:")).toEqual(jsonUtil.getValue(orderObjectVNG, "Gateway Type"));
        expect(placeOrderPage.getTextBasedOnLabelName("VPN Type:")).toEqual(jsonUtil.getValue(orderObjectVNG, "VPN Type"));
        expect(placeOrderPage.getTextBasedOnLabelName("Virtual Network List:")).toEqual(vnName);
        expect(placeOrderPage.getTextBasedOnLabelName("Gateway Subnet Address Range:")).toEqual(jsonUtil.getValue(orderObjectVNG, "Gateway Subnet Address Range"));
        expect(placeOrderPage.getTextBasedOnLabelName("Public IP Address Configuration:")).toEqual(jsonUtil.getValue(orderObjectVNG, "Public IP Address Configuration"));
        expect(placeOrderPage.getTextBasedOnLabelName("New Public IP Name:")).toEqual(ipName);
    });
    it('Azure: T526325 - Verify that for Virtual Network Gateway  Service all values on ‘View Order Details’ page matches with input', function () {

        var returnObj = {};
        returnObj.servicename = servicename;

        var orderObjectVNG = JSON.parse(JSON.stringify(VNGTemplate.VNGService));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObjectVNG.Category);
        catalogPage.clickConfigureButtonBasedOnName(orderObjectVNG.bluePrintName);
        orderFlowUtil.fillOrderDetails(VNGTemplate.VNGService, modifiedParamMapVNG);

        placeOrderPage.submitOrder();
        browser.wait(EC.visibilityOf(element(by.xpath('//h2[contains(text(),"Order Submitted !")]'))), 40000);

        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        ordersPage.open();

        ordersPage.searchOrderById(returnObj.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();

        //Checking Order Details in View order details
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Item ID")).toBe(returnObj.orderNumber);//Checking Order Number
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toBe(returnObj.servicename);//Checking Service Name
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(orderObjectVNG.provider);//Checking Provider
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Status")).toBe('Approval In Progress');//Checking Order Status
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
         
        //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(orderObjectVNG.TotalCost);

        //Checking Service Configuration Parameters
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnExactLabelName("Existing Resource Group List")).toEqual(rgName);
        expect(ordersPage.getTextBasedOnExactLabelName("Resource Group Location")).toEqual(jsonUtil.getValue(orderObjectVNG, "Resource Group Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network Gateway Name")).toEqual(vngName);
        expect(ordersPage.getTextBasedOnExactLabelName("Gateway Type")).toEqual(jsonUtil.getValue(orderObjectVNG, "Gateway Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("VPN Type")).toEqual(jsonUtil.getValue(orderObjectVNG, "VPN Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network List")).toEqual(vnName);
        expect(ordersPage.getTextBasedOnExactLabelName("Gateway Subnet Address Range")).toEqual(jsonUtil.getValue(orderObjectVNG, "Gateway Subnet Address Range"));
        expect(ordersPage.getTextBasedOnExactLabelName("Public IP Address Configuration")).toEqual(jsonUtil.getValue(orderObjectVNG, "Public IP Address Configuration"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Public IP Name")).toEqual(ipName);
        // expect(element(by.xpath('//*[@id="sku_3_value"]')).getText()).toEqual(jsonUtil.getValue(orderObjectVNG,"SKU"));
        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(orderObjectVNG.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
