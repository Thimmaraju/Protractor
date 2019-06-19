/*
* Test Cases for automation of IBM Cloud Load Balancer Service
* Author: Gayatri Hungund
* Date: 07/03/2018 
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
    cloudLoadBalancerTemplate = require('../../../../testData/OrderIntegration/Softlayer/IBMCloudLoadBalancer.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Tests for Softlayer : IBM Cloud Load Balancer Service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, modifiedParamMapedit;
    var modifiedParamMap = {};
    var modifiedParamMap = {};
    var Name = "GSLSLtestAutomation" + util.getRandomString(4);
    var messageStrings = { providerName: 'IBM Cloud', category: 'Network' };
    var cloudLoadBalancerObject = JSON.parse(JSON.stringify(cloudLoadBalancerTemplate));

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
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": Name };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(cloudLoadBalancerObject.Category);
    });

    it('TC-C198681 : IBM Cloud Load Balancer - Verify Softlayer IBM Cloud Load Balancer Service Main Page parameters', function () {
        var orderObject = {};
        var cloudLoadBalancerObject = JSON.parse(JSON.stringify(cloudLoadBalancerTemplate));
        catalogPage.searchForBluePrint(cloudLoadBalancerTemplate.bluePrintName);

        catalogPage.clickConfigureButtonBasedOnName(cloudLoadBalancerObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(cloudLoadBalancerObject.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(cloudLoadBalancerObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(cloudLoadBalancerObject.Category);  
    });

    it('TC-C198683: IBM Cloud Load Balancer - Verify Softlayer IBM CLoud Load Balancer Service Additional Parameters on review order', function () {
        var cloudLoadBalancerObject = JSON.parse(JSON.stringify(cloudLoadBalancerTemplate));
        var orderObject = {};
        var randomString = util.getRandomString(4);
        catalogPage.searchForBluePrint(cloudLoadBalancerTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(cloudLoadBalancerTemplate.bluePrintName);

        //Fill order details and Submit order
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(cloudLoadBalancerTemplate, modifiedParamMap).then(function (requiredReturnMap) {//Verify input values on Review Order page
            // expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(cloudLoadBalancerTemplate.providerName);
            // expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(cloudLoadBalancerTemplate.Category);
            expect(requiredReturnMap["Actual"]["Data Center"]).toEqual(requiredReturnMap["Expected"]["Data Center"]);
            expect(requiredReturnMap["Actual"]["Frontend Port"]).toEqual(requiredReturnMap["Expected"]["Frontend Port"]);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Backend Protocol"]).toEqual(requiredReturnMap["Expected"]["Backend Protocol"]);
            expect(requiredReturnMap["Actual"]["Private Subnets(back end server side)"]).toEqual(requiredReturnMap["Expected"]["Private Subnets(back end server side)"]);
            expect(requiredReturnMap["Actual"]["Backend Port"]).toEqual(requiredReturnMap["Expected"]["Backend Port"]);
            expect(requiredReturnMap["Actual"]["Load Balancer Method"]).toEqual(requiredReturnMap["Expected"]["Load Balancer Method"]);
            expect(requiredReturnMap["Actual"]["Frontend Protocol"]).toEqual(requiredReturnMap["Expected"]["Frontend Protocol"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
 
        });

    });

    it('TC-C198684: Verify View Order Details for IBM Cloud Load Balancer Service', function () {
        var cloudLoadBalancerObject = JSON.parse(JSON.stringify(cloudLoadBalancerTemplate));
        var orderObject = {};
        catalogPage.searchForBluePrint(cloudLoadBalancerTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(cloudLoadBalancerTemplate.bluePrintName);

        orderFlowUtil.fillOrderDetails(cloudLoadBalancerTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        var orderSubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        //Navigate to Order Page
        ordersPage.open();
        //browser.wait(EC.visibilityOf(element(by.xpath(".//span[. = 'Order Id']"))), 5000);
        //Search by Order ID and verify the parameters on View order page
        ordersPage.searchOrderById(orderObject.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();

        //Verfiy presence of correct order number
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber);

        //Verify presence of correct provider
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(cloudLoadBalancerObject.providerName);

        //Verify Order Type
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');

        //Verify presence of correct Service Name
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(cloudLoadBalancerObject.bluePrintName);

        //Verify presence of correct Total Cost
        // expect(ordersPage.getTextTotalCostOrderDetails()).toBe(cloudLoadBalancerObject.totalCost);

        //Verify presence of Order Submitted By correct user
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

        //Verify presence of correct team
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(cloudLoadBalancerObject, "Team"));

        expect(ordersPage.getTextBasedOnLabelName("Data Center")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject, "Data Center"));
        expect(ordersPage.getTextBasedOnLabelName("Frontend Port")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject, "Frontend Port"));
        //expect(ordersPage.getTextBasedOnLabelName("Name")).toEqual(Name);
        expect(ordersPage.getTextBasedOnLabelName("Backend Protocol")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject, "Backend Protocol"));
        //expect(ordersPage.getTextBasedOnLabelName("Private Subnets(back end server side)")).toContain(jsonUtil.getValue(cloudLoadBalancerObject,"Private Subnets(back end server side)"));
        expect(ordersPage.getTextBasedOnLabelName("Backend Port")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject, "Backend Port"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancer Method")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject, "Load Balancer Method"));
        expect(ordersPage.getTextBasedOnLabelName("Frontend Protocol")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject, "Frontend Protocol"));

        // //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(cloudLoadBalancerObject.totalCost);

        //Verify Deny Order Flow
        orderFlowUtil.denyOrder(orderObject);
    });

    //Commenting the code for provisioning cloud Load Balancer as it takes more than 10 mins for provisioning
    if (isProvisioningRequired == "true") {
        it('TC-C198708 : IBM Cloud Load Balancer - Verify provisioning of IBM Cloud Load Balancer from Consume UI', function () {
            var cloudLoadBalancerObject = JSON.parse(JSON.stringify(cloudLoadBalancerTemplate));
            var orderObject = {};
            catalogPage.searchForBluePrint(cloudLoadBalancerTemplate.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(cloudLoadBalancerTemplate.bluePrintName);

            //Fill order details and Submit order
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(cloudLoadBalancerTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            //browser.wait(EC.visibilityOf($('#button-submit-button-reviewOrder')));
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

            //Get details on pop up after submit
            var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            //var orderdate = placeOrderPage.getTextOrderedDateOrderSubmittedModal();
            var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
            var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

            //Open Order page and Approve Order 
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 350);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();
            // expect(placeOrderPage.getTextBasedOnLabelName(" Data Center:  ")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject,"Data Center"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Frontend Port:  ")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject,"Frontend Port"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Name:  ")).toEqual(Name);
            // expect(placeOrderPage.getTextBasedOnLabelName(" Backend Protocol:  ")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject,"Backend Protocol"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Private Subnets(back end server side):  ")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject,"Private Subnets(back end server side)"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Backend Port:  ")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject,"Backend Port"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Load Balancer Method:  ")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject,"Load Balancer Method"));
            // expect(placeOrderPage.getTextBasedOnLabelName(" Frontend Protocol:  ")).toEqual(jsonUtil.getValue(cloudLoadBalancerObject,"Frontend Protocol"));

            //Edit Flow
            var orderObject_editService = {};
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickEditServiceIcon();
            browser.sleep("5000");
            modifiedParamMapedit = { "Service Instance Name": serviceName, "EditService": true };
            orderFlowUtil.fillOrderDetails(cloudLoadBalancerTemplate, modifiedParamMapedit);
            placeOrderPage.submitOrder();

            orderObject_editService.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject_editService.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();


            //Open Order page and Approve Order 
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

            // placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
            expect(orderFlowUtil.verifyOrderType(orderObject_editService)).toBe('EditSOI');
            orderFlowUtil.approveOrder(orderObject_editService);
            orderFlowUtil.waitForOrderStatusChange(orderObject_editService, "Completed", 50);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();


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
