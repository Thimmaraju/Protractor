/*
Spec_Name: linuxVMoperations.spec.js 
Description: This spec will cover Operations Off, On and Reboot on Azure Linux Virtual Machine
Author: Moti Prasad Ale
*/

"use strict";

var EC = protractor.ExpectedConditions,
    logGenerator = require("../../../../helpers/logGenerator.js"),
    Logger = logGenerator.getApplicationLogger(),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    OrdersPage = require('../../../pageObjects/orders.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    newLinuxVMTemplate = require('../../../../testData/OrderIntegration/Azure/linuxVMoperations.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Azure: Linux Virtual Machine Service Operations', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, servicename;
    var modifiedParamMap = {};
    var newResourceGroupName = "gslautotc_azureWVM-RG101" + util.getRandomString(4);
    var newVmName = "auto-VM101" + util.getRandomString(4);
    var newNetworkName = "auto-VN101" + util.getRandomString(4);
    var newSubnetName = "auto-SN101" + util.getRandomString(4);
    var newNetworkInterfaceName = "auto-NIN101" + util.getRandomString(4);
    var newnetworkSecurityGroupName = "AutoWVM-RG101" + util.getRandomString(4);
    var newPublicIpName = "auto-pIPaN101" + util.getRandomString(4);
    var newAvailabilitySetName = "AutoWVM-RG101" + util.getRandomString(4);
    var newStorageAccountName = "AutoWVM-RG101" + util.getRandomString(4);
    var messageStrings = { providerName: 'Azure', category: 'Compute', templateName: 'Linux Virtual Machine' };
    var newLinuxVMObject = JSON.parse(JSON.stringify(newLinuxVMTemplate.Scenario1));

    servicename = "AzlinvmOp" + util.getRandomString(4);
    var orderObject = {};
    orderObject.servicename = servicename;

    beforeAll(function () {
        catalogPage = new CatalogPage();
        catalogDetailsPage = new CatalogDetailsPage();
        placeOrderPage = new PlaceOrderPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();

    });


    beforeEach(function () {
        newResourceGroupName = "gslautotc_azureLVM-RG101" + util.getRandomString(4);
        newVmName = "auto-VM101" + util.getRandomString(4);
        newNetworkName = "auto-VN101" + util.getRandomString(4);
        newSubnetName = "auto-SN101" + util.getRandomString(4);
        newNetworkInterfaceName = "auto-NIN101" + util.getRandomString(4);
        newnetworkSecurityGroupName = "AutoWVM-RG101" + util.getRandomString(4);
        newPublicIpName = "auto-pIPaN101" + util.getRandomString(4);
        newAvailabilitySetName = "AutoWVM-RG101" + util.getRandomString(4);
        newStorageAccountName = "autosan" + util.getRandomString(4);
        newStorageAccountName = newStorageAccountName.toLocaleLowerCase();
        modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": newResourceGroupName, "Virtual Machine Name": newVmName, "Virtual Network Name": newNetworkName, "Subnet Name": newSubnetName, "Network Interface Name": newNetworkInterfaceName, "Network Security Group Name": newnetworkSecurityGroupName, "Public IP Address Name": newPublicIpName, "Availability Set Name": newAvailabilitySetName, "Diagnostics Storage Account Name": newStorageAccountName };
    });

    if (isProvisioningRequired == "true") {
        it('Azure: TC-T395763-Sanity Verify provisioning of Linux Virtual Machine using Consume UI for Scenario 1', function () {
            var newLinuxVMObject = JSON.parse(JSON.stringify(newLinuxVMTemplate.Scenario1));

            catalogPage.open();
            expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
            catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);

            catalogPage.searchForBluePrint(newLinuxVMTemplate.Scenario1.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(newLinuxVMTemplate.Scenario1.bluePrintName);
            orderFlowUtil.fillOrderDetails(newLinuxVMTemplate.Scenario1, modifiedParamMap);
            placeOrderPage.submitOrder();

            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 50);

        });
                

        it('Azure: TC-C173533-Sanity Verify for Virtual machine, when VM is turned OFF, status should get changed from ON to OFF', function () {
        catalogPage.open();
            
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStatesAz().then(function () {
                    inventoryPage.azClickTurnOFFButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceTurnOFFPermission();
                    });
                });
            }).then(function () {
                orderObject.state=inventoryPage.waitForAzInstancStateStatusChange(orderObject, 'Off');
                expect(orderObject.state).toBe('Off');
            });
        });


        it('Azure: TC-C173534-Sanity Verify for Virtual machine, when VM is turned ON, status should get changed from OFF to ON', function () {

            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStatesAz().then(function () {
                    inventoryPage.azClickTurnONButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceTurnONPermission();
                    });
                });
            }).then(function () {
                orderObject.state=inventoryPage.waitForAzInstancStateStatusChange(orderObject, 'On');
                expect(orderObject.state).toBe('On');
            });
        });


        it('Azure: TC-C173535-Sanity Verify for Virtual machine, when VM is rebooted, status should remain ON', function () {

            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStatesAz().then(function () {
                    inventoryPage.azClickRebootButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceRebootPermission();
                    });
                });
            }).then(function () {
                orderObject.state=inventoryPage.waitForAzInstancStateStatusChange(orderObject, 'On');
                expect(orderObject.state).toBe('On');
            });
           //Deleting Linux Virtual Machine
           orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
           orderFlowUtil.approveDeletedOrder(orderObject);
           orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
        });
    }
});
