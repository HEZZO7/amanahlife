import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { X, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';

export default function DashboardInsights({ insights }) {
  const { language } = useI18n();
  const [dismissed, setDismissed] = useState([]);

  const visible = insights.filter(i => !dismissed.includes(i.id));
  if (!visible.length) return null;

  const handleDismiss = async (id) => {
    setDismissed(p => [...p, id]);
    await base44.entities.AIInsight.update(id, { is_dismissed: true });
  };

  const handleFeedback = async (id, helpful) => {
    await base44.entities.AIInsight.update(id, { is_helpful: helpful });
  };

  return (
    <div className="mb-6 space-y-3">
      {visible.map(insight => (
        <div key={insight.id} className="rounded-xl p-4 flex gap-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mizan-emerald)' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? insight.content_ar : insight.content_en}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => handleFeedback(insight.id, true)}>
                <ThumbsUp className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
              </button>
              <button onClick={() => handleFeedback(insight.id, false)}>
                <ThumbsDown className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
              </button>
            </div>
          </div>
          <button onClick={() => handleDismiss(insight.id)} className="flex-shrink-0">
            <X className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
        </div>
      ))}
    </div>
  );
}