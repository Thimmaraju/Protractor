"use strict";

var extend = require('extend');
var url = browser.params.url;

var EC = protractor.ExpectedConditions;

var defaultConfig = {
    pageUrl:                      url + '/fulfillment', 
};

function services(selectorConfig) {
    if (!(this instanceof services)) {
        return new services(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}


services.prototype.open = function()
{
   browser.get(this.pageUrl);
};


module.exports = services;