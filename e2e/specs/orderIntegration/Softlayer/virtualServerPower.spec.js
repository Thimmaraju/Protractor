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
    isProvisioningRequired = browser.params.isProvisioningRequired,
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    vmInstanceTemplate = require('../../../../testData/OrderIntegration/Softlayer/VirtualMachine.json');

    describe('Tests for Softlayer - VM Power Options(D2OP)', function () {
        var ordersPage, homePage, catalogPage, placeOrderPage, inventoryPage, serviceName, modifiedHostName;
        var modifiedParamMap = {};
        var messageStrings = { providerName: 'IBM Cloud' };
        var orderObjectVm = {};

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
        //expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
        modifiedHostName = "GSLSLSVM" + util.getRandomString(5);        
        modifiedParamMap = { "Service Instance Name": serviceName, "Hostname": modifiedHostName};
    });

    if (isProvisioningRequired == "true") {
    it('VM Power States - Verify Softlayer VM instance creation as part of pre-requisite data.', function () {
       
        var vmObject = JSON.parse(JSON.stringify(vmInstanceTemplate));
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(vmObject.Category);
        catalogPage.searchForBluePrint(vmInstanceTemplate.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(vmInstanceTemplate.bluePrintName);
        orderObjectVm.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(vmInstanceTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        orderObjectVm.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        orderObjectVm.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        orderFlowUtil.approveOrder(orderObjectVm);
        orderFlowUtil.waitForOrderStatusChange(orderObjectVm, 'Completed',400);
       expect(orderFlowUtil.verifyOrderStatus(orderObjectVm)).toBe('Completed');
    });

    it('VM Power States - Verify Softlayer VM instance Turn OFF functionality.', function () {
        inventoryPage.open();
        inventoryPage.searchOrderByServiceName(orderObjectVm.servicename);
        inventoryPage.clickExpandFirstRow().then(function () {
            inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                inventoryPage.clickTurnOFFButtonOfInstance().then(function () {
                    inventoryPage.clickOkForInstanceTurnOFFPermission();
                });
            });
        }).then(function () {
            inventoryPage.waitForInstancStateStatusChange(orderObjectVm, 'Off');
        });
        expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObjectVm)).toBe('Off');
    });

    it('VM Power States - Verify Softlayer VM insance Turn ON functionality.', function () {
        
        inventoryPage.open();
        browser.waitForAngular();
        inventoryPage.searchOrderByServiceName(orderObjectVm.servicename);
        inventoryPage.clickExpandFirstRow().then(function () {
            browser.waitForAngular();
            inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                inventoryPage.clickTurnONButtonOfInstance().then(function () {
                    inventoryPage.clickOkForInstanceTurnONPermission();
                });
            });
        }).then(function () {
            inventoryPage.waitForInstancStateStatusChange(orderObjectVm, 'On');
        });
        expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObjectVm)).toBe('On');
    });

    it('VM Power States - Verify Softlayer VM instance Reboot functionality.', function () {
        inventoryPage.open();
        browser.waitForAngular();
        inventoryPage.searchOrderByServiceName(orderObjectVm.servicename);
        inventoryPage.clickExpandFirstRow().then(function () {
            inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                inventoryPage.clickRebootButtonOfInstance().then(function () {
                    inventoryPage.clickOkForInstanceRebootPermission();
                });
            });
        }).then(function () {
            inventoryPage.waitForInstancStateStatusChange(orderObjectVm, 'On');
        });
        expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObjectVm)).toBe('On');
    });



    it('VM Power States - Verify Softlayer VM instance deletion as part of teardown activity', function () {
        inventoryPage.open();
        browser.waitForAngular();
        inventoryPage.searchOrderByServiceName(orderObjectVm.servicename);
        orderObjectVm.deleteOrderNumber = orderFlowUtil.deleteService(orderObjectVm);
        expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObjectVm)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(orderObjectVm);
        orderFlowUtil.waitForDeleteOrderStatusChange(orderObjectVm, 'Completed',50);
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObjectVm)).toBe('Completed');
    });
}
})
