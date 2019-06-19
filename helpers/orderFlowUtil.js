"use strict";
var logGenerator = require("./logGenerator.js"),
    logger = logGenerator.getApplicationLogger(),
    CatalogPage = require('../e2e/pageObjects/catalog.pageObject.js'),
    PlaceOrderPage = require('../e2e/pageObjects/placeOrder.pageObject.js'),
    OrdersPage = require('../e2e/pageObjects/orders.pageObject.js'),
    OrdersHistoryPage = require('../e2e/pageObjects/ordersHistory.pageObject.js'),
    InventoryPage = require('../e2e/pageObjects/inventory.pageObject.js'),
    util = require('./util.js'),
    jsonUtil = require('./jsonUtil.js');

var catalogPage, placeOrderPage, ordersPage, inventoryPage,ordersHistoryPage;
var fs = require('fs');

catalogPage = new CatalogPage();
placeOrderPage = new PlaceOrderPage();
ordersPage = new OrdersPage();
inventoryPage = new InventoryPage();
ordersHistoryPage = new OrdersHistoryPage();

var defaultOrderObject = {
    "bluePrintName": "VPC Single Instance For EC2",
    "provider": "amazon",
    "serviceName": "amazon VPC" + util.getRandomString(4)
};

function createOrder(orderObject) {
    if (orderObject == undefined) {
        orderObject = defaultOrderObject;
    }
    logger.info("Trying to create orders..." + orderObject.bluePrintName);

    catalogPage.open();
    browser.sleep(5000)
    var returnOrderObj = {};
    catalogPage.clickProviderCheckBoxBasedOnName(orderObject.provider);
    browser.sleep(2000);
    catalogPage.clickConfigureButtonBasedOnName(orderObject.bluePrintName);
    returnOrderObj.servicename = placeOrderPage.setServiceNameText(orderObject.serviceName + util.getRandomString(4));
    updateServiceInstanceNameToInventoryJSON(returnOrderObj.servicename);
    placeOrderPage.clickNextButton();
    browser.sleep("1000");
    for (var size = 0; size < orderObject.dropdownLabels.length; size++) {
        placeOrderPage.selectValueFromDropdownBasedonLabelName_AdditionalParamaters(orderObject.dropdownLabels[size].dropdownLabelId, orderObject.dropdownLabels[size].value);
    }
    for (var sizeText = 0; sizeText < orderObject.textinputdetails.length; sizeText++) {
        placeOrderPage.enterValueForAdditionalParamatersBasedOnLabelName(orderObject.textinputdetails[sizeText].textinputDetailsId, orderObject.textinputdetails[sizeText].value);
    }
    browser.sleep("1000")
    placeOrderPage.clickNextButton();
    placeOrderPage.submitOrder();
    returnOrderObj.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
    returnOrderObj.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
    expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
    placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
    return returnOrderObj;
}

function verifyOrderStatus(orderObject) {
    ordersPage.open();
    ordersPage.clickAllOrdersUnderOrdersSection();
    browser.sleep(5000);
    util.waitForAngular();
    ordersPage.searchOrderById(orderObject.orderNumber);
    return ordersPage.getTextFirstOrderStatusOrdersTable();
}


