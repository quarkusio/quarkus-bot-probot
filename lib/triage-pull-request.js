module.exports = triagePullRequest

async function triagePullRequest (context) {
  const pullRequest = context.payload.pull_request
  const config = await context.config('quarkus-bot.yml')
  const triageConfig = config.triage

  const files = await context.github.paginate(context.github.pulls.listFiles, context.pullRequest())

  if (!files) {
    return;
  }

  for (const rule of triageConfig.rules) {
    if (matchRule(context, rule, pullRequest, files)) {
      if (rule.labels) {
        const issueUpdate = context.issue({ labels: rule.labels });
        await context.github.issues.addLabels(issueUpdate);
      }

      if (rule.notify) {
        const mentions = rule.notify.filter(mention => mention != pullRequest.user.login)
        mentions.sort()
        if (mentions.length > 0) {
          const issueComment = context.issue({ body: '/cc @' +  mentions.join(', @')})
          await context.github.issues.createComment(issueComment)
        }
      }
      triaged = true
    }
  }
}

function matchRule (context, rule, pullRequest, files) {
  // for now, we only use the files but we could also use the title and body
  if (!rule.directories) {
    return false
  }
  for (const file of files) {
    for (const directory of rule.directories) {
      if (file.filename.startsWith(directory)) {
        return true
      }
    }
  }
  return false
}
