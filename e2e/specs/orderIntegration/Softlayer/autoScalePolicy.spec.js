/*
 * Test Cases for automation of DNS Record Service
 * Author: Gayatri Hungund
 * Date: 22/02/2018 
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
    autoScalePolicyTemplate = require('../../../../testData/OrderIntegration/Softlayer/AutoScalePolicyService.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Order Integration Tests for Softlayer : Auto Scale Policy', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName,modifiedParamMapedit;
    var modifiedParamMapAutoScaleGroup = {};
    var modifiedParamMapAutoScalePolicy = {};
    var groupObject = {};
    var ASGorderObject = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Compute' };
    var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScalePolicyTemplate.AutoScaleGroupObject));
    var AutoScalePolicyObject = JSON.parse(JSON.stringify(autoScalePolicyTemplate.AutoScalePolicyObject));
    var autoScaleGroupName = "GSLSLtestAutomation" + util.getRandomString(4);
    var policyName = "GSLSLtestAutomation" + util.getRandomString(4);

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
        //delete created prerequisites auto scale group
        groupObject.deleteOrderNumber = orderFlowUtil.deleteService(groupObject);
        orderFlowUtil.approveDeletedOrder(groupObject);
        orderFlowUtil.waitForOrderStatusChange(groupObject, "Completed", 150);

    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
        modifiedParamMapAutoScaleGroup = { "Service Instance Name": serviceName, "Group Name": autoScaleGroupName };
        modifiedParamMapAutoScalePolicy = { "Service Instance Name": serviceName, "Autoscale Group Name": autoScaleGroupName, "Policy Name": policyName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(AutoScaleGroupObject.Category);


    });

    it('Test Case 1 : SL : Auto Scale Policy - Create prerequisite Auto Scale Group for Auto Scale Policy', function () {
        //var ASGorderObject = {};
        var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScalePolicyTemplate.AutoScaleGroupObject));
        catalogPage.searchForBluePrint(autoScalePolicyTemplate.AutoScaleGroupObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(autoScalePolicyTemplate.AutoScaleGroupObject.bluePrintName);
        ASGorderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(autoScalePolicyTemplate.AutoScaleGroupObject, modifiedParamMapAutoScaleGroup);
        placeOrderPage.submitOrder();
        ASGorderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        ASGorderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        orderFlowUtil.approveOrder(ASGorderObject);
        groupObject = Object.assign({}, ASGorderObject);

    });

    it('TC-TC-C196046 : Auto Scale Policy - Verify Softlayer Auto Scale Policy Main Page parameters', function () {
        var orderObject = {};
        var AutoScalePolicyObject = JSON.parse(JSON.stringify(autoScalePolicyTemplate.AutoScalePolicyObject));
        // catalogPage.searchForBluePrint(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);
        // //Verify correct service name is displayed on the catalog page for Record for Auto Scale Policy service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(AutoScaleGroupObject.bluePrintName);
        // });

        // //Verify the provider to be Softlayer for Record for Auto Scale Policy service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toMatch(AutoScaleGroupObject.providerName.toLowerCase());
        // });

        // //Verifty "Starting At" price for Record for Auto Scale Policy service
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {
        //     expect(text).toBe(AutoScaleGroupObject.EstimatedPrice);
        // });
        catalogPage.clickConfigureButtonBasedOnName(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(AutoScalePolicyObject.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(AutoScalePolicyObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(AutoScalePolicyObject.Category);


    });

    it('TC-C196049 : Auto Scale Policy - Verify Softlayer Auto Scale Policy Additional Parameters on review order', function () {
        var orderObject = {};
        var AutoScalePolicyObject = JSON.parse(JSON.stringify(autoScalePolicyTemplate.AutoScalePolicyObject));
        orderObject.servicename = serviceName;
        catalogPage.searchForBluePrint(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(autoScalePolicyTemplate.AutoScalePolicyObject, modifiedParamMapAutoScalePolicy).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            //   expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(AutoScalePolicyObject.providerName);
            //   expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(AutoScalePolicyObject.Category);
            expect(requiredReturnMap["Actual"]["Autoscale Group Name"]).toEqual(autoScaleGroupName);
            expect(requiredReturnMap["Actual"]["Policy Name"]).toEqual(policyName);
            expect(requiredReturnMap["Actual"]["Cooldown Period Type"]).toEqual(requiredReturnMap["Expected"]["Cooldown Period Type"]);
            expect(requiredReturnMap["Actual"]["Cooldown"]).toEqual(requiredReturnMap["Expected"]["Cooldown"]);
            expect(requiredReturnMap["Actual"]["Action"]).toEqual(requiredReturnMap["Expected"]["Action"]);
            expect(requiredReturnMap["Actual"]["Member(s)"]).toEqual(requiredReturnMap["Expected"]["Member(s)"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
      
        });

    });

    it('TC-C196051 : Auto Scale Policy - Verify View Order Details for Auto Scale Policy', function () {
        var orderObject = {};
        var AutoScalePolicyObject = JSON.parse(JSON.stringify(autoScalePolicyTemplate.AutoScalePolicyObject));
        orderObject.servicename = serviceName;
        catalogPage.searchForBluePrint(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(autoScalePolicyTemplate.AutoScalePolicyObject, modifiedParamMapAutoScalePolicy).then(function (requiredReturnMap) {
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
            //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(AutoScalePolicyObject.providerName);

            //Verify Order Type
            expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');

            //Verify presence of correct Service Name
            //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(AutoScalePolicyObject.bluePrintName);

            //Verify presence of correct Total Cost
            //expect(ordersPage.getTextTotalCostOrderDetails()).toBe(AutoScalePolicyObject.totalCost);

            //Verify presence of Order Submitted By correct user
            //expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

            //Verify presence of correct team
            //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(AutoScaleGroupObject, "Team"));

            //Verify Service Configurations parameters:
            expect(ordersPage.getTextBasedOnLabelName("Autoscale Group Name")).toEqual(autoScaleGroupName);
            expect(ordersPage.getTextBasedOnLabelName("Policy Name")).toEqual(policyName);
            expect(ordersPage.getTextBasedOnLabelName("Cooldown Period Type")).toEqual(jsonUtil.getValue(AutoScalePolicyObject, "Cooldown Period Type"));
            //util change needed
            expect(ordersPage.getTextBasedOnLabelName("Cooldown")).toEqual(jsonUtil.getValue(AutoScalePolicyObject, "Cooldown"));
            expect(ordersPage.getTextBasedOnLabelName("Action")).toEqual(jsonUtil.getValue(AutoScalePolicyObject, "Action"));
            expect(ordersPage.getTextBasedOnLabelName("Member(s)")).toEqual(jsonUtil.getValue(AutoScalePolicyObject, "Member(s)"));

            //Verify Bill of Materials
            ordersPage.clickBillOfMaterialsTabOrderDetails();
            expect(placeOrderPage.getTotalCost()).toBe(AutoScalePolicyObject.totalCost);

            //Deny Order
            orderFlowUtil.denyOrder(orderObject);
        });

    });


    if (isProvisioningRequired == "true") {
        it('TC-C196052 : Verify provisoining , Output Parameters ,Delete  from Consume UI', function () {
            var orderObject = {};
            var editedPolicyName ="GSLSLTestAutomationPolicys" + util.getRandomString(4);
            var AutoScalePolicyObject = JSON.parse(JSON.stringify(autoScalePolicyTemplate.AutoScalePolicyObject));
            orderObject.servicename = serviceName;
            catalogPage.searchForBluePrint(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(autoScalePolicyTemplate.AutoScalePolicyObject.bluePrintName);
            orderFlowUtil.fillOrderDetails(autoScalePolicyTemplate.AutoScalePolicyObject, modifiedParamMapAutoScalePolicy).then(function (requiredReturnMap) {
                placeOrderPage.submitOrder();
                orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
                orderFlowUtil.approveOrder(orderObject);
                orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 150);
                inventoryPage.open();
                inventoryPage.searchOrderByServiceName(orderObject.servicename);
                element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                inventoryPage.clickViewService();

                var orderObject_editService = {};
                inventoryPage.open();
                inventoryPage.searchOrderByServiceName(orderObject.servicename);
                element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                inventoryPage.clickEditServiceIcon();
                util.waitForAngular();
                browser.sleep("5000");
                // var editedPolicyName = "GSLSLTestAutomationPolicys" + util.getRandomString(4);
                modifiedParamMapedit = { "Service Instance Name": serviceName, "EditService": true, "Policy Name": editedPolicyName };
                orderFlowUtil.fillOrderDetails(autoScalePolicyTemplate.AutoScalePolicyObject, modifiedParamMapedit);
                placeOrderPage.submitOrder();

                orderObject_editService.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                orderObject_editService.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

                //Open Order page and Approve Order 
                //   expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

                placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                //expect(orderFlowUtil.verifyOrderType(orderObject)).toBe('EditSOI');
                orderFlowUtil.approveOrder(orderObject_editService);
                orderFlowUtil.waitForOrderStatusChange(orderObject_editService, "Completed", 50);
                inventoryPage.open();
                inventoryPage.searchOrderByServiceName(orderObject.servicename);
                element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                inventoryPage.clickViewService();

                // expect(inventoryPage.getTextBasedOnLabelName("Autoscale Group Name")).toEqual(autoScaleGroupName);
                // expect(inventoryPage.getTextBasedOnLabelName("Policy Name")).toEqual(policyName);
                // expect(inventoryPage.getTextBasedOnLabelName("Cooldown Period Type")).toEqual(jsonUtil.getValue(AutoScaleGroupObject, "Cooldown Period Type"));
                //expect(inventoryPage.getTextBasedOnLabelName("Cooldown")).toEqual(jsonUtil.getValue(AutoScaleGroupObject,"Cooldown"));
                // expect(inventoryPage.getTextBasedOnLabelName("Action")).toEqual(jsonUtil.getValue(AutoScaleGroupObject, "Action"));
                // expect(inventoryPage.getTextBasedOnLabelName("Member(s)")).toEqual(jsonUtil.getValue(AutoScaleGroupObject, "Member(s)"));


                orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                orderFlowUtil.approveDeletedOrder(orderObject);
                orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 150);
            });

        });
    }

});