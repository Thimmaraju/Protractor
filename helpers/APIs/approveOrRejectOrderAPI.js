"use strict";

var objCollHeaders;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();
var apiUtil = require('./apiUtil.js');

function apiApproveOrRejectOrder(payloadObject) {
    return new Promise((resolve, reject) => {
        apiUtil.setApproveOrderURL().then(async function (url) {
            browser.sleep(10000);
            console.log(`Calling setUserApikey with  ${url}`);

            logger.info(`Calling setUserApikey with  ${JSON.stringify(payloadObject)}`);

            logger.info(`Payload object:  ${JSON.stringify(payloadObject)}`);

            var apikeyForApprover;
            if ((payloadObject.userId).includes('cbtechnicalapprover')) {
                apikeyForApprover = browser.params.apikeycbtechnicalapprover;
            } else if ((payloadObject.userId).includes('cbfinancialapprover')) {
                apikeyForApprover = browser.params.apikeycbfinancialapprover;
            }

            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': payloadObject.userId,
                'apikey': apikeyForApprover,
                'Cb-User-TeamInfo': payloadObject.teamId,
                'Cb-User-Info': payloadObject.userId
            };
            //logger.info(`objCollHeaders:  ${JSON.stringify(objCollHeaders)}`);

            //logger.info(`API key is ${userObject.key}`);
            //console.log('\n\n\nobjCollHeaders: ' + JSON.stringify(objCollHeaders)_);
            await apiUtil.getOptions(url, objCollHeaders, payloadObject).then(async function (options) {

                await apiUtil.exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    logger.info("Order approve/reject result : " + JSON.stringify(parsedBody));
                    logger.info("With Order with id: " + payloadObject.orderId);

                    resolve(parsedBody);
                });
            });


        }).catch((errorMessage) => {
            reject(`In apiApproveOrRejectOrder of approveOrRejectOrderAPI: ${errorMessage}`);
        });
    });
}

module.exports = {
    apiApproveOrRejectOrder: apiApproveOrRejectOrder
};