"use strict";

var extend = require('extend');
var url = browser.params.url;
var util = require('../../helpers/util.js');
var logGenerator = require("../../helpers/logGenerator.js"),
logger = logGenerator.getApplicationLogger();
var jsonUtil = require('../../helpers/jsonUtil.js');

var EC = protractor.ExpectedConditions;

var defaultConfig = {
		pageUrl:                      		url + '/budget',

		//*******************Budgetry Page Web Elements**************************
		budgetryUnitsTextXpath:        		'//button[@id="button-addBudgetaryUnitBtn"]',
		addNewBudgetryUnitBtnXpath: 		'//button[@id="button-addBudgetaryUnitBtn"]',
		budgetryUnitsTableXpath:			'(//table[contains(@id, "carbon-deluxe-data-table")][@class="bx--responsive-table"])[1]',
		addNewBudgetryUnitPanelXpath:		'//div[@class="bx--slide-over-panel"]',
		addNewBudgetryUnitTextXpath:		'//h3[contains(text(), "Add New Budgetary Unit")]',
		budgetryNameCss:					'#text-input-name',
		budgetryUnitCodeCss:				'#text-input-budgetUnitCode',
		budgetryDescriptionCss:				'#text-areadescription',
		budgetryExternalRefIdCss:			'#text-areabudgetUnitExternalRefId',
		budgetryOrganizationCss:			'#bx--dropdown-single-parent_team',
		budgetryEnvironmentCss:				'#dropdown-wrapper-env',
		budgetryApplicationCss:				'#dropdown-wrapper-app, #dropdown-wrapper-App',
		budgetryTeamCss:					'#bx--dropdown-single-parent_team',
		budgetryTermCss:					'#bx--dropdown-single-parent_term',
		budgetrySaveBtnXpath:				'(//button[@id="button-saveBudgetaryUnit"])[1]',
		budgetryCancelBtnCss:				'#button-cancelAddBudgetaryUnit',
		budgetaryPaginationDrpDwnCss:		'#bx--pagination-select-id-0',
		budgetaryPaginationForwardbtnCss:	'#bx--pagination__forward-button-0',
		budgetaryPaginationTxt1Xpth:		'(//div[@class="bx--pagination__right"]//span[@class="bx--pagination__text"]/span)[1]',
		budgetaryPaginationTxt2Xpth:		'(//div[@class="bx--pagination__right"]//span[@class="bx--pagination__text"]/span)[2]',

		//************************Budgetry Link WebElements*************************
		budgetryDetailsLinkCss:				'#details',
		budgetryBudgetsLinkCss:				'#budgets',
		relatedBudgetryUnitLinkCss:			'#related_budgetary_units',

		//************************Budgetry Submitted Page Details*******************
		budgetryDetailsUnitPanelXpath:			'//div[@class="bx--slide-over-panel"]',
		budgetryDetailsUnitTextXpath:			'//h3[@class="bx--slide-over-panel-title"])[1]',
		budgetryDetailsNameXpath:				'//label[@class="bx--label"][contains(text(), "Name")]/following-sibling::P',
		budgetryDetailsUnitCodeXpath:			'//label[@class="bx--label"][contains(text(), "Budget Unit Identifier")]/following-sibling::P',
		budgetryDetailsDescriptionXpath:		'//label[@class="bx--label"][contains(text(), "Description")]/following-sibling::P[2]',
		budgetryDetailsExternalRefIdXpath:		'//label[@class="bx--label"][contains(text(), "External Reference Id")]/following-sibling::P',
		budgetryDetailsOrganizationXpath:		'//span[@class="contextKey bold"][contains(text(), "Organization")]/following-sibling::span[@class="contextValue"]',
		budgetryDetailsEnvironmentXpath:		'//span[@class="contextKey bold"][contains(text(), "Environment")]/following-sibling::span[@class="contextValue"]',
		budgetryDetailsApplicationXpath:		'//span[@class="contextKey bold"][contains(text(), "Application")]/following-sibling::span[@class="contextValue"]',
		budgetryDetailsTermXpath:				'//label[@class="bx--label"][contains(text(), "Term")]/following-sibling::P',
		budgetryDetailsStatus:					'//label[@class="bx--label"][contains(text(), "Status")]/following-sibling::P',
		budgetryNoAssociationErrorMsgCss:		'[class^=bx--inline-notification__text-wrapper]',
		budgetryAssociateCheckboxesXpath:		'//input[@class="bx--checkbox"][@type="checkbox"]/following-sibling::label[contains(@for, "checkbox")]',


		//************************Budgetary Details Edit Page Web Element****************************//
		budgetryEditBtnXpath:					'//button[@id="button-edit-budget-unit--button"]',
		budgetaryEditUnitTextXpath:				'//h3[contains(text(), "Edit Budgetary Unit")]',	
		budgetaryChangeStatusXpath:				'//span[@class="bx--toggle__text--left"]',
		budgetaryEditCancelButtonXpath:			'//button[@id="button-cancelEditBudgetaryUnit"]',
		budgetaryEditSaveButtonXpath:			'//carbon-button[@id="saveBudgetaryUnit"]',
		budgetaryEditUpdateSuccessMsgXpath:		'//span[contains(text(),"Success::")]',
		budgetaryEditUpdateSuccessCloseXpath:	'//button[@class="bx--toast-notification__close-button"]',

		
		//************************Budgetary budgets Web Element**************************************//
		budgetaryBudgetsAddBudgetButtonCss:			'#button-addBudget',
		budgetaryAddNewBudgetsTxtXpath:				'(//h3[contains(text(), "Add New Budget")])[1]',
		BudgetaryBudgetsCreateBudgetNameCss:		'#text-input-create-budget-name',
		BudgetaryBudgetsStatusActive:				'//label[text()="Status"]/following-sibling::carbon-toggle//span[@class="bx--toggle__text--right"]',
		CreateNewBudgetButtonCss:					'#button-createBudget',
		NotificationMsgXpath:						'//carbon-notification[contains(@class, "bx--toast-notification")]//span',
		NotificationCloseBtnCss:					'.bx--toast-notification__close-icon',
		BudgetDetailsEndPeriodCss:					'#text-input-create-budget-end-period',
		BackBudegtButtonCss:						'#button-cancelCreateBudget',
         
		//************************Search Page Web Element********************************************//
		orderSearchTextBoxCss:	  			'#search__input-orders-search',

		//*****************Budget Details**************
        BudgetAmmountXpath: '//*[@id="text-input-create-budget-budget-amount"]',
		AvailableAmmountXpath: '//*[@id="text-input-create-budget-availableAmount"]',
		CommittedAmountXpath: '//*[@id="text-input-create-budget-committedAmount"]',
		UnderAprovalAmountXpath: '//*[@id="text-input-create-budget-underApprovalAmount"]',
        GetDetailsCss: '.bx--table-cell--truncate'
	};

