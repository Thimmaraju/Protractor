"use strict";

var extend = require('extend');
var url = browser.params.url;
var util = require('../../helpers/util.js');
var logGenerator = require("../../helpers/logGenerator.js"),
logger = logGenerator.getApplicationLogger();
var jsonUtil = require('../../helpers/jsonUtil.js');
var CartListPage = require('../pageObjects/cartList.pageObject.js');

var EC = protractor.ExpectedConditions;
//var tempFinancialApproveCheckbox - Financial Approval ID defect on Customer1 is fixed;

var defaultConfig = {
    pageUrl:                      		url + '/orders/approver-orders',
    ordersLinkTextXpath:        		'//a[contains(text(), "ALL ORDERS")]',
    allOrdersTabUnderOrdersLinkText:	'All orders',
    orderSearchTextBoxCss:	  			'#search__input-orders-search',
    // Locators for Order Details Section
    orderTableOrderIDColumnCss:    		'.orders-left div div a',
    orderTableCreatedDateColumnCss:    	'#created-date',
    //orderTableUpdatedDateColumnCss:   '[id^="Updated_Date_"]',
    orderTablePlacedByColumnCss:    	'#submitted-by',
    orderTableOrderTypeColumnCss:    	'#order-type',
    orderTableOrderStatusColumnCss:    	'#status',
    orderTableAmountColumnCss:   	 	'.rows > .first-column',
    orderTableActionIconCss:   	 		'#carbon-data-table-simple-0-parent-row-1-overflow-menu-icon',
    //orderTableViewDetailsButtonCss:   '.bx--overflow-menu-options__btn',
    //orderViewDetailsButtonCss: 		'#-icon svg',
	buttonTextViewDetails: 			'View Details',
	
	//Service Details Section
	serviceNameServiceDetailsCss:		 '#service-instance-name',
	serviceOfferingNameServiceDetailsCss:'#service-offering-name',
	providerNameServiceDetailsCss:		 '#provider.property-value',
	priceServiceDetailsCss:				 '#price.property-value',
	feesServiceDetailsCss:			     '#fees.property-note',
	//viewDetailsServiceDetailsLinkText:	 'View Details',
	
	//Order Updates Section
    orderStatusOrderUpdateSection:		 '.statusWithoutSubmitter span',
    viewUpdatesServiceDetailsLinkText:	 'View Updates',
    closeServiceDetailsSliderCss:		 '.bx--slide-over-panel-header svg',

    //*********LOCATORS FOR ORDER DETAILS SECTION*************
	orderNumberOrderDetailsPageCss :	  				'#orderName',
	orderServiceNameOrderDetailsPageCss : 				'#serviceName',
	orderProviderNameOrderDetailsPageCss: 				'#provider',
    orderCreatedDataOrderDetailsPageCss : 				'#createdDate',
    orderUpdatedDateOrderDetailsPageCss : 				'#updatedDate',
	orderStatusOrderDetailsPageCss      :		  		'#status',
	orderServiceTypeOrderDetailsPageCss	:				'#serviceType',
	orderTeamOrderDetailsPageCss        :	  			'#team',
 //   orderTypeOrderDetailsPageCss		:		  		'#type',
    orderTypeOrderDetailsPageCss		:		  		'#order-type',
    orderTotalCostOrderDetailsPageCss   :		  		'#orderAmount',
    orderSubmittedByOrderDetailsPageCss :		  		'#submitted-by',
    viewOrderDetailsTextCss             :         		'.bx--slide-over-panel-action',
    approveButtonOrderDetailsPageCss    :         	'#button-order_approve_button',
    //approveButtonText :									'APPROVE',
	denyButtonOrderDetailsPageCss		:		  		'#button-order_deny_button',
	//denyButtonText:										'DENY',
	cancelButtonOrderDetailsPageCss     : 		  		'#button-order_details_button_cancel',
	retryButtonOrderDetailsPageCss		:				'#button-order_details_button_retry',
	failureReasonOrderDetailsPageCss	:		  		"#failure-reason",
	//serviceConfigurationsTabOrderDetailsPageCss:		'#service_configurations',
	//billOfMaterialsTabOrderDetailsPageCss:			'#bill_of_materials',
    orderRejectionOrderDetailsPageId: 					'reject-reason',
	serviceDetailsButtonServiceDetailsBtnText:			'Service Details',
	estimatedCostsButtonServiceDetailsBtnText:			'Bill of Materials',
	orderUpdatesButtonServiceDetailsBtnText:			'Order Updates',

   //*** Service Configuration  and Bill of Materials for VRA SingleVM CentOS
	orderCPUServiceConfigurationTabCss  	:			'#cpu_value',
	orderMemoryServiceConfigurationTabCss	:			'#memorymb_value',
	orderStorageServiceConfigurationTabCss	:			'#storagegb_value',
	orderTotalCostBillofMaterialsTabCss		:			'#total_cost_value',

    quantityFromBOMCss:                                 '#quantity svg',
    clickMoreLinkXpath: '                               //a[contains(text(),"More")]',

    tableClassCSS:			                            '.review-order_bom-table',
    bomTotalCss:                                        '.total-quantity',

  //*********** LOCATORS FOR ORDER APPROVAL POPUP***********
    OrderApprovalModalApproveButtonCss:                  '#button-order_details_approval_approve',
	OrderApprovalModalCancelButtonCss:					 '#button-order_details_approval_cancel',
	OrderCancelPopupYesButtonCss:						 '#button-order_cancel_yes',
    OrderCancelPopupOkButtonCss:						 '#button-order_cancel_ok',
    // OrderApprovalModalTitleCss:						 'h2',
    OrderApprovalModalTitleXpath:						 '//h2[contains(text(),"Order Approval Flow")]',
    //OrderApprovalModalTechincalApprovalCheckboxCss:  	 '#checkbox-technical',
    OrderApprovalModalTechincalApprovalCheckboxCss:  	 'label[for="checkbox-technical"]',
 	//OrderApprovalModalFinancialApprovalCheckboxCss:  	 '#checkbox-financial',
    OrderApprovalModalFinancialApprovalCheckboxCss:  	 'label[for="checkbox-financial"]',
    OrderApprovalModalCloseXCss :      					 '#close-btn_approve-modal',
    OrderApprovalModalErrorMessageCss :	  				 '#order_details_approval_error',
    OrderApprovalModalSuccessMessageCss :				 '#order_details_approval_success',
    OrderApprovalModalOkButtonCss:						 '#button-order_details_approval_ok',

	//****************** LOCATORS FOR ADMN/BUYER ORDER PAGE  *******
	pageBuyerOrdersUrl: 					        url + '/orders/my-orders',

    orderHistoryLinkCss:                            '#myordersLinkId',
	//Be careful, this "Search" is from ORDER HISTORY (different from ALL ORDERS)
    orderBuyerSearchTextBoxCss:  		  	        '[id^="search__input-orders-search"]',
	//orderOrderDetailsLinkCss:			        	'//a[contains(.,"Order Details")]',
    orderOrderDetailsLinkCss:			        	'#order-details-link',
	orderServiceDetailsTabCss:			        	'#service_details',
    orderEstimatedCostTabCss:			        	'#estimated_costs',
	orderOrderUpdateTabCss:			        		'#order_updates',
    orderBuyerServiceDetailsCloseButtonCss:         '#button-',
	ordersTotalCss:					        		'#ordersCounterValue',

    orderExpandOrderCss:							'.bx--accordion__arrow',
    orderServiceFulfillmentMsgCss:					'.bx--inline-notification__subtitle span',
    orderOrderHistoryDetailsCss:                    '#-icon',
	orderRetryServiceButtonCss:						'[id^="retry-service-"]',
	orderCancelServiceButtonCss:					'[id^="cancel-service-"]',
	orderRetryModalOkayId: 							'button-order_retry_ok',


	//**********   Filter by Period  ***************
    selectAllOrdersStatusCss:						'#dropdown-option_ordercreatedtime_AllOrders',
	orderFirstOrderFromTableCss:     	        	'#order-number',
    ordersCounterValueCss:                     		'#bx--dropdown-single-parent_ordercreatedtime',
    selectOptionLastDayCss:  			        	'#dropdown-option_ordercreatedtime_LastDay',
    selectOptionLastWeekCss:  			        	'#dropdown-option_ordercreatedtime_LastWeek',
    selectOptionLastMonthCss: 	                	'#dropdown-option_ordercreatedtime_LastMonth',
    selectOptionLastThreeMonthsCss:  		    	'#dropdown-option_ordercreatedtime_Last3Months',
    selectOptionLastSixMonthsCss:  					'#dropdown-option_ordercreatedtime_Last6Months',
    selectOptionLastYearCss:  			        	'#dropdown-option_ordercreatedtime_LastYear',

    //*********   Filter by Order Status ******************
    selectAllOrdersFromOrderStatusCss:				'#dropdown-option_orderstatus_AllOrders',
	selectApprovalInProgressStatusCss:	        	'#dropdown-option_orderstatus_ApprovalInProgress',
    selectOrderStatusCss:							'#bx--dropdown-single-parent_orderstatus',
	selectSubmittedOrderStatusCss:					'#dropdown-option_orderstatus_Submitted',
    selectProvisioningInProgressOrderStatusCss:     '#dropdown-option_orderstatus_ProvisioninginProgress',
	selectRejectedOrderStatusCss:					'#dropdown-option_orderstatus_Rejected',



    //************************  LOCATORS FOR ADMN/APPROVER ORDER PAGE  *****************

    pageApproverOrdersUrl: 					        url + '/orders/approver-orders',

    orderApproverPendingOrderTabCss:                '#pending_approval_tab',
    orderApproverAllOrdersTabCss:                   '#all_orders_tab',
    orderApproverResetButtonCss:                    '#button-reset',

    orderApproverFilterByDropBoxCss:                '#bx--dropdown-single-parent_order-type',
    orderApproverFilterByNewestFirstCss:            '#dropdown-option_order-type_NewestFirst',
    orderApproverFilterByOldestFirstCss:            '#dropdown-option_order-type_OldestFirst',

	orderApproverViewDetailsLinkCss:				'#view-details-link',
	orderApproverViewUpdatesLinkCss:				'#view-updates-link',

	orderApproverDenyButtonCss:						'#button-order_deny_button',
	orderApproverApproveButtonCss:					'#button-order_approve_button',

    orderApproverFilterByTodayCss:                   '#today',
    orderApproverFilterByWeekCss:                    '#week',
    orderApproverFilterByMonthCss:                   '#month',
    orderApproverFilterByYearCss:                    '#year',

    orderApproverErrorApprovalCss:                   '#order_details_approval_error',



    //Estimated Costs from Order Details for orders
    orderEstimatedCostsQuantityCss:                  '#quantity',
    orderEstimatedCostsItemCss:                      '#description',
    orderEstimatedCostsRecurringValueCss:            '#recurring-charge-value',
    orderEstimatedCostsRecurringFrequencyValueCss:   '#recurring-charge-frequency-value',
    orderEstimatedCostsUsageChargeValueCss:          '#usage-charge-value',
    orderEstimatedCostsUsageUOMValueCss:             '#usage-charge-uom-value',
    orderEstimatedCostsUsageUOMCodeCss:              '#usage-charge-uom-code',


    orderOrderUpdatesApprovalInProgressCss:          '#approvalinprogress',
    orderOrderUpdatesSubmittedCss:                   '#submitted',
    lnkMoreXpath:					'//*[text()="More"]',
    tblServiceNameXpath:				'//*[@id="tableOrderServiceDetails"]/div//tr//td[1]',
    tblViewDetailsXpath:				'//carbon-icon[contains(@id,"carbon-data-table-simple-0-parent-row")]',

	//***********LOCATORS FOR ORDER DENIAL POPUP***********
    OrderDenyModalYesButtonCss:                     '#button-order_details_denial_yes',
    OrderDenyModalCancelButtonCss:					'#button-order_details_denial_cancel',
    OrderDenyModalTitleXpath:						'//h2[contains(text(),"Order Denial Flow")]',
    OrderDenyModalTechincalApprovalCheckboxCss:  	'#checkbox-denial-technical ~ label',
    OrderDenyModalFinancialApprovalCheckboxCss:  	'#checkbox-denial-financial ~ label',
    OrderDenyModalCommentsTextAreaCss:				'#text-areadenial-reason',
    OrderDenyModalCommentsValueRequiredCss:			'.bx--form-requirement',
    OrderDenyModalCloseXCss :      					'#close-btn_denial-modal',
    OrderDenyModalErrorMessageCss :	  				'#order_details_denial_error',
    OrderDenyModalSuccessMessageCss :				'.bx--inline-notification__details',
    OrderDenyModalOkButtonCss:						'#button-order_details_deny_approve',
	OrderDenyModalCloseErrorEnterRejectionReasonCss:'[id^=order_details_denial_error] > button',
    OrderDenyModalOkayButtonCss:					'#button-order_details_deny_ok',

	//*********** LOCATORS FOR RETRY POPUP
	OrderRetryModalYesButtonCss:					'#button-order_retry_yes',
    OrderRetryModalNoButtonCss:						'#button-order_retry_no',
	OrderRetryModalMessageCss:						'#cancel_message',
	orderNotFoundTextXpath:						'//p[@class = "bx--inline-notification__subtitle"]/span',
	orderTotalCostXpath:						'//*[@id="total_cost_value"]',

	//******** LOCATORS FOR BUDGET DETAILS ************
	budgetAmmountXpath: '//*[@id="currentBdgAmt"]',
	availableBudgetXpath: '//*[@id="availableBdgt"]',
	CommittedAmmountXpath: '//*[@id="cuxrrentCmtedAmt"]',
	spendAmmountXpath: '//*[@id="currentSpendAmt"]',
	estimatedAmmountforOrderxpath:'//*[@id="currentEstAmt"]',
	awaitingApprovalOrderAmountxpath: '//*[@id="awaitappr"]',
	budgetDropdown: '//*[@id="bx--dropdown-single-parent_budgets"]',
	budgetDropdownCSS: 'bx--dropdown-single-parent_budgets',
	submitButtonBudgetXpath: '//BUTTON[@id="button-order_budget_select"]',
	budgetID: 'currentBdgAmt'
};

//******** Order status *************
global.failedStatus = "Failed";
global.approvalInProgressStatus = 'Approval In Progress';
global.provisioningInProgressStatus = 'Provisioning in Progress';






function orders(selectorConfig) {
    if (!(this instanceof orders)) {
        return new orders(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}



orders.prototype.clickQuantity = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.quantityFromBOMCss))),5000);
    return element(by.css(this.quantityFromBOMCss)).click();
};

orders.prototype.clickMoreOrLessLink = function(){
    browser.wait(EC.visibilityOf(element(by.xpath(this.clickMoreLinkXpath))),5000);
    return element(by.xpath(this.clickMoreLinkXpath)).click();

};
orders.prototype.open = function()
{
   browser.get(this.pageUrl);
   //browser.sleep(10000);
   browser.wait(EC.urlContains("/orders/approver-orders"), 10000);
   //util.waitForAngular();
};

orders.prototype.clickAllOrdersUnderOrdersSection = function(){
	util.waitForAngular();
	browser.sleep(5000);
	element(by.linkText(this.allOrdersTabUnderOrdersLinkText)).click().then(function(){
		logger.info("Clicked on All Orders Tab...");
	})
}

orders.prototype.isPresentOrderHistoryLink = function(){
    return element(by.css(this.orderHistoryLinkCss)).isPresent();
};

orders.prototype.isPresentOrdersLink = function(){
    return element(by.xpath(this.ordersLinkTextXpath)).isPresent();
};

orders.prototype.isPresentFinancialApprovalCheckbox = function(){
    return element(by.css(this.OrderApprovalModalFinancialApprovalCheckboxCss)).isPresent();
};

orders.prototype.clickordersLink = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.ordersLinkTextXpath))),5000);
    return element(by.xpath(this.ordersLinkTextXpath)).click();
};

orders.prototype.openNew = function()
{
   browser.get(this.pageBuyerOrdersUrl);
};

