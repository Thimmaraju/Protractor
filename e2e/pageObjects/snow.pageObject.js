/************************************************
	AUTHOR: SANTOSH HADAWALE
************************************************/
"use strict";
var snowUrl 		= 		require('../../testData/SNOW/SnowUserCreds.json'),
	snowDropletCreds= 		require('../../testData/SNOW/SnowDropletUserCreds.json'),
	logGenerator 	= 		require("../../helpers/logGenerator.js"),
	util 			= 		require('../../helpers/util.js'),
	orderFlowUtil 	= 		require('../../helpers/orderFlowUtil.js'),
	extend 			= 		require('extend'),
	logger 			= 		logGenerator.getApplicationLogger(),
	snowLoginObj 	= 		JSON.parse(JSON.stringify(snowUrl.snowParameters)),
	snowDropletLoginObj = 		JSON.parse(JSON.stringify(snowDropletCreds.snowParameters)),
	EC 				= 		protractor.ExpectedConditions;	

var defaultConfig = {
	usernameInputCss						:			"#user_name",
	passwordInputCss						:			"#user_password",
	loginButtonCss							:			"#sysverb_login",
	mainIframeId							:			"gsft_main",
	addContentButtonCss						:			"#homepage_header_table #add_icon",
	homeTitleCss							:			"#home_title",
	favouritestStarCss						:			"#favorites_tab",
	searchFilterCss							:			"#filter",
	serviceCatalogRequestXpath				:			"//div[@class = 'sn-widget-list-title' and text() = 'Requests']", //"//a/div/span[contains(text(),'Service Catalog - Requests')]",
	goToDropdownCss							:			"[class='input-group-addon input-group-select'] select",
	numberOptionFromGoToDropdownCss			:			"[class='input-group-addon input-group-select'] select option[value='number']",
	searchInputCss							:			"[id$='_text']",
	allLinkXpath							:			"//a/span[contains(text(), 'All')]/..",
	requestNumberBreadcrumbLinkCss			:			"a[class='breadcrumb_link']:nth-of-type(5) span[class='sr-only']",
	requestNumberLinkXpath					:			"//a[@class = 'linked formlink' and contains(text(),'REQ')]",
	requestNumberInputBoxCss				:			"input[id='sc_request.number']",
	approversTabCss							:			"#tabs2_list span[class='tab_header']:nth-of-type(2) span[class='tab_caption_text']",	
	approverRequestedXpath					:			"//a[contains(text(), 'Requested')]",
	approverApprovededXpath					:			"//a[contains(text(), 'Approved')]",
	approveButtonCss						:			"span[class='navbar_ui_actions'] #approve",
	transactionCancelButtonCss				:			"#transaction_cancel",
	requestedItemsTabCss					:			"#tabs2_list span[class='tab_header']:nth-of-type(1) span[class='tab_caption_text']",
	requestedItemNumberLinkXapth			:			"//a[@class = 'linked formlink' and contains(text(),'RITM')]",
	requestedItemStateDropdownCss			:			"select[id='sc_req_item.state']",
	requestedItemClosedCompleteOptionCss	:			"select[id='sc_req_item.state'] option:nth-of-type(4)",
	navbarUpdateButtonCss					:			"span[class='navbar_ui_actions'] #sysverb_update",
	catalogTasksTabCss						:			"#tabs2_list span[class='tab_header']:nth-of-type(1) span[class='tab_caption_text']",
	catalogTaskNumberLinkXapth				:			"(//a[@class = 'linked formlink' and contains(text(),'SCTASK')])[1]",
	//catalogTaskNumberLinkXapth 				:			"(//td[@class='vt']/div[contains(text(), 'empty')])[6]/../preceding-sibling::td[5]/a[@class = 'linked formlink' and contains(text(),'SCTASK')]",
	catalogTaskNumberInputCss				:			"input[id='sc_task.number']",
	catalogTaskStateDropdownCss				:			"select[id='sc_task.state']",
	catalogTaskClosedCompleteOptionCss		:			"select[id='sc_task.state'] option:nth-of-type(4)",
	requestItemStageCss						:			"[id='sys_readonly.sc_req_item.stage'] option[selected='SELECTED']",
	approverStateCss						:			"[id='sysapproval_approver.state'] option[selected='SELECTED']",
	userInfoDropdownCss						:			"#user_info_dropdown",
	approvalControllerCss					:			"[id='sc_request.x_ibmg3_hcms_approval_controller'] option[selected='SELECTED']",
	approvalCss								:			"[id='sc_request.approval'] option[selected='SELECTED']",
	requestedStateCss						:			"[id='sc_request.request_state'] option[selected='SELECTED']",
	orderNumberCss							:			"[id='sc_request.x_ibmg3_hcms_order_number']",
	brokerRequestTypeCss					:			"[id='sc_request.x_ibmg3_hcms_broker_request_type'] option[selected='SELECTED']",
	logoutLinkCss							:			".dropdown-menu>li>a[href='logout.do']" //#transaction_cancel
};