//******** Order status *************
global.failedStatus = "Failed";
global.approvalInProgressStatus = 'Approval In Progress';
global.provisioningInProgressStatus = 'Provisioning in Progress';


function budget(selectorConfig) {
	if (!(this instanceof budget)) {
		return new budget(selectorConfig);
	}
	extend(this, defaultConfig);

	if (selectorConfig) {
		extend(this, selectorConfig);
	}
}

/**
 * Navigate to Budget page/URL
 */
budget.prototype.open = function()
{
	browser.get(this.pageUrl);
	browser.wait(EC.urlContains("/budget"), 10000);
	util.waitForAngular();
};

/**
 * Verify 'Budgetary Units' text is present/displayed at top'
 */
budget.prototype.isPresentbudgetryUnitsText = function(){
	util.waitForAngular();
	browser.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryUnitsTextXpath))),30000);
	return element(by.xpath(this.budgetryUnitsTextXpath)).isDisplayed().then(function(){
		logger.info("Budgetry units text is displayed...");
	});
};

/**
 * Verify 'Add New Budgetary Unit' button is displayed/Visible
 */
budget.prototype.isPresentAddNewBudgetryUnitBtn = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.addNewBudgetryUnitBtnXpath))),30000);
	return element(by.xpath(this.addNewBudgetryUnitBtnXpath)).isDisplayed().then(function(){
		logger.info("Add New Budgetry Unit Btn is present...");
	});
};

/**
 * Click on the 'Add New Budgetary Unit' button
 */
budget.prototype.clickOnAddNewBudgetryUnitBtn = function(){
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.addNewBudgetryUnitBtnXpath))),30000);
	return element(by.xpath(this.addNewBudgetryUnitBtnXpath)).click().then(function(){
		logger.info("Clicked on the Add New Budgatry Unit Button...");
	});
};

/**
 * Verify Budgetary Unit table is displayed
 */
budget.prototype.isPresentBudgetryUnitsTable = function(){
	util.waitForAngular();
	browser.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryUnitsTableXpath))),30000);
	return element(by.xpath(this.budgetryUnitsTableXpath)).isDisplayed().then(function(){
		logger.info("budgetry Units Table is Displayed...");
		browser.waitForAngular();
	});
};

/**
 * Verify Add New budgetary unit panel is visible/Displayed
 */
budget.prototype.isPresentAddNewBudgetryUnitPanel = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.addNewBudgetryUnitPanelXpath))),30000);
	return element(by.xpath(this.addNewBudgetryUnitPanelXpath)).isDisplayed().then(function(){
		logger.info("budgetry Units Pannel is displayed...");
	});
};

/**
 * Verify Add New budgetary unit panel is not visible
 */
budget.prototype.verifyAddNewBudgetryUnitPanelnotPresent = function(){
	browser.wait(EC.invisibilityOf(element(by.xpath(this.addNewBudgetryUnitPanelXpath))),30000).then(function(){
		logger.info("budgetry Units Pannel is not visible...");
	});
};

/**
 * Verify 'Add New Budgetary Unit' text is present at top while filling the form for 'New Budgetary unit'
 */
budget.prototype.isPresentAddNewBudgetryUnitText = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.addNewBudgetryUnitTextXpath))),30000);
	return element(by.xpath(this.addNewBudgetryUnitTextXpath)).isDisplayed().then(function(){
		logger.info("budgetry Units Text is present...");
	});
};

/**
 * Set input for Name text box while filling the form for 'New Budgetary unit'
 */
budget.prototype.setTextBudgetryName = function(budgetryName){
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryNameCss))),30000);
	return element(by.css(this.budgetryNameCss)).sendKeys(budgetryName).then(function(){
		logger.info("Budgetry name is entered...");
	});
};

/**
 * Set input for Budgetary_Unit_Identifier text box while filling the form for 'New Budgetary unit'
 */
budget.prototype.setTextBudgetryUnitCode = function(budgetryUnitCode){
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryUnitCodeCss))),30000);
	return element(by.css(this.budgetryUnitCodeCss)).sendKeys(budgetryUnitCode).then(function(){
		logger.info("Budgetry Unit Code is entered...");
	});
};

/**
 * Set input for budgetary Description text box while filling the form for 'New Budgetary unit'
 */
budget.prototype.setTextBudgetryDescription = function(budgetryDescription){
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryDescriptionCss))),30000);
	return element(by.css(this.budgetryDescriptionCss)).sendKeys(budgetryDescription).then(function(){
		logger.info("Budgetry Description is entered...");
	});
};

/**
 * Set input for budgetary External_Ref_ID text box while filling the form for 'New Budgetary unit'
 */
budget.prototype.setTextBudgetryExternalRefId = function(budgetryExternalRefId){
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryExternalRefIdCss))),30000);
	return element(by.css(this.budgetryExternalRefIdCss)).sendKeys(budgetryExternalRefId).then(function(){
		logger.info("Budgetry ref Id is entered...");
	});
};

/**
 * Click on Save button available during filling the form for 'New Budgetary unit'
 */
budget.prototype.clickOnBudgetrySaveBtn = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetrySaveBtnXpath))),30000);
	/*element(by.xpath(this.budgetrySaveBtnXpath)).getAttribute('disabled').then(function(attr){
	    expect(attr).toBe(false);
	});*/
	//expect(element(by.xpath(this.budgetrySaveBtnXpath)).isEnabled()).toBe(true);	
	//browser.waitForAngularEnabled(true);
	//browser.ignoreSynchronization = true;
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.budgetrySaveBtnXpath))),30000);
	return element(by.xpath(this.budgetrySaveBtnXpath)).click().then(function(){
		logger.info("Clicked on Save button for Budgatry...");
	});
};

/**
 * Click on Cancel button available during filling the form for 'New Budgetary unit'
 */
budget.prototype.clickOnBudgetryCancelBtn = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryCancelBtnCss))),30000);
	browser.wait(EC.elementToBeClickable(element(by.css(this.budgetryCancelBtnCss))),30000);
	return element(by.css(this.budgetryCancelBtnCss)).click().then(function(){
		logger.info("Clicked on Cancel button for Budgatry...");
	});
};

