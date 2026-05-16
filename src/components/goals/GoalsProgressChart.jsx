import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function GoalsProgressChart({ goals, tasks }) {
  const { language } = useI18n();

  const chartData = useMemo(() => {
    return goals
      .filter(g => g.status === 'active' || g.status === 'completed')
      .map(goal => {
        const goalTasks = tasks.filter(t => t.goal_id === goal.id);
        const completedTasks = goalTasks.filter(t => t.status === 'completed').length;
        const totalTasks = goalTasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          name: goal.title,
          completed: completedTasks,
          total: totalTasks,
          progress,
          goalId: goal.id,
        };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [goals, tasks]);

  if (chartData.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const data = payload[0].payload;
    return (
      <div className="p-2 rounded-lg text-xs" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <p style={{ color: 'var(--mizan-text)' }}>{data.name}</p>
        <p style={{ color: 'var(--mizan-emerald)' }}>
          {language === 'ar' ? 'مهام مكتملة:' : 'Completed:'} {data.completed}/{data.total}
        </p>
        <p style={{ color: 'var(--mizan-gold)' }}>
          {language === 'ar' ? 'التقدم:' : 'Progress:'} {data.progress}%
        </p>
      </div>
    );
  };

  return (
    <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--mizan-text)' }}>
        {language === 'ar' ? '📊 تقدم الأهداف طويلة المدى' : '📊 Long-term Goals Progress'}
      </h3>

      <div style={{ width: '100%', height: '280px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mizan-border)" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11, fill: 'var(--mizan-text-secondary)' }}
          />
          <YAxis
            label={{ value: language === 'ar' ? 'المهام' : 'Tasks', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 11, fill: 'var(--mizan-text-secondary)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="completed" fill="var(--mizan-emerald)" name={language === 'ar' ? 'مكتملة' : 'Completed'} radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.progress >= 75 ? 'var(--mizan-green)' : entry.progress >= 50 ? 'var(--mizan-emerald)' : 'var(--mizan-gold)'}
              />
            ))}
          </Bar>
          <Bar
            dataKey="total"
            fill="var(--mizan-border)"
            name={language === 'ar' ? 'الإجمالي' : 'Total'}
            opacity={0.4}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>

      {/* Legend with progress indicators */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {chartData.slice(0, 6).map(item => (
          <div key={item.goalId} className="p-2 rounded-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <p className="truncate font-medium" style={{ color: '#d1fae5' }} title={item.name}>{item.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.progress}%`,
                    background: item.progress >= 75 ? 'var(--mizan-green)' : item.progress >= 50 ? 'var(--mizan-emerald)' : 'var(--mizan-gold)',
                  }}
                />
              </div>
              <span style={{ color: 'var(--mizan-text-secondary)', minWidth: '20px', textAlign: 'right' }}>{item.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}