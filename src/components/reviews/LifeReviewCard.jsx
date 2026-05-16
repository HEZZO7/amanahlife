import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Heart, Wallet, Target, Activity, Sparkles, ChevronDown, ChevronUp, Download, Archive, X } from 'lucide-react';
import { exportReviewPDF } from '@/lib/reviewExportService';

function ScoreRing({ value, color }) {
  const r = 22, c = 2 * Math.PI * r;
  const fill = c - (c * Math.min(value, 100)) / 100;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="var(--mizan-border)" strokeWidth="4" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={fill} strokeLinecap="round"
        transform="rotate(-90 30 30)" />
      <text x="30" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{value}</text>
    </svg>
  );
}

function SectionCard({ icon: Icon, titleAr, titleEn, color, children, lang }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {lang === 'ar' ? titleAr : titleEn}
        </span>
      </div>
      {children}
    </div>
  );
}

function DataPill({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'var(--mizan-border)' }}>
      <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: highlight ? 'var(--mizan-gold)' : 'var(--mizan-text)' }}>{value}</span>
    </div>
  );
}

export default function LifeReviewCard({ review, onDismiss, onArchive }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const lang = settings?.language || language || 'ar';
  const [expanded, setExpanded] = useState(true);
  const [exporting, setExporting] = useState(false);

  const narrative = lang === 'ar' ? review.ai_narrative_ar : review.ai_narrative_en;
  const recommendation = lang === 'ar' ? review.focus_recommendation_ar : review.focus_recommendation_en;
  const raw = review.raw_data || {};
  const spiritual = raw.spiritual || {};
  const financial = raw.financial || {};
  const goals = review.goals_summary || {};
  const wellness = review.wellness_summary || {};

  const moodLabels = { 1: '😔', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
  const moodEmoji = moodLabels[Math.round(wellness.avgMood)] || '—';

  const isAnnual = review.type === 'annual';
  const periodLabel = isAnnual
    ? (lang === 'ar' ? `التقرير السنوي ${review.period}` : `Annual Review ${review.period}`)
    : (lang === 'ar' ? `تقرير ${review.period}` : `Review ${review.period}`);

  const handleExport = async () => {
    setExporting(true);
    await exportReviewPDF(review, lang);
    setExporting(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)', background: 'var(--mizan-surface)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'var(--mizan-emerald)' }}>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white opacity-80" />
            <span className="text-white font-bold text-base">{periodLabel}</span>
          </div>
          {isAnnual && review.word_of_year && (
            <span className="text-2xl font-bold mt-1 block" style={{ color: 'var(--mizan-gold)' }}>
              {review.word_of_year}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
            {expanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
          </button>
          {onDismiss && (
            <button onClick={onDismiss} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Annual: Top Achievement */}
          {isAnnual && review.top_achievement && (
            <div className="p-4 rounded-xl" style={{ background: '#B89A5E15', border: '1px solid #B89A5E44' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--mizan-gold)' }}>
                {lang === 'ar' ? '🏆 أبرز إنجاز العام' : '🏆 Top Achievement'}
              </p>
              <p className="text-sm" style={{ color: 'var(--mizan-text)' }}>{review.top_achievement}</p>
            </div>
          )}

          {/* Scores Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
              <ScoreRing value={review.spiritual_score || 0} color="var(--mizan-emerald)" />
              <span className="text-xs mt-1.5 font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
                {lang === 'ar' ? 'الروحانية' : 'Spiritual'}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
              <div className="w-[60px] h-[60px] flex items-center justify-center">
                <span className="text-3xl font-black" style={{ color: 'var(--mizan-gold)' }}>{financial.grade || '—'}</span>
              </div>
              <span className="text-xs mt-1.5 font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
                {lang === 'ar' ? 'المالية' : 'Financial'}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
              <div className="w-[60px] h-[60px] flex items-center justify-center">
                <span className="text-3xl font-black" style={{ color: 'var(--mizan-emerald)' }}>{goals.avgProgress || 0}%</span>
              </div>
              <span className="text-xs mt-1.5 font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
                {lang === 'ar' ? 'الأهداف' : 'Goals'}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
              <div className="w-[60px] h-[60px] flex items-center justify-center">
                <span className="text-4xl">{moodEmoji}</span>
              </div>
              <span className="text-xs mt-1.5 font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
                {lang === 'ar' ? 'الرفاه' : 'Wellness'}
              </span>
            </div>
          </div>

          {/* Detail Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SectionCard icon={Heart} titleAr="الإنجاز الروحي" titleEn="Spiritual" color="var(--mizan-emerald)" lang={lang}>
              <DataPill label={lang === 'ar' ? 'إكمال الصلوات' : 'Prayer completion'} value={`${spiritual.prayerPct || 0}%`} highlight />
              <DataPill label={lang === 'ar' ? 'صفحات القرآن' : 'Quran pages'} value={spiritual.totalQuranPages || 0} />
              <DataPill label={lang === 'ar' ? 'إجمالي الصدقات' : 'Charity total'} value={`${settings?.currency_symbol || 'ر.س'} ${(spiritual.totalCharity || 0).toFixed(0)}`} />
              <DataPill label={lang === 'ar' ? 'أطول سلسلة' : 'Best streak'} value={`${spiritual.maxStreak || 0} ${lang === 'ar' ? 'يوم' : 'days'}`} />
            </SectionCard>

            <SectionCard icon={Wallet} titleAr="المالية" titleEn="Finance" color="var(--mizan-gold)" lang={lang}>
              <DataPill label={lang === 'ar' ? 'نسبة الادخار' : 'Savings rate'} value={`${(financial.savingsRate || 0).toFixed(1)}%`} highlight />
              <DataPill label={lang === 'ar' ? 'الرصيد الصافي' : 'Net balance'} value={`${settings?.currency_symbol || 'ر.س'} ${(financial.netBalance || 0).toFixed(0)}`} />
              <DataPill label={lang === 'ar' ? 'أعلى فئة إنفاق' : 'Top spending'} value={financial.topCategory || '—'} />
              <DataPill label={lang === 'ar' ? 'الالتزام بالميزانية' : 'Budget adherence'} value={`${financial.budgetAdherence || 100}%`} />
            </SectionCard>

            <SectionCard icon={Target} titleAr="الأهداف" titleEn="Goals" color="var(--mizan-emerald)" lang={lang}>
              <DataPill label={lang === 'ar' ? 'نشطة' : 'Active'} value={goals.activeCount || 0} />
              <DataPill label={lang === 'ar' ? 'مكتملة' : 'Completed'} value={goals.completedCount || 0} highlight />
              <DataPill label={lang === 'ar' ? 'متوقفة' : 'Stalled'} value={goals.stalledCount || 0} />
              <DataPill label={lang === 'ar' ? 'متوسط التقدم' : 'Avg progress'} value={`${goals.avgProgress || 0}%`} />
            </SectionCard>

            <SectionCard icon={Activity} titleAr="الرفاه" titleEn="Wellness" color="#6B7280" lang={lang}>
              <DataPill label={lang === 'ar' ? 'متوسط المزاج' : 'Avg mood'} value={wellness.avgMood ? `${wellness.avgMood}/5` : '—'} highlight />
              <DataPill label={lang === 'ar' ? 'متوسط النوم' : 'Avg sleep'} value={wellness.avgSleep ? `${wellness.avgSleep}h` : '—'} />
              <DataPill label={lang === 'ar' ? 'متوسط التوتر' : 'Avg stress'} value={wellness.avgStress ? `${wellness.avgStress}/10` : '—'} />
              <DataPill label={lang === 'ar' ? 'أيام مسجلة' : 'Days logged'} value={wellness.logsCount || 0} />
            </SectionCard>
          </div>

          {/* AI Narrative */}
          {narrative && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-emerald)44' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--mizan-emerald)' }}>
                  {lang === 'ar' ? 'تحليل ذكي' : 'AI Narrative'}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--mizan-text)' }}>{narrative}</p>
            </div>
          )}

          {/* Focus Recommendation */}
          {recommendation && (
            <div className="p-4 rounded-xl" style={{ background: '#B89A5E10', border: '1px solid #B89A5E33' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--mizan-gold)' }}>
                {lang === 'ar' ? '🎯 توصية الفترة القادمة' : '🎯 Focus for Next Period'}
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{recommendation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1 flex-wrap">
            <Button onClick={handleExport} disabled={exporting} size="sm" variant="outline" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              {exporting ? (lang === 'ar' ? 'جارٍ التصدير...' : 'Exporting...') : (lang === 'ar' ? 'تصدير PDF' : 'Export PDF')}
            </Button>
            {onArchive && (
              <Button onClick={onArchive} size="sm" variant="outline" className="gap-1.5 text-xs">
                <Archive className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'أرشفة' : 'Archive'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}