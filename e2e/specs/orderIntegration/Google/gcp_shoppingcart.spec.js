

"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	OrderHistoryPage = require('../../../pageObjects/ordersHistory.pageObject.js'),
	CartListPage = require('../../../pageObjects/cartList.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	cloudStorageTemplate = require('../../../../testData/OrderIntegration/Google/cloudstorage.json'),
	persistentDiskTemplate = require('../../../../testData/OrderIntegration/Google/persistentdisk.json'),
	vpcTemplate = require('../../../../testData/OrderIntegration/Google/vpc.json'),
	isProvisioningRequired = browser.params.isProvisioningRequired;


describe('GCP - Cart Functionlaities', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage, cartListPage, orderHistoryPage, serviceName, cartName;
	var modifiedParamMap = {};
	var multiquantityParamMap = {};
	var messageStrings = {
		providerName: 'Google',
		catalogPageTitle: 'Search, Select and Configure',
		inputServiceNameWarning: "Parameter Warning:",
		orderSubmittedConfirmationMessage: 'Order Submitted',
	};

	beforeAll(function () {
		ordersPage = new Orders();
		homePage = new HomePage();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		cartListPage = new CartListPage();
		orderHistoryPage = new OrderHistoryPage();
		browser.driver.manage().window().maximize();
	});

	beforeEach(function () {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		serviceName = "auto-" + util.getRandomString(5);
		modifiedParamMap = { "Service Instance Name": serviceName };
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
	});

	it('TC- GCP-Cart-Pricing Validation for Multiqunatity service', function () {

		var persistentDiskInsObject = cartListPage.getCartTestData(persistentDiskTemplate);
		multiquantityParamMap = { "Service Instance Name": serviceName, "Quantity": "3" };
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(persistentDiskInsObject, multiquantityParamMap);
		placeOrderPage.addToShoppingCart();
		expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
		//Verify Pricing
		cartListPage.clickBillOfMaterials();
		cartListPage.clickExpandQuantity().then(function () {
			cartListPage.getTotalPriceOfAllInstances();
			expect(cartListPage.getEstimatedCost()).toBe(persistentDiskTemplate.TotalEstimatedCost_Cart_Multi_quantity);
			//Delete the cart.
			cartListPage.clickMenuIcon();
			cartListPage.deleteCart();
		});

	});

	it('GCP : E2E: Add Multiple Services to Cart, approve cart order and Delete the services', function () {
		var orderObject = {};
		var orderObj = {};

		var cloudStorageInsObject = cartListPage.getCartTestData(cloudStorageTemplate);
		var vpcInsObj = JSON.parse(JSON.stringify(vpcTemplate));
		var persistentDiskInsObject = JSON.parse(JSON.stringify(persistentDiskTemplate));

		orderObj.servicename = "auto-storage-" + util.getRandomString(5).toLowerCase();
		orderObj.bucketName = "qabucket-" + util.getRandomString(4).toLowerCase();
		modifiedParamMap = { "Service Instance Name": orderObj.servicename, "Name": orderObj.bucketName };

		catalogPage.clickProviderOrCategoryCheckbox(cloudStorageInsObject.Category);
		catalogPage.clickConfigureButtonBasedOnName(cloudStorageInsObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(cloudStorageInsObject, modifiedParamMap);
		//Validate pricing on Review order page
		expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(cloudStorageInsObject.EstimatedPrice);

		placeOrderPage.addToShoppingCart();
		expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
		//Adding Another Service to same cart.
		cartListPage.continueShopping();
		catalogPage.clickProviderOrCategoryCheckbox(vpcInsObj.Category);
		catalogPage.clickConfigureButtonBasedOnName(vpcInsObj.bluePrintName);
		orderObject.servicename = "auto-vpc-" + util.getRandomString(5).toLowerCase();
		orderObject.vpcName = "auto-vpc-" + util.getRandomString(5).toLowerCase();
		modifiedParamMap = { "Service Instance Name": orderObject.servicename, "Name": orderObject.vpcName };

		//Remove TEAM,Environment & Application options from json object since its disabled while adding second service to the same cart
		delete vpcInsObj["Order Parameters"]["Main Parameters"]["Team"];
		delete vpcInsObj["Order Parameters"]["Main Parameters"]["Environment"];
		delete vpcInsObj["Order Parameters"]["Main Parameters"]["Application"];

		orderFlowUtil.fillOrderDetails(vpcInsObj, modifiedParamMap);
		//Validate pricing on Review order page for second service
		expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(vpcInsObj.EstimatedPrice);

		placeOrderPage.addToShoppingCart();
		expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

		//Add a service with multiquantity with quantity as 3
		cartListPage.continueShopping();
		//Remove TEAM,Environment & Application options from json object since its disabled while adding second service to the same cart
		delete persistentDiskInsObject["Order Parameters"]["Main Parameters"]["Team"];
		delete persistentDiskInsObject["Order Parameters"]["Main Parameters"]["Environment"];
		delete persistentDiskInsObject["Order Parameters"]["Main Parameters"]["Application"];
		var pdserviceName = "auto-disk-" + util.getRandomString(3).toLowerCase();
		multiquantityParamMap = { "Service Instance Name": pdserviceName, "Quantity": "3" };
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(persistentDiskInsObject, multiquantityParamMap);
		placeOrderPage.addToShoppingCart();
		expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
		//Validate order Total on Shoppping cart page		
		cartListPage.validateEstimatedCostAllServicesCart().then(function (status) {
			expect(status).toEqual(true);
		});

		//Icrease quantity by 1 
		cartListPage.increaseQuntity("Persistent Disk");
		//Validate order Total with increased quantity on Shoppping cart page
		cartListPage.validateEstimatedCostAllServicesCart().then(function (status) {
			expect(status).toEqual(true);
		});

		//Delete multi-qunatity service from cart
		cartListPage.deleteItemsInShoppingCart(pdserviceName);
		cartListPage.clickOkInDeleteItemsInCartPopup();
		//Again Validate Estimated cost and Bill of materials of all services in cart after deleting 1 service
		cartListPage.validateEstimatedCostAllServicesCart().then(function (status) {
			expect(status).toEqual(true);
		});

		//Submitting Order
		cartListPage.submitOrder();
		orderObject.orderNumber = cartListPage.getTextOrderNumberOrderSubmittedModal();
		orderObject.totalPrice = cartListPage.getTextTotalPriceOrderSubmittedModal();
		expect(cartListPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		cartListPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

		var orderTotal = parseFloat((cloudStorageInsObject.TotalCost).replace("USD ", "")) + parseFloat((vpcInsObj.TotalCost).replace("USD ", ""));
		var serviceListWithPricing = {};
		serviceListWithPricing = { "Cloud Storage": cloudStorageInsObject.TotalCost, "VPC Network": vpcInsObj.TotalCost };

		if (isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed', 30);
			expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					//Validate BOM of 1st and 2nd service on Approve Order -->Service Details page						
					ordersPage.validateEstimatedCostAllServicesofCart(serviceListWithPricing).then(function (status) {
						expect(status).toEqual(true);
					});
					//Validate pricing on order history page. Sum of price of 2 services should be equal to order total
					orderHistoryPage.validatePricingonOrderHistory(orderObject.orderNumber, "USD " + orderTotal, serviceListWithPricing).then(function (status) {
						expect(status).toEqual(true);
					});
					//Deleting Service 1
					orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObj);
					orderFlowUtil.approveDeletedOrder(orderObject);
					orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 35);
					orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject).then(function (status) {
						if (status == 'Completed') {
							//Deleting Service 2
							orderObj.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
							orderFlowUtil.approveDeletedOrder(orderObj);
							orderFlowUtil.waitForDeleteOrderStatusChange(orderObj, 'Completed', 35);
							expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObj)).toBe('Completed');
						}
					});
				}
			})
		}
	});

	it('GCP : Edit/Empty/Delete shopping cart', function () {
		var persistentDiskInsObject = cartListPage.getCartTestData(persistentDiskTemplate);
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(persistentDiskInsObject, modifiedParamMap);
		placeOrderPage.addToShoppingCart();
		expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
		catalogPage.open();
		cartName = persistentDiskInsObject["Order Parameters"]["Main Parameters"]["Cart Name"]["value"]["QA 4"];
		cartListPage.clickCartIcon();
		cartListPage.selectCartFromList(cartName);
		//Edit Cart Flow
		cartListPage.expandsTheCartDetailsTab();
		cartListPage.clickOnEditCartContextLink();
		cartListPage.verifyEditCartContextPanelIsOpened();
		var newCartName = "new-cart-" + util.getRandomString(4).toLowerCase();
		cartListPage.setCartName_EditCartContext(newCartName);
		cartListPage.clickOnUpdateCartButton();
		//verify cart name is updated		
		expect(cartListPage.getCartName()).toEqual(newCartName);
		//Empty Cart 		
		cartListPage.clickMenuIcon();
		cartListPage.emptyCart();
		//Delete the cart.
		cartListPage.clickMenuIcon();
		cartListPage.deleteCart();
		//Close Notification PopUp
		//cartListPage.closeNotificationPopUp();
		cartListPage.clickCartIcon();
		//expect cart not be present in Cart List
		expect(cartListPage.searchCartFromList(newCartName).isPresent()).toBeFalsy();
	});

	it('GCP : Buyers ability to Transfer a shopping cart', function () {
		var orderObject = {};
		var orderObj = {};
		var userID = "transfercart456@gmail.com";
		var password = "Transfercart@456";
		var cloudStorageInsObject = cartListPage.getCartTestData(cloudStorageTemplate);
		catalogPage.clickProviderOrCategoryCheckbox(cloudStorageInsObject.Category);
		catalogPage.clickConfigureButtonBasedOnName(cloudStorageTemplate.bluePrintName);
		orderObj.servicename = "auto-gcp-cart-" + util.getRandomString(5).toLowerCase();
		orderObj.bucketName = "qabucket-" + util.getRandomString(4).toLowerCase();
		modifiedParamMap = { "Service Instance Name": orderObj.servicename, "Name": orderObj.bucketName };
		orderFlowUtil.fillOrderDetails(cloudStorageInsObject, modifiedParamMap);
		placeOrderPage.addToShoppingCart();
		expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
		catalogPage.open();
		cartName = cloudStorageInsObject["Order Parameters"]["Main Parameters"]["Cart Name"]["value"]["QA 4"];

		cartListPage.clickCartIcon();
		cartListPage.selectCartFromList(cartName);
		cartListPage.clickMenuIcon();

		//Transfer the cart.
		cartListPage.tranferCart();
		cartListPage.searchForUserID(userID);
		cartListPage.confirmTransfer();

		// expect cart not present in list
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
		});

	});

	it('GCP : Edit Service submitted through shopping cart', function () {
		var orderObject = {};
		var persistentDiskInsObject = cartListPage.getCartTestData(persistentDiskTemplate);
		orderObject.servicename = serviceName;
		//multiquantityParamMap = { "Service Instance Name": serviceName, "Quantity": "3" };
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(persistentDiskInsObject, modifiedParamMap);
		placeOrderPage.addToShoppingCart();
		expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
		cartListPage.submitOrder();
		orderObject.orderNumber = cartListPage.getTextOrderNumberOrderSubmittedModal();
		orderObject.totalPrice = cartListPage.getTextTotalPriceOrderSubmittedModal();
		expect(cartListPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		cartListPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		catalogPage.clickCartIcon();
		cartName = persistentDiskInsObject["Order Parameters"]["Main Parameters"]["Cart Name"]["value"]["QA 4"];
        	expect(cartListPage.isPresentCartInCartList(cartName)).toBe(false);
		if(isProvisioningRequired == "true") {
			orderFlowUtil.approveOrder(orderObject);						
			orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');			
			orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
				if (status == 'Completed') {
					//Function to edit the service
					modifiedParamMap = { "Service Instance Name": "", "Instance Name": "", "EditService" : true, "Size (GB)" : "70"};
					orderFlowUtil.editService(orderObject);
					orderFlowUtil.fillOrderDetails(persistentDiskInsObject,modifiedParamMap);
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
