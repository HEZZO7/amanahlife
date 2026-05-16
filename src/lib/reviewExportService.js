import { jsPDF } from 'jspdf';

export async function exportReviewPDF(review, lang = 'ar') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 20;
  let y = 0;

  // Emerald header
  doc.setFillColor(11, 91, 80);
  doc.rect(0, 0, W, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AmanahLife', margin, 16);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const isAnnual = review.type === 'annual';
  const periodLabel = isAnnual ? `Annual Review ${review.period}` : `Monthly Review ${review.period}`;
  doc.text(periodLabel, margin, 26);

  doc.setFontSize(9);
  doc.setTextColor(200, 220, 215);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 34);

  y = 52;

  // Word of year (annual only)
  if (isAnnual && review.word_of_year) {
    doc.setFillColor(184, 154, 94, 20);
    doc.roundedRect(margin, y - 4, W - margin * 2, 14, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(184, 154, 94);
    doc.text(`Word of the Year: ${review.word_of_year}`, margin + 4, y + 6);
    y += 20;
  }

  // Scores row
  const scores = [
    { label: 'Spiritual Score', value: `${review.spiritual_score || 0}/100` },
    { label: 'Financial Grade', value: review.financial_grade || '—' },
    { label: 'Goals Progress', value: `${review.goals_summary?.avgProgress || 0}%` },
    { label: 'Avg Mood', value: review.wellness_summary?.avgMood ? `${review.wellness_summary.avgMood}/5` : '—' },
  ];

  const boxW = (W - margin * 2 - 9) / 4;
  scores.forEach((s, i) => {
    const x = margin + i * (boxW + 3);
    doc.setFillColor(240, 248, 246);
    doc.roundedRect(x, y, boxW, 22, 3, 3, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 91, 80);
    doc.text(s.value, x + boxW / 2, y + 13, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 110, 110);
    doc.text(s.label, x + boxW / 2, y + 20, { align: 'center' });
  });
  y += 30;

  // Top achievement
  if (isAnnual && review.top_achievement) {
    doc.setFillColor(184, 154, 94, 15);
    doc.roundedRect(margin, y, W - margin * 2, 18, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(184, 154, 94);
    doc.text('Top Achievement', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 40, 40);
    const lines = doc.splitTextToSize(review.top_achievement, W - margin * 2 - 8);
    doc.text(lines[0], margin + 4, y + 13);
    y += 24;
  }

  // Section helper
  const section = (title, rows) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 91, 80);
    doc.text(title, margin, y + 5);
    doc.setLineWidth(0.3);
    doc.setDrawColor(11, 91, 80, 60);
    doc.line(margin, y + 7, margin + 50, y + 7);
    y += 12;
    rows.forEach(([label, value]) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 90, 90);
      doc.text(label, margin + 2, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 40, 40);
      doc.text(String(value), W - margin - 2, y, { align: 'right' });
      y += 7;
    });
    y += 4;
  };

  const raw = review.raw_data || {};
  const sp = raw.spiritual || {};
  const fi = raw.financial || {};
  const go = review.goals_summary || {};
  const we = review.wellness_summary || {};

  section('Spiritual', [
    ['Prayer Completion', `${sp.prayerPct || 0}%`],
    ['Quran Pages', sp.totalQuranPages || 0],
    ['Charity Total', sp.totalCharity?.toFixed(0) || 0],
    ['Best Streak', `${sp.maxStreak || 0} days`],
  ]);

  section('Finance', [
    ['Savings Rate', `${(fi.savingsRate || 0).toFixed(1)}%`],
    ['Net Balance', fi.netBalance?.toFixed(0) || 0],
    ['Top Spending Category', fi.topCategory || '—'],
    ['Budget Adherence', `${fi.budgetAdherence || 100}%`],
  ]);

  section('Goals', [
    ['Active', go.activeCount || 0],
    ['Completed', go.completedCount || 0],
    ['Stalled', go.stalledCount || 0],
    ['Avg Progress', `${go.avgProgress || 0}%`],
  ]);

  section('Wellness', [
    ['Avg Mood', we.avgMood ? `${we.avgMood}/5` : '—'],
    ['Avg Sleep', we.avgSleep ? `${we.avgSleep}h` : '—'],
    ['Avg Stress', we.avgStress ? `${we.avgStress}/10` : '—'],
    ['Days Logged', we.logsCount || 0],
  ]);

  // AI Narrative
  const narrative = lang === 'ar' ? review.ai_narrative_ar : review.ai_narrative_en;
  if (narrative) {
    doc.setFillColor(240, 248, 246);
    const narLines = doc.splitTextToSize(narrative, W - margin * 2 - 8);
    const boxH = narLines.length * 5 + 14;
    doc.roundedRect(margin, y, W - margin * 2, boxH, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 91, 80);
    doc.text('AI Narrative', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 40, 40);
    doc.text(narLines, margin + 4, y + 13);
    y += boxH + 6;
  }

  // Focus recommendation
  const rec = lang === 'ar' ? review.focus_recommendation_ar : review.focus_recommendation_en;
  if (rec) {
    doc.setFillColor(184, 154, 94, 15);
    const recLines = doc.splitTextToSize(rec, W - margin * 2 - 8);
    const boxH = recLines.length * 5 + 14;
    doc.roundedRect(margin, y, W - margin * 2, boxH, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(184, 154, 94);
    doc.text('Focus Recommendation', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 40, 40);
    doc.text(recLines, margin + 4, y + 13);
  }

  // Footer
  doc.setFillColor(11, 91, 80);
  doc.rect(0, 285, W, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(200, 220, 215);
  doc.text('AmanahLife — Your Islamic Life Companion', W / 2, 292, { align: 'center' });

  doc.save(`AmanahLife-Review-${review.period}.pdf`);
}