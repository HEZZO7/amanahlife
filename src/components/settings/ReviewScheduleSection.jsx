import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { Switch } from '@/components/ui/switch';
import { ClipboardList, Bell, Clock, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

function ToggleRow({ labelAr, labelEn, descAr, descEn, checked, onChange, lang }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--mizan-border)' }}>
      <div className="flex-1 me-4">
        <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>
          {lang === 'ar' ? labelAr : labelEn}
        </p>
        {(descAr || descEn) && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? descAr : descEn}
          </p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const TIME_OPTIONS = [
  { value: '06:00', labelAr: '٦:٠٠ صباحاً', labelEn: '6:00 AM' },
  { value: '07:00', labelAr: '٧:٠٠ صباحاً', labelEn: '7:00 AM' },
  { value: '08:00', labelAr: '٨:٠٠ صباحاً', labelEn: '8:00 AM' },
  { value: '09:00', labelAr: '٩:٠٠ صباحاً', labelEn: '9:00 AM' },
  { value: '12:00', labelAr: '١٢:٠٠ ظهراً', labelEn: '12:00 PM' },
  { value: '18:00', labelAr: '٦:٠٠ مساءً', labelEn: '6:00 PM' },
  { value: '20:00', labelAr: '٨:٠٠ مساءً', labelEn: '8:00 PM' },
  { value: '22:00', labelAr: '١٠:٠٠ مساءً', labelEn: '10:00 PM' },
];

function TimeSelector({ value, onChange, lang }) {
  return (
    <div className="grid grid-cols-4 gap-1.5 mt-2">
      {TIME_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-center"
          style={{
            background: value === opt.value ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)',
            color: value === opt.value ? 'white' : 'var(--mizan-text-secondary)',
            border: `1px solid ${value === opt.value ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
          }}
        >
          {lang === 'ar' ? opt.labelAr : opt.labelEn}
        </button>
      ))}
    </div>
  );
}

export default function ReviewScheduleSection() {
  const { language } = useI18n();
  const { settings, updateSettings } = useUserSettings();
  const lang = settings?.language || language || 'ar';

  const [saving, setSaving] = useState(false);

  const isPremium = ['premium', 'family'].includes(settings?.subscription_tier);

  const update = async (patch) => {
    setSaving(true);
    await updateSettings(patch);
    setSaving(false);
    toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
  };

  return (
    <div>
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-5">
        <ClipboardList className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
        <h2 className="text-base font-bold" style={{ color: 'var(--mizan-text)' }}>
          {lang === 'ar' ? 'جدولة التقارير الذكية' : 'Smart Review Schedule'}
        </h2>
      </div>

      {!isPremium && (
        <div className="mb-5 p-3 rounded-xl text-xs" style={{ background: '#B89A5E10', border: '1px solid #B89A5E33', color: 'var(--mizan-gold)' }}>
          {lang === 'ar'
            ? '✨ هذه الميزة متاحة للمشتركين المميزين فقط. ارقَ إلى Premium للاستفادة من التقارير الآلية.'
            : '✨ This feature is available for Premium subscribers only. Upgrade to unlock automated reports.'}
        </div>
      )}

      <div style={{ opacity: isPremium ? 1 : 0.5, pointerEvents: isPremium ? 'auto' : 'none' }}>
        {/* Monthly Report */}
        <div className="mb-5 p-4 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
                {lang === 'ar' ? 'التقرير الشهري' : 'Monthly Report'}
              </span>
            </div>
            <Switch
              checked={settings?.review_monthly_enabled !== false}
              onCheckedChange={v => update({ review_monthly_enabled: v })}
            />
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar'
              ? 'يُرسَل تلقائياً في اليوم الأول من كل شهر في الوقت المحدد'
              : 'Sent automatically on the 1st of each month at the selected time'}
          </p>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? 'وقت الإرسال:' : 'Delivery time:'}
          </p>
          <TimeSelector
            value={settings?.review_monthly_time || '06:00'}
            onChange={v => update({ review_monthly_time: v })}
            lang={lang}
          />
        </div>

        {/* Annual Report */}
        <div className="mb-5 p-4 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" style={{ color: 'var(--mizan-gold)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
                {lang === 'ar' ? 'التقرير السنوي' : 'Annual Report'}
              </span>
            </div>
            <Switch
              checked={settings?.review_annual_enabled !== false}
              onCheckedChange={v => update({ review_annual_enabled: v })}
            />
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar'
              ? 'يُرسَل تلقائياً في الأول من يناير من كل عام في الوقت المحدد'
              : 'Sent automatically on January 1st each year at the selected time'}
          </p>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {lang === 'ar' ? 'وقت الإرسال:' : 'Delivery time:'}
          </p>
          <TimeSelector
            value={settings?.review_annual_time || '08:00'}
            onChange={v => update({ review_annual_time: v })}
            lang={lang}
          />
        </div>

        {/* Completion Notification */}
        <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4" style={{ color: 'var(--mizan-gold)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
              {lang === 'ar' ? 'تنبيهات التقارير' : 'Report Notifications'}
            </span>
          </div>
          <ToggleRow
            labelAr="تنبيه عند اكتمال التقرير"
            labelEn="Notify when report is ready"
            descAr="تلقّ تنبيهاً فور الانتهاء من إعداد تقريرك"
            descEn="Get an alert as soon as your report is generated"
            checked={settings?.review_notify_on_complete !== false}
            onChange={v => update({ review_notify_on_complete: v })}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}