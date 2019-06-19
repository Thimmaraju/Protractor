"use strict";

var extend = require('extend');
var url = browser.params.url;
var EC = protractor.ExpectedConditions;
var util = require('../../helpers/util.js');
var logGenerator = require("../../helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger();

var defaultConfig = {
    //Main Parameters
    serviceNameTextBoxCss:          		'#text-input-main_params-serviceName',
    serviceCIDR:                            '#text-inputVpcCIDR',
    providerTextCss:              			'#text-input-main_params-provider',
    categoryTxtCss:							'#text-input-main_params-category',
    estimatedPriceTxtCss:       		 	'.estimated-cost~p',
    buttonTextCancel:						'Cancel',
    buttonTextNext:                			'Next',
    orderId:								'#order-number',
    //parameterWarningTextXpath :                '//div[contains(.," Please input \'Service Name\' in proper format") and @class="bx--form-requirement"]',
    parameterWarningTextXpath :             '//div[contains(.,"The Service Name must begin with a letter and can contain alphanumeric characters and hyphens after that. The Service Name should not contain any other special characters or spaces.") and @class="bx--form-requirement"]',
    bluePrintNameTextCss:					'.description>p',
    //bluePrintNameTextCss:                   '#service-progress_blueprint-name',
    buttonCloseParamterWarningCss:			'.bx--inline-notification__close-button',
    dropdownTeamXpath:                      '//*[@id="bx--dropdown-single-parent_team"]',
    dropdownEnvCss:                         '[id="env"]',    
    valuesEnvXpath:                         '//*[@id="env"]//ul//li',
    dropdownAppCss:                         '[id="app"]',
    dropdownAppXpath:                       '//*[@id="App" or @id="app"]',
    valuesAppXpath:                         '//*[@id="App" or @id="app"]//ul//li',    
    dropdownProviderAccountXpath:           '//*[@id="bx--dropdown-single-parent_provider-account"]',
    textboxQunatityCss:                     'input#slider-input-box-main-params_multi-quantity',
    //Additional Parameters
    buttonTextPrevious:		 				'Previous',
    currentStepProgressSection:				'.bx--progress-step--current p',
    
    //Review Order
    providerNameTextReviewOrderPageXpath:				'//span[contains(text(), "Provider Name")]/following-sibling::span',
    //serviceNameTextReviewOrderPageXpath:				'//span[contains(text(), "Service Name")]/following-sibling::span',
    serviceNameTextReviewOrderPageXpath:				'//span[contains(text(), "Service Instance Name:")]/following-sibling::span', 
    categoryNameTextReviewOrderPageXpath:				'//span[contains(text(), "Category Name")]/following-sibling::span',
    estimatedPriceReviewOrderPageXpath:					'//span[contains(text(), "Estimated Price")]/following-sibling::span',
    //estimatedCostsReviewOrderPageXpath:					'//*[contains(text(), "Estimated Costs")]//p ',//.estimated-cost ~ p
    estimatedCostsReviewOrderPageCss:					'.estimated-cost ~ p',
    additionalDetailsTextReviewOrderPageXpath:          '//span[contains(text(), "App server")]/following-sibling::span ',
    buttonTextSubmitOrder:								'Submit Order',
    buttonTextAddToCart:								'Add to Cart',

    //Cancel Order Popup:
    buttonYesCancelOrderPopupCss 	:					'button[id$="order-cancel-modal_carbon-button_yes"]',
    buttonNoCancelOrderPopupCss     :					'button[id$="order-cancel-modal_carbon-button_no"]',
    buttonCloseCancelOrderPopupCss	:					'button[id$="order-cancel-modal"]',

    //Order Submission Popup
    orderSubmittedHeaderXpath:							'//h2[contains(text(),"Order Submitted !")]',
    goToServiceCatalogCss:								'#button-order-submitted-modal_carbon-button',
    orderSubmittedModalHeaderXpath:							'//h2[contains(text(),"Order Submitted !")]',
    orderSubmittedModalGoToServiceCatalogCss:				'#button-order-submitted-modal_carbon-button',
    orderSubmittedModalGoToInventoryCss:				'#button-order-submitted-editmodal_carbon-button',
    orderSubmittedModalOrderNumberTextCss :					'#order-number',
    orderSubmittedModalOrderDateTextXpath   :				'//p[contains(text(),"Date")]/span',
    orderSubmittedModalTotalPriceTextXpath  :				'//p[contains(text()," Total")]/span',
    orderSubmittedModalSubmittedByTextXpath :				'//p[contains(text()," Submitted by")]/span',

    detailsPageTextXpath : 					                './/*[@id="service-details__service-name"]',

    errorMessageServicenameAlreadyExists    :               './/*[@id="same-service_error"]',

    firewallTypeId   :                                      'firewalltype_value',
    totalCostValueId :                                       'total_cost_value',
    
    //Locators for shopping cart in place order page
    addNewServicesRadioButtonCss:							'radio-button-shoppingOptions_Add_service to new cart',
    addServicesToExistingCartRadioButtonCss:				'radio-button-shoppingOptions_Add_service to existing cart',
    quickPurchaseRadioButtonCss:							'radio-button-shoppingOptions_Quick_purchase',
    cartNameTextboxCss:										'text-input-main_params-cartName',
    cartIconXpath: 											'//*[@class="cart-icon"]',
    oneTimeChargesBOMTableXpath:                            '//TD[@id="non-one-time-charge"]',
    moreLinkText:                                           'More',
    totalQuntityBOMTableXpath:                              '//TD[@id="quantity"]'
    

};

function placeOrder(selectorConfig) {
    if (!(this instanceof placeOrder)) {
        return new placeOrder(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

//-----Function to get Blue print name on All 3 pages, Main parameters , Additional Parameters and Review Order
placeOrder.prototype.getTextBluePrintName = function() {
    browser.wait(EC.visibilityOf(element(by.css(this.bluePrintNameTextCss))),15000);
    return element(by.css(this.bluePrintNameTextCss)).getText().then(function(text){
        logger.info("Blue Print Name : "+text);
        return text;
    });
};

placeOrder.prototype.servicenameAlreadyExists = function()
{
    return browser.wait(EC.visibilityOf(element(by.xpath('.//*[@id="same-service_error"]'))),15000);
    logger.info("Service name already exists");

    };

//----Function to cancel Order on All 3 pages, Main parameters , Additional Parameters and Review Order
placeOrder.prototype.cancelOrder = function()
{
    element(by.buttonText(this.buttonTextCancel)).click();
    util.waitForAngular();
};

placeOrder.prototype.isNextButtonEnabled = function(){
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextNext))), 15000);
	return element(by.buttonText(this.buttonTextNext)).isEnabled().then(function(isEnabled){
		logger.info("Is Next button enabled: "+isEnabled);
		return isEnabled;
	});
};

