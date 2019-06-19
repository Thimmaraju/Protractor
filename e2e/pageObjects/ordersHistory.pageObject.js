"use strict";

var extend = require('extend');
var url = browser.params.url;
var util = require('../../helpers/util.js');
var logGenerator = require("../../helpers/logGenerator.js"),
logger = logGenerator.getApplicationLogger();
var jsonUtil = require('../../helpers/jsonUtil.js');
var CartListPage = require('../pageObjects/cartList.pageObject.js');

var EC = protractor.ExpectedConditions;

var defaultConfig = {
		pageUrl:                      		url + '/orders/my-orders',
		allOrderTextByXpath:        		'//span[contains(text(), "All Orders")]',
		orderSearchTextBoxCss:	  			'#search__input-orders-search',
		orderStatusByXpath:					'//span[@id="status"]',

		//******************Locators for Order Details Section*******************
		orderTableDetailsExpandArrowCss:    		'svg.bx--accordion__arrow',
		orderTableActionIconCss: 					'.bx--overflow-menu__icon',
		orderTableActionsRetryCss:					'#carbon-deluxe-data-table-1-parent-row-1-option-1-button',
		orderTableActionsCancelCss:					'#carbon-deluxe-data-table-1-parent-row-1-option-2-button',
		orderTableActionsViewCommentsCss:			'#carbon-deluxe-data-table-1-parent-row-1-option-4-button',
		orderTableActionsViewCommentsModelCss: 		'.bx--modal is-visible',
		orderTableActionsViewCommentsModelHeaderXpath: 		'//h2[contains(text(), "Service Status Details")]',
		orderTableActionsViewCommentsModelErrorMsgXpath: 	'//h2[contains(text(), "Service Status Details")]/../following-sibling::div/div',
		orderTableActionsViewCommentsModelCloseXpath:		'//h2[contains(text(), "Service Status Details")]/following-sibling::button',
	    orderTableOrderIDColumnCss:    				'#order-id-header',
	    orderTableCreatedDateColumnCss:    			'#created-date',
	    orderTableOrderStatusColumnCss:    			'div.first-row span#status',		
		orderTableActionsRetryYesCss:				'#button-order_retry_yes',
		orderTableActionsRetryNoCss:				'#button-order_retry_no',
		orderTableActionsRetryCloseCss:				'#close-btn_retry-service-modal',
		orderTableActionsRetryModelCss: 			'.bx--modal is-visible',
		orderTableActionsRetryModelHeaderXpath: 	'//h2[contains(text(), "Retry Service Fulfillment")]',
		orderTableActionsRetryModelMsgXpath: 		'//span[@id="retry_message"][contains(text(), "Are you sure you want to retry provisioning for this service?")]',
		orderTableActionsRetryModelSuccessMsgXpath: '//carbon-notification[contains(@class, "bx--inline-notification bx--inline-notification--success")][@type="success"]',
		orderTableActionsRetryModelOkButtonXpath: 	'#button-order_retry_ok',
		orderTableActionsCancelYesCss:				'#button-order_cancel_yes',
		orderTableActionsCancelNoCss:				'#button-order_cancel_no',
		orderTableActionsCancelCloseCss:			'#close-btn_cancel-service-modal',
		orderTableActionsCancelModelCss: 			'.bx--modal is-visible',
		orderTableActionsCancelModelHeaderXpath: 	'//h2[contains(text(), "Cancel Service")]',
		orderTableActionsCancelModelMsgXpath: 		'//span[@id="cancel_message"][contains(text(), "Are you sure you want to cancel this service?")]',
		orderTableActionsCancelModelSuccessMsgXpath:	'//carbon-notification[contains(@class, "bx--inline-notification bx--inline-notification--success")][@type="success"]',
		orderTableActionsCancelModelOkButtonXpath: 	'#button-order_cancel_ok',
		txtOrderTotalXpath:'//div[@id ="total-cost"]',
		txtEstimatedCostXpath:'//td[contains(text(),"USD")]',
		lnkBillOfMaterialXapth:'//a[contains(text(), "Bill of Materials")]',
		lnkMoreXpath:'//*[text()="More"]',
		btnCloseXpath:'//*[text()="Service Details"]/../carbon-icon',
		orderTotalCostBillofMaterialsTabCss:	'#total_cost_value',



		//**********   Filter by Period  ***************
		selectOrdersFromCreatedTimeByCss:			'#bx--dropdown-single-parent_ordercreatedtime',


		//*********   Filter by Order Status ******************
		selectOrdersFromOrderStatusByCss:			'#bx--dropdown-single-parent_orderstatus',



};


