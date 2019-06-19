/**********************
 * Author : Deepthi
 **********************/

"use strict";

var extend = require('extend');
var url = browser.params.url;
var EC = protractor.ExpectedConditions;
var util = require('../../helpers/util.js');
var logGenerator = require("../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger();

var defaultConfig = {
    pageUrl: url + '/cart/cart-list',
    msgCartSuccessfullyAddedXpath: '//span[contains(text(),"Your service has been added to the cart.")]',
    buttonTextSubmitOrder: 'Submit Order',
    buttonTextContinueShopping: 'Continue Shopping',
    goToServiceCatalogCss: '#button-order-submitted-modal_carbon-button',
    orderSubmittedModalHeaderXpath: '//h2[contains(text(),"Order Submitted")]',
    orderSubmittedModalGoToServiceCatalogCss: '#button-order-submitted-modal_carbon-button',
    orderSubmittedModalOrderNumberTextCss: '#cart-order-number',
    orderSubmittedModalOrderCartNameTextXpath: '//p[contains(text(),"Cart Name")]/span',
    orderSubmittedModalOrderDateTextXpath: '//p[contains(text(),"Date")]/span',
    orderSubmittedModalTotalPriceTextXpath: '//p[contains(text()," Total")]/span',
    orderSubmittedModalSubmittedByTextXpath: '//p[contains(text()," Submitted by")]/span',
    emptyCartButtonXpath: '//*[@id="cartcomponent-empty-cart-button"]',
    menuIconXpath: '//*[@class="bx--overflow-menu__icon"]',
    cartEmptyModalOkButtonXpath: '//*[@id="button-cart-component-cart-empty-modal_carbon-button_ok"]',
    msgCartSuccessfullyEmptiedXpath: '//span[contains(text(),"Your cart has successfully been emptied.")]',
    deleteCartButtonXpath: '//*[@id="cartcomponent-delete-cart-button"]',
    cartDeleteModalOkButtonXpath: '//*[@id="button-cart-component-cart-delete-modal_carbon-button_ok"]',
    msgCartSuccessfullyDeletedXpath: '//span[contains(text(),"Your cart has successfully been deleted.")]',
    cartIconXpath: '//*[@class="cart-icon"]',
    expandTheCartDetailsTabXpath:                           '.bx--accordion__arrow',
    editCartContextLinkCss:                                 '#view-cart-updates',
    editCartContextPanelOpenedXpath:                        '//H3[@class="bx--slide-over-panel-title"][text()="Edit Cart Context"]',
    teamDropDownCss:                                        'bx--dropdown-single-parent_team:',
    expandTheBillOfMaterialLinkName:                        'chevron--up',
    totalQuantityInBOMTableXpath:                           '//TD[@id="quantity"]/span[@class="total-quantity"]',
    updateButtonXpath:                                        '//*[@id="button-cartEditUpdate_button"]',
    cartContextParamCss:                                    '[class="bx--row bx--col-xs-12 cart-context"] div div',
    cartContextValuesCss:                                   '[class="bx--row bx--col-xs-12 cart-context"] div label',
    txtTotalPriceXpath :'//td[@id="non-one-time-charge"]',
    btnExpandQuantXpath: '//tr/td[@id="quantity"]/carbon-icon',
    lnkBillOfMaterialXpath : '//span[text()="Bill of Materials"]',
    txtEstimatedCostXpath: '//label[text()="Estimated Cost"]/following-sibling::div',
    closeNotificationIconXpath: '//*[@class="bx--toast-notification bx--toast-notification--success"]//button',
    txtboxCartNameCss: '#text-input-edit_cart_name',
    tranferCartButtonXpath: '//*[@id="cartcomponent-transfer-cart-button"]',
    searchTextBoxInputXpath: 			'//input[contains(@id,"text-input_")]',
    cartTransferModalButtonXpath: '//*[@id="button-cart-transfer-button-transfer"]',
    msgCartSuccessfullyTransferredXpath: '//span[starts-with(text(),"Your cart has successfully been transferred to")]',
    userIconXpath: '//*[@class="user-icon"]',
    logoutButtonXpath : '//*[@id ="logoutSubMenuButton"]',
	deleteItemModalHeader : 									"//h2[contains(text(),'Delete Cart Item')]",
    btnOkdeleteItemModal :                                      '#button-cart-item-component-cart-delete-modal_carbon-button_ok',     
    btnCanceldeleteItemModal :									'#button-cart-item-component-cart-delete-modal_carbon-button_cancel',
    msgSuccessfullyDeletedCartItem:								"//span[contains(text(),'Success')]",
    lblOfferingNameXpath:	'//label[contains(text(),"Offering Name")]/following-sibling::div',
    txtOrderTotalXpath:'//*[@class="orderTotalValue"]'
																		 

};

function cartList(selectorConfig) {
    if (!(this instanceof cartList)) {
        return new cartList(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

cartList.prototype.open = function () {
    browser.get(this.pageUrl);
    //browser.sleep(10000);
    browser.wait(EC.urlContains("/cart/cart-list"), 10000).then(function () {
        logger.info("Navigated to cart list page...");
    });
    util.waitForAngular();
};

cartList.prototype.getServiceSuccessfullyAddedToCart = function () {
    browser.wait(EC.visibilityOf(element(by.xpath(this.msgCartSuccessfullyAddedXpath))), 15000);
    return element(by.xpath(this.msgCartSuccessfullyAddedXpath)).getText().then(function (text) {
        logger.info(text);
        return text;
    });
};

cartList.prototype.isPresentSuccessfullyAddedToCart = function () {
    browser.wait(EC.visibilityOf(element(by.xpath(this.msgCartSuccessfullyAddedXpath))), 15000);
    return element(by.xpath(this.msgCartSuccessfullyAddedXpath)).isPresent().then(function (result) {
        logger.info("Success message is present");
        return result;
    });
};

cartList.prototype.submitOrder = function () {
    browser.wait(EC.visibilityOf(element(by.buttonText(this.buttonTextSubmitOrder))), 25000);
    return element(by.buttonText(this.buttonTextSubmitOrder)).click().then(function () {
        util.waitForAngular();
        browser.sleep(10000);
    });
}

//Function to click on Continue Shopping Button
cartList.prototype.continueShopping = function () {
    browser.wait(EC.visibilityOf(element(by.buttonText(this.buttonTextContinueShopping))), 25000);
    return element(by.buttonText(this.buttonTextContinueShopping)).click().then(function () {
        util.waitForAngular();
        browser.sleep(10000);
    });
}


//****************FUNCTIONS IN ORDER SUBMITTED POP UP***************************
cartList.prototype.clickgoToServiceCatalogButtonOrderSubmittedModal = function () {
    return element(by.css(this.orderSubmittedModalGoToServiceCatalogCss)).click();
};

cartList.prototype.getTextOrderSubmittedHeaderOrderSubmittedModal = function () {
    browser.sleep(5000);
    browser.wait(EC.visibilityOf(element(by.xpath(this.orderSubmittedModalHeaderXpath))), 25000);
    return element(by.xpath(this.orderSubmittedModalHeaderXpath)).getText().then(function (text) {
        logger.info(text)
        return text;
    });
};

cartList.prototype.getTextOrderNumberOrderSubmittedModal = function () {
    return element(by.css(this.orderSubmittedModalOrderNumberTextCss)).getText().then(function (text) {
        logger.info("Order number : " + text);
        return text;
    });
};

cartList.prototype.getTextOrderedDateOrderSubmittedModal = function () {
    return element(by.xpath(this.orderSubmittedModalOrderDateTextXpath)).getText().then(function (text) {
        logger.info("Ordered Date : " + text);
        return text;
    });
};

cartList.prototype.getTextTotalPriceOrderSubmittedModal = function () {
    return element(by.xpath(this.orderSubmittedModalTotalPriceTextXpath)).getText().then(function (text) {
        logger.info("Total Price : " + text);
        var str1 = text.substr(4, 5);
        var str2 = text.substr(32, 5);
        var str3 = str2.replace(",", "");
        var str4 = parseFloat(str1) + parseFloat(str3);
        str4 = Math.round(str4);
        str4 = str4.toString();
        //var total = "USD"+str4.toString();
        return str4;
    });
};

cartList.prototype.getTextSubmittedByOrderSubmittedModal = function () {
    return element(by.xpath(this.orderSubmittedModalSubmittedByTextXpath)).getText().then(function (text) {
        logger.info("Submitted By : " + text);
        return text;
    });
};

cartList.prototype.clickMenuIcon = function () {
    return element(by.xpath(this.menuIconXpath)).click().then(function (){
        logger.info("Succesfully clicked on Menu icon");
    });
};
cartList.prototype.clickCartIcon = function () {
    browser.wait(EC.visibilityOf(element(by.xpath(this.cartIconXpath))), 15000);
    return element(by.xpath(this.cartIconXpath)).click().then(function (){
        logger.info("Succesfully clicked on Cart icon");
    });
};

cartList.prototype.emptyCart = function () {
    element(by.xpath(this.emptyCartButtonXpath)).click().then(function (){
        logger.info("Succesfully clicked on Empty Cart");
    });    

    browser.wait(EC.visibilityOf(element(by.xpath(this.cartEmptyModalOkButtonXpath))), 30000);
    element(by.xpath(this.cartEmptyModalOkButtonXpath)).click().then(function (){
        logger.info("Succesfully clicked on ok button");
    });
    
    browser.wait(EC.visibilityOf(element(by.xpath(this.msgCartSuccessfullyEmptiedXpath))), 5000);
    return element(by.xpath(this.msgCartSuccessfullyEmptiedXpath)).isPresent().then(function (result) {
        logger.info(result);
        return result;
    });
};

cartList.prototype.getTextSuccessfullyEmptiedCart = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.msgCartSuccessfullyEmptiedXpath))), 5000);
    return element(by.xpath(this.msgCartSuccessfullyEmptiedXpath)).getText().then(function (text) {
        return text;
    });
}	   
cartList.prototype.deleteCart = function () {
    element(by.xpath(this.deleteCartButtonXpath)).click().then(function (){
        logger.info("clicked on Delete Cart");
    });    

    browser.wait(EC.visibilityOf(element(by.xpath(this.cartDeleteModalOkButtonXpath))), 3000);
    element(by.xpath(this.cartDeleteModalOkButtonXpath)).click().then(function (){
        logger.info("clicked on OK Button");
    });    

    /*browser.wait(EC.visibilityOf(element(by.xpath(this.msgCartSuccessfullyDeletedXpath))), 5000);
    return element(by.xpath(this.msgCartSuccessfullyDeletedXpath)).isPresent().then(function (result) {
        logger.info("Success message is present : Your cart has successfully been deleted.");
        return result;
    });*/
};

