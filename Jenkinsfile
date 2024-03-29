#!/usr/bin/env groovy


 import groovy.json.JsonOutput
 import java.util.Optional
 import hudson.tasks.test.AbstractTestResultAction
 import hudson.model.Actionable
 import hudson.tasks.junit.CaseResult

 def speedUp = '--configure-on-demand --daemon --parallel'
 def nebulaReleaseScope = (env.GIT_BRANCH == 'origin/master') ? '' : "-Prelease.scope=patch"
 def nebulaRelease = "-x prepare -x release snapshot ${nebulaReleaseScope}"
 def gradleDefaultSwitches = "${speedUp} ${nebulaRelease}"
 def gradleAdditionalTestTargets = "integrationTest"
 def gradleAdditionalSwitches = "shadowJar"
 def slackNotificationChannel = "cldmx-consume-auto"
 def author = ""
 def message = ""
 def testSummary = ""
 def total = 0
 def failed = 0
 def skipped = 0

 def isPublishingBranch = { ->
     return env.GIT_BRANCH == 'origin/master' || env.GIT_BRANCH =~ /release.+/
 }

 def isResultGoodForPublishing = { ->
     return currentBuild.result == null
 }

 def notifySlack(text, channel, attachments) {
     def slackURL = 'https://hooks.slack.com/services/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'
     def jenkinsIcon = 'https://wiki.jenkins-ci.org/download/attachments/2916393/logo.png'

     def payload = JsonOutput.toJson([text: text,
         channel: channel,
         username: "Jenkins",
         icon_url: jenkinsIcon,
         attachments: attachments
     ])

     bat "curl -X POST --data-urlencode \'payload=${payload}\' ${slackURL}"
 }

 /**
 def getGitAuthor = {
     def commit = sh(returnStdout: true, script: 'git rev-parse HEAD')
     author = sh(returnStdout: true, script: "git --no-pager show -s --format='%an' ${commit}").trim()
 }
 */

 /**
 def getLastCommitMessage = {
     message = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
 }
 */

 @NonCPS
 def getTestSummary = { ->
     def testResultAction = currentBuild.rawBuild.getAction(AbstractTestResultAction.class)
     def summary = ""

     if (testResultAction != null) {
         total = testResultAction.getTotalCount()
         failed = testResultAction.getFailCount()
         skipped = testResultAction.getSkipCount()

         summary = "Passed: " + (total - failed - skipped)
         summary = summary + (", Failed: " + failed)
         summary = summary + (", Skipped: " + skipped)
     } else {
         summary = "No tests found"
     }
     return summary
 }

 @NonCPS
 def getFailedTests = { ->
     def testResultAction = currentBuild.rawBuild.getAction(AbstractTestResultAction.class)
     def failedTestsString = "```"

     if (testResultAction != null) {
         def failedTests = testResultAction.getFailedTests()

         if (failedTests.size() > 9) {
             failedTests = failedTests.subList(0, 8)
         }

         for(CaseResult cr : failedTests) {
             failedTestsString = failedTestsString + "${cr.getFullDisplayName()}:\n${cr.getErrorDetails()}\n\n"
         }
         failedTestsString = failedTestsString + "```"
     }
     return failedTestsString
 }

 def populateGlobalVariables = {
     //getLastCommitMessage()
     //getGitAuthor()
     testSummary = getTestSummary()
 }

 node {
     try {
         stage('Checkout') {
             checkout scm
         }

         stage('Build') {
             //bat "./gradlew ${gradleDefaultSwitches} clean build ${gradleAdditionalTestTargets} ${gradleAdditionalSwitches} --refresh-dependencies"
             bat 'protractor orderIntegrationConf.js  --params.url=https://cb-qa-4.gravitant.net --params.username=deepthi.chitti@in.ibm.com --params.password=Dee10thi$04'
             step $class: 'JUnitResultArchiver', testResults: '**/testreports/*.xml'

             populateGlobalVariables()

             def buildColor = currentBuild.result == null ? "good" : "warning"
             def buildStatus = currentBuild.result == null ? "Success" : currentBuild.result
             def jobName = "${env.JOB_NAME}"

             // Strip the branch name out of the job name (ex: "Job Name/branch1" -> "Job Name")
             jobName = jobName.getAt(0..(jobName.indexOf('/') - 1))

             if (failed > 0) {
                 buildStatus = "Failed"

                 if (isPublishingBranch()) {
                     buildStatus = "MasterFailed"
                 }

                 buildColor = "danger"
                 def failedTestsString = getFailedTests()

                 notifySlack("", slackNotificationChannel, [
                     [
                         title: "${jobName}, build #${env.BUILD_NUMBER}",
                         title_link: "${env.BUILD_URL}",
                         color: "${buildColor}",
                         text: "${buildStatus}\n${author}",
                         "mrkdwn_in": ["fields"],
                         fields: [
                             [
                                 title: "Branch",
                                 value: "${env.GIT_BRANCH}",
                                 short: true
                             ],
                             [
                                 title: "Test Results",
                                 value: "${testSummary}",
                                 short: true
                             ],
                             [
                                 title: "Last Commit",
                                 value: "${message}",
                                 short: false
                             ]
                         ]
                     ],
                     [
                         title: "Failed Tests",
                         color: "${buildColor}",
                         text: "${failedTestsString}",
                         "mrkdwn_in": ["text"],
                     ]
                 ])
             } else {
                 notifySlack("", slackNotificationChannel, [
                     [
                         title: "${jobName}, build #${env.BUILD_NUMBER}",
                         title_link: "${env.BUILD_URL}",
                         color: "${buildColor}",
                         author_name: "${author}",
                         text: "${buildStatus}\n${author}",
                         fields: [
                             [
                                 title: "Branch",
                                 value: "${env.GIT_BRANCH}",
                                 short: true
                             ],
                             [
                                 title: "Test Results",
                                 value: "${testSummary}",
                                 short: true
                             ],
                             [
                                 title: "Last Commit",
                                 value: "${message}",
                                 short: false
                             ]
                         ]
                     ]
                 ])
             }
         }

         if (isPublishingBranch() && isResultGoodForPublishing()) {
             stage ('Publish') {
                 bat "./gradlew ${gradleDefaultSwitches}"
             }
         }
     } catch (hudson.AbortException ae) {
         // I ignore aborted builds, but you're welcome to notify Slack here
     } catch (e) {
         def buildStatus = "Failed"

         if (isPublishingBranch()) {
             buildStatus = "MasterFailed"
         }

         notifySlack("", slackNotificationChannel, [
             [
                 title: "${env.JOB_NAME}, build #${env.BUILD_NUMBER}",
                 title_link: "${env.BUILD_URL}",
                 color: "danger",
                 author_name: "${author}",
                 text: "${buildStatus}",
                 fields: [
                     [
                         title: "Branch",
                         value: "${env.GIT_BRANCH}",
                         short: true
                     ],
                     [
                         title: "Test Results",
                         value: "${testSummary}",
                         short: true
                     ],
                     [
                         title: "Last Commit",
                         value: "${message}",
                         short: false
                     ],
                     [
                         title: "Error",
                         value: "${e}",
                         short: false
                     ]
                 ]
             ]
         ])

         throw e
     }
 }
