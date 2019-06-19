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
	superUserUsername = browser.params.username,
	superUserPassword = browser.params.password,

	userCredentialsTemplate = require('../../../../testData/credentials.json'),
	persistentDiskTemplate = require('../../../../testData/OrderIntegration/Google/persistentdisk.json');

describe('GCP - Multi user budget Functionlaities', function () {
	var ordersPage, homePage, catalogPage, placeOrderPage, cartListPage, orderHistoryPage, serviceName, cartName, userCredntialsObject;
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
		userCredntialsObject = JSON.parse(JSON.stringify(userCredentialsTemplate));		
	});

	beforeEach(function () {		
		serviceName = "auto-disk-" + util.getRandomString(5);
		modifiedParamMap = { "Service Instance Name": serviceName, "Environment": "gcpEnv", "Application": "gcpApp", "Provider Account": "" };
	});
	
	//Pre-Requisite
	/*1.Make sure to have budget is already created.
	2.Context text for Environment and application must be available.
	3.Context must be mapped to TEAM.*/

	it('GCP : Multi User Budget Validation for GCP Persistent disk Service', function () {
		var availBudgetProvCompleted, afterProvCommittedAmnt, beforePovisioningAvailBudget;
		var orderObject = {};
		var persistentDiskInsObject = JSON.parse(JSON.stringify(persistentDiskTemplate));

		// Logout from the super user
		cartListPage.clickUserIcon();
		cartListPage.clickLogoutButton();
		//login with the buyer role user and place order
		cartListPage.loginFromOtherUser(userCredntialsObject.buyerUserID, userCredntialsObject.buyerUserPassword);
		expect(catalogPage.getUserID(userCredntialsObject.buyerUserName)).toBe(true);
		catalogPage.open();
		catalogPage.clickProviderOrCategoryCheckbox(messageStrings.providerName);
		catalogPage.clickFirstCategoryCheckBoxBasedOnName(persistentDiskTemplate.Category);
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

			expect(ordersubmittedBy).toEqual(userCredntialsObject.buyerUserName);
			
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();

			// Logout from the buyer role user
			cartListPage.clickUserIcon();
			cartListPage.clickLogoutButton();

			cartListPage.loginFromOtherUser(userCredntialsObject.technicalApprovalUserID, userCredntialsObject.technicalApprovalUserPass);
			expect(catalogPage.getUserID(userCredntialsObject.technicalApprovalUser)).toBe(true);
			orderFlowUtil.approveOrderTechnically(orderObject);//.then(function(){
			//to check budget is not present as the user have only technical approval role
			await expect(ordersPage.checkInvisibilityOfBudgetDetails()).toBe(false, "For technically approval role user Budget details is not present on the Approve order page.")
			//})

			//log out from the technically approval role user
			cartListPage.clickUserIcon();
			cartListPage.clickLogoutButton();


			//login from the financially approval role user
			cartListPage.loginFromOtherUser(userCredntialsObject.financialApprovalUserID, userCredntialsObject.financialApprovalUserPass);
			expect(catalogPage.getUserID(userCredntialsObject.financialApprovalUser)).toBe(true);
			ordersPage.open();
			ordersPage.searchOrderById(orderObject.orderNumber);

			util.waitForAngular();
			//Budget verification 
			expect(ordersPage.getTextBudgetAmmount()).toEqual(persistentDiskTemplate.BudgetAmount);
			var beforePovisioningCommittedAmount = await ordersPage.getTextBudgetaryCommittedAmmount();
			var calculatedEstAmount = ordersPage.calculateBudgetaryEstimatedAmmountforOrder(persistentDiskTemplate.budgetDuration, persistentDiskTemplate.TotalCost);
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
			//Open Approve order page
			ordersPage.open();
			//Logout from the financial approval user roles
			cartListPage.clickUserIcon();
			cartListPage.clickLogoutButton();

			//Login from the buyer role user 
			cartListPage.loginFromOtherUser(userCredntialsObject.buyerUserID, userCredntialsObject.buyerUserPassword);
			expect(catalogPage.getUserID(userCredntialsObject.buyerUserName)).toBe(true);
			//Place the deleteorder from the buyer role
			orderObject.deleteOrderNumber = orderFlowUtil.deleteService(orderObject);
			// expect(orderFlowUtil.verifyOrderTypeDeletedOrder(orderObject)).toBe('Delete');
			catalogPage.open();
			//Logout from the buyer role user
			cartListPage.clickUserIcon();
			cartListPage.clickLogoutButton();
			//Login from the technically approval role user
			cartListPage.loginFromOtherUser(userCredntialsObject.technicalApprovalUserID, userCredntialsObject.technicalApprovalUserPass);
			expect(catalogPage.getUserID(userCredntialsObject.technicalApprovalUser)).toBe(true);
			orderFlowUtil.approveDeletedOrderTechnically(orderObject);
			//Logout from the technically approval role user
			cartListPage.clickUserIcon();
			cartListPage.clickLogoutButton();
			//Login from the financially approval role user
			cartListPage.loginFromOtherUser(userCredntialsObject.financialApprovalUserID, userCredntialsObject.financialApprovalUserPass);
			expect(catalogPage.getUserID(userCredntialsObject.financialApprovalUser)).toBe(true);
			// catalogPage.open();
			orderFlowUtil.approveDeletedOrderFinancially(orderObject);

			orderFlowUtil.waitForDeleteOrderStatusChange(orderObject, 'Completed').then(function () {

				/********** Delete order status completed **********/
				var estCostAfterDeleting1MonthOrder = ordersPage.calculateEstCostAfterDeleting1MonthOrder(calculatedEstAmount, persistentDiskTemplate.TotalCost);
				expect(estCostAfterDeleting1MonthOrder).toContain(ordersPage.getTextBudgetaryEstimatedAmmountforOrder());

				var deletedCommittedAmnt = ordersPage.calculateDeleteCommittedAmount(afterProvCommittedAmnt, estCostAfterDeleting1MonthOrder);
				expect(deletedCommittedAmnt).toContain(ordersPage.getTextBudgetaryCommittedAmmount());

				var deletedAvailableBudget = ordersPage.calculateAfterDeletingAvailBudget(availBudgetProvCompleted, estCostAfterDeleting1MonthOrder);
				expect(deletedAvailableBudget).toContain(ordersPage.getTextAvailableBudget());

			});
			//Logout from the financially approval role user
			cartListPage.clickUserIcon();
			cartListPage.clickLogoutButton();
			//Login with super user
			cartListPage.loginFromOtherUser(superUserUsername, superUserPassword);
			expect(catalogPage.getUserID(userCredntialsObject.superUserName)).toBe(true);
		});

	});

});
