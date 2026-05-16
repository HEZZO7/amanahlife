import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LifeReviewCard from '@/components/reviews/LifeReviewCard';
import { Sparkles, RefreshCw, ChevronDown } from 'lucide-react';
import { format, subMonths } from 'date-fns';

export default function LifeReviews() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const lang = settings?.language || language || 'ar';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genType, setGenType] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const isPremium = ['premium', 'family'].includes(settings?.subscription_tier);

  const loadReviews = async () => {
    setLoading(true);
    const all = await base44.entities.LifeReview.list('-created_date', 50);
    setReviews(all);
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, []);

  const generateReview = async (type) => {
    setGenerating(true);
    setGenType(type);
    const now = new Date();
    const period = type === 'monthly'
      ? format(subMonths(now, 1), 'yyyy-MM')
      : String(now.getFullYear() - 1);
    await base44.functions.invoke('generateLifeReview', { period, type });
    await loadReviews();
    setGenerating(false);
    setGenType(null);
  };

  const handleArchive = async (id) => {
    await base44.entities.LifeReview.update(id, { is_archived: true });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_archived: true } : r));
  };

  const active = reviews.filter(r => !r.is_archived);
  const archived = reviews.filter(r => r.is_archived);

  if (!isPremium) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <Sparkles className="w-7 h-7" style={{ color: 'var(--mizan-gold)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--mizan-text)' }}>
            {lang === 'ar' ? 'مراجعة الحياة — ميزة مميزة' : 'Life Review — Premium Feature'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar'
              ? 'قم بترقية اشتراكك للحصول على تقارير شهرية وسنوية بالذكاء الاصطناعي تحلل كل جوانب حياتك.'
              : 'Upgrade to unlock monthly and annual AI-powered life reviews across all life dimensions.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {lang === 'ar' ? 'مراجعة الحياة' : 'Life Reviews'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? 'تقارير ذكية شهرية وسنوية' : 'AI-powered monthly & annual reports'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generateReview('monthly')}
            disabled={generating}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating && genType === 'monthly' ? 'animate-spin' : ''}`} />
            {lang === 'ar' ? 'شهري' : 'Monthly'}
          </Button>
          <Button
            onClick={() => generateReview('annual')}
            disabled={generating}
            size="sm"
            className="gap-1.5 text-xs text-white"
            style={{ background: 'var(--mizan-emerald)' }}
          >
            <Sparkles className={`w-3.5 h-3.5 ${generating && genType === 'annual' ? 'animate-spin' : ''}`} />
            {lang === 'ar' ? 'سنوي' : 'Annual'}
          </Button>
        </div>
      </div>

      {generating && (
        <div className="p-4 rounded-xl mb-4 flex items-center gap-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-emerald)44' }}>
          <Sparkles className="w-4 h-4 animate-pulse" style={{ color: 'var(--mizan-emerald)' }} />
          <span className="text-sm" style={{ color: 'var(--mizan-text)' }}>
            {lang === 'ar' ? 'جارٍ توليد التقرير بالذكاء الاصطناعي... قد يستغرق دقيقة.' : 'Generating AI report... this may take a minute.'}
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
      ) : active.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-30" style={{ color: 'var(--mizan-emerald)' }} />
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--mizan-text)' }}>
            {lang === 'ar' ? 'لا توجد تقارير بعد' : 'No reviews yet'}
          </p>
          <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? 'اضغط "شهري" أو "سنوي" لتوليد أول تقرير' : 'Press Monthly or Annual to generate your first review'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {active.map(r => (
            <LifeReviewCard
              key={r.id}
              review={r}
              onArchive={() => handleArchive(r.id)}
            />
          ))}
        </div>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived(s => !s)}
            className="flex items-center gap-2 text-sm mb-3"
            style={{ color: 'var(--mizan-text-secondary)' }}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-180' : ''}`} />
            {lang === 'ar' ? `الأرشيف (${archived.length})` : `Archive (${archived.length})`}
          </button>
          {showArchived && (
            <div className="space-y-4 opacity-70">
              {archived.map(r => <LifeReviewCard key={r.id} review={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}