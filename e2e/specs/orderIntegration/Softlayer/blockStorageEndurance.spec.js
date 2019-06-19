/*************************************************
DESCRIPTION: The test script verifies the Block Storage Service functionality      
AUTHOR: SAMPADA BHELSEWALE
Date: 8th March 2018
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
    blockStorageTemplate = require('../../../../testData/OrderIntegration/Softlayer/BlockStorageEndurance.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Softlayer : Block Storage Service - Endurance ', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Storage' };
    var slBsJsonObject = JSON.parse(JSON.stringify(blockStorageTemplate));

    beforeAll(function () {
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        catalogDetailsPage = new CatalogDetailsPage();
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
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(slBsJsonObject.Category);
    });

    it('TC-C196011 - Block Storage - Endurance Type : Verify Softlayer Block Storage Main Page parameters', function () {
        var orderObject = {};
        var slBsJsonObject = JSON.parse(JSON.stringify(blockStorageTemplate));
        catalogPage.searchForBluePrint(slBsJsonObject.bluePrintName);


        //Verify correct service name is displayed on the catalog page for Block Storage service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(slBsJsonObject.bluePrintName);
        // });

        // //Verify the provider to be Softlayer for Block Storage service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toMatch(slBsJsonObject.providerName.toLowerCase());
        // });

        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {
        //     expect(text).toBe(slBsJsonObject.estimatedCost);
        // });

        catalogPage.clickConfigureButtonBasedOnName(blockStorageTemplate.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(slBsJsonObject.estimatedCost);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(slBsJsonObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(slBsJsonObject.Category);

    });

    it('TC-C196012 - Block Storage - Endurance Type : Verify Softlayer Block Storage review Parameters on review order', function () {
        var orderObject = {};
        var oneTimeCharges;
        var slBsJsonObject = JSON.parse(JSON.stringify(blockStorageTemplate));
        catalogPage.searchForBluePrint(slBsJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(blockStorageTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(blockStorageTemplate, modifiedParamMap).then(async function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Location"]).toEqual(requiredReturnMap["Expected"]["Location"]);
            expect(requiredReturnMap["Actual"]["Billing Method"]).toEqual(requiredReturnMap["Expected"]["Billing Method"]);
            expect(requiredReturnMap["Actual"]["Operating System"]).toEqual(requiredReturnMap["Expected"]["Operating System"]);
            expect(requiredReturnMap["Actual"]["Storage IOPS Options"]).toEqual(requiredReturnMap["Expected"]["Storage IOPS Options"]);
            expect(requiredReturnMap["Actual"]["Storage Size"]).toEqual(requiredReturnMap["Expected"]["Storage Size"]);
            expect(requiredReturnMap["Actual"]["Storage Type"]).toEqual(requiredReturnMap["Expected"]["Storage Type"]);
            
            var totalCost = await placeOrderPage.getBOMTablePrice();
            oneTimeCharges = "USD 0.00 ONE TIME CHARGE + USD "+totalCost+" / MONTH";
            // console.log(placeOrderPage.getEstimatedPrice_ReviewOrder());
            expect(oneTimeCharges).toEqual(placeOrderPage.getEstimatedPrice_ReviewOrder());
            expect(placeOrderPage.verifyThePricingBOMTotalQuantity(blockStorageTemplate.quntity)).toBe(true,"Total quntity of the pricing BOM does not matched");      
             //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
      
        })

    });

    it('TC-C196013 :  Block Storage - Endurance Type : Verify View Order Details-Sanity', async function () {
        var orderObject = {};
        var oneTimeCharges
        var slBsJsonObject = JSON.parse(JSON.stringify(blockStorageTemplate));
        catalogPage.searchForBluePrint(slBsJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(blockStorageTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(blockStorageTemplate, modifiedParamMap);

        //Submit Order and grab the parameter values related to order 
        placeOrderPage.submitOrder();
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        //Navigate to Order Page
        ordersPage.open();

        //Search by Order ID and verify the parameters on View order page
        ordersPage.searchOrderById(orderObject.orderNumber);
        util.scrollToBottom();
        ordersPage.clickFirstViewDetailsOrdersTable();
        Logger.info("Validating the Order Review page");
        //expect(ordersPage.getTextOrderStatusOrderDetails()).toBe("Approval In Progress"); //Checking Order Status
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber); //Checking order number
        // expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(slBsJsonObject.providerName); //Checking Provider
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New'); //Checking Order Type      
        // expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(ordersubmittedBy); // Checking Submitted By
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(slBsJsonObject.bluePrintName);
        expect(ordersPage.getTextBasedOnLabelName("Storage Type")).toEqual(jsonUtil.getValue(slBsJsonObject, "Storage Type"));
        expect(ordersPage.getTextBasedOnLabelName("Location")).toEqual(jsonUtil.getValue(slBsJsonObject, "Location"));
        expect(ordersPage.getTextBasedOnLabelName("Billing Method")).toEqual(jsonUtil.getValue(slBsJsonObject, "Billing Method"));
        expect(ordersPage.getTextBasedOnLabelName("Storage Size")).toEqual(jsonUtil.getValue(slBsJsonObject, "Storage Size"));
        expect(ordersPage.getTextBasedOnLabelName("Storage IOPS Options")).toEqual(jsonUtil.getValue(slBsJsonObject, "Storage IOPS Options"));
        expect(ordersPage.getTextBasedOnLabelName("Snapshot Space Size")).toEqual(jsonUtil.getValue(slBsJsonObject, "Snapshot Space Size"));
        expect(ordersPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(slBsJsonObject, "Operating System"));

        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(slBsJsonObject.totalCost);
        var totalCost =await placeOrderPage.getBOMTablePrice();
        expect(slBsJsonObject.totalCost).toContain(totalCost);  
        expect(placeOrderPage.verifyThePricingBOMTotalQuantity(blockStorageTemplate.quntity)).toBe(true,"Total quntity of the pricing BOM does not matched");      

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);

    });

    if (isProvisioningRequired == "true") {
        it('TC-C196014 : Block Storage - Endurance Type: Verify Order Approval, verifying  Inventory View Details, Delete Order -Sanity',async function () {
            var orderObject = {};
            var slBsJsonObject = JSON.parse(JSON.stringify(blockStorageTemplate));
            //    catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.searchForBluePrint(slBsJsonObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(blockStorageTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(blockStorageTemplate, modifiedParamMap);

            //Submit order
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

            //Get details on pop up after submit
            var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
            var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

            //Open Order page and Approve Order 
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');


            // Verify the output parameters
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();
            //Xpath is finding manually but through automation it's failing, so commenting this part of code.
            expect(inventoryPage.getTextBasedOnLabelName("Storage Type")).toEqual(jsonUtil.getValue(slBsJsonObject, "Storage Type"));
            expect(inventoryPage.getTextBasedOnLabelName("Location")).toEqual(jsonUtil.getValue(slBsJsonObject, "Location"));
            expect(inventoryPage.getTextBasedOnLabelName("Billing Method")).toEqual(jsonUtil.getValue(slBsJsonObject, "Billing Method"));
            expect(inventoryPage.getTextBasedOnLabelName("Storage Size")).toEqual(jsonUtil.getValue(slBsJsonObject, "Storage Size"));
            expect(inventoryPage.getTextBasedOnLabelName("Storage IOPS Options")).toEqual(jsonUtil.getValue(slBsJsonObject, "Storage IOPS Options"));
            expect(inventoryPage.getTextBasedOnLabelName("Snapshot Space Size")).toEqual(jsonUtil.getValue(slBsJsonObject, "Snapshot Space Size"));
            expect(inventoryPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(slBsJsonObject, "Operating System"));

            var totalCost =await placeOrderPage.getBOMTablePrice();
            expect(slBsJsonObject.totalCost).toContain(totalCost);
            placeOrderPage.verifyThePricingBOMTotalQuantity(blockStorageTemplate.quntity);
            expect(placeOrderPage.verifyThePricingBOMTotalQuantity(blockStorageTemplate.quntity)).toBe(true,"Total quntity of the pricing BOM does not matched");      


            //Delete the provisioned storage
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        })

    }

});

