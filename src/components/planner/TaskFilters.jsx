import React from 'react';
import { useI18n } from '@/lib/i18n';
import { CalendarCheck, Flag, Layers } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'all', en: 'All', ar: 'الكل' },
  { value: 'high', en: 'High', ar: 'عالية' },
  { value: 'medium', en: 'Medium', ar: 'متوسطة' },
  { value: 'low', en: 'Low', ar: 'منخفضة' },
];

const STATUS_OPTIONS = [
  { value: 'all', en: 'All', ar: 'الكل' },
  { value: 'pending', en: 'Pending', ar: 'معلقة' },
  { value: 'in_progress', en: 'In Progress', ar: 'جارية' },
  { value: 'completed', en: 'Done', ar: 'مكتملة' },
];

const PRIORITY_DOTS = { high: 'var(--mizan-red)', medium: 'var(--mizan-gold)', low: 'var(--mizan-emerald)' };

export default function TaskFilters({ filters, onChange }) {
  const { language } = useI18n();
  const lang = language;

  const chip = (val, active, onClick, dot) => (
    <button
      key={val}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        background: active ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
        color: active ? 'white' : 'var(--mizan-text-secondary)',
        border: `1px solid ${active ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
      }}
    >
      {dot && val !== 'all' && <span className="w-2 h-2 rounded-full inline-block" style={{ background: PRIORITY_DOTS[val] }} />}
      {val === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : (lang === 'ar' ? (PRIORITY_OPTIONS.find(o => o.value === val) || STATUS_OPTIONS.find(o => o.value === val))?.ar : (PRIORITY_OPTIONS.find(o => o.value === val) || STATUS_OPTIONS.find(o => o.value === val))?.en)}
    </button>
  );

  return (
    <div className="rounded-xl p-3 space-y-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      {/* Today toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange({ ...filters, todayOnly: !filters.todayOnly })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: filters.todayOnly ? 'var(--mizan-gold)' : 'var(--mizan-elevated)',
            color: filters.todayOnly ? 'white' : 'var(--mizan-text-secondary)',
            border: `1px solid ${filters.todayOnly ? 'var(--mizan-gold)' : 'var(--mizan-border)'}`,
          }}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'مهام اليوم فقط' : "Today's Tasks Only"}
        </button>
      </div>

      {/* Priority row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 mr-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          <Flag className="w-3 h-3" />
          <span className="text-xs font-semibold">{lang === 'ar' ? 'الأولوية:' : 'Priority:'}</span>
        </div>
        {PRIORITY_OPTIONS.map(opt => chip(
          opt.value,
          filters.priority === opt.value,
          () => onChange({ ...filters, priority: opt.value }),
          true
        ))}
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 mr-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          <Layers className="w-3 h-3" />
          <span className="text-xs font-semibold">{lang === 'ar' ? 'الحالة:' : 'Status:'}</span>
        </div>
        {STATUS_OPTIONS.map(opt => chip(
          opt.value,
          filters.status === opt.value,
          () => onChange({ ...filters, status: opt.value }),
          false
        ))}
      </div>
    </div>
  );
}