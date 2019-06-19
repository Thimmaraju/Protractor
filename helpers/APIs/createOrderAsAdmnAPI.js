"use strict";

var request = require('request');
var util = require('../util.js');
var objCollHeaders;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();
var apiUtil = require('./apiUtil.js');
var admnUsername = 'cbadmn@outlook.com';
var admnUserTeamInfo = 'TEAM1';

function apiCreateOrderAsAdmn(orderPayload) {
    return new Promise((resolve, reject) => {
        apiUtil.setCreateOrderURL().then(async function (url) {
            var tempPayload = JSON.parse(JSON.stringify(orderPayload));
            tempPayload.serviceInstanceName = tempPayload.serviceInstanceName +
                util.getRandomString(4);
            //tempPayload.teamId = admnUserTeamInfo;
            tempPayload.userId = admnUsername;
            tempPayload.submittedBy = admnUsername;

            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': admnUsername,
                'apikey': browser.params.apikeycbadmn,
                'Cb-User-TeamInfo': admnUserTeamInfo,
                'Cb-User-Info': admnUsername
            };
            //logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await apiUtil.getProviderId(tempPayload.providerCode, browser.params.userteaminfo).then(async function(providerCode){
                tempPayload.providerAccountRefId = providerCode;
                logger.info(`Provider code is : ${JSON.stringify(providerCode)}`);
                await apiUtil.getOptions(url, objCollHeaders, tempPayload).then(async function (options) {
                    await apiUtil.exeRequest(options).then(function (resp) {
                        var parsedBody = JSON.parse(resp);
                        //logger.info('getBuyerAllOrdersFromAPIResponse= ' + JSON.stringify(resp));
                        logger.info("Created Order with id: " + parsedBody.orderNumber);
                        resolve(parsedBody);
                    }).catch((error1) => {
                        logger.info("exRequest 1", error1);
                    });
                }).catch((error2) => {
                    logger.info("exRequest 2", error2);
                });
            });
        }).catch((errorMessage) => {
            //logger.info(`In setCreateOrderURL of createOrderAsAdmin: ${errorMessage}`);
            reject(`In setCreateOrderURL of createOrderAsAdmin: ${errorMessage}`);

        });
    });
}

module.exports = {
    apiCreateOrderAsAdmn: apiCreateOrderAsAdmn,
};