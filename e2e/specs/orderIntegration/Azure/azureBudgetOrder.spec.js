
"use strict";

var logGenerator = require("../../../../helpers/logGenerator.js"),
    Logger = logGenerator.getApplicationLogger(),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    OrdersPage = require('../../../pageObjects/orders.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    CartListPage = require('../../../pageObjects/cartList.pageObject.js'),
    BudgetaryPage = require('../../../pageObjects/budget.pageObject.js'),
    EC = protractor.ExpectedConditions,
    isProvisioningRequired = browser.params.isProvisioningRequired,
    // cosmosDBTemplate = require('../../../../testData/OrderIntegration/Azure/CosmosDB.json'),
    cosmosDBTemplate = require('../../../../testData/OrderIntegration/Azure/budgetOrderDetails.json'),

    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("cb-qa-3") ? "QA 3" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Azure : Cosmos DB', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, cartListPage, budgetryPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Azure', category: 'Network' };
    // var messageStrings = { providerName: 'IBM Cloud', category: 'Network' };
    var azcosmosDBJsonObject = JSON.parse(JSON.stringify(cosmosDBTemplate));

    beforeAll(function () {
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        catalogDetailsPage = new CatalogDetailsPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
        cartListPage = new CartListPage();
        budgetryPage = new BudgetaryPage();
        browser.driver.manage().window().maximize();
    });

    afterAll(function () {
        //browser.manage().deleteAllCookies();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        serviceName = "AzureLTestAutomation" + util.getRandomString(5);

        modifiedParamMap = { "Service Instance Name": serviceName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(azcosmosDBJsonObject.Category);

    });



    if (isProvisioningRequired == "true") {


        it(' Verify the budget for Cosmos DB', function () {
            var orderObject = {};
            var availBudgetProvCompleted, afterProvCommittedAmnt, beforePovisioningAvailBudget, calculatedEstAmtOnBudgetPage,afterProvCommittedAmntOnBudgetPage,afterPovisioningAvailBudgetOnBudgetPage;
            var azcosmosDBJsonObject = JSON.parse(JSON.stringify(cosmosDBTemplate));
            catalogPage.searchForBluePrint(azcosmosDBJsonObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(cosmosDBTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(cosmosDBTemplate, modifiedParamMap).then(async function () {


                //Submit order

                placeOrderPage.submitOrder();
                orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();


                //Get details on pop up after submit
                var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
                var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

                // Open Order page and Approve Order 
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();



                //Open Approve order page
                ordersPage.open();
                //Search by Order ID and verify the parameters on View order page
                ordersPage.searchOrderById(orderObject.orderNumber);


                // ordersPage.selectBudgetaryUnit(azcosmosDBJsonObject.budgetaryName);
                util.waitForAngular();


                /*************  Order Submitted *************/
                expect(ordersPage.getTextBudgetAmmount()).toEqual(azcosmosDBJsonObject.BudgetAmount);

                //Fetch the Available budget and committed Amount after order is submitted for further calculation

                var beforePovisioningCommittedAmount = await ordersPage.getTextBudgetaryCommittedAmmount();

                //Other orders awaiting approval amount should be equal to the estimated Amount  
                //This will pass if no other user are using this budget and the initial amount for this is equal to USD 0.00

                var calculatedEstAmount = ordersPage.calculateBudgetaryEstimatedAmmountforOrder(azcosmosDBJsonObject.budgetDuration, azcosmosDBJsonObject.TotalCost);


                beforePovisioningAvailBudget = await ordersPage.getTextAvailableBudget();
                var costOtherOrdersAwaitingApprovalBeforeProvision = await ordersPage.getTextOtherOrdersAwaitingApproval();

                

                //As the spend amount is always zero 
                expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");

                expect(ordersPage.getTextBudgetaryEstimatedAmmountforOrder()).toContain(calculatedEstAmount);


                /*********Approve the order ********************/

                orderFlowUtil.approveOrder(orderObject);
                orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed').then(async function () {

                    /********** Order provisioning completed **********/
                    //order status completed 
                    //once the provisioning completed Other total amount will be equal to ( Other total amount before provision - calculated Est Amount)
                    var actualOrdersAwaitingApprovalAmout = ordersPage.calculateAfterProvOtherOrderAwaitingApprovalAmount(costOtherOrdersAwaitingApprovalBeforeProvision, calculatedEstAmount);
                    expect(ordersPage.getTextOtherOrdersAwaitingApproval()).toEqual(actualOrdersAwaitingApprovalAmout);

                    availBudgetProvCompleted = ordersPage.calculateAvailableBudgetAfterProvCompleted(beforePovisioningAvailBudget, calculatedEstAmount);
                    expect(ordersPage.getTextAvailableBudget()).toContain(availBudgetProvCompleted);


                    //once the provisioning completed Other total amount will be USD 0.00
                    expect(ordersPage.getTextOtherOrdersAwaitingApproval()).toEqual("USD 0.00");

                    afterProvCommittedAmnt = ordersPage.calculateCommittedAmountAfterProvCompleted(beforePovisioningCommittedAmount, calculatedEstAmount);
                    expect(ordersPage.getTextBudgetaryCommittedAmmount()).toContain(afterProvCommittedAmnt);

                    expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");
                    /**************************Check Budget Details on Budget Page after Provisioning**************************************/

                    calculatedEstAmtOnBudgetPage = budgetryPage.calculateEstimatedAmmountforOrder(azcosmosDBJsonObject.budgetDuration, azcosmosDBJsonObject.TotalCost);
                     afterProvCommittedAmntOnBudgetPage = budgetryPage.calculateCommittedAmountAfterProvCompletedOnBudgetPage(beforePovisioningCommittedAmount, calculatedEstAmtOnBudgetPage);
                     afterPovisioningAvailBudgetOnBudgetPage = budgetryPage.calculateAvailableBudgetAfterProvCompletedOnBudgetPage(beforePovisioningAvailBudget, calculatedEstAmtOnBudgetPage);
                    budgetryPage.open();
                    expect(util.getCurrentURL()).toMatch(appUrls.budgetaryUrl);
                    util.waitForAngular();
                    budgetryPage.isPresentbudgetryUnitsText();
                    budgetryPage.isPresentAddNewBudgetryUnitBtn();
                    budgetryPage.isPresentBudgetryUnitsTable();
                    budgetryPage.selectbudgetaryPaginationDropDown();

                    var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(azcosmosDBJsonObject.budgetaryName);
                    expect(status).toEqual("Active");
                    budgetryPage.clickOnViewDetailsForBudgetaryUnit(azcosmosDBJsonObject.budgetaryName, azcosmosDBJsonObject.budgetName);
                    expect(budgetryPage.getTextBudgetAmmount()).toEqual('1000.00');
                    expect(budgetryPage.getTextAvailableAmount()).toContain(afterPovisioningAvailBudgetOnBudgetPage);
                    expect(budgetryPage.getTextCommittedAmount()).toContain(afterProvCommittedAmntOnBudgetPage);
                    expect(budgetryPage.getTextUnderAprovalAmount()).toEqual('0.00');



                });



                /************** Delete the order ****************/
                orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                    if (status == 'Completed') {
                        orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                        expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(orderObject);
                        orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');


                        /********** Delete order status completed **********/
                        var estCostAfterDeleting1MonthOrder = ordersPage.calculateEstCostAfterDeleting1MonthOrder(calculatedEstAmount, azcosmosDBJsonObject.TotalCost);
                        expect(ordersPage.getTextBudgetaryEstimatedAmmountforOrder()).toContain(estCostAfterDeleting1MonthOrder);

                        var deletedCommittedAmnt = ordersPage.calculateDeleteCommittedAmount(afterProvCommittedAmnt, estCostAfterDeleting1MonthOrder);
                        expect(ordersPage.getTextBudgetaryCommittedAmmount()).toContain(deletedCommittedAmnt);

                        var deletedAvailableBudget = ordersPage.calculateAfterDeletingAvailBudget(availBudgetProvCompleted, estCostAfterDeleting1MonthOrder);
                        expect(ordersPage.getTextAvailableBudget()).toContain(deletedAvailableBudget);

                        /**************************Check Budget Details on Budget Page after Deletion**************************************/
                        var estCostAfterDeleting1MonthOrderOnBudgetPage = budgetryPage.calculateEstCostAfterDeleting1MonthOrderOnBudgetPage(calculatedEstAmtOnBudgetPage, azcosmosDBJsonObject.TotalCost);
                        var deletedCommittedAmntOnBudgetPage = budgetryPage.calculateDeleteCommittedAmountOnBudgetPage(afterProvCommittedAmntOnBudgetPage, estCostAfterDeleting1MonthOrderOnBudgetPage);
                        var deletedAvailableBudgetOnBudgetPage = budgetryPage.calculateAfterDeletingAvailBudgetOnBudgetPage(afterPovisioningAvailBudgetOnBudgetPage, estCostAfterDeleting1MonthOrderOnBudgetPage);
                        budgetryPage.open();
                        expect(util.getCurrentURL()).toMatch(appUrls.budgetaryUrl);
                        util.waitForAngular();
                        budgetryPage.isPresentbudgetryUnitsText();
                        budgetryPage.isPresentAddNewBudgetryUnitBtn();
                        budgetryPage.isPresentBudgetryUnitsTable();
                        budgetryPage.selectbudgetaryPaginationDropDown();
                        var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(azcosmosDBJsonObject.budgetaryName);
                        expect(status).toEqual("Active");
                        budgetryPage.clickOnViewDetailsForBudgetaryUnit(azcosmosDBJsonObject.budgetaryName, azcosmosDBJsonObject.budgetName);
                        expect(budgetryPage.getTextBudgetAmmount()).toEqual('1000.00');
                        expect(budgetryPage.getTextAvailableAmount()).toContain(deletedAvailableBudgetOnBudgetPage);
                        expect(budgetryPage.getTextCommittedAmount()).toContain(deletedCommittedAmntOnBudgetPage);
                        expect(budgetryPage.getTextUnderAprovalAmount()).toEqual('0.00');
                    }
                });





            });


        });

    }



});