function waitForDeleteOrderStatusChange(orderObject, expectedChangedStatus, repeatCount) {
    if (repeatCount == undefined) {
        repeatCount = 30;
    }
    repeatCount = repeatCount - 1;
    if (repeatCount > 0) {
        ordersPage.open();
        browser.sleep(10000);
        ordersPage.clickAllOrdersUnderOrdersSection();
		ordersPage.searchOrderById(orderObject.deleteOrderNumber);
		browser.sleep(10000);
		//Validate if order is displayed or not.Sometimes, an error message will come "No Order Found", adding below code to handle this kind of failures.
		return ordersPage.checkIfOrderFound().then(function(message){									
			if(message == "No Orders Found" || message == "No Pending Orders"){
				browser.sleep(10000);				
				logger.info(message + "==> continuing the loop");
				waitForDeleteOrderStatusChange(orderObject, expectedChangedStatus, repeatCount);
			}else{
                browser.sleep(5000);
                //ordersPage.clickFirstViewDetailsOrdersTable();
                var EC = browser.ExpectedConditions;
                return browser.wait(EC.visibilityOf(element.all(by.css("#status")).last()), 30000).then(function () {
                    return element.all(by.css("#status")).last().getText().then(function (text) {
                        if (text == expectedChangedStatus) {
                            logger.info("Delete order status is changed to: " + text + ", breaking the loop");
                            repeatCount = 0;
                            return;
                        } else {
                            if (text == "Failed") {
                                ordersPage.getTextFailureReason();
                                logger.info("Delete order status is Failed, breaking the loop");
                                repeatCount = 0;
                                return;
                            } else {
                                browser.sleep(10000);
                                waitForDeleteOrderStatusChange(orderObject, expectedChangedStatus, repeatCount);
                                logger.info("Waiting for delete order status to be " + expectedChangedStatus + ", current status: " + text + " => continuing the loop");
                            }
                        }
                    })
                })
            }
		});        
    }
}

function verifyOrderStatusDeletedOrder(orderObject) {
    ordersPage.open();
    ordersPage.clickAllOrdersUnderOrdersSection();
    ordersPage.searchOrderById(orderObject.deleteOrderNumber);
    return ordersPage.getTextFirstOrderStatusOrdersTable();
}

function verifyOrderType(orderObject) {
    ordersPage.open();
    //ordersPage.clickAllOrdersUnderOrdersSection();
    ordersPage.searchOrderById(orderObject.orderNumber);
    return ordersPage.getTextFirstOrderTypeOrdersTable();
}

function verifyOrderTypeDeletedOrder(orderObject) {
    ordersPage.open();
    //ordersPage.clickAllOrdersUnderOrdersSection();
    ordersPage.searchOrderById(orderObject.deleteOrderNumber);
    return ordersPage.getTextFirstOrderTypeOrdersTable();
}

function getOrderCreatedDate(orderObject) {
    ordersPage.open();
    ordersPage.clickAllOrdersUnderOrdersSection();
    ordersPage.searchOrderById(orderObject.orderNumber);
    return ordersPage.getTextOrderCreatedDateOrderDetails();
}

function approveOrder(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.orderNumber);
    //ordersPage.selectBudgetaryUnit();
    //ordersPage.clickFirstViewDetailsOrdersTable();
    var totalRepeatCountApproveOrder = 10;
    var currentRepeatCountApproveOrder = 0;
    ordersPage.isDisplayedApproveButtonOrderDetails().then(function (isApproveButtonDisplayed) {
        while (currentRepeatCountApproveOrder < totalRepeatCountApproveOrder && isApproveButtonDisplayed == false) {
            currentRepeatCountApproveOrder = currentRepeatCountApproveOrder + 1;
            ordersPage.open();
            ordersPage.searchOrderById(orderObject.orderNumber);
            //ordersPage.clickFirstViewDetailsOrdersTable();
            isApproveButtonDisplayed = ordersPage.isDisplayedApproveButtonOrderDetails().then(function (displayStatus) {
                logger.info("Approve button display status - within loop: " + displayStatus);
            });
        }
    });
    ordersPage.clickApproveButtonOrderDetails();
    ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickApproveButtonOrderApprovalModal();
    ordersPage.clickOkInOrderApprovalModal();
}

async function approveOrderWithAsyncAwait(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.orderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.orderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    ordersPage.clickApproveButtonOrderDetails();
    await ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
    await ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
    await ordersPage.clickApproveButtonOrderApprovalModal();
    await ordersPage.clickOkInOrderApprovalModal();
    return "Success";
}

