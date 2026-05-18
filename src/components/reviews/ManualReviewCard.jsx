import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ChevronDown, ChevronUp, Archive, PenLine, Heart, Wallet,
  Target, Activity, Briefcase, Star, Quote, Lightbulb, AlertCircle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const RATING_CONFIG = [
  { key: 'spiritual_rating', ar: 'الروحي', en: 'Spiritual', icon: Heart, color: 'var(--mizan-emerald)' },
  { key: 'financial_rating', ar: 'المالي', en: 'Financial', icon: Wallet, color: 'var(--mizan-gold)' },
  { key: 'goals_rating', ar: 'الأهداف', en: 'Goals', icon: Target, color: '#12897A' },
  { key: 'wellness_rating', ar: 'الصحة', en: 'Wellness', icon: Activity, color: '#8E44AD' },
  { key: 'work_rating', ar: 'العمل', en: 'Work', icon: Briefcase, color: '#E67E22' },
];

function RatingBar({ label, value, color, icon: Icon }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <span className="text-xs w-14 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-5 text-end" style={{ color }}>{value}</span>
    </div>
  );
}

function TextSection({ icon: Icon, color, titleAr, titleEn, text, lang }) {
  if (!text) return null;
  return (
    <div className="p-3 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-semibold" style={{ color }}>{lang === 'ar' ? titleAr : titleEn}</span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--mizan-text)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>{text}</p>
    </div>
  );
}

export default function ManualReviewCard({ review, onArchive, language }) {
  const isAr = language === 'ar';
  const [expanded, setExpanded] = useState(true);

  const raw = review.raw_data || {};
  const ratings = raw.ratings || {};
  const avgRating = raw.avgRating || 0;
  const avgColor = avgRating >= 7 ? 'var(--mizan-emerald)' : avgRating >= 5 ? 'var(--mizan-gold)' : 'var(--mizan-red)';

  const narrative = isAr ? review.ai_narrative_ar : review.ai_narrative_en;
  const nextFocus = isAr ? review.focus_recommendation_ar : review.focus_recommendation_en;

  const periodLabel = isAr ? `مراجعة شخصية — ${review.period}` : `Personal Review — ${review.period}`;
  const createdDate = review.created_date ? format(new Date(review.created_date), 'dd/MM/yyyy') : '';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)', background: 'var(--mizan-surface)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #12897A 0%, var(--mizan-emerald) 100%)' }}>
        <div>
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-white opacity-80" />
            <span className="text-white font-bold text-base">{periodLabel}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-white/60 text-xs">{createdDate}</span>
            <span className="text-white font-bold text-sm" style={{ color: avgColor === 'var(--mizan-emerald)' ? '#A7F3D0' : avgColor === 'var(--mizan-gold)' ? '#FDE68A' : '#FCA5A5' }}>
              {isAr ? `المتوسط: ${avgRating}/10` : `Avg: ${avgRating}/10`}
            </span>
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
          {expanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
        </button>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">

          {/* Top Achievement */}
          {review.top_achievement && (
            <div className="p-4 rounded-xl" style={{ background: '#B89A5E15', border: '1px solid #B89A5E44' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--mizan-gold)' }}>
                🏆 {isAr ? 'أبرز إنجاز' : 'Top Achievement'}
              </p>
              <p className="text-sm" style={{ color: 'var(--mizan-text)' }} dir={isAr ? 'rtl' : 'ltr'}>{review.top_achievement}</p>
            </div>
          )}

          {/* Ratings */}
          {Object.keys(ratings).length > 0 && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isAr ? 'التقييم الذاتي' : 'Self Ratings'}
              </p>
              {RATING_CONFIG.map(cfg => ratings[cfg.key] !== undefined && (
                <RatingBar key={cfg.key}
                  label={isAr ? cfg.ar : cfg.en}
                  value={ratings[cfg.key]}
                  color={cfg.color}
                  icon={cfg.icon}
                />
              ))}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--mizan-border)' }}>
                <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{isAr ? 'المتوسط العام' : 'Overall'}</span>
                <span className="text-sm font-black" style={{ color: avgColor }}>{avgRating}/10</span>
              </div>
            </div>
          )}

          {/* Linked achievements data */}
          {raw.tasks?.completedCount !== undefined && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: isAr ? 'مهام مكتملة' : 'Tasks done', value: raw.tasks.completedCount, color: 'var(--mizan-emerald)' },
                { label: isAr ? 'أهداف' : 'Goals', value: `${review.goals_summary?.completedCount || 0}/${(review.goals_summary?.completedCount || 0) + (review.goals_summary?.activeCount || 0)}`, color: 'var(--mizan-gold)' },
                { label: isAr ? 'تقدم الأهداف' : 'Goal %', value: `${review.goals_summary?.avgProgress || 0}%`, color: '#12897A' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                  <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Text sections */}
          <TextSection icon={Sparkles} color="var(--mizan-emerald)" titleAr="التأمل والتعلم" titleEn="Reflection" text={narrative} lang={isAr ? 'ar' : 'en'} />
          <TextSection icon={AlertCircle} color="var(--mizan-red)" titleAr="التحديات" titleEn="Challenges" text={raw.challenges} lang={isAr ? 'ar' : 'en'} />
          <TextSection icon={Quote} color="var(--mizan-gold)" titleAr="الامتنان" titleEn="Gratitude" text={raw.gratitude} lang={isAr ? 'ar' : 'en'} />
          <TextSection icon={Lightbulb} color="#E67E22" titleAr="تركيز الشهر القادم" titleEn="Next Month Focus" text={nextFocus} lang={isAr ? 'ar' : 'en'} />

          {/* Actions */}
          {onArchive && (
            <div className="flex pt-1">
              <Button onClick={onArchive} size="sm" variant="outline" className="gap-1.5 text-xs">
                <Archive className="w-3.5 h-3.5" />
                {isAr ? 'أرشفة' : 'Archive'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}