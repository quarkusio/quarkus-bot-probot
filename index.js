const affectMilestone = require('./lib/affect-milestone')
const checkPullRequestEditorialRules = require('./lib/check-pull-request-editorial-rules')

module.exports = app => {
  app.log.info('quarkus-bot running...')

  app.on(['pull_request.opened', 'pull_request.edited'], checkPullRequestEditorialRules)
  app.on(['pull_request.closed'], affectMilestone)
}
