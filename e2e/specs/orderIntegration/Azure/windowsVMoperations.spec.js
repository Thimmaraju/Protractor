/*
Spec_Name: windowsVMoperations.spec.js 
Description: This spec will cover Operations Off, On and Reboot on Azure Windows Virtual Machine
Author: Moti Prasad Ale 
*/

"use strict";


var Orders = require('../../../pageObjects/orders.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    appUrls = require('../../../../testData/appUrls.json'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    EC = protractor.ExpectedConditions,

    WVMTemplate = require('../../../../testData/OrderIntegration/Azure/windowsVMoperations.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Azure: Test cases for Windows Virtual Machine Operations', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var messageStrings = { providerName: 'Azure', category: 'Compute' };
    var modifiedParamMap = {};
    var servicename = "AutoNSsrv" + util.getRandomString(5);
    var newResourceGroupName, newVmName, newNetworkName, newSubnetName, newNetworkInterfaceName, newnetworkSecurityGroupName, newPublicIpName, newAvailabilitySetName, newStorageAccountName;
    
    var returnObj = {};
        returnObj.servicename = servicename; 
     
    beforeAll(function () {
        ordersPage = new Orders();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
    newResourceGroupName = "gslautotc_azure_winvmRG" + util.getRandomString(4);
    newVmName = "auto-VM" + util.getRandomString(4);
    newNetworkName = "auto-VN101" + util.getRandomString(4);
    newSubnetName = "auto-SN101" + util.getRandomString(4);
    newNetworkInterfaceName = "auto-NIN101" + util.getRandomString(4);
    newnetworkSecurityGroupName = "AutoWVM-RG101" + util.getRandomString(4);
    newPublicIpName = "auto-pIPaN101" + util.getRandomString(4);
    newAvailabilitySetName = "AutoWVM-RG101" + util.getRandomString(4);
    newStorageAccountName = "autods101" + util.getRandomString(4);
                         newStorageAccountName = newStorageAccountName.toLocaleLowerCase();
    modifiedParamMap = { "Service Instance Name": servicename, "New Resource Group": newResourceGroupName, "Virtual Machine Name": newVmName, "Virtual Network Name": newNetworkName, "Subnet Name": newSubnetName, "Network Interface Name": newNetworkInterfaceName, "Network Security Group Name": newnetworkSecurityGroupName, "Public IP Address Name": newPublicIpName, "Availability Set Name": newAvailabilitySetName, "Diagnostics Storage Account Name": newStorageAccountName };

    });


    if (isProvisioningRequired == "true") {
        it('Azure: TC-T374437-Sanity Verify if VM created with new RG,OS Publisher-Server,OS-DC,VM Size-BasicA0, new VN and Subnet, new NSG , new Public IP,AV-No,Boot-Enabled, new DSA', function () {
        var newWindowsVMObject = JSON.parse(JSON.stringify(WVMTemplate));
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);

            catalogPage.clickFirstCategoryCheckBoxBasedOnName(newWindowsVMObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(newWindowsVMObject.bluePrintName);

            orderFlowUtil.fillOrderDetails(WVMTemplate, modifiedParamMap);

            placeOrderPage.submitOrder();
            returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

            orderFlowUtil.approveOrder(returnObj);
            expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed', 150);

        });



        it('Azure: TC-C182590-Sanity Verify for Windows VM that on SOI VM is able to stop a running VM successfully', function () {
        catalogPage.open();
            
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(returnObj.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStatesAz().then(function () {
                    inventoryPage.azClickTurnOFFButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceTurnOFFPermission();
                    });
                });
            }).then(function () {
                returnObj.state=inventoryPage.waitForAzInstancStateStatusChange(returnObj, 'Off');
                expect(returnObj.state).toBe('Off');
            });
        });


        it('Azure: TC-C204051-Sanity Verify for Windows VM that on SOI VM is able to start a stopped VM successfully', function () {
        catalogPage.open();

            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(returnObj.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStatesAz().then(function () {
                    inventoryPage.azClickTurnONButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceTurnONPermission();
                    });
                });
            }).then(function () {
                returnObj.state=inventoryPage.waitForAzInstancStateStatusChange(returnObj, 'On');
                expect(returnObj.state).toBe('On');
            });
        });



        it('Azure: TC-C204052-Sanity Verify for Windows VM that on SOI VM is able to reboot a VM successfully', function () {
        catalogPage.open();

            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(returnObj.servicename);
            inventoryPage.clickExpandFirstRow().then(function () {
                browser.executeScript('window.scrollTo(0,0);');
                inventoryPage.clickOverflowActionButtonForPowerStatesAz().then(function () {
                    inventoryPage.azClickRebootButtonOfInstance().then(function () {
                        inventoryPage.clickOkForInstanceRebootPermission();
                    });
                });
            }).then(function () {
                returnObj.state=inventoryPage.waitForAzInstancStateStatusChange(returnObj, 'On');
                expect(returnObj.state).toBe('On');
            });
            //Delete windows VM
            returnObj.deleteOrderNumber = orderFlowUtil.deleteService(returnObj);
            orderFlowUtil.approveDeletedOrder(returnObj);
            orderFlowUtil.waitForDeleteOrderStatusChange(returnObj, 'Provisioning in Progress');
        });

    }

});