//-----Function to click next Button on 2 pages Main parameters and Additional Parameters
placeOrder.prototype.clickNextButton = function()
{
	browser.sleep(3000)
    browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextNext))), 70000);
    element(by.buttonText(this.buttonTextNext)).click().then(function(){
    	logger.info("Clicked on Next button");
    });
};

//--------Function to click on previous button on 2 pages Additional Parameters and Review Order
placeOrder.prototype.clickPreviousButton = function()
{
	browser.wait(EC.visibilityOf(element(by.buttonText(this.buttonTextPrevious))), 15000);
	element(by.buttonText(this.buttonTextPrevious)).click();
    util.waitForAngular();
};

//***********************************FUNCTIONS FOR CANCEL ORDER POPUP*******************************
placeOrder.prototype.clickYesInCancelOrderPopup = function()
{
    element(by.css(this.buttonYesCancelOrderPopupCss)).click();
    util.waitForAngular();
};

placeOrder.prototype.clickNoInCancelOrderPopup = function()
{
    element(by.css(this.buttonNoCancelOrderPopupCss)).click();
    util.waitForAngular();
};

placeOrder.prototype.closeCancelOrderPopup = function()
{
    element(by.css(this.buttonCloseCancelOrderPopupCss)).click();
    util.waitForAngular();
}

//***************************Functions for Main Parameters***********************************************************

//----Function to set Service Name
placeOrder.prototype.setServiceNameText = function(serviceName)
{
    //Selecting Team dropdown
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.dropdownTeamXpath))), 25000);
    element(by.xpath(this.dropdownTeamXpath)).click()
    util.waitForAngular();
    browser.sleep(2000);
    var teamsArray = element.all(by.xpath(this.dropdownTeamXpath + "//carbon-dropdown-option//a"));
    teamsArray.getText().then(function(textArray){
        var isTEAM1Present = false;
        for (var i=0;i<textArray.length;i++){
            if (textArray[i] == "TEAM1"){
                teamsArray.get(i).click().then(function(){
                    logger.info("Team selected from drop down");
                });
                isTEAM1Present =true;
            }
        }
        if(!isTEAM1Present)
            teamsArray.get(0).click();                
    });
    
    //Selecting Organization
    /*browser.wait(EC.elementToBeClickable(element(by.css("[id='bx--dropdown-single-parent_organization']"))), 25000);
    element(by.xpath("//*[@id='bx--dropdown-single-parent_organization']")).click();
    var orgArray = element.all(by.xpath("//*[@id='bx--dropdown-single-parent_organization']//carbon-dropdown-option//a"));
    orgArray.getText().then(function(textArray){
		var isOrgPresent = false;
		for (var i=0;i<textArray.length;i++){
			if (textArray[i] == "Organization1"){
				orgArray.get(i).click().then(function(){
					logger.info("Organization selected from drop down");
				});
				isOrgPresent =true;
			}
		}
		if(!isOrgPresent)
            orgArray.get(0).click();
    });*/

    //Selecting environment dropdown
    browser.wait(EC.elementToBeClickable(element(by.css(this.dropdownEnvCss))), 5000);
    element(by.css(this.dropdownEnvCss)).click();
    var envArray = element.all(by.xpath(this.valuesEnvXpath));
    //util.waitForAngular();
    envArray.getText().then(function(textArray){
        var isEnvPresent = false;
        for (var i=0;i<textArray.length;i++){
            if (textArray[i] == "NONE"){
                envArray.get(i).click().then(function(){
                    logger.info("Environment selected from drop down");
                });
                isEnvPresent =true;
            }
        }
        if(!isEnvPresent)
            envArray.get(0).click();
    });

    //Selecting Application dropdown
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.dropdownAppXpath))), 5000);
    element(by.xpath(this.dropdownAppXpath)).click();
    var applicationsArray = element.all(by.xpath(this.valuesAppXpath));
    applicationsArray.getText().then(function(textArray){
        var isAppPresent = false;
        for (var i=0;i<textArray.length;i++){
            if (textArray[i] == "NONE"){
                applicationsArray.get(i).click().then(function(){
                    logger.info("Application selected from drop down");
                });
                isAppPresent =true;
            }
        }
        if(!isAppPresent)
            applicationsArray.get(0).click();
    });

    browser.wait(EC.visibilityOf(element(by.css(this.serviceNameTextBoxCss))),25000);
    element(by.css(this.serviceNameTextBoxCss)).clear();
    element(by.css(this.serviceNameTextBoxCss)).sendKeys(serviceName).then(function(){
    	logger.info("ServiceName "+serviceName+" entered");
    	browser.sleep(10000);
    });
    return serviceName;
};

