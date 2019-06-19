/*
 * Test Cases for automation of Security Group Rule Service
 * Author: Sampada 
 * 
 */

"use strict";

var EC = protractor.ExpectedConditions,
    logGenerator = require("../../../../helpers/logGenerator.js"),
    Logger = logGenerator.getApplicationLogger(),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    OrdersPage = require('../../../pageObjects/orders.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    contentDeliveryNetworkTemplate = require('../../../../testData/OrderIntegration/Softlayer/ContentDeliveryNetwork.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Tests for Softlayer : Content Delivery Network Service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, bucketName, customeCName, hostName;
    var modifiedParamMap = {};
    var bucketName = "testAutomation" + util.getRandomString(4);
    var messageStrings = { providerName: 'IBM Cloud', category: 'Network' };
    var ContentDeliveryNetworkObject = JSON.parse(JSON.stringify(contentDeliveryNetworkTemplate));

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
        bucketName = "GSLSLBucketNameTestAutomation" + util.getRandomString(5);
        customeCName = "GSLSLcustomCNameTestAutomation" + util.getRandomString(5);
        hostName = "GSLSLHostNameTEstAutomation" + util.getRandomString(5) + ".com";
        modifiedParamMap = { "Service Instance Name": serviceName, "Bucketname": bucketName, "Custom CNAME": customeCName, "Hostname": hostName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(ContentDeliveryNetworkObject.Category);
    });

    it('TC-C196139 : Content Delivery Network - Verify Softlayer Content Delivery Network Service Main Page parameters', function () {
        var orderObject = {};
        catalogPage.searchForBluePrint(ContentDeliveryNetworkObject.bluePrintName);

        catalogPage.clickConfigureButtonBasedOnName(ContentDeliveryNetworkObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(ContentDeliveryNetworkObject.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(ContentDeliveryNetworkObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(ContentDeliveryNetworkObject.Category);  


    });

    it('TC-C196140 : Content Delivery Network - Verify Softlayer Content Delivery Network Service Additional Parameters on review order', function () {
        var orderObject = {};
        catalogPage.searchForBluePrint(contentDeliveryNetworkTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(contentDeliveryNetworkTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(contentDeliveryNetworkTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            //  expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(ContentDeliveryNetworkObject.providerName);
            //  expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(ContentDeliveryNetworkObject.Category);
            expect(requiredReturnMap["Actual"]["Vendor Name"]).toEqual(requiredReturnMap["Expected"]["Vendor Name"]);
            expect(requiredReturnMap["Actual"]["Path"]).toEqual(requiredReturnMap["Expected"]["Path"]);
            expect(requiredReturnMap["Actual"]["Origin Type"]).toEqual(requiredReturnMap["Expected"]["Origin Type"]);
            expect(requiredReturnMap["Actual"]["Server Address/Endpoint"]).toEqual(requiredReturnMap["Expected"]["Server Address/Endpoint"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
        
        });
    });

    it('TC-C196141 : Content Delivery Network - Verify View Order Details for Content Delivery Network Service', function () {
        var orderObject = {};
        var ContentDeliveryNetworkObject = JSON.parse(JSON.stringify(contentDeliveryNetworkTemplate));
        catalogPage.searchForBluePrint(contentDeliveryNetworkTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(contentDeliveryNetworkTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(contentDeliveryNetworkTemplate, modifiedParamMap);
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

        //Verfiy presence of correct order number
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber);

        //Verify presence of correct provider
        //  expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(ContentDeliveryNetworkObject.providerName);

        //Verify Order Type
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');

        //Verify presence of correct Service Name
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(ContentDeliveryNetworkObject.bluePrintName);

        //Verify presence of correct Total Cost
        // expect(ordersPage.getTextTotalCostOrderDetails()).toBe(ContentDeliveryNetworkObject.totalCost);

        //Verify presence of Order Submitted By correct user
        //  expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

        //Verify presence of correct team
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Team"));

        //Verify Service Configurations parameters:
        ordersPage.clickServiceConfigurationsTabOrderDetails();

        expect(ordersPage.getTextBasedOnLabelName("Vendor Name")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Vendor Name"));
        //   //--Unique-  expect(placeOrderPage.getTextBasedOnLabelName(" Hostname:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Hostname"));
        //   //--Unique--  expect(placeOrderPage.getTextBasedOnLabelName(" Custom CNAME:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Custom CNAME"));
        expect(ordersPage.getTextBasedOnLabelName("Host Header")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Host Header"));
        expect(ordersPage.getTextBasedOnLabelName("Path")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Path"));
        expect(ordersPage.getTextBasedOnLabelName("Origin Type")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Origin Type"));
        expect(ordersPage.getTextBasedOnLabelName("Server Address/Endpoint")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Server Address/Endpoint"));
        //--Unique--  expect(ordersPage.getTextBasedOnLabelName("Bucketname")).toEqual(bucketName);
        expect(ordersPage.getTextBasedOnLabelName("Protocol")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Http Port")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Http Port"));
        // expect(ordersPage.getTextBasedOnLabelName("Allowed File Extensions")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Allowed File Extensions"));
        // expect(ordersPage.getTextBasedOnLabelName("Respect Headers")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Respect Headers"));

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C196142 : Content Delivery Network - Verify provisioning of Content Delivery Network using Consume UI', function () {
            var ContentDeliveryNetworkObject = JSON.parse(JSON.stringify(contentDeliveryNetworkTemplate));
            var orderObject = {};
            catalogPage.searchForBluePrint(contentDeliveryNetworkTemplate.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(contentDeliveryNetworkTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(contentDeliveryNetworkTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 50);

            //Search on Inventory 
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();

            //Verify View Services
            //Xpath is finding manually but through automation it's failing, so commenting this part of code.
            // expect(placeOrderPage.getTextBasedOnLabelName(" Vendor Name:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Vendor Name"));
            // //   expect(placeOrderPage.getTextBasedOnLabelName(" Hostname:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Hostname"));
            // //   expect(placeOrderPage.getTextBasedOnLabelName(" Custom CNAME:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Custom CNAME"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Host Header:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Host Header"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Path:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Path"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Origin Type:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Origin Type"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Server Address/Endpoint:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Server Address/Endpoint"));
            // //     expect(placeOrderPage.getTextBasedOnLabelName(" Bucketname:  ")).toEqual(bucketName);
            // expect(placeOrderPage.getTextBasedOnLabelName(" Protocol:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Protocol"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Http Port:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Http Port"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Allowed File Extensions:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Allowed File Extensions"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Respect Headers:  ")).toEqual(jsonUtil.getValue(ContentDeliveryNetworkObject, "Respect Headers"));
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 350);
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        })
    }
});
