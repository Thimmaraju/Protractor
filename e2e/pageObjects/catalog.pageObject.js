"use strict";

var extend = require('extend');
var url = browser.params.url;
var logGenerator = require("../../helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger();
var EC = protractor.ExpectedConditions;
var util = require('../../helpers/util.js');

var defaultConfig = {
	pageUrl:                      		url + '/storeFront/main',
    catalogLinkTextXpath:        		'//a[contains(text(), "Catalog")]',
	bluePrintTitleCss:              	'#card-title-2',
	configureButtonCss:             	'#button-storefront_carbon-button_configure',
	bluePrintTitleFromToolTipId:       'service-name_tooltip-content_',
	bluePrintPriceFromToolTipId:        'service-price_tooltip-content_',
	
	//Locators for Tab Links 
	allTabLinkCss:						'#tab-link-1',
	topRatedTabLinkCss:					'#tab-link-2',
	newestTabLinkCss:					'#tab-link-3',
	bestSellersTabLinkCss:				'#tab-link-4',
	cheapestFirstTabLinkCss:		'	#tab-link-5',
	
	// Locators for Filters 
	providerCompleteListCss:			'[id^="checkbox-store-filter-menu_store-filter-menu-item_provider"] ~ label',
	firstCategoryCompleteListCss:  		'[id^="checkbox-store-filter-menu_store-filter-menu-item_first-category"] ~ label',
	providerCheckboxesLabelCss:     	'[id^=store-filter-menu_store-filter-menu-item_provider] label',

	// Filters by Providers				
	providerFilterNameCss:				'#Provider',
	firstCategoryCheckBoxesLabelCss:    '[id^=checkbox-store-filter-menu_store-filter-menu-item_first-category] ~ label',
	linkTextReset :						'RESET',
	resetLinkForProviderSection:    	'#provider_filter_reset>a',
	resetLinkForCategorySection:    	'#category_filter_reset>a',
	searchTextBoxInputXpath: 			'//input[contains(@id,"search__input")]',
	serviceTileCss: 					'article.bx--card',
	serviceTileDetailsButtonCss: 		'#button-storefront_carbon-button_details',
	basePriceForDisplayedTemplatesCss:	'p.service-price',
    cartNameTextboxCss:					'text-input-main_params-cartName',
    cartIconCss: 						'#cart-btn',
    closeNotificationIconXpath: '//*[@class="bx--toast-notification bx--toast-notification--success"]//button',
  
}; 

function catalog(selectorConfig) {
    if (!(this instanceof catalog)) {
        return new catalog(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}


catalog.prototype.open = function()
{
    browser.ignoreSynchronization = false;
	browser.sleep(1000);
	browser.get(this.pageUrl);
	util.waitForAngular();
};

catalog.prototype.isPresentCatalogLink = function()
{
    return element(by.xpath(this.catalogLinkTextXpath)).isPresent();
};

//*************************** Functions for Clicking Tab links **********************************

catalog.prototype.clickAllTabLink = function(){
	element(by.css(this.allTabLinkCss)).click();
};

catalog.prototype.clickTopRatedTabLink = function(){
	element(by.css(this.topRatedTabLinkCss)).click();
};

catalog.prototype.clickNewestTabLink = function(){
	element(by.css(this.newestTabLinkCss)).click();
};

catalog.prototype.clickBestSellersTabLink = function(){
	element(by.css(this.bestSellersTabLinkCss)).click();
};

catalog.prototype.clickCheapestFirstTabLink = function(){
	element(by.css(this.cheapestFirstTabLinkCss)).click();
};

//*************************** Functions for Blue Prints ******************************************

catalog.prototype.getIndexofBluePrint = function(blueprintName){
	browser.wait(EC.elementToBeClickable(element(by.css(this.bluePrintTitleCss))), 15000);
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function(arr){
	   logger.info("Got all the elemets. Going to find the index of "+blueprintName);
	   for (var i=0;i<arr.length;i++){
		   logger.info("Comparing "+arr[i]+" with "+blueprintName);
           /*if (arr[i].indexOf(blueprintName)>-1){
                           return [i,arr[i]];
			}*/
		   if(arr[i] == blueprintName){
			   return i;
		   }
		}
   })
};

catalog.prototype.getAllServicesFromUI = function(){
	var current = this;
	//return element.all(by.css('article.bx--card'));
	return element.all(by.css(current.serviceTileCss))
	};
	
// function to determine Details button is displayed on a random selected catallog/service tile

catalog.prototype.isDisplayedDetailsButtonOnRandomBlueprint = function () {
	var current = this;
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function (arr) {
	    var noOfServiceTilesDisplayedInUi = arr.length;
		var index = Math.floor((Math.random() * noOfServiceTilesDisplayedInUi) + 0);
		logger.info("selecting template at index " + index);
		logger.info("selecting template title " + arr[index]);
		return element.all(by.css(current.serviceTileDetailsButtonCss)).get(index).isDisplayed();
	});

};

// function to click Details button  on a random selected catalog/service tile
catalog.prototype.clickDetailsButtonOnRandomBluePrint = function () {
	var current = this;
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function (arr) {
		var noOfServiceTilesDisplayedInUi = arr.length;
		var index = Math.floor((Math.random() * noOfServiceTilesDisplayedInUi) + 0);
		logger.info("selecting template at index " + index);
		logger.info("selecting template title " + arr[index]);
		element.all(by.css(current.serviceTileDetailsButtonCss)).get(index).click();
	});
};
	
