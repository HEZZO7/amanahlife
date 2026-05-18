import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Plus, AlertTriangle, Trash2, Pencil, Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BudgetAlertsBanner from './BudgetAlertsBanner';

// Predefined category suggestions
const CATEGORY_SUGGESTIONS_AR = [
  'طعام وشراب', 'مواصلات', 'فواتير', 'ترفيه', 'ملابس',
  'صحة', 'تعليم', 'سفر', 'تسوق', 'أخرى',
];
const CATEGORY_SUGGESTIONS_EN = [
  'Food & Drinks', 'Transport', 'Bills', 'Entertainment', 'Clothing',
  'Health', 'Education', 'Travel', 'Shopping', 'Other',
];

function ProgressBar({ percent, over, warning }) {
  const color = over ? 'var(--mizan-red)' : warning ? 'var(--mizan-gold)' : 'var(--mizan-emerald)';
  return (
    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--mizan-border)' }}>
      <div
        className="h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(percent, 100)}%`, background: color }}
      />
    </div>
  );
}

export default function BudgetTracker({ snapshot, month, onRefresh }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const currSymbol = settings?.currency_symbol || 'ر.س';
  const isRTL = language === 'ar';

  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const suggestions = isRTL ? CATEGORY_SUGGESTIONS_AR : CATEGORY_SUGGESTIONS_EN;
  const budgets = snapshot?.budgetStatus || [];

  const handleAdd = async () => {
    if (!newCategory.trim() || !newLimit) return;
    await base44.entities.Budget.create({
      month,
      category: newCategory.trim(),
      limit_amount: parseFloat(newLimit),
    });
    setAdding(false);
    setNewCategory('');
    setNewLimit('');
    setShowSuggestions(false);
    onRefresh();
  };

  const handleEdit = async (b) => {
    if (!editLimit || parseFloat(editLimit) <= 0) return;
    // find the budget record to update
    const records = await base44.entities.Budget.filter({ month, category: b.category });
    if (records[0]) {
      await base44.entities.Budget.update(records[0].id, { limit_amount: parseFloat(editLimit) });
    }
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = async (b) => {
    const records = await base44.entities.Budget.filter({ month, category: b.category });
    if (records[0]) {
      await base44.entities.Budget.delete(records[0].id);
    }
    setDeletingId(null);
    onRefresh();
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-4">

      {/* Inline alerts inside budget tab */}
      {budgets.some(b => b.percent >= 80) && (
        <BudgetAlertsBanner budgetStatus={budgets} />
      )}

      {/* Summary row */}
      {budgets.length > 0 && (
        <div className="p-4 rounded-xl grid grid-cols-3 gap-3 text-center"
          style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isRTL ? 'إجمالي الميزانية' : 'Total Budget'}
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--mizan-emerald)' }}>
              {currSymbol} {totalBudget.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isRTL ? 'إجمالي المصروف' : 'Total Spent'}
            </p>
            <p className="text-sm font-bold" style={{ color: totalSpent > totalBudget ? 'var(--mizan-red)' : 'var(--mizan-text)' }}>
              {currSymbol} {totalSpent.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isRTL ? 'المتبقي' : 'Remaining'}
            </p>
            <p className="text-sm font-bold" style={{ color: totalSpent > totalBudget ? 'var(--mizan-red)' : 'var(--mizan-gold)' }}>
              {currSymbol} {Math.max(0, totalBudget - totalSpent).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Budget category cards */}
      {budgets.length === 0 && !adding ? (
        <div className="text-center py-12 rounded-xl"
          style={{ background: 'var(--mizan-surface)', border: '2px dashed var(--mizan-border)' }}>
          <p className="text-2xl mb-2">💰</p>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--mizan-text)' }}>
            {isRTL ? 'لا توجد ميزانيات محددة' : 'No budgets set yet'}
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isRTL ? 'حدد ميزانية لكل تصنيف لتتبع مصروفاتك' : 'Set category budgets to track your spending'}
          </p>
          <Button
            size="sm"
            className="text-white h-9 rounded-lg gap-1.5"
            style={{ background: 'var(--mizan-emerald)' }}
            onClick={() => setAdding(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            {isRTL ? 'إضافة ميزانية' : 'Add Budget'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((b, i) => {
            const over = b.percent >= 100;
            const warning = !over && b.percent >= 80;
            const remaining = Math.max(0, b.limit - b.spent);
            const isEditing = editingId === b.category;
            const isDeleting = deletingId === b.category;

            return (
              <div
                key={i}
                className="p-4 rounded-xl transition-all"
                style={{
                  background: 'var(--mizan-surface)',
                  border: `1.5px solid ${over ? 'var(--mizan-red)' : warning ? '#B89A5E66' : 'var(--mizan-border)'}`,
                }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {over && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--mizan-red)' }} />}
                    {warning && !over && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--mizan-gold)' }} />}
                    <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>{b.category}</span>
                    {over && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: '#C0392B22', color: 'var(--mizan-red)' }}>
                        {isRTL ? 'تجاوز الحد' : 'Over limit'}
                      </span>
                    )}
                    {warning && !over && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: '#B89A5E22', color: 'var(--mizan-gold)' }}>
                        {isRTL ? 'تنبيه' : 'Warning'}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  {!isEditing && !isDeleting && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingId(b.category); setEditLimit(String(b.limit)); }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--mizan-border)]"
                      >
                        <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
                      </button>
                      <button
                        onClick={() => setDeletingId(b.category)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[#C0392B22]"
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--mizan-red)' }} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit mode */}
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={editLimit}
                      onChange={e => setEditLimit(e.target.value)}
                      className="h-8 text-sm rounded-lg flex-1"
                      style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
                      placeholder={isRTL ? 'الحد الجديد' : 'New limit'}
                      autoFocus
                    />
                    <button onClick={() => handleEdit(b)} className="p-1.5 rounded-lg" style={{ background: 'var(--mizan-emerald)' }}>
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg" style={{ background: 'var(--mizan-border)' }}>
                      <X className="w-4 h-4" style={{ color: 'var(--mizan-text)' }} />
                    </button>
                  </div>
                ) : isDeleting ? (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ background: '#C0392B12', border: '1px solid #C0392B33' }}>
                    <p className="text-xs flex-1" style={{ color: 'var(--mizan-red)' }}>
                      {isRTL ? 'هل تريد حذف هذه الميزانية؟' : 'Delete this budget?'}
                    </p>
                    <button onClick={() => handleDelete(b)} className="text-xs px-2 py-1 rounded font-medium text-white" style={{ background: 'var(--mizan-red)' }}>
                      {isRTL ? 'حذف' : 'Delete'}
                    </button>
                    <button onClick={() => setDeletingId(null)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Amounts */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                        {isRTL
                          ? `${currSymbol} ${b.spent.toLocaleString()} صُرف`
                          : `${currSymbol} ${b.spent.toLocaleString()} spent`}
                      </span>
                      <span className="text-xs font-medium" style={{ color: over ? 'var(--mizan-red)' : 'var(--mizan-text-secondary)' }}>
                        {isRTL
                          ? `الحد: ${currSymbol} ${b.limit.toLocaleString()}`
                          : `Limit: ${currSymbol} ${b.limit.toLocaleString()}`}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <ProgressBar percent={b.percent} over={over} warning={warning} />

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs" style={{ color: over ? 'var(--mizan-red)' : warning ? 'var(--mizan-gold)' : 'var(--mizan-text-secondary)' }}>
                        {b.percent.toFixed(0)}% {isRTL ? 'مُستخدم' : 'used'}
                      </span>
                      <span className="text-xs font-medium" style={{ color: over ? 'var(--mizan-red)' : 'var(--mizan-emerald)' }}>
                        {over
                          ? (isRTL
                              ? `تجاوزت بـ ${currSymbol} ${(b.spent - b.limit).toLocaleString()}`
                              : `Over by ${currSymbol} ${(b.spent - b.limit).toLocaleString()}`)
                          : (isRTL
                              ? `متبقي ${currSymbol} ${remaining.toLocaleString()}`
                              : `${currSymbol} ${remaining.toLocaleString()} left`)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add budget form */}
      {adding ? (
        <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {isRTL ? 'إضافة ميزانية جديدة' : 'Add New Budget'}
          </p>

          {/* Category input + suggestions */}
          <div className="relative">
            <div className="flex gap-2">
              <Input
                placeholder={isRTL ? 'اسم التصنيف' : 'Category name'}
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="h-9 text-sm rounded-lg flex-1"
                style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
              />
              <button
                onClick={() => setShowSuggestions(s => !s)}
                className="h-9 px-2 rounded-lg border text-xs flex items-center gap-1"
                style={{ borderColor: 'var(--mizan-border)', color: 'var(--mizan-text-secondary)', background: 'var(--mizan-bg)' }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            {showSuggestions && (
              <div className="absolute top-10 left-0 right-0 z-10 rounded-lg shadow-lg border overflow-hidden"
                style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)' }}>
                {suggestions
                  .filter(s => !newCategory || s.toLowerCase().includes(newCategory.toLowerCase()))
                  .map(s => (
                    <button
                      key={s}
                      onClick={() => { setNewCategory(s); setShowSuggestions(false); }}
                      className="w-full text-right px-3 py-2 text-sm hover:bg-[var(--mizan-border)] transition-colors"
                      style={{ color: 'var(--mizan-text)', textAlign: isRTL ? 'right' : 'left' }}
                    >
                      {s}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Limit input */}
          <Input
            placeholder={isRTL ? 'الحد الأقصى (بالأرقام)' : 'Maximum limit (number)'}
            type="number"
            value={newLimit}
            onChange={e => setNewLimit(e.target.value)}
            className="h-9 text-sm rounded-lg"
            style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
          />

          {/* Threshold hint */}
          {newLimit && parseFloat(newLimit) > 0 && (
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isRTL
                ? `⚠️ ستتلقى تنبيهاً عند الوصول إلى ${currSymbol} ${(parseFloat(newLimit) * 0.8).toFixed(0)} (80% من الحد)`
                : `⚠️ You'll be alerted when reaching ${currSymbol} ${(parseFloat(newLimit) * 0.8).toFixed(0)} (80% of limit)`}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-9 text-white rounded-lg flex-1"
              style={{ background: 'var(--mizan-emerald)' }}
              onClick={handleAdd}
            >
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9"
              onClick={() => { setAdding(false); setNewCategory(''); setNewLimit(''); setShowSuggestions(false); }}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      ) : (
        budgets.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-lg gap-1.5"
            style={{ borderColor: 'var(--mizan-emerald)', color: 'var(--mizan-emerald)' }}
            onClick={() => setAdding(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            {isRTL ? 'إضافة تصنيف جديد' : 'Add Category'}
          </Button>
        )
      )}
    </div>
  );
}