import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PRAYER_NAMES = {
  Fajr:    { en: 'Fajr',    ar: 'الفجر' },
  Sunrise: { en: 'Sunrise', ar: 'الشروق' },
  Dhuhr:   { en: 'Dhuhr',   ar: 'الظهر' },
  Asr:     { en: 'Asr',     ar: 'العصر' },
  Maghrib: { en: 'Maghrib', ar: 'المغرب' },
  Isha:    { en: 'Isha',    ar: 'العشاء' },
};

const PRAYER_LOG_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function parseTime(timeStr) {
  // timeStr like "05:23" or "05:23 (EST)"
  const clean = timeStr.split(' ')[0];
  const [h, m] = clean.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatCountdown(secs) {
  if (secs <= 0) return '00:00:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// SVG Qibla Compass
function QiblaCompass({ degrees }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Outer ring */}
        <circle cx="90" cy="90" r="85" fill="none" stroke="var(--mizan-border)" strokeWidth="2" />
        <circle cx="90" cy="90" r="78" fill="var(--mizan-surface)" />
        {/* Cardinal tick marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const rad = (a - 90) * Math.PI / 180;
          const x1 = 90 + 72 * Math.cos(rad);
          const y1 = 90 + 72 * Math.sin(rad);
          const x2 = 90 + 82 * Math.cos(rad);
          const y2 = 90 + 82 * Math.sin(rad);
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--mizan-border)" strokeWidth={a % 90 === 0 ? 2 : 1} />;
        })}
        {/* N/E/S/W labels */}
        {[{ a: 0, l: 'N' }, { a: 90, l: 'E' }, { a: 180, l: 'S' }, { a: 270, l: 'W' }].map(({ a, l }) => {
          const rad = (a - 90) * Math.PI / 180;
          const x = 90 + 62 * Math.cos(rad);
          const y = 90 + 62 * Math.sin(rad) + 4;
          return <text key={l} x={x} y={y} textAnchor="middle" fontSize="10" fill="var(--mizan-text-secondary)" fontFamily="var(--font-inter)">{l}</text>;
        })}
        {/* Qibla needle group — rotated by degrees */}
        <g transform={`rotate(${degrees}, 90, 90)`}>
          {/* Needle pointing up = toward Qibla */}
          <polygon points="90,20 85,90 90,78 95,90" fill="var(--mizan-emerald)" opacity="0.9" />
          <polygon points="90,160 85,90 90,102 95,90" fill="var(--mizan-border)" opacity="0.7" />
          {/* Center dot */}
          <circle cx="90" cy="90" r="5" fill="var(--mizan-emerald)" />
        </g>
        {/* Kaaba icon hint in center */}
        <text x="90" y="94" textAnchor="middle" fontSize="8" fill="var(--mizan-text-secondary)">Ka'ba</text>
      </svg>
    </div>
  );
}

