import React, { useState, useEffect } from 'react';

export default function QiblaCompass({ qiblaDirection, language }) {
  const [deviceOrientation, setDeviceOrientation] = useState(0);

  // طلب إذن الوصول لمستشعر الاتجاه (للأجهزة المحمولة)
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
      // iOS 13+
      DeviceOrientationEvent.requestPermission()
        .then((permission) => {
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(() => {
          // إذا رفض المستخدم، نستخدم القيمة الثابتة
        });
    } else {
      // Android والأجهزة الأخرى
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handleOrientation = (event) => {
    const alpha = event.alpha; // 0 to 360
    setDeviceOrientation(alpha || 0);
  };

  const needleRotation = qiblaDirection - deviceOrientation;

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <h3 className="font-semibold mb-6 text-center" style={{ color: 'var(--mizan-text)' }}>
        {language === 'ar' ? 'بوصلة القبلة' : 'Qibla Compass'}
      </h3>

      <div className="flex flex-col items-center gap-6">
        {/* SVG Compass */}
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
            <polygon points="120,40 130,80 120,75 110,80" fill="var(--mizan-emerald)" />
            {/* جسم الإبرة */}
            <line x1="120" y1="80" x2="120" y2="160" stroke="var(--mizan-emerald)" strokeWidth="2" />
            {/* قاعدة الإبرة */}
            <circle cx="120" cy="120" r="8" fill="var(--mizan-emerald)" opacity="0.6" />
          </g>

          {/* الدائرة الوسطية */}
          <circle cx="120" cy="120" r="6" fill="var(--mizan-emerald)" />
        </svg>

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

      {/* نص توضيحي */}
      <p className="text-xs text-center mt-6" style={{ color: 'var(--mizan-text-secondary)' }}>
        {language === 'ar'
          ? 'الإبرة تشير اتجاه مكة المكرمة'
          : 'The needle points toward Mecca'}
      </p>
    </div>
  );
}