import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trophy, Target, CheckCircle2, Flame, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  LineChart, Line, RadialBarChart, RadialBar, PieChart, Pie
} from 'recharts';

const MONTH_COUNT = 6;

function StatCard({ icon: Icon, value, label, color, accent }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1" style={{ background: `${color}22` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-2xl font-bold" style={{ color: accent || 'var(--mizan-text)' }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h2 className="text-sm font-semibold mizan-section-header mb-3" style={{ color: 'var(--mizan-text)' }}>{title}</h2>
  );
}

function CustomTooltip({ active, payload, label, lang, symbol }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.stroke }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
}

export default function AchievementsDashboard() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const lang = language;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tasks, goals, prayerLogs] = await Promise.all([
      base44.entities.Task.list('-created_date', 500),
      base44.entities.Goal.list('-created_date', 100),
      base44.entities.PrayerLog.list('-date', 180),
    ]);

    // --- Monthly task completion (last 6 months) ---
    const monthlyTasks = Array.from({ length: MONTH_COUNT }, (_, i) => {
      const d = subMonths(new Date(), MONTH_COUNT - 1 - i);
      const key = format(d, 'yyyy-MM');
      const monthTasks = tasks.filter(t => (t.updated_date || t.created_date || '').startsWith(key));
      const completed = monthTasks.filter(t => t.status === 'completed').length;
      const total = monthTasks.length;
      return {
        month: lang === 'ar'
          ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()]
          : format(d, 'MMM'),
        completed,
        pending: total - completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    // --- Goal progress by category ---
    const catMap = {};
    goals.forEach(g => {
      const cat = g.category || (lang === 'ar' ? 'أخرى' : 'Other');
      if (!catMap[cat]) catMap[cat] = { total: 0, completed: 0, progress: 0 };
      catMap[cat].total++;
      if (g.status === 'completed') catMap[cat].completed++;
      catMap[cat].progress += (g.progress || 0);
    });
    const goalsByCategory = Object.entries(catMap).map(([name, v]) => ({
      name,
      completed: v.completed,
      active: v.total - v.completed,
      avgProgress: v.total > 0 ? Math.round(v.progress / v.total) : 0,
    }));

    // --- Task priority breakdown ---
    const priorityData = [
      { name: lang === 'ar' ? 'عالية' : 'High', value: tasks.filter(t => t.priority === 'high' && t.status === 'completed').length, fill: 'var(--mizan-red)' },
      { name: lang === 'ar' ? 'متوسطة' : 'Medium', value: tasks.filter(t => t.priority === 'medium' && t.status === 'completed').length, fill: 'var(--mizan-gold)' },
      { name: lang === 'ar' ? 'منخفضة' : 'Low', value: tasks.filter(t => t.priority === 'low' && t.status === 'completed').length, fill: 'var(--mizan-emerald)' },
    ];

    // --- Streaks & KPIs ---
    const totalCompleted = tasks.filter(t => t.status === 'completed').length;
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const avgGoalProgress = totalGoals > 0
      ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / totalGoals)
      : 0;

    // Prayer streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = subMonths(new Date(), 0);
      const dateStr = format(new Date(Date.now() - i * 86400000), 'yyyy-MM-dd');
      const log = prayerLogs.find(p => p.date === dateStr);
      const count = log ? ['fajr','dhuhr','asr','maghrib','isha'].filter(pr => log[pr]).length : 0;
      if (count >= 5) streak++;
      else break;
    }

    // --- Weekly task completion heatmap (last 7 weeks × 7 days) ---
    const heatmapWeeks = Array.from({ length: 7 }, (_, wi) => {
      return Array.from({ length: 7 }, (_, di) => {
        const dayOffset = (6 - wi) * 7 + (6 - di);
        const dateStr = format(new Date(Date.now() - dayOffset * 86400000), 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => (t.updated_date || '').startsWith(dateStr) && t.status === 'completed');
        return { date: dateStr, count: dayTasks.length };
      });
    });

    setData({ monthlyTasks, goalsByCategory, priorityData, totalCompleted, totalGoals, completedGoals, avgGoalProgress, streak, heatmapWeeks });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    );
  }

  const BAR_COLORS = ['#0B5B50','#12897A','#1aaa99','#B89A5E','#d4b87e','#e8d4a0'];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--mizan-emerald)' }}>
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--mizan-text)' }}>
            {lang === 'ar' ? 'لوحة الإنجازات' : 'Achievements Dashboard'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? 'تتبع تقدمك الشهري بصريًا' : 'Visually track your monthly progress'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={CheckCircle2} value={data.totalCompleted} label={lang === 'ar' ? 'مهام مكتملة' : 'Tasks Done'} color="var(--mizan-emerald)" accent="var(--mizan-emerald)" />
        <StatCard icon={Target} value={`${data.completedGoals}/${data.totalGoals}`} label={lang === 'ar' ? 'أهداف محققة' : 'Goals Done'} color="var(--mizan-gold)" accent="var(--mizan-gold)" />
        <StatCard icon={TrendingUp} value={`${data.avgGoalProgress}%`} label={lang === 'ar' ? 'متوسط التقدم' : 'Avg Progress'} color="#12897A" />
        <StatCard icon={Flame} value={data.streak} label={lang === 'ar' ? 'أيام صلاة متتالية' : 'Prayer Streak'} color="var(--mizan-red)" accent={data.streak >= 7 ? 'var(--mizan-red)' : undefined} />
      </div>

      {/* Monthly Task Completion Bar Chart */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <SectionHeader title={lang === 'ar' ? '📋 المهام المكتملة شهريًا' : '📋 Monthly Task Completion'} />
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTasks} barCategoryGap="25%">
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--mizan-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip lang={lang} />} />
              <Bar dataKey="completed" name={lang === 'ar' ? 'مكتملة' : 'Completed'} radius={[6, 6, 0, 0]} fill="var(--mizan-emerald)" />
              <Bar dataKey="pending" name={lang === 'ar' ? 'معلقة' : 'Pending'} radius={[6, 6, 0, 0]} fill="var(--mizan-border)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--mizan-emerald)' }} />
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{lang === 'ar' ? 'مكتملة' : 'Completed'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--mizan-border)' }} />
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{lang === 'ar' ? 'معلقة' : 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* Completion Rate Line Chart */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <SectionHeader title={lang === 'ar' ? '📈 نسبة الإنجاز الشهرية' : '📈 Monthly Completion Rate'} />
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyTasks}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--mizan-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip lang={lang} />} formatter={(v) => `${v}%`} />
              <Line
                type="monotone"
                dataKey="rate"
                name={lang === 'ar' ? 'نسبة الإنجاز' : 'Completion %'}
                stroke="var(--mizan-gold)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--mizan-gold)', r: 5, strokeWidth: 2, stroke: 'var(--mizan-elevated)' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Motivation badge */}
        {(() => {
          const lastRate = data.monthlyTasks[data.monthlyTasks.length - 1]?.rate || 0;
          const prevRate = data.monthlyTasks[data.monthlyTasks.length - 2]?.rate || 0;
          const diff = lastRate - prevRate;
          if (diff > 0) return (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: '#0B5B5022', color: 'var(--mizan-emerald)' }}>
              <Star className="w-3.5 h-3.5" />
              {lang === 'ar' ? `تحسن بنسبة ${diff}% عن الشهر الماضي 🎉` : `Improved by ${diff}% vs last month 🎉`}
            </div>
          );
          return null;
        })()}
      </div>

      {/* Goal Progress by Category */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <SectionHeader title={lang === 'ar' ? '🎯 تقدم الأهداف حسب الفئة' : '🎯 Goal Progress by Category'} />
        {data.goalsByCategory.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? 'لا توجد أهداف بعد' : 'No goals yet'}
          </p>
        ) : (
          <div style={{ height: Math.max(160, data.goalsByCategory.length * 44) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.goalsByCategory} layout="vertical" barCategoryGap="20%">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--mizan-text-secondary)' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip lang={lang} />} />
                <Bar dataKey="completed" name={lang === 'ar' ? 'مكتمل' : 'Completed'} stackId="a" fill="var(--mizan-emerald)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="active" name={lang === 'ar' ? 'جاري' : 'Active'} stackId="a" fill="var(--mizan-gold)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Task Priority Breakdown */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <SectionHeader title={lang === 'ar' ? '✅ المهام المكتملة حسب الأولوية' : '✅ Completed Tasks by Priority'} />
        <div className="flex items-center gap-4" style={{ height: 140 }}>
          <ResponsiveContainer width="45%" height="100%">
            <PieChart>
              <Pie data={data.priorityData} cx="50%" cy="50%" innerRadius={32} outerRadius={56} dataKey="value" paddingAngle={3}>
                {data.priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip lang={lang} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 flex-1">
            {data.priorityData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                  <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{item.name}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--mizan-text)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Motivational footer */}
      <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, var(--mizan-emerald) 0%, #12897A 100%)' }}>
        <Trophy className="w-6 h-6 text-white mx-auto mb-2 opacity-80" />
        <p className="text-white text-sm font-semibold">
          {lang === 'ar'
            ? `أكملت ${data.totalCompleted} مهمة وحققت ${data.completedGoals} هدفًا — استمر! 💪`
            : `You completed ${data.totalCompleted} tasks & ${data.completedGoals} goals — Keep going! 💪`}
        </p>
      </div>
    </div>
  );
}