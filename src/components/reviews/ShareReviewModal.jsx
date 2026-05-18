import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { exportReviewPDF } from '@/lib/reviewExportService';
import { Share2, X, Mail, Download, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function ShareReviewModal({ review, onClose }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const lang = settings?.language || language || 'ar';

  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [exporting, setExporting] = useState(false);

  const isAnnual = review.type === 'annual';
  const periodLabel = isAnnual
    ? (lang === 'ar' ? `التقرير السنوي ${review.period}` : `Annual Review ${review.period}`)
    : (lang === 'ar' ? `تقرير ${review.period}` : `Review ${review.period}`);

  const raw = review.raw_data || {};
  const sp = raw.spiritual || {};
  const fi = raw.financial || {};
  const goals = review.goals_summary || {};
  const tasks = raw.tasks || {};

  // Build summary text for the email body
  const buildSummary = () => {
    const lines = [];
    if (lang === 'ar') {
      lines.push(`✨ ${periodLabel}`);
      lines.push('');
      lines.push(`🕌 الروحانية: إكمال الصلوات ${sp.prayerPct || 0}% — أطول سلسلة ${sp.maxStreak || 0} يوم`);
      lines.push(`💰 المالية: معدل الادخار ${(fi.savingsRate || 0).toFixed(1)}%`);
      lines.push(`🎯 الأهداف: ${goals.completedCount || 0} مكتمل — متوسط التقدم ${goals.avgProgress || 0}%`);
      if (tasks.completedCount > 0) {
        lines.push(`✅ المهام: ${tasks.completedCount} مهمة مكتملة`);
      }
      if (review.ai_narrative_ar) {
        lines.push('');
        lines.push('📝 تحليل ذكي:');
        lines.push(review.ai_narrative_ar);
      }
      if (review.focus_recommendation_ar) {
        lines.push('');
        lines.push('🎯 توصية الفترة القادمة:');
        lines.push(review.focus_recommendation_ar);
      }
      if (note) {
        lines.push('');
        lines.push('💬 رسالة شخصية:');
        lines.push(note);
      }
      lines.push('');
      lines.push('— أُرسل من تطبيق أمانة لايف');
    } else {
      lines.push(`✨ ${periodLabel}`);
      lines.push('');
      lines.push(`🕌 Spiritual: Prayer completion ${sp.prayerPct || 0}% — Best streak ${sp.maxStreak || 0} days`);
      lines.push(`💰 Finance: Savings rate ${(fi.savingsRate || 0).toFixed(1)}%`);
      lines.push(`🎯 Goals: ${goals.completedCount || 0} completed — Avg progress ${goals.avgProgress || 0}%`);
      if (tasks.completedCount > 0) {
        lines.push(`✅ Tasks: ${tasks.completedCount} completed`);
      }
      if (review.ai_narrative_en) {
        lines.push('');
        lines.push('📝 AI Narrative:');
        lines.push(review.ai_narrative_en);
      }
      if (review.focus_recommendation_en) {
        lines.push('');
        lines.push('🎯 Focus for Next Period:');
        lines.push(review.focus_recommendation_en);
      }
      if (note) {
        lines.push('');
        lines.push('💬 Personal note:');
        lines.push(note);
      }
      lines.push('');
      lines.push('— Sent from AmanahLife');
    }
    return lines.join('\n');
  };

  const handleSendEmail = async () => {
    if (!email.trim()) return;
    setSending(true);
    const subject = lang === 'ar'
      ? `مشاركة تقرير الحياة — ${periodLabel}`
      : `Life Review Share — ${periodLabel}`;
    await base44.integrations.Core.SendEmail({
      to: email.trim(),
      subject: `AmanahLife — ${subject}`,
      body: buildSummary(),
    });
    setSent(true);
    setSending(false);
  };

  const handleDownloadPDF = async () => {
    setExporting(true);
    await exportReviewPDF(review, lang);
    setExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bottom-sheet-overlay" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden bottom-sheet-content" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--mizan-emerald)' }}>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-base">
              {lang === 'ar' ? 'مشاركة التقرير' : 'Share Review'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Period label */}
          <p className="text-sm font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
            {periodLabel}
          </p>

          {/* Download PDF */}
          <div className="rounded-xl p-4" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
                  {lang === 'ar' ? 'تنزيل كملف PDF' : 'Download as PDF'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {lang === 'ar' ? 'تقرير منظم وجاهز للمشاركة' : 'Organized report ready to share'}
                </p>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={exporting}
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs shrink-0"
              >
                {exporting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Download className="w-3.5 h-3.5" />}
                {lang === 'ar' ? 'تنزيل' : 'Download'}
              </Button>
            </div>
          </div>

          {/* Send via Email */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
                {lang === 'ar' ? 'إرسال بالبريد الإلكتروني' : 'Send via Email'}
              </p>
            </div>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lang === 'ar' ? 'بريد المستلم (عائلة، موجه...)' : "Recipient's email (family, mentor...)"}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--mizan-surface)',
                border: '1px solid var(--mizan-border)',
                color: 'var(--mizan-text)',
                direction: 'ltr',
              }}
            />

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={lang === 'ar' ? 'رسالة شخصية (اختياري)...' : 'Personal note (optional)...'}
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{
                background: 'var(--mizan-surface)',
                border: '1px solid var(--mizan-border)',
                color: 'var(--mizan-text)',
              }}
            />

            {sent ? (
              <div className="flex items-center gap-2 py-1.5">
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--mizan-emerald)' }}>
                  {lang === 'ar' ? 'تم الإرسال بنجاح!' : 'Sent successfully!'}
                </span>
              </div>
            ) : (
              <Button
                onClick={handleSendEmail}
                disabled={sending || !email.trim()}
                size="sm"
                className="w-full gap-2 text-white"
                style={{ background: 'var(--mizan-emerald)' }}
              >
                {sending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />}
                {sending
                  ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...')
                  : (lang === 'ar' ? 'إرسال الملخص' : 'Send Summary')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}