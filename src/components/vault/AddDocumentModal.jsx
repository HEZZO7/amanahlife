import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['identity', 'property', 'finance', 'insurance', 'medical', 'legal', 'other'];
const CATEGORY_LABELS = {
  identity: { ar: 'الهوية', en: 'Identity' },
  property: { ar: 'الممتلكات', en: 'Property' },
  finance: { ar: 'المالية', en: 'Finance' },
  insurance: { ar: 'التأمين', en: 'Insurance' },
  medical: { ar: 'طبية', en: 'Medical' },
  legal: { ar: 'القانونية', en: 'Legal' },
  other: { ar: 'أخرى', en: 'Other' },
};

export default function AddDocumentModal({ onClose }) {
  const { language } = useI18n();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: 'other',
    notes: '',
    expiry_date: '',
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 20 * 1024 * 1024) {
        alert(language === 'ar' ? 'الملف كبير جداً (الحد الأقصى 20 MB)' : 'File too large (max 20 MB)');
        return;
      }
      setFile(f);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    try {
      let fileUrl = null;
      if (file) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploadRes.file_url;
      }

      await base44.entities.VaultDocuments.create({
        name: form.name,
        category: form.category,
        notes: form.notes || null,
        expiry_date: form.expiry_date || null,
        file_url: fileUrl,
      });

      onClose();
    } catch (err) {
      console.error('Error creating document:', err);
      alert(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bottom-sheet-overlay">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 bottom-sheet-content" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'إضافة وثيقة' : 'Add Document'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ background: 'var(--mizan-border)' }}>
            <X className="w-4 h-4" style={{ color: 'var(--mizan-text)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'اسم الوثيقة' : 'Document Name'}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={language === 'ar' ? 'مثال: جواز السفر' : 'e.g., Passport'}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'الفئة' : 'Category'}
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat][language]}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'تاريخ الانتهاء (اختياري)' : 'Expiry Date (optional)'}
            </label>
            <input
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'ملاحظات (اختيارية)' : 'Notes (optional)'}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={language === 'ar' ? 'أضف ملاحظاتك...' : 'Add notes...'}
              className="w-full px-3 py-2 rounded-lg text-sm h-20"
              style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'رفع ملف (اختياري)' : 'Upload File (optional)'}
            </label>
            <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer" style={{ borderColor: 'var(--mizan-border)' }}>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-1">
                <Upload className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
                <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {file ? file.name : (language === 'ar' ? 'انقر لاختيار ملف' : 'Click to select file')}
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 text-sm h-9">
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 text-sm h-9 text-white rounded-lg"
              style={{ background: 'var(--mizan-emerald)' }}
            >
              {loading ? '...' : (language === 'ar' ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}