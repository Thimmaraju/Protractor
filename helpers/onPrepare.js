var util = require('./util.js');
var request = require('request');
var logGenerator = require("./logGenerator.js");
var logger = logGenerator.getApplicationLogger();

var sysuserApikey = require("../testData/APIs/sysUserAPICreds.json");

global.isAngularApp = function (flag) {
    browser.ignoreSynchronization = !flag;
};

global.setTestUserTeamInfo = function () {
    return new Promise((resolve, reject) => {
        logger.info('Test user: ' + browser.params.username);
        if (browser.params.username === 'cbadmn@outlook.com') {
            browser.params.userteaminfo = 'TEAM1'
        } else if (browser.params.username === 'consumebuyer@gmail.com') {
            browser.params.userteaminfo = 'ICBuyer'
        } else if (browser.params.username === 'cbtechnicalapprover@gmail.com') {
            browser.params.userteaminfo = 'TECHapproval'
        } else if (browser.params.username === 'cbfinancialapprover@gmail.com') {
            browser.params.userteaminfo = 'FINapproval'
        } else if (browser.params.username === 'cloud.brokertest@gmail.com') {
            browser.params.userteaminfo = 'TEAM1'
        }else {
            logger.info('Test user ' + browser.params.username + ' is not' +
                ' standard test-user. Please use standard test users:' +
                ' cbadmn@outlook.com, ' +
                'consumebuyer@gmail.com, cbtechnicalapprover@gmail.com,' +
                'cbfinancialapprover@gmail.com');
        }

        resolve(true);
    });
};

global.getTestSystemAPIUrl = function () {
    return new Promise((resolve, reject) => {
        var apiURL;
        if (browser.params.url) {
            var strSplit = browser.params.url.toString().split(".gravitant");
            if (strSplit[0].includes('cb-qa-3') || (strSplit[0].includes('cb-qa-d2ops'))) {
                apiURL = strSplit[0] + "-api.gravitant.net:8443";
            } else {
                apiURL = strSplit[0] + "-api.gravitant.net";
            }
            logger.info("API url: " + apiURL);
            resolve(apiURL);
        } else {
            reject("Failed to generate test-system api gateway. could not" +
                " resolve url");
        }
    });
};

global.getSystemKey = function () {
    return new Promise((resolve, reject) => {
        if (browser.params.url) {
        	console.log ("Browsername : " + browser.params.url.toString())
            var strSplit = browser.params.url.toString().split(".gravitant");
            var getDomainName = strSplit[0].toString().split("://");
            logger.info("Test Domain: " + getDomainName[1]);
            resolve(getDomainName[1]);
        }
    });
};

global.setSysUserApikeyAndUserID = function () {
    return new Promise((resolve, reject) => {
        getSystemKey().then(function (strDomain) {
            browser.params.sysuserid = sysuserApikey.systems[strDomain].sysuser;
            browser.params.sysapikey = sysuserApikey.systems[strDomain].apikey;
            logger.info("System User ID: " + browser.params.sysuserid);
            logger.info("System User API Key: " + browser.params.sysapikey);
            resolve(true);
        });
    });
};

