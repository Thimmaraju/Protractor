/*************************************************
DESCRIPTION: The test script verifies the Multi VLAN Firewall Service functionality      
AUTHOR: SAMPADA

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
    multiVLANFirewallTemplate = require('../../../../testData/OrderIntegration/Softlayer/MultiVLANFirewall.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Softlayer : Multi VLAN Firewall', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, firewallName;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Security & Identity' };
    var slMVFJsonObject = JSON.parse(JSON.stringify(multiVLANFirewallTemplate));

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
        firewallName = "GSLSLTestMultiVLAN" + util.getRandomString(3);
        modifiedParamMap = { "Service Instance Name": serviceName, "Firewall Name": firewallName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(slMVFJsonObject.Category);

    });

    it('TC-C196102 : Multi VLAN Firewall - Verify Softlayer Multi VLAN Firewall Main Page parameters', function () {
        var orderObject = {};
        var slMVFJsonObject = JSON.parse(JSON.stringify(multiVLANFirewallTemplate));
        catalogPage.searchForBluePrint(slMVFJsonObject.bluePrintName);

        //Verify correct service name is displayed on the catalog page for  Multi VLAN Firewall service
        // var softlayerServiceName = element(by.css('#card-title-2'));
        // softlayerServiceName.getText().then(function (text) {
        //     expect(text).toMatch(slMVFJsonObject.bluePrintName);
        // });

        // //Verifty "Starting At" price for  Multi VLAN Firewall service        
        // var catalogEstimatedPrice = element(by.className('service-price'));
        // catalogEstimatedPrice.getText().then(function (text) {
        //     expect(text).toBe(slMVFJsonObject.estimatedCost);
        // });

        catalogPage.clickConfigureButtonBasedOnName(multiVLANFirewallTemplate.bluePrintName);


        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(slMVFJsonObject.estimatedCost);

        //Verify correct Provider name is displayed
        // expect(placeOrderPage.getTextProvider()).toBe(slMVFJsonObject.providerName);

        //Verify correct Category name is displayed
        // expect(placeOrderPage.getTextCategory()).toBe(slMVFJsonObject.Category);


    });

    it('TC-C196103	: Multi VLAN Firewall -Verify Softlayer Multi VLAN Firewall review Parameters on review order', function () {
        var orderObject = {};
        var slMVFJsonObject = JSON.parse(JSON.stringify(multiVLANFirewallTemplate));
        catalogPage.searchForBluePrint(slMVFJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(multiVLANFirewallTemplate.bluePrintName);
        orderObject.servicename = serviceName;

        //After filling the additional parameters and Main parameters , verify the values on review page
        orderFlowUtil.fillOrderDetails(multiVLANFirewallTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(requiredReturnMap["Actual"]["Firewall Name"]).toEqual(requiredReturnMap["Expected"]["Firewall Name"]);
            expect(requiredReturnMap["Actual"]["Firewall Type"]).toEqual(requiredReturnMap["Expected"]["Choose Firewall Type"]);
            //Value changes dynamically-- expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Location Details"]);
            //Value changes dynamically--expect(requiredReturnMap["Actual"]["POD"]).toEqual(requiredReturnMap["Expected"]["Select Pod"]);

            //Checking Service Details in ReviewOrder
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);

        })
    });


    it('TC-C196104 : Multi VLAN Firewall - Verify View Order Details', function () {
        var orderObject = {};
        var slMVFJsonObject = JSON.parse(JSON.stringify(multiVLANFirewallTemplate));
        catalogPage.searchForBluePrint(slMVFJsonObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(multiVLANFirewallTemplate.bluePrintName);
        orderObject.servicename = serviceName;


        //Fill order
        orderFlowUtil.fillOrderDetails(multiVLANFirewallTemplate, modifiedParamMap);

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

        //expect(ordersPage.getTextOrderStatusOrderDetails()).toBe("Approval In Progress"); //Checking Order Status
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber); //Checking order number
        //  expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(slMVFJsonObject.providerName); //Checking Provider
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New'); //Checking Order Type      
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toBe(slMVFJsonObject.serviceName);// Checking Service Offering Name

        //Verify Service Configurations parameters:

        expect(ordersPage.getTextBasedOnLabelName("Firewall Name")).toEqual(firewallName);
        expect(ordersPage.getTextBasedOnLabelName("Firewall Type")).toEqual(jsonUtil.getValue(slMVFJsonObject, "Choose Firewall Type"));
        //Value changes dynamically--  expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(slMVFJsonObject, "Select Datacenter"));
        //Value changes dynamically--    expect(ordersPage.getTextBasedOnLabelName("POD")).toEqual(jsonUtil.getValue(slMVFJsonObject, "Select Pod"));

        // //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        // --Dynamically changes as per availability of POD--expect(placeOrderPage.getTotalCost()).toBe(slMVFJsonObject.totalCost);

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);

    });

    //Commenting the provisioning tc as its cost is high
    // if (isProvisioningRequired == "true") {
    //     it('TC-	C196105 : Multi VLAN Firewall - Verify Order Approval, verifying  Inventory View Details, Delete Order', function () {
    //         var orderObject = {};
    //         var slMVFJsonObject = JSON.parse(JSON.stringify(multiVLANFirewallTemplate));
    //         catalogPage.searchForBluePrint(slMVFJsonObject.bluePrintName);
    //         catalogPage.clickConfigureButtonBasedOnName(multiVLANFirewallTemplate.bluePrintName);
    //         orderObject.servicename = serviceName;

    //         //Fill order
    //         orderFlowUtil.fillOrderDetails(multiVLANFirewallTemplate, modifiedParamMap);

    //         //Submit order
    //         placeOrderPage.submitOrder();
    //         orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    //         orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

    //         //Get details on pop up after submit
    //         var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    //         var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
    //         var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
    //         var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

    //         //Open Order page and Approve Order 
    //         expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    //         placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
    //         orderFlowUtil.approveOrder(orderObject);
    //         orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');

    //         // Verify the output parameters
    //         Logger.info("Output Parameters on Inventory : View Details");
    //         inventoryPage.open();
    //         inventoryPage.searchOrderByServiceName(orderObject.servicename);
    //         element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
    //         inventoryPage.clickViewService();
    //         //Xpath is finding manually but through automation it's failing, so commenting this part of code.
    //         // expect(inventoryPage.getTextBasedOnLabelName("Firewall Name")).toEqual(jsonUtil.getValue(slMVFJsonObject, "Firewall Name"));
    //         // expect(inventoryPage.getTextBasedOnLabelName("Firewall Type")).toEqual(jsonUtil.getValue(slMVFJsonObject, "Choose Firewall Type"));
    //         // expect(inventoryPage.getTextBasedOnLabelName("Select Datacenter")).toEqual(jsonUtil.getValue(slMVFJsonObject, "Select Datacenter"));
    //         //    expect(inventoryPage.getTextBasedOnLabelName("Select Pod")).toEqual(jsonUtil.getValue(slMVFJsonObject, "Select Pod"));

    //         //Delete the provisioned service
    //         orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
    //             if (status == 'Completed') {
    //                 orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
    //                 expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
    //                 orderFlowUtil.approveDeletedOrder(orderObject);
    //                 orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
    //             }
    //         })
    //     })
    // }

});