function snow(selectorConfig) {
    if (!(this instanceof snow)) {
        return new snow(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

snow.prototype.clickFavouritesStar = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.favouritestStarCss))),30000).then(function(){
		logger.info("Waited till Favourite Star icon is displayed");
	});
	element(by.css(this.favouritestStarCss)).click().then(function(){
		logger.info("Clicked on Favourites star");
    });
}

snow.prototype.searchRequestsText = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.searchFilterCss))),30000).then(function(){
		logger.info("Waited till search Text box is displayed");
	});
	element(by.css(this.searchFilterCss)).sendKeys("requests").then(function(){
		logger.info("Entered Requests text in search textbox");
    });
}

snow.prototype.clickServiceCatalogRequestLink = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.serviceCatalogRequestXpath))),30000).then(function(){
		logger.info("Waited till Service Catalog Request link is displayed");
	});
	element(by.xpath(this.serviceCatalogRequestXpath)).click().then(function(){
		logger.info("Clicked on Service Catalog - Requests link");
		browser.sleep(5000);
    });
}

snow.prototype.searchSRNumber = function(ticketID){
	browser.switchTo().frame(browser.driver.findElement(protractor.By.id(this.mainIframeId)));
	browser.wait(EC.visibilityOf(element(by.css(this.goToDropdownCss))),30000).then(function(){
		logger.info("Waited till Go To dropdown displayed");
	});
	element(by.css(this.goToDropdownCss)).click().then(function(){
		logger.info("Clicked on Go To dropdown");
	});
	element(by.css(this.numberOptionFromGoToDropdownCss)).isDisplayed().then(function(){
		logger.info("Number option from Go To dropdown is diplayed");
	})
	element(by.css(this.numberOptionFromGoToDropdownCss)).click().then(function(){
		logger.info("Selected Number option from Go To dropdown");
	})
	browser.wait(EC.visibilityOf(element(by.css(this.searchInputCss))),30000).then(function(){
		logger.info("Waited till Search input box is displayed");
	}); 
	element(by.css(this.searchInputCss)).sendKeys(ticketID).then(function(){
		ticketID.then(function(srNo){
			logger.info("Entered "+srNo+" in Search input box");
		})
    });
	element(by.css(this.searchInputCss)).sendKeys(protractor.Key.ENTER).then(function(){
		logger.info("Hit Enter after entering request number");
	})
	/*browser.wait(EC.visibilityOf(element(by.css(this.requestNumberBreadcrumbLinkCss))),30000).then(function(){
		logger.info("Waited till Request Number breadcrumb link is displayed");
	});	*/
}

snow.prototype.searchOrderNumber = function(ticketID){
	browser.switchTo().frame(browser.driver.findElement(protractor.By.id(this.mainIframeId)));
	browser.wait(EC.visibilityOf(element(by.css(this.goToDropdownCss))),30000).then(function(){
		logger.info("Waited till Go To dropdown displayed");
	});
	browser.wait(EC.visibilityOf(element(by.xpath(this.allLinkXpath))),30000).then(function(){
		logger.info("Waited till All link displayed");
		browser.sleep(5000);
	});
	element(by.xpath(this.allLinkXpath)).click().then(function(){
		logger.info("Clicked on All link");
	});
	browser.wait(EC.visibilityOf(element(by.css(this.goToDropdownCss))),30000).then(function(){
		logger.info("Waited till Go To dropdown displayed");
	});
	element(by.css(this.goToDropdownCss)).click().then(function(){
		logger.info("Clicked on Go To dropdown");
	})
	element(by.css(this.numberOptionFromGoToDropdownCss)).isDisplayed().then(function(){
		logger.info("Number option from Go To dropdown is diplayed");
	})
	element(by.cssContainingText('option', 'Order Number')).click().then(function(){
		logger.info("Selected Order Number option from Go To dropdown");
	})
	browser.wait(EC.visibilityOf(element(by.css(this.searchInputCss))),30000).then(function(){
		logger.info("Waited till Search input box is displayed");
	}); 
	element(by.css(this.searchInputCss)).sendKeys(ticketID).then(function(){		
		logger.info("Entered "+ticketID+" in Search input box");
    });
	element(by.css(this.searchInputCss)).sendKeys(protractor.Key.ENTER).then(function(){
		logger.info("Hit Enter after entering request number");
	})
}

