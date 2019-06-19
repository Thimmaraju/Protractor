/*
Spec_Name: azureShoppingBagOrders.spec.js 
Description: This spec will cover E2E testing of services in shopping bag order submit, approve and delete.
Author: Moti Prasad Ale
*/

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    CartListPage = require('../../../pageObjects/cartList.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    EC = protractor.ExpectedConditions,
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    azshopBagTemplate = require('../../../../testData/OrderIntegration/Azure/AzShoppingCart.json');


describe('Azure Shopping cart Tests', function () {
    var orders, homePage, dashBoard,inventoryPage, catalogPage, placeOrderPage, serviceName1, serviceName2,serviceName3, cartName, rgName1, rgName2, rgName3 , avName, dzName, nsName,nhName,cartListPage; 
    var modifiedParamMap = {};
    var modifiedParamMap1 = {};
    var modifiedParamMap2 = {};
    var modifiedParamMapedit = {};
    var messageStrings = {
    		providerName:'Azure',
    		orderSubmittedConfirmationMessage: 'Order Submitted'
    		};
    	serviceName1 = "AzAVshopBagnewServ"+util.getRandomString(5);
        serviceName2 = "AzDnshopBagnewServ"+util.getRandomString(5);
        serviceName3 = "AzNhshopBagnewServ"+util.getRandomString(5);
    	cartName = "AzshopBagCart"+util.getRandomString(5);
    	rgName1 = "gslauto_tcAVshopBagnewRG"+util.getRandomString(5);
        rgName2 = "gslauto_tcDnshopBagnewRG"+util.getRandomString(5);
        rgName3 = "gslauto_tcNhhopBagnewRG"+util.getRandomString(5);
    	avName = "shopbagnewav"+util.getRandomNumber(5);
        dzName = "shopbag.newdz"+util.getRandomNumber(5);
        nsName ="shopbagnewns"+util.getRandomNumber(5);
        nhName ="shopbagnewnh"+util.getRandomNumber(5);

	modifiedParamMap = {"Service Instance Name":serviceName1,"Cart Name":cartName,"Cart Service":"Add service to new cart", "New Resource Group":rgName1, "Availability Set Name":avName};	
	modifiedParamMap1 = {"Service Instance Name":serviceName2,"Cart Name":cartName, "New Resource Group":rgName2, "DNS Zone Name":dzName};	
    modifiedParamMap2 = {"Service Instance Name":serviceName1,"Cart Name":cartName,"Cart Service":"Add service to new cart", "New Resource Group":rgName3, "Notification Hub Name":nhName, "New Namespace Name":nsName}; 
    beforeAll(function() {
        orders = new Orders();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
	placeOrderPage = new PlaceOrderPage()
    cartListPage = new CartListPage();
    inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function() {
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    });


    it('TC-C216867 Verify that Create new/Delete order with two Azure Services in shopping cart gets completed.', function() { 
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
    	cartListPage.continueShopping();

        var dnsshopObj = JSON.parse(JSON.stringify(azshopBagTemplate.dnsServ));
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
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed',30);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject); //Deleting Service 2
					orderFlowUtil.approveDeletedOrder(orderObject);
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed',35);
					expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
				}
			})
                        //Deleting Service 2
                        orderObj.deleteOrderNumber = orderFlowUtil.deleteService(orderObj);
                        orderFlowUtil.approveDeletedOrder(orderObj);
                        orderFlowUtil.waitForDeleteOrderStatusChange(orderObj, 'Completed',35);
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObj)).toBe('Completed'); 
		}  
    });
    it('Verify that Create and Edit new/Delete order with one Azure Service in shopping cart gets completed.', function() { 
    	var orderObject = {};
        var orderObj = {};
        var returnObj1 = {};
    	var nhshopObj = JSON.parse(JSON.stringify(azshopBagTemplate.notiHub));
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(nhshopObj.Category);
    	catalogPage.clickConfigureButtonBasedOnName(nhshopObj.bluePrintName);
    	orderObj.servicename = serviceName1;
    	orderFlowUtil.fillOrderDetails(nhshopObj, modifiedParamMap2);
    	placeOrderPage.addToShoppingCart();
    	expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Submitting Order
    	cartListPage.submitOrder();
    	orderObject.orderNumber = cartListPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = cartListPage.getTextTotalPriceOrderSubmittedModal();
        expect(cartListPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        cartListPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		if(isProvisioningRequired == "true") {
            orderFlowUtil.approveOrder(orderObject);
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Provisioning in Progress');
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');

            //Editing Notification Hub Namespace Service
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(orderObj.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickEditServiceIcon();
            browser.sleep(10000);
            inventoryPage.clickNextButton();
            modifiedParamMapedit = { "Service Instance Name": serviceName1, "EditService": true };

            orderFlowUtil.fillOrderDetails(nhshopObj, modifiedParamMapedit);
            placeOrderPage.submitOrder();

            returnObj1.servicename = serviceName1;
            returnObj1.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            returnObj1.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

            //Open Order page and Approve Order 
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');

            placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(returnObj1);
            orderFlowUtil.waitForOrderStatusChange(returnObj1, "Completed", 50);
            inventoryPage.open();
            inventoryPage.searchOrderByServiceName(returnObj1.servicename);
            element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click();
            inventoryPage.clickViewService();

            returnObj1.deleteOrderNumber = orderFlowUtil.deleteService(returnObj1);
           
            orderFlowUtil.approveDeletedOrder(returnObj1);
            orderFlowUtil.waitForDeleteOrderStatusChange(returnObj1, 'Completed');
            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(returnObj1)).toBe('Completed');
		}  
    });
});
