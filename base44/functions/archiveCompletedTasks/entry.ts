import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all completed tasks that aren't archived
    const completedTasks = await base44.entities.Task.filter(
      { status: 'completed', is_archived: false },
      '-updated_date',
      500
    );

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let archivedCount = 0;

    for (const task of completedTasks) {
      // Check if completed_at is more than 7 days ago
      if (task.completed_at) {
        const completedDate = new Date(task.completed_at);
        if (completedDate <= sevenDaysAgo) {
          await base44.entities.Task.update(task.id, {
            is_archived: true,
            archived_at: now.toISOString(),
          });
          archivedCount++;
        }
      }
    }

    return Response.json({
      success: true,
      archivedCount,
      message: `${archivedCount} task(s) archived`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});