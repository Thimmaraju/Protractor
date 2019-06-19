/*
 * Test Cases for automation of Auto Scale Trigger
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
    autoScaleGroupPolicyTriggerTemplate = require('../../../../testData/OrderIntegration/Softlayer/AutoScaleGroupPolicyTrigger.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Order Integration Tests for Softlayer : Auto Scale Policy Trigger', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName;
    var groupObject = {};
    var modifiedParamMapAutoScaleGroup = {};
    var modifiedParamMapAutoScalePolicy = {};
    var modifiedParamMapAutoScalePolicyTrigger = {};
    var messageStrings = { providerName: 'IBM Cloud' , category: 'Compute' };
    var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScaleGroupObject));
    var AutoScalePolicyObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyObject));
    var AutoScalePolicyTrigger = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyTriggerObject));
    var autoScaleGroupName = "GSLSLtestAutomation" + util.getRandomString(4);
    var autoScalePolicyName = "GSLSLtestAutomation" + util.getRandomString(4);
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
        //Clean up the prerequisites AutoScale group and Policy
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
        modifiedParamMapAutoScalePolicy = { "Service Instance Name": serviceName, "Autoscale Group Name": autoScaleGroupName, "Policy Name": autoScalePolicyName };
        modifiedParamMapAutoScalePolicyTrigger = { "Service Instance Name": serviceName, "Auto Scale Group": autoScaleGroupName, "Policy Name": autoScalePolicyName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(AutoScaleGroupObject.Category);

    });

    it('Test Case 1 : SL : Auto Scale Group Policy Trigger - Create prerequisite Auto Scale Group for Auto Scale Policy Trigger', function () {
        var orderObject = {};
        var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScaleGroupObject));
        catalogPage.searchForBluePrint(autoScaleGroupPolicyTriggerTemplate.AutoScaleGroupObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(autoScaleGroupPolicyTriggerTemplate.AutoScaleGroupObject.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(autoScaleGroupPolicyTriggerTemplate.AutoScaleGroupObject, modifiedParamMapAutoScaleGroup);
        placeOrderPage.submitOrder();
        //browser.wait(EC.visibilityOf($('#button-submit-button-reviewOrder')));
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        orderFlowUtil.approveOrder(orderObject);
        orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed', 250);
        groupObject = Object.assign({}, orderObject);
    });

    it('Test Case 2 : SL : Auto Scale Policy Trigger - Create Prerequisite Policy for Auto Scale Policy Trigger', function () {
        var orderObject = {};
        var AutoScaleGroupObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyObject));
        orderObject.servicename = serviceName;
        catalogPage.searchForBluePrint(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyObject, modifiedParamMapAutoScalePolicy).then(function (requiredReturnMap) {
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 150);

        });

    });

    it('TC-C196055 : Auto Scale Group Policy Trigger - Verify Softlayer Auto Scale Group Policy Trigger Service Main Page parameters', function () {
        var orderObject = {};
        var AutoScaleTriggerObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyTriggerObject));
        catalogPage.searchForBluePrint(AutoScaleTriggerObject.bluePrintName);

        //Verify correct service name is displayed on the catalog page for Security Group service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(AutoScaleTriggerObject.bluePrintName);
        // });

        // //Verify the provider to be Softlayer for Security Group service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toMatch(AutoScaleTriggerObject.providerName.toLowerCase());
        // });

        // //Verifty "Starting At" price for Security Group service
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {

        //     expect(text).toBe(AutoScaleTriggerObject.EstimatedPrice);
        // });

        catalogPage.clickConfigureButtonBasedOnName(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyTriggerObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(AutoScaleTriggerObject.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(AutoScaleTriggerObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(AutoScaleTriggerObject.Category);


    });

    it('TC-C202622 : Auto Scale Group Policy Trigger - Verify Auto Scale Group Policy Trigger Service Additional Parameters on Review Order Page', function () {
        var orderObject = {};
        var AutoScaleTriggerObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyTriggerObject));
        catalogPage.searchForBluePrint(AutoScaleTriggerObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(AutoScaleTriggerObject.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(AutoScaleTriggerObject, modifiedParamMapAutoScalePolicyTrigger).then(function (requiredReturnMap) {
            //Verify input values on Review Order page

            //   expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(AutoScaleTriggerObject.providerName);
            //   expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(AutoScaleTriggerObject.Category);
            expect(requiredReturnMap["Actual"]["Auto Scale Group"]).toEqual(autoScaleGroupName);
            expect(requiredReturnMap["Actual"]["Policy Name"]).toEqual(autoScalePolicyName);
            expect(requiredReturnMap["Actual"]["Scale Type"]).toEqual(requiredReturnMap["Expected"]["Scale Type"]);
            expect(requiredReturnMap["Actual"]["Scale Amount"]).toEqual(requiredReturnMap["Expected"]["Scale Amount"]);
            expect(requiredReturnMap["Actual"]["Cooldown"]).toEqual(requiredReturnMap["Expected"]["Cooldown"]);
            expect(requiredReturnMap["Actual"]["Type"]).toEqual(requiredReturnMap["Expected"]["Type"]);
            expect(requiredReturnMap["Actual"]["WeekDay"]).toEqual(requiredReturnMap["Expected"]["WeekDay"]);
            expect(requiredReturnMap["Actual"]["Time"]).toEqual(requiredReturnMap["Expected"]["Time"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
                 

        });
    });

    it('TC-C202624 : Auto Scale Group Policy Trigger - Verify View Order Details for Auto Scale Group Policy Trigger Service', function () {
        var orderObject = {};
        var AutoScaleTriggerObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyTriggerObject));
        catalogPage.searchForBluePrint(AutoScaleTriggerObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(AutoScaleTriggerObject.bluePrintName);
        //orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(AutoScaleTriggerObject, modifiedParamMapAutoScalePolicyTrigger);
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
        // expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(AutoScaleTriggerObject.providerName);

        //Verify Order Type
        expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');

        //Verify presence of correct Service Name
        //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(AutoScaleTriggerObject.bluePrintName);

        //Verify presence of correct Total Cost
        //expect(ordersPage.getTextTotalCostOrderDetails()).toBe(AutoScaleTriggerObject.totalCost);

        //Verify presence of Order Submitted By correct user
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

        //Verify presence of correct team
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Team"));

        //Verify Service Configurations parameters:
        expect(ordersPage.getTextBasedOnLabelName("Auto Scale Group")).toEqual(autoScaleGroupName);
        expect(ordersPage.getTextBasedOnLabelName("Policy Name")).toEqual(autoScalePolicyName);
        expect(ordersPage.getTextBasedOnLabelName("Scale Type")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Scale Type"));
        expect(ordersPage.getTextBasedOnLabelName("Scale Amount")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Scale Amount"));
        expect(ordersPage.getTextBasedOnLabelName("Cooldown")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Cooldown"));
        expect(ordersPage.getTextBasedOnLabelName("Type")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Type"));
        expect(ordersPage.getTextBasedOnLabelName("WeekDay")).toEqual("0-Sunday, 1-Monday");
        expect(ordersPage.getTextBasedOnLabelName("Time")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Time"));

        //Verify Bill of Materials /Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(AutoScaleTriggerObject.totalCost);

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);

    });

    if (isProvisioningRequired == "true") {
        it('TC-C202626 : Auto Scale Group Policy Trigger - Verify provision of Softlayer Auto Scale Group Policy Trigger from Consume UI', function () {
            var AutoScaleTriggerObject = JSON.parse(JSON.stringify(autoScaleGroupPolicyTriggerTemplate.AutoScalePolicyTriggerObject));
            var orderObject = {};
            catalogPage.searchForBluePrint(AutoScaleTriggerObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(AutoScaleTriggerObject.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(AutoScaleTriggerObject, modifiedParamMapAutoScalePolicyTrigger);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 150);
            //expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();
            // expect(inventoryPage.getTextBasedOnLabelName("Autoscale Group")).toEqual(AutoScaleGroupObject);
            // expect(inventoryPage.getTextBasedOnLabelName("Policy Name")).toEqual(autoScalePolicyName);
            // expect(inventoryPage.getTextBasedOnLabelName("Scale Type")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Scale Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("Scale Amount")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Scale Amount"));
            // expect(inventoryPage.getTextBasedOnLabelName("Cooldown")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Cooldown"));
            //expect(inventoryPage.getTextBasedOnLabelName("Type")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject,"Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("WeekDay")).toEqual("0-Sunday", "1-Monday");
            // expect(inventoryPage.getTextBasedOnLabelName("Time")).toEqual(jsonUtil.getValue(AutoScaleTriggerObject, "Time"));
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