placeOrder.prototype.selectProviderAccount = function(providerAccount) {

    browser.wait(EC.elementToBeClickable(element(by.xpath(this.dropdownProviderAccountXpath))), 25000);
    element(by.xpath(this.dropdownProviderAccountXpath)).click();
    var providerAccountArray = element.all(by.xpath(this.dropdownProviderAccountXpath + "//carbon-dropdown-option//a"));

    providerAccountArray.getText().then(function(textArray){
		var isAppPresent = false;
		for (var i=0;i<textArray.length;i++){
			if (textArray[i] == providerAccount){
				providerAccountArray.get(i).click().then(function(){
					logger.info("Provider Account "+providerAccount+" selected from drop down");
				});
				isAppPresent =true;
			}
		}
		if(!isAppPresent)
			providerAccountArray.get(1).click().then(function(){
				logger.info("Provider Account selected from drop down");
			});
	})
}

placeOrder.prototype.selectAddNewServiceCartRadioButton = function() {
	browser.wait(EC.visibilityOf(element(by.css(this.addNewServicesRadioButtonCss))),5000);
	element(by.css(this.addNewServicesRadioButtonCss)).click().then(function(){
		logger.info("Clicked on Add new Services to cart radio button...");
	});
}

placeOrder.prototype.provideCartName = function(cartName) {
	browser.wait(EC.visibilityOf(element(by.css(this.cartNameTextboxCss))),5000);
	element(by.css(this.cartNameTextboxCss)).sendKeys(cartName).then(function(){
		logger.info("Entered cart name as "+cartName);
	});
}

placeOrder.prototype.addToShoppingCart = function() {
	browser.wait(EC.visibilityOf(element(by.buttonText(this.buttonTextAddToCart))),25000);
    return element(by.buttonText(this.buttonTextAddToCart)).click().then(function(){
    	util.waitForAngular();
    	logger.info("Navigating to Shopping cart page...")
    	browser.sleep(10000);
    });
}

placeOrder.prototype.searchCartFromList = function (cartName) {
	  return  element(by.xpath("//*[@title='" + cartName + "']"))

	};

placeOrder.prototype.clickServiceName = function()
{
    return element(by.css(this.serviceNameTextBoxCss)).click().then(function(){
        logger.info("clicked Service Name");
    });
};

placeOrder.prototype.clickCartIcon = function () {
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.cartIconXpath))), 10000);
    return element(by.xpath(this.cartIconXpath)).click().then(function () {
   	 logger.info("clicked on Cart icon");
    });;
};

//----Function to set Additional attributes
placeOrder.prototype.getcurrentStepProgressSection = function(){
	return element(by.css(this.currentStepProgressSection)).getText().then(function(text){
		logger.info("Current step progress section is: "+text);
		return text;
	});
};

//----Function to get Provider Text
placeOrder.prototype.getTextProvider = function()
{
    return element(by.css(this.providerTextCss)).getAttribute("value").then(function(providerText){
        logger.info("The value of provider in Main Params is : " + providerText)
        return providerText;
    });
};

placeOrder.prototype.clickProvider = function()
{
    return element(by.css(this.providerTextCss)).click().then(function(){
        logger.info("clicked provider");
    });
};

//-----Function to get Category
placeOrder.prototype.getTextCategory = function()
{
    return element(by.css(this.categoryTxtCss)).getAttribute("value").then(function(categoryText){
        logger.info("The value of category in Main Params is :" + categoryText)
        return categoryText;
    });
};

