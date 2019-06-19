"use strict"; 
var logGenerator = require("./logGenerator.js"),
	logger = logGenerator.getApplicationLogger(),
	CatalogPage = require('../e2e/pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../e2e/pageObjects/placeOrder.pageObject.js'),
	OrdersPage = require('../e2e/pageObjects/orders.pageObject.js'),
	InventoryPage = require('../e2e/pageObjects/inventory.pageObject.js'),
	util = require('./util.js');

var catalogPage, placeOrderPage , ordersPage, inventoryPage;
var fs = require('fs');

var totalRepeatCount = 20;
var currentRepeatCount = 0;

catalogPage = new CatalogPage();
placeOrderPage = new PlaceOrderPage();
ordersPage = new OrdersPage();
inventoryPage = new InventoryPage();

var defaultOrderObject = {
		"bluePrintName": "VPC Single Instance For EC2",
		"provider": "amazon",
	 	"serviceName": "amazon VPC" + util.getRandomString(4)
};



function verifyBuyerOrderStatus(orderObject) {
	ordersPage.openNew();
	browser.sleep(5000);
	ordersPage.searchBuyerOrderNumber(orderObject.orderNumber);
	return ordersPage.getTextOrderStatusOrderHistory();
}

function waitForDeleteOrderStatusChange(expectedChangedStatus) {
	ordersPage.open();
	ordersPage.clickFirstViewDetailsOrdersTable();
	var EC = browser.ExpectedConditions;
	browser.wait(EC.visibilityOf(element(by.css("#status"))), 30000).then(function(){
		element(by.css("#status")).getAttribute("value").then(function(text){		
			var totalRepeatCount = 3;
			var currentRepeatCount = 0;
			var orderStatus = text;
			logger.info("Delete order status before: "+orderStatus);
			while(currentRepeatCount<totalRepeatCount && expectedChangedStatus != orderStatus){
				currentRepeatCount = currentRepeatCount+1;
				ordersPage.open();
				ordersPage.clickFirstViewDetailsOrdersTable();
				EC = browser.ExpectedConditions;
				browser.wait(EC.visibilityOf(element(by.css("#status"))), 30000).then(function(){
					element(by.css("#status")).getAttribute("value").then(function(text){
						orderStatus = text;
						logger.info("Delete order status within loop: "+orderStatus);
					})
				})
			}			
		})
	})
}

function verifyOrderStatusDeletedOrder() {
	ordersPage.open();
	browser.sleep(5000);
	return ordersPage.getTextFirstOrderStatusOrdersTable();
}

function verifyOrderType(orderObject) {
	ordersPage.open();
	ordersPage.searchOrderById(orderObject.orderNumber);
	return ordersPage.getTextFirstOrderTypeOrdersTable();
}

function verifyOrderTypeDeletedOrder() {
	ordersPage.open();
	return ordersPage.getTextFirstOrderTypeOrdersTable();
}

function getOrderCreatedDate(orderObject) {
	ordersPage.open();
	ordersPage.searchOrderById(orderObject.orderNumber);
	return ordersPage.getTextOrderCreatedDateOrderDetails();
}

async function waitForOrderStatusChangeWithAsyncAwait(orderObject, expectedChangedStatus) {
    currentRepeatCount = currentRepeatCount+1;
    ordersPage.openNew();
    ordersPage.searchBuyerOrderNumber(orderObject.orderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    var EC = browser.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(by.css("#status"))), 30000).then(function(){
        element(by.css("#status")).getText().then(function(text){
            if(currentRepeatCount == totalRepeatCount){
                return;
            }else{
                if(text == expectedChangedStatus){
                    logger.info("Order status is changed to: " + text);
                    return;
                }else{
                    browser.sleep(10000);
                    waitForOrderStatusChange(orderObject,expectedChangedStatus);
                    logger.info("Waiting for Order status to be " + expectedChangedStatus + ", current status: "+text);
                }
            }
        })
    })
}

