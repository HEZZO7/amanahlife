import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scheduled function — archives completed tasks older than 7 days.
 * Runs via service role (no user auth needed for scheduled context).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const completedTasks = await base44.asServiceRole.entities.Task.filter(
      { status: 'completed', is_archived: false },
      '-updated_date',
      500
    );

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let archivedCount = 0;

    for (const task of completedTasks) {
      const ref = task.completed_at
        ? new Date(task.completed_at)
        : task.updated_date
          ? new Date(task.updated_date)
          : null;

      if (ref && ref <= sevenDaysAgo) {
        await base44.asServiceRole.entities.Task.update(task.id, {
          is_archived: true,
          archived_at: now.toISOString(),
        });
        archivedCount++;
      }
    }

    return Response.json({
      success: true,
      archivedCount,
      message: `${archivedCount} task(s) archived`,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Archive tasks error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});