//Click Cancel on Order detail page.
orders.prototype.clickCancelButtonOrdersDetailsPage = function(){
    browser.waitForAngular();
    browser.waitForAngular();
    element(by.css(this.cancelButtonOrderDetailsPageCss)).click();
    util.waitForAngular();

        // .then(function () {
        //     //browser.wait(EC.invisibilityOf(element(by.css(this.cancelButtonOrderDetailsPageCss))), 30000);
        //
        //     browser.sleep(3000);
        // 	return element(by.css(this.cancelButtonOrderDetailsPageCss)).click();
        // 	util.waitForAngular();
        // }

};

//Click Retry on Order detail page.
orders.prototype.clickRetryButtonOrdersDetailsPage = function(){
    browser.waitForAngular();
    //expect(element(by.css(this.viewOrderDetailsTextCss)).getText()).toMatch('View order details');
    //expect(element(by.css(this.orderStatusOrderDetailsPageCss))).toMatch('Provisioning in Progress');
    //browser.navigate().refresh();
    browser.waitForAngular();
    element(by.css(this.retryButtonOrderDetailsPageCss)).click();
    util.waitForAngular();
};


//******************************Function for searching an Order*************//

orders.prototype.searchOrderById = function(orderId){	
	browser.wait(EC.visibilityOf(element(by.css(this.orderSearchTextBoxCss))),25000);
	var searchInputBox = element(by.css(this.orderSearchTextBoxCss));
	util.waitForAngular();
	searchInputBox.clear();
	browser.sleep(5000);
	searchInputBox.sendKeys(orderId);
	browser.sleep(1000);
	//searchInputBox.sendKeys(protractor.Key.ENTER);
	return element(by.xpath(this.orderNotFoundTextXpath)).getText().then(function(message){									
		if(message == "No Orders Found" || message == "No Pending Orders" ){
			util.waitForAngular();
			searchInputBox.clear();
			browser.sleep(5000);
			searchInputBox.sendKeys(orderId);
			browser.sleep(1000);
		}
		return;
		}).catch(function(){
			return "Order Found";
		});
	util.waitForAngular();
};

orders.prototype.searchOrderByStatus = function(orderStatus){
	var searchInputBox = element(by.css(this.orderSearchTextBoxCss));
	util.waitForAngular();
    logger.info('Status: '+ orderStatus);
	searchInputBox.sendKeys(orderStatus);
	searchInputBox.sendKeys(protractor.Key.ENTER);
	util.waitForAngular();
};

//*********************Function for Order Table to get values for First Order *************//

orders.prototype.getTextFirstOrderIdOrdersTable = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableOrderIDColumnCss))),10000);
    return element.all(by.css(this.orderTableOrderIDColumnCss)).first().getText().then(function(text){
		var orderId=text;
		if(orderId.includes('ORDER #')){
			orderId=orderId.replace('ORDER # ','');
		}
		logger.info("Order ID :: "+orderId);
		return orderId.trim();
    });
};

orders.prototype.getTextFirstCreatedDateOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableCreatedDateColumnCss))),10000);
    return element.all(by.css(this.orderTableCreatedDateColumnCss)).first().getText().then(function(text){
		logger.info("Order Created Date :: "+text);
		return text;
    });
};

/*orders.prototype.getTextFirstUpdatedDateOrdersTable = function()
{
    return element.all(by.css(this.orderTableUpdatedDateColumnCss)).first().getText().then(function(text){
    	logger.info("Order ID :: "+text);
    });
};*/

orders.prototype.getTextFirstPlacedByOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTablePlacedByColumnCss))),10000);
    return element.all(by.css(this.orderTablePlacedByColumnCss)).first().getText().then(function(text){
		logger.info("Order Placed By :: "+text);
		return text;
    });
};

orders.prototype.getTextFirstOrderTypeOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableOrderTypeColumnCss))),10000);
	return element.all(by.css(this.orderTableOrderTypeColumnCss)).first().getText().then(function(text){
		logger.info("Order Type in orders Table is :: "+text);
		return text;
    });
};

orders.prototype.getTextFirstOrderStatusOrdersTable = function(){
	util.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableOrderStatusColumnCss))),10000);
	return element.all(by.css(this.orderTableOrderStatusColumnCss)).first().getText().then(function(text){
		logger.info("Order status of the first order from Order table is: "+text);
		return text;
	});
};

orders.prototype.getTextFirstAmountOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableAmountColumnCss))),10000);
     return element.all(by.css(this.orderTableAmountColumnCss)).first().getText().then(function(text){
		//return text.toString().replace(",","");
		return text;
    });
};

orders.prototype.getTextTotalPriceBillOfMaterial = function(){
    return element.all(by.css(this.orderTableAmountColumnCss)).first().getText().then(function(text){
        logger.info("Total Price : "+text);
        var str1 = text.substr(3,4);
		var str2 = text.substr(20,6);
		var str4 = parseFloat(str1)+parseFloat(str2);
		//str4 = str4.toString();
		str4 = Math.round(str4);
		//var total = "USD"+str4.toString();
		console.log("Total Price :: "+str4);
        return str4;
    });
};

//*******************Functions for Service Details Section************************

orders.prototype.getTextserviceNameServiceDetails = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.serviceNameServiceDetailsCss))),10000);
    return element(by.css(this.serviceNameServiceDetailsCss)).getText().then(function(text){
		logger.info("Service Name under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextServiceOfferingNameServiceDetails = function(){
    return element(by.css(this.serviceOfferingNameServiceDetailsCss)).getText().then(function(text){
		logger.info("Service Offering Name under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextProviderNameServiceDetails = function(){
    return element(by.css(this.providerNameServiceDetailsCss)).getText().then(function(text){
		logger.info("Provider Name under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextPriceServiceDetails = function()
{
    return element(by.css(this.priceServiceDetailsCss)).getText().then(function(text){
		logger.info("Price under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextFeeServiceDetails = function(){
    return element(by.css(this.feesServiceDetailsCss)).getText().then(function(text){
		logger.info("Fee under Service Details :: "+text);
		return text;
    });
};

orders.prototype.clickFirstViewDetailsOrdersTable = function (){
	var curr = this;
	browser.sleep(2000);
	util.waitForAngular();
	//browser.ignoreSynchronization = false;
	var eleToClick = element(by.css(curr.orderTableActionIconCss));
	browser.wait(EC.elementToBeClickable(element.all(by.css(curr.orderTableActionIconCss)).first()), 180000).then(function () {
		browser.executeScript("arguments[0].scrollIntoView();", eleToClick.getWebElement()).then(function(){
			browser.sleep(5000);
			element.all(by.css(curr.orderTableActionIconCss)).first().click().then(function () {
				logger.info("Clicked on the Actions icon of the first row on Orders page");
				browser.wait(EC.visibilityOf(element(by.buttonText(curr.buttonTextViewDetails))), 60000).then(function(){
					 element(by.buttonText(curr.buttonTextViewDetails)).click().then(function () {
						logger.info("Clicked on View Details link to get Order Details page");
						//Adding hardcoded sleep since it takes time to load order details page.
						browser.sleep(2000);
						//return;
					});
				});	
				util.waitForAngular();
			});
		});
	});
};

orders.prototype.isDisplayedViewDetailsUnderActionsButton = function(){
	var curr = this;
	return element.all(by.css(this.orderTableActionIconCss)).first().click().then(function(){
		logger.info("Clicked on the first Actions Icon")
		return element(by.buttonText(curr.buttonTextViewDetails)).isDisplayed();
	});
};

orders.prototype.clickViewDetailsButton = function(){
    browser.actions().mouseMove(element(by.buttonText(curr.buttonTextViewDetails))).perform();
    browser.wait(EC.elementToBeClickable(element(by.buttonText(curr.buttonTextViewDetails))),10000);
    return element(by.buttonText(curr.buttonTextViewDetails)).click();
};

//--------------Functions for View Updates Section---------------------
orders.prototype.clickViewUpdateUnderServiceDetails = function() {
	browser.wait(EC.visibilityOf(element(by.linkText(this.viewUpdatesServiceDetailsLinkText))), 60000);
	return element(by.linkText(this.viewUpdatesServiceDetailsLinkText)).click().then(function(){
		logger.info("Clicked on Update Details Link...");
	});
}

orders.prototype.closeServiceDetailsSlider = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.closeServiceDetailsSliderCss))), 60000);
	return element(by.css(this.closeServiceDetailsSliderCss)).click().then(function(){
		logger.info("Closed the Slider...");
	});
}

//****************************************************************************************************//

//********************FUNCTIONS FOR ORDER DETAILS for Approvers and Buyer PAGE*************************

orders.prototype.getTextViewOrderDetailsTitle = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.viewOrderDetailsTextCss))),25000);
	return element(by.css(this.viewOrderDetailsTextCss)).getText().then(function(text){
		return text;
	});
};

orders.prototype.getTextOrderIdOrderDetails = function(){
	return element(by.css(this.orderNumberOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Order Number in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderServiceNameOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderServiceNameOrderDetailsPageCss))),5000);
	return element(by.css(this.orderServiceNameOrderDetailsPageCss)).getText().then(function(text){
	logger.info("Order Service Name in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderProviderNameOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderProviderNameOrderDetailsPageCss))),5000);
	return element(by.css(this.orderProviderNameOrderDetailsPageCss)).getText().then(function(text){
	logger.info("Order Provider Name in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderCreatedDateOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderCreatedDataOrderDetailsPageCss))),5000);
	return element(by.css(this.orderCreatedDataOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Order Created Date in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderUpdatedDateOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderUpdatedDateOrderDetailsPageCss))),5000);
	return element(by.css(this.orderUpdatedDateOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Order Updated Date in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderStatusOrderDetails = function(){
	return element(by.css(this.orderStatusOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Status in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderRejectionReasonOrderDetails = async function(){
    // var value = element(by.css(this.orderRejectionOrderDetailsPageCss)).getAttribute("value");
    // logger.info("Rejection in Order details page : " + value);
    //
    // return value;
    element(by.id(this.orderRejectionOrderDetailsPageId)).getAttribute("value").then(function(text){
        logger.info("Rejection in Order details page : "+text);
        return text;
    });
};

orders.prototype.getTextOrderServiceTypeOrderDetails = function(){
	//return element(by.css(this.orderServiceTypeOrderDetailsPageCss)).getAttribute("value").then(function(text){
	return element(by.css(this.orderServiceTypeOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Service Type in Order details page : "+text);
		return text;
	});
};

orders.prototype.getOrderStatusFirstOrder = function(){
	return element(by.css(this.orderStatusofFirstOrderCss)).getAttribute("value").then(function(text){
		logger.info("Status First Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderTypeOrderDetails = function(){
	return element(by.css(this.orderTypeOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Order type in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextTeamOrderDetails = function(){
	return element(by.css(this.orderTeamOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Order Team in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextTotalCostOrderDetails = function(){
	return element(by.css(this.orderTotalCostOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Total Cost in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextSubmittedByOrderDetails = function(){
	return element(by.css(this.orderSubmittedByOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Order submitted by : "+text);
		return text;
	});
};

orders.prototype.getTextCPUOnServiceConfigurationOrderDetails = function(){
	return element(by.css(this.orderCPUServiceConfigurationTabCss)).getAttribute("value").then(function(text){
		logger.info("CPU on Buyer Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextMemoryOnServiceConfigurationOrderDetails = function(){
	return element(by.css(this.orderMemoryServiceConfigurationTabCss)).getAttribute("value").then(function(text){
		logger.info("Memory on Buyer Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextStorageOnServiceConfigurationOrderDetails = function(){
	return element(by.css(this.orderStorageServiceConfigurationTabCss)).getAttribute("value").then(function(text){
		logger.info("Storage on Buyer Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextCPUOnServiceConfigurationApproversOrderDetails = function(){
    return element(by.css(this.orderCPUServiceConfigurationTabCss)).getText("value").then(function(text){
        logger.info("\nCPU on Approver Order details page : "+ text);
        return text;
    });
};

orders.prototype.getTextMemoryOnServiceConfigurationApproversOrderDetails = function(){
    return element(by.css(this.orderMemoryServiceConfigurationTabCss)).getText("value").then(function(text){
        logger.info("Memory on Approver Order details page : "+ text);
        return text;
    });
};

orders.prototype.getTextStorageOnServiceConfigurationApproversOrderDetails = function(){
    return element(by.css(this.orderStorageServiceConfigurationTabCss)).getText("value").then(function(text){
        logger.info("Storage on Approver Order details page : "+ text);
        return text;
    });
};

orders.prototype.getTextTotalCostOnBillofMaterialsOrderDetails = function(){
	return element(by.css(this.orderTotalCostBillofMaterialsTabCss)).getText("value").then(function(text){
		logger.info('\n' + "Total Cost on Bill of Materials tab on Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextSubmittedStatusfromOrderUpdates = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderOrderUpdatesSubmittedCss))),5000);
    return element(by.css(this.orderOrderUpdatesSubmittedCss)).getText("value").then(function(text){
        logger.info('\n' + "First order status from Order Updates: "+ text);
        return text;
    });
};

orders.prototype.getTextApprovalStatusfromOrderUpdates = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderOrderUpdatesApprovalInProgressCss))),5000);
    return element(by.css(this.orderOrderUpdatesApprovalInProgressCss)).getText("value").then(function(text){
        logger.info("Second order status from Order Updates: " + text);
        return text;
    });
};

orders.prototype.isDisplayedApproveButtonOrderDetails = function(){
	//return element(by.buttonText(this.approveButtonText)).isPresent().then(function (flag, err) {
	return element(by.css(this.approveButtonOrderDetailsPageCss)).isPresent().then(function (flag, err) {
		if(err){
			return false;
		}
		logger.info("Approve button display status: "+flag);
		return flag;
    });
};

orders.prototype.isPresentApproveButtonOrderDetails = function(){
    return element(by.css(this.approveButtonOrderDetailsPageCss)).isPresent();//element(by.buttonText(this.approveButtonText))
};

orders.prototype.isPresentCancelButtonOrderDetails = function(){
    return element(by.css(this.cancelButtonOrderDetailsPageCss)).isPresent().then(function(flag,err){
    	if(err){
			return false;
		}
    	logger.info("Cancel button display status : "+flag)
		return flag;
    });
};

orders.prototype.isPresentRetryButtonOrderDetails = function(){
    return element(by.css(this.retryButtonOrderDetailsPageCss)).isPresent();
};
orders.prototype.clickApproveButtonOrderDetails = function(){
	/*browser.wait(EC.visibilityOf(element(by.css(this.orderNumberOrderDetailsPageCss))),60000).then(function(){
		logger.info("Order Details page is loaded, now waiting for Approve/Deny/Cancel button to be displayed");
	});*/
	browser.wait(EC.visibilityOf(element(by.css(this.approveButtonOrderDetailsPageCss))),300000).then(function(){
		logger.info("Approve/Deny button is shown...");
	});
	return element(by.css(this.approveButtonOrderDetailsPageCss)).click().then(function(){
		logger.info("Clicked on approve Button");
	});
};

orders.prototype.isPresentDenyButtonOrderDetails = function(){
    return element(by.css(this.denyButtonOrderDetailsPageCss)).isPresent();//element(by.buttonText(this.denyButtonText))

    //  **** This is not working for some reason. It looks right but I get the message
	// 'Expected undefined to be true, 'The deny button was not present.'.'
// 	return element(by.buttonText(this.denyButtonText)).isPresent().then(function(status){
// 		logger.info("Deny element present status: "+status);
// 	});
};


orders.prototype.isDisplayedDenyButtonOrderDetails = function(){
	return element(by.css(this.denyButtonOrderDetailsPageCss)).isPresent().then(function (flag, err) {
		if(err){
			return false;
		}
		logger.info("Deny button display status: "+flag);
		return flag;
    });
};

orders.prototype.isDisplayedCancelButtonOrderDetails = function(){
    return element(by.css(this.cancelButtonOrderDetailsPageCss)).isDisplayed();
};

orders.prototype.clickDenyButtonOrderDetails = function(){
	/*browser.wait(EC.visibilityOf(element(by.css(this.orderNumberOrderDetailsPageCss))),60000).then(function(){
		logger.info("Order Details page is loaded, now waiting for Approve/Deny/Cancel button to be displayed");
	});*/
	
	browser.wait(EC.visibilityOf(element(by.css(this.denyButtonOrderDetailsPageCss))),300000);
	return element(by.css(this.denyButtonOrderDetailsPageCss)).click().then(function(){
		logger.info("Order Details page is loaded, now waiting for Deny button to be displayed");
	});
};

orders.prototype.getTextFailureReason = function() {
    browser.wait(EC.visibilityOf(element(by.css(this.failureReasonOrderDetailsPageCss))),15000);
	return element(by.css(this.failureReasonOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Reason of Failure : "+text);
		return text;
	})
}

orders.prototype.clickServiceConfigurationsTabOrderDetails = function(){
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.serviceDetailsButtonServiceDetailsBtnText))),5000);
	return element(by.buttonText(this.serviceDetailsButtonServiceDetailsBtnText)).click().then(function(){
		logger.info("Clicked on Service Configurations tab")
	});
};

orders.prototype.clickBillOfMaterialsTabOrderDetails = function(){
	browser.wait(EC.visibilityOf(element(by.buttonText(this.estimatedCostsButtonServiceDetailsBtnText))),5000);
	return element(by.buttonText(this.estimatedCostsButtonServiceDetailsBtnText)).click().then(function(){
		logger.info("Clicked on Bill of Materials tab")
	});
};

orders.prototype.getEstimatedCostFromEstimatedCostTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTotalCostXpath))),5000);
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		if(text == 'N/A'){
			logger.info("Cost under Estimated Costs Tab is :: "+text);
		}
		else{
			var str1 = text.substr(3,9);
			console.log(str1);
			text = Math.round(str1).toString();
			logger.info("Cost under Estimated Costs Tab is :: "+text);
		}
		return text;
	})
}

orders.prototype.getEstimatedCostFromBillOfMaterialsTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTotalCostXpath))),5000);
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		logger.info("Cost under Estimated Costs Tab is :: "+text);
		return text;
	});
}

orders.prototype.clickOrderUpdatesServiceDetails = function(){
	browser.wait(EC.visibilityOf(element(by.buttonText(this.orderUpdatesButtonServiceDetailsBtnText))),5000);
	return element(by.buttonText(this.orderUpdatesButtonServiceDetailsBtnText)).click().then(function(){
		logger.info("Clicked on Order Updates tab")
	});
};

orders.prototype.clickBuyerOrderDetailsLink = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderOrderDetailsLinkCss))),5000);
    return element(by.css(this.orderOrderDetailsLinkCss)).click();
};

orders.prototype.clickBuyerServiceDetailsTab = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderServiceDetailsTabCss))),5000);
    return element(by.css(this.orderServiceDetailsTabCss)).click();
};

orders.prototype.clickBuyerEstimatedCostTab = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderEstimatedCostTabCss))),5000);
    return element(by.css(this.orderEstimatedCostTabCss)).click();
};