async function waitForOrderStatusChangeWithAsyncAwait(orderObject, expectedChangedStatus, repeatCount) {
    if (repeatCount == undefined) {
        repeatCount = 25;
    }
    repeatCount = repeatCount - 1;
    if (repeatCount > 0) {
        ordersPage.open();
        ordersPage.clickAllOrdersUnderOrdersSection();
        ordersPage.searchOrderById(orderObject.orderNumber)
        ordersPage.clickFirstViewDetailsOrdersTable();
        var EC = browser.ExpectedConditions;
        return browser.wait(EC.visibilityOf(element.all(by.css("#status")).last()), 30000).then(function () {
            return element.all(by.css("#status")).last().getText().then(function (text) {
                if (text == expectedChangedStatus) {
                    logger.info("Order status is changed to: " + text + ", breaking the loop");
                    repeatCount = 0;
                    return;
                } else {
                    if (text == "Failed") {
                        ordersPage.getTextFailureReason();
                        logger.info("Order status is Failed, breaking the loop");
                        repeatCount = 0;
                        return;
                    } else {
                        browser.sleep(10000);
                        waitForOrderStatusChangeWithAsyncAwait(orderObject, expectedChangedStatus, repeatCount);
                        logger.info("Waiting for Order status to be " + expectedChangedStatus + ", current status: " + text + " => continuing the loop");
                    }
                }
            })
        })
    }
}

function waitForOrderStatusChange(orderObject, expectedChangedStatus, repeatCount) {
	if(repeatCount == undefined){
		repeatCount = 30;
	}
	repeatCount = repeatCount-1;
	if(repeatCount>0){
		ordersPage.open();
		browser.sleep(10000);
		ordersPage.clickAllOrdersUnderOrdersSection();
		ordersPage.searchOrderById(orderObject.orderNumber);
		browser.sleep(25000);

		//Validate if order is displayed or not.Sometimes, an error message will come "No Order Found", adding below code to handle this kind of failures.
		return ordersPage.checkIfOrderFound().then(function(message){									
			if(message == "No Orders Found" || message == "No Pending Orders" ){
				browser.sleep(10000);				
				logger.info(message + "==> continuing the loop");
				waitForOrderStatusChange(orderObject,expectedChangedStatus, repeatCount);
			}else{
				//browser.sleep(5000);
				ordersPage.clickFirstViewDetailsOrdersTable();
				var EC = browser.ExpectedConditions;
				return browser.wait(EC.visibilityOf(element.all(by.css("#status")).first()), 30000).then(function(){
					return element.all(by.css("#status")).first().getText().then(function(text){
						if(text == expectedChangedStatus){
							logger.info("Order status is changed to: "+text+", breaking the loop");
							repeatCount = 0;
							return;
						}else{
							if(text == "Failed"){
								ordersPage.getTextFailureReason();
								logger.info("Order status is Failed, breaking the loop");
								repeatCount = 0;
								return;
							}else{
								browser.sleep(10000);
								waitForOrderStatusChange(orderObject,expectedChangedStatus, repeatCount);
								logger.info("Waiting for Order status to be "+expectedChangedStatus+", current status: "+text+" => continuing the loop");
							}
						}				
					})
				})
			}
		});
	}
}
		
		

function deleteService(orderObject) {
    inventoryPage.open();
    inventoryPage.searchOrderByServiceName(orderObject.servicename);
    util.waitForAngular();
    inventoryPage.clickDeleteFirstInstance();
    inventoryPage.clickConfirmCheckBoxDeleteServiceModal();
    inventoryPage.clickOKDeleteServiceModal();
    return inventoryPage.getDeleteOrderNumber();
}

function approveDeletedOrder(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.deleteOrderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    //ordersPage.selectBudgetaryUnit();
    ordersPage.clickApproveButtonOrderDetails();
    ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickApproveButtonOrderApprovalModal();
    ordersPage.clickOkInOrderApprovalModal();
}

function denyOrder(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.orderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    ordersPage.clickDenyButtonOrderDetails();
    ordersPage.clickTechnicalApprovalCheckBoxOrderDenyModal();
    ordersPage.setTextCommentsTextareaOrderDenyModal("Testing");
    ordersPage.clickDenyInOrderDenyModal();
    ordersPage.clickOkDenialWasProcessed();
}


