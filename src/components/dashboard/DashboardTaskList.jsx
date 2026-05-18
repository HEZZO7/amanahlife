import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronRight, EyeOff, Eye, Archive, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PRIORITY_COLOR = { high: '#C0392B', medium: '#B89A5E', low: '#8A9B97' };

export default function DashboardTaskList({ tasks, onRefresh }) {
  const { t, language } = useI18n();
  const [hideCompleted, setHideCompleted] = useState(true);
  const [archiving, setArchiving] = useState(false);

  const sorted = [...tasks].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return (p[a.priority] || 1) - (p[b.priority] || 1);
  });

  const filtered = hideCompleted ? sorted.filter(t => t.status !== 'completed') : sorted;
  const completedCount = sorted.filter(t => t.status === 'completed').length;

  // المهام المكتملة منذ أكثر من أسبوع
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oldCompleted = sorted.filter(task => {
    if (task.status !== 'completed') return false;
    const completedAt = task.completed_at ? new Date(task.completed_at) : null;
    const updatedAt = task.updated_date ? new Date(task.updated_date) : null;
    const ref = completedAt || updatedAt;
    return ref && ref < oneWeekAgo;
  });

  const handleArchiveOld = async () => {
    if (oldCompleted.length === 0) return;
    setArchiving(true);
    const now = new Date().toISOString();
    await Promise.all(oldCompleted.map(task =>
      base44.entities.Task.update(task.id, { is_archived: true, archived_at: now })
    ));
    setArchiving(false);
    toast.success(
      language === 'ar'
        ? `تم أرشفة ${oldCompleted.length} مهمة`
        : `${oldCompleted.length} task(s) archived`
    );
    if (onRefresh) onRefresh();
  };

  return (
    <div className="rounded-xl mb-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--mizan-border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {t('dashboard.todayTasks')}
        </span>
        <div className="flex items-center gap-2">
          {oldCompleted.length > 0 && (
            <button
              onClick={handleArchiveOld}
              disabled={archiving}
              className="flex items-center gap-1 text-xs rounded-lg px-2 py-1 transition-colors"
              style={{ color: 'var(--mizan-gold)', background: '#B89A5E18' }}
              title={language === 'ar' ? `أرشفة ${oldCompleted.length} مهمة قديمة` : `Archive ${oldCompleted.length} old task(s)`}
            >
              {archiving
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Archive className="w-3 h-3" />
              }
              {language === 'ar' ? `أرشفة (${oldCompleted.length})` : `Archive (${oldCompleted.length})`}
            </button>
          )}
          {completedCount > 0 && (
            <button
              onClick={() => setHideCompleted(h => !h)}
              className="flex items-center gap-1 text-xs rounded-lg px-2 py-1 transition-colors"
              style={{
                color: hideCompleted ? 'var(--mizan-text-secondary)' : 'var(--mizan-emerald)',
                background: hideCompleted ? 'transparent' : 'var(--mizan-emerald)11',
              }}
            >
              {hideCompleted
                ? <><Eye className="w-3 h-3" /> {language === 'ar' ? `إظهار المكتملة (${completedCount})` : `Show done (${completedCount})`}</>
                : <><EyeOff className="w-3 h-3" /> {language === 'ar' ? 'إخفاء المكتملة' : 'Hide done'}</>
              }
            </button>
          )}
          <Link to="/planner" className="flex items-center gap-1 text-xs" style={{ color: 'var(--mizan-emerald)' }}>
            {language === 'ar' ? 'عرض الكل' : 'View all'} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--mizan-border)' }}>
        {filtered.slice(0, 5).map(task => (
          <div key={task.id} className="flex items-center gap-3 px-5 py-3">
            {task.status === 'completed'
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-emerald)' }} />
              : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-border)' }} />
            }
            <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--mizan-text)' }}>
              {task.title}
            </span>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLOR[task.priority] || '#8A9B97' }} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? '✅ جميع المهام مكتملة!' : '✅ All tasks completed!'}
          </div>
        )}
      </div>
    </div>
  );
}