global.setApikeyForAllTestUsers = function () {
    return new Promise((resolve, reject) => {
        getSystemKey().then(function (strDomain) {
            if (strDomain in sysuserApikey.systems){
                browser.params.apikeycbadmn = sysuserApikey.systems[strDomain].cbadmn;
                browser.params.apikeyconsumebuyer = sysuserApikey.systems[strDomain].consumebuyer;
                browser.params.apikeycbtechnicalapprover = sysuserApikey.systems[strDomain].cbtechnicalapprover;
                browser.params.apikeycbfinancialapprover = sysuserApikey.systems[strDomain].cbfinancialapprover;
                browser.params.apikeycloudbrokertest = sysuserApikey.systems[strDomain].cloudbrokertest;

                if ((browser.params.username).includes('cbadmn')){
                    browser.params.testuserapikey = sysuserApikey.systems[strDomain].cbadmn;
                }else if ((browser.params.username).includes('consumebuyer')){
                    browser.params.testuserapikey = sysuserApikey.systems[strDomain].consumebuyer;
                }else if ((browser.params.username).includes('cbtechnicalapprover')){
                    browser.params.testuserapikey = sysuserApikey.systems[strDomain].cbtechnicalapprover;
                }else if ((browser.params.username).includes('cbfinancialapprover')){
                    browser.params.testuserapikey = sysuserApikey.systems[strDomain].cbfinancialapprover;
                }else if ((browser.params.username).includes('cloud.brokertest')){
                    browser.params.testuserapikey = sysuserApikey.systems[strDomain].cloudbrokertest;
                }

                logger.info("cbadamn User API Key: " + browser.params.apikeycbadmn);
                logger.info("consumebuyer User API Key: " + browser.params.apikeyconsumebuyer);
                logger.info("cbtechnicalapprover User API Key: " + browser.params.apikeycbtechnicalapprover);
                logger.info("cbfinancialapprover User API Key: " + browser.params.apikeycbfinancialapprover);
                logger.info("apikeycloudbrokertest User API Key: " + browser.params.apikeycloudbrokertest);
                logger.info("Current Test User API Key: " + browser.params.testuserapikey);
            }else{
                logger.warn("In sysUserAPICreds.json, missing apikey creds for the domain: "+strDomain);
            }


            resolve(true);
        });
    });
};

global.getTestUserAndSystemUserApikey = function () {
    return new Promise((resolve, reject) => {
        setSysUserApikeyAndUserID().then(async function () {
            await getTestSystemAPIUrl().then(async function (testSystemAPIGateway) {

                var userEndpointForApikey = '/authorization/v1/user/key/' + browser.params.username;
                var userHeaders = {
                    'username': browser.params.sysuserid,
                    'apikey': browser.params.sysapikey
                };
                var userOptions = {
                    url: testSystemAPIGateway + userEndpointForApikey,
                    headers: userHeaders
                };

                await request.get(userOptions, async function (err, httpResponse, body) {

                    if (JSON.stringify(body).includes('doesn\'t exist')) {

                        logger.info('Api-key for ' + browser.params.username
                            + ' is not found. \nGenerating apikey.');
                    } else {
                        var objResp = JSON.parse(body);
                        browser.params.testuserapikey = objResp.key;
                        logger.info("Test User API Key: " + browser.params.testuserapikey);
                        resolve(objResp);
                    }

                    var userPOSTEndpointForApikey = '/authorization/v1/user/key/' + browser.params.username;
                    var userPOSTHeaders = {
                        'username': browser.params.sysuserid,
                        'apikey': browser.params.sysapikey,
                        'Content-Type': 'application/json'
                    };
                    var userPOSTOptions = {
                        url: testSystemAPIGateway + userPOSTEndpointForApikey,
                        headers: userPOSTHeaders,
                        body: {
                            "type": "portaluser"
                        },
                        json: true
                    };

                    await request.post(userPOSTOptions, function (err, httpResponse, body) {
                        if (!JSON.stringify(body).includes('already exist')) {
                            var objResp = JSON.parse(JSON.stringify(body));
                            browser.params.testuserapikey = objResp.key;
                            logger.info("Test User API Key: " + browser.params.testuserapikey);
                        }
                    });
                });
                //});
            })
        });
    });
};

