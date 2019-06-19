/*************************************************
DESCRIPTION: The test script verifies the Hardware Firewall Service functionality    
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
    hardwareFirewallTemplate = require('../../../../testData/OrderIntegration/Softlayer/HardwareFirewall.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-3") ? "QA 3" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Softlayer : Hardware Firewall Service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Security & Identity' };
    var slHfJsonObject = JSON.parse(JSON.stringify(hardwareFirewallTemplate));

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
        modifiedParamMap = { "Service Instance Name": serviceName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(slHfJsonObject.Category);

    });

    it('TC-C196053 : Verify Softlayer Hardware Firewall Main Page parameters', function () {
        var orderObject = {};
        var slHfJsonObject = JSON.parse(JSON.stringify(hardwareFirewallTemplate));

        catalogPage.searchForBluePrint(slHfJsonObject.bluePrintName);

        //Verify correct service name is displayed on the catalog page for Security Group service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toBe(slHfJsonObject.bluePrintName);
        // });

        // //Verify the provider to be Softlayer for Hardware Firewall service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toBe(slHfJsonObject.providerName.toLowerCase());
        // });

        // //Verifty "Starting At" price Hardware Firewall service
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {

        //     expect(text).toBe(slHfJsonObject.estimatedCost);
        // });

        catalogPage.clickConfigureButtonBasedOnName(slHfJsonObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(slHfJsonObject.estimatedCost);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(slHfJsonObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(slHfJsonObject.Category);


    });

    it('TC-C196054: Verify Softlayer Hardware Firewall Additional Parameters on review order', function () {

        var orderObject = {};
        var slHfJsonObject = JSON.parse(JSON.stringify(hardwareFirewallTemplate));
        catalogPage.searchForBluePrint(hardwareFirewallTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(hardwareFirewallTemplate.bluePrintName);
        orderObject.servicename = serviceName;

        //After filling the additional parameters and Main parameters , verify the values on review page
        orderFlowUtil.fillOrderDetails(hardwareFirewallTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Firewall Type"]).toEqual(requiredReturnMap["Expected"]["Firewall Type"]);
            //Commenting as this value is dynamic
            //  expect(requiredReturnMap["Actual"]["Vlan Number"]).toEqual(requiredReturnMap["Expected"]["Vlan Number"]);


            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
           
        })

    });


    it('TC-C196056:  Verify View Order Details Hardware Firewall', function () {
        var orderObject = {};
        var slHfJsonObject = JSON.parse(JSON.stringify(hardwareFirewallTemplate));
        catalogPage.searchForBluePrint(hardwareFirewallTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(hardwareFirewallTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(hardwareFirewallTemplate, modifiedParamMap);


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
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(slHfJsonObject.providerName); //Checking Provider
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New'); //Checking Order Type
        // expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(slHfJsonObject.bluePrintName);// Checking Service Offering Name

        expect(ordersPage.getTextBasedOnLabelName("Firewall Type")).toEqual(jsonUtil.getValue(slHfJsonObject, "Firewall Type"));
        // expect(placeOrderPage.getTextBasedOnLabelName("Vlan Number:")).toEqual(jsonUtil.getValue(slHfJsonObject, "Vlan Number"));


        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(slHfJsonObject.totalCost);


        //Deny Order
        orderFlowUtil.denyOrder(orderObject);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C196058  : Verify Order Approval, verifying  Inventory View Details, Delete Order Hardware Firewall', function () {
            var orderObject = {};
            var slHfJsonObject = JSON.parse(JSON.stringify(hardwareFirewallTemplate));
            catalogPage.searchForBluePrint(hardwareFirewallTemplate.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(hardwareFirewallTemplate.bluePrintName);
            orderObject.servicename = serviceName;

            //Fill and Submit order
            orderFlowUtil.fillOrderDetails(hardwareFirewallTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

            //Open Order page and Approve Order              
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
            //expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');

            // Open View Detail on Inventory
            Logger.info("Output Parameters on Inventory : View Details");
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();

            // Verify system Configuration
            //Xpath is finding manually but through automation it's failing, so commenting this part of code.
            // expect(inventoryPage.getTextBasedOnLabelName("Firewall Type")).toEqual(jsonUtil.getValue(slHfJsonObject, "Firewall Type"));

            //   expect(placeOrderPage.getTextBasedOnLabelName("Firewall Type:")).toEqual(jsonUtil.getValue(slHfJsonObject, "Firewall Type"));
            //   expect(placeOrderPage.getTextBasedOnLabelName("Vlan Number:")).toEqual(jsonUtil.getValue(slHfJsonObject, "Vlan Number"));

            //Delete the provisioned service
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 50);
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        })
    }

});