orders.prototype.clickBuyerOrderUpdateTab = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderOrderUpdateTabCss))),5000);
    return element(by.css(this.orderOrderUpdateTabCss)).click();
};

orders.prototype.clickBuyerServiceDetailsCloseButton = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderBuyerServiceDetailsCloseButtonCss))),5000);
    return element(by.css(this.orderBuyerServiceDetailsCloseButtonCss)).click();
};

//***********************  FUNCTIONS FOR CANCEL ORDER  ************************************ */
orders.prototype.clickCancelButtonOrderApprovalModal = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.OrderApprovalModalCancelButtonCss))),20000);
	return element(by.css(this.OrderApprovalModalCancelButtonCss)).click();
};
orders.prototype.clickYesButtonOnCancelPopup = function(){

	browser.wait(EC.invisibilityOf(element(by.xpath(this.OrderApprovalModalTitleXpath))),20000);
    return element(by.css(this.OrderCancelPopupYesButtonCss)).click();
};

orders.prototype.clickOkButtonOnCancelPopup = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.OrderCancelPopupOkButtonCss))),40000);
    return element(by.css(this.OrderCancelPopupOkButtonCss)).click();
};



//************************  FUNCTIONS FOR RETRY ORDER *****************************************

orders.prototype.clickOkayOrderRetryModal = function () {
    browser.wait(EC.elementToBeClickable(element(by.id(this.orderRetryModalOkayId))), 6000);
    return element(by.id(this.orderRetryModalOkayId)).click();
};

orders.prototype.clickNoOrderRetryModal = function () {
    browser.wait(EC.visibilityOf(element(by.id(this.OrderRetryModalNoButtonId))), 6000);
    return element(by.id(this.OrderRetryModalNoButtonId)).click();
};
//***********************FUNCTIONS FOR APPROVING ORDER************************************************//

orders.prototype.getTextOrderApprovalModalTitle = function(){
	return element(by.xpath(this.OrderApprovalModalTitleXpath)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickFinancialApprovalCheckBoxOrderApprovalModal = function(){
	// //This is a temporary fix to accomodate changes in object identifier.
	// //In customer1, FinancialApproveCheckbox is '#checkbox-Financial ~ label'
	// //and, all other QA envs, it is '#checkbox-financial ~ label'
	// if (url.toLowerCase().includes('customer1')){
    //     tempFinancialApproveCheckbox = '#checkbox-Financial ~ label';
	// }else{
    //     tempFinancialApproveCheckbox = this.OrderApprovalModalFinancialApprovalCheckboxCss;
	// }
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalFinancialApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderApprovalModalFinancialApprovalCheckboxCss)).click().then(function(){
		logger.info("Checked Financial Approval checkbox");
	});
};

orders.prototype.clickTechnicalApprovalCheckBoxOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalTechincalApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderApprovalModalTechincalApprovalCheckboxCss)).click().then(function(){
		logger.info("Checked Technical Approval checkbox");
	});
};

orders.prototype.clickApproveButtonOrderApprovalModal = function(){
	return element(by.css(this.OrderApprovalModalApproveButtonCss)).click().then(function(){
		logger.info("Clicked Approve button on Order Approval modal dialog");
	});
	util.waitForAngular();
};

orders.prototype.clickOkInOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalSuccessMessageCss))),50000);
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalOkButtonCss))),50000);
	return element(by.css(this.OrderApprovalModalOkButtonCss)).click().then(function(){
		logger.info("Clicked on Ok button on Order Approval modal dialog");
	});
	util.waitForAngular();
};

orders.prototype.getErrorMessageOrderApprovalModal = function(){
	return element(by.css(this.OrderApprovalModalErrorMessageCss)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.getTextOrderSuccessOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalSuccessMessageCss))),90000);
	return element(by.css(this.OrderApprovalModalSuccessMessageCss)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickCloseXOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalCloseXCss))),15000);
	return element(by.css(this.OrderApprovalModalCloseXCss)).click();
	browser.wait(EC.invisibilityOf(element(by.xpath(this.OrderApprovalModalTitleXpath))),20000);
};


//************** FUNCTION for Search/Filters for BUYER Order page *******************

orders.prototype.getBuyerTotalOrdersfromUI = function(){
    //return element(by.xpath(this.BuyerUIOrdersTotalXpath)).getText().then(function(text){
	return element(by.css(this.ordersTotalCss)).getText().then(function(text){

	var splitText = text.split(" ");
		logger.info("\n\nOrders count from UI: " + splitText[0] + '\n');
		 return parseInt(splitText[0]);
	});
};

//Click Buyer Order Total
orders.prototype.clickBuyerOrderTotal = function(){
	return element(by.css(this.ordersTotalCss)).click();
};

orders.prototype.getTextOrderStatusOrderHistory = function(){
    return element(by.css(this.orderStatusOrderDetailsPageCss)).getText().then(function(text){
        logger.info("Status in Order details page : " + text);
        return text;
    });
};


//******************  Filter by Period *****************

// Get Buyer Order Counter
orders.prototype.getTextBuyerOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.ordersCounterValueCss))),6000);
    return element(by.css(this.ordersCounterValueCss)).getText();
};

// Click Buyer Order Counter
orders.prototype.clickBuyerOrderPeriod = function(){
    this.getTextBuyerOrderPeriod().click();
};

// Buyer Order Last Day period
orders.prototype.clickBuyerLastDayOrderPeriod = function(){
	return element(by.css(this.selectOptionLastDayCss)).click();
};

// Buyer Order Last Week period
orders.prototype.clickBuyerLastWeekOrderPeriod = function(){
    return element(by.css(this.selectOptionLastWeekCss)).click();
};

// Buyer Order Last Month period
orders.prototype.clickBuyerLastMonthOrderPeriod = function(){
	return element(by.css(this.selectOptionLastMonthCss)).click();
};

// Buyer Order Last 3 Months period
orders.prototype.clickBuyerLastThreeOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOptionLastThreeMonthsCss))),6000);
    return element(by.css(this.selectOptionLastThreeMonthsCss)).click();
};

// Buyer Order Last 6 Months period
orders.prototype.clickBuyerLastSixOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOptionLastSixMonthsCss))),6000);
    return element(by.css(this.selectOptionLastSixMonthsCss)).click();
};

// Buyer Order Last Year period
orders.prototype.clickBuyerLastYearOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOptionLastYearCss))),6000);
    return element(by.css(this.selectOptionLastYearCss)).click();
};

//Click Buyer "All Orders" status filter by Period
orders.prototype.clickBuyerAllOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectAllOrdersStatusCss))),6000);
	return element(by.css(this.selectAllOrdersStatusCss)).click();
};


//****************  Filter by Order Status  **************

// Get Select Order Status
orders.prototype.getTextSelectOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOrderStatusCss))),6000);
    return element(by.css(this.selectOrderStatusCss)).getText();
};

// Click "Select Order Status"
orders.prototype.clickSelectOrderStatus = function(){
    this.getTextSelectOrderStatus().click();
};

//Click "All Orders"  status filter by Order Status
orders.prototype.clickAllOrderFromOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectAllOrdersFromOrderStatusCss))),6000);
    return element(by.css(this.selectAllOrdersFromOrderStatusCss)).click();
};

//Click Buyer "Approval in Progress" status filter
orders.prototype.clickApprovalInProgress = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectApprovalInProgressStatusCss))),9000);
	return element(by.css(this.selectApprovalInProgressStatusCss)).click();
};

//Click Buyer "Submitted" status filter
orders.prototype.clickSubmitted = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectSubmittedOrderStatusCss))),9000);
    return element(by.css(this.selectSubmittedOrderStatusCss)).click();
};

//Click Buyer "Provisioning in Progress" status filter
orders.prototype.clickProvisionInginProgress = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectProvisioningInProgressOrderStatusCss))),9000);
    return element(by.css(this.selectProvisioningInProgressOrderStatusCss)).click();
};

//Click Buyer "Rejected" status filter
orders.prototype.clickRejectedOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectRejectedOrderStatusCss))),9000);
    return element(by.css(this.selectRejectedOrderStatusCss)).click();
};

orders.prototype.getTextFirstBuyerOrderNumber = function(){
    //return element(by.xpath(this.BuyerUIOrdersTotalXpath)).getText().then(function(text){
    return element(by.css(this.orderFirstOrderFromTableCss)).getText().then(function(text){

        var splitText = text.split(" ");
        logger.info("Buyer Order Number from Search result = " + splitText[1]);
        return splitText[1];
    });
};

//Search on Buyer Order page
orders.prototype.searchBuyerOrderNumber = function(buyerOrderNumber){
	var searchBuyerOrderInputBox = element(by.css(this.orderBuyerSearchTextBoxCss));

	browser.wait(EC.visibilityOf(element(by.css(this.orderBuyerSearchTextBoxCss))),6000);
	searchBuyerOrderInputBox.clear();
	searchBuyerOrderInputBox.sendKeys(buyerOrderNumber);
    searchBuyerOrderInputBox.sendKeys(protractor.Key.ENTER);
	util.waitForAngular();
	return;
};

orders.prototype.clickOrderExpandLink = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderExpandOrderCss))),5000);
    return element(by.css(this.orderExpandOrderCss)).click();

};

orders.prototype.getTextOrderServiceFulfillmentMsg = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderServiceFulfillmentMsgCss))),5000);
    return element(by.css(this.orderServiceFulfillmentMsgCss)).getText().then(function(text){
        logger.info("***** Message from Expand Rejected order: " + text);
        return text;
    });
};

orders.prototype.clickOrderHistoryDetails = function(){
    return element(by.css(this.orderOrderHistoryDetailsCss)).click();
};

orders.prototype.clickServiceRetryButton = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderRetryServiceButtonCss))),6000);
	return element(by.css(this.orderRetryServiceButtonCss)).click();
};

orders.prototype.isEnabledRetryLink = function(){
    return element(by.css(this.orderRetryServiceButtonCss)).isEnabled();
};

orders.prototype.isPresentRetryLink = function(){
    return element(by.css(this.orderRetryServiceButtonCss)).isPresent();
};

orders.prototype.isPresentCancelLink = function(){
    return element(by.css(this.orderCancelServiceButtonCss)).isPresent();
};
//***********************FUNCTIONS FOR DENYING ORDER************************************************//

orders.prototype.getTextOrderDenyModalTitle = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.OrderDenyModalTitleXpath))),25000);
	return element(by.xpath(this.OrderDenyModalTitleXpath)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickFinancialApprovalCheckBoxOrderDenyModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalFinancialApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderDenyModalFinancialApprovalCheckboxCss)).click();
};

// orders.prototype.clickFinancialApprovalCheckBoxOrderDenyModal = function(){
// 	//This is a temporary fix to accomodate changes in object identifier.
// 	//In customer1, FinancialApproveCheckbox- Deny is '#checkbox-denial-Financial ~ label'
// 	//and, all other QA envs, it is '#checkbox-denial-financial ~ label'
// 	if (url.toLowerCase().includes('customer1')){
//         tempFinancialApproveCheckbox = '#checkbox-denial-Financial ~ label';
// 	} else {
//         tempFinancialApproveCheckbox = this.OrderDenyModalFinancialApprovalCheckboxCss;
// 	}
// 	browser.wait(EC.visibilityOf(element(by.css(tempFinancialApproveCheckbox))),20000);
// 	return element(by.css(tempFinancialApproveCheckbox)).click().then(function(){
// 		logger.info("Checked Financial Approval checkbox for Deny Order");
// 	});
// };

orders.prototype.clickTechnicalApprovalCheckBoxOrderDenyModal = function(){
	
	browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalTechincalApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderDenyModalTechincalApprovalCheckboxCss)).click().then(function(){
			logger.info("Checked Technical Approval checkbox for Deny Order");
	});
};


 orders.prototype.clickYesButtonOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalYesButtonCss)).click();
};

orders.prototype.clickYesButtonOrderRetryModal = function(){
	//return element(by.css(this.OrderRetryModalYesButtonCss)).click();
    element.all(by.css(this.OrderRetryModalYesButtonCss)).get(1).click();
};

orders.prototype.clickCancelButtonOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalCancelButtonCss)).click();
	browser.wait(EC.invisibilityOf(element(by.css(this.OrderDenyModalTitleCss))),20000);
};

orders.prototype.clickOkInOrderDenyModal = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalOkButtonCss))),90000);
    return element(by.css(this.OrderDenyModalOkButtonCss)).click();
};

orders.prototype.clickDenyInOrderDenyModal = function(){

	browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalOkButtonCss))),9000);
	return element(by.css(this.OrderDenyModalOkButtonCss)).click().then(function(){
		logger.info("confirm for Deny Order");
});
};

orders.prototype.getErrorMessageOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalErrorMessageCss)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickCloseXOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalCloseXCss)).click();
	browser.wait(EC.invisibilityOf(element(by.css(this.OrderDenyModalTitleCss))),5000);
};


orders.prototype.clickCloseXRejectionReasonOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalCloseErrorEnterRejectionReasonCss)).click();
};

orders.prototype.setTextCommentsTextareaOrderDenyModal = function(reason){
	return element(by.css(this.OrderDenyModalCommentsTextAreaCss)).sendKeys(reason);
};

orders.prototype.clickOkDenialWasProcessed = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalOkayButtonCss))),30000);
    return element(by.css(this.OrderDenyModalOkayButtonCss)).click().then(function(){
		logger.info("click Ok Denial Was Processed");
	})
};

