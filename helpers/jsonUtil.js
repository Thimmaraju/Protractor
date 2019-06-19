/************************************************
	AUTHOR: SANTOSH HADAWALE
************************************************/
"use strict";
var logGenerator = require("./logGenerator.js");
var logger = logGenerator.getApplicationLogger();

function getValue(jsonObject, key){
	var value;
	var EC = protractor.ExpectedConditions;
	var orderParameters = Object.keys(jsonObject["Order Parameters"]);
	Object.keys(orderParameters).forEach(function(detailSection){
		var webElements = Object.keys(jsonObject["Order Parameters"][orderParameters[detailSection]]);
		Object.keys(webElements).forEach(function(webElement){			
			var environment = browser.params.url.includes("cb-qa-1") ? "QA 1" :  browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

			var webElementObject = Object.keys(jsonObject["Order Parameters"][orderParameters[detailSection]][webElements[webElement]]);
			if(webElements[webElement].trim() == key.trim())
				value = Object.values(jsonObject["Order Parameters"][orderParameters[detailSection]][webElements[webElement]][webElementObject[2]][environment]).join("");
		})
	});
	logger.info(key+" key has value as: "+value);
	return value.trim();
};

function getValueEditParameter(jsonObject, key){
	var value;
	var EC = protractor.ExpectedConditions;
	var editParameters = Object.keys(jsonObject["Edit Parameters"]);
	Object.keys(editParameters).forEach(function(detailSection){
		var webElements = Object.keys(jsonObject["Edit Parameters"][editParameters[detailSection]]);
		Object.keys(webElements).forEach(function(webElement){			
			var environment = browser.params.url.includes("cb-qa-1") ? "QA 1" :  browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";

			var webElementObject = Object.keys(jsonObject["Edit Parameters"][editParameters[detailSection]][webElements[webElement]]);
			if(webElements[webElement].trim() == key.trim())
				value = Object.values(jsonObject["Edit Parameters"][editParameters[detailSection]][webElements[webElement]][webElementObject[2]][environment]).join("");
		})
	});
	logger.info(key+" key has value as: "+value);
	return value.trim();
};

function getValueOfLocator(jsonObject, key){
	
	var locatorValue,locatorName;
	var EC = protractor.ExpectedConditions;

	var orderPageLocatorKeys = Object.keys(jsonObject["Order Details Locators"]);
	var orderPageLocatorValues = Object.values(jsonObject["Order Details Locators"]);
	
	for(var i = 0; i < orderPageLocatorKeys.length; i++){
		locatorName = orderPageLocatorKeys[i];
		if(locatorName == key){
			locatorValue = orderPageLocatorValues[i];
			return locatorValue.trim();
		}
				
	}
	
};

module.exports = {
		getValue:getValue,
		getValueOfLocator:getValueOfLocator,
		getValueEditParameter:getValueEditParameter
};

