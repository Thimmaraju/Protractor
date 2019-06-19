"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-3") ? "QA 3" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    gcpComputeInsTemplate = require('../../../../testData/OrderIntegration/Google/gcpComputeIns.json');
    

describe('GCP - Compute Engine', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, inventoryPage, serviceName, instanceName;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Google',
        category: 'Compute',
        catalogPageTitle: 'Search, Select and Configure',
        inputServiceNameWarning: "Parameter Warning:",
        orderSubmittedConfirmationMessage: 'Order Submitted !',        
    };

    var orderObjectVm = {};

    beforeAll(function () {
        ordersPage = new Orders();
        homePage = new HomePage();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();       
        
    });

    beforeEach(function () {
        catalogPage.open();            
        serviceName = "att-compute-engine-" + util.getRandomString(5);
        instanceName = "att-vm-" + util.getRandomString(3);        
        modifiedParamMap = { "Service Instance Name": serviceName, "Instance Name": instanceName.toLowerCase()};        
    });

    it('TC-C179879 : GCP Compute - Verify fields on Main Parameters page is working fine', function () {
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        catalogPage.clickFirstCategoryCheckBoxBasedOnName('Compute');
        catalogPage.clickConfigureButtonBasedOnName(gcpComputeInsTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(gcpComputeInsTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(gcpComputeInsTemplate.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(gcpComputeInsTemplate.BasePrice);
    });

    it('TC-C179882 : GCP Compute - Verify Summary details and Additional Details are listed in review Order page', function () {
        var ComputeINSObject = JSON.parse(JSON.stringify(gcpComputeInsTemplate));
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        catalogPage.clickFirstCategoryCheckBoxBasedOnName('Compute');
        catalogPage.clickConfigureButtonBasedOnName(gcpComputeInsTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpComputeInsTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            //expect(requiredReturnMap["Actual"]["Quantity"]).toEqual(requiredReturnMap["Expected"]["Quantity"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
            //expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(requiredReturnMap["Actual"]["Region"]).toEqual(requiredReturnMap["Expected"]["Region"]);
            expect(requiredReturnMap["Actual"]["Machine Type Edit Option"]).toEqual(requiredReturnMap["Expected"]["Machine Type Edit Option"]);
            expect(requiredReturnMap["Actual"]["Zone"]).toEqual(requiredReturnMap["Expected"]["Zone"]);
	       // expect(requiredReturnMap["Actual"]["Instance Name"]).toEqual(requiredReturnMap["Expected"]["Instance Name"]);
            expect(requiredReturnMap["Actual"]["Machine type"]).toEqual(requiredReturnMap["Expected"]["Machine type"]);
            expect(requiredReturnMap["Actual"]["Network Tags"]).toEqual(requiredReturnMap["Expected"]["Network Tags"]);
            expect(requiredReturnMap["Actual"]["Encryption"]).toEqual(requiredReturnMap["Expected"]["Encryption"]);
            expect(requiredReturnMap["Actual"]["Encryption"]).toEqual(requiredReturnMap["Expected"]["Encryption"]);
            expect(requiredReturnMap["Actual"]["Source Image Type"]).toEqual(requiredReturnMap["Expected"]["Source Image Type"]);
            expect(requiredReturnMap["Actual"]["Boot Disk Type"]).toEqual(requiredReturnMap["Expected"]["Boot Disk Type"]);
            expect(requiredReturnMap["Actual"]["Boot Disk Size in GB"]).toEqual(requiredReturnMap["Expected"]["Boot Disk Size in GB"]);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(gcpComputeInsTemplate.EstimatedPrice);
	    });
    });

    it('TC-C179880 : GCP Compute - Verify Order is listed in Orders details page once it is submitted from catalog page', function () {
        var orderObject = {};
        var orderAmount;
        var ComputeINSObject = JSON.parse(JSON.stringify(gcpComputeInsTemplate));
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        catalogPage.clickFirstCategoryCheckBoxBasedOnName('Compute');
        catalogPage.clickConfigureButtonBasedOnName(gcpComputeInsTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpComputeInsTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();        
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        //expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);
        //var orderAmount = ordersPage.getTextFirstAmountOrdersTable();
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);        
        ordersPage.getTextFirstAmountOrdersTable().then(function(text){
            orderAmount = text;
        });
        ordersPage.searchOrderById(orderObject.orderNumber);
        ordersPage.clickFirstViewDetailsOrdersTable();        
        expect(ordersPage.getTextOrderServiceNameOrderDetails()).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);        
	expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(gcpComputeInsTemplate.serviceId);
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(ComputeINSObject, "Team"));
        //expect(ordersPage.getTextOrderTypeOrderDetails()).toEqual("New");
       // expect(ordersPage.getTextSubmittedByOrderDetails()).toEqual(browser.params.username);
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);        
        util.waitForAngular();
        //ordersPage.clickServiceConfigurationsTabOrderDetails();
        expect(ordersPage.getTextBasedOnLabelName("Region")).toEqual(jsonUtil.getValue(ComputeINSObject, "Region"));
        expect(ordersPage.getTextBasedOnLabelName("Machine type")).toEqual(jsonUtil.getValue(ComputeINSObject, "Machine type"));
        expect(ordersPage.getTextBasedOnLabelName("Zone")).toEqual(jsonUtil.getValue(ComputeINSObject, "Zone"));
        expect(ordersPage.getTextBasedOnLabelName("Encryption")).toEqual(jsonUtil.getValue(ComputeINSObject, "Encryption"));
        expect(ordersPage.getTextBasedOnLabelName("Source Image Type")).toEqual(jsonUtil.getValue(ComputeINSObject, "Source Image Type"));
        //expect(placeOrderPage.getTextBasedOnLabelName("Application Images")).toEqual(jsonUtil.getValue(ComputeINSObject, "Application Images"));
        expect(ordersPage.getTextBasedOnLabelName("Boot Disk Type")).toEqual(jsonUtil.getValue(ComputeINSObject, "Boot Disk Type"));
        expect(ordersPage.getTextBasedOnLabelName("Boot Disk Size in GB")).toEqual(jsonUtil.getValue(ComputeINSObject, "Boot Disk Size in GB"));
        expect(ordersPage.getTextBasedOnLabelName("Encryption")).toEqual(jsonUtil.getValue(ComputeINSObject, "Encryption"));
        ordersPage.clickBillOfMaterialsTabOrderDetails();                       
        expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(gcpComputeInsTemplate.TotalCost);
        // ordersPage.clickBillOfMaterialsTabOrderDetails().then(function(){
        //     ordersPage.validatePriceForGoogleService(orderAmount).then(function(status){            
        //           expect(status).toEqual(true);
        //     });    
        // });       
    });
    
    it('TC-C182090 : VM Power States - Verify GCP VM instance creation as part of pre-requisite data.', function () {
        var ComputeINSObject = JSON.parse(JSON.stringify(gcpComputeInsTemplate));        
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        catalogPage.clickFirstCategoryCheckBoxBasedOnName('Compute');
        catalogPage.clickConfigureButtonBasedOnName(gcpComputeInsTemplate.bluePrintName);
        orderObjectVm.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(gcpComputeInsTemplate, modifiedParamMap).then(function(){
            logger.info("Order details are filled.");
            browser.sleep(5000);
        });
        placeOrderPage.submitOrder();
        orderObjectVm.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        orderObjectVm.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        orderFlowUtil.approveOrder(orderObjectVm);
        orderFlowUtil.waitForOrderStatusChange(orderObjectVm, 'Completed');       
    });

    it('TC- : GCP Compute Engine Edit functionality', function () {                     
        var editInsObject = JSON.parse(JSON.stringify(gcpComputeInsTemplate));
        var modifiedParamMap = {"EditService" : true};        
        //New function
        orderFlowUtil.editService(orderObjectVm);
        browser.sleep(4000);        
        orderFlowUtil.fillOrderDetails(gcpComputeInsTemplate, modifiedParamMap).then(function(){
            logger.info("Edit parameter details are filled.");
            browser.sleep(5000);
        });
        placeOrderPage.submitOrder();
        orderObjectVm.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();              
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');      
        //New function
        placeOrderPage.clickgoToInventoryButtonOrderSubmittedModal();
        orderFlowUtil.approveOrder(orderObjectVm);
        orderFlowUtil.waitForOrderStatusChange(orderObjectVm, 'Completed');
        orderFlowUtil.verifyOrderStatus(orderObjectVm).then(function (status) {
            if (status == 'Completed') {
                //Verify updated details are reflected on order details apge.
                ordersPage.clickFirstViewDetailsOrdersTable();
                expect(ordersPage.getTextBasedOnLabelName("Machine Type Edit Option")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "Machine Type Edit Option"));
                expect(ordersPage.getTextBasedOnLabelName("CPU Type")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "CPU Type"));
                expect(ordersPage.getTextBasedOnLabelName("CPU Cores")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "CPU Cores"));
                //expect(ordersPage.getTextBasedOnLabelName("CPU Memory")).toEqual(jsonUtil.getValue(editInsObject, "CPU Memory"));
                expect(ordersPage.getTextBasedOnLabelName("CPU platform")).toEqual(jsonUtil.getValueEditParameter(editInsObject, "CPU platform"));               
            }
        })       
    });
    
    it('TC- : GCP Compute Engine Delete Service-Instance-1', function () {                             
        //Delete Service
        orderObjectVm.deleteOrderNumber = orderFlowUtil.deleteService(orderObjectVm);
        expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObjectVm)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(orderObjectVm);
        orderFlowUtil.waitForDeleteOrderStatusChange(orderObjectVm, 'Completed');
        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObjectVm)).toBe('Completed');               
    });
    
    it('TC-C182088 : VM Power States - Verify GCP VM instance Reboot functionality.', function () {
        
	inventoryPage.open();        
        inventoryPage.searchOrderByServiceName(orderObjectVm.servicename);
        inventoryPage.clickExpandFirstRow().then(function () {
            browser.executeScript('window.scrollTo(0,0);');
            inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                inventoryPage.clickRebootButtonOfInstance().then(function () {
                    inventoryPage.clickOkForInstanceRebootPermission();
                });
            });
        }).then(function () {
            inventoryPage.waitForInstancStateStatusChange(orderObjectVm, 'On');
        });
        expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObjectVm)).toBe('On');
    });


    it('TC-C182086 : VM Power States - Verify GCP VM instance Turn OFF functionality.', function () {
    	
	var status = 'TERMINATED';        
        var val = JSON.stringify({"IsUsingDummy":"Yes"}); 
        inventoryPage.open();
        inventoryPage.searchOrderByServiceName(orderObjectVm.servicename);
        inventoryPage.clickExpandFirstRow().then(function () {
            browser.executeScript('window.scrollTo(0,0);');
            inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                inventoryPage.clickTurnOFFButtonOfInstance().then(function () {
                    inventoryPage.clickOkForInstanceTurnOFFPermission();
                });
            });
        }).then(function () {
            inventoryPage.getComponentTags().then(function(text){
                if(val == text){
                    status = 'Off'; 
                } 
                inventoryPage.waitForInstancStateStatusChange(orderObjectVm, status).then(function(){
                    expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObjectVm)).toBe(status);
                });                
            }); 
        });        
    });

    it('TC-C182085 : VM Power States - Verify GCP VM instance Turn ON functionality.', function () {        
        inventoryPage.open();
        inventoryPage.searchOrderByServiceName(orderObjectVm.servicename);
        inventoryPage.clickExpandFirstRow().then(function () {
            browser.executeScript('window.scrollTo(0,0);');
            inventoryPage.clickOverflowActionButtonForPowerStates().then(function () {
                inventoryPage.clickTurnONButtonOfInstance().then(function () {
                    inventoryPage.clickOkForInstanceTurnONPermission();
                });
            });
        }).then(function () {
            inventoryPage.waitForInstancStateStatusChange(orderObjectVm, 'On');
        });
        expect(orderFlowUtil.verifyInstancePowerStateStatus(orderObjectVm)).toBe('On');

        orderObjectVm.deleteOrderNumber = orderFlowUtil.deleteService(orderObjectVm);
        //expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObjectVm)).toBe('Delete');
        orderFlowUtil.approveDeletedOrder(orderObjectVm);
        browser.manage().window().setSize(1920, 1080);
	    //Adding hardcoded wait to syncronise Order details page.
        browser.sleep(100000);
	orderFlowUtil.waitForDeleteOrderStatusChange(orderObjectVm, 'Completed');    


    });   
    

})
