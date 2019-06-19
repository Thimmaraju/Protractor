"use strict";

var HtmlReporter = require('protractor-beautiful-reporter');

exports.config = {

	seleniumAddress : 'http://localhost:4444/wd/hub',
	allScriptsTimeout : 7200000,
	useAllAngular2AppRoots : true,

	/**
	 * usage example: protractor protractor.conf.js --specs=e2e/home.spec.js
	 */
	suites : {

		'allUser#Functional#ApprovalFlow' : 'e2e/specs/orderIntegration/AllUserFunctionFlow.spec.js',
	},
	capabilities : {
		'browserName' : 'chrome',
		chromeOptions : {
			args : [ 'disable-extensions' ]
		}
	},

	framework : 'jasmine2',
	jasmineNodeOpts : {
		onComplete : null,
		isVerbose : false,
		showColors : true,
		includeStackTrace : true,
		defaultTimeoutInterval : 5000000,
		allScriptsTimeout : 20000000,
		useAllAngular2AppRoots : true
	},

	params : {
		url : 'https://cb-qa-4.gravitant.net',
		username : '****',
		password : '****'

	},

	onPrepare : function() {
		require('./helpers/onPrepare.js');
		// Add a screenshot reporter and store screenshots to testreports:
		jasmine.getEnv().addReporter(new HtmlReporter({
			baseDirectory : 'testreports',
			screenshotsSubfolder : 'images',
			jsonsSubfolder : 'jsons',
			takeScreenShotsForSkippedSpecs : true,
			docTitle : 'My Reporter',
			docName : 'TestResult.html',
			cssOverrideFile : 'css/style.css',
			takeScreenShotsOnlyForFailedSpecs : true,
		}).getJasmine2Reporter());
	}

};
