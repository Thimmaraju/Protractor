// This test file is for adding tests for order integration

"use strict";
var logGenerator = require("../../../helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger(),
 	Orders = require('../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../pageObjects/placeOrder.pageObject.js'),
	CatalogDetailsPage = require('../../pageObjects/catalogdetails.pageObject.js'),
	appUrls = require('../../../testData/appUrls.json'),
    util = require('../../../helpers/util.js'),
    orderFlowUtil = require('../../../helpers/orderFlowUtil.js'),
	jsonUtil = require('../../../helpers/jsonUtil.js'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	tier3TraditionalTemplate = require('../../../testData/OrderIntegration/VRA/3tierTraditionalWorkload.json'),
	singleVMCentOSTemplate	= require('../../../testData/OrderIntegration/VRA/singleVMCentOs.json');
	

describe('Order Integration Tests', function() {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage, catalogDetailsPage,serviceName; 
    var modifiedParamMap = {}; 
    

    var messageStrings = {
        category:                   'Compute',
        catalogPageTitle:           'Store',
        inputServiceNameWarning:    "The Service Name must begin with a letter and can contain alphanumeric characters and hyphens after that. The Service Name should not contain any other special characters or spaces.",
        orderSubmittedConfirmationMessage : 'Order Submitted !',
        estimatedPrice : '70',
        providerAccount:'vRA73 / vRA73'
    };


    beforeAll(function() {
        orders = new Orders();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		catalogDetailsPage = new CatalogDetailsPage();
        browser.driver.manage().window().maximize();
        //dashBoard.clickLetsGetStarted(); 
    });

    afterAll(function() {
    	//browser.manage().deleteAllCookies();
    });

    beforeEach(function() {
    	catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl); 
        serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
    
	//Test case to verify selecting Catalog Page is working fine.
    /***** Test case ID in Testrail: C159934 (Annam)******/
	it('Verify Navigating to Catalog Page is working - TC C159934', function() { 
		homePage.clickCatalogLink();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    });
	
	//Test case to verify whether IT Infrastructure listed or not under Category
	/***** Test case ID in Testrail: C159936 (Suman)******/
	it('Verify IT Infrastructure listed under Category - TC  C159936', function() {
		expect(catalogPage.getListofFirstCategories()).toContain(messageStrings.category);
	});
	
	// Test Verify selecting 'Cancel' option is working fine while creating an vRA service order
	/***** Test case ID in Testrail: C159937 (Suman)******/
	it('Verify whether Cancel button is working while creating a service  - TC  C159937',function() {
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	     		 
		expect(placeOrderPage.getTextBluePrintName()).toBe(singleVMCentOSTemplate.descriptiveText);
		placeOrderPage.cancelOrder();		 
		placeOrderPage.clickYesInCancelOrderPopup();
		expect(catalogPage.isPresentCatalogLink()).toBe(true);	 
	});
	
	//Test case to verify selecting 'Next' without providing Service Name gives an error pop-up while creating a vRA service
	 /***** Test case ID in Testrail: C159939 (Annam)******/
	 it('Verify warning message when no service name while creating order - TC C159939 ', function() {
		 catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		placeOrderPage.setServiceNameText(protractor.Key.TAB);
		//placeOrderPage.clickProvider();
		expect(placeOrderPage.getWarningTextByClickingNextWithOurServicename()).toMatch(messageStrings.inputServiceNameWarning);
	 });
	
	 //Test case to Verify close error pop-up is working fine when try to create a vRA service without Service Name.
	 /****** Test case ID in Testrail: C159940 (Annam)******/
	 //depricated test. Needs to be removed.
	/*xit('Verify close warning message when no service name while creating order - TC C159940', function() {
		catalogPage.clickConfigureButtonBasedOnName(vraBluePrints.SingleVMCentOS.bluePrintName);	
		placeOrderPage.clickNextButton();
		util.scrollToTop();
		placeOrderPage.closeParameterWarning();
		expect(placeOrderPage.isPresentcloseParameterWarningMessage()).toBe(false);
	 });*/
	
	
	// Test case to Verify select 'Next' option in Main Parameters page is working fine 
	/****** Test case ID in Testrail: C159944 (Prasanna)******/
	it('Verify whether next button is working for Main Parameters Page - TC C159944 ',function() {
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
		placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
		placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
		placeOrderPage.clickNextButton();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderAdditionalParamtersPageUrl).then(function(text){
			logger.info("Clicked on Next Button and navigated to Next page");
		 });
	 });
	
	// Test case to Verify select 'Previous' option is working fine
	/****** Test case ID in Testrail: C159945 (Prasanna)******/
	it('Verify whether previous button is working fine on Additional Parameters Page - TC C159945 ',function() {
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		placeOrderPage.setServiceNameText("QAAUTOMATION" + util.getRandomString(4));
		placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
		placeOrderPage.clickNextButton();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderAdditionalParamtersPageUrl);
		placeOrderPage.clickPreviousButton();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
	 });
	
	//Verify select 'Next' option in Additional Parameters page is working fine while creating an vRA service order (ex: SingleVMCentOS)
	/****** Test case ID in Testrail: C159951 (Franklin)******/
	it('Verify Select next button option is working fine in Additional Parameters page - TC C159951', function(){
		var singleVMCentOSObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderReviewOrderPageUrl);		
	})

	//TC to Verify 'Submit Order' option is working fine in creating an vRA service order for SingleVMCentOS  
	/****** Test case ID in Testrail: C159955 (Prasanna)******/
	it('Verify Submit Order option is working fine in creating an vRA service order(ex: SingleVMCentOS) - TC C159955 ',function() {
		var singleVMCentOSObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
	});
	
	//TestCase to Verify entering long name in the Service Name filed while creating an order is working fine
	/****** Test case ID in Testrail: C160024 (Deepthi)******/
	it('Verify entering long name in the Service Name filed while creating an order is working fine - TC C160024',function() {
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		placeOrderPage.setServiceNameText("Test"+util.getRandomString(55) + protractor.Key.TAB);
		//placeOrderPage.clickProvider();
		//expect(placeOrderPage.getWarningTextByClickingNextWithOurServicename()).toMatch(messageStrings.inputServiceNameWarning);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
	});

	 //Testcase to Verify giving special character in the Service Name filed while creating an order is working fine
	 /****** Test case ID in Testrail: C160025 (Deepthi)******/
	it('Verify giving special character in the Service Name filed while creating an order is working fine - TC C160025 ',function() {
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		placeOrderPage.setServiceNameText("!@#$%^__+=-&*()'/?><,.;:{}"+util.getRandomString(10) + protractor.Key.TAB);
		//placeOrderPage.clickProvider();
		//placeOrderPage.clickNextButton();
		//expect(util.getCurrentURL()).toMatch(appUrls.placeOrderAdditionalParamtersPageUrl);
		expect(placeOrderPage.getWarningTextByClickingNextWithOurServicename()).toMatch(messageStrings.inputServiceNameWarning);
	});	
	

	 //Test case to verify "cancel" option in Service Details page is working fine
	 /****** Test case ID in Testrail: C160119 (Franklin) ******/
	it('verify "cancel" option in Service Details page is working fine  - TC C160119', function(){
		catalogPage.clickProviderCheckBoxBasedOnName(tier3TraditionalTemplate.provider);
		catalogPage.clickBluePrintBasedOnName(tier3TraditionalTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.serviceDetailsPageUrl);
		catalogDetailsPage.clickCancelButtonCatalogDetailsPage();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
	});

	 // Test case to Verify 'Configure' option in Service Details page is working fine
     /****** Test Case ID in Testrail : C160120 (Franklin) ******/
	it('Verify "Configure" option in Service Details page is working fine - TC C160120', function(){
		catalogPage.clickProviderCheckBoxBasedOnName(tier3TraditionalTemplate.provider);
		catalogPage.clickBluePrintBasedOnName(tier3TraditionalTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.serviceDetailsPageUrl);
		catalogDetailsPage.clickConfigureButtonCatalogDetailsPage();
	   	expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
	 });
	      
	//Test case to verify selecting 'NO' option in 'Order Cancel Confirmation' pop up is working fine when cancel configure was selected
	/****** Test Case ID in Testrail : C160121 (Franklin) ******/	
	 it('Verify selecting "NO" option in "Order Cancel Confirmation" pop up is working fine when cancel configure was selected - TC C160121', function(){
		 catalogPage.clickProviderCheckBoxBasedOnName(tier3TraditionalTemplate.provider);
		 catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		placeOrderPage.cancelOrder();
		placeOrderPage.clickNoInCancelOrderPopup();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
	 });
	 
	 
	 // Test case to verify selecting close(x) option in 'Order Cancel Confirmation' pop up is working fine when cancel configure was selected
	 /****** Test Case ID in Testrail : C160122 (Franklin) ******/ 
	 it('verify selecting close(x) option in "Order Cancel Confirmation" pop up is working fine when cancel configure was selected - TC C160122', function(){
		catalogPage.clickProviderCheckBoxBasedOnName(tier3TraditionalTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		placeOrderPage.cancelOrder();
		placeOrderPage.closeCancelOrderPopup();
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
	 });
		   
	 //TC to Verify Order Submitted confirmation pop-up contains Order Number
	 //****** Test case ID in Testrail: C160128 (Himanshu)******/
	 it('Should Verify Order Number,Order Date, Total price and Submitted by in order confirmation pop-up contains Order Number - TC C160128 , C160129',function() {
		var singleVMCentOSObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		placeOrderPage.submitOrder();
		browser.sleep(5000);
		// Check for TC C160128
		expect(placeOrderPage.getTextOrderNumberOrderSubmittedModal()).not.toBeNull();
	
		// Check for TC C160129 
		var currentDateTime = new Date();
		var year = currentDateTime.getUTCFullYear();
		expect(placeOrderPage.getTextOrderedDateOrderSubmittedModal()).toContain(year);
		expect(placeOrderPage.getTextTotalPriceOrderSubmittedModal()).toContain(messageStrings.estimatedPrice);
	 });

	
	//TC to Verify 'Go to Service Catalog' option in Order Submitted confirmation pop-up is working fine ----Himanshu
	//****** Test case ID in Testrail: C160130  (Himanshu)******/
	it('Verify Order Submitted confirmation pop-up contains Order Number - TC C160130',function() {
		var singleVMCentOSObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate,modifiedParamMap);
		placeOrderPage.submitOrder();
		expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
		placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
	});

		//TC to Verify Reset option is working fine in Catalog page when a Provider check box is selected.
		//****** Test case ID in Testrail: C160131  (Himanshu)******/
	it('Verify Reset option is working fine in Catalog page when a Provider check box is selected  - TC C160131', function() { 	
		catalogPage.clickProviderCheckBoxBasedOnName(singleVMCentOSTemplate.provider);
		expect(catalogPage.isPresentResetLinkCatalog()).toBe(true);
		catalogPage.clickResetLinkCatalog();
		expect(catalogPage.isPresentResetLinkCatalog()).toBe(false);
	});
		
		//TC to Verify Reset option is working fine in Catalog page when a Categorry check box is selected.
		//****** Test case ID in Testrail: C160132  (Himanshu)******/
	it('Verify Reset option is working fine in Catalog page when a Categorry check box is selected - TC C160132', function() { 
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
		expect(catalogPage.isPresentResetLinkCatalog()).toBe(true);
		catalogPage.clickResetLinkCatalog();
		expect(catalogPage.isPresentResetLinkCatalog()).toBe(false);
	});
});