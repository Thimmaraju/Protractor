
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
    superUserUsername = browser.params.username,
    superUserPassword = browser.params.password,
    ipSecVPNTemplate = require('../../../../testData/OrderIntegration/Softlayer/multiUserIPSecVPN.json'),

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
        serviceName = "GSLSLTestAutomation" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName };
    });



    if (isProvisioningRequired == "true") {


        it('IPSec VPN- Verify the budget for IPSec VPN', function () {
            var orderObject = {};
            var availBudgetProvCompleted, afterProvCommittedAmnt, beforePovisioningAvailBudget;
            var slipsecvpnJsonObject = JSON.parse(JSON.stringify(ipSecVPNTemplate));

            // Logout from the super user
            cartListPage.clickUserIcon();
            cartListPage.clickLogoutButton();

            //login with the buyer role user and place order
            cartListPage.loginFromOtherUser(slipsecvpnJsonObject.buyerUserID, slipsecvpnJsonObject.buyerUserPassword);
            catalogPage.open();
            catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(slipsecvpnJsonObject.Category);


            catalogPage.searchForBluePrint(slipsecvpnJsonObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(ipSecVPNTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(ipSecVPNTemplate, modifiedParamMap).then(async function (ttt) {
                //Submit order through the buyer role user
                placeOrderPage.submitOrder();
                orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();


                //Get details on pop up after submit
                var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
                var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

                expect(ordersubmittedBy).toEqual(ipSecVPNTemplate.buyerUserName);
               
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                // Logout from the buyer role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();

                //Login with technical approval role user to approve the order technically
                cartListPage.loginFromOtherUser(slipsecvpnJsonObject.technicalApprovalUserID, slipsecvpnJsonObject.technicalApprovalUserPass);
                orderFlowUtil.approveOrderTechnically(orderObject);//.then(function(){
                //to check budget is not present as the user have only technical approval role
                await expect(ordersPage.checkInvisibilityOfBudgetDetails()).toBe(false, "For technically approval role user Budget details is not present on the Approve order page.")
                //})

                //log out from the technically approval role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();


                //login from the financially approval role user
                cartListPage.loginFromOtherUser(slipsecvpnJsonObject.financialApprovalUserID, slipsecvpnJsonObject.financialApprovalUserPass);

                ordersPage.open();
                ordersPage.searchOrderById(orderObject.orderNumber);


                // ordersPage.selectBudgetaryUnit(slipsecvpnJsonObject.budgetName);
                util.waitForAngular();
                //Budget verification 
                expect(ordersPage.getTextBudgetAmmount()).toEqual(slipsecvpnJsonObject.BudgetAmount);
                var beforePovisioningCommittedAmount = await ordersPage.getTextBudgetaryCommittedAmmount();
                var calculatedEstAmount = ordersPage.calculateBudgetaryEstimatedAmmountforOrder(slipsecvpnJsonObject.budgetDuration, slipsecvpnJsonObject.TotalCost);
                beforePovisioningAvailBudget = await ordersPage.getTextAvailableBudget();
                var costOtherOrdersAwaitingApprovalBeforeProvision = await ordersPage.getTextOtherOrdersAwaitingApproval();
                expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");
                expect(ordersPage.getTextBudgetaryEstimatedAmmountforOrder()).toContain(calculatedEstAmount);



                orderFlowUtil.approveOrderFinancially(orderObject);
                orderFlowUtil.waitForOrderStatusChange(orderObject, 'Completed').then(function () {

                    /********** Order provisioning completed **********/
                    //order status completed 
                    availBudgetProvCompleted = ordersPage.calculateAvailableBudgetAfterProvCompleted(beforePovisioningAvailBudget, calculatedEstAmount);
                    expect(ordersPage.getTextAvailableBudget()).toContain(availBudgetProvCompleted);


                    var actualOrdersAwaitingApprovalAmout = ordersPage.calculateAfterProvOtherOrderAwaitingApprovalAmount(costOtherOrdersAwaitingApprovalBeforeProvision, calculatedEstAmount);
                    expect(ordersPage.getTextOtherOrdersAwaitingApproval()).toEqual(actualOrdersAwaitingApprovalAmout);

                    afterProvCommittedAmnt = ordersPage.calculateCommittedAmountAfterProvCompleted(beforePovisioningCommittedAmount, calculatedEstAmount);
                    expect(ordersPage.getTextBudgetaryCommittedAmmount()).toContain(afterProvCommittedAmnt);

                    expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");
                });
                browser.ignoreSynchronization = false;
                ordersPage.open();

                //Logout from the financial approval user roles
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();

                //Login from the buyer role user 
                cartListPage.loginFromOtherUser(slipsecvpnJsonObject.buyerUserID, slipsecvpnJsonObject.buyerUserPassword);
                //Place the deleteorder from the buyer role
                orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                // expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                catalogPage.open();
                //Logout from the buyer role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();
                //Login from the technically approval role user
                cartListPage.loginFromOtherUser(slipsecvpnJsonObject.technicalApprovalUserID, slipsecvpnJsonObject.technicalApprovalUserPass);
                orderFlowUtil.approveDeletedOrderTechnically(orderObject);
                //Logout from the technically approval role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();
                //Login from the financially approval role user
                cartListPage.loginFromOtherUser(slipsecvpnJsonObject.financialApprovalUserID, slipsecvpnJsonObject.financialApprovalUserPass);
                // catalogPage.open();
                orderFlowUtil.approveDeletedOrderFinancially(orderObject);
                orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed').then(function () {

                    /********** Delete order status completed **********/
                    var estCostAfterDeleting1MonthOrder = ordersPage.calculateEstCostAfterDeleting1MonthOrder(calculatedEstAmount, slipsecvpnJsonObject.TotalCost);
                    expect(estCostAfterDeleting1MonthOrder).toContain(ordersPage.getTextBudgetaryEstimatedAmmountforOrder());

                    var deletedCommittedAmnt = ordersPage.calculateDeleteCommittedAmount(afterProvCommittedAmnt, estCostAfterDeleting1MonthOrder);
                    expect(deletedCommittedAmnt).toContain(ordersPage.getTextBudgetaryCommittedAmmount());

                    var deletedAvailableBudget = ordersPage.calculateAfterDeletingAvailBudget(availBudgetProvCompleted, estCostAfterDeleting1MonthOrder);
                    expect(deletedAvailableBudget).toContain(ordersPage.getTextAvailableBudget());


                    // expect(orderFlowUtil.verifyOrderStatusDeletedOrder(orderObject)).toBe('Completed');
                });
                //Logout from the financially approval role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();
                //Login with super user
                cartListPage.loginFromOtherUser(superUserUsername, superUserPassword);
                catalogPage.open();
                expect(catalogPage.extractUserFirstName()).toEqual(slipsecvpnJsonObject.superUserName);


            });



        });
    }


});































