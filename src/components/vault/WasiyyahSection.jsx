import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

export default function WasiyyahSection() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [wasiyyah, setWasiyyah] = useState({
    assets_notes: '',
    debts_notes: '',
    distribution_notes: '',
    executor_name: '',
    executor_contact: '',
    final_wishes: '',
    family_message: '',
  });

  useEffect(() => {
    loadWasiyyah();
  }, []);

  const loadWasiyyah = async () => {
    setLoading(true);
    try {
      const notes = await base44.entities.WasiyyahNotes.list('-updated_at', 1);
      if (notes.length > 0) {
        setWasiyyah(notes[0]);
      }
    } catch (err) {
      console.error('Error loading wasiyyah:', err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (wasiyyah.id) {
        await base44.entities.WasiyyahNotes.update(wasiyyah.id, wasiyyah);
      } else {
        await base44.entities.WasiyyahNotes.create(wasiyyah);
        loadWasiyyah();
      }
    } catch (err) {
      console.error('Error saving wasiyyah:', err);
    }
    setSaving(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      let yPos = margin;

      // Header
      doc.setFillColor(11, 91, 80); // Emerald
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(language === 'ar' ? 'وصيتي الإسلامية' : 'My Islamic Will', margin, 20);

      yPos = 45;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      const sections = [
        { title: language === 'ar' ? 'أصولي وممتلكاتي' : 'My Assets', content: wasiyyah.assets_notes },
        { title: language === 'ar' ? 'ديوني والتزاماتي' : 'My Debts & Obligations', content: wasiyyah.debts_notes },
        { title: language === 'ar' ? 'نوايا التوزيع' : 'Distribution Intentions', content: wasiyyah.distribution_notes },
        { title: language === 'ar' ? 'وصيي' : 'Executor', content: `${wasiyyah.executor_name}\n${wasiyyah.executor_contact}` },
        { title: language === 'ar' ? 'أمنياتي الأخيرة' : 'Final Wishes', content: wasiyyah.final_wishes },
        { title: language === 'ar' ? 'رسالتي إلى أهلي' : 'My Message to My Family', content: wasiyyah.family_message },
      ];

      sections.forEach(({ title, content }) => {
        if (!content) return;
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text(title, margin, yPos);
        yPos += 7;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(content, maxWidth);
        lines.forEach((line) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += 5;
        });

        yPos += 5;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        language === 'ar' ? 'هذا مستند شخصي للملاحظات، وليس وصية ملزمة قانوناً' : 'This is a personal notes document, not legally binding',
        margin,
        pageHeight - 10
      );

      doc.save(language === 'ar' ? 'وصيتي.pdf' : 'My_Will.pdf');
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
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="rounded-xl p-4 flex gap-3" style={{ background: 'var(--mizan-gold)20', border: '1px solid var(--mizan-gold)40' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--mizan-gold)' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--mizan-gold)' }}>
            {language === 'ar' ? 'تنبيه مهم' : 'Important Disclaimer'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar'
              ? 'هذا مستند شخصي للملاحظات، وليس وصية ملزمة قانوناً. يرجى تنسيق وصيتك مع محامٍ مختص وعالم إسلامي معتمد لضمان الامتثال لأحكام الفرائض والقانون.'
              : 'This is a personal notes document, not a legally binding will. Please formalize your will with a qualified lawyer and Islamic scholar to ensure compliance with Islamic inheritance law and civil regulations.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h2 className="text-sm font-semibold mizan-section-header mb-4" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'وصيتي الإسلامية' : 'My Islamic Will'}
        </h2>

        <div className="space-y-4">
          {/* Assets */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'أصولي وممتلكاتي' : 'My Assets'}
            </label>
            <textarea
              value={wasiyyah.assets_notes}
              onChange={(e) => setWasiyyah({ ...wasiyyah, assets_notes: e.target.value })}
              placeholder={language === 'ar' ? 'اذكر أصولك والممتلكات التي تريد توثيقها...' : 'List your assets and properties...'}
              className="w-full px-3 py-2 rounded-lg text-sm h-20"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>

          {/* Debts */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'ديوني والتزاماتي' : 'My Debts & Obligations'}
            </label>
            <textarea
              value={wasiyyah.debts_notes}
              onChange={(e) => setWasiyyah({ ...wasiyyah, debts_notes: e.target.value })}
              placeholder={language === 'ar' ? 'اذكر الديون والالتزامات...' : 'List your debts and obligations...'}
              className="w-full px-3 py-2 rounded-lg text-sm h-20"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>

          {/* Distribution */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'نوايا التوزيع' : 'Distribution Intentions'}
            </label>
            <textarea
              value={wasiyyah.distribution_notes}
              onChange={(e) => setWasiyyah({ ...wasiyyah, distribution_notes: e.target.value })}
              placeholder={language === 'ar' ? 'اشرح نوايا التوزيع...' : 'Describe your distribution intentions...'}
              className="w-full px-3 py-2 rounded-lg text-sm h-20"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar'
                ? '⚠️ يرجى استشارة عالم إسلامي مؤهل للتأكد من الامتثال لأحكام الفرائض الإسلامية'
                : '⚠️ Please consult a qualified Islamic scholar to ensure compliance with fard al-mirath'}
            </p>
          </div>

          {/* Executor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
                {language === 'ar' ? 'اسم الوصي' : 'Executor Name'}
              </label>
              <input
                type="text"
                value={wasiyyah.executor_name}
                onChange={(e) => setWasiyyah({ ...wasiyyah, executor_name: e.target.value })}
                placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
                {language === 'ar' ? 'جهة الاتصال' : 'Contact'}
              </label>
              <input
                type="text"
                value={wasiyyah.executor_contact}
                onChange={(e) => setWasiyyah({ ...wasiyyah, executor_contact: e.target.value })}
                placeholder={language === 'ar' ? 'رقم أو بريد' : 'Phone or email'}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
              />
            </div>
          </div>

          {/* Final Wishes */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'أمنياتي الأخيرة' : 'Final Wishes'}
            </label>
            <textarea
              value={wasiyyah.final_wishes}
              onChange={(e) => setWasiyyah({ ...wasiyyah, final_wishes: e.target.value })}
              placeholder={language === 'ar' ? 'أمنياتك الأخيرة...' : 'Your final wishes...'}
              className="w-full px-3 py-2 rounded-lg text-sm h-20"
              style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>

          {/* Family Message */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'رسالتي إلى أهلي' : 'My Message to My Family'}
            </label>
            <textarea
              value={wasiyyah.family_message}
              onChange={(e) => setWasiyyah({ ...wasiyyah, family_message: e.target.value })}
              placeholder={language === 'ar' ? 'رسالة شخصية لعائلتك...' : 'A personal message for your family...'}
              className="w-full px-3 py-2 rounded-lg text-sm h-24"
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
            {exporting ? '...' : (language === 'ar' ? 'تصدير PDF' : 'Export PDF')}
          </Button>
        </div>
      </div>
    </div>
  );
}