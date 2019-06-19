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
	vraBluePrints = require('../../../testData/vRAIntegration/vRABluePrints.json'),
	slBluePrints = require('../../../testData/Softlayer/SLBluePrints.json'),
	aZBluePrints = require('../../../testData/AzureIntegration/azureBluePrints.json'),
	aMZBluePrints = require('../../../testData/AWSIntegration/AWSBluePrints.json'),
    util = require('../../../helpers/util.js'),
	orderFlowUtil = require('../../../helpers/orderFlowUtil.js');

var vraBluePrints,slBluePrints,aZBluePrints,aMZBluePrints;
if(browser.params.url.includes('cb-qa-4')){
	vraBluePrints	= require('../../../testData/OrderIntegration/VRA/vRABluePrints.json');
	slBluePrints	= require('../../../testData/OrderIntegration/Softlayer/SLBluePrints.json');
	aZBluePrints	= require('../../../testData/OrderIntegration/Azure/azureBluePrints.json');
	aMZBluePrints	= require('../../../testData/OrderIntegration/AWS/AWSBluePrints.json');
}
if(browser.params.url.includes('cb-qa-2')){
	vraBluePrints	= require('../../../testData/OrderIntegration/VRA/QA2vRABluePrints.json');
	slBluePrints	= require('../../../testData/OrderIntegration/Softlayer/QA2SLBluePrints.json');
	aZBluePrints	= require('../../../testData/OrderIntegration/Azure/QA2azureBluePrints.json');
	aMZBluePrints	= require('../../../testData/OrderIntegration/AWS/QA2AWSBluePrints.json');
}
if (browser.params.url.includes('cb-customer1')){
	vraBluePrints	= require('../../../testData/OrderIntegration/VRA/Cust1vRABluePrints.json');
	slBluePrints	= require('../../../testData/OrderIntegration/Softlayer/Cust1SLBluePrints.json');
	aZBluePrints	= require('../../../testData/OrderIntegration/Azure/Cust1azureBluePrints.json');
	aMZBluePrints	= require('../../../testData/OrderIntegration/AWS/Cust1AWSBluePrints.json');
}
describe('Order Integration Tests', function() {
    var orders, homePage, dashBoard, catalogPage, placeOrderPage, catalogDetailsPage; 
    

    var messageStrings = {
        category:                   'Compute',
        catalogPageTitle:           'Search, Select and Configure',
        inputServiceNameWarning:    "Parameter Warning:",
        orderSubmittedConfirmationMessage : 'Order Submitted !'
    };


    beforeAll(function() {
        orders = new Orders();
        homePage = new HomePage(); 
        dashBoard = new DashBoard();
        catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		catalogDetailsPage = new CatalogDetailsPage();
        browser.driver.manage().window().maximize();
        ensureConsumeHome();
    });

    afterAll(function() {
    	//browser.manage().deleteAllCookies();
    });

    beforeEach(function() {
    	catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl); 
    });
    
	// Test case to verify selecting Catalog Page is working fine.
    // ***** Test case ID in Testrail: C159934 (Annam)******//*
	it('Verify Compelete Function Flow Of Order Approval for vRA TIER3TRADITIONALWORKLOAD', function() { 
		var tier3Object = JSON.parse(JSON.stringify(vraBluePrints.tier3TraditionalWorkload));
		var returnObj = orderFlowUtil.createOrder(tier3Object); 
		expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
		logger.info('Order has been Created and Status is in Approval in Progress');
		orderFlowUtil.approveOrder(returnObj);
		expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
		logger.info('Order has been Approved and Status is in Provisioning in Progress');
		
	  });
	
	
	it('Verify Compelete Function Flow Of Order Deny for vRA TIER3TRADITIONALWORKLOAD', function() { 
		var tier3Object = JSON.parse(JSON.stringify(vraBluePrints.tier3TraditionalWorkload));
		var returnObj = orderFlowUtil.createOrder(tier3Object);
		expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
		logger.info('Order has been Created and Status is in Approval in Progress');
		orderFlowUtil.denyOrder(returnObj);
		expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
		logger.info('Order has been Denied and Status is in Rejected');
  });
	
	
	it('Verify Compelete Function Flow Of Order Cancel for vRA TIER3TRADITIONALWORKLOAD', function() { 
		var tier3Object = JSON.parse(JSON.stringify(vraBluePrints.tier3TraditionalWorkload));
		var returnObj = orderFlowUtil.createOrder(tier3Object);
		expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
		logger.info('Order has been Created and Status is in Approval in Progress');
		orderFlowUtil.cancelOrder(returnObj);
		browser.sleep(10000);
		expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
		logger.info('Order has been cancel and Status is in Canceled');
    });
	
	it('Verify Compelete Function Flow Of Order Approval for vRA SingleVMCentOS', function() { 
	        var centOSObject = JSON.parse(JSON.stringify(vraBluePrints.SingleVMCentOS));
			var returnObj = orderFlowUtil.createOrder(centOSObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.approveOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
			logger.info('Order has been Approved and Status is in Provisioning in Progress');
			
		  });
		
		
		it('Verify Compelete Function Flow Of Order Deny for vRA SingleVMCentOS', function() { 
			var centOSObject = JSON.parse(JSON.stringify(vraBluePrints.SingleVMCentOS));
			var returnObj = orderFlowUtil.createOrder(centOSObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.denyOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
			logger.info('Order has been Denied and Status is in Rejected');
	  });
		
		
		it('Verify Compelete Function Flow Of Order Cancel for vRA SingleVMCentOS', function() { 
			var centOSObject = JSON.parse(JSON.stringify(vraBluePrints.SingleVMCentOS));
			var returnObj = orderFlowUtil.createOrder(centOSObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.cancelOrder(returnObj);
			browser.sleep(10000);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
			logger.info('Order has been cancel and Status is in Canceled');
	    });
		
		
		it('Verify Compelete Function Flow Of Order Approval for SoftLayer VIRTUALMACHINE_SERVICE', function() { 
			var virservObject = JSON.parse(JSON.stringify(slBluePrints.VIRTUALMACHINE_SERVICE));
			var returnObj = orderFlowUtil.createOrder(virservObject); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.approveOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
			logger.info('Order has been Approved and Status is in Provisioning in Progress');
			
		  });
		
		
		it('Verify Compelete Function Flow Of Order Deny for SoftLayer VIRTUALMACHINE_SERVICE', function() { 
			var virservObject = JSON.parse(JSON.stringify(slBluePrints.VIRTUALMACHINE_SERVICE));
			var returnObj = orderFlowUtil.createOrder(virservObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.denyOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
			logger.info('Order has been Denied and Status is in Rejected');
	  });
		
		
		it('Verify Compelete Function Flow Of Order Cancel for SoftLayer VIRTUALMACHINE_SERVICE', function() { 
			var virservObject = JSON.parse(JSON.stringify(slBluePrints.VIRTUALMACHINE_SERVICE));
			var returnObj = orderFlowUtil.createOrder(virservObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.cancelOrder(returnObj);
			browser.sleep(10000);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
			logger.info('Order has been cancel and Status is in Canceled');
	    });
	

		it('Verify Compelete Function Flow Of Order Approval for SoftLayer BAREMETALHOURLY_SERVICE', function() { 
			var bareservObject = JSON.parse(JSON.stringify(slBluePrints.BAREMETALHOURLY_SERVICE));
			var returnObj = orderFlowUtil.createOrder(bareservObject); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.approveOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
			logger.info('Order has been Approved and Status is in Provisioning in Progress');
			
		  });
		
		
		it('Verify Compelete Function Flow Of Order Deny for SoftLayer BAREMETALHOURLY_SERVICE', function() { 
			var bareservObject = JSON.parse(JSON.stringify(slBluePrints.BAREMETALHOURLY_SERVICE));
			var returnObj = orderFlowUtil.createOrder(bareservObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.denyOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
			logger.info('Order has been Denied and Status is in Rejected');
	  });
		
		
		it('Verify Compelete Function Flow Of Order Cancel for SoftLayer BAREMETALHOURLY_SERVICE', function() { 
			var bareservObject = JSON.parse(JSON.stringify(slBluePrints.BAREMETALHOURLY_SERVICE));
			var returnObj = orderFlowUtil.createOrder(bareservObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.cancelOrder(returnObj);
			browser.sleep(10000);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
			logger.info('Order has been cancel and Status is in Canceled');
	    });
		
		it('Verify Compelete Function Flow Of Order Approval for Azure VirtualNetwork', function() { 
			var virnetObject = JSON.parse(JSON.stringify(aZBluePrints.VirtualNetwork));
			var returnObj = orderFlowUtil.createOrder(virnetObject); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.approveOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
			logger.info('Order has been Approved and Status is in Provisioning in Progress');
			
		  });
		
		
		it('Verify Compelete Function Flow Of Order Deny for Azure VirtualNetwork', function() { 
			var virnetObject = JSON.parse(JSON.stringify(aZBluePrints.VirtualNetwork));
			var returnObj = orderFlowUtil.createOrder(virnetObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.denyOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
			logger.info('Order has been Denied and Status is in Rejected');
	  });
		
		
		it('Verify Compelete Function Flow Of Order Cancel for Azure VirtualNetwork', function() { 
			var virnetObject = JSON.parse(JSON.stringify(aZBluePrints.VirtualNetwork));
			var returnObj = orderFlowUtil.createOrder(virnetObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.cancelOrder(returnObj);
			browser.sleep(10000);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
			logger.info('Order has been cancel and Status is in Canceled');
	    });
		
		it('Verify Compelete Function Flow Of Order Approval for Azure WindowsVirtualMachine', function() { 
			var winVirMacObject = JSON.parse(JSON.stringify(aZBluePrints.WindowsVirtualMachine));
			var returnObj = orderFlowUtil.createOrder(winVirMacObject); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.approveOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
			logger.info('Order has been Approved and Status is in Provisioning in Progress');
			
		  });
		
		it('Verify Compelete Function Flow Of Order Deny for Azure WindowsVirtualMachine', function() { 
			var winVirMacObject = JSON.parse(JSON.stringify(aZBluePrints.WindowsVirtualMachine));
			var returnObj = orderFlowUtil.createOrder(winVirMacObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.denyOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
			logger.info('Order has been Denied and Status is in Rejected');
	  });
		
		
		it('Verify Compelete Function Flow Of Order Cancel for Azure WindowsVirtualMachine', function() { 
			var winVirMacObject = JSON.parse(JSON.stringify(aZBluePrints.WindowsVirtualMachine));
			var returnObj = orderFlowUtil.createOrder(winVirMacObject);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.cancelOrder(returnObj);
			browser.sleep(10000);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
			logger.info('Order has been cancel and Status is in Canceled');
	    });
	
		it('Verify Compelete Function Flow Of Order Approval for AWS VPCSingleInstanceForEC2', function() { 
			var singleinsEC2Object = JSON.parse(JSON.stringify(aMZBluePrints.VPCSingleInstanceForEC2));
			var returnObj = orderFlowUtil.createOrder(singleinsEC2Object); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.approveOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
			logger.info('Order has been Approved and Status is in Provisioning in Progress');
		});
		
		it('Verify Compelete Function Flow Of Order Deny for AWS VPCSingleInstanceForEC2', function() { 
			var singleinsEC2Object = JSON.parse(JSON.stringify(aMZBluePrints.VPCSingleInstanceForEC2));
			var returnObj = orderFlowUtil.createOrder(singleinsEC2Object);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.denyOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
			logger.info('Order has been Denied and Status is in Rejected');
	  });
		
		it('Verify Compelete Function Flow Of Order Cancel for AWS VPCSingleInstanceForEC2', function() { 
			var singleinsEC2Object = JSON.parse(JSON.stringify(aMZBluePrints.VPCSingleInstanceForEC2));
			var returnObj = orderFlowUtil.createOrder(singleinsEC2Object);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.cancelOrder(returnObj);
			browser.sleep(10000);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
			logger.info('Order has been cancel and Status is in Canceled');
	    });
		
		it('Verify Compelete Function Flow Of Order Approval for AWS AWSEC2Instance', function() { 
			var awsEC2Object = JSON.parse(JSON.stringify(aMZBluePrints.AWSEC2Instance));
			var returnObj = orderFlowUtil.createOrder(awsEC2Object); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.approveOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Provisioning in Progress');
			logger.info('Order has been Approved and Status is in Provisioning in Progress');
		});
		
		it('Verify Compelete Function Flow Of Order Deny for AWS AWSEC2Instance', function() { 
			var awsEC2Object = JSON.parse(JSON.stringify(aMZBluePrints.AWSEC2Instance));
			var returnObj = orderFlowUtil.createOrder(awsEC2Object); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.denyOrder(returnObj);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Rejected');
			logger.info('Order has been Denied and Status is in Rejected');
	   });
		
		it('Verify Compelete Function Flow Of Order Cancel for AWS AWSEC2Instance', function() { 
			var awsEC2Object = JSON.parse(JSON.stringify(aMZBluePrints.AWSEC2Instance));
			var returnObj = orderFlowUtil.createOrder(awsEC2Object); 
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Approval In Progress');
			logger.info('Order has been Created and Status is in Approval in Progress');
			orderFlowUtil.cancelOrder(returnObj);
			browser.sleep(10000);
			expect(orderFlowUtil.verifyOrderStatus(returnObj)).toBe('Canceled');
			logger.info('Order has been cancel and Status is in Canceled');
	    });
});
