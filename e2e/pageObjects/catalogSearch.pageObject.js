"use strict";

var extend = require('extend');
var url = browser.params.url;

var defaultConfig = {
	pageUrl:                      		url + '/storeFront/main',
    searchMagnifier:					'div.bx--search__wrapper .bx--search-magnifier',
    hiddenSearchCloseIcon:				'div.bx--search__wrapper .bx--search-close.bx--search-close--hidden',
    searchCloseIcon:					'div.bx--search__wrapper .bx--search-close',
    searchElement:						'input.bx--search-input'
};

function catalogSearch(selectorConfig) {
    if (!(this instanceof catalogSearch)) {
        return new catalogSearch(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

catalogSearch.prototype.getSearchMagnifier = function() {
    return element(by.css(this.searchMagnifier));
};

catalogSearch.prototype.getHiddenSearchCloseIcon = function() {
    return element(by.css(this.hiddenSearchCloseIcon));
};

catalogSearch.prototype.getSearchCloseIcon = function() {
    return element(by.css(this.searchCloseIcon));
};

catalogSearch.prototype.getSearchElement = function() {
    return element(by.css(this.searchElement));
};





module.exports = catalogSearch;
