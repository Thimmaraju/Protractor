
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

    configTemplate = require('../../../../testData/OrderIntegration/AWS/AWSConfig.json');

describe('AWS - Config', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, bucketName, roleName, ConfigObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Other Services',
        catalogPageTitle: 'Search, Select and Configure',
        inputserviceNameWarning: "Parameter Warning:",
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
        ConfigObject = JSON.parse(JSON.stringify(configTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        bucketName = "bucketforconfig" + util.getRandomString(5);
        bucketName = bucketName.toLowerCase();
        roleName = "rolename" + util.getRandomString(5);
        roleName = roleName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Bucket Name": bucketName, "Role Name": roleName };
    });

    it('TC-C179381 : AWS Enable Services-Config  - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(configTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(configTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(ConfigObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(configTemplate.BasePrice);
    });

    it('TC-C179382 : AWS Enable Services-Config - Verify Summary details and Additional Details are listed in review Order page', function () {
        var ConfigObject = JSON.parse(JSON.stringify(configTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(configTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(configTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(configTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["Record All Resources Supported In This Region"]).toEqual(requiredReturnMap["Expected"]["Record All Resources Supported In This Region"]);
            expect(requiredReturnMap["Actual"]["Specific Types"]).toEqual(requiredReturnMap["Expected"]["Specific Types"]);
            expect(requiredReturnMap["Actual"]["S3 Bucket Configuration"]).toEqual(requiredReturnMap["Expected"]["S3 Bucket Configuration"]);
            expect(requiredReturnMap["Actual"]["Bucket Name"]).toEqual(bucketName);
            expect(requiredReturnMap["Actual"]["Log File Prefix"]).toEqual(requiredReturnMap["Expected"]["Log File Prefix"]);
            expect(requiredReturnMap["Actual"]["Stream configuration changes and notifications to an Amazon SNS topic"]).toEqual(requiredReturnMap["Expected"]["Stream configuration changes and notifications to an Amazon SNS topic"]);
            expect(requiredReturnMap["Actual"]["Role Configuration"]).toEqual(requiredReturnMap["Expected"]["Role Configuration"]);
            expect(requiredReturnMap["Actual"]["Role Name"]).toEqual(roleName);
            expect(requiredReturnMap["Actual"]["Config Rules"]).toEqual(requiredReturnMap["Expected"]["Config Rules"]);

        });
    });

    it('TC-C179383 : AWS Enable Services-Config - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(configTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(configTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(configTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(ConfigObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(ConfigObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Record All Resources Supported In This Region")).toEqual(jsonUtil.getValue(ConfigObject, "Record All Resources Supported In This Region"));
        expect(ordersPage.getTextBasedOnLabelName("Specific Types")).toEqual(jsonUtil.getValue(ConfigObject, "Specific Types"));
        expect(ordersPage.getTextBasedOnLabelName("S3 Bucket Configuration")).toEqual(jsonUtil.getValue(ConfigObject, "S3 Bucket Configuration"));
        expect(ordersPage.getTextBasedOnLabelName("Bucket Name")).toEqual(bucketName);
        expect(ordersPage.getTextBasedOnLabelName("Log File Prefix")).toEqual(jsonUtil.getValue(ConfigObject, "Log File Prefix"));
        expect(ordersPage.getTextBasedOnLabelName("Stream configuration changes and notifications to an Amazon SNS topic")).toEqual(jsonUtil.getValue(ConfigObject, "Stream configuration changes and notifications to an Amazon SNS topic"));
        expect(ordersPage.getTextBasedOnLabelName("Role Configuration")).toEqual(jsonUtil.getValue(ConfigObject, "Role Configuration"));
        expect(ordersPage.getTextBasedOnLabelName("Role Name")).toEqual(roleName);
        expect(ordersPage.getTextBasedOnLabelName("Config Rules")).toEqual(jsonUtil.getValue(ConfigObject, "Config Rules"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(configTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C179384 : AWS Enable services-Config- E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(configTemplate.bluePrintName);
            orderObject.servicename = serviceName
            orderFlowUtil.fillOrderDetails(configTemplate, modifiedParamMap);
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
})
