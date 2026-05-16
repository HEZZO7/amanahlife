import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function CompletionDashboard({ tasks }) {
  const { t, language } = useI18n();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const stats = useMemo(() => {
    // Filter tasks for current month
    const monthTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= monthStart && dueDate <= monthEnd;
    });

    const completed = monthTasks.filter(t => t.status === 'completed').length;
    const inProgress = monthTasks.filter(t => t.status === 'in_progress').length;
    const pending = monthTasks.filter(t => t.status === 'pending').length;
    
    // Overdue: pending or in_progress tasks past due date
    const overdue = monthTasks.filter(t => {
      if (t.status === 'completed') return false;
      const dueDate = new Date(t.due_date);
      return dueDate < now && (t.status === 'pending' || t.status === 'in_progress');
    }).length;

    const total = monthTasks.length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onTimeRate = total > 0 ? Math.round(((total - overdue) / total) * 100) : 0;

    // Daily breakdown
    const dailyData = {};
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = format(new Date(d), 'dd');
      dailyData[dateStr] = { completed: 0, pending: 0, overdue: 0 };
    }

    monthTasks.forEach(task => {
      const dateStr = format(new Date(task.due_date), 'dd');
      if (dailyData[dateStr]) {
        if (task.status === 'completed') dailyData[dateStr].completed++;
        else if (new Date(task.due_date) < now && (task.status === 'pending' || task.status === 'in_progress')) {
          dailyData[dateStr].overdue++;
        } else {
          dailyData[dateStr].pending++;
        }
      }
    });

    const dailyChartData = Object.entries(dailyData).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    return {
      completed,
      inProgress,
      pending,
      overdue,
      total,
      successRate,
      onTimeRate,
      monthTasks,
      dailyChartData,
    };
  }, [tasks, now, monthStart, monthEnd]);

  const statusData = [
    {
      name: language === 'ar' ? 'مكتملة' : 'Completed',
      value: stats.completed,
      color: '#0B5B50',
    },
    {
      name: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
      value: stats.inProgress,
      color: '#B89A5E',
    },
    {
      name: language === 'ar' ? 'متأخرة' : 'Overdue',
      value: stats.overdue,
      color: '#C0392B',
    },
    {
      name: language === 'ar' ? 'معلقة' : 'Pending',
      value: stats.pending,
      color: '#E6E2D9',
    },
  ];

  const COLORS = ['#0B5B50', '#B89A5E', '#C0392B', '#E6E2D9'];

  return (
    <div className="space-y-5">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
            </span>
            <Zap className="w-5 h-5" style={{ color: 'var(--mizan-emerald)' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>{stats.successRate}%</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {stats.completed} / {stats.total}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'معدل الالتزام' : 'On-Time Rate'}
            </span>
            <CheckCircle2 className="w-5 h-5" style={{ color: '#0B5B50' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#0B5B50' }}>{stats.onTimeRate}%</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? `${stats.overdue} متأخرة` : `${stats.overdue} overdue`}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
            </span>
            <Clock className="w-5 h-5" style={{ color: '#B89A5E' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#B89A5E' }}>{stats.inProgress}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'مهام جارية' : 'ongoing tasks'}
          </p>
        </div>

        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'متأخرة' : 'Overdue'}
            </span>
            <AlertTriangle className="w-5 h-5" style={{ color: '#C0392B' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#C0392B' }}>{stats.overdue}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'تحتاج إلى اهتمام' : 'need attention'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution Pie Chart */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'توزيع الحالات' : 'Status Distribution'}
          </h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData.filter(d => d.value > 0)}
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
              {language === 'ar' ? 'لا توجد مهام في هذا الشهر' : 'No tasks this month'}
            </div>
          )}
        </div>

        {/* Daily Progress */}
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'التقدم اليومي' : 'Daily Progress'}
          </h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dailyChartData.slice(-15)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mizan-border)" />
                <XAxis dataKey="date" stroke="var(--mizan-text-secondary)" />
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
                <Bar dataKey="pending" fill="#E6E2D9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" fill="#C0392B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'لا توجد بيانات' : 'No data'}
            </div>
          )}
        </div>
      </div>

      {/* Month Summary */}
      <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? `ملخص ${format(now, 'MMMM')}` : `${format(now, 'MMMM')} Summary`}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <span style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
            </span>
            <p className="text-lg font-semibold mt-1" style={{ color: 'var(--mizan-text)' }}>
              {stats.total}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'مكتملة' : 'Completed'}
            </span>
            <p className="text-lg font-semibold mt-1" style={{ color: '#0B5B50' }}>
              {stats.completed}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'متأخرة' : 'Overdue'}
            </span>
            <p className="text-lg font-semibold mt-1" style={{ color: '#C0392B' }}>
              {stats.overdue}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}
            </span>
            <p className="text-lg font-semibold mt-1" style={{ color: 'var(--mizan-emerald)' }}>
              {stats.successRate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}