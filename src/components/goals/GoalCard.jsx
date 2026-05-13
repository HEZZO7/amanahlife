import React from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { ChevronRight, CheckCircle2, Pause, Play } from 'lucide-react';

const CAT_COLORS = { personal: '#0B5B50', financial: '#B89A5E', spiritual: '#12897A', family: '#0B5B50', health: '#27AE60' };

export default function GoalCard({ goal, onClick, onRefresh }) {
  const { t } = useI18n();
  const progress = goal.progress || 0;

  const handleStatus = async (e, newStatus) => {
    e.stopPropagation();
    await base44.entities.Goal.update(goal.id, { status: newStatus });
    onRefresh();
  };

  return (
    <div onClick={onClick} className="p-4 rounded-xl cursor-pointer hover:opacity-90 transition-all" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold" style={{ background: CAT_COLORS[goal.category] || 'var(--mizan-emerald)' }}>
          {goal.title[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--mizan-text)' }}>{goal.title}</p>
            <span className="text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0" style={{ background: CAT_COLORS[goal.category] + '22', color: CAT_COLORS[goal.category] || 'var(--mizan-emerald)' }}>{t(`goal.${goal.category}`)}</span>
          </div>
          <div className="h-1.5 rounded-full mb-1" style={{ background: 'var(--mizan-border)' }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, background: CAT_COLORS[goal.category] || 'var(--mizan-emerald)' }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{Math.round(progress)}% · {goal.status}</p>
        </div>
        <div className="flex items-center gap-1">
          {goal.status === 'active' && (
            <button onClick={(e) => handleStatus(e, 'completed')} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            </button>
          )}
          {goal.status === 'active' && (
            <button onClick={(e) => handleStatus(e, 'paused')} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity">
              <Pause className="w-4 h-4" style={{ color: 'var(--mizan-gold)' }} />
            </button>
          )}
          {goal.status === 'paused' && (
            <button onClick={(e) => handleStatus(e, 'active')} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity">
              <Play className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            </button>
          )}
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
        </div>
      </div>
    </div>
  );
}