import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, MapPin, Save } from 'lucide-react';
import PrayerTimesCard from './PrayerTimesCard';
import QiblaCompass from './QiblaCompass';
import { useUserSettings } from '@/lib/UserSettingsContext';

export default function TimesQibla({ language }) {
  const { settings, updateSettings } = useUserSettings();
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [qibla, setQibla] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoLogEnabled, setAutoLogEnabled] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [locationName, setLocationName] = useState('');

  // جلب الموقع الجغرافي
  useEffect(() => {
    // تحقق من وجود موقع محفوظ أولاً
    if (settings?.prayer_location_latitude && settings?.prayer_location_longitude) {
      setLocation({ 
        lat: settings.prayer_location_latitude, 
        lng: settings.prayer_location_longitude 
      });
      setLocationName(settings.prayer_location_name || '');
      fetchPrayerData(settings.prayer_location_latitude, settings.prayer_location_longitude);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          fetchPrayerData(latitude, longitude);
        },
        (err) => {
          console.log('Geolocation error:', err);
          setError('geo_denied');
          setLoading(false);
        }
      );
    }
  }, [settings]);

  // جلب بيانات أوقات الصلاة
  const fetchPrayerData = async (lat, lng) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=4`
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

        setHijriDate(data.data.hijri);
      }

      // جلب بيانات القبلة
      const qiblaResponse = await fetch(
        `https://api.aladhan.com/v1/qibla/${lat}/${lng}`
      );
      const qiblaData = await qiblaResponse.json();
      if (qiblaData.code === 200) {
        setQibla(qiblaData.data.direction);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching prayer data:', err);
      setError('fetch_error');
      setLoading(false);
    }
  };

  // معالجة البحث اليدوي عن مدينة
  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;

    setLoading(true);
    try {
      // محاولة جلب إحداثيات المدينة من Aladhan
      const cityResponse = await fetch(
        `https://api.aladhan.com/v1/hijri?city=${manualCity}`
      );
      const cityData = await cityResponse.json();

      if (cityData.code === 200 && cityData.data) {
       const { latitude, longitude } = cityData.data;
       setLocation({ lat: latitude, lng: longitude });
       setLocationName(manualCity);
       await fetchPrayerData(latitude, longitude);
       setManualCity('');
      } else {
       setError('city_not_found');
      }
    } catch (err) {
      console.error('City search error:', err);
      setError('fetch_error');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--mizan-emerald)' }} />
      </div>
    );
  }

  if (error === 'geo_denied') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'ابحث عن مدينتك' : 'Search Your City'}
            </h3>
          </div>
          <form onSubmit={handleCitySearch} className="flex gap-2">
            <input
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل اسم المدينة' : 'Enter city name'}
              className="flex-1 h-10 px-3 rounded-lg text-sm"
              style={{
                background: 'var(--mizan-elevated)',
                borderColor: 'var(--mizan-border)',
                color: 'var(--mizan-text)',
                border: '1px solid var(--mizan-border)',
              }}
            />
            <button
              type="submit"
              className="px-4 h-10 rounded-lg font-medium text-white text-sm"
              style={{ background: 'var(--mizan-emerald)' }}
            >
              {language === 'ar' ? 'بحث' : 'Search'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error === 'fetch_error' || !prayerTimes || !qibla) {
    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <p style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'حدث خطأ في جلب البيانات' : 'Error fetching data'}
        </p>
      </div>
    );
  }

  const handleSaveLocation = async () => {
    if (!location) return;
    setSaving(true);
    try {
      await updateSettings({
        prayer_location_latitude: location.lat,
        prayer_location_longitude: location.lng,
        prayer_location_name: locationName
      });
    } catch (err) {
      console.error('Error saving location:', err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Save Location Banner */}
      {location && locationName && !(settings?.prayer_location_latitude === location.lat && settings?.prayer_location_longitude === location.lng) && (
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--mizan-emerald)20', border: '1px solid var(--mizan-emerald)40' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--mizan-emerald)' }}>
              {language === 'ar' ? 'حفظ موقعك' : 'Save Your Location'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {locationName}
            </p>
          </div>
          <button
            onClick={handleSaveLocation}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-opacity disabled:opacity-50"
            style={{ background: 'var(--mizan-emerald)' }}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? (language === 'ar' ? 'جاري...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
          </button>
        </div>
      )}

      {/* Hijri Date */}
      {hijriDate && (
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'التاريخ الهجري' : 'Hijri Date'}
          </p>
          <p className="text-lg font-semibold" style={{ color: 'var(--mizan-emerald)' }}>
            {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
          </p>
        </div>
      )}

      {/* Prayer Times */}
      <PrayerTimesCard prayerTimes={prayerTimes} language={language} />

      {/* Qibla Compass */}
      <QiblaCompass qiblaDirection={qibla} language={language} />

      {/* Auto-Log Toggle */}
      <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'center',
          width: '100%',
          direction: 'ltr',
          padding: '12px 0'
        }}>
          <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setAutoLogEnabled(!autoLogEnabled)}
              className="relative h-6 w-11 rounded-full transition-all"
              style={{
                background: autoLogEnabled ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-all"
                style={{
                  background: 'white',
                  transform: autoLogEnabled ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>
          <div style={{ justifySelf: 'end', textAlign: 'right', width: '100%' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'تسجيل تلقائي للصلاة' : 'Auto-Log Prayers'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar'
                ? 'تذكير بعد 30 دقيقة من وقت الصلاة'
                : '30 min after prayer time'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}