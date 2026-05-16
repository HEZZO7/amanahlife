import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { BookOpen, Zap, Target, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function QuranTracker() {
  const { language } = useI18n();
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackingMode, setTrackingMode] = useState('pages'); // 'pages' or 'parts'
  const [input, setInput] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const allLogs = await base44.entities.RamadanLog.list('-date', 100);
      setLogs(allLogs);
      const todayData = allLogs.find(l => l.date === today);
      setTodayLog(todayData || null);
      setInput('');
    } catch (err) {
      console.error('Error loading Quran tracker:', err);
    }
    setLoading(false);
  };

  const handleAddPages = async () => {
    if (!input || isNaN(input) || parseInt(input) < 0) return;
    setSaving(true);
    try {
      const pages = parseInt(input);
      const currentPages = (todayLog?.quran_pages || 0);
      const newTotal = currentPages + pages;

      if (todayLog?.id) {
        await base44.entities.RamadanLog.update(todayLog.id, { quran_pages: newTotal });
      } else {
        await base44.entities.RamadanLog.create({ date: today, quran_pages: newTotal });
      }
      setInput('');
      load();
    } catch (err) {
      console.error('Error saving pages:', err);
    }
    setSaving(false);
  };

  const handleAddParts = async () => {
    if (!input || isNaN(input) || parseInt(input) < 0) return;
    setSaving(true);
    try {
      const parts = parseInt(input);
      const pages = parts * 2; // كل جزء = حوالي صفحتين
      const currentPages = (todayLog?.quran_pages || 0);
      const newTotal = currentPages + pages;

      if (todayLog?.id) {
        await base44.entities.RamadanLog.update(todayLog.id, { quran_pages: newTotal });
      } else {
        await base44.entities.RamadanLog.create({ date: today, quran_pages: newTotal });
      }
      setInput('');
      load();
    } catch (err) {
      console.error('Error saving parts:', err);
    }
    setSaving(false);
  };

  // حساب التقدم
  const totalPages = logs.reduce((s, l) => s + (l.quran_pages || 0), 0);
  const totalParts = Math.floor(totalPages / 2);
  const completedJuzs = Math.floor(totalPages / 60); // كل جزء = 60 صفحة
  const dayCount = logs.length;
  const avgPagesPerDay = dayCount > 0 ? (totalPages / dayCount).toFixed(1) : 0;

  // بيانات الرسم البياني
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const chartData = [];
  let cumulative = 0;

  for (let d = new Date(monthStart); d <= monthEnd && d <= new Date(); d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayLog = logs.find(l => l.date === dateStr);
    const pages = dayLog?.quran_pages || 0;
    cumulative += pages;
    chartData.push({
      day: format(d, 'd'),
      pages,
      cumulative,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--mizan-emerald)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'أضف قراءتك اليومية' : 'Add Today\'s Reading'}
        </h3>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTrackingMode('pages')}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: trackingMode === 'pages' ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
              color: trackingMode === 'pages' ? 'white' : 'var(--mizan-text)',
            }}
          >
            {language === 'ar' ? 'صفحات' : 'Pages'}
          </button>
          <button
            onClick={() => setTrackingMode('parts')}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: trackingMode === 'parts' ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
              color: trackingMode === 'parts' ? 'white' : 'var(--mizan-text)',
            }}
          >
            {language === 'ar' ? 'أجزاء' : 'Parts'}
          </button>
        </div>

        {/* Input & Button */}
        <div style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box',
          flexWrap: 'wrap'
        }}>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل العدد' : 'Enter amount'}
            style={{
              flex: '1 1 auto',
              minWidth: '100px',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'var(--mizan-elevated)',
              border: '1px solid var(--mizan-border)',
              color: 'var(--mizan-text)',
              boxSizing: 'border-box',
              width: '100%'
            }}
            min="0"
          />
          <button
            onClick={trackingMode === 'pages' ? handleAddPages : handleAddParts}
            disabled={saving || !input}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              background: 'var(--mizan-emerald)',
              border: 'none',
              cursor: 'pointer',
              opacity: saving || !input ? 0.5 : 1,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {saving ? '...' : (language === 'ar' ? 'إضافة' : 'Add')}
          </button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'إجمالي الصفحات' : 'Total Pages'}
            </span>
            <BookOpen className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>{totalPages}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? `${totalParts} أجزاء` : `${totalParts} parts`}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'أجزاء مكتملة' : 'Juzs Completed'}
            </span>
            <Zap className="w-4 h-4" style={{ color: 'var(--mizan-gold)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-gold)' }}>{completedJuzs}/30</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? `${((completedJuzs / 30) * 100).toFixed(0)}%` : `${((completedJuzs / 30) * 100).toFixed(0)}%`}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'أيام النشاط' : 'Active Days'}
            </span>
            <Target className="w-4 h-4" style={{ color: 'var(--mizan-emerald-light)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald-light)' }}>{dayCount}</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'متوسط يومي' : 'Daily Avg'}
            </span>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-red)' }}>{avgPagesPerDay}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'صفحات' : 'pages/day'}
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'تقدم القراءة' : 'Reading Progress'}
          </h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', borderRadius: 8, fontSize: 11 }} />
                <Legend />
                <Bar dataKey="pages" fill="var(--mizan-emerald)" name={language === 'ar' ? 'صفحات اليوم' : 'Daily Pages'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cumulative Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'التراكمي' : 'Cumulative Progress'}
          </h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', borderRadius: 8, fontSize: 11 }} />
                <Legend />
                <Line type="monotone" dataKey="cumulative" stroke="var(--mizan-emerald)" strokeWidth={2.5} dot={{ fill: 'var(--mizan-emerald)', r: 4 }} name={language === 'ar' ? 'إجمالي الصفحات' : 'Total Pages'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Current Day Info */}
      {todayLog && (
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-emerald)15', border: '1px solid var(--mizan-emerald)40' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--mizan-emerald)' }}>
            {language === 'ar' 
              ? `📖 اليوم: ${todayLog.quran_pages} صفحات`
              : `📖 Today: ${todayLog.quran_pages} pages`
            }
          </p>
        </div>
      )}
    </div>
  );
}