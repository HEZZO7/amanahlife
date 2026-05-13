import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export default function AddTaskModal({ onClose, onSave, defaultDate }) {
  const { language } = useI18n();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: defaultDate || '', due_time: '', recurring: 'none' });

  const handleSave = async () => {
    if (!form.title.trim()) return;
    await base44.entities.Task.create({ ...form, status: 'pending' });
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div className="relative w-full max-w-md rounded-2xl p-5 space-y-4" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'مهمة جديدة' : 'New Task'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>

        <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder={language === 'ar' ? 'عنوان المهمة' : 'Task title'}
          className="h-11 rounded-xl" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
          autoFocus />

        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder={language === 'ar' ? 'وصف (اختياري)' : 'Description (optional)'}
          className="h-10 rounded-xl" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />

        <div className="grid grid-cols-2 gap-3">
          <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            className="h-10 rounded-xl" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
          <Input type="time" value={form.due_time} onChange={e => setForm(f => ({ ...f, due_time: e.target.value }))}
            className="h-10 rounded-xl" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
            <SelectTrigger className="h-10 rounded-xl" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">{language === 'ar' ? 'عالية' : 'High'}</SelectItem>
              <SelectItem value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</SelectItem>
              <SelectItem value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={form.recurring} onValueChange={v => setForm(f => ({ ...f, recurring: v }))}>
            <SelectTrigger className="h-10 rounded-xl" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{language === 'ar' ? 'لا يتكرر' : 'No repeat'}</SelectItem>
              <SelectItem value="daily">{language === 'ar' ? 'يومي' : 'Daily'}</SelectItem>
              <SelectItem value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</SelectItem>
              <SelectItem value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} className="w-full h-11 rounded-xl text-white" style={{ background: 'var(--mizan-emerald)' }}>
          {language === 'ar' ? 'حفظ المهمة' : 'Save Task'}
        </Button>
      </div>
    </div>
  );
}