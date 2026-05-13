import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Plus, X, Heart } from 'lucide-react';

const TYPES = [
  { key: 'sadaqah', en: 'Sadaqah', ar: 'صدقة' },
  { key: 'zakat', en: 'Zakat', ar: 'زكاة' },
  { key: 'donation', en: 'Donation', ar: 'تبرع' },
  { key: 'zakat_al_fitr', en: 'Zakat al-Fitr', ar: 'زكاة الفطر' },
];

export default function SpiritualCharity({ onReload }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const sym = settings?.currency_symbol || 'ر.س';
  const [logs, setLogs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'sadaqah', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });

  const load = async () => {
    const l = await base44.entities.CharityLog.list('-date', 20);
    setLogs(l);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.amount) return;
    await base44.entities.CharityLog.create({ ...form, amount: parseFloat(form.amount) });
    setForm({ amount: '', type: 'sadaqah', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
    setShowAdd(false);
    load();
    onReload();
  };

  const total = logs.reduce((s, l) => s + (l.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(11,91,80,0.1)' }}>
          <Heart className="w-6 h-6" style={{ color: 'var(--mizan-emerald)' }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'إجمالي الصدقات' : 'Total Charity'}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-gold)' }}>{sym} {total.toLocaleString()}</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="ms-auto h-9 rounded-lg text-white gap-1" style={{ background: 'var(--mizan-emerald)' }}>
          <Plus className="w-3.5 h-3.5" />
          {language === 'ar' ? 'إضافة' : 'Add'}
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'تسجيل صدقة' : 'Log Charity'}</span>
            <button onClick={() => setShowAdd(false)}><X className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder={language === 'ar' ? 'المبلغ' : 'Amount'} value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="h-10 rounded-lg" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
            <Input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="h-10 rounded-lg" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger className="h-10 rounded-lg col-span-2" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{TYPES.map(tp => <SelectItem key={tp.key} value={tp.key}>{language === 'ar' ? tp.ar : tp.en}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder={language === 'ar' ? 'ملاحظات' : 'Notes'} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="h-10 rounded-lg col-span-2" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
          </div>
          <Button onClick={handleAdd} className="mt-3 h-10 w-full rounded-lg text-white" style={{ background: 'var(--mizan-emerald)' }}>
            {language === 'ar' ? 'حفظ' : 'Save'}
          </Button>
        </div>
      )}

      {/* Log list */}
      {logs.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)' }}>
          <div className="divide-y" style={{ borderColor: 'var(--mizan-border)' }}>
            {logs.map(l => {
              const tp = TYPES.find(t => t.key === l.type);
              return (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--mizan-surface)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(11,91,80,0.1)' }}>
                    <Heart className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? tp?.ar : tp?.en}</p>
                    <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{l.date}{l.notes ? ` · ${l.notes}` : ''}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--mizan-gold)' }}>{sym} {Number(l.amount).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}