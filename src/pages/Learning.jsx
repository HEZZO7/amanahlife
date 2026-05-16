import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Check, ChevronRight, Flame, X } from 'lucide-react';

function EmptyState({ language }) {
  return (
    <div className="text-center py-14 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 opacity-50">
        <path d="M40 4L72 22V58L40 76L8 58V22L40 4Z" stroke="var(--mizan-emerald)" strokeWidth="1.5" fill="none" />
        <path d="M28 40H52M40 28V52" stroke="var(--mizan-gold)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'لا توجد دورات بعد' : 'No courses yet'}</p>
      <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'أضف أول دورة تعليمية' : 'Add your first course to start learning'}</p>
    </div>
  );
}

function AddCourseModal({ onClose, onSaved, language }) {
  const [form, setForm] = useState({ course_name: '', category: '', platform: '', total_hours: '', target_date: '' });
  const save = async () => {
    if (!form.course_name.trim()) return;
    await base44.entities.CourseLog.create({ ...form, total_hours: Number(form.total_hours) || 0 });
    onSaved();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'إضافة دورة' : 'Add Course'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>
        {[
          { key: 'course_name', placeholder: language === 'ar' ? 'اسم الدورة *' : 'Course name *' },
          { key: 'category', placeholder: language === 'ar' ? 'الفئة' : 'Category' },
          { key: 'platform', placeholder: language === 'ar' ? 'المنصة (Udemy, Coursera...)' : 'Platform (Udemy, Coursera...)' },
          { key: 'total_hours', placeholder: language === 'ar' ? 'إجمالي الساعات' : 'Total hours', type: 'number' },
          { key: 'target_date', type: 'date' },
        ].map(({ key, placeholder, type = 'text' }) => (
          <input key={key} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full mb-3 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }} />
        ))}
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={save} className="flex-1 h-10 rounded-xl text-white" style={{ background: 'var(--mizan-emerald)' }}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}

function CourseDetail({ course, onClose, onReload, language }) {
  const [milestones, setMilestones] = useState([]);
  const [newMs, setNewMs] = useState('');

  useEffect(() => {
    base44.entities.CourseMilestone.filter({ course_id: course.id }).then(setMilestones);
  }, [course.id]);

  const addMilestone = async () => {
    if (!newMs.trim()) return;
    await base44.entities.CourseMilestone.create({ course_id: course.id, title: newMs });
    setNewMs('');
    base44.entities.CourseMilestone.filter({ course_id: course.id }).then(setMilestones);
  };

  const toggleMs = async (ms) => {
    await base44.entities.CourseMilestone.update(ms.id, { is_completed: !ms.is_completed, completed_at: !ms.is_completed ? new Date().toISOString() : null });
    base44.entities.CourseMilestone.filter({ course_id: course.id }).then(setMilestones);
    const completed = milestones.filter(m => m.id !== ms.id ? m.is_completed : !ms.is_completed).length;
    const prog = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
    await base44.entities.CourseLog.update(course.id, { progress: prog });
    onReload();
  };

  const updateHours = async (val) => {
    await base44.entities.CourseLog.update(course.id, { completed_hours: Number(val) });
    onReload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--mizan-text)' }}>{course.course_name}</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{course.platform}</span>
          <span className="text-sm font-bold" style={{ color: 'var(--mizan-emerald)' }}>{course.progress || 0}%</span>
        </div>
        <div className="h-2 rounded-full mb-5" style={{ background: 'var(--mizan-border)' }}>
          <div className="h-2 rounded-full" style={{ width: `${course.progress || 0}%`, background: 'var(--mizan-emerald)' }} />
        </div>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'ساعات منجزة' : 'Hours done'}</span>
          <input type="number" defaultValue={course.completed_hours || 0} onBlur={e => updateHours(e.target.value)}
            className="w-20 px-2 py-1 rounded-lg text-sm text-center outline-none" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }} />
          <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>/ {course.total_hours || 0}</span>
        </div>
        <h4 className="text-sm font-semibold mb-3 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'المعالم' : 'Milestones'}</h4>
        <div className="space-y-2 mb-3">
          {milestones.map(ms => (
            <div key={ms.id} onClick={() => toggleMs(ms)} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: ms.is_completed ? 'var(--mizan-emerald)' : 'var(--mizan-border)', background: ms.is_completed ? 'var(--mizan-emerald)' : 'transparent' }}>
                {ms.is_completed && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm" style={{ color: 'var(--mizan-text)', textDecoration: ms.is_completed ? 'line-through' : 'none', opacity: ms.is_completed ? 0.5 : 1 }}>{ms.title}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newMs} onChange={e => setNewMs(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMilestone()}
            placeholder={language === 'ar' ? 'معلم جديد...' : 'New milestone...'}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }} />
          <Button size="sm" onClick={addMilestone} className="h-9 w-9 p-0 text-white" style={{ background: 'var(--mizan-emerald)' }}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}

export default function Learning() {
  const { language } = useI18n();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [streak, setStreak] = useState(0);

  const load = () => {
    setLoading(true);
    base44.entities.CourseLog.list('-updated_date', 50)
      .then(data => {
        setCourses(data);
        // simple streak: days with progress > 0 in recent 30 days
        setStreak(data.filter(c => !c.is_completed).length);
      })
      .catch(err => console.error('Learning load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const active = courses.filter(c => !c.is_completed);
  const done = courses.filter(c => c.is_completed);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'التعلم' : 'Learning'}
        </h1>
        <Button size="sm" onClick={() => setShowAdd(true)} className="h-9 px-3 text-xs text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }}>
          <Plus className="w-3.5 h-3.5" />{language === 'ar' ? 'دورة' : 'Add Course'}
        </Button>
      </div>

      {/* Streak + Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: language === 'ar' ? 'نشط' : 'Active', value: active.length, color: 'var(--mizan-emerald)' },
          { label: language === 'ar' ? 'مكتمل' : 'Completed', value: done.length, color: 'var(--mizan-gold)' },
          { label: language === 'ar' ? 'نسبة الإنجاز' : 'Avg Progress', value: active.length > 0 ? `${Math.round(active.reduce((s, c) => s + (c.progress || 0), 0) / active.length)}%` : '—', color: 'var(--mizan-emerald)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : courses.length === 0 ? (
        <EmptyState language={language} />
      ) : (
        <div className="space-y-3">
          {active.length > 0 && (
            <>
              <p className="text-xs font-semibold mizan-section-header" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'جارية' : 'In Progress'}</p>
              {active.map(c => (
                <div key={c.id} onClick={() => setSelected(c)} className="p-4 rounded-xl cursor-pointer hover:opacity-90 transition-all" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{c.course_name}</p>
                      {c.platform && <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{c.platform}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--mizan-emerald)' }}>{c.progress || 0}%</span>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.progress || 0}%`, background: 'var(--mizan-emerald)' }} />
                  </div>
                  {c.target_date && (
                    <p className="text-xs mt-1.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {language === 'ar' ? 'الهدف: ' : 'Target: '}{format(new Date(c.target_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
          {done.length > 0 && (
            <>
              <p className="text-xs font-semibold mizan-section-header mt-4" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'مكتملة' : 'Completed'}</p>
              {done.map(c => (
                <div key={c.id} className="p-4 rounded-xl flex items-center gap-3 opacity-60" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-emerald)' }} />
                  <p className="text-sm" style={{ color: 'var(--mizan-text)' }}>{c.course_name}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {showAdd && <AddCourseModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} language={language} />}
      {selected && <CourseDetail course={selected} onClose={() => setSelected(null)} onReload={() => { load(); setSelected(null); }} language={language} />}
    </div>
  );
}