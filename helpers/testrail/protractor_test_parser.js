/*
Licensed Materials - Property of IBM
IBM Cloud Brokerage
Copyright IBM Corporation 2017. All Rights Reserved.
*/

const fs = require('fs');
var xml2js = require('xml2js');
const PASSED = "Passed",
    FAILED = "Failed",
    UNTESTED = "Untested";

function getProtractorResult(file_path) {

    return new Promise(function (resolve, ) {
        try {
            var parser = new xml2js.Parser();
            var protractor_tests = [];
            fs.readFile(file_path, function (err, data) {
                parser.parseString(data, function (err, result) {
                    var totalTestSuits = (result.testsuites.testsuite.length);

                    //total available test suits 
                    for (var j = 0; j < totalTestSuits; j++) {
                        var tests = [];
                        var test_suite_name = result.testsuites.testsuite[j].$.name;
                        var totalTestCase = result.testsuites.testsuite[j].testcase.length

                        //add tests with name and status
                        for (var i = 0; i < totalTestCase; i++) {
                            if ((result.testsuites.testsuite[j].testcase[i].failure)) {
                                var testCaseName = result.testsuites.testsuite[j].testcase[i].$.name;
                                tests.push({
                                    "name": testCaseName,
                                    "status": FAILED
                                });
                            } else if ((result.testsuites.testsuite[j].testcase[i].skipped)) {
                                var testCaseName = result.testsuites.testsuite[j].testcase[i].$.name;
                                tests.push({
                                    "name": testCaseName,
                                    "status": UNTESTED
                                });
                            } else {
                                var testCaseName = result.testsuites.testsuite[j].testcase[i].$.name;
                                tests.push({
                                    "name": testCaseName,
                                    "status": PASSED
                                });
                            }
                        }
                        //add suite with its tests and result
                        protractor_tests.push({
                            "test_suite_name": test_suite_name,
                            "test_cases": tests
                        });
                    }
                });
                resolve(protractor_tests);
            });
        } catch (err) {
            reject(err);
        }
    });
}

// getProtractorResult("./junitresults.xml").then(function(a){
//     console.log(a[0].test_cases[0].status);
// });

module.exports = {
    getProtractorResult: getProtractorResult
};