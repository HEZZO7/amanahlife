import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SharedBudgetTab({ familyId }) {
  const { t, language } = useI18n();
  const { settings } = useUserSettings();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: 0, description: '' });
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const currSymbol = settings?.currency_symbol || 'ر.س';

  useEffect(() => {
    load();
  }, [familyId, selectedMonth]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Budget.filter({ family_id: familyId }, '-created_date');
      // Filter by month if needed
      setBudgets(data.filter(b => b.month === selectedMonth || !b.month));
    } catch (err) {
      console.error('Load budgets:', err);
    }
    setLoading(false);
  };

  const addBudget = async () => {
    if (!newBudget.category || newBudget.amount <= 0) return;
    try {
      await base44.entities.Budget.create({
        family_id: familyId,
        category: newBudget.category,
        amount: newBudget.amount,
        description: newBudget.description,
        month: selectedMonth,
        spent: 0,
      });
      setNewBudget({ category: '', amount: 0, description: '' });
      setShowAdd(false);
      load();
    } catch (err) {
      console.error('Add budget:', err);
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <div className="flex items-center gap-2">
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الميزانية' : 'Budget'}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {currSymbol} {totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'المصروف' : 'Spent'}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--mizan-red)' }}>
            {currSymbol} {totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'المتبقي' : 'Remaining'}
          </p>
          <p className="text-lg font-bold" style={{ color: remaining >= 0 ? 'var(--mizan-green)' : 'var(--mizan-red)' }}>
            {currSymbol} {remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Budget */}
      {showAdd ? (
        <div className="p-4 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-emerald)' }}>
          <Input
            placeholder={language === 'ar' ? 'الفئة (مثال: الغذاء)' : 'Category (e.g., Food)'}
            value={newBudget.category}
            onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
            className="mb-2 h-9 rounded-lg"
            style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
          />
          <Input
            type="number"
            placeholder={language === 'ar' ? 'المبلغ' : 'Amount'}
            value={newBudget.amount || ''}
            onChange={e => setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) || 0 })}
            className="mb-2 h-9 rounded-lg"
            style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
          />
          <Input
            placeholder={language === 'ar' ? 'وصف (اختياري)' : 'Description (optional)'}
            value={newBudget.description}
            onChange={e => setNewBudget({ ...newBudget, description: e.target.value })}
            className="mb-3 h-9 rounded-lg"
            style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addBudget} className="flex-1 h-9 text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }}>
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="flex-1 h-9">
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowAdd(true)}
          className="w-full h-9 text-white rounded-lg gap-1.5"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة ميزانية' : 'Add Budget'}
        </Button>
      )}

      {/* Budgets List */}
      <div className="space-y-2">
        {budgets.length === 0 ? (
          <p className="text-xs p-4 text-center rounded-lg" style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'لا توجد ميزانيات' : 'No budgets yet'}
          </p>
        ) : (
          budgets.map(budget => {
            const percentage = (budget.spent / budget.amount) * 100;
            return (
              <div key={budget.id} className="p-3 rounded-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{budget.category}</p>
                  <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {currSymbol} {budget.spent.toLocaleString()} / {currSymbol} {budget.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: percentage > 100 ? 'var(--mizan-red)' : 'var(--mizan-emerald)',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}