/*
 #*===================================================================
 #*
 #* Licensed Materials - Property of IBM
 #* IBM Cloud Brokerage
 #* Copyright IBM Corporation 2017. All Rights Reserved.
 #*
 #*===================================================================
 */

/**
 * Helper methods for search component testing
 */
"use strict";

var SearchCatalog = require('../e2e/pageObjects/catalogSearch.pageObject.js');
var utilSearchAPI = require('../helpers/APIs/searchCatalogAPI');
var util = require('./util.js');
var logGenerator = require("./logGenerator.js");
var logger = logGenerator.getApplicationLogger();


var catalogSearch = new SearchCatalog();


function searchFromUI(sampleText) {
    return new Promise((resolve, reject) => {
            //element(by.css('input#search__input-0.bx--search-input')).clear();
            catalogSearch.getSearchElement().clear();
            browser.sleep("1000");
            catalogSearch.getSearchElement().sendKeys(sampleText);
            browser.sleep("1000");
            element.all(by.css('article.bx--card')).then(function (services) {
                //element.all(by.repeater('item of serviceItems')).count().then(function(size){
                //servicesIdsFromUi = services;
                console.log("The total number of elements for ( " + sampleText + " ) = " + services.length);
                //console.log("Services : " + services.valueOf().toString());
                resolve(services);
            });
            //resolve(servicesIdsFromUi);
        }
    );
}

function getServiceIDsfromUI() {
    var serviceIdsFromUI = [];
    var Test = "";
    return new Promise((resolve, reject) => {
        element.all(by.css('.hidden-service-ID')).map(function (elm) {
            elm.getAttribute('textContent').then((text) => {
                //console.log("ID = " + text);
                serviceIdsFromUI.push(text);

            });


        }).then(() => {
            resolve(serviceIdsFromUI);
        });

    });
//         element.all(by.css('.hidden-service-ID')).then(function (arrElm) {
//             arrElm.forEach(function (elm) {
//                 serviceIdsFromUI.push(elm.getText());
//             });
//             console.log("This is all IDs : " +Object.values(serviceIdsFromUI));
//             // for (var i = 0; i<serviceIdsFromUI.length;i++){
//             //     console.log("This is Service ID "+i+" from UI: " +serviceIdsFromUI[i]);
//             //
//             // }
//             // serviceIdsFromUI.forEach(function(item, index, array){
//             //     console.log(item, index)
//             //     }
//             //
//             // )
//             resolve(serviceIdsFromUI);
//         });
    //});
}

function getServiceIDsfromAPI(ServicesFromAPI) {
    var serviceIdsFromAPI = [];
    return new Promise((resolve, reject) => {
        serviceIdsFromAPI = ServicesFromAPI.map(service => service.serviceId);
        browser.sleep("1000");
        console.log("Service IDs from API = " + serviceIdsFromAPI);
        resolve(serviceIdsFromAPI);
    });
}

function validateSearchResults(searchText) {
    var collServicesFromUI = [];
    var collServicesFromAPI = [];
    var collServIdsFromUI = [];
    var collServIdsFromAPI = [];
    return new Promise((resolve, reject) => {
        collServicesFromAPI = utilSearchAPI.getServicesFromAPI(searchText).then(async function (paramcollServicesFromAPI) {
            collServIdsFromAPI = await getServiceIDsfromAPI(paramcollServicesFromAPI).then(async function (paramcollServIdsFromAPI) {
                collServicesFromUI = await searchFromUI(searchText)
                  collServIdsFromUI = await getServiceIDsfromUI().then(function (paramcollServIdsFromUI) {
                    browser.sleep(1000);
                    console.log("ServiceIDs from UI:" + paramcollServIdsFromUI.length)
                    //.then(function (paramcollServIdsFromUI) {
                    if (paramcollServIdsFromUI.length != paramcollServIdsFromAPI.length) {
                        console.log("Length mismatch");
                        return resolve(false);
                    }

                    paramcollServIdsFromAPI.forEach(idFromAPI => {
                        console.log("Comparing IDS from UI and API ... " + idFromAPI);
                        // the whole IDS are not matching if at least one of them is not matching
                        if (!paramcollServIdsFromUI.includes(idFromAPI)) {
                            //console.log("Couldn't find API-Service-ID " + idFromAPI + " in UI-Service-IDs collection.");
                            return resolve(false);
                        }
                    });
                    return resolve(true);
                });
                //});
            });
        });
    });
}