//******** Order status *************
global.failedStatus = "Failed";
global.approvalInProgressStatus = 'Approval In Progress';
global.provisioningInProgressStatus = 'Provisioning in Progress';


function ordersHistory(selectorConfig) {
	if (!(this instanceof ordersHistory)) {
		return new ordersHistory(selectorConfig);
	}
	extend(this, defaultConfig);

	if (selectorConfig) {
		extend(this, selectorConfig);
	}
}

ordersHistory.prototype.open = function()
{
	browser.get(this.pageUrl);
	browser.wait(EC.urlContains("/orders/my-orders"), 10000);
	util.waitForAngular();
};


//******************************Function for checking visibility of element********//

ordersHistory.prototype.verifyAllOrderText = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.allOrderTextByXpath))),30000).then(function(){
		logger.info("All Orders Text is shown...");
	});
};

ordersHistory.prototype.verifyOrdersFromCreatedTime = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.selectOrdersFromCreatedTimeByCss))),30000).then(function(){
		logger.info("Orders from created time dropdown is shown...");
	});
};

ordersHistory.prototype.verifyOrdersFromOrderStatus = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.selectOrdersFromOrderStatusByCss))),30000).then(function(){
		logger.info("Orders from order status dropdown is shown...");
	});
};

//******************************Function for searching an Order*******************//

ordersHistory.prototype.searchOrderById = function(orderId){	
	browser.wait(EC.visibilityOf(element(by.css(this.orderSearchTextBoxCss))),5000);
	var searchInputBox = element(by.css(this.orderSearchTextBoxCss));
	util.waitForAngular();
	searchInputBox.clear();
	searchInputBox.sendKeys(orderId);
	util.waitForAngular();
};

//*********************Function for Order Table to get values for First Order *************//

ordersHistory.prototype.getTextFirstOrderIdOrdersTable = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableOrderIDColumnCss))),10000);
    return element.all(by.css(this.orderTableOrderIDColumnCss)).first().getText().then(function(text){
		var orderId=text;
		if(orderId.includes('Order ID:')){
			orderId=orderId.replace('Order ID:','');
		}
		logger.info("Order ID :: "+orderId);
		return orderId;
    });
};

ordersHistory.prototype.getTextFirstCreatedDateOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableCreatedDateColumnCss))),10000);
    return element.all(by.css(this.orderTableCreatedDateColumnCss)).first().getText().then(function(text){
		logger.info("Order Created Date :: "+text);
		return text;
    });
};


ordersHistory.prototype.getTextFirstOrderStatusOrdersTable = function(){
	util.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableOrderStatusColumnCss))),10000);
	return element.all(by.css(this.orderTableOrderStatusColumnCss)).first().getText().then(function(text){
		logger.info("Order status of the first order from Order table is: "+text);
		return text;
	});
};


//************************  FUNCTIONS FOR Orders Action Items********************************

ordersHistory.prototype.clickOnOrderTableDetailsExpandArrow = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableDetailsExpandArrowCss))), 30000).then(function(){
		logger.info("Order details exapand arrow is shown...");
	});
	return element(by.css(this.orderTableDetailsExpandArrowCss)).click();
};

ordersHistory.prototype.clickFirstViewDetailsOrdersTable = function (){
	var curr = this;
	browser.ignoreSynchronization = false;
	util.waitForAngular();
	browser.wait(EC.elementToBeClickable(element(by.css(curr.orderTableActionIconCss))), 60000).then(function () {
		//browser.executeScript('window.scrollTo(0,0);');
		return element.all(by.css(curr.orderTableActionIconCss)).first().click().then(function () {
			logger.info("Clicked on the Actions icon of the first row on Orders page");
			browser.wait(EC.visibilityOf(element(by.buttonText(curr.buttonTextViewDetails))), 30000).then(function(){
				return element(by.buttonText(curr.buttonTextViewDetails)).click().then(function () {
					logger.info("Clicked on View Details link to get Order Details page");
				});
			});	
			//browser.sleep(10000);
			util.waitForAngular();
		});
	});
};

ordersHistory.prototype.isDisplayedViewDetailsUnderActionsButton = function(){
	var curr = this;
	return element.all(by.css(this.orderTableActionIconCss)).first().click().then(function(){
		logger.info("Clicked on the first Actions Icon")
		return element(by.buttonText(curr.buttonTextViewDetails)).isDisplayed();
	});
};



//************************  FUNCTIONS FOR View Comments and Retry order from order Action Model****************

