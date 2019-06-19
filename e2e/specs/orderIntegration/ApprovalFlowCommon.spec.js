// This test file is for adding tests for order integration

"use strict";

var OrdersPage = require('../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../helpers/util.js'),
    orderFlowUtil = require('../../../helpers/orderFlowUtil.js'),
    jsonUtil = require('../../../helpers/jsonUtil.js'),
    appUrls = require('../../../testData/appUrls.json'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	tier3TraditionalTemplate = require('../../../testData/OrderIntegration/VRA/3tierTraditionalWorkload.json'),
	singleVMCentOSTemplate	= require('../../../testData/OrderIntegration/VRA/singleVMCentOs.json');

describe('Order Approval Flow Common', function() {
    var ordersPage, homePage, dashBoard, catalogPage, placeOrderPage,orderID,sampleOrder1,expectedTotalPrice,expectedPlacedBy,serviceName;
    var modifiedParamMap = {};

    beforeAll(function() {
        ordersPage = new OrdersPage();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
        browser.driver.manage().window().maximize();
        //ensureConsumeHome();
        //dashBoard.clickLetsGetStarted(); 
    });

    afterAll(function() {
    
    });

    beforeEach(function() {
        ordersPage.open();
        expect(util.getCurrentURL()).toMatch('orders'); 
        serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
    
    // Test case to Verify on selecting View Details link of an order shows the View order details page
	 /****** Test case ID in Testrail: C160138 (Prasanna)******/
    it('Verify on selecting View Details link of an order shows the View order details page',function(){
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName("VRA");
    	var centOSObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 
    	orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
		sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		expectedTotalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
		expectedPlacedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
		ordersPage.open();
		ordersPage.searchOrderById(sampleOrder1);
	    ordersPage.clickFirstViewDetailsOrdersTable();
		expect(ordersPage.getTextViewOrderDetailsTitle()).toMatch('SERVICE DETAILS');
    });
    
	//TestCase to Navigate to Orders Page
    /****** Test case ID in Testrail: C160133 (Deepthi)******/
    it('Verify Navigating to orders page is working fine -- C160133',function(){
    	ordersPage.open();
    	homePage.clickOnApproveOrdersLink();
    	expect(util.getCurrentURL()).toMatch('orders');
    }); 
    
    //TestCase to verify Order is listing in Orders page once it is submitted from catalog page
    /****** Test case ID in Testrail: C160134 (Deepthi)******/
    it('Verify Ordr is listing in Orders page once it is submitted from catalog page -- C160134',function() {
    	orderID = sampleOrder1;
        ordersPage.searchOrderById(orderID);											  
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toMatch(orderID);
    });

    
    //TestCase to verify Clicking on Actions option in Orders table it shows 'View Details' link
    /****** Test case ID in Testrail: C160137 (Deepthi)******/
    it("Verify Clicking on Actions option in Orders table it shows 'View Details' link -- C160137",function(){
        orderID = sampleOrder1;
        ordersPage.searchOrderById(orderID);
        expect(ordersPage.isDisplayedViewDetailsUnderActionsButton()).toBe(true);
     });
    
    // Test case to verify View order details page contains Approve button if the order is not approved yet
    /****** Test case ID in Testrail: C160139 (Prasanna)******/
    it('Verify View order details page contains Approve button if the order is not approved yet',function(){
    	orderID = sampleOrder1;
	    ordersPage.searchOrderById(orderID);
	    ordersPage.clickFirstViewDetailsOrdersTable();
	    expect(ordersPage.getTextViewOrderDetailsTitle()).toMatch('SERVICE DETAILS');
	    expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toBe(true);
    });
    
    // Test case to verify on selecting Approve button in Order Details page it opens the Order Approval Flow window
    /****** Test case ID in Testrail: C160141 (Prasanna)******/
    it('Verify on selecting Approve button in Order Details page it opens the Order Approval Flow window',function(){
    	orderID = sampleOrder1;
    	ordersPage.searchOrderById(orderID);
	    ordersPage.clickApproveButtonOrderDetails();
		expect(ordersPage.getTextOrderApprovalModalTitle()).toMatch('Order Approval');
	}); 
    
    //TestCase to verify the Status of the order is 'Approval In Progress' before approved
    /****** Test case ID in Testrail: C160135 (Deepthi)******/
    it('Verify the Status of the order is "Approval In Progress" before approved -- C160135',function(){
        orderID = sampleOrder1;
        //ordersPage.searchOrderById(orderID);
        var orderObject = {"orderNumber":orderID};
        orderFlowUtil.waitForOrderStatusChange(orderObject,'Approval In Progress');
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Approval In Progress');
     });
    
    // Test case to verify selecting the 'Approve' option in Order Approval Flow window without checking any approval type give error message
    /****** Test case ID in Testrail: C160142 (Prasanna)******/
    //Disabled this testcase because approve button is disabled in this case as part of the new UI changes
    /*it('Verify selecting the Approve option in Order Approval Flow window without checking any approval type give error message',function(){
    	orderID = '5MT0ERZS';
    	//orderID = sampleOrder1;
        ordersPage.searchOrderById(orderID);
	    ordersPage.clickFirstViewDetailsOrdersTable();
	    ordersPage.clickApproveButtonOrderDetails();
	    expect(ordersPage.getTextOrderApprovalModalTitle()).toMatch('Order Approval');
	    ordersPage.clickApproveButtonOrderApprovalModal();
	    expect(ordersPage.getErrorMessageOrderApprovalModal()).toMatch('Please select approval type!');
    });*/
    
    // Test case to Verify Close(X) option in Order Approval Flow window is working fine
	 /****** Test case ID in Testrail: C160144 (Suman)******/
    it('Verify Close(X) option in Order Approval Flow window is working fine',function(){
    	orderID = sampleOrder1;
    	ordersPage.searchOrderById(orderID);
       	ordersPage.clickApproveButtonOrderDetails();
       	expect(ordersPage.getTextOrderApprovalModalTitle()).toMatch('Approval');
       	ordersPage.clickCloseXOrderApprovalModal();
       	expect(ordersPage.isPresentApproveButtonOrderDetails()).toBe(true);
    });
    
    // Test case to Verify Cancel option in Order Approval Flow window is working fine
	 /****** Test case ID in Testrail: C160143 (Suman)******/
    /*it('Verify Cancel option in Order Approval Flow window is working fine',function(){
         orderID = sampleOrder1;
         ordersPage.searchOrderById(orderID);
         ordersPage.clickApproveButtonOrderDetails();
         expect(ordersPage.getTextOrderApprovalModalTitle()).toMatch('Approval');
         ordersPage.clickCancelButtonOrderApprovalModal();
         expect(ordersPage.getTextViewOrderDetailsTitle()).toMatch('order details');
   }); */
    
    //Test case to Verify 'Approval was processed' confirmation window shown up and can be closed once the order is completely approved
    /***** Test case ID in Testrail: C160148 (Annam)******/
    it('Verify Approval was processed confirmation window shown up and can be closed - TC C160148 & C160147', function() { 
    	orderID = sampleOrder1;
        var confirmation = 'Approval Processed';
        ordersPage.searchOrderById(orderID);
        ordersPage.clickApproveButtonOrderDetails();
        ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
        ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
        ordersPage.clickApproveButtonOrderApprovalModal();
        expect(ordersPage.getTextOrderSuccessOrderApprovalModal()).toMatch(confirmation);
        ordersPage.clickCloseXOrderApprovalModal();
    });

    //Test case to Verify the status of the order is 'Provisioning in Progress ' after the order is completely (Tech and Fin) approved.
    /***** Test case ID in Testrail: C160149 (Annam)******/
    it('Verify the status of the order is "Provisioning in Progress / Completed" after the order is completely approved - TC C160149 ', function() { 
    	orderID = sampleOrder1;
        var orderObject = {"orderNumber":orderID};
        orderFlowUtil.waitForOrderStatusChange(orderObject,'Completed');
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toMatch('Completed');
    });
     
    //Test case to Verify Click on Deny button should show Deny Technical/Financial Approval message
    /***** Test case ID in Testrail: C164620 (Deepthi)******/
    it('Verify Click on Deny button should show Deny Technical/Financial Approval message TC C164620 ', function() { 
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName("VRA");
    	var centOSObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 
    	orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		placeOrderPage.submitOrder();
		sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		expectedTotalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
		expectedPlacedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal()
		ordersPage.open();
        ordersPage.searchOrderById(sampleOrder1);
        ordersPage.clickDenyButtonOrderDetails();
        expect(ordersPage.getTextOrderDenyModalTitle()).toMatch("Order Denial Flow");
    });
    
    //Test case to Verify Denying approval in progress status should to Rejected C164625
    /***** Test case ID in Testrail: C164625 (Deepthi)******/
    it('Verify Denying approval in progress status should to Rejected TC C164625 ', function() { 
    	var orderStatus = "Rejected";
        ordersPage.searchOrderById(sampleOrder1);
        ordersPage.clickDenyButtonOrderDetails();
        ordersPage.clickTechnicalApprovalCheckBoxOrderDenyModal();
        ordersPage.clickFinancialApprovalCheckBoxOrderDenyModal();
        ordersPage.setTextCommentsTextareaOrderDenyModal("QA Automation");
        ordersPage.clickOkInOrderDenyModal();
        ordersPage.clickOkDenialWasProcessed();
        var orderObject = {"orderNumber":sampleOrder1};
        orderFlowUtil.waitForOrderStatusChange(orderObject,'Rejected');
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual(orderStatus);
    });
    
    /*****Author: Santosh Hadawale*****/
    it('Verify orders table contains Created Date, Updated Date, Placed by and Price details of the Order:C160136',function(){
    	ordersPage.clickAllOrdersUnderOrdersSection();
    	ordersPage.searchOrderById(sampleOrder1);
    	var actualCreatedDate = ordersPage.getTextFirstCreatedDateOrdersTable();
    	//var actualUpdatedDate = ordersPage.getTextFirstUpdatedDateOrdersTable();
    	var actualPlacedBy = ordersPage.getTextFirstPlacedByOrdersTable();
    	var actualPrice = ordersPage.getTextFirstAmountOrdersTable();
    	var expectedCreatedDate = util.getCurrentDateTimeUTCFormat();
    	var expectedUpdatedDate = util.getCurrentDateTimeUTCFormat();
    	expect(actualCreatedDate).toContain(expectedCreatedDate);
    	var expectedPrice = 'USD 40.0001 /Month + USD 30.00 one time charges apply';
    	expect(actualPrice).toEqual(expectedPrice);
    });   
	//Test case to Verify selecting only Technical Approval in Order Approval Flow window and Approve it is working fine
    /***** Test case ID in Testrail: C160145 (Deepthi)******/
    it('Verify selecting only Technical Approval in Order Approval Flow window and Approve it is working fine - TC C160145', function() { 
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName("VRA");
    	var centOSObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 
    	orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		placeOrderPage.submitOrder();
		sampleOrder1 = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
		expectedTotalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        orderID = sampleOrder1;
        var approvalMessage = 'Approval Processed';
        ordersPage.open();
        ordersPage.searchOrderById(orderID);
       // ordersPage.clickFirstViewDetailsOrdersTable();
        ordersPage.clickApproveButtonOrderDetails();
        ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
        ordersPage.clickApproveButtonOrderApprovalModal();
        expect(ordersPage.getTextOrderSuccessOrderApprovalModal()).toMatch(approvalMessage);
        ordersPage.clickCloseXOrderApprovalModal();
     });
 
    //Test case to Verify selecting only Financial Approval in Order Approval Flow window and Approve it is working fine
    /***** Test case ID in Testrail: C160145 (Deepthi)******/
    it('Verify selecting only Financial Approval in Order Approval Flow window and Approve it is working fine - TC C160146', function() { 
        orderID = sampleOrder1;
        var approvalMessage = 'Approval Processed';
        ordersPage.searchOrderById(orderID);
        ordersPage.clickApproveButtonOrderDetails();
        ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
        ordersPage.clickApproveButtonOrderApprovalModal();
        expect(ordersPage.getTextOrderSuccessOrderApprovalModal()).toMatch(approvalMessage);
        ordersPage.clickCloseXOrderApprovalModal();
     });

     //Test case to Verify View order details page will not contains Approve button if the order is already approved.
    /***** Test case ID in Testrail: C160140 (Deepthi)******/
    it('Verify View order details page will not contains Approve button if the order is already approved - TC C160140 ', function() { 
        orderID = sampleOrder1;
        ordersPage.searchOrderById(orderID);
        expect(ordersPage.isPresentApproveButtonOrderDetails()).toBe(false);
    });																														
});