/*
Description: This spec will cover E2E testing of services in shopping bag order submit, approve and delete.
Author: Anjali Ghutke
*/
"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
    EC = protractor.ExpectedConditions,
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    CartListPage = require('../../../pageObjects/cartList.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    slShopBagTemplate = require('../../../../testData/OrderIntegration/Softlayer/SoftlayerShoppingCart.json'),
    slMultiQuantityVM = require('../../../../testData/OrderIntegration/Softlayer/multiQuantityVirtualServer.json');


describe('Softlayer Shopping cart Tests', function () {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage, serviceName1, serviceName2, cartName, secGrpName, rgName2, avName, dzName, cartListPage, editedCartName, modifiedParamMapEdit, serviceNameVM, inventoryPage;
    var serviceNameEditSecGroup, cartNameEditSerivice, editedSecGrpName;
    var modifiedParamMapEditService = {};
    var modifiedParamMap = {};
    var modifiedParamMap1 = {};
    var messageStrings = {
        providerName: 'IBM Cloud',
        orderSubmittedConfirmationMessage: 'Order Submitted'
    };
    
    serviceName2 = "GSLSLIPsecshopBagnewServ" + util.getRandomString(5);
    serviceNameEditSecGroup= "GSLSLEditSecGrp" + util.getRandomString(5);
    cartNameEditSerivice = "AutoSLCart" + util.getRandomString(5);    
    editedCartName = "AutoSLEditCart" + util.getRandomString(5);    
    editedSecGrpName=  "gslslEditSecGrpService" + util.getRandomString(5);
    serviceNameVM = "GSLSLVMShopBagnewServ" + util.getRandomString(5);

    modifiedParamMapEditService = { "Service Instance Name": serviceNameEditSecGroup, "Cart Name": cartNameEditSerivice, "Cart Service": "Add service to new cart", "Security Group Name": editedSecGrpName };
    modifiedParamMap1 = { "Service Instance Name": serviceName2, "Cart Name": cartName, "Security Group Name": secGrpName };

    beforeAll(function () {
        orders = new Orders();
        homePage = new HomePage();
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        cartListPage = new CartListPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
        secGrpName = "gslslSecGrpshopBag" + util.getRandomString(5);
        cartName = "AutoSLCart" + util.getRandomString(5);
        serviceName1 = "GSLSLSecGrpShopBagnewServ" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName1, "Cart Name": cartName, "Cart Service": "Add service to new cart", "Security Group Name": secGrpName };

        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });


    it('Softlayer: Verify that Create new/Delete order with two Softlayer Services in shopping cart gets completed.', function () {
        var orderObject = {};
        var orderObj = {};
        var avshopObj = JSON.parse(JSON.stringify(slShopBagTemplate.secgrp));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(avshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(avshopObj.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(avshopObj, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Adding Another Service to same cart.
        cartListPage.continueShopping();

        var dnsshopObj = JSON.parse(JSON.stringify(slShopBagTemplate.ipSecVPN));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(dnsshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(dnsshopObj.bluePrintName);
        orderObject.servicename = serviceName2;
        orderFlowUtil.fillOrderDetails(dnsshopObj, modifiedParamMap1);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Submitting Order
        cartListPage.submitOrder();
        orderObject.orderNumber = cartListPage.getTextOrderNumberOrderSubmittedModal();
        orderObject.totalPrice = cartListPage.getTextTotalPriceOrderSubmittedModal();
        expect(cartListPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        cartListPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        if (isProvisioningRequired == "true") {
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed', 30);
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject); //Deleting Service 2
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 35);
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                }
            })
            //Deleting Service 2
            orderObj.deleteOrderNumber = orderFlowUtil.deleteService(orderObj);
            orderFlowUtil.approveDeletedOrder(orderObj);
            orderFlowUtil.waitForDeleteOrderStatusChange(orderObj, 'Completed', 35);
            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObj)).toBe('Completed');
        }
    });

    it("Softlayer:  Add one service into cart, edit the cart details and delete the cart", function () {
        var orderObject = {};
        var orderObj = {};
        var avshopObj = JSON.parse(JSON.stringify(slShopBagTemplate.secgrp));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(avshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(avshopObj.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(avshopObj, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        util.waitForAngular();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        cartListPage.expandsTheCartDetailsTab();
        cartListPage.clickOnEditCartContextLink();
        cartListPage.verifyEditCartContextPanelIsOpened();
        modifiedParamMapEdit = { "Cart Name": editedCartName };
        //Edit the cart details
        cartListPage.editCartDetails(slShopBagTemplate, modifiedParamMapEdit).then(function (requiredReturnMap) {
            //Click on update button cart button
            cartListPage.clickOnUpdateCartButton().then(function () {
                //Wait for spinner goes away
                util.waitForAngular();
                util.waitForAngular();
                //Get the cart context details 
                cartListPage.getCartContextData().then(function (actualMap) {
                    //verify the updated cart details
                    //expect(actualMap["Actual"]["Team"]).toBe(requiredReturnMap["Expected"]["Team"])
                    expect(cartListPage.getCartName(editedCartName)).toBe(requiredReturnMap["Expected"]["Cart Name"]);
                });
            });
        });
        cartListPage.clickMenuIcon();
        //Delete the cart.
        cartListPage.deleteCart();
        // Close Notification PopUp
        // cartListPage.closeNotificationPopUp();
        cartListPage.clickCartIcon();
        // expect cart not be present in Cart List
        expect(cartListPage.searchCartFromList(cartName).isPresent()).toBeFalsy();
    });

    it('Softlayer-Cart Pricing Validation for Multiqunatity service', function () {
        var MultiQuntcartName = "gslslshopBagCart" + util.getRandomString(5);
        var vmMultiQuantObj = cartListPage.getCartTestData(slMultiQuantityVM);
        var multiquantityParamMap = { "Service Instance Name": serviceNameVM, "Quantity": "3", "Cart Name": MultiQuntcartName };
        catalogPage.clickConfigureButtonBasedOnName(slMultiQuantityVM.bluePrintName);
        orderFlowUtil.fillOrderDetails(vmMultiQuantObj, multiquantityParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        //Verify Pricing
        cartListPage.clickBillOfMaterials();
        cartListPage.clickExpandQuantity().then(function () {
            cartListPage.getTotalPriceOfAllInstances();
            expect(cartListPage.getEstimatedCost()).toBe(slMultiQuantityVM.TotalEstimatedCost_Cart_Multi_quantity);

        });
        cartListPage.increaseQuntity(slMultiQuantityVM.bluePrintName);
        expect(cartListPage.getEstimatedCost()).toBe(slMultiQuantityVM.TotalEstimatedCost_increasedByOne);
        cartListPage.reduceQuntity(slMultiQuantityVM.bluePrintName);
        expect(cartListPage.getEstimatedCost()).toBe(slMultiQuantityVM.TotalEstimatedCost_Cart_Multi_quantity);

        //Delete the cart.
        cartListPage.clickMenuIcon();
        cartListPage.deleteCart();

    });

    it('Softlayer: Buyers ability to Transfer a  shopping cart', function () {
        var orderObject = {};
        var orderObj = {};
        var userID = "transfercart456@gmail.com";
        var password = "Transfercart@456";
        var slshopObj = JSON.parse(JSON.stringify(slShopBagTemplate.secgrp));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(slshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(slshopObj.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(slshopObj, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        catalogPage.open();

        cartListPage.clickCartIcon();
        cartListPage.selectCartFromList(cartName);
        cartListPage.clickMenuIcon();

        //Transfer the cart.
        cartListPage.tranferCart();
        cartListPage.searchForUserID(userID);
        cartListPage.confirmTransfer();

        // Cart not present in Cart List
        catalogPage.open();
        cartListPage.clickCartIcon();
        expect(cartListPage.searchCartFromList(cartName).isPresent()).toBeFalsy();

        cartListPage.clickUserIcon();
        cartListPage.clickLogoutButton().then(function () {
            cartListPage.loginFromOtherUser(userID, password);
            catalogPage.open();
            cartListPage.clickCartIcon();
            expect(cartListPage.searchCartFromList(cartName).isPresent()).toBe(true);
            cartListPage.selectCartFromList(cartName);
            cartListPage.clickMenuIcon();
            cartListPage.deleteCart();
        })

    });

    if (isProvisioningRequired == "true") {
        it('Softlayer: Add one service into cart, edit the service details and delete the service', function () {
            var orderObject = {};
            var orderObj = { servicename: "" };
            var orderObject_editService = {};
            var modifiedParamMapedit = {};
            var editedSecgrpName = "gslslEditedSecGrpshopBag" + util.getRandomString(4);
            var avshopObj = JSON.parse(JSON.stringify(slShopBagTemplate.secgrp));
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(avshopObj.Category);
            catalogPage.clickConfigureButtonBasedOnName(avshopObj.bluePrintName);
            orderObject.servicename = serviceNameEditSecGroup;
            orderFlowUtil.fillOrderDetails(avshopObj, modifiedParamMapEditService);
            placeOrderPage.addToShoppingCart();
            expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

            //Submitting Order
            cartListPage.submitOrder();
            orderObject.orderNumber = cartListPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = cartListPage.getTextTotalPriceOrderSubmittedModal();
            expect(cartListPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
            cartListPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            if (isProvisioningRequired == "true") {
                orderFlowUtil.approveOrder(orderObject);
                orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed', 50);
                expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
                orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {

                    //Edit the service added into cart        
                    inventoryPage.open();
                    inventoryPage.searchOrderByServiceName(orderObject.servicename);
                    element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
                    inventoryPage.clickEditServiceIcon();
                    browser.sleep("5000");
                    modifiedParamMapedit = { "Security Group Name": editedSecgrpName, "EditService": true };
                    orderFlowUtil.fillOrderDetails(slShopBagTemplate, modifiedParamMapedit);
                    placeOrderPage.submitOrder();

                    orderObject_editService.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                    orderObject_editService.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

                    placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                    orderFlowUtil.approveOrder(orderObject_editService);
                    orderFlowUtil.waitForOrderStatusChange(orderObject_editService, "Completed", 50);

                    if (status == 'Completed') {
                        orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject); //Deleting Service 2
                        orderFlowUtil.approveDeletedOrder(orderObject);
                        orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 35);
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                    }
                });
            }
        });
    }


});
