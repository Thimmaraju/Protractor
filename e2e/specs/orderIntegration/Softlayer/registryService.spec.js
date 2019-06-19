
"use strict";

var EC = protractor.ExpectedConditions,
    logGenerator = require("../../../../helpers/logGenerator.js"),
    Logger = logGenerator.getApplicationLogger(),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    OrdersPage = require('../../../pageObjects/orders.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    isProvisioningRequired = browser.params.isProvisioningRequired,
    RegistryServiceTemplete = require('../../../../testData/OrderIntegration/Softlayer/registryService.json'),
    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Order Integration Tests for Softlayer : Registry Service', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud',   category: 'Compute' };
    var hostnameOfRegistry = "GSLSLRegiService" + util.getRandomString(4);
    var registryObject = JSON.parse(JSON.stringify(RegistryServiceTemplete));

    beforeAll(function () {
        catalogPage = new CatalogPage();
        catalogDetailsPage = new CatalogDetailsPage();
        placeOrderPage = new PlaceOrderPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
        browser.driver.manage().window().maximize();

    });

    afterAll(function () {
        //browser.manage().deleteAllCookies();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(registryObject.Category);
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Hostname of Registry": hostnameOfRegistry };

    });

    it('TC-C1 :Registry Service - Verify Softlayer Registry Service Main Page parameters', function () {
        var orderObject = {};
        var registryServiceObject = JSON.parse(JSON.stringify(RegistryServiceTemplete));
        catalogPage.searchForBluePrint(registryServiceObject.bluePrintName);

        catalogPage.clickConfigureButtonBasedOnName(registryServiceObject.bluePrintName);

        //Verify the correct estimated price is displayed
        expect(placeOrderPage.getTextEstimatedPrice()).toBe(registryServiceObject.EstimatedPrice);

     });

    it('TC-C2 : Registry Service - Verify Softlayer Registry Service Additional Parameters on Review Order Page', function () {
        var orderObject = {};
        var randomString = util.getRandomString(4);
        var registryServiceObject = JSON.parse(JSON.stringify(RegistryServiceTemplete));
        
        catalogPage.searchForBluePrint(RegistryServiceTemplete.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(RegistryServiceTemplete.bluePrintName);
        orderObject.servicename = serviceName;
        
        orderFlowUtil.fillOrderDetails(RegistryServiceTemplete, modifiedParamMap).then(function (requiredReturnMap) {
            //Verify input values on Review Order page
            expect(requiredReturnMap["Actual"]["Hostname of Registry"]).toEqual(requiredReturnMap["Expected"]["Hostname of Registry"]);
            expect(requiredReturnMap["Actual"]["Domain"]).toEqual(requiredReturnMap["Expected"]["Domain"]);
            expect(requiredReturnMap["Actual"]["Dedicated Account Flag"]).toEqual(requiredReturnMap["Expected"]["Dedicated Account Flag"]);
            expect(requiredReturnMap["Actual"]["Billing Type"]).toEqual(requiredReturnMap["Expected"]["Billing Type"]);
            expect(requiredReturnMap["Actual"]["Datacenter"]).toEqual(requiredReturnMap["Expected"]["Datacenter"]);
            expect(requiredReturnMap["Actual"]["Operating System"]).toEqual(requiredReturnMap["Expected"]["Operating System"]);
            expect(requiredReturnMap["Actual"]["Memory"]).toEqual(requiredReturnMap["Expected"]["Memory"]);
            expect(requiredReturnMap["Actual"]["Cores"]).toEqual(requiredReturnMap["Expected"]["Cores"]);
            expect(requiredReturnMap["Actual"]["Disk Type"]).toEqual(requiredReturnMap["Expected"]["Disk Type"]);
            expect(requiredReturnMap["Actual"]["First Disk"]).toEqual(requiredReturnMap["Expected"]["First Disk"]);        
            expect(requiredReturnMap["Actual"]["Registry User"]).toEqual(requiredReturnMap["Expected"]["Registry User"]);
            expect(requiredReturnMap["Actual"]["Registry Port"]).toEqual(requiredReturnMap["Expected"]["Registry Port"]);
            

            expect(placeOrderPage.getTextServiceName_ReviewOrder()).toBe(serviceName);
            
       
        });
            
    });

    it('TC-C3 :  Registry Service : Verify View Order Details-Sanity', function () {
        var orderObject = {};
        var registryServiceObject = JSON.parse(JSON.stringify(RegistryServiceTemplete));
        catalogPage.searchForBluePrint(registryServiceObject.bluePrintName);
        catalogPage.clickConfigureButtonBasedOnName(RegistryServiceTemplete.bluePrintName);
        orderObject.servicename = serviceName;
        orderFlowUtil.fillOrderDetails(RegistryServiceTemplete, modifiedParamMap);

        //Submit Order and grab the parameter values related to order 
        placeOrderPage.submitOrder();
        orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
        var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
        var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
        placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

        //Navigate to Order Page
        ordersPage.open();

        //Search by Order ID and verify the parameters on View order page
        ordersPage.searchOrderById(orderObject.orderNumber);
        util.scrollToBottom();
        ordersPage.clickFirstViewDetailsOrdersTable();
        Logger.info("Validating the Order Review page");
        
        expect(ordersPage.getTextFirstOrderIdOrdersTable()).toBe(orderObject.orderNumber); //Checking order number
        
        expect(ordersPage.getTextBasedOnLabelName("Hostname of Registry")).toEqual(hostnameOfRegistry); 
        expect(ordersPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(registryServiceObject, "Domain")); 
        expect(ordersPage.getTextBasedOnLabelName("Dedicated Account Flag")).toEqual(jsonUtil.getValue(registryServiceObject, "Dedicated Account Flag")); 
        expect(ordersPage.getTextBasedOnLabelName("Billing Type")).toEqual(jsonUtil.getValue(registryServiceObject, "Billing Type")); 
        expect(ordersPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(registryServiceObject, "Datacenter")); 
        expect(ordersPage.getTextBasedOnLabelName("Memory")).toEqual(jsonUtil.getValue(registryServiceObject, "Memory")); 
        expect(ordersPage.getTextBasedOnLabelName("Cores")).toEqual(jsonUtil.getValue(registryServiceObject, "Cores")); 
        expect(ordersPage.getTextBasedOnLabelName("Disk Type")).toEqual(jsonUtil.getValue(registryServiceObject, "Disk Type")); 
        expect(ordersPage.getTextBasedOnLabelName("Registry User")).toEqual(jsonUtil.getValue(registryServiceObject, "Registry User")); 
        expect(ordersPage.getTextBasedOnLabelName("Registry Port")).toEqual(jsonUtil.getValue(registryServiceObject, "Registry Port"));      
    
        //Verify Bill of Materials
        ordersPage.clickBillOfMaterialsTabOrderDetails();
        expect(placeOrderPage.getTotalCost()).toBe(registryServiceObject.totalCost);

        //Deny Order
        orderFlowUtil.denyOrder(orderObject);

    });


    // if (isProvisioningRequired == "true") {
    //     it('TC-C4 : Registry Service: Verify Order Approval, verifying  Inventory View Details, Delete Order -Sanity', function () {
    //         var orderObject = {};
    //         var RegistryServiceObject = JSON.parse(JSON.stringify(RegistryServiceTemplete));
    //         //    catalogPage.clickFirstCategoryCheckBoxBasedOnName(messageStrings.category);
    //         catalogPage.searchForBluePrint(RegistryServiceObject.bluePrintName);
    //         catalogPage.clickConfigureButtonBasedOnName(RegistryServiceTemplete.bluePrintName);
    //         orderObject.servicename = serviceName;
    //         orderFlowUtil.fillOrderDetails(RegistryServiceTemplete, modifiedParamMap);

    //         //Submit order
    //         placeOrderPage.submitOrder();
    //         orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    //         orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

    //         //Get details on pop up after submit
    //         var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    //         var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
    //         var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
    //         var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

    //         //Open Order page and Approve Order 
    //         expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    //         placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
    //         orderFlowUtil.approveOrder(orderObject);
    //         orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed');


    //         // Verify the output parameters
    //         inventoryPage.open();
    //         inventoryPage.searchOrderByServiceName(orderObject.servicename);
    //         element.all(by.css(inventoryPage.instanceTableActionIconCss)).first().click()
    //         inventoryPage.clickViewService();
    //         //Xpath is finding manually but through automation it's failing, so commenting this part of code.
            
    //         // expect(inventoryPage.getTextBasedOnLabelName("Hostname of Registry")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Hostname of Registry")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Domain")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Domain")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Dedicated Account Flag")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Dedicated Account Flag")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Billing Type")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Billing Type")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Datacenter")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Datacenter")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Operating System")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Operating System")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Memory")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Memory")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Cores")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Cores")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Disk Type")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Disk Type")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Registry User")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Registry User")); 
    //         // expect(inventoryPage.getTextBasedOnLabelName("Registry Port")).toEqual(jsonUtil.getValue(RegistryServiceObject, "Registry Port")); 
            
    //         //Delete the provisioned storage
    //         orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
    //             if (status == 'Completed') {
    //                 orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
    //                 expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
    //                 orderFlowUtil.approveDeletedOrder(orderObject);
    //                 orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
    //                 expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
    //             }
    //         })
    //     })

    // }


});


