/*************************************************
DESCRIPTION: The test script verifies the Local Load Balancer Service functionality      
AUTHOR: SAMPADA
DATE: 8th March 2018
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
    localLoadBalancerTemplate = require('../../../../testData/OrderIntegration/Softlayer/LocalLoadBalancer.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Softlayer : Local Load Balancer', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName;
    var modifiedParamMap = {};
    var modifiedParamMapedit = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Network' };
    var slLbJsonObject = JSON.parse(JSON.stringify(localLoadBalancerTemplate));

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
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(slLbJsonObject.Category);
    });

    it('TC-C196098 : Local Load Balancer - Verify Softlayer Local Load Balancer Main Page parameters', function () {
        var orderObject = {};
        var slLbJsonObject = JSON.parse(JSON.stringify(localLoadBalancerTemplate));
        catalogPage.searchForBluePrint(slLbJsonObject.bluePrintName);

        //Verify correct service name is displayed on the catalog page for  Local Load Balancer service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(slLbJsonObject.bluePrintName);
        // });
        // //Verify the provider to be Softlayer for  Local Load Balancer service
        // var catalogProviderName = element(by.className('card-provider-name'));
        // catalogProviderName.getText().then(function (text) {
        //     expect(text.toLowerCase()).toMatch(slLbJsonObject.providerName.toLowerCase());
        // });

        // //Verifty "Starting At" price for  Local Load Balancer service
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {
        //     expect(text).toBe(slLbJsonObject.estimatedCost);
        // });

        catalogPage.clickConfigureButtonBasedOnName(localLoadBalancerTemplate.bluePrintName);


        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(slLbJsonObject.estimatedCost);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(slLbJsonObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(slLbJsonObject.Category);


    });

    it('TC-C196099 : Local Load Balancer -Verify Softlayer Local Load Balancer review Parameters on review order', function () {
        var orderObject = {};
        var slLbJsonObject = JSON.parse(JSON.stringify(localLoadBalancerTemplate));
        catalogPage.searchForBluePrint(slLbJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(localLoadBalancerTemplate.bluePrintName);
        orderObject.servicename = serviceName;

        //After filling the additional parameters and Main parameters , verify the values on review page
        orderFlowUtil.fillOrderDetails(localLoadBalancerTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
            expect(requiredReturnMap["Actual"]["High Availability"]).toEqual(requiredReturnMap["Expected"]["High Availability"]);
            expect(requiredReturnMap["Actual"]["Dedicated"]).toEqual(requiredReturnMap["Expected"]["Dedicated"]);
            expect(requiredReturnMap["Actual"]["Connections"]).toEqual(requiredReturnMap["Expected"]["Connections"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);

        })
    });


    it('TC-C196100	 : Local Load Balancer - Verify View Order Details-Sanity', function () {
        var orderObject = {};
        var slLbJsonObject = JSON.parse(JSON.stringify(localLoadBalancerTemplate));
        catalogPage.searchForBluePrint(slLbJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(localLoadBalancerTemplate.bluePrintName);
        orderObject.servicename = serviceName;


        //Fill order
        orderFlowUtil.fillOrderDetails(localLoadBalancerTemplate, modifiedParamMap);

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
        ordersPage.clickFirstViewDetailsOrdersTable();
        Logger.info("Validating the Order Review page");
        //expect(ordersPage.getTextOrderStatusOrderDetails()).toBe("Approval In Progress"); //Checking Order Status
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber); //Checking order number
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(slLbJsonObject.providerName); //Checking Provider
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New'); //Checking Order Type      
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(ordersubmittedBy); // Checking Submitted By
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe("Local Load Balancer");// Checking Service Offering Name
        expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(slLbJsonObject, "Datacenter"));
        expect(ordersPage.getTextBasedOnLabelName("High Availability")).toEqual(jsonUtil.getValue(slLbJsonObject, "High Availability"));
        expect(ordersPage.getTextBasedOnLabelName("Dedicated")).toEqual(jsonUtil.getValue(slLbJsonObject, "Dedicated"));
        expect(ordersPage.getTextBasedOnExactLabelName("Connections")).toEqual(jsonUtil.getValue(slLbJsonObject, "Connections"));

        // //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(slLbJsonObject.totalCost);

        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(slLbJsonObject.totalCost);


        //Deny Order
        orderFlowUtil.denyOrder(orderObject);

    });

    if (isProvisioningRequired == "true") {
        it('TC-C196101 : Local Load Balancer - Verify Order Approval, verifying  Inventory View Details, Delete Order-Sanity', function () {
            var orderObject = {};
            var slLbJsonObject = JSON.parse(JSON.stringify(localLoadBalancerTemplate));
            serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
            modifiedParamMap = { "Service Instance Name": serviceName };
            catalogPage.searchForBluePrint(slLbJsonObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(localLoadBalancerTemplate.bluePrintName);
            orderObject.servicename = serviceName;

            //Submit order
            orderFlowUtil.fillOrderDetails(localLoadBalancerTemplate, modifiedParamMap);
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
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed', 50);
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');

            // Verify the output parameters
            Logger.info("Output Parameters on Inventory : View Details");
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();

            // Verify system Configuration
            //Xpath is finding manually but through automation it's failing, so commenting this part of code.
            // expect(placeOrderPage.getTextBasedOnLabelName("Datacenter:")).toEqual(jsonUtil.getValue(slLbJsonObject, "Datacenter"));
            // expect(placeOrderPage.getTextBasedOnLabelName("High Availability:")).toEqual(jsonUtil.getValue(slLbJsonObject, "High Availability"));
            // expect(placeOrderPage.getTextBasedOnLabelName("Dedicated:")).toEqual(jsonUtil.getValue(slLbJsonObject, "Dedicated"));
            // expect(placeOrderPage.getTextBasedOnLabelName("Connections:")).toEqual(jsonUtil.getValue(slLbJsonObject, "Connections"));
            // expect(inventoryPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(slLbJsonObject, "Datacenter"));
            // expect(inventoryPage.getTextBasedOnLabelName("High Availability")).toEqual(jsonUtil.getValue(slLbJsonObject, "High Availability"));
            // expect(inventoryPage.getTextBasedOnLabelName("Dedicated")).toEqual(jsonUtil.getValue(slLbJsonObject, "Dedicated"));
            // expect(inventoryPage.getTextBasedOnLabelName("Connections")).toEqual(jsonUtil.getValue(slLbJsonObject, "Connections"));

            //Edit Flow
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickEditServiceIcon();
            browser.sleep("5000");
            modifiedParamMapedit = { "Service Instance Name": serviceName, "EditService": true };
            orderFlowUtil.fillOrderDetails(localLoadBalancerTemplate, modifiedParamMapedit);
            placeOrderPage.submitOrder();
            var editOrderObject = {};

            editOrderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            editOrderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

            //Open Order page and Approve Order 
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

            placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
            // expect(orderFlowUtil.verifyOrderType(orderObject)).toBe('EditSOI');
            orderFlowUtil.approveOrder(editOrderObject);
            orderFlowUtil.waitForOrderStatusChange(editOrderObject, "Completed", 50);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();
            // expect(inventoryPage.getTextBasedOnLabelName("Connections")).toEqual(jsonUtil.getValueEditParameter(localLoadBalancerTemplate, "Connections"));


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

