import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Returns a financial snapshot for a given month (YYYY-MM).
 * If month is omitted, defaults to current month.
 */
export async function getSnapshot(month) {
  const targetMonth = month || format(new Date(), 'yyyy-MM');
  const [year, mon] = targetMonth.split('-').map(Number);
  const start = format(startOfMonth(new Date(year, mon - 1)), 'yyyy-MM-dd');
  const end = format(endOfMonth(new Date(year, mon - 1)), 'yyyy-MM-dd');

  const [allTransactions, budgets] = await Promise.all([
    base44.entities.Transaction.list('-date', 500),
    base44.entities.Budget.filter({ month: targetMonth }),
  ]);

  const monthTxns = allTransactions.filter(tx => tx.date >= start && tx.date <= end);

  const income = monthTxns.filter(tx => tx.type === 'income').reduce((s, tx) => s + (tx.amount || 0), 0);
  const expenses = monthTxns.filter(tx => tx.type === 'expense').reduce((s, tx) => s + (tx.amount || 0), 0);
  const netBalance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Spending by category
  const categoryMap = {};
  monthTxns.filter(tx => tx.type === 'expense').forEach(tx => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + (tx.amount || 0);
  });
  const byCategory = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Budget usage
  const budgetUsage = budgets.map(b => ({
    category: b.category,
    limit: b.limit_amount,
    spent: categoryMap[b.category] || 0,
    percent: b.limit_amount > 0 ? ((categoryMap[b.category] || 0) / b.limit_amount) * 100 : 0,
  }));

  // Recent transactions (last 10)
  const recent = monthTxns.slice(0, 10);

  return {
    month: targetMonth,
    income,
    expenses,
    netBalance,
    savingsRate,
    byCategory,
    budgetUsage,
    recent,
    allMonthTransactions: monthTxns,
  };
}