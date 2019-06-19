/************************************************
	AUTHOR: Deepthi Chitti
************************************************/

"use strict";

var extend = require('extend');
var url = browser.params.url;
var EC = protractor.ExpectedConditions;
var logGenerator = require("../../helpers/logGenerator.js");
var logger = logGenerator.getApplicationLogger();
var util = require('../../helpers/util.js');

//Currency Conversion pageObjects
var defaultConfig = {
		pageUrl: 										url + '/conversion', 
		currencyConversionLinkTextXpath:        		'//a[contains(text(), "Currency Conversion")]',
		currentCurrencyTextXpath:						'//div[contains(text(),"Corporate Currency :")] //span',
		datePickerFromRangeCss:							'#date--range-picker-from-dateRangeID',
		datePickerToRangeCss:							'#date--range-picker-to-dateRangeID',
		searchCurrencyConversionTextboxCss:				'#search__input-conversion-rate-table-search',
		addConversionButtonCss:							'#button-addConversionRate',
		
		//Add Currency Conversion pop up
		fromCurrencyDropdownCss:						'#bx--dropdown-single-parent_currencyfrom',
		toCurrencyDropdownCss:							'#bx--dropdown-single-parent_currencyto',
		conversionRateTextboxCss:						'#text-input-insertRate',
		datePickerStartXpath:							'(//label[contains(text(), "Start Date")])[2]/following-sibling::input ',
		datePickerEndCss:								'#date-picker-endDate',
		cancelButtonConversionPopupxpath:				'//button[@id = "button-"] //span[contains(text(),"Cancel")]',
		addButtonConversionPopupxpath:					'//button[@id = "button-"] //span[contains(text(),"Add")]',
			
		//Add Conversion Rate popup
		addConversionPopupTitleXpath:					'//h2[contains(text(),"Add Conversion Rate")]',
		msgCurrenciesCannotBeSameXpath:					'//span[contains(text(),"currency from and to cannot be same")]',
		okButtonConversionRatePopUpXpath:				'//button[@id = "button-"] //span[contains(text(),"Ok")]',
		msgCurrAddedSuccessfullyXpath:					'//span[contains(text(),"The Conversion Rate has been added successfully")]',
		msgCurrDeletedSuccessfullyXpath:				'//span[contains(text(),"The Conversion Rate has been deleted successfully")]',
		msgCurrUpdatedSuccessfullyXpath:				'//span[contains(text(),"The Conversion Rate has been updated successfully")]',
		actionsIconConversionPageCss:					'[id$=-overflow-menu-icon]',
		btnTextEdit:									'Edit',				
		btntextDelete:									'Delete',
		btntextUpdate:									'Update',
		deleteButtonConversionRatePopUpXpath:			'//button[@id = "button-"] //span[contains(text(),"Delete")]',
		updateButtonConversionRatePopUpXpath:			'//button[@id = "button-"] //span[contains(text(),"Update")]',
		linkTextViewHistory:							'View History',
		linkTextViewDetails:							'Details',
};  

function currencyConversion(selectorConfig) {
    if (!(this instanceof currencyConversion)) {
        return new accounts(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

//Currency Conversion pageObject's Actions
currencyConversion.prototype.open = function()
{
	browser.ignoreSynchronization = false;
    browser.get(this.pageUrl);
    util.waitForAngular();
};

currencyConversion.prototype.isPresentCurrencyConversionLink = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.currencyConversionLinkTextXpath))),5000);
    return element(by.xpath(this.currencyConversionLinkTextXpath)).isDisplayed();
};

currencyConversion.prototype.isPresentCurrencyConversionText = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.currentCurrencyTextXpath))),5000);
    return element(by.xpath(this.currentCurrencyTextXpath)).isDisplayed();
};

currencyConversion.prototype.getCurrentCurrencyText = function()
{
    browser.wait(EC.visibilityOf(element(by.css(this.currentCurrencyTextXpath))),5000).then(function(){
    	return element(by.css(this.currentCurrencyTextXpath)).getText().then(function(text){
        	logger.info("Current Currency on this page :: "+text);
        });
    })	
};

currencyConversion.prototype.isPresentAddConversionRateButton = function()
{
	browser.wait(EC.visibilityOf(element(by.css(this.addConversionButtonCss))),5000)
    return element(by.css(this.addConversionButtonCss)).isPresent();
};


currencyConversion.prototype.clickAddConversionRate = function()
{
	browser.wait(EC.visibilityOf(element(by.css(this.addConversionButtonCss)),5000)).then(function(){
			logger.info("Add Conversion rate button is visible");
			util.waitForAngular();
	});
	return element(by.css(this.addConversionButtonCss)).click().then(function(){
		logger.info("Clicked on the Add Conversion Rate button...");
	});
};