//-----Function to get Estimated Price
placeOrder.prototype.getTextEstimatedPrice = function()
{
    return element(by.css(this.estimatedPriceTxtCss)).getText().then(function(estimatedPrice){
        logger.info("The estimated price in Main Params is :" + estimatedPrice)
        return estimatedPrice;
    });
};

placeOrder.prototype.getTextEstimatedPriceForSnow = function()
{
    return element(by.css(this.estimatedPriceTxtCss)).getText().then(function(estimatedPrice){
        logger.info("The estimated price in Main Params is :" + estimatedPrice);
        var str = estimatedPrice.toString().split('+')[1];
    	var str1 = str.split('.')[0];
    	var estiMatedPriceNumeric = str1.match(/\d/g).join("");
    	estiMatedPriceNumeric = parseInt(estiMatedPriceNumeric);
    	logger.info("The estimated estiMatedPriceNumeric :" + estiMatedPriceNumeric);
        return estiMatedPriceNumeric;
    });
};


//----Function to click next button without service name
placeOrder.prototype.getWarningTextByClickingNextWithOurServicename = function() {
    return element(by.xpath(this.parameterWarningTextXpath)).getText().then(function(text){
        logger.info(text)
        return text;
    });
};

//------Function to close the warning appeared when clicked without service name
placeOrder.prototype.closeParameterWarning = function() {
    return element(by.css(this.buttonCloseParamterWarningCss)).click();
}

placeOrder.prototype.isPresentcloseParameterWarningMessage = function() {
    return element(by.css(this.buttonCloseParamterWarningCss)).isPresent();
}

//*****************************Functions for Additional Parameters***********************************************************

placeOrder.prototype.selectValueFromDropdownBasedonLabelName_AdditionalParamaters = function(labelID,value) {
    var elem = element(by.css("[id='"+labelID+"']"));
    browser.wait(EC.elementToBeClickable(elem), 5000);
    return elem.click().then(function(){
        var dropDownValuesArray = element.all(by.xpath("//*[@id='"+labelID+"']//carbon-dropdown-option//a"));
        dropDownValuesArray.getText().then(function(textArray){
            var isDropDownValuePresent = false;
            for (var i=0;i<textArray.length;i++){
                if (textArray[i] == value){
                    dropDownValuesArray.get(i).click();
                    isDropDownValuePresent =true;
                }
            }
            if(!isDropDownValuePresent)
            dropDownValuesArray.get(0).click();
        });
    });
}

placeOrder.prototype.selectRadioButtonBasedonLabelName_AdditionalParamaters = function(labelID,value) {
    var elem = element(by.css("[id=\""+labelID+"\"] ~ label span"));
    browser.wait(EC.presenceOf(elem), 5000);
    return elem.click().then(function(){
        logger.info("Selected "+value+" radio button.");
    });
}

placeOrder.prototype.enterValueForAdditionalParamatersBasedOnLabelName = function(labelID,value) {
    element(by.xpath("//*[@id='"+labelID+"']")).clear();
    return element(by.xpath("//*[@id='"+labelID+"']")).sendKeys(value);
}

placeOrder.prototype.selectValuesFromMultiSelectDropDown = function(labelID,value) {
    var elem = element(by.css("[id=\""+labelID+"\"]"));
    element.all(by.css("[type='checkbox']")).then(function(options) {
        options.forEach(function(option) {
            option.getText().then(function(text) {
                if (text.indexOf(value) != -1) {
                    return option.click();
                } 
            });
        });
    });
}

placeOrder.prototype.getTextFromTextBoxInAdditionalParametersBasedOnLabelName = function(labelID){
    return element(by.xpath("//*[@id='"+labelID+"']")).getAttribute('value')
}

placeOrder.prototype.getValuesFromDropDpwnInAdditionalParametersBasedOnLabelName = function(labelID){
    return element(by.xpath("//*[@id='"+labelID+"']/li")).getText().then(function(text){
        logger.info("Value is "+text);
        return text;
    })
}

placeOrder.prototype.isAttributePresentInAdditionalParametersPage = function(labelName){
	return element(by.xpath("//label[contains(text(), '" + labelName + "')]")).isPresent();
}
																  				
placeOrder.prototype.completeAdditionalAttributes = function(dropdownAttributes){

    for (var size=0;size <dropdownAttributes.dropdownLabels.length ; size++ ){
        this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(dropdownAttributes.dropdownLabels[size].dropdownLabelId, dropdownAttributes.dropdownLabels[size].value);
    }
    for (var sizeText=0;sizeText < dropdownAttributes.textinputdetails.length ; sizeText++ ){
        this.enterValueForAdditionalParamatersBasedOnLabelName(dropdownAttributes.textinputdetails[sizeText].textinputDetailsId, dropdownAttributes.textinputdetails[sizeText].value);
    }
}
//*****************************Functions for Review Order ***********************************************************

