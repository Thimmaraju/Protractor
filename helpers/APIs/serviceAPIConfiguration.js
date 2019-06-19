"use strict";
var request = require('request');
var extend = require('extend');

var serviceConfigAPIData =  require('../../testData/APIs/serviceConfigAPIData.json');

var username1 = serviceConfigAPIData.cbqa1.system.username,
    apikey1 = serviceConfigAPIData.cbqa1.system.apikey,
    host1 = serviceConfigAPIData.cbqa1.host;

var    getServiceConfigEndpoint1 = serviceConfigAPIData.cbqa1.system.endpoint;
var    getServiceConfigAPIUrl1 = host1 + getServiceConfigEndpoint1;
var    providerAccountID1= serviceConfigAPIData.cbqa1.system.providerAccount;

var headers1 = {
    'Content-Type': 'application/json',
    'Accept':'application/json',
    'username':username1,
    'apikey':apikey1,
    'cb-user-provider-account':providerAccountID1
}

//////////////////////////////////////////////////////////////////////
var username2 = serviceConfigAPIData.cbqa2.system.username,
    apikey2 = serviceConfigAPIData.cbqa2.system.apikey,
    host2 = serviceConfigAPIData.cbqa2.host;

var    getServiceConfigEndpoint2 = serviceConfigAPIData.cbqa2.system.endpoint;
var    getServiceConfigAPIUrl2 = host2 + getServiceConfigEndpoint2;
var    providerAccountID2= serviceConfigAPIData.cbqa2.system.providerAccount;

var headers2 = {
    'Content-Type': 'application/json',
    'Accept':'application/json',
    'username':username2,
    'apikey':apikey2,
    'cb-user-provider-account':providerAccountID2
}

//////////////////////////////////////////////////////////////////////
var username3 = serviceConfigAPIData.cbqa3.system.username,
    apikey3 = serviceConfigAPIData.cbqa3.system.apikey,
    host3 = serviceConfigAPIData.cbqa3.host;

var    getServiceConfigEndpoint3 = serviceConfigAPIData.cbqa3.system.endpoint;
var    getServiceConfigAPIUrl3 = host3 + getServiceConfigEndpoint3;
var    providerAccountID3= serviceConfigAPIData.cbqa3.system.providerAccount;

var headers3 = {
    'Content-Type': 'application/json',
    'Accept':'application/json',
    'username':username3,
    'apikey':apikey3,
    'cb-user-provider-account':providerAccountID3
}

//////////////////////////////////////////////////////////////////////

var username4 = serviceConfigAPIData.cbqa4.system.username,
    apikey4 = serviceConfigAPIData.cbqa4.system.apikey,
    host4 = serviceConfigAPIData.cbqa4.host;

var    getServiceConfigEndpoint4 = serviceConfigAPIData.cbqa4.system.endpoint;
var    getServiceConfigAPIUrl4 = host4 + getServiceConfigEndpoint4;
var    providerAccountID4= serviceConfigAPIData.cbqa4.system.providerAccount;

var headers4 = {
    'Content-Type': 'application/json',
    'Accept':'application/json',
    'username':username4,
    'apikey':apikey4,
    'cb-user-provider-account':providerAccountID4
}

//////////////////////////////////////////////////////////////////////


function getServiceConfigFromAPIResponse(){
    return new Promise((resolve, reject) => {
        var options = {
            url:getServiceConfigAPIUrl2,
            headers:headers2
        };
        request.get(options, function(err, httpResponse, body){

            if (err) {
                console.error(err);
                reject(err);
            }

            console.log('Res content=' + body);
            var jsonObject = JSON.parse(body);
            resolve(jsonObject);
        });
    });
}


