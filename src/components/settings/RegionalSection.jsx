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

const toggleRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: '16px',
  padding: '12px 0',
};

const labelStyle = {
  flexGrow: 1,
  minWidth: 0,
  fontSize: '15px',
  fontWeight: '500',
};

const switchWrapStyle = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
};

export default function RegionalSection() {
  const { t } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  const handleCurrency = async (code) => {
    const c = CURRENCIES.find(c => c.code === code);
    await updateSettings({ currency: code, currency_symbol: c?.symbol || code });
    toast.success(t('settings.saved'));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.regional')}
      </h2>

      <div>
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

      <div style={toggleRowStyle}>
        <span style={{ ...labelStyle, color: 'var(--mizan-text)' }}>
          {t('settings.easternNumerals')}
        </span>
        <div style={switchWrapStyle}>
          <Switch
            checked={settings?.show_eastern_numerals || false}
            onCheckedChange={(val) => updateSettings({ show_eastern_numerals: val })}
          />
        </div>
      </div>

      <div style={toggleRowStyle}>
        <span style={{ ...labelStyle, color: 'var(--mizan-text)' }}>
          {t('settings.ramadanMode')}
        </span>
        <div style={switchWrapStyle}>
          <Switch
            checked={settings?.ramadan_mode_active || false}
            onCheckedChange={(val) => updateSettings({ ramadan_mode_active: val })}
          />
        </div>
      </div>
    </div>
  );
}