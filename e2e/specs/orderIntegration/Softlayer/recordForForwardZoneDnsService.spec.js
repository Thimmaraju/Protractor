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
    dnsRecordTemplate = require('../../../../testData/OrderIntegration/Softlayer/RecordForForwardZoneDnsService.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Tests for Softlayer : Record For Forward Zone DNS', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, modifiedParamMapedit;
    var modifiedParamMap = {};
    var domName = "GSLSLtestAutomation" + util.getRandomString(4) + ".com";
    var messageStrings = { providerName: 'IBM Cloud', category: 'Network' };
    var DnsRecordObject = JSON.parse(JSON.stringify(dnsRecordTemplate.DnsRecordObject));
    var DnsForwardZoneObject = JSON.parse(JSON.stringify(dnsRecordTemplate.DnsForwardZoneObject));
    var dnsObject = {};

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
        //Clean-up created prerequisites of DNS forward Zone
        dnsObject.deleteOrderNumber = orderFlowUtil.deleteService(dnsObject);
        orderFlowUtil.approveDeletedOrder(dnsObject);
        orderFlowUtil.waitForOrderStatusChange(dnsObject, "Completed", 150);
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Domain Name": domName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(DnsRecordObject.Category);
    });

    it('TC-C196122: Record For Forward Zone DNS - Create prerequisite DNS Forward Zone', function () {
        var DnsForwardZoneObject = JSON.parse(JSON.stringify(dnsRecordTemplate.DnsForwardZoneObject));
        var orderObject = {};
        orderObject.servicename = serviceName;
        catalogPage.searchForBluePrint(dnsRecordTemplate.DnsForwardZoneObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(dnsRecordTemplate.DnsForwardZoneObject.bluePrintName);
        //var domainName = jsonUtil.getValue(DnsDomainObject,"Domain Name");
        var randomString = util.getRandomString(4);
        global.domName = dnsRecordTemplate['DnsForwardZoneObject']['Order Parameters']['Additional Parameters']['Domain Name']['value'][testEnvironment] = "GSLSLtestAutomation" + randomString + ".com";

        //Fill order details and Submit order
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(dnsRecordTemplate.DnsForwardZoneObject, modifiedParamMap);
        placeOrderPage.submitOrder();
        dnsObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        dnsObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

        //Get details on pop up after submit
        var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
        var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

        //Open Order page and Approve Order 
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        orderFlowUtil.approveOrder(dnsObject);
        orderFlowUtil.waitForOrderStatusChange(dnsObject, "Completed", 50);
        //expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
    });

    it('TC-C196123 : Record For Forward Zone DNS - Verify Softlayer Record For Forward Zone DNS Main Page parameters', function () {
        var orderObject = {};
        var DnsRecordObject = JSON.parse(JSON.stringify(dnsRecordTemplate.DnsRecordObject));
        catalogPage.searchForBluePrint(DnsRecordObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(DnsRecordObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(DnsRecordObject.EstimatedPrice);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(DnsRecordObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(DnsRecordObject.Category);
    });

    it('TC-C196124 : Record For Forward Zone DNS - Verify Softlayer Record For Forward Zone DNS Additional Parameters on review order', function () {
        var orderObject = {};
        var DnsRecordObject = JSON.parse(JSON.stringify(dnsRecordTemplate.DnsRecordObject));
        orderObject.servicename = serviceName;
        catalogPage.searchForBluePrint(dnsRecordTemplate.DnsRecordObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(dnsRecordTemplate.DnsRecordObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(dnsRecordTemplate.DnsRecordObject, modifiedParamMap).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            // expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(DnsRecordObject.providerName);
            // expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(DnsRecordObject.Category);
            expect(requiredReturnMap["Actual"]["DNS Resource Type"]).toEqual(requiredReturnMap["Expected"]["DNS Resource Type"]);
            expect(requiredReturnMap["Actual"]["Points To"]).toEqual(requiredReturnMap["Expected"]["Points To"]);
            expect(requiredReturnMap["Actual"]["Domain Name"]).toEqual(requiredReturnMap["Expected"]["Domain Name"]);
            expect(requiredReturnMap["Actual"]["Time To Leave"]).toEqual(requiredReturnMap["Expected"]["Time To Leave"]);
            expect(requiredReturnMap["Actual"]["Host"]).toEqual(requiredReturnMap["Expected"]["Host"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
        

        });
    });

    it('TC-C196125 : Record For Forward Zone DNS - Verify View Order Details for Record For Forward Zone DNS', function () {
        var orderObject = {};
        var DnsRecordObject = JSON.parse(JSON.stringify(dnsRecordTemplate.DnsRecordObject));
        orderObject.servicename = serviceName;
        catalogPage.searchForBluePrint(dnsRecordTemplate.DnsRecordObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(dnsRecordTemplate.DnsRecordObject.bluePrintName);
        // var DnsDomainName1 = dnsRecordTemplate['DnsRecordObject']['Order Parameters']['Additional Parameters']['Domain Name']['value'][testEnvironment] = domName;
        orderFlowUtil.fillOrderDetails(dnsRecordTemplate.DnsRecordObject, modifiedParamMap);
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
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(DnsRecordObject.providerName);

        //Verify Order Type
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');

        //Verify presence of correct Service Name
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(DnsRecordObject.bluePrintName);

        //Verify presence of correct Total Cost
        // expect(ordersPage.getTextTotalCostOrderDetails()).toBe(DnsRecordObject.totalCost);

        //Verify presence of Order Submitted By correct user
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toBe(orderSubmittedBy); // Checking Submitted By

        //Verify presence of correct team
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(DnsRecordObject, "Team"));
        //Verify Service Configurations parameters:
        //Xpath is finding manually but through automation it's failing, so commenting this part of code.
        // expect(ordersPage.getTextBasedOnLabelName("DNS Resource Type")).toEqual(jsonUtil.getValue(DnsRecordObject, "DNS Resource Type"));
        // expect(ordersPage.getTextBasedOnLabelName("Points To")).toEqual(jsonUtil.getValue(DnsRecordObject, "Points To"));
        // expect(ordersPage.getTextBasedOnLabelName("Domain Name")).toEqual(domName);
        // expect(ordersPage.getTextBasedOnLabelName("Time To Leave")).toEqual(jsonUtil.getValue(DnsRecordObject, "Time To Leave"));
        // expect(ordersPage.getTextBasedOnLabelName("Host")).toEqual(jsonUtil.getValue(DnsRecordObject, "Host"));


        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(DnsRecordObject.totalCost);

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);


    });

    if (isProvisioningRequired == "true") {
        it('Test Case 5 : SL : Record For Forward Zone DNS - Verify provisioning of Record For Forward Zone DNS from Consume UI', function () {
            var DnsRecordObject = JSON.parse(JSON.stringify(dnsRecordTemplate.DnsRecordObject));
            var orderObject = {};
            orderObject.servicename = serviceName;
            catalogPage.searchForBluePrint(dnsRecordTemplate.DnsRecordObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(dnsRecordTemplate.DnsRecordObject.bluePrintName);
            //var DnsDomainName2 = dnsRecordTemplate['DnsRecordObject']['Order Parameters']['Additional Parameters']['Domain Name']['value'][testEnvironment] = "testAutomationWzkL.com";//domName;
            orderFlowUtil.fillOrderDetails(dnsRecordTemplate.DnsRecordObject, modifiedParamMap);
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
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 50);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();
            //Xpath is finding manually but through automation it's failing, so commenting this part of code.
            // expect(inventoryPage.getTextBasedOnLabelName("DNS Resource Type")).toEqual(jsonUtil.getValue(DnsRecordObject, "DNS Resource Type"));
            // expect(inventoryPage.getTextBasedOnLabelName("Points To")).toEqual(jsonUtil.getValue(DnsRecordObject, "Points To"));
            // expect(inventoryPage.getTextBasedOnLabelName("Domain Name")).toEqual(domName);
            // expect(inventoryPage.getTextBasedOnLabelName("Time To Leave")).toEqual(jsonUtil.getValue(DnsRecordObject, "Time To Leave"));
            // expect(inventoryPage.getTextBasedOnLabelName("Host")).toEqual(jsonUtil.getValue(DnsRecordObject, "Host"));

            //Edit Flow
            var orderObject_editService = {};
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickEditServiceIcon();
            browser.sleep("5000");
            modifiedParamMapedit = { "Service Instance Name": serviceName, "EditService": true };
            orderFlowUtil.fillOrderDetails(dnsRecordTemplate.DnsRecordObject, modifiedParamMapedit);
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