orders.prototype.isDisplayedCommentsValueRequiredMessage = function(){
	return element(by.css(this.OrderDenyModalCommentsValueRequiredCss)).isDisplayed();

};


//*********************  FUNCTION FOR ADMIN/APPROVER PAGE ***************************

orders.prototype.openApproverPage = function(){
    browser.get(this.pageApproverOrdersUrl);
};

orders.prototype.clickApproverPedingApprovalTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverPendingOrderTabCss))),5000);
    return element(by.css(this.orderApproverPendingOrderTabCss)).click();
};

orders.prototype.clickApproverAllOrdersTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverAllOrdersTabCss))),5000);
    return element(by.css(this.orderApproverAllOrdersTabCss)).click();
};

orders.prototype.clickApproverViewDetailsLink = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverViewDetailsLinkCss))),5000);
    return element(by.css(this.orderApproverViewDetailsLinkCss)).click();
};

orders.prototype.clickApproverViewUpdatesLink = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverViewUpdatesLinkCss))),5000);
    return element(by.css(this.orderApproverViewUpdatesLinkCss)).click();
};

orders.prototype.clickApproverFilterByTodayTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByTodayCss))),5000);
    return element(by.css(this.orderApproverFilterByTodayCss)).click();
};

orders.prototype.clickApproverFilterByWeekTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByWeekCss))),5000);
    return element(by.css(this.orderApproverFilterByWeekCss)).click();
};

orders.prototype.clickApproverFilterByMonthTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByMonthCss))),5000);
    return element(by.css(this.orderApproverFilterByMonthCss)).click();
};

orders.prototype.clickApproverFilterByYearTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByYearCss))),5000);
    return element(by.css(this.orderApproverFilterByYearCss)).click();
};

orders.prototype.clickApproverApproveButton = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverApproveButtonCss))),5000);
    return element(by.css(this.orderApproverApproveButtonCss)).click();
};

orders.prototype.getApproverErrorApproveMessage = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverErrorApprovalCss))),5000);
    return element(by.css(this.orderApproverErrorApprovalCss)).getText().then(function(text){
        logger.info(text);
        return text;
    });
};

//Additional Details Section

orders.prototype.getTextBasedOnLabelName = function(labelName){
	return element(by.xpath("//label[contains(text(), '"+labelName+"')]/following-sibling::p")).getText().then(function(text){
        logger.info("The value for "+labelName+" is : "+text)
        return text;
    });
};

orders.prototype.getAllTextBasedOnLabelName = function(labelName){
	return element.all(by.xpath("//label[contains(text(), '"+labelName+"')]/following-sibling::p")).getText().then(function(textArray){
		var textList = [];
		logger.info("The length for "+labelName+" is : "+textArray.length);
		for (var i = 0; i < textArray.length; i++) {
			logger.info("The value for "+labelName+" is : "+textArray[i]);
			var str = textArray[i];
			if(str.includes(",")){
				textList.push(str.toString().split(","));
				logger.info("The value for "+labelName+" is : "+textList)
			}
		}
		var arrayList = [].concat.apply([], textList);
		var finalArray = [];
		for(i=0;i<arrayList.length;i++)
	    {
			finalArray[i] = arrayList[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	    }
		return finalArray;
	});
};

orders.prototype.getTextBasedOnExactLabelName = function(labelName){
        return element(by.xpath("//label[(text()='"+labelName+"')]/following-sibling::p")).getText().then(function(text){
        logger.info("The value for "+labelName+" is : "+text)
        return text;
    });
};

//Check if order No found
orders.prototype.checkIfOrderFound = function(){	
	return element(by.xpath(this.orderNotFoundTextXpath)).getText().then(function(message){
		//logger.info(text);
		return message.trim();
	}).catch(function(){
		return "Order Found";
	});
};

orders.prototype.validateOrderSummaryDetailsFields = function (loadBalObj, labelName) {

	var indexOfElem="undefined";
	var locatorValue = null;
	var elem = null;
	var flag;

	try {
		locatorValue = jsonUtil.getValueOfLocator(loadBalObj, labelName);

		if (labelName.includes("-")) {
			elem = labelName.split("-");
			indexOfElem = parseInt(elem[1]);
		}

		if (labelName.includes("_xpath")) {
			if (indexOfElem == "undefined") {
				return element(by.xpath(locatorValue)).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);					
					return flag;
				});
			} else {
				return element.all(by.xpath(locatorValue)).get(indexOfElem).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);				
					return flag;
				}).catch(function (error) {
					logger.info(error);					
				});
			}
		} else {
			if (indexOfElem == "undefined") {
				return element(by.css(locatorValue)).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);					
					return flag;
				});
			} else {
				return	element.all(by.css(locatorValue)).get(indexOfElem).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);					
					return flag;
				});
			}
		}

	}
	catch (e) {
		logger.info(e);
	}

};

//validate cost of google service
orders.prototype.validatePriceForGoogleService = function(price) {
	
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		price = price.split("/");		
		if(text == price[0].trim()){
			logger.info("Total cost on Review order page and summary details page is : " + text);
			return Promise.resolve(true);
		}else{
			logger.info("Total cost on Review order page : " + price + " and on Orders Summary Details page : " + text);
			return Promise.resolve(false);
		}		
	});

};

orders.prototype.clickMoreLinkBom = function(){	
	return element(by.xpath(this.lnkMoreXpath)).click().then(function(){
		logger.info("Clicked on More link in Orders Page-->Bill of Materials section");
		
	});
};

orders.prototype.validateEstimatedCostAllServicesofCart = function(serviceListExp)
{       
    var elmServiceName = element.all(by.xpath(this.tblServiceNameXpath));     	
	var cartListPage = new CartListPage();
	var ordersPage = new orders();
    let promiseArr = [];
	var finlValidn = false;
	
	browser.executeScript("arguments[0].scrollIntoView();", elmServiceName.last().getWebElement()).then(function(){
		elmServiceName.getText().then(function(textArray){		
			for(var i = 0; i < textArray.length; i++){
				ordersPage.clickViewDetailsBasedOnIndex(i);
				//verify details from Bill of Materials Page.			
				ordersPage.clickBillOfMaterialsTabOrderDetails();
				expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(serviceListExp[Object.keys(serviceListExp)[i]]);   
				//Click on More link
				ordersPage.clickMoreLinkBom();
				cartListPage.clickExpandQuantity();
				finlValidn = cartListPage.getTotalPriceOfAllInstances();
				ordersPage.closeServiceDetailsSlider();
				promiseArr.push(finlValidn);
			}	
		});		
		
	}).catch(function(err){
		console.log(err);
	});
	
	return Promise.all(promiseArr).then(function(finlValidn) {		
		if(finlValidn.indexOf(false) != -1){
			return Promise.resolve(false);
		}else{			
			return Promise.resolve(true);
		}		
	});
};

orders.prototype.clickViewDetailsBasedOnIndex = function (index){
	var curr = this;	
	var eleToClick = element.all(by.xpath(this.tblViewDetailsXpath)).get(index);
	var lnkViewDetails = element.all(by.buttonText(curr.buttonTextViewDetails)).get(index);
	browser.wait(EC.elementToBeClickable(eleToClick), 60000).then(function () {
		browser.executeScript("arguments[0].scrollIntoView();", eleToClick.getWebElement()).then(function(){
			browser.sleep(5000);
			return eleToClick.click().then(function () {
				logger.info("Clicked on the Actions icon of the first row on Orders page");
				browser.wait(EC.visibilityOf(lnkViewDetails), 30000).then(function(){
					return lnkViewDetails.click().then(function () {
						logger.info("Clicked on View Details link to get Order Details page of service : " + index + 1);
						//Adding hardcoded sleep since it takes time to load order details page.
						browser.sleep(6000);
					});
				});	
				
				util.waitForAngular();
			});
		});
	});
};




orders.prototype.getTextBudgetAmmount = function () {
	var elem = element(by.xpath(this.budgetAmmountXpath));
	browser.wait(EC.visibilityOf(elem), 20000);
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

	return element(by.xpath(this.budgetAmmountXpath)).getText().then(function (text) {
        logger.info("Budget Ammount : " + text);
        return text;
    });
};
orders.prototype.getTextAvailableBudget = function () {
	return element(by.xpath(this.availableBudgetXpath)).getText().then(function (text) {
        logger.info("Available Budget : " + text);
        return text;
    });
};
orders.prototype.getTextBudgetaryCommittedAmmount = function () {
	var elem = element(by.xpath(this.CommittedAmmountXpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

    return element(by.xpath(this.CommittedAmmountXpath)).getText().then(function (text) {
        logger.info("Committed Ammount : " + text);
        return text;
    });
};
orders.prototype.getTextBudgetarySpendAmmount = function () {
	var elem = element(by.xpath(this.spendAmmountXpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

    return element(by.xpath(this.spendAmmountXpath)).getText().then(function (text) {
        logger.info("Spend Ammount : " + text);
        return text;
	});
}
orders.prototype.getTextBudgetaryEstimatedAmmountforOrder = function () {
	var elem = element(by.xpath(this.estimatedAmmountforOrderxpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

	return element(by.xpath(this.estimatedAmmountforOrderxpath)).getText().then(function (text) {
		logger.info("Estimated Ammount of Order : " + text);
		return text;
		});
}
orders.prototype.getTextOtherOrdersAwaitingApproval = function () {
	var elem = element(by.xpath(this.awaitingApprovalOrderAmountxpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

	return element(by.xpath(this.awaitingApprovalOrderAmountxpath)).getText().then(function (text) {
		logger.info("Othe Order Awaiting Approval Amount : " + text);
		return text;
		});
}
//Function to click on Select button from the Confirmation Budgetary Unit Selection pop-up
orders.prototype.clickOnSubmitButtonOfBudget = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.submitButtonBudgetXpath))), 9000);
	return element(by.xpath(this.submitButtonBudgetXpath)).click().then(function () {
		logger.info("Succesfully clicked on Select button");
	});

}


//This function will select the budget from the drop-down ons Approve order page
orders.prototype.selectBudgetaryUnit = function (BudgetName) {
	var ordersPage = new orders();
	var dropdown = element(by.css("[id=\"" + defaultConfig.budgetDropdownCSS + "\"]"));
	browser.executeScript("arguments[0].scrollIntoView();", dropdown.getWebElement()).then(function () {
		// var dropdown = element(by.css("[id=\"" + defaultConfig.budgetDropdownCSS + "\"]"));
		browser.sleep(3000)
		browser.wait(EC.elementToBeClickable(dropdown), 300000).then(function () {
			dropdown.isEnabled().then(function (enabled) {
				if (enabled) {
					//dropdown.click().then(function(){ //*******Added below line of code for click***//
					browser.actions().mouseMove(dropdown).click().perform().then(function () {
						var dropDownValuesArray = element.all(by.xpath("//*[@id='" + defaultConfig.budgetDropdownCSS + "']//carbon-dropdown-option//a"));
						dropDownValuesArray.getText().then(function (textArray) {
							var isDropDownValuePresent = false;
							for (var i = 0; i < textArray.length; i++) {
								if (textArray[i] == BudgetName) {
									dropDownValuesArray.get(i).click().then(function () {
										logger.info("Selected " + BudgetName + " from budget dropdown");

									});
									isDropDownValuePresent = true;
								}
							}
							if (!isDropDownValuePresent) {
								dropDownValuesArray.get(0).getText().then(function (text) {
									dropDownValuesArray.get(0).click().then(function () {
										logger.info("Selected " + text + " from budget dropdown");
									});
								});
							}
						});
					});
				}
			});

		});
	});
	ordersPage.clickOnSubmitButtonOfBudget();

}

orders.prototype.calculateBudgetaryEstimatedAmmountforOrder = function (budgetDuration, totalCost) {
	var cost = parseFloat(("" + totalCost).replace(/[^\d\.]*/g, ''), 2).toFixed(2);
	var amount = cost * budgetDuration;
	amount = amount.toFixed(2);
	var estCost = amount.toString();
	var estCost1 = estCost.slice(0, (estCost.indexOf(".")) + 3);

	//append the currency unit 
	var currencyUnit = ("" + totalCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCostcost = currencyUnit + estCost1;

	logger.info("Calculated estimated amount for this order: " + actualCostcost);
	return actualCostcost;
}

orders.prototype.calculateAvailableBudgetAfterProvCompleted = function (availCost, estCost) {
	var availCost1 = parseFloat(("" + availCost).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = availCost1 - estCost1
	var amountAvail = amount.toString();
	amount = amount.toFixed(2);
	var actualAvailCost = (Number(amountAvail)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualAvailCost;

	logger.info("Calculated Available Budget for this order after provisioning completed: " + actualCost);
	return actualCost;
}

orders.prototype.calculateCommittedAmountAfterProvCompleted = function (committedAmnt, estCost) {

	var committedCost1 = parseFloat(("" + committedAmnt).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);

	var amount = committedCost1 + estCost1
	amount = amount.toFixed(2);
	var amountToCommit = amount.toString();
	var actualCommitCost = (Number(amountToCommit)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualCommitCost;

	logger.info("Calculated Committed Amount for this order after provisioning completed: " + actualCost);
	return actualCost;

}

orders.prototype.calculateEstCostAfterDeleting1MonthOrder = function (estCost, oneMonthCost) {
	var oneMonthCost = parseFloat(("" + oneMonthCost).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = estCost1 - oneMonthCost;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualEstCost = (Number(estAmount)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = "(" + currencyUnit + actualEstCost + ")";

	logger.info("Calculated Estimated Amount for the delete order: " + actualCost);
	return actualCost;

}

orders.prototype.calculateDeleteCommittedAmount = function (committedAmnt, estCost) {
	var commitCost = parseFloat(("" + committedAmnt).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = commitCost - estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualEstCost = (Number(estAmount)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + committedAmnt).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualEstCost;

	logger.info("Calculated Committed Amount after one month order deleted: " + actualCost);
	return actualCost
}

orders.prototype.calculateAfterDeletingAvailBudget = function (availBudget, estCost) {
	var availBudget1 = parseFloat(("" + availBudget).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = availBudget1 + estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualAvailCost = (Number(estAmount)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + availBudget).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualAvailCost;

	logger.info("Calculated Available Budget after deleting the order: " + actualCost);
	return actualCost

}

orders.prototype.calculateAfterProvOtherOrderAwaitingApprovalAmount = function (beforeProvOrderAwaitingApprovalAmount, estCost) {
	var costBeforeProvOrderAwaitingApproval = parseFloat(("" + beforeProvOrderAwaitingApprovalAmount).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = costBeforeProvOrderAwaitingApproval - estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualOrderAwaitingApprovalAmount = (Number(estAmount)).toFixed(2);
	
	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualOrderAwaitingApprovalAmount;

	logger.info("Calculated Other Order Awaiting Approval Amount after provision: " + actualCost);
	return actualCost

};
//Function to verify the budget is present on the Approve order page
orders.prototype.checkInvisibilityOfBudgetDetails = function(){
       logger.info("Checking the visibility of budget on approve order page.");
	return element(by.id(this.budgetID)).isPresent();
}
orders.prototype.getEstimatedCost = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTotalCostXpath))),5000);
	
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		logger.info("Total Cost on Orders Page: " + text);
			return text;
		});
}

orders.prototype.getCurrencyFromEstimatedCostsTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTotalCostXpath))),5000);
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		if(text == 'N/A'){
			logger.info("Cost under Estimated Costs Tab is :: "+text);
		}
		else{
			var str1 = text.substr(0,3);
			console.log(str1);
			//text = Math.round(str1).toString();
			logger.info("Currency shown in Orders Page :: "+text);
		}
		return text;
	})
}

module.exports = orders;
=======
"use strict";

var extend = require('extend');
var url = browser.params.url;
var util = require('../../helpers/util.js');
var logGenerator = require("../../helpers/logGenerator.js"),
logger = logGenerator.getApplicationLogger();
var jsonUtil = require('../../helpers/jsonUtil.js');
var CartListPage = require('../pageObjects/cartList.pageObject.js');