// function searchResultShouldMatchIds(searchText) {
//     var serviceIdsFromUI = [];
//     var serviceIdsFromAPI = [];
//     var utilSearchAPI = require('../helpers/APIs/searchCatalogAPI.js');
//     return new Promise(
//         (resolve, reject) => {
//             utilSearchAPI.searchFromAPI(searchText).then(function (servicesFromAPI) {
//                 serviceIdsFromAPI = servicesFromAPI.map(service => service.serviceId);
//                 browser.sleep("1000");
//                 console.log("API IDs = " + serviceIdsFromAPI);
//                 // From the UI
//
//                 searchFromUI(searchText).then(async function (servicesFromUI) {
//                     // don't need the servicesFromUI, just select all elements of hidden-service-ID
//                     await element.all(by.css('.hidden-service-ID')).map(function (elm) {
//                         elm.getAttribute('textContent').then((text) => {
//                             //console.log("ID = " + text);
//                             serviceIdsFromUI.push(text);
//                             return text
//                         });
//                     }).then(() => {
//                         console.log("This is all IDs : " + serviceIdsFromUI);
//
//                         // check first if both have the same number of services
//                         if (servicesFromUI.length != servicesFromAPI.length) {
//                             console.log("Length mismatch");
//                             return resolve(false);
//                         }
//                         // then, check if the IDs from API are the exact match with the IDs from UI
//                         console.log("ServiceIdsFromUI = " + serviceIdsFromUI);
//                         serviceIdsFromAPI.forEach(idFromAPI => {
//                             console.log("Checking now ... " + idFromAPI);
//                             // the whole IDS are not matching if at least one of them is not matching
//                             if (!serviceIdsFromUI.includes(idFromAPI)) {
//                                 console.log("IDs mismatch");
//                                 return resolve(false);
//                             }
//                         });
//                         return resolve(true);
//                     });
//                 })
//             });
//         });
// }


function isSearchCheckingByProviderName(searchText) {
    var serviceName = '';
    var providerName = '';
    var serviceDescription = '';
    var allMatched = true;
    this.searchFromUI(searchText).then(async function (servicesFromUI) {
        await element.all(by.tagName('app-service-card')).each(async (item, index) => {
            providerName = await element.all(by.css('.card-provider-name')).get(index).getText();
            // searchText should be part of providerName of every service listed in the UI
            if (providerName.indexOf(searchText) == -1) {
                allMatched = false;
                console.log("Service at index = " + index + ", providerName = " + providerName + " doesn't match with the search text");
                return false;
            }
        })

    });
    return allMatched;
}

function isSearchCheckingByServiceName(searchText) {
    var serviceName = '';
    var allMatched = true;
    this.searchFromUI(searchText).then(async function (servicesFromUI) {
        await element.all(by.tagName('app-service-card')).each(async (item, index) => {
            serviceName = await element.all(by.css('.card-service-title')).get(index).getText();
            // searchText should be part of servuceName of every service listed in the UI
            if (providerName.indexOf(searchText) == -1) {
                allMatched = false;
                console.log("Service at index = " + index + ", Service Name = " + serviceName + " doesn't match with the search text");
                return false;
            }
        })

    });
    return allMatched;
}

// this.getSearchMagnifier = function() {
//     return element(by.css("div.bx--search__wrapper .bx--search-magnifier"));
// }
//
// this.getHiddenSearchCloseIcon = function() {
//     return element(by.css("div.bx--search__wrapper .bx--search-close.bx--search-close--hidden"));
// }
//
// this.getSearchCloseIcon = function() {
//     return element(by.css("div.bx--search__wrapper .bx--search-close"));
// }
//
// this.getSearchElement = function() {
//     return element(by.css('input.bx--search-input'));
// }


module.exports = {
    searchFromUI: searchFromUI,
    //searchResultShouldMatchIds: searchResultShouldMatchIds,
    validateSearchResults: validateSearchResults,
    isSearchCheckingByProviderName: isSearchCheckingByProviderName,
    isSearchCheckingByServiceName: isSearchCheckingByServiceName
};



    