export default function TimesQibla({ language }) {
  const [location, setLocation] = useState(null);
  const [geoError, setGeoError] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [timings, setTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState('');
  const [qibla, setQibla] = useState(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');
  const [autoLog, setAutoLog] = useState(false);
  const [prompt, setPrompt] = useState(null); // { name, key }
  const autoLogTimers = useRef({});

  const isAr = language === 'ar';

  // Fetch prayer times + qibla from aladhan
  const fetchData = useCallback(async (lat, lng) => {
    setLoadingTimes(true);
    try {
      const ts = Math.floor(Date.now() / 1000);
      const [timingsRes, qiblaRes] = await Promise.all([
        fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lng}&method=4`),
        fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`),
      ]);
      const timingsJson = await timingsRes.json();
      const qiblaJson = await qiblaRes.json();

      if (timingsJson.code === 200) {
        setTimings(timingsJson.data.timings);
        const h = timingsJson.data.date.hijri;
        setHijriDate(`${h.day} ${h.month.en} ${h.year}`);
      }
      if (qiblaJson.code === 200) {
        setQibla(qiblaJson.data.direction);
      }
    } catch (e) {
      console.error('Aladhan fetch error', e);
    } finally {
      setLoadingTimes(false);
    }
  }, []);

  // Geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) { setGeoError(true); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchData(latitude, longitude);
      },
      () => setGeoError(true)
    );
  }, [fetchData]);

  // Countdown timer
  useEffect(() => {
    if (!timings) return;
    const ORDERED = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const tick = () => {
      const now = new Date();
      let next = null;
      for (const name of ORDERED) {
        const t = parseTime(timings[name]);
        if (t > now) { next = { name, time: t }; break; }
      }
      if (!next) {
        // All passed — next is Fajr tomorrow
        const fajr = parseTime(timings['Fajr']);
        fajr.setDate(fajr.getDate() + 1);
        next = { name: 'Fajr', time: fajr };
      }
      setNextPrayer(next.name);
      const diff = Math.max(0, Math.floor((next.time - now) / 1000));
      setCountdown(formatCountdown(diff));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timings]);

  // Auto-log prompt scheduling
  useEffect(() => {
    if (!autoLog || !timings) return;
    // Clear previous timers
    Object.values(autoLogTimers.current).forEach(clearTimeout);
    autoLogTimers.current = {};

    const logKeys = { Fajr: 'fajr', Dhuhr: 'dhuhr', Asr: 'asr', Maghrib: 'maghrib', Isha: 'isha' };
    const now = new Date();

    Object.entries(logKeys).forEach(([name, key]) => {
      const t = parseTime(timings[name]);
      t.setMinutes(t.getMinutes() + 30);
      const delay = t - now;
      if (delay > 0) {
        autoLogTimers.current[name] = setTimeout(() => setPrompt({ name, key }), delay);
      }
    });

    return () => Object.values(autoLogTimers.current).forEach(clearTimeout);
  }, [autoLog, timings]);

  const handlePromptAnswer = async (prayed) => {
    if (prayed && prompt) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const existing = await base44.entities.PrayerLog.filter({ date: today });
      if (existing.length > 0) {
        await base44.entities.PrayerLog.update(existing[0].id, { [prompt.key]: true });
      } else {
        await base44.entities.PrayerLog.create({ date: today, [prompt.key]: true });
      }
    }
    setPrompt(null);
  };

  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityInput)}&country=&method=4`);
      const json = await res.json();
      if (json.code === 200) {
        setTimings(json.data.timings);
        const h = json.data.date.hijri;
        setHijriDate(`${h.day} ${h.month.en} ${h.year}`);
        setGeoError(false);
        // Get coords for qibla via geocoding fallback
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`);
        const geoJson = await geoRes.json();
        if (geoJson.length > 0) {
          const { lat, lon } = geoJson[0];
          const qRes = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`);
          const qJson = await qRes.json();
          if (qJson.code === 200) setQibla(qJson.data.direction);
        }
      }
    } catch (e) {
      console.error('City search error', e);
    }
  };

  const ORDERED_PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div className="space-y-5">

      {/* Geo error / city search */}
      {geoError && (
        <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isAr ? 'تعذّر الحصول على موقعك. ابحث عن مدينتك:' : 'Location unavailable. Search for your city:'}
          </p>
          <div className="flex gap-2">
            <Input
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
              placeholder={isAr ? 'مثال: الرياض' : 'e.g. Riyadh'}
              className="flex-1 h-9 text-sm"
            />
            <Button size="sm" onClick={handleCitySearch} className="h-9 px-4 text-white" style={{ background: 'var(--mizan-emerald)' }}>
              {isAr ? 'بحث' : 'Search'}
            </Button>
          </div>
        </div>
      )}

      {/* Hijri date */}
      {hijriDate && (
        <div className="px-1">
          <p className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
            {hijriDate}
          </p>
        </div>
      )}

      {/* Prayer times card */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)' }}>
        {/* Next prayer countdown header */}
        {nextPrayer && timings && (
          <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'var(--mizan-emerald)' }}>
            <div>
              <p className="text-xs text-white opacity-80 mb-0.5">
                {isAr ? 'الصلاة القادمة' : 'Next Prayer'}
              </p>
              <p className="text-base font-bold text-white">
                {isAr ? PRAYER_NAMES[nextPrayer]?.ar : PRAYER_NAMES[nextPrayer]?.en}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white opacity-80 mb-0.5">{isAr ? 'الوقت المتبقي' : 'Time remaining'}</p>
              <p className="text-xl font-bold text-white font-mono tracking-wider">{countdown}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loadingTimes && !timings && (
          <div className="p-4 space-y-3" style={{ background: 'var(--mizan-surface)' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--mizan-border)' }} />
            ))}
          </div>
        )}

        {/* Timings list */}
        {timings && ORDERED_PRAYERS.map((name, idx) => {
          const isNext = name === nextPrayer;
          const isFive = name !== 'Sunrise';
          return (
            <div key={name}
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                background: isNext ? 'color-mix(in srgb, var(--mizan-emerald) 8%, var(--mizan-surface))' : 'var(--mizan-surface)',
                borderTop: idx > 0 ? '1px solid var(--mizan-border)' : 'none',
              }}>
              <div className="flex items-center gap-3">
                {/* Dot indicator */}
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isNext ? 'var(--mizan-emerald)' : isFive ? 'var(--mizan-border)' : 'transparent', border: isFive && !isNext ? '1.5px solid var(--mizan-border)' : 'none' }} />
                <span className="text-sm font-medium" style={{ color: isNext ? 'var(--mizan-emerald)' : 'var(--mizan-text)' }}>
                  {isAr ? PRAYER_NAMES[name]?.ar : PRAYER_NAMES[name]?.en}
                </span>
              </div>
              <span className="text-sm font-semibold font-mono" style={{ color: isNext ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }}>
                {timings[name]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Qibla compass */}
      {qibla !== null && (
        <div className="rounded-xl p-5 flex flex-col items-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm font-semibold mb-4 self-start mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {isAr ? 'اتجاه القبلة' : 'Qibla Direction'}
          </p>
          <QiblaCompass degrees={qibla} />
          <p className="text-sm font-semibold mt-3" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isAr ? `القبلة: ${qibla.toFixed(1)}°` : `Qibla: ${qibla.toFixed(1)}°`}
          </p>
        </div>
      )}

      {/* Auto-log toggle */}
      <div style={{ display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', padding: '16px', borderRadius: '12px', background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--mizan-text)', margin: 0 }}>
            {isAr ? 'تذكير تسجيل الصلاة' : 'Auto-suggest prayer log'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--mizan-text-secondary)', marginTop: '2px', marginBottom: 0 }}>
            {isAr ? 'يسألك بعد 30 دقيقة من كل صلاة' : 'Prompts 30 min after each prayer time'}
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Switch checked={autoLog} onCheckedChange={setAutoLog} />
        </div>
      </div>

      {/* Auto-log prompt */}
      {prompt && (
        <div className="fixed bottom-24 left-4 right-4 z-50 p-4 rounded-2xl shadow-xl"
          style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-emerald)' }}>
          <p className="text-sm font-semibold mb-3 text-center" style={{ color: 'var(--mizan-text)' }}>
            {isAr
              ? `هل صليت ${PRAYER_NAMES[prompt.name]?.ar}؟`
              : `Did you pray ${PRAYER_NAMES[prompt.name]?.en}?`}
          </p>
          <div className="flex gap-3">
            <Button className="flex-1 h-10 text-white rounded-xl" style={{ background: 'var(--mizan-emerald)' }}
              onClick={() => handlePromptAnswer(true)}>
              {isAr ? 'نعم' : 'Yes'}
            </Button>
            <Button variant="outline" className="flex-1 h-10 rounded-xl"
              onClick={() => handlePromptAnswer(false)}>
              {isAr ? 'لا' : 'No'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}