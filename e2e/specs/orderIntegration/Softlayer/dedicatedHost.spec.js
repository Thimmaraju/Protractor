/*
* Test Cases for automation of Dedicated Host Service
* Author: Gayatri Hungund
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
    dedicatedHostTemplate = require('../../../../testData/OrderIntegration/Softlayer/DedicatedHostService.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Tests for Softlayer : Dedicated Host service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, hostName;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Compute' };
    var dedicatedHostObject = JSON.parse(JSON.stringify(dedicatedHostTemplate));

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
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(dedicatedHostObject.Category);

    });

    it('TC-C196144 : Dedicated Host - Verify Softlayer Dedicated Host Service Main Page parameters', function () {
        var orderObject = {};
        var dedicatedHostObject = JSON.parse(JSON.stringify(dedicatedHostTemplate));
        catalogPage.searchForBluePrint(dedicatedHostObject.bluePrintName);

        //Verify correct service name is displayed on the catalog page for dedicated host service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(dedicatedHostObject.bluePrintName);
        // });

        // //Verify the provider to be Softlayer for dedicated host service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toMatch(dedicatedHostObject.providerName.toLowerCase());
        // });

        // //Verifty "Starting At" price for dedicated host service
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {

        //     expect(text).toBe(dedicatedHostObject.EstimatedPrice);
        // });

        // catalogPage.getPriceBasedOnName(dedicatedHostObject.bluePrintName);

        catalogPage.clickConfigureButtonBasedOnName(dedicatedHostObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(dedicatedHostObject.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(dedicatedHostObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(dedicatedHostObject.Category);

    });

    it('TC-C196145 : Dedicated Host - Verify Softlayer Dedicated Host Service Additional Parameters on Review Order Page', function () {
        var orderObject = {};
        var dedicatedHostObject = JSON.parse(JSON.stringify(dedicatedHostTemplate));
        catalogPage.searchForBluePrint(dedicatedHostTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(dedicatedHostTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(dedicatedHostTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            //  expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(dedicatedHostObject.providerName);
            //  expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(dedicatedHostObject.Category);
            expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
            expect(requiredReturnMap["Actual"]["Billing Type"]).toEqual(requiredReturnMap["Expected"]["Billing Type"]);
            expect(requiredReturnMap["Actual"]["System Configuration"]).toEqual(requiredReturnMap["Expected"]["System Configuration"]);
            expect(requiredReturnMap["Actual"]["Hostname"]).toEqual(requiredReturnMap["Expected"]["Hostname"]);
            expect(requiredReturnMap["Actual"]["Domain"]).toEqual(requiredReturnMap["Expected"]["Domain"]);
            // This value is dynamically changing--   expect(requiredReturnMap["Actual"]["Backend Hardware Router"]).toEqual(requiredReturnMap["Expected"]["Backend Hardware Router"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
      

        });
    });

    it('TC-C196146 : Dedicated Host - Verify View Order Details for Dedicated Host Service-Sanity', function () {
        var orderObject = {};
        var dedicatedHostObject = JSON.parse(JSON.stringify(dedicatedHostTemplate));
        catalogPage.searchForBluePrint(dedicatedHostObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(dedicatedHostTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(dedicatedHostTemplate, modifiedParamMap);
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
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(dedicatedHostTemplate.providerName);

        //Verify Order Type
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');

        //Verify presence of correct Service Name
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(dedicatedHostObject.bluePrintName);

        //Verify presence of correct Total Cost
        // expect(ordersPage.getTextTotalCostOrderDetails()).toBe(dedicatedHostObject.totalCost);

        //Verify presence of Order Submitted By correct user
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

        //Verify presence of correct team
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(dedicatedHostObject, "Team"));
        expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Datacenter"));
        expect(ordersPage.getTextBasedOnLabelName("Billing Type")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Billing Type"));
        expect(ordersPage.getTextBasedOnLabelName("System Configuration")).toEqual(jsonUtil.getValue(dedicatedHostObject, "System Configuration"));
        expect(ordersPage.getTextBasedOnLabelName("Hostname")).toEqual(hostName);
        expect(ordersPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Domain"));
        // dynamically changing--  expect(ordersPage.getTextBasedOnLabelName("Backend Hardware Router")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Backend Hardware Router"));

        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(dedicatedHostObject.totalCost);

        //Verify Deny Order flow
        orderFlowUtil.denyOrder(orderObject);
    });
    //Commenting the code for provisioning dedicated host as it takes more than 10 mins for provisioning
    if (isProvisioningRequired == "true") {
        it('TC-C196147 : Dedicated Host - Verify provision of Softlayer Dedicated Host from Consume UI-Sanity', function () {
            var dedicatedHostObject = JSON.parse(JSON.stringify(dedicatedHostTemplate));
            var orderObject = {};
            catalogPage.searchForBluePrint(dedicatedHostObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(dedicatedHostTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(dedicatedHostTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 50);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();
            // expect(inventoryPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Datacenter"));
            // expect(inventoryPage.getTextBasedOnLabelName("Billing Type")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Billing Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("System Configuration")).toEqual(jsonUtil.getValue(dedicatedHostObject, "System Configuration"));
            // expect(inventoryPage.getTextBasedOnLabelName("Hostname")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Hostname"));
            // expect(inventoryPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Domain"));
            // expect(inventoryPage.getTextBasedOnLabelName("Backend Hardware Router")).toEqual(jsonUtil.getValue(dedicatedHostObject, "Backend Hardware Router"));

            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    // expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 250);
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
        })
    }
});

