"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",

    ec2InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSEC2Instance.json');

describe('AWS - EC2', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName, EC2INSObject, inventoryPage;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
        category: 'Compute',
        catalogPageTitle: 'Search, Select and Configure',
        inputServiceNameWarning: "Parameter Warning:",
        orderSubmittedConfirmationMessage: 'Order Submitted !',
    };
    var orderObject = {};


    beforeAll(function () {
        ordersPage = new Orders();
        homePage = new HomePage();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        EC2INSObject = JSON.parse(JSON.stringify(ec2InstanceTemplate));
        serviceName = "TestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
    });

    it('TC-C186226 : AWS EC2 - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(ec2InstanceTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(EC2INSObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 1"]);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(ec2InstanceTemplate.BasePrice);
    });

    it('TC-C186227 : AWS EC2 - Verify Summary details and Additional Details are listed in review Order page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(ec2InstanceTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(ec2InstanceTemplate.EstimatedPrice); expect(requiredReturnMap["Actual"]["AWS Region"]).toEqual(requiredReturnMap["Expected"]["AWS Region"]);
            expect(requiredReturnMap["Actual"]["Resource Name"]).toEqual(requiredReturnMap["Expected"]["Resource Name"]);
            expect(requiredReturnMap["Actual"]["Instance Type"]).toEqual(requiredReturnMap["Expected"]["Instance Type"]);
            expect(requiredReturnMap["Actual"]["Architecture"]).toEqual(requiredReturnMap["Expected"]["Architecture"]);
            expect(requiredReturnMap["Actual"]["Virtualization Type"]).toEqual(requiredReturnMap["Actual"]["Virtualization Type"]);
            expect(requiredReturnMap["Expected"]["Image Name"]).toContain(requiredReturnMap["Expected"]["Image Name"]);
            expect(requiredReturnMap["Actual"]["Availability Zone"]).toEqual(requiredReturnMap["Expected"]["Availability Zone"]);
            expect(requiredReturnMap["Actual"]["Vpc Creation Mode"]).toEqual(requiredReturnMap["Expected"]["Vpc Creation Mode"]);
            expect(requiredReturnMap["Actual"]["IAM Role"]).toEqual(requiredReturnMap["Expected"]["IAM Role"]);
            expect(requiredReturnMap["Actual"]["Shutdown Behavior"]).toEqual(requiredReturnMap["Expected"]["Shutdown Behavior"]);
            expect(requiredReturnMap["Actual"]["Enable Termination Protection"]).toEqual(requiredReturnMap["Expected"]["Enable Termination Protection"]);
            expect(requiredReturnMap["Actual"]["Monitoring"]).toEqual(requiredReturnMap["Expected"]["Monitoring"]);
            expect(requiredReturnMap["Actual"]["T2/T3 Unlimited"]).toEqual(requiredReturnMap["Expected"]["T2/T3 Unlimited"]);
            expect(requiredReturnMap["Actual"]["SSH Key Name"]).toEqual(requiredReturnMap["Expected"]["SSH Key Name"]);
            expect(requiredReturnMap["Actual"]["SSH Location"]).toEqual(requiredReturnMap["Expected"]["SSH Location"]);
            expect(requiredReturnMap["Actual"]["User Data"]).toEqual(requiredReturnMap["Expected"]["User Data"]);
        });
    });

    it('TC-C186228 : AWS EC2 - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
        catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(ec2InstanceTemplate, modifiedParamMap);
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
        // expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(ec2InstanceTemplate.bluePrintName);
        // expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(EC2INSObject, "Team"));
        // expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();
        expect(ordersPage.getTextBasedOnLabelName("AWS Region")).toEqual(jsonUtil.getValue(EC2INSObject, "AWS Region"));
        expect(ordersPage.getTextBasedOnLabelName("Resource Name")).toEqual(jsonUtil.getValue(EC2INSObject, "Resource Name"));
        expect(ordersPage.getTextBasedOnLabelName("Instance Type")).toEqual(jsonUtil.getValue(EC2INSObject, "Instance Type"));
        expect(ordersPage.getTextBasedOnLabelName("Architecture")).toEqual(jsonUtil.getValue(EC2INSObject, "Architecture"));
        expect(ordersPage.getTextBasedOnLabelName("Virtualization Type")).toEqual(jsonUtil.getValue(EC2INSObject, "Virtualization Type"));
        expect(ordersPage.getTextBasedOnLabelName("Image Name")).toEqual(jsonUtil.getValue(EC2INSObject, "Image Name"));
        expect(ordersPage.getTextBasedOnLabelName("Availability Zone")).toEqual(jsonUtil.getValue(EC2INSObject, "Availability Zone"));
        expect(ordersPage.getTextBasedOnLabelName("VPC Creation Mode")).toEqual(jsonUtil.getValue(EC2INSObject, "VPC Creation Mode"));
        expect(ordersPage.getTextBasedOnLabelName("IAM Role")).toEqual(jsonUtil.getValue(EC2INSObject, "IAM Role"));
        expect(ordersPage.getTextBasedOnLabelName("Shutdown Behavior")).toEqual(jsonUtil.getValue(EC2INSObject, "Shutdown Behavior"));
        expect(ordersPage.getTextBasedOnLabelName("Enable Termination Protection")).toEqual(jsonUtil.getValue(EC2INSObject, "Enable Termination Protection"));
        expect(ordersPage.getTextBasedOnLabelName("Monitoring")).toEqual(jsonUtil.getValue(EC2INSObject, "Monitoring"));
        expect(ordersPage.getTextBasedOnLabelName("T2/T3 Unlimited")).toEqual(jsonUtil.getValue(EC2INSObject, "T2/T3 Unlimited"));
        expect(ordersPage.getTextBasedOnLabelName("SSH Key Name")).toEqual(jsonUtil.getValue(EC2INSObject, "SSH Key Name"));
        expect(ordersPage.getTextBasedOnLabelName("SSH Location")).toEqual(jsonUtil.getValue(EC2INSObject, "SSH Location"));
        expect(ordersPage.getTextBasedOnLabelName("User Data")).toEqual(jsonUtil.getValue(EC2INSObject, "User Data"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(ec2InstanceTemplate.TotalCost);
    });

    if (isProvisioningRequired == "true") {
        it('TC-C186229 : AWS EC2 - E2E : Verify instance Order Provision is working fine from consume App', function () {
            catalogPage.clickProviderOrCategoryCheckbox(messageStrings.category);
            catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(ec2InstanceTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
        });

        it('TC-C172385 : AWS EC2 - Verify instance Turn OFF functionality', function () {
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                    inventoryPage.clickTurnOFFButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceTurnOFFPermission();
                    });
                });
            }).then(function () {
                inventoryPage.waitForInstancStateStatusChange(orderObject, 'Stopped');
            });
            expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObject)).toBe('Stopped');
        });

        it('TC-C172384 : AWS EC2 - Verify instance Turn ON functionality', function () {
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                    inventoryPage.clickTurnONButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceTurnONPermission();
                    });
                });
            }).then(function () {
                inventoryPage.waitForInstancStateStatusChange(orderObject, 'On');
            });
            expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObject)).toBe('On');
        });

        it('TC-C172386 : AWS EC2 - Verify instance Reboot functionality', function () {
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                    inventoryPage.clickRebootButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceRebootPermission();
                    });
                });
            }).then(function () {
                inventoryPage.waitForInstancStateStatusChange(orderObject, 'On');
            });
            expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObject)).toBe('On');
        });

        it('TC-185070 : AWS EC2 - Edit and Delete Service', function () {
            var modifiedParamMap = { "EditService": true };
            orderFlowUtil.editService(orderObject);
            orderFlowUtil.fillOrderDetails(ec2InstanceTemplate, modifiedParamMap).then(function () {
                logger.info("Edit parameter details are filled.");
                expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(ec2InstanceTemplate.EstimatedPricePostEdit);
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
                    expect(ordersPage.getTextBasedOnLabelName("Resource Name")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Resource Name"));
                    expect(ordersPage.getTextBasedOnLabelName("Instance Type")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Instance Type"));
                    expect(ordersPage.getTextBasedOnLabelName("IAM Role")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "IAM Role"));
                    expect(ordersPage.getTextBasedOnLabelName("Shutdown Behavior")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Shutdown Behavior"));
                    expect(ordersPage.getTextBasedOnLabelName("Monitoring")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Monitoring"));
                    expect(ordersPage.getTextBasedOnLabelName("T2/T3 Unlimited")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "T2/T3 Unlimited"));
                    expect(ordersPage.getTextBasedOnLabelName("Unlimited Instance Type")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Unlimited Instance Type"));
                    expect(ordersPage.getTextBasedOnLabelName("User Data")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "User Data"));
                    expect(ordersPage.getTextBasedOnLabelName("Device Name")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Device Name"));
                    expect(ordersPage.getTextBasedOnLabelName("Volume Size")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Volume Size"));
                    expect(ordersPage.getTextBasedOnLabelName("Volume Type")).toEqual(jsonUtil.getValueEditParameter(EC2INSObject, "Volume Type"));
                    ordersPage.clickBillOfMaterialsTabOrderDetails();
                    expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(ec2InstanceTemplate.TotalCostPostEdit);
                    //Delete Service flow
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            });
        });
    }
});
