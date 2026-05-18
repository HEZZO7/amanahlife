import React, { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import {
  RadialBarChart, RadialBar, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const CATEGORY_COLORS = {
  personal:  '#0B5B50',
  financial: '#B89A5E',
  spiritual: '#2EAA96',
  family:    '#7C6F9F',
  health:    '#27AE60',
};

const CATEGORY_LABELS_AR = {
  personal:  'شخصي',
  financial: 'مالي',
  spiritual: 'روحي',
  family:    'عائلي',
  health:    'صحي',
};
const CATEGORY_LABELS_EN = {
  personal:  'Personal',
  financial: 'Financial',
  spiritual: 'Spiritual',
  family:    'Family',
  health:    'Health',
};

export default function GoalsProgressChart({ goals, tasks }) {
  const { language } = useI18n();
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState('progress'); // 'progress' | 'category'

  // Per-goal progress data
  const goalData = useMemo(() => {
    return goals
      .filter(g => g.status === 'active' || g.status === 'completed')
      .map(goal => {
        const goalTasks = tasks.filter(t => t.goal_id === goal.id);
        const completedTasks = goalTasks.filter(t => t.status === 'completed').length;
        const totalTasks = goalTasks.length;
        const progress = goal.progress || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
        return {
          id: goal.id,
          title: goal.title,
          category: goal.category || 'personal',
          progress,
          completedTasks,
          totalTasks,
          status: goal.status,
        };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [goals, tasks]);

  // Category aggregation for pie chart
  const categoryData = useMemo(() => {
    const map = {};
    goals.forEach(g => {
      const cat = g.category || 'personal';
      if (!map[cat]) map[cat] = { name: cat, count: 0, completed: 0 };
      map[cat].count++;
      if (g.status === 'completed') map[cat].completed++;
    });
    return Object.values(map).map(d => ({
      ...d,
      label: isAr ? (CATEGORY_LABELS_AR[d.name] || d.name) : (CATEGORY_LABELS_EN[d.name] || d.name),
      color: CATEGORY_COLORS[d.name] || '#888',
    }));
  }, [goals, isAr]);

  if (goalData.length === 0 && categoryData.length === 0) return null;

  const tabs = [
    { id: 'progress', label: isAr ? 'تقدم الأهداف' : 'Goal Progress' },
    { id: 'category', label: isAr ? 'حسب التصنيف' : 'By Category' },
  ];

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="p-2 rounded-lg text-xs" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <p className="font-semibold" style={{ color: 'var(--mizan-text)' }}>{d.label}</p>
        <p style={{ color: 'var(--mizan-text-secondary)' }}>{isAr ? 'الإجمالي:' : 'Total:'} {d.count}</p>
        <p style={{ color: 'var(--mizan-emerald)' }}>{isAr ? 'مكتمل:' : 'Completed:'} {d.completed}</p>
      </div>
    );
  };

  return (
    <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)',
              color: activeTab === tab.id ? 'white' : 'var(--mizan-text-secondary)',
              border: `1px solid ${activeTab === tab.id ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Progress bars per goal */}
      {activeTab === 'progress' && (
        <div className="space-y-3">
          {goalData.map(item => (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs font-medium truncate max-w-[70%]"
                  style={{ color: 'var(--mizan-text)' }}
                  title={item.title}
                >
                  {item.title}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: (CATEGORY_COLORS[item.category] || '#888') + '22',
                      color: CATEGORY_COLORS[item.category] || '#888',
                    }}
                  >
                    {isAr ? (CATEGORY_LABELS_AR[item.category] || item.category) : (CATEGORY_LABELS_EN[item.category] || item.category)}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--mizan-text-secondary)', minWidth: '32px', textAlign: 'right' }}>
                    {item.progress}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--mizan-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.progress}%`,
                    background: item.progress >= 75
                      ? 'var(--mizan-green)'
                      : item.progress >= 40
                        ? 'var(--mizan-emerald)'
                        : 'var(--mizan-gold)',
                  }}
                />
              </div>
              {item.totalTasks > 0 && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {isAr
                    ? `${item.completedTasks} من ${item.totalTasks} مهمة مكتملة`
                    : `${item.completedTasks}/${item.totalTasks} tasks done`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Pie chart by category */}
      {activeTab === 'category' && categoryData.length > 0 && (
        <div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Category legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--mizan-text)' }}>{cat.label}</p>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {cat.count} {isAr ? 'هدف' : 'goals'} · {cat.completed} {isAr ? 'مكتمل' : 'done'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}