/*
Spec_Name: azureCartFeatures.spec.js 
Description: This spec will cover  testing of Cart Features for shopping cart which includes Empty Cart , Transfer Cart,  Delete Cart and Edit Cart.
Author: Atiksha Batra
*/

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    CartListPage = require('../../../pageObjects/cartList.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    azshopBagTemplate = require('../../../../testData/OrderIntegration/Azure/AzShoppingCart.json');


describe('Azure Shopping cart Tests Features', function () {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage, serviceName1, serviceName2, cartName, rgName1, rgName2, avName, dzName, cartListPage, editedCartName;
    var modifiedParamMap = {};
    var EC = protractor.ExpectedConditions;
    var modifiedParamMap1 = {};
    var messageStrings = {
        providerName: 'Azure',
        orderSubmittedConfirmationMessage: 'Order Submitted'
    };
    var modifiedParamMapEdit = {};
    serviceName1 = "AzAVshopBagnewServ" + util.getRandomString(5);
    serviceName2 = "AzDnshopBagnewServ" + util.getRandomString(5);
    cartName = "AAzshopBagCart" + util.getRandomString(5);
    rgName1 = "gslauto_tcAVshopBagnewRG" + util.getRandomString(5);
    rgName2 = "gslauto_tcDnshopBagnewRG" + util.getRandomString(5);
    avName = "shopbagnewav" + util.getRandomNumber(5);
    dzName = "shopbag.newdz" + util.getRandomNumber(5);
    editedCartName = "agslslEditCart" + util.getRandomString(5);
    modifiedParamMap = { "Service Instance Name": serviceName1, "Cart Name": cartName, "Cart Service": "Add service to new cart", "New Resource Group": rgName1, "Availability Set Name": avName };
    modifiedParamMap1 = { "Service Instance Name": serviceName2, "Cart Name": cartName, "New Resource Group": rgName1, "DNS Zone Name": dzName };

    beforeAll(function () {
        orders = new Orders();
        homePage = new HomePage();
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        cartListPage = new CartListPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });
    it("Add one service into cart, edit the cart details and delete the cart", function () {
        var orderObject = {};
        var orderObj = {};

        var avshopObj = JSON.parse(JSON.stringify(azshopBagTemplate.avServ));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(avshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(avshopObj.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(avshopObj, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        cartListPage.expandsTheCartDetailsTab();
        cartListPage.clickOnEditCartContextLink();
        cartListPage.verifyEditCartContextPanelIsOpened();
        modifiedParamMapEdit = { "Cart Name": editedCartName };
        //Edit the cart details
        cartListPage.editCartDetails(azshopBagTemplate, modifiedParamMapEdit).then(function (requiredReturnMap) {
            //Click on update button cart button
            cartListPage.clickOnUpdateCartButton().then(function () {

                //Get the cart context details 
                cartListPage.getCartContextData().then(function (actualMap) {
                    //verify the updated cart details
                    expect(cartListPage.getCartName(editedCartName)).toBe(requiredReturnMap["Expected"]["Cart Name"]);
                });
            });
        });
        cartListPage.clickMenuIcon();
        //Delete the cart.
        cartListPage.deleteCart();
    });
    it('Azure : C195936 : Buyers ability to remove all service(s) at once ("Empty Cart") BUT the shopping cart is existing there with "Empty" status  ', function () {
        var orderObject = {};
        var orderObj = {};
        var avshopObj = JSON.parse(JSON.stringify(azshopBagTemplate.avServ));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(avshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(avshopObj.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(avshopObj, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        //Adding Another Service to same cart.
        // cartListPage.continueShopping();

        // var dnsshopObj = JSON.parse(JSON.stringify(azshopBagTemplate.dnsServ));
        // catalogPage.clickFirstCategoryCheckBoxBasedOnName(dnsshopObj.Category);
        // catalogPage.clickConfigureButtonBasedOnName(dnsshopObj.bluePrintName);
        // orderObject.servicename = serviceName2;
        // orderFlowUtil.fillOrderDetails(dnsshopObj, modifiedParamMap1);
        // placeOrderPage.addToShoppingCart();
        // expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        cartListPage.clickMenuIcon();
        //Empty the cart.
        cartListPage.emptyCart();

        cartListPage.clickMenuIcon();
        //Delete the cart.
        cartListPage.deleteCart();


    });
    it('Azure :C195765: Buyers ability to delete a  shopping cart', function () {
        var orderObject = {};
        var orderObj = {};
        var avshopObj = JSON.parse(JSON.stringify(azshopBagTemplate.avServ));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(avshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(avshopObj.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(avshopObj, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        catalogPage.open();

        cartListPage.clickCartIcon();
        cartListPage.selectCartFromList(cartName);
        cartListPage.clickMenuIcon();

        //Delete the cart.
        cartListPage.deleteCart();

        // Close Notification PopUp
        // cartListPage.closeNotificationPopUp();
        cartListPage.clickCartIcon();

        // expect cart not be present in Cart List
        expect(cartListPage.searchCartFromList(cartName).isPresent()).toBeFalsy();
    });
    it('Azure :C195765: Buyers ability to Transfer a  shopping cart', function () {
        var orderObject = {};
        var orderObj = {};
        var userID = "transfercart456@gmail.com";
        var password = "Transfercart@456";
        var avshopObj = JSON.parse(JSON.stringify(azshopBagTemplate.avServ));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(avshopObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(avshopObj.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(avshopObj, modifiedParamMap);
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
        cartListPage.clickLogoutButton();

        cartListPage.loginFromOtherUser(userID, password);

        catalogPage.open();
        cartListPage.clickCartIcon();

        expect(cartListPage.searchCartFromList(cartName).isPresent()).toBe(true);
        cartListPage.selectCartFromList(cartName);
        cartListPage.clickMenuIcon();
        cartListPage.deleteCart();

    });



});

