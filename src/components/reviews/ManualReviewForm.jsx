import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Save, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const SLIDERS = [
  { key: 'spiritual_rating', ar: 'الجانب الروحي', en: 'Spiritual', color: 'var(--mizan-emerald)' },
  { key: 'financial_rating', ar: 'الجانب المالي', en: 'Financial', color: 'var(--mizan-gold)' },
  { key: 'goals_rating', ar: 'الأهداف', en: 'Goals', color: '#12897A' },
  { key: 'wellness_rating', ar: 'الصحة والرفاه', en: 'Wellness', color: '#8E44AD' },
  { key: 'work_rating', ar: 'العمل والإنتاجية', en: 'Work & Productivity', color: '#E67E22' },
];

function RatingSlider({ label, color, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>{label}</span>
        <span className="text-xs font-bold w-6 text-center" style={{ color }}>{value}</span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: 'var(--mizan-border)' }}>
        <div className="absolute inset-y-0 start-0 rounded-full transition-all"
          style={{ width: `${value * 10}%`, background: color }} />
        <input type="range" min="1" max="10" value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
        <span>1</span><span>10</span>
      </div>
    </div>
  );
}

export default function ManualReviewForm({ onClose, onSaved, achievementsData, language }) {
  const isAr = language === 'ar';
  const now = new Date();
  const period = format(now, 'yyyy-MM');

  const [ratings, setRatings] = useState({
    spiritual_rating: 5, financial_rating: 5, goals_rating: 5,
    wellness_rating: 5, work_rating: 5,
  });
  const [reflection, setReflection] = useState('');
  const [topAchievement, setTopAchievement] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextMonthFocus, setNextMonthFocus] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDataSummary, setShowDataSummary] = useState(true);

  const avgRating = Math.round(Object.values(ratings).reduce((s, v) => s + v, 0) / SLIDERS.length);

  const generateAISummary = async () => {
    if (!reflection) return;
    setGenerating(true);
    const ctx = achievementsData ? `
Achievements Data:
- Tasks completed: ${achievementsData.totalCompleted}
- Goals completed: ${achievementsData.completedGoals}/${achievementsData.totalGoals}
- Avg goal progress: ${achievementsData.avgGoalProgress}%
- Prayer streak: ${achievementsData.streak} days
` : '';

    const prompt = `You are a compassionate Islamic life coach. Based on this user's monthly self-review, write a short (2-3 sentences) encouraging Arabic/English summary that acknowledges their reflections and gives one specific, actionable tip.

Period: ${period}
User ratings: ${SLIDERS.map(s => `${s.en}: ${ratings[s.key]}/10`).join(', ')}
User reflection: "${reflection}"
Top achievement: "${topAchievement}"
Challenges: "${challenges}"
Next month focus: "${nextMonthFocus}"
${ctx}

Respond in ${isAr ? 'Arabic' : 'English'} only. No emojis. Be warm and specific.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setReflection(prev => prev + '\n\n— ' + (isAr ? 'ملخص الذكاء الاصطناعي: ' : 'AI Summary: ') + result);
    setGenerating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.LifeReview.create({
      type: 'monthly',
      period,
      spiritual_score: ratings.spiritual_rating * 10,
      financial_grade: ['F','D','C','B','B+','A-','A','A+','A+','A+','A+'][ratings.financial_rating] || 'B',
      goals_summary: {
        avgProgress: achievementsData?.avgGoalProgress || 0,
        activeCount: achievementsData?.totalGoals - achievementsData?.completedGoals || 0,
        completedCount: achievementsData?.completedGoals || 0,
        manualRating: ratings.goals_rating,
      },
      wellness_summary: {
        manualRating: ratings.wellness_rating,
      },
      ai_narrative_ar: isAr ? reflection : '',
      ai_narrative_en: !isAr ? reflection : '',
      focus_recommendation_ar: isAr ? nextMonthFocus : '',
      focus_recommendation_en: !isAr ? nextMonthFocus : '',
      top_achievement: topAchievement,
      raw_data: {
        manual: true,
        ratings,
        challenges,
        gratitude,
        avgRating,
        tasks: { completedCount: achievementsData?.totalCompleted || 0 },
      },
    });
    setSaving(false);
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bottom-sheet-overlay"
      style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col bottom-sheet-content"
        style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'var(--mizan-emerald)' }}>
          <div>
            <h2 className="font-bold text-white">
              {isAr ? 'مراجعة شخصية' : 'Personal Life Review'}
            </h2>
            <p className="text-xs text-white/70">{period}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Achievements data summary */}
          {achievementsData && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)' }}>
              <button onClick={() => setShowDataSummary(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3"
                style={{ background: 'var(--mizan-elevated)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--mizan-text)' }}>
                  {isAr ? 'بياناتك هذا الشهر' : 'Your data this month'}
                </span>
                {showDataSummary
                  ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
                  : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />}
              </button>
              {showDataSummary && (
                <div className="grid grid-cols-2 gap-px" style={{ background: 'var(--mizan-border)' }}>
                  {[
                    { label: isAr ? 'مهام مكتملة' : 'Tasks done', value: achievementsData.totalCompleted, color: 'var(--mizan-emerald)' },
                    { label: isAr ? 'أهداف محققة' : 'Goals done', value: `${achievementsData.completedGoals}/${achievementsData.totalGoals}`, color: 'var(--mizan-gold)' },
                    { label: isAr ? 'تقدم الأهداف' : 'Goal progress', value: `${achievementsData.avgGoalProgress}%`, color: '#12897A' },
                    { label: isAr ? 'سلسلة الصلاة' : 'Prayer streak', value: `${achievementsData.streak} ${isAr ? 'يوم' : 'days'}`, color: 'var(--mizan-red)' },
                  ].map(item => (
                    <div key={item.label} className="px-4 py-3 text-center" style={{ background: 'var(--mizan-surface)' }}>
                      <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                      <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Self-ratings */}
          <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isAr ? 'قيّم نفسك من 1 إلى 10' : 'Rate yourself 1–10'}
            </p>
            {SLIDERS.map(s => (
              <RatingSlider key={s.key}
                label={isAr ? s.ar : s.en}
                color={s.color}
                value={ratings[s.key]}
                onChange={v => setRatings(prev => ({ ...prev, [s.key]: v }))}
              />
            ))}
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--mizan-border)' }}>
              <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isAr ? 'المتوسط العام' : 'Overall average'}
              </span>
              <span className="text-base font-black" style={{ color: avgRating >= 7 ? 'var(--mizan-emerald)' : avgRating >= 5 ? 'var(--mizan-gold)' : 'var(--mizan-red)' }}>
                {avgRating}/10
              </span>
            </div>
          </div>

          {/* Text fields */}
          {[
            { key: 'topAchievement', state: topAchievement, setter: setTopAchievement, ar: 'أبرز إنجاز هذا الشهر', en: 'Top achievement this month', rows: 2 },
            { key: 'reflection', state: reflection, setter: setReflection, ar: 'تأمل وتفكر... ماذا تعلمت؟', en: 'Reflect... what did you learn?', rows: 3 },
            { key: 'challenges', state: challenges, setter: setChallenges, ar: 'التحديات التي واجهتها', en: 'Challenges faced', rows: 2 },
            { key: 'gratitude', state: gratitude, setter: setGratitude, ar: 'ما تشعر بالامتنان له', en: 'What you are grateful for', rows: 2 },
            { key: 'nextMonthFocus', state: nextMonthFocus, setter: setNextMonthFocus, ar: 'تركيزك للشهر القادم', en: 'Focus for next month', rows: 2 },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isAr ? field.ar : field.en}
              </label>
              <textarea
                value={field.state}
                onChange={e => field.setter(e.target.value)}
                rows={field.rows}
                className="w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none"
                style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
                dir={isAr ? 'rtl' : 'ltr'}
              />
            </div>
          ))}

          {/* AI enhance */}
          {reflection.length > 20 && (
            <button onClick={generateAISummary} disabled={generating}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
              style={{ background: 'var(--mizan-emerald)18', color: 'var(--mizan-emerald)', border: '1px solid var(--mizan-emerald)44' }}>
              <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              {generating
                ? (isAr ? 'جارٍ التحليل...' : 'Analyzing...')
                : (isAr ? 'أضف تحليل ذكاء اصطناعي' : 'Enhance with AI')}
            </button>
          )}
        </div>

        {/* Save */}
        <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: 'var(--mizan-border)' }}>
          <Button onClick={handleSave} disabled={saving || !topAchievement}
            className="w-full h-11 text-white font-semibold rounded-xl gap-2"
            style={{ background: 'var(--mizan-emerald)' }}>
            <Save className="w-4 h-4" />
            {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ المراجعة' : 'Save Review')}
          </Button>
        </div>
      </div>
    </div>
  );
}