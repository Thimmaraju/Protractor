"use strict";
var logGenerator = require("./logGenerator.js"),
logger = logGenerator.getApplicationLogger(),
budgetaryPage = require('../e2e/pageObjects/budget.pageObject.js'),
util = require('./util.js'),
jsonUtil = require('./jsonUtil.js');

var budgetaryPage;
var fs = require('fs');
var EC = protractor.ExpectedConditions;

budgetaryPage = new budgetaryPage();

var defaultBudgetaryObject = {
		"serviceName": "amazon VPC" + util.getRandomString(4)
};


var budgetrayTerm;

/**
 * Checking budgetary name is present in the Budgetary Unit table
 * @param budgetaryNameText
 * @returns Budgetary Term
 */
function checkBudgetaryNameInBudgetaryUnitTable(budgetaryNameText){
	var isTextPresent = false;
	var currentPageNumber;
	var totalPageNumber;

	return util.waitForAngular().then(function(){
		browser.wait(EC.visibilityOf(element(by.css(".bx--table-cell--truncate"))), 30000);
		var budgetaryArray = element.all(by.css(".bx--table-cell--truncate"));
		return budgetaryArray.getText().then(function(textArray){
			for (var i = 0; i < textArray.length; i++){
				if(textArray[i]==budgetaryNameText){
					logger.info(budgetaryNameText +" Found");
					isTextPresent = true;
					logger.info("Term : "+textArray[i+3]);
					budgetrayTerm = textArray[i+3];
					return budgetrayTerm;			
				}
			}
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
						checkBudgetaryNameInBudgetaryUnitTable(budgetaryNameText);
						logger.info("Function called again.....");

					});
				}else{
					logger.info("We are at last page.....");
					logger.info("Term : "+budgetrayTerm);
					return budgetrayTerm;
				}
			});
		});

	}).then(function(){
		logger.info("budgetrayTerm : "+budgetrayTerm);
		return budgetrayTerm;
	});

}

/**
 * To retrieve the date based on the parameter passed
 * @param x : X is incremental value
 * @returns YYYYMM
 */
function incrementMonth(x) {
	var CurrentDate = new Date();
	CurrentDate.setMonth(CurrentDate.getMonth() + x);

	var d = new Date(CurrentDate),
	month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	year = d.getFullYear();
	if (month.length < 2) month = '0' + month;
	return   [year, month].join("");
}



module.exports = {    
		checkBudgetaryNameInBudgetaryUnitTable: checkBudgetaryNameInBudgetaryUnitTable,
		incrementMonth: incrementMonth
};
