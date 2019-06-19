"use strict";

var extend = require('extend');
var url = browser.params.url;
var logGenerator = require("../../helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger();
var EC = protractor.ExpectedConditions;

var defaultConfig = {
    pageUrl: url + '/dashboard', 
    storeTitleOnDashboard: '.title',
    IntroTextOnDashboard: 'div .details',
};

function dashboard(selectorConfig) {
    if (!(this instanceof dashboard)) {
        return new dashboard(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}


dashboard.prototype.open = function()
{
   browser.get(this.pageUrl);
};

dashboard.prototype.clickLetsGetStarted = function()
{
    return element(by.xpath('//a[@class="bordered-link"]')).click();
};

dashboard.prototype.clickPrivacyPolicy = function()
{
    return element(by.css('a#privacy-policy')).click();
}

dashboard.prototype.clickOkInPrivacyPolicy = function()
{
    return element(by.css('#button-privacy-policy-modal_carbon-button_ok')).click();
}

dashboard.prototype.dashboardPageTitle = function () {

    browser.sleep(5000);
    return element(by.css(this.storeTitleOnDashboard)).getText().then(function (text) {
        logger.info('Dasboard page title is: ' + text);
        return (text);
    });
}

dashboard.prototype.dashboardPageIntroText = function () {

    browser.sleep(5000);
    return element(by.css(this.IntroTextOnDashboard)).getText().then(function (text) {
        logger.info('Dasboard Page intro text is: ' + text);
        return (text);
    });
}

/**
 * returns the text as promise, which can be used in expect condition
 */
dashboard.prototype.getIntroText = function() {
    return element(by.css(this.IntroTextOnDashboard)).getText();
}

module.exports = dashboard;
