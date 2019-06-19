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
    cloudTrailInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSCloudTrailInstance.json');

describe('AWS - CloudTrail', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, bucketName, CloudTrailObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Other Services',
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
        CloudTrailObject = JSON.parse(JSON.stringify(cloudTrailInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        bucketName = "buckettestaut" + util.getRandomString(5);
        bucketName = bucketName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "S3 Bucket": bucketName };
    });

    it('TC-C177212 : AWS CloudTrail - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudTrailInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(cloudTrailInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(CloudTrailObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(cloudTrailInstanceTemplate.BasePrice);
    });

    it('TC-C177213 : AWS CloudTrail - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudTrailInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudTrailInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(cloudTrailInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Trail Name"]).toEqual(requiredReturnMap["Expected"]["Trail Name"]);
            expect(requiredReturnMap["Actual"]["Apply Trail To All Regions"]).toEqual(requiredReturnMap["Expected"]["Apply Trail To All Regions"]);
            expect(requiredReturnMap["Actual"]["Read Write Events"]).toEqual(requiredReturnMap["Expected"]["Read Write Events"]);
            expect(requiredReturnMap["Actual"]["Data Resource Type"]).toEqual(requiredReturnMap["Expected"]["Data Resource Type"]);
            expect(requiredReturnMap["Actual"]["Data Resource Values"]).toEqual(requiredReturnMap["Expected"]["Data Resource Values"]);
            expect(requiredReturnMap["Actual"]["Create New S3 Bucket"]).toEqual(requiredReturnMap["Expected"]["Create New S3 Bucket"]);
            expect(requiredReturnMap["Actual"]["S3 Bucket"]).toEqual(requiredReturnMap["Expected"]["S3 Bucket"]);
            expect(requiredReturnMap["Actual"]["Log File Prefix"]).toEqual(requiredReturnMap["Expected"]["Log File Prefix"]);
            expect(requiredReturnMap["Actual"]["Encrypt Log Files"]).toEqual(requiredReturnMap["Expected"]["Encrypt Log Files"]);
            expect(requiredReturnMap["Actual"]["Encryption Configuration"]).toEqual(requiredReturnMap["Expected"]["Encryption Configuration"]);
            expect(requiredReturnMap["Actual"]["KMS Key ARN"]).toEqual(requiredReturnMap["Expected"]["KMS Key ARN"]);
            expect(requiredReturnMap["Actual"]["Enable Log File Validation"]).toEqual(requiredReturnMap["Expected"]["Enable Log File Validation"]);
            expect(requiredReturnMap["Actual"]["SNS Topic ARN"]).toEqual(requiredReturnMap["Expected"]["SNS Topic ARN"]);
        });
    });

    it('TC-C177214 : AWS CloudTrail - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudTrailInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(cloudTrailInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(cloudTrailInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(CloudTrailObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        expect(ordersPage.isDisplayedDenyButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(CloudTrailObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Trail Name")).toEqual(jsonUtil.getValue(CloudTrailObject, "Trail Name"));
        expect(ordersPage.getTextBasedOnLabelName("Apply Trail To All Regions")).toEqual(jsonUtil.getValue(CloudTrailObject, "Apply Trail To All Regions"));
        expect(ordersPage.getTextBasedOnLabelName("Read Write Events")).toEqual(jsonUtil.getValue(CloudTrailObject, "Read Write Events"));
        expect(ordersPage.getTextBasedOnLabelName("Data Resource Type")).toEqual(jsonUtil.getValue(CloudTrailObject, "Data Resource Type"));
        expect(ordersPage.getTextBasedOnLabelName("Data Resource Values")).toEqual(jsonUtil.getValue(CloudTrailObject, "Data Resource Values"));
        expect(ordersPage.getTextBasedOnLabelName("Encryption Configuration")).toEqual(jsonUtil.getValue(CloudTrailObject, "Encryption Configuration"));
        expect(ordersPage.getTextBasedOnLabelName("KMS Key ARN")).toEqual(jsonUtil.getValue(CloudTrailObject, "KMS Key ARN"));
        expect(ordersPage.getTextBasedOnLabelName("Enable Log File Validation")).toEqual(jsonUtil.getValue(CloudTrailObject, "Enable Log File Validation"));
        expect(ordersPage.getTextBasedOnLabelName("Is Logging")).toEqual(jsonUtil.getValue(CloudTrailObject, "Is Logging"));
        expect(ordersPage.getTextBasedOnLabelName("Encrypt Log Files")).toEqual(jsonUtil.getValue(CloudTrailObject, "Encrypt Log Files"));
        expect(ordersPage.getTextBasedOnLabelName("SNS Topic ARN")).toEqual(jsonUtil.getValue(CloudTrailObject, "SNS Topic ARN"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(cloudTrailInstanceTemplate.TotalCost);
    });

    //Order Provisioning taking more than 15-20 min,which is not advisable to run on Jenkins.
    //So as discussed in DSM we are commenting out this test case as of now. 
    /*
     if (isProvisioningRequired == "true") {
         it('TC-C177215: AWS CloudTrail : Verify instance Order Provision and Deletion is working fine from consume App', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(cloudTrailInstanceTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(cloudTrailInstanceTemplate, modifiedParamMap);
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