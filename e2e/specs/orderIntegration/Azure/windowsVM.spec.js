/*
Spec_Name: windowsVM.spec.js 
Description: This spec will cover E2E testing of Windows VM service order submit, approve and delete.
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".   
Author: Atiksha Batra
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

    WVMTemplate = require('../../../../testData/OrderIntegration/Azure/newWindowsVM.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Azure: Test cases for Windows Virtual Machine', function () {
    var ordersPage, catalogPage, inventoryPage, placeOrderPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Azure', category: 'Compute' };
    var modifiedParamMap = {};
    var modifiedParamMapedit = {};
    var servicename = "AutoNSsrv" + util.getRandomString(5);
    var messageStrings = { providerName: 'Azure' };
    var newResourceGroupName, newVmName, newNetworkName, newSubnetName, newNetworkInterfaceName, newnetworkSecurityGroupName, newPublicIpName, newAvailabilitySetName, newStorageAccountName;


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
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });
    if (isProvisioningRequired == "true") {
        it('Azure: TC-T374437-Sanity Verify if VM created with new RG,OS Publisher-Server,OS-DC,VM Size-BasicA0, new VN and Subnet, new NSG , new Public IP,AV-No,Boot-Enabled, new DSA', function () {

            var newWindowsVMObject = JSON.parse(JSON.stringify(WVMTemplate));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(newWindowsVMObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(newWindowsVMObject.bluePrintName);
            var returnObj = {};
            var returnObj1 = {};
            orderFlowUtil.fillOrderDetails(WVMTemplate, modifiedParamMap);

            placeOrderPage.submitOrder();
            returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            returnObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            returnObj.servicename = servicename;
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

            orderFlowUtil.approveOrder(returnObj);
            expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(returnObj, 'Completed', 150);

            inventoryPage.open();
            expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);

            inventoryPage.searchOrderByServiceName(returnObj.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
            inventoryPage.clickViewService();

            //Checking Inventory Page Service Configuration


            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group Required:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Resource Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group:  ")).toEqual(newResourceGroupName);
            // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(newWindowsVMObject, "Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Machine Name:  ")).toEqual(newVmName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Machine Location:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Virtual Machine Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Number Of Instances:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Number Of Instances"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Admin Username:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Admin Username"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Operating System Publisher:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System Publisher"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Operating System:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Operating System Version:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System Version"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Machine Size:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, " Virtual Machine Size"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Virtual Network Required:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Virtual Network Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Network Name:  ")).toEqual(newNetworkName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Address Prefix:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Address Prefix"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Name:  ")).toEqual(newSubnetName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Prefix:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Subnet Prefix"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Network Interface Name:  ")).toEqual(newNetworkInterfaceName);
            // expect(inventoryPage.getTextBasedOnLabelName(" New Network Security Group Required:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Network Security Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Network Security Group Name:  ")).toEqual(newnetworkSecurityGroupName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Public IP Address Name:  ")).toEqual(newPublicIpName);
            // expect(inventoryPage.getTextBasedOnLabelName(" New Availability Set Required:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Availability Set Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Availability Set Name:  ")).toEqual(newAvailabilitySetName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Availability Set Fault Domains:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Availability Set Fault Domains"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Availability Set Update Domains:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Availability Set Update Domains"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Boot Diagnostics:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Boot Diagnostics"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Diagnostics Storage Account Required:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Diagnostics Storage Account Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Diagnostics Storage Account Name:  ")).toEqual(newStorageAccountName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Diagnostics Storage Account Type:  ")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Diagnostics Storage Account Type"));

                 inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickEditServiceIcon();
                        inventoryPage.clickNextButton();
                        // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))), 15000);
                        modifiedParamMapedit = { "Service Instance Name": servicename, "Network Security Group Name": newnetworkSecurityGroupName, "EditService": true };


                        orderFlowUtil.fillOrderDetails(WVMTemplate, modifiedParamMapedit);
                        placeOrderPage.submitOrder();

                        returnObj1.servicename = servicename;
                        returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

                        //Get details on pop up after submit
                        var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                        var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                        var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
                        var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

                        //Open Order page and Approve Order 
                        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

                        // placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
                        placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                        //expect(orderFlowUtil.verifyOrderType(returnObj1)).toBe('EditSOI');
                        orderFlowUtil.approveOrder(returnObj1);
                        orderFlowUtil.waitForOrderStatusChange(returnObj1, "Completed", 50);
                        inventoryPage.open();
                        inventoryPage.searchOrderByServiceName(returnObj1.servicename);
                        element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                        inventoryPage.clickViewService();

                        //expect(inventoryPage.getTextBasedOnLabelName(" Pricing Tier:  ")).toEqual(jsonUtil.getValueEditParameter(NSTemplate, "Pricing Tier"));

                        returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
                        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(returnObj1)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(returnObj1);
                        orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
                        // expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
              
        });
    }

    //Checking parameters on Main Parameters page
    it('Azure: TC-T372617 Verify that for Windows VM Service, all parameters on ‘Main Parameters’ Page are present..', function () {

        var newWindowsVMObject = JSON.parse(JSON.stringify(WVMTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(newWindowsVMObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(newWindowsVMObject.bluePrintName);

        expect(placeOrderPage.getTextEstimatedPrice()).toBe(newWindowsVMObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
        // expect(placeOrderPage.getTextProvider()).toBe(newWindowsVMObject.provider); //Checking provider
        // expect(placeOrderPage.getTextCategory()).toBe(newWindowsVMObject.Category); //Checking Category

    });

    //Checking all parameters on Review Order Page
    it('Azure: TC-T372727-Sanity Verify that for Windows VM Service all parameters on Review Order page matches with inpu.', function () {

        var newWindowsVMObject = JSON.parse(JSON.stringify(WVMTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(newWindowsVMObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(newWindowsVMObject.bluePrintName);
        var returnObj = {};
        returnObj.servicename = servicename;
        orderFlowUtil.fillOrderDetails(WVMTemplate, modifiedParamMap);

        //Checking Service Details in ReviewOrder
        //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(newWindowsVMObject.provider);
        expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(returnObj.servicename);
        //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(newWindowsVMObject.Category);
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(newWindowsVMObject.EstimatedCost);

        //Checking Additional Details in ReviewOrder
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group Required:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Resource Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" New Resource Group:")).toEqual(newResourceGroupName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Location:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Location"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Machine Name:")).toEqual(newVmName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Machine Location:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Virtual Machine Location"));
        expect(inventoryPage.getTextBasedOnLabelName(" Number Of Instances:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Number Of Instances"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Admin Username:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Admin Username"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Operating System Publisher:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System Publisher"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Operating System:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Operating System Version:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System Version"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Machine Size:")).toEqual(jsonUtil.getValue(newWindowsVMObject, " Virtual Machine Size"));
        expect(placeOrderPage.getTextBasedOnLabelName(" New Virtual Network Required:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Virtual Network Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Virtual Network Name:")).toEqual(newNetworkName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Address Prefix:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Address Prefix"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Name:")).toEqual(newSubnetName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Subnet Prefix:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Subnet Prefix"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Network Interface Name:")).toEqual(newNetworkInterfaceName);
        expect(placeOrderPage.getTextBasedOnLabelName(" New Network Security Group Required:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Network Security Group Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Network Security Group Name:")).toEqual(newnetworkSecurityGroupName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Public IP Address Name:")).toEqual(newPublicIpName);
        expect(placeOrderPage.getTextBasedOnLabelName(" New Availability Set Required:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Availability Set Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Availability Set Name:")).toEqual(newAvailabilitySetName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Availability Set Fault Domains:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Availability Set Fault Domains"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Availability Set Update Domains:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Availability Set Update Domains"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Boot Diagnostics:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Boot Diagnostics"));
        expect(placeOrderPage.getTextBasedOnLabelName(" New Diagnostics Storage Account Required:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Diagnostics Storage Account Required"));
        expect(placeOrderPage.getTextBasedOnLabelName(" Diagnostics Storage Account Name:")).toEqual(newStorageAccountName);
        expect(placeOrderPage.getTextBasedOnLabelName(" Diagnostics Storage Account Type:")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Diagnostics Storage Account Type"));

    });


    //Checking values on View Order Details
    it('Azure: TC-T372738 Verify that for Windows VM Service all values on ‘View Order Details’ page matches with input.', function () {

        var returnObj = {};
        returnObj.servicename = servicename;

        var newWindowsVMObject = JSON.parse(JSON.stringify(WVMTemplate));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(newWindowsVMObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(newWindowsVMObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(WVMTemplate, modifiedParamMap);

        placeOrderPage.submitOrder();
        returnObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        ordersPage.open();


        ordersPage.searchOrderById(returnObj.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();

        //Checking Order Details in View order details
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Item ID")).toBe(returnObj.orderNumber);//Checking Order Number
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toBe(returnObj.servicename);//Checking Service Name
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe(newWindowsVMObject.provider);//Checking Provider
        //expect(ordersPage.getTextBasedOnExactLabelName("Order Status")).toBe('Approval In Progress');//Checking Order Status
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
        //expect(ordersPage.getTextBasedOnExactLabelName("Total Cost")).toBe(newWindowsVMObject.TotalCost);

        //Checking Service Configuration Parameters
        ordersPage.clickServiceConfigurationsTabOrderDetails();


        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(newResourceGroupName);
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Machine Name")).toEqual(newVmName);
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Machine Location")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Virtual Machine Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Number Of Instances")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Number Of Instances"));
        expect(ordersPage.getTextBasedOnExactLabelName("Admin Username")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Admin Username"));
        expect(ordersPage.getTextBasedOnExactLabelName("Operating System Publisher")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System Publisher"));
        expect(ordersPage.getTextBasedOnExactLabelName("Operating System")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System"));
        expect(ordersPage.getTextBasedOnExactLabelName("Operating System Version")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Operating System Version"));
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Machine Size")).toEqual(jsonUtil.getValue(newWindowsVMObject, " Virtual Machine Size"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Virtual Network Required")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Virtual Network Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network Name")).toEqual(newNetworkName);
        expect(ordersPage.getTextBasedOnExactLabelName("Address Prefix")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Address Prefix"));
        expect(ordersPage.getTextBasedOnExactLabelName("Subnet Name")).toEqual(newSubnetName);
        expect(ordersPage.getTextBasedOnExactLabelName("Subnet Prefix")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Subnet Prefix"));
        expect(ordersPage.getTextBasedOnExactLabelName("Network Interface Name")).toEqual(newNetworkInterfaceName);
        expect(ordersPage.getTextBasedOnExactLabelName("New Network Security Group Required")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Network Security Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Network Security Group Name")).toEqual(newnetworkSecurityGroupName);
        expect(ordersPage.getTextBasedOnExactLabelName("Public IP Address Name")).toEqual(newPublicIpName);
        expect(ordersPage.getTextBasedOnExactLabelName("New Availability Set Required")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Availability Set Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Name")).toEqual(newAvailabilitySetName);
        expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Fault Domains")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Availability Set Fault Domains"));
        expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Update Domains")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Availability Set Update Domains"));
        expect(ordersPage.getTextBasedOnExactLabelName("Boot Diagnostics")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Boot Diagnostics"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Diagnostics Storage Account Required")).toEqual(jsonUtil.getValue(newWindowsVMObject, "New Diagnostics Storage Account Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Diagnostics Storage Account Name")).toEqual(newStorageAccountName);
        expect(ordersPage.getTextBasedOnExactLabelName("Diagnostics Storage Account Type")).toEqual(jsonUtil.getValue(newWindowsVMObject, "Diagnostics Storage Account Type"));


        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(newWindowsVMObject.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(returnObj);

    });
});
