module.exports = affectMilestone

async function affectMilestone (context) {
  const { title, merged } = context.payload.pull_request
  const targetBranch = context.payload.pull_request.base.ref

  if (!merged) {
    return
  }
  if (targetBranch != 'master' && targetBranch != 'main') {
    return
  }

  const milestone = await getMasterMilestone(context)
  if (milestone == null) {
    context.log.error("Unable to find the master milestone");
    return
  }

  // TODO we should also update all the linked issues

  const issueUpdate = context.issue({ milestone: milestone.number })
  return context.github.issues.update(issueUpdate);
}

async function getMasterMilestone(context) {
  const milestoneQuery = context.repo({ state: 'open' });
  const milestones = await context.github.issues.listMilestones(milestoneQuery)
  for (const milestone of milestones.data) {
    if (milestone.title.endsWith('- master')) {
      return milestone;
    }
  }
  return null;
}