var request = require('request');
var usersinfo = require('../../testData/userroles.json');
var userAuthData = require('../../testData/APIs/userAuthAPIData.json');
var env = require('../../testData/env.json');

global.registerUsers=function(){
    return new Promise(async (reslove,reject)=>{
        if(browser.params.env!=undefined){
            var registerUserPayLoad = userAuthData.defaultauthservice.updateuser.payloadwithalldata;
            var endpoint = env[browser.params.env].apiurl + userAuthData.defaultauthservice.adduser.endpoint;
            console.log(endpoint);
                    
            for(var key in usersinfo.roles){
                if(key != undefined){
                    registerUserPayLoad.displayname = usersinfo.roles[key].displayname;
                    registerUserPayLoad.firstname = usersinfo.roles[key].firstname;
                    registerUserPayLoad.lastname = usersinfo.roles[key].lastname;
                    registerUserPayLoad.uid = usersinfo.roles[key].username;
                    registerUserPayLoad.emails[0] = usersinfo.roles[key].username;
                
                    var headers = {
                        'Content-Type': 'application/json',
                        'Accept':'application/json',
                        'username':env[browser.params.env].system.username,
                        'apikey':env[browser.params.env].system.apikey
                    };
                    
                    var options = {
                        url: endpoint,
                        headers:headers,
                        body:registerUserPayLoad,
                        json:true
                    };
                    
                    var body = await registerNewUser(options);
                    //console.log(body);
                    reslove(body);
                };
            }
        }
        else {
            resolve("User Registration Script Not run");
        }
    });
};

function registerNewUser(options){
    return new Promise((resolve, reject) => {
        request.post(options, function(err, httpResponse, body){
            if (err) {
                console.error(err);
                return;
            }
            resolve(body);
        });
    });
};