//Service Detail Section
placeOrder.prototype.getTextProviderName_ReviewOrder = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.providerNameTextReviewOrderPageXpath))), 10000);
    return element(by.xpath(this.providerNameTextReviewOrderPageXpath)).getText().then(function(text){
        logger.info("Provider Name on Review Order page : "+text)
        return text;
    });
};

placeOrder.prototype.getTextServiceName_ReviewOrder = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.serviceNameTextReviewOrderPageXpath))), 10000);
    return element(by.xpath(this.serviceNameTextReviewOrderPageXpath)).getText().then(function(text){
        logger.info("Service Name on Review Order page : "+text)
        return text;
    });
};

placeOrder.prototype.getTextCategoryName_ReviewOrder = function() {
	browser.wait(EC.visibilityOf(element(by.xpath(this.categoryNameTextReviewOrderPageXpath))), 10000);
    return element(by.xpath(this.categoryNameTextReviewOrderPageXpath)).getText().then(function(text){
        logger.info("Category Name on Review Order page : "+text)
        return text;
    });
};

placeOrder.prototype.getEstimatedPrice_ReviewOrder = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.estimatedCostsReviewOrderPageCss))), 10000);
    return element(by.css(this.estimatedCostsReviewOrderPageCss)).getText().then(function(text){
        logger.info("Estimated price on Review Order page : "+text)
        return text;
    });
};

//Additional Detail Section
//TODO: Some pages changed to use spans instead of labels. The getTextBasedOnLabelName function was changed
// to make these work, but some element still us labels and this breaks them. There is a getTextBasedOnLabelName1 in
// orders.pageObject that can be used. Once those are all fixed we need to change the getTextBasedOnLabelName
// to getTextBasedOnSpanName.


placeOrder.prototype.getTextAdditonalDetails_ReviewOrder = function(labelName){
	return element.all(by.xpath("//span[contains(text(), '"+labelName+"')]/following-sibling::span")).getText().then(function(text){
        logger.info("The value for "+labelName+" is : "+text)
        return text;
    });
};

placeOrder.prototype.getTextBasedOnSpanName = function(labelName){
    return element(by.xpath("//span[contains(text(), '" + labelName + "')]/following-sibling::span")).getText().then(function(text){
        logger.info("The value for "+labelName+" is : "+text)
        return text;
    });
};

placeOrder.prototype.getTextBasedOnLabelName = function(labelName){
        return element(by.xpath("//span[contains(text(), '" + labelName + "')]/following-sibling::span")).getText().then(function(text){
        logger.info("The value for "+labelName+" is : "+text)
        return text;
    });
};

placeOrder.prototype.getFirewall = function(){
    return element(by.id(this.firewallTypeId)).getAttribute("value").then(function(text){
    logger.info("The value for the firewall type  is : " + text);
    return text;
    });
};

placeOrder.prototype.getTotalCost = function(){
    return element(by.id(this.totalCostValueId)).getText("value").then(function(text){
        logger.info("The value for the total cost is : " + text);
        return text;
    });
};



//Estimated Costs Section

placeOrder.prototype.getEstimatedCost_ReviewOrder = function(){
    return element(by.css(this.estimatedCostsReviewOrderPageCss)).getText().then(function(text){
        logger.info("Estimated cost on Review Order page : "+text)
        return text;
    });
};

//Function for submitting the order
placeOrder.prototype.submitOrder = function() {
	browser.wait(EC.visibilityOf(element(by.buttonText(this.buttonTextSubmitOrder))),25000);
    return element(by.buttonText(this.buttonTextSubmitOrder)).click().then(function(){
    	logger.info("Clicked on submit Order");
    	util.waitForAngular();
    	browser.sleep(10000);
    });
}

//****************FUNCTIONS IN ORDER SUBMITTED POP UP***************************
placeOrder.prototype.clickgoToServiceCatalogButtonOrderSubmittedModal = function() {
    return element(by.css(this.orderSubmittedModalGoToServiceCatalogCss)).click();
};

placeOrder.prototype.getTextOrderSubmittedHeaderOrderSubmittedModal = function() {
	browser.sleep(5000);
	browser.wait(EC.visibilityOf(element(by.xpath(this.orderSubmittedModalHeaderXpath))),25000);
    return element(by.xpath(this.orderSubmittedModalHeaderXpath)).getText().then(function(text){
        logger.info(text)
        return text;
    });
};

placeOrder.prototype.getTextOrderNumberOrderSubmittedModal = function()
{
    return element(by.css(this.orderSubmittedModalOrderNumberTextCss)).getText().then(function(text){
        logger.info("Order number : "+text);
        return text;
    });
};

placeOrder.prototype.getTextOrderedDateOrderSubmittedModal = function()
{
    return element(by.xpath(this.orderSubmittedModalOrderDateTextXpath)).getText().then(function(text){
        logger.info("Ordered Date : "+text);
        return text;
    });
};