ordersHistory.prototype.clickOnOrderTableActionsRetryOption = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableActionsRetryCss))), 30000).then(function(){
		logger.info("Retry option is shown from Action Icon click...");
	});
	return element(by.css(this.orderTableActionsRetryCss)).click();
};

ordersHistory.prototype.clickOnOrderTableActionsCancelOption = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableActionsCancelCss))), 30000).then(function(){
		logger.info("Cancel option is shown from Action Icon click...");
	});
	return element(by.css(this.orderTableActionsCancelCss)).click();
};


ordersHistory.prototype.clickOnOrderTableActionsViewCommentsOption = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableActionsViewCommentsCss))), 30000).then(function(){
		logger.info("View comments option is shown from Action Icon click...");
	});
	return element(by.css(this.orderTableActionsViewCommentsCss)).click();
};


ordersHistory.prototype.verifyOrderTableActionsViewCommentsModelVisibility = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableActionsViewCommentsModelCss))),30000).then(function(){
		browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsViewCommentsModelHeaderXpath))),30000);
	});
};

ordersHistory.prototype.getTextOrderTableActionsViewCommentsModelErrorMsg = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsViewCommentsModelErrorMsgXpath))),10000);
    return element.all(by.xpath(this.orderTableActionsViewCommentsModelErrorMsgXpath)).first().getText().then(function(text){
		logger.info("Table Actions View Comments Model Error Msg :: "+text);
		return text;
    });
};

ordersHistory.prototype.clickOnorderTableActionsViewCommentsModelCloseButton = function () {
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.orderTableActionsViewCommentsModelCloseXpath))), 30000).then(function(){
		logger.info("View comments model close button is shown...");
	});
	return element(by.xpath(this.orderTableActionsViewCommentsModelCloseXpath)).click();
};

ordersHistory.prototype.verifyOrderTableActionsViewRetryModelVisibility = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableActionsRetryModelCss))),30000).then(function(){
		browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsRetryModelHeaderXpath))),30000).then(function(){
			browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsRetryModelMsgXpath))),30000);
		});
	});
};

ordersHistory.prototype.clickOnOrderTableActionsRetryYesButton = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableActionsRetryYesCss))), 30000).then(function(){
		logger.info("Table Action Retry model's Yes button is shown...");
	});
	return element(by.css(this.orderTableActionsRetryYesCss)).click();
};

ordersHistory.prototype.clickOnOrderTableActionsRetryNoButton = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableActionsRetryNoCss))), 30000).then(function(){
		logger.info("Table Action Retry model's No button is shown...");
	});
	return element(by.css(this.orderTableActionsRetryNoCss)).click();
};

ordersHistory.prototype.verifyOrderTableActionsRetryModelSuccessMsgVisibility = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsRetryModelSuccessMsgXpath))),30000).then(function(){
		logger.info("Table Action Rety Model is shown...");
	});
};

ordersHistory.prototype.clickOnOrderTableActionsRetryModelOkButton = function () {
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.orderTableActionsRetryModelOkButtonXpath))), 30000).then(function(){
		logger.info("Table Action Retry Model OK button is shown...");
	});
	return element(by.xpath(this.orderTableActionsRetryModelOkButtonXpath)).click();
};

ordersHistory.prototype.verifyOrderTableActionsViewCancelModelVisibility = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableActionsCancelModelCss))),30000).then(function(){
		browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsCancelModelHeaderXpath))),30000).then(function(){
			browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsCancelModelMsgXpath))),30000);
		});
	});
};

ordersHistory.prototype.clickOnOrderTableActionsCancelYesButton = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableActionsCancelYesCss))), 30000).then(function(){
		logger.info("Table Action Cancel Model Yes Button is shown...");
	});
	return element(by.css(this.orderTableActionsCancelYesCss)).click();
};

ordersHistory.prototype.clickOnOrderTableActionsCancelNoButton = function () {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableActionsCancelNoCss))), 30000).then(function(){
		logger.info("Table Action Cancel Model No Button is shown...");
	});
	return element(by.css(this.orderTableActionsCancelNoCss)).click();
};

ordersHistory.prototype.verifyOrderTableActionsCancelModelSuccessMsgVisibility = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTableActionsCancelModelSuccessMsgXpath))),30000).then(function(){
		logger.info("Table Action Cancel Model's Success message is shown...");
	});
};

ordersHistory.prototype.clickOnOrderTableActionsCancelModelOkButton = function () {
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.orderTableActionsCancelModelOkButtonXpath))), 30000).then(function(){
		logger.info("Table Action Cancel Model's OK button is shown...");
	});
	return element(by.xpath(this.orderTableActionsCancelModelOkButtonXpath)).click();
};