currencyConversion.prototype.selectFromCurrency = function(fromCurrency)
{
	var curr = this;
	browser.wait(EC.visibilityOf(element(by.css(curr.fromCurrencyDropdownCss))),10000).then(function(){
		browser.wait(EC.elementToBeClickable(element(by.css(curr.fromCurrencyDropdownCss))),10000).then(function(){
			var dropdown = element(by.css(curr.fromCurrencyDropdownCss));
			return element(by.css(curr.fromCurrencyDropdownCss)).click().then(function(){
				var dropDownValuesArray = element.all(by.xpath("//*[@id='bx--dropdown-single-parent_currencyfrom']//carbon-dropdown-option//a"));
                dropDownValuesArray.getText().then(function (textArray) {
                    var isDropDownValuePresent = false;
                    for (var i = 0; i < textArray.length; i++) {
                        if (textArray[i] == fromCurrency) {
                            dropDownValuesArray.get(i).click().then(function () {
                                logger.info("Selected "+fromCurrency);
                            });
                            isDropDownValuePresent = true;
                        }
                    }
                    if (!isDropDownValuePresent) {
                        dropDownValuesArray.get(0).getText().then(function (text) {
                            dropDownValuesArray.get(0).click().then(function () {
                                logger.info("Not selected "+fromCurrency);
                            })
                        })
                    }
                });
			});
		});	
	});
};

currencyConversion.prototype.selectToCurrency = function(toCurrency)
{
	var curr = this;
	browser.wait(EC.visibilityOf(element(by.css(curr.toCurrencyDropdownCss))),10000).then(function(){
		browser.wait(EC.elementToBeClickable(element(by.css(curr.toCurrencyDropdownCss))),10000).then(function(){
			var dropdown = element(by.css(curr.toCurrencyDropdownCss));
			return element(by.css(curr.toCurrencyDropdownCss)).click().then(function(){
				var dropDownValuesArray = element.all(by.xpath("//*[@id='bx--dropdown-single-parent_currencyto']//carbon-dropdown-option//a"));
                dropDownValuesArray.getText().then(function (textArray) {
                    var isDropDownValuePresent = false;
                    for (var i = 0; i < textArray.length; i++) {
                        if (textArray[i] == toCurrency) {
                            dropDownValuesArray.get(i).click().then(function () {
                                logger.info("Selected "+toCurrency);
                            });
                            isDropDownValuePresent = true;
                        }
                    }
                    if (!isDropDownValuePresent) {
                        dropDownValuesArray.get(0).getText().then(function (text) {
                            dropDownValuesArray.get(0).click().then(function () {
                                logger.info("Not selected "+toCurrency);
                            })
                        })
                    }
                });
			});
		});	
	});
};

currencyConversion.prototype.enterConversionRate = function(conversionRate)
{
	var curr = this;
	browser.wait(EC.visibilityOf(element(by.css(curr.conversionRateTextboxCss))),10000).then(function(){
		return element(by.css(curr.conversionRateTextboxCss)).sendKeys(conversionRate).then(function(){
			logger.info("Entered Conversion Rate");
		});
	});
		
};


/*currencyConversion.prototype.selectStartDate = function()
{
	var picker = element.all(by.css(this.datePickerStartCss)).last();

	// get today's date
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	today = mm+'/'+dd+'/'+yyyy;
	picker.click();
	element(by.xpath("/div[@class='dayContainer']/span[@class = 'flatpickr-day today bx--date-picker__day'])[3]")).click().then(function(){
	//picker.setValue(today).then(function(){
		logger.info("Selected Start date :: "+today);
	});
	/*var length = element.all(by.xpath("(//div[@class='dayContainer']/span[@class = 'flatpickr-day today bx--date-picker__day'])"));
    element.all(by.xpath("(//span[starts-with(@class, 'flatpickr-day')][text()='"+dd+"'])['"+length - 1+"']")).last().click().then(function(){
    //picker.setValue(today).then(function(){
        logger.info("Selected Start date :: "+today);
    });
};*/

currencyConversion.prototype.selectStartDate = function()
{
	var picker = element(by.xpath(this.datePickerStartXpath));

	// get today's date
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	today = mm+'/'+dd+'/'+yyyy;
	picker.click();
	element.all(by.xpath("(//div[@class='dayContainer']/span[@class = 'flatpickr-day today bx--date-picker__day'])")).count().then(function(length){
		logger.info("total count: "+length);
		element.all(by.xpath("(//div[@class='dayContainer']/span[@class = 'flatpickr-day today bx--date-picker__day'])["+(length-1)+"]")).last().click().then(function(){
			//picker.setValue(today).then(function(){
				logger.info("Selected Start date :: "+today);
			});
	});
};

