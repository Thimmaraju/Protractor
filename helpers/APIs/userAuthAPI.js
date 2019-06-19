"use strict";
//Unused variable "btoa" commented. 
//var btoa = require('btoa');
var request = require('request');
var extend = require('extend');

var apiCreds = require('../../testData/APIs/APIcreds.json');
var userAuthAPIdata =  require('../../testData/APIs/userAuthAPIData.json'); 
var env = require('../../testData/env.json');



function getUsers(){
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

    var getUserEndpoint = userAuthAPIdata.defaultauthservice.getuser.endpoint,
        uid = userAuthAPIdata.defaultauthservice.getuser.uid,
        getUserURL = host+getUserEndpoint+uid;

    var headers = {
        'Content-Type': 'application/json',
        'Accept':'application/json',
        'username':username,
        'apikey':apikey
    }

    return new Promise((resolve, reject) => {
        var options = {
            url:getUserURL,
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

function getUserTeams() {
    var endpointAddon = userAuthAPIdata.defaultauthservice.getUserTeam.endpoint;
    
    if(browser.params.env == undefined){
        console.error("The environment variable is not set");
        return
    }

    var tmpUsername = env[browser.params.env].system.username;
    var tmpEndpoint = env[browser.params.env].apiurl + endpointAddon + '=' + tmpUsername;
    
    // This is using the 'sysadmin' creds because this is the only one with admin previleges
    // The individual usernames and apikey doesn't have the authorization to access such endpoints
    var headers = {
        'Accept':'application/json',
        'Username':'sysadmin',
        'Apikey':'f69b2c45-a9ad-5a45-85ca-ee5fdd7e6ff0'
    }

    return new Promise((resolve, reject) => {
        var options = {
            uri:tmpEndpoint,
            headers: headers,
            rejectUnauthorized: false     //this is needed to avoid 'self signed certificate' error
        };

        request.get(options, function(error, response, message){
            console.log("Done getting teams :" + tmpEndpoint);
            if(error ||response.statusCode >= 400) {
                console.log("There is error in the API call :" + error);
                console.log("message.statusCode :" + response.statusCode);
                const reason = new Error('Getting teams API call error: ' + error);
                reject(reason);
            } else {
                resolve(JSON.parse(message));
            }
        });
    });
}

function extractTeams(data) {
    var teams = [];
    if( data && data.contexts ) {
        data.contexts.forEach(context => {
            teams.push(context.teamcode);
        });
    }
    return teams;
}

function updateUser(payload){
    //function to perform a PUT operation on the defaultaputh user api service
    return new Promise((resolve, reject) => {
        var updateUserEndpoint = userAuthAPIdata.defaultauthservice.updateuser.endpoint;
        //payload = JSON.parse(payload);
        var uid = payload.uid;
        var updateUserURL = host+updateUserEndpoint+uid;
        //console.log(updateUserURL);
        var options = {
            url:updateUserURL,
            headers:headers,
            body:payload,
            json:true
        };
        request.put(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(body);
        });
    });
}


 var updateUserPayloadWithAllData = userAuthAPIdata.defaultauthservice.updateuser.payloadwithalldata;
 updateUser(updateUserPayloadWithAllData).then(function(resposeContent){
     console.log(resposeContent)
});


module.exports = {
    extractTeams: extractTeams,
    getUsers:getUsers,
    getUserTeams: getUserTeams,
    updateUser:updateUser
};

