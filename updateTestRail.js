"use strict";
var request = require('request');
const fs = require('fs');
var xml2js = require('xml2js');

var testRailData = require('./testData/smokeTestRail.json');
var testRailURL = testRailData.url;
var testRailAPIKey = testRailData.apiKey;

var headers = {
    'Content-Type': 'application/json',
    'Authorization': testRailAPIKey
}

function getTestRailTests() {
    return new Promise(function(resolve, reject){
        var trTests = {tests:[]};
        var endPoint = testRailData.getTestEndPoint;
        var url = testRailURL+endPoint;
    
        var options = {
            url:url,
            headers:headers
        };
        //fetch tests from testrail
        request.get(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                reject(err);
            }
            //console.log(httpResponse.statusCode);
            var jsonBody = JSON.parse(body);
            for (var i=0; i< jsonBody.length; i++){
                trTests.tests.push({"id":jsonBody[i].id, "name":jsonBody[i].title});
            }
            resolve(trTests);
        });
    });
} 

function getProtractorTests(){
    return new Promise(function(resolve){
        var parser = new xml2js.Parser();    
        var protractorTests = {tests:[]};
        var id=undefined;

        fs.readFile('testreports/junitresults.xml', function(err, data) {
            parser.parseString(data, function (err, result) {
                var totalTestSuits = (result.testsuites.testsuite.length);
                for(var j=0; j<totalTestSuits; j++){
                    var totalTestCase = result.testsuites.testsuite[j].testcase.length
                    for (var i=0; i<totalTestCase; i++){
                        if((result.testsuites.testsuite[j].testcase[i].failure)){
                            var testCaseName = result.testsuites.testsuite[j].testcase[i].$.name;
                            protractorTests.tests.push({"id":id,"name":testCaseName,"status":"Failed"});
                        }
                        else if((result.testsuites.testsuite[j].testcase[i].skipped)){
                            var testCaseName = result.testsuites.testsuite[j].testcase[i].$.name;
                            protractorTests.tests.push({"id":id,"name":testCaseName,"status":"Untested"});
                        }
                        else {
                            var testCaseName = result.testsuites.testsuite[j].testcase[i].$.name;
                            protractorTests.tests.push({"id":id,"name":testCaseName,"status":"Passed"});
                        }
                    }
                }
            });
            resolve(protractorTests);
        }); 
    });
}

function compareTestRailAndProtractor(){
    return new Promise(function(resolve){
        var testToAdd={tests:[]};
        getProtractorTests().then(function(tests){
            var protractorTests = tests;
            getTestRailTests().then(function(tests){
                var testRailTests = tests;
                var prTestsLength = protractorTests.tests.length;
                var trTestsLength = testRailTests.tests.length;

                for(var i=0; i<prTestsLength; i++){
                    for(var j=0; j<trTestsLength; j++){
                        //console.log("comparing "+protractorTests.tests[i].name+" and "+testRailTests.tests[j].name)
                        if(protractorTests.tests[i].name==testRailTests.tests[j].name){
                            //console.log("match Found")
                            protractorTests.tests[i].id = testRailTests.tests[j].id;
                            break;
                        }
                    }
                }
                resolve(protractorTests);
            });
        });

    });
}

function addTestCaseToTestRail(){
    return new Promise((resolve, reject) => {
        compareTestRailAndProtractor().then(async function(tests){
            var testsLength = tests.tests.length;
            var url = testRailURL+testRailData.addTestEndPoint;
            for(var i=0; i<testsLength; i++){
                if(tests.tests[i].id==undefined){
                    var options = {
                        url:url,
                        headers:headers,
                        body:{
                            "title":tests.tests[i].name,
                            "custom_jira_component" : 465
                        },
                        json: true
                    }
                    var id = await postNewTestCase(options);
                    //console.log(id)
                    tests.tests[i].id = id;
                }
            }
            resolve(tests);
        });
    });
}

function postNewTestCase(options){
    return new Promise((resolve, reject) => {
        request.post(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                return;
            }
            resolve(body.id);
        });
    });
}

global.addRunAndUpdateResults=function(){
    return new Promise((reslove,reject)=>{
        if(testRailData.postToTestRail==true){
            addTestCaseToTestRail().then(async function(tests){
                var date = new Date();
                var addRunUrl = testRailURL+testRailData.addRunEndPoint;
                var testsLength = tests.tests.length;
                var testIDs = [];
                for(var i=0; i<testsLength; i++){
                    testIDs.push(tests.tests[i].id)
                    //console.log("Test IDS are "+ testIDs)
                } 
                var options={
                    url:addRunUrl,
                    headers:headers,
                    body:{
                        "suite_id":2376,
                        "name": "Consume UI Automation "+(date),
                        "assignedto_id": 9,
                        "include_all": false,
	                    "case_ids": testIDs
                    },
                    json:true
                }
                var runId = await postNewTestRun(options);
                for(var i=0; i<testsLength; i++){
                    var url = testRailURL+testRailData.postResultEndPoint+runId+"/"+tests.tests[i].id
                    var status = 3;
                    if(tests.tests[i].status=="Passed"){
                        status=1;
                    }
                    else if(tests.tests[i].status=="Failed"){
                        status=5;
                    }
                    else{
                        status = 3;
                    }
                    var options={
                        url:url,
                        headers:headers,
                        body:{
                            "status_id":status
                        },
                        json:true
                    }
                    await postTestResults(options)
                }
                await closeTestRun(runId);
                reslove(runId)
            });
        }
    });

}

function postNewTestRun(options){
    return new Promise((resolve, reject) => {
        request.post(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                return;
            }
            resolve(body.id);
        });
    });
}

function postTestResults(options){
    return new Promise((resolve, reject) => {
        request.post(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                return;
            }
            //console.log(body)
            resolve(body);
        });
    });
}

function closeTestRun(runId){
    return new Promise((resolve, reject) => {
        var url=testRailURL+testRailData.closeRunEndPoint+runId
        var options={
            url:url,
            headers:headers
        }
        request.post(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                return;
            }
            //console.log(httpResponse)
            resolve(httpResponse);
        });
    });
}
