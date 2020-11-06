const affectMilestone = require('./lib/affect-milestone')
const checkPullRequestEditorialRules = require('./lib/check-pull-request-editorial-rules')
const triageIssue = require('./lib/triage-issue')
const triagePullRequest = require('./lib/triage-pull-request')

module.exports = app => {
  const dryRun = process.env.DRY_RUN;

  app.log.info('quarkus-bot running...')
  if (dryRun) {
    app.log.warn("> running in dry-run mode")
  }

  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], triagePullRequest)

  if (!dryRun) {
    app.on(['pull_request.opened'], checkPullRequestEditorialRules)
    app.on(['pull_request.closed'], affectMilestone)
    app.on(['issues.opened'], triageIssue)
  } else {
    app.on(['pull_request.opened', 'pull_request.edited'], checkPullRequestEditorialRules)
    app.on(['pull_request.closed', 'pull_request.edited'], affectMilestone)
    app.on(['issues.opened', 'issues.edited'], triageIssue)
  }
}
