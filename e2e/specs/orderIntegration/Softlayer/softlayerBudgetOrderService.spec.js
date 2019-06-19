
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
    EC = protractor.ExpectedConditions,
    isProvisioningRequired = browser.params.isProvisioningRequired,
    ipSecVPNTemplate = require('../../../../testData/OrderIntegration/Softlayer/budgetIPSecVPN.json'),

    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("cb-qa-3") ? "QA 3" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Softlayer : IPSec VPN', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, cartListPage;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'IBM Cloud', category: 'Network' };
    var slipsecvpnJsonObject = JSON.parse(JSON.stringify(ipSecVPNTemplate));

    beforeAll(function () {
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        catalogDetailsPage = new CatalogDetailsPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
        cartListPage = new CartListPage();
        browser.driver.manage().window().maximize();
    });

    afterAll(function () {
        //browser.manage().deleteAllCookies();
    });

    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);

        modifiedParamMap = { "Service Instance Name": serviceName };
        catalogPage.clickFirstCategoryCheckBoxBasedOnName(slipsecvpnJsonObject.Category);

    });



    if (isProvisioningRequired == "true") {


        it('IPSec VPN- Verify the budget for IPSec VPN', function () {
            var orderObject = {};
            var availBudgetProvCompleted, afterProvCommittedAmnt, beforePovisioningAvailBudget;
            var slipsecvpnJsonObject = JSON.parse(JSON.stringify(ipSecVPNTemplate));
            catalogPage.searchForBluePrint(slipsecvpnJsonObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(ipSecVPNTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(ipSecVPNTemplate, modifiedParamMap).then(async function (ttt) {


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

                
                // ordersPage.selectBudgetaryUnit(slipsecvpnJsonObject.budgetName);
                util.waitForAngular();


                /*************  Order Submitted *************/
                expect(ordersPage.getTextBudgetAmmount()).toEqual(slipsecvpnJsonObject.BudgetAmount);

                //Fetch the Available budget and committed Amount after order is submitted for further calculation

                var beforePovisioningCommittedAmount = await ordersPage.getTextBudgetaryCommittedAmmount();

                //Other orders awaiting approval amount should be equal to the estimated Amount  
                //This will pass if no other user are using this budget and the initial amount for this is equal to USD 0.00

                var calculatedEstAmount = ordersPage.calculateBudgetaryEstimatedAmmountforOrder(slipsecvpnJsonObject.budgetDuration, slipsecvpnJsonObject.TotalCost);


                beforePovisioningAvailBudget = await ordersPage.getTextAvailableBudget();


                expect(ordersPage.getTextOtherOrdersAwaitingApproval()).toContain(calculatedEstAmount);

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


                    //once the provisioning completed Other total amount will be USD 0.00
                    expect(ordersPage.getTextOtherOrdersAwaitingApproval()).toEqual("USD 0.00");

                    afterProvCommittedAmnt = ordersPage.calculateCommittedAmountAfterProvCompleted(beforePovisioningCommittedAmount, calculatedEstAmount);
                    expect(ordersPage.getTextBudgetaryCommittedAmmount()).toContain(afterProvCommittedAmnt);

                    expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");
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
                        var estCostAfterDeleting1MonthOrder = ordersPage.calculateEstCostAfterDeleting1MonthOrder(calculatedEstAmount, slipsecvpnJsonObject.TotalCost);
                        expect(estCostAfterDeleting1MonthOrder).toContain(ordersPage.getTextBudgetaryEstimatedAmmountforOrder());

                        var deletedCommittedAmnt = ordersPage.calculateDeleteCommittedAmount(afterProvCommittedAmnt, estCostAfterDeleting1MonthOrder);
                        expect(deletedCommittedAmnt).toContain(ordersPage.getTextBudgetaryCommittedAmmount());

                        var deletedAvailableBudget = ordersPage.calculateAfterDeletingAvailBudget(availBudgetProvCompleted, estCostAfterDeleting1MonthOrder);
                        expect(deletedAvailableBudget).toContain(ordersPage.getTextAvailableBudget());

                    }
                });
            });


        })

    }












});



