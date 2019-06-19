/*
Description: This spec file contains the below features
	1. e2e flow covering placing the order,provision,delete.
	2.Edit cart and Delete cart.
	3.Transfer cart.
	4.Delete services from cart and Empty a shopping cart.
	5.Multi quantity validations
Author: Deepthi Chitti
*/
"use strict";

var EC = protractor.ExpectedConditions;
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
    //vraShopBagTemplate = require('../../../../testData/OrderIntegration/Softlayer/SoftlayerShoppingCart.json');
    tier3TraditionalTemplate = require('../../../../testData/OrderIntegration/VRA/3tierTraditionalWorkload.json'),
    singleVMCentOSTemplate	= require('../../../../testData/OrderIntegration/VRA/singleVMCentOs.json'),
    tier3TraditionalTemplate74 = require('../../../../testData/OrderIntegration/VRA/3TierVRA74.json');


describe('Shopping cart Tests  --- Specific to private Cloud  and Enterprise systems', function () {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage, serviceName1, serviceName2, cartName, secGrpName, rgName2, avName, dzName, cartListPage, editedCartName,modifiedParamMapEdit;
    var modifiedParamMap = {};
    var modifiedParamMap1 = {};
    var messageStrings = {
        providerName: 'VRA',
        orderSubmittedConfirmationMessage: 'Order Submitted',
        cartSuccessfullyDeletedMessage: "Your cart has successfully been deleted.",
        cartSuccessfullyEmptiedMessage: "Your cart has successfully been emptied.",
        cartSuccessfullyTransferredToMessage:"Your cart has successfully been transferred to",
        deleteCartItemHeader: "Delete Cart Item",
        cartItemDeleted: "Success",
        estimatedMultiQuantity : 'USD 355.8876 /Month + USD 270.00 one time charges apply',
    };
    
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
        serviceName1 = "TestAutomation" + util.getRandomString(5);
        serviceName2 = "TestAutomation" + util.getRandomString(5);
        cartName = "vrashopBagCart" + util.getRandomString(5);
        editedCartName = "vraEditCart" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName1, "Cart Name": cartName, "Cart Service": "Add service to new cart" };
        modifiedParamMap1 = { "Service Instance Name": serviceName2, "Cart Name": "","Cart Service": "","Team":"","Environment":"","Application":""};

    });


    //e2e Flow by adding two services of VRA to shopping cart.
    it('Verify that Create new order with two VRA Services in shopping cart gets completed and delete them from inventory after successfull provisioning.', function () {
        var orderObject = {};
        var orderObj = {};
        var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
        catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Adding Another Service to same cart.
        cartListPage.continueShopping();

        var dnsshopObj = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
        catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
        orderObject.servicename = serviceName2;
        orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate, modifiedParamMap1);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Submitting Order
        cartListPage.submitOrder();
        orderObject.orderNumber = cartListPage.getTextOrderNumberOrderSubmittedModal();
        orderObject.totalPrice = cartListPage.getTextTotalPriceOrderSubmittedModal();
        expect(cartListPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        cartListPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        catalogPage.clickCartIcon();
        expect(cartListPage.isPresentCartInCartList(cartName)).toBe(false);
        if (isProvisioningRequired == "true") {
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed', 90);
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject); //Deleting Service 2
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 90);
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
    
    it("Add one service into cart, edit the cart details and delete the cart", function () {
        var orderObject = {};
        var orderObj = {};
        var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
        catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        util.waitForAngular();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        cartListPage.expandsTheCartDetailsTab();
        cartListPage.clickOnEditCartContextLink();
        cartListPage.verifyEditCartContextPanelIsOpened();
        modifiedParamMapEdit = {"Cart Name": editedCartName};
        //Edit the cart details
        cartListPage.editCartDetails(singleVMCentOSTemplate, modifiedParamMapEdit).then(function (requiredReturnMap) {
            //Click on update button cart button
            cartListPage.clickOnUpdateCartButton().then(function () {
                //Wait for spinner goes away
                util.waitForAngular();
                util.waitForAngular();
                //Get the cart context details 
                cartListPage.getCartContextData().then(function (actualMap) {
                    //verify the updated cart details
                    expect(actualMap["Actual"]["Team"]).toBe(requiredReturnMap["Expected"]["Team"])
                    //expect(actualMap["Actual"]["Organization"]).toBe(requiredReturnMap["Expected"]["Organization"]);
                    expect(cartListPage.getCartName(editedCartName)).toBe(cartName);
                });
            });
        });
        cartListPage.clickMenuIcon();
        
        //Delete the cart and validate if the cart is deleted.
        cartListPage.deleteCart();
        expect(cartListPage.getDeletedCartSuccessMessage()).toBe(messageStrings.cartSuccessfullyDeletedMessage);
        catalogPage.clickCartIcon();
        expect(cartListPage.isPresentCartInCartList(cartName)).toBe(false);
    });
    
    it('VRA : Transfer a shopping cart', function () {
        var orderObject = {};
        var orderObj = {};
        var userID = "transfercart456@gmail.com";
        var password = "Transfercart@456";
        var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
        catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        
        //Click on Cart Icon for transferring the cart
        cartListPage.clickCartIcon();
        cartListPage.selectCartFromList(cartName);
        cartListPage.clickMenuIcon();

        //Transfer the cart.
        cartListPage.tranferCart();
        cartListPage.searchForUserID(userID);
        cartListPage.confirmTransfer();
        //expect(cartListPage.isPresentSuccessMessageTransferCart()).toBe(true);
        expect(cartListPage.getTextSuccessMessageTransferCart()).toContain(messageStrings.cartSuccessfullyTransferredToMessage);
        
        //Logout to check the cartname in the transferred user account
        cartListPage.clickUserIcon();
        cartListPage.clickLogoutButton();
        cartListPage.loginFromOtherUser(userID, password);
        
        //Verifying the cart name is present in the transferred users account and deleting the cart
        catalogPage.open();
        cartListPage.clickCartIcon();
        expect(cartListPage.searchCartFromList(cartName).isPresent()).toBe(true);
        cartListPage.selectCartFromList(cartName);
        expect(cartListPage.isPresentCartInCartList(cartName)).toBe(true);
        expect(cartListPage.getTextCartName()).toContain(cartName);
        cartListPage.clickMenuIcon();
        cartListPage.deleteCart();
        expect(cartListPage.getDeletedCartSuccessMessage()).toBe(messageStrings.cartSuccessfullyDeletedMessage);
    });
    
    it('VRA : Delete items from a shopping cart,Empty cart and Pricing Validations', function () {
    	var orderObject = {};
        var orderObj = {};
        var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
        catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
        orderObj.servicename = serviceName1;
        orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Adding Another Service to same cart.
        cartListPage.continueShopping();

        var dnsshopObj = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
        catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
        orderObject.servicename = serviceName2;
        orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate, modifiedParamMap1);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        
        //Click on Cart Icon for transferring the cart
        
        
        var cartItem = serviceName1 + " ";
        cartListPage.deleteItemsInShoppingCart(cartItem);
        expect(cartListPage.getTextDeleteItemModalHeading()).toBe(messageStrings.deleteCartItemHeader);
    
    	//Clicking on confirmation in the delete popup
    	cartListPage.clickOkInDeleteItemsInCartPopup();
    	expect(cartListPage.isPresentCartItem(cartItem)).toBe(false);
    	
    	//Empting the cart
    	cartListPage.clickMenuIcon();
        cartListPage.emptyCart();
        expect(cartListPage.getTextSuccessfullyEmptiedCart()).toBe(messageStrings.cartSuccessfullyEmptiedMessage);
        
        //Delete the cart
        cartListPage.clickMenuIcon();
        cartListPage.deleteCart();
        expect(cartListPage.getDeletedCartSuccessMessage()).toBe(messageStrings.cartSuccessfullyDeletedMessage);
    });
    
    it('Private Cloud : Pricing Validation for Multiqunatity service in a Shopping Cart', function () {
        //var tier3Object = cartListPage.getCartTestData(tier3TraditionalTemplate74);
    	var multiquantityParamMap = { "Service Instance Name": serviceName1, "Cart Name": cartName, "Cart Service": "Add service to new cart","Quantity": "3" };
        //var multiquantityParamMap = { "Service Instance Name": serviceName1, "Quantity": "3" };
        catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate74.bluePrintName);
        orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate74, multiquantityParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        //Verify Pricing
        cartListPage.clickBillOfMaterials();
        cartListPage.clickExpandQuantity().then(function () {
            cartListPage.getTotalPriceOfAllInstances();
            expect(cartListPage.getEstimatedCost()).toBe(messageStrings.estimatedMultiQuantity);
            
            //Delete the cart.
            cartListPage.clickMenuIcon();
            cartListPage.deleteCart();
            expect(cartListPage.getDeletedCartSuccessMessage()).toBe(messageStrings.cartSuccessfullyDeletedMessage);
        });
    });
    
    it('Cent OS VRA ---- Verify Editing the VRA CentOS service which is added as part of shopping cart', function () {
        var orderObject = {};
    	var centOsObj = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
    	orderObject.servicename = serviceName1;
    	orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
    	//orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        cartListPage.submitOrder();
        orderObject.orderNumber = cartListPage.getTextOrderNumberOrderSubmittedModal();
        orderObject.totalPrice = cartListPage.getTextTotalPriceOrderSubmittedModal();
        expect(cartListPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        cartListPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        catalogPage.clickCartIcon();
        expect(cartListPage.isPresentCartInCartList(cartName)).toBe(false);
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			//orderFlowUtil.waitForOrderStatusChange(orderObject,'Provisioning in Progress');
			//orders.closeServiceDetailsSlider();
			//expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',30);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					//Function to edit the VRA service
					modifiedParamMap = {"Service Instance Name":"","Cart Service":"","Team":"","Cart Name":"","Environment":"","Application":"","Provider Account":"","CPU":"2","MEMORY":"1024","STORAGE":"5"};
					orderFlowUtil.editService(orderObject);
					orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
					placeOrderPage.submitOrder();
					orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    				orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
					placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
					expect(orderFlowUtil.verifyOrderType(orderObject)).toBe('EditSOI');
					orderFlowUtil.approveOrder(orderObject);
					orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
					orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
						//Delete the Edited service
						if (status == 'Completed') {
							orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
							expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
							orderFlowUtil.approveDeletedOrder(orderObject);
							//orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Provisioning in Progress');
							//expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Provisioning in Progress');
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
						}
					});
				}
			});

		}
	});

});
