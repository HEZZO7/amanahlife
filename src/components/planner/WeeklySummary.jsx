import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle2, Archive } from 'lucide-react';

export default function WeeklySummary({ tasks, weekStart }) {
  const { t, language } = useI18n();
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 6 });

  const stats = useMemo(() => {
    const weekTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= weekStart && dueDate <= weekEnd;
    });

    const completed = weekTasks.filter(t => t.status === 'completed').length;
    const archived = weekTasks.filter(t => t.is_archived).length;
    const pending = weekTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const total = weekTasks.length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const commitmentScore = total > 0 ? Math.round(((completed + archived) / total) * 100) : 0;

    return {
      completed,
      archived,
      pending,
      total,
      completionRate,
      commitmentScore,
      weekTasks,
    };
  }, [tasks, weekStart, weekEnd]);

  const pieData = [
    { name: language === 'ar' ? 'مكتملة' : 'Completed', value: stats.completed },
    { name: language === 'ar' ? 'مؤرشفة' : 'Archived', value: stats.archived },
    { name: language === 'ar' ? 'قيد الانتظار' : 'Pending', value: stats.pending },
  ];

  const COLORS = ['#0B5B50', '#B89A5E', '#E6E2D9'];

  const priorityData = useMemo(() => {
    const high = stats.weekTasks.filter(t => t.priority === 'high');
    const medium = stats.weekTasks.filter(t => t.priority === 'medium');
    const low = stats.weekTasks.filter(t => t.priority === 'low');

    return [
      {
        name: language === 'ar' ? 'عالية' : 'High',
        completed: high.filter(t => t.status === 'completed').length,
        total: high.length,
      },
      {
        name: language === 'ar' ? 'متوسطة' : 'Medium',
        completed: medium.filter(t => t.status === 'completed').length,
        total: medium.length,
      },
      {
        name: language === 'ar' ? 'منخفضة' : 'Low',
        completed: low.filter(t => t.status === 'completed').length,
        total: low.length,
      },
    ];
  }, [stats.weekTasks, language]);

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
            </span>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--mizan-emerald)' }}>
              <span className="text-xs font-bold text-white">{stats.total}</span>
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>{stats.total}</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'مكتملة' : 'Completed'}
            </span>
            <CheckCircle2 className="w-5 h-5" style={{ color: '#0B5B50' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#0B5B50' }}>{stats.completed}</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'مؤرشفة' : 'Archived'}
            </span>
            <Archive className="w-5 h-5" style={{ color: '#B89A5E' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#B89A5E' }}>{stats.archived}</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'نسبة الالتزام' : 'Commitment'}
            </span>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--mizan-emerald)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>{stats.commitmentScore}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'توزيع المهام' : 'Task Distribution'}
          </h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'لا توجد مهام في هذا الأسبوع' : 'No tasks this week'}
            </div>
          )}
        </div>

        {/* Bar Chart - Priority Analysis */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'تحليل الأولويات' : 'Priority Analysis'}
          </h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mizan-border)" />
                <XAxis dataKey="name" stroke="var(--mizan-text-secondary)" />
                <YAxis stroke="var(--mizan-text-secondary)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--mizan-elevated)',
                    border: '1px solid var(--mizan-border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => value}
                />
                <Bar dataKey="completed" fill="#0B5B50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#E6E2D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'لا توجد مهام في هذا الأسبوع' : 'No tasks this week'}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'ملخص الأسبوع' : 'Weekly Summary'}
        </h3>
        <div className="space-y-2 text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
          <p>
            {language === 'ar'
              ? `لديك ${stats.total} مهام في هذا الأسبوع، أكملت منها ${stats.completed} (${stats.completionRate}%)`
              : `You have ${stats.total} tasks this week, completed ${stats.completed} (${stats.completionRate}%)`}
          </p>
          <p>
            {language === 'ar'
              ? `معدل التزامك الكلي ${stats.commitmentScore}% (مكتملة + مؤرشفة)`
              : `Your overall commitment rate is ${stats.commitmentScore}% (completed + archived)`}
          </p>
          {stats.pending > 0 && (
            <p className="text-orange-600">
              {language === 'ar'
                ? `⚠️ لديك ${stats.pending} مهام قيد الانتظار`
                : `⚠️ You have ${stats.pending} pending tasks`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}