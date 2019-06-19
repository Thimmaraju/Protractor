"use strict";

var request = require('request');
var util = require('../util.js');
// var now = new Date();
var objCollHeaders, txtURL, strDateTime;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();
var apiUtil = require('./apiUtil.js');
var tempPayload;


function apiCreateOrderAsCurrUser(orderPayload) {
    return new Promise((resolve, reject) => {
        apiUtil.setCreateOrderURL().then(async function (url) {
            //console.log('orderPayload: '+JSON.stringify(orderPayload));
            tempPayload = JSON.parse(JSON.stringify(orderPayload));
            tempPayload.serviceInstanceName = tempPayload.serviceInstanceName +
                util.getRandomString(4);
            tempPayload.teamId = browser.params.userteaminfo;
            tempPayload.userId = browser.params.username;
            tempPayload.submittedBy = browser.params.username;

            //console.log('\n\n\ntempPayload: '+ JSON.stringify(tempPayload));

            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey,
                'Cb-User-TeamInfo': browser.params.userteaminfo,
                'Cb-User-Info': browser.params.username
            };
            logger.info(`Provider code from JSON : ${tempPayload.providerCode}`);
           await apiUtil.getProviderId(tempPayload.providerCode, browser.params.userteaminfo).then(async function(providerCode){
                tempPayload.providerAccountRefId = providerCode;
                logger.info(`Provider code is : ${JSON.stringify(providerCode)}`);

               //logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
               await apiUtil.getOptions(url, objCollHeaders, tempPayload).then(async function (options) {
                   await apiUtil.exeRequest(options).then(function (resp) {
                       var parsedBody = JSON.parse(resp);
                       //logger.info('getBuyerAllOrdersFromAPIResponse= ' + JSON.stringify(resp));
                       logger.info("Created Order with id: "+parsedBody.orderNumber);
                       resolve(parsedBody);
                   });
               });
            });
        }).catch((errorMessage) => {
            reject(`In apiCreateOrderAsCurrUser of createOrderAsCurrUserAPI: ${errorMessage}`);
        });

    });
}



module.exports = {
    apiCreateOrderAsCurrUser: apiCreateOrderAsCurrUser
};