var EC = protractor.ExpectedConditions;
//var tempFinancialApproveCheckbox - Financial Approval ID defect on Customer1 is fixed;

var defaultConfig = {
    pageUrl:                      		url + '/orders/approver-orders',
    ordersLinkTextXpath:        		'//a[contains(text(), "ALL ORDERS")]',
    allOrdersTabUnderOrdersLinkText:	'All orders',
    orderSearchTextBoxCss:	  			'#search__input-orders-search',
    // Locators for Order Details Section
    orderTableOrderIDColumnCss:    		'.orders-left div div a',
    orderTableCreatedDateColumnCss:    	'#created-date',
    //orderTableUpdatedDateColumnCss:   '[id^="Updated_Date_"]',
    orderTablePlacedByColumnCss:    	'#submitted-by',
    orderTableOrderTypeColumnCss:    	'#order-type',
    orderTableOrderStatusColumnCss:    	'#status',
    orderTableAmountColumnCss:   	 	'.rows > .first-column',
    orderTableActionIconCss:   	 		'#carbon-data-table-simple-0-parent-row-1-overflow-menu-icon',
    //orderTableViewDetailsButtonCss:   '.bx--overflow-menu-options__btn',
    //orderViewDetailsButtonCss: 		'#-icon svg',
	buttonTextViewDetails: 			'View Details',
	
	//Service Details Section
	serviceNameServiceDetailsCss:		 '#service-instance-name',
	serviceOfferingNameServiceDetailsCss:'#service-offering-name',
	providerNameServiceDetailsCss:		 '#provider.property-value',
	priceServiceDetailsCss:				 '#price.property-value',
	feesServiceDetailsCss:			     '#fees.property-note',
	//viewDetailsServiceDetailsLinkText:	 'View Details',
	
	//Order Updates Section
    orderStatusOrderUpdateSection:		 '.statusWithoutSubmitter span',
    viewUpdatesServiceDetailsLinkText:	 'View Updates',
    closeServiceDetailsSliderCss:		 '.bx--slide-over-panel-header svg',

    //*********LOCATORS FOR ORDER DETAILS SECTION*************
	orderNumberOrderDetailsPageCss :	  				'#orderName',
	orderServiceNameOrderDetailsPageCss : 				'#serviceName',
	orderProviderNameOrderDetailsPageCss: 				'#provider',
    orderCreatedDataOrderDetailsPageCss : 				'#createdDate',
    orderUpdatedDateOrderDetailsPageCss : 				'#updatedDate',
	orderStatusOrderDetailsPageCss      :		  		'#status',
	orderServiceTypeOrderDetailsPageCss	:				'#serviceType',
	orderTeamOrderDetailsPageCss        :	  			'#team',
 //   orderTypeOrderDetailsPageCss		:		  		'#type',
    orderTypeOrderDetailsPageCss		:		  		'#order-type',
    orderTotalCostOrderDetailsPageCss   :		  		'#orderAmount',
    orderSubmittedByOrderDetailsPageCss :		  		'#submitted-by',
    viewOrderDetailsTextCss             :         		'.bx--slide-over-panel-action',
    approveButtonOrderDetailsPageCss    :         	'#button-order_approve_button',
    //approveButtonText :									'APPROVE',
	denyButtonOrderDetailsPageCss		:		  		'#button-order_deny_button',
	//denyButtonText:										'DENY',
	cancelButtonOrderDetailsPageCss     : 		  		'#button-order_details_button_cancel',
	retryButtonOrderDetailsPageCss		:				'#button-order_details_button_retry',
	failureReasonOrderDetailsPageCss	:		  		"#failure-reason",
	//serviceConfigurationsTabOrderDetailsPageCss:		'#service_configurations',
	//billOfMaterialsTabOrderDetailsPageCss:			'#bill_of_materials',
    orderRejectionOrderDetailsPageId: 					'reject-reason',
	serviceDetailsButtonServiceDetailsBtnText:			'Service Details',
	estimatedCostsButtonServiceDetailsBtnText:			'Bill of Materials',
	orderUpdatesButtonServiceDetailsBtnText:			'Order Updates',

   //*** Service Configuration  and Bill of Materials for VRA SingleVM CentOS
	orderCPUServiceConfigurationTabCss  	:			'#cpu_value',
	orderMemoryServiceConfigurationTabCss	:			'#memorymb_value',
	orderStorageServiceConfigurationTabCss	:			'#storagegb_value',
	orderTotalCostBillofMaterialsTabCss		:			'#total_cost_value',

    quantityFromBOMCss:                                 '#quantity svg',
    clickMoreLinkXpath: '                               //a[contains(text(),"More")]',

    tableClassCSS:			                            '.review-order_bom-table',
    bomTotalCss:                                        '.total-quantity',

  //*********** LOCATORS FOR ORDER APPROVAL POPUP***********
    OrderApprovalModalApproveButtonCss:                  '#button-order_details_approval_approve',
	OrderApprovalModalCancelButtonCss:					 '#button-order_details_approval_cancel',
	OrderCancelPopupYesButtonCss:						 '#button-order_cancel_yes',
    OrderCancelPopupOkButtonCss:						 '#button-order_cancel_ok',
    // OrderApprovalModalTitleCss:						 'h2',
    OrderApprovalModalTitleXpath:						 '//h2[contains(text(),"Order Approval Flow")]',
    //OrderApprovalModalTechincalApprovalCheckboxCss:  	 '#checkbox-technical',
    OrderApprovalModalTechincalApprovalCheckboxCss:  	 'label[for="checkbox-technical"]',
 	//OrderApprovalModalFinancialApprovalCheckboxCss:  	 '#checkbox-financial',
    OrderApprovalModalFinancialApprovalCheckboxCss:  	 'label[for="checkbox-financial"]',
    OrderApprovalModalCloseXCss :      					 '#close-btn_approve-modal',
    OrderApprovalModalErrorMessageCss :	  				 '#order_details_approval_error',
    OrderApprovalModalSuccessMessageCss :				 '#order_details_approval_success',
    OrderApprovalModalOkButtonCss:						 '#button-order_details_approval_ok',

	//****************** LOCATORS FOR ADMN/BUYER ORDER PAGE  *******
	pageBuyerOrdersUrl: 					        url + '/orders/my-orders',

    orderHistoryLinkCss:                            '#myordersLinkId',
	//Be careful, this "Search" is from ORDER HISTORY (different from ALL ORDERS)
    orderBuyerSearchTextBoxCss:  		  	        '[id^="search__input-orders-search"]',
	//orderOrderDetailsLinkCss:			        	'//a[contains(.,"Order Details")]',
    orderOrderDetailsLinkCss:			        	'#order-details-link',
	orderServiceDetailsTabCss:			        	'#service_details',
    orderEstimatedCostTabCss:			        	'#estimated_costs',
	orderOrderUpdateTabCss:			        		'#order_updates',
    orderBuyerServiceDetailsCloseButtonCss:         '#button-',
	ordersTotalCss:					        		'#ordersCounterValue',

    orderExpandOrderCss:							'.bx--accordion__arrow',
    orderServiceFulfillmentMsgCss:					'.bx--inline-notification__subtitle span',
    orderOrderHistoryDetailsCss:                    '#-icon',
	orderRetryServiceButtonCss:						'[id^="retry-service-"]',
	orderCancelServiceButtonCss:					'[id^="cancel-service-"]',
	orderRetryModalOkayId: 							'button-order_retry_ok',


	//**********   Filter by Period  ***************
    selectAllOrdersStatusCss:						'#dropdown-option_ordercreatedtime_AllOrders',
	orderFirstOrderFromTableCss:     	        	'#order-number',
    ordersCounterValueCss:                     		'#bx--dropdown-single-parent_ordercreatedtime',
    selectOptionLastDayCss:  			        	'#dropdown-option_ordercreatedtime_LastDay',
    selectOptionLastWeekCss:  			        	'#dropdown-option_ordercreatedtime_LastWeek',
    selectOptionLastMonthCss: 	                	'#dropdown-option_ordercreatedtime_LastMonth',
    selectOptionLastThreeMonthsCss:  		    	'#dropdown-option_ordercreatedtime_Last3Months',
    selectOptionLastSixMonthsCss:  					'#dropdown-option_ordercreatedtime_Last6Months',
    selectOptionLastYearCss:  			        	'#dropdown-option_ordercreatedtime_LastYear',

    //*********   Filter by Order Status ******************
    selectAllOrdersFromOrderStatusCss:				'#dropdown-option_orderstatus_AllOrders',
	selectApprovalInProgressStatusCss:	        	'#dropdown-option_orderstatus_ApprovalInProgress',
    selectOrderStatusCss:							'#bx--dropdown-single-parent_orderstatus',
	selectSubmittedOrderStatusCss:					'#dropdown-option_orderstatus_Submitted',
    selectProvisioningInProgressOrderStatusCss:     '#dropdown-option_orderstatus_ProvisioninginProgress',
	selectRejectedOrderStatusCss:					'#dropdown-option_orderstatus_Rejected',



    //************************  LOCATORS FOR ADMN/APPROVER ORDER PAGE  *****************

    pageApproverOrdersUrl: 					        url + '/orders/approver-orders',

    orderApproverPendingOrderTabCss:                '#pending_approval_tab',
    orderApproverAllOrdersTabCss:                   '#all_orders_tab',
    orderApproverResetButtonCss:                    '#button-reset',

    orderApproverFilterByDropBoxCss:                '#bx--dropdown-single-parent_order-type',
    orderApproverFilterByNewestFirstCss:            '#dropdown-option_order-type_NewestFirst',
    orderApproverFilterByOldestFirstCss:            '#dropdown-option_order-type_OldestFirst',

	orderApproverViewDetailsLinkCss:				'#view-details-link',
	orderApproverViewUpdatesLinkCss:				'#view-updates-link',

	orderApproverDenyButtonCss:						'#button-order_deny_button',
	orderApproverApproveButtonCss:					'#button-order_approve_button',

    orderApproverFilterByTodayCss:                   '#today',
    orderApproverFilterByWeekCss:                    '#week',
    orderApproverFilterByMonthCss:                   '#month',
    orderApproverFilterByYearCss:                    '#year',

    orderApproverErrorApprovalCss:                   '#order_details_approval_error',



    //Estimated Costs from Order Details for orders
    orderEstimatedCostsQuantityCss:                  '#quantity',
    orderEstimatedCostsItemCss:                      '#description',
    orderEstimatedCostsRecurringValueCss:            '#recurring-charge-value',
    orderEstimatedCostsRecurringFrequencyValueCss:   '#recurring-charge-frequency-value',
    orderEstimatedCostsUsageChargeValueCss:          '#usage-charge-value',
    orderEstimatedCostsUsageUOMValueCss:             '#usage-charge-uom-value',
    orderEstimatedCostsUsageUOMCodeCss:              '#usage-charge-uom-code',


    orderOrderUpdatesApprovalInProgressCss:          '#approvalinprogress',
    orderOrderUpdatesSubmittedCss:                   '#submitted',
    lnkMoreXpath:					'//*[text()="More"]',
    tblServiceNameXpath:				'//*[@id="tableOrderServiceDetails"]/div//tr//td[1]',
    tblViewDetailsXpath:				'//carbon-icon[contains(@id,"carbon-data-table-simple-0-parent-row")]',

	//***********LOCATORS FOR ORDER DENIAL POPUP***********
    OrderDenyModalYesButtonCss:                     '#button-order_details_denial_yes',
    OrderDenyModalCancelButtonCss:					'#button-order_details_denial_cancel',
    OrderDenyModalTitleXpath:						'//h2[contains(text(),"Order Denial Flow")]',
    OrderDenyModalTechincalApprovalCheckboxCss:  	'#checkbox-denial-technical ~ label',
    OrderDenyModalFinancialApprovalCheckboxCss:  	'#checkbox-denial-financial ~ label',
    OrderDenyModalCommentsTextAreaCss:				'#text-areadenial-reason',
    OrderDenyModalCommentsValueRequiredCss:			'.bx--form-requirement',
    OrderDenyModalCloseXCss :      					'#close-btn_denial-modal',
    OrderDenyModalErrorMessageCss :	  				'#order_details_denial_error',
    OrderDenyModalSuccessMessageCss :				'.bx--inline-notification__details',
    OrderDenyModalOkButtonCss:						'#button-order_details_deny_approve',
	OrderDenyModalCloseErrorEnterRejectionReasonCss:'[id^=order_details_denial_error] > button',
    OrderDenyModalOkayButtonCss:					'#button-order_details_deny_ok',

	//*********** LOCATORS FOR RETRY POPUP
	OrderRetryModalYesButtonCss:					'#button-order_retry_yes',
    OrderRetryModalNoButtonCss:						'#button-order_retry_no',
	OrderRetryModalMessageCss:						'#cancel_message',
	orderNotFoundTextXpath:						'//p[@class = "bx--inline-notification__subtitle"]/span',
	orderTotalCostXpath:						'//*[@id="total_cost_value"]',

	//******** LOCATORS FOR BUDGET DETAILS ************
	budgetAmmountXpath: '//*[@id="currentBdgAmt"]',
	availableBudgetXpath: '//*[@id="availableBdgt"]',
	CommittedAmmountXpath: '//*[@id="cuxrrentCmtedAmt"]',
	spendAmmountXpath: '//*[@id="currentSpendAmt"]',
	estimatedAmmountforOrderxpath:'//*[@id="currentEstAmt"]',
	awaitingApprovalOrderAmountxpath: '//*[@id="awaitappr"]',
	budgetDropdown: '//*[@id="bx--dropdown-single-parent_budgets"]',
	budgetDropdownCSS: 'bx--dropdown-single-parent_budgets',
	submitButtonBudgetXpath: '//BUTTON[@id="button-order_budget_select"]',
	budgetID: 'currentBdgAmt'
};

//******** Order status *************
global.failedStatus = "Failed";
global.approvalInProgressStatus = 'Approval In Progress';
global.provisioningInProgressStatus = 'Provisioning in Progress';






function orders(selectorConfig) {
    if (!(this instanceof orders)) {
        return new orders(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}



orders.prototype.clickQuantity = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.quantityFromBOMCss))),5000);
    return element(by.css(this.quantityFromBOMCss)).click();
};

orders.prototype.clickMoreOrLessLink = function(){
    browser.wait(EC.visibilityOf(element(by.xpath(this.clickMoreLinkXpath))),5000);
    return element(by.xpath(this.clickMoreLinkXpath)).click();

};
orders.prototype.open = function()
{
   browser.get(this.pageUrl);
   //browser.sleep(10000);
   browser.wait(EC.urlContains("/orders/approver-orders"), 90000);
   //util.waitForAngular();
};

orders.prototype.clickAllOrdersUnderOrdersSection = function(){
	util.waitForAngular();
	browser.sleep(5000);
	element(by.linkText(this.allOrdersTabUnderOrdersLinkText)).click().then(function(){
		logger.info("Clicked on All Orders Tab...");
	})
}

orders.prototype.isPresentOrderHistoryLink = function(){
    return element(by.css(this.orderHistoryLinkCss)).isPresent();
};

orders.prototype.isPresentOrdersLink = function(){
    return element(by.xpath(this.ordersLinkTextXpath)).isPresent();
};

orders.prototype.isPresentFinancialApprovalCheckbox = function(){
    return element(by.css(this.OrderApprovalModalFinancialApprovalCheckboxCss)).isPresent();
};

orders.prototype.clickordersLink = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.ordersLinkTextXpath))),5000);
    return element(by.xpath(this.ordersLinkTextXpath)).click();
};

orders.prototype.openNew = function()
{
   browser.get(this.pageBuyerOrdersUrl);
};

//Click Cancel on Order detail page.
orders.prototype.clickCancelButtonOrdersDetailsPage = function(){
    browser.waitForAngular();
    browser.waitForAngular();
    element(by.css(this.cancelButtonOrderDetailsPageCss)).click();
    util.waitForAngular();

        // .then(function () {
        //     //browser.wait(EC.invisibilityOf(element(by.css(this.cancelButtonOrderDetailsPageCss))), 30000);
        //
        //     browser.sleep(3000);
        // 	return element(by.css(this.cancelButtonOrderDetailsPageCss)).click();
        // 	util.waitForAngular();
        // }

};

