import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, Download, Search, Filter, X, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EXPENSE_CATEGORIES = [
  'food', 'transport', 'housing', 'health', 'education',
  'entertainment', 'shopping', 'charity', 'savings', 'other',
];

const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'gift', 'other'];

export default function TransactionHistory() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const isAr = language === 'ar';
  const currSymbol = settings?.currency_symbol || 'ر.س';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // desc | asc
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    base44.entities.Transaction.list('-date', 500)
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...transactions];

    // Type
    if (typeFilter !== 'all') list = list.filter(tx => tx.type === typeFilter);

    // Category
    if (categoryFilter !== 'all') list = list.filter(tx => tx.category === categoryFilter);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(tx =>
        tx.description?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q)
      );
    }

    // Date range
    if (dateFrom) list = list.filter(tx => tx.date && tx.date >= dateFrom);
    if (dateTo)   list = list.filter(tx => tx.date && tx.date <= dateTo);

    // Sort
    list.sort((a, b) => {
      const diff = (a.date || '') < (b.date || '') ? -1 : 1;
      return sortOrder === 'desc' ? -diff : diff;
    });

    return list;
  }, [transactions, typeFilter, categoryFilter, search, dateFrom, dateTo, sortOrder]);

  // Totals for filtered results
  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const net = totalIncome - totalExpense;

  const handleExportCSV = () => {
    const headers = isAr
      ? ['التاريخ', 'النوع', 'الفئة', 'الوصف', 'المبلغ']
      : ['Date', 'Type', 'Category', 'Description', 'Amount'];

    const rows = filtered.map(tx => [
      tx.date || '',
      tx.type === 'income' ? (isAr ? 'دخل' : 'Income') : (isAr ? 'مصروف' : 'Expense'),
      tx.category || '',
      tx.description || '',
      tx.type === 'income' ? tx.amount : -tx.amount,
    ]);

    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'all' || dateFrom || dateTo || search;

  const allCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))];

  // Group by month
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(tx => {
      const key = tx.date ? tx.date.slice(0, 7) : 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) =>
      sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b)
    );
  }, [filtered, sortOrder]);

  const formatMonthLabel = (key) => {
    if (key === 'unknown') return isAr ? 'غير محدد' : 'Unknown';
    try {
      const d = parseISO(key + '-01');
      return isAr
        ? d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })
        : format(d, 'MMMM yyyy');
    } catch { return key; }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {isAr ? 'سجل العمليات المالية' : 'Transaction History'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isAr ? `${filtered.length} عملية` : `${filtered.length} transactions`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs"
            style={{ borderColor: 'var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}>
            <Download className="w-3.5 h-3.5" />
            {isAr ? 'CSV' : 'Export'}
          </Button>
          <Link to="/finance">
            <Button size="sm" className="h-8 text-xs text-white" style={{ background: 'var(--mizan-emerald)' }}>
              {isAr ? '← المالية' : 'Finance →'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: isAr ? 'إجمالي الدخل' : 'Total Income',   value: totalIncome,  color: 'var(--mizan-green)' },
          { label: isAr ? 'إجمالي المصروف' : 'Total Expenses', value: totalExpense, color: 'var(--mizan-red)' },
          { label: isAr ? 'الصافي' : 'Net',                   value: net,           color: net >= 0 ? 'var(--mizan-gold)' : 'var(--mizan-red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
            <p className="text-base font-bold" style={{ color }}>
              {value < 0 ? '-' : ''}{currSymbol} {Math.abs(value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter bar */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-2">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث...' : 'Search...'}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--mizan-text)' }}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showFilters ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
              color: showFilters ? 'white' : 'var(--mizan-text-secondary)',
              border: `1px solid ${showFilters ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
            }}>
            <Filter className="w-4 h-4" />
            {isAr ? 'فلتر' : 'Filter'}
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white/80 inline-block" />}
          </button>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            {isAr ? (sortOrder === 'desc' ? 'الأحدث' : 'الأقدم') : (sortOrder === 'desc' ? 'Newest' : 'Oldest')}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            {/* Type */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isAr ? 'النوع' : 'Type'}
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', ar: 'الكل', en: 'All' },
                  { key: 'income', ar: 'دخل', en: 'Income' },
                  { key: 'expense', ar: 'مصروف', en: 'Expense' },
                ].map(({ key, ar, en }) => (
                  <button key={key} onClick={() => setTypeFilter(key)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: typeFilter === key ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)',
                      color: typeFilter === key ? 'white' : 'var(--mizan-text-secondary)',
                      border: `1px solid ${typeFilter === key ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
                    }}>
                    {isAr ? ar : en}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isAr ? 'الفئة' : 'Category'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setCategoryFilter('all')}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: categoryFilter === 'all' ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)',
                    color: categoryFilter === 'all' ? 'white' : 'var(--mizan-text-secondary)',
                    border: `1px solid ${categoryFilter === 'all' ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
                  }}>
                  {isAr ? 'الكل' : 'All'}
                </button>
                {allCategories.map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize"
                    style={{
                      background: categoryFilter === cat ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)',
                      color: categoryFilter === cat ? 'white' : 'var(--mizan-text-secondary)',
                      border: `1px solid ${categoryFilter === cat ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {isAr ? 'من تاريخ' : 'From'}
                </p>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {isAr ? 'إلى تاريخ' : 'To'}
                </p>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }} />
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'var(--mizan-red)' }}>
                <X className="w-3.5 h-3.5" />
                {isAr ? 'مسح الفلاتر' : 'Clear filters'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transactions grouped by month */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--mizan-text-secondary)' }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">{isAr ? 'لا توجد نتائج مطابقة' : 'No matching transactions'}</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs underline" style={{ color: 'var(--mizan-emerald)' }}>
              {isAr ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([monthKey, txns]) => {
            const monthIncome  = txns.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
            const monthExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
            return (
              <div key={monthKey}>
                {/* Month header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {formatMonthLabel(monthKey)}
                  </p>
                  <div className="flex gap-3 text-xs">
                    <span style={{ color: 'var(--mizan-green)' }}>+{currSymbol} {monthIncome.toLocaleString()}</span>
                    <span style={{ color: 'var(--mizan-red)' }}>-{currSymbol} {monthExpense.toLocaleString()}</span>
                  </div>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  {txns.map(tx => (
                    <div key={tx.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: tx.type === 'income' ? '#27AE6022' : '#C0392B22' }}>
                        {tx.type === 'income'
                          ? <TrendingUp className="w-4 h-4" style={{ color: 'var(--mizan-green)' }} />
                          : <TrendingDown className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--mizan-text)' }}>
                          {tx.description || tx.category}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                          {tx.category} · {tx.date}
                        </p>
                      </div>
                      <span className="text-sm font-semibold flex-shrink-0"
                        style={{ color: tx.type === 'income' ? 'var(--mizan-green)' : 'var(--mizan-red)' }}>
                        {tx.type === 'income' ? '+' : '-'}{currSymbol} {tx.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}