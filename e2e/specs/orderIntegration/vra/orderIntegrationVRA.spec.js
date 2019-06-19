"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    util = require('../../../../helpers/util.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
	tier3TraditionalTemplate = require('../../../../testData/OrderIntegration/VRA/3tierTraditionalWorkload.json'),
	singleVMCentOSTemplate	= require('../../../../testData/OrderIntegration/VRA/singleVMCentOs.json'),
	xaasVTSTemplate	= require('../../../../testData/OrderIntegration/VRA/VTSXaasBlueprint.json');

describe('Order Integration Tests for VRA -- CentOS and 3 tier', function() {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage, catalogDetailsPage,inventoryPage, serviceName; 
    var modifiedParamMap = {};
    var messageStrings = {
            providerName:               'VRA',
			category:                   'Compute',
			estimatedPrice : 'USD 30.00/ SIZE / MONTH + USD 10.00'  ,
			estimatedCost : 'USD 30.00 ONE TIME CHARGE + USD 40.0000976 / MONTH'
     };

    beforeAll(function() {
        orders = new Orders();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
		catalogDetailsPage = new CatalogDetailsPage();
		inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function() {
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    	serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
    
	//Test case to verify whether vRA provider is listed or not in Catalog page
	/***** Test case ID in Testrail: C159935 (Annam)******/
	it('Should verify vRA provider is listed in Catalog page - TC  C159935', function() {
		catalogPage.getListofProviders().then(function(text){
			expect(text.toString().toLowerCase()).toContain(messageStrings.providerName.toLowerCase());
		});
		
	})
	
	//Verify entering Service Name in text field provided in the Main Parameters page of the configure of a vRA service 
	/***** Test case ID in Testrail: C159938 (Franklin)******/
	it('TC C159938 : Should verify the correct service name is getting displayed',function(){
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
		});
	});
	
	//Verify correct Provider name that is (VRA) is displayed in the Main Parameters page of the configure of a vRA service
	/****** Test case ID in Testrail: C159941 (Franklin)******/
	it('Should verify correct provider name is getting displayed - TC C159941', function(){
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		//expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
	});
	
	//Test case to Verify correct Category name is displayed in the Main Parameters page of the configure of a vRA service
	/****** Test case ID in Testrail: C159942 (Himanshu)******/
	it('Should verify correct Category name is displayed in the Main Parameters page - TC C159942',function(){
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		//expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);		
	});
	
	//Test case to Verify correct Estimated Price is displayed in the Main Parameters page of the configure of a vRA service
	/****** Test case ID in Testrail: C159943 (Himanshu)******/
	it('Verify correct Estimated Price  is displayed in the Main Parameters page - TC C159943',function(){
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		expect(util.getCurrentURL()).toMatch(appUrls.placeOrderUrl);
		expect(placeOrderPage.getTextEstimatedPrice()).toBe(messageStrings.estimatedPrice);
	 });
	
	//Test case to Verify Service name is displayed in the Review Order page 
	/****** Test case ID in Testrail: C159952 (Himanshu)******/
	it('Verify Service name is displayed in the Review Order page - TC C159951', function(){
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
		});
	 });
	
	//Test case to Verify Service Details are listed in Review Order page
	/****** Test case ID in Testrail: C159953 (Himanshu)******/
	it('Verify Service Details are listed in Review Order page - TC C159953', function(){
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
			expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName)
		});	
		//expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);	
		/*placeOrderPage.getTextProviderName_ReviewOrder().then(function(text){
			expect(text.toString().toLowerCase()).toBe(messageStrings.providerName.toLowerCase());	
		});*/
		expect(placeOrderPage.getEstimatedCost_ReviewOrder()).toBe(messageStrings.estimatedCost);	
	});
	
	// TC to Verify that Additional Details are listed in Review Order page
	/****** Test case ID in Testrail: C159954 (Prasanna)******/
	it('Verify that Additional Details are listed in Review Order page - TC C159954 ',function() {
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);	 	   
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["CPUs"]).toEqual(requiredReturnMap["Expected"]["CPUs"]);
			expect(requiredReturnMap["Actual"]["Image"]).toEqual(requiredReturnMap["Expected"]["Image"]);
			expect(requiredReturnMap["Actual"]["Memory (MB)"]).toEqual(requiredReturnMap["Expected"]["Memory (MB)"]);
			expect(requiredReturnMap["Actual"]["Size"]).toEqual(requiredReturnMap["Expected"]["Size"]);
			expect(requiredReturnMap["Actual"]["Storage (GB)"]).toEqual(requiredReturnMap["Expected"]["Storage (GB)"]);
		});
	});
	
	//Test case to Verify setting CPU value other than default in Additional parameters of the configure vRA SingleVMCentOS service --Disabled due to inconsistent behaviour of defualt params
 	/***** Test case ID in Testrail: C159947 (Annam)******/
 	it('Verify setting CPU value other than default in Additional parameters of SingleVMCentOS - TC C159947', function() {
 		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		var cpuMap = {"CPUs":"2"};
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["CPUs"]).toEqual(requiredReturnMap["Expected"]["CPUs"]);
		});		
 	});
 	
 	//Test case to Verify setting Memory value other than default in Additional parameters of the configure vRA SingleVMCentOS service
	/***** Test case ID in Testrail: C159949 (Suman)******/
	it('Verify setting Memory value other than default in Additional parameters of SingleVMCentOS - TC C159949', function() {
 		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		var memoryMap = {"Service Instance Name":serviceName, "MEMORY":"1024"};
		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, memoryMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Memory (MB)"]).toEqual(requiredReturnMap["Expected"]["Memory (MB)"]);
		});
	});    
	 
	//Test case to verify SingleVMCentOS Service's blue print name is listed in Main parameters pages while configure
	/****** Test case ID in Testrail: C160026 (Suman)******/
	it('Verify SingleVMCentOS Services blue print name is listed in Main parameters pages - TC C160026',function() {
		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		expect(placeOrderPage.getTextBluePrintName()).toBe(singleVMCentOSTemplate.descriptiveText);		 	 
	});	
	
	 //Test case to Verify Configure button is woring fine while creating an order (ex: 3 Tier service).  Will enable after 3 tier is added
	 /****** Test case ID in Testrail: C160027 (Annam)******/
	 it('Verify configure button for 3 Tier vRa service - TC C160027', function() {
		 expect(catalogPage.isDisplayedConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName)).toBe(true);
		 catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		 expect(placeOrderPage.getTextBluePrintName()).toBe(singleVMCentOSTemplate.descriptiveText);	
	 });

	 //Test case to verify 3 Tier Service's blue print name is listed in Additional parameters pages while configure
	 /****** Test case ID in Testrail: C160028 (Suman)******/
	it('Verify 3 Tier Services blue print name is listed in Additional parameters pages - TC C160028',function(){
		 catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
		 placeOrderPage.setServiceNameText("Test"+util.getRandomString(4));
		 placeOrderPage.selectProviderAccount(messageStrings.providerAccount);
		 placeOrderPage.clickNextButton();
		 expect(util.getCurrentURL()).toMatch(appUrls.placeOrderAdditionalParamtersPageUrl);
		 expect(placeOrderPage.getTextBluePrintName()).toBe(singleVMCentOSTemplate.descriptiveText);
	 });
	 
	//Test case to verify clicking on any catalog item opens the details page of that service.
    /****** Test case ID in Testrail: C160116 (Franklin)******/
    it('Verify clicking on any catalog item opens the details page of that service - TC C160116', function(){
        catalogPage.clickBluePrintBasedOnName(singleVMCentOSTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.serviceDetailsPageUrl);
    });
    
    //Test case to verify Service Details page contains the Features, Details, and Know More links of that Service
    /****** Test cased ID in Testrail: C160117 (Franklin)******/
    it('Verify Service Details page contains the Features, Details, and Know More links of that Service - TC C160117',function(){
        catalogPage.clickBluePrintBasedOnName(singleVMCentOSTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.serviceDetailsPageUrl);
        expect(catalogDetailsPage.isPresentFeaturesLabel()).toBe(true);
        expect(catalogDetailsPage.isPresentDetailsLabel()).toBe(true);
        expect(catalogDetailsPage.isPresentKnowMoreLabel()).toBe(true);
        expect(catalogDetailsPage.isPresentLinkToProviderSite()).toBe(true);
    });
    
    //Test case to Verify selecting  App server CPU=2, Memory=1024 and Storage=5 is working fine for vRA 3 Tier
	/***** Test case ID in Testrail:C160123 (Suman)******/
	it('Verify Verify selecting  App server CPU=2, Memory=1024 and Storage=5 is working fine for vRA 3 Tier - TC C160123', function() {
		var centOsObject = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
		catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
		var appserverMap = {"Service Instance Name":serviceName, "App CPU":"2","App Memory (MB)":"1024","App Storage (GB)":"5"};
		orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate, appserverMap).then(function(requiredReturnMap){
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("CPUs")).toContain(appserverMap["App CPU"]);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Memory (MB)")).toContain(appserverMap["App Memory (MB)"]);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Storage (GB)")).toContain(appserverMap["App Storage (GB)"]);
		});
   });    
 
   //Test case to Verify selecting  DB server CPU=2, Memory=1024 and Storage=5 is working fine for vRA 3 Tier 
	/***** Test case ID in Testrail: C160124 (Suman)******/
	it('Verify selecting  DB server CPU=2, Memory=1024 and Storage=5 is working fine for vRA 3 Tier - TC C160124', function() {
		var centOsObject = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
		catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
		var dbserverMap = {"Service Instance Name":serviceName, "Db CPU":"2","Db Memory (MB)":"1024","Db Storage (GB)":"5"};
		orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate,dbserverMap).then(function(requiredReturnMap){
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("CPUs")).toContain(dbserverMap["Db CPU"]);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Memory (MB)")).toContain(dbserverMap["Db Memory (MB)"]);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Storage (GB)")).toContain(dbserverMap["Db Storage (GB)"]);
		});
   });
   
   //Test case to Verify selecting  Web server CPU=2, Memory=1024 and Storage=5 is working fine for vRA 3 Tier 
	/***** Test case ID in Testrail: C160125 (Suman)******/
	it('Verify selecting  Web server CPU=2, Memory=1024 and Storage=5 is working fine for vRA 3 Tier - TC C160125', function() {
		var centOsObject = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
		catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
		var webserverMap = {"Service Instance Name":serviceName, "Web CPU":"2","Web Memory (MB)":"1024","Web Storage (GB)":"5"};
		orderFlowUtil.fillOrderDetails(tier3TraditionalTemplate,webserverMap).then(function(requiredReturnMap){
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("CPUs")).toContain(webserverMap["Web CPU"]);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Memory (MB)")).toContain(webserverMap["Web Memory (MB)"]);
			expect(placeOrderPage.getTextAdditonalDetails_ReviewOrder("Storage (GB)")).toContain(webserverMap["Web Storage (GB)"]);
		});
   });
	
	//Test case to Verify default value for CPU is 1 in Additional parameters of the configure vRA CentOS service 
	/***** Test case ID in Testrail: C159946 (Deepthi)******/
	it('Verify default value for CPU is 1 in Additional parameters of the configure vRA CentOS service - TC C159946', function() {
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
 		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
 		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
 			expect(requiredReturnMap["Actual"]["CPU"]).toEqual(requiredReturnMap["Expected"]["CPU"]);
 		});
   });

   //Test case to Verify default value for CPU is 1 in Additional parameters of the configure vRA CentOS service 
	/***** Test case ID in Testrail: C159946 (Deepthi)******/
	it('Verify default value for Memory is 512 MB in Additional parameters of the configure vRA CentOS service - TC C159946', function() {
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
 		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
 		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
 			expect(requiredReturnMap["Actual"]["MEMORY"]).toEqual(requiredReturnMap["Expected"]["MEMORY"]);
 		});
   });

    //Test case to Verify default value for CPU is 1 in Additional parameters of the configure vRA CentOS service 
	/***** Test case ID in Testrail: C159946 (Deepthi)******/
	it('Verify default value for Storage is 8 GB in Additional parameters of the configure vRA CentOS service - TC C159946', function() {
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
 		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
 		orderFlowUtil.fillOrderDetails(singleVMCentOSTemplate, modifiedParamMap).then(function(requiredReturnMap){
 			expect(requiredReturnMap["Actual"]["STORAGE"]).toEqual(requiredReturnMap["Expected"]["STORAGE"]);
 		});
   });
   
   //Test case to Verify navigating to Services page is working fine
   /***** Test case ID in Testrail: C160151 (Deepthi)******/
   it('Verify navigating to Services page is working fine - TC C160151', function() {
		inventoryPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.inventoryPageUrl);
   });

   //Test case to Verify navigating to Services page is working fine
   it('CON-4161 --- Additional parameter fields are not showing during placing a vRA Order (1/5 Consume Release)',function(){
		var centOsObject = JSON.parse(JSON.stringify(singleVMCentOSTemplate));
		var xaasBluePrintObject = JSON.parse(JSON.stringify(xaasVTSTemplate));
		var tier3Object = JSON.parse(JSON.stringify(tier3TraditionalTemplate));
 		catalogPage.clickConfigureButtonBasedOnName(singleVMCentOSTemplate.bluePrintName);
 		orderFlowUtil.fillPartialOrderDetails(singleVMCentOSTemplate,"Main Parameters");
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("CPUs")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Memory (MB)")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Storage (GB)")).toBe(true);

		catalogPage.open();
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		catalogPage.clickConfigureButtonBasedOnName(tier3TraditionalTemplate.bluePrintName);
 		orderFlowUtil.fillPartialOrderDetails(tier3TraditionalTemplate,"Main Parameters");
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("CPU")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Memory (MB)")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Storage (GB)")).toBe(true);
		
		catalogPage.open();
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		catalogPage.clickConfigureButtonBasedOnName(xaasVTSTemplate.bluePrintName);
 		orderFlowUtil.fillPartialOrderDetails(xaasVTSTemplate,"Main Parameters");
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Application Code")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Cloud Request ID")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Commitment Item")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Cost Center")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Customer")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Data Center")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("DNS")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Network Zone")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("OS Primary Storage Size (GiB)")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Patch Day")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Patch Window")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("RAM (GiB)")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("Template")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("VM Environment")).toBe(true);
 		expect(placeOrderPage.isAttributePresentInAdditionalParametersPage("VCPU")).toBe(true);		
   });

   //Test case to Verify navigating to Services page is working fine
   it('CON-3418 --- GUI does not use multselect fields',function(){
	    var xaasBluePrintObject = JSON.parse(JSON.stringify(xaasVTSTemplate));
		catalogPage.clickConfigureButtonBasedOnName(xaasVTSTemplate.bluePrintName);
		orderFlowUtil.fillOrderDetails(xaasVTSTemplate, modifiedParamMap);
		expect(placeOrderPage.getTextBasedOnLabelName("Customer")).toContain(jsonUtil.getValue(xaasBluePrintObject,"Customer"));
	});
});
