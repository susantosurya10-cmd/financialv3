import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyStats, Transaction } from '../types/finance';
import { formatDateIndonesian, formatRupiah, MONTH_NAMES_ID } from './formatters';

interface GeneratePdfOptions {
  stats: MonthlyStats;
  transactions: Transaction[];
  month: number;
  year: number;
}

export function generateMonthlyReportPdf({
  stats,
  transactions,
  month,
  year,
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthName = MONTH_NAMES_ID[month];
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LAPORAN KEUANGAN BULANAN', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('BukuKas Rupiah — Catatan Harian & Rekapitulasi Kas Finansial', 14, 18);

  // Period Badge on top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${monthName.toUpperCase()} ${year}`, pageWidth - 14, 13, { align: 'right' });

  const printTimeStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Dicetak: ${printTimeStr}`, pageWidth - 14, 18, { align: 'right' });

  // 2. Ringkasan Keuangan Box (Summary Grid)
  let yPos = 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('I. RINGKASAN ARUS KAS BULAN INI', 14, yPos);

  yPos += 4;
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 20;

  // Box 1: Total Pemasukan
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text('TOTAL PEMASUKAN', 17, yPos + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(5, 150, 105);
  doc.text(formatRupiah(stats.totalIncome), 17, yPos + 14);

  // Box 2: Total Pengeluaran
  const xBox2 = 14 + cardWidth + 3;
  doc.setFillColor(255, 241, 242); // rose-50
  doc.setDrawColor(254, 205, 211); // rose-200
  doc.roundedRect(xBox2, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57); // rose-800
  doc.text('TOTAL PENGELUARAN', xBox2 + 3, yPos + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(225, 29, 72);
  doc.text(formatRupiah(stats.totalExpense), xBox2 + 3, yPos + 14);

  // Box 3: Saldo Bersih
  const xBox3 = xBox2 + cardWidth + 3;
  const isSurplus = stats.netBalance >= 0;
  doc.setFillColor(isSurplus ? 248 : 255, isSurplus ? 250 : 241, isSurplus ? 252 : 242);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(xBox3, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SALDO BERSIH (ARUS KAS)', xBox3 + 3, yPos + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(isSurplus ? 16 : 225, isSurplus ? 149 : 29, isSurplus ? 116 : 72);
  const netText = (isSurplus ? '+ ' : '- ') + formatRupiah(Math.abs(stats.netBalance));
  doc.text(netText, xBox3 + 3, yPos + 14);

  // Box 4: Total Transaksi & Rasio Tabungan
  const xBox4 = xBox3 + cardWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(xBox4, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL TRANSAKSI', xBox4 + 3, yPos + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${stats.transactionCount} Catatan`, xBox4 + 3, yPos + 14);

  yPos += cardHeight + 8;

  // 3. Section: Rincian Pengeluaran untuk apa saja & Pemasukan dari mana saja (Side by side or sequential tables)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('II. RINCIAN KATEGORI PEMASUKAN & PENGELUARAN', 14, yPos);

  yPos += 3;

  // Expense table rows
  const expenseRows = stats.expenseCategories.map((c, idx) => [
    `${idx + 1}`,
    c.name,
    `${c.count}x`,
    formatRupiah(c.total),
    `${c.percentage.toFixed(1)}%`,
  ]);

  if (expenseRows.length === 0) {
    expenseRows.push(['-', 'Tidak ada pengeluaran pada bulan ini', '-', 'Rp 0', '0%']);
  }

  // Income table rows
  const incomeRows = stats.incomeCategories.map((c, idx) => [
    `${idx + 1}`,
    c.name,
    `${c.count}x`,
    formatRupiah(c.total),
    `${c.percentage.toFixed(1)}%`,
  ]);

  if (incomeRows.length === 0) {
    incomeRows.push(['-', 'Tidak ada pemasukan pada bulan ini', '-', 'Rp 0', '0%']);
  }

  // Render Income Breakdown Table
  autoTable(doc, {
    startY: yPos,
    head: [['No', 'Pemasukan Dari Mana Saja', 'Frekuensi', 'Total Nominal', 'Porsi %']],
    body: incomeRows,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105], // emerald-600
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 20, halign: 'center' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    margin: { left: 14, right: 14 },
  });

  // Next: Expense Breakdown Table
  const lastTableEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: lastTableEnd + 5,
    head: [['No', 'Pengeluaran Untuk Apa Saja', 'Frekuensi', 'Total Nominal', 'Porsi %']],
    body: expenseRows,
    theme: 'grid',
    headStyles: {
      fillColor: [225, 29, 72], // rose-600
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 20, halign: 'center' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    margin: { left: 14, right: 14 },
  });

  // 4. Section: Daftar Seluruh Transaksi Harian
  const afterCategoryTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  let txStartY = afterCategoryTable + 8;
  if (txStartY > pageHeight - 50) {
    doc.addPage();
    txStartY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('III. DAFTAR LOG TRANSAKSI HARIAN LENGKAP', 14, txStartY);

  const sortedTx = [...transactions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const transactionRows = sortedTx.map((t, idx) => [
    `${idx + 1}`,
    formatDateIndonesian(t.date),
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.categoryName,
    t.wallet || '-',
    t.notes || '-',
    (t.type === 'income' ? '+ ' : '- ') + formatRupiah(t.amount),
  ]);

  if (transactionRows.length === 0) {
    transactionRows.push(['-', '-', 'Belum ada transaksi di bulan ini', '-', '-', '-', 'Rp 0']);
  }

  autoTable(doc, {
    startY: txStartY + 3,
    head: [['No', 'Tanggal', 'Tipe', 'Kategori', 'Dompet/Metode', 'Keterangan', 'Nominal']],
    body: transactionRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, halign: 'left' },
      2: { cellWidth: 24, halign: 'left' },
      3: { cellWidth: 32, halign: 'left' },
      4: { cellWidth: 24, halign: 'left' },
      5: { cellWidth: 'auto', halign: 'left' },
      6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 15 },
  });

  // Footer numbering
  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'BukuKas Rupiah — Aplikasi Laporan Keuangan Harian & Rekap Bulanan Pribadi/Keluarga',
      14,
      pageHeight - 8
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // Save the PDF
  const filename = `Laporan_Keuangan_${monthName}_${year}.pdf`;
  doc.save(filename);
}