function cancelOrder(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.orderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    browser.sleep("4000");
    ordersPage.clickCancelButtonOrderApprovalModal();
    ordersPage.clickYesButtonOnCancelPopup();
}

function fillPartialOrderDetails(jsonTemplate, parameterSection, modifiedParamMap) {
    var serviceName;
    var EC = protractor.ExpectedConditions;
    var jsonObject = JSON.parse(JSON.stringify(jsonTemplate));
    var orderParameters = Object.keys(jsonObject["Order Parameters"]);
    var webElements = Object.keys(jsonObject["Order Parameters"][parameterSection]);
    Object.keys(webElements).forEach(function (webElement) {
        var environment = browser.params.url.includes("cb-qa-1") ? "QA 1" : browser.params.url.includes("cb-qa-2") ? "QA 2" : browser.params.url.includes("customer1") ? "Customer 1" : "QA 4";
        var webElementObject = Object.keys(jsonObject["Order Parameters"][parameterSection][webElements[webElement]]);
        var elementType = Object.values(jsonObject["Order Parameters"][parameterSection][webElements[webElement]][webElementObject[0]]).join("");
        var elementID = Object.values(jsonObject["Order Parameters"][parameterSection][webElements[webElement]][webElementObject[1]]).join("");
        var elementValue = Object.values(jsonObject["Order Parameters"][parameterSection][webElements[webElement]][webElementObject[2]][environment]).join("");
        if (!elementValue == "") {
            if (modifiedParamMap != undefined) {
                if (Object.keys(modifiedParamMap).includes(webElements[webElement]))
                    elementValue = modifiedParamMap[webElements[webElement]];
            }
            if (elementType == "Dropdown") {
                var dropdown = element(by.css("[id=\"" + elementID + "\"]"));
                util.waitForAngular();	
	            browser.sleep(5000);
                browser.wait(EC.presenceOf(dropdown), 5000);
                dropdown.click().then(function () {
                    var dropDownValuesArray = element.all(by.xpath("//*[@id='" + elementID + "']//carbon-dropdown-option//a"));
                    dropDownValuesArray.getText().then(function (textArray) {
                        var isDropDownValuePresent = false;
                        for (var i = 0; i < textArray.length; i++) {
                            if (textArray[i] == elementValue) {
                                dropDownValuesArray.get(i).click().then(function () {
                                    logger.info("Selected " + elementValue + " from " + webElements[webElement] + " dropdown");
                                });
                                isDropDownValuePresent = true;
                            }
                        }
                        if (!isDropDownValuePresent) {
                            dropDownValuesArray.get(0).getText().then(function (text) {
                                dropDownValuesArray.get(0).click().then(function () {
                                    logger.info("Selected " + text + " from " + webElements[webElement] + " dropdown");
                                })
                            })
                        }
                    });
                });
            }
            if (elementType == "RadioButton") {
                var radioButtion = element(by.css("[id=\"" + elementID + "\"] ~ label span"));
                util.waitForAngular();	
	            browser.sleep(5000);
                browser.wait(EC.presenceOf(radioButtion), 5000);
                radioButtion.click().then(function () {
                    logger.info("Selected " + elementValue + " radio button for " + webElements[webElement]);
                })
            }
            if (elementType == "Textbox") {
                if (webElements[webElement] == "Service Instance Name") {
                    elementValue = elementValue + util.getRandomString(5);
                    serviceName = elementValue;
                }
                var textbox = element(by.css("[id=\"" + elementID + "\"]"));
                util.waitForAngular();	
	            browser.sleep(5000);
                browser.wait(EC.presenceOf(textbox), 5000);
                textbox.clear();
                textbox.sendKeys(elementValue).then(function () {
                    logger.info("Entered " + elementValue + " in " + webElements[webElement] + " textbox");
                })
            }
            if(elementType == "DropdownSearch"){
            	var dropdownbox = element(by.xpath("//*[@id='"+elementID + "' or @id = '" + elementID.toLowerCase() +"']/div"));
				util.waitForAngular();	
	            browser.sleep(5000);
				browser.wait(EC.presenceOf(dropdownbox), 10000).then(function(){
					dropdownbox.click().then(function(){
						browser.sleep(1000);
						util.waitForAngular();
						var dropDownValuesArray = element.all(by.xpath("//*[@id='" + elementID + "']//ul//li"));
						dropDownValuesArray.getText().then(function(textArray){
								var isDropDownValuePresent = false;
								for (var i=0;i<textArray.length;i++){
									if (textArray[i] == elementValue){
										dropDownValuesArray.get(i).click().then(function(){
											logger.info("Selected "+elementValue+" from "+webElements[webElement]+" dropdown");
					                    });
					                    isDropDownValuePresent =true;
					                }
					            }
					            if(!isDropDownValuePresent){
					            	dropDownValuesArray.get(0).getText().then(function(text){
					            		dropDownValuesArray.get(0).click().then(function(){
					            			logger.info("Selected "+text+" from "+webElements[webElement]+" dropdown");
					            		})
					            	})
					            }
					        });
					});
				});
				
            }
        }
    })
    placeOrderPage.clickNextButton();
    return serviceName;
}

