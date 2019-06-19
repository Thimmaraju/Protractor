var HTMLReport = require('protractor-html-reporter');

testConfig = {
    reportTitle: 'Test Execution Report for '+process.argv[2],
    outputPath: './testreports/',
    screenshotPath: './testreports/screenshots',
    testBrowser: process.argv[3],
    modifiedSuiteName: false,
    screenshotsOnlyOnFailure: true
};
new HTMLReport().from('./testreports/junitresults.xml', testConfig);