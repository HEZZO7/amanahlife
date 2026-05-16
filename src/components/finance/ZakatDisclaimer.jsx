import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { AlertCircle, ChevronDown } from 'lucide-react';

export default function ZakatDisclaimer() {
  const { language } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [expandedNisab, setExpandedNisab] = useState(false);

  const isArabic = language === 'ar';

  return (
    <div className="space-y-3 mb-5">
      {/* Main Disclaimer Card */}
      <div
        className="rounded-xl p-4 cursor-pointer transition-all"
        style={{
          borderLeft: '3px solid var(--mizan-gold)',
          backgroundColor: 'rgba(184, 154, 94, 0.08)',
          borderRadius: '12px',
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
              {isArabic ? 'تقدير الزكاة — ليس فتوى شرعية' : 'Zakat Estimate — Not a Religious Ruling'}
            </p>
            {!expanded && (
              <p
                className="text-xs line-clamp-2"
                style={{ color: '#6B7280' }}
              >
                {isArabic
                  ? 'يوفر هذا الحاسب تقديراً استناداً إلى نصاب الحنفية...'
                  : 'This calculator provides an estimate based on the Hanafi nisab threshold...'}
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
                ? 'يوفر هذا الحاسب تقديراً استناداً إلى نصاب الحنفية (قيمة ٨٧٫٤٨ جرام ذهب أو ٦١٢٫٣٦ جرام فضة، أيهما أقل) ومعدل ٢٫٥٪ على صافي الأموال الزكوية التي مضى عليها حول كامل. تختلف أحكام الزكاة بين المذاهب وأنواع الأصول والآراء الفقهية. يُرجى استشارة عالم شرعي متخصص أو مؤسسة زكاة معتمدة لحالتك الخاصة.'
                : 'This calculator provides an estimate based on the Hanafi nisab threshold (value of 87.48g of gold or 612.36g of silver, whichever is lower) and the standard 2.5% rate on net zakatable assets held for one full lunar year (hawl). Zakat rules differ across schools of thought, asset types, and scholarly opinions. Please consult a qualified Islamic scholar or certified zakat institution for your specific situation.'}
            </p>
          </div>
        )}
      </div>

      {/* Nisab Reference */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: 'var(--mizan-elevated)',
          border: '1px solid var(--mizan-border)',
        }}
      >
        <p
          className="text-xs font-semibold mb-3"
          style={{ color: 'var(--mizan-text)' }}
        >
          {isArabic ? 'قيم النصاب (تقريبية)' : 'Nisab Reference Values (Approximate)'}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span
              className="text-xs"
              style={{ color: 'var(--mizan-text-secondary)' }}
            >
              {isArabic ? 'نصاب الذهب:' : 'Gold Nisab:'}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>
              87.48g
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-xs"
              style={{ color: 'var(--mizan-text-secondary)' }}
            >
              {isArabic ? 'نصاب الفضة:' : 'Silver Nisab:'}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>
              612.36g
            </span>
          </div>
        </div>
        <p
          className="text-xs italic mt-2"
          style={{ color: 'var(--mizan-text-secondary)' }}
        >
          {isArabic
            ? 'ملاحظة: تتقلب قيم النصاب يومياً مع أسعار السلع الأساسية.'
            : 'Note: Nisab values fluctuate daily with commodity prices.'}
        </p>
      </div>

      {/* Nisab Selection Help */}
      <div
        className="rounded-xl p-4 cursor-pointer transition-all"
        style={{
          borderLeft: '3px solid var(--mizan-gold)',
          backgroundColor: 'rgba(184, 154, 94, 0.08)',
          borderRadius: '12px',
        }}
        onClick={() => setExpandedNisab(!expandedNisab)}
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
              {isArabic ? 'أي النصاب ينطبق عليّ؟' : 'Which nisab applies to me?'}
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform ${expandedNisab ? 'rotate-180' : ''}`}
            style={{ color: 'var(--mizan-gold)' }}
          />
        </div>

        {expandedNisab && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-10">
            <p
              className="text-xs leading-relaxed"
              style={{ color: '#6B7280' }}
            >
              {isArabic
                ? 'يختلف الفقهاء في أي النصاب يجب استخدامه. يوصي العديد من الفقهاء المعاصرين باستخدام نصاب الفضة لأنه أقل وبالتالي أكثر شمولاً، مما يضمن أن يقوم بالالتزام عدد أكبر من الناس. يستخدم البعض الآخر نصاب الذهب. استشر عالماً محلياً لديك للحصول على التوجيه.'
                : 'Scholars differ on which nisab to use. Many contemporary scholars recommend using the silver nisab as it is lower and therefore more inclusive, ensuring more people fulfill this obligation. Others use gold nisab. Consult your local scholar for guidance.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}