placeOrder.prototype.getTextTotalPriceOrderSubmittedModal = function()
{
	return element(by.xpath(this.orderSubmittedModalTotalPriceTextXpath)).getText().then(function(text){
		logger.info("Total Price : "+text);
		if(text == 'N/A'){
			logger.info("Cost under Estimated Costs Tab is :: "+text);
		}
		else{
			var str1 = text.substr(4,5);
			var str2 = text.substr(32,5);
			var str3 = str2.replace(",","");
			var str4 = parseFloat(str1)+parseFloat(str3);
			str4 = Math.round(str4);
			text = str4.toString();
			//var total = "USD"+str4.toString();
		}
		return text;

	});
};

placeOrder.prototype.getTextSubmittedByOrderSubmittedModal = function()
{
    return element(by.xpath(this.orderSubmittedModalSubmittedByTextXpath)).getText().then(function(text){
        logger.info("Submitted By : "+text);
        return text;
    });
};

placeOrder.prototype.checkIfInDetailsPage = function()
{
	return element(by.xpath(this.detailsPageTextXpath)).isDisplayed()
};

placeOrder.prototype.clickgoToInventoryButtonOrderSubmittedModal = function() {
    return element(by.css(this.orderSubmittedModalGoToInventoryCss)).click();
};

placeOrder.prototype.createSLVirtualMachineOrderWithDefaultParameters = function(slVMObject, servicename){
    this.setServiceNameText(servicename);
    this.clickNextButton();
    //Instance Details Parameters
    var hostNameIndex = util.getTextInputLabelIndexBasedOnName(slVMObject,"Hostname");
    var domainIndex = util.getTextInputLabelIndexBasedOnName(slVMObject,"Domain");
    var dedicatedAccountFlagIndex = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Dedicated Account Flag");
    var billingTypeIndex = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Billing Type");
    var dataCenterIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Datacenter");
    this.enterValueForAdditionalParamatersBasedOnLabelName(slVMObject.textinputdetails[hostNameIndex].textinputDetailsId, slVMObject.textinputdetails[hostNameIndex].value);
    this.enterValueForAdditionalParamatersBasedOnLabelName(slVMObject.textinputdetails[domainIndex].textinputDetailsId, slVMObject.textinputdetails[domainIndex].value);
    this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[dedicatedAccountFlagIndex].radioButtonId,slVMObject.radioButtonLabels[dedicatedAccountFlagIndex].value);
    this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[billingTypeIndex].radioButtonId,slVMObject.radioButtonLabels[billingTypeIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[dataCenterIndex].dropdownLabelId, slVMObject.dropdownLabels[dataCenterIndex].value);
    this.clickNextButton();
    //System Specification Parameters
	var operatingSystemIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Operating System");
	var memoryIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Memory");
	var coresIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Cores");		
	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[operatingSystemIndex].dropdownLabelId, slVMObject.dropdownLabels[operatingSystemIndex].value);
	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[coresIndex].dropdownLabelId, slVMObject.dropdownLabels[coresIndex].value);
	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[memoryIndex].dropdownLabelId, slVMObject.dropdownLabels[memoryIndex].value);
	this.clickNextButton();
	//Disk Details Parameters
	var diskTypeIndex = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Disk Type");
	var firstDiskIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "First Disk");
	this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[diskTypeIndex].radioButtonId,slVMObject.radioButtonLabels[diskTypeIndex].value);
	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[firstDiskIndex].dropdownLabelId, slVMObject.dropdownLabels[firstDiskIndex].value);
	this.clickNextButton();
	//Network Details Parameters
	//var privateVlanIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Private Vlan Id");
	//var privateSubnetIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Private Subnet");
	var networkTypeIndex = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Network Type");
	var networkSpeedIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Network Speed");
	var bandwidthUnlimitedIndex = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Bandwidth Unlimited");
	var bandwidthLimitedIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Bandwidth Limited");
	//var publicVlanIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Public Vlan Id");
	//var publicSubnetIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Public Subnet");
	//this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[privateVlanIndex].dropdownLabelId, slVMObject.dropdownLabels[privateVlanIndex].value);
	//this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[privateSubnetIndex].dropdownLabelId, slVMObject.dropdownLabels[privateSubnetIndex].value);
	this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[networkTypeIndex].radioButtonId,slVMObject.radioButtonLabels[networkTypeIndex].value);
	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[networkSpeedIndex].dropdownLabelId, slVMObject.dropdownLabels[networkSpeedIndex].value);
	this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[bandwidthUnlimitedIndex].radioButtonId,slVMObject.radioButtonLabels[bandwidthUnlimitedIndex].value);
	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[bandwidthLimitedIndex].dropdownLabelId, slVMObject.dropdownLabels[bandwidthLimitedIndex].value);
	//this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[publicVlanIndex].dropdownLabelId, slVMObject.dropdownLabels[publicVlanIndex].value);
	//this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[publicSubnetIndex].dropdownLabelId, slVMObject.dropdownLabels[publicSubnetIndex].value);
	this.clickNextButton();
	//Add-ons Parameters
