import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Settings2, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DEFAULT_WIDGETS = ['prayers', 'tasks', 'finance', 'goals', 'insights', 'todayTasks', 'lifeReview'];

export function DashboardCustomizer({ widgets, onChange }) {
  const { language } = useI18n();
  const [open, setOpen] = useState(false);

  const WIDGET_LABELS = {
    prayers:    { ar: 'الصلوات', en: 'Prayers' },
    tasks:      { ar: 'المهام', en: 'Tasks' },
    finance:    { ar: 'الميزانية', en: 'Finance' },
    goals:      { ar: 'الأهداف', en: 'Goals' },
    insights:   { ar: 'رؤى الذكاء الاصطناعي', en: 'AI Insights' },
    todayTasks: { ar: 'مهام اليوم', en: "Today's Tasks" },
    lifeReview: { ar: 'مراجعة الحياة', en: 'Life Review' },
  };

  const toggle = (key) => {
    if (widgets.includes(key)) {
      onChange(widgets.filter(w => w !== key));
    } else {
      onChange([...widgets, key]);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
        style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
        title={language === 'ar' ? 'تخصيص اللوحة' : 'Customize Dashboard'}
      >
        <Settings2 className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bottom-sheet-overlay"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl flex flex-col bottom-sheet-content"
            style={{
              background: 'var(--mizan-surface)',
              border: '1px solid var(--mizan-border)',
              maxHeight: '85vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — fixed inside modal */}
            <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
              <h3 className="font-bold text-sm" style={{ color: 'var(--mizan-text)' }}>
                {language === 'ar' ? 'تخصيص لوحة التحكم' : 'Customize Dashboard'}
              </h3>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
              </button>
            </div>

            <p className="text-xs px-5 pb-3 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'اختر البطاقات التي تريد إظهارها' : 'Choose which cards to display'}
            </p>

            {/* Scrollable list */}
            <div className="overflow-y-auto flex-1 px-5 space-y-2">
              {Object.entries(WIDGET_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--mizan-text-secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--mizan-text)' }}>
                      {language === 'ar' ? label.ar : label.en}
                    </span>
                  </div>
                  <button
                    onClick={() => toggle(key)}
                    className="w-10 h-6 rounded-full transition-all flex items-center px-0.5"
                    style={{ background: widgets.includes(key) ? 'var(--mizan-emerald)' : 'var(--mizan-border)' }}
                  >
                    <div
                      className="w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{ transform: widgets.includes(key) ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Done button — pinned at bottom of sheet */}
            <div className="flex-shrink-0 px-5 pt-4 pb-5">
              <Button
                onClick={() => setOpen(false)}
                className="w-full h-10 rounded-xl text-white"
                style={{ background: 'var(--mizan-emerald)' }}
              >
                {language === 'ar' ? 'تم' : 'Done'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}