import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

export default function UsageLimitBanner({ used, limit, label, onUpgrade }) {
  const { language } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const pct = Math.round((used / limit) * 100);

  if (pct < 80 || dismissed) return null;

  const isAtLimit = pct >= 100;

  return (
    <div className="mx-6 mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: isAtLimit ? '#C0392B18' : '#B89A5E18', border: `1px solid ${isAtLimit ? 'var(--mizan-red)' : 'var(--mizan-gold)'}` }}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: isAtLimit ? 'var(--mizan-red)' : 'var(--mizan-gold)' }} />
      <div className="flex-1">
        <p className="text-xs font-medium" style={{ color: isAtLimit ? 'var(--mizan-red)' : 'var(--mizan-gold)' }}>
          {isAtLimit
            ? (language === 'ar' ? `وصلت إلى الحد الأقصى للـ${label}` : `${label} limit reached`)
            : (language === 'ar' ? `وصلت إلى ${pct}% من حد ${label}` : `${pct}% of ${label} limit used`)}
        </p>
        <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{used}/{limit} {language === 'ar' ? 'مستخدم' : 'used'}</p>
      </div>
      <Button onClick={onUpgrade} size="sm" className="h-7 text-xs text-white rounded-lg flex-shrink-0" style={{ background: isAtLimit ? 'var(--mizan-red)' : 'var(--mizan-gold)' }}>
        {language === 'ar' ? 'ترقية' : 'Upgrade'}
      </Button>
      <button onClick={() => setDismissed(true)} className="flex-shrink-0">
        <X className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
      </button>
    </div>
  );
}