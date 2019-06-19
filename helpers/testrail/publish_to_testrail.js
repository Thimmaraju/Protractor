/*
Licensed Materials - Property of IBM
IBM Cloud Brokerage
Copyright IBM Corporation 2017. All Rights Reserved.
*/
"use strict";
var log4js = require('log4js');
var testrail_properties = require('./testrail_properties.json');
var protractor_test_parser = require('./protractor_test_parser');
var test_rail_apis = require('./test_rail_api');
var date = new Date();

//logger configuration
log4js.configure({
    appenders: {
        testrail: {
            type: 'file',
            filename: 'testrail.log',
            maxLogSize:2048576
        }
    },
    categories: {
        default: {
            appenders: ['testrail'],
            level: 'info'
        }
    }
});

var logger = log4js.getLogger();
/**
 * Function to publish results into test rail.
 * @param {number} testrail_project_id id of the project where the tests and results need to be refected
 * @returns None 
*/
async function publish_to_testrail(testrail_project_id) {
    try {
        logger.info("**************** STARTING TO PUBLISH TO TESTRAIL *******************")
        
        //Headers for the API Connection
        var apikey = testrail_properties.cerdentials.apikey;
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': apikey
        }
        
        //junit result file to process
        var junit_result_file = testrail_properties.protractor_test_report;

        //Get testrail parameters
        var project_id = testrail_project_id;
        var suite_name = testrail_properties.parameters.suite_name+date;
        var suite_description = testrail_properties.parameters.suite_description;
        var run_name = testrail_properties.parameters.run_name+date;

        //Gerate URLs 
        var host_url = testrail_properties.endpoints.host;
        logger.debug("Host URL is "+host_url);

        var add_suite_endpoint = testrail_properties.endpoints.add_suite;
        add_suite_endpoint = host_url+add_suite_endpoint.replace("${project_id}",project_id);
        logger.debug("Add Suite endpoint "+add_suite_endpoint);

        var add_section_endpoint = testrail_properties.endpoints.add_section;
        add_section_endpoint = host_url+add_section_endpoint.replace("${project_id}",project_id);
        logger.debug("Add Section endpoint "+add_section_endpoint);

        var add_run_endpoint = testrail_properties.endpoints.add_run;
        add_run_endpoint = host_url + add_run_endpoint.replace("${project_id}",project_id);
        logger.debug("Add Run endpoint "+add_run_endpoint);

        var add_case_endpoint = testrail_properties.endpoints.add_case;

        var add_result_endpoint = testrail_properties.endpoints.add_result_for_case;

        if (host_url && add_suite_endpoint &&
            add_section_endpoint && add_case_endpoint &&
            add_run_endpoint && add_result_endpoint) {

            // read all tests from protractor
            var protractor_tests = await protractor_test_parser.getProtractorResult(junit_result_file);

            // add test plan to testrail
            var test_suite_id = await test_rail_apis.addTestSuite(headers, add_suite_endpoint, suite_name, suite_description);
            logger.info("##### test suite id: "+test_suite_id+" #####");
            
            // add test run 
            var test_run_id = await test_rail_apis.addTestRun(headers, add_run_endpoint, test_suite_id, run_name);
            logger.debug("test run id: "+test_run_id);

            for(var section=0; section<protractor_tests.length; section++){
                // add test sections to testrail
                var section_name = protractor_tests[section].test_suite_name                
                var section_id = await test_rail_apis.addSections(headers, add_section_endpoint, test_suite_id, section_name); 
                
                logger.info("***** Adding new section ***** "+
                            "\ntest section id: "+section_id+
                            "\ntest section name: "+section_name);
                
                add_case_endpoint = testrail_properties.endpoints.add_case;
                add_case_endpoint = host_url+add_case_endpoint.replace("${section_id}",section_id)
                logger.debug("add case endpoint :"+add_case_endpoint);
                
                //add tests to section. add tests run. add results to run 
                var total_test_cases = protractor_tests[section].test_cases.length;
                for (var cases = 0; cases < total_test_cases; cases++){
                    var test_case_name = protractor_tests[section].test_cases[cases].name;
                    var test_case_result = protractor_tests[section].test_cases[cases].status;
                    
                    //add tests to section
                    var test_case_id = await test_rail_apis.addCases(headers, add_case_endpoint, test_case_name);
                    logger.info("adding test case"+
                                "\ntest case name :"+test_case_name+
                                "\ntest case result: "+test_case_result+
                                "\ntest case id: "+test_case_id);
                    
                    //add result to run with status {passed / failed / untested}

                    add_result_endpoint = testrail_properties.endpoints.add_result_for_case;
                    add_result_endpoint = host_url + add_result_endpoint.replace("${run_id}",test_run_id).replace("${test_id}",test_case_id);
                    logger.debug("add result endpoint :"+add_result_endpoint);
                    var status_id = 5;
                    if (test_case_result == "Passed"){
                        status_id = 1;
                    }
                    else if(test_case_result == "Failed"){
                        status_id = 5;
                    }
                    else{
                        status_id = 3;
                    }
                    var result = await test_rail_apis.addTestResults(headers, add_result_endpoint, status_id);   
                }    
            }
            logger.info("**************** COMPLETED PUBLISHING TO TESTRAIL *******************")
            
        } else {
            throw "One or more parameter is undefined"
        }
    } catch (err) {
        logger.error(err)
    }
}
