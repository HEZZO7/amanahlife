import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddTaskModal({ onClose, onSaved, defaultDate }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(defaultDate || '');
  const [dueTime, setDueTime] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await base44.entities.Task.create({ title, priority, due_date: dueDate || undefined, due_time: dueTime || undefined, status: 'pending', recurring: 'none' });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--mizan-text)' }}>{t('planner.addTask')}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('planner.taskTitle')}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 h-11 rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()} />
          </div>
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('planner.priority')}</Label>
            <div className="flex gap-2 mt-2">
              {['low','medium','high'].map(p => (
                <button key={p} onClick={() => setPriority(p)} className="px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all" style={{ background: priority === p ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)', color: priority === p ? 'white' : 'var(--mizan-text-secondary)', border: `1px solid ${priority === p ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}>{p}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.date')}</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 h-10 rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
            </div>
            <div>
              <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('planner.time')}</Label>
              <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="mt-1 h-10 rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
            </div>
          </div>
        </div>
        <Button disabled={saving || !title.trim()} onClick={handleSave} className="w-full mt-5 h-12 rounded-xl text-white font-semibold" style={{ background: 'var(--mizan-emerald)' }}>
          {saving ? t('common.loading') : t('settings.save')}
        </Button>
      </div>
    </div>
  );
}