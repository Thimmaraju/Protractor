/*************************************************
DESCRIPTION: The test script verifies the Network Gateway Appliance Service functionality    
AUTHOR: SAMPADA BHELSEWALE
**************************************************/
"use strict";

var logGenerator = require("../../../../helpers/logGenerator.js"),
    Logger = logGenerator.getApplicationLogger(),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    OrdersPage = require('../../../pageObjects/orders.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    EC = protractor.ExpectedConditions,
    isProvisioningRequired = browser.params.isProvisioningRequired,
    networkGatewayApplianceTemplate = require('../../../../testData/OrderIntegration/Softlayer/NetworkGatewayAppliance.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Softlayer :  Network Gateway Appliance Service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, nameNetworkGateway, hostNameModified;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Network' };
    var slNgaJsonObject = JSON.parse(JSON.stringify(networkGatewayApplianceTemplate));

    beforeAll(function () {
        catalogPage = new CatalogPage();
        catalogDetailsPage = new CatalogDetailsPage();
        placeOrderPage = new PlaceOrderPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    afterAll(function () {
        //browser.manage().deleteAllCookies();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
        nameNetworkGateway = "GSLSLTest" + util.getRandomString(3);
        hostNameModified = "GSLSLTestHost" + util.getRandomString(3);
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": nameNetworkGateway, "Hostname": hostNameModified };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(slNgaJsonObject.Category);

    });

    it('TC-C196106 : Verify Softlayer  Network Gateway Appliance Main Page parameters', function () {
        var orderObject = {};
        var slNgaJsonObject = JSON.parse(JSON.stringify(networkGatewayApplianceTemplate));
        catalogPage.searchForBluePrint(slNgaJsonObject.bluePrintName);

        //Verify correct service name is displayed on the catalog page for Network Gateway Appliance service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(slNgaJsonObject.bluePrintName);
        // });

        // //Verify the provider to be Softlayer for Network Gateway Appliance service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toMatch(slNgaJsonObject.providerName.toLowerCase());
        // });

        // //Verifty "Starting At" price Network Gateway Appliance service
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {
        //     expect(text).toBe(slNgaJsonObject.estimatedCost);
        // });

        catalogPage.clickConfigureButtonBasedOnName(networkGatewayApplianceTemplate.bluePrintName);
        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(slNgaJsonObject.estimatedCost);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(slNgaJsonObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(slNgaJsonObject.Category);

    });

    it('TC-C196107 : Verify Softlayer  Network Gateway Appliance Additional Parameters on review order', function () {
        var orderObject = {};
        var slNgaJsonObject = JSON.parse(JSON.stringify(networkGatewayApplianceTemplate));
        catalogPage.searchForBluePrint(slNgaJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(networkGatewayApplianceTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(networkGatewayApplianceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["High Availability Pair"]).toEqual(requiredReturnMap["Expected"]["High Availability Pair"]);
            expect(requiredReturnMap["Actual"]["Hostname"]).toEqual(requiredReturnMap["Expected"]["Hostname"]);
            expect(requiredReturnMap["Actual"]["Domain"]).toEqual(requiredReturnMap["Expected"]["Domain"]);
            expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
            expect(requiredReturnMap["Actual"]["Server Type"]).toEqual(requiredReturnMap["Expected"]["Server Type"]);
            expect(requiredReturnMap["Actual"]["Server"]).toEqual(requiredReturnMap["Expected"]["Server"]);
            expect(requiredReturnMap["Actual"]["RAM"]).toEqual(requiredReturnMap["Expected"]["RAM"]);
            //   expect(requiredReturnMap["Actual"]["Operating System"]).toEqual(requiredReturnMap["Expected"]["Operating System"]);
            expect(requiredReturnMap["Actual"]["First Disk"]).toEqual(requiredReturnMap["Expected"]["First Disk"]);
            //   expect(requiredReturnMap["Actual"]["Network Type"]).toEqual(requiredReturnMap["Expected"]["Network Type"]);
            expect(requiredReturnMap["Actual"]["Public Bandwidth"]).toEqual(requiredReturnMap["Expected"]["Public Bandwidth"]);
            expect(requiredReturnMap["Actual"]["Unbonded Network"]).toEqual(requiredReturnMap["Expected"]["Unbonded Network"]);
            expect(requiredReturnMap["Actual"]["Redundant Network"]).toEqual(requiredReturnMap["Expected"]["Redundant Network"]);
            expect(requiredReturnMap["Actual"]["Primary IPv6 Addresses"]).toEqual(requiredReturnMap["Expected"]["Primary IPv6 Addresses"]);


          //Checking Service Details in ReviewOrder
          expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
   
        })

    });

    it('TC-C196108 :  Verify View Order Details  Network Gateway Appliance', function () {
        var orderObject = {};
        var slNgaJsonObject = JSON.parse(JSON.stringify(networkGatewayApplianceTemplate));
        catalogPage.searchForBluePrint(slNgaJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(networkGatewayApplianceTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(networkGatewayApplianceTemplate, modifiedParamMap);

        //Submit Order
        placeOrderPage.submitOrder();
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        var orderSubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        //Navigate to Order Page
        ordersPage.open();

        //Search by Order ID and verify the parameters on View order page
        ordersPage.searchOrderById(orderObject.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();
        Logger.info("Validating the Order Review page");
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber); //Checking order number
        // expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(slNgaJsonObject.providerName); //Checking Provider
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New'); //Checking Order Type
        //  expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(slNgaJsonObject.bluePrintName);// Checking Service Offering Name


        //   Verify Service Configurations parameters:
        expect(ordersPage.getTextBasedOnLabelName("High Availability Pair")).toEqual(jsonUtil.getValue(slNgaJsonObject, "High Availability Pair"));
        expect(ordersPage.getTextBasedOnLabelName("Hostname")).toEqual(hostNameModified);
        expect(ordersPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Domain"));
        expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Datacenter"));
        expect(ordersPage.getTextBasedOnLabelName("Server Type")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Server Type"));
        expect(ordersPage.getTextBasedOnLabelName("RAM")).toEqual(jsonUtil.getValue(slNgaJsonObject, "RAM"));
        //   expect(ordersPage.getTextBasedOnLabelName("Server")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Server"));
        expect(ordersPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Operating System"));
        expect(ordersPage.getTextBasedOnLabelName("First Disk")).toEqual(jsonUtil.getValue(slNgaJsonObject, "First Disk"));
        // Using this default value hence commenting --  expect(placeOrderPage.getTextBasedOnLabelName("Network Type")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Network Type"));
        expect(ordersPage.getTextBasedOnLabelName("Public Bandwidth")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Public Bandwidth"));
        expect(ordersPage.getTextBasedOnLabelName("Unbonded Network")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Unbonded Network"));
        expect(ordersPage.getTextBasedOnLabelName("Redundant Network")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Redundant Network"));
        expect(ordersPage.getTextBasedOnLabelName("Primary IPv6 Addresses")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Primary IPv6 Addresses"));

        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(slNgaJsonObject.totalCost);

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);

    });

    // it('TC-C196109 : Verify Order Approval, verifying  Inventory View Details, Delete Order for Network Gateway Appliance', function () {
    //     var orderObject = {};
    //     var slNgaJsonObject = JSON.parse(JSON.stringify(networkGatewayApplianceTemplate));
    //     catalogPage.searchForBluePrint(slNgaJsonObject.bluePrintName);
    //     catalogPage.clickConfigureButtonBasedOnName(networkGatewayApplianceTemplate.bluePrintName);
    //     orderObject.servicename = serviceName;

    //     //Fill and Submit order
    //     orderFlowUtil.fillOrderDetails(networkGatewayApplianceTemplate, modifiedParamMap);
    //     placeOrderPage.submitOrder();
    //     orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    //     orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

    //     //Open Order page and Approve Order              
    //     expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    //     placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

    //Commenting code as service is taking 3 hours to privision

    //    orderFlowUtil.approveOrder(orderObject);
    //     orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
    //     expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');

    //     // Open View Detail on Inventory
    //     Logger.info("Output Parameters on Inventory : View Details");
    //     inventoryPage.open();
    //     inventoryPage.searchOrderByServiceName(orderObject.servicename);
    //     element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
    //     inventoryPage.clickViewService();

    //     // Verify system Configuration
    //     expect(placeOrderPage.getTextBasedOnLabelName("High Availability Pair")).toEqual(jsonUtil.getValue(slNgaJsonObject, "High Availability Pair"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Hostname")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Hostname"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Domain"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Datacenter"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Server Type")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Server Type"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Server")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Server"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("RAM")).toEqual(jsonUtil.getValue(slNgaJsonObject, "RAM"));
    //    // expect(placeOrderPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Operating System"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("First Disk")).toEqual(jsonUtil.getValue(slNgaJsonObject, "First Disk"));
    //  //expect(placeOrderPage.getTextBasedOnLabelName("Network Type")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Network Type"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Public Bandwidth")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Public Bandwidth"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Unbonded Network")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Unbonded Network"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Redundant Network")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Redundant Network"));
    //     expect(placeOrderPage.getTextBasedOnLabelName("Primary IPv6 Addresses")).toEqual(jsonUtil.getValue(slNgaJsonObject, "Primary IPv6 Addresses"));

    //      //Delete the provisioned service
    //      orderFlowUtil.verifyOrderStatus(orderObject).then(function(status){
    //         if(status == 'Completed'){
    //             orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
    //             expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
    //             orderFlowUtil.approveDeletedOrder(orderObject);
    //             orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
    //             expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
    //         }
    //     })
    //})

});


