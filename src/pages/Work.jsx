import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, BarChart3, Plus, X, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useUserSettings } from '@/lib/UserSettingsContext';

const TABS = [
  { key: 'projects', en: 'Projects', ar: 'المشاريع' },
  { key: 'invoices', en: 'Invoices', ar: 'الفواتير' },
  { key: 'summary', en: 'Summary', ar: 'الملخص' },
];

function EmptyState({ label }) {
  return (
    <div className="text-center py-14 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-4 opacity-50">
        <path d="M40 4L72 22V58L40 76L8 58V22L40 4Z" stroke="var(--mizan-emerald)" strokeWidth="1.5" fill="none" />
        <rect x="28" y="32" width="24" height="16" rx="2" stroke="var(--mizan-gold)" strokeWidth="1.5" fill="none" />
      </svg>
      <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
    </div>
  );
}

function AddProjectModal({ onClose, onSaved, language }) {
  const [form, setForm] = useState({ title: '', client_name: '', description: '', budget: '', start_date: '', end_date: '' });
  const save = async () => {
    if (!form.title.trim() || !form.client_name.trim()) return;
    await base44.entities.WorkProject.create({ ...form, budget: Number(form.budget) || 0, status: 'active' });
    onSaved();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'مشروع جديد' : 'New Project'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>
        {[
          { key: 'title', placeholder: language === 'ar' ? 'اسم المشروع *' : 'Project title *' },
          { key: 'client_name', placeholder: language === 'ar' ? 'اسم العميل *' : 'Client name *' },
          { key: 'description', placeholder: language === 'ar' ? 'وصف' : 'Description' },
          { key: 'budget', placeholder: language === 'ar' ? 'الميزانية' : 'Budget', type: 'number' },
          { key: 'start_date', placeholder: language === 'ar' ? 'تاريخ البدء' : 'Start date', type: 'date' },
          { key: 'end_date', placeholder: language === 'ar' ? 'تاريخ الانتهاء' : 'End date', type: 'date' },
        ].map(({ key, placeholder, type = 'text' }) => (
          <input key={key} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder} className="w-full mb-3 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }} />
        ))}
        <div className="flex gap-2 mt-1">
          <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={save} className="flex-1 h-10 rounded-xl text-white" style={{ background: 'var(--mizan-emerald)' }}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}

