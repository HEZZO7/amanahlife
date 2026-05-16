import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { COUNTRIES_AND_CURRENCIES } from '@/lib/subscriptionPlans';

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
  const { t, isRTL } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  const handleCountry = async (countryCode) => {
    const country = COUNTRIES_AND_CURRENCIES[countryCode];
    if (country) {
      await updateSettings({
        country: countryCode,
        currency: country.code,
        currency_symbol: country.symbol,
      });
      toast.success(t('settings.saved'));
    }
  };

  const handleCurrency = async (code) => {
    // Find which country uses this currency and update accordingly
    const country = Object.values(COUNTRIES_AND_CURRENCIES).find(c => c.code === code);
    if (country) {
      const countryCode = Object.keys(COUNTRIES_AND_CURRENCIES).find(k => COUNTRIES_AND_CURRENCIES[k].code === code);
      await handleCountry(countryCode);
    } else {
      await updateSettings({ currency: code });
      toast.success(t('settings.saved'));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)', marginBottom: '16px' }}>
        {t('settings.regional')}
      </h2>

      {/* Country Selection */}
      <div style={{ marginBottom: '16px' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.regional.country')}
        </p>
        <Select value={settings?.country || 'SA'} onValueChange={handleCountry}>
          <SelectTrigger className="h-11 rounded-lg" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COUNTRIES_AND_CURRENCIES).map(([code, data]) => (
              <SelectItem key={code} value={code}>
                {isRTL ? data.name : data.nameEn} ({data.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Currency Display (Auto-updated with Country) */}
      <div style={{ marginBottom: '8px', padding: '12px', backgroundColor: 'var(--mizan-bg)', borderRadius: '8px' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.currency')}
        </p>
        <p className="text-lg font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {settings?.currency_symbol} {settings?.currency}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {isRTL ? 'يتم تحديثها تلقائيًا عند تغيير البلد' : 'Auto-updated when you change country'}
        </p>
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