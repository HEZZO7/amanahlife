import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, parseISO, differenceInDays } from 'date-fns';
import { FileText, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddDocumentModal from './AddDocumentModal';

const CATEGORY_ICONS = {
  identity: '🪪',
  property: '🏠',
  finance: '💰',
  insurance: '🛡️',
  medical: '⚕️',
  legal: '⚖️',
  other: '📄',
};

const CATEGORY_LABELS = {
  identity: { ar: 'الهوية', en: 'Identity' },
  property: { ar: 'الممتلكات', en: 'Property' },
  finance: { ar: 'المالية', en: 'Finance' },
  insurance: { ar: 'التأمين', en: 'Insurance' },
  medical: { ar: 'طبية', en: 'Medical' },
  legal: { ar: 'القانونية', en: 'Legal' },
  other: { ar: 'أخرى', en: 'Other' },
};

export default function DocumentsSection() {
  const { language } = useI18n();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await base44.entities.VaultDocuments.list('-created_date', 100);
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await base44.entities.VaultDocuments.delete(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
    setDeleting(null);
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const daysLeft = differenceInDays(parseISO(expiryDate), new Date());
    return daysLeft >= 0 && daysLeft <= 60;
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'الوثائق' : 'Documents'}
        </h2>
        <Button onClick={() => setShowModal(true)} size="sm" className="h-8 gap-1.5 text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }}>
          <Plus className="w-3.5 h-3.5" />
          {language === 'ar' ? 'إضافة' : 'Add'}
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" style={{ color: 'var(--mizan-text)' }} />
          <p style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'لا توجد وثائق' : 'No documents'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((doc) => {
            const isExpiring = isExpiringSoon(doc.expiry_date);
            return (
              <div
                key={doc.id}
                className="rounded-lg p-4 relative"
                style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}
              >
                {isExpiring && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--mizan-gold)20' }}>
                    <AlertTriangle className="w-3 h-3" style={{ color: 'var(--mizan-gold)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--mizan-gold)' }}>
                      {language === 'ar' ? 'قريب الانتهاء' : 'Expiring'}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">{CATEGORY_ICONS[doc.category]}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--mizan-text)' }}>
                      {doc.name}
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {CATEGORY_LABELS[doc.category][language]}
                    </p>
                  </div>
                </div>

                {doc.notes && (
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {doc.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--mizan-border)' }}>
                  <div className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    <p>{format(new Date(doc.created_date), 'd MMM')}</p>
                    {doc.expiry_date && (
                      <p className={isExpiring ? 'font-medium' : ''} style={{ color: isExpiring ? 'var(--mizan-gold)' : 'inherit' }}>
                        {language === 'ar' ? 'ينتهي: ' : 'Expires: '}{format(parseISO(doc.expiry_date), 'd MMM')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleting === doc.id}
                    className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: 'var(--mizan-border)' }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} />
                  </button>
                </div>

                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-xs font-medium text-center py-1.5 rounded-lg transition-all"
                    style={{ background: 'var(--mizan-emerald)', color: 'white' }}
                  >
                    {language === 'ar' ? 'تحميل' : 'Download'}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <AddDocumentModal onClose={() => { setShowModal(false); loadDocuments(); }} />}
    </div>
  );
}