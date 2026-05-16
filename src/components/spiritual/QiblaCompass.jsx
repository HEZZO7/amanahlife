import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export default function QiblaCompass({ qiblaDirection, language }) {
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [sensorPermission, setSensorPermission] = useState(null);
  const [isCompassActive, setIsCompassActive] = useState(false);

  // طلب إذن الوصول لمستشعر الاتجاه
  useEffect(() => {
    const requestSensorPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined') {
        setSensorAvailable(true);

        if (DeviceOrientationEvent.requestPermission) {
          // iOS 13+
          try {
            const permission = await DeviceOrientationEvent.requestPermission();
            setSensorPermission(permission);
            if (permission === 'granted') {
              setIsCompassActive(true);
              window.addEventListener('deviceorientation', handleOrientation);
            }
          } catch (err) {
            setSensorPermission('denied');
          }
        } else {
          // Android والأجهزة الأخرى
          setIsCompassActive(true);
          setSensorPermission('granted');
          window.addEventListener('deviceorientation', handleOrientation);
        }
      }
    };

    requestSensorPermission();

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handleOrientation = (event) => {
    const alpha = event.alpha || 0; // 0 to 360
    setDeviceOrientation(alpha);
  };

  const handleRequestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        setSensorPermission(permission);
        if (permission === 'granted') {
          setIsCompassActive(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (err) {
        setSensorPermission('denied');
      }
    }
  };

  const needleRotation = isCompassActive 
    ? (qiblaDirection - deviceOrientation + 360) % 360
    : qiblaDirection;

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'بوصلة القبلة' : 'Qibla Compass'}
        </h3>
        {sensorAvailable && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs" style={{ 
            background: isCompassActive ? 'var(--mizan-emerald)20' : 'var(--mizan-gold)20',
            color: isCompassActive ? 'var(--mizan-emerald)' : 'var(--mizan-gold)'
          }}>
            <Smartphone className="w-3 h-3" />
            {isCompassActive ? (language === 'ar' ? 'نشطة' : 'Active') : (language === 'ar' ? 'معطلة' : 'Inactive')}
          </div>
        )}
      </div>

      {/* طلب الأذن إذا كان مرفوضاً */}
      {sensorAvailable && sensorPermission === 'denied' && (
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--mizan-red)20', border: '1px solid var(--mizan-red)40' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--mizan-red)' }}>
            {language === 'ar' 
              ? 'يرجى السماح بالوصول لمستشعرات الجهاز لتحديد اتجاه القبلة بدقة'
              : 'Grant sensor access for accurate compass'}
          </p>
          <button
            onClick={handleRequestPermission}
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
            style={{ background: 'var(--mizan-red)' }}
          >
            {language === 'ar' ? 'السماح الآن' : 'Allow Now'}
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {/* SVG Compass */}
        <div className="relative">
          {isCompassActive && (
            <div className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded" style={{ background: 'var(--mizan-emerald)20', color: 'var(--mizan-emerald)' }}>
              {Math.round(deviceOrientation)}°
            </div>
          )}
          <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-lg">
          {/* الخلفية الدائرية */}
          <circle cx="120" cy="120" r="110" fill="var(--mizan-elevated)" stroke="var(--mizan-border)" strokeWidth="2" />

          {/* علامات الاتجاهات الرئيسية */}
          <g style={{ color: 'var(--mizan-text-secondary)' }}>
            {/* شمال */}
            <text x="120" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--mizan-text)">
              N
            </text>
            {/* جنوب */}
            <text x="120" y="220" textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--mizan-text-secondary)">
              S
            </text>
            {/* شرق */}
            <text x="215" y="125" fontSize="14" fontWeight="bold" fill="var(--mizan-text-secondary)">
              E
            </text>
            {/* غرب */}
            <text x="15" y="125" textAnchor="end" fontSize="14" fontWeight="bold" fill="var(--mizan-text-secondary)">
              W
            </text>
          </g>

          {/* خطوط الاتجاهات الفرعية */}
          <g stroke="var(--mizan-border)" strokeWidth="1" opacity="0.5">
            <line x1="120" y1="15" x2="120" y2="30" /> {/* N */}
            <line x1="120" y1="210" x2="120" y2="225" /> {/* S */}
            <line x1="210" y1="120" x2="225" y2="120" /> {/* E */}
            <line x1="15" y1="120" x2="30" y2="120" /> {/* W */}
            {/* الاتجاهات الفرعية */}
            <line x1="170" y1="30" x2="165" y2="45" /> {/* NE */}
            <line x1="210" y1="70" x2="200" y2="60" /> {/* E-NE */}
            <line x1="210" y1="170" x2="200" y2="180" /> {/* E-SE */}
            <line x1="170" y1="210" x2="165" y2="195" /> {/* SE */}
            <line x1="70" y1="210" x2="75" y2="195" /> {/* SW */}
            <line x1="30" y1="170" x2="40" y2="180" /> {/* W-SW */}
            <line x1="30" y1="70" x2="40" y2="60" /> {/* W-NW */}
            <line x1="70" y1="30" x2="75" y2="45" /> {/* NW */}
          </g>

          {/* الإبرة (تشير للقبلة) */}
          <g transform={`rotate(${needleRotation} 120 120)`}>
            {/* رأس الإبرة (أخضر زمردي) */}
            <polygon points="120,40 132,85 120,75 108,85" fill="var(--mizan-emerald)" />
            {/* جسم الإبرة */}
            <line x1="120" y1="85" x2="120" y2="155" stroke="var(--mizan-emerald)" strokeWidth="2.5" />
            {/* قاعدة الإبرة */}
            <circle cx="120" cy="120" r="9" fill="var(--mizan-emerald)" opacity="0.5" />
          </g>

          {/* الدائرة الوسطية */}
          <circle cx="120" cy="120" r="7" fill="var(--mizan-emerald)" />
        </svg>
        </div>

        {/* قيمة القبلة بالدرجات */}
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'اتجاه القبلة' : 'Qibla Direction'}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {qiblaDirection.toFixed(1)}°
          </p>
        </div>
      </div>

      {/* معلومات الاتجاه */}
      <div className="mt-6 space-y-2 text-center">
        <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
          {isCompassActive
            ? (language === 'ar' ? 'أدِرْ جهازك لتحديد اتجاه القبلة' : 'Rotate device to find Qibla direction')
            : (language === 'ar' ? 'الإبرة تشير اتجاه مكة المكرمة' : 'The needle points toward Mecca')}
        </p>
        {isCompassActive && (
          <p className="text-xs font-medium" style={{ color: 'var(--mizan-emerald)' }}>
            {language === 'ar' ? 'بوصلتك نشطة - استخدم المستشعرات' : 'Compass is active - using device sensors'}
          </p>
        )}
      </div>
    </div>
  );
}