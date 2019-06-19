"use strict";

var extend = require('extend');
var url = browser.params.url;
var util = require('../../helpers/util.js');
var logGenerator = require("../../helpers/logGenerator.js"),
logger = logGenerator.getApplicationLogger();
var EC = protractor.ExpectedConditions;

var defaultConfig = {
    buttonTextConfigure: 'Configure',
    buttonTextCancel: 'Cancel',
    titleLabelCss: '.details-title',
    linkTextLinkToProviderSite: 'Link to providers site',
    breadCrumbMenucatalogLink: '.bx--link',
    catalogNameLabelCss: '.bx--about__title--name'
};

function catalogDetails(selectorConfig) {
    if (!(this instanceof catalogDetails)) {
        return new catalogDetails(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}


catalogDetails.prototype.isDisplayedConfigureButtonOnDetails = function () {
    return element(by.buttonText(this.buttonTextConfigure)).isDisplayed();
};
catalogDetails.prototype.clickConfigureButtonCatalogDetailsPage = function () {
    return element(by.buttonText(this.buttonTextConfigure)).click();
};
catalogDetails.prototype.isDisplayedCancelButtonCatalogDetailsPage = function () {
    return element(by.buttonText(this.buttonTextCancel)).isDisplayed();
    util.waitForAngular();
};
catalogDetails.prototype.clickCancelButtonCatalogDetailsPage = function () {
    //browser.refresh().then(function () {
    	//browser.sleep(5000);
            //browser.wait(EC.visibilityOf(element(by.buttonText(this.buttonTextCancel))), 30000);
       // }
   // );

    return element(by.buttonText(this.buttonTextCancel)).click();
    util.waitForAngular();
};

catalogDetails.prototype.getTextFeaturesLabel = function () {
    return element.all(by.css(this.titleLabelCss)).get(0).getText().then(function (text) {
        logger.info("Text in Catalog details page is : " + text)
        return text;
    });
};
catalogDetails.prototype.getServiceName = function () {
    return element(by.css(this.catalogNameLabelCss)).getText().then(function (text) {
        return text;
    });

};

catalogDetails.prototype.isPresentFeaturesLabel = function () {
    return element.all(by.css(this.titleLabelCss)).get(0).isPresent();
};

catalogDetails.prototype.getTextDetailsLabel = function () {
    return element.all(by.css(this.titleLabelCss)).get(1).getText().then(function (text) {
        logger.info("Text in Catalog details page is : " + text)
        return text;
    });
};

catalogDetails.prototype.isPresentDetailsLabel = function () {
    return element.all(by.css(this.titleLabelCss)).get(1).isPresent();
};


catalogDetails.prototype.getTextKnowMoreLabel = function () {
    return element.all(by.css(this.titleLabelCss)).get(2).getText().then(function (text) {
        logger.info("Text in Catalog details page is : " + text)
        return text;
    });
};

catalogDetails.prototype.isPresentKnowMoreLabel = function () {
    return element.all(by.css(this.titleLabelCss)).get(2).isPresent();
};

catalogDetails.prototype.clickLinkToProviderSite = function () {
    return element(by.linkText(this.linkTextLinkToProviderSite)).click();
};

catalogDetails.prototype.isPresentLinkToProviderSite = function () {
    return element(by.linkText(this.linkTextLinkToProviderSite)).isPresent();
};
catalogDetails.prototype.clickCatalogFromBreadCrumbNav = function () {
    return element(by.css(this.breadCrumbMenucatalogLink)).click();
};
module.exports = catalogDetails;