import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { X, AlertCircle, Sparkles, Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const EXPENSE_CATS = ['food', 'transport', 'housing', 'health', 'education', 'entertainment', 'clothing', 'utilities', 'charity', 'other'];
const INCOME_CATS = ['salary', 'freelance', 'investment', 'gift', 'other'];

export default function AddTransactionModal({ type, onClose, onSaved }) {
  const { t, language } = useI18n();
  const isAr = language === 'ar';
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [autoClassifying, setAutoClassifying] = useState(false);
  const [autoCategorized, setAutoCategorized] = useState(false);

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  // Auto-classify when description changes
  useEffect(() => {
    if (!description || description.length < 3) return;
    const timer = setTimeout(async () => {
      setAutoClassifying(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Classify this financial transaction and suggest tags.
Description: "${description}"
Type: ${type}
Available categories: ${cats.join(', ')}

Respond in JSON only:
{
  "category": "<best matching category from the list>",
  "tags": ["<tag1>", "<tag2>"] // 2-3 short relevant tags in the same language as the description
}`,
          response_json_schema: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        if (result?.category && cats.includes(result.category)) {
          setCategory(result.category);
          setAutoCategorized(true);
        }
        if (result?.tags?.length) {
          setTags(prev => [...new Set([...prev, ...result.tags])]);
        }
      } catch (e) { /* silent */ }
      setAutoClassifying(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [description]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  // التحقق من حدود الميزانية عند تغيير المبلغ أو الفئة
  useEffect(() => {
    const checkBudget = async () => {
      if (type !== 'expense' || !amount || !category) {
        setBudgetWarning(null);
        return;
      }

      try {
        const month = format(new Date(date), 'yyyy-MM');
        const budgets = await base44.entities.Budget.filter({ month, category });
        const budget = budgets[0];

        if (!budget) {
          setBudgetWarning(null);
          return;
        }

        // حساب إجمالي المصاريف الحالية في هذه الفئة هذا الشهر
        const transactions = await base44.entities.Transaction.filter({
          type: 'expense',
          category,
          date: { $gte: `${month}-01`, $lte: `${month}-31` }
        });

        const currentSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const newTotal = currentSpent + parseFloat(amount);
        const limit = budget.limit_amount;
        const percentage = Math.round((newTotal / limit) * 100);

        if (newTotal > limit) {
          setBudgetWarning({
            type: 'exceeded',
            amount: newTotal - limit,
            percentage
          });
        } else if (percentage >= 80) {
          setBudgetWarning({
            type: 'warning',
            percentage
          });
        } else {
          setBudgetWarning(null);
        }
      } catch (e) {
        console.error('Budget check error:', e);
      }
    };

    checkBudget();
  }, [amount, category, date, type]);

  const handleSave = async () => {
    if (!amount || !category) return;
    setSaving(true);
    await base44.entities.Transaction.create({
      type, amount: parseFloat(amount), category, description, date,
      is_halal_verified: true, tags, auto_categorized: autoCategorized
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bottom-sheet-overlay" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bottom-sheet-content w-full max-w-full sm:max-w-md rounded-2xl" style={{
        boxSizing: 'border-box',
        maxHeight: '85vh',
        overflowY: 'auto',
        background: 'var(--mizan-surface)',
        border: '1px solid var(--mizan-border)',
      }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--mizan-text)' }}>
            {type === 'income' ? t('finance.addIncome') : t('finance.addExpense')}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.amount')}</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 h-12 text-lg font-bold rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} placeholder="0" autoFocus />
          </div>
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.category')}</Label>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '8px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
                {cats.map(c => (
                  <button key={c} onClick={() => setCategory(c)} style={{
                    padding: '8px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    background: category === c ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)',
                    color: category === c ? 'white' : 'var(--mizan-text-secondary)',
                    border: `1px solid ${category === c ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}>
                    {c}
                  </button>
                ))}
              </div>
          </div>
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.description')}</Label>
            <div className="relative mt-1">
              <Input value={description} onChange={e => { setDescription(e.target.value); setAutoCategorized(false); }}
                className="h-10 rounded-lg pe-9"
                style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
              {autoClassifying && (
                <div className="absolute end-3 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-4 h-4 animate-pulse" style={{ color: 'var(--mizan-emerald)' }} />
                </div>
              )}
            </div>
            {autoCategorized && (
              <p className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--mizan-emerald)' }}>
                <Sparkles className="w-3 h-3" />
                {isAr ? 'تم التصنيف تلقائياً بالذكاء الاصطناعي' : 'Auto-classified by AI'}
              </p>
            )}
          </div>
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.date')}</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 h-10 rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
          </div>

          {/* Tags */}
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{isAr ? 'وسوم' : 'Tags'}</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder={isAr ? 'أضف وسماً...' : 'Add tag...'}
                className="h-9 rounded-lg flex-1 text-sm"
                style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
              />
              <button onClick={addTag} className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                <Plus className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: 'var(--mizan-emerald)18', color: 'var(--mizan-emerald)', border: '1px solid var(--mizan-emerald)44' }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Budget Alert */}
          {budgetWarning && (
            <div className="p-3 rounded-lg flex gap-3" style={{ 
              background: budgetWarning.type === 'exceeded' ? '#C0392B15' : '#B89A5E15',
              border: `1px solid ${budgetWarning.type === 'exceeded' ? '#C0392B40' : '#B89A5E40'}`
            }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: budgetWarning.type === 'exceeded' ? '#C0392B' : 'var(--mizan-gold)' }} />
              <div className="flex-1 text-sm" style={{ color: budgetWarning.type === 'exceeded' ? '#C0392B' : 'var(--mizan-gold)' }}>
                {budgetWarning.type === 'exceeded' ? (
                  <>
                    <p className="font-semibold mb-0.5">
                      {language === 'ar' ? '⚠️ تجاوز الحد الأقصى للميزانية' : '⚠️ Budget Exceeded'}
                    </p>
                    <p className="text-xs opacity-90">
                      {language === 'ar' 
                        ? `سيتجاوز هذا المبلغ الحد بمقدار ${budgetWarning.amount.toLocaleString()}`
                        : `This will exceed budget by ${budgetWarning.amount.toLocaleString()}`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold mb-0.5">
                      {language === 'ar' ? '⚠️ اقترب من الحد الأقصى' : '⚠️ Approaching Limit'}
                    </p>
                    <p className="text-xs opacity-90">
                      {language === 'ar' 
                        ? `استهلكت ${budgetWarning.percentage}% من الميزانية`
                        : `${budgetWarning.percentage}% of budget used`}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          </div>
          <Button disabled={saving || !amount || !category} onClick={handleSave} className="w-full mt-5 h-12 rounded-xl text-white font-semibold" style={{ background: 'var(--mizan-emerald)' }}>
          {saving ? t('common.loading') : t('settings.save')}
          </Button>
      </div>
    </div>
  );
}