catalog.prototype.isDisplayedConfigureButtonBasedOnName = function(blueprintName){
    var current=this;
    return this.getIndexofBluePrint(blueprintName).then(function(index){
        return element.all(by.css(current.configureButtonCss)).get(index).isDisplayed();
   })
};

catalog.prototype.clickConfigureButtonBasedOnName = function(blueprintName){
	var current = this;
	return this.getIndexofBluePrint(blueprintName).then(function(index){
	   //element.all(by.css(current.configureButtonCss)).get(index[0]).click();
		element.all(by.css(current.configureButtonCss)).get(index).click();
        browser.wait(EC.visibilityOf(element(by.buttonText('Next'))),10000);
	   logger.info("Clicked configure button for "+ blueprintName)
   })
};

catalog.prototype.clickBluePrintBasedOnName = function(blueprintName){
	var current = this;
	return this.getIndexofBluePrint(blueprintName).then(function(index){
	   element.all(by.css(current.bluePrintTitleCss)).get(index).click();
	   logger.info("Clicked template for "+ blueprintName)
   })
};

//Function to mouse click on a randomly selected  blueprint tile
catalog.prototype.clickOnRandomlySelectedBluePrint = function(){
	var current = this;
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function(arr){
		var index = Math.floor((Math.random() * (arr.length-1)));
		logger.info("selecting template at index "+index);
		element.all(by.css(current.bluePrintTitleCss)).get(index).click();
	})
};

//Function to mouse click on a randomly selected  blueprint configure button
catalog.prototype.clickConfigureBtnOnRandomlySelectedBluePrint = function(){
	var current = this;
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function(arr){
		var index = Math.floor((Math.random() * (arr.length-1)));
		logger.info("selecting template at index "+index);
		element.all(by.css(current.configureButtonCss)).get(index).click();
	})
};



//Function to use keys TAB + TAB  ENTER to operate Details button
catalog.prototype.selectDetailsButtonFromRandomBluePrintViaKeyBoard = function(){
	var current = this;
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function(arr){
		var index = Math.floor((Math.random() * (arr.length-1)));
		logger.info("selecting template at index "+index);
		element.all(by.css(current.configureButtonCss)).get(index).sendKeys(protractor.Key.TAB, protractor.Key.TAB,protractor.Key.ENTER);
	})
};

//Function to use keys TAB + TAB + TAB ENTER to operate Configure button
catalog.prototype.selectConfigureButtonFromRandomBluePrintViaKeyBoard = function(){
	var current = this;
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function(arr){
		var index = Math.floor((Math.random() * (arr.length-1)));
		logger.info("selecting template at index "+index);
		element.all(by.css(current.configureButtonCss)).get(index).sendKeys(protractor.Key.TAB, protractor.Key.TAB, protractor.Key.TAB,protractor.Key.ENTER);
	})
};

//Function to use keys TAB + ENTER to operate a service tile

