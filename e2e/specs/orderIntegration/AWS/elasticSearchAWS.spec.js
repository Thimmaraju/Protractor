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
    elasticSearchInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSElasticSearchInstance.json');

describe('AWS - ElasticSearch', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, domainName, ElasticSearchObject;
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
        ElasticSearchObject = JSON.parse(JSON.stringify(elasticSearchInstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        domainName = "mynewdomain" + util.getRandomString(5);
        domainName = domainName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Elasticsearch Domain Name": domainName };
    });

    it('TC-C180445 : AWS ElasticSearch - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(elasticSearchInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(elasticSearchInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(ElasticSearchObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(elasticSearchInstanceTemplate.BasePrice);

    });

    it('TC-C180446 : AWS ElasticSearch - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(elasticSearchInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(elasticSearchInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(elasticSearchInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Elasticsearch Domain Name"]).toEqual(requiredReturnMap["Expected"]["Elasticsearch Domain Name"]);
            expect(requiredReturnMap["Actual"]["Elasticsearch Version"]).toEqual(requiredReturnMap["Expected"]["Elasticsearch Version"]);
            expect(requiredReturnMap["Actual"]["Enable Zone Awareness"]).toEqual(requiredReturnMap["Expected"]["Enable Zone Awareness"]);
            expect(requiredReturnMap["Actual"]["Instance Count"]).toEqual(requiredReturnMap["Expected"]["Instance Count"]);
            expect(requiredReturnMap["Actual"]["Instance Type"]).toEqual(requiredReturnMap["Expected"]["Instance Type"]);
            expect(requiredReturnMap["Actual"]["Enable Dedicated Master"]).toEqual(requiredReturnMap["Expected"]["Enable Dedicated Master"]);
            expect(requiredReturnMap["Actual"]["EBS Volume Type"]).toEqual(requiredReturnMap["Expected"]["EBS Volume Type"]);
            expect(requiredReturnMap["Actual"]["EBS Volume Size"]).toEqual(requiredReturnMap["Expected"]["EBS Volume Size"]);
            expect(requiredReturnMap["Actual"]["Automated Snapshot Start Hour"]).toEqual(requiredReturnMap["Expected"]["Automated Snapshot Start Hour"]);
            expect(requiredReturnMap["Actual"]["Rest Action Multi Allow Explicit Index"]).toEqual(requiredReturnMap["Expected"]["Rest Action Multi Allow Explicit Index"]);
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            expect(requiredReturnMap["Actual"]["Subnet"]).toEqual(requiredReturnMap["Expected"]["Subnet"]);
            expect(requiredReturnMap["Actual"]["Security Groups"]).toEqual(requiredReturnMap["Expected"]["Security Groups"]);
            expect(requiredReturnMap["Actual"]["Set The Domain Access Policy To"]).toEqual(requiredReturnMap["Expected"]["Set The Domain Access Policy To"]);
        });
    });

    it('TC-C180447 : AWS ElasticSearch - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(elasticSearchInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(elasticSearchInstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(elasticSearchInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(ElasticSearchObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(ElasticSearchObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Elasticsearch Domain Name")).toEqual(domainName);
        expect(ordersPage.getTextBasedOnLabelName("Elasticsearch Version")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Elasticsearch Version"));
        expect(ordersPage.getTextBasedOnLabelName("Enable Zone Awareness")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Enable Zone Awareness"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Count")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Instance Count"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Type")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Instance Type"));
        expect(ordersPage.getTextBasedOnLabelName("Enable Dedicated Master")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Enable Dedicated Master"));
        expect(ordersPage.getTextBasedOnLabelName("EBS Volume Type")).toEqual(jsonUtil.getValue(ElasticSearchObject, "EBS Volume Type"));
        expect(ordersPage.getTextBasedOnLabelName("EBS Volume Size")).toEqual(jsonUtil.getValue(ElasticSearchObject, "EBS Volume Size"));
        expect(ordersPage.getTextBasedOnLabelName("Automated Snapshot Start Hour")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Automated Snapshot Start Hour"));
        expect(ordersPage.getTextBasedOnLabelName("Rest Action Multi Allow Explicit Index")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Rest Action Multi Allow Explicit Index"));
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(ElasticSearchObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Subnet")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Subnet"));
        expect(ordersPage.getTextBasedOnLabelName("Security Groups")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Security Groups"));
        expect(ordersPage.getTextBasedOnLabelName("Set The Domain Access Policy To")).toEqual(jsonUtil.getValue(ElasticSearchObject, "Set The Domain Access Policy To"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(elasticSearchInstanceTemplate.TotalCost);
    });

    //Order Provisioning taking more than 15-20 min,which is not advisable to run on Jenkins.
    //So as discussed in DSM we are commenting out this test case as of now. 
    /*
     if (isProvisioningRequired == "true") {
         it('TC-C180448: AWS ElasticSearch : Verify instance Order Provision and Deletion is working fine from consume App', function () {
        var orderObject = {};
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(elasticSearchInstanceTemplate.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(elasticSearchInstanceTemplate, modifiedParamMap);
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
