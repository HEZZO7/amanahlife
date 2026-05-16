import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const milestoneId = payload?.event?.entity_id;
    const milestoneData = payload?.data;

    if (!milestoneData?.goal_id) {
      return Response.json({ skipped: true, reason: 'no goal_id' });
    }

    const goalId = milestoneData.goal_id;

    // Fetch all milestones for this goal
    const milestones = await base44.asServiceRole.entities.Milestone.filter({ goal_id: goalId });

    if (!milestones || milestones.length === 0) {
      return Response.json({ skipped: true, reason: 'no milestones found' });
    }

    const total = milestones.length;
    const completed = milestones.filter(m => m.is_completed === true).length;
    const progress = Math.round((completed / total) * 100);

    // Update goal progress
    await base44.asServiceRole.entities.Goal.update(goalId, { progress });

    // If all milestones completed, mark goal as completed
    if (progress === 100) {
      await base44.asServiceRole.entities.Goal.update(goalId, { progress, status: 'completed' });
    }

    return Response.json({ success: true, goalId, total, completed, progress });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});