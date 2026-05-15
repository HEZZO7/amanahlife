import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

// ─── PDF helpers ────────────────────────────────────────────────────────────

function initPDF(title) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(11, 91, 80); // mizan emerald
  doc.text(title, 20, 20);
  doc.setFontSize(10);
  doc.setTextColor(140, 155, 151);
  doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 30);
  doc.setTextColor(26, 46, 42);
  return doc;
}

function addRow(doc, y, cols, widths = [60, 60, 60]) {
  let x = 20;
  cols.forEach((col, i) => {
    doc.text(String(col ?? ''), x, y);
    x += widths[i] || 60;
  });
  return y + 8;
}

function addSectionHeader(doc, y, text) {
  doc.setFontSize(12);
  doc.setTextColor(11, 91, 80);
  doc.text(text, 20, y);
  doc.setFontSize(10);
  doc.setTextColor(26, 46, 42);
  return y + 8;
}

// ─── 1. Financial Summary PDF ────────────────────────────────────────────────

export function exportFinancePDF(snapshot, currSymbol = 'SAR') {
  const doc = initPDF('Financial Summary — AmanahLife');
  let y = 45;

  y = addSectionHeader(doc, y, 'Monthly Overview');
  y = addRow(doc, y, ['Income', `${currSymbol} ${(snapshot?.totalIncome || 0).toLocaleString()}`, '']);
  y = addRow(doc, y, ['Expenses', `${currSymbol} ${(snapshot?.totalExpenses || 0).toLocaleString()}`, '']);
  y = addRow(doc, y, ['Net Balance', `${currSymbol} ${(snapshot?.netBalance || 0).toLocaleString()}`, '']);
  y = addRow(doc, y, ['Savings Rate', `${(snapshot?.savingsRate || 0).toFixed(1)}%`, '']);
  y += 6;

  if (snapshot?.categoryBreakdown?.length > 0) {
    y = addSectionHeader(doc, y, 'Spending by Category');
    snapshot.categoryBreakdown.forEach(c => {
      if (y > 270) { doc.addPage(); y = 20; }
      y = addRow(doc, y, [c.category, `${currSymbol} ${c.amount.toLocaleString()}`, '']);
    });
  }

  doc.save('amanahlife-finance.pdf');
}

// ─── 2. Transactions Excel (CSV) ────────────────────────────────────────────

export function exportTransactionsCSV(transactions, currSymbol = 'SAR') {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows = transactions.map(t => [
    t.date || '',
    t.type || '',
    t.category || '',
    (t.description || '').replace(/,/g, ' '),
    t.amount || 0,
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  downloadText(csv, 'amanahlife-transactions.csv', 'text/csv');
}

// ─── 3. Ramadan Report PDF ───────────────────────────────────────────────────

export function exportRamadanPDF(logs) {
  const doc = initPDF('Ramadan Report — AmanahLife');
  let y = 45;

  y = addSectionHeader(doc, y, '30-Day Fasting Log');
  y = addRow(doc, y, ['Day', 'Date', 'Fasted', 'Quran Pages'], [30, 40, 40, 50]);
  doc.setDrawColor(230, 226, 217);
  doc.line(20, y - 3, 190, y - 3);

  logs.forEach((log, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    y = addRow(doc, y, [
      i + 1,
      log.date || '',
      log.fasting_completed ? 'Yes' : 'No',
      log.quran_pages || 0,
    ], [30, 40, 40, 50]);
  });

  const fasted = logs.filter(l => l.fasting_completed).length;
  y += 4;
  doc.setTextColor(11, 91, 80);
  doc.text(`Total fasted: ${fasted}/30 days`, 20, y);

  doc.save('amanahlife-ramadan.pdf');
}

// ─── 4. Goals Report PDF ────────────────────────────────────────────────────

export function exportGoalsPDF(goals) {
  const doc = initPDF('Goals Report — AmanahLife');
  let y = 45;

  y = addSectionHeader(doc, y, 'All Goals');
  y = addRow(doc, y, ['Title', 'Category', 'Progress', 'Status'], [60, 40, 30, 40]);
  doc.line(20, y - 3, 190, y - 3);

  goals.forEach(g => {
    if (y > 270) { doc.addPage(); y = 20; }
    y = addRow(doc, y, [g.title, g.category, `${g.progress || 0}%`, g.status], [60, 40, 30, 40]);
  });

  doc.save('amanahlife-goals.pdf');
}

// ─── 5. Full Data Export CSV ─────────────────────────────────────────────────

export function exportAllDataCSV(data) {
  const sections = [];

  if (data.transactions?.length) {
    sections.push('=== TRANSACTIONS ===');
    sections.push('Date,Type,Category,Description,Amount');
    data.transactions.forEach(t => sections.push(`${t.date},${t.type},${t.category},${(t.description||'').replace(/,/g,' ')},${t.amount}`));
    sections.push('');
  }

  if (data.goals?.length) {
    sections.push('=== GOALS ===');
    sections.push('Title,Category,Progress,Status,Target Date');
    data.goals.forEach(g => sections.push(`${g.title},${g.category},${g.progress||0}%,${g.status},${g.target_date||''}`));
    sections.push('');
  }

  if (data.wellness?.length) {
    sections.push('=== WELLNESS LOGS ===');
    sections.push('Date,Mood,Sleep Hours,Hydration,Stress');
    data.wellness.forEach(w => sections.push(`${w.date},${w.mood},${w.sleep_hours||''},${w.hydration_level||''},${w.stress_level||''}`));
  }

  downloadText(sections.join('\n'), 'amanahlife-all-data.csv', 'text/csv');
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function downloadText(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}