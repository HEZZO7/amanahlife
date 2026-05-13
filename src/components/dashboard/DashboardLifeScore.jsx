import React from 'react';
import { useI18n } from '@/lib/i18n';

export default function DashboardLifeScore({ score, spiritual, wellness }) {
  const { t } = useI18n();
  const pct = Math.min(100, Math.max(0, score || 0));
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const pillars = [
    { label: t('nav.spiritual'), value: spiritual?.score || 0, color: '#0B5B50' },
    { label: t('nav.wellness'), value: wellness?.score || 0, color: '#B89A5E' },
  ];

  return (
    <div className="rounded-xl p-5 mb-6 flex items-center gap-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="var(--mizan-border)" strokeWidth="6" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke="var(--mizan-emerald)" strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: 'var(--mizan-text)' }}>{pct}</span>
          <span className="text-[10px]" style={{ color: 'var(--mizan-text-secondary)' }}>Life Score</span>
        </div>
      </div>

      {/* Pillars */}
      <div className="flex-1 space-y-3">
        {pillars.map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
              <span style={{ color: 'var(--mizan-text)' }}>{value}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
              <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}