/**
 * Click on Details links from budgetary unit panel
 */
budget.prototype.clickOnBudgetryDetailsLink = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.budgetryDetailsLinkCss))),30000);
	return element(by.css(this.budgetryDetailsLinkCss)).click().then(function(){
		logger.info("Clicked on budgatry Details Link...");
	});
};

/**
 * Click on budgets links from budgetary unit panel
 */
budget.prototype.clickOnBudgetryBudgetsLink = function(){
	var budgetsLink = element(by.css(this.budgetryBudgetsLinkCss));
	browser.wait(EC.visibilityOf(budgetsLink),30000).then(function(){
		budgetsLink.isDisplayed().then(function(){
			logger.info("Budgets link displayed...");
		})
	});
	browser.wait(EC.elementToBeClickable(budgetsLink),30000).then(function(){
		browser.executeScript("arguments[0].click();", budgetsLink.getWebElement()).then(function(){
			logger.info("Clicked on budgatry Budgets Link...");
		});
	});	
};

/**
 * Click on Related_budgetary_Unit links from budgetary unit panel
 */
budget.prototype.clickOnRelatedBudgetryUnitLink = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.relatedBudgetryUnitLinkCss))),30000);
	return element(by.css(this.relatedBudgetryUnitLinkCss)).click().then(function(){
		logger.info("Clicked on budgatry Details Link...");
	});
};


//*********************Function for Budgetary Submitted Page**********************//
/**
 * Verify budgetary details unit panel is present in the budgetary details page
 */
budget.prototype.isPresentBudgetryDetailsUnitPanel = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsUnitPanelXpath))),30000);
	return element(by.xpath(this.budgetryDetailsUnitPanelXpath)).isDisplayed().then(function(){
		logger.info("budgetry Details Unit Panel is present...");
	});
};

/**
 * Verify Budgetary Title is present in budgetary details page
 */
budget.prototype.isPresentBudgetryDetailsUnitText = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsUnitTextXpath))),30000);
	return element(by.xpath(this.budgetryDetailsUnitTextXpath)).isDisplayed().then(function(){
		logger.info("budgetry details unit text is present.....");
	});
};

/**
 * Retrieve budgetary Name text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsName = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsNameXpath))),30000);
	return element(by.xpath(this.budgetryDetailsNameXpath)).getText().then(function(text){
		logger.info("budgetry Details Name text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary Unit Code text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsUnitCode = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsUnitCodeXpath))),30000);
	return element(by.xpath(this.budgetryDetailsUnitCodeXpath)).getText().then(function(text){
		logger.info("budgetry Details UnitCode text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary Description text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsDescription = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsDescriptionXpath))),30000);
	return element(by.xpath(this.budgetryDetailsDescriptionXpath)).getText().then(function(text){
		logger.info("budgetry Details Description text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary External-Ref-Id text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsExternalRefId = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsExternalRefIdXpath))),30000);
	return element(by.xpath(this.budgetryDetailsExternalRefIdXpath)).getText().then(function(text){
		logger.info("budgetry Details ExternalRefId text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary organization text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsOrganization = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsOrganizationXpath))),30000);
	return element(by.xpath(this.budgetryDetailsOrganizationXpath)).getText().then(function(text){
		logger.info("budgetry Details Organization text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary environment text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsEnvironment = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsEnvironmentXpath))),30000);
	return element(by.xpath(this.budgetryDetailsEnvironmentXpath)).getText().then(function(text){
		logger.info("budgetry Details Environment text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary application text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsApplication = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsApplicationXpath))),30000);
	return element(by.xpath(this.budgetryDetailsApplicationXpath)).getText().then(function(text){
		logger.info("budgetry Details Application text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary Term text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsTerm = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsTermXpath))),30000);
	return element(by.xpath(this.budgetryDetailsTermXpath)).getText().then(function(text){
		logger.info("budgetry Details Term text :  "+text);
		return text;
	});
};

/**
 * Retrieve budgetary status text from budgetary details page
 */
budget.prototype.getTextBudgetryDetailsStatus = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsStatus))),30000);
	return element(by.xpath(this.budgetryDetailsStatus)).getText().then(function(text){
		logger.info("budgetry Details status text : "+text);
		return text;
	});
};

/**
 * Retrieve error text message for creating the new budgetary unit without checking any Association check-box while adding the new budgetary unit.. 
 */
budget.prototype.getTextBudgetryNoAssociationErrorMessage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryNoAssociationErrorMsgCss))),30000);
	return element(by.css(this.budgetryNoAssociationErrorMsgCss)).getText().then(function(text){
		logger.info("budgetry Details No Association error message :  "+text);
		return text;
	});
};

/**
 * Click on the all the budgetary association check box while adding the new budgetary unit 
 */
budget.prototype.checkAlltheBudgetryAssociateCheckboxes = function() {
	element.all(by.xpath(this.budgetryAssociateCheckboxesXpath)).then(function(array){
		logger.info("Check Box Ele Length : "+ array.length);	
	});

	element.all(by.xpath(this.budgetryAssociateCheckboxesXpath)).each(function(element, index){
		browser.wait(EC.elementToBeClickable(element),30000);
		element.click().then(function(text){
			logger.info("Checked Association check box : "+ index);
		});
	});
};

//*********************Function for Budgetary Edit Page**********************//

/**
 * Check budgetary details unit panel is displayed.. 
 */
budget.prototype.isPresentBudgetryDetailsUnitPanel = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetryDetailsUnitPanelXpath))),30000);
	return element(by.xpath(this.budgetryDetailsUnitPanelXpath)).isDisplayed().then(function(){
		logger.info("budgetary Details Unit Panel is present...");
	});
};

/**
 * Click on edit budgetary button from budgetary unit details page
 */
budget.prototype.clickOnEditBudgetaryButton = function(){
	var editButton = element(by.xpath(this.budgetryEditBtnXpath));
	browser.wait(EC.elementToBeClickable(editButton),30000);
	//element(by.xpath(this.budgetryEditBtnXpath)).click().then(function(){
	browser.executeScript("arguments[0].click();", editButton.getWebElement()).then(function(){
		logger.info("Clicked on budgatary Edit Button...");
	});
};

/**
 * Verify Edit budgetary Unit text is present while editing budgetary unit
 */