global.ensureConsumeHome = function () {
	var EC = protractor.ExpectedConditions;
	isAngularApp(false);
	setTestUserTeamInfo().then(function () {
		setApikeyForAllTestUsers().then(function () {
			browser.get(browser.params.url).then(function () {
				logger.info("Launched browser and navigated to URL: " + browser.params.url);
				browser.sleep(5000);
				//browser.wait(EC.urlContains("https://idaas.iam.ibm.com/idaas/"), 60000).then(function () {
				//browser.wait(EC.visibilityOf(element(by.css(".form-heading"))), 60000).then(function () {
				//logger.info("Waited till browser URL contains: https://idaas.iam.ibm.com/idaas/");
				//browser.wait(EC.titleIs("IBMid - Sign in or create an IBMid"), 60000).then(function () {
				//logger.info("Waited till browser title is: IBMid - Sign in or create an IBMid");
				browser.wait(EC.visibilityOf(element(by.css("#username"))), 60000).then(function () {
					logger.info("Waited till Username text box is visible on the page");
					element(by.css("#username")).clear().then(function () {
						logger.info("Cleared Username input box");
						element(by.css("#username")).sendKeys(browser.params.username).then(function () {
							logger.info("Entered " + browser.params.username + " in Username input box");
							browser.wait(EC.visibilityOf(element(by.css("#continue-button"))), 5000).then(function () {
								logger.info("Waited till Continue button is visible on login page");
								element(by.css("#continue-button")).click().then(function () {
									logger.info("Clicked on Continue button");

									browser.wait(EC.visibilityOf(element(by.css("#password"))), 5000).then(function () {
										logger.info("Waited till Password input box is visible on login page");
										element(by.css("#password")).sendKeys(browser.params.password).then(function () {
											logger.info("Entered " + browser.params.password + " in password input box");
											element(by.css("#signinbutton")).click().then(function () {
												browser.sleep(3000);
												logger.info("Clicked on Sign In button");
												browser.sleep(5000);
												//isAngularApp(true);
											});
										});
									});
								});
							});
						});
					});
				});
				//});
			});
		});
	});

    if (browser.params.username.includes("ibm.com")) {
        browser.wait(EC.titleIs("IBM w3id"), 60000).then(function () {
            logger.info("Waited till browser title is: IBM w3id");
            browser.wait(EC.visibilityOf(element(by.css("#desktop[name=\"username\"]"))), 60000).then(function () {
                logger.info("Waited till Intranet Username text box is visible on the page");
                element(by.css("#desktop[name=\"username\"]")).clear().then(function () {
                    logger.info("Cleared Intranet Username input box");
                    element(by.css("#desktop[name=\"username\"]")).sendKeys(browser.params.username).then(function () {
                        logger.info("Entered " + browser.params.username + " in intranet username input box");
                        element(by.css("input[name=\"password\"]")).clear().then(function () {
                            logger.info("Cleared Intranet Password input box");
                            browser.sleep(3000);
                            element(by.css("input[name=\"password\"]")).sendKeys(browser.params.password).then(function () {
                                logger.info("Entered " + browser.params.password + " in intranet password input box");
                                element(by.css("#btn_signin")).click().then(function () {
                                    logger.info("Clicked on Intranet Sign In button");
                                    isAngularApp(true);
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        /*browser.wait(EC.visibilityOf(element(by.css("#password"))), 60000).then(function () {
            logger.info("Waited till Password input box is visible on login page");
            element(by.css("#password")).sendKeys(browser.params.password).then(function () {
                logger.info("Entered " + browser.params.password + " in password input box");
                element(by.css("#signinbutton")).click().then(function () {
                    browser.sleep(3000);
                    logger.info("Clicked on Sign In button");
                    isAngularApp(true);
                });
            });
        });*/
    }

    /*Below function is used to handle the policy pop up appearing after login.
    As "Privacy Acceptance" dialog popup only once for each user logging into that test instance
    scroll to bottom, select the checkbox and click button submit, only if present.*/

    //browser.sleep(3000);
    browser.wait(EC.urlContains("dashboard"), 60000).then(function () {
    	logger.info("Navigated to Dashboard page...");
    	browser.wait(EC.visibilityOf(element(by.xpath("//h2[text() = 'Notice']"))), 60000).then(function (){
    		element(by.xpath("//h2[text() = 'Notice']")).isDisplayed().then(function (result) {
    			if (result  == true) {
                	logger.info("Privacy policies pop up displayed...");
                	//var el = element(by.linkText("IBM Software Products and Software-as-a-Service Privacy Statement"));
                	var el = element(by.css("#privacy-policy-link"));
                	util.scrollToWebElement(el);
                	browser.wait(EC.elementToBeClickable(el), 60000).then(function(){
                		browser.executeScript("arguments[0].click();", el.getWebElement()).then(function(){
                			logger.info("Clicked on the IBM Privacy statement link to agree to privacy statement...");
                			browser.getAllWindowHandles().then(function(handles){
                			    browser.switchTo().window(handles[1]).then(function(){
                			    	logger.info("Switched to child window");
                			    	util.scrollToBottom(); //scrolled till bottom
                			    }).then(function(){
                			    	browser.close(); //Closing the current window
                			    }).then(function(){
                			    	browser.switchTo().window(handles[0]).then(function(){
                    			    	logger.info("Switched back to parent window");
                    			    });
                			    });
                			});
                		});
                	});
                	var checkBoxEl = element(by.css(".bx--checkbox-label"));
                	browser.wait(EC.elementToBeClickable(element(by.css(".bx--form-item"))), 5000).then(function(){
                    	//element(by.css(".bx--form-item")).click().then(function(){
                		browser.executeScript("arguments[0].click();", checkBoxEl.getWebElement()).then(function(){
                        	logger.info("Selected the check box in Privacy statement pop up to agree to privacy statement...");
                        	var submitBtnEl = element(by.css("#privacy-policy-modal_carbon-button_submit"));
                        	//element(by.css("#privacy-policy-modal_carbon-button_submit")).click().then(function(){
                        	browser.executeScript("arguments[0].click();", submitBtnEl.getWebElement()).then(function(){
                            	logger.info("Clicked on submit button in the Privacy statement popup...")
                        	})
                    	});
                	});
            	}
    		});
    	});
    });



    browser.wait(EC.urlContains("/dashboard"), 60000).then(function () {
        logger.info("Waited till browser url contains /dashboard");

        //If executing on clean-deployed-qa-server, expected to click checkbox to verify the current
        //logged user is system-admin.
        element(by.css("label[for='checkbox-verifyCheckboxId']")).isPresent().then(function(result) {
            if ( result ) {
                element(by.css("label[for='checkbox-verifyCheckboxId']")).click();
            }
        });

        browser.wait(EC.visibilityOf(element(by.css("a[title=\"Let's Get Started\"]"))), 90000).then(function () {
            logger.info("Waited till visibility of Let`s Get started link on Dashboard");
        });
    });
};

global.ensureConsumeHomeWithRoles = function (role) {
    var userRoles = require('../testData/userroles.json');
    var env = require('../testData/env.json');

    if (browser.params.env == '') {
        var host = browser.params.url;
    } else {
        var host = env[browser.params.env].uiurl;
    }

    var description = userRoles.roles[role].description;
    var username = userRoles.roles[role].username;
    var password = userRoles.roles[role].password;
    logger.info(description);
    isAngularApp(false);
    browser.get(host);
    browser.sleep(5000);
    util.getCurrentURL().then(function (url) {
        if (!url.includes(host)) {
            element(by.css("#username")).clear();
            element(by.css("#username")).sendKeys(username);
            element(by.css("#continuebutton")).click();
            browser.sleep(5000);
            element(by.xpath('//span[@id="ibmOrgMsg1"]')).isDisplayed().then(function (isVisible) {
                if (isVisible) {
                    isAngularApp(false);
                    element(by.css("#continuefedbutton")).click();
                    browser.sleep(2000);
                    element(by.xpath("//input[@name='username']")).clear();
                    element(by.xpath("//input[@name='username']")).sendKeys(username);
                    element(by.xpath("//input[@name='password']")).clear();
                    element(by.xpath("//input[@name='password']")).sendKeys(password);
                    //element(by.css("#signinbutton")).click();
                    element(by.css("#btn_signin")).click();
                    browser.sleep(10000);
                    isAngularApp(true);
                }
                else {
                    element(by.css("#password")).clear();
                    element(by.css("#password")).sendKeys(password);
                    element(by.css("#signinbutton")).click();
                    browser.sleep(10000);
                    isAngularApp(true);
                }
            });
        }
        else {
            logger.info("USER ALREADY LOGGED IN");
            isAngularApp(true);
        }
    });
};

global.browserMaximize = function () {
    browser.driver.manage().window().maximize();
};

global.browserResize = function (width, height) {
    browser.driver.manage().window().setSize(width, height);
};
