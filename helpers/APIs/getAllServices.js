"use strict";

var objCollHeaders, txtURL;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();
var apiUtil = require('./apiUtil.js');
var admnUsername = 'cbadmn@outlook.com';

function getAllServices() {
    return new Promise((resolve, reject) => {
        apiUtil.getTestSystemAPIUrl().then(async function (url) {
            logger.info("domain url: " + url);
            var txtURL = url + '/catalog/v3/services?limit=500';
            logger.info('API endpoint to get all services: ' + txtURL);

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
                await apiUtil.exeRequest(options).then(async function (resp) {
                    logger.info("Response from post: " + resp);
                    resolve(resp);
                });
            });
        });
    });
}



module.exports = {
    getAllServices: getAllServices
}