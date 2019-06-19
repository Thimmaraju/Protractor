# Consume UI Automation Framework
Repo for all the consume ui test automation. <br>
- [Pre Reqs](#pre-reqs)<br>
    - [Install Dependencies](#install-dependencies)<br>
    - [Adding New Env](#adding-new-env)
    - [Adding New User](#adding-new-user)<br>
- [Running Protractor Tests](#running-protractor-tests)<br>
- [Adding Tests and Runs to Test Rail](#adding-tests-and-runs-to-test-rail)<br>
- [Branch Information](#branch-information)<br>
- [Useful Links](#useful-links)<br>

## Pre Reqs <br>
### Install Dependencies:
1. Upgrade node to version 7 or grater. async and await functionality requires node 7 or greater<br>
2. Install the following package <br>
    **protractor** - To run all the tests. **```npm install -g protractor```**<br>
    **webdriver-manager** - To interact with browser. **npm install webdriver-manager**<br>
    **jasmine-reporters** - To report the test results. **```npm install jasmine-reporters```**<br>
    **xml2js** - To parse and read the jasmine report. **```npm install xml2js```** <br>
    **request** - To make api calls. **```npm install request```**<br>
    **request-promise** - To make slack webhook-api calls. **```npm install request-promise```**<br>
    **extend** - **```npm install extend```**<br>
    **protractor-html-reporter** - To generate html report **```npm install protractor-html-reporter```**
    **npm install log4js** ---to install the log4j Module
3. Run ```npm list``` to make sure you can find all the above mention listed as a package. <br>
4. Check the java version in echo $JAVA_HOME it should say **8** .<br>
5. If required need change the path of java home in **.bash_profile** of mac or windows path.<br>

### Adding new env:
Open env.json ```cb-consume-ui-automation/testData/env.json``` and add your environment. Your new env info should be given as follows.<br> API endpoint can be found out by monitoring the network using dev tools. <br>
#### Example to add an env:
```json
    "cbqa3":{
        "uiurl":"https://cb-qa-3.gravitant.net",
        "apiurl":"https://cb-qa-3-api.gravitant.net",
        "system":{
            "username":"system_user",
            "apikey":"d3391156-f194-554c-9bd1-bda47e83f002"
        }
    }
```

### Adding new user:
User ids have been defined for different roles on userroles.json `cb-consume-ui-automation/testData/userroles.json`. These users needs to be registered before running the tests. Currently its a manual process to register the users. If you wish to add yourself as an user please add your user details to userroles.json. Once done adding update your spec's **`ensureConsumeHomeWithRoles("admin")`** to **`ensureConsumeHomeWithRoles("myuser")`**
#### Example to add yourself as an user
```json
"myuser":{
    "username":"myusername@myuser.com",
    "password":"mypassword",
    "firstname":"firstname",
    "lastname":"lastname",
    "displayname":"myuser",
    "description":"Logging in as myuser"
}
```

## Running Protractor Tests
1. Open terminal and run ```webdriver-manager update```<br>  
2. Once webdriver-manager is updated run ```webdriver-manager start```<br>
3. In a new terminal and go to cb-consume-ui-automation directory.<br>  
4. Check if your environment file env.json exists in testData folder else add it.
5. Run **```protractor <<Conf.js file name>> --params.url=<<test environment address> --params.username='xxx@xxx.com' --params.password='xxxxxxxx' ```** to kick off the tests.<br>
   Or protractor conf.js --params.env=cbqa3

## Adding Tests and Runs to Test Rail
1. Open testraildata.json ```cb-consume-ui-automation/testData/testraildata.json``` <br>
2. Change `"postToTestRail":false` to `"postToTestRail":true`
3. Make sure conf.js has the following code.
    ```javascript
    onComplete: async function(){
        require('./updateTestRail.js')
        await addRunAndUpdateResults().then(function(runId){
            console.log(runId)
        })
    }
    ```
4. Run your test.
5. You can find all the _test cases_ [here](https://gravitant.testrail.com/index.php?/suites/view/2376&group_by=cases:title&group_order=asc) and _test run_ [here](https://gravitant.testrail.com/index.php?/runs/overview/19)<br>

## Branch Information
**Cust1** branch will focus on all customer oriented tests <br>

## Useful Links
API integration demo recording can be found <a href = "https://ibm.ent.box.com/embed/s/0x6t5ll2ul8azq78t4rwmw8x0f8hb3tf">here</a> under <a href="https://ibm.ent.box.com/folder/32093243418">Basic Protroactor Training Videos</a>