budget.prototype.isPresentBudgetryEditDetailsTxt = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetaryEditUnitTextXpath))),30000);
	return element(by.xpath(this.budgetaryEditUnitTextXpath)).isDisplayed().then(function(){
		logger.info("Edit budgetary Unit text is present...");
	});
};

/**
 * Retrieve text message from 'Edit budgetary unit' text box while editing budgetary unit 
 */
budget.prototype.getTextBudgetryNameFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryNameCss))),30000);
	return element(by.css(this.budgetryNameCss)).getAttribute("value").then(function(text){
		logger.info("budgetary Name from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from budget unit-code text field while editing budgetary unit 
 */
budget.prototype.getTextBudgetryUnitCodeFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryUnitCodeCss))),30000);
	return element(by.css(this.budgetryUnitCodeCss)).getAttribute("value").then(function(text){
		logger.info("budgetary Unit Code from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from description text box while editing budgetary unit 
 */
budget.prototype.getTextBudgetryDescriptionFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryDescriptionCss))),30000);
	return element(by.css(this.budgetryDescriptionCss)).getAttribute("value").then(function(text){
		logger.info("budgetary Description from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from external reference id text box while editing budgetary unit
 */
budget.prototype.getTextBudgetryExternalRefIdFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryExternalRefIdCss))),30000);
	return element(by.css(this.budgetryExternalRefIdCss)).getAttribute("value").then(function(text){
		logger.info("budgetary External Ref Id from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from organization drop-down while editing budgetary unit
 */
budget.prototype.getTextBudgetryOrganizationFromEditPage = function() {
	util.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryOrganizationCss))),30000);
	return element(by.css(this.budgetryOrganizationCss)).getText().then(function(text){
		logger.info("budgetary Organization from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from environment drop-down while editing budgetary unit
 */
budget.prototype.getTextBudgetryEnvironmentFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryEnvironmentCss))),30000);
	return element(by.css(this.budgetryEnvironmentCss)).getText().then(function(text){
		logger.info("budgetary Environment from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from Application drop down while editing budgetary unit
 */
budget.prototype.getTextBudgetryApplicationFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryApplicationCss))),30000);
	return element(by.css(this.budgetryApplicationCss)).getText().then(function(text){
		logger.info("budgetary Application from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from team drop down while editing budgetary unit
 */
budget.prototype.getTextBudgetryTeamFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryTeamCss))),30000);
	return element(by.css(this.budgetryTeamCss)).getText().then(function(text){
		logger.info("budgetary Team from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Retrieve text message from budget term drop down while editing budgetary unit
 */
budget.prototype.getTextBudgetryTermFromEditPage = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.budgetryTermCss))),30000);
	return element(by.css(this.budgetryTermCss)).getText().then(function(text){
		logger.info("budgetary Term from Edit details page text :  "+text);
		return text;
	});
};

/**
 * Click on budgetary status change slider while editing the budgetary unit
 */
budget.prototype.clickOnBudgetaryStatusChangeButton = function(){
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.budgetaryChangeStatusXpath))),30000);
	return element(by.xpath(this.budgetaryChangeStatusXpath)).click().then(function(){
		logger.info("Clicked on budgatary status change Button...");
	});
};

/**
 * Click on budgetary edit cancel button 
 */
budget.prototype.clickOnBudgetaryEditCancelButton = function(){
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.budgetaryEditCancelButtonXpath))),30000);
	return element(by.xpath(this.budgetaryEditCancelButtonXpath)).click().then(function(){
		logger.info("Clicked on budgatary Edit cancel Button...");
	});
};

/**
 * Click on budgetary edit update button
 */
budget.prototype.clickOnBudgetaryEditUpdateButton = function(){
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.budgetaryEditSaveButtonXpath))),30000);
	return element(by.xpath(this.budgetaryEditSaveButtonXpath)).click().then(function(){
		logger.info("Clicked on budgatary Edit Update Button...");
	});
};

/**
 * Verify Success message notification is present after clicking on the update button
 */
budget.prototype.isPresentBudgetryEditUpdateSuccessMsg = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.budgetaryEditUpdateSuccessMsgXpath))),30000);
	return element(by.xpath(this.budgetaryEditUpdateSuccessMsgXpath)).isDisplayed().then(function(){
		logger.info("budgetry Edit update success message is displayed...");
	});
};

/**
 * Click on Success Notification close button after updating the budgetary unit
 */
budget.prototype.clickOnBudgetaryEditUpdateSuccessCloseButton = function(){
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.budgetaryEditUpdateSuccessCloseXpath))),30000);
	element(by.xpath(this.budgetaryEditUpdateSuccessCloseXpath)).click().then(function(){
		logger.info("Clicked on budgatary Edit Update success close Button...");
	});
};

//************************************ Budgetary unit details Table functions *******************/

/**
 * Select last value from budgetary pagination drop-down
 */
budget.prototype.selectbudgetaryPaginationDropDown = function(){
	var dropdown = element(by.css(this.budgetaryPaginationDrpDwnCss));
	util.waitForAngular();	
	browser.wait(EC.elementToBeClickable(dropdown), 60000).then(function(){	
		dropdown.isEnabled().then(function (enabled) {
			if(enabled){
				dropdown.click().then(function(){
					var dropDownValuesArray = element.all(by.css("#bx--pagination-select-id-0 option"));
					dropDownValuesArray.getText().then(function (textArray) {						
						dropDownValuesArray.get(textArray.length - 1).getText().then(function (text) {
							dropDownValuesArray.get(textArray.length - 1).click().then(function() {
								logger.info("Selected " + text.trim() + " from pagination dropdown");
							});
						});
					});
				});
			}
		});                      

	});

};

/**
 * Check budgetary Unit name in the Budgetary Table
 */
