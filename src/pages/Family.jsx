import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, CheckSquare, Target, Calendar, Plus, Check } from 'lucide-react';
import WealthTab from '@/components/family/WealthTab';
import SharedBudgetTab from '@/components/family/SharedBudgetTab';
import SharedGoalsTab from '@/components/family/SharedGoalsTab';
import FeatureGate from '@/components/monetization/FeatureGate';
import PaywallSheet from '@/components/monetization/PaywallSheet';
import { useSubscription } from '@/hooks/useSubscription';

const TABS = [
  { key: 'members', en: 'Members', ar: 'الأعضاء' },
  { key: 'tasks', en: 'Tasks', ar: 'المهام' },
  { key: 'goals', en: 'Goals', ar: 'الأهداف' },
  { key: 'calendar', en: 'Calendar', ar: 'التقويم' },
  { key: 'budget', en: 'Budget', ar: 'الميزانية' },
  { key: 'wealth', en: 'Wealth', ar: 'الثروة' },
];

function EmptyState({ label }) {
  return (
    <div className="text-center py-14 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 opacity-50">
        <path d="M40 4L72 22V58L40 76L8 58V22L40 4Z" stroke="var(--mizan-emerald)" strokeWidth="1.5" fill="none" />
        <path d="M40 18L60 29V51L40 62L20 51V29L40 18Z" stroke="var(--mizan-gold)" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
      <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
    </div>
  );
}

export default function Family() {
  const { t, language } = useI18n();
  const { isFamily } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(!isFamily);
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.FamilyMember.list(),
      base44.entities.Task.filter({ family_id: { $exists: true } }),
      base44.entities.Goal.filter({ family_id: { $exists: true } }),
      base44.entities.Event.filter({ family_id: { $exists: true } }),
    ])
      .then(async ([m, t, g, e]) => {
        setMembers(m);
        setTasks(t);
        setGoals(g);
        setEvents(e);
        // Fetch user names for each member
        if (m.length > 0) {
          const users = await base44.entities.User.list().catch(() => []);
          const map = {};
          users.forEach(u => { map[u.id] = u.full_name; });
          setUserMap(map);
        }
      })
      .catch(err => console.error('Family load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    await base44.entities.Task.create({ title: newTaskTitle, family_id: 'shared', status: 'pending' });
    setNewTaskTitle('');
    setShowAddTask(false);
    load();
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await base44.entities.Task.update(task.id, { status: newStatus });
    load();
  };

  if (!isFamily) {
    return (
      <>
        <FeatureGate allowed={false} feature="family" fullPage />
        {showPaywall && <PaywallSheet onClose={() => setShowPaywall(false)} />}
      </>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('nav.family')}
        </h1>
        <Users className="w-6 h-6" style={{ color: 'var(--mizan-emerald)' }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(({ key, en, ar }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{
              background: tab === key ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
              color: tab === key ? 'white' : 'var(--mizan-text-secondary)',
              border: `1.5px solid ${tab === key ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
            }}
          >
            {language === 'ar' ? ar : en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          {/* Members */}
          {tab === 'members' && (
            <FeatureGate allowed={isFamily} feature="family" fullPage>
              <div className="space-y-3">
                {members.length === 0 ? (
                  <EmptyState label={language === 'ar' ? 'لا يوجد أعضاء عائلة بعد' : 'No family members yet'} />
                ) : members.map(m => (
                  <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--mizan-emerald)' }}>
                      {(userMap[m.user_id] || 'M')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{userMap[m.user_id] || 'Member'}</p>
                      <p className="text-xs capitalize" style={{ color: 'var(--mizan-text-secondary)' }}>{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FeatureGate>
          )}

          {/* Shared Tasks */}
          {tab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex justify-end mb-2">
                <Button size="sm" onClick={() => setShowAddTask(v => !v)} className="h-8 px-3 text-xs text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }}>
                  <Plus className="w-3.5 h-3.5" />{language === 'ar' ? 'مهمة' : 'Add Task'}
                </Button>
              </div>
              {showAddTask && (
                <div className="flex gap-2 p-3 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                  <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder={language === 'ar' ? 'عنوان المهمة...' : 'Task title...'}
                    className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--mizan-text)' }} />
                  <Button size="sm" onClick={addTask} className="h-8 w-8 p-0 text-white" style={{ background: 'var(--mizan-emerald)' }}><Check className="w-3.5 h-3.5" /></Button>
                </div>
              )}
              {tasks.length === 0 ? <EmptyState label={language === 'ar' ? 'لا توجد مهام عائلية' : 'No shared tasks yet'} /> : (
                tasks.map(task => (
                  <div key={task.id} onClick={() => toggleTask(task)}
                    className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:opacity-90"
                    style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: task.status === 'completed' ? 'var(--mizan-emerald)' : 'var(--mizan-border)', background: task.status === 'completed' ? 'var(--mizan-emerald)' : 'transparent' }}>
                      {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm flex-1" style={{ color: 'var(--mizan-text)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.5 : 1 }}>{task.title}</span>
                    {task.assigned_to && <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{task.assigned_to}</span>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Family Goals */}
          {tab === 'goals' && (
            <FeatureGate allowed={isFamily} feature="family" fullPage>
              <SharedGoalsTab members={members} userMap={userMap} />
            </FeatureGate>
          )}

          {/* Family Calendar */}
           {tab === 'calendar' && (
             <FeatureGate allowed={isFamily} feature="family" fullPage>
             <div className="space-y-3">
               {events.length === 0 ? <EmptyState label={language === 'ar' ? 'لا توجد أحداث عائلية' : 'No family events yet'} /> : (
                 events.map(e => (
                   <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                     <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                       <Calendar className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
                     </div>
                     <div>
                       <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{e.title}</p>
                       <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                         {e.start_datetime ? format(new Date(e.start_datetime), 'MMM d, yyyy') : ''}
                       </p>
                     </div>
                   </div>
                 ))
               )}
             </div>
             </FeatureGate>
           )}

           {/* Budget */}
           {tab === 'budget' && (
             <FeatureGate allowed={isFamily} feature="family" fullPage>
               <SharedBudgetTab familyId="shared" />
             </FeatureGate>
           )}

           {/* Wealth */}
           {tab === 'wealth' && (
             <FeatureGate allowed={isFamily} feature="family" fullPage>
               <WealthTab familyId="shared" members={members} userMap={userMap} />
             </FeatureGate>
           )}
        </>
      )}
    </div>
  );
}