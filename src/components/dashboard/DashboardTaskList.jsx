import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

const PRIORITY_COLOR = { high: '#C0392B', medium: '#B89A5E', low: '#8A9B97' };

export default function DashboardTaskList({ tasks }) {
  const { t, language } = useI18n();
  const sorted = [...tasks].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return (p[a.priority] || 1) - (p[b.priority] || 1);
  });

  return (
    <div className="rounded-xl mb-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--mizan-border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {t('dashboard.todayTasks')}
        </span>
        <Link to="/planner" className="flex items-center gap-1 text-xs" style={{ color: 'var(--mizan-emerald)' }}>
          {language === 'ar' ? 'عرض الكل' : 'View all'} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--mizan-border)' }}>
        {sorted.slice(0, 5).map(task => (
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
      </div>
    </div>
  );
}