//	var publicSecondaryIPIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Public Secondary IP Addresses");
//	var privateIpV6Index = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Primary IPv6 Addresses");
//	var publicIpv6Index = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Public Static IPv6 Addresses");
//	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[publicSecondaryIPIndex].dropdownLabelId, slVMObject.dropdownLabels[publicSecondaryIPIndex].value);
//	this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[privateIpV6Index].radioButtonId,slVMObject.radioButtonLabels[privateIpV6Index].value);
//	this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[publicIpv6Index].radioButtonId,slVMObject.radioButtonLabels[publicIpv6Index].value);
	this.clickNextButton();
	//Other Details Parameters - not mondatory, hence not adding into order.
	this.clickNextButton();
};

placeOrder.prototype.setServiceNameTextSL = function(serviceName)
{
    browser.wait(EC.elementToBeClickable(element(by.css("[id='bx--dropdown-single-parent_team:']"))), 10000);
    element(by.xpath("//*[@id='bx--dropdown-single-parent_team:']")).click();
    //these is a temporary change as of now from naveen
    var teamsArray = element.all(by.xpath("//*[@id='bx--dropdown-single-parent_team:']//carbon-dropdown-option//a"));
    teamsArray.getText().then(function(textArray){
        var isTEAM1Present = false;
        //logger.info(teamsArray.getText());
        for (var i=0;i<textArray.length;i++){
            if (textArray[i] == "TEAM1"){
                teamsArray.get(i).click();
                isTEAM1Present =true;
            }
        }
        // if(!isTEAM1Present)
        //     teamsArray.get(0).click();
    })
    logger.info("Team selected from drop down");
    browser.wait(EC.visibilityOf(element(by.css(this.serviceNameTextBoxCss))),5000);
    element(by.css(this.serviceNameTextBoxCss)).clear();
    element(by.css(this.serviceNameTextBoxCss)).sendKeys(serviceName);
    logger.info("ServiceName entered");
    /* element(by.xpath("//*[@id='bx--dropdown-single-parent_team:'] //a[text()[normalize-space()='TEAM1']]")).click();
    browser.wait(EC.elementToBeClickable(element(by.css("[id='bx--dropdown-single-parent_application:']"))), 5000);
    element(by.xpath("//*[@id='bx--dropdown-single-parent_application:']")).click();
    element(by.xpath("//*[@id='bx--dropdown-single-parent_application:'] //a[text()[normalize-space()='app_all']]")).click();
    browser.wait(EC.elementToBeClickable(element(by.css("[id='bx--dropdown-single-parent_environment:']"))), 5000);
    element(by.xpath("//*[@id='bx--dropdown-single-parent_environment:']")).click();
    element(by.xpath("//*[@id='bx--dropdown-single-parent_environment:'] //a[text()[normalize-space()='env_all']]")).click();*/
    return serviceName;
};

