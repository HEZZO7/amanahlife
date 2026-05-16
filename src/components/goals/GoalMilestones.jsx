import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Plus, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GoalMilestones({ goalId, onProgressChange }) {
  const { t, language } = useI18n();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    load();
  }, [goalId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CourseMilestone.filter({ course_id: goalId }, '-created_date');
      setMilestones(data);
      calculateProgress(data);
    } catch (err) {
      console.error('Load milestones:', err);
    }
    setLoading(false);
  };

  const calculateProgress = (items) => {
    if (items.length === 0) return;
    const completed = items.filter(m => m.is_completed).length;
    const progress = Math.round((completed / items.length) * 100);
    onProgressChange?.(progress);
  };

  const addMilestone = async () => {
    if (!newTitle.trim()) return;
    try {
      await base44.entities.CourseMilestone.create({
        course_id: goalId,
        title: newTitle,
        is_completed: false,
      });
      setNewTitle('');
      setShowAdd(false);
      load();
    } catch (err) {
      console.error('Add milestone:', err);
    }
  };

  const toggleMilestone = async (milestone) => {
    try {
      await base44.entities.CourseMilestone.update(milestone.id, {
        is_completed: !milestone.is_completed,
        completed_at: !milestone.is_completed ? new Date().toISOString() : null,
      });
      load();
    } catch (err) {
      console.error('Toggle milestone:', err);
    }
  };

  const completedCount = milestones.filter(m => m.is_completed).length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="rounded-lg p-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'التقدم' : 'Progress'}
          </p>
          <span className="text-sm font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {completedCount}/{milestones.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'var(--mizan-emerald)' }}
          />
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-2">
        {milestones.map(milestone => (
          <button
            key={milestone.id}
            onClick={() => toggleMilestone(milestone)}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left"
            style={{
              background: 'var(--mizan-elevated)',
              border: '1px solid var(--mizan-border)',
              opacity: milestone.is_completed ? 0.6 : 1,
            }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                borderColor: milestone.is_completed ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
                background: milestone.is_completed ? 'var(--mizan-emerald)' : 'transparent',
              }}
            >
              {milestone.is_completed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span
              className="text-sm flex-1"
              style={{
                color: 'var(--mizan-text)',
                textDecoration: milestone.is_completed ? 'line-through' : 'none',
              }}
            >
              {milestone.title}
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
        ))}
      </div>

      {/* Add Milestone */}
      {showAdd ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMilestone()}
            placeholder={language === 'ar' ? 'عنوان المرحلة...' : 'Milestone title...'}
            className="h-9 rounded-lg"
            style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
          />
          <Button
            size="sm"
            onClick={addMilestone}
            className="h-9 px-3 text-white rounded-lg"
            style={{ background: 'var(--mizan-emerald)' }}
          >
            {language === 'ar' ? 'إضافة' : 'Add'}
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-emerald)' }}
        >
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة مرحلة' : 'Add Milestone'}
        </button>
      )}
    </div>
  );
}