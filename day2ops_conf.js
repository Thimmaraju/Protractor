var jasmineReporters = require('jasmine-reporters');

exports.config = {

    seleniumAddress: 'http://localhost:4444/wd/hub',
    allScriptsTimeout: 7200000,
    useAllAngular2AppRoots: true,

    /**
     * usage example:
     * protractor protractor.conf.js --specs=e2e/home.spec.js
     */
    suites: {
    	'search':'e2e/specs/inventory/search.spec.js',
    	'filters':'e2e/specs/inventory/filters.spec.js',
    	'sort':'e2e/specs/inventory/sort.spec.js',
    	'pagination':'e2e/specs/inventory/pagination.spec.js',
    	'indiviualservices':'e2e/specs/inventory/individual_service_actions.spec.js',
    	'viewproperties_soi':'e2e/specs/inventory/viewsoiproperties.spec.js',
    	'view columns':'e2e/specs/inventory/viewing_columns.spec.js',
    	'indiviualservices':'e2e/specs/inventory/individual_service_actions.spec.js',
    	'roles':'e2e/specs/inventory/role_management.spec.js',
    },
    capabilities:
    {
        'browserName': 'chrome',  
        chromeOptions: {
            args: [
                'disable-extensions'
            ]
        }
    },

    framework: 'jasmine2',
    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval : 5000000,
        allScriptsTimeout: 20000000,
        useAllAngular2AppRoots: true
    },

    params: {
    	url:	'https://cb-qa-d2ops.gravitant.net',
    	username: 'cloud.brokertest@gmail.com',
		password: 'Cloudbroker'
    },

    onPrepare: function () {
        require('./helpers/onPrepare.js');
        // require('./helpers/APIs/registerUsers.js');
        // await registerUsers().then(function(body){
        //     console.log(body)
        // });
        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            savePath: 'testreports',
            consolidate: true,
            useDotNotation: true
        }));

    },
    onComplete: function(){
    	var reportGenerator =  require('./helpers/utilToolsIntegration.js');
    	reportGenerator.generateHTMLReport('Order Integration Suite');
    }
};
