import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Upload, Zap, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HalalScanner() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastScans, setLastScans] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isPremium = settings?.subscription_tier === 'premium' || settings?.subscription_tier === 'family';

  useEffect(() => {
    loadLastScans();
  }, []);

  const loadLastScans = async () => {
    try {
      const scans = await base44.entities.HalalScanResults.list('-scan_date', 5);
      setLastScans(scans);
    } catch (e) {
      console.error('Load scans error:', e);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    if (!isPremium) {
      alert(language === 'ar' ? 'هذه ميزة متقدمة' : 'This is a premium feature');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeHalalTransactions', {
        raw_input: inputText,
      });
      setResults(response.data);
      await loadLastScans();
    } catch (err) {
      console.error('Analysis error:', err);
      alert(language === 'ar' ? 'خطأ في التحليل' : 'Analysis error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
        
        // Extract text from image if needed, or use as receipt text
        setInputText(text);
      } catch (err) {
        console.error('Upload error:', err);
      }
    };
    reader.readAsText(file);
  };

  if (!isPremium) {
    return (
      <div className="p-6 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <Lock className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: 'var(--mizan-text-secondary)' }} />
        <p className="font-semibold mb-2" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? '✨ ميزة متقدمة' : '✨ Premium Feature'}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar'
            ? 'استخدم ماسح الحلال لتحليل معاملاتك المالية وفقاً للشريعة الإسلامية'
            : 'Use Halal Scanner to analyze your transactions for Islamic compliance'}
        </p>
        <Button className="text-white rounded-lg h-9" style={{ background: 'var(--mizan-emerald)' }}>
          {language === 'ar' ? 'الترقية إلى متقدم' : 'Upgrade to Premium'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Halal Score Ring */}
      {results && (
        <div className="p-6 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs font-semibold mb-4 uppercase" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'نقاط الحلال الشهرية' : 'Monthly Halal Score'}
          </p>
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--mizan-border)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="var(--mizan-emerald)" strokeWidth="8"
                  strokeDasharray={`${(results.halal_score / 100) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>{results.halal_score}%</p>
                <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {results.halal_score >= 80 ? '✓ Excellent' : results.halal_score >= 60 ? '◐ Good' : '⚠️ Needs Work'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowSuggestions(true)}
            className="text-white rounded-lg h-9 gap-1.5"
            style={{ background: 'var(--mizan-emerald)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'ar' ? 'تحسين النتيجة' : 'Improve Score'}
          </Button>
        </div>
      )}

      {/* Input Methods */}
      <div className="p-6 rounded-xl space-y-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-center gap-2 p-4 rounded-lg cursor-pointer transition-all border-2 border-dashed"
            style={{ borderColor: 'var(--mizan-border)', background: 'var(--mizan-elevated)', color: 'var(--mizan-text-secondary)' }}>
            <Upload className="w-4 h-4" />
            <span className="text-xs font-medium">{language === 'ar' ? 'تحميل صورة' : 'Upload Photo'}</span>
            <input type="file" accept="image/*,.txt,.pdf" onChange={handleUpload} className="hidden" />
          </label>

          <button className="flex items-center justify-center gap-2 p-4 rounded-lg transition-all border border-solid"
            style={{ borderColor: 'var(--mizan-border)', background: 'var(--mizan-elevated)', color: 'var(--mizan-text-secondary)' }}>
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">{language === 'ar' ? 'لصق البيانات' : 'Paste Data'}</span>
          </button>
        </div>

        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={language === 'ar'
            ? 'الصق نص الفاتورة أو قائمة المعاملات...\nمثال: Starbucks 45.50\nPure Gold 120.00'
            : 'Paste receipt text or transactions...\nExample: Starbucks 45.50\nPure Gold 120.00'}
          className="w-full h-32 p-3 rounded-lg text-sm resize-none"
          style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
        />

        <Button
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
          className="w-full text-white rounded-lg h-10 font-medium"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {loading ? (language === 'ar' ? 'جاري التحليل...' : 'Analyzing...') : (language === 'ar' ? 'فحص الآن' : 'Scan Now')}
        </Button>
      </div>

      {/* Results List */}
      {results?.transactions && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'نتائج الفحص' : 'Scan Results'}
          </h3>
          {results.transactions.map((item, idx) => {
            const statusColors = {
              halal: { bg: '#1A7A5C15', text: 'var(--mizan-green)', badge: '✓' },
              questionable: { bg: '#B89A5E15', text: 'var(--mizan-gold)', badge: '⚠️' },
              avoid: { bg: '#C0392B15', text: '#C0392B', badge: '✗' },
            };
            const colors = statusColors[item.status];

            return (
              <div key={idx} className="p-4 rounded-xl flex items-start justify-between" style={{ background: colors.bg, border: `1px solid ${colors.text}20` }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>{item.merchant}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: colors.text, color: 'white' }}>
                      {colors.badge}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>{item.reason}</p>
                  <p className="text-sm font-semibold" style={{ color: colors.text }}>
                    {settings?.currency_symbol || 'ر.س'} {item.amount}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggestions Panel */}
      {showSuggestions && results && (
        <div className="p-6 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--mizan-text)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            {language === 'ar' ? 'اقتراحات التحسين' : 'Improvement Suggestions'}
          </h3>
          <div className="space-y-2 text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
            {results.halal_score < 100 && (
              <>
                <p>
                  {language === 'ar'
                    ? `لديك ${results.transactions.filter(t => t.status !== 'halal').length} معاملات غير حلال. حاول:` 
                    : `You have ${results.transactions.filter(t => t.status !== 'halal').length} non-halal transactions. Try:`}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{language === 'ar' ? 'اختيار المطاعم الموثوقة بشكل حلال' : 'Choose certified halal restaurants'}</li>
                  <li>{language === 'ar' ? 'تجنب البنوك التقليدية والفائدة الربوية' : 'Avoid conventional banks and interest'}</li>
                  <li>{language === 'ar' ? 'البحث عن بدائل إسلامية للخدمات' : 'Seek Islamic alternatives for services'}</li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}