var icdUrl = require('../../testData/icdTestData.json');
var extend = require('extend');
var icdLoginObj = JSON.parse(JSON.stringify(icdUrl.icdPortalParameters));
var srNumber;
var url = icdLoginObj.url;
var EC = protractor.ExpectedConditions;

global.isAngularApp = function (flag) {
    browser.ignoreSynchronization = !flag;
};

var defaultConfig = {

    serviceRequestCatalogCss:			'#mea59820d_ns_menu_SERVCAT_MODULE_a_tnode',
    serviceRequestCss:					'#mea59820d_ns_menu_SERVCAT_MODULE_sub_changeapp_SR_a_tnode',
    searchForServiceRequestNumberCss:	'[id^="m6a7dfd2f_tfrow_[C:1]_txt-tb"]',
    serviceRequestStatusCss:            '[id^="m6a7dfd2f_tdrow_[C:8]-c[R:0]"]',
    serviceReqHeaderCss:                '#titlebar-tb_appname',
    logOut:                             '#titlebar_hyperlink_9-lbsignout'
};


function icd(selectorConfig) {
    if (!(this instanceof icd)) {
        return new icd(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

icd.prototype.open = function () {
    browser.get(icdLoginObj.url);
};



//*************************** Wrapper Function  **********************************

icd.prototype.getSRStatusICDPortal = function (srNumber) {
    isAngularApp(false);
    this.open();
    browser.sleep(10000);
    element(by.css("#j_username")).clear();
    element(by.css("#j_username")).sendKeys(icdLoginObj.username);
    element(by.css("#j_password")).clear();
    element(by.css("#j_password")).sendKeys(icdLoginObj.password);
    element(by.css("#loginbutton")).click();
    this.clickServiceCatalog();
    browser.sleep(5000);
    this.searchForServiceRequest(srNumber);
    browser.sleep(2000);
    this.getServiceRequestStatus();
}

//*************************** Functions for Clicking Tab links **********************************

// This function used to get header name in ICD portal
icd.prototype.getHeaderName = function () {
    return element(by.css(this.serviceReqHeaderCss)).getText().then(function (text) {
        console.log(text);
        return text;
    })

};

icd.prototype.clickSignOutLink = function () {
    return browser.actions().mouseMove(element(by.css(this.logOut))).click().perform();
};


icd.prototype.clickServiceCatalog = function () {
    browser.wait(EC.visibilityOf(element(by.css(this.serviceRequestCatalogCss))), 10000)
    element(by.css(this.serviceRequestCatalogCss)).click();
    return element(by.css(this.serviceRequestCss)).click();
};

icd.prototype.searchForServiceRequest = function (srNumber) {
    var elem = element(by.css(this.searchForServiceRequestNumberCss));
    elem.clear();
    elem.sendKeys(srNumber);
    elem.sendKeys(protractor.Key.ENTER);

};

icd.prototype.getServiceRequestStatus = function () {
    browser.sleep(1000);
    //browser.refresh() is intermittently failing testcases in  by throwing error "No Active Session ID found." Commenting the refresh command for now.
    return element(by.css(this.serviceRequestStatusCss)).getText().then(function (text) {
        console.log(text);
        return text;

    })
};

module.exports = icd;