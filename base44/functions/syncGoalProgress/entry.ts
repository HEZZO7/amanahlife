import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Recalculates goal progress based on both Milestones and Tasks linked to the goal.
// Progress = (completed milestones + completed tasks) / (total milestones + total tasks) * 100
// Called by two automations: one on Milestone update, one on Task update.

async function recalcGoalProgress(base44, goalId) {
  const [milestones, tasks] = await Promise.all([
    base44.asServiceRole.entities.Milestone.filter({ goal_id: goalId }),
    base44.asServiceRole.entities.Task.filter({ goal_id: goalId }),
  ]);

  const allItems = [...(milestones || []), ...(tasks || [])];
  if (allItems.length === 0) return { skipped: true, reason: 'no linked items' };

  const total = allItems.length;
  const completed = allItems.filter(
    item => item.is_completed === true || item.status === 'completed'
  ).length;

  const progress = Math.round((completed / total) * 100);
  const updateData = { progress };
  if (progress === 100) updateData.status = 'completed';

  await base44.asServiceRole.entities.Goal.update(goalId, updateData);

  return { success: true, goalId, total, completed, progress };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const entityData = payload?.data;
    const goalId = entityData?.goal_id;

    if (!goalId) {
      return Response.json({ skipped: true, reason: 'no goal_id on entity' });
    }

    const result = await recalcGoalProgress(base44, goalId);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});