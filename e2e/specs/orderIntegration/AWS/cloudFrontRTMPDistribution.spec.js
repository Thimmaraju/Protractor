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
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    cloudFrontRTMPDistributionTemplate = require('../../../../testData/OrderIntegration/AWS/AWSCloudFrontRTMPDistribution.json');

describe('AWS - CloudFrtRTMP', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, CloudFrontRTMPObject;
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
        CloudFrontRTMPObject = JSON.parse(JSON.stringify(cloudFrontRTMPDistributionTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
    });

    it('TC-C176393 : AWS CloudFrtRTMP - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontRTMPDistributionTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(cloudFrontRTMPDistributionTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(CloudFrontRTMPObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(CloudFrontRTMPObject.BasePrice);
    });

    it('TC-C176394 : AWS CloudFrtRTMP - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontRTMPDistributionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudFrontRTMPDistributionTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(cloudFrontRTMPDistributionTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Origin Domain Name"]).toEqual(requiredReturnMap["Expected"]["Origin Domain Name"]);
            expect(requiredReturnMap["Actual"]["Origin Access Identity"]).toEqual(requiredReturnMap["Expected"]["Origin Access Identity"]);
            expect(requiredReturnMap["Actual"]["Restrict Viewer Access"]).toEqual(requiredReturnMap["Expected"]["Restrict Viewer Access"]);
            expect(requiredReturnMap["Actual"]["Comment"]).toEqual(requiredReturnMap["Expected"]["Comment"]);
            expect(requiredReturnMap["Actual"]["Distribution State"]).toEqual(requiredReturnMap["Expected"]["Distribution State"]);
            expect(requiredReturnMap["Actual"]["Price Class"]).toEqual(requiredReturnMap["Expected"]["Price Class"]);
            expect(requiredReturnMap["Actual"]["Alternate Domain Names"]).toEqual(requiredReturnMap["Expected"]["Alternate Domain Names"]);
            expect(requiredReturnMap["Actual"]["Logging"]).toEqual(requiredReturnMap["Expected"]["Logging"]);
        });
    });

    it('TC-C176395 : AWS CloudFrtRTMP - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontRTMPDistributionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudFrontRTMPDistributionTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(cloudFrontRTMPDistributionTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Origin Domain Name")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Origin Domain Name"));
        expect(ordersPage.getTextBasedOnLabelName("Origin Access Identity")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Origin Access Identity"));
        expect(ordersPage.getTextBasedOnLabelName("Restrict Viewer Access")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Restrict Viewer Access"));
        expect(ordersPage.getTextBasedOnLabelName("Price Class")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Price Class"));
        expect(ordersPage.getTextBasedOnLabelName("Alternate Domain Names")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Alternate Domain Names"));
        expect(ordersPage.getTextBasedOnLabelName("Logging")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Logging"));
        expect(ordersPage.getTextBasedOnLabelName("Distribution State")).toEqual(jsonUtil.getValue(CloudFrontRTMPObject, "Distribution State"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(cloudFrontRTMPDistributionTemplate.TotalCost);
    });

    //Order Provisioning taking more than 15-20 min,which is not advisable to run on Jenkins.
    //So as discussed in DSM we are commenting out this test case as of now.
    /*
     if (isProvisioningRequired == "true") {
    it('TC-C176396 : AWS CloudFrtRTMP : Verify instance Order Provision and Deletion is working fine from consume App', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontRTMPDistributionTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(cloudFrontRTMPDistributionTemplate, modifiedParamMap);
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
                orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                orderFlowUtil.approveDeletedOrder(orderObject);
                orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
            }
        })
    });
}
*/
})