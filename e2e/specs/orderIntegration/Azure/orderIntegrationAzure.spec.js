// This test file is for adding tests for order integration

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	jsonUtil = require('../../../../helpers/jsonUtil.js'),
	testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" :"QA 4",
    //virtualNetworkTemplateYes = require('../../../../testData/OrderIntegration/Azure/VirtualNetwork.json'),
	virtualNetworkTemplate = require('../../../../testData/OrderIntegration/Azure/VirtualNetwork.json'),
	vmRedHatTemplate = require('../../../../testData/OrderIntegration/Azure/newLinuxVMNewResourceGroup.json');

describe('Order Integration Tests for Azure', function() {
    var ordersPage, homePage, dashBoard, catalogPage, placeOrderPage, catalogDetailsPage,serviceName;
	var resourceGroupName = "RGTestAuto" + util.getRandomNumber(4);
	var modifiedParamMap = {};

    var messageStrings = {
            providerName:               'Azure',
            category:                   'Compute',
            orderSubmittedConfirmationMessage : 'Order Submitted !',
			estimatedPrice : 'USD 0.00 ONE TIME CHARGE + USD 0.00 / MONTH',			  
     };

    beforeAll(function() {
        ordersPage = new Orders();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        catalogDetailsPage = new CatalogDetailsPage();
        browser.driver.manage().window().maximize();
        //ensureConsumeHomeWithRoles("admin");
       // ensureConsumeHome();
	   // dashBoard.clickLetsGetStarted();   
    });

    afterAll(function() {
    	
    });

    beforeEach(function() {
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
    	catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
    	serviceName = "TestAutomation"+util.getRandomString(5);
		modifiedParamMap = {"Service Instance Name":serviceName};
    });
	
	//Test case to Verify selecting "New resource group required" as "Yes" and creating new resource group is working for Virtual Network  - TC C167519
    /***** Test case ID in Testrail: C167519 (Deepthi)******/
    it('Verify selecting "New resource group required" as "Yes" and creating new resource group is working for Virtual Network  - TC C167519 ', function() {
    	var orderObject = {};
    	catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
    	catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
    	orderObject.servicename = orderFlowUtil.fillOrderDetails(virtualNetworkTemplate,resourceGroupMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    	placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		orderFlowUtil.approveOrder(orderObject);
	});
  
    //Test case to Verify correct Estimated Price is displayed in the Main Parameters page to configure Azure service(Ex: Virtual Machine
	/****** Test case ID in Testrail: C167517 (Suman)******/
	it('Verify correct Estimated Price is displayed in the Main Parameters page to configure Azure service - TC C167517',function(){
		catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
        expect(placeOrderPage.getTextEstimatedPrice()).toContain(virtualNetworkTemplate.EstimatedPrice);
	 });

	//Test case to Verify Azure provider is listed in catalog page 
	 /*******Test Case ID in Testrials: C167021 (Franklin)*****/
	 it('Verify Azure provider is listed in catalog page  - TC C167021', function(){
		    expect(catalogPage.getListofProviders()).toContain(messageStrings.providerName);
	 });
	 
	 // Test case to Verify entering Service Name in text field provided in the Main Parameters page to configure Azure service(Ex : Virtual Network)
	 /*****Test case ID in Testrail: C167024 (Franklin)*****/
	 it('Verify entering Service Name in text field provided in the Main Parameters page to configure Azure service(Ex : Virtual Network) - C167024 (Franklin)',function (){
		 catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		 catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		 expect(util.getCurrentURL()).toMatch('place-order');
		 //orderFlowUtil.fillPartialOrderDetails(virtualNetworkTemplate,"Main Parameters");
		 //expect(util.getCurrentURL()).toMatch('additional-parameters');
		    
	});
	 
	//Test case to Verify correct Provider name (Azure) is displayed in the Main Parameters page to configure Azure service(Ex :Virtual Network)
    /***** Test case ID in Testrail: C167027 (Franklin)*****/
	// it('Verify correct Provider name (Azure) is displayed in the Main Parameters page to configure Azure service(Ex :Virtual Network) - C167027 (Franklin)', function(){
	// 	catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
	// 	var vm_azure = virtualNetworkTemplate.bluePrintName;
	//     var provider = virtualNetworkTemplate.provider;
	//     catalogPage.clickConfigureButtonBasedOnName(vm_azure);
	//     expect(util.getCurrentURL()).toMatch('place-order');
    //     placeOrderPage.getTextProvider(provider);     

	// });
	
	//Test case to Verify Configure button is working fine while creating an order (Ex: Virtual Network) 
	/***** Test case ID in Testrail : C167044 (Franklin)*****/
	it('Verify Configure button is working fine while creating an order (Ex: Virtual Network) - C167044 (Franklin)', function(){
		catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		var vm_azure = virtualNetworkTemplate.bluePrintName;
		var provider = virtualNetworkTemplate.provider;
		catalogPage.clickConfigureButtonBasedOnName(vm_azure);
		expect(util.getCurrentURL()).toMatch('place-order');
		    
	 });
	  
	 //Test case to Verify clicking on any catalog item opens the details page of that service
	 /***** Test case ID in Testrail: C167045 (Franklin)*****/
	 it('Verify clicking on any catalog item opens the details page of that service - C167045 (Franklin)', function(){
		 catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		 var vm_azure = virtualNetworkTemplate.bluePrintName;
		 catalogPage.clickBluePrintBasedOnName(vm_azure);
		 expect(util.getCurrentURL()).toMatch('service-details');
	 });
	   
	 //Test case to Verify Service Details page contains the Features, Details, and Know More links of that Service
     /***** Test case ID in Testrail: C167046 (Franklin) *****/
	 it('Verify Service Details page contains the Features, Details, and Know More links of that Service -C167046 (Franklin)', function(){
		 catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		 var vm_azure = virtualNetworkTemplate.bluePrintName;
		 catalogPage.clickBluePrintBasedOnName(vm_azure);
		 expect(util.getCurrentURL()).toMatch('service-details');
		 expect(catalogDetailsPage.isPresentFeaturesLabel()).toBe(true);
		 expect(catalogDetailsPage.isPresentDetailsLabel()).toBe(true);
		 expect(catalogDetailsPage.isPresentKnowMoreLabel()).toBe(true);
		 expect(catalogDetailsPage.isPresentLinkToProviderSite()).toBe(true); 
	 });

	 //Test case to Verify default value for 'Address Prefix' value as 10.0.0.0/24 in Additional Parameters page to configure Virtual Machine.
	 /***** Test case ID in Testrail: C167548 (Deepthi)******/
	 it('Verify default value for "Address Prefix" value as 10.0.0.0/24 in Additional Parameters page to configure Virtual Machine - TC C167548 ', function() {
		  var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		  //console.log(azureLinuxVMObject);
		  browser.sleep(5000);
		  catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		  var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		  orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
	    	expect(requiredReturnMap["Actual"]["Address Prefix"]).toEqual(requiredReturnMap["Expected"]["Address Prefix"]);
		});  
	  }); 
	
	  //Test case to Verify default value for ' Subnet Prefix' value as 10.0.0.0/24 in Additional Parameters page to configure Virtual Machine
	  /***** Test case ID in Testrail: C167549 (Deepthi)******/
	  it('Verify default value for "Subnet Prefix" value as 10.0.0.0/24 in Additional Parameters page to configure Virtual Machine - TC C167549 ', function() {
		  var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		  catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		  var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		  orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			  expect(requiredReturnMap["Actual"]["Subnet Prefix"]).toEqual(requiredReturnMap["Expected"]["Subnet Prefix"]);
		  });  
	   }); 
	
	   //Test case to Verify entering 'Subnet Name' in text field provided in Additional Parameters page to configure Virtual Machine
	   /***** Test case ID in Testrail: C167550 (Deepthi)******/
	   it('Verify entering "Subnet Name" in text field provided in Additional Parameters page to configure Virtual Machine - TC C167550 ', function() {
		   var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		   catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		   orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Subnet Name"]).toEqual(requiredReturnMap["Expected"]["Subnet Name"]);
		   });  
	   });
	
	   //Test case to Verify entering "Public Ip Address Name" in text field provided in Additional Parameters page to configure Virtual Machine
	   /***** Test case ID in Testrail: C167551 (Deepthi)******/
	   it('Verify entering "Public Ip Address Name" in text field provided in Additional Parameters page to configure Virtual Machine - TC C167551 ', function() {
		   var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		   catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		   orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Public Ip Address Name"]).toEqual(requiredReturnMap["Expected"]["Public Ip Address Name"]);
		   });  
	   });
	
	   //Test case to Verify entering 'Name' of the Virtual Network in text field in Additional Parameters page to configure Virtual Network
	   /***** Test case ID in Testrail: C167521 (Suman)******/
	   it('Verify entering Name of the Virtual Network in Name text field in Additional Parameters page to configure Virtual Network - TC C167521 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Virtual Network Name"]).toEqual(requiredReturnMap["Expected"]["Virtual Network Name"]);
		   });
	   });
	
	   //Test case to Verify entering 'Subnet name' in text field provided in Additional Parameters page to configure Virtual Network
	   /***** Test case ID in Testrail: C167522 (Suman)******/
	   it('Verify entering Subnet name in text field provided in Additional Parameters page to configure Virtual Network - TC C167522 ', function() {
	   		catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Subnet Name"]).toEqual(requiredReturnMap["Expected"]["Subnet Name"]);
		   });
	   });
	
	   //Test case to Verify entering 'Address prefix' value as 10.0.0.0/24 in text field in Additional Parameters page to configure Virtual Network
	   /***** Test case ID in Testrail: C167523 (Suman)******/
	   it('Verify entering Address Space value as 10.0.0.0/24 in text field in Additional Parameters page to configure Virtual Network - TC C167523 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Address Space"]).toEqual(requiredReturnMap["Expected"]["Address Space"]);
		   });
	   });
	
	   //Test case to Verify entering 'Subnet address prefix' value as 10.0.0.0/24 in text field in Additional Parameters page to configure Virtual Network
	   /***** Test case ID in Testrail: C167524 (Suman)******/
	   it('Verify entering Subnet Address Range value as 10.0.0.0/24 in text field in Additional Parameters page to configure Virtual Network - TC C167524 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Subnet Address Range"]).toEqual(requiredReturnMap["Expected"]["Subnet Address Range"]);
		   });
	   });
	   
	   //Test case to Verify selecting 'Virtual Network Location' value in Additional Parameters page to configure Virtual Network
	   /***** Test case ID in Testrail******/
	   it('Test case to Verify selecting "Virtual Network Location" value in Additional Parameters page to configure Virtual Network', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Virtual Network Location"]).toEqual(requiredReturnMap["Expected"]["Virtual Network Location"]);
		   });
	   });
	
	   //Test case to Verify entering 'Virtual Machine Name' in text field provided in Additional Parameters page to configure Virtual Machine
	   /***** Test case ID in Testrail: C167525 (Suman)******/
	   it('Verify entering Virtual Machine Name in text field provided in Additional Parameters page to configure Virtual Machine - TC C167525 ', function() {
		   var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		   catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		   orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Virtual Machine Name"]).toEqual(requiredReturnMap["Expected"]["Virtual Machine Name"]);
		   });
	   });
	
	   //Test case to Verify entering 'Admin Username' in text field provided in Additional Parameters page to configure Virtual Machine
	   /***** Test case ID in Testrail: C167526 (Suman)******/
	   it('Verify entering Admin Username in text field provided in Additional Parameters page to configure Virtual Machine - TC C167526 ', function() {
		   var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		   catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		   orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Admin Username"]).toEqual(requiredReturnMap["Expected"]["Admin Username"]);
		   });
	   });
	
	   //Test case to Verify entering 'Admin Password' in text field provided in Additional Parameters page to configure Virtual Machine
	   /***** Test case ID in Testrail: C167528 (Suman)******/
	   it('Verify entering Admin Password in text field provided in Additional Parameters page to configure Virtual Machine - TC C167528 ', function() {
		   var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		   catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		   orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Admin Password"]).toEqual('*****');
		   });
	   });
	
	   //Test case to Verify entering 'Virtual Network Name' in text field provided in Additional Parameters page to configure Virtual Machine
	   /***** Test case ID in Testrail: C167529 (Suman)******/
	   it('Verify entering Virtual Network Name in text field provided in Additional Parameters page to configure Virtual Machine - TC C167529 ', function() {
		   var azureLinuxVMObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
		   catalogPage.clickConfigureButtonBasedOnName(azureLinuxVMObject.Scenario1.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
		   orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Virtual Network Name"]).toEqual(requiredReturnMap["Expected"]["Virtual Network Name"]);
		   });
	   });
    
	   //Test case to     Verify correct Category name is displayed in the Main Parameters page to configure Azure service(Ex :Virtual Network)
	   /***** Test case ID in Testrail: C167028 (Deepthi)******/
	//    it('Verify correct Category name is displayed in the Main Parameters page to configure Azure service(Ex :Virtual Network) - TC C167028 ', function() {
	// 	   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
	// 	   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
	// 	//    expect(placeOrderPage.getTextCategory()).toBe(virtualNetworkTemplate.Category);		
	//    });
   
	   //Test case to  Verify Service name is displayed in the Review Order page (Ex: Virtual Network)
	   /***** Test case ID in Testrail: C167039 (Deepthi)******/
	   it('Verify Service name is displayed in the Review Order page (Ex: Virtual Network) - TC C167039 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
		   });
	   });
    
	   //Test case to  Verify Service Details are listed in Review Order page(Ex: Virtual Network)
	   /***** Test case ID in Testrail: C167040 (Deepthi)******/
	   it('Verify Service Details are listed in Review Order page(Ex: Virtual Network) - TC C167040 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
		   });	
		   //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(virtualNetworkTemplate.Category);
		   //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);	
		   expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(messageStrings.estimatedPrice);
	   });

	   //Test case to  Verify Service Details are listed in Review Order page(Ex: Virtual Network)
	   /***** Test case ID in Testrail: C167041 (Deepthi)******/
	   it('Verify Additional Details are listed in Review Order page (Ex: Virtual Network) - TC C167041 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["New Resource Group Required"]).toEqual(requiredReturnMap["Expected"]["New Resource Group Required"]);
			   expect(requiredReturnMap["Actual"]["Existing Resource Group List"]).toEqual(requiredReturnMap["Expected"]["Existing Resource Group List"]);
			   expect(requiredReturnMap["Actual"]["Resource Group Location"]).toEqual(requiredReturnMap["Expected"]["Resource Group Location"]);
			   expect(requiredReturnMap["Actual"]["Location"]).toEqual(requiredReturnMap["Expected"]["Location"]);
			   expect(requiredReturnMap["Actual"]["New Resource Group"]).toEqual(requiredReturnMap["Expected"]["New Resource Group"]);
			   expect(requiredReturnMap["Actual"]["Virtual Network Name"]).toEqual(requiredReturnMap["Expected"]["Virtual Network Name"]);
			   expect(requiredReturnMap["Actual"]["Virtual Network Location"]).toEqual(requiredReturnMap["Expected"]["Virtual Network Location"]);
			   expect(requiredReturnMap["Actual"]["Address Space"]).toEqual(requiredReturnMap["Expected"]["Address Space"]);
			   expect(requiredReturnMap["Actual"]["Subnet Name"]).toEqual(requiredReturnMap["Expected"]["Subnet Name"]);
			   expect(requiredReturnMap["Actual"]["Subnet Address Range"]).toEqual(requiredReturnMap["Expected"]["Subnet Address Range"]);
			   expect(requiredReturnMap["Actual"]["Service Endpoints"]).toEqual(requiredReturnMap["Expected"]["Service Endpoints"]);
		   });	
	   });
    
	   //Test case to Verify Submit Order option is working fine in creating an Azure service (Ex: Virtual Network)
	   /***** Test case ID in Testrail: C167042 (Deepthi)******/
	   it('Verify Submit Order option is working fine in creating an Azure service (Ex: Virtual Network) - TC C167042 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate,resourceGroupMap);
		   placeOrderPage.submitOrder();
		   expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
	   });
    
	   //Test case to Verify Configure button is working fine while creating an order (Ex: Virtual Network)
	   /***** Test case ID in Testrail: C167044 (Deepthi)******/
	   it('Verify Configure button is working fine while creating an order (Ex: Virtual Network) - TC C167044 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);	 	   
		   expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
	   });    
	   
	   //Test case to Verify selecting 'New resource group required' as 'No' and selecting existing resource group from the list is working for Virtual Network
	   /***** Test case ID in Testrail: C167518 (Deepthi)******/
	   it('Verify selecting "New resource group required" as "No" and selecting existing resource group from the list is working for Virtual Network - TC C167518 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Existing Resource Group List"]).toEqual(requiredReturnMap["Expected"]["Existing Resource Group List"]);
		   });
	   });   
    
	   //Test case to Verify selecting on any of the "Location" from dropdown is working for Virtual Network
	   /***** Test case ID in Testrail: C167520 (Deepthi)******/
	   it('Verify selecting on any of the "Location" from dropdown is working for Virtual Network  - TC C167520 ', function() {
		   catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		   catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		   var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroupName,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
		   orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap).then(function(requiredReturnMap){
			   expect(requiredReturnMap["Actual"]["Location"]).toEqual(requiredReturnMap["Expected"]["Location"]);
		   });
	   });
    
    //Verify entering 'Network Interface Name' in text field provided in Additional Parameters page to configure Virtual Machine - TC C167530
	/***** Test case ID in Testrail: C167530 (Himanshu)******/
	it('Verify entering "Network Interface Name" in text field provided in Additional Parameters page to configure Virtual Machine', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Network Interface Name"]).toEqual(requiredReturnMap["Expected"]["Network Interface Name"]);
		});
    });

    //Verify entering 'Network Security Group Name' in text field provided in Additional Parameters page to configure Virtual Machine - TC C167531
    /***** Test case ID in Testrail: C167531 (Himanshu)******/
	it('Verify entering "Network Security Group Name" in text field provided in Additional Parameters page to configure Virtual Machine', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Network Security Group Name"]).toEqual(requiredReturnMap["Expected"]["Network Security Group Name"]);
		});
    });

	 //Verify entering 'Availability Set Name' in text field provided in Additional Parameters page to configure Virtual Machine - TC C167532
     /***** Test case ID in Testrail: C167532 (Himanshu)******/
	it('Verify entering :Availability Set Name" in text field provided in Additional Parameters page to configure Virtual Machine', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Availability Set Name"]).toEqual(requiredReturnMap["Expected"]["Availability Set Name"]);
		});
    });

     //Verify entering 'Diagnostics Storage Account Name' in text field provided in Additional Parameters page to configure Virtual Machine - TC C167546
     /***** Test case ID in Testrail: C167546 (Himanshu)******/
	it('Verify entering "Diagnostics Storage Account Name" in text field provided in Additional Parameters page to configure Virtual Machine ', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Diagnostics Storage Account Name"]).toEqual(requiredReturnMap["Expected"]["Diagnostics Storage Account Name"]);
		});
    }); 
	
	//Testcase to verify selecting "Availability Set Platform Fault Domain Count" value as "1" in Additional Parameters page to configure Virtual Machine - TC C167544
    /***** Test case ID in Testrail: - C167544 (Deepthi)******/
	it('Verify selecting "Availability Set Platform Fault Domain Count" value as "1" in Additional Parameters page to configure Virtual Machine - TC C167544', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Availability Set Platform Fault Domain Count"]).toEqual(requiredReturnMap["Expected"]["Availability Set Platform Fault Domain Count"]);
		});
	});  
	
	//Testcase to verify selecting "Availability Set Platform Fault Domain Count" value as "1" in Additional Parameters page to configure Virtual Machine - TC C167545
    /***** Test case ID in Testrail: - C167545 (Deepthi)******/
	it('Verify selecting "Availability Set Platform Update Domain Count" value as "1" in Additional Parameters page to configure Virtual Machine - TC C167545', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Availability Set Platform Update Domain Count"]).toEqual(requiredReturnMap["Expected"]["Availability Set Platform Update Domain Count"]);
		});
	});
	
	//Testcase to Verify entering "Diagnostics Storage Account Name" in text field provided in Additional Parameters page to configure Virtual Machine - TC C167546
    /***** Test case ID in Testrail: - C167545 (Deepthi)******/
	it('Verify entering "Diagnostics Storage Account Name" in text field provided in Additional Parameters page to configure Virtual Machine', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Diagnostics Storage Account Name"]).toEqual(requiredReturnMap["Expected"]["Diagnostics Storage Account Name"]);
		});
	});
	
	//Testcase to verify selecting "Availability Set Platform Fault Domain Count" value as "1" in Additional Parameters page to configure Virtual Machine - TC C167547
    /***** Test case ID in Testrail: - C167547 (Deepthi)******/
	it('Verify selecting "Diagnostics Storage Account Type" value as "Standard_LRS" in Additional Parameters page to configure Virtual Machine - TC C167547', function() {
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Diagnostics Storage Account Type"]).toEqual(requiredReturnMap["Expected"]["Diagnostics Storage Account Type"]);
		});
	});
	 
	//Testcase to verify selecting "Availability Set Platform Fault Domain Count" value as "1" in Additional Parameters page to configure Virtual Machine 
    /***** Test case ID in Testrail: - C167552 (Deepthi)******/
	it('Verify selecting "Public Ip Address Type" value as "dynamic" in Additional Parameters page to configure Virtual Machine - TC C167552', function() {
        catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1, resourceGroupMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Public Ip Address Type"]).toEqual(requiredReturnMap["Expected"]["Public Ip Address Type"]);
		});
	});
	
	//Testcase to verify providing the password without uppercase letters,special character,numbers throws an error message and provisioning gets failed 
    /***** Test case ID in Testrail: - C167584 (Deepthi)******/
	/*it('Failure scenario - Verify providing the password without uppercase letters,special character,numbers throws an error message and provisioning gets failed - TC C167584', function() {
		var orderObject = {};
    	var vnObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.bluePrintName);
    	var resourceGroup = resourceGroupName + util.getRandomNumber(4); 
    	var storageAccountName = "teststorage"+ util.getRandomNumber(4);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia","Admin Password":"1234","Diagnostics Storage Account Name":storageAccountName};
    	orderObject.servicename = orderFlowUtil.fillOrderDetails(vmRedHatTemplate,resourceGroupMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    	placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
		orderFlowUtil.approveOrder(orderObject);
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Failed')
	     expect(ordersPage.getTextFailureReason()).toMatch('InvalidParameter');
	     expect(ordersPage.getTextOrderStatusOrderDetails()).toEqual('Failed')
	});*/
	
	//Testcase to verify providing the password without uppercase letters,special character,numbers throws an error message and provisioning gets failed 
    /***** Test case ID in Testrail: - C167585 (Deepthi)******/
	it('Failure scenario - Verify entering duplicate stoarage account name in input parameters throws an error message and provisioning fails - TC C167585', function() {
		var orderObject = {};
    	var vnObject = JSON.parse(JSON.stringify(vmRedHatTemplate));
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
		var resourceGroup = resourceGroupName + util.getRandomNumber(4); 
    	var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderObject.servicename = orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1,resourceGroupMap);
    	placeOrderPage.submitOrder();
    	orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    	orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    	placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
    	orderFlowUtil.approveOrder(orderObject);
		orderFlowUtil.waitForOrderStatusChange(orderObject,'Failed');
	    //expect(ordersPage.getTextFailureReason()).toMatch('Error occuredPreflight validation failed. Please refer to')
	    //expect(ordersPage.getTextOrderStatusOrderDetails()).toEqual('Failed')
	});

	it("CON-3968 --- Azure: Virtual network and Windows Virtual Machine :: LOCATION in Additional parameters page is not populated after upgrading to consume 0105",function(){
    	catalogPage.clickConfigureButtonBasedOnName(vmRedHatTemplate.Scenario1.bluePrintName);
    	var resourceGroupMap = {"Service Instance Name":serviceName,"New Resource Group Required":"No","Existing Resource Group List":resourceGroupName,"Resource Group Location":"eastasia"};
    	orderFlowUtil.fillOrderDetails(vmRedHatTemplate.Scenario1,resourceGroupMap);
		expect(placeOrderPage.getTextBasedOnLabelName("Resource Group Location")).not.toBe(null);
	});

	it("CON-3546 --- Soft Layer & Azure Virtual Network base pricing is not displayed",function(){
		var azurevnObject = JSON.parse(JSON.stringify(virtualNetworkTemplate));
		catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
		catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
		expect(placeOrderPage.getTextEstimatedPrice()).toEqual(virtualNetworkTemplate.EstimatedPrice);
	});
});