function AddInvoiceModal({ onClose, onSaved, language, projects }) {
  const [form, setForm] = useState({ invoice_number: '', client_name: '', amount: '', due_date: '', project_id: '', notes: '' });
  const save = async () => {
    if (!form.invoice_number.trim() || !form.amount) return;
    await base44.entities.WorkInvoice.create({ ...form, amount: Number(form.amount), status: 'pending' });
    onSaved();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>
        {[
          { key: 'invoice_number', placeholder: language === 'ar' ? 'رقم الفاتورة *' : 'Invoice # *' },
          { key: 'client_name', placeholder: language === 'ar' ? 'اسم العميل *' : 'Client name *' },
          { key: 'amount', placeholder: language === 'ar' ? 'المبلغ *' : 'Amount *', type: 'number' },
          { key: 'due_date', placeholder: language === 'ar' ? 'تاريخ الاستحقاق' : 'Due date', type: 'date' },
          { key: 'notes', placeholder: language === 'ar' ? 'ملاحظات' : 'Notes' },
        ].map(({ key, placeholder, type = 'text' }) => (
          <input key={key} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder} className="w-full mb-3 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }} />
        ))}
        <div className="flex gap-2 mt-1">
          <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={save} className="flex-1 h-10 rounded-xl text-white" style={{ background: 'var(--mizan-emerald)' }}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS = { active: 'var(--mizan-emerald)', completed: 'var(--mizan-gold)', paused: 'var(--mizan-text-secondary)', paid: 'var(--mizan-green)', pending: 'var(--mizan-gold)', overdue: 'var(--mizan-red)' };

export default function Work() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const currSymbol = settings?.currency_symbol || 'ر.س';
  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.WorkProject.list('-created_date', 50),
      base44.entities.WorkInvoice.list('-due_date', 50),
    ])
      .then(([p, inv]) => { setProjects(p); setInvoices(inv); })
      .catch(err => console.error('Work load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalBilled = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount || 0), 0);

  const updateInvoiceStatus = async (id, status) => {
    await base44.entities.WorkInvoice.update(id, { status, ...(status === 'paid' ? { paid_date: format(new Date(), 'yyyy-MM-dd') } : {}) });
    load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'العمل' : 'Work'}
        </h1>
        <Briefcase className="w-6 h-6" style={{ color: 'var(--mizan-emerald)' }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        {TABS.map(({ key, en, ar }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ background: tab === key ? 'var(--mizan-emerald)' : 'transparent', color: tab === key ? 'white' : 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? ar : en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <>
          {/* Projects Tab */}
          {tab === 'projects' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowAddProject(true)} className="h-8 px-3 text-xs text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }}>
                  <Plus className="w-3.5 h-3.5" />{language === 'ar' ? 'مشروع' : 'Project'}
                </Button>
              </div>
              {projects.length === 0 ? <EmptyState label={language === 'ar' ? 'لا توجد مشاريع بعد' : 'No projects yet'} /> : (
                projects.map(p => (
                  <div key={p.id} className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>{p.title}</p>
                        <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{p.client_name}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${STATUS_COLORS[p.status]}22`, color: STATUS_COLORS[p.status] }}>
                        {p.status}
                      </span>
                    </div>
                    {p.budget > 0 && (
                      <p className="text-xs mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
                        {language === 'ar' ? 'الميزانية: ' : 'Budget: '}<span style={{ color: 'var(--mizan-gold)' }}>{currSymbol} {p.budget.toLocaleString()}</span>
                      </p>
                    )}
                    {(p.start_date || p.end_date) && (
                      <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                        {p.start_date && format(new Date(p.start_date), 'MMM d')} {p.end_date && `→ ${format(new Date(p.end_date), 'MMM d, yyyy')}`}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {tab === 'invoices' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowAddInvoice(true)} className="h-8 px-3 text-xs text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }}>
                  <Plus className="w-3.5 h-3.5" />{language === 'ar' ? 'فاتورة' : 'Invoice'}
                </Button>
              </div>
              {invoices.length === 0 ? <EmptyState label={language === 'ar' ? 'لا توجد فواتير بعد' : 'No invoices yet'} /> : (
                invoices.map(inv => (
                  <div key={inv.id} className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>#{inv.invoice_number}</p>
                        <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{inv.client_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: 'var(--mizan-gold)' }}>{currSymbol} {(inv.amount || 0).toLocaleString()}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${STATUS_COLORS[inv.status]}22`, color: STATUS_COLORS[inv.status] }}>{inv.status}</span>
                      </div>
                    </div>
                    {inv.due_date && <p className="text-xs mt-1.5" style={{ color: 'var(--mizan-text-secondary)' }}>Due: {format(new Date(inv.due_date), 'MMM d, yyyy')}</p>}
                    {inv.status !== 'paid' && (
                      <button onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                        className="mt-2 text-xs px-3 py-1 rounded-lg font-medium"
                        style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
                        {language === 'ar' ? 'تأكيد الدفع' : 'Mark Paid'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Summary Tab */}
          {tab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: language === 'ar' ? 'إجمالي الفواتير' : 'Total Billed', value: totalBilled, color: 'var(--mizan-text)' },
                  { label: language === 'ar' ? 'مدفوع' : 'Paid', value: totalPaid, color: 'var(--mizan-green)' },
                  { label: language === 'ar' ? 'معلق' : 'Pending', value: totalPending, color: 'var(--mizan-gold)' },
                  { label: language === 'ar' ? 'متأخر' : 'Overdue', value: totalOverdue, color: 'var(--mizan-red)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
                    <p className="text-lg font-bold" style={{ color }}>{currSymbol} {value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                <p className="text-xs font-semibold mb-3 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'المشاريع' : 'Projects'}</p>
                <div className="flex gap-4">
                  {[['active', 'var(--mizan-emerald)'], ['completed', 'var(--mizan-gold)'], ['paused', 'var(--mizan-text-secondary)']].map(([s, c]) => (
                    <div key={s} className="text-center">
                      <p className="text-2xl font-bold" style={{ color: c }}>{projects.filter(p => p.status === s).length}</p>
                      <p className="text-xs capitalize" style={{ color: 'var(--mizan-text-secondary)' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showAddProject && <AddProjectModal onClose={() => setShowAddProject(false)} onSaved={() => { setShowAddProject(false); load(); }} language={language} />}
      {showAddInvoice && <AddInvoiceModal onClose={() => setShowAddInvoice(false)} onSaved={() => { setShowAddInvoice(false); load(); }} language={language} projects={projects} />}
    </div>
  );
}