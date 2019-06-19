"use strict";

var extend = require('extend');
var url = browser.params.url;
var EC = protractor.ExpectedConditions;

//Accounts pageObjects
var defaultConfig = {
	pageUrl: url + '/accounts', 
	buttonAddAccountXpath: '//button[contains(.,"Add Account")]',

    accountLinkTextXpath:        		'//a[contains(text(), "ACCOUNTS")]',

    //Amazon Account
    buttonAmazonAddAccountXpath: '(//button[contains(.,"Select")])[0]',
    //SoftLayer
    buttonSoftLayerAddAccountXpath: '(//button[contains(.,"Select")])[1]',
    //VRA
    buttonVRAAddAccountXpath: '(//button[contains(.,"Select")])[2]',
 
    //Locators in Add Account page 
    buttonSelectAddAccountCss:	'.button.button2',
    bluePrintAccountTitleCss:	'.middle_vertical_align.upper_name',
    
    //Locators specific to providers 
    //Common
    titleAddANewAccountCss:			'.account-page-sub-heading',
    subtitleProviderNameCss:		'.form-control-input-account-name',
    titleForCredentialsCss:			'h5',
    submitButon:					'.button-submit',
};  

function accounts(selectorConfig) {
    if (!(this instanceof accounts)) {
        return new accounts(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

accounts.prototype.isPresentAccountsLink = function()
{
    return element(by.xpath(this.accountLinkTextXpath)).isPresent();
};

//Accounts pageObject's Actions
accounts.prototype.open = function()
{
   browser.get(this.pageUrl);
};

//Amazon
accounts.prototype.clickAmazonAddAccount = function() {

};

//VRA
accounts.prototype.clickVRAAddAccount = function() {

};

//SoftLayer
accounts.prototype.clickSoftLayerAddAccount = function() {

};

accounts.prototype.clickAccountLink = function()
{
    browser.wait(EC.visibilityOf(element(by.xpath(this.accountLinkTextXpath))),5000);
    return element(by.xpath(this.accountLinkTextXpath)).click();
};

//************Click Add Button**********//
accounts.prototype.clickButtonAddAccount = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.buttonAddAccountXpath))), 5000);
	return element(by.xpath(this.buttonAddAccountXpath)).click();
}
//************Add Accounts Section For Different Providers*************//
accounts.prototype.getIndexofBluePrintAccount = function(blueprintAccountName){
	browser.wait(EC.elementToBeClickable(element(by.css(this.bluePrintAccountTitleCss))), 5000);
   return element.all(by.css(this.bluePrintAccountTitleCss)).getText().then(function(arr){
	   console.log("Got all the elemets. Going to find the index of "+blueprintAccountName);
	   for (var i=0;i<arr.length;i++){
		console.log("Comparing "+arr[i]+" with "+blueprintAccountName);
           if (arr[i] == blueprintAccountName){
			   return i;
			}
		}
   })
};

accounts.prototype.clickSelectButtonBasedOnAccountName = function(blueprintAccountName){
	var current = this;
	return this.getIndexofBluePrintAccount(blueprintAccountName).then(function(index){
	   element.all(by.css(current.buttonSelectAddAccountCss)).get(index).click();
	   console.log("Clicked select button for"+ blueprintAccountName)
   })
};

//*********Common functions to all Providers***********//
accounts.prototype.getTextAddANewAccount = function() {
	return element(by.css(this.titleAddANewAccountCss)).getText().then(function(text){
		console.log(text);
		return text;
	})
};

accounts.prototype.getTextProviderName = function() {
	return element(by.css(this.subtitleProviderNameCss)).getAttribute("value").then(function(text){
		console.log(text);
		return text;
	})
}; 

//**************Add Account for VRA Provider****************//
accounts.prototype.getTextCredentialsDetails = function() {
	return element(by.css(this.titleForCredentialsCss)).getText().then(function(text){
		console.log(text);
		return text;
	})
};

accounts.prototype.getIndexofFormInputs = function(inputDetail){
	browser.wait(EC.elementToBeClickable(element(by.css(this.formInputDetailsCss))), 5000);
   return element.all(by.css(this.formInputDetailsCss)).getText().then(function(arr){
	   console.log("Got all the elements. Going to find the index of "+inputDetail);
	   for (var i=0;i<arr.length;i++){
		console.log("Comparing "+arr[i]+" with "+inputDetail);
           if (arr[i] == blueprintName){
			   return i;
			}
		}
   })
};

accounts.prototype.setTextFormDetailsBasedOnInput = function(inputDetail){
	return element(by.xpath('//label[contains(text(),"'+inputDetail+'")]')).sendKeys("Test "+inputDetail);
};

accounts.prototype.checkShowHideCheckBox = function(inputDetail){
	return element(by.xpath('//label[contains(text(),"'+inputDetail+'")]//input[@type = "checkbox"]')).click();
};

accounts.prototype.selectAccountType = function(inputDetail){
	return element(by.xpath('//label[contains(text(),"'+inputDetail+'")]//input[@type = "radio"]')).click();
};

//**************Check accounts list for dynamic filters on Inventory Page****************//
accounts.prototype.checkIfAccountExists = function(providerName){
	var elem = element(by.xpath('//*[contains(text(), "'+ providerName +' MASTER ACCOUNTS")]'));
	return elem.isPresent().then(function(present) {
        console.log(providerName + " isPresent: " + present)
        return present
	})
}

module.exports = accounts;