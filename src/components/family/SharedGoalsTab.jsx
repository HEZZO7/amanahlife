import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Plus, Target, CheckCircle2, Users, ChevronDown, ChevronUp, X, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORY_COLORS = {
  personal:  { dot: '#2EAA96', bg: '#2EAA9618', label_ar: 'شخصي',  label_en: 'Personal' },
  financial: { dot: '#D4A853', bg: '#D4A85318', label_ar: 'مالي',   label_en: 'Financial' },
  spiritual: { dot: '#5FB3A8', bg: '#5FB3A818', label_ar: 'روحي',   label_en: 'Spiritual' },
  family:    { dot: '#27AE60', bg: '#27AE6018', label_ar: 'عائلي',  label_en: 'Family' },
  health:    { dot: '#C0392B', bg: '#C0392B18', label_ar: 'صحي',    label_en: 'Health' },
};

function ContributorAvatar({ name, contribution, color }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: color || 'var(--mizan-emerald)' }}>
        {initials}
      </div>
      <span className="text-xs font-semibold" style={{ color: 'var(--mizan-emerald)' }}>{contribution}%</span>
    </div>
  );
}

function GoalCard({ goal, members, userMap, isRTL, onRefresh, currentUserEmail }) {
  const [open, setOpen] = useState(false);
  const [editingContrib, setEditingContrib] = useState(false);
  const [myContrib, setMyContrib] = useState('');
  const [myNote, setMyNote] = useState('');
  const [saving, setSaving] = useState(false);

  const cat = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.family;
  const contributors = goal.contributors || [];
  const isDone = goal.status === 'completed';

  // Shared progress = average of all contributors' contributions
  const sharedProgress = contributors.length > 0
    ? Math.round(contributors.reduce((s, c) => s + (c.contribution || 0), 0) / contributors.length)
    : goal.progress || 0;

  const myEntry = contributors.find(c => c.user_email === currentUserEmail);

  const memberColors = ['#2EAA96', '#D4A853', '#5FB3A8', '#27AE60', '#C0392B', '#8E44AD'];

  const handleSaveContrib = async () => {
    const val = parseFloat(myContrib);
    if (isNaN(val) || val < 0 || val > 100) return;
    setSaving(true);
    const updated = contributors.filter(c => c.user_email !== currentUserEmail);
    updated.push({
      user_email: currentUserEmail,
      user_name: userMap[currentUserEmail] || currentUserEmail,
      contribution: val,
      note: myNote,
    });
    // Recalculate shared progress
    const newProgress = Math.round(updated.reduce((s, c) => s + (c.contribution || 0), 0) / updated.length);
    await base44.entities.Goal.update(goal.id, { contributors: updated, progress: newProgress });
    setSaving(false);
    setEditingContrib(false);
    onRefresh();
  };

  return (
    <div className="rounded-xl border overflow-hidden transition-all"
      style={{ background: 'var(--mizan-surface)', borderColor: isDone ? 'var(--mizan-emerald)44' : cat.dot + '44' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: cat.bg }}>
          {isDone
            ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            : <Target className="w-4 h-4" style={{ color: cat.dot }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--mizan-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
            {goal.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs" style={{ color: cat.dot }}>
              {isRTL ? cat.label_ar : cat.label_en}
            </span>
            {contributors.length > 0 && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                <Users className="w-3 h-3" />
                {contributors.length} {isRTL ? 'مساهم' : 'contributors'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold" style={{ color: isDone ? 'var(--mizan-emerald)' : cat.dot }}>
            {sharedProgress}%
          </span>
          {open ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />}
        </div>
      </div>

      {/* Combined progress bar */}
      <div className="mx-4 mb-3">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--mizan-border)' }}>
          {contributors.length > 1 ? (
            // Segmented bar — each contributor gets a slice
            <div className="h-2 flex rounded-full overflow-hidden">
              {contributors.map((c, i) => (
                <div key={i}
                  className="h-2 transition-all"
                  title={`${c.user_name}: ${c.contribution}%`}
                  style={{
                    width: `${(c.contribution || 0) / contributors.length}%`,
                    background: memberColors[i % memberColors.length],
                    minWidth: c.contribution > 0 ? '4px' : '0',
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="h-2 rounded-full transition-all"
              style={{ width: `${sharedProgress}%`, background: isDone ? 'var(--mizan-emerald)' : cat.dot }} />
          )}
        </div>
        {contributors.length > 1 && (
          <div className="flex justify-between mt-0.5">
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isRTL ? 'التقدم المشترك' : 'Shared progress'}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-emerald)' }}>{sharedProgress}%</span>
          </div>
        )}
      </div>

      {/* Expanded section */}
      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--mizan-border)' }}>

          {/* Contributors list */}
          {contributors.length > 0 && (
            <div className="mt-3 mb-4">
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isRTL ? 'المساهمون' : 'Contributors'}
              </p>
              <div className="flex flex-wrap gap-4">
                {contributors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <ContributorAvatar
                      name={c.user_name}
                      contribution={c.contribution}
                      color={memberColors[i % memberColors.length]}
                    />
                    <span className="text-xs text-center max-w-[60px] truncate" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {c.user_name?.split(' ')[0] || c.user_email}
                    </span>
                    {c.note && (
                      <span className="text-xs text-center max-w-[70px]" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.7 }}>
                        "{c.note}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My contribution form */}
          {!editingContrib ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg gap-1.5"
              style={{ borderColor: 'var(--mizan-emerald)', color: 'var(--mizan-emerald)' }}
              onClick={() => {
                setMyContrib(myEntry?.contribution?.toString() || '');
                setMyNote(myEntry?.note || '');
                setEditingContrib(true);
              }}
            >
              <Pencil className="w-3 h-3" />
              {myEntry
                ? (isRTL ? 'تحديث مساهمتي' : 'Update My Progress')
                : (isRTL ? 'أضف مساهمتي' : 'Add My Progress')}
            </Button>
          ) : (
            <div className="mt-2 p-3 rounded-xl space-y-2" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--mizan-text)' }}>
                {isRTL ? 'نسبة إنجازي (0-100%)' : 'My completion (0-100%)'}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0} max={100}
                  value={myContrib}
                  onChange={e => setMyContrib(e.target.value)}
                  placeholder="0"
                  className="h-9 text-sm rounded-lg w-24"
                  style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
                  autoFocus
                />
                <span className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>%</span>
              </div>
              <Input
                value={myNote}
                onChange={e => setMyNote(e.target.value)}
                placeholder={isRTL ? 'ملاحظة (اختياري)' : 'Note (optional)'}
                className="h-9 text-sm rounded-lg"
                style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
              />
              {/* Preview bar */}
              {myContrib && (
                <div className="h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(parseFloat(myContrib) || 0, 100)}%`, background: cat.dot }} />
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" className="h-8 text-white rounded-lg flex-1 text-xs" style={{ background: 'var(--mizan-emerald)' }}
                  onClick={handleSaveContrib} disabled={saving}>
                  {saving ? '...' : (isRTL ? 'حفظ' : 'Save')}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditingContrib(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SharedGoalsTab({ members, userMap }) {
  const { language } = useI18n();
  const isRTL = language === 'ar';
  const [goals, setGoals] = useState([]);
  const [myGoals, setMyGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('family');
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState('shared'); // 'shared' | 'share'

  const load = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    setCurrentUser(user);
    const [sharedGoals, personal] = await Promise.all([
      base44.entities.Goal.filter({ family_id: 'shared', is_shared: true }),
      base44.entities.Goal.list('-created_date', 50),
    ]);
    setGoals(sharedGoals);
    // Personal goals NOT yet shared
    setMyGoals(personal.filter(g => !g.family_id || g.family_id !== 'shared'));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAddGoal = async () => {
    if (!newTitle.trim()) return;
    await base44.entities.Goal.create({
      title: newTitle,
      category: newCategory,
      family_id: 'shared',
      is_shared: true,
      status: 'active',
      progress: 0,
      contributors: [],
    });
    setNewTitle('');
    setShowAdd(false);
    load();
  };

  const handleShareGoal = async (goal) => {
    await base44.entities.Goal.update(goal.id, { family_id: 'shared', is_shared: true });
    load();
  };

  const CATEGORIES = ['personal', 'financial', 'spiritual', 'family', 'health'];

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => (
      <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--mizan-border)' }} />
    ))}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {[
          { key: 'shared', ar: 'الأهداف المشتركة', en: 'Shared Goals' },
          { key: 'share', ar: 'شارك هدفًا', en: 'Share a Goal' },
        ].map(({ key, ar, en }) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: tab === key ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
              color: tab === key ? 'white' : 'var(--mizan-text-secondary)',
              border: `1px solid ${tab === key ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
            }}>
            {isRTL ? ar : en}
          </button>
        ))}
      </div>

      {/* Shared Goals Tab */}
      {tab === 'shared' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isRTL
                ? 'أهداف يساهم فيها أكثر من فرد من العائلة'
                : 'Goals with contributions from multiple family members'}
            </p>
            <Button size="sm" className="h-8 text-xs gap-1 text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }}
              onClick={() => setShowAdd(v => !v)}>
              <Plus className="w-3.5 h-3.5" />
              {isRTL ? 'هدف جديد' : 'New Goal'}
            </Button>
          </div>

          {showAdd && (
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-emerald)44' }}>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder={isRTL ? 'عنوان الهدف المشترك...' : 'Shared goal title...'}
                className="h-9 text-sm rounded-lg"
                style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
              />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => {
                  const cat = CATEGORY_COLORS[c];
                  return (
                    <button key={c} onClick={() => setNewCategory(c)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: newCategory === c ? cat.dot : 'var(--mizan-bg)',
                        color: newCategory === c ? 'white' : cat.dot,
                        border: `1px solid ${cat.dot}55`,
                      }}>
                      {isRTL ? cat.label_ar : cat.label_en}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 text-white rounded-lg flex-1 text-xs" style={{ background: 'var(--mizan-emerald)' }} onClick={handleAddGoal}>
                  {isRTL ? 'إضافة' : 'Add'}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowAdd(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}

          {goals.length === 0 && !showAdd ? (
            <div className="text-center py-12 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '2px dashed var(--mizan-border)' }}>
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--mizan-emerald)' }} />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--mizan-text)' }}>
                {isRTL ? 'لا توجد أهداف مشتركة بعد' : 'No shared goals yet'}
              </p>
              <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isRTL ? 'أضف هدفًا جديدًا أو شارك هدفًا شخصيًا' : 'Add a new goal or share a personal one'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(g => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  members={members}
                  userMap={userMap}
                  isRTL={isRTL}
                  onRefresh={load}
                  currentUserEmail={currentUser?.email}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Share Personal Goal Tab */}
      {tab === 'share' && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isRTL ? 'اختر هدفًا شخصيًا لمشاركته مع العائلة' : 'Select a personal goal to share with your family'}
          </p>
          {myGoals.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isRTL ? 'لا توجد أهداف شخصية للمشاركة' : 'No personal goals to share'}
              </p>
            </div>
          ) : (
            myGoals.map(g => {
              const cat = CATEGORY_COLORS[g.category] || CATEGORY_COLORS.personal;
              return (
                <div key={g.id} className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cat.bg }}>
                    <Target className="w-4 h-4" style={{ color: cat.dot }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--mizan-text)' }}>{g.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: cat.dot }}>{isRTL ? cat.label_ar : cat.label_en}</span>
                      <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{g.progress || 0}%</span>
                    </div>
                  </div>
                  <Button size="sm" className="h-8 text-xs text-white rounded-lg gap-1 flex-shrink-0"
                    style={{ background: 'var(--mizan-emerald)' }}
                    onClick={() => handleShareGoal(g)}>
                    <Users className="w-3 h-3" />
                    {isRTL ? 'شارك' : 'Share'}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}