/*
Licensed Materials - Property of IBM
IBM Cloud Brokerage
Copyright IBM Corporation 2017. All Rights Reserved.
*/
var request = require('request');

/* 
function to add a new test suite to testrail
@param {json object} headers the headers with testrail api key and content type  
@param {string} suite_name name used for test suite
@param {string} suite_description description for the suite
@param {string} add_suite_endpoint API endpoint to add a suite 
@return {number} the id of the newly created suite
*/
function addTestSuite(headers, add_suite_endpoint, suite_name, suite_description) {
    return new Promise((resolve, reject) => {
        var options = {
            url: add_suite_endpoint,
            headers: headers,
            body: {
                "name": suite_name,
                "description": suite_description
            },
            json: true
        };
        request.post(options, function (err, httpResponse, body) {
            if (err) {
                reject(err);
                return;
            }
            resolve(body.id);
        });
    });
};


/* 
function to add a new test section to testrail
@param {json object} headers the headers with testrail api key and content type  
@param {string} add_section_endpoint API endpoint to add a section
@param {number} test_suite_id suite id against which the section is created
@param {string} section_name name of the section 
@return {number} the id of the newly created suite
*/
function addSections(headers, add_section_endpoint, test_suite_id, section_name) {
    return new Promise((resolve, reject) => {
        var options = {
            url: add_section_endpoint,
            headers: headers,
            body: {
                "name": section_name,
                "suite_id": test_suite_id
            },
            json: true
        };
        request.post(options, function (err, httpResponse, body) {
            if (err) {
                reject(err);
                return;
            }
            resolve(body.id);
        });
    });
};

/* 
function to add a new test case to testrail
@param {json object} headers the headers with testrail api key and content type  
@param {string} add_case_endpoint API endpoint to add a test case
@param {string} test_case_name name of the test case
@return {number} the id of the newly created test case
*/
function addCases(headers, add_case_endpoint, test_case_name) {;
    return new Promise((resolve, reject) => {
        var options = {
            url: add_case_endpoint,
            headers: headers,
            body: {
                "title": test_case_name,
                "type_id":1,
	            "custom_jira_component" : 465
            },
            json: true
        };
        request.post(options, function (err, httpResponse, body) {
            if (err) {
                reject(err);
                return;
            }
            resolve(body.id);
        });
    });
};

/* 
function to add run to test case on testrail
@param {json object} headers the headers with testrail api key and content type  
@param {string} add_run_endpoint API endpoint to add a test run
@param {number} suite_id id of the test suite to add to test run
@param {string} run_name name of the test run
@return {number} the id of the newly created test run
*/
function addTestRun(headers, add_run_endpoint, suite_id, run_name) {
    return new Promise((resolve, reject) => {
        var options = {
            url: add_run_endpoint,
            headers: headers,
            body: {
                "suite_id": suite_id,
                "name": run_name,
                "include_all": true
            },
            json: true
        };
        request.post(options, function (err, httpResponse, body) {
            if (err) {
                reject(err);
                return;
            }
            resolve(body.id);
        });
    }); 
};


/* 
function to add result to test case on testrail
@param {json object} headers the headers with testrail api key and content type  
@param {string} add_result_endpoint API endpoint to add a test result
@param {number} status_id id of result of the test. 1-passed 3-untested 5-failed
@return {number}
*/
function addTestResults(headers, add_result_endpoint, status_id) {
    return new Promise((resolve, reject) => {
        var options = {
            url: add_result_endpoint,
            headers: headers,
            body: {
                "status_id": status_id
            },
            json: true
        };
        request.post(options, function (err, httpResponse, body) {
            if (err) {
                reject(err);
                return;
            }
            resolve(body);
        });
    }); 
};

//export all the functions
module.exports = {
    addTestSuite: addTestSuite,
    addSections: addSections,
    addCases: addCases,
    addTestRun:addTestRun,
    addTestResults: addTestResults,
};