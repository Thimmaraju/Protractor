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
    redshiftTemplate = require('../../../../testData/OrderIntegration/AWS/AWSRedshift.json');

describe('AWS - Redshift', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, clusterIdentifier, dbName, RedshiftObject;
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
        RedshiftObject = JSON.parse(JSON.stringify(redshiftTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        clusterIdentifier = "clusteridentifier" + util.getRandomString(5);
        clusterIdentifier = clusterIdentifier.toLowerCase();
        dbName = "dbname" + util.getRandomString(5);
        dbName = dbName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Cluster Identifier": clusterIdentifier, "Database Name": dbName };
    });

    it('TC-C180499 : AWS Redshift - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(redshiftTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(redshiftTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(RedshiftObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(redshiftTemplate.BasePrice);
    });

    it('TC-C180500 : AWS Redshift - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(redshiftTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(redshiftTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(redshiftTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Cluster Identifier"]).toEqual(requiredReturnMap["Expected"]["Cluster Identifier"]);
            expect(requiredReturnMap["Actual"]["Database Name"]).toEqual(requiredReturnMap["Expected"]["Database Name"]);
            expect(requiredReturnMap["Actual"]["Database Port"]).toEqual(requiredReturnMap["Expected"]["Database Port"]);
            expect(requiredReturnMap["Actual"]["Master User Name"]).toEqual(requiredReturnMap["Expected"]["Master User Name"]);
            expect(requiredReturnMap["Actual"]["Node Type"]).toEqual(requiredReturnMap["Expected"]["Node Type"]);
            expect(requiredReturnMap["Actual"]["Cluster Type"]).toEqual(requiredReturnMap["Expected"]["Cluster Type"]);
            expect(requiredReturnMap["Actual"]["Cluster Parameter Group"]).toEqual(requiredReturnMap["Expected"]["Cluster Parameter Group"]);
            expect(requiredReturnMap["Actual"]["Encrypt Database"]).toEqual(requiredReturnMap["Expected"]["Encrypt Database"]);
            expect(requiredReturnMap["Actual"]["Choose VPC"]).toEqual(requiredReturnMap["Expected"]["Choose VPC"]);
            expect(requiredReturnMap["Actual"]["Cluster Subnet Group"]).toEqual(requiredReturnMap["Expected"]["Cluster Subnet Group"]);
            expect(requiredReturnMap["Actual"]["Publicly Accessible"]).toEqual(requiredReturnMap["Expected"]["Publicly Accessible"]);
            expect(requiredReturnMap["Actual"]["Availability Zone"]).toEqual(requiredReturnMap["Expected"]["Availability Zone"]);
            expect(requiredReturnMap["Actual"]["VPC Security Groups"]).toEqual("sg-01828f4a");
            expect(requiredReturnMap["Actual"]["Available Roles"]).toEqual(requiredReturnMap["Expected"]["Available Roles"]);
        });
    });

    it('TC-C180501 : AWS Redshift - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        var RedshiftINSObject = JSON.parse(JSON.stringify(redshiftTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(redshiftTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(redshiftTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
        var orderAmount = ordersPage.getTextFirstAmountOrdersTable();
        ordersPage.clickFirstViewDetailsOrdersTable();
        orderFlowUtil.waitForOrderStatusChange(orderObject, 'Approval In Progress');
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(redshiftTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(RedshiftINSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        //expect(ordersPage.getTextSubmittedByOexpect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(RedshiftINSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Cluster Identifier")).toEqual(clusterIdentifier);
        expect(ordersPage.getTextBasedOnLabelName("Database Name")).toEqual(dbName);
        expect(ordersPage.getTextBasedOnLabelName("Database Port")).toEqual(jsonUtil.getValue(RedshiftObject, "Database Port"));
        expect(ordersPage.getTextBasedOnLabelName("Master User Name")).toEqual(jsonUtil.getValue(RedshiftObject, "Master User Name"));
        expect(ordersPage.getTextBasedOnLabelName("Node Type")).toEqual(jsonUtil.getValue(RedshiftObject, "Node Type"));
        expect(ordersPage.getTextBasedOnLabelName("Cluster Type")).toEqual(jsonUtil.getValue(RedshiftObject, "Cluster Type"));
        expect(ordersPage.getTextBasedOnLabelName("Cluster Parameter Group")).toEqual(jsonUtil.getValue(RedshiftObject, "Cluster Parameter Group"));
        expect(ordersPage.getTextBasedOnLabelName("Encrypt Database")).toEqual(jsonUtil.getValue(RedshiftObject, "Encrypt Database"));
        expect(ordersPage.getTextBasedOnLabelName("Choose VPC")).toEqual(jsonUtil.getValue(RedshiftObject, "Choose VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Cluster Subnet Group")).toEqual(jsonUtil.getValue(RedshiftObject, "Cluster Subnet Group"));
        expect(ordersPage.getTextBasedOnLabelName("Publicly Accessible")).toEqual(jsonUtil.getValue(RedshiftObject, "Publicly Accessible"));
        expect(ordersPage.getTextBasedOnLabelName("Availability Zone")).toEqual(jsonUtil.getValue(RedshiftObject, "Availability Zone"));
        expect(ordersPage.getTextBasedOnLabelName("Available Roles")).toEqual(jsonUtil.getValue(RedshiftObject, "Available Roles"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(redshiftTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C180502: AWS Redshift - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(redshiftTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(redshiftTemplate, modifiedParamMap);
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