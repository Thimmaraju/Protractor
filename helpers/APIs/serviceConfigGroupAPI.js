"use strict";
var request = require('request');
var extend = require('extend');

var apiCreds = require('../../testData/APIs/APIcreds.json'); 
var serviceConfigGroupsAPIData =  require('../../testData/APIs/serviceConfigGroupAPIData.json');

if(browser.params.url.includes('cb-qa-4')) {
    var username = apiCreds.cbqa4.system.username,
        apikey = apiCreds.cbqa4.system.apikey,
        CbUserInfo = apiCreds.cbqa4.system['Cb-User-Info'],
        CbUserTeamInfo = apiCreds.cbqa4.system['Cb-User-TeamInfo'],
        apiDocVersion = apiCreds.cbqa4.system.apiDocVersion,
        host = apiCreds.cbqa4.host;
}
if(browser.params.url.includes('cb-qa-2')){
    var username = apiCreds.cbqa2.system.username,
        apikey = apiCreds.cbqa2.system.apikey,
        CbUserInfo = apiCreds.cbqa2.system['Cb-User-Info'],
        CbUserTeamInfo = apiCreds.cbqa2.system['Cb-User-TeamInfo'],
        apiDocVersion = apiCreds.cbqa2.system.apiDocVersion,
        host = apiCreds.cbqa2.host;
}


var getserviceConfigGroupsEndpoint = serviceConfigGroupsAPIData.getServiceConfigResponseAPI.endpoint,
    getServiceConfigGroupURL = host+getserviceConfigGroupsEndpoint;
    

var headers = {
    'Content-Type': 'application/json',
    'Accept':'application/json',
    'username':username,
    'apikey':apikey,
    'Cb-User-Info':CbUserInfo,
    'Cb-User-TeamInfo':CbUserTeamInfo,
    'apiDocVersion' : apiDocVersion
}
function getServiceConfigGroupAPI(){
    return new Promise((resolve, reject) => {
        var options = {
            url:getServiceConfigGroupURL,
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

function getserviceConfigGroupAPIResponse(){
    return this.getServiceConfigGroupAPI().then(function(resposeContent)
    {
    //console.log('Res content=' + resposeContent)
    var resbody = JSON.parse(resposeContent);
    //var buyerOrdersFromAPI = resbody.length;
    console.log(resbody);
    return resbody;
    
    //console.log('hello Phuong length   '+ resbody.length);
    // for(var i=0; i<resbody.length; i++) {
    //     if(resbody[i].hasOwnProperty("orderNumber")) {
    //         console.log('hello Phuong   '+i);
    //     }
    // }
    //return buyerOrdersFromApi;
    });
}

module.exports = {
    getServiceConfigGroupAPI:getServiceConfigGroupAPI,
    getserviceConfigGroupAPIResponse : getserviceConfigGroupAPIResponse
};