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
    cloudFrontWebDistributionTemplate = require('../../../../testData/OrderIntegration/AWS/AWSCloudFrontWebDistribution.json');

describe('AWS - CloudFrtWebDist', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, CloudFrontWebObject;
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
        CloudFrontWebObject = JSON.parse(JSON.stringify(cloudFrontWebDistributionTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
    });

    it('TC-C177198 : AWS CloudFrtWebDist - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontWebDistributionTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(cloudFrontWebDistributionTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(CloudFrontWebObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(cloudFrontWebDistributionTemplate.BasePrice);
    });

    it('TC-C177199 : AWS CloudFrtWebDist - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontWebDistributionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudFrontWebDistributionTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(cloudFrontWebDistributionTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Origin Domain Name Type"]).toEqual(requiredReturnMap["Expected"]["Origin Domain Name Type"]);
            expect(requiredReturnMap["Actual"]["Origin Domain Name For S3"]).toEqual(requiredReturnMap["Expected"]["Origin Domain Name For S3"]);
            expect(requiredReturnMap["Actual"]["Origin Path"]).toEqual(requiredReturnMap["Expected"]["Origin Path"]);
            expect(requiredReturnMap["Actual"]["Origin ID"]).toEqual(requiredReturnMap["Expected"]["Origin ID"]);
            expect(requiredReturnMap["Actual"]["Origin Access Identity"]).toEqual(requiredReturnMap["Expected"]["Origin Access Identity"]);
            expect(requiredReturnMap["Actual"]["Comment"]).toEqual(requiredReturnMap["Expected"]["Comment"]);
            expect(requiredReturnMap["Actual"]["Origin Custom Headers"]).toEqual(requiredReturnMap["Expected"]["Origin Custom Headers"]);
            expect(requiredReturnMap["Actual"]["Viewer Protocol Policy"]).toEqual(requiredReturnMap["Expected"]["Viewer Protocol Policy"]);
            expect(requiredReturnMap["Actual"]["Allowed HTTP Methods"]).toEqual(requiredReturnMap["Expected"]["Allowed HTTP Methods"]);
            expect(requiredReturnMap["Actual"]["Cache Basedon Selected Request Headers"]).toEqual(requiredReturnMap["Expected"]["Cache Basedon Selected Request Headers"]);
            expect(requiredReturnMap["Actual"]["Object Caching"]).toEqual(requiredReturnMap["Expected"]["Object Caching"]);
            expect(requiredReturnMap["Actual"]["Forward Cookies"]).toEqual(requiredReturnMap["Expected"]["Forward Cookies"]);
            expect(requiredReturnMap["Actual"]["Query String Forwarding And Caching"]).toEqual(requiredReturnMap["Expected"]["Query String Forwarding And Caching"]);
            expect(requiredReturnMap["Actual"]["Query String"]).toEqual(requiredReturnMap["Expected"]["Query String"]);
            expect(requiredReturnMap["Actual"]["Smooth Streaming"]).toEqual(requiredReturnMap["Expected"]["Smooth Streaming"]);
            expect(requiredReturnMap["Actual"]["Restrict Viewer Access"]).toEqual(requiredReturnMap["Expected"]["Restrict Viewer Access"]);
            expect(requiredReturnMap["Actual"]["Compress Objects Automatically"]).toEqual(requiredReturnMap["Expected"]["Compress Objects Automatically"]);
            expect(requiredReturnMap["Actual"]["Lambda Function Associations"]).toEqual(requiredReturnMap["Expected"]["Lambda Function Associations"]);
            expect(requiredReturnMap["Actual"]["Price Class"]).toEqual(requiredReturnMap["Expected"]["Price Class"]);
            expect(requiredReturnMap["Actual"]["Alternate Domain Names"]).toEqual(requiredReturnMap["Expected"]["Alternate Domain Names"]);
            expect(requiredReturnMap["Actual"]["WAF Web ACL"]).toEqual(requiredReturnMap["Expected"]["WAF Web ACL"]);
            expect(requiredReturnMap["Actual"]["Supported HTTP Versions"]).toEqual(requiredReturnMap["Expected"]["Supported HTTP Versions"]);
            expect(requiredReturnMap["Actual"]["Default Root Object"]).toEqual(requiredReturnMap["Expected"]["Default Root Object"]);
            expect(requiredReturnMap["Actual"]["Logging"]).toEqual(requiredReturnMap["Expected"]["Logging"]);
            expect(requiredReturnMap["Actual"]["Enable IPv6"]).toEqual(requiredReturnMap["Expected"]["Enable IPv6"]);
            expect(requiredReturnMap["Actual"]["Comment"]).toEqual(requiredReturnMap["Expected"]["Comment"]);
            expect(requiredReturnMap["Actual"]["Distribution State"]).toEqual(requiredReturnMap["Expected"]["Distribution State"]);
        });
    });

    it('TC-C177200 : AWS CloudFrtWebDist - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontWebDistributionTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudFrontWebDistributionTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(cloudFrontWebDistributionTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnExactLabelName("AWS Region")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnExactLabelName("Origin Domain Name Type")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Origin Domain Name Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("Origin Domain Name For S3")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Origin Domain Name For S3"));
        expect(ordersPage.getTextBasedOnExactLabelName("Origin Path")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Origin Path"));
        expect(ordersPage.getTextBasedOnExactLabelName("Origin ID")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Origin ID"));
        expect(ordersPage.getTextBasedOnExactLabelName("Origin Access Identity")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Origin Access Identity"));
        expect(ordersPage.getTextBasedOnExactLabelName("Origin Custom Headers")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Origin Custom Headers"));
        expect(ordersPage.getTextBasedOnExactLabelName("Viewer Protocol Policy")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Viewer Protocol Policy"));
        expect(ordersPage.getTextBasedOnExactLabelName("Allowed HTTP Methods")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Allowed HTTP Methods"));
        expect(ordersPage.getTextBasedOnExactLabelName("Cache Based On Selected Request Headers")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Cache Based On Selected Request Headers"));
        expect(ordersPage.getTextBasedOnExactLabelName("Object Caching")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Object Caching"));
        expect(ordersPage.getTextBasedOnExactLabelName("Forward Cookies")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Forward Cookies"));
        expect(ordersPage.getTextBasedOnExactLabelName("Query String Forwarding And Caching")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Query String Forwarding And Caching"));
        expect(ordersPage.getTextBasedOnExactLabelName("Query String")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Query String"));
        expect(ordersPage.getTextBasedOnExactLabelName("Smooth Streaming")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Smooth Streaming"));
        expect(ordersPage.getTextBasedOnExactLabelName("Restrict Viewer Access")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Restrict Viewer Access"));
        expect(ordersPage.getTextBasedOnExactLabelName("Compress Objects Automatically")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Compress Objects Automatically"));
        expect(ordersPage.getTextBasedOnExactLabelName("Lambda Function Associations")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Lambda Function Associations"));
        expect(ordersPage.getTextBasedOnExactLabelName("Price Class")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Price Class"));
        expect(ordersPage.getTextBasedOnExactLabelName("WAF Web ACL")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "WAF Web ACL"));
        expect(ordersPage.getTextBasedOnExactLabelName("Alternate Domain Names")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Alternate Domain Names"));
        expect(ordersPage.getTextBasedOnExactLabelName("Supported HTTP Versions")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Supported HTTP Versions"));
        expect(ordersPage.getTextBasedOnExactLabelName("Default Root Object")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Default Root Object"));
        expect(ordersPage.getTextBasedOnExactLabelName("Logging")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Logging"));
        expect(ordersPage.getTextBasedOnExactLabelName("Enable IPv6")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Enable IPv6"));
        expect(ordersPage.getTextBasedOnExactLabelName("Distribution State")).toEqual(jsonUtil.getValue(CloudFrontWebObject, "Distribution State"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(cloudFrontWebDistributionTemplate.TotalCost);
    });

    //Order Provisioning taking more than 15-20 min,which is not advisable to run on Jenkins.
    //So as discussed in DSM we are commenting out this test case as of now.
    /*
     if (isProvisioningRequired == "true") {
    it('TC-C177201: AWS CloudFrtWebDist : Verify instance Order Provision and Deletion is working fine from consume App', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudFrontWebDistributionTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(cloudFrontWebDistributionTemplate, modifiedParamMap);
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