import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const CHARITY_TYPES = ['sadaqah', 'zakat', 'donation', 'zakat_al_fitr'];

export default function CharityLogSection() {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const currSymbol = settings?.currency_symbol || 'ر.س';
  const [logs, setLogs] = useState([]);
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('sadaqah');

  const load = async () => {
    const data = await base44.entities.CharityLog.list('-date', 20);
    setLogs(data);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!amount) return;
    await base44.entities.CharityLog.create({ amount: parseFloat(amount), type, date: format(new Date(), 'yyyy-MM-dd') });
    setAmount(''); setAdding(false);
    load();
  };

  const total = logs.reduce((s, l) => s + (l.amount || 0), 0);

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('spiritual.charity')}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--mizan-gold)' }}>{currSymbol} {total.toLocaleString()}</span>
          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" style={{ color: 'var(--mizan-emerald)' }} onClick={() => setAdding(true)}>
            <Plus className="w-3.5 h-3.5" />{t('common.add')}
          </Button>
        </div>
      </div>

      {adding && (
        <div className="mb-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {CHARITY_TYPES.map(ct => (
              <button key={ct} onClick={() => setType(ct)} className="px-3 py-1 rounded-full text-xs capitalize transition-all" style={{ background: type === ct ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)', color: type === ct ? 'white' : 'var(--mizan-text-secondary)', border: `1px solid ${type === ct ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}>{ct.replace('_', ' ')}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="h-9 text-sm rounded-lg flex-1" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} autoFocus />
            <Button size="sm" className="h-9 text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }} onClick={handleAdd}>{t('settings.save')}</Button>
            <Button size="sm" variant="ghost" className="h-9" onClick={() => setAdding(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--mizan-text-secondary)' }}>{t('spiritual.noCharity')}</p>
      ) : (
        <div className="space-y-2">
          {logs.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--mizan-elevated)' }}>
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--mizan-emerald)' }} />
                <span className="text-xs capitalize" style={{ color: 'var(--mizan-text)' }}>{log.type?.replace('_', ' ')}</span>
                <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{log.date}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--mizan-gold)' }}>{currSymbol} {log.amount?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}