placeOrder.prototype.createSLVirtualMachineOrderWithOnlyInstanceDetailsParameters = function(slVMObject, servicename){

    //Instance Details Parameters
    var hostNameIndex = util.getTextInputLabelIndexBasedOnName(slVMObject,"Hostname");
    var domainIndex = util.getTextInputLabelIndexBasedOnName(slVMObject,"Domain");
    var dedicatedAccountFlagIndex = util.getDropDownLabelIndexBasedOnName(slVMObject,"Dedicated Account Flag");
    var billingTypeIndex = util.getDropDownLabelIndexBasedOnName(slVMObject,"Billing Type");
    var dataCenterIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Datacenter");
    this.enterValueForAdditionalParamatersBasedOnLabelName(slVMObject.textinputdetails[hostNameIndex].textinputDetailsId, slVMObject.textinputdetails[hostNameIndex].value);
    this.enterValueForAdditionalParamatersBasedOnLabelName(slVMObject.textinputdetails[domainIndex].textinputDetailsId, slVMObject.textinputdetails[domainIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[dedicatedAccountFlagIndex].dropdownLabelId,slVMObject.dropdownLabels[dedicatedAccountFlagIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[billingTypeIndex].dropdownLabelId,slVMObject.dropdownLabels[billingTypeIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[dataCenterIndex].dropdownLabelId, slVMObject.dropdownLabels[dataCenterIndex].value);
    this.clickNextButton();
    //System Specification Parameters
    var operatingSystemIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Operating System");
    var memoryIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Memory");
    var coresIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Cores");
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[operatingSystemIndex].dropdownLabelId, slVMObject.dropdownLabels[operatingSystemIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[coresIndex].dropdownLabelId, slVMObject.dropdownLabels[coresIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[memoryIndex].dropdownLabelId, slVMObject.dropdownLabels[memoryIndex].value);
    this.clickNextButton();
    //Disk Details Parameters
    var diskTypeIndex = util.getDropDownLabelIndexBasedOnName(slVMObject,"Disk Type");
    var firstDiskIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "First Disk");
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[diskTypeIndex].dropdownLabelId,slVMObject.dropdownLabels[diskTypeIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[firstDiskIndex].dropdownLabelId, slVMObject.dropdownLabels[firstDiskIndex].value);
    this.clickNextButton();
    //Network Details Parameters
    //var privateVlanIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Private Vlan Id");
    //var privateSubnetIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Private Subnet");
    var networkTypeIndex = util.getDropDownLabelIndexBasedOnName(slVMObject,"Network Type");
    var networkSpeedIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Network Speed");
    var bandwidthUnlimitedIndex = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Bandwidth Unlimited");
    var bandwidthLimitedIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Bandwidth Limited");
    //var publicVlanIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Public Vlan Id");
    //var publicSubnetIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Public Subnet");
    //this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[privateVlanIndex].dropdownLabelId, slVMObject.dropdownLabels[privateVlanIndex].value);
    //this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[privateSubnetIndex].dropdownLabelId, slVMObject.dropdownLabels[privateSubnetIndex].value);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[networkTypeIndex].dropdownLabelId,slVMObject.dropdownLabels[networkTypeIndex].value);
    browser.sleep(2000);
    this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[networkSpeedIndex].dropdownLabelId, slVMObject.dropdownLabels[networkSpeedIndex].value);
    browser.sleep(2000);
    //this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[bandwidthUnlimitedIndex].radioButtonId,slVMObject.radioButtonLabels[bandwidthUnlimitedIndex].value);
    //this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[bandwidthLimitedIndex].dropdownLabelId, slVMObject.dropdownLabels[bandwidthLimitedIndex].value);
    //this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[publicVlanIndex].dropdownLabelId, slVMObject.dropdownLabels[publicVlanIndex].value);
    //this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[publicSubnetIndex].dropdownLabelId, slVMObject.dropdownLabels[publicSubnetIndex].value);
    this.clickNextButton();

    //Add-ons Parameters
//	var publicSecondaryIPIndex = util.getDropDownLabelIndexBasedOnName(slVMObject, "Public Secondary IP Addresses");
//	var privateIpV6Index = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Primary IPv6 Addresses");
//	var publicIpv6Index = util.getRadioButtonLabelIndexBasedOnName(slVMObject,"Public Static IPv6 Addresses");
//	this.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(slVMObject.dropdownLabels[publicSecondaryIPIndex].dropdownLabelId, slVMObject.dropdownLabels[publicSecondaryIPIndex].value);
//	this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[privateIpV6Index].radioButtonId,slVMObject.radioButtonLabels[privateIpV6Index].value);
//	this.selectRadioButtonBasedonLabelName_AdditionalParamaters(slVMObject.radioButtonLabels[publicIpv6Index].radioButtonId,slVMObject.radioButtonLabels[publicIpv6Index].value);
    this.clickNextButton();
    //Other Details Parameters - not mondatory, hence not adding into order.
    this.clickNextButton();
};

placeOrder.prototype.setQuantity = function(quantity){
    util.waitForAngular();
    var elem = element(by.css(this.textboxQunatityCss));
    browser.wait(EC.presenceOf(elem), 60000);          
    elem.clear().then(function () {
        logger.info("Cleared Quantity textbox");
        var ctrlA = protractor.Key.chord(protractor.Key.CONTROL, "a");
        elem.sendKeys(ctrlA);
    });
    elem.sendKeys(quantity).then(function () {
        logger.info("Entered value in Quantity textbox");            
    });    
 };
placeOrder.prototype.clickMoreLink = function(){
    var moreTextCSS = element(by.linkText(this.moreLinkText));
    browser.wait(EC.elementToBeClickable(moreTextCSS), 30000);
    browser.executeScript("arguments[0].scrollIntoView();", moreTextCSS.getWebElement());
    moreTextCSS.click().then(function(){
        logger.info("Clicked on more link")
    });
}

placeOrder.prototype.getBOMTablePrice = function (oneTimeCharge) {
    this.clickMoreLink();
    var total = 0;
    var cost = 0;
    return new Promise(function (resolve, reject) {
        element.all(by.xpath(defaultConfig.oneTimeChargesBOMTableXpath)).getText().then(function (elm) {
            for (var i = 0; i < elm.length; i++) {
                cost = parseFloat(elm[i].replace("USD ", ""));
                total = total + cost;
            };
            logger.info("Total price of BOM table is " + total);
            resolve(total);
        }).catch(function (ex) {
            reject("Failed to calculate the pricing from BOM Table");
        });
    });

}


placeOrder.prototype.verifyThePricingBOMTotalQuantity = function (oneTimeCharge) {
    var quntityMatch = false;
    return new Promise(function (resolve, reject) {
        element.all(by.xpath(defaultConfig.totalQuntityBOMTableXpath)).getText().then(function (elm) {
            for (let qunt in elm) {
                if (elm[qunt] == oneTimeCharge) {
                    quntityMatch = true
                }
            }
            resolve(quntityMatch);
        }).catch(function (ex) {
            reject("Total quntity of the pricing does not BOM matched");
        });
    })
}

module.exports = placeOrder;
