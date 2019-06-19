/*
* Test Cases for automation of Auto Scale Group service
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
    autoScaleGroupTemplate = require('../../../../testData/OrderIntegration/Softlayer/AutoScaleGroupService.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Order Integration Tests for Softlayer : Auto Scale Group service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName,modifiedParamMapedit;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud',   category: 'Compute' };
    var autoScaleGroupName = "GSLSLtestAutomationGroup" + util.getRandomString(4);
    var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupTemplate));

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
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(AutoScaleGroupObject.Category);
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Group Name": autoScaleGroupName };

    });

    it('TC-C196035 : Auto Scale Group - Verify Softlayer Auto Scale Group Service Main Page parameters', function () {
        var orderObject = {};
        var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupTemplate));
        catalogPage.searchForBluePrint(autoScaleGroupTemplate.bluePrintName);

        //Verify correct service name is displayed on the catalog page for Auto Scale Group service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(autoScaleGroupTemplate.bluePrintName);
        // });

        // //Verify the provider to be Softlayer for Auto Scale Group service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toMatch(autoScaleGroupTemplate.providerName.toLowerCase());
        // });

        // //Verifty "Starting At" price for Auto Scale Group service
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {

        //     expect(text).toBe(autoScaleGroupTemplate.EstimatedPrice);
        // });

        catalogPage.clickConfigureButtonBasedOnName(autoScaleGroupTemplate.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(autoScaleGroupTemplate.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(AutoScaleGroupObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(AutoScaleGroupObject.Category);


    });

    it('TCC196037 : Auto Scale Group - Verify Softlayer Auto Scale Group Service Additional Parameters on Review Order Page', function () {
        var orderObject = {};
        var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupTemplate));
        catalogPage.searchForBluePrint(autoScaleGroupTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(autoScaleGroupTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        
        orderFlowUtil.fillOrderDetails(autoScaleGroupTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            //  expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(autoScaleGroupTemplate.providerName);
            //  expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(autoScaleGroupTemplate.Category);
            expect(requiredReturnMap["Actual"]["Group Name"]).toEqual(requiredReturnMap["Expected"]["Group Name"]);
            expect(requiredReturnMap["Actual"]["Region"]).toEqual(requiredReturnMap["Expected"]["Region"]);
            expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
            expect(requiredReturnMap["Actual"]["Termination Policy"]).toEqual(requiredReturnMap["Expected"]["Termination Policy"]);
            expect(requiredReturnMap["Actual"]["Minimum Member Count"]).toEqual(requiredReturnMap["Expected"]["Minimum Member Count"]);
            expect(requiredReturnMap["Actual"]["Maximum Member Count"]).toEqual(requiredReturnMap["Expected"]["Maximum Member Count"]);
            expect(requiredReturnMap["Actual"]["Cooldown Period"]).toEqual(requiredReturnMap["Expected"]["Cooldown Period"]);
            expect(requiredReturnMap["Actual"]["Hostname"]).toEqual(requiredReturnMap["Expected"]["Hostname"]);
            expect(requiredReturnMap["Actual"]["Domain"]).toEqual(requiredReturnMap["Expected"]["Domain"]);
            expect(requiredReturnMap["Actual"]["Cores"]).toEqual(requiredReturnMap["Expected"]["Cores"]);
            expect(requiredReturnMap["Actual"]["RAM"]).toEqual(requiredReturnMap["Expected"]["RAM"]);
            expect(requiredReturnMap["Actual"]["Operating System"]).toEqual(requiredReturnMap["Expected"]["Operating System"]);
            expect(requiredReturnMap["Actual"]["Speed Type (Dedicated or Non Dedicated)"]).toEqual(requiredReturnMap["Expected"]["Speed Type (Dedicated or Non Dedicated)"]);
            expect(requiredReturnMap["Actual"]["Disk Type (Dedicated or Non Dedicated)"]).toEqual(requiredReturnMap["Expected"]["Disk Type (Dedicated or Non Dedicated)"]);
            expect(requiredReturnMap["Actual"]["Speed"]).toEqual(requiredReturnMap["Expected"]["Speed"]);
            expect(requiredReturnMap["Actual"]["Disk Type"]).toEqual(requiredReturnMap["Expected"]["Disk Type"]);
            expect(requiredReturnMap["Actual"]["First Disk"]).toEqual(requiredReturnMap["Expected"]["First Disk"]);
            expect(requiredReturnMap["Actual"]["Private VLAN"]).toEqual(requiredReturnMap["Expected"]["Private VLAN"]);

            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            
       
        });
            
    });

    it('TC-C196039 : Auto Scale Group - Verify View Order Details for Auto Scale Group Service', async function () {
        var orderObject = {};
        var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupTemplate));
        catalogPage.searchForBluePrint(autoScaleGroupTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(autoScaleGroupTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(autoScaleGroupTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        //Navigate to Order Page
        ordersPage.open();

        //Search by Order ID and verify the parameters on View order page
        ordersPage.searchOrderById(orderObject.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();

        //Verfiy presence of correct order number
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber);

        //Verify presence of correct provider
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(autoScaleGroupTemplate.providerName);

        //Verify Order Type
        expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');

        //Verify presence of correct Service Name
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(autoScaleGroupTemplate.bluePrintName);

        //Verify presence of correct Total Cost
        //expect(ordersPage.getTextTotalCostOrderDetails()).toBe(autoScaleGroupTemplate.totalCost);

        //Verify presence of Order Submitted By correct user
        // expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

        //Verify presence of correct team
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Team"));

        //Verify Service Configurations parameters:
        ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnLabelName("Group Name")).toEqual(autoScaleGroupName);
        expect(ordersPage.getTextBasedOnLabelName("Region")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Region"));
        expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Datacenter"));
        expect(ordersPage.getTextBasedOnLabelName("Termination Policy")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Termination Policy"));
        expect(ordersPage.getTextBasedOnLabelName("Minimum Member Count")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Minimum Member Count"));
        expect(ordersPage.getTextBasedOnLabelName("Maximum Member Count")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Maximum Member Count"));
        expect(ordersPage.getTextBasedOnLabelName("Cooldown Period")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Cooldown Period"));
        expect(ordersPage.getTextBasedOnLabelName("Hostname")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Hostname"));
        expect(ordersPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Domain"));
        expect(ordersPage.getTextBasedOnLabelName("Cores")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Cores"));
        expect(ordersPage.getTextBasedOnLabelName("RAM")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "RAM"));
        expect(ordersPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Operating System"));
        expect(ordersPage.getTextBasedOnExactLabelName("Speed")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Speed"));
        expect(ordersPage.getTextBasedOnLabelName("Disk Type")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Disk Type"));
        expect(ordersPage.getTextBasedOnLabelName("First Disk")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "First Disk"));
        expect(ordersPage.getTextBasedOnLabelName("Private VLAN")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Private VLAN"));
        expect(ordersPage.getTextBasedOnLabelName("Speed Type (Dedicated or Non Dedicated)")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Speed Type (Dedicated or Non Dedicated)"));
        expect(ordersPage.getTextBasedOnLabelName("Private VLAN")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Private VLAN"));

        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(autoScaleGroupTemplate.totalCost);

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C196040 : Auto Scale Group - Verify provision of Softlayer Auto Scale Group from Consume UI', function () {
            var orderObject = {};
            var editedGroupName ="GSLSLTestAutomationGroup" + util.getRandomString(4);
            var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupTemplate));
            catalogPage.searchForBluePrint(autoScaleGroupTemplate.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(autoScaleGroupTemplate.bluePrintName);
            orderObject.servicename = serviceName;

            orderFlowUtil.fillOrderDetails(autoScaleGroupTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 150);

            var orderObject_editService = {};
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickEditServiceIcon();
            util.waitForAngular();
            browser.sleep("5000");
            modifiedParamMapedit = { "Service Instance Name": serviceName, "EditService": true, "Group Name": editedGroupName };
            orderFlowUtil.fillOrderDetails(autoScaleGroupTemplate, modifiedParamMapedit);
            placeOrderPage.submitOrder();

            orderObject_editService.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject_editService.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

            placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject_editService);
            orderFlowUtil.waitForOrderStatusChange(orderObject_editService, "Completed", 50);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();


            // expect(placeOrderPage.getTextBasedOnSpanName("Group Name")).toEqual(autoScaleGroupName);
            // expect(placeOrderPage.getTextBasedOnSpanName("Region")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Region"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Datacenter")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Datacenter"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Termination Policy")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Termination Policy"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Minimum Member Count")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Minimum Member Count"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Maximum Member Count")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Maximum Member Count"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Cooldown Period")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Cooldown Period"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Hostname")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Hostname"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Domain")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Domain"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Cores")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Cores"));
            // expect(placeOrderPage.getTextBasedOnSpanName("RAM")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "RAM"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Operating System")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Operating System"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Speed")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Speed"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Disk Type")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Disk Type"));
            // expect(placeOrderPage.getTextBasedOnSpanName("First Disk")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "First Disk"));
            // expect(placeOrderPage.getTextBasedOnSpanName("Private VLAN")).toEqual(jsonUtil.getValue(autoScaleGroupTemplate, "Private VLAN"));

            //Delete Service
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

