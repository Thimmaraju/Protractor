

"use strict";
var Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	OrderHistoryPage = require('../../../pageObjects/ordersHistory.pageObject.js'),
	CartListPage = require('../../../pageObjects/cartList.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),

	persistentDiskTemplate = require('../../../../testData/OrderIntegration/Google/persistentdisk.json');

describe('GCP - Cart Functionlaities', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage, cartListPage, orderHistoryPage, serviceName, cartName;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Google',
		catalogPageTitle: 'Search, Select and Configure',
		inputServiceNameWarning: "Parameter Warning:",
		orderSubmittedConfirmationMessage: 'Order Submitted',
	};

	beforeAll(function () {
		ordersPage = new Orders();
		homePage = new HomePage();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		cartListPage = new CartListPage();
		orderHistoryPage = new OrderHistoryPage();
		browser.driver.manage().window().maximize();
	});

	beforeEach(function () {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		serviceName = "auto-disk-" + util.getRandomString(5);
		modifiedParamMap = { "Service Instance Name": serviceName, "Environment": "gcpEnv", "Application": "gcpApp" };
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
	});
	//Pre-Requisite
	/*1.Make sure to have budget is already created.
	2.Context text for Environment and application must be available.
	3.Context must be mapped to TEAM.*/

	it('GCP : Budget Validation for GCP Service', function () {
		var availBudgetProvCompleted, afterProvCommittedAmnt, beforePovisioningAvailBudget;
		var orderObject = {};
		var persistentDiskInsObject = JSON.parse(JSON.stringify(persistentDiskTemplate));
		orderObject.servicename = serviceName;
		catalogPage.clickConfigureButtonBasedOnName(persistentDiskTemplate.bluePrintName);

		orderFlowUtil.fillOrderDetails(persistentDiskTemplate, modifiedParamMap).then(async function (ttt) {
			//Submit order
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();

			//Get details on pop up after submit
			var ordernumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
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
			ordersPage.selectBudgetaryUnit(persistentDiskTemplate.budgetName);
			util.waitForAngular();

			/*************  Order Submitted *************/
			expect(ordersPage.getTextBudgetAmmount()).toEqual(persistentDiskTemplate.BudgetAmount);

			//Fetch the Available budget and committed Amount after order is submitted for further calculation
			var beforePovisioningCommittedAmount = await ordersPage.getTextBudgetaryCommittedAmmount();

			//Other orders awaiting approval amount should be equal to the estimated Amount  
			//This will pass if no other user are using this budget and the initial amount for this is equal to USD 0.00

			var calculatedEstAmount = ordersPage.calculateBudgetaryEstimatedAmmountforOrder(persistentDiskTemplate.budgetDuration, persistentDiskTemplate.TotalCost);
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
				//expect(ordersPage.getTextOtherOrdersAwaitingApproval()).toEqual(actualOrdersAwaitingApprovalAmout);
				ordersPage.getTextOtherOrdersAwaitingApproval().then(function(expctdOrdersAwaitingApprovalAmout){
					expect(expctdOrdersAwaitingApprovalAmout.replace(",", "")).toEqual(actualOrdersAwaitingApprovalAmout);
				});

				afterProvCommittedAmnt = ordersPage.calculateCommittedAmountAfterProvCompleted(beforePovisioningCommittedAmount, calculatedEstAmount);
				expect(ordersPage.getTextBudgetaryCommittedAmmount()).toContain(afterProvCommittedAmnt);
				expect(ordersPage.getTextBudgetarySpendAmmount()).toEqual("USD 0.00");
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
					var estCostAfterDeleting1MonthOrder = ordersPage.calculateEstCostAfterDeleting1MonthOrder(calculatedEstAmount, persistentDiskInsObject.TotalCost);
					expect(estCostAfterDeleting1MonthOrder).toContain(ordersPage.getTextBudgetaryEstimatedAmmountforOrder());

					var deletedCommittedAmnt = ordersPage.calculateDeleteCommittedAmount(afterProvCommittedAmnt, estCostAfterDeleting1MonthOrder);
					expect(deletedCommittedAmnt).toContain(ordersPage.getTextBudgetaryCommittedAmmount());

					var deletedAvailableBudget = ordersPage.calculateAfterDeletingAvailBudget(availBudgetProvCompleted, estCostAfterDeleting1MonthOrder);
					expect(deletedAvailableBudget).toContain(ordersPage.getTextAvailableBudget());
				}
			});

		});

	});

});
