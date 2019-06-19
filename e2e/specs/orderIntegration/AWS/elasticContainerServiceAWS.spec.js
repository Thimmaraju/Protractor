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
    ecsInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSElasticContainerService.json');

describe('AWS - Elastic Container Service', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceInstanceName, clusterName, serviceName, elasticContainerServiceObject;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Compute',
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
        elasticContainerServiceObject = JSON.parse(JSON.stringify(ecsInstanceTemplate));
        serviceInstanceName = "TestAutomation" + util.getRandomString(5);
        clusterName = "mynewcluster" + util.getRandomString(5);
        serviceName = "TestService" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceInstanceName, "ECS Cluster Name": clusterName, "Service Name": serviceName };
    });

    it('TC-C194236 : AWS - Elastic Container Service - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(ecsInstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(ecsInstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceInstanceName);
        placeOrderPage.selectProviderAccount(elasticContainerServiceObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(ecsInstanceTemplate.BasePrice);

    });

    it('TC-C194237 : AWS - Elastic Container Service - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(ecsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(ecsInstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceInstanceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(ecsInstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["ECS Cluster Name"]).toEqual(requiredReturnMap["Expected"]["ECS Cluster Name"]);
            expect(requiredReturnMap["Actual"]["Create Empty Cluster"]).toEqual(requiredReturnMap["Expected"]["Create Empty Cluster"]);
            expect(requiredReturnMap["Actual"]["Spot Provisioning Model"]).toEqual(requiredReturnMap["Expected"]["Spot Provisioning Model"]);
            expect(requiredReturnMap["Actual"]["Spot Allocation Strategy"]).toEqual(requiredReturnMap["Expected"]["Spot Allocation Strategy"]);
            expect(requiredReturnMap["Actual"]["ECS Instance Type"]).toEqual(requiredReturnMap["Expected"]["ECS Instance Type"]);
            expect(requiredReturnMap["Actual"]["Number Of Instances"]).toEqual(requiredReturnMap["Expected"]["Number Of Instances"]);
            expect(requiredReturnMap["Actual"]["EBS Volume Size"]).toEqual(requiredReturnMap["Expected"]["EBS Volume Size"]);
            expect(requiredReturnMap["Actual"]["EBS Volume Type"]).toEqual(requiredReturnMap["Expected"]["EBS Volume Type"]);
            expect(requiredReturnMap["Actual"]["SSH Key Name"]).toEqual(requiredReturnMap["Expected"]["SSH Key Name"]);
            expect(requiredReturnMap["Actual"]["Service Name"]).toEqual(requiredReturnMap["Expected"]["Service Name"]);
            expect(requiredReturnMap["Actual"]["Launch Type"]).toEqual(requiredReturnMap["Expected"]["Launch Type"]);
            expect(requiredReturnMap["Actual"]["Number Of Tasks"]).toEqual(requiredReturnMap["Expected"]["Number Of Tasks"]);
            expect(requiredReturnMap["Actual"]["Minimum Healthy Percent"]).toEqual(requiredReturnMap["Expected"]["Minimum Healthy Percent"]);
            expect(requiredReturnMap["Actual"]["Maximum Percent"]).toEqual(requiredReturnMap["Expected"]["Maximum Percent"]);
            expect(requiredReturnMap["Actual"]["Placement Templates"]).toEqual(requiredReturnMap["Expected"]["Placement Templates"]);
            expect(requiredReturnMap["Actual"]["VPC Id"]).toEqual(requiredReturnMap["Expected"]["VPC Id"]);
            //expect(requiredReturnMap["Actual"]["Subnet Ids"]).toEqual(requiredReturnMap["Expected"]["Subnet Ids"]);
            expect(requiredReturnMap["Actual"]["Security Group Id"]).toEqual(requiredReturnMap["Expected"]["Security Group Id"]);
            expect(requiredReturnMap["Actual"]["IAM Role Instance Profile"]).toEqual(requiredReturnMap["Expected"]["IAM Role Instance Profile"]);
            expect(requiredReturnMap["Actual"]["Task Definition Name"]).toEqual(requiredReturnMap["Expected"]["Task Definition Name"]);
            expect(requiredReturnMap["Actual"]["Task Memory"]).toEqual(requiredReturnMap["Expected"]["Task Memory"]);
            expect(requiredReturnMap["Actual"]["Task CPU"]).toEqual(requiredReturnMap["Expected"]["Task CPU"]);
            expect(requiredReturnMap["Actual"]["Task Constraint Type"]).toEqual(requiredReturnMap["Expected"]["Task Constraint Type"]);
            expect(requiredReturnMap["Actual"]["Container Definition Name"]).toEqual(requiredReturnMap["Expected"]["Container Definition Name"]);
            expect(requiredReturnMap["Actual"]["Container Image"]).toEqual(requiredReturnMap["Expected"]["Container Image"]);
            expect(requiredReturnMap["Actual"]["Memory Hard Limit"]).toEqual(requiredReturnMap["Expected"]["Memory Hard Limit"]);
            expect(requiredReturnMap["Actual"]["Memory Soft Limit"]).toEqual(requiredReturnMap["Expected"]["Memory Soft Limit"]);
            expect(requiredReturnMap["Actual"]["Port Protocol"]).toEqual(requiredReturnMap["Expected"]["Port Protocol"]);
            expect(requiredReturnMap["Actual"]["Container CPU"]).toEqual(requiredReturnMap["Expected"]["Container CPU"]);
            expect(requiredReturnMap["Actual"]["Container Entry Point"]).toEqual(requiredReturnMap["Expected"]["Container Entry Point"]);
            expect(requiredReturnMap["Actual"]["Container Command"]).toEqual(requiredReturnMap["Expected"]["Container Command"]);
            expect(requiredReturnMap["Actual"]["Readonly Root Filesystem"]).toEqual(requiredReturnMap["Expected"]["Readonly Root Filesystem"]);
        });
    });

    it('TC-C194238 : AWS - Elastic Container Service - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(ecsInstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(ecsInstanceTemplate, modifiedParamMap);
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
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceInstanceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(ecsInstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("ECS Cluster Name")).toEqual(clusterName);
        expect(ordersPage.getTextBasedOnLabelName("Create Empty Cluster")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Create Empty Cluster"));
        expect(ordersPage.getTextBasedOnLabelName("Spot Provisioning Model")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Spot Provisioning Model"));
        expect(ordersPage.getTextBasedOnLabelName("Spot Allocation Strategy")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Spot Allocation Strategy"));
        expect(ordersPage.getTextBasedOnLabelName("ECS Instance Type")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "ECS Instance Type"));
        expect(ordersPage.getTextBasedOnLabelName("Number Of Instances")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Number Of Instances"));
        expect(ordersPage.getTextBasedOnLabelName("EBS Volume Size")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "EBS Volume Size"));
        expect(ordersPage.getTextBasedOnLabelName("EBS Volume Type")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "EBS Volume Type"));
        expect(ordersPage.getTextBasedOnLabelName("SSH Key Name")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "SSH Key Name"));
        //expect(ordersPage.getTextBasedOnExactLabelName("Service Name")).toEqual(serviceName);
        expect(ordersPage.getTextBasedOnLabelName("Launch Type")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Launch Type"));
        expect(ordersPage.getTextBasedOnLabelName("Number Of Tasks")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Number Of Tasks"));
        expect(ordersPage.getTextBasedOnLabelName("Minimum Healthy Percent")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Minimum Healthy Percent"));
        expect(ordersPage.getTextBasedOnLabelName("Maximum Percent")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Maximum Percent"));
        expect(ordersPage.getTextBasedOnLabelName("Placement Templates")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Placement Templates"));
        expect(ordersPage.getTextBasedOnLabelName("VPC Id")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "VPC Id"));
        expect(ordersPage.getTextBasedOnLabelName("Subnet Ids")).toEqual("subnet-c5f664b2 (us-east-1b), subnet-f3a23cff (us-east-1f)");
        expect(ordersPage.getTextBasedOnLabelName("Security Group Id")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Security Group Id"));
        expect(ordersPage.getTextBasedOnLabelName("IAM Role Instance Profile")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "IAM Role Instance Profile"));
        expect(ordersPage.getTextBasedOnLabelName("Task Definition Name")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Task Definition Name"));
        expect(ordersPage.getTextBasedOnLabelName("Task Memory")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Task Memory"));
        expect(ordersPage.getTextBasedOnLabelName("Task CPU")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Task CPU"));
        expect(ordersPage.getTextBasedOnLabelName("Task Constraint Type")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Task Constraint Type"));
        expect(ordersPage.getTextBasedOnLabelName("Container Definition Name")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Container Definition Name"));
        expect(ordersPage.getTextBasedOnLabelName("Container Image")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Container Image"));
        expect(ordersPage.getTextBasedOnLabelName("Memory Hard Limit")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Memory Hard Limit"));
        expect(ordersPage.getTextBasedOnLabelName("Memory Soft Limit")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Memory Soft Limit"));
        expect(ordersPage.getTextBasedOnLabelName("Port Protocol")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Port Protocol"));
        expect(ordersPage.getTextBasedOnLabelName("Container CPU")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Container CPU"));
        expect(ordersPage.getTextBasedOnLabelName("Container Entry Point")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Container Entry Point"));
        expect(ordersPage.getTextBasedOnLabelName("Container Command")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Container Command"));
        expect(ordersPage.getTextBasedOnLabelName("Readonly Root Filesystem")).toEqual(jsonUtil.getValue(elasticContainerServiceObject, "Readonly Root Filesystem"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(ecsInstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C194239: AWS - Elastic Container Service : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(ecsInstanceTemplate.bluePrintName);
            orderObject.servicename = serviceInstanceName;
            orderFlowUtil.fillOrderDetails(ecsInstanceTemplate, modifiedParamMap);
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
