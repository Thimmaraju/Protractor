
"use strict";

var logGenerator = require("../../../../helpers/logGenerator.js"),
    Logger = logGenerator.getApplicationLogger(),
    CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
    CatalogDetailsPage = require('../../../pageObjects/catalogdetails.pageObject.js'),
    jsonUtil = require('../../../../helpers/jsonUtil.js'),
    PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
    OrdersPage = require('../../../pageObjects/orders.pageObject.js'),
    InventoryPage = require('../../../pageObjects/inventory.pageObject.js'),
    BudgetaryPage = require('../../../pageObjects/budget.pageObject.js'),
    util = require('../../../../helpers/util.js'),
    orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
    appUrls = require('../../../../testData/appUrls.json'),
    EC = protractor.ExpectedConditions,
    isProvisioningRequired = browser.params.isProvisioningRequired,
    ec2InstanceTemplate = require('../../../../testData/OrderIntegration/AWS/AWSEC2Instance.json'),

    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("cb-qa-3") ? "QA 3" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";



describe('AWS : Budget', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, budgetryPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Amazon', category: 'Compute' };
    var ec2JsonObject = JSON.parse(JSON.stringify(ec2InstanceTemplate));

    beforeAll(function () {
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        catalogDetailsPage = new CatalogDetailsPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
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
        serviceName = "TestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "Environment": "awsEnv", "Application": "awsApp" };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(ec2JsonObject.Category);

    });



    if (isProvisioningRequired == "true") {
        it('AWS EC2 - Verify the budget for EC2', function () {
            var orderObject = {};
            var availBudgetProvCompleted, afterProvCommittedAmnt, beforePovisioningAvailBudget, calculatedEstAmtOnBudgetPage, afterPovisioningAvailBudgetOnBudgetPage, afterProvCommittedAmntOnBudgetPage;
            var ec2JsonObject = JSON.parse(JSON.stringify(ec2InstanceTemplate));
            var budgetAmount = '1000.00';
            var zerobudgetAmount = '0.00';
            catalogPage.searchForBluePrint(ec2JsonObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(ec2InstanceTemplate.bluePrintName);
            orderObject.servicename = serviceName;

            orderFlowUtil.fillOrderDetails(ec2InstanceTemplate, modifiedParamMap).then(async function (ttt) {

                //Submit order
                placeOrderPage.submitOrder();
                orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

                //Get details on pop up after submit
                var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();

                // Open Order page and Approve Order 
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                //Open Approve order page
                ordersPage.open();
                //Search by Order ID and verify the parameters on View order page
                ordersPage.searchOrderById(orderObject.orderNumber);

                //select Budgetary Unit
                ordersPage.selectBudgetaryUnit(ec2JsonObject.budgetName);
                util.waitForAngular();

                /*************  Order Submitted *************/
                expect(ordersPage.getTextBudgetAmmount()).toEqual(ec2JsonObject.BudgetAmount);

                //Fetch the Available budget and committed Amount after order is submitted for further calculation
                var beforePovisioningCommittedAmount = await ordersPage.getTextBudgetaryCommittedAmmount();

                //Other orders awaiting approval amount should be equal to the estimated Amount  
                //This will pass if no other user are using this budget and the initial amount for this is equal to USD 0.00

                var calculatedEstAmount = ordersPage.calculateBudgetaryEstimatedAmmountforOrder(ec2JsonObject.budgetDuration, ec2JsonObject.TotalCost);
                beforePovisioningAvailBudget = await ordersPage.getTextAvailableBudget();
                var costOtherOrdersAwaitingApprovalBeforeProvision = await ordersPage.getTextOtherOrdersAwaitingApproval();
                //expect(costOtherOrdersAwaitingApprovalBeforeProvision).toContain(calculatedEstAmount);

                //As the spend amount is always zero 
                expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");
                expect(ordersPage.getTextBudgetaryEstimatedAmmountforOrder()).toContain(calculatedEstAmount);

                /*********Approve the order ********************/
                orderFlowUtil.approveOrder(orderObject);
                orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed').then(function () {

                    /********** Order provisioning completed **********/
                    //order status completed 
                    availBudgetProvCompleted = ordersPage.calculateAvailableBudgetAfterProvCompleted(beforePovisioningAvailBudget, calculatedEstAmount);
                    expect(ordersPage.getTextAvailableBudget()).toContain(availBudgetProvCompleted);

                    //once the provisioning completed Other total amount will be equal to ( Other total amount before provision - calculated Est Amount)
                    var actualOrdersAwaitingApprovalAmout = ordersPage.calculateAfterProvOtherOrderAwaitingApprovalAmount(costOtherOrdersAwaitingApprovalBeforeProvision, calculatedEstAmount);
                    expect(ordersPage.getTextOtherOrdersAwaitingApproval()).toEqual(actualOrdersAwaitingApprovalAmout);

                    afterProvCommittedAmnt = ordersPage.calculateCommittedAmountAfterProvCompleted(beforePovisioningCommittedAmount, calculatedEstAmount);
                    expect(ordersPage.getTextBudgetaryCommittedAmmount()).toContain(afterProvCommittedAmnt);
                    expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");

                    /**************************Check Budget Details on Budget Page after Provisioning**************************************/

                    calculatedEstAmtOnBudgetPage = budgetryPage.calculateEstimatedAmmountforOrder(ec2JsonObject.budgetDuration, ec2JsonObject.TotalCost);
                    afterProvCommittedAmntOnBudgetPage = budgetryPage.calculateCommittedAmountAfterProvCompletedOnBudgetPage(beforePovisioningCommittedAmount, calculatedEstAmtOnBudgetPage);
                    afterPovisioningAvailBudgetOnBudgetPage = budgetryPage.calculateAvailableBudgetAfterProvCompletedOnBudgetPage(beforePovisioningAvailBudget, calculatedEstAmtOnBudgetPage);
                    budgetryPage.open();
                    expect(util.getCurrentURL()).toMatch(appUrls.budgetaryUrl);
                    util.waitForAngular();
                    budgetryPage.isPresentbudgetryUnitsText();
                    budgetryPage.isPresentAddNewBudgetryUnitBtn();
                    budgetryPage.isPresentBudgetryUnitsTable();
                    budgetryPage.selectbudgetaryPaginationDropDown();

                    var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(ec2JsonObject.budgetaryName);
                    expect(status).toEqual("Active");
                    budgetryPage.clickOnViewDetailsForBudgetaryUnit(ec2JsonObject.budgetaryName, ec2JsonObject.budgetName);
                    expect(budgetryPage.getTextBudgetAmmount()).toEqual(budgetAmount);
                    expect(budgetryPage.getTextAvailableAmount()).toContain(afterPovisioningAvailBudgetOnBudgetPage);
                    expect(budgetryPage.getTextCommittedAmount()).toContain(afterProvCommittedAmntOnBudgetPage);
                    expect(budgetryPage.getTextUnderAprovalAmount()).toEqual(zerobudgetAmount);
                })

                /************** Delete the order ****************/
                orderFlowUtil.verifyOrderStatus(orderObject).then(function (status) {
                    if (status == 'Completed') {
                        orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                        expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                        orderFlowUtil.approveDeletedOrder(orderObject);
                        orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed');
                        expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');

                        /********** Delete order status completed **********/
                        var estCostAfterDeleting1MonthOrder = ordersPage.calculateEstCostAfterDeleting1MonthOrder(calculatedEstAmount, ec2JsonObject.TotalCost);
                        expect(estCostAfterDeleting1MonthOrder).toContain(ordersPage.getTextBudgetaryEstimatedAmmountforOrder());

                        var deletedCommittedAmnt = ordersPage.calculateDeleteCommittedAmount(afterProvCommittedAmnt, estCostAfterDeleting1MonthOrder);
                        expect(deletedCommittedAmnt).toContain(ordersPage.getTextBudgetaryCommittedAmmount());

                        var deletedAvailableBudget = ordersPage.calculateAfterDeletingAvailBudget(availBudgetProvCompleted, estCostAfterDeleting1MonthOrder);
                        expect(deletedAvailableBudget).toContain(ordersPage.getTextAvailableBudget());

                        /************************** Check Budget Details on Budget Page after Deletion **************************************/
                        var estCostAfterDeleting1MonthOrderOnBudgetPage = budgetryPage.calculateEstCostAfterDeleting1MonthOrderOnBudgetPage(calculatedEstAmtOnBudgetPage, ec2JsonObject.TotalCost);
                        var deletedCommittedAmntOnBudgetPage = budgetryPage.calculateDeleteCommittedAmountOnBudgetPage(afterProvCommittedAmntOnBudgetPage, estCostAfterDeleting1MonthOrderOnBudgetPage);
                        var deletedAvailableBudgetOnBudgetPage = budgetryPage.calculateAfterDeletingAvailBudgetOnBudgetPage(afterPovisioningAvailBudgetOnBudgetPage, estCostAfterDeleting1MonthOrderOnBudgetPage);
                        budgetryPage.open();
                        expect(util.getCurrentURL()).toMatch(appUrls.budgetaryUrl);
                        util.waitForAngular();
                        budgetryPage.isPresentbudgetryUnitsText();
                        budgetryPage.isPresentAddNewBudgetryUnitBtn();
                        budgetryPage.isPresentBudgetryUnitsTable();
                        budgetryPage.selectbudgetaryPaginationDropDown();
                        var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(ec2JsonObject.budgetaryName);
                        expect(status).toEqual("Active");
                        budgetryPage.clickOnViewDetailsForBudgetaryUnit(ec2JsonObject.budgetaryName, ec2JsonObject.budgetName);
                        expect(budgetryPage.getTextBudgetAmmount()).toEqual(budgetAmount);
                        expect(budgetryPage.getTextAvailableAmount()).toContain(deletedAvailableBudgetOnBudgetPage);
                        expect(budgetryPage.getTextCommittedAmount()).toContain(deletedCommittedAmntOnBudgetPage);
                        expect(budgetryPage.getTextUnderAprovalAmount()).toEqual(zerobudgetAmount);
                    }
                });
            });
        })
    }
});



