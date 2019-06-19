/*
* Test Cases for automation of Dedicated VirtualServer Service
* Author: Anjali Ghutke
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
    dedicatedVirtualServerTemplate = require('../../../../testData/OrderIntegration/Softlayer/dedicatedVirtualServer.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Order Integration Tests for Softlayer : Dedicated VirtualServer service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, hostName;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Compute' };
    var dedicatedVirtualServerObject = JSON.parse(JSON.stringify(dedicatedVirtualServerTemplate));

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
        hostName = "GSLSLHostNameTestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Hostname": hostName };
    });

    it('TC-C196144 : Dedicated VirtualServer - Verify Softlayer Dedicated VirtualServer Service Main Page parameters', function () {
        var orderObject = {};
        var dedicatedVirtualServerObject = JSON.parse(JSON.stringify(dedicatedVirtualServerTemplate));
        catalogPage.searchForBluePrint(dedicatedVirtualServerObject.bluePrintName);

        catalogPage.clickConfigureButtonBasedOnName(dedicatedVirtualServerObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(dedicatedVirtualServerObject.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(dedicatedVirtualServerObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(dedicatedVirtualServerObject.Category);    

    });

    it('TC-C196145 : Dedicated VirtualServer - Verify Softlayer Dedicated VirtualServer Service Additional Parameters on Review Order Page', function () {
        var orderObject = {};
        var dedicatedVirtualServerObject = JSON.parse(JSON.stringify(dedicatedVirtualServerTemplate));
        catalogPage.searchForBluePrint(dedicatedVirtualServerTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(dedicatedVirtualServerTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(dedicatedVirtualServerTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            //  expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(dedicatedVirtualServerObject.providerName);
            //  expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(dedicatedVirtualServerObject.Category);
            expect(requiredReturnMap["Actual"]["Hostname"]).toEqual(requiredReturnMap["Expected"]["Hostname"]);
            expect(requiredReturnMap["Actual"]["Domain"]).toEqual(requiredReturnMap["Expected"]["Domain"]);
            expect(requiredReturnMap["Actual"]["Billing Type"]).toEqual(requiredReturnMap["Expected"]["Billing Type"]);
            expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
            expect(requiredReturnMap["Actual"]["Operating System"]).toEqual(requiredReturnMap["Expected"]["Operating System"]);
            expect(requiredReturnMap["Actual"]["Cores"]).toEqual(requiredReturnMap["Expected"]["Cores"]);
            expect(requiredReturnMap["Actual"]["Memory"]).toEqual(requiredReturnMap["Expected"]["Memory"]);
            expect(requiredReturnMap["Actual"]["Disk Type"]).toEqual(requiredReturnMap["Expected"]["Disk Type"]);
            expect(requiredReturnMap["Actual"]["First Disk"]).toEqual(requiredReturnMap["Expected"]["First Disk"]);
            expect(requiredReturnMap["Actual"]["Private Network Only"]).toEqual(requiredReturnMap["Expected"]["Private Network Only"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
   
        });
    });

    it('TC-C196146 : Dedicated VirtualServer - Verify View Order Details for Dedicated VirtualServer Service-Sanity', function () {
        var orderObject = {};
        var dedicatedVirtualServerObject = JSON.parse(JSON.stringify(dedicatedVirtualServerTemplate));
        catalogPage.searchForBluePrint(dedicatedVirtualServerObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(dedicatedVirtualServerTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(dedicatedVirtualServerTemplate, modifiedParamMap);
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
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(dedicatedVirtualServerTemplate.providerName);

        //Verify presence of correct Total Cost
        // expect(ordersPage.getTextTotalCostOrderDetails()).toBe(dedicatedVirtualServerObject.totalCost);

        //Verify presence of Order Submitted By correct user
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

        //Verify presence of correct team
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Team"));
        expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Datacenter"));
        expect(ordersPage.getTextBasedOnLabelName("Hostname")).toEqual(hostName);
        expect(ordersPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Domain"));
        expect(ordersPage.getTextBasedOnLabelName("Billing Type")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Billing Type"));

        expect(ordersPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Operating System"));
        expect(ordersPage.getTextBasedOnLabelName("Cores")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Cores"));
        expect(ordersPage.getTextBasedOnLabelName("Memory")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Memory"));
        expect(ordersPage.getTextBasedOnLabelName("Disk Type")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Disk Type"));
        expect(ordersPage.getTextBasedOnLabelName("First Disk")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "First Disk"));

        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(dedicatedVirtualServerObject.totalCost);

        //Verify Deny Order flow
        orderFlowUtil.denyOrder(orderObject);
    });
    // if (isProvisioningRequired == "true") {
    //     it(' Dedicated Virtual Server - Verify provision of Softlayer Dedicated Virtual Server from Consume UI-Sanity', function () {
    //         var dedicatedVirtualServerObject = JSON.parse(JSON.stringify(dedicatedVirtualServerTemplate));
    //         var orderObject = {};
    //         catalogPage.searchForBluePrint(dedicatedVirtualServerObject.bluePrintName);
    //         catalogPage.clickConfigureButtonBasedOnName(dedicatedVirtualServerTemplate.bluePrintName);
    //         orderObject.servicename = serviceName;
    //         orderFlowUtil.fillOrderDetails(dedicatedVirtualServerTemplate, modifiedParamMap);
    //         placeOrderPage.submitOrder();
    //         orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    //         orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
    //         expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    //         placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
    //         orderFlowUtil.approveOrder(orderObject);
    //         orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 50);
    //         inventoryPage.open();
    //         inventoryPage.searchOrderByServiceName(orderObject.servicename);
    //         element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
    //         inventoryPage.clickViewService();
    //         // expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Datacenter"));
    //         // expect(ordersPage.getTextBasedOnLabelName("Hostname")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Hostname"));
    //         // expect(ordersPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Domain"));
    //         // expect(ordersPage.getTextBasedOnLabelName("Billing Type")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Billing Type"));
    //         // expect(ordersPage.getTextBasedOnLabelName("Dedicated Host Id")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Dedicated Host Id"));

    //         // expect(ordersPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Operating System"));
    //         // expect(ordersPage.getTextBasedOnLabelName("Cores")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Cores"));
    //         // expect(ordersPage.getTextBasedOnLabelName("Memory")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Memory"));
    //         // expect(ordersPage.getTextBasedOnLabelName("Disk Type")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "Disk Type"));
    //         // expect(ordersPage.getTextBasedOnLabelName("First Disk")).toEqual(jsonUtil.getValue(dedicatedVirtualServerObject, "First Disk"));

    //         orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
    //             if (status == 'Completed') {
    //                 orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
    //                 orderFlowUtil.approveDeletedOrder(orderObject);
    //                 orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 250);
    //             }
    //         })
    //     })
    // }
});