snow.prototype.clickRequestNumberLink = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.requestNumberLinkXpath))),30000).then(function(){
		logger.info("Waited till Request Number link is displayed");
	});
	element(by.xpath(this.requestNumberLinkXpath)).click().then(function(){
		logger.info("Clicked on Request Number link");
    });
	browser.wait(EC.visibilityOf(element(by.css(this.requestNumberInputBoxCss))),30000).then(function(){
		logger.info("Waited till Request Number input box is displayed");
	});	
}

snow.prototype.clickApproversTab = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.approversTabCss))),30000).then(function(){
		logger.info("Waited till Approvers tab is displayed");
	});
	element(by.css(this.approversTabCss)).isDisplayed().then(function(){
		logger.info("Approver tab is displayed");
    });
	element(by.css(this.approversTabCss)).click().then(function(){
		logger.info("Clicked on Approvers tab");
    });
	
}

snow.prototype.clickRequestedLinkFromApproversTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.approverRequestedXpath))),30000).then(function(){
		logger.info("Waited till Requested link displayed");
	});
	element(by.xpath(this.approverRequestedXpath)).isDisplayed().then(function(){
		logger.info("Approver requested is displayed");
    });
	element(by.xpath(this.approverRequestedXpath)).click().then(function(){
		logger.info("Clicked on Request State link under Approvers tab");
    });
}

snow.prototype.clickApprovedLinkFromApproversTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.approverApprovededXpath))),30000).then(function(){
		logger.info("Waited till Approved link displayed");
	});
	element(by.xpath(this.approverApprovededXpath)).isDisplayed().then(function(){
		logger.info("Approver approved is displayed");
    });
	element(by.xpath(this.approverApprovededXpath)).click().then(function(){
		logger.info("Clicked on Approved State link under Approvers tab");
    });
}


snow.prototype.clickApproveButton = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.approveButtonCss))),30000).then(function(){
		logger.info("Waited till Approve button is displayed");
	});
	element(by.css(this.approveButtonCss)).click().then(function(){
		logger.info("Clicked Approve button");
		browser.sleep(10000);//Intentional sleep as sometimes - Transaction Running popup will appear after some time
    });
	browser.wait(EC.invisibilityOf(element(by.css(this.transactionCancelButtonCss))),240000).then(function(){
		logger.info("Waited till Transaction Cancel button disappears");
	});
}

snow.prototype.clickRequestedItemsTab = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.requestedItemsTabCss))),30000).then(function(){
		logger.info("Waited till Requested Items tab is displayed");
	});
	element(by.css(this.requestedItemsTabCss)).click().then(function(){
		logger.info("Clicked on Requested Items tab");
    });
}

snow.prototype.clickNumberLinkFromRequestedItemsTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.requestedItemNumberLinkXapth))),30000).then(function(){
		logger.info("Waited till Requested Items Number link is displayed");
	});
	element(by.xpath(this.requestedItemNumberLinkXapth)).click().then(function(){
		logger.info("Clicked on Requested Item Number link");
    });
}

snow.prototype.clickStateDropdownFromRequestedItemsTab = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.requestedItemStateDropdownCss))),30000).then(function(){
		logger.info("Waited till Requested Item State dropdown displayed");
	});
	element(by.css(this.requestedItemStateDropdownCss)).click().then(function(){
		logger.info("Clicked on Requested Item - State dropdown");
    });
}

snow.prototype.selectCloseCompleteStateFromRequestedItemsTab = function(){
	element(by.css(this.requestedItemClosedCompleteOptionCss)).click().then(function(){
		logger.info("Clicked on Requested Item - Close Complete option from State dropdown");
    });
}

snow.prototype.clickUpdateButton = function(){
	element(by.css(this.navbarUpdateButtonCss)).click().then(function(){
		logger.info("Clicked on Update button");
		browser.sleep(7000);
    });
}

snow.prototype.clickCatalogTasksTab = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.catalogTasksTabCss))),30000).then(function(){
		logger.info("Waited till Catalog Tasks tab displayed");
	});
	element(by.css(this.catalogTasksTabCss)).click().then(function(){
		logger.info("Clicked on Catalog Task tab");
    });
}

