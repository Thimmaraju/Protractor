/*************************************************
	AUTHOR: Pushpraj Singh
 **************************************************/

"use strict";

var Orders = require('../../../pageObjects/orders.pageObject.js'),
HomePage = require('../../../pageObjects/home.pageObject.js'),
DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
BudgetaryPage = require('../../../pageObjects/budget.pageObject.js'),
util = require('../../../../helpers/util.js'),
budgetaryFlow = require('../../../../helpers/budgetaryFlow.js'),
orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
jsonUtil = require('../../../../helpers/jsonUtil.js'),
appUrls = require('../../../../testData/appUrls.json'),
isProvisioningRequired = browser.params.isProvisioningRequired,
testEnvironment = browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4",
budgetaryUnitDetailsTemplate = require('../../../../testData/OrderIntegration/budget/budgetaryUnitDetails.json'),
budgetaryUnitEditDetailsTemplate = require('../../../../testData/OrderIntegration/budget/budgetaryUnitEditDetails.json'),
budgetaryAddNewBudgetDetailsTemplate = require('../../../../testData/OrderIntegration/budget/budgetaryAddNewBudgetDetails.json');

describe('budgetary Test cases - ', function() {
	var orders, homePage, dashBoard, catalogPage, placeOrderPage, budgetaryName, budgetaryEditName, budgetaryUnitCode, 
	budgetaryNewBudgetName, userName, budgetryPage; 
	var modifiedParamMap = {};
	var modifiedEditParamMap = {};
	var modifiedNewBudgetParamMap = {};
	var messageStrings = {
			providerName:'VRA',
			orderSubmittedConfirmationMessage: 'Order Submitted !'
	};

	beforeAll(function() {
		orders = new Orders();
		homePage = new HomePage(); 
		dashBoard = new DashBoard();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		budgetryPage = new BudgetaryPage();
		browser.driver.manage().window().maximize();
		budgetaryName = "budgetaryName"+util.getRandomString(8);
		budgetaryNewBudgetName = "budgetaryNewBudgetName"+util.getRandomString(8);
		budgetaryEditName = "budgetaryName"+util.getRandomString(8);
		budgetaryUnitCode = "budgetaryUnitCode"+util.getRandomString(8);
		modifiedParamMap = {"budgetary Name":budgetaryName, "budgetary unit code":budgetaryUnitCode};
		modifiedEditParamMap = {"budgetary Name":budgetaryEditName};
		userName = browser.params.username;
	});

	beforeEach(function() {
		budgetryPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.budgetaryUrl);
	});



	it('Verifying Cancel button is working fine in budgetry Unit panel area', function () {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryUnitDetailsTemplate));
		util.waitForAngular();	
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.clickOnAddNewBudgetryUnitBtn();
		budgetryPage.isPresentAddNewBudgetryUnitPanel();
		budgetryPage.isPresentAddNewBudgetryUnitText();
		budgetryPage.clickOnBudgetryCancelBtn();
		budgetryPage.verifyAddNewBudgetryUnitPanelnotPresent();        
	});
	
	it('Add new budgetry Unit without selecting association checkbox and verify the error message', function () {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryUnitDetailsTemplate));
		util.waitForAngular();	
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.clickOnAddNewBudgetryUnitBtn();
		budgetryPage.isPresentAddNewBudgetryUnitPanel();
		budgetryPage.isPresentAddNewBudgetryUnitText();
		budgetryPage.fillOrderDetails(budgetaryUnitDetailsTemplate, modifiedParamMap);
		budgetryPage.checkAlltheBudgetryAssociateCheckboxes();
		budgetryPage.clickOnBudgetrySaveBtn();
		budgetryPage.isPresentBudgetryDetailsUnitPanel();
		expect(budgetryPage.getTextBudgetryNoAssociationErrorMessage()).toBe("No associations:\nPlease associate at least one entity before saving the budgetary unit");				
	});

	it('Add new budgetry Unit by selecting association checkbox and verify the submitted data & Status', function () {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryUnitDetailsTemplate));
		util.waitForAngular();	
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.clickOnAddNewBudgetryUnitBtn();
		budgetryPage.isPresentAddNewBudgetryUnitPanel();
		budgetryPage.isPresentAddNewBudgetryUnitText();
		budgetryPage.fillOrderDetails(budgetaryUnitDetailsTemplate, modifiedParamMap);
		//budgetryPage.checkAlltheBudgetryAssociateCheckboxes();
		budgetryPage.clickOnBudgetrySaveBtn();
		budgetryPage.isPresentBudgetryDetailsUnitPanel();
		expect(budgetryPage.getTextBudgetryDetailsName()).toBe(budgetaryName);
		expect(budgetryPage.getTextBudgetryDetailsUnitCode()).toBe(budgetaryUnitCode);
		expect(budgetryPage.getTextBudgetryDetailsDescription()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary Description"));
		expect(budgetryPage.getTextBudgetryDetailsExternalRefId()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary External Referance Id"));
		expect(budgetryPage.getTextBudgetryDetailsOrganization()).toEqual(jsonUtil.getValue(budgetaryObject, "Organization"));
		expect(budgetryPage.getTextBudgetryDetailsEnvironment()).toEqual(jsonUtil.getValue(budgetaryObject, "Environment"));
		expect(budgetryPage.getTextBudgetryDetailsApplication()).toEqual(jsonUtil.getValue(budgetaryObject, "Application"));
		expect(budgetryPage.getTextBudgetryDetailsTerm()).toEqual(jsonUtil.getValue(budgetaryObject, "Term"));
		expect(budgetryPage.getTextBudgetryDetailsStatus()).toBe("Active");
				
	});
	
	it('Verify newly created budgetary unit status from budgetary unit table ', function() {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryUnitDetailsTemplate));
		util.waitForAngular();	
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.selectbudgetaryPaginationDropDown();
		//var budgetaryName = "budgetaryNamenHAhOUDG";
		var term = budgetaryFlow.checkBudgetaryNameInBudgetaryUnitTable(budgetaryName);
		var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(budgetaryName);
		expect(term).toEqual(jsonUtil.getValue(budgetaryObject, "Term"));
		expect(status).toEqual("Active");
		budgetryPage.clickOnEditIconAndViewDetailsForBudgetaryUnit(budgetaryName);		
		expect(budgetryPage.getTextBudgetryDetailsName()).toBe(budgetaryName);
		expect(budgetryPage.getTextBudgetryDetailsUnitCode()).toBe(budgetaryUnitCode);
		expect(budgetryPage.getTextBudgetryDetailsDescription()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary Description"));
		expect(budgetryPage.getTextBudgetryDetailsExternalRefId()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary External Referance Id"));
		expect(budgetryPage.getTextBudgetryDetailsOrganization()).toEqual(jsonUtil.getValue(budgetaryObject, "Organization"));
		expect(budgetryPage.getTextBudgetryDetailsEnvironment()).toEqual(jsonUtil.getValue(budgetaryObject, "Environment"));
		expect(budgetryPage.getTextBudgetryDetailsApplication()).toEqual(jsonUtil.getValue(budgetaryObject, "Application"));
		expect(budgetryPage.getTextBudgetryDetailsTerm()).toEqual(jsonUtil.getValue(budgetaryObject, "Term"));
		expect(budgetryPage.getTextBudgetryDetailsStatus()).toBe("Active");
		
	});
	
	it('Edit new budgetry Unit and verify the submitted data', function() {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryUnitEditDetailsTemplate));
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.selectbudgetaryPaginationDropDown();
		//var budgetaryName = "budgetaryNameX73kSIMe";
		var term = budgetaryFlow.checkBudgetaryNameInBudgetaryUnitTable(budgetaryName);
		var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(budgetaryName);
		expect(term).toEqual(jsonUtil.getValue(budgetaryObject, "Term"));
		expect(status).toEqual("Active");
		budgetryPage.clickOnEditIconAndViewDetailsForBudgetaryUnit(budgetaryName);
		budgetryPage.isPresentBudgetryDetailsUnitPanel();
		util.waitForAngular();
		budgetryPage.clickOnEditBudgetaryButton();
		budgetryPage.isPresentBudgetryEditDetailsTxt();
		expect(budgetryPage.getTextBudgetryNameFromEditPage()).toBe(budgetaryName);
		expect(budgetryPage.getTextBudgetryUnitCodeFromEditPage()).toBe(budgetaryUnitCode);
		expect(budgetryPage.getTextBudgetryDescriptionFromEditPage()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary Description"));
		expect(budgetryPage.getTextBudgetryExternalRefIdFromEditPage()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary External Referance Id"));
		//expect(budgetryPage.getTextBudgetryOrganizationFromEditPage()).toEqual(jsonUtil.getValue(budgetaryObject, "Organization"));
		expect(budgetryPage.getTextBudgetryEnvironmentFromEditPage()).toEqual(jsonUtil.getValue(budgetaryObject, "Environment"));
		expect(budgetryPage.getTextBudgetryApplicationFromEditPage()).toEqual(jsonUtil.getValue(budgetaryObject, "Application"));
		expect(budgetryPage.getTextBudgetryTermFromEditPage()).toEqual(jsonUtil.getValue(budgetaryObject, "Term"));
		expect(budgetryPage.getTextBudgetryDetailsStatus()).toBe("Active");
		budgetryPage.fillOrderDetails(budgetaryUnitEditDetailsTemplate, modifiedEditParamMap);
		budgetryPage.clickOnBudgetaryEditUpdateButton();
		budgetryPage.isPresentBudgetryEditUpdateSuccessMsg();
		budgetryPage.clickOnBudgetaryEditUpdateSuccessCloseButton();
		budgetaryName = budgetaryEditName;
		budgetryPage.isPresentBudgetryDetailsUnitPanel();
		expect(budgetryPage.getTextBudgetryDetailsName()).toBe(budgetaryName);
		expect(budgetryPage.getTextBudgetryDetailsUnitCode()).toBe(budgetaryUnitCode);
		expect(budgetryPage.getTextBudgetryDetailsDescription()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary Description"));
		expect(budgetryPage.getTextBudgetryDetailsExternalRefId()).toEqual(jsonUtil.getValue(budgetaryObject, "budgetary External Referance Id"));
		expect(budgetryPage.getTextBudgetryDetailsOrganization()).toEqual(jsonUtil.getValue(budgetaryObject, "Organization"));
		expect(budgetryPage.getTextBudgetryDetailsEnvironment()).toEqual(jsonUtil.getValue(budgetaryObject, "Environment"));
		expect(budgetryPage.getTextBudgetryDetailsApplication()).toEqual(jsonUtil.getValue(budgetaryObject, "Application"));
		expect(budgetryPage.getTextBudgetryDetailsTerm()).toEqual(jsonUtil.getValue(budgetaryObject, "Term"));
		expect(budgetryPage.getTextBudgetryDetailsStatus()).toBe("Active");		
	});
	
	it('Add Budgets for newly created budgetary unit', function() {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryAddNewBudgetDetailsTemplate));
		util.waitForAngular();	
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.selectbudgetaryPaginationDropDown();
		//var budgetaryName = "budgetaryNameARuVO";
		budgetaryFlow.checkBudgetaryNameInBudgetaryUnitTable(budgetaryName);
		var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(budgetaryName);
		expect(status).toEqual("Active");
		budgetryPage.clickOnEditIconAndViewDetailsForBudgetaryUnit(budgetaryName);	
		budgetryPage.clickOnBudgetryBudgetsLink();
		budgetryPage.clickOnBudgetaryAddBudgetButton();
		budgetryPage.isBudgetaryAddNewBudgetTextDisplayed();
		var startPeriod = budgetaryFlow.incrementMonth(0); //Zero (0) for current month
		var endPeriod = budgetaryFlow.incrementMonth(2); //two (2) for Quarterly
		modifiedNewBudgetParamMap = {"Name":budgetaryNewBudgetName, "Start Period":startPeriod, "End Period":endPeriod};
		budgetryPage.fillOrderDetails(budgetaryAddNewBudgetDetailsTemplate, modifiedNewBudgetParamMap);		
		budgetryPage.clickOnBudgetaryCreateNewBudgetButton();
		expect(budgetryPage.getTextNotificationMsgBudgetPage()).toContain("Success::");
		budgetryPage.clickOnBudgetaryBackBudgetButton();
	});
	
	it('Validate error message while adding same name of budget in newly created budgetary unit though budget is already added', function() {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryAddNewBudgetDetailsTemplate));
		util.waitForAngular();	
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.selectbudgetaryPaginationDropDown();
		//var budgetaryName = "budgetaryNameRtDOBJwL";
		budgetaryFlow.checkBudgetaryNameInBudgetaryUnitTable(budgetaryName);
		var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(budgetaryName);
		expect(status).toEqual("Active");
		budgetryPage.clickOnEditIconAndViewDetailsForBudgetaryUnit(budgetaryName);	
		budgetryPage.clickOnBudgetryBudgetsLink();
		budgetryPage.clickOnBudgetaryAddBudgetButton();
		budgetryPage.isBudgetaryAddNewBudgetTextDisplayed();
		var startPeriod = budgetaryFlow.incrementMonth(0); //Zero (0) for current month
		var endPeriod = budgetaryFlow.incrementMonth(2); //two (2) for Quarterly
		modifiedNewBudgetParamMap = {"Name":budgetaryNewBudgetName, "Start Period":startPeriod, "End Period":endPeriod};
		budgetryPage.fillOrderDetails(budgetaryAddNewBudgetDetailsTemplate, modifiedNewBudgetParamMap);		
		budgetryPage.clickOnBudgetaryCreateNewBudgetButton();
		expect(budgetryPage.getTextNotificationMsgBudgetPage()).toContain("Budget exists for given name");
		budgetryPage.clickOnNotificationCloseButton();
	});
	
	it('Validate error message while adding budget in newly created budgetary unit though budget is already added', function() {
		var budgetaryObject = JSON.parse(JSON.stringify(budgetaryAddNewBudgetDetailsTemplate));
		util.waitForAngular();	
		budgetryPage.isPresentbudgetryUnitsText();
		budgetryPage.isPresentAddNewBudgetryUnitBtn();
		budgetryPage.isPresentBudgetryUnitsTable();
		budgetryPage.selectbudgetaryPaginationDropDown();
		//var budgetaryName = "budgetaryNameRtDOBJwL";
		budgetaryFlow.checkBudgetaryNameInBudgetaryUnitTable(budgetaryName);
		var status = budgetryPage.checkBudgetaryStausInBudgetaryUnitTable(budgetaryName);
		expect(status).toEqual("Active");
		budgetryPage.clickOnEditIconAndViewDetailsForBudgetaryUnit(budgetaryName);	
		budgetryPage.clickOnBudgetryBudgetsLink();
		budgetryPage.clickOnBudgetaryAddBudgetButton();
		budgetryPage.isBudgetaryAddNewBudgetTextDisplayed();
		var startPeriod = budgetaryFlow.incrementMonth(0); //Zero (0) for current month
		var endPeriod = budgetaryFlow.incrementMonth(2); //two (2) for Quarterly
		modifiedNewBudgetParamMap = {"Name":"NewBudgetName", "Start Period":startPeriod, "End Period":endPeriod};
		budgetryPage.fillOrderDetails(budgetaryAddNewBudgetDetailsTemplate, modifiedNewBudgetParamMap);		
		budgetryPage.clickOnBudgetaryCreateNewBudgetButton();
		expect(budgetryPage.getTextNotificationMsgBudgetPage()).toContain("overlaps an existing budget");
		budgetryPage.clickOnNotificationCloseButton();
		budgetryPage.setTextBudgetEndPeriod(budgetaryFlow.incrementMonth(3)); //One Month Extra
		budgetryPage.clickOnBudgetaryCreateNewBudgetButton();
		expect(budgetryPage.getTextNotificationMsgBudgetPage()).toContain("endPeriod should be "+endPeriod+" instead of "+budgetaryFlow.incrementMonth(3)+" for budgetaryunit term Quarterly");
		budgetryPage.clickOnNotificationCloseButton();
		budgetryPage.clickOnBudgetaryBackBudgetButton();
	});


});