budget.prototype.checkBudgetaryNameInBudgetaryUnitTable = function(budgetaryNameText){
	var isTextPresent = false;
	var currentPageNumber;
	var totalPageNumber;

	util.waitForAngular().then(function(){
		browser.wait(EC.visibilityOf(element(by.css(".bx--table-cell--truncate"))), 30000);
		var budgetaryArray = element.all(by.css(".bx--table-cell--truncate"));
		budgetaryArray.getText().then(function(textArray){
			for (var i = 0; i < textArray.length; i++){
				if(textArray[i]==budgetaryNameText){
					logger.info(budgetaryNameText +" Found");
					isTextPresent = true;
					logger.info("Term : "+textArray[i+3]);
					return textArray[i+3];
				}
			}
		});
		var paginationElement = element.all(by.css('.bx--pagination__right .bx--pagination__text span'));
		paginationElement.getText().then(function(paginationArray){
			currentPageNumber = paginationArray[0];
			totalPageNumber = paginationArray[paginationArray.length-1];
		}).then(function(){
			logger.info("Current Page Number..."+currentPageNumber);
			logger.info("Total Page Number..."+totalPageNumber);
			if(parseInt(currentPageNumber, 10) < parseInt(totalPageNumber, 10)){
				browser.wait(EC.elementToBeClickable(element(by.css('#bx--pagination__forward-button-0'))),30000);
				element(by.css('#bx--pagination__forward-button-0')).click().then(function(){
					logger.info("Clicked on next button for pagination...");
				}).then(function(){
					logger.info("Function is calling again.....");
					this.checkBudgetaryNameInBudgetaryUnitTable(budgetaryNameText).then(function(){
						logger.info("Function called again.....");
					});
					
				});
			}else{
				return;
			}
		});

	}).then(function(){
		logger.info("Function is calling again.....");
		checkBudgetaryNameInBudgetaryUnitTable(budgetaryNameText).then(function(){
			logger.info("Function called again.....");
		});
		
	});

};

/**
 * Check budgetary status from Budgetary Unit table
 */
budget.prototype.checkBudgetaryStausInBudgetaryUnitTable = function(budgetaryNameText){
	var isTextPresent = false;	
	var budgetrayStatus;
	return util.waitForAngular().then(function(){
		browser.wait(EC.visibilityOf(element(by.css(".bx--table-cell--truncate"))), 30000);
		var budgetaryArray = element.all(by.css(".bx--table-cell--truncate"));
		return budgetaryArray.getText().then(function(textArray){
			for (var i = 0; i < textArray.length; i++){
				if(textArray[i]==budgetaryNameText){
					logger.info(budgetaryNameText +" Found");
					isTextPresent = true;
					logger.info("budgetrayStatus : "+textArray[i+4]);
					budgetrayStatus = textArray[i+4];
					return budgetrayStatus;			
				}
			}
		});
	}).then(function(){
		logger.info("status is : "+budgetrayStatus);
		return budgetrayStatus;
	});	
};

/**
 * Click on Edit Icon from budgetary table and View the details of created budgetary unit 
 */
budget.prototype.clickOnEditIconAndViewDetailsForBudgetaryUnit = function(budgetaryNameText){
	var budgetrayStatus;
	util.waitForAngular().then(function(){
		browser.wait(EC.visibilityOf(element(by.css(".bx--table-cell--truncate"))), 30000);
		var budgetaryArray = element.all(by.css(".bx--table-cell--truncate"));
		budgetaryArray.getText().then(function(textArray){
			for (var i = 0; i < textArray.length; i++){
				if(textArray[i]==budgetaryNameText){
					logger.info("Value ------- "+i);
					logger.info(budgetaryNameText +" Found");
					var index = i/5;
					index = parseInt(index + 1);
					logger.info("Row Index : "+index);
					var editicon = element(by.css('#carbon-deluxe-data-table-0-parent-row-'+index+'-overflow-menu-icon svg'));
					util.scrollToWebElement(editicon);
					util.scrollToTop();
					browser.wait(EC.elementToBeClickable(editicon),30000);					
					browser.actions().mouseMove(editicon).click().perform().then(function(){
						logger.info("Clicked on Edit ICON");
						util.waitForAngular();	
						browser.wait(EC.elementToBeClickable(element(by.css('#carbon-deluxe-data-table-0-parent-row-'+index+'-option-1-button'))),30000);
						element(by.css('#carbon-deluxe-data-table-0-parent-row-'+index+'-option-1-button')).click().then(function(){
							logger.info("Clicked on View Details");
						});		
					});		
				}
			}
		});
	});	
};


//*************Budgetary budgets*************************************************//

/**
 * Click on Add Budget button from Budgets section..
 */
budget.prototype.clickOnBudgetaryAddBudgetButton = function(){
	var addBudgetEle = element(by.css(this.budgetaryBudgetsAddBudgetButtonCss));
	browser.wait(EC.visibilityOf(addBudgetEle),30000).then(function(){
		browser.wait(EC.elementToBeClickable(addBudgetEle),30000).then(function(){
			logger.info("Budgatary Add Budget Button is visible...");
		});
	});	
	return element(by.css(this.budgetaryBudgetsAddBudgetButtonCss)).click().then(function(){
		logger.info("Clicked on budgatary Add Budget Button...");
	});
};

/**
 * Click on Create budget button from Budgets form.. 
 */
budget.prototype.clickOnBudgetaryCreateNewBudgetButton = function(){
	var CreateNewBudgetEle = element(by.css(this.CreateNewBudgetButtonCss));
	browser.wait(EC.elementToBeClickable(CreateNewBudgetEle),30000).then(function(){
		logger.info("Budgatary Create New Budget Button is Clicable...");
	});	
	element(by.css(this.CreateNewBudgetButtonCss)).click().then(function(){
		logger.info("Clicked on budgatary Create New Budget Button...");
	});	
};


/**
 * Click on Back button from Budgets form  
 */
budget.prototype.clickOnBudgetaryBackBudgetButton = function(){
	var backBudgetBtnEle = element(by.css(this.BackBudegtButtonCss));
	browser.wait(EC.elementToBeClickable(backBudgetBtnEle),30000).then(function(){
		logger.info("Budgatary Back Budget Button is Clicable...");
	});	
	element(by.css(this.BackBudegtButtonCss)).click().then(function(){
		logger.info("Clicked on budgatary back Budget Button...");
	});	
};

/**
 * Get text message from notification Pop-up in the Budgets form  
 */
budget.prototype.getTextNotificationMsgBudgetPage = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.NotificationMsgXpath))),90000);
	return element(by.xpath(this.NotificationMsgXpath)).getText().then(function(text){
		logger.info("Notification message text : "+text);
		return text;
	});
};

/**
 * Click on close icon from notification Pop-up in the Budgets form  
 */
budget.prototype.clickOnNotificationCloseButton = function(){
	var CreateNewBudgetEle = element(by.css(this.NotificationCloseBtnCss));
	browser.wait(EC.elementToBeClickable(CreateNewBudgetEle),30000).then(function(){
		logger.info("Notification Budget close Button is Clicable...");
	});	
	element(by.css(this.NotificationCloseBtnCss)).click().then(function(){
		logger.info("Clicked on Notification Budget close Button...");
	});	
};

