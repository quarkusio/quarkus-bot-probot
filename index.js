const affectMilestone = require('./lib/affect-milestone')
const checkPullRequestEditorialRules = require('./lib/check-pull-request-editorial-rules')
const triageIssue = require('./lib/triage-issue')
const triagePullRequest = require('./lib/triage-pull-request')
const markClosedPullRequestInvalid = require('./lib/mark-closed-pull-request-invalid')

module.exports = app => {
  const dryRun = process.env.DRY_RUN;

  app.log.info('quarkus-bot running...')
  if (dryRun) {
    app.log.warn("> running in dry-run mode")
  }

  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], triagePullRequest)
  app.on(['pull_request.closed'], affectMilestone)
  app.on(['pull_request.closed'], markClosedPullRequestInvalid)

  if (!dryRun) {
    app.on(['pull_request.opened'], checkPullRequestEditorialRules)
    app.on(['issues.opened'], triageIssue)
  } else {
    app.on(['pull_request.opened', 'pull_request.edited'], checkPullRequestEditorialRules)
    app.on(['issues.opened', 'issues.edited'], triageIssue)
  }
}