//Click Retry on Order detail page.
orders.prototype.clickRetryButtonOrdersDetailsPage = function(){
    browser.waitForAngular();
    //expect(element(by.css(this.viewOrderDetailsTextCss)).getText()).toMatch('View order details');
    //expect(element(by.css(this.orderStatusOrderDetailsPageCss))).toMatch('Provisioning in Progress');
    //browser.navigate().refresh();
    browser.waitForAngular();
    element(by.css(this.retryButtonOrderDetailsPageCss)).click();
    util.waitForAngular();
};


//******************************Function for searching an Order*************//

orders.prototype.searchOrderById = function(orderId){	
	browser.wait(EC.visibilityOf(element(by.css(this.orderSearchTextBoxCss))),25000);
	var searchInputBox = element(by.css(this.orderSearchTextBoxCss));
	util.waitForAngular();
	searchInputBox.clear();
	browser.sleep(5000);
	searchInputBox.sendKeys(orderId);
	browser.sleep(1000);
	//searchInputBox.sendKeys(protractor.Key.ENTER);
	return element(by.xpath(this.orderNotFoundTextXpath)).getText().then(function(message){									
		if(message == "No Orders Found" || message == "No Pending Orders" ){
			util.waitForAngular();
			searchInputBox.clear();
			browser.sleep(5000);
			searchInputBox.sendKeys(orderId);
			browser.sleep(1000);
		}
		return;
		}).catch(function(){
			return "Order Found";
		});
	util.waitForAngular();
};

orders.prototype.searchOrderByStatus = function(orderStatus){
	var searchInputBox = element(by.css(this.orderSearchTextBoxCss));
	util.waitForAngular();
    logger.info('Status: '+ orderStatus);
	searchInputBox.sendKeys(orderStatus);
	searchInputBox.sendKeys(protractor.Key.ENTER);
	util.waitForAngular();
};

//*********************Function for Order Table to get values for First Order *************//

orders.prototype.getTextFirstOrderIdOrdersTable = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderTableOrderIDColumnCss))),10000);
    return element.all(by.css(this.orderTableOrderIDColumnCss)).first().getText().then(function(text){
		var orderId=text;
		if(orderId.includes('ORDER #')){
			orderId=orderId.replace('ORDER # ','');
		}
		logger.info("Order ID :: "+orderId);
		return orderId.trim();
    });
};

orders.prototype.getTextFirstCreatedDateOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableCreatedDateColumnCss))),10000);
    return element.all(by.css(this.orderTableCreatedDateColumnCss)).first().getText().then(function(text){
		logger.info("Order Created Date :: "+text);
		return text;
    });
};

/*orders.prototype.getTextFirstUpdatedDateOrdersTable = function()
{
    return element.all(by.css(this.orderTableUpdatedDateColumnCss)).first().getText().then(function(text){
    	logger.info("Order ID :: "+text);
    });
};*/

orders.prototype.getTextFirstPlacedByOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTablePlacedByColumnCss))),10000);
    return element.all(by.css(this.orderTablePlacedByColumnCss)).first().getText().then(function(text){
		logger.info("Order Placed By :: "+text);
		return text;
    });
};

orders.prototype.getTextFirstOrderTypeOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableOrderTypeColumnCss))),10000);
	return element.all(by.css(this.orderTableOrderTypeColumnCss)).first().getText().then(function(text){
		logger.info("Order Type in orders Table is :: "+text);
		return text;
    });
};

orders.prototype.getTextFirstOrderStatusOrdersTable = function(){
	util.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableOrderStatusColumnCss))),10000);
	return element.all(by.css(this.orderTableOrderStatusColumnCss)).first().getText().then(function(text){
		logger.info("Order status of the first order from Order table is: "+text);
		return text;
	});
};

orders.prototype.getTextFirstAmountOrdersTable = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.orderTableAmountColumnCss))),10000);
     return element.all(by.css(this.orderTableAmountColumnCss)).first().getText().then(function(text){
		//return text.toString().replace(",","");
		return text;
    });
};

orders.prototype.getTextTotalPriceBillOfMaterial = function(){
    return element.all(by.css(this.orderTableAmountColumnCss)).first().getText().then(function(text){
        logger.info("Total Price : "+text);
        var str1 = text.substr(3,4);
		var str2 = text.substr(20,6);
		var str4 = parseFloat(str1)+parseFloat(str2);
		//str4 = str4.toString();
		str4 = Math.round(str4);
		//var total = "USD"+str4.toString();
		console.log("Total Price :: "+str4);
        return str4;
    });
};

//*******************Functions for Service Details Section************************

orders.prototype.getTextserviceNameServiceDetails = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.serviceNameServiceDetailsCss))),10000);
    return element(by.css(this.serviceNameServiceDetailsCss)).getText().then(function(text){
		logger.info("Service Name under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextServiceOfferingNameServiceDetails = function(){
    return element(by.css(this.serviceOfferingNameServiceDetailsCss)).getText().then(function(text){
		logger.info("Service Offering Name under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextProviderNameServiceDetails = function(){
    return element(by.css(this.providerNameServiceDetailsCss)).getText().then(function(text){
		logger.info("Provider Name under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextPriceServiceDetails = function()
{
    return element(by.css(this.priceServiceDetailsCss)).getText().then(function(text){
		logger.info("Price under Service Details :: "+text);
		return text;
    });
};

orders.prototype.getTextFeeServiceDetails = function(){
    return element(by.css(this.feesServiceDetailsCss)).getText().then(function(text){
		logger.info("Fee under Service Details :: "+text);
		return text;
    });
};

orders.prototype.clickFirstViewDetailsOrdersTable = function (){
	var curr = this;
	browser.sleep(2000);
	util.waitForAngular();
	//browser.ignoreSynchronization = false;
	var eleToClick = element(by.css(curr.orderTableActionIconCss));
	browser.wait(EC.elementToBeClickable(element.all(by.css(curr.orderTableActionIconCss)).first()), 180000).then(function () {
		browser.executeScript("arguments[0].scrollIntoView();", eleToClick.getWebElement()).then(function(){
			browser.sleep(5000);
			element.all(by.css(curr.orderTableActionIconCss)).first().click().then(function () {
				logger.info("Clicked on the Actions icon of the first row on Orders page");
				browser.wait(EC.visibilityOf(element(by.buttonText(curr.buttonTextViewDetails))), 60000).then(function(){
					 element(by.buttonText(curr.buttonTextViewDetails)).click().then(function () {
						logger.info("Clicked on View Details link to get Order Details page");
						//Adding hardcoded sleep since it takes time to load order details page.
						browser.sleep(2000);
						//return;
					});
				});	
				util.waitForAngular();
			});
		});
	});
};

orders.prototype.isDisplayedViewDetailsUnderActionsButton = function(){
	var curr = this;
	return element.all(by.css(this.orderTableActionIconCss)).first().click().then(function(){
		logger.info("Clicked on the first Actions Icon")
		return element(by.buttonText(curr.buttonTextViewDetails)).isDisplayed();
	});
};

orders.prototype.clickViewDetailsButton = function(){
    browser.actions().mouseMove(element(by.buttonText(curr.buttonTextViewDetails))).perform();
    browser.wait(EC.elementToBeClickable(element(by.buttonText(curr.buttonTextViewDetails))),10000);
    return element(by.buttonText(curr.buttonTextViewDetails)).click();
};

//--------------Functions for View Updates Section---------------------
orders.prototype.clickViewUpdateUnderServiceDetails = function() {
	browser.wait(EC.visibilityOf(element(by.linkText(this.viewUpdatesServiceDetailsLinkText))), 60000);
	return element(by.linkText(this.viewUpdatesServiceDetailsLinkText)).click().then(function(){
		logger.info("Clicked on Update Details Link...");
	});
}

orders.prototype.closeServiceDetailsSlider = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.closeServiceDetailsSliderCss))), 60000);
	return element(by.css(this.closeServiceDetailsSliderCss)).click().then(function(){
		logger.info("Closed the Slider...");
	});
}

//****************************************************************************************************//

//********************FUNCTIONS FOR ORDER DETAILS for Approvers and Buyer PAGE*************************

orders.prototype.getTextViewOrderDetailsTitle = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.viewOrderDetailsTextCss))),25000);
	return element(by.css(this.viewOrderDetailsTextCss)).getText().then(function(text){
		return text;
	});
};

orders.prototype.getTextOrderIdOrderDetails = function(){
	return element(by.css(this.orderNumberOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Order Number in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderServiceNameOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderServiceNameOrderDetailsPageCss))),5000);
	return element(by.css(this.orderServiceNameOrderDetailsPageCss)).getText().then(function(text){
	logger.info("Order Service Name in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderProviderNameOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderProviderNameOrderDetailsPageCss))),5000);
	return element(by.css(this.orderProviderNameOrderDetailsPageCss)).getText().then(function(text){
	logger.info("Order Provider Name in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderCreatedDateOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderCreatedDataOrderDetailsPageCss))),5000);
	return element(by.css(this.orderCreatedDataOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Order Created Date in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderUpdatedDateOrderDetails = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderUpdatedDateOrderDetailsPageCss))),5000);
	return element(by.css(this.orderUpdatedDateOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Order Updated Date in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderStatusOrderDetails = function(){
	return element(by.css(this.orderStatusOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Status in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderRejectionReasonOrderDetails = async function(){
    // var value = element(by.css(this.orderRejectionOrderDetailsPageCss)).getAttribute("value");
    // logger.info("Rejection in Order details page : " + value);
    //
    // return value;
    element(by.id(this.orderRejectionOrderDetailsPageId)).getAttribute("value").then(function(text){
        logger.info("Rejection in Order details page : "+text);
        return text;
    });
};

orders.prototype.getTextOrderServiceTypeOrderDetails = function(){
	//return element(by.css(this.orderServiceTypeOrderDetailsPageCss)).getAttribute("value").then(function(text){
	return element(by.css(this.orderServiceTypeOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Service Type in Order details page : "+text);
		return text;
	});
};

orders.prototype.getOrderStatusFirstOrder = function(){
	return element(by.css(this.orderStatusofFirstOrderCss)).getAttribute("value").then(function(text){
		logger.info("Status First Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextOrderTypeOrderDetails = function(){
	return element(by.css(this.orderTypeOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Order type in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextTeamOrderDetails = function(){
	return element(by.css(this.orderTeamOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Order Team in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextTotalCostOrderDetails = function(){
	return element(by.css(this.orderTotalCostOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Total Cost in Order details page : "+text);
		return text;
	});
};

orders.prototype.getTextSubmittedByOrderDetails = function(){
	return element(by.css(this.orderSubmittedByOrderDetailsPageCss)).getText().then(function(text){
		logger.info("Order submitted by : "+text);
		return text;
	});
};

orders.prototype.getTextCPUOnServiceConfigurationOrderDetails = function(){
	return element(by.css(this.orderCPUServiceConfigurationTabCss)).getAttribute("value").then(function(text){
		logger.info("CPU on Buyer Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextMemoryOnServiceConfigurationOrderDetails = function(){
	return element(by.css(this.orderMemoryServiceConfigurationTabCss)).getAttribute("value").then(function(text){
		logger.info("Memory on Buyer Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextStorageOnServiceConfigurationOrderDetails = function(){
	return element(by.css(this.orderStorageServiceConfigurationTabCss)).getAttribute("value").then(function(text){
		logger.info("Storage on Buyer Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextCPUOnServiceConfigurationApproversOrderDetails = function(){
    return element(by.css(this.orderCPUServiceConfigurationTabCss)).getText("value").then(function(text){
        logger.info("\nCPU on Approver Order details page : "+ text);
        return text;
    });
};

orders.prototype.getTextMemoryOnServiceConfigurationApproversOrderDetails = function(){
    return element(by.css(this.orderMemoryServiceConfigurationTabCss)).getText("value").then(function(text){
        logger.info("Memory on Approver Order details page : "+ text);
        return text;
    });
};

orders.prototype.getTextStorageOnServiceConfigurationApproversOrderDetails = function(){
    return element(by.css(this.orderStorageServiceConfigurationTabCss)).getText("value").then(function(text){
        logger.info("Storage on Approver Order details page : "+ text);
        return text;
    });
};

orders.prototype.getTextTotalCostOnBillofMaterialsOrderDetails = function(){
	return element(by.css(this.orderTotalCostBillofMaterialsTabCss)).getText("value").then(function(text){
		logger.info('\n' + "Total Cost on Bill of Materials tab on Order details page : "+ text);
		return text;
	});
};

orders.prototype.getTextSubmittedStatusfromOrderUpdates = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderOrderUpdatesSubmittedCss))),5000);
    return element(by.css(this.orderOrderUpdatesSubmittedCss)).getText("value").then(function(text){
        logger.info('\n' + "First order status from Order Updates: "+ text);
        return text;
    });
};

orders.prototype.getTextApprovalStatusfromOrderUpdates = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderOrderUpdatesApprovalInProgressCss))),5000);
    return element(by.css(this.orderOrderUpdatesApprovalInProgressCss)).getText("value").then(function(text){
        logger.info("Second order status from Order Updates: " + text);
        return text;
    });
};

orders.prototype.isDisplayedApproveButtonOrderDetails = function(){
	//return element(by.buttonText(this.approveButtonText)).isPresent().then(function (flag, err) {
	return element(by.css(this.approveButtonOrderDetailsPageCss)).isPresent().then(function (flag, err) {
		if(err){
			return false;
		}
		logger.info("Approve button display status: "+flag);
		return flag;
    });
};

orders.prototype.isPresentApproveButtonOrderDetails = function(){
    return element(by.css(this.approveButtonOrderDetailsPageCss)).isPresent();//element(by.buttonText(this.approveButtonText))
};

orders.prototype.isPresentCancelButtonOrderDetails = function(){
    return element(by.css(this.cancelButtonOrderDetailsPageCss)).isPresent().then(function(flag,err){
    	if(err){
			return false;
		}
    	logger.info("Cancel button display status : "+flag)
		return flag;
    });
};

orders.prototype.isPresentRetryButtonOrderDetails = function(){
    return element(by.css(this.retryButtonOrderDetailsPageCss)).isPresent();
};
orders.prototype.clickApproveButtonOrderDetails = function(){
	/*browser.wait(EC.visibilityOf(element(by.css(this.orderNumberOrderDetailsPageCss))),60000).then(function(){
		logger.info("Order Details page is loaded, now waiting for Approve/Deny/Cancel button to be displayed");
	});*/
	browser.wait(EC.visibilityOf(element(by.css(this.approveButtonOrderDetailsPageCss))),300000).then(function(){
		logger.info("Approve/Deny button is shown...");
	});
	return element(by.css(this.approveButtonOrderDetailsPageCss)).click().then(function(){
		logger.info("Clicked on approve Button");
	});
};

orders.prototype.isPresentDenyButtonOrderDetails = function(){
    return element(by.css(this.denyButtonOrderDetailsPageCss)).isPresent();//element(by.buttonText(this.denyButtonText))

    //  **** This is not working for some reason. It looks right but I get the message
	// 'Expected undefined to be true, 'The deny button was not present.'.'
// 	return element(by.buttonText(this.denyButtonText)).isPresent().then(function(status){
// 		logger.info("Deny element present status: "+status);
// 	});
};


orders.prototype.isDisplayedDenyButtonOrderDetails = function(){
	return element(by.css(this.denyButtonOrderDetailsPageCss)).isPresent().then(function (flag, err) {
		if(err){
			return false;
		}
		logger.info("Deny button display status: "+flag);
		return flag;
    });
};

orders.prototype.isDisplayedCancelButtonOrderDetails = function(){
    return element(by.css(this.cancelButtonOrderDetailsPageCss)).isDisplayed();
};

orders.prototype.clickDenyButtonOrderDetails = function(){
	/*browser.wait(EC.visibilityOf(element(by.css(this.orderNumberOrderDetailsPageCss))),60000).then(function(){
		logger.info("Order Details page is loaded, now waiting for Approve/Deny/Cancel button to be displayed");
	});*/
	
	browser.wait(EC.visibilityOf(element(by.css(this.denyButtonOrderDetailsPageCss))),300000);
	return element(by.css(this.denyButtonOrderDetailsPageCss)).click().then(function(){
		logger.info("Order Details page is loaded, now waiting for Deny button to be displayed");
	});
};

orders.prototype.getTextFailureReason = function() {
    browser.wait(EC.visibilityOf(element(by.css(this.failureReasonOrderDetailsPageCss))),15000);
	return element(by.css(this.failureReasonOrderDetailsPageCss)).getAttribute("value").then(function(text){
		logger.info("Reason of Failure : "+text);
		return text;
	})
}

orders.prototype.clickServiceConfigurationsTabOrderDetails = function(){
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.serviceDetailsButtonServiceDetailsBtnText))),5000);
	return element(by.buttonText(this.serviceDetailsButtonServiceDetailsBtnText)).click().then(function(){
		logger.info("Clicked on Service Configurations tab")
	});
};

orders.prototype.clickBillOfMaterialsTabOrderDetails = function(){
	browser.wait(EC.visibilityOf(element(by.buttonText(this.estimatedCostsButtonServiceDetailsBtnText))),5000);
	return element(by.buttonText(this.estimatedCostsButtonServiceDetailsBtnText)).click().then(function(){
		logger.info("Clicked on Bill of Materials tab")
	});
};

orders.prototype.getEstimatedCostFromEstimatedCostTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTotalCostXpath))),5000);
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		if(text == 'N/A'){
			logger.info("Cost under Estimated Costs Tab is :: "+text);
		}
		else{
			var str1 = text.substr(3,9);
			console.log(str1);
			text = Math.round(str1).toString();
			logger.info("Cost under Estimated Costs Tab is :: "+text);
		}
		return text;
	})
}

orders.prototype.getEstimatedCostFromBillOfMaterialsTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTotalCostXpath))),5000);
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		logger.info("Cost under Estimated Costs Tab is :: "+text);
		return text;
	});
}

