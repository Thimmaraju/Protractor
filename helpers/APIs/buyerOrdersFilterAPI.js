"use strict";

var request = require('request');
var util = require('../util.js');
// var now = new Date();
var objCollHeaders, txtURL, strDateTime;
var logGenerator = require("../logGenerator.js"),
    logger = logGenerator.getApplicationLogger();


function getDateLastDay() {
    return new Promise((resolve, reject) => {
        try {
            var now = new Date();
            strDateTime = now.toJSON(now.setHours((now.getHours() - 24)));
            logger.info('getDateLastDay: ' + strDateTime);
            resolve(strDateTime);
        } catch (e) {
            reject("Error in buyOrdersFilterAPI.js function getDateLastDay: ", e);
        }
    });
}

function getDateLastWeek() {
    return new Promise((resolve, reject) => {
        var now = new Date();
        strDateTime = now.toJSON(now.setHours((now.getHours() - (24 * 7))));
        logger.info('getDateLastWeek: ' + strDateTime);
        resolve(strDateTime);
    });
}

//Just a note on this. Twice a year, this will show the hours as one hour different
// due to time changes. That is the correct behavior.
function getDateLastMonth() {
    return new Promise((resolve, reject) => {
        var now = new Date();
        strDateTime = now.toJSON(now.setMonth((now.getMonth() - 1)));
        logger.info("getDateLastMonth: " + strDateTime);
        resolve(strDateTime);
    });
}

function getDateLastThreeMonths() {
    return new Promise((resolve, reject) => {
        var now = new Date();
        strDateTime = now.toJSON(now.setMonth((now.getMonth() - 3)));
        logger.info("getDateLastThreeMonths: " + strDateTime);
        resolve(strDateTime);
    });
}

function getDateLastSixMonths() {
    return new Promise((resolve, reject) => {
        var now = new Date();
        strDateTime = now.toJSON(now.setMonth((now.getMonth() - 6)));
        logger.info("getDateLastSixMonths: " + strDateTime);
        resolve(strDateTime);
    });
}

function getDateLastYear() {
    return new Promise((resolve, reject) => {
        var now = new Date();
        strDateTime = now.toJSON(now.setMonth((now.getMonth() - 12)));
        logger.info("getDateLastYear: " + strDateTime);
        resolve(strDateTime);
    });
}

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


function getBuyerAllOrdersURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            txtURL = url
                + '/api/orders/filter?searchText=&status=' ;
            logger.info('getBuyerAllOrdersURL: ' + txtURL);
            resolve(txtURL);
        }).catch((errorMessage) => {
            reject(`In getBuyerAllOrdersURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}


function getBuyerLastDayOrdersURL() {
    return new Promise((resolve, reject) => {
        try {
            getDateLastDay().then(function (strDateTime) {
                getTestSystemAPIUrl().then(function (url) {
                    txtURL = url
                        + '/api/orders/filter?&createdDate_$gte=' + strDateTime;
                    logger.info('getBuyerLastDayOrdersURL: ' + txtURL);
                    resolve(txtURL);
                });
            }).catch((errorMessage) => {
                logger.info(`In getBuyerLastDayOrdersURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
            });
        } catch (e) {
            reject("reject in getBuyerLastDayOrdersURL function of buyOrdersFilterAPI.js: ", e);
        }
    });
}