function fillOrderDetails(jsonTemplate, modifiedParamMap) {
    var deferred = protractor.promise.defer();
    var requiredReturnMap = {}, expectedMap = {}, actualMap = {};
    var EC = protractor.ExpectedConditions;
    var jsonObject = JSON.parse(JSON.stringify(jsonTemplate));
    var elem = null;
    browser.ignoreSynchronization = false;
    //Adding below condition for Provisioning/Edit flows
    var orderParameters,jsonObjectForParameters;
    if (modifiedParamMap["EditService"] == true){
         orderParameters = Object.keys(jsonObject["Edit Parameters"]);
         jsonObjectForParameters = jsonObject["Edit Parameters"];
    }else{
    	/*//Main parameter page handling         
        //Set quantity if its applicable
         var quantity;
         try{
             quantity = jsonObject["Order Parameters"]["Main Parameters"]["Quantity"]["value"]["QA 4"];
         }catch(error){
             quantity = undefined;
         }
	 //Handling for Shopping Cart test case
         if(quantity != undefined){
            if (Object.keys(modifiedParamMap).includes("Quantity")){            
                 placeOrderPage.setQuantity(modifiedParamMap["Quantity"]);
             }else{
                 placeOrderPage.setQuantity(quantity);
             }
         }
        var providerAccount = jsonObject["Order Parameters"]["Main Parameters"]["Provider Account"]["value"]["QA 4"]
        placeOrderPage.setServiceNameText(modifiedParamMap["Service Instance Name"]);
        placeOrderPage.selectProviderAccount(providerAccount);
        placeOrderPage.clickNextButton();
        util.waitForAngular();     
        //Remove main parameter key from json
        delete jsonObject["Order Parameters"]["Main Parameters"];*/
        orderParameters = Object.keys(jsonObject["Order Parameters"]);
        jsonObjectForParameters = jsonObject["Order Parameters"]; 
    }	

    //var orderParameters = Object.keys(jsonObject["Order Parameters"]);
    Object.keys(orderParameters).forEach(function (detailSection) {
         browser.executeScript('window.scrollTo(0,0);')
    	//browser.executeScript("window.scrollTo(0, document.body.scrollHeight);")
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
		            util.waitForAngular();	
		            browser.sleep(3000)
		            browser.wait(EC.elementToBeClickable(dropdown), 300000).then(function(){
                        dropdown.isEnabled().then(function (enabled) {
                            if(enabled){
                                //dropdown.click().then(function(){ //*******Added below line of code for click***//
                                browser.actions().mouseMove(dropdown).click().perform().then(function(){
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
                    // browser.wait(EC.invisibilityOf($('#bx--loading__svg')), 900000).then(function(){
                    //     browser.sleep("5000");
                    //     util.waitForAngular();
                    // });                    
                }
                if (elementType == "RadioButton") {
                	//browser.sleep(5000);
                	var radioButtion = element(by.css("[id*=\"" + elementID + "\"]"));
                    util.waitForAngular();	
		    browser.sleep(3000);
                    browser.wait(EC.elementToBeClickable(radioButtion), 60000);
                    browser.executeScript("arguments[0].click();", radioButtion.getWebElement()).then(function () {
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
				if(elementType == "SearchList"){
					var textbox = element(by.css("[id=\""+elementID+"\"]"));
					util.waitForAngular();	
		            browser.sleep(5000);
					browser.wait(EC.presenceOf(textbox), 60000).then(function(){
						logger.info("Element is Present...");
						textbox.sendKeys("test").then(function(){
							browser.sleep(1000);
							textbox.sendKeys("ami");
							logger.info("Entered testami in "+webElements[webElement]+" textbox");
							util.waitForAngular();
								var dropDownValues = element.all(by.css("[id^=dropdown-option__]"));
								dropDownValues.getText().then(function(textArray){
									var isDropDownValuePresent = false;
									for (var i=0;i<textArray.length;i++){
										if (textArray[i] == elementValue){
											logger.info(textArray[i]);
											dropDownValues.get(i).click().then(function(){
												logger.info("Selected "+elementValue+" from "+webElements[webElement]+" dropdown");
												expectedMap[webElements[webElement].trim()] = elementValue.trim();
						                    	deferred.fulfill(expectedMap);
						                    });
						                    isDropDownValuePresent =true;
						                }
						            }
						            if(!isDropDownValuePresent){
						            	dropDownValues.get(0).getText().then(function(text){
						            		dropDownValues.get(0).click().then(function(){
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
				if(elementType == "DropdownSearch"){
					//var dropdownbox = element(by.css("[id=\""+elementID+"\"] div"));
					var dropdownbox = element(by.xpath("//*[@id='"+elementID + "' or @id = '" + elementID.toLowerCase() +"']/div"));
					util.waitForAngular();	
		            browser.sleep(5000);
					browser.wait(EC.presenceOf(dropdownbox), 10000).then(function(){
						dropdownbox.click().then(function(){
							browser.sleep(1000);
							util.waitForAngular();
							//var dropDownValuesArray = element.all(by.xpath("//*[@id='" + elementID + "']//ul//li"));
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
                    browser.wait(EC.elementToBeClickable(button), 5000).then(function(){
                        button.click().then(function(){
                            logger.info("Clicked on the Button "+ webElements[webElement]);
                        });
                    });
                }
                if(elementType == "CheckBox"){
                    elementValue = " ";
                    var checkBx = element(by.css("[for=\"" + elementID + "\"]"));
                    checkBx.click().then(function(){
                        logger.info("Selected the checkbox "+ webElements[webElement]);
                    });
                }
                if(elementType == "SearchListWithMultiSelect"){
                    var multiElementValue = Object.values(jsonObject["Order Parameters"][orderParameters[detailSection]][webElements[webElement]][webElementObject[2]][environment]);
                    var multiElementValueArray = multiElementValue.toString().split(",");
                    var textbox = element(by.css("[id=\"" + elementID + "\"]"));
                    browser.wait(EC.presenceOf(textbox), 30000);
                    textbox.sendKeys(webElements[webElement]).then(function () {
                        logger.info("Entered "+webElements[webElement]+" in " + webElements[webElement] + " textbox");
                    });
                    var dropDownValues = element.all(by.css("[id^=dropdown-option__]"));
                    browser.wait(EC.presenceOf(dropDownValues), 30000);
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
                        textbox.click();
                        textbox.sendKeys(protractor.Key.TAB + protractor.Key.TAB);
                    });
                }
            }else{
		browser.sleep(3000);	
	   }
	//    browser.sleep(5000);
        });
	
        placeOrderPage.clickNextButton();
        util.waitForAngular();
    });
    var orderSummaryParamsCss = "[class='two-columns m-padding'] li span:nth-child(1).bold";
    var orderSummaryValuesCss = "[class='two-columns m-padding'] li span:nth-child(2)";
    browser.wait(EC.visibilityOf(element(by.css(orderSummaryParamsCss))), 30000);
    browser.wait(EC.visibilityOf(element(by.css(orderSummaryValuesCss))), 30000);
    element.all(by.css(orderSummaryParamsCss)).getText().then(function (keysArray) {
        element.all(by.css(orderSummaryValuesCss)).getText().then(function (valuesArray) {
            for (var i = 0; i < keysArray.length; i++) {
                actualMap[keysArray[i].split(":")[0].trim()] = valuesArray[i].trim();
            }
            deferred.fulfill(actualMap);
        });
    });
    requiredReturnMap["Actual"] = actualMap;
    requiredReturnMap["Expected"] = expectedMap;
    deferred.fulfill(requiredReturnMap);
    return deferred.promise;
}

function updateServiceInstanceNameToInventoryJSON(servicename) {
    logger.info("Updating Service Instance name to Inventory JSON under Test Data for Day2Ops tests....");
    var data = fs.readFileSync('./testData/inventory/inventory.json', 'utf-8');
    var toModify = JSON.parse(data);
    logger.info("servicename");
    logger.info(servicename);
    toModify.Search_InstanceName = servicename
    fs.writeFileSync('./testData/inventory/inventory.json', JSON.stringify(toModify, null, 2), 'utf-8');
    logger.info("Inventory JSON File updated with service instance name and Saved...")
}

function verifyInstancePowerStateStatus(orderObject) {
    inventoryPage.open();
    browser.sleep(5000);
    return inventoryPage.getInstancePowerStateStatus(orderObject);
}

function waitForSNOWLoginPage(repeatCount) {
    if (repeatCount == undefined) {
        repeatCount = 35;
    }
    repeatCount = repeatCount - 1;
    if (repeatCount > 0) {
        browser.refresh().then(function () {
            logger.info("Refreshed browser");
            browser.sleep(2000);
            browser.switchTo().frame(browser.driver.findElement(protractor.By.id("gsft_main"))).then(function () {
                logger.info("Switched to iframe");
                element(by.css("#user_name")).isPresent().then(function (display) {
                    logger.info("Is username displayed: " + display);
                    if (display == true) {
                        logger.info("SNOW login page displayed");
                        repeatCount = 0;
                        return;
                    } else {
                        waitForSNOWLoginPage(repeatCount);
                        logger.info("Waiting for SNOW login page to display");
                    }
                })
            })
        });
    }
}

function  verifyOrderServiceDetails(jsonObject) {

	var orderPageLocatorKeys =
		Object.keys(jsonObject["Order Details Locators"]);

	var orderPageLocatorValues =
		Object.values(jsonObject["Order Details Locators"]);

	var locatorName;
	var validnFlag;
	let promiseArr = [];

	Object.keys(orderPageLocatorKeys).forEach(function (orderPageLocatorKey) {

		locatorName = orderPageLocatorKeys[orderPageLocatorKey];
		
		promiseArr.push(ordersPage.validateOrderSummaryDetailsFields(jsonObject, locatorName))

	});

	return Promise.all(promiseArr).then(function(flagArr) {		
		if(flagArr.indexOf(false) != -1){
			return Promise.resolve(false);
		}else{			
			return Promise.resolve(true);
		}		
	});	

}

function editService(orderObject) {
    inventoryPage.open();
    inventoryPage.searchOrderByServiceName(orderObject.servicename);
    util.waitForAngular();
    inventoryPage.clickEditInstance();     
}

//This function will approve newly placed order fincancially
function approveOrderTechnically(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.orderNumber);
    //ordersPage.selectBudgetaryUnit();
    //ordersPage.clickFirstViewDetailsOrdersTable();
    var totalRepeatCountApproveOrder = 10;
    var currentRepeatCountApproveOrder = 0;
    ordersPage.isDisplayedApproveButtonOrderDetails().then(function (isApproveButtonDisplayed) {
        while (currentRepeatCountApproveOrder < totalRepeatCountApproveOrder && isApproveButtonDisplayed == false) {
            currentRepeatCountApproveOrder = currentRepeatCountApproveOrder + 1;
            ordersPage.open();
            ordersPage.searchOrderById(orderObject.orderNumber);
            // ordersPage.clickFirstViewDetailsOrdersTable();
            isApproveButtonDisplayed = ordersPage.isDisplayedApproveButtonOrderDetails().then(function (displayStatus) {
                logger.info("Approve button display status - within loop: " + displayStatus);
            });
        }
    });
    ordersPage.clickApproveButtonOrderDetails();
    ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickApproveButtonOrderApprovalModal();
    ordersPage.clickOkInOrderApprovalModal();
}

//This function will approve newly placed order fincancially
function approveOrderFinancially(orderObject) {
    ordersPage.clickApproveButtonOrderDetails();
    ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickApproveButtonOrderApprovalModal();
    ordersPage.clickOkInOrderApprovalModal();
}

//This function will approve the deleted order financially
function approveDeletedOrderFinancially(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.deleteOrderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    //ordersPage.selectBudgetaryUnit();
    ordersPage.clickApproveButtonOrderDetails();
    ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
    // ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickApproveButtonOrderApprovalModal();
    ordersPage.clickOkInOrderApprovalModal();
}

//This function will approve the deleted order technically
function approveDeletedOrderTechnically(orderObject) {
    ordersPage.open();
    ordersPage.searchOrderById(orderObject.deleteOrderNumber);
    //ordersPage.clickFirstViewDetailsOrdersTable();
    //ordersPage.selectBudgetaryUnit();
    ordersPage.clickApproveButtonOrderDetails();
    // ordersPage.clickFinancialApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickTechnicalApprovalCheckBoxOrderApprovalModal();
    ordersPage.clickApproveButtonOrderApprovalModal();
    ordersPage.clickOkInOrderApprovalModal();
}

module.exports = {
    createOrder: createOrder,
    verifyOrderStatus: verifyOrderStatus,
    approveOrder: approveOrder,
    deleteService: deleteService,
    approveDeletedOrder: approveDeletedOrder,
    verifyOrderType: verifyOrderType,
    verifyOrderTypeDeletedOrder: verifyOrderTypeDeletedOrder,
    verifyOrderStatusDeletedOrder: verifyOrderStatusDeletedOrder,
    denyOrder: denyOrder,
    cancelOrder: cancelOrder,
    getOrderCreatedDate: getOrderCreatedDate,
    fillPartialOrderDetails: fillPartialOrderDetails,
    fillOrderDetails: fillOrderDetails,
    updateServiceInstanceNameToInventoryJSON: updateServiceInstanceNameToInventoryJSON,
    waitForOrderStatusChange: waitForOrderStatusChange,
    waitForDeleteOrderStatusChange: waitForDeleteOrderStatusChange,
    approveOrderWithAsyncAwait: approveOrderWithAsyncAwait,
    waitForOrderStatusChangeWithAsyncAwait: waitForOrderStatusChangeWithAsyncAwait,
    verifyInstancePowerStateStatus: verifyInstancePowerStateStatus,
    waitForSNOWLoginPage: waitForSNOWLoginPage,
    verifyOrderServiceDetails: verifyOrderServiceDetails,
    editService: editService,
    approveOrderTechnically:approveOrderTechnically,
    approveOrderFinancially:approveOrderFinancially,
    approveDeletedOrderTechnically:approveDeletedOrderTechnically,
    approveDeletedOrderFinancially:approveDeletedOrderFinancially
};
