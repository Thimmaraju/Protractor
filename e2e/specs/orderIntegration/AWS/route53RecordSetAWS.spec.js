
"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    appUrls = require('../../../../testData/appUrls.json'),
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

    route53RecordsetInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSRoute53Recordset.json');

describe('AWS - Route 53 : RecordSet', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, recordsetDomainName, RecordsetINSObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Network',
        catalogPageTitle: 'Search, Select and Configure',
        inputServiceNameWarning: "Parameter Warning:",
        orderSubmittedConfirmationMessage: 'Order Submitted !',
    };

    beforeAll(function () {
        ordersPage = new Orders();
        homePage = new HomePage();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        RecordsetINSObject = JSON.parse(JSON.stringify(route53RecordsetInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        recordsetDomainName = "recordset" + util.getRandomString(5) + ".myexample.com";
        recordsetDomainName = recordsetDomainName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Name": recordsetDomainName };
    });

    it('TC-T342222 : Route 53 RecordSet - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(route53RecordsetInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(route53RecordsetInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(RecordsetINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(route53RecordsetInstanceTemplate.BasePrice);
    });

    it('TC-T342223 : Route 53 RecordSet - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(route53RecordsetInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(route53RecordsetInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(route53RecordsetInstanceTemplate.EstimatedPrice);
            expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Type"]).toEqual(requiredReturnMap["Expected"]["Type"]);
            expect(requiredReturnMap["Actual"]["Alias"]).toEqual(requiredReturnMap["Expected"]["Alias"]);
            expect(requiredReturnMap["Actual"]["TTL(Seconds)"]).toEqual(requiredReturnMap["Expected"]["TTL(Seconds)"]);
            expect(requiredReturnMap["Actual"]["Value"]).toEqual(requiredReturnMap["Expected"]["Value"]);
            expect(requiredReturnMap["Actual"]["Routing Policy"]).toEqual(requiredReturnMap["Expected"]["Routing Policy"]);
            expect(requiredReturnMap["Actual"]["Hosted Zone Domain Name"]).toEqual(requiredReturnMap["Expected"]["Hosted Zone Domain Name"]);
        });
    });

    it('TC-T342224 : Route 53 RecordSet - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(route53RecordsetInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(route53RecordsetInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            placeOrderPage.submitOrder();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            ordersPage.open();
            expect(util.getCurrentURL()).toMatch('orders');
            ordersPage.searchOrderById(orderObject.orderNumber);
            expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
            ordersPage.clickFirstViewDetailsOrdersTable();
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
            expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
            expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
            expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
            // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(route53RecordsetInstanceTemplate.bluePrintName);
            // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(RecordsetINSObject, "Team"));
            // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
            //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
            expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
            util.waitForAngular();
            expect(ordersPage.getTextBasedOnExactLabelName("AWS Region")).toEqual(jsonUtil.getValue(RecordsetINSObject, "AWS Region"));
            expect(ordersPage.getTextBasedOnExactLabelName("Name")).toEqual(recordsetDomainName);
            expect(ordersPage.getTextBasedOnExactLabelName("Hosted Zone Domain Name")).toEqual(jsonUtil.getValue(RecordsetINSObject, "Hosted Zone Domain Name"));
            expect(ordersPage.getTextBasedOnExactLabelName("Type")).toEqual(jsonUtil.getValue(RecordsetINSObject, "Type"));
            expect(ordersPage.getTextBasedOnExactLabelName("Alias")).toEqual(jsonUtil.getValue(RecordsetINSObject, "Alias"));
            expect(ordersPage.getTextBasedOnExactLabelName("TTL(Seconds)")).toEqual(jsonUtil.getValue(RecordsetINSObject, "TTL(Seconds)"));
            expect(ordersPage.getTextBasedOnExactLabelName("Value")).toEqual(jsonUtil.getValue(RecordsetINSObject, "Value"));
            expect(ordersPage.getTextBasedOnExactLabelName("Routing Policy")).toEqual(jsonUtil.getValue(RecordsetINSObject, "Routing Policy"));
            ordersPage.clickBillOfMaterialsTabOrderDetails();
            expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(route53RecordsetInstanceTemplate.TotalCost);
        });
    });

    if (isProvisioningRequired == "true") {
        it('TC-T342225 : Route 53 RecordSet - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(route53RecordsetInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName
            orderFlowUtil.fillOrderDetails(route53RecordsetInstanceTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    var modifiedParamMap = { "EditService": true };
                    orderFlowUtil.editService(orderObject);
                    orderFlowUtil.fillOrderDetails(route53RecordsetInstanceTemplate, modifiedParamMap).then(function () {
                        logger.info("Edit parameter details are filled.");
                        browser.sleep(5000);
                    });
                    placeOrderPage.submitOrder();
                    orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                    expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                    placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                    orderFlowUtil.approveOrder(orderObject);
                    orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
                    orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                        if (status == 'Completed') {
                            //Verify updated details are reflected on order details page.						
                            ordersPage.clickFirstViewDetailsOrdersTable();
                            expect(ordersPage.getTextBasedOnExactLabelName("Type")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Type"));
                            expect(ordersPage.getTextBasedOnExactLabelName("TTL(Seconds)")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "TTL(Seconds)"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Value")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Value"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Routing Policy")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Routing Policy"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Location"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Continent Code")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Continent Code"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Set ID")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Set ID"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Associate with Health Check")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Associate with Health Check"));
                            expect(ordersPage.getTextBasedOnExactLabelName("Health Check to Associate")).toEqual(jsonUtil.getValueEditParameter(RecordsetINSObject, "Health Check to Associate"));
                            //Delete Service flow
                            orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                            //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                            orderFlowUtil.approveDeletedOrder(orderObject);
                            orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                        }
                    });
                }
            })
        });
    }
})