/**
 * Set value for End Period text box in the budgets form
 */
budget.prototype.setTextBudgetEndPeriod = function(budgetryEndPeriod){
	browser.wait(EC.visibilityOf(element(by.css(this.BudgetDetailsEndPeriodCss))),30000);
	element(by.css(this.BudgetDetailsEndPeriodCss)).clear();
	return element(by.css(this.BudgetDetailsEndPeriodCss)).sendKeys(budgetryEndPeriod).then(function(){
		logger.info("Budgetry end period is entered...");
	});
};

/**
 * Verify Add New Budget text is displayed in the budgets form
 */
budget.prototype.isBudgetaryAddNewBudgetTextDisplayed = function(){
	var addNewBudgetTxtEle = element(by.xpath(this.budgetaryAddNewBudgetsTxtXpath));
	return addNewBudgetTxtEle.isDisplayed().then(function(){
		logger.info("Add New Budget text is displayed.....");
	});
};


/**
 * Fill order details function to fill the parameter details based on the provided value in JSON 
 */
budget.prototype.fillOrderDetails = function(jsonTemplate, modifiedParamMap) {
	var deferred = protractor.promise.defer();
	var requiredReturnMap = {}, expectedMap = {}, actualMap = {};
	var EC = protractor.ExpectedConditions;
	var jsonObject = JSON.parse(JSON.stringify(jsonTemplate));
	var elem = null;
	//browser.ignoreSynchronization = false;
	//Adding below condition for Provisioning/Edit flows
	var orderParameters,jsonObjectForParameters;
	if (modifiedParamMap["EditService"] == true){
		orderParameters = Object.keys(jsonObject["Edit Parameters"]);
		jsonObjectForParameters = jsonObject["Edit Parameters"];
	}else{
		orderParameters = Object.keys(jsonObject["Order Parameters"]);
		jsonObjectForParameters = jsonObject["Order Parameters"];
	}	

	//var orderParameters = Object.keys(jsonObject["Order Parameters"]);
	Object.keys(orderParameters).forEach(function (detailSection) {
		browser.executeScript('window.scrollTo(0,0);')
		var webElements = Object.keys(jsonObjectForParameters[orderParameters[detailSection]]);
		Object.keys(webElements).forEach(function (webElement) {
			var environment = browser.params.url.includes("cb-qa-1") ? "QA 1" :  browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : browser.params.url.includes("d2ops-test") ? "D2OPS" : "QA 4";
			var webElementObject = Object.keys(jsonObjectForParameters[orderParameters[detailSection]][webElements[webElement]]);
			var elementType = Object.values(jsonObjectForParameters[orderParameters[detailSection]][webElements[webElement]][webElementObject[0]]).join("");
			var elementID = Object.values(jsonObjectForParameters[orderParameters[detailSection]][webElements[webElement]][webElementObject[1]]).join("");
			var elementValue = Object.values(jsonObjectForParameters[orderParameters[detailSection]][webElements[webElement]][webElementObject[2]][environment]).join("");
			elem = elementID;
			if (modifiedParamMap != undefined) {
				if (Object.keys(modifiedParamMap).includes(webElements[webElement]))
					elementValue = modifiedParamMap[webElements[webElement]];
			}
			if (!elementValue == "") {
				if (elementType == "Dropdown") {		
					var dropdown = element(by.css("[id=\"" + elementID + "\"]"));
					//browser.ignoreSynchronization = false;
					browser.sleep(1000);
					util.waitForAngular();	
					browser.wait(EC.elementToBeClickable(dropdown), 60000).then(function(){
						//util.waitForAngular();	
						dropdown.isEnabled().then(function (enabled) {
							if(enabled){
								dropdown.click().then(function(){
									var dropDownValuesArray = element.all(by.xpath("//*[@id='" + elementID + "']//carbon-dropdown-option//a"));
									dropDownValuesArray.getText().then(function (textArray) {
										var isDropDownValuePresent = false;
										for (var i = 0; i < textArray.length; i++) {
											if (textArray[i] == elementValue) {
												dropDownValuesArray.get(i).click().then(function () {
													logger.info("Selected " + elementValue + " from " + webElements[webElement] + " dropdown");
													expectedMap[webElements[webElement].trim()] = elementValue.trim();
													deferred.fulfill(expectedMap);
												});
												isDropDownValuePresent = true;
											}
										}
										if (!isDropDownValuePresent) {
											dropDownValuesArray.get(0).getText().then(function (text) {
												dropDownValuesArray.get(0).click().then(function () {
													logger.info("Selected " + text + " from " + webElements[webElement] + " dropdown");
													expectedMap[webElements[webElement].trim()] = text.trim();
													deferred.fulfill(expectedMap);
												});
											});
										}
									});
								});
							}
						});                      

					});                    
				}
				if (elementType == "RadioButton") {
					//browser.sleep(5000);
					var radioButtion = element(by.css("[id*=\"" + elementID + "\"] ~ label span"));
					util.waitForAngular();	
					// browser.sleep(5000);
					browser.wait(EC.presenceOf(radioButtion), 60000);
					radioButtion.click().then(function () {
						logger.info("Selected " + elementValue + " radio button for " + webElements[webElement]);
						expectedMap[webElements[webElement].trim()] = elementValue.trim();
						deferred.fulfill(expectedMap);
					})
				}
				if (elementType == "Textbox") {
					var textbox = element(by.css("[id^=\"" + elementID + "\"]"));
					util.waitForAngular();	
					//    browser.sleep(5000);
					browser.wait(EC.presenceOf(textbox), 60000);
					textbox.clear().then(function () {
						logger.info("Cleared " + webElements[webElement] + " textbox");
						var ctrlA = protractor.Key.chord(protractor.Key.CONTROL, "a");
						textbox.sendKeys(ctrlA);
					});
					textbox.sendKeys(elementValue).then(function () {
						logger.info("Entered " + elementValue + " in " + webElements[webElement] + " textbox");
						expectedMap[webElements[webElement].trim()] = elementValue.trim();
						deferred.fulfill(expectedMap);
					})
				}
				if (elementType == "MultiselectDropdown") {
					var multiElementValue = Object.values(jsonObject["Order Parameters"][orderParameters[detailSection]][webElements[webElement]][webElementObject[2]][environment]);
					var multiElementValueArray = multiElementValue.toString().split(",");
					var checkBoxDropDown = element(by.css("[id=\"" + elementID + "\"]"));
					util.waitForAngular();	
					browser.sleep(5000);
					browser.wait(EC.elementToBeClickable(checkBoxDropDown), 60000);
					checkBoxDropDown.click().then(function () {
						logger.info("Clicked on " + webElements[webElement] + " multi-select dropdown");
					});
					var dropDownValues = element.all(by.css("[id^=dropdown-option__]"));
					browser.wait(EC.presenceOf(dropDownValues), 60000);
					dropDownValues.getText().then(function (dropDownValuesArray) {
						logger.info("Dropdown Values: " + dropDownValuesArray);
						for (var i = 0; i < multiElementValueArray.length; i++) {
							for (var j = 0; j < dropDownValuesArray.length; j++) {
								if (multiElementValueArray[i].toString().trim() == dropDownValuesArray[j].toString().trim()) {
									element.all(by.css("[id^=bx--dropdown-item-]")).get(j).click();
									logger.info("Clicked on checkbox " + multiElementValueArray[i] + " from " + webElements[webElement] + " multi-select dropdown");
									expectedMap[webElements[webElement].trim()] = multiElementValueArray.toString().trim();
									deferred.fulfill(expectedMap);
								}
							}
						}
						checkBoxDropDown.click();
					});
				}
				if(elementType == "DropdownSearch"){
					var dropdownbox = element(by.xpath("//*[@id='"+elementID + "' or @id = '" + elementID.toLowerCase() +"']/div"));
					util.waitForAngular();	
		            browser.sleep(5000);
					browser.wait(EC.presenceOf(dropdownbox), 10000).then(function(){
						dropdownbox.click().then(function(){
							browser.sleep(1000);
							util.waitForAngular();
							var dropDownValuesArray = element.all(by.xpath("//*[@id='"+elementID + "' or @id = '" + elementID.toLowerCase() + "']//ul//li"));
							dropDownValuesArray.getText().then(function(textArray){
									var isDropDownValuePresent = false;
									for (var i=0;i<textArray.length;i++){
										if (textArray[i] == elementValue){
											dropDownValuesArray.get(i).click().then(function(){
												logger.info("Selected "+elementValue+" from "+webElements[webElement]+" dropdown");
												expectedMap[webElements[webElement].trim()] = elementValue.trim();
						                    	deferred.fulfill(expectedMap);
						                    });
						                    isDropDownValuePresent =true;
						                }
						            }
						            if(!isDropDownValuePresent){
						            	dropDownValuesArray.get(0).getText().then(function(text){
						            		dropDownValuesArray.get(0).click().then(function(){
						            			logger.info("Selected "+text+" from "+webElements[webElement]+" dropdown");
						            			expectedMap[webElements[webElement].trim()] = text.trim();
						            			deferred.fulfill(expectedMap);
						            		})
						            	})
						            }
						        });
						});
					});
					
                }
				if(elementType == "Button"){
					elementValue = " ";
					var button = element(by.css("[id=\""+ elementID +"\"]"));
					util.waitForAngular();	
					// browser.sleep(5000);
					browser.wait(EC.elementToBeClickable(button), 30000).then(function(){
						button.click().then(function(){
							logger.info("Clicked on the Button "+ webElements[webElement]);
						});
					});
				}
				if(elementType == "Checkbox"){
					elementValue = " ";
					var button = element(by.xpath(elementID));
					util.waitForAngular();	
					// browser.sleep(5000);
					browser.wait(EC.elementToBeClickable(button), 30000).then(function(){
						button.click().then(function(){
							logger.info("Clicked on the checkbox "+ webElements[webElement]);
						});
					});
				}
			}else{
				browser.sleep(5000);	
			}
		});

		util.waitForAngular();
	});

	requiredReturnMap["Actual"] = actualMap;
	requiredReturnMap["Expected"] = expectedMap;
	deferred.fulfill(requiredReturnMap);
	return deferred.promise;

}
// Find the budgetary unit, click on View Details and then find the Budget , click on View Details to get the Budget Details
// It handles both the cases having Budgetary Unit and Budget Name with same or different Name
budget.prototype.clickOnViewDetailsForBudgetaryUnit = function(budgetaryUnitNameText,budgetNameText){
	var curr =this;
	util.waitForAngular().then(function(){
		browser.wait(EC.visibilityOf(element(by.css(curr.GetDetailsCss))), 30000);
		var budgetaryUnitArray = element.all(by.css(curr.GetDetailsCss));
		var index;
		var budgetrayArrLen;
		budgetaryUnitArray.getText().then(function(textArray){
			budgetrayArrLen = textArray.length;
			for (var i = 0; i < textArray.length; i++){
				
				if(textArray[i]==budgetaryUnitNameText){
					logger.info("Value ------- "+i);
					logger.info( budgetaryUnitNameText +" is Available in Budgetary Unit Table");
					 index = i/5;
					index = parseInt(index + 1);
					logger.info("Row Index : "+index);
				}
				
		}
					var navigationicon = element(by.css('#carbon-deluxe-data-table-0-parent-row-'+index+'-overflow-menu-icon svg'));
					util.scrollToWebElement(navigationicon);
					util.scrollToTop();
					browser.wait(EC.elementToBeClickable(navigationicon),30000);					
					browser.actions().mouseMove(navigationicon).click().perform().then(function(){
						logger.info("Clicked on Navigation ICON");
						util.waitForAngular();	
						browser.wait(EC.elementToBeClickable(element(by.css('#carbon-deluxe-data-table-0-parent-row-'+index+'-option-1-button'))),30000);
						element(by.css('#carbon-deluxe-data-table-0-parent-row-'+index+'-option-1-button')).click().then(function(){
							logger.info("Clicked on Budgetary Unit's View Details");
						});		
					});		
				
			
		});
		curr.clickOnBudgetryBudgetsLink();
		util.waitForAngular().then(function(){
            browser.sleep(6000);                 
			browser.wait(EC.visibilityOf(element(by.css(curr.GetDetailsCss))), 30000);
			var budgetaryArray = element.all(by.css(curr.GetDetailsCss));
			budgetaryArray.getText().then(function(textArray){
				var  budgetArrayLen= textArray.length ;
				for (var i =budgetrayArrLen-1 ; i < textArray.length; i++){
					 
					if(textArray[i]==budgetNameText){
						logger.info("Value ------- "+i);
						logger.info(budgetNameText +" is Available in Budget Table");
						 index = (budgetArrayLen-budgetrayArrLen)/13;
						index = parseInt(index);
						logger.info("Row Index : "+index);
					}
	
				}
				
				var navigationicon = element(by.xpath('(//*[@id="carbon-deluxe-data-table-0-parent-row-'+index+'-overflow-menu-icon"])[2]'));
				util.scrollToWebElement(navigationicon);
				util.scrollToTop();
				browser.wait(EC.elementToBeClickable(navigationicon),30000);					
				browser.actions().mouseMove(navigationicon).click().perform().then(function(){
					logger.info("Clicked on Navigation Icon");
					util.waitForAngular();	
					browser.wait(EC.elementToBeClickable(element(by.xpath('(//*[@id="carbon-deluxe-data-table-0-parent-row-'+index+'-option-1-button"])[2]'))),30000);
					element(by.xpath('(//*[@id="carbon-deluxe-data-table-0-parent-row-'+index+'-option-1-button"])[2]')).click().then(function(){
						logger.info("Clicked on Budget's View Details");
							});		
						});		
					
				
			
					});
		});	
	});
};

