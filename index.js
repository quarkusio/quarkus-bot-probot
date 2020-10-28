const affectMilestone = require('./lib/affect-milestone')
const checkPullRequestEditorialRules = require('./lib/check-pull-request-editorial-rules')
const triageIssue = require('./lib/triage-issue')
const triagePullRequest = require('./lib/triage-pull-request')

module.exports = app => {
  app.log.info('quarkus-bot running...')

  app.on(['pull_request.opened', 'pull_request.edited'], checkPullRequestEditorialRules)
  app.on(['pull_request.opened', 'pull_request.edited'], triagePullRequest)
  app.on(['pull_request.closed'], affectMilestone)

  // triaging
  app.on(['issues.opened'], triageIssue)
}
