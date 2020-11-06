module.exports = triageIssue

async function triageIssue (context) {
  const dryRun = process.env.DRY_RUN;
  const issue = context.payload.issue
  const config = await context.config('quarkus-bot.yml')
  const triageConfig = config.triage

  if (!triageConfig) {
    context.log.error("Unable to find triage configuration.")
    return
  }

  let triaged = false
  let labels = []
  let mentions = []

  for (const rule of triageConfig.rules) {
    if (matchRule(context, rule, issue)) {
      if (rule.labels) {
        labels = labels.concat(rule.labels)
      }
      if (rule.notify) {
        mentions = mentions.concat(rule.notify.filter(mention => mention != issue.user.login))
      }
      triaged = true
    }
  }

  labels = unique(labels)
  mentions = unique(mentions)

  if (labels.length > 0) {
    if (!dryRun) {
      const issueUpdate = context.issue({ labels: labels });
      await context.github.issues.addLabels(issueUpdate);
    } else {
      context.log.warn("Issue #" + issue.number + " - Add labels: " + labels)
    }
  }
  if (mentions.length > 0) {
    mentions.sort()
    if (!dryRun) {
      const issueComment = context.issue({ body: '/cc @' +  mentions.join(', @')})
      await context.github.issues.createComment(issueComment)
    } else {
      context.log.warn("Issue #" + issue.number + " - Mentions: " + mentions)
    }
  }

  if (!triaged && !hasAreaLabel(issue)) {
    if (!dryRun) {
      const issueUpdate = context.issue({ labels: [ 'triage/needs-triage' ] });
      await context.github.issues.addLabels(issueUpdate);
    } else {
      context.log.warn("Issue #" + issue.number + " - Add label: triage/needs-triage")
    }
  }
}

function matchRule (context, rule, issue) {
  if (rule.titleBody) {
    try {
      if (issue.title.match(new RegExp(rule.titleBody, 'i'))
          || issue.body.match(new RegExp(rule.titleBody, 'i'))) {
        return true
      }
    } catch (error) {
      context.log.error("Error evaluating regular expression: " + rule.titleBody + "\n" + error)
    }
  }
  if (rule.title) {
    try {
      if (issue.title.match(new RegExp(rule.title, 'i'))) {
        return true
      }
    } catch (error) {
      context.log.error("Error evaluating regular expression: " + rule.title + "\n" + error)
    }
  }
  if (rule.body) {
    try {
      if (issue.body.match(new RegExp(rule.body, 'i'))) {
        return true
      }
    } catch (error) {
      context.log.error("Error evaluating regular expression: " + rule.body + "\n" + error)
    }
  }
  if (rule.expression) {
    const expressionFunction = new Function("title, body, titleBody", "return (" + rule.expression + ")")
    try {
      if (expressionFunction(issue.title, issue.body, issue.title + "\n\n" + issue.body)) {
        return true;
      }
    } catch (error) {
      context.log.error("Error evaluating expression: " + rule.expression + "\n" + error)
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

function unique (array) {
  return [...new Set(array)];
}
