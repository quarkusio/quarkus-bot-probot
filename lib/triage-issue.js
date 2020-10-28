module.exports = triageIssue

async function triageIssue (context) {
  const issue = context.payload.issue
  const config = await context.config('quarkus-bot.yml')
  const triageConfig = config.triage

  let triaged = false
  for (const rule of triageConfig.rules) {
    if (matchRule(rule, issue)) {
      if (rule.labels) {
        const issueUpdate = context.issue({ labels: rule.labels });
        await context.github.issues.addLabels(issueUpdate);
      }
      if (rule.notify) {
        const mentions = rule.notify.filter(mention => mention != issue.user.login)
        mentions.sort()
        if (mentions.length > 0) {
          const issueComment = context.issue({ body: '/cc @' +  mentions.join(', @')})
          await context.github.issues.createComment(issueComment)
        }
      }
      triaged = true
    }
  }

  if (!triaged && !hasAreaLabel(issue)) {
    const issueUpdate = context.issue({ labels: [ 'triage/needs-triage' ] });
    await context.github.issues.addLabels(issueUpdate);
  }
}

function matchRule (rule, issue) {
  if (rule.titleBody) {
    if (issue.title.match(new RegExp(rule.titleBody, 'i'))
        || issue.body.match(new RegExp(rule.titleBody, 'i'))) {
      return true
    }
  }
  if (rule.title) {
    if (issue.title.match(new RegExp(rule.title, 'i'))) {
      return true
    }
  }
  if (rule.body) {
    if (issue.body.match(new RegExp(rule.body, 'i'))) {
      return true
    }
  }
  return false
}

function hasAreaLabel (issue) {
  for (const label of issue.labels) {
    if (label.name.startsWith('area/')) {
      return true;
    }
  }
  return false;
}
