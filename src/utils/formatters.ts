export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MONTH_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const WALLET_PRESETS = [
  'Tunai / Kas Fisik',
  'BCA',
  'Bank Mandiri',
  'BRI',
  'BNI',
  'BSI',
  'Jago / Seabank',
  'GoPay',
  'OVO',
  'DANA',
  'ShopeePay',
  'Lainnya',
];

/**
 * Format a number into standard Indonesian Rupiah: Rp 1.500.000
 */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);

  // International standard in Node/browser might output "IDR 1.500.000" or "Rp 1.500.000"
  // Normalize to "Rp 1.500.000"
  return formatted.replace('IDR', 'Rp').trim();
}

/**
 * Format a number into compact Rupiah representation: Rp 1,5 jt
 */
export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `Rp ${(abs / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(abs / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  }
  if (abs >= 1_000) {
    return `Rp ${(abs / 1_000).toFixed(0)} rb`;
  }
  return formatRupiah(amount);
}

/**
 * Format ISO date "2026-11-05" to "5 November 2026"
 */
export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return `${day} ${MONTH_NAMES_ID[month - 1]} ${year}`;
}

/**
 * Format ISO date "2026-11-05" to short version: "5 Nov 2026"
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return `${day} ${MONTH_SHORT_ID[month - 1]} ${year}`;
}

/**
 * Get today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
