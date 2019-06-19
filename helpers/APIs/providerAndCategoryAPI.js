"use strict";
var request = require('request');
var extend = require('extend');

var apiCreds = require('../../testData/APIs/APIcreds.json');
var providerAPIData = require('../../testData/APIs/providerAPIData.json');
var categoryAPIData = require('../../testData/APIs/categoryAPIData.json');

var username, apikey, CbUserInfo, CbUserTeamInfo, host;
if (browser.params.url.includes('cb-qa-3')) {
    username = apiCreds.cbqa3.system.username;
    apikey = apiCreds.cbqa3.system.apikey;
    CbUserInfo = apiCreds.cbqa3.system['Cb-User-Info'];
    CbUserTeamInfo = apiCreds.cbqa3.system['Cb-User-TeamInfo'];
    host = apiCreds.cbqa3.host;
} else if (browser.params.url.includes('cb-qa-2')) {
    username = apiCreds.cbqa2.system.username;
    apikey = apiCreds.cbqa2.system.apikey;
    CbUserInfo = apiCreds.cbqa2.system['Cb-User-Info'];
    CbUserTeamInfo = apiCreds.cbqa2.system['Cb-User-TeamInfo'];
    host = apiCreds.cbqa2.host;
} else if (browser.params.url.includes('cb-qa-4')) {
    username = apiCreds.cbqa4.system.username;
    apikey = apiCreds.cbqa4.system.apikey;
    CbUserInfo = apiCreds.cbqa4.system['Cb-User-Info'];
    CbUserTeamInfo = apiCreds.cbqa4.system['Cb-User-TeamInfo'];
    host = apiCreds.cbqa4.host;
} else if (browser.params.url.includes('cb-qa-1')) {
    username = apiCreds.cbqa1.system.username;
    apikey = apiCreds.cbqa1.system.apikey;
    CbUserInfo = apiCreds.cbqa1.system['Cb-User-Info'];
    CbUserTeamInfo = apiCreds.cbqa1.system['Cb-User-TeamInfo'];
    host = apiCreds.cbqa1.host;
} else if (browser.params.url.includes('cb-customer1')) {
    username = apiCreds.cbcustomer1.system.username;
    apikey = apiCreds.cbcustomer1.system.apikey;
    CbUserInfo = apiCreds.cbcustomer1.system['Cb-User-Info'];
    CbUserTeamInfo = apiCreds.cbcustomer1.system['Cb-User-TeamInfo'];
    host = apiCreds.cbcustomer1.host;
}



var getProviderEndpoint = providerAPIData.catalog.getProvidersFromAPI.endpoint,
    getProviderURL = host + getProviderEndpoint,
    getCategoryEndpoint = categoryAPIData.catalog.getCategoriesFromAPI.endpoint,
    getCategoryURL = host + getCategoryEndpoint;

var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'username': username,
    'apikey': apikey
}

function getProvidersFromAPI() {
    return new Promise((resolve, reject) => {
        var options = {
            url: getProviderURL,
            headers: headers
        };
        request.get(options, function (err, httpResponse, body) {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(body);
        });
    });
}

function getProvidersFromAPIResponse() {
    return this.getProvidersFromAPI().then(function (resposeContent) {
        //console.log('Res content=' + resposeContent)
        var resbody = JSON.parse(resposeContent);
        var providersFromApi = resbody.result.providers_list;
        //display the no of providers count
        //console.log('providers count in API : ' + providersFromApi.length);
        //return providersFromApi.length;
        return providersFromApi;
    });
}

function getCategoriesFromAPI() {
    return new Promise((resolve, reject) => {
        var options = {
            url: getCategoryURL,
            headers: headers
        };
        request.get(options, function (err, httpResponse, body) {

            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(body);

        });
    });
}

function getCategoriesFromAPIResponse() {
    return this.getCategoriesFromAPI().then(function (resposeContent) {
        //console.log('Res content=' + resposeContent)
        var resbody = JSON.parse(resposeContent);
        var categoriesFromApi = resbody.result.categories;
        //display the no of categories count
        //console.log('Categories count in API : ' + categoriesFromApi.length);
        //return categoriesFromApi.length;
        return categoriesFromApi;
    });
}

module.exports = {
    getProvidersFromAPI: getProvidersFromAPI,
    getProvidersFromAPIResponse: getProvidersFromAPIResponse,
    getCategoriesFromAPI: getCategoriesFromAPI,
    getCategoriesFromAPIResponse: getCategoriesFromAPIResponse
};