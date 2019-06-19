#!/bin/bash
#
# Copyright : IBM Corporation 2017, 2017
#

export CHROME_BIN=chromium-browser
export DISPLAY=:99.0

#RUN webdriver-manager update
webdriver-manager update
#RUN protractor
#xvfb-run -a protractor debug e2e/conf.js
xvfb-run -a protractor smokeConf.js --troubleshoot --params.url="https://${NAMESPACE}.gravitant.net" --params.username='cbadmn@outlook.com' --params.password='Gravitant123$' --params.postSlack='false' --params.isProvisioningRequired='false' --capabilities.chromeOptions.args="--headless" --capabilities.chromeOptions.args="--window-size=1000,1000" --capabilities.chromeOptions.args="--no-sandbox"
#xvfb-run -a protractor smokeConf.js --troubleshoot --params.url="https://cb-qa-4-release.gravitant.net" --params.username='cbadmn@outlook.com' --params.password='Gravitant123$' --params.postSlack='false' --params.isProvisioningRequired='false' --capabilities.chromeOptions.args="--headless" --capabilities.chromeOptions.args="--window-size=1000,1000" --capabilities.chromeOptions.args="--no-sandbox" || true


#sleep 600

#echo "******Starting to publish report to S3 bucket*****"
#SAVE_REPORT_AT=$PWD"/testreports/"
#REPORT_PATH=$SAVE_REPORT_AT"chrome-test-report.html"
#echo "SAVE_REPORT_AT: "$SAVE_REPORT_AT
#echo "REPORT_PATH:"$REPORT_PATH
#
#if [ -f $REPORT_PATH ]
#then
#    echo "ok. Html report found at "$REPORT_PATH
#    strOriginal="\.\/testreports\/screenshots"
#    strReplace="\.\.\/testreports\/screenshots"
#    sed -i "s/$strOriginal/$strReplace/g" $REPORT_PATH
#    DATE=`date "+%m-%d-%Y-%H-%M"`
#    echo "DATE=$DATE" > env.properties
#    ZIPPED_FILE_PATH=$SAVE_REPORT_AT"CannotFail-AWS-Regression-Admin-Role-"$DATE".zip"
#    echo "Save report at: "$ZIPPED_FILE_PATH
#	zip -r $ZIPPED_FILE_PATH $SAVE_REPORT_AT
#	s3cmd put $ZIPPED_FILE_PATH s3://consume-regression
#else
#    echo "Failed. Html report not found at "$REPORT_PATH
#fi
#echo "######END to publish report to S3 bucket##########"

