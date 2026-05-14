import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const MOODS = [
  { key: 'very_low', label: '1', color: '#C0392B' },
  { key: 'low', label: '2', color: '#E67E22' },
  { key: 'neutral', label: '3', color: '#B89A5E' },
  { key: 'good', label: '4', color: '#27AE60' },
  { key: 'excellent', label: '5', color: '#0B5B50' },
];

const MOOD_SCORE = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };

function ScoreRing({ value, max = 10, label, color }) {
  const pct = Math.min(value / max, 1);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--mizan-border)" strokeWidth="5"/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
        <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{value}</text>
      </svg>
      <p className="text-xs mt-1 text-center" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
    </div>
  );
}

function ContributionGrid({ logs }) {
  const today = new Date();
  const days = eachDayOfInterval({ start: subDays(today, 29), end: today });

  return (
    <div className="grid grid-cols-10 gap-1">
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = logs.find(l => l.date === dateStr);
        const mood = log?.mood;
        const moodConfig = MOODS.find(m => m.key === mood);
        return (
          <div key={dateStr} title={`${format(day, 'MMM d')} — ${mood || 'no log'}`}
            className="aspect-square rounded-sm"
            style={{ background: moodConfig ? moodConfig.color + 'CC' : 'var(--mizan-border)' }} />
        );
      })}
    </div>
  );
}

export default function Wellness() {
  const { language } = useI18n();
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [sleep, setSleep] = useState(7);
  const [hydration, setHydration] = useState(5);
  const [stress, setStress] = useState(3);
  const today = format(new Date(), 'yyyy-MM-dd');

  const load = () => {
    setLoading(true);
    base44.entities.WellnessLog.list('-date', 35)
      .then(data => {
        setLogs(data);
        const tlog = data.find(l => l.date === today);
        if (tlog) {
          setTodayLog(tlog);
          setSelectedMood(tlog.mood);
          setSleep(tlog.sleep_hours || 7);
          setHydration(tlog.hydration_level || 5);
          setStress(tlog.stress_level || 3);
        }
      })
      .catch(err => console.error('Wellness load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveLog = async () => {
    if (!selectedMood) return;
    setSaving(true);
    const data = { mood: selectedMood, sleep_hours: sleep, hydration_level: hydration, stress_level: stress, date: today };
    if (todayLog) {
      const updated = await base44.entities.WellnessLog.update(todayLog.id, data);
      setTodayLog(updated);
    } else {
      const created = await base44.entities.WellnessLog.create(data);
      setTodayLog(created);
      setLogs(prev => [created, ...prev]);
    }
    setSaving(false);
  };

  // Chart data — last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    return {
      day: format(d, 'EEE'),
      mood: log ? MOOD_SCORE[log.mood] : null,
      sleep: log?.sleep_hours || null,
      stress: log ? (10 - log.stress_level) : null,
    };
  });

  const todayScore = todayLog ? {
    mood: MOOD_SCORE[todayLog.mood] * 2,
    sleep: Math.min(todayLog.sleep_hours || 0, 10),
    hydration: todayLog.hydration_level || 0,
    stress: 10 - (todayLog.stress_level || 5),
  } : { mood: 0, sleep: 0, hydration: 0, stress: 0 };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mizan-section-header mb-6" style={{ color: 'var(--mizan-text)' }}>
        {language === 'ar' ? 'الصحة والعافية' : 'Wellness'}
      </h1>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-5">

          {/* Today's Score Rings */}
          <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'نتائج اليوم' : "Today's Score"}
            </h3>
            <div className="flex justify-around">
              <ScoreRing value={todayScore.mood} max={10} label={language === 'ar' ? 'المزاج' : 'Mood'} color="var(--mizan-emerald)" />
              <ScoreRing value={todayScore.sleep} max={10} label={language === 'ar' ? 'النوم' : 'Sleep'} color="var(--mizan-gold)" />
              <ScoreRing value={todayScore.hydration} max={10} label={language === 'ar' ? 'الترطيب' : 'Hydration'} color="var(--mizan-emerald-light)" />
              <ScoreRing value={todayScore.stress} max={10} label={language === 'ar' ? 'ضغط منخفض' : 'Low Stress'} color="var(--mizan-green)" />
            </div>
          </div>

          {/* Daily Log */}
          <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'سجل اليوم' : "Daily Log"}
            </h3>

            {/* Mood circles */}
            <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'كيف حالك اليوم؟' : 'How are you feeling?'}</p>
            <div className="flex gap-3 mb-4">
              {MOODS.map(({ key, label, color }) => (
                <button key={key} onClick={() => setSelectedMood(key)}
                  className="flex-1 h-12 rounded-xl text-sm font-bold transition-all"
                  style={{ background: selectedMood === key ? color : 'var(--mizan-elevated)', color: selectedMood === key ? 'white' : color, border: `2px solid ${selectedMood === key ? color : 'var(--mizan-border)'}` }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Sliders */}
            {[
              { label: language === 'ar' ? `النوم: ${sleep} ساعات` : `Sleep: ${sleep}h`, val: sleep, set: setSleep, min: 0, max: 12, step: 0.5, color: 'var(--mizan-gold)' },
              { label: language === 'ar' ? `الترطيب: ${hydration}/10` : `Hydration: ${hydration}/10`, val: hydration, set: setHydration, min: 0, max: 10, step: 1, color: 'var(--mizan-emerald-light)' },
              { label: language === 'ar' ? `ضغط النفس: ${stress}/10` : `Stress: ${stress}/10`, val: stress, set: setStress, min: 0, max: 10, step: 1, color: 'var(--mizan-red)' },
            ].map(({ label, val, set, min, max, step, color }) => (
              <div key={label} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
                </div>
                <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: color }} />
              </div>
            ))}

            <Button onClick={saveLog} disabled={!selectedMood || saving} className="w-full h-10 mt-2 text-white rounded-xl" style={{ background: 'var(--mizan-emerald)' }}>
              {saving ? '...' : (todayLog ? (language === 'ar' ? 'تحديث' : 'Update Log') : (language === 'ar' ? 'حفظ' : 'Save Log'))}
            </Button>
          </div>

          {/* Weekly chart */}
          {logs.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
                {language === 'ar' ? 'الأسبوع الماضي' : 'Last 7 Days'}
              </h3>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--mizan-text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} hide />
                    <Tooltip contentStyle={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="mood" stroke="var(--mizan-emerald)" strokeWidth={2} dot={false} name={language === 'ar' ? 'المزاج' : 'Mood'} connectNulls />
                    <Line type="monotone" dataKey="sleep" stroke="var(--mizan-gold)" strokeWidth={2} dot={false} name={language === 'ar' ? 'النوم' : 'Sleep'} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded" style={{ background: 'var(--mizan-emerald)' }} /><span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'مزاج' : 'Mood'}</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded" style={{ background: 'var(--mizan-gold)' }} /><span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'نوم' : 'Sleep'}</span></div>
              </div>
            </div>
          )}

          {/* 30-day contribution grid */}
          <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'آخر ٣٠ يوماً' : 'Last 30 Days'}
            </h3>
            <ContributionGrid logs={logs} />
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {MOODS.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ background: color + 'CC' }} /><span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}