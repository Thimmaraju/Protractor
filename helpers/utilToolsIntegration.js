var httpRequest = require('request-promise');
const fs = require('fs');
var xml2js = require('xml2js');




global.postToSlack = function (){
    return new Promise((resolve,reject)=>{
        var boolValue = ('true' === browser.params.postSlack);
        console.log("post-to-slack? "+boolValue);
        if (boolValue){
            var parser = new xml2js.Parser();

            console.log("Initiating consolidation of test results....");
            fs.readFile('./testreports/junitresults.xml', function(err, data) {
                parser.parseString(data, function (err, result) {

                    var testExecutiontitle = "Consume UI Automation Test results:\n URL: "+browser.params.url;
                    console.log("Consume UI Automation Test results:\n URL: "+browser.params.url);
                    var lenSuite = result.testsuites.testsuite.length;
                    var totalTestSuits = "Total Test Suite Count: "+ lenSuite;
                    console.log("Total Test Suite Count: "+ lenSuite);
                    
                 /*   var resultSummary = "Summary:" + "\n*Pass: "+totalPassed+"* "+"\n"+"\n`Fail: "+totalFailed+"` "+"\n"+"\n_Skip: "+totalSkipped+"_"+
                    "\n";
                    console.log("Result Summary: "+ resultSummary);
                    
                    var finalTestSuiteSummaryToPost = "Posting Summary... \n";*/
                    
                    var finalTestSuiteSummaryToPost = "Feature-wise Summary:\n";
                    var totalPassed = 0;
                    var totalFailed = 0;
                    var totalSkipped = 0;
                    for(var j=0; j<lenSuite; j++){
                       /* var testSuiteTimeStamp = result.testsuites.testsuite[j].$.timestamp;
                        var testSuiteName = result.testsuites.testsuite[j].$.name;
                        var testSuiteSummary = "Test Summary of Suite: "+(j+1).toString()+"\n" +
                            "Test Suite Name: "+testSuiteName+"\n"+
                            "Test Execution Date/Time: "+testSuiteTimeStamp;*/
                    	
                    	var testSuiteName = result.testsuites.testsuite[j].$.name;
                    	var testSuiteSummary =testSuiteName;

                        //var statusByTestCase = "Test Cases Failed or Skipped: \n";
                        var totalTestCase = result.testsuites.testsuite[j].testcase.length;
                        var failed = 0;
                        var passed = 0;
                        var skipped = 0;
                       /* var totalFailed = 0;
                        var totalPassed = 0;
                        var totalSkipped = 0;*/
                        
                        for (var i=0; i<totalTestCase; i++){
                            if((result.testsuites.testsuite[j].testcase[i].failure)){
                                failed = Number(failed) + 1;
                                
                                //statusByTestCase = statusByTestCase + result.testsuites.testsuite[j].testcase[i].$.name + ":- Failed, \n";
                            }
                            else if((result.testsuites.testsuite[j].testcase[i].skipped)){
                                skipped = Number(skipped) + 1;
                                
                                //statusByTestCase = statusByTestCase + result.testsuites.testsuite[j].testcase[i].$.name + ":- Skipped, \n";
                            }
                            else {
                                passed = Number(passed) + 1;
                               
                                //statusByTestCase = statusByTestCase + result.testsuites.testsuite[j].testcase[i].$.name + ":- Passed, \n";
                            }
                        }
                        totalFailed = totalFailed+failed;
                        totalPassed = totalPassed+passed;
                        totalSkipped = totalSkipped+skipped;
                        
                         testSuiteSummary = testSuiteSummary +"   -  "+"_Passed: "+passed.toString()+"_"+"`Failed: "+failed.toString()+"` "+"_Skipped: "+skipped.toString()+"_"+
                        "\n";
                        
                         finalTestSuiteSummaryToPost = finalTestSuiteSummaryToPost + testSuiteSummary;
                    }
                         
                      /*  testSuiteSummary = testSuiteSummary +
                            "\n*Passed: "+passed.toString()+"* "+
                            "`Failed: "+failed.toString()+"` "+
                            "_Skipped: "+skipped.toString()+"_"+
                            "\n";
                            //"\n"+statusByTestCase;

                        finalTestSuiteSummaryToPost = finalTestSuiteSummaryToPost + testSuiteSummary;
                    }*/
                    
                   /* resultSummary=resultSummary +
                    "\n*Passed: "+totalPassed.toString()+"* "+
                    "\n`Failed: "+totalFailed.toString()+"` "+
                    "\n_Skipped: "+totalSkipped.toString()+"_"+
                    "\n";*/

                    //var body = '{"text": "testExecutiontitle \ntotalTestSuits \nfinalTestSuiteSummaryToPost"}';
                    /*var body = "testExecutiontitle \ntotalTestSuits \nfinalTestSuiteSummaryToPost";*/
                    
                    var totalCount=totalFailed+totalPassed+totalSkipped;
                    var body = "testExecutiontitle \ntotalCount \ntotalPassed \ntotalFailed \ntotalSkipped \nfinalTestSuiteSummaryToPost";
                    

                    body = body.replace("testExecutiontitle", testExecutiontitle.toString()+"\n");
                    body = body.replace("totalCount", "Total TestCases Executed : " +totalCount.toString());
                    body = body.replace("totalPassed", "Passed : " +totalPassed.toString());
                    body = body.replace("totalFailed", "Failed : " +totalFailed.toString());
                    body = body.replace("totalSkipped", "Skipped : " +totalSkipped.toString()+"\n");
                   // body = body.replace("totalTestSuits", totalTestSuits.toString()+"\n");
                    body = body.replace("finalTestSuiteSummaryToPost", finalTestSuiteSummaryToPost.toString()+"\n");
                    
                    


                    console.log("Test Summary: \n"+body)

                    console.log('Posting test summary to slack....');

                    var reqOptions={
                        method: 'POST',
                        url:"https://hooks.slack.com/services/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",
                        body:{"text": body
                        },
                        json:true
                    };

                    httpRequest(reqOptions).then( function(httpResponse) {
                        console.log('Response after posting to slack: \n' + httpResponse.toString());
                        resolve(httpResponse.toString());
                    })
                    .catch(function (err) {
                        console.error('Error during posting to slack: \n'+err.toString());
                        reject(err);
                        return;
                    });
                });

            });
        }else {
            console.warn("Skipped posting to Slack.")
        }
    });
};

global.generateHTMLReport = function (configFileName){
    return new Promise(()=>{
        var browserName, browserVersion;
        var capsPromise = browser.getCapabilities();

        capsPromise.then(function (caps) {
            browserName = caps.get('browserName');
            browserVersion = caps.get('version');

            var HTMLReport = require('protractor-html-reporter');

            testConfig = {
                reportTitle: 'Test Execution Report for '+configFileName,
                outputPath: './testreports/',
                screenshotPath: './testreports/screenshots',
                testBrowser: browserName,
                browserVersion: browserVersion,
                modifiedSuiteName: false,
                screenshotsOnlyOnFailure: true
            };
            new HTMLReport().from('./testreports/junitresults.xml', testConfig);
        });
    });

};

module.exports = {
    postToSlack : postToSlack,
    generateHTMLReport:generateHTMLReport
};



