import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { AlertCircle, ChevronDown } from 'lucide-react';

export default function ZakatFitrInfo() {
  const { language } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const isArabic = language === 'ar';

  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-all"
      style={{
        borderLeft: '3px solid var(--mizan-gold)',
        backgroundColor: 'rgba(184, 154, 94, 0.08)',
        borderRadius: '12px',
        marginBottom: '20px',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: 'var(--mizan-gold)' }}
        />
        <div className="flex-1">
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: '#1F2937' }}
          >
            {isArabic ? 'مقدار زكاة الفطر' : 'Zakat al-Fitr Amount'}
          </p>
          {!expanded && (
            <p
              className="text-xs line-clamp-2"
              style={{ color: '#6B7280' }}
            >
              {isArabic
                ? 'المقدار المعتمد صاع واحد...'
                : 'The standard amount is one sa\'...'}
            </p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--mizan-gold)' }}
        />
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-10">
          <p
            className="text-xs leading-relaxed"
            style={{ color: '#6B7280' }}
          >
            {isArabic
              ? 'المقدار المعتمد صاع واحد (حوالي ٢٫٥–٣ كجم) من قوت البلد أو ما يعادله نقداً. تتفاوت المقادير بحسب البلد والرأي الفقهي.\n\nقطر: حوالي ١٥–٢٥ ريالاً للفرد\nالسعودية: حوالي ١٥–٣٠ ريالاً للفرد\nالإمارات: حوالي ٢٠–٢٥ درهماً للفرد\n\nهذه الأرقام تتغير سنوياً — تأكد من مسجدك أو الجهة الدينية المحلية قبل عيد الفطر.'
              : 'The standard amount is one sa\' (approximately 2.5–3kg) of the staple food of your region, or its monetary equivalent. Amounts vary by country and scholarly opinion.\n\nQatar: approximately 15–25 QAR per person\nSaudi Arabia: approximately 15–30 SAR per person\nUAE: approximately 20–25 AED per person\n\nThese figures change annually — confirm with your local mosque or Islamic authority before Eid al-Fitr.'}
            </p>
        </div>
      )}
    </div>
  );
}