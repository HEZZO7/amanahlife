import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OverdueTasksBanner({ tasks, onTaskClick, onDismiss }) {
  const { language } = useI18n();
  const now = new Date();

  const overdueTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        const dueDate = new Date(t.due_date);
        return dueDate < now && (t.status === 'pending' || t.status === 'in_progress');
      })
      .sort((a, b) => {
        const daysA = Math.floor((now.getTime() - new Date(a.due_date).getTime()) / (1000 * 60 * 60 * 24));
        const daysB = Math.floor((now.getTime() - new Date(b.due_date).getTime()) / (1000 * 60 * 60 * 24));
        return daysB - daysA;
      });
  }, [tasks, now]);

  if (overdueTasks.length === 0) return null;

  const getMostUrgent = () => {
    const daysOverdue = Math.floor((now.getTime() - new Date(overdueTasks[0].due_date).getTime()) / (1000 * 60 * 60 * 24));
    return { task: overdueTasks[0], daysOverdue };
  };

  const { task, daysOverdue } = getMostUrgent();

  return (
    <div className="mb-4 rounded-xl p-3 sm:p-4 flex items-start gap-3" style={{ background: '#C0392B15', border: '1px solid #C0392B' }}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C0392B' }} />
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm sm:text-base" style={{ color: '#C0392B' }}>
          {language === 'ar' ? `⚠️ لديك ${overdueTasks.length} مهمة متأخرة` : `⚠️ You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`}
        </div>
        <div className="text-xs sm:text-sm mt-1 line-clamp-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar'
            ? `الأكثر استعجالية: "${task.title}" (متأخرة منذ ${daysOverdue} يوم)`
            : `Most urgent: "${task.title}" (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue)`}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => onTaskClick?.(task)}
          style={{ color: '#C0392B' }}
        >
          {language === 'ar' ? 'تعديل' : 'Fix'}
        </Button>
        <button
          onClick={onDismiss}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/10 transition"
        >
          <X className="w-4 h-4" style={{ color: '#C0392B' }} />
        </button>
      </div>
    </div>
  );
}