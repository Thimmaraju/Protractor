var config = require('./icdTestData'),
    request = require('request'),
    logGenerator = require("./logGenerator.js");
	logger = logGenerator.getApplicationLogger(),
    createError = require('http-errors'),
    apiCreds = require('../testData/env.json'),
    Client = require('node-rest-client').Client;

var Username = apiCreds.cbqa6.system.username,
    Apikey = apiCreds.cbqa6.system.apikey,
    Host = config.setIcdFlagTrue.host,
    adminUser = config.credentialObject.username,
    adminPassword = config.credentialObject.password_fields.password;

async function fetchServiceRequestNumber(order_number) {
    try {
        logger.debug("fetching service request number for order :: ", order_number);
        let fetch_sr_number_url = `${config.credentialObject.endpoint_url}${config.FETCH_SERVICEREQUEST_NUMBER_URL}${order_number}`;
        logger.info("URL for fetch the service request number :: ", fetch_sr_number_url);
        let inputToRestClient = prepareRestClientInputObject("GET", fetch_sr_number_url, null, 'json', config.credentialObject);
        let fetch_sr_resp = await restClient(inputToRestClient);
        //logger.info("Fetch service request response :: ", fetch_sr_resp);
        fetch_sr_resp = JSON.parse(fetch_sr_resp);
        return fetch_sr_resp.SRMboSet.SR[0].TICKETID;
    } catch (error) {
        throw createError(error);
    }
}

async function fetchWorkOrderNumber(serviceRequestNumber) {
    try {
        logger.debug("Fetching the Work Order Number for Service Request :: ", serviceRequestNumber);
        let fetchWorkOrderNumber_url = `${config.credentialObject.endpoint_url}${config.FETCH_WORK_ORDER_NUMBER_URL}${serviceRequestNumber}`;
        logger.info("Url for fetch work order number :: ", fetchWorkOrderNumber_url);
        let options = await prepareRestClientInputObject('GET', fetchWorkOrderNumber_url, null, 'json', config.credentialObject);
        let fetchWorkOrderNumber_resp = await restClient(options);
        //logger.info("Fetch Work Order Number Response :: ", fetchWorkOrderNumber_resp);
        fetchWorkOrderNumber_resp = JSON.parse(fetchWorkOrderNumber_resp);
        let workOrderNumber = fetchWorkOrderNumber_resp['WORKORDERMboSet']['WORKORDER'][0]['WONUM'];
        logger.debug('Work Order Number :: ', workOrderNumber);
        return workOrderNumber;
    } catch (error) {
        throw createError(error);
    }

}

async function fetchWorkOrderTaskStatus(workOrderNumber) {
    try {
        logger.debug("Fetching the Work Order Task Number for Work Order :: ", workOrderNumber);
        let fetchWorkOrderTaskNumber_url = `${config.credentialObject.endpoint_url}${config.FETCH_WORK_ORDER_TASK_NUMBER_URL}${workOrderNumber}`;
        logger.info("Url for fetch work order task number :: ", fetchWorkOrderTaskNumber_url);
        let options = await prepareRestClientInputObject('GET', fetchWorkOrderTaskNumber_url, null, 'json', config.credentialObject);
        let fetchWorkOrderTask_resp = await restClient(options);
        //logger.info("Fetch Work Order Number Response :: ", fetchWorkOrderTask_resp);
        fetchWorkOrderTask_resp = JSON.parse(fetchWorkOrderTask_resp);
        let workOrderTaskStatus = fetchWorkOrderTask_resp['QueryITDWOTASKResponse']['ITDWOTASKSet']['WORKORDER'][0]['Attributes']['STATUS']['content'];
        console.log(fetchWorkOrderTask_resp['QueryITDWOTASKResponse']['ITDWOTASKSet']['WORKORDER'][0]['Attributes']['STATUS']['content']);
        //workOrderTaskNumberAndSiteIdAsAJson.workOrderTaskSiteId = fetchWorkOrderTask_resp['QueryITDWOTASKResponse']['ITDWOTASKSet']['WORKORDER'][0]['Attributes']['SITEID']['content'];
        //workOrderTaskNumberAndSiteIdAsAJson.workOrderTaskNumber = fetchWorkOrderTask_resp['QueryITDWOTASKResponse']['ITDWOTASKSet']['WORKORDER'][0]['Attributes']['WONUM']['content'];
        return workOrderTaskStatus;
    } catch (error) {
        throw createError(error);
    }
}

function restClient(options) {
    return new Promise(function (resolve, reject) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        request(options, function (error, response, body) {
            //logger.info(response.statusCode)
            if (error)
                return reject(error);
            if (response.statusCode == 200)
                return resolve(body);
            logger.error(response.body);
            return reject(createError(response.statusCode, response.body));
        });
    });
}


function prepareRestClientInputObject(http_method, url, data, content_type, credentialObject) {
    let authorization = new Buffer(`${credentialObject.username}:${credentialObject.password_fields.password}`).toString("base64");
    let options = {
        headers: {
            'Content-Type': `application/${content_type}`,
            'Accept': `application/${content_type}`,
            "Authorization": `Basic ${authorization}`
        },
        method: http_method,
        url: url
    }
    if (http_method != 'GET')
        options.body = data;
    return options;
}

// Function to enable ICD OrderTracking flag using get API

var headers = {
		'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Apikey': Apikey,
        'Username': Username
	}


function enableIcdOrderTracking() {
    var options = {
		'headers':headers,
        'data': config.setIcdFlagTrue.data,
    };
    var host = config.setIcdFlagTrue.host;
    var path = config.setIcdFlagTrue.path;
    var url = "https://"+host+path;
    logger.info("PostMan URL for ICD orderTracking :: "+url);
    var deferred = protractor.promise.defer();
    let client = new Client();
    client.post(url, options, function (data, response) {
        var data = JSON.parse(data);
        logger.info("Received data:: " + data.Result);
        if (response.statusCode == 200) {
            browser.sleep(5000);
            // deferred.fulfill(response.statusCode);
            deferred.fulfill(data.Result);
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

// Function to disable ICD OrderTracking using get API
function disableIcdOrderTracking() {
    var dataJson = config.setIcdFlagTrue.data;
    dataJson.order_service.EXTERNAL_ORDER_TRACKING_ENABLE = 'False';
    var options = {
    	'headers':headers,
        'data': dataJson,
    };
    var host = config.setIcdFlagTrue.host;
    var path = config.setIcdFlagTrue.path;
    var url = "https://"+host+path;
    logger.info("PostMan URL for ICD orderTracking :: "+url);
    var deferred = protractor.promise.defer();
    let client = new Client();
    client.post(url, options, function (data, response) {
        var data = JSON.parse(data);
        console.log("Received data:: " + data.Result);
        if (response.statusCode == 200) {
            browser.sleep(5000);
            deferred.fulfill(data.Result);
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

module.exports = {
    fetchServiceRequestNumber: fetchServiceRequestNumber,
    fetchWorkOrderNumber: fetchWorkOrderNumber,
    fetchWorkOrderTaskStatus: fetchWorkOrderTaskStatus,
    enableIcdOrderTracking: enableIcdOrderTracking,
    disableIcdOrderTracking: disableIcdOrderTracking
}