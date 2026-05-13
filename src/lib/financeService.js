import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Returns a financial snapshot for a given month (YYYY-MM).
 * If month is omitted, defaults to current month.
 */
export async function getSnapshot(month) {
  const monthStr = month || format(new Date(), 'yyyy-MM');
  const start = `${monthStr}-01`;
  // end: last day of that month
  const end = format(endOfMonth(new Date(`${monthStr}-01`)), 'yyyy-MM-dd');

  const [allTx, budgets, zakatRecords] = await Promise.all([
    base44.entities.Transaction.list('-date', 500),
    base44.entities.Budget.filter({ month: monthStr }),
    base44.entities.ZakatRecord.list('-calculation_date', 5),
  ]);

  const monthTx = allTx.filter(tx => tx.date >= start && tx.date <= end);

  const totalIncome = monthTx
    .filter(tx => tx.type === 'income')
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  const totalExpenses = monthTx
    .filter(tx => tx.type === 'expense')
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  // Spending by category
  const categoryMap = {};
  monthTx.filter(tx => tx.type === 'expense').forEach(tx => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + (tx.amount || 0);
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Budget utilisation
  const budgetStatus = budgets.map(b => {
    const spent = categoryMap[b.category] || 0;
    return {
      category: b.category,
      limit: b.limit_amount,
      spent,
      percent: b.limit_amount > 0 ? Math.round((spent / b.limit_amount) * 100) : 0,
      over: spent > b.limit_amount,
    };
  });

  // Latest zakat record
  const latestZakat = zakatRecords[0] || null;

  // Trend: last 6 months income vs expense
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = format(d, 'yyyy-MM');
    const mStart = `${m}-01`;
    const mEnd = format(endOfMonth(new Date(`${m}-01`)), 'yyyy-MM-dd');
    const mTx = allTx.filter(tx => tx.date >= mStart && tx.date <= mEnd);
    trend.push({
      month: m,
      label: format(new Date(`${m}-01`), 'MMM'),
      income: mTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + (tx.amount || 0), 0),
      expenses: mTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + (tx.amount || 0), 0),
    });
  }

  return {
    month: monthStr,
    totalIncome,
    totalExpenses,
    netBalance,
    categoryBreakdown,
    budgetStatus,
    recentTransactions: monthTx.slice(0, 20),
    latestZakat,
    trend,
  };
}