function waitForOrderStatusChange(orderObject, expectedChangedStatus) {
    currentRepeatCount = currentRepeatCount+1;
    ordersPage.openNew();
    ordersPage.searchBuyerOrderNumber(orderObject.orderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    var EC = browser.ExpectedConditions;
    browser.wait(EC.visibilityOf(element(by.css("#status"))), 30000).then(function(){
        element(by.css("#status")).getText().then(function(text){
            if(currentRepeatCount == totalRepeatCount){
                return;
            }else{
                if(text == expectedChangedStatus){
                    logger.info("Order status is changed to: " + text);
                    return;
                }else{
                    if(text == "Failed"){
                        ordersPage.getTextFailureReason();
                        return;
                    }else{
                        browser.sleep(10000);
                        waitForOrderStatusChange(orderObject,expectedChangedStatus);
                        logger.info("Waiting for Order status to be "+expectedChangedStatus + ", current status: " + text);
                    }
                }
            }
        })
    })
}

async function waitForBuyerOrderStatusChange(orderObject, expectedChangedStatus) {
    ordersPage.openNew();
    ordersPage.searchBuyerOrderNumber(orderObject.orderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    var EC = browser.ExpectedConditions;
    browser.wait(EC.visibilityOf(element(by.css("#status"))), 30000).then(function(){
        element(by.css("#status")).getAttribute("value").then(function(text){
            var totalRepeatCount = 3;
            var currentRepeatCount = 0;
            var orderStatus = text;
            logger.info("Order status before: " + orderStatus);
            while (!(expectedChangedStatus === orderStatus) && (currentRepeatCount < totalRepeatCount)){
                //console.log(`expectedChangedStatus is : ${expectedChangedStatus} and orderStatus os ${orderStatus}`)
                currentRepeatCount = currentRepeatCount+1;
                ordersPage.openNew();
                ordersPage.searchBuyerOrderNumber(orderObject.orderNumber);
                //ordersPage.clickFirstViewDetailsOrdersTable();
                EC = browser.ExpectedConditions;
                browser.wait(EC.visibilityOf(element(by.css("#status"))), 30000).then(function(){
                    element(by.css("#status")).getText().then(function(text){
                        orderStatus = text;
                        logger.info("Order status within loop: "+orderStatus);
                    })
                })
            }
        })
    })
}

function waitForOrderCompletion(orderObject,waitTime) {
	ordersPage.open();
	ordersPage.searchOrderById(orderObject.orderNumber);
	ordersPage.clickFirstViewDetailsOrdersTable();
	var EC = browser.ExpectedConditions;
	browser.wait(EC.visibilityOf(element(by.css("#status"))), 30000).then(function(){
		element(by.css("#status")).getAttribute("value").then(function(text){
			if(text == "Completed"){
				logger.info("Order status is changed to: "+text);
				return;
			}else{
				if(text == "Failed"){
					logger.info("Order status is changed to: "+text);
					return;
				}else{
					browser.sleep(10000);
					waitForOrderCompletion(orderObject,waitTime);
					logger.info("Waiting for Order status to be Completed or Failed, current status: "+text);
				}
			}			
		})
	})
}

function deleteService(orderObject) {
	inventoryPage.open();
	inventoryPage.searchOrderByServiceName(orderObject.servicename);
	util.waitForAngular();
	inventoryPage.clickDeleteFirstInstance();
	inventoryPage.clickConfirmCheckBoxDeleteServiceModal();
	inventoryPage.clickOKDeleteServiceModal();
	return inventoryPage.getDeleteOrderNumber();
}

function approveDeletedOrder(orderObject) {
	ordersPage.open();
	ordersPage.searchOrderById(orderObject.deleteOrderNumber);
	ordersPage.clickFirstViewDetailsOrdersTable();
	ordersPage.clickApproveButtonOrderDetails();
	ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
	ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
	ordersPage.clickApproveButtonOrderApprovalModal();
	ordersPage.clickOkInOrderApprovalModal();
}

function denyOrder(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.orderNumber);
    ordersPage.clickFirstViewDetailsOrdersTable();
    ordersPage.clickDenyButtonOrderDetails();
    ordersPage.clickTechnicalApprovalCheckBoxOrderDenyModal();
    ordersPage.setTextCommentsTextareaOrderDenyModal("Testing");
    ordersPage.clickDenyInOrderDenyModal();
    ordersPage.clickOkDenialWasProcessed();
}


function cancelOrder(orderObject) {
	ordersPage.open();
	ordersPage.searchOrderById(orderObject.orderNumber);
	ordersPage.clickFirstViewDetailsOrdersTable();
	browser.sleep("4000");
	ordersPage.clickCancelButtonOrderApprovalModal();
	ordersPage.clickYesButtonOnCancelPopup();
}

module.exports = {
	    verifyBuyerOrderStatus:verifyBuyerOrderStatus,
	    waitForOrderCompletion:waitForOrderCompletion,
	    deleteService:deleteService,
	    approveDeletedOrder:approveDeletedOrder,
	    verifyOrderType:verifyOrderType,
	    verifyOrderTypeDeletedOrder:verifyOrderTypeDeletedOrder,
	    verifyOrderStatusDeletedOrder:verifyOrderStatusDeletedOrder,
	    denyOrder:denyOrder,
	    cancelOrder:cancelOrder,
	    getOrderCreatedDate:getOrderCreatedDate,
	    waitForDeleteOrderStatusChange:waitForDeleteOrderStatusChange,
	    waitForOrderStatusChangeWithAsyncAwait:waitForOrderStatusChangeWithAsyncAwait,
    	waitForBuyerOrderStatusChange: waitForBuyerOrderStatusChange
};