snow.prototype.clickNumberLinkFromCatalogTasksTab = function(){
	browser.wait(EC.visibilityOf(element(by.xpath(this.catalogTaskNumberLinkXapth))),30000).then(function(){
		logger.info("Waited till Catalog Tasks Number link is displayed");
	});
	element(by.xpath(this.catalogTaskNumberLinkXapth)).click().then(function(){
		logger.info("Clicked on Catalog Task Number link");
    });
	browser.wait(EC.visibilityOf(element(by.css(this.catalogTaskNumberInputCss))),30000).then(function(){
		logger.info("Waited till Catalog Tasks Number input is displayed");
	});	
}

snow.prototype.clickStateDropdownFronCatalogTasksTab = function(){
	browser.wait(EC.visibilityOf(element(by.css(this.catalogTaskStateDropdownCss))),30000).then(function(){
		logger.info("Waited till Catalog Task State dropdown is displayed");
	});
	element(by.css(this.catalogTaskStateDropdownCss)).click().then(function(){
		logger.info("Clicked on Catalog Task - State dropdown");
    });
}

snow.prototype.selectCloseCompleteStateFromCatalogTasksTab = function(){
	element(by.css(this.catalogTaskClosedCompleteOptionCss)).click().then(function(){
		logger.info("Clicked on Catalog Task - Close Complete option from State dropdown");
    });
}

snow.prototype.getRequestStatus = function(){
	return element(by.css(this.requestItemStageCss)).getText().then(function(state){
		logger.info("Request State: "+state);
		return state;
	})
}

snow.prototype.getApproverStatus = function(){
	return element(by.css(this.approverStateCss)).getText().then(function(state){
		logger.info("Approver State: "+state);
		return state;
	})
}


snow.prototype.getApprovalControllerText = function(){
	var webElement = element(by.css(this.approvalControllerCss));
	browser.wait(EC.visibilityOf(webElement),30000).then(function(){
		logger.info("Waited till Approval Controller text is displayed");
	});
	return webElement.getText().then(function(state){
		logger.info("Approval Controller text: "+state);
		return state;
	});
}

snow.prototype.getApprovalText = function(){
	var webElement = element(by.css(this.approvalCss));
	browser.wait(EC.visibilityOf(webElement),30000).then(function(){
		logger.info("Waited till Approval text is displayed");
	});
	return webElement.getText().then(function(state){
		logger.info("Approval text is : "+state);
		return state;
	});
}

snow.prototype.getRequestedStateText = function(){
	var webElement = element(by.css(this.requestedStateCss));
	browser.wait(EC.visibilityOf(webElement),30000).then(function(){
		logger.info("Waited till requested state text is displayed");
	});
	return webElement.getText().then(function(state){
		logger.info("Requested state text is : "+state);
		return state;
	});
}

snow.prototype.getOrderNumberText = function(){
	var webElement = element(by.css(this.orderNumberCss));
	browser.wait(EC.visibilityOf(webElement),30000).then(function(){
		logger.info("Waited till order number text is displayed");
	});
	return webElement.getAttribute('value').then(function(state){
		logger.info("Order Number text is : "+state);
		return state;
	});
}

snow.prototype.getBrokerRequestTypeText = function(){
	var webElement = element(by.css(this.brokerRequestTypeCss));
	browser.wait(EC.visibilityOf(webElement),30000).then(function(){
		logger.info("Waited till broker request type text is displayed");
	});
	return webElement.getText().then(function(state){
		logger.info("Broker Request type is : "+state);
		return state;
	});
}


snow.prototype.loginToSNOWPortal = function () {
	isAngularApp(false);
	browser.get(snowLoginObj.url+"/logout.do").then(function(){
		logger.info("Pre-Condition :: Logged out from SNOW portal");
	})
	browser.get(snowLoginObj.url).then(function(){
		logger.info("Opened snow portal");
	})
	orderFlowUtil.waitForSNOWLoginPage();
	element(by.css(this.usernameInputCss)).sendKeys(snowLoginObj.username).then(function(){
		logger.info("Enetered username");
	})
	element(by.css(this.passwordInputCss)).sendKeys(snowLoginObj.password).then(function(){
		logger.info("Enetered password");
	})
	element(by.css(this.loginButtonCss)).click().then(function(){
		logger.info("Clicked on Login button");
		browser.sleep(10000);//Sleep, as it takes some time to load page completely
	})
	browser.switchTo().frame(browser.driver.findElement(protractor.By.id(this.mainIframeId)));
	/*browser.wait(EC.visibilityOf(element(by.css(this.addContentButtonCss))),60000).then(function(){
		logger.info("Waited till Add Content button is displayed");
	});*/
	browser.switchTo().defaultContent();
}

