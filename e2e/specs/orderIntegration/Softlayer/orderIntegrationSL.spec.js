/*************************************************
	AUTHOR: SANTOSH HADAWALE
**************************************************/
"use strict";

var CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil =  require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	virtualMachineTemplate =  require('../../../../testData/OrderIntegration/Softlayer/VirtualMachine.json'),
	bareMetalHourlyTemplate =  require('../../../../testData/OrderIntegration/Softlayer/BareMetalHourly.json'),
	bareMetalMonthlyTemplate =  require('../../../../testData/OrderIntegration/Softlayer/BareMetalMonthly.json'),
	testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

describe('Order Integration Tests for Softlayer', function() {
    var catalogPage, placeOrderPage;
    var modifiedParamMap = {};
    var messageStrings = {providerName: 'IBM Cloud', category: 'Compute'};

    beforeAll(function() {
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        browser.driver.manage().window().maximize();
    });

    afterAll(function() {
    	//browser.manage().deleteAllCookies();
    });

    beforeEach(function() {
    	catalogPage.open();
    	expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);

		var serviceName = "GSLSLTestAutomation"+util.getRandomString(5);
		var newHostName = "GSLSLTestAutomation"+util.getRandomString(3)
		modifiedParamMap = {"Service Instance Name":serviceName,"Hostname":newHostName};
    });
    
    it('TC-C168488 : Verify Softlayer provider is listed under providers list', function() {
		expect(catalogPage.getListofProviders()).toContain(messageStrings.providerName);
    });	

	it('TC-C168492 : Verify Softlayer Virtual Machine service', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
        catalogPage.isDisplayedConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
    });
	
	it('CON-3546 : Soft Layer Virtual Network base pricing is not displayed', function() {
		expect(catalogPage.getBasePriceOfDisplayedTemplates()).not.toContain("N/A");
    });
	
	// it('CON-3796 : SoftLayer - VIRTUALMACHINE_SERVICE Additional parameters are not loading while placing orders(12.22 release)', function() {
	// 	var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
	// 	catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
	// 	orderFlowUtil.fillPartialOrderDetails(virtualMachineTemplate,"Main Parameters");
	// 	expect(browser.getCurrentUrl()).toContain("/additional-parameters");
	// 	expect(placeOrderPage.getcurrentStepProgressSection()).toBe("Instance Specifications");
    // });

	it('TC-C167604 : Verify Softlayer IAAS VM Data Center field should be a drop down', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
		});              
    });

	it('TC-C167605 : Verify Softlayer IAAS VM NW speed field should be a drop down', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Network Speed"]).toEqual(requiredReturnMap["Expected"]["Network Speed"]);
		});              
    });

	it('TC-C167606 : Verify Softlayer IAAS VM Billing should be a drop down that has either the hourly or monthly value', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Billing Type"]).toEqual(requiredReturnMap["Expected"]["Billing Type"]);
		});              
    });

	it('TC-C167608 : Verify Softlayer IAAS VM Operating system field should be a drop down with the ability to only select one value', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Operating System"]).toContain("Ubuntu Linux 16.04 LTS Xenial Xerus Minimal");
		});                            
    });

	it('TC-C167609 : Verify Softlayer IAAS VM Disk field should allow customers to select', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Disk Type"]).toEqual(requiredReturnMap["Expected"]["Disk Type"]);
		});                                        
    });

	it('TC-C167610 : Verify Softlayer IAAS VM RAM Field should be a drop down', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Memory"]).toEqual(requiredReturnMap["Expected"]["Memory"]);
		});                           
    });

	it('TC-C167611 : Verify Softlayer IAAS VM Private network is listed in Consume app', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Network Type"]).toEqual(requiredReturnMap["Expected"]["Network Type"]);
			expect(requiredReturnMap["Actual"]["Private Vlan Id"]).toEqual(requiredReturnMap["Expected"]["Private Vlan Id"]);
			expect(requiredReturnMap["Actual"]["Private Subnet"]).toEqual(requiredReturnMap["Expected"]["Private Subnet"]);
		});
    });

	// /*xit('TC-C167612 : Verify Softlayer IAAS VM Public network is listed in Consume app', function() {
	// 	var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
	// 	catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
	// 	orderFlowUtil.fillOrderDetails(virtualMachineTemplate);
	// 	expect(placeOrderPage.getTextBasedOnLabelName("Public Vlan Id")).toEqual(slVmJsonObject["Order Parameters"]["Network Details"]["Public Vlan Id"]["value"][testEnvironment]);
	// 	expect(placeOrderPage.getTextBasedOnLabelName("Public Subnet")).toEqual(slVmJsonObject["Order Parameters"]["Network Details"]["Public Subnet"]["value"][testEnvironment]);                           
    // });*/

	it('TC-C168490 : Verify entering service name for create Softlayer BM or VM service', function() {
		var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(virtualMachineTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
		});                           
    });

	// // it('TC-C167594 : Verify SL Content Server retrieves the different SL catalog configuration from SL API', function() {
	// // 	var slVmJsonObject = JSON.parse(JSON.stringify(virtualMachineTemplate));
    // //     catalogPage.clickConfigureButtonBasedOnName(slVmJsonObject.bluePrintName);
    // //     placeOrderPage.setServiceNameText("Test" +util.getRandomString(5));
    // //     placeOrderPage.clickNextButton();
    // //     expect(placeOrderPage.getTextBluePrintName()).toContain(slVmJsonObject.descriptiveText);  
    // // });
 
	it('TC-C167597 : Verify Softlayer IAAS Bare Metal Data Center field should be a drop down with the ability to only select one value', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
		});              
	});
  
	it('TC-C167598 : Verify Softlayer IAAS Bare Metal Network Speed field should be a drop down with the ability to only select one value', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Network Speed"]).toEqual(requiredReturnMap["Expected"]["Network Speed"]);
		});
 	});
	
    it('TC-C167601 : Verify Softlayer IAAS Bare Metal Operating system field should be a drop down with the ability to only select one value', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Operating System"]).toContain("No Operating System");
		});
 	}); 	

	it('TC-C167603 : Verify Softlayer IAAS Bare Metal RAM Field should be a drop down with the ability to only select one value', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Hardware Configuration (Processor + RAM + Hard disk)"]).toContain('Gold 5120 384GB 2X960GB SSD SED RAID1');
		});
	});

	it('TC-C167613 : Verify Softlayer IAAS Provisioning of Bare Metal (hourly) in Private network is working fine from Consume app', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Network Type"]).toEqual(requiredReturnMap["Expected"]["Network Type"]);
		});
	});
	 
	it('TC-C168566 : Verify Entering Hostname at Additional parameter page in Softlayer IAAS Bare Metal', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Hostname"]).toEqual(requiredReturnMap["Expected"]["Hostname"]);
		});
	});
	 
	it('TC-C168567 : Verify Entering Domain at Additional parameter page in Softlayer IAAS Bare Metal', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Domain"]).toEqual(requiredReturnMap["Expected"]["Domain"]);
		});
	});
	 
	it('TC-C168568 : Verify Entering User Metadata at Additional parameter page in Softlayer IAAS Bare Metal', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["User Metadata"]).toEqual(requiredReturnMap["Expected"]["User Metadata"]);
		});
	});	
	
	it('TC-C168569: Verify Entering Post Install Script URI at Additional parameter page in Softlayer IAAS Bare Metal', function() {
		var slBmJsonObject = JSON.parse(JSON.stringify(bareMetalHourlyTemplate));
		catalogPage.clickConfigureButtonBasedOnName(slBmJsonObject.bluePrintName);
		orderFlowUtil.fillOrderDetails(bareMetalHourlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
			expect(requiredReturnMap["Actual"]["Post Install Script URI"]).toEqual(requiredReturnMap["Expected"]["Post Install Script URI"]);
		});
	});
	


	
	// it('CON-3797 : SoftLayer: while placing BAREMETALMONTHLY_SERVICE order, on additional parameters page Operating system is not loading and its throwing an error - The server encountered an unexpected condition', function() {
	// 	var slBmMJsonObject = JSON.parse(JSON.stringify(bareMetalMonthlyTemplate));
	// 	catalogPage.clickConfigureButtonBasedOnName(slBmMJsonObject.bluePrintName);
	// 	orderFlowUtil.fillOrderDetails(bareMetalMonthlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
	// 		expect(requiredReturnMap["Actual"]["Operating System"]).toEqual(requiredReturnMap["Expected"]["Operating System"]);
	// 	});                           
    // });
	
	// it('CON-3818 :SoftLayer: BAREMETALMONTHLY Service is showing json in the dropdown and private vlan id and subnets are not coming.', function() {
	// 	var slBmMJsonObject = JSON.parse(JSON.stringify(bareMetalMonthlyTemplate));
	// 	catalogPage.clickConfigureButtonBasedOnName(slBmMJsonObject.bluePrintName);
	// 	orderFlowUtil.fillOrderDetails(bareMetalMonthlyTemplate,modifiedParamMap).then(function(requiredReturnMap){
	// 		expect(requiredReturnMap["Actual"]["Private Vlan Id"]).toEqual(requiredReturnMap["Expected"]["Private Vlan Id"]);
	// 		expect(requiredReturnMap["Actual"]["Private Subnet"]).toEqual(requiredReturnMap["Expected"]["Private Subnet"]);
	// 	}); 
    // });
});