cartList.prototype.getDeletedCartSuccessMessage = function () {
    //browser.wait(EC.visibilityOf(element(by.xpath(this.msgCartSuccessfullyDeletedXpath))), 5000);
    return element(by.xpath(this.msgCartSuccessfullyDeletedXpath)).getText().then(function (result) {
        logger.info(result);
        return result;
    });
};

cartList.prototype.selectCartFromList = function (cartName) {
    var elementToClick = element(by.xpath("//*[@title='" + cartName + "']"));
    browser.executeScript("arguments[0].scrollIntoView();", elementToClick.getWebElement()).then(function(){
        browser.wait(EC.visibilityOf(elementToClick), 60000).then(function(){
            browser.wait(EC.elementToBeClickable(elementToClick, 30000)).then(function(){
                logger.info("Element is clickable");
                return elementToClick.click();                
            })
        })
    })
};

cartList.prototype.expandsTheCartDetailsTab = function(){
    browser.wait(EC.visibilityOf(element(by.css(this.expandTheCartDetailsTabXpath))),25000);
    return element.all(by.css(this.expandTheCartDetailsTabXpath)).first().click().then(function (){
        logger.info("Succesfully clicked on Expand Cart Details link");
    });
    
};

cartList.prototype.getCartName = function (cartName) {
    //var cartNameElement =  element(by.xpath("//div[contains(text(), '" + cartName + "')]"));
    var cartNameElement =  element(by.xpath('//label[text()="Cart Name"]/following-sibling::div'));
    browser.wait(EC.visibilityOf(cartNameElement),90000);
    return cartNameElement.getText().then(function (text) {
        logger.info("Cart Name is:  "+text);
        return text;
    });
};

