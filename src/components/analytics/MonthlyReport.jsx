import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';

const COLORS = ['#2EAA96', '#D4A853', '#25917F', '#C0392B', '#27AE60'];

export default function MonthlyReport() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const currSymbol = settings?.currency_symbol || 'ر.س';

  useEffect(() => {
    loadReport();
  }, [selectedMonth]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      const monthStr = format(selectedMonth, 'yyyy-MM');

      // جلب المهام المكتملة
      const allTasks = await base44.entities.Task.list('-completed_at', 1000);
      const monthTasks = allTasks.filter(t => {
        const completed = t.completed_at ? t.completed_at.substring(0, 7) : null;
        return completed === monthStr;
      });

      const taskStats = {
        total: monthTasks.length,
        byPriority: {
          high: monthTasks.filter(t => t.priority === 'high').length,
          medium: monthTasks.filter(t => t.priority === 'medium').length,
          low: monthTasks.filter(t => t.priority === 'low').length,
        },
        byStatus: {
          completed: monthTasks.filter(t => t.status === 'completed').length,
          inProgress: monthTasks.filter(t => t.status === 'in_progress').length,
          pending: monthTasks.filter(t => t.status === 'pending').length,
        },
      };

      // جلب المعاملات المالية
      const allTransactions = await base44.entities.Transaction.list('-date', 2000);
      const monthTransactions = allTransactions.filter(t => t.date?.substring(0, 7) === monthStr);

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      const expensesByCategory = {};
      monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });

      // البيانات المالية اليومية
      const dailyData = {};
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        dailyData[dateStr] = { day: format(d, 'd'), income: 0, expense: 0, tasks: 0 };
      }

      monthTransactions.forEach(t => {
        if (dailyData[t.date]) {
          if (t.type === 'income') dailyData[t.date].income += t.amount;
          if (t.type === 'expense') dailyData[t.date].expense += t.amount;
        }
      });

      monthTasks.forEach(t => {
        if (t.completed_at) {
          const dateStr = t.completed_at.substring(0, 10);
          if (dailyData[dateStr]) dailyData[dateStr].tasks += 1;
        }
      });

      const chartData = Object.values(dailyData).filter(d => d.income > 0 || d.expense > 0 || d.tasks > 0);

      const expenseCategoryData = Object.entries(expensesByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const balance = income - expenses;
      const productivity = taskStats.total > 0 ? ((taskStats.byStatus.completed / taskStats.total) * 100).toFixed(1) : 0;

      setReport({
        month: format(selectedMonth, 'MMMM yyyy'),
        taskStats,
        financial: { income, expenses, balance },
        expensesByCategory: expenseCategoryData,
        chartData,
        productivity,
      });
    } catch (err) {
      console.error('Error loading monthly report:', err);
    }
    setLoading(false);
  };

  const prevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const nextMonth = () => setSelectedMonth(subMonths(selectedMonth, -1));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--mizan-emerald)' }} />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-5">
      {/* Header مع التنقل بين الأشهر */}
      <div className="flex items-center justify-between rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <button onClick={prevMonth} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
          {language === 'ar' ? '→' : '←'}
        </button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>{report.month}</h2>
        <button onClick={nextMonth} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
          {language === 'ar' ? '←' : '→'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* المهام المكتملة */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'المهام المكتملة' : 'Tasks Completed'}
            </span>
            <Target className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>{report.taskStats.byStatus.completed}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? `إنتاجية ${report.productivity}%` : `${report.productivity}% productivity`}
          </p>
        </div>

        {/* الدخل */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'الدخل' : 'Income'}
            </span>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>{currSymbol} {report.financial.income.toLocaleString()}</p>
        </div>

        {/* المصروفات */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'المصروفات' : 'Expenses'}
            </span>
            <TrendingDown className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-red)' }}>{currSymbol} {report.financial.expenses.toLocaleString()}</p>
        </div>

        {/* الرصيد */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'الرصيد' : 'Balance'}
            </span>
            <DollarSign className="w-4 h-4" style={{ color: report.financial.balance >= 0 ? 'var(--mizan-emerald)' : 'var(--mizan-red)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: report.financial.balance >= 0 ? 'var(--mizan-emerald)' : 'var(--mizan-red)' }}>
            {currSymbol} {report.financial.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* الرسم البياني اليومي */}
      {report.chartData.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'النشاط اليومي' : 'Daily Activity'}
          </h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.chartData}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="income" fill="var(--mizan-emerald)" name={language === 'ar' ? 'دخل' : 'Income'} />
                <Bar dataKey="expense" fill="var(--mizan-red)" name={language === 'ar' ? 'مصروف' : 'Expense'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* توزيع المصروفات */}
      {report.expensesByCategory.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'توزيع المصروفات' : 'Expense Distribution'}
          </h3>
          <div style={{ height: 200 }} className="flex items-center gap-4">
            <ResponsiveContainer width="35%" height="100%">
              <PieChart>
                <Pie data={report.expensesByCategory} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                  {report.expensesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {report.expensesByCategory.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--mizan-text)' }}>{item.name}</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {currSymbol} {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* تفصيل المهام */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الأولويات العالية' : 'High Priority'}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-red)' }}>{report.taskStats.byPriority.high}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الأولويات المتوسطة' : 'Medium Priority'}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-gold)' }}>{report.taskStats.byPriority.medium}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الأولويات المنخفضة' : 'Low Priority'}
          </p>
          <p className="text-2xl font-bold" style={{ color: '#27AE60' }}>{report.taskStats.byPriority.low}</p>
        </div>
      </div>
    </div>
  );
}