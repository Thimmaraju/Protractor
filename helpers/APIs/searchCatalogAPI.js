"use strict";
var request = require('request');
var extend = require('extend');

var apiCreds = require('../../testData/APIs/APIcreds.json');
var buyerOrdersAPIData = require('../../testData/APIs/buyerOrdersAPIData.json');


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
}


var searchUrl = host + "/catalog/v3/services";


var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'username': username,
    'apikey': apikey,
    'Cb-User-Info': CbUserInfo,
    'Cb-User-TeamInfo': CbUserTeamInfo
};

function createOptions(txtSearch){
    return new Promise((resolve, reject) => {
        try {
            var fullSearchUrl = searchUrl + "?sortOrder=asc&limit=20&offset=0";
            var searchPayload =
                {
                    providers: [],
                    categories: [],
                    searchText: txtSearch
                };
            var options = {
                uri: fullSearchUrl,
                headers: headers,
                body: searchPayload,
                json: true,
                rejectUnauthorized: false     //this is needed to avoid 'self signed certificate' error
            };
            resolve(options);
        } catch (e) {
            reject("Error in searchCatalogAPI.js function createOptions: ", e);
        }
    });

};

function postToSearchAndGetServices(collOptions){
    var serviceIdsFromAPI = [];
    return new Promise((resolve, reject) => {
        request.post(collOptions, function (err, httpResponse, body) {
            if (err || httpResponse.statusCode >= 400) {
                console.log("There is error in the API call... :" + err);
                console.log("Error message: " + JSON.stringify(body));
                const reason = new Error('Search API call error: ' + err);
                reject(reason);
            } else {
                //console.log("This is just message = " + httpResponse.toString());
                //console.log("Message.body = " + JSON.stringify(body));
                const tmpData = JSON.parse(JSON.stringify(body));
                var servicesFromAPI = tmpData.result.services;
                //console.log("Services: "+JSON.stringify(servicesFromAPI));
                //console.log("Services length from API= "+servicesFromAPI.length);
                resolve(servicesFromAPI);

                // serviceIdsFromAPI = tmpServices.map(service => service.serviceId);
                // browser.sleep("1000");
                // console.log("Service IDs from postToSearchAndGetServices = " + serviceIdsFromAPI);
                // resolve(serviceIdsFromAPI);
            }
        });
    });
}

function getServicesFromAPI(txtSearchString) {
    return new Promise(
        (resolve, reject) => {
            try {
                createOptions(txtSearchString).then(async function (collOptions) {
                    //var serviceIdsListFromAPI = [];
                    var collServicesFromAPI = await postToSearchAndGetServices(collOptions);
                    resolve(collServicesFromAPI);
                }).catch((errorMessage) => {
                    logger.info(`In getServicesFromAPI of searchCatalogAPI.js: ${errorMessage}`);
                });
            } catch (e) {
                reject("Error in searchCatalogAPI.js function getServicesFromAPI: ", e);
            }
        });
};

module.exports = {
    getServicesFromAPI:getServicesFromAPI
};

