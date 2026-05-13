import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { LogOut, Trash2 } from 'lucide-react';

export default function AccountSection() {
  const { t } = useI18n();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.account')}
      </h2>

      <Button
        variant="outline"
        className="h-11 rounded-lg gap-2"
        style={{ borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4" />
        {t('settings.signOut')}
      </Button>

      <div className="pt-4">
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-sm underline"
            style={{ color: 'var(--mizan-red)', opacity: 0.7 }}
          >
            {t('settings.deleteAccount')}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--mizan-red)' }}>
              {t('settings.deleteConfirm')}
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="h-10 rounded-lg"
              style={{ borderColor: 'var(--mizan-red)', color: 'var(--mizan-text)' }}
              placeholder="DELETE"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                disabled={deleteConfirm !== 'DELETE'}
                className="text-white"
                style={{ background: 'var(--mizan-red)' }}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}