/*
Spec_Name: linuxVM.spec.js 
Description: This spec will cover E2E testing of Linux VM service order submit, approve and delete.
             Verify all parameters of "Main Parameters", "Review Order" and "View Order Details".   
Author: Atiksha Batra
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
    newLinuxVMTemplate = require('../../../../testData/OrderIntegration/Azure/newLinuxVM.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Azure: Linux Virtual Machine Service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, servicename;
    var modifiedParamMap = {};
    var modifiedParamMapedit = {};
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
    beforeAll(function () {
        catalogPage = new CatalogPage();
        catalogDetailsPage = new CatalogDetailsPage();
        placeOrderPage = new PlaceOrderPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();

    });

    afterAll(function () {
        //browser.manage().deleteAllCookies();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        servicename = "TestAutomation" + util.getRandomString(4);
        newResourceGroupName = "gslautotc_azureWVM-RG101" + util.getRandomString(4);
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

    it('Azure: TC-T388691 Verify that for Linux Virtual Machine Service all parameters on ‘Main Parameters’ Page are present.', function () {
                var orderObject = JSON.parse(JSON.stringify(newLinuxVMTemplate.Scenario1));
                catalogPage.clickFirstCategoryCheckBoxBasedOnName(orderObject.Category);
                catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
                expect(placeOrderPage.getTextEstimatedPrice()).toBe(orderObject.BasePrice); //Checking EstimatedPrice(Base Prcie + Brokerage Charge) on Main Parameters
                // expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName); //Checking provider
                // expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category); //Checking Category
    });

    it('Azure: TC-T388808 Verify that forLinux Virtual Machine all parameters on Review Order page matches with input', function () {
        var orderObject = {};
        var newLinuxVMObject = JSON.parse(JSON.stringify(newLinuxVMTemplate.Scenario1));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(newLinuxVMObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(newLinuxVMObject.bluePrintName);
        orderObject.servicename = servicename;
        orderFlowUtil.fillOrderDetails(newLinuxVMTemplate.Scenario1, modifiedParamMap).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(newLinuxVMObject.providerName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(newLinuxVMObject.Category);
            expect(requiredReturnMap["Actual"]["New Resource Group Required"]).toEqual(requiredReturnMap["Expected"]["New Resource Group Required"]);
            expect(requiredReturnMap["Actual"]["New Resource Group"]).toEqual(requiredReturnMap["Expected"]["New Resource Group"]);
            expect(requiredReturnMap["Actual"]["Location"]).toEqual(requiredReturnMap["Expected"]["Location"]);
            expect(requiredReturnMap["Actual"]["Virtual Machine Name"]).toEqual(requiredReturnMap["Expected"]["Virtual Machine Name"]);
            expect(requiredReturnMap["Actual"]["Virtual Machine Location"]).toEqual(requiredReturnMap["Expected"]["Virtual Machine Location"]);
            expect(requiredReturnMap["Actual"]["Number Of Instances"]).toEqual(requiredReturnMap["Expected"]["Number Of Instances"]);

            expect(requiredReturnMap["Actual"]["Resource Location"]).toEqual(requiredReturnMap["Expected"]["Resource Location"]);
            expect(requiredReturnMap["Actual"]["Username"]).toEqual(requiredReturnMap["Expected"]["Username"]);
            expect(requiredReturnMap["Actual"]["Operating System Publisher"]).toEqual(requiredReturnMap["Expected"]["Operating System Publisher"]);
            expect(requiredReturnMap["Actual"]["Operating System"]).toEqual(requiredReturnMap["Expected"]["Operating System"]);
            expect(requiredReturnMap["Actual"]["Operating System Version"]).toEqual(requiredReturnMap["Expected"]["Operating System Version"]);
            expect(requiredReturnMap["Actual"]["Already Have Windows Licence"]).toEqual(requiredReturnMap["Expected"]["Already Have Windows Licence"]);
            expect(requiredReturnMap["Actual"]["Virtual Machine Size"]).toEqual(requiredReturnMap["Expected"]["Virtual Machine Size"]);
            expect(requiredReturnMap["Actual"]["Virtual Network Required"]).toEqual(requiredReturnMap["Expected"]["Virtual Network Required"]);
            expect(requiredReturnMap["Actual"]["Virtual Network Name"]).toEqual(requiredReturnMap["Expected"]["Virtual Network Name"]);
            expect(requiredReturnMap["Actual"]["Address Prefix"]).toEqual(requiredReturnMap["Expected"]["Address Prefix"]);
            expect(requiredReturnMap["Actual"]["Subnet Name"]).toEqual(requiredReturnMap["Expected"]["Subnet Name"]);
            expect(requiredReturnMap["Actual"]["Subnet Prefix"]).toEqual(requiredReturnMap["Expected"]["Subnet Prefix"]);
            expect(requiredReturnMap["Actual"]["Network Interface Name"]).toEqual(requiredReturnMap["Expected"]["Network Interface Name"]);
            expect(requiredReturnMap["Actual"]["Network Security Group Required"]).toEqual(requiredReturnMap["Expected"]["Network Security Group Required"]);
            expect(requiredReturnMap["Actual"]["Network Security Group Name"]).toEqual(requiredReturnMap["Expected"]["Network Security Group Name"]);
            expect(requiredReturnMap["Actual"]["Public IP Address Name"]).toEqual(requiredReturnMap["Expected"]["Public IP Address Name"]);
            expect(requiredReturnMap["Actual"]["New Availability Set Required"]).toEqual(requiredReturnMap["Expected"]["New Availability Set Required"]);
            expect(requiredReturnMap["Actual"]["Availability Set Name"]).toEqual(requiredReturnMap["Expected"]["Availability Set Name"]);
            expect(requiredReturnMap["Actual"]["Availability Set Fault Domains"]).toEqual(requiredReturnMap["Expected"]["Availability Set Fault Domains"]);
            expect(requiredReturnMap["Actual"]["Availability Set Update Domains"]).toEqual(requiredReturnMap["Expected"]["Availability Set Update Domains"]);
            expect(requiredReturnMap["Actual"]["Boot Diagnostics"]).toEqual(requiredReturnMap["Expected"]["Boot Diagnostics"]);
            expect(requiredReturnMap["Actual"]["Diagnostics Storage Account Required"]).toEqual(requiredReturnMap["Expected"]["Diagnostics Storage Account Required"]);
            expect(requiredReturnMap["Actual"]["Diagnostics Storage Account Name"]).toEqual(requiredReturnMap["Expected"]["Diagnostics Storage Account Name"]);
            expect(requiredReturnMap["Actual"]["Diagnostics Storage Account Type"]).toEqual(requiredReturnMap["Expected"]["Diagnostics Storage Account Type"]);
  
        });
    });

    it('Azure: TC-T388821 Verify View Order Details for Linux Virtual Machine Service', function () {
        var orderObject = {};
        orderObject.servicename = servicename;

        var newLinuxVMObject = JSON.parse(JSON.stringify(newLinuxVMTemplate.Scenario1));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(newLinuxVMObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(newLinuxVMObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(newLinuxVMTemplate.Scenario1, modifiedParamMap);

        placeOrderPage.submitOrder();
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        ordersPage.open();


        ordersPage.searchOrderById(orderObject.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();

        //Checking Order Details in View order details
        //expect(ordersPage.getTextBasedOnLabelName("Order Item ID")).toBe(orderObject.orderNumber);//Checking Order Number
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toBe(orderObject.servicename);//Checking Service Name
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toBe('Azure');//Checking Provider
        //expect(ordersPage.getTextOrderStatusOrderDetails()).toBe('Approval In Progress');//Checking Order Status
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toBe('New');//Checking Order Type
   
        //expect(ordersPage.getTextBasedOnLabelName("Total Cost")).toBe(newLinuxVMObject.TotalCost);


        //Checking Service Configuration Parameters
        ordersPage.clickServiceConfigurationsTabOrderDetails();


        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group Required")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Resource Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Location")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Resource Group")).toEqual(newResourceGroupName);
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Machine Name")).toEqual(newVmName);
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Machine Location")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Virtual Machine Location"));
        expect(ordersPage.getTextBasedOnExactLabelName("Number Of Instances")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Number Of Instances"));
        expect(ordersPage.getTextBasedOnExactLabelName("Username")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Username"));
        expect(ordersPage.getTextBasedOnExactLabelName("Authentication Type")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Authentication Type"));
        expect(ordersPage.getTextBasedOnExactLabelName("Operating System Publisher")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Operating System Publisher"));
        expect(ordersPage.getTextBasedOnExactLabelName("Operating System")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Operating System"));
        expect(ordersPage.getTextBasedOnExactLabelName("Operating System Version")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Operating System Version"));
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Machine Size")).toEqual(jsonUtil.getValue(newLinuxVMObject, " Virtual Machine Size"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Virtual Network Required")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Virtual Network Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Virtual Network Name")).toEqual(newNetworkName);
        expect(ordersPage.getTextBasedOnExactLabelName("Address Prefix")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Address Prefix"));
        expect(ordersPage.getTextBasedOnExactLabelName("Subnet Name")).toEqual(newSubnetName);
        expect(ordersPage.getTextBasedOnExactLabelName("Subnet Prefix")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Subnet Prefix"));
        expect(ordersPage.getTextBasedOnExactLabelName("Network Interface Name")).toEqual(newNetworkInterfaceName);
        expect(ordersPage.getTextBasedOnExactLabelName("New Network Security Group Required")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Network Security Group Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Network Security Group Name")).toEqual(newnetworkSecurityGroupName);
        expect(ordersPage.getTextBasedOnExactLabelName("Public IP Address Name")).toEqual(newPublicIpName);
        expect(ordersPage.getTextBasedOnExactLabelName("New Availability Set Required")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Availability Set Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Name")).toEqual(newAvailabilitySetName);
        expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Fault Domains")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Availability Set Fault Domains"));
        expect(ordersPage.getTextBasedOnExactLabelName("Availability Set Update Domains")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Availability Set Update Domains"));
        expect(ordersPage.getTextBasedOnExactLabelName("Boot Diagnostics")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Boot Diagnostics"));
        expect(ordersPage.getTextBasedOnExactLabelName("New Diagnostics Storage Account Required")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Diagnostics Storage Account Required"));
        expect(ordersPage.getTextBasedOnExactLabelName("Diagnostics Storage Account Name")).toEqual(newStorageAccountName);
        expect(ordersPage.getTextBasedOnExactLabelName("Diagnostics Storage Account Type")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Diagnostics Storage Account Type"));


        //Checking Bill Of Material
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(element(by.xpath('//*[@id="total_cost_value"]')).getText()).toBe(newLinuxVMObject.TotalCost);

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);
    });
    if (isProvisioningRequired == "true") {
        it('Azure: TC-T395763 Verify provisioning of Linux Virtual Machine using Consume UI for Scenario 1', function () {
            var newLinuxVMObject = JSON.parse(JSON.stringify(newLinuxVMTemplate.Scenario1));
            var orderObject = {};
            var returnObj1 = {};
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(newLinuxVMObject.Category);
            catalogPage.clickConfigureButtonBasedOnName(newLinuxVMObject.bluePrintName);
            orderObject.servicename = servicename;
            orderFlowUtil.fillOrderDetails(newLinuxVMTemplate.Scenario1, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, "Completed", 50);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();
            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group Required:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Resource Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Resource Group:  ")).toEqual(newResourceGroupName);
            // expect(element(by.xpath('//*[@id="service_configurations_location_value"]')).getText()).toEqual(jsonUtil.getValue(newLinuxVMObject, "Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Machine Name:  ")).toEqual(newVmName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Machine Location:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Virtual Machine Location"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Number Of Instances:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Number Of Instances"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Authentication Type:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Authentication Type"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Username:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Username"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Operating System Publisher:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Operating System Publisher"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Operating System:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Operating System"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Operating System Version:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Operating System Version"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Machine Size:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, " Virtual Machine Size"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Virtual Network Required:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Virtual Network Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Virtual Network Name:  ")).toEqual(newNetworkName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Address Prefix:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Address Prefix"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Name:  ")).toEqual(newSubnetName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Subnet Prefix:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Subnet Prefix"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Network Interface Name:  ")).toEqual(newNetworkInterfaceName);
            // expect(inventoryPage.getTextBasedOnLabelName(" New Network Security Group Required:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Network Security Group Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Network Security Group Name:  ")).toEqual(newnetworkSecurityGroupName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Public IP Address Name:  ")).toEqual(newPublicIpName);
            // expect(inventoryPage.getTextBasedOnLabelName(" New Availability Set Required:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Availability Set Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Availability Set Name:  ")).toEqual(newAvailabilitySetName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Availability Set Fault Domains:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Availability Set Fault Domains"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Availability Set Update Domains:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Availability Set Update Domains"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Boot Diagnostics:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Boot Diagnostics"));
            // expect(inventoryPage.getTextBasedOnLabelName(" New Diagnostics Storage Account Required:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "New Diagnostics Storage Account Required"));
            // expect(inventoryPage.getTextBasedOnLabelName(" Diagnostics Storage Account Name:  ")).toEqual(newStorageAccountName);
            // expect(inventoryPage.getTextBasedOnLabelName(" Diagnostics Storage Account Type:  ")).toEqual(jsonUtil.getValue(newLinuxVMObject, "Diagnostics Storage Account Type"));

            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObject.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickEditServiceIcon();
            inventoryPage.clickNextButton();
            // browser.wait(EC.visibilityOf(element(by.id("button-next-button-mainParams"))), 15000);
            modifiedParamMapedit = { "Service Instance Name": servicename, "Network Security Group Name": newnetworkSecurityGroupName, "EditService": true };


            orderFlowUtil.fillOrderDetails(newLinuxVMTemplate.Scenario1, modifiedParamMapedit);
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
            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
  

        });
    }
});