orders.prototype.clickOrderUpdatesServiceDetails = function(){
	browser.wait(EC.visibilityOf(element(by.buttonText(this.orderUpdatesButtonServiceDetailsBtnText))),5000);
	return element(by.buttonText(this.orderUpdatesButtonServiceDetailsBtnText)).click().then(function(){
		logger.info("Clicked on Order Updates tab")
	});
};

orders.prototype.clickBuyerOrderDetailsLink = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderOrderDetailsLinkCss))),5000);
    return element(by.css(this.orderOrderDetailsLinkCss)).click();
};

orders.prototype.clickBuyerServiceDetailsTab = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderServiceDetailsTabCss))),5000);
    return element(by.css(this.orderServiceDetailsTabCss)).click();
};

orders.prototype.clickBuyerEstimatedCostTab = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderEstimatedCostTabCss))),5000);
    return element(by.css(this.orderEstimatedCostTabCss)).click();
};

orders.prototype.clickBuyerOrderUpdateTab = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderOrderUpdateTabCss))),5000);
    return element(by.css(this.orderOrderUpdateTabCss)).click();
};

orders.prototype.clickBuyerServiceDetailsCloseButton = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.orderBuyerServiceDetailsCloseButtonCss))),5000);
    return element(by.css(this.orderBuyerServiceDetailsCloseButtonCss)).click();
};

//***********************  FUNCTIONS FOR CANCEL ORDER  ************************************ */
orders.prototype.clickCancelButtonOrderApprovalModal = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.OrderApprovalModalCancelButtonCss))),20000);
	return element(by.css(this.OrderApprovalModalCancelButtonCss)).click();
};
orders.prototype.clickYesButtonOnCancelPopup = function(){

	browser.wait(EC.invisibilityOf(element(by.xpath(this.OrderApprovalModalTitleXpath))),20000);
    return element(by.css(this.OrderCancelPopupYesButtonCss)).click();
};

orders.prototype.clickOkButtonOnCancelPopup = function(){
    browser.wait(EC.elementToBeClickable(element(by.css(this.OrderCancelPopupOkButtonCss))),40000);
    return element(by.css(this.OrderCancelPopupOkButtonCss)).click();
};



//************************  FUNCTIONS FOR RETRY ORDER *****************************************

orders.prototype.clickOkayOrderRetryModal = function () {
    browser.wait(EC.elementToBeClickable(element(by.id(this.orderRetryModalOkayId))), 6000);
    return element(by.id(this.orderRetryModalOkayId)).click();
};

orders.prototype.clickNoOrderRetryModal = function () {
    browser.wait(EC.visibilityOf(element(by.id(this.OrderRetryModalNoButtonId))), 6000);
    return element(by.id(this.OrderRetryModalNoButtonId)).click();
};
//***********************FUNCTIONS FOR APPROVING ORDER************************************************//

orders.prototype.getTextOrderApprovalModalTitle = function(){
	return element(by.xpath(this.OrderApprovalModalTitleXpath)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickFinancialApprovalCheckBoxOrderApprovalModal = function(){
	// //This is a temporary fix to accomodate changes in object identifier.
	// //In customer1, FinancialApproveCheckbox is '#checkbox-Financial ~ label'
	// //and, all other QA envs, it is '#checkbox-financial ~ label'
	// if (url.toLowerCase().includes('customer1')){
    //     tempFinancialApproveCheckbox = '#checkbox-Financial ~ label';
	// }else{
    //     tempFinancialApproveCheckbox = this.OrderApprovalModalFinancialApprovalCheckboxCss;
	// }
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalFinancialApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderApprovalModalFinancialApprovalCheckboxCss)).click().then(function(){
		logger.info("Checked Financial Approval checkbox");
	});
};

orders.prototype.clickTechnicalApprovalCheckBoxOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalTechincalApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderApprovalModalTechincalApprovalCheckboxCss)).click().then(function(){
		logger.info("Checked Technical Approval checkbox");
	});
};

orders.prototype.clickApproveButtonOrderApprovalModal = function(){
	return element(by.css(this.OrderApprovalModalApproveButtonCss)).click().then(function(){
		logger.info("Clicked Approve button on Order Approval modal dialog");
	});
	util.waitForAngular();
};

orders.prototype.clickOkInOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalSuccessMessageCss))),50000);
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalOkButtonCss))),50000);
	return element(by.css(this.OrderApprovalModalOkButtonCss)).click().then(function(){
		logger.info("Clicked on Ok button on Order Approval modal dialog");
	});
	util.waitForAngular();
};

orders.prototype.getErrorMessageOrderApprovalModal = function(){
	return element(by.css(this.OrderApprovalModalErrorMessageCss)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.getTextOrderSuccessOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalSuccessMessageCss))),90000);
	return element(by.css(this.OrderApprovalModalSuccessMessageCss)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickCloseXOrderApprovalModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderApprovalModalCloseXCss))),15000);
	return element(by.css(this.OrderApprovalModalCloseXCss)).click();
	browser.wait(EC.invisibilityOf(element(by.xpath(this.OrderApprovalModalTitleXpath))),20000);
};


//************** FUNCTION for Search/Filters for BUYER Order page *******************

orders.prototype.getBuyerTotalOrdersfromUI = function(){
    //return element(by.xpath(this.BuyerUIOrdersTotalXpath)).getText().then(function(text){
	return element(by.css(this.ordersTotalCss)).getText().then(function(text){

	var splitText = text.split(" ");
		logger.info("\n\nOrders count from UI: " + splitText[0] + '\n');
		 return parseInt(splitText[0]);
	});
};

//Click Buyer Order Total
orders.prototype.clickBuyerOrderTotal = function(){
	return element(by.css(this.ordersTotalCss)).click();
};

orders.prototype.getTextOrderStatusOrderHistory = function(){
    return element(by.css(this.orderStatusOrderDetailsPageCss)).getText().then(function(text){
        logger.info("Status in Order details page : " + text);
        return text;
    });
};


//******************  Filter by Period *****************

// Get Buyer Order Counter
orders.prototype.getTextBuyerOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.ordersCounterValueCss))),6000);
    return element(by.css(this.ordersCounterValueCss)).getText();
};

// Click Buyer Order Counter
orders.prototype.clickBuyerOrderPeriod = function(){
    this.getTextBuyerOrderPeriod().click();
};

// Buyer Order Last Day period
orders.prototype.clickBuyerLastDayOrderPeriod = function(){
	return element(by.css(this.selectOptionLastDayCss)).click();
};

// Buyer Order Last Week period
orders.prototype.clickBuyerLastWeekOrderPeriod = function(){
    return element(by.css(this.selectOptionLastWeekCss)).click();
};

// Buyer Order Last Month period
orders.prototype.clickBuyerLastMonthOrderPeriod = function(){
	return element(by.css(this.selectOptionLastMonthCss)).click();
};

// Buyer Order Last 3 Months period
orders.prototype.clickBuyerLastThreeOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOptionLastThreeMonthsCss))),6000);
    return element(by.css(this.selectOptionLastThreeMonthsCss)).click();
};

// Buyer Order Last 6 Months period
orders.prototype.clickBuyerLastSixOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOptionLastSixMonthsCss))),6000);
    return element(by.css(this.selectOptionLastSixMonthsCss)).click();
};

// Buyer Order Last Year period
orders.prototype.clickBuyerLastYearOrderPeriod = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOptionLastYearCss))),6000);
    return element(by.css(this.selectOptionLastYearCss)).click();
};

//Click Buyer "All Orders" status filter by Period
orders.prototype.clickBuyerAllOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectAllOrdersStatusCss))),6000);
	return element(by.css(this.selectAllOrdersStatusCss)).click();
};


//****************  Filter by Order Status  **************

// Get Select Order Status
orders.prototype.getTextSelectOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectOrderStatusCss))),6000);
    return element(by.css(this.selectOrderStatusCss)).getText();
};

// Click "Select Order Status"
orders.prototype.clickSelectOrderStatus = function(){
    this.getTextSelectOrderStatus().click();
};

//Click "All Orders"  status filter by Order Status
orders.prototype.clickAllOrderFromOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectAllOrdersFromOrderStatusCss))),6000);
    return element(by.css(this.selectAllOrdersFromOrderStatusCss)).click();
};

//Click Buyer "Approval in Progress" status filter
orders.prototype.clickApprovalInProgress = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectApprovalInProgressStatusCss))),9000);
	return element(by.css(this.selectApprovalInProgressStatusCss)).click();
};

//Click Buyer "Submitted" status filter
orders.prototype.clickSubmitted = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectSubmittedOrderStatusCss))),9000);
    return element(by.css(this.selectSubmittedOrderStatusCss)).click();
};

//Click Buyer "Provisioning in Progress" status filter
orders.prototype.clickProvisionInginProgress = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectProvisioningInProgressOrderStatusCss))),9000);
    return element(by.css(this.selectProvisioningInProgressOrderStatusCss)).click();
};

//Click Buyer "Rejected" status filter
orders.prototype.clickRejectedOrderStatus = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.selectRejectedOrderStatusCss))),9000);
    return element(by.css(this.selectRejectedOrderStatusCss)).click();
};

orders.prototype.getTextFirstBuyerOrderNumber = function(){
    //return element(by.xpath(this.BuyerUIOrdersTotalXpath)).getText().then(function(text){
    return element(by.css(this.orderFirstOrderFromTableCss)).getText().then(function(text){

        var splitText = text.split(" ");
        logger.info("Buyer Order Number from Search result = " + splitText[1]);
        return splitText[1];
    });
};

//Search on Buyer Order page
orders.prototype.searchBuyerOrderNumber = function(buyerOrderNumber){
	var searchBuyerOrderInputBox = element(by.css(this.orderBuyerSearchTextBoxCss));

	browser.wait(EC.visibilityOf(element(by.css(this.orderBuyerSearchTextBoxCss))),6000);
	searchBuyerOrderInputBox.clear();
	searchBuyerOrderInputBox.sendKeys(buyerOrderNumber);
    searchBuyerOrderInputBox.sendKeys(protractor.Key.ENTER);
	util.waitForAngular();
	return;
};

orders.prototype.clickOrderExpandLink = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderExpandOrderCss))),5000);
    return element(by.css(this.orderExpandOrderCss)).click();

};

orders.prototype.getTextOrderServiceFulfillmentMsg = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderServiceFulfillmentMsgCss))),5000);
    return element(by.css(this.orderServiceFulfillmentMsgCss)).getText().then(function(text){
        logger.info("***** Message from Expand Rejected order: " + text);
        return text;
    });
};

orders.prototype.clickOrderHistoryDetails = function(){
    return element(by.css(this.orderOrderHistoryDetailsCss)).click();
};

orders.prototype.clickServiceRetryButton = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderRetryServiceButtonCss))),6000);
	return element(by.css(this.orderRetryServiceButtonCss)).click();
};

orders.prototype.isEnabledRetryLink = function(){
    return element(by.css(this.orderRetryServiceButtonCss)).isEnabled();
};

orders.prototype.isPresentRetryLink = function(){
    return element(by.css(this.orderRetryServiceButtonCss)).isPresent();
};

orders.prototype.isPresentCancelLink = function(){
    return element(by.css(this.orderCancelServiceButtonCss)).isPresent();
};
//***********************FUNCTIONS FOR DENYING ORDER************************************************//

orders.prototype.getTextOrderDenyModalTitle = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.OrderDenyModalTitleXpath))),25000);
	return element(by.xpath(this.OrderDenyModalTitleXpath)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickFinancialApprovalCheckBoxOrderDenyModal = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalFinancialApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderDenyModalFinancialApprovalCheckboxCss)).click();
};

// orders.prototype.clickFinancialApprovalCheckBoxOrderDenyModal = function(){
// 	//This is a temporary fix to accomodate changes in object identifier.
// 	//In customer1, FinancialApproveCheckbox- Deny is '#checkbox-denial-Financial ~ label'
// 	//and, all other QA envs, it is '#checkbox-denial-financial ~ label'
// 	if (url.toLowerCase().includes('customer1')){
//         tempFinancialApproveCheckbox = '#checkbox-denial-Financial ~ label';
// 	} else {
//         tempFinancialApproveCheckbox = this.OrderDenyModalFinancialApprovalCheckboxCss;
// 	}
// 	browser.wait(EC.visibilityOf(element(by.css(tempFinancialApproveCheckbox))),20000);
// 	return element(by.css(tempFinancialApproveCheckbox)).click().then(function(){
// 		logger.info("Checked Financial Approval checkbox for Deny Order");
// 	});
// };

orders.prototype.clickTechnicalApprovalCheckBoxOrderDenyModal = function(){
	
	browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalTechincalApprovalCheckboxCss))),20000);
	return element(by.css(this.OrderDenyModalTechincalApprovalCheckboxCss)).click().then(function(){
			logger.info("Checked Technical Approval checkbox for Deny Order");
	});
};


 orders.prototype.clickYesButtonOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalYesButtonCss)).click();
};

orders.prototype.clickYesButtonOrderRetryModal = function(){
	//return element(by.css(this.OrderRetryModalYesButtonCss)).click();
    element.all(by.css(this.OrderRetryModalYesButtonCss)).get(1).click();
};

orders.prototype.clickCancelButtonOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalCancelButtonCss)).click();
	browser.wait(EC.invisibilityOf(element(by.css(this.OrderDenyModalTitleCss))),20000);
};

orders.prototype.clickOkInOrderDenyModal = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalOkButtonCss))),90000);
    return element(by.css(this.OrderDenyModalOkButtonCss)).click();
};

orders.prototype.clickDenyInOrderDenyModal = function(){

	browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalOkButtonCss))),9000);
	return element(by.css(this.OrderDenyModalOkButtonCss)).click().then(function(){
		logger.info("confirm for Deny Order");
});
};

orders.prototype.getErrorMessageOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalErrorMessageCss)).getText().then(function(text){
		logger.info(text);
		return text;
	});
};

orders.prototype.clickCloseXOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalCloseXCss)).click();
	browser.wait(EC.invisibilityOf(element(by.css(this.OrderDenyModalTitleCss))),5000);
};


orders.prototype.clickCloseXRejectionReasonOrderDenyModal = function(){
	return element(by.css(this.OrderDenyModalCloseErrorEnterRejectionReasonCss)).click();
};