currencyConversion.prototype.selectEndDate = function()
{
	var picker = element.all(by.css(this.datePickerEndCss)).last();

	// get today's date
	var today = new Date();
	var dd = today.getDate()+1;
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	today = mm+'/'+dd+'/'+yyyy;

	picker.click();
	element.all(by.xpath("(//span[starts-with(@class, 'flatpickr-day')][text()='"+dd+"'])")).last().click().then(function(){
		logger.info("Selected End date :: "+today);
	});
};




currencyConversion.prototype.isPresentErrorMsgCantHaveSameCurrencyPopUp = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.msgCurrenciesCannotBeSameXpath))),5000);
	return element(by.xpath(this.msgCurrenciesCannotBeSameXpath)).isPresent().then(function(text){
		return text;
	})
};

currencyConversion.prototype.getTextErrorMsgCantHaveSameCurrencyPopUp = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.msgCurrenciesCannotBeSameXpath))),5000);
	return element(by.xpath(this.msgCurrenciesCannotBeSameXpath)).getText().then(function(text){
		logger.info("Error message "+text+" is present...");
		return text;
	})
};

currencyConversion.prototype.clickAddButtonInAddConversionPopUp = function()
{
	var curr = this;
	browser.wait(EC.visibilityOf(element(by.xpath(curr.addButtonConversionPopupxpath))),5000).then(function(){
		browser.wait(EC.elementToBeClickable(element(by.xpath(curr.addButtonConversionPopupxpath))),5000).then(function(){
			return element(by.xpath(curr.addButtonConversionPopupxpath)).click().then(function(){
				logger.info("Clicked on the Add button...");
			});
		});	
	});
};

currencyConversion.prototype.isPresentOkButtonConversionRatePopup = function()
{
	browser.wait(EC.presenceOf(element(by.xpath(this.okButtonConversionRatePopUpXpath))),5000).then(function(result){
		return 	result;
	});
};

currencyConversion.prototype.getTextSuccessMsgCurrAddedSuccessfully = function()
{
	//browser.wait(EC.visibilityOf(element(by.xpath(this.msgCurrAddedSuccessfullyXpath))),1000);
	return element(by.xpath(this.msgCurrAddedSuccessfullyXpath)).getText().then(function(text){
		logger.info("Success message "+text+" is present...");
		return text;
	})
};

currencyConversion.prototype.clickActionsIconConversionPage = function()
{
	browser.wait(EC.visibilityOf(element(by.css(this.actionsIconConversionPageCss))),10000);
	return element(by.css(this.actionsIconConversionPageCss)).click().then(function(){
		logger.info("Clicked on the Actions Icon...");
	});
};

currencyConversion.prototype.clickEditButton = function()
{
	browser.wait(EC.visibilityOf(element(by.buttonText(this.btnTextEdit))),5000);
	return element(by.buttonText(this.btnTextEdit)).click().then(function(){
		logger.info("Clicked on the Edit button...");
	});
};

currencyConversion.prototype.clickDeleteButton = function()
{
	browser.wait(EC.visibilityOf(element(by.buttonText(this.btntextDelete))),5000);
	return element(by.buttonText(this.btntextDelete)).click().then(function(){
		logger.info("Clicked on the delete button...");
	});
};

currencyConversion.prototype.clickDeleteInDeleteConversionPopUp = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.deleteButtonConversionRatePopUpXpath))),5000);
	return element(by.xpath(this.deleteButtonConversionRatePopUpXpath)).click().then(function(){
		logger.info("Clicked on delete button in delete conversion pop up...");
	});
};

currencyConversion.prototype.getTextSuccessMsgCurrDeletedSuccessfully = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.msgCurrDeletedSuccessfullyXpath))),2000);
	return element(by.xpath(this.msgCurrDeletedSuccessfullyXpath)).getText().then(function(text){
		logger.info("Success message "+text+" is present...");
		return text;
	})
};

//Functions related to Edit Conversion pop up
currencyConversion.prototype.clickUpdateButtonEditConversionPopup = function()
{
	browser.wait(EC.visibilityOf(element(by.buttonText(this.btntextUpdate))),5000);
	return element(by.buttonText(this.btntextUpdate)).click().then(function(){
		logger.info("Clicked on the update button...");
	});
};
currencyConversion.prototype.getTextSuccessMsgCurrUpdatedSuccessfully = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.msgCurrUpdatedSuccessfullyXpath))),2000);
	return element(by.xpath(this.msgCurrUpdatedSuccessfullyXpath)).getText().then(function(text){
		logger.info("Success message "+text+" is present...");
		return text;
	})
};

module.exports = currencyConversion;