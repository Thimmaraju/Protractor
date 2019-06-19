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

    rdsInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSRDSInstance.json');

describe('AWS - RDS', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, dbInstanceIdentifier, RDSINSObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Databases',
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
        RDSINSObject = JSON.parse(JSON.stringify(rdsInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        dbInstanceIdentifier = "TestRdsInstance" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Db Instance Identifier": dbInstanceIdentifier };
    });

    it('TC-C172283 : AWS RDS - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(rdsInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(rdsInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(RDSINSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(rdsInstanceTemplate.BasePrice);
    });

    it('TC-C172284 : AWS RDS - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(rdsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(rdsInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(rdsInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(serviceName);
            expect(requiredReturnMap["Actual"]["DB engine"]).toEqual(requiredReturnMap["Expected"]["DB engine"]);
            expect(requiredReturnMap["Actual"]["License Model"]).toEqual(requiredReturnMap["Expected"]["License Model"]);
            expect(requiredReturnMap["Actual"]["DB engine version"]).toEqual(requiredReturnMap["Expected"]["DB engine version"]);
            expect(requiredReturnMap["Actual"]["DB instance class"]).toEqual(requiredReturnMap["Expected"]["DB instance class"]);
            expect(requiredReturnMap["Actual"]["Multi-AZ deployment"]).toEqual(requiredReturnMap["Expected"]["Multi AZ deployment"]);
            expect(requiredReturnMap["Actual"]["Storage type"]).toEqual(requiredReturnMap["Expected"]["Storage type"]);
            expect(requiredReturnMap["Actual"]["Allocated storage"]).toEqual(requiredReturnMap["Expected"]["Allocated storage"]);
            expect(requiredReturnMap["Actual"]["DB instance identifier"]).toEqual(requiredReturnMap["Expected"]["DB instance identifier"]);
            expect(requiredReturnMap["Actual"]["Master username"]).toEqual(requiredReturnMap["Expected"]["Master username"]);
            expect(requiredReturnMap["Actual"]["VPC Configuration Mode"]).toEqual(requiredReturnMap["Expected"]["VPC Configuration Mode"]);
            expect(requiredReturnMap["Actual"]["Public accessibility"]).toEqual(requiredReturnMap["Expected"]["Public accessibility"]);
            expect(requiredReturnMap["Actual"]["Availability zone for DB instance"]).toEqual(requiredReturnMap["Expected"]["Availability zone for DB instance"]);
            expect(requiredReturnMap["Actual"]["Database name"]).toEqual(requiredReturnMap["Expected"]["Database name"]);
            expect(requiredReturnMap["Actual"]["Database port"]).toEqual(requiredReturnMap["Expected"]["Database port"]);
            expect(requiredReturnMap["Actual"]["DB parameter group"]).toEqual(requiredReturnMap["Expected"]["DB parameter group"]);
            expect(requiredReturnMap["Actual"]["Option group"]).toEqual(requiredReturnMap["Expected"]["Option group"]);
            expect(requiredReturnMap["Actual"]["Character set name"]).toEqual(requiredReturnMap["Expected"]["Character set name"]);
            expect(requiredReturnMap["Actual"]["Encryption"]).toEqual(requiredReturnMap["Expected"]["Encryption"]);
            expect(requiredReturnMap["Actual"]["Backup retention period"]).toEqual(requiredReturnMap["Expected"]["Backup retention period"]);
            expect(requiredReturnMap["Actual"]["Backup window"]).toEqual(requiredReturnMap["Expected"]["Backup window"]);
            expect(requiredReturnMap["Actual"]["Copy tags to snapshot"]).toEqual(requiredReturnMap["Expected"]["Copy tags to snapshot"]);
            expect(requiredReturnMap["Actual"]["Enhanced monitoring"]).toEqual(requiredReturnMap["Expected"]["Enhanced monitoring"]);
            expect(requiredReturnMap["Actual"]["Auto minor version upgrade"]).toEqual(requiredReturnMap["Expected"]["Auto minor version upgrade"]);
            expect(requiredReturnMap["Actual"]["Maintenance window"]).toEqual(requiredReturnMap["Expected"]["Maintenance window"]);
        });
    });

    it('TC-C172285 : AWS RDS - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(rdsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(rdsInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(rdsInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(RDSINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(RDSINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("DB engine")).toEqual(jsonUtil.getValue(RDSINSObject, "DB engine"));
        expect(ordersPage.getTextBasedOnLabelName("License Model")).toEqual(jsonUtil.getValue(RDSINSObject, "License Model"));
        expect(ordersPage.getTextBasedOnLabelName("DB engine version")).toEqual(jsonUtil.getValue(RDSINSObject, "DB engine version"));
        expect(ordersPage.getTextBasedOnLabelName("DB instance class")).toEqual(jsonUtil.getValue(RDSINSObject, "DB instance class"));
        expect(ordersPage.getTextBasedOnLabelName("Multi-AZ deployment")).toEqual(jsonUtil.getValue(RDSINSObject, "Multi AZ deployment"));
        expect(ordersPage.getTextBasedOnLabelName("Storage type")).toEqual(jsonUtil.getValue(RDSINSObject, "Storage type"));
        expect(ordersPage.getTextBasedOnLabelName("Allocated storage")).toEqual(jsonUtil.getValue(RDSINSObject, "Allocated storage"));
        expect(ordersPage.getTextBasedOnLabelName("DB instance identifier")).toEqual(jsonUtil.getValue(RDSINSObject, "DB instance identifier"));
        expect(ordersPage.getTextBasedOnLabelName("Master username")).toEqual(jsonUtil.getValue(RDSINSObject, "Master username"));
        expect(ordersPage.getTextBasedOnLabelName("VPC Configuration Mode")).toEqual(jsonUtil.getValue(RDSINSObject, "VPC Configuration Mode"));
        expect(ordersPage.getTextBasedOnLabelName("Public accessibility")).toEqual(jsonUtil.getValue(RDSINSObject, "Public accessibility"));
        expect(ordersPage.getTextBasedOnLabelName("Availability zone for DB instance")).toEqual(jsonUtil.getValue(RDSINSObject, "Availability zone for DB instance"));
        expect(ordersPage.getTextBasedOnLabelName("Database name")).toEqual(jsonUtil.getValue(RDSINSObject, "Database name"));
        expect(ordersPage.getTextBasedOnLabelName("Database port")).toEqual(jsonUtil.getValue(RDSINSObject, "Database port"));
        expect(ordersPage.getTextBasedOnLabelName("DB parameter group")).toEqual(jsonUtil.getValue(RDSINSObject, "DB parameter group"));
        expect(ordersPage.getTextBasedOnLabelName("Option group")).toEqual(jsonUtil.getValue(RDSINSObject, "Option group"));
        expect(ordersPage.getTextBasedOnLabelName("Character set name")).toEqual(jsonUtil.getValue(RDSINSObject, "Character set name"));
        expect(ordersPage.getTextBasedOnLabelName("Encryption")).toEqual(jsonUtil.getValue(RDSINSObject, "Encryption"));
        expect(ordersPage.getTextBasedOnLabelName("Backup retention period")).toEqual(jsonUtil.getValue(RDSINSObject, "Backup retention period"));
        expect(ordersPage.getTextBasedOnLabelName("Backup window")).toEqual(jsonUtil.getValue(RDSINSObject, "Backup window"));
        expect(ordersPage.getTextBasedOnLabelName("Copy tags to snapshot")).toEqual(jsonUtil.getValue(RDSINSObject, "Copy tags to snapshot"));
        expect(ordersPage.getTextBasedOnLabelName("Enhanced monitoring")).toEqual(jsonUtil.getValue(RDSINSObject, "Enhanced monitoring"));
        expect(ordersPage.getTextBasedOnLabelName("Auto minor version upgrade")).toEqual(jsonUtil.getValue(RDSINSObject, "Auto minor version upgrade"));
        expect(ordersPage.getTextBasedOnLabelName("Maintenance window")).toEqual(jsonUtil.getValue(RDSINSObject, "Maintenance window"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(rdsInstanceTemplate.TotalCost);
    });

    //Order Provisioning is taking more than 20 min,which is not advisable to run on Jenkins.
    //So as discussed in DSM we are commenting out this test case as of now.
    /*
     if (isProvisioningRequired == "true") {
         it('TC-C172286 : AWS RDS - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(rdsInstanceTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(rdsInstanceTemplate, modifiedParamMap);
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