orders.prototype.setTextCommentsTextareaOrderDenyModal = function(reason){
	return element(by.css(this.OrderDenyModalCommentsTextAreaCss)).sendKeys(reason);
};

orders.prototype.clickOkDenialWasProcessed = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.OrderDenyModalOkayButtonCss))),30000);
    return element(by.css(this.OrderDenyModalOkayButtonCss)).click().then(function(){
		logger.info("click Ok Denial Was Processed");
	})
};

orders.prototype.isDisplayedCommentsValueRequiredMessage = function(){
	return element(by.css(this.OrderDenyModalCommentsValueRequiredCss)).isDisplayed();

};


//*********************  FUNCTION FOR ADMIN/APPROVER PAGE ***************************

orders.prototype.openApproverPage = function(){
    browser.get(this.pageApproverOrdersUrl);
};

orders.prototype.clickApproverPedingApprovalTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverPendingOrderTabCss))),5000);
    return element(by.css(this.orderApproverPendingOrderTabCss)).click();
};

orders.prototype.clickApproverAllOrdersTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverAllOrdersTabCss))),5000);
    return element(by.css(this.orderApproverAllOrdersTabCss)).click();
};

orders.prototype.clickApproverViewDetailsLink = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverViewDetailsLinkCss))),5000);
    return element(by.css(this.orderApproverViewDetailsLinkCss)).click();
};

orders.prototype.clickApproverViewUpdatesLink = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverViewUpdatesLinkCss))),5000);
    return element(by.css(this.orderApproverViewUpdatesLinkCss)).click();
};

orders.prototype.clickApproverFilterByTodayTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByTodayCss))),5000);
    return element(by.css(this.orderApproverFilterByTodayCss)).click();
};

orders.prototype.clickApproverFilterByWeekTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByWeekCss))),5000);
    return element(by.css(this.orderApproverFilterByWeekCss)).click();
};

orders.prototype.clickApproverFilterByMonthTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByMonthCss))),5000);
    return element(by.css(this.orderApproverFilterByMonthCss)).click();
};

orders.prototype.clickApproverFilterByYearTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverFilterByYearCss))),5000);
    return element(by.css(this.orderApproverFilterByYearCss)).click();
};

orders.prototype.clickApproverApproveButton = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverApproveButtonCss))),5000);
    return element(by.css(this.orderApproverApproveButtonCss)).click();
};

orders.prototype.getApproverErrorApproveMessage = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.orderApproverErrorApprovalCss))),5000);
    return element(by.css(this.orderApproverErrorApprovalCss)).getText().then(function(text){
        logger.info(text);
        return text;
    });
};

//Additional Details Section

orders.prototype.getTextBasedOnLabelName = function(labelName){
	return element(by.xpath("//label[contains(text(), '"+labelName+"')]/following-sibling::p")).getText().then(function(text){
        logger.info("The value for "+labelName+" is : "+text)
        return text;
    });
};

orders.prototype.getAllTextBasedOnLabelName = function(labelName){
	return element.all(by.xpath("//label[contains(text(), '"+labelName+"')]/following-sibling::p")).getText().then(function(textArray){
		var textList = [];
		logger.info("The length for "+labelName+" is : "+textArray.length);
		for (var i = 0; i < textArray.length; i++) {
			logger.info("The value for "+labelName+" is : "+textArray[i]);
			var str = textArray[i];
			if(str.includes(",")){
				textList.push(str.toString().split(","));
				logger.info("The value for "+labelName+" is : "+textList)
			}
		}
		var arrayList = [].concat.apply([], textList);
		var finalArray = [];
		for(i=0;i<arrayList.length;i++)
	    {
			finalArray[i] = arrayList[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	    }
		return finalArray;
	});
};

orders.prototype.getTextBasedOnExactLabelName = function(labelName){
        return element(by.xpath("//label[(text()='"+labelName+"')]/following-sibling::p")).getText().then(function(text){
        logger.info("The value for "+labelName+" is : "+text)
        return text;
    });
};

//Check if order No found
orders.prototype.checkIfOrderFound = function(){	
	return element(by.xpath(this.orderNotFoundTextXpath)).getText().then(function(message){
		//logger.info(text);
		return message.trim();
	}).catch(function(){
		return "Order Found";
	});
};

orders.prototype.validateOrderSummaryDetailsFields = function (loadBalObj, labelName) {

	var indexOfElem="undefined";
	var locatorValue = null;
	var elem = null;
	var flag;

	try {
		locatorValue = jsonUtil.getValueOfLocator(loadBalObj, labelName);

		if (labelName.includes("-")) {
			elem = labelName.split("-");
			indexOfElem = parseInt(elem[1]);
		}

		if (labelName.includes("_xpath")) {
			if (indexOfElem == "undefined") {
				return element(by.xpath(locatorValue)).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);					
					return flag;
				});
			} else {
				return element.all(by.xpath(locatorValue)).get(indexOfElem).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);				
					return flag;
				}).catch(function (error) {
					logger.info(error);					
				});
			}
		} else {
			if (indexOfElem == "undefined") {
				return element(by.css(locatorValue)).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);					
					return flag;
				});
			} else {
				return	element.all(by.css(locatorValue)).get(indexOfElem).getText().then(function (text) {
					flag = util.cmpValues(loadBalObj, labelName, text);					
					return flag;
				});
			}
		}

	}
	catch (e) {
		logger.info(e);
	}

};

//validate cost of google service
orders.prototype.validatePriceForGoogleService = function(price) {
	
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		price = price.split("/");		
		if(text == price[0].trim()){
			logger.info("Total cost on Review order page and summary details page is : " + text);
			return Promise.resolve(true);
		}else{
			logger.info("Total cost on Review order page : " + price + " and on Orders Summary Details page : " + text);
			return Promise.resolve(false);
		}		
	});

};

orders.prototype.clickMoreLinkBom = function(){	
	return element(by.xpath(this.lnkMoreXpath)).click().then(function(){
		logger.info("Clicked on More link in Orders Page-->Bill of Materials section");
		
	});
};

orders.prototype.validateEstimatedCostAllServicesofCart = function(serviceListExp)
{       
    var elmServiceName = element.all(by.xpath(this.tblServiceNameXpath));     	
	var cartListPage = new CartListPage();
	var ordersPage = new orders();
    let promiseArr = [];
	var finlValidn = false;
	
	browser.executeScript("arguments[0].scrollIntoView();", elmServiceName.last().getWebElement()).then(function(){
		elmServiceName.getText().then(function(textArray){		
			for(var i = 0; i < textArray.length; i++){
				ordersPage.clickViewDetailsBasedOnIndex(i);
				//verify details from Bill of Materials Page.			
				ordersPage.clickBillOfMaterialsTabOrderDetails();
				expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(serviceListExp[Object.keys(serviceListExp)[i]]);   
				//Click on More link
				ordersPage.clickMoreLinkBom();
				cartListPage.clickExpandQuantity();
				finlValidn = cartListPage.getTotalPriceOfAllInstances();
				ordersPage.closeServiceDetailsSlider();
				promiseArr.push(finlValidn);
			}	
		});		
		
	}).catch(function(err){
		console.log(err);
	});
	
	return Promise.all(promiseArr).then(function(finlValidn) {		
		if(finlValidn.indexOf(false) != -1){
			return Promise.resolve(false);
		}else{			
			return Promise.resolve(true);
		}		
	});
};

orders.prototype.clickViewDetailsBasedOnIndex = function (index){
	var curr = this;	
	var eleToClick = element.all(by.xpath(this.tblViewDetailsXpath)).get(index);
	var lnkViewDetails = element.all(by.buttonText(curr.buttonTextViewDetails)).get(index);
	browser.wait(EC.elementToBeClickable(eleToClick), 60000).then(function () {
		browser.executeScript("arguments[0].scrollIntoView();", eleToClick.getWebElement()).then(function(){
			browser.sleep(5000);
			return eleToClick.click().then(function () {
				logger.info("Clicked on the Actions icon of the first row on Orders page");
				browser.wait(EC.visibilityOf(lnkViewDetails), 30000).then(function(){
					return lnkViewDetails.click().then(function () {
						logger.info("Clicked on View Details link to get Order Details page of service : " + index + 1);
						//Adding hardcoded sleep since it takes time to load order details page.
						browser.sleep(6000);
					});
				});	
				
				util.waitForAngular();
			});
		});
	});
};




orders.prototype.getTextBudgetAmmount = function () {
	var elem = element(by.xpath(this.budgetAmmountXpath));
	browser.wait(EC.visibilityOf(elem), 20000);
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

	return element(by.xpath(this.budgetAmmountXpath)).getText().then(function (text) {
        logger.info("Budget Ammount : " + text);
        return text;
    });
};
orders.prototype.getTextAvailableBudget = function () {
	return element(by.xpath(this.availableBudgetXpath)).getText().then(function (text) {
        logger.info("Available Budget : " + text);
        return text;
    });
};
orders.prototype.getTextBudgetaryCommittedAmmount = function () {
	var elem = element(by.xpath(this.CommittedAmmountXpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

    return element(by.xpath(this.CommittedAmmountXpath)).getText().then(function (text) {
        logger.info("Committed Ammount : " + text);
        return text;
    });
};
orders.prototype.getTextBudgetarySpendAmmount = function () {
	var elem = element(by.xpath(this.spendAmmountXpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

    return element(by.xpath(this.spendAmmountXpath)).getText().then(function (text) {
        logger.info("Spend Ammount : " + text);
        return text;
	});
}
orders.prototype.getTextBudgetaryEstimatedAmmountforOrder = function () {
	var elem = element(by.xpath(this.estimatedAmmountforOrderxpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

	return element(by.xpath(this.estimatedAmmountforOrderxpath)).getText().then(function (text) {
		logger.info("Estimated Ammount of Order : " + text);
		return text;
		});
}
orders.prototype.getTextOtherOrdersAwaitingApproval = function () {
	var elem = element(by.xpath(this.awaitingApprovalOrderAmountxpath));
	browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());

	return element(by.xpath(this.awaitingApprovalOrderAmountxpath)).getText().then(function (text) {
		logger.info("Othe Order Awaiting Approval Amount : " + text);
		return text;
		});
}
//Function to click on Select button from the Confirmation Budgetary Unit Selection pop-up
orders.prototype.clickOnSubmitButtonOfBudget = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.submitButtonBudgetXpath))), 9000);
	return element(by.xpath(this.submitButtonBudgetXpath)).click().then(function () {
		logger.info("Succesfully clicked on Select button");
	});

}


//This function will select the budget from the drop-down ons Approve order page
orders.prototype.selectBudgetaryUnit = function (BudgetName) {
	var ordersPage = new orders();
	var dropdown = element(by.css("[id=\"" + defaultConfig.budgetDropdownCSS + "\"]"));
	browser.executeScript("arguments[0].scrollIntoView();", dropdown.getWebElement()).then(function () {
		// var dropdown = element(by.css("[id=\"" + defaultConfig.budgetDropdownCSS + "\"]"));
		browser.sleep(3000)
		browser.wait(EC.elementToBeClickable(dropdown), 300000).then(function () {
			dropdown.isEnabled().then(function (enabled) {
				if (enabled) {
					//dropdown.click().then(function(){ //*******Added below line of code for click***//
					browser.actions().mouseMove(dropdown).click().perform().then(function () {
						var dropDownValuesArray = element.all(by.xpath("//*[@id='" + defaultConfig.budgetDropdownCSS + "']//carbon-dropdown-option//a"));
						dropDownValuesArray.getText().then(function (textArray) {
							var isDropDownValuePresent = false;
							for (var i = 0; i < textArray.length; i++) {
								if (textArray[i] == BudgetName) {
									dropDownValuesArray.get(i).click().then(function () {
										logger.info("Selected " + BudgetName + " from budget dropdown");

									});
									isDropDownValuePresent = true;
								}
							}
							if (!isDropDownValuePresent) {
								dropDownValuesArray.get(0).getText().then(function (text) {
									dropDownValuesArray.get(0).click().then(function () {
										logger.info("Selected " + text + " from budget dropdown");
									});
								});
							}
						});
					});
				}
			});

		});
	});
	ordersPage.clickOnSubmitButtonOfBudget();

}

orders.prototype.calculateBudgetaryEstimatedAmmountforOrder = function (budgetDuration, totalCost) {
	var cost = parseFloat(("" + totalCost).replace(/[^\d\.]*/g, ''), 2).toFixed(2);
	var amount = cost * budgetDuration;
	amount = amount.toFixed(2);
	var estCost = amount.toString();
	var estCost1 = estCost.slice(0, (estCost.indexOf(".")) + 3);

	//append the currency unit 
	var currencyUnit = ("" + totalCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCostcost = currencyUnit + estCost1;

	logger.info("Calculated estimated amount for this order: " + actualCostcost);
	return actualCostcost;
}

orders.prototype.calculateAvailableBudgetAfterProvCompleted = function (availCost, estCost) {
	var availCost1 = parseFloat(("" + availCost).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = availCost1 - estCost1
	var amountAvail = amount.toString();
	amount = amount.toFixed(2);
	var actualAvailCost = (Number(amountAvail)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualAvailCost;

	logger.info("Calculated Available Budget for this order after provisioning completed: " + actualCost);
	return actualCost;
}

orders.prototype.calculateCommittedAmountAfterProvCompleted = function (committedAmnt, estCost) {

	var committedCost1 = parseFloat(("" + committedAmnt).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);

	var amount = committedCost1 + estCost1
	amount = amount.toFixed(2);
	var amountToCommit = amount.toString();
	var actualCommitCost = (Number(amountToCommit)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualCommitCost;

	logger.info("Calculated Committed Amount for this order after provisioning completed: " + actualCost);
	return actualCost;

}

orders.prototype.calculateEstCostAfterDeleting1MonthOrder = function (estCost, oneMonthCost) {
	var oneMonthCost = parseFloat(("" + oneMonthCost).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = estCost1 - oneMonthCost;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualEstCost = (Number(estAmount)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = "(" + currencyUnit + actualEstCost + ")";

	logger.info("Calculated Estimated Amount for the delete order: " + actualCost);
	return actualCost;

}

orders.prototype.calculateDeleteCommittedAmount = function (committedAmnt, estCost) {
	var commitCost = parseFloat(("" + committedAmnt).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = commitCost - estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualEstCost = (Number(estAmount)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + committedAmnt).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualEstCost;

	logger.info("Calculated Committed Amount after one month order deleted: " + actualCost);
	return actualCost
}

orders.prototype.calculateAfterDeletingAvailBudget = function (availBudget, estCost) {
	var availBudget1 = parseFloat(("" + availBudget).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = availBudget1 + estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualAvailCost = (Number(estAmount)).toFixed(2);

	//append the currency unit 
	var currencyUnit = ("" + availBudget).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualAvailCost;

	logger.info("Calculated Available Budget after deleting the order: " + actualCost);
	return actualCost

}

orders.prototype.calculateAfterProvOtherOrderAwaitingApprovalAmount = function (beforeProvOrderAwaitingApprovalAmount, estCost) {
	var costBeforeProvOrderAwaitingApproval = parseFloat(("" + beforeProvOrderAwaitingApprovalAmount).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = costBeforeProvOrderAwaitingApproval - estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualOrderAwaitingApprovalAmount = (Number(estAmount)).toFixed(2);
	
	//append the currency unit 
	var currencyUnit = ("" + estCost).replace(/\d+([,.]\d+)?/g, '');
	var actualCost = currencyUnit + actualOrderAwaitingApprovalAmount;

	logger.info("Calculated Other Order Awaiting Approval Amount after provision: " + actualCost);
	return actualCost

};
//Function to verify the budget is present on the Approve order page
orders.prototype.checkInvisibilityOfBudgetDetails = function(){
       logger.info("Checking the visibility of budget on approve order page.");
	return element(by.id(this.budgetID)).isPresent();
}
orders.prototype.getEstimatedCost = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderTotalCostXpath))),5000);
	
	return element(by.xpath(this.orderTotalCostXpath)).getText().then(function(text){
		logger.info("Total Cost on Orders Page: " + text);
			return text;
		});
}
module.exports = orders;
