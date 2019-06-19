"use strict";
var request = require('request');
var extend = require('extend');

var apiCreds = require('../../testData/APIs/APIcreds.json'); 
var catalogServiceAPIData =  require('../../testData/APIs/catalogServiceAPIData.json');

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

var getServicesEndpoint = catalogServiceAPIData.catalogservice.getallservices.endpoint,
    getServicesURL = host+getServicesEndpoint;
    

var headers = {
    'Content-Type': 'application/json',
    'Accept':'application/json',
    'username':username,
    'apikey':apikey
}
function getAllServicesFromAPI(){
    return new Promise((resolve, reject) => {
        var options = {
            url:getServicesURL,
            headers:headers
        };
        request.get(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(body);
        });
    });
}
function getAllServicesFromAPIResponse(){
            return this.getAllServicesFromAPI().then(function(resposeContent){
            //console.log('Res content=' + resposeContent)
            var resbody = JSON.parse(resposeContent);
            var allServicesFromApi = resbody.result.services;
            //display the no of services count
            return allServicesFromApi;
        });
}
    module.exports = {
    getAllServicesFromAPI:getAllServicesFromAPI,
    getAllServicesFromAPIResponse:getAllServicesFromAPIResponse
};