import React, { useState, useEffect } from 'react';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, addDays, subDays, startOfDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, BookOpen, Droplet, Coffee } from 'lucide-react';

export default function RamadanCalendarView() {
  const { settings } = useUserSettings();
  const { language } = useI18n();
  const [weekStart, setWeekStart] = useState(startOfDay(new Date()));
  const [prayerTimes, setPrayerTimes] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [weekStart]);

  const load = async () => {
    setLoading(true);
    try {
      // جلب بيانات الصلاة للأسبوع
      const times = {};
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const timestamp = Math.floor(day.getTime() / 1000);
        
        if (settings?.prayer_location_latitude && settings?.prayer_location_longitude) {
          try {
            const response = await fetch(
              `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${settings.prayer_location_latitude}&longitude=${settings.prayer_location_longitude}&method=4`
            );
            const data = await response.json();
            if (data.code === 200) {
              times[format(day, 'yyyy-MM-dd')] = {
                fajr: data.data.timings.Fajr,
                dhuhr: data.data.timings.Dhuhr,
                asr: data.data.timings.Asr,
                maghrib: data.data.timings.Maghrib,
                isha: data.data.timings.Isha,
              };
            }
          } catch (err) {
            console.error('Error fetching prayer times:', err);
          }
        }
      }
      setPrayerTimes(times);

      // جلب سجلات رمضان للأسبوع
      const allLogs = await base44.entities.RamadanLog.list('-date', 100);
      setLogs(allLogs);
    } catch (err) {
      console.error('Error loading calendar:', err);
    }
    setLoading(false);
  };

  const getLogForDate = (dateStr) => {
    return logs.find(l => l.date === dateStr);
  };

  const getDayStats = (dateStr) => {
    const log = getLogForDate(dateStr);
    if (!log) return null;
    
    return {
      fasting: log.fasting_completed,
      suhoor: log.suhoor_logged,
      iftar: log.iftar_logged,
      quran: log.quran_pages || 0,
    };
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const arDayLabels = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      {/* Header مع التنقل */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setWeekStart(subDays(weekStart, 7))}
          className="p-2 rounded-lg transition-all"
          style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
        >
          {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        
        <div className="text-center">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'أسبوع من رمضان' : 'Ramadan Week'}
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
          </p>
        </div>

        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="p-2 rounded-lg transition-all"
          style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
        >
          {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-lg animate-pulse" style={{ background: 'var(--mizan-border)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, idx) => {
            const day = addDays(weekStart, idx);
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
            const stats = getDayStats(dateStr);
            const times = prayerTimes[dateStr];

            return (
              <div
                key={idx}
                className="p-4 rounded-lg transition-all"
                style={{
                  background: isToday ? 'var(--mizan-emerald)15' : 'var(--mizan-elevated)',
                  border: `1px solid ${isToday ? 'var(--mizan-emerald)40' : 'var(--mizan-border)'}`,
                }}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: '1px solid var(--mizan-border)' }}>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--mizan-text)' }}>
                      {language === 'ar' ? arDayLabels[day.getDay()] : dayLabels[day.getDay()]}, {format(day, 'd MMM')}
                    </h4>
                    {isToday && (
                      <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
                        {language === 'ar' ? 'اليوم' : 'Today'}
                      </span>
                    )}
                  </div>
                  {stats?.fasting && (
                    <div className="text-2xl">✓</div>
                  )}
                </div>

                {/* Prayer Times */}
                {times && (
                  <div className="mb-3 grid grid-cols-5 gap-1 text-xs">
                    {[
                      { label: 'F', time: times.fajr, color: '#0B5B50' },
                      { label: 'D', time: times.dhuhr, color: '#0B5B50' },
                      { label: 'A', time: times.asr, color: '#0B5B50' },
                      { label: 'M', time: times.maghrib, color: '#27AE60' },
                      { label: 'I', time: times.isha, color: '#0B5B50' },
                    ].map((prayer, i) => (
                      <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'var(--mizan-border)' }}>
                        <p className="font-bold" style={{ color: prayer.color }}>{prayer.label}</p>
                        <p style={{ color: 'var(--mizan-text-secondary)' }}>{prayer.time}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Daily Stats */}
                {stats && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg text-center" style={{ background: stats.suhoor ? 'var(--mizan-gold)20' : 'var(--mizan-border)' }}>
                      <Coffee className="w-4 h-4 mx-auto mb-1" style={{ color: stats.suhoor ? 'var(--mizan-gold)' : 'var(--mizan-text-secondary)' }} />
                      <p className="text-xs" style={{ color: stats.suhoor ? 'var(--mizan-gold)' : 'var(--mizan-text-secondary)' }}>
                        {language === 'ar' ? 'سحور' : 'Suhoor'}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg text-center" style={{ background: stats.iftar ? 'var(--mizan-emerald)20' : 'var(--mizan-border)' }}>
                      <Droplet className="w-4 h-4 mx-auto mb-1" style={{ color: stats.iftar ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }} />
                      <p className="text-xs" style={{ color: stats.iftar ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }}>
                        {language === 'ar' ? 'إفطار' : 'Iftar'}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg text-center" style={{ background: stats.fasting ? 'var(--mizan-red)20' : 'var(--mizan-border)' }}>
                      <Clock className="w-4 h-4 mx-auto mb-1" style={{ color: stats.fasting ? 'var(--mizan-red)' : 'var(--mizan-text-secondary)' }} />
                      <p className="text-xs" style={{ color: stats.fasting ? 'var(--mizan-red)' : 'var(--mizan-text-secondary)' }}>
                        {language === 'ar' ? 'صيام' : 'Fasting'}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg text-center" style={{ background: stats.quran > 0 ? 'var(--mizan-emerald-light)20' : 'var(--mizan-border)' }}>
                      <BookOpen className="w-4 h-4 mx-auto mb-1" style={{ color: stats.quran > 0 ? 'var(--mizan-emerald-light)' : 'var(--mizan-text-secondary)' }} />
                      <p className="text-xs font-medium" style={{ color: stats.quran > 0 ? 'var(--mizan-emerald-light)' : 'var(--mizan-text-secondary)' }}>
                        {stats.quran}p
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--mizan-border)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'الأساطير' : 'Legend'}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--mizan-gold)' }} />
            <span style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'السحور' : 'Suhoor'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--mizan-emerald)' }} />
            <span style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'الإفطار' : 'Iftar'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--mizan-red)' }} />
            <span style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'الصيام' : 'Fasting'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--mizan-emerald-light)' }} />
            <span style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'القرآن' : 'Qur\'an'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}