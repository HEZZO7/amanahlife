import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, RotateCcw, Calendar } from 'lucide-react';

export default function Archive() {
  const { t, language } = useI18n();
  const lang = language || 'ar';
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  const load = async () => {
    setLoading(true);
    const tasks = await base44.entities.Task.filter(
      { is_archived: true },
      '-archived_at',
      200
    );
    setArchivedTasks(tasks || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRestore = async (taskId) => {
    await base44.entities.Task.update(taskId, {
      is_archived: false,
      archived_at: null,
    });
    load();
  };

  const handleDelete = async (taskId) => {
    await base44.entities.Task.delete(taskId);
    load();
  };

  const filteredTasks = archivedTasks.filter(t =>
    filter === 'all' ? true : t.priority === filter
  );

  const priorityColors = {
    high: 'var(--mizan-red)',
    medium: 'var(--mizan-gold)',
    low: 'var(--mizan-green)',
  };

  const archivedCount = archivedTasks.length;
  const highCount = archivedTasks.filter(t => t.priority === 'high').length;
  const mediumCount = archivedTasks.filter(t => t.priority === 'medium').length;
  const lowCount = archivedTasks.filter(t => t.priority === 'low').length;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {lang === 'ar' ? '📦 الأرشيف' : '📦 Archive'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? 'إنجازاتك السابقة' : 'Your past achievements'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: lang === 'ar' ? 'الكل' : 'All', count: archivedCount, active: filter === 'all', color: 'var(--mizan-emerald)', key: 'all' },
          { label: lang === 'ar' ? 'عالية' : 'High', count: highCount, active: filter === 'high', color: 'var(--mizan-red)', key: 'high' },
          { label: lang === 'ar' ? 'متوسطة' : 'Medium', count: mediumCount, active: filter === 'medium', color: 'var(--mizan-gold)', key: 'medium' },
          { label: lang === 'ar' ? 'منخفضة' : 'Low', count: lowCount, active: filter === 'low', color: 'var(--mizan-green)', key: 'low' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className="p-3 rounded-xl text-center transition-all"
            style={{
              background: item.active ? item.color + '22' : 'var(--mizan-surface)',
              border: `2px solid ${item.active ? item.color : 'var(--mizan-border)'}`,
              color: item.active ? item.color : 'var(--mizan-text)',
            }}
          >
            <div className="text-lg font-bold">{item.count}</div>
            <div className="text-xs">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--mizan-text)' }}>
            {lang === 'ar' ? '📭 لا توجد مهام مؤرشفة' : '📭 No archived tasks'}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar'
              ? 'المهام المكتملة تُؤرشف تلقائياً بعد أسبوع من الإنجاز'
              : 'Completed tasks are automatically archived after a week'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="p-4 rounded-xl group"
              style={{
                background: 'var(--mizan-surface)',
                border: '1px solid var(--mizan-border)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-through" style={{ color: 'var(--mizan-text)' }}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {task.archived_at && (
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                        <Calendar className="w-3 h-3" />
                        {lang === 'ar' ? 'أُرشّف: ' : 'Archived: '}
                        {format(new Date(task.archived_at), lang === 'ar' ? 'dd MMM yyyy' : 'MMM dd, yyyy')}
                      </span>
                    )}
                    <span
                      className="text-[10px] px-2 py-1 rounded-full"
                      style={{
                        background: priorityColors[task.priority] + '22',
                        color: priorityColors[task.priority],
                      }}
                    >
                      {lang === 'ar'
                        ? task.priority === 'high'
                          ? 'عالية'
                          : task.priority === 'medium'
                          ? 'متوسطة'
                          : 'منخفضة'
                        : task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(task.id)}
                    className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ background: 'var(--mizan-emerald)' }}
                    title={lang === 'ar' ? 'استرجاع' : 'Restore'}
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ background: 'var(--mizan-red)' }}
                    title={lang === 'ar' ? 'حذف نهائي' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}