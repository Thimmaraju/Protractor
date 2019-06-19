"use strict";

var request = require('request');
var util = require('../util.js');

var txtURL, strDateTime;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();


function getCurrentDateTime() {
    return new Promise((resolve, reject) => {
        try {
            var now = new Date();
            strDateTime = now.toJSON(now.setHours((now.getHours())));
            logger.info('getCurrentDateTime: ' + strDateTime);
            resolve(strDateTime);
        } catch (e) {
            reject('Error in getCurrentDateTime: ', e);
        }
    });
}

function getTestSystemAPIUrl () {
    return new Promise((resolve, reject) => {
        if (browser.params.url) {
            var strSplit = browser.params.url.toString().split(".gravitant");
            if (strSplit[0].includes('cb-qa-3')){
                logger.info('Test system API URL is: '+strSplit[0]+ "-api.gravitant.net:8443");
                resolve(strSplit[0] + "-api.gravitant.net:8443");
            }else {
                logger.info('Test system API URL is: '+strSplit[0]+ "-api.gravitant.net");
                resolve(strSplit[0] + "-api.gravitant.net");
            }
            logger.info('Test system API URL is: '+strSplit[0]+ "-api.gravitant.net");
        } else {
            reject("Failed to generate test-system api gateway. could not" +
                " resolve url");
        }
    });
};

function setCreateOrderURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            if (url === null) {
                reject(`Received a Null parameter: \n url: ${url}`)
            };

            txtURL = url
                + '/api/cart/services/v3/addtocart' ;
            logger.info('getCreateOrderEndpoint: ' + txtURL);
            resolve(txtURL);
        }).catch((errorMessage) => {
            reject(`In setCreateOrderURL of apiUtils: ${errorMessage}`);
        });
    });
}

function getProviderId(provider, teamId) {
    return new Promise((resolve, reject) => {
        var providerHeader;
        getTestSystemAPIUrl().then(async function (url) {
            if (url === null) {
                reject(`Received a Null parameter: \n url: ${url}`)
            };

            txtURL = url
                + `/cb-credential-service/api/v1.0/provider_accounts?provider_code=["${provider}"]&team="${teamId}"` ;
            logger.info('setProviderCodeURL: ' + txtURL);

            providerHeader ={
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };

            await getOptions(txtURL, providerHeader).then(function(providerOptions){
                request.get(providerOptions, async function (err, httpResponse, body) {
                    if (err) {
                        logger.error(`Error getting Provider Code: ${JSON.stringify(err)}`)
                    } else {
                        logger.info(`The body is : ${body}`);
                        if (body[0].id == undefined) {
                            logger.error(`There is not a provider id for ${provider} on team ${teamId}`);
                            resolve('');
                        } else {
                            logger.info(`Called with: \n${txtURL}\n${JSON.stringify(providerHeader)}`);
                            body = JSON.parse(body);
                            logger.info(`Provider id: ${body[0].id}`);
                            resolve(body[0].id);
                        }
                    }
                });
            });
        }).catch((errorMessage) => {
            reject(`In getProviderId of apiUtils: ${errorMessage}`);
        });
    });
}

function setApproveOrderURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            if (url === null) {
                reject(`Received a Null parameter: \n url: ${url}`)
            };

            txtURL = url
                + '/api/orderWorkFlow/v2' ;
            logger.info('getApproveOrderEndpoint: ' + txtURL);
            resolve(txtURL);
        }).catch((errorMessage) => {
            reject(`In setApproveOrderURL of apiUtils: ${errorMessage}`);
        });
    });
}

function getOptions(url, collHeaders, jsonPayload) {
    return new Promise((resolve, reject) => {
        if (url === null || collHeaders === null || jsonPayload === null ) {
            reject(`Received a Null parameter: \n url: ${url} \n collHeaders: ${JSON.stringify(collHeaders)} \n jsonPayload: ${JSON.stringify(jsonPayload)}`)
        };

        logger.info('txtURL: ' + url);
        //logger.info('collHeaders: ' + JSON.stringify(collHeaders));
        //logger.info('jsonPayload: ' + JSON.stringify(jsonPayload));

        var objHeaders = {
            url: url,
            headers: collHeaders,
            body: JSON.stringify(jsonPayload)
        };
        logger.info("objHeaders: "+JSON.stringify(objHeaders));
        //logger.info('CollHeaders in getOptions of apiUtil: ' +
        // JSON.stringify(collHeaders));
        //console.log('tempPayload: '+JSON.stringify(tempPayload));
        resolve(objHeaders);
    }).catch((errorMessage) => {
        reject(`In getOptions of apiUtils: ${errorMessage}`);
    });
}

function exeRequest(opt) {
    return new Promise((resolve, reject) => {
        //logger.info('Calling get with ', JSON.stringify(opt));
        logger.info("Executing rest-post on "+JSON.stringify(opt))
        request.post(opt, function (err, httpResponse, body) {
            if (err || httpResponse.statusCode >= 400) {
                logger.error("Error: http response is "+httpResponse.statusCode);
                logger.error("\n The error (if there was one) in the API call: " + err);
                logger.error(`\n httpResponse is ${JSON.stringify(httpResponse)}`);
                //logger.info("\n Error message: " + JSON.stringify(body));
                const reason = new Error('In exeRequest of apiUtil: API call failed' +
                    ' error: ' + err);
                reject(reason);
            } else {
                resolve(body);
            }
        });
    });
}

function exeRequestDelete(opt) {
    return new Promise((resolve, reject) => {
        //logger.info('Calling get with ', JSON.stringify(opt));
        request.delete(opt, function (err, httpResponse, body) {
            if (err || httpResponse.statusCode >= 400) {
                logger.error("Error: http response is "+httpResponse.statusCode);
                logger.error("\n The error (if there was one) in the API call: " + err);
                logger.error(`\n httpResponse is ${JSON.stringify(httpResponse)}`);
                //logger.info("\n Error message: " + JSON.stringify(body));
                const reason = new Error('In exeRequest of apiUtil: API call failed' +
                    ' error: ' + err);
                reject(reason);
            } else {
                resolve(body);
            }
        });
    });
}

function setUserApikey(username) {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(async function (testSystemAPIGateway) {
            var userEndpointForApikey = '/authorization/v1/user/key/' + username;
            var admnApikey;
            var userHeaders = {
                'username': browser.params.sysuserid,
                'apikey': browser.params.sysapikey
            };

            logger.info('Here are the userHeaders', JSON.stringify(userHeaders));
            var userOptions = {
                url: testSystemAPIGateway + userEndpointForApikey,
                headers: userHeaders
            };
            logger.info('userOptions', JSON.stringify(userOptions));

            await request.get(userOptions, async function (err, httpResponse, body) {
                logger.info(`get request with body ${JSON.stringify(body)} \n for user ${username}`);
                if (JSON.stringify(body).includes('doesn\'t exist')) {

                    logger.info('Api-key for ' + username
                        + ' is not found. \nGenerating apikey.');
                    //reject(`The API-key for ${username} was not found. `);
                } else {
                    try {
                        var objResp = JSON.parse(body);
                        logger.info('objResp', objResp);
                        admnApikey = objResp.key;
                        logger.info('admnApikey', admnApikey);
                        logger.info("User API Key for "+username+": "+
                            admnApikey);
                        resolve(objResp);
                    } catch (e) {
                        reject("Error in setTestUserApikey of createOrderAsAdmin ", e);
                    }
                    logger.info('bpdy', JSON.stringify(body));
                    var objResp = JSON.parse(body);
                    logger.info('objResp', objResp);
                    admnApikey = objResp.key;
                    logger.info('admnApikey', admnApikey);
                    logger.info("User API Key for " + username + ": " +
                        admnApikey);
                    resolve(objResp);
                };

                var userPOSTEndpointForApikey = '/authorization/v1/user/key/' + username;
                var userPOSTHeaders = {
                    'username': browser.params.sysuserid,
                    'apikey': browser.params.sysapikey,
                    'Content-Type': 'application/json'
                };
                var userPOSTOptions = {
                    url: testSystemAPIGateway + userPOSTEndpointForApikey,
                    headers: userPOSTHeaders,
                    body: {
                        "type": "portaluser"
                    },
                    json: true
                };
                await request.post(userPOSTOptions, function (err, httpResponse, body) {

                    if (!JSON.stringify(body).includes('already exist')) {
                        var objResp = JSON.parse(JSON.stringify(body));
                        admnApikey = objResp.key;
                        logger.info("User API Key for " + username + ": " +
                            admnApikey);
                    }
                });
            });
        }).catch((errorMessage) => {
            logger.error(`In setUserApikey of apiUtils: ${errorMessage}`);
        });
    });
}

module.exports = {
    getCurrentDateTime:getCurrentDateTime,
    getTestSystemAPIUrl:getTestSystemAPIUrl,
    setCreateOrderURL:setCreateOrderURL,
    setApproveOrderURL:setApproveOrderURL,
    getOptions:getOptions,
    exeRequest:exeRequest,
    exeRequestDelete:exeRequestDelete,
    setUserApikey: setUserApikey,
    getProviderId:getProviderId
};