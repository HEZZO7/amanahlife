import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Heart, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function EmergencyInfoCard() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [info, setInfo] = useState({
    blood_type: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    doctor_name: '',
    doctor_phone: '',
    medical_conditions: '',
    medications: '',
  });

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    setLoading(true);
    try {
      const notes = await base44.entities.WasiyyahNotes.list('-updated_at', 1);
      if (notes.length > 0) {
        setInfo(notes[0]);
      }
    } catch (err) {
      console.error('Error loading emergency info:', err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (info.id) {
        await base44.entities.WasiyyahNotes.update(info.id, info);
      } else {
        await base44.entities.WasiyyahNotes.create(info);
        loadInfo();
      }
    } catch (err) {
      console.error('Error saving emergency info:', err);
    }
    setSaving(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      // Header
      doc.setFillColor(11, 91, 80); // Emerald
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(language === 'ar' ? '🏥 بطاقة معلومات الطوارئ' : '🏥 Emergency Information Card', margin, 20);

      let yPos = 55;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      const fields = [
        { label: language === 'ar' ? 'فصيلة الدم' : 'Blood Type', value: info.blood_type },
        { label: language === 'ar' ? 'جهة الاتصال في الطوارئ' : 'Emergency Contact', value: info.emergency_contact_name },
        { label: language === 'ar' ? 'رقم الاتصال' : 'Phone', value: info.emergency_contact_phone },
        { label: language === 'ar' ? 'الطبيب' : 'Doctor', value: info.doctor_name },
        { label: language === 'ar' ? 'رقم الطبيب' : 'Doctor Phone', value: info.doctor_phone },
        { label: language === 'ar' ? 'الحالات الطبية' : 'Medical Conditions', value: info.medical_conditions },
        { label: language === 'ar' ? 'الأدوية' : 'Medications', value: info.medications },
      ];

      fields.forEach(({ label, value }) => {
        if (!value) return;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.text(label, margin, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(value, maxWidth - 10);
        lines.forEach((line) => {
          doc.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 3;
      });

      doc.save(language === 'ar' ? 'بطاقة_الطوارئ.pdf' : 'Emergency_Card.pdf');
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--mizan-emerald)' }} />
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5" style={{ color: 'var(--mizan-red)' }} />
        <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'بطاقة معلومات الطوارئ' : 'Emergency Information'}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Blood Type */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'فصيلة الدم' : 'Blood Type'}
          </label>
          <select
            value={info.blood_type}
            onChange={(e) => setInfo({ ...info, blood_type: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
          >
            <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
            {BLOOD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'اسم الاتصال' : 'Contact Name'}
            </label>
            <input
              type="text"
              value={info.emergency_contact_name}
              onChange={(e) => setInfo({ ...info, emergency_contact_name: e.target.value })}
              placeholder={language === 'ar' ? 'الاسم' : 'Name'}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'الرقم' : 'Phone'}
            </label>
            <input
              type="tel"
              value={info.emergency_contact_phone}
              onChange={(e) => setInfo({ ...info, emergency_contact_phone: e.target.value })}
              placeholder={language === 'ar' ? '+966...' : '+966...'}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>
        </div>

        {/* Doctor Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'اسم الطبيب' : 'Doctor Name'}
            </label>
            <input
              type="text"
              value={info.doctor_name}
              onChange={(e) => setInfo({ ...info, doctor_name: e.target.value })}
              placeholder={language === 'ar' ? 'الاسم' : 'Name'}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'رقم الطبيب' : 'Doctor Phone'}
            </label>
            <input
              type="tel"
              value={info.doctor_phone}
              onChange={(e) => setInfo({ ...info, doctor_phone: e.target.value })}
              placeholder={language === 'ar' ? '+966...' : '+966...'}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'الحالات الطبية' : 'Medical Conditions'}
          </label>
          <textarea
            value={info.medical_conditions}
            onChange={(e) => setInfo({ ...info, medical_conditions: e.target.value })}
            placeholder={language === 'ar' ? 'السكري، الربو، إلخ...' : 'Diabetes, Asthma, etc...'}
            className="w-full px-3 py-2 rounded-lg text-sm h-16"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
          />
        </div>

        {/* Medications */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'الأدوية' : 'Medications'}
          </label>
          <textarea
            value={info.medications}
            onChange={(e) => setInfo({ ...info, medications: e.target.value })}
            placeholder={language === 'ar' ? 'اسم الدواء والجرعة...' : 'Medication name and dosage...'}
            className="w-full px-3 py-2 rounded-lg text-sm h-16"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--mizan-border)' }}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 text-white rounded-lg h-10"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {saving ? '...' : (language === 'ar' ? 'حفظ' : 'Save')}
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex-1 text-white rounded-lg h-10 gap-2"
          style={{ background: 'var(--mizan-gold)' }}
        >
          <Download className="w-4 h-4" />
          {exporting ? '...' : (language === 'ar' ? 'تصدير' : 'Export')}
        </Button>
      </div>
    </div>
  );
}