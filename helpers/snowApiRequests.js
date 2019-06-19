
"use strict";
var request = require('request');
var extend = require('extend');
var snowUserCreds = require('../testData/SNOW/SnowUserCreds.json');
var Client = require('node-rest-client').Client;
var env = require('../testData/env.json');

var orderFlowUtil = require('./orderFlowUtil.js');
var util = require('./util.js');
var CatalogPage = require('../e2e/pageObjects/catalog.pageObject.js');
var PlaceOrderPage = require('../e2e/pageObjects/placeOrder.pageObject.js');

var snowusername = snowUserCreds.snowParameters.username,
    snowpassword = snowUserCreds.snowParameters.password;


beforeAll(function () {
    var catalogPage = new CatalogPage();
    var placeOrderPage = new PlaceOrderPage();
    browser.driver.manage().window().maximize();
});


var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Basic ' + new Buffer(snowusername + ':' + snowpassword).toString('base64')
}



async function getSRTicketNumber(ordernumber) {
    console.log("Print order num:" + ordernumber);

    return new Promise((resolve, reject) => {
        var options = {
            url: 'https://dev64819.service-now.com/api/now/table/sc_request?short_description=' + ordernumber,
            headers: headers
          };
        console.log(options)
        request.get(options, function (err, httpResponse, body) {
            if (err) {
                console.error(err);
                return reject(err);
            }
            console.log("Print api response:" + body);
            var resbody = JSON.parse(body);
            var reqId = resbody.result[0].number;
            console.log(reqId);
            var orderResponse = resbody.result[0].special_instructions;
            var orderIndex = orderResponse.indexOf("orderNumber") + 12
            var orderId = orderResponse.substring(orderIndex, (orderResponse.lastIndexOf("orderSubmittedTime") - 2))
            console.log(orderId);
            return resolve(reqId);
        });
    });
};

function getSnowSRTicketNumber(ordernumber) {
    return new Promise((resolve, reject) => {
    	var options = {
            url		: 	'https://dev64819.service-now.com/api/now/table/sc_request?short_description=' + ordernumber,
            headers	: 	headers
          };
        request.get(options, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            }
            console.log("Print api response:" + body);
            var resbody = JSON.parse(body);
            var reqId = resbody.result[0].number;
            console.log(reqId);
            var orderResponse = resbody.result[0].special_instructions;
            var orderIndex = orderResponse.indexOf("orderNumber") + 12
            var orderId = orderResponse.substring(orderIndex, (orderResponse.lastIndexOf("orderSubmittedTime") - 2))
            console.log(orderId);
            resolve(reqId);
        });
    }).catch((errorMessage) => {
        reject('Failed to get SR number');
    });
};


module.exports = {
    getSRTicketNumber: getSRTicketNumber,
    getSnowSRTicketNumber:getSnowSRTicketNumber
}