function getBuyerLastWeekOrdersURL() {
    return new Promise((resolve, reject) => {
        getDateLastWeek().then(function (strDateTime) {
            getTestSystemAPIUrl().then(function (url) {
                txtURL = url + '/api/orders/filter?&createdDate_$gte='
                    + strDateTime;
                logger.info('getBuyerLastWeekOrdersURL: ' + txtURL);
                resolve(txtURL);
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastWeekOrdersURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastMonthOrdersURL() {
    return new Promise((resolve, reject) => {
        getDateLastMonth().then(function (strDateTime) {
            getTestSystemAPIUrl().then(function (url) {
                txtURL = url + '/api/orders/filter?&createdDate_$gte='
                    + strDateTime;
                logger.info('getBuyerLastMonthOrdersURL: ' + txtURL);
                resolve(txtURL);
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastMonthOrdersURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastThreeMonthsOrdersURL() {
    return new Promise((resolve, reject) => {
        getDateLastThreeMonths().then(function (strDateTime) {
            getTestSystemAPIUrl().then(function (url) {
                txtURL = url + '/api/orders/filter?&createdDate_$gte='
                    + strDateTime;
                logger.info('getBuyerLastThreeMonthsOrdersURL: ' + txtURL);
                resolve(txtURL);
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastThreeMonthsOrdersURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastSixMonthsOrdersURL() {
    return new Promise((resolve, reject) => {
        getDateLastSixMonths().then(function (strDateTime) {
            getTestSystemAPIUrl().then(function (url) {
                txtURL = url + '/api/orders/filter?&createdDate_$gte='
                    + strDateTime;
                logger.info('getBuyerLastSixMonthsOrdersURL: ' + txtURL);
                resolve(txtURL);
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastSixMonthsOrdersURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastYearOrdersURL() {
    return new Promise((resolve, reject) => {
        getDateLastYear().then(function (strDateTime) {
           getTestSystemAPIUrl().then(function (url) {
                txtURL = url + '/api/orders/filter?&createdDate_$gte='
                    + strDateTime;
                logger.info('getBuyerLastYearOrdersURL: ' + txtURL);
                resolve(txtURL);
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastYearOrdersURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getAllOrdersFromOrderStatusURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            txtURL = url
                + '/api/orders/filter?searchText=&status=' ;
            logger.info('getAllOrdersStatusURL: ' + txtURL);
            resolve(txtURL);
        }).catch((errorMessage) => {
            reject(`In getAllOrdersFromOrderStatusURL of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getApprovalInProgressFromOrderStatusURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            txtURL = url
                + '/api/orders/filter?searchText=&status=Approval In Progress' ;
            logger.info('getApprovalInProgressStatusURL: ' + txtURL);
            resolve(txtURL);
        });
    });
}

function getSubmittedFromOrderStatusURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            txtURL = url
                + '/api/orders/filter?searchText=&status=Submitted' ;
            logger.info('getSubmittedStatusURL: ' + txtURL);
            resolve(txtURL);
        });
    });
}

function getProvisioningInProgressFromOrderStatusURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            txtURL = url
                + '/api/orders/filter?searchText=&status=Provisioning in Progress' ;
            logger.info('getProvisioningInProgressStatusURL: ' + txtURL);
            resolve(txtURL);
        });
    });
}

function getRejectedFromOrderStatusURL() {
    return new Promise((resolve, reject) => {
        getTestSystemAPIUrl().then(function (url) {
            txtURL = url
                + '/api/orders/filter?searchText=&status=Rejected' ;
            logger.info('getRejectedStatusURL: ' + txtURL);
            resolve(txtURL);
        });
    });
}

function getOptions(url, collHeaders) {
    return new Promise((resolve, reject) => {
        try {
            var objHeaders = {
                url: url,
                headers: collHeaders
            };
            logger.info('CollHeaders: ' + JSON.stringify(collHeaders));
            resolve(objHeaders);
        } catch (e) {
            reject(`In getOptions error: ${e}`);
        }

    });
}

function exeRequest(opt) {
    logger.info('Calling get with ', JSON.stringify(opt));
    return new Promise((resolve, reject) => {
        request.get(opt, function (err, httpResponse, body) {
            if (err || httpResponse.statusCode >= 400) {
                logger.info("1 There is error in the API call... :" + err);
                logger.info("2 HttpResponse status is: " + httpResponse.statusCode);
                logger.info("3 Error message: " + JSON.stringify(body));
                logger.info('4 Calling get with ', JSON.stringify(opt));
                const reason = new Error('In exeRequest of buyerOrdersFilterAPI: API call failed' +
                    ' error: ' + err);
                reject(reason);
            }
            resolve(body);
        });
    });
}

//Get Orders count by Period
function getBuyerAllOrdersFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getBuyerAllOrdersURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            //logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    //logger.info('getBuyerAllOrdersFromAPIResponse= ' + parsedBody);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerAllOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastDayOrdersFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getBuyerLastDayOrdersURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    resolve(parsedBody);
                })
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastDayOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastWeekOrdersFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getBuyerLastWeekOrdersURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    //logger.info('getBuyerLastWeekOrdersFromAPIResponse= ' + parsedBody);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastWeekOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastMonthOrdersFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getBuyerLastMonthOrdersURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    //logger.info('getBuyerLastMonthOrdersFromAPIResponse= ' + ' ' + parsedBody);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastMonthOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastThreeMonthsOrdersFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getBuyerLastThreeMonthsOrdersURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    //logger.info('getBuyerLastThreeMonthsOrdersFromAPIResponse= ' + parsedBody);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastThreeMonthsOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastSixMonthsOrdersFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getBuyerLastSixMonthsOrdersURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    //logger.info('getBuyerLastSixMonthsOrdersFromAPIResponse= ' + parsedBody);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastSixMonthsOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

function getBuyerLastYearOrdersFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getBuyerLastYearOrdersURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    //logger.info('getBuyerLastYearOrdersFromAPIResponse= ' + parsedBody);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastYearOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

//Get orders count by Order status
function getAllOrdersFromOrderStatusFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getAllOrdersFromOrderStatusURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getBuyerLastYearOrdersFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });

    });

}

function getApprovalInProgressFromOrderStatusFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getApprovalInProgressFromOrderStatusURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    resolve(parsedBody);
                });
            });
        });
    });
}

function getSubmittedFromOrderStatusFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getSubmittedFromOrderStatusURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    resolve(parsedBody);
                });
            });
        });
    });
}

function getProvisioningInProgressFromOrderStatusFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getProvisioningInProgressFromOrderStatusURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    resolve(parsedBody);
                });
            });
        });
    });
}

function getRejectedFromOrderStatusFromAPIResponse() {
    return new Promise((resolve, reject) => {
        getRejectedFromOrderStatusURL().then(async function (url) {
            objCollHeaders = {
                'Content-Type': 'application/json',
                'username': browser.params.username,
                'apikey': browser.params.testuserapikey
            };
            logger.info('objCollHeaders: ' + JSON.stringify(objCollHeaders));
            await getOptions(url, objCollHeaders).then(async function (options) {
                await exeRequest(options).then(function (resp) {
                    var parsedBody = JSON.parse(resp);
                    //logger.info('getRejectedFromOrderStatusFromAPIResponse= ' + parsedBody);
                    resolve(parsedBody);
                });
            });
        }).catch((errorMessage) => {
            reject(`In getRejectedFromOrderStatusFromAPIResponse of buyerOrdersFilterAPI.js: ${errorMessage}`);
        });
    });
}

module.exports = {
    getBuyerLastDayOrdersFromAPIResponse: getBuyerLastDayOrdersFromAPIResponse,
    getBuyerLastWeekOrdersFromAPIResponse: getBuyerLastWeekOrdersFromAPIResponse,
    getBuyerLastMonthOrdersFromAPIResponse: getBuyerLastMonthOrdersFromAPIResponse,
    getBuyerLastThreeMonthsOrdersFromAPIResponse: getBuyerLastThreeMonthsOrdersFromAPIResponse,
    getBuyerLastSixMonthsOrdersFromAPIResponse: getBuyerLastSixMonthsOrdersFromAPIResponse,
    getBuyerLastYearOrdersFromAPIResponse: getBuyerLastYearOrdersFromAPIResponse,
    getBuyerAllOrdersFromAPIResponse: getBuyerAllOrdersFromAPIResponse,
    getAllOrdersFromOrderStatusFromAPIResponse: getAllOrdersFromOrderStatusFromAPIResponse,
    getSubmittedFromOrderStatusFromAPIResponse: getSubmittedFromOrderStatusFromAPIResponse,
    getApprovalInProgressFromOrderStatusFromAPIResponse: getApprovalInProgressFromOrderStatusFromAPIResponse,
    getProvisioningInProgressFromOrderStatusFromAPIResponse: getProvisioningInProgressFromOrderStatusFromAPIResponse,
    getRejectedFromOrderStatusFromAPIResponse: getRejectedFromOrderStatusFromAPIResponse
};