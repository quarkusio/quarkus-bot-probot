module.exports = markClosedPullRequestInvalid

async function markClosedPullRequestInvalid (context) {
  const dryRun = process.env.DRY_RUN;
  const pullRequest = context.payload.pull_request

  if (pullRequest.merged) {
    return
  }

  if (!dryRun) {
    const issueUpdate = context.issue({ labels: [ 'triage/invalid' ] });
    await context.github.issues.addLabels(issueUpdate);
  } else {
    context.log.warn("Pull request #" + pullRequest.number + " - Add label: triage/invalid")
  }
}