// Budget Ammount on Budgets/Budget Details page available 
budget.prototype.getTextBudgetAmmount = function () {
	browser.wait(EC.visibilityOf(element(by.xpath(this.BudgetAmmountXpath))),5000);
	return element(by.xpath(this.BudgetAmmountXpath)).getAttribute("value").then(function (text) {
        logger.info("Budget Ammount on Budgets/Budget Details page : " + text);
        return text;
    });
};

//Available Ammount on Budgets/Budget Details page
budget.prototype.getTextAvailableAmount = function () {
	browser.wait(EC.visibilityOf(element(by.xpath(this.AvailableAmmountXpath))),5000);
	return element(by.xpath(this.AvailableAmmountXpath)).getAttribute("value").then(function (text) {
        logger.info("Available Ammount on Budgets/Budget Details page : " + text);
        return text;
    });
};

// Commited Ammount on Budgets/Budget Details page
budget.prototype.getTextCommittedAmount = function () {
	browser.wait(EC.visibilityOf(element(by.xpath(this.CommittedAmountXpath))),5000);
	return element(by.xpath(this.CommittedAmountXpath)).getAttribute("value").then(function (text) {
        logger.info("Commited Ammount on Budgets/Budget Details page : " + text);
        return text;
    });
};

//Under Approval Ammount on Budgets/Budget Details page
budget.prototype.getTextUnderAprovalAmount = function () {
	browser.wait(EC.visibilityOf(element(by.xpath(this.CommittedAmountXpath))),5000);
	return element(by.xpath(this.UnderAprovalAmountXpath)).getAttribute("value").then(function (text) {
        logger.info("Under Approval Ammount on Budgets/Budget Details page: " + text);
        return text;
    });
};

