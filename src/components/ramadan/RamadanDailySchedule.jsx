import React, { useState, useEffect } from 'react';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Clock, Moon, Sun, BookOpen, Heart, Coffee, Droplet } from 'lucide-react';

export default function RamadanDailySchedule({ date = new Date() }) {
  const { settings } = useUserSettings();
  const { language } = useI18n();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [date]);

  const load = async () => {
    setLoading(true);
    try {
      // جلب مواقيت الصلاة من الموقع المحفوظ
      if (settings?.prayer_location_latitude && settings?.prayer_location_longitude) {
        const timestamp = Math.floor(new Date(date).getTime() / 1000);
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${settings.prayer_location_latitude}&longitude=${settings.prayer_location_longitude}&method=4`
        );
        const data = await response.json();
        if (data.code === 200) {
          setPrayerTimes({
            fajr: data.data.timings.Fajr,
            sunrise: data.data.timings.Sunrise,
            dhuhr: data.data.timings.Dhuhr,
            asr: data.data.timings.Asr,
            maghrib: data.data.timings.Maghrib,
            isha: data.data.timings.Isha,
          });
        }
      }

      // جلب سجل اليوم
      const dateStr = format(date, 'yyyy-MM-dd');
      const logs = await base44.entities.RamadanLog.filter({ date: dateStr });
      if (logs.length > 0) {
        setTodayLog(logs[0]);
      }
    } catch (err) {
      console.error('Error loading daily schedule:', err);
    }
    setLoading(false);
  };

  const scheduleItems = [
    {
      type: 'suhoor',
      timeKey: 'fajr',
      icon: Coffee,
      enLabel: 'Suhoor',
      arLabel: 'السحور',
      enDesc: 'Pre-dawn meal',
      arDesc: 'وجبة السحور',
      color: '#B89A5E',
      isLogged: todayLog?.suhoor_logged,
    },
    {
      type: 'fajr',
      timeKey: 'fajr',
      icon: Moon,
      enLabel: 'Fajr Prayer',
      arLabel: 'صلاة الفجر',
      enDesc: 'Begin fasting after prayer',
      arDesc: 'ابدأ الصيام بعد الصلاة',
      color: '#0B5B50',
    },
    {
      type: 'day',
      icon: Sun,
      enLabel: 'Fasting',
      arLabel: 'الصيام',
      enDesc: 'Continue throughout the day',
      arDesc: 'استمر طول اليوم',
      color: '#E74C3C',
      isLogged: todayLog?.fasting_completed,
    },
    {
      type: 'asr',
      timeKey: 'asr',
      icon: Heart,
      enLabel: 'Asr Prayer',
      arLabel: 'صلاة العصر',
      enDesc: 'Afternoon reflection',
      arDesc: 'التأمل في الفترة الزوالية',
      color: '#0B5B50',
    },
    {
      type: 'quran',
      icon: BookOpen,
      enLabel: 'Qur\'an Reading',
      arLabel: 'قراءة القرآن',
      enDesc: `${todayLog?.quran_pages || 0} pages today`,
      arDesc: `${todayLog?.quran_pages || 0} صفحات اليوم`,
      color: '#12897A',
      isLogged: (todayLog?.quran_pages || 0) > 0,
    },
    {
      type: 'maghrib',
      timeKey: 'maghrib',
      icon: Moon,
      enLabel: 'Maghrib Prayer',
      arLabel: 'صلاة المغرب',
      enDesc: 'Break your fast',
      arDesc: 'افطر مع الأذان',
      color: '#0B5B50',
    },
    {
      type: 'iftar',
      timeKey: 'maghrib',
      icon: Droplet,
      enLabel: 'Iftar',
      arLabel: 'الإفطار',
      enDesc: 'Share a meal',
      arDesc: 'شارك الطعام مع الآخرين',
      color: '#27AE60',
      isLogged: todayLog?.iftar_logged,
    },
    {
      type: 'isha',
      timeKey: 'isha',
      icon: Moon,
      enLabel: 'Isha Prayer',
      arLabel: 'صلاة العشاء',
      enDesc: 'End of prayer',
      arDesc: 'ختام الصلوات',
      color: '#0B5B50',
    },
  ];

  const dateStr = format(date, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      {/* Date Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--mizan-text)' }}>
            {format(date, language === 'ar' ? 'EEEE' : 'EEEE')}, {format(date, 'MMM d')}
          </h3>
          {isToday && (
            <span className="text-xs px-2 py-1 rounded-lg mt-1 inline-block" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
              {language === 'ar' ? 'اليوم' : 'Today'}
            </span>
          )}
        </div>
        {settings?.prayer_location_name && (
          <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            📍 {settings.prayer_location_name}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--mizan-border)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {scheduleItems.map((item, idx) => {
            const time = item.timeKey ? prayerTimes?.[item.timeKey] : null;
            const Icon = item.icon;
            const isCompleted = item.isLogged === true;

            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg transition-all"
                style={{
                  background: isCompleted ? 'var(--mizan-emerald)20' : 'var(--mizan-elevated)',
                  border: `1px solid ${isCompleted ? 'var(--mizan-emerald)40' : 'var(--mizan-border)'}`,
                }}
              >
                {/* Icon & Color */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: item.color, color: 'white' }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>
                      {language === 'ar' ? item.arLabel : item.enLabel}
                    </p>
                    {isCompleted && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {language === 'ar' ? item.arDesc : item.enDesc}
                  </p>
                </div>

                {/* Time */}
                {time && (
                  <div className="flex items-center gap-1 flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}>
                    <Clock className="w-3 h-3" />
                    {time}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Day Summary */}
      {!loading && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--mizan-border)' }}>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'الحالة' : 'Status'}
            </span>
            <div className="flex items-center gap-2">
              {todayLog?.fasting_completed ? (
                <span style={{ color: 'var(--mizan-emerald)' }}>✓ {language === 'ar' ? 'مكتمل' : 'Completed'}</span>
              ) : (
                <span style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'قيد التتبع' : 'In Progress'}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}