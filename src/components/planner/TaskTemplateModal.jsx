import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TASK_TEMPLATES } from '@/lib/taskTemplates';
import { X, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaskTemplateModal({ onClose, onSave, defaultDate, language }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const lang = language || 'ar';

  const template = TASK_TEMPLATES.find(t => t.id === selected);

  const handleApply = async () => {
    if (!template) return;
    setLoading(true);
    const today = defaultDate || new Date().toISOString().split('T')[0];
    await Promise.all(
      template.tasks.map(task =>
        base44.entities.Task.create({
          title: lang === 'ar' ? task.title_ar : task.title_en,
          priority: task.priority,
          due_date: today,
          due_time: task.due_time || '',
          status: 'pending',
          recurring: 'none',
        })
      )
    );
    setLoading(false);
    setDone(true);
    setTimeout(() => { onSave(); }, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bottom-sheet-overlay" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full max-w-md rounded-2xl p-5 max-h-[85vh] overflow-y-auto bottom-sheet-content"
        style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--mizan-text)' }}>
              {lang === 'ar' ? 'قوالب المهام' : 'Task Templates'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
              {lang === 'ar' ? 'اختر قالباً لإنشاء المهام تلقائياً' : 'Choose a template to auto-create tasks'}
            </p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>

        {/* Template list */}
        {!selected && (
          <div className="space-y-2">
            {TASK_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl text-start transition-all hover:opacity-90"
                style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
              >
                <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ background: t.color + '18' }}>
                  {t.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
                    {lang === 'ar' ? t.title_ar : t.title_en}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {t.tasks.length} {lang === 'ar' ? 'مهام' : 'tasks'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }} />
              </button>
            ))}
          </div>
        )}

        {/* Template preview */}
        {selected && template && !done && (
          <div>
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-xs mb-4"
              style={{ color: 'var(--mizan-text-secondary)' }}
            >
              ← {lang === 'ar' ? 'رجوع' : 'Back'}
            </button>

            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
              style={{ background: template.color + '12', border: `1px solid ${template.color}33` }}>
              <span className="text-2xl">{template.icon}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--mizan-text)' }}>
                  {lang === 'ar' ? template.title_ar : template.title_en}
                </p>
                <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {lang === 'ar' ? `سيتم إنشاء ${template.tasks.length} مهام ليوم ${defaultDate || 'اليوم'}` : `Creates ${template.tasks.length} tasks for ${defaultDate || 'today'}`}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 mb-5">
              {template.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg"
                  style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: template.color + '22', color: template.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--mizan-text)' }}>
                      {lang === 'ar' ? task.title_ar : task.title_en}
                    </p>
                    {task.due_time && (
                      <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>🕐 {task.due_time}</p>
                    )}
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: task.priority === 'high' ? '#C0392B18' : task.priority === 'medium' ? '#B89A5E18' : 'var(--mizan-border)',
                      color: task.priority === 'high' ? 'var(--mizan-red)' : task.priority === 'medium' ? 'var(--mizan-gold)' : 'var(--mizan-text-secondary)',
                    }}>
                    {task.priority === 'high' ? (lang === 'ar' ? 'عالية' : 'High') :
                     task.priority === 'medium' ? (lang === 'ar' ? 'متوسطة' : 'Med') :
                     (lang === 'ar' ? 'منخفضة' : 'Low')}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleApply}
              disabled={loading}
              className="w-full h-11 rounded-xl text-white gap-2"
              style={{ background: template.color }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />{lang === 'ar' ? 'جارٍ الإنشاء...' : 'Creating...'}</>
                : (lang === 'ar' ? `✨ إنشاء ${template.tasks.length} مهام الآن` : `✨ Create ${template.tasks.length} tasks now`)
              }
            </Button>
          </div>
        )}

        {/* Success */}
        {done && (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--mizan-emerald)' }} />
            <p className="font-semibold" style={{ color: 'var(--mizan-text)' }}>
              {lang === 'ar' ? 'تم إنشاء المهام بنجاح!' : 'Tasks created successfully!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}