function getInvisibleLabelIdsByDropdownvalue()
{
    return new Promise((resolve, reject) => {
        var options = {
            url:getServiceConfigAPIUrl4,
            headers:headers4
        };
        request.get(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                reject(err);
            }
            var idLabelObject = {};
            var serviceConfigJSONObj = JSON.parse(body);
            console.log('*************** API URL USED FOR TEST VERIFICATION OF VISIBILITY RULES ************* ' +options.url);
            //Get the array of  configGroup from Json object
            var configGroup = serviceConfigJSONObj.configGroup;
            var labelsToBeInvisible = [];
            //loop through all arrays, but break after the first one
            for (var i = 0; i < configGroup.length; i++) {
                //Get the array of  configGroup from Json object
                var configGroup = serviceConfigJSONObj.configGroup;
                var hideExpressionArray = [];
                var configs = [];
                // assumption - default value false for visibility rule
                var visibilityRuleFound = false;
                var uniqueHideExpressions = [];
                //check if the congif group in the array has visibility rule property
                if (configGroup[i].hasOwnProperty('visibilityRules')) {
                    console.log('*****************************************');
                    console.log('***Verify API for Visibility rules for the selected service template***');
                    console.log('Visibility rules found in API inside the config group: ' + configGroup[i].configGroupName);
                    //since config group has visibility rule hence change the value for visibilityRuleFound as true
                    visibilityRuleFound = true;
                    //loop through the visibility rules to find the config ids and hideExpression
                    //Create hide expression array from JSON object
                    for (var j = 0; j < configGroup[i].visibilityRules.length; j++) {
                        //capture hideexpression from JSON to Variable
                        var hideExpression = configGroup[i].visibilityRules[j].hideExpression;
                        //console.log('Hide expression from API for each "visibility rule" object found inside the config group  : ' + hideExpression);
                        hideExpressionArray.push(hideExpression);
                    }
                    //Remove duplicate hide expressions from the array
                    uniqueHideExpressions = hideExpressionArray.reduce(function(a,b){
                        if (a.indexOf(b) < 0 ) a.push(b);
                        return a;
                    },[]);
                    //console.log("Unique Array length from API  =" + uniqueHideExpressions.length);
                    //console.log("Unique Array from API =" + uniqueHideExpressions);
                    for(var m=0; m<uniqueHideExpressions.length; m++)
                    {
                        var dropDownBoxId = "";
                        var dropDownBoxvalue = "";
                        var uniqueExpression =  uniqueHideExpressions[m];
                        console.log('Unique Hide expression  for each "visibility rule" object found inside the config group  : ' + uniqueExpression);
                        //split the unique hide expression using split into different values and store into array variable called splitarray using = symbol
                        var splitArray = uniqueExpression.split('=');
                        //store first element of spliit array into dropDownBoxid
                        dropDownBoxId = splitArray[0];
                        //store first element of spliit array into dropdownboxvalue
                        dropDownBoxvalue = splitArray[1];

                        var configIdsofRules = [];
                        //loop through visibility rules to find the config ids
                        for (var j = 0; j < configGroup[i].visibilityRules.length; j++) {
                            //check if hide expression is equal to the unique hide expression found above
                            if (uniqueExpression === configGroup[i].visibilityRules[j].hideExpression){
                                //Capture configids of visibility rules array from JSON into configIdsofRules array
                                configIdsofRules.push(configGroup[i].visibilityRules[j].configId);
                                console.log(' Config id tied to a unique hidden expression of a visibility rule : ' + configGroup[i].visibilityRules[j].configId);
                            }
                        }
                        //capture configs array of config group  from JSON to configs array variable
                        configs = configGroup[i].configs;
                        //loop through the array of configs
                        for (var k = 0; k < configs.length; k++) {
                            //loop through the config ids found inside the configs array
                            for (var l = 0; l < configIdsofRules.length; l++) {
                                //comparing the configruleid from visibility rules against configid in configs array
                                if (configs[k].configId === configIdsofRules[l]) {
                                    //capture the configname associated to the configid found in above step and add it into labelsToBeInvisible array
                                    labelsToBeInvisible.push(configs[k].configName);
                                    //configname from matching configs object inside the configs array
                                    console.log('Config name tied to the config id and hidden expression that should be verified as field labels on UI : ' + configs[k].configName);
                                }
                            }
                        }
                        //adding labelsToBeInvisible array for config ids to an object using the key matching UI dropdownbox value or config name tied to the hidden expression
                        idLabelObject[dropDownBoxvalue.trim()] = labelsToBeInvisible;
                    }
                }
            }
            resolve(idLabelObject);
        });
    });
}
module.exports = {
    getServiceConfigFromAPIResponse:getServiceConfigFromAPIResponse,
    getInvisibleLabelIdsByDropdownvalue: getInvisibleLabelIdsByDropdownvalue
};