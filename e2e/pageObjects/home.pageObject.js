"use strict";

var extend = require('extend');
var url = browser.params.url;
var username = browser.params.username;
var logGenerator = require("../../helpers/logGenerator.js"),
    logger = logGenerator.getApplicationLogger();
var util = require('../../helpers/util.js');
var EC = protractor.ExpectedConditions;

var defaultConfig = {
    pageUrl: url + '/dashboard',
    ordersLinkTextXpath: '//a[contains(text(), "Orders")][@id="ordersLinkId"]',
    approveOrdersTextXpath: '//a[@id="approverOrdersLinkId"][contains(text(), "Approve Orders")]',
    accountsLinkTextXpath: '//a[contains(text(), "ACCOUNTS")]',
    cataLogLinkTextXpath: '//a[contains(text(), "Catalog")]',
    servicesLinkTextXpath: '//a[contains(text(), "SERVICES")]',
    inventoryLinkTextXpath: '//a[contains(text(), "Inventory")]',
    configureLinkTextXpath: '(//*[@id="storefront_carbon-button_configure"]/button)',
    cancelLinkTextXpath: '//button[text()[contains(., "Cancel")]]',
    brokerageLinkTextXpath: '//h1[contains(text(), "IBM Cloud Brokerage")]',
    storeHeaderTitleXpath: "//h1[contains(text(),'IBM Cloud Brokerage')]",
    storeLandingPageTitleXpath: "//div[contains(text(),'Store')]",
    logOutLinkXpath: '//a[contains(text(),"Logout")]',
    sysadminVerifyId: 'checkbox-verifyCheckboxId'
};

function home(selectorConfig) {
    if (!(this instanceof home)) {
        return new home(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

home.prototype.open = function()
{
	browser.get(this.pageUrl);
	browser.wait(EC.urlContains("dashboard"), 10000);
	util.waitForAngular();
};

home.prototype.checkSysadminVerifyId = function () {
    return element(by.id(this.sysadminVerifyId)).click().then(function(){
        logger.info("Checked Verify-System-Admin checkbox.")
    })
}

home.prototype.clickconfigureLink = function () {
    return element.all(by.xpath(this.configureLinkTextXpath)).get(1).click();
};

home.prototype.clickLogoutLink = function () {
    element(by.xpath(this.logOutLinkXpath)).click().then(function () {
        logger.info("clicked logout link");
    });
};

home.prototype.clickordersLink = function () {
	browser.wait(EC.visibilityOf(element(by.xpath(this.ordersLinkTextXpath))),30000);
    return element(by.xpath(this.ordersLinkTextXpath)).click().then(function () {
        logger.info("clicked orders link");
    });
};

home.prototype.clickOnApproveOrdersLink = function () {
	browser.wait(EC.visibilityOf(element(by.xpath(this.ordersLinkTextXpath))),30000);
	element(by.xpath(this.ordersLinkTextXpath)).click();
	util.waitForAngular();
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.approveOrdersTextXpath))),30000);
	browser.actions().mouseMove(element(by.xpath(this.approveOrdersTextXpath))).click().perform().then(function () {
		logger.info("clicked on approve orders link");
	});
};


home.prototype.clickAccountsLink = function () {
    return element(by.xpath(this.accountsLinkTextXpath)).click().then(function () {
        logger.info("clicked accounts link");
    });
};

home.prototype.clickInventoryLink = function () {
    return element(by.xpath(this.inventoryLinkTextXpath)).click().then(function () {
        logger.info("clicked Inventory link");
    });
};

home.prototype.catalogMenuItem = function () {
    return element(by.xpath(this.cataLogLinkTextXpath)).getText().then(function (text) {
        logger.info(text);
        return (text);
    });
}
home.prototype.storeHeaderGetTitle = function () {
    browser.sleep(5000);
    return element(by.xpath(this.storeHeaderTitleXpath)).getText().then(function (text) {
        logger.info(text);
        return (text);
    });
}
home.prototype.storeLandingPageTitle = function () {
    browser.sleep(5000);
    return element(by.xpath(this.storeLandingPageTitleXpath)).getText().then(function (text) {
        logger.info(text);
        return (text);
    });
}
home.prototype.clickCatalogLink = function () {
	browser.sleep(10000);
    return element(by.xpath(this.cataLogLinkTextXpath)).click().then(function () {
        logger.info("clicked catalog link");
    });
};

home.prototype.clickservicesLink = function () {
    return element(by.xpath(this.servicesLinkTextXpath)).click();
};

home.prototype.clickNextLink = function () {
    return element(by.xpath(this.NextLinkTextXpath)).click().then(function () {

        logger.info("clicked Next link");
    });
};

home.prototype.clickCancelLink = function () {
    return element(by.xpath(this.cancelLinkTextXpath)).click();
};

home.prototype.clickcloudbrokerageLink = function () {
    return element(by.xpath(this.brokerageLinkTextXpath)).click();
};
module.exports = home;