// Calculated Estimated Ammountfor Order
budget.prototype.calculateEstimatedAmmountforOrder = function (budgetDuration, totalCost) {
	var cost = parseFloat(("" + totalCost).replace(/[^\d\.]*/g, ''), 2).toFixed(2);
	var amount = cost * budgetDuration;
	amount = amount.toFixed(2);
	var estCost = amount.toString();
	var estCost1 = estCost.slice(0, (estCost.indexOf(".")) + 3);
        
	logger.info("Calculated estimated amount for this order: " + estCost1);
	return estCost1;
}

// Calculated expected Committed Amount after provisioning completed On Budgets/Budget Details page
budget.prototype.calculateCommittedAmountAfterProvCompletedOnBudgetPage = function (committedAmnt, estCost) {

	var committedCost1 = parseFloat(("" + committedAmnt).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);

	var amount = committedCost1 + estCost1
	amount = amount.toFixed(2);
	var amountToCommit = amount.toString();
	var actualCommitCost = (Number(amountToCommit)).toFixed(2);;

	logger.info("Calculated Committed Amount for this order after provisioning completed on Budget Page: " + actualCommitCost);
	return actualCommitCost;

}

// Calculated expected Avaialable Amount after provisioning completed On Budgets/Budget Details page
budget.prototype.calculateAvailableBudgetAfterProvCompletedOnBudgetPage = function (availCost, estCost) {
	var availCost1 = parseFloat(("" + availCost).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = availCost1 - estCost1
	var amountAvail = amount.toString();
	amount = amount.toFixed(2);
	var actualAvailCost = (Number(amountAvail)).toFixed(2);

	logger.info("Calculated Available Budget for this order after provisioning completed  on Budget Page: " + actualAvailCost);
	return actualAvailCost;
}

// Calculated expected Committed Amount On Budgets/Budget Details page once deletion is completed with one month cost deduction  
budget.prototype.calculateDeleteCommittedAmountOnBudgetPage = function (committedAmnt, estCost) {
	var commitCost = parseFloat(("" + committedAmnt).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = commitCost - estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualEstCost = (Number(estAmount)).toFixed(2);

	logger.info("Calculated Committed Amount after deletion is completed with one month cost deduction  on Budget Page: " + actualEstCost);
	return actualEstCost
}

// Calculated Estimated Amount On Budgets/Budget Details page once deletion is completed with one month cost deduction 
budget.prototype.calculateEstCostAfterDeleting1MonthOrderOnBudgetPage = function (estCost, oneMonthCost) {
	var oneMonthCost = parseFloat(("" + oneMonthCost).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = estCost1 - oneMonthCost;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualEstCost = (Number(estAmount)).toFixed(2);

	logger.info("Calculated Estimated Amount for the delete order  on Budget Page: " + actualEstCost);
	return actualEstCost;

}

// Calculated expected Available Amount On Budgets/Budget Details page once deletion is completed with one month cost deduction 
budget.prototype.calculateAfterDeletingAvailBudgetOnBudgetPage = function (availBudget, estCost) {
	var availBudget1 = parseFloat(("" + availBudget).replace(/[^\d\.]*/g, ''), 2);
	var estCost1 = parseFloat(("" + estCost).replace(/[^\d\.]*/g, ''), 2);
	var amount = availBudget1 + estCost1;
	amount = amount.toFixed(2);
	var estAmount = amount.toString();
	var actualAvailCost = (Number(estAmount)).toFixed(2);
	logger.info("Calculated Available Budget after deleting the order : " + actualAvailCost);
	return actualAvailCost;

}
module.exports = budget;
