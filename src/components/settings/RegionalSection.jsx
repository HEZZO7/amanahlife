import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CURRENCIES = [
  { code: 'SAR', symbol: 'ر.س', label: 'SAR' },
  { code: 'AED', symbol: 'د.إ', label: 'AED' },
  { code: 'KWD', symbol: 'د.ك', label: 'KWD' },
  { code: 'QAR', symbol: 'ر.ق', label: 'QAR' },
  { code: 'BHD', symbol: 'د.ب', label: 'BHD' },
  { code: 'EGP', symbol: 'ج.م', label: 'EGP' },
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
];

function ToggleRow({ label, checked, onCheckedChange }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      alignItems: 'center',
      width: '100%',
      direction: 'ltr',
      padding: '10px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center' }}>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      <span style={{
        justifySelf: 'end',
        textAlign: 'right',
        width: '100%',
        fontSize: '15px',
        fontWeight: '500',
        color: 'var(--mizan-text, #111827)',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function RegionalSection() {
  const { t } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  const handleCurrency = async (code) => {
    const c = CURRENCIES.find(c => c.code === code);
    await updateSettings({ currency: code, currency_symbol: c?.symbol || code });
    toast.success(t('settings.saved'));
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)', marginBottom: '16px' }}>
        {t('settings.regional')}
      </h2>

      <div style={{ marginBottom: '8px' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.currency')}
        </p>
        <Select value={settings?.currency || 'SAR'} onValueChange={handleCurrency}>
          <SelectTrigger className="h-11 rounded-lg" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map(c => (
              <SelectItem key={c.code} value={c.code}>{c.symbol} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ToggleRow
        label={t('settings.easternNumerals')}
        checked={settings?.show_eastern_numerals || false}
        onCheckedChange={(val) => updateSettings({ show_eastern_numerals: val })}
      />

      <ToggleRow
        label={t('settings.ramadanMode')}
        checked={settings?.ramadan_mode_active || false}
        onCheckedChange={(val) => updateSettings({ ramadan_mode_active: val })}
      />
    </div>
  );
}