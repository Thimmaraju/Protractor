var config = require('./currencyConversionTestData.js'),
    request = require('request'),
    logGenerator = require("./logGenerator.js");
	logger = logGenerator.getApplicationLogger(),
    createError = require('http-errors'),
    apiCreds = require('../testData/env.json'),
    Client = require('node-rest-client').Client;
var Username,Apikey,Host;
if (browser.params.url.includes('cb-qa-6')) {
	Username = apiCreds.cbqa6.system.username;
    Apikey = apiCreds.cbqa6.system.apikey;
}else if(browser.params.url.includes('cb-qa-4-release')){
	Username = apiCreds.cbqa4release.system.username;
    Apikey = apiCreds.cbqa4release.system.apikey;
}
   


// Function to enable ICD OrderTracking flag using get API

var headers = {
		'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Apikey': Apikey,
        'Username': Username
	}


async function changeCurrency(toCurrency) {
	var dataJson = config.setCurrency.data;
    dataJson.currency_code = toCurrency;
    var options = {
		'headers':headers,
        'data': dataJson,
    };
    logger.info(headers);
    var host;
    if (browser.params.url.includes('cb-qa-4-release')) {
    	host = config.lockCurrency.host;
    	host = "cb-qa-4-release-api.gravitant.net";
    }
    else{
    	host = config.lockCurrency.host;
    }
    var path = config.setCurrency.path;
    var url = "https://"+host+path;
    logger.info("PostMan URL for Changing Currency :: "+url);
    var deferred = protractor.promise.defer();
    let client = new Client();
    client.post(url, options, function (data, response) {
    	//var data = JSON.parse(response);
        //logger.info("Received data:: " + data.result);
    	logger.info("-----"+response);
        if (response.statusCode == 201) {
            browser.sleep(5000);
            logger.info(response.statusCode);
            logger.info("Currency Changed to :: "+toCurrency)
             deferred.fulfill(response.statusCode);
            //deferred.fulfill(data.Result);
            return;
        }
    }).on('error', function (e) {
        console.log('problem occured: ' + e.message);
        var tmp = {};
        tmp.message = e.message;
        tmp.statusCode = 500;
        deferred.reject(new Error("Not enabled"));
        return;
    });
    browser.wait(deferred.promise, 50000);
    return deferred.promise;
}

//Function to unlock the currency
async function unlockCurrency(currency) {
    var options = {
		'headers':headers,
        'data': config.lockCurrency.data,
    };
    logger.info(headers);
    var host;
    if (browser.params.url.includes('cb-qa-4-release')) {
    	host = config.lockCurrency.host;
    	host = "cb-qa-4-release-api.gravitant.net";
    }
    else{
    	host = config.lockCurrency.host;
    }
    var path = config.lockCurrency.path;
    path = path + currency;
    var url = "https://"+host+path;
    logger.info("PostMan URL to unlock Currency :: "+url);
    var deferred = protractor.promise.defer();
    let client = new Client();
    client.put(url,options,function (data,response) {
        if (response.statusCode == 204) {
            browser.sleep(5000);
            logger.info(response.statusCode);
            logger.info("Currency unlocked");
            deferred.fulfill(response.statusCode);
            //deferred.fulfill(data.Result);
            return response.statusCode;
        }
    }).on('error', function (e) {
        console.log('problem occured: ' + e.message);
        var tmp = {};
        tmp.message = e.message;
        tmp.statusCode = 500;
        deferred.reject(new Error("Currency not unlocked..."));
        return 0;
    });
    browser.wait(deferred.promise, 50000);
    return deferred.promise;
}

//Function to lock the currency
async function lockCurrency(currency) {
	var dataJson = config.lockCurrency.data;
    dataJson.is_locked = true;
    var options = {
		'headers':headers,
        'data': dataJson,
    };
    logger.info(headers);
    var host;
    if (browser.params.url.includes('cb-qa-4-release')) {
    	host = config.lockCurrency.host;
    	host = "cb-qa-4-release-api.gravitant.net";
    }
    else{
    	host = config.lockCurrency.host;
    }
    var path = config.lockCurrency.path;
    path = path + currency;
    var url = "https://"+host+path;
    logger.info("Postman URL to lock the currency :: "+url);
    var deferred = protractor.promise.defer();
    let client = new Client();
    client.put(url,options,  function (data,response) {
        if (response.statusCode == 204) {
            browser.sleep(5000);
            logger.info(response.statusCode);
            logger.info("Currency locked");
            deferred.fulfill(response.statusCode);
            //deferred.fulfill(data.Result);
            return;
        }
    }).on('error', function (e) {
        console.log('problem occured: ' + e.message);
        var tmp = {};
        tmp.message = e.message;
        tmp.statusCode = 500;
        deferred.reject(new Error("Currency not unlocked..."));
        return;
    });
    browser.wait(deferred.promise, 50000);
    return deferred.promise;
}

module.exports = {
	unlockCurrency: unlockCurrency,
    lockCurrency:lockCurrency,
    changeCurrency:changeCurrency
}