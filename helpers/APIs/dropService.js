"use strict";

var objCollHeaders, txtURL;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();
var apiUtil = require('./apiUtil.js');
var admnUsername = 'cbadmn@outlook.com';

function dropService(providercode, serviceid) {
    return new Promise((resolve, reject) => {
        apiUtil.getTestSystemAPIUrl().then(async function (url) {
            logger.info("domain url: " + url);
            var txtURL = url + "/catalog/v3/admin/providers/"+providercode+"/services/"+serviceid;
            logger.info('API endpoint to drop service: ' + txtURL);

            if (browser.params.adminusername){
                objCollHeaders = {
                    'username': browser.params.adminusername,
                    'apikey': browser.params.adminapikey
                };
            }else{
                objCollHeaders = {
                    'username': admnUsername,
                    'apikey': browser.params.apikeycbadmn
                };
            }

            await apiUtil.getOptions(txtURL, objCollHeaders, '').then(async function (options) {
                await apiUtil.exeRequestDelete(options).then(async function (resp) {
                    logger.info("Response from delete: " + resp);
                    resolve(resp);
                });
            });
        });
    });
}



module.exports = {
    dropService: dropService
}