cartList.prototype.clickOnEditCartContextLink = function(){
    browser.wait(element(by.css(this.editCartContextLinkCss)),10000);
    return element(by.css(this.editCartContextLinkCss)).click().then(function () {
    	logger.info("clicked on Edit Cart");
    });
};

cartList.prototype.verifyEditCartContextPanelIsOpened = function () {
    var editCartContextPanelTitleElement = element(by.xpath(this.editCartContextPanelOpenedXpath));
    browser.wait(editCartContextPanelTitleElement, 60000).then(function () {
        editCartContextPanelTitleElement.getText().then(function (text) {
            expect(text).toBe("Edit Cart Context");
        });
    });
};

cartList.prototype.editCartDetails = function (jsonTemplate, modifiedParamMap) {
    var deferred = protractor.promise.defer();
    var requiredReturnMap = {}, expectedMap = {}, actualMap = {};
    var jsonObject = JSON.parse(JSON.stringify(jsonTemplate));
    var elem = null;
    var orderParameters,jsonObjectForParameters;
    browser.ignoreSynchronization = false;
    orderParameters = Object.keys(jsonObject["Edit Cart Parameters"]);
    jsonObjectForParameters = jsonObject["Edit Cart Parameters"];
   Object.keys(orderParameters).forEach(function (detailSection) {
        browser.executeScript('window.scrollTo(0,0);')
        var webElements = Object.keys(jsonObjectForParameters[orderParameters[detailSection]]);
        Object.keys(webElements).forEach(function (webElement) {
            var environment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : browser.params.url.includes("d2ops-test") ? "D2OPS" : "QA 4";
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
                    util.waitForAngular();
                    browser.sleep(3000)
                    browser.wait(EC.elementToBeClickable(dropdown), 5000).then(function () {
                        dropdown.isEnabled().then(function (enabled) {
                            if (enabled) {
                                //dropdown.click().then(function(){ //*******Added below line of code for click***//
                                browser.actions().mouseMove(dropdown).click().perform().then(function () {
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
            } else {
                browser.sleep(3000);
            }
        });
        util.waitForAngular();
    });
    requiredReturnMap["Expected"] = expectedMap;
    deferred.fulfill(requiredReturnMap);
    return deferred.promise;
};

cartList.prototype.clickOnUpdateCartButton = function(){
    browser.wait(element(by.xpath(this.updateButtonXpath)),19000);
    return element(by.xpath(this.updateButtonXpath)).click();
};

cartList.prototype.getCartContextData  = function(){
    var requiredReturnMap={}, actualMap={};
    var deferred = protractor.promise.defer();
    var cartContextParamElements = this.cartContextParamCss;
    var cartContextValueElements = this.cartContextValuesCss;
    browser.wait(EC.visibilityOf(element(by.css(cartContextParamElements))), 90000);
    browser.wait(EC.visibilityOf(element(by.css(cartContextValueElements))), 90000);
    element.all(by.css(cartContextParamElements)).getText().then(function (keysArray) {
        element.all(by.css(cartContextValueElements)).getText().then(function (valuesArray) {
            for (var i = 0; i < keysArray.length; i++) {
                actualMap[keysArray[i].split(":")[0].trim()] = valuesArray[i].trim();
            }
            deferred.fulfill(actualMap);
        });
    });
    requiredReturnMap["Actual"] = actualMap;
    deferred.fulfill(requiredReturnMap);
    return deferred.promise;
};

cartList.prototype.searchCartFromList = function (cartName) {
    element.all(by.xpath("//*[@title='" + cartName + "']")).then(function () {
        logger.info("Searching cart in cart List");    
        //logger.info("cart present is cart List");  
    });
    return  element(by.xpath("//*[@title='" + cartName + "']"))
};

cartList.prototype.isPresentCartInCartList = function (cartName) {

    return element.all(by.xpath("//*[@title='" + cartName + "']")).isPresent();
};

cartList.prototype.getTextCartName = function () {

    return element.all(by.css("li button")).getAttribute("title").then(function(text){
    	return text;
    });
};	 

cartList.prototype.closeNotificationPopUp = function()
{
    element(by.css(".bx--toast-notification__close-button")).click().then(function () {
    logger.info("closed Notification Pop Up Box");  
    }); 
};

cartList.prototype.clickBillOfMaterials = function()
{   
    var elem = element(by.xpath(this.lnkBillOfMaterialXpath));
    browser.wait(EC.elementToBeClickable(elem), 40000);
    browser.executeScript("arguments[0].scrollIntoView();", elem.getWebElement());
    return element(by.xpath(this.lnkBillOfMaterialXpath)).click().then(function(){
        logger.info("Clicked on Bill of Materials link"); 
        util.waitForAngular();       
    });
};

cartList.prototype.clickExpandQuantity = function()
{    
    var elem = element(by.xpath(this.btnExpandQuantXpath));    
    return browser.wait(EC.elementToBeClickable(elem), 40000).then(function(){        
        //browser.executeScript("javascript:window.scrollBy(document.getElementById('quantity').offsetHeight,document.getElementById('quantity').offsetWidth)");
	browser.executeScript("javascript:document.getElementById('quantity').scrollIntoView(__zone_symbol__scrollfalse)").then(function(){
            logger.info("Scrolled to element");
        }).catch(function(){
            logger.info("Scrolling not applicable");
        });
        browser.sleep(3000);             
        elem.click().then(function(){
            logger.info("Clicked on Expand Arrow for Quantity icon");
            util.waitForAngular();        
        });                   
    });  
};

cartList.prototype.getTotalPriceOfAllInstances = function()
{    
    var totalPriceOfAllInsatnces = 0;
    var totalEstimatedPrice = 0;
    return element.all(by.xpath(this.txtTotalPriceXpath)).getText().then(function(arr){       
       totalEstimatedPrice = arr[0];
       logger.info("Total Estimated Price is : " + totalEstimatedPrice);
	   for (var i = 1; i<arr.length; i++){           
            totalPriceOfAllInsatnces = totalPriceOfAllInsatnces + parseFloat(arr[i].replace("USD ", ""));      
            logger.info("Price of instance " + i + " is : " + arr[i]);
        }        
        if(totalPriceOfAllInsatnces == parseFloat(totalEstimatedPrice.replace("USD ", ""))){
            logger.info("Total estimated price and sum of price of individual instance matches");
            return;
        }else{
            logger.info("Total estimated price and sum of price of individual instance do not match");            
        }
   })
};


cartList.prototype.getEstimatedCost = function()
{    
    return element(by.xpath(this.txtEstimatedCostXpath)).getText().then(function(text){
        logger.info("Total Estimated Cost in cart page : "+text);
        return text;
    });
};

cartList.prototype.getCartTestData = function(serviceDataTemplate)
{    
    var cartDataObj = JSON.parse(JSON.stringify(serviceDataTemplate));
    var cartName = "aut-" + cartDataObj.provider.toLowerCase() + "-" + util.getRandomString(3).toLowerCase();
    cartDataObj["Order Parameters"]["Main Parameters"]["Cart Service"] = {
        "type": "RadioButton",
        "id": "radio-button-shoppingOptions_main_params-addToNewCart",
        "value": {
                "QA 1": "Add service to new cart",
                "QA 2": "Add service to new cart",
                "QA 4": "Add service to new cart",
                "Customer 1": "Add service to new cart"
        }
    };
    cartDataObj["Order Parameters"]["Main Parameters"]["Cart Name"] = {
        "type": "Textbox",
        "id": "text-input-main_params-cartName",
        "value": {
            "QA 1": cartName,
            "QA 2": cartName,
            "QA 3": cartName,
            "QA 4": cartName,
            "Customer 1": cartName
        }
    };

    return cartDataObj;

};

cartList.prototype.validateEstimatedCostAllServicesInCart = function(serviceListExp)
{    
    var elmEstimatedCost = element.all(by.xpath(this.txtEstimatedCostXpath)); 
    var elmServiceName = element.all(by.xpath(this.lblOfferingNameXpath)); 
    var lnkBillOfMaterial = element.all(by.xpath(this.lnkBillOfMaterialXpath));
    var cartListPage = new cartList();
    let promiseArr = [];
    var finlValidn = false;

    elmServiceName.getText().then(function(serviceList){
        return elmEstimatedCost.getText().then(function(textArray){
            for(var i = 0; i < textArray.length; i++){                
                //Check if service is present
                if(Object.keys(serviceListExp).includes(serviceList[i])){
                    //logger.info("Verifying Cost on shopping cart page for :" + serviceList[i]);
                    //Validate Estimated Cost on page
                    if(textArray[i] == serviceListExp[serviceList[i]]){
                        logger.info("Estimated Cost on shopping cart page for :" + serviceList[i] + " is - " + textArray[i]);
                        //Validate Pricing through BOM
                        lnkBillOfMaterial.get(i).click();
                        cartListPage.clickExpandQuantity();
                        finlValidn = cartListPage.getTotalPriceOfAllInstances();
                        lnkBillOfMaterial.get(i).click();
			browser.sleep(2000); 
                        browser.executeScript("arguments[0].scrollIntoView();", lnkBillOfMaterial.get(i).getWebElement());                                                      
                    }else{
                        logger.info("Estimated Cost Mismatch on shopping cart page for :" + serviceList[i] + " | Actual - " + textArray[i] + " | Expected - " + serviceListExp[serviceList[i]]);
                    }
                    promiseArr.push(finlValidn);
                }
            }           
            
        });
    });

    return Promise.all(promiseArr).then(function(finlValidn) {		
        if(finlValidn.indexOf(false) != -1){
            return Promise.resolve(false);
        }else{			
            return Promise.resolve(true);
        }		
    });
    
};


cartList.prototype.getOrderTotal = function()
{   
    var elmOrderTotal = element(by.xpath(this.txtOrderTotalXpath));
    browser.wait((EC.elementToBeClickable(elmOrderTotal)), 40000);    
    return elmOrderTotal.getText().then(function(text){
        logger.info("Order total on shopping cart page is : " + text);
        return text;
    });
    
};


cartList.prototype.setCartName_EditCartContext = function (cartName) {    
    element(by.css(this.txtboxCartNameCss)).clear();
    return element(by.css(this.txtboxCartNameCss)).sendKeys(cartName).then(function () {
    	logger.info("Cart name is entered");
    });
};
cartList.prototype.clickUserIcon = function () {
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.userIconXpath))), 10000);
    element(by.xpath(this.userIconXpath)).click().then(function () {
        logger.info("clicked on User Icon");
});
};
cartList.prototype.clickLogoutButton = function () {
    return element(by.xpath(this.logoutButtonXpath)).click().then(function () {            
            //Verify user is logged out succesfully
            var msg = element(by.xpath('//*[@class="logoutMain"]/h1'));
            browser.wait(EC.visibilityOf(msg), 60000);
            msg.getText().then(function(text){
                if(text == "You have been successfully logged out."){
                    logger.info("Logged out with current user");
                    browser.sleep(6000);
                }
            });
        });
}
cartList.prototype.searchForUserID = function(userID){
	element(by.xpath(this.searchTextBoxInputXpath)).clear();
    element(by.xpath(this.searchTextBoxInputXpath)).sendKeys(userID);
    element(by.xpath("//span[contains(text(), '" + userID + "')]")).click().then(function () {
        logger.info("Searching for ID to tranfer cart");
});
	return userID;
};
cartList.prototype.tranferCart = function () {
    element(by.xpath(this.tranferCartButtonXpath)).click().then(function () {
    logger.info("clicked on tranfer Cart");
    });
};
cartList.prototype.confirmTransfer = function()
{
    element(by.xpath(this.cartTransferModalButtonXpath)).click().then(function () {
        logger.info("clicked on Tranfer");
        });
        element(by.xpath(this.cartTransferModalButtonXpath)).click().then(function () {
            logger.info("clicked on Transfer again");
        });
}

cartList.prototype.getTextSuccessMessageTransferCart = function()
{
    return element(by.xpath(this.msgCartSuccessfullyTransferredXpath)).getText().then(function (text) {
        logger.info(text);
        return text;
    });
}

cartList.prototype.isPresentSuccessMessageTransferCart = function()
{
    return element(by.xpath(this.msgCartSuccessfullyTransferredXpath)).isPresent().then(function (result) {
        return result;
    });
}

cartList.prototype.loginFromOtherUser = function (username,password) {
    browser.wait(EC.urlContains("/logout"), 60000).then(function () {
    browser.ignoreSynchronization = true;;
    //setTestUserTeamInfo().then(function () {
      //  setApikeyForAllTestUsers().then(function () {
        	browser.get(browser.params.url).then(function () {
            	logger.info("Launched browser and navigated to URL: " + browser.params.url);
            	browser.sleep(10000);
            	//browser.ignoreSynchronization = true;
                        browser.wait(EC.visibilityOf(element(by.css("#username"))), 60000).then(function () {
                            logger.info("Waited till Username text box is visible on the page");
                            element(by.css("#username")).clear().then(function () {
                                logger.info("Cleared Username input box");
                                element(by.css("#username")).sendKeys(username).then(function () {
                                    logger.info("Entered " + username + " in Username input box");

                                    browser.wait(EC.visibilityOf(element(by.css("#continue-button"))), 5000).then(function () {
                                        logger.info("Waited till Continue button is visible on login page");
                                        element(by.css("#continue-button")).click().then(function () {
                                            logger.info("Clicked on Continue button");


                                    browser.wait(EC.visibilityOf(element(by.css("#password"))), 5000).then(function () {
                                        logger.info("Waited till Password input box is visible on login page");
                                        element(by.css("#password")).sendKeys(password).then(function () {
                                            logger.info("Entered " + password + " in password input box");
                                            element(by.css("#signinbutton")).click().then(function () {
                                                browser.sleep(3000);
                                                logger.info("Clicked on Sign In button");
                                                browser.sleep(5000);
                                               
                                            });
                                        });
                                    });
                                    });
                                });
                            });
                        });
                    });
            });
      //  });
    //});

    if (username.includes("ibm.com")) {
        browser.wait(EC.titleIs("IBM w3id"), 60000).then(function () {
            logger.info("Waited till browser title is: IBM w3id");
            browser.wait(EC.visibilityOf(element(by.css("#desktop[name=\"username\"]"))), 60000).then(function () {
                logger.info("Waited till Intranet Username text box is visible on the page");
                element(by.css("#desktop[name=\"username\"]")).clear().then(function () {
                    logger.info("Cleared Intranet Username input box");
                    element(by.css("#desktop[name=\"username\"]")).sendKeys(username).then(function () {
                        logger.info("Entered " + username + " in intranet username input box");
                        element(by.css("input[name=\"password\"]")).clear().then(function () {
                            logger.info("Cleared Intranet Password input box");
                            browser.sleep(3000);
                            element(by.css("input[name=\"password\"]")).sendKeys(password).then(function () {
                                logger.info("Entered " + password + " in intranet password input box");
                                element(by.css("#btn_signin")).click().then(function () {
                                    logger.info("Clicked on Intranet Sign In button");
                                    isAngularApp(true);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    browser.wait(EC.urlContains("/dashboard"), 60000).then(function () {
        logger.info("Waited till browser url contains /dashboard");

        browser.wait(EC.visibilityOf(element(by.css("a[title=\"Let's Get Started\"]"))), 90000).then(function () {
            logger.info("Waited till visibility of Let`s Get started link on Dashboard");
        });
    });
});
};

cartList.prototype.clickOkInDeleteItemsInCartPopup = function()
{
	 browser.wait(EC.visibilityOf(element(by.css(this.btnOkdeleteItemModal))),5000);
	 return element(by.css(this.btnOkdeleteItemModal)).click().then(function () {
	        logger.info("Clicked on Ok button in delete confirmation popup");
	    });
};

cartList.prototype.clickCancelInDeleteItemsInCartPopup = function()
{
	 browser.wait(EC.visibilityOf(element(by.css(this.btnCanceldeleteItemModal))),5000);
	 return element(by.css(this.btnCanceldeleteItemModal)).click().then(function () {
	        logger.info("Clicked on Cancel button in delete confirmation popup");
	    });
};

cartList.prototype.getTextDeleteItemModalHeading = function()
{
	 browser.wait(EC.visibilityOf(element(by.xpath(this.deleteItemModalHeader))),5000);
	 return element(by.xpath(this.deleteItemModalHeader)).getText().then(function (text) {
	        logger.info("Pop Up header :: "+text);
	        return text;
	    });
};

cartList.prototype.isPresentDeleteItemModal = function()
{
	 browser.wait(EC.visibilityOf(element(by.xpath(this.deleteItemModalHeader))),5000);
	 return element(by.xpath(this.deleteItemModalHeader)).isPresent().then(function (result) {
	        logger.info("Pop Up header :: "+result);
	        return result;
	    });
};

cartList.prototype.deleteItemsInShoppingCart = function(cartItem)
{
    var eleDelete = element(by.xpath("//h6[contains(text(), '"+cartItem+ "')]/../following-sibling::div//a[@class = 'delete-cart-btn']"));
	browser.wait(EC.visibilityOf(eleDelete),5000);
    
    browser.executeScript("javascript:window.scroll(829,37)").then(function(){
        eleDelete.getAttribute("id").then(function(id){
        //browser.executeScript("javascript:window.scrollBy(document.getElementById('" + id + "').offsetHeight,document.getElementById('" + id + "').offsetWidth)");
	browser.executeScript("javascript:document.getElementById('" + id + "').scrollIntoView(__zone_symbol__scrollfalse)");
        browser.wait(EC.elementToBeClickable(eleDelete), 60000);
            return eleDelete.click().then(function(){
                logger.info("Clicked on delete icon for the item : "+cartItem);
                browser.sleep(2000);
                util.waitForAngular();
            });                           
        });
    });
};

cartList.prototype.isPresentCartItem = function(cartItem) {
	browser.wait(EC.invisibilityOf(element(by.xpath("//h6[text()='"+cartItem+ "']"))),5000);
    return element(by.xpath("//h6[text()='"+cartItem+ "']")).isPresent().then(function (result) {
        logger.info("Item with "+cartItem+"is "+result);
        return result;
    });
};


cartList.prototype.getTextItemSuccessfullyDeleted = function() {
	return element(by.xpath(this.msgSuccessfullyDeletedCartItem)).getText().then(function (text) {
        return text;
    });
};

cartList.prototype.isPresentItemSuccessfullyDeleted = function() {
	browser.sleep(1000);
	return element(by.xpath(this.msgSuccessfullyDeletedCartItem)).isPresent().then(function (text) {
        return text;
    });
};

cartList.prototype.increaseQuntity = function(serviceName){
    var increaseQuntitybtn = element(by.xpath("//*[text()='" + serviceName + "']/../../following-sibling::div//*[@type='number']/../div/*[@class='up-icon']"));
    var eleToScroll = element(by.xpath("//*[text()='" + serviceName + "']/../../following-sibling::div//*[@type='number']"));
    browser.wait(EC.elementToBeClickable(increaseQuntitybtn), 40000);
    browser.sleep(3000);    
    //Scroll window to top       
   browser.executeScript("javascript:window.scroll(829,37)").then(function(){
    eleToScroll.getAttribute("id").then(function(id){
        browser.executeScript("javascript:window.scrollBy(document.getElementById('" + id + "').offsetHeight,document.getElementById('" + id + "').offsetWidth)");
            increaseQuntitybtn.click().then(function(){
                logger.info("Quantity increased by 1");
                browser.sleep(2000);
                util.waitForAngular();
            });                           
        });
   }); 
 };

cartList.prototype.validateEstimatedCostAllServicesCart = function()
{    
    var elmEstimatedCost = element.all(by.xpath(this.txtEstimatedCostXpath)); 
    var elmServiceName = element.all(by.xpath(this.lblOfferingNameXpath)); 
    var lnkBillOfMaterial = element.all(by.xpath(this.lnkBillOfMaterialXpath));
    var cartListPage = new cartList();
    let promiseArr = [];
    var finlValidn = false;
    var expOrderTotal = 0;
    var val;

    elmServiceName.getText().then(function(serviceList){
        return elmEstimatedCost.getText().then(function(textArray){
            for(var i = 0; i < textArray.length; i++){
	    	if (textArray[i] != "NA"){
		    val = parseFloat(textArray[i].split("+")[0].split("/")[0].replace("USD ", ""));
                    if(val != "0.00"){  
                        logger.info("Estimated Cost on shopping cart page for :" + serviceList[i] + " is - " + textArray[i]);
                        //Validate Pricing through BOM
                        lnkBillOfMaterial.get(i).click();
                        cartListPage.clickExpandQuantity();
                        finlValidn = cartListPage.getTotalPriceOfAllInstances();
                        lnkBillOfMaterial.get(i).click();
			            browser.sleep(2000); 
                        browser.executeScript("arguments[0].scrollIntoView();", lnkBillOfMaterial.get(i).getWebElement());                                                      
                    }else{
                        logger.info("Estimated Cost on shopping cart page for :" + serviceList[i] + " is - USD 0.00");
                    }
                    promiseArr.push(finlValidn);
                    expOrderTotal = expOrderTotal + val;	
		}else{
		 	logger.info("Estimated Cost on shopping cart page for :" + serviceList[i] + " is NA");
			promiseArr.push(false);
                }    
            }
            cartListPage.getOrderTotal().then(function(actOrderTotal){
                actOrderTotal = parseFloat(actOrderTotal.split("+")[0].split("/")[0].replace("USD ", ""));
                if(actOrderTotal == expOrderTotal){
                    logger.info("Order Total is succesfully validated on shopping cart page.");                    
                }else{
                    logger.info("Order Total is is not matching on shopping cart page.");
                    promiseArr.push(false);
                }
            });	                        
        });
    });

    return Promise.all(promiseArr).then(function(finlValidn) {		
        if(finlValidn.indexOf(false) != -1){
            return Promise.resolve(false);
        }else{
            return Promise.resolve(true);          
        }		
    });
    
};

cartList.prototype.reduceQuntity = function(serviceName){
    var reduceQuntitybtn = element(by.xpath("//*[text()='" + serviceName + "']/../../following-sibling::div//*[@type='number']/../div/*[@class='down-icon']"));
    var eleToScroll = element(by.xpath("//*[text()='" + serviceName + "']/../../following-sibling::div//*[@type='number']"));
    browser.wait(EC.elementToBeClickable(reduceQuntitybtn), 40000);
    browser.sleep(3000);    
    //Scroll window to top       
   browser.executeScript("javascript:window.scroll(829,37)").then(function(){
    eleToScroll.getAttribute("id").then(function(id){
        browser.executeScript("javascript:window.scrollBy(document.getElementById('" + id + "').offsetHeight,document.getElementById('" + id + "').offsetWidth)");
        reduceQuntitybtn.click().then(function(){
                logger.info("Quantity reduced by 1");
                browser.sleep(2000);
                util.waitForAngular();
            });                           
        });
   }); 

};

module.exports = cartList;
