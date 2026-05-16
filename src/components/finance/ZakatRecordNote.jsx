import React from 'react';
import { useI18n } from '@/lib/i18n';

export default function ZakatRecordNote() {
  const { language } = useI18n();

  return (
    <p
      className="text-xs italic mt-2"
      style={{ color: 'var(--mizan-gold)', fontStyle: 'italic' }}
    >
      {language === 'ar'
        ? 'هذا السجل تقدير شخصي. تحقق مع عالم قبل الأداء.'
        : 'This record is a personal estimate. Verify with a scholar before paying.'}
    </p>
  );
}