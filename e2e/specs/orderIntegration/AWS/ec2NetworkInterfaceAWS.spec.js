"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    networkInterfaceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSEC2NetworkInterface.json');
    var ec2InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSEC2Instance.json');
    var isProvisioningRequired = browser.params.isProvisioningRequired;

describe('AWS - Network Interface', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, inventoryPage, serviceName, serviceNameEc2, resourceName;
    var modifiedParamMap = {};
    var modifiedParamMap1 = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Network',
        catalogPageTitle: 'Search, Select and Configure',
        inputServiceNameWarning: "Parameter Warning:",
        orderSubmittedConfirmationMessage: 'Order Submitted !',
    };
    var orderObjectEc2 = {};

    beforeAll(function () {
        ordersPage = new Orders();
        homePage = new HomePage();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
        serviceNameEc2 = "TestAutomation" + util.getRandomString(5);
        modifiedParamMap1 = { "Service Instance Name": serviceNameEc2, "Select VPC": "vpc-8eadd1eb", "My Subnet IDs": "subnet-a68b538d", "Security Group Ids": "sg-4e88232a" };
   
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        serviceName = "TestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Instance Id":"test" };
    });

    it('TC-C182408 : AWS Network Interface - Verify fields on Main Parameters page is working fine', function () {
        var AWSEC2Object = JSON.parse(JSON.stringify(ec2InstanceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(networkInterfaceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(networkInterfaceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(AWSEC2Object["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
    });

    it('TC-C172382 : EC2 Instance - Verify AWS EC2 instance creation as part of pre-requisite data.', function () {
        var AWSEC2Object = JSON.parse(JSON.stringify(ec2InstanceTemplate));

        catalogPage.clickProviderOrCategoryCheckbox('Compute');
        catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(ec2InstanceTemplate, modifiedParamMap1).then(function (requiredReturnMap) {
            placeOrderPage.submitOrder();
            orderObjectEc2.servicename = requiredReturnMap["Actual"]["Service Instance Name"];
            orderObjectEc2.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObjectEc2.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObjectEc2);
           //
           orderFlowUtil.waitForOrderStatusChange(orderObjectEc2, 'Provisioning in Progress')
            //expect(orderFlowUtil.verifyOrderStatus(orderObjectEc2)).toBe('Provisioning in Progress');

            orderFlowUtil.waitForOrderStatusChange(orderObjectEc2, 'Completed');
            expect(orderFlowUtil.verifyOrderStatus(orderObjectEc2)).toBe('Completed');
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObjectEc2.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                    inventoryPage.clickViewComponentofAWSInstance().then(function () {
                        var resourceID = inventoryPage.getViewComponentPropertyAWS("Resource Id");                        
                        resourceID.then(function (text) {                                                            
                            resourceName = text.split("~")[1];                                                                
                            inventoryPage.clickViewComponentCloseButtonAWS();
                        });                                             
                    });
                });
            });
        });

    });

    it('TC-C182409 : AWS Network Interface - Verify Summary details and Additional Details are listed in review Order page', function () {
        var NetworkInterfaceObject = JSON.parse(JSON.stringify(networkInterfaceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(networkInterfaceTemplate.bluePrintName);
        modifiedParamMap['Instance Id'] = resourceName;
        orderFlowUtil.fillOrderDetails(networkInterfaceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(networkInterfaceTemplate.EstimatedPrice);
            expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Description"]).toEqual(requiredReturnMap["Expected"]["Description"]); 
            expect(requiredReturnMap["Actual"]["VPC"]).toEqual(requiredReturnMap["Expected"]["VPC"]);
            expect(requiredReturnMap["Actual"]["Availability Zone"]).toEqual(requiredReturnMap["Expected"]["Availability Zone"]);
            expect(requiredReturnMap["Actual"]["Subnet"]).toEqual(requiredReturnMap["Expected"]["Subnet"]);
            expect(requiredReturnMap["Actual"]["Auto Assign"]).toEqual(requiredReturnMap["Expected"]["Auto Assign"]);
            expect(requiredReturnMap["Actual"]["Security Groups"]).toEqual(requiredReturnMap["Expected"]["Security Groups"]);
            expect(requiredReturnMap["Actual"]["Source Dest Check"]).toEqual(requiredReturnMap["Expected"]["Source Dest Check"]);
            expect(requiredReturnMap["Actual"]["Tag Key"]).toEqual(requiredReturnMap["Expected"]["Tag Key"]);
            expect(requiredReturnMap["Actual"]["Tag Value"]).toEqual(requiredReturnMap["Expected"]["Tag Value"]);
            expect(requiredReturnMap["Actual"]["Instance Id"]).toEqual(requiredReturnMap["Expected"]["Instance Id"]);
            expect(requiredReturnMap["Actual"]["Device Index "]).toEqual(requiredReturnMap["Expected"]["Device Index "]);      
        });
    });

    it('TC-C182410 : AWS Network Interface - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        var NetworkInterfaceObject = JSON.parse(JSON.stringify(networkInterfaceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(networkInterfaceTemplate.bluePrintName);
        modifiedParamMap['Instance Id'] = resourceName;
        orderFlowUtil.fillOrderDetails(networkInterfaceTemplate, modifiedParamMap);
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
        //expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(networkInterfaceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Description")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Description"));
        expect(ordersPage.getTextBasedOnLabelName("VPC")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "VPC"));
        expect(ordersPage.getTextBasedOnLabelName("Availability Zone")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Availability Zone"));
        expect(ordersPage.getTextBasedOnLabelName("Subnet")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Subnet"));
        expect(ordersPage.getTextBasedOnLabelName("Auto Assign")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Auto Assign"));
        expect(ordersPage.getTextBasedOnLabelName("Security Groups")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Security Groups"));
        expect(ordersPage.getTextBasedOnLabelName("Source Dest Check")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Source Dest Check"));
        expect(ordersPage.getTextBasedOnLabelName("Tag Key")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Tag Key"));
        expect(ordersPage.getTextBasedOnLabelName("Tag Value")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Tag Value"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Id")).toEqual(resourceName);
        expect(ordersPage.getTextBasedOnLabelName("Device Index")).toEqual(jsonUtil.getValue(NetworkInterfaceObject, "Device Index"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(networkInterfaceTemplate.TotalCost);
    });
   
    if (isProvisioningRequired == "true") {
        it('TC-C182411 : AWS Network Interface - E2E : Verify instance Order Provision and Deletion is working fine from consume App', function () {
            var orderObject = {};
            var NetworkInterfaceObject = JSON.parse(JSON.stringify(networkInterfaceTemplate));
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(networkInterfaceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            modifiedParamMap['Instance Id'] = resourceName;
            orderFlowUtil.fillOrderDetails(networkInterfaceTemplate, modifiedParamMap);
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

    it('TC-C174126 : EC2 - Verify AWS EC2 instance deletion as part of teardown activity', function () {
        console.log("servicename=",orderObjectEc2.servicename);
        orderObjectEc2.deleteOrderNumber = orderFlowUtil.deleteService(orderObjectEc2);
        expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObjectEc2)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(orderObjectEc2);
        orderFlowUtil.waitForDeleteOrderStatusChange(orderObjectEc2, 'Completed');
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObjectEc2)).toBe('Completed');
           
    });    
})
