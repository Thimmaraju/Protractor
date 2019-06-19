"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    OrderHistoryPage = require('../../../pageObjects/ordersHistory.pageObject.js'),
    CartListPage = require('../../../pageObjects/cartList.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    efsInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSEFSInstance.json'),
    ec2InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSEC2Instance.json'),
    snsInstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSSNSInstance.json'),
    s3InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSS3Instance.json'),
    isProvisioningRequired = browser.params.isProvisioningRequired;


describe('AWS - Cart Functionlaities', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, cartListPage, serviceName, cartName, orderHistoryPage;
    var modifiedParamMap = {};
    var EC = protractor.ExpectedConditions;
    var multiquantityParamMap = {};
    var messageStrings = {
        providerName: 'Amazon',
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
        serviceName = "TestAutomationCart" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
    });

    it('TC- AWS-Cart-Pricing Validation for Multiqunatity service', function () {
        var ec2InsObject = cartListPage.getCartTestData(ec2InstanceTemplate);
        multiquantityParamMap = { "Service Instance Name": serviceName, "Quantity": "3" };
        catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(ec2InsObject, multiquantityParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        //Verify Pricing
        cartListPage.clickBillOfMaterials();
        cartListPage.clickExpandQuantity().then(function () {
            cartListPage.getTotalPriceOfAllInstances();
            expect(cartListPage.getEstimatedCost()).toBe(ec2InstanceTemplate.TotalEstimatedCost_Cart_Multiquantity);
            cartListPage.clickMenuIcon();
            //Delete the cart.
            cartListPage.deleteCart();
        });

    });

    it('AWS : Add multiple Services to same cart, validate pricing, approve cart order and Delete the services', function () {
        var orderObject = {};
        var orderObj = {};

        var efsInsObject = cartListPage.getCartTestData(efsInstanceTemplate);
        orderObj.servicename = "TestAutomationCart" + util.getRandomString(5).toLowerCase();
        modifiedParamMap = { "Service Instance Name": orderObj.servicename };

        catalogPage.clickProviderOrCategoryCheckbox(efsInsObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(efsInsObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(efsInsObject, modifiedParamMap);
        //Validate pricing on Review order page
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(efsInsObject.EstimatedPrice);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Adding Another Service to same cart.
        cartListPage.continueShopping();
        var snsInsObj = JSON.parse(JSON.stringify(snsInstanceTemplate));
        catalogPage.clickProviderOrCategoryCheckbox(snsInsObj.Category);
        catalogPage.clickConfigureButtonBasedOnName(snsInsObj.bluePrintName);
        orderObject.servicename = "TestAutomationCart" + util.getRandomString(5).toLowerCase();
        modifiedParamMap = { "Service Instance Name": orderObject.servicename };
        //Remove TEAM,Environment & Application options from json object since its disabled while adding second service to the same cart
        delete snsInsObj["Order Parameters"]["Main Parameters"]["Team"];
        delete snsInsObj["Order Parameters"]["Main Parameters"]["Environment"];
        delete snsInsObj["Order Parameters"]["Main Parameters"]["Application"];
        orderFlowUtil.fillOrderDetails(snsInsObj, modifiedParamMap);
        //Validate pricing on Review order page
        expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(snsInsObj.EstimatedPrice);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Add a service with multiquantity with quantity as 3
        cartListPage.continueShopping();
        var ec2InsObject = JSON.parse(JSON.stringify(ec2InstanceTemplate));
        var ec2ServiceName = "auto-ec2-" + util.getRandomString(3).toLowerCase();
        multiquantityParamMap = { "Service Instance Name": ec2ServiceName, "Quantity": "3" };
        catalogPage.clickProviderOrCategoryCheckbox(ec2InsObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
        //Remove TEAM,Environment & Application options from json object since its disabled while adding second service to the same cart	
        delete ec2InsObject["Order Parameters"]["Main Parameters"]["Team"];
        delete ec2InsObject["Order Parameters"]["Main Parameters"]["Environment"];
        delete ec2InsObject["Order Parameters"]["Main Parameters"]["Application"];
        orderFlowUtil.fillOrderDetails(ec2InsObject, multiquantityParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);

        //Validate order Total on Shoppping cart page		
        cartListPage.validateEstimatedCostAllServicesCart().then(function (status) {
            expect(status).toEqual(true);
        });
        //Icrease quantity by 1 
        cartListPage.increaseQuntity("Elastic Compute Cloud (EC2)");
        ///Validate order Total with increased quantity on Shoppping cart page
        cartListPage.validateEstimatedCostAllServicesCart().then(function (status) {
            expect(status).toEqual(true);
        });

        //Delete multi-qunatity service from cart
        cartListPage.deleteItemsInShoppingCart(ec2ServiceName);
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

        var orderTotal = parseFloat((efsInsObject.TotalCost).replace("USD ", "")) + parseFloat((snsInsObj.TotalCost).replace("USD ", ""));
        orderTotal = orderTotal.toFixed(2);

        var serviceListWithPricing = {};
        serviceListWithPricing = { "Elastic Block Store (EBS)": efsInsObject.TotalCost, "Simple Notification Service (SN...": snsInsObj.TotalCost };

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
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed', 35);
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                    orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject).then(function (status) {
                        if (status == 'Completed') {
                            //Deleting Service 2
                            orderObj.deleteOrderNumber = orderFlowUtil.deleteService(orderObj);
                            orderFlowUtil.approveDeletedOrder(orderObj);
                            orderFlowUtil.waitForDeleteOrderStatusChange(orderObj, 'Completed', 35);
                            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObj)).toBe('Completed');
                        }
                    });
                }

            });

        }

    });

    it('AWS : Add, edit and delete a service', function () {
        var orderObject = {};

        var s3InsObject = cartListPage.getCartTestData(s3InstanceTemplate);
        var serviceName = "TestAutomationCart" + util.getRandomString(5).toLowerCase();
        orderObject.servicename = serviceName;
        var bucketName = "buckettestaut" + util.getRandomString(5);
        bucketName = bucketName.toLowerCase();
        var logBucketName = "logbuckettestaut" + util.getRandomString(5);
        logBucketName = logBucketName.toLowerCase();
        modifiedParamMap = { "Service Instance Name": serviceName, "Bucket Name": bucketName, "Log Bucket Name": logBucketName };

        catalogPage.clickProviderOrCategoryCheckbox(s3InsObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(s3InsObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(s3InsObject, modifiedParamMap);
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
            //Edit service flow
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    var modifiedParamMap = { "EditService": true };
                    orderFlowUtil.editService(orderObject);
                    orderFlowUtil.fillOrderDetails(s3InstanceTemplate, modifiedParamMap).then(function () {
                        logger.info("Edit parameter details are filled.");
                        browser.sleep(5000);
                    });
                    placeOrderPage.submitOrder();
                    orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                    expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                    placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
                    orderFlowUtil.approveOrder(orderObject);
                    orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
                    orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                        if (status == 'Completed') {
                            //Verify updated details are reflected on order details page.						
                            ordersPage.clickFirstViewDetailsOrdersTable();
                            expect(ordersPage.getTextBasedOnLabelName("Versioning")).toEqual(jsonUtil.getValueEditParameter(s3InsObject, "Versioning"));
                            expect(ordersPage.getTextBasedOnLabelName("Transfer Acceleration")).toEqual(jsonUtil.getValueEditParameter(s3InsObject, "Transfer Acceleration"));
                            expect(ordersPage.getTextBasedOnLabelName("Default Encryption")).toEqual(jsonUtil.getValueEditParameter(s3InsObject, "Default Encryption"));
                            expect(ordersPage.getTextBasedOnLabelName("Access Control")).toEqual(jsonUtil.getValueEditParameter(s3InsObject, "Access Control"));
                            expect(ordersPage.getTextBasedOnLabelName("Key")).toEqual(jsonUtil.getValueEditParameter(s3InsObject, "Key"));
                            expect(ordersPage.getTextBasedOnLabelName("Value")).toEqual(jsonUtil.getValueEditParameter(s3InsObject, "Value"));
                            //Delete Service flow
                            orderObject.servicename = serviceName;
                            orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                            orderFlowUtil.approveDeletedOrder(orderObject);
                            orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                            expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                        }
                    });
                }
            })

        }

    });

    it('AWS : Edit/Empty/Delete shopping cart', function () {
        var ec2InsObject = cartListPage.getCartTestData(ec2InstanceTemplate);
        catalogPage.clickConfigureButtonBasedOnName(ec2InsObject.bluePrintName);
        orderFlowUtil.fillOrderDetails(ec2InsObject, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        catalogPage.open();
        cartName = ec2InsObject["Order Parameters"]["Main Parameters"]["Cart Name"]["value"]["QA 4"];
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

    it('AWS : Buyers ability to Transfer a shopping cart', function () {
        var orderObject = {};
        var orderObj = {};
        var userID = "transfercart456@gmail.com";
        var password = "Transfercart@456";
        var efsInsObject = cartListPage.getCartTestData(efsInstanceTemplate);
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(efsInsObject.Category);
        catalogPage.clickConfigureButtonBasedOnName(efsInsObject.bluePrintName);
        orderObj.servicename = "TestAutomationCart" + util.getRandomString(5).toLowerCase();
        modifiedParamMap = { "Service Instance Name": orderObj.servicename };
        orderFlowUtil.fillOrderDetails(efsInsObject, modifiedParamMap);
        placeOrderPage.addToShoppingCart();
        expect(cartListPage.isPresentSuccessfullyAddedToCart()).toBe(true);
        catalogPage.open();
        cartName = efsInsObject["Order Parameters"]["Main Parameters"]["Cart Name"]["value"]["QA 4"];

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

});

