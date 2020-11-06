module.exports = triagePullRequest

const micromatch = require("micromatch")

async function triagePullRequest (context) {
  const dryRun = process.env.DRY_RUN;
  const action = context.payload.action
  const pullRequest = context.payload.pull_request
  const config = await context.config('quarkus-bot.yml')
  const triageConfig = config.triage

  if (!triageConfig) {
    context.log.error("Unable to find triage configuration.")
    return
  }

  const files = await context.github.paginate(context.github.pulls.listFiles, context.pullRequest())

  let labels = []
  let mentions = []

  for (const rule of triageConfig.rules) {
    if (matchRule(context, rule, pullRequest, files)) {
      if (rule.labels) {
        labels = labels.concat(rule.labels)
      }
      if (rule.notify && rule.notifyInPullRequest && action == 'opened') {
        mentions = mentions.concat(rule.notify.filter(mention => mention != pullRequest.user.login))
      }
    }
  }

  labels = unique(labels)
  mentions = unique(mentions)

  if (labels.length > 0) {
    if (!dryRun) {
      const issueUpdate = context.issue({ labels: labels });
      await context.github.issues.addLabels(issueUpdate);
    } else {
      context.log.warn("Pull request #" + pullRequest.number + " - Add labels: " + labels)
    }
  }
  if (mentions.length > 0) {
    mentions.sort()
    if (!dryRun) {
      const issueComment = context.issue({ body: '/cc @' +  mentions.join(', @')})
      await context.github.issues.createComment(issueComment)
    } else {
      context.log.warn("Pull request #" + pullRequest.number + " - Mentions: " + mentions)
    }
  }
}

function matchRule (context, rule, pullRequest, files) {
  // for now, we only use the files but we could also use the other rules at some point
  if (!rule.directories) {
    return false
  }
  for (const file of files) {
    for (const directory of rule.directories) {
      if (!directory.includes('*')) {
        // simple directory match
        if (file.filename.startsWith(directory)) {
          return true
        }
      } else {
        if (micromatch.isMatch(file.filename, directory)) {
          return true;
        }
      }
    }
  }
  return false
}

function unique (array) {
  return [...new Set(array)];
}
