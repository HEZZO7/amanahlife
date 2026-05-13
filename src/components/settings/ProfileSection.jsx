import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProfileSection() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFullName(u?.full_name || '');
      setPhone(u?.phone || '');
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ full_name: fullName, phone });
    setSaving(false);
    toast.success(t('settings.saved'));
  };

  const initial = (fullName || '?')[0].toUpperCase();

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.profile')}
      </h2>
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {initial}
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--mizan-text)' }}>{fullName || '—'}</p>
          <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>{user?.email || ''}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('settings.fullName')}</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 h-11 rounded-lg"
            style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text)', borderColor: 'var(--mizan-border)' }}
          />
        </div>
        <div>
          <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('settings.email')}</Label>
          <Input
            value={user?.email || ''}
            disabled
            className="mt-1 h-11 rounded-lg opacity-60"
            style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text)', borderColor: 'var(--mizan-border)' }}
          />
        </div>
        <div>
          <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('settings.phone')}</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 h-11 rounded-lg"
            style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text)', borderColor: 'var(--mizan-border)' }}
          />
        </div>
      </div>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="h-11 rounded-lg text-white"
        style={{ background: 'var(--mizan-emerald)' }}
      >
        {t('settings.save')}
      </Button>
    </div>
  );
}