catalog.prototype.selectRandomBluePrintViaKeyBoard = function(){
	var current = this;
	return element.all(by.css(this.bluePrintTitleCss)).getText().then(function(arr){
		var index = Math.floor((Math.random() * (arr.length-1)));
		logger.info("selecting template at index "+index);
		element.all(by.css(current.bluePrintTitleCss)).get(index).sendKeys(protractor.Key.TAB, protractor.Key.ENTER);
	})
};
//*************************** Functions for Filters ******************************************

//This function is used to get complete list of providers
catalog.prototype.getListofProviders = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.providerCompleteListCss))),15000);
	return element.all(by.css(this.providerCompleteListCss)).getText()

};

//This function is used to get complete list of first Category
catalog.prototype.getListofFirstCategories = function(){
	   browser.wait(EC.visibilityOf(element(by.css(this.firstCategoryCompleteListCss))),25000);
	   return element.all(by.css(this.firstCategoryCompleteListCss)).getText()
}; 


// This function is used to get the index of provider checkbox based on passed provider name
catalog.prototype.getIndexofProvider = function(providerName){
	browser.wait(EC.visibilityOf(element(by.css(this.providerCheckboxesLabelCss))),15000);
	return element.all(by.css(this.providerCheckboxesLabelCss)).getText().then(function(arr){
		for (var i=0;i<arr.length;i++)
			if (arr[i] == providerName)
	               return i;
	  	})
};
	
//This function is used to get click the provider CheckBox based on the passed provider name
catalog.prototype.clickProviderCheckBoxBasedOnName = function (providerName) {
	var curr = this;
	logger.info("Waiting for the Provider to be identified and Click it");
    browser.wait(EC.urlContains("storeFront/main"), 20000).then(function () {
        //browser.sleep(5000);
        curr.getIndexofProvider(providerName).then(function (index) {
			var id="checkbox-store-filter-menu_store-filter-menu-item_provider_"+index;
            var elemLocator = "input[id = '"+id+"'] ~ label";
            util.waitForAngular();
                browser.wait(EC.elementToBeClickable(element(by.css(elemLocator))), 60000).then(function () {
					//browser.sleep(3000);
					util.waitForAngular();
					element(by.css(elemLocator)).click().then(function () {
                        logger.info("Succesfully clicked on Provider : " + providerName);
                    });
                });
            });
        });
};
	
//This function is used to get the index of first category checkbox based on passed category name
catalog.prototype.getIndexofFirstCategory = function(firstCategoryName){
	browser.wait(EC.visibilityOf(element(by.css(this.firstCategoryCheckBoxesLabelCss))),5000);
	return element.all(by.css(this.firstCategoryCheckBoxesLabelCss)).getText().then(function(arr){
		for (var i=0;i<arr.length;i++)
			if (arr[i] == firstCategoryName)
	               return i;
	  	})
};
	
//This function is used to get click the category CheckBox based on the passed category name
catalog.prototype.clickFirstCategoryCheckBoxBasedOnName = function(firstCategoryName){
	var curr = this;
	logger.info("Waiting for the Category to be identified and Click it");
    browser.wait(EC.urlContains("storeFront/main"), 15000).then(function () {
        //browser.sleep(5000);
    	util.waitForAngular();
        curr.getIndexofFirstCategory(firstCategoryName).then(function (index) {
			var id="checkbox-store-filter-menu_store-filter-menu-item_first-category_"+index;
            var elemLocator = "input[id = '"+id+"'] ~ label";
            browser.wait(EC.visibilityOf(element(by.css(elemLocator))), 60000).then(function () {
                browser.wait(EC.elementToBeClickable(element(by.css(elemLocator))), 60000).then(function () {
                	browser.sleep(10000);
                    element(by.css(elemLocator)).click().then(function () {
                        logger.info("Succesfully clicked on Category : " + firstCategoryName);
                    });
                });
            });
        });
    });
};

//This function clicks on reset link when the checkboxes for Blue prints and categories are checked
catalog.prototype.clickResetLinkCatalog = function(){
	browser.sleep(3000);
	util.waitForAngular();
	browser.wait(EC.elementToBeClickable(element(by.linkText(this.linkTextReset))), 25000).then(function(){
		logger.info("Clicked on Reset link");
	});
	return element(by.linkText(this.linkTextReset)).click();
};

catalog.prototype.isPresentResetLinkCatalog = function(){
	return element(by.linkText(this.linkTextReset)).isPresent();
};

//This function clicks on reset link when the checkboxes for provider checked
catalog.prototype.clickResetLinkCatalogProviderSection = function(){
	browser.sleep(15000);
	browser.wait(EC.elementToBeClickable(element(by.css(this.resetLinkForProviderSection))), 25000);
	return element(by.css(this.resetLinkForProviderSection)).click();
};

catalog.prototype.isPresentResetLinkCatalogProviderSection = function(){
	browser.sleep(5000);
	browser.wait(EC.visibilityOf(element(by.css(this.resetLinkForProviderSection))), 25000);
	return element(by.css(this.resetLinkForProviderSection)).isPresent();

};

//This function clicks on reset link when the checkboxes for categories are checked
catalog.prototype.clickResetLinkCatalogCategorySection = function(){
	browser.sleep(15000);
	browser.wait(EC.elementToBeClickable(element(by.css(this.resetLinkForCategorySection))), 25000);
	return element(by.css(this.resetLinkForCategorySection)).click();
};

catalog.prototype.isPresentResetLinkCatalogCategorySection = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.resetLinkForCategorySection))), 25000);
	return element(by.css(this.resetLinkForCategorySection)).isPresent();

};

catalog.prototype.getBasePriceOfDisplayedTemplates = function(){
	return element.all(by.css(this.basePriceForDisplayedTemplatesCss)).getText().then(function(texts){
		logger.info("Displayed base prices: "+texts);
	});
};

//*************************** Function for Searching ******************************************
catalog.prototype.searchForBluePrint = function(blueprintName){
	element(by.xpath(this.searchTextBoxInputXpath)).clear();
	element(by.xpath(this.searchTextBoxInputXpath)).sendKeys(blueprintName);
	return blueprintName;
};

//Mahendra-Adding below function to click on provider or category checkbox directly using value attribute.
catalog.prototype.clickProviderOrCategoryCheckbox = function (valueToCheck) {
	util.waitForAngular();
	browser.wait(EC.urlContains("storeFront/main"), 60000).then(function () {
		//browser.sleep(3000);
		util.waitForAngular();
		// Find an element and define it
		//browser.wait(EC.visibilityOf(element(by.css(elemLocator))), 60000).then(function () {
			var elemLocator = "input[value = '" + valueToCheck.toLowerCase() + "']~label";			
			var elementToClick = element(by.css(elemLocator));
			// Scroll the browser to the element's Y position
			browser.executeScript("window.scrollTo(0,"+elementToClick.getLocation().y+")").then(function(){
				// Click the element		
				browser.wait(EC.elementToBeClickable(elementToClick, 60000)).then(function () {
					return elementToClick.click().then(function () {
						logger.info("Succesfully clicked on Provider : " + valueToCheck);
						util.waitForAngular();
					}).catch(function(){
						logger.info("2nd Attempt to click : " + valueToCheck);
						return elementToClick.click().then(function () {
							logger.info("Succesfully clicked on Provider : " + valueToCheck);
							util.waitForAngular();
						});
					});
				});					
				
			});
			
		
		//});		
		
	});

};

catalog.prototype.clickCartIcon = function () {
    browser.wait(EC.elementToBeClickable(element(by.css(this.cartIconCss))), 10000);
    return element(by.css(this.cartIconCss)).click().then(function () {
   	 logger.info("clicked on Cart icon");
    });;
};

catalog.prototype.searchCartFromList = function (cartName) {
	  return element(by.xpath("//*[@title='" + cartName + "']"))

};

catalog.prototype.closeNotificationPopUp = function()
{
	//browser.wait(EC.visibilityOf(element(by.xpath(this.closeNotificationIconXpath))), 5000);
    element(by.xpath(this.closeNotificationIconXpath)).click().then(function () {
    	logger.info("closed Notification Pop Up Box");  
    }); 
};

catalog.prototype.extractUserFirstName = function()
{
	var userName = browser.params.username;
	var userFirstName = userName.replace(/@.*$/,"");
	logger.info("First username extracted :: "+userFirstName)
	return userFirstName;
};
catalog.prototype.getUserID = function(userName){
	var elem = element(by.xpath('//*[contains(text(), "'+ userName +'")]'));
	return elem.isPresent().then(function(present) {
        console.log(userName + " isPresent: " + present)
        return present
	})
}
module.exports = catalog;
