import { jsPDF } from 'jspdf';
import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

function addHeader(doc, title, subtitle) {
  doc.setFillColor(11, 91, 80);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 14);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 20);
  }
  doc.setTextColor(26, 46, 42);
  return 30;
}

function addSectionTitle(doc, title, y) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 91, 80);
  doc.text(title, 14, y);
  doc.setTextColor(26, 46, 42);
  return y + 7;
}

function addRow(doc, cols, y, isHeader = false) {
  const widths = [60, 40, 50, 40];
  doc.setFontSize(isHeader ? 8 : 8);
  doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
  if (isHeader) {
    doc.setFillColor(240, 238, 233);
    doc.rect(10, y - 5, 190, 7, 'F');
  }
  cols.forEach((col, i) => {
    const x = 14 + widths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(String(col || ''), x, y);
  });
  return y + 7;
}

// 1. Financial Summary PDF
export async function exportFinanceSummaryPDF(month, currSymbol = 'SAR') {
  const monthStr = month || format(new Date(), 'yyyy-MM');
  const [allTx, budgets] = await Promise.all([
    base44.entities.Transaction.list('-date', 500),
    base44.entities.Budget.filter({ month: monthStr }),
  ]);
  const monthTx = allTx.filter(t => t.date?.startsWith(monthStr));
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const doc = new jsPDF();
  let y = addHeader(doc, 'Financial Summary — Mizan', `${monthStr} · Generated ${format(new Date(), 'yyyy-MM-dd')}`);

  y = addSectionTitle(doc, 'Overview', y);
  y = addRow(doc, ['Total Income', `${currSymbol} ${income.toLocaleString()}`, '', ''], y);
  y = addRow(doc, ['Total Expenses', `${currSymbol} ${expenses.toLocaleString()}`, '', ''], y);
  y = addRow(doc, ['Net Balance', `${currSymbol} ${(income - expenses).toLocaleString()}`, '', ''], y);
  y = addRow(doc, ['Savings Rate', income > 0 ? `${((income - expenses) / income * 100).toFixed(1)}%` : '—', '', ''], y);
  y += 6;

  y = addSectionTitle(doc, 'Budget Status', y);
  y = addRow(doc, ['Category', 'Limit', 'Spent', 'Status'], y, true);
  const catMap = {};
  monthTx.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  budgets.forEach(b => {
    const spent = catMap[b.category] || 0;
    const pct = b.limit_amount > 0 ? Math.round((spent / b.limit_amount) * 100) : 0;
    y = addRow(doc, [b.category, `${currSymbol} ${b.limit_amount.toLocaleString()}`, `${currSymbol} ${spent.toLocaleString()}`, `${pct}%`], y);
    if (y > 270) { doc.addPage(); y = 20; }
  });
  y += 6;

  y = addSectionTitle(doc, 'Recent Transactions', y);
  y = addRow(doc, ['Date', 'Category', 'Description', 'Amount'], y, true);
  monthTx.slice(0, 20).forEach(tx => {
    y = addRow(doc, [tx.date, tx.category, (tx.description || '').substring(0, 20), `${tx.type === 'expense' ? '-' : '+'}${currSymbol} ${tx.amount.toLocaleString()}`], y);
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save(`mizan-finance-${monthStr}.pdf`);
}

// 2. Transactions Excel (CSV)
export async function exportTransactionsCSV(month) {
  const monthStr = month || format(new Date(), 'yyyy-MM');
  const allTx = await base44.entities.Transaction.list('-date', 500);
  const monthTx = allTx.filter(t => t.date?.startsWith(monthStr));

  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Halal Verified'];
  const rows = monthTx.map(t => [t.date, t.type, t.category, t.description || '', t.amount, t.is_halal_verified ? 'Yes' : 'No']);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `mizan-transactions-${monthStr}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// 3. Ramadan Report PDF
export async function exportRamadanReportPDF() {
  const logs = await base44.entities.RamadanLog.list('-date', 30);
  const doc = new jsPDF();
  let y = addHeader(doc, 'Ramadan Report — Mizan', `Generated ${format(new Date(), 'yyyy-MM-dd')}`);

  const fasted = logs.filter(l => l.fasting_completed).length;
  const totalPages = logs.reduce((s, l) => s + (l.quran_pages || 0), 0);

  y = addSectionTitle(doc, 'Summary', y);
  y = addRow(doc, ['Days Fasted', `${fasted}/30`, '', ''], y);
  y = addRow(doc, ["Qur'an Pages", totalPages.toString(), '', ''], y);
  y += 8;

  y = addSectionTitle(doc, 'Daily Log', y);
  y = addRow(doc, ['Date', 'Fasting', 'Suhoor', "Qur'an Pages"], y, true);
  logs.forEach(l => {
    y = addRow(doc, [l.date, l.fasting_completed ? 'Yes' : 'No', l.suhoor_logged ? 'Yes' : 'No', l.quran_pages || 0], y);
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save('mizan-ramadan-report.pdf');
}

// 4. Goals Report PDF
export async function exportGoalsPDF() {
  const goals = await base44.entities.Goal.list();
  const doc = new jsPDF();
  let y = addHeader(doc, 'Goals Report — Mizan', `Generated ${format(new Date(), 'yyyy-MM-dd')}`);

  y = addSectionTitle(doc, 'All Goals', y);
  y = addRow(doc, ['Title', 'Category', 'Progress', 'Status'], y, true);
  goals.forEach(g => {
    y = addRow(doc, [g.title.substring(0,25), g.category, `${g.progress || 0}%`, g.status], y);
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save('mizan-goals-report.pdf');
}

// 5. All Data CSV
export async function exportAllDataCSV() {
  const [txs, tasks, goals, prayers] = await Promise.all([
    base44.entities.Transaction.list('-date', 500),
    base44.entities.Task.list('-due_date', 200),
    base44.entities.Goal.list(),
    base44.entities.PrayerLog.list('-date', 60),
  ]);

  let csv = 'TRANSACTIONS\n';
  csv += ['Date','Type','Category','Amount','Description'].join(',') + '\n';
  txs.forEach(t => { csv += [t.date, t.type, t.category, t.amount, t.description || ''].map(c => `"${c}"`).join(',') + '\n'; });

  csv += '\nTASKS\n';
  csv += ['Title','Status','Priority','Due Date'].join(',') + '\n';
  tasks.forEach(t => { csv += [t.title, t.status, t.priority, t.due_date || ''].map(c => `"${c}"`).join(',') + '\n'; });

  csv += '\nGOALS\n';
  csv += ['Title','Category','Progress','Status','Target Date'].join(',') + '\n';
  goals.forEach(g => { csv += [g.title, g.category, g.progress || 0, g.status, g.target_date || ''].map(c => `"${c}"`).join(',') + '\n'; });

  csv += '\nPRAYER LOGS\n';
  csv += ['Date','Fajr','Dhuhr','Asr','Maghrib','Isha'].join(',') + '\n';
  prayers.forEach(p => { csv += [p.date, p.fajr ? 1 : 0, p.dhuhr ? 1 : 0, p.asr ? 1 : 0, p.maghrib ? 1 : 0, p.isha ? 1 : 0].join(',') + '\n'; });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `mizan-all-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click(); URL.revokeObjectURL(url);
}