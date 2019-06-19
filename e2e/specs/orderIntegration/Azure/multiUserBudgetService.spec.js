
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
    multiUserBudgetTemplate = require('../../../../testData/OrderIntegration/Azure/multiUserBudgetService.json'),

    testEnvironment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("cb-qa-3") ? "QA 3" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";


describe('Tests for Azure : Multi user Budget for Service Bus', function () {
    var catalogPage, placeOrderPage, ordersPage, inventoryPage, catalogDetailsPage, serviceName, cartListPage,rgName,sbName;
    var modifiedParamMap = {};
    var messageStrings = { providerName: 'Azure', category: 'Other Services' };
    var multiUserBudgetObject = JSON.parse(JSON.stringify(multiUserBudgetTemplate));

    beforeAll(function () {
        catalogPage = new CatalogPage();
        placeOrderPage = new PlaceOrderPage();
        catalogDetailsPage = new CatalogDetailsPage();
        ordersPage = new OrdersPage();
        inventoryPage = new InventoryPage();
        cartListPage = new CartListPage();
        browser.driver.manage().window().maximize();
    });

   
    beforeEach(function () {
        catalogPage.open();
        expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
        serviceName = "AzureTestAutomation" + util.getRandomString(5);
        rgName = "gslautotc_azure_sbRG" + util.getRandomString(5);
        sbName = "AutoSB101" + util.getRandomString(5);
        modifiedParamMap = { "Service Instance Name": serviceName, "New Resource Group": rgName, "Service Bus Name": sbName };
       
    });



    if (isProvisioningRequired == "true") {


        it('Service Bus Verify the budget for Service Bus', function () {
            var orderObject = {};
            var availBudgetProvCompleted, afterProvCommittedAmnt, beforePovisioningAvailBudget;
            var multiUserBudgetObject = JSON.parse(JSON.stringify(multiUserBudgetTemplate));

            // Logout from the super user
            cartListPage.clickUserIcon();
            cartListPage.clickLogoutButton();

            //login with the buyer role user and place order
            cartListPage.loginFromOtherUser(multiUserBudgetObject.buyerUserID, multiUserBudgetObject.buyerUserPassword);
            expect(catalogPage.getUserID(multiUserBudgetObject.buyerUserName)).toBe(true); 
            catalogPage.open();
            catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
            catalogPage.clickFirstCategoryCheckBoxBasedOnName(multiUserBudgetObject.Category);


            catalogPage.searchForBluePrint(multiUserBudgetObject.bluePrintName);
            catalogPage.clickConfigureButtonBasedOnName(multiUserBudgetTemplate.bluePrintName);
            orderObject.servicename = serviceName;
            orderFlowUtil.fillOrderDetails(multiUserBudgetTemplate, modifiedParamMap).then(async function (ttt) {
                //Submit order through the buyer role user
                placeOrderPage.submitOrder();
                orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();


                //Get details on pop up after submit
                var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
                var orderprice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
                var ordersubmittedBy = placeOrderPage.getTextSubmittedByOrderSubmittedModal();
                var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();

                expect(ordersubmittedBy).toEqual(multiUserBudgetTemplate.buyerUserName);
               
                expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
                placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

                // Logout from the buyer role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();

                //Login with technical approval role user to approve the order technically
                cartListPage.loginFromOtherUser(multiUserBudgetObject.technicalApprovalUserID, multiUserBudgetObject.technicalApprovalUserPass);
                expect(catalogPage.getUserID(multiUserBudgetObject.technicalApprovalUser)).toBe(true); 
                orderFlowUtil.approveOrderTechnically(orderObject);//.then(function(){
                //to check budget is not present as the user have only technical approval role
                await expect(ordersPage.checkInvisibilityOfBudgetDetails()).toBe(false, "For technically approval role user Budget details is not present on the Approve order page.")
                //})

                //log out from the technically approval role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();


                //login from the financially approval role user
                cartListPage.loginFromOtherUser(multiUserBudgetObject.financialApprovalUserID, multiUserBudgetObject.financialApprovalUserPass);
                expect(catalogPage.getUserID(multiUserBudgetObject.financialApprovalUser)).toBe(true); 
                ordersPage.open();
                ordersPage.searchOrderById(orderObject.orderNumber);


                // ordersPage.selectBudgetaryUnit(multiUserBudgetObject.budgetName);
                util.waitForAngular();
                //Budget verification 
                expect(ordersPage.getTextBudgetAmmount()).toEqual(multiUserBudgetObject.BudgetAmount);
                var beforePovisioningCommittedAmount = await ordersPage.getTextBudgetaryCommittedAmmount();
                var calculatedEstAmount = ordersPage.calculateBudgetaryEstimatedAmmountforOrder(multiUserBudgetObject.budgetDuration, multiUserBudgetObject.TotalCost);
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
                cartListPage.loginFromOtherUser(multiUserBudgetObject.buyerUserID, multiUserBudgetObject.buyerUserPassword);
                expect(catalogPage.getUserID(multiUserBudgetObject.buyerUserName)).toBe(true); 
                //Place the deleteorder from the buyer role
                orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
                // expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
                catalogPage.open();
                //Logout from the buyer role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();
                //Login from the technically approval role user
                cartListPage.loginFromOtherUser(multiUserBudgetObject.technicalApprovalUserID, multiUserBudgetObject.technicalApprovalUserPass);
                expect(catalogPage.getUserID(multiUserBudgetObject.technicalApprovalUser)).toBe(true);
                orderFlowUtil.approveDeletedOrderTechnically(orderObject);
                //Logout from the technically approval role user
                cartListPage.clickUserIcon();
                cartListPage.clickLogoutButton();
                //Login from the financially approval role user
                cartListPage.loginFromOtherUser(multiUserBudgetObject.financialApprovalUserID, multiUserBudgetObject.financialApprovalUserPass);
                expect(catalogPage.getUserID(multiUserBudgetObject.financialApprovalUser)).toBe(true);


                // catalogPage.open();
                orderFlowUtil.approveDeletedOrderFinancially(orderObject);
                orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed').then(function () {

                    /********** Delete order status completed **********/
                    var estCostAfterDeleting1MonthOrder = ordersPage.calculateEstCostAfterDeleting1MonthOrder(calculatedEstAmount, multiUserBudgetObject.TotalCost);
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
                expect(catalogPage.getUserID(multiUserBudgetObject.superUserName)).toBe(true);


            });



        });
    }


});