ordersHistory.prototype.getOrderTotal = function()
{   
    var elmOrderTotal = element(by.xpath(this.txtOrderTotalXpath));
    browser.wait((EC.elementToBeClickable(elmOrderTotal)), 40000);    
    return elmOrderTotal.getText().then(function(text){
        logger.info("Order total on Order History Page is : " + text);
        return text;
	});
	
};

ordersHistory.prototype.validatePricingonOrderHistory = function(orderId, orderTotal, serviceListExp)
{    
	var ordersHistoryPage = new ordersHistory();
	var cartListPage = new CartListPage();	

	var eleEstimatedCost = element.all(by.xpath(this.txtEstimatedCostXpath));
	var estimatedCost;
	var actualOrderTotal=0;	
	let promiseArr = [];
	var finlValidn = false;
	//Get order total of all services of cart
	ordersHistoryPage.open();
	ordersHistoryPage.searchOrderById(orderId);
	ordersHistoryPage.getOrderTotal().then(function(cost){
		expect(cost).toEqual(orderTotal);
	});
	//Validate Estimated cost of all services of cart
    eleEstimatedCost.getText().then(function(arr){                   
	   for (var i = 0; i < arr.length; i++){           
			estimatedCost = arr[i].split("/")[0];
			if(estimatedCost == serviceListExp[Object.keys(serviceListExp)[i]]){
				logger.info("Estimated cost for " + Object.keys(serviceListExp)[i] + " is : " + estimatedCost);
				actualOrderTotal = actualOrderTotal + parseFloat(estimatedCost.replace("USD ", ""));
				//Validate BOM
				//Click on BOM
				ordersHistoryPage.clickBillOfMaterials(i).then(function(){
					//Validate estimated cost
					expect(ordersHistoryPage.getTextTotalCostOnBillofMaterials()).toBe(serviceListExp[Object.keys(serviceListExp)[i]]);   
					//click on More link
					ordersHistoryPage.clickMoreLinkBom();
					cartListPage.clickExpandQuantity();
					//Validate pricing
					finlValidn = cartListPage.getTotalPriceOfAllInstances();				
					//Close slider
					ordersHistoryPage.closeServiceDetailsSlider();
					promiseArr.push(finlValidn);
									
				});				
			}			
		}
		if(actualOrderTotal == parseFloat(orderTotal.replace("USD ", ""))){
			logger.info("Order Total of all services of cart matches to USD " + actualOrderTotal);			
		}else{
			logger.info("Order Total of all services of cart do not match | Actual : USD " + actualOrderTotal + " | Expected : " + orderTotal);            
			return false;
		}	        
				
    });

   return Promise.all(promiseArr).then(function(finlValidn) {			
		if(finlValidn.indexOf(false) != -1){
			return Promise.resolve(false);
		}else{			
			return Promise.resolve(true);
		}		
	});
};

ordersHistory.prototype.clickBillOfMaterials = function (index) {	
	var elemToClick = element.all(by.xpath(this.lnkBillOfMaterialXapth)).get(index);
	return browser.wait(EC.elementToBeClickable(elemToClick), 30000).then(function(){	
		return elemToClick.click().then(function(){
			logger.info("Clicked on Order History --> Bill of Materials for service - " + index + 1);
			util.waitForAngular();
			browser.sleep(6000);
		});
	});		
};

ordersHistory.prototype.clickMoreLinkBom = function(){
	var elemToClick = element.all(by.xpath(this.lnkMoreXpath)).get(1);
	browser.wait(EC.elementToBeClickable(elemToClick), 30000).then(function(){		
		return elemToClick.click().then(function(){
			logger.info("Clicked on More link in Order History --> Bill of Materials section");		
		});
	});	
};

ordersHistory.prototype.getTextTotalCostOnBillofMaterials = function(){
	var elem = element.all(by.css(this.orderTotalCostBillofMaterialsTabCss)).get(1);
	return browser.wait(EC.visibilityOf(elem), 30000).then(function(){		
		elem.getText().then(function(text){
			logger.info('\n' + "Total Cost on Bill of Materials tab on Order History page : "+ text);
			return text;
		});
	});
};

ordersHistory.prototype.closeServiceDetailsSlider = function(){
	var elemToClick = element.all(by.xpath(this.btnCloseXpath)).last();
	return browser.wait(EC.elementToBeClickable(elemToClick), 30000).then(function(){		
		return elemToClick.click().then(function(){
			logger.info("Clicked on Close button of Service details page");	
			util.waitForAngular();
			browser.sleep(6000);	
		});
	});	
};



module.exports = ordersHistory;
