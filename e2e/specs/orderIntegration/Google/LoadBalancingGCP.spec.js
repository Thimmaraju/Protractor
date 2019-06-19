"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
    HomePage = require('../../../pageObjects/home.pageObject.js'),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
    logGenerator = require("../../../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    gcpLoadBalancingTemplate = require('../../../../testData/OrderIntegration/Google/gcpLoadBalancing.json');

describe('GCP - UDP Cloud Load Balancing', function () {
    var ordersPage, homePage, catalogPage, placeOrderPage, serviceName;
    var modifiedParamMap = {};
    var messageStrings = {
        providerName: 'Google',
        category: 'Network',
        catalogPageTitle: 'Search, Select and Configure',
        inputServiceNameWarning: "Parameter Warning:",
        orderSubmittedConfirmationMessage: 'Order Submitted !',
    };

    beforeAll(function () {
        ordersPage = new Orders();
        homePage = new HomePage();
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        browser.driver.manage().window().maximize();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
        serviceName = "auto-udp-load-balancing-" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
    });

    it('TC-C183213 : Google Load Balancing : Verify fields on Main Parameters page are working fine while provisioning a Google Load Balancing', function () {
        catalogPage.clickProviderOrCategoryCheckbox('Network');
        catalogPage.clickConfigureButtonBasedOnName(gcpLoadBalancingTemplate.bluePrintName);
        expect(util.getCurrentURL()).toMatch(appUrls.placeOrderMainParamtersPageUrl);
        expect(placeOrderPage.getTextBluePrintName()).toContain(gcpLoadBalancingTemplate.descriptiveText);
        placeOrderPage.setServiceNameText(serviceName);
        placeOrderPage.selectProviderAccount(gcpLoadBalancingTemplate.providerAccount);
        expect(placeOrderPage.isNextButtonEnabled()).toBe(true);
        //expect(placeOrderPage.getTextProvider()).toBe(messageStrings.providerName);
        //expect(placeOrderPage.getTextCategory()).toBe(messageStrings.category);
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(gcpLoadBalancingTemplate.BasePrice);
    });

    it('TC-C183214 : Google Load Balancing : Verify Service Details are listed in Review Order page', function () {
        var loadBalObj = JSON.parse(JSON.stringify(gcpLoadBalancingTemplate));
        catalogPage.clickProviderOrCategoryCheckbox('Network');
        catalogPage.clickConfigureButtonBasedOnName(gcpLoadBalancingTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpLoadBalancingTemplate, modifiedParamMap).then(function (requiredReturnMap) {
            //expect(requiredReturnMap["Actual"]["Service Instance Name"]).toEqual(requiredReturnMap["Expected"]["Service Instance Name"]);
            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            //expect(placeOrderPage.getTextCategoryName_ReviewOrder()).toBe(messageStrings.category);
           // expect(placeOrderPage.getTextProviderName_ReviewOrder()).toBe(messageStrings.providerName);
            expect(requiredReturnMap["Actual"]["Region"]).toEqual(requiredReturnMap["Expected"]["Region"]);
            expect(requiredReturnMap["Actual"]["Type"]).toEqual(requiredReturnMap["Expected"]["Type"]);
            expect(requiredReturnMap["Actual"]["Load Balancing Traffic"]).toEqual(requiredReturnMap["Expected"]["Load Balancing Traffic"]);
	        //expect(requiredReturnMap["Actual"]["Name"]).toEqual(requiredReturnMap["Expected"]["Name"]);
            expect(requiredReturnMap["Actual"]["Backends"]).toEqual(requiredReturnMap["Expected"]["Backends"]);           
	        expect(requiredReturnMap["Actual"]["Health Check"]).toEqual(requiredReturnMap["Expected"]["Health Check"]);
	        expect(requiredReturnMap["Actual"]["Protocol"]).toEqual(requiredReturnMap["Expected"]["Protocol"]);
            expect(requiredReturnMap["Actual"]["IP"]).toEqual(requiredReturnMap["Expected"]["IP"]);
            expect(requiredReturnMap["Actual"]["Port"]).toEqual(requiredReturnMap["Expected"]["Port"]);
            expect(placeOrderPage.getEstimatedPrice_ReviewOrder()).toBe(gcpLoadBalancingTemplate.EstimatedPrice);
        });
    });    

    it('TC-C183215 : Google Load Balancing : Verify Order Details once order is submitted from catalog page ', function () {
            
        var orderObject = {};
        var orderAmount;
        var loadBalObj = JSON.parse(JSON.stringify(gcpLoadBalancingTemplate));               
        catalogPage.clickProviderOrCategoryCheckbox('Network');
        catalogPage.clickConfigureButtonBasedOnName(gcpLoadBalancingTemplate.bluePrintName);
        orderFlowUtil.fillOrderDetails(gcpLoadBalancingTemplate, modifiedParamMap);
        placeOrderPage.submitOrder();
        expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe(messageStrings.orderSubmittedConfirmationMessage);
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
        ordersPage.open();        
        expect(util.getCurrentURL()).toMatch('orders');
        ordersPage.searchOrderById(orderObject.orderNumber);
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toEqual(orderObject.orderNumber);        
        ordersPage.getTextFirstAmountOrdersTable().then(function(text){
            orderAmount = text;
        });
        ordersPage.clickFirstViewDetailsOrdersTable();        
        expect(ordersPage.getTextBasedOnLabelName("Service Name")).toEqual(serviceName);
        expect(ordersPage.getTextOrderProviderNameOrderDetails()).toEqual(messageStrings.providerName);
        expect(ordersPage.getTextFirstOrderStatusOrdersTable()).toEqual("Approval In Progress");
        //expect(ordersPage.getTextOrderServiceTypeOrderDetails()).toEqual(gcpLoadBalancingTemplate.serviceId);
        //expect(ordersPage.getTextTeamOrderDetails()).toEqual(jsonUtil.getValue(loadBalObj, "Team"));
        //expect(ordersPage.getTextBasedOnLabelName("Order Type")).toEqual("New");
        expect(ordersPage.isDisplayedApproveButtonOrderDetails()).toEqual(true);
        util.waitForAngular();        
        expect(ordersPage.getTextBasedOnLabelName("Region")).toEqual(jsonUtil.getValue(loadBalObj, "Region"));
        expect(ordersPage.getTextBasedOnLabelName("Load Balancing Traffic")).toEqual(jsonUtil.getValue(loadBalObj, "Load Balancing Traffic"));
        expect(ordersPage.getTextBasedOnLabelName("Backends")).toEqual(jsonUtil.getValue(loadBalObj, "Backends"));
        expect(ordersPage.getTextBasedOnLabelName("Health Check")).toEqual(jsonUtil.getValue(loadBalObj, "Health Check"));
                
        orderFlowUtil.verifyOrderServiceDetails(loadBalObj).then(function(status){            
            expect(status).toEqual(true);
        });
       
        ordersPage.clickBillOfMaterialsTabOrderDetails().then(function(){
            expect(ordersPage.getTextTotalCostOnBillofMaterialsOrderDetails()).toBe(gcpLoadBalancingTemplate.TotalCost);   
        });
               
	});

    if(isProvisioningRequired == "true"){
        it('TC-C183216 : Google Load Balancing : E2E: Verify Google Load Balancing Order Provisioning is working fine from consume Application', function () {
            var orderObject = {};            
            var loadBalObj = JSON.parse(JSON.stringify(gcpLoadBalancingTemplate));
            catalogPage.clickProviderOrCategoryCheckbox('Network');
            catalogPage.clickConfigureButtonBasedOnName(gcpLoadBalancingTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(gcpLoadBalancingTemplate, modifiedParamMap);
            placeOrderPage.submitOrder();
            orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
            orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
            expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
            placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
            orderFlowUtil.approveOrder(orderObject);
            orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');
            expect(orderFlowUtil.verifyOrderStatus(orderObject)).toBe('Completed');
            orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                if (status == 'Completed') {
                    orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                    expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                    orderFlowUtil.approveDeletedOrder(orderObject);
                    orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                    expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                    
                }
            })
        });
    }    
});