snow.prototype.loginToSNOWDropletPortal = function () {
	isAngularApp(false);
	browser.get(snowDropletLoginObj.url+"/logout.do").then(function(){
		logger.info("Pre-Condition :: Logged out from SNOW portal");
	})
	browser.get(snowDropletLoginObj.url).then(function(){
		logger.info("Opened snow portal");
	})
	orderFlowUtil.waitForSNOWLoginPage();
	element(by.css(this.usernameInputCss)).sendKeys(snowDropletLoginObj.username).then(function(){
		logger.info("Enetered username");
	})
	element(by.css(this.passwordInputCss)).sendKeys(snowDropletLoginObj.password).then(function(){
		logger.info("Enetered password");
	})
	element(by.css(this.loginButtonCss)).click().then(function(){
		logger.info("Clicked on Login button");
		browser.sleep(10000);//Sleep, as it takes some time to load page completely
	})
	browser.switchTo().frame(browser.driver.findElement(protractor.By.id(this.mainIframeId)));
	/*browser.wait(EC.visibilityOf(element(by.css(this.addContentButtonCss))),60000).then(function(){
		logger.info("Waited till Add Content button is displayed");
	});*/
	browser.switchTo().defaultContent();
}

snow.prototype.logoutFromSNOWPortal = function(){
	browser.get(snowLoginObj.url+"/logout.do").then(function(){
		logger.info("Logged out from SNOW portal");
	})
}

snow.prototype.approveCatalogTask = function(){
	this.clickCatalogTasksTab();
	this.clickNumberLinkFromCatalogTasksTab();
	this.clickStateDropdownFronCatalogTasksTab();
	this.selectCloseCompleteStateFromCatalogTasksTab();
	this.clickUpdateButton();
}

snow.prototype.logInToSnowPortalAndCompleteTheRequest = function(ticketID, estimatedPrice){
	//Login to SNOW Portal
	this.loginToSNOWPortal();
	//Approve the request
	this.clickFavouritesStar();
	this.searchRequestsText();
	this.clickServiceCatalogRequestLink();
	this.searchSRNumber(ticketID);
	this.clickRequestNumberLink();
	logger.info("Estimated Price before if : "+ estimatedPrice);
	if(parseInt(estimatedPrice) > 1000){
		logger.info("Estimated Price from if : "+ estimatedPrice);
		this.clickApproversTab();
		this.clickRequestedLinkFromApproversTab();
		this.clickApproveButton();
	}
	this.clickRequestedItemsTab();
	this.clickNumberLinkFromRequestedItemsTab();
	this.clickStateDropdownFromRequestedItemsTab();
	this.selectCloseCompleteStateFromRequestedItemsTab();
	this.clickUpdateButton();
	//Complete Catalog Task 1
	this.clickRequestedItemsTab();
	this.clickNumberLinkFromRequestedItemsTab();
	this.approveCatalogTask();
	//Complete Catalog Task 2
	this.approveCatalogTask();
	//Complete Catalog Task 3
	this.approveCatalogTask();
	//Complete Catalog Task 4
	this.approveCatalogTask();
	//Final Order status and logout
	return this.getRequestStatus().then(function(status){
		browser.get(snowLoginObj.url+"/logout.do").then(function(){
			logger.info("Logged out from SNOW portal");
		})
		return status;
	});
}


snow.prototype.logInToSnowDropletPortalAndSearchOrder = function(ticketID){
	//Login to SNOW Portal
	this.loginToSNOWDropletPortal();
	this.clickFavouritesStar();
	this.searchRequestsText();
	this.clickServiceCatalogRequestLink();
	this.searchOrderNumber(ticketID);
	this.clickRequestNumberLink();
}

snow.prototype.approveTheServiceNowRequestFromSnowPortal = function(){
	//Approve the request
	this.clickApproversTab();
	this.clickRequestedLinkFromApproversTab();
	this.clickApproveButton();
	this.clickRequestedItemsTab();
}

snow.prototype.verifytheApprovalLinkFromSnowPortal = function(ticketID){	
	browser.get(snowDropletLoginObj.url);
	this.clickFavouritesStar();
	this.searchRequestsText();
	this.clickServiceCatalogRequestLink();
	this.searchOrderNumber(ticketID);
	this.clickRequestNumberLink();
	this.clickApproversTab();
	this.clickApprovedLinkFromApproversTab();
}

snow.prototype.navigateToSnowPortal = function(ticketID){	
	browser.get(snowDropletLoginObj.url);
	this.clickFavouritesStar();
	this.searchRequestsText();
	this.clickServiceCatalogRequestLink();
	this.searchOrderNumber(ticketID);
	this.clickRequestNumberLink();
}


 
 module.exports = snow;    