"use strict";

var request = require('request');
var util = require('../util.js');

var objCollHeaders, txtURL;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();


function getTestSystemAPIUrl () {
    return new Promise((resolve, reject) => {
        if (browser.params.url) {
            var strSplit = browser.params.url.toString().split(".gravitant");
            logger.info('Test system API URL is: '+strSplit[0]+ "-api.gravitant.net");
            resolve(strSplit[0] + "-api.gravitant.net");
        } else {
            reject("Failed to generate test-system api gateway. could not" +
                " resolve url");
        }
    });
};

function getBuyerOrdersDetailsURL(orderID) {
    return new Promise((resolve, reject) => {
        try {
            getTestSystemAPIUrl().then(function (url) {
                txtURL = url
                    + '/api/orders/' + orderID + '/configs' ;
                logger.info('getBuyerOrderDetailsURL: ' + txtURL);
                resolve(txtURL);
            }).catch((errorMessage) => {

            });
        } catch (e) {
            reject("Error in getBuyerOrdersDetailsURL");
        }
    });
}

function getOptions(url, collHeaders) {
    return new Promise((resolve, reject) => {
        if (url === null || collHeaders === null) {
            reject(`In getOptions URL is: \n ${url} \n and collHeaders is ${collHeaders}` )
        } else {
            var objHeaders = {
                url: url,
                headers: collHeaders
            };
            logger.info('CollHeaders: ' + JSON.stringify(collHeaders));
            resolve(objHeaders);
        }

    });
}

function exeRequest(opt) {
    return new Promise((resolve, reject) => {
        request.get(opt, function (err, httpResponse, body) {
            if (err || httpResponse.statusCode >= 400) {
                logger.info("There is error in the API call... :" + err);
                logger.info("Error message: " + JSON.stringify(body));
                const reason = new Error('In exeRequest of orderBuyerDetailsAPI: API call failed' +
                    ' error: ' + err);
                reject(reason);
            }
            resolve(body);
        });
    });
}

function getOrderDetailsVRACentOSFromAPIResponse(orderID) {
    return new Promise((resolve, reject) => {
        if (orderID!== null) {
            getBuyerOrdersDetailsURL(orderID).then(async function (url) {
                objCollHeaders = {
                    'Content-Type': 'application/json',
                    'username': browser.params.username,
                    'apikey': browser.params.testuserapikey
                };
                //logger.info('objCollHeaders in orderDetailsVRACentOSFromAPIResponse: ' + JSON.stringify(objCollHeaders));


                await getOptions(url, objCollHeaders).then(async function (options) {
                    await exeRequest(options).then(function (resp) {
                        var parsedBody = JSON.stringify(resp);
                        //logger.info('getOrderDetailsVRACentOSFromAPIResponse= ' + parsedBody);
                        logger.info("******  Created Order with id: "+parsedBody.orderNumber);
                        resolve(parsedBody);
                    });
                });
            }).catch((errorMessage) => {
                reject(`Error in getOrderDetailsVRACentOSFromAPIResponse: ${errorMessage} `)
            });
        } else {
            reject('OrderId was null');
        }

    });
}

module.exports = {
    getOrderDetailsVRACentOSFromAPIResponse:getOrderDetailsVRACentOSFromAPIResponse
};