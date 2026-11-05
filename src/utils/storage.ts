import { Category, Transaction } from '../types/finance';
import { getTodayDateString } from './formatters';

const STORAGE_KEY_TRANSACTIONS = 'bukukas_rupiah_transactions_v1';
const STORAGE_KEY_CATEGORIES = 'bukukas_rupiah_categories_v1';

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'exp-1', name: 'Makan & Minum', type: 'expense', color: '#f97316', icon: 'Utensils' },
  { id: 'exp-2', name: 'Belanja Harian & Sayur', type: 'expense', color: '#10b981', icon: 'ShoppingCart' },
  { id: 'exp-3', name: 'Listrik, Air & WiFi', type: 'expense', color: '#06b6d4', icon: 'Zap' },
  { id: 'exp-4', name: 'Transportasi & Bensin', type: 'expense', color: '#3b82f6', icon: 'Car' },
  { id: 'exp-5', name: 'Kesehatan & Obat', type: 'expense', color: '#ef4444', icon: 'HeartPulse' },
  { id: 'exp-6', name: 'Pendidikan & Kursus', type: 'expense', color: '#8b5cf6', icon: 'GraduationCap' },
  { id: 'exp-7', name: 'Hiburan & Rekreasi', type: 'expense', color: '#ec4899', icon: 'Gamepad2' },
  { id: 'exp-8', name: 'Cicilan & Tagihan', type: 'expense', color: '#64748b', icon: 'FileText' },
  { id: 'exp-9', name: 'Zakat, Infaq & Sosial', type: 'expense', color: '#14b8a6', icon: 'HandHeart' },
  { id: 'exp-10', name: 'Kebutuhan Rumah Tangga', type: 'expense', color: '#d97706', icon: 'Home' },
  { id: 'exp-11', name: 'Pengeluaran Lainnya', type: 'expense', color: '#94a3b8', icon: 'MoreHorizontal' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'inc-1', name: 'Gaji Bulanan', type: 'income', color: '#059669', icon: 'Briefcase' },
  { id: 'inc-2', name: 'Bonus & THR', type: 'income', color: '#10b981', icon: 'Award' },
  { id: 'inc-3', name: 'Bisnis & Jualan', type: 'income', color: '#0284c7', icon: 'Store' },
  { id: 'inc-4', name: 'Freelance & Sampingan', type: 'income', color: '#7c3aed', icon: 'Laptop' },
  { id: 'inc-5', name: 'Investasi & Dividen', type: 'income', color: '#0d9488', icon: 'TrendingUp' },
  { id: 'inc-6', name: 'Transfer & Hadiah', type: 'income', color: '#d946ef', icon: 'Gift' },
  { id: 'inc-7', name: 'Pemasukan Lainnya', type: 'income', color: '#64748b', icon: 'MoreHorizontal' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

/**
 * Generate initial demo transactions for current and previous month
 * to ensure rich visual statistics immediately on first load.
 */
function generateSeedTransactions(categories: Category[]): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const pad = (n: number) => String(n).padStart(2, '0');
  const ym = `${year}-${pad(month)}`;

  const findCat = (name: string, type: 'income' | 'expense') => {
    return categories.find((c) => c.name === name && c.type === type) || categories[0];
  };

  const gaji = findCat('Gaji Bulanan', 'income');
  const freelance = findCat('Freelance & Sampingan', 'income');
  const makan = findCat('Makan & Minum', 'expense');
  const belanja = findCat('Belanja Harian & Sayur', 'expense');
  const listrik = findCat('Listrik, Air & WiFi', 'expense');
  const bensin = findCat('Transportasi & Bensin', 'expense');
  const cicilan = findCat('Cicilan & Tagihan', 'expense');
  const zakat = findCat('Zakat, Infaq & Sosial', 'expense');
  const hiburan = findCat('Hiburan & Rekreasi', 'expense');

  return [
    {
      id: 'tx-seed-1',
      date: `${ym}-01`,
      type: 'income',
      categoryId: gaji.id,
      categoryName: gaji.name,
      amount: 8500000,
      wallet: 'BCA',
      notes: 'Gaji bulanan kantor utama',
      createdAt: Date.now() - 500000,
    },
    {
      id: 'tx-seed-2',
      date: `${ym}-02`,
      type: 'expense',
      categoryId: listrik.id,
      categoryName: listrik.name,
      amount: 450000,
      wallet: 'BCA',
      notes: 'Token listrik PLN & langganan WiFi Indihome',
      createdAt: Date.now() - 480000,
    },
    {
      id: 'tx-seed-3',
      date: `${ym}-03`,
      type: 'expense',
      categoryId: cicilan.id,
      categoryName: cicilan.name,
      amount: 1500000,
      wallet: 'BCA',
      notes: 'Cicilan bulanan rumah / KPR',
      createdAt: Date.now() - 450000,
    },
    {
      id: 'tx-seed-4',
      date: `${ym}-03`,
      type: 'expense',
      categoryId: belanja.id,
      categoryName: belanja.name,
      amount: 320000,
      wallet: 'Tunai / Kas Fisik',
      notes: 'Belanja sayur segar & lauk pauk mingguan',
      createdAt: Date.now() - 420000,
    },
    {
      id: 'tx-seed-5',
      date: `${ym}-04`,
      type: 'income',
      categoryId: freelance.id,
      categoryName: freelance.name,
      amount: 1250000,
      wallet: 'Bank Mandiri',
      notes: 'Pembayaran proyek desain logo & banner',
      createdAt: Date.now() - 390000,
    },
    {
      id: 'tx-seed-6',
      date: `${ym}-04`,
      type: 'expense',
      categoryId: bensin.id,
      categoryName: bensin.name,
      amount: 150000,
      wallet: 'GoPay',
      notes: 'Isi BBM Pertamax motor & tol',
      createdAt: Date.now() - 350000,
    },
    {
      id: 'tx-seed-7',
      date: `${ym}-05`,
      type: 'expense',
      categoryId: makan.id,
      categoryName: makan.name,
      amount: 85000,
      wallet: 'Tunai / Kas Fisik',
      notes: 'Makan siang warteg bersama keluarga',
      createdAt: Date.now() - 300000,
    },
    {
      id: 'tx-seed-8',
      date: `${ym}-05`,
      type: 'expense',
      categoryId: zakat.id,
      categoryName: zakat.name,
      amount: 100000,
      wallet: 'BSI',
      notes: 'Sedekah Jumat berkah masjid sekitar',
      createdAt: Date.now() - 250000,
    },
    {
      id: 'tx-seed-9',
      date: `${ym}-05`,
      type: 'expense',
      categoryId: hiburan.id,
      categoryName: hiburan.name,
      amount: 120000,
      wallet: 'ShopeePay',
      notes: 'Tiket nonton bioskop akhir pekan',
      createdAt: Date.now() - 200000,
    },
  ];
}

export function loadCategoriesFromStorage(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      saveCategoriesToStorage(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CATEGORIES;
  } catch (err) {
    console.error('Error loading categories from storage:', err);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategoriesToStorage(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories to storage:', err);
  }
}

export function loadTransactionsFromStorage(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      const cats = loadCategoriesFromStorage();
      const seed = generateSeedTransactions(cats);
      saveTransactionsToStorage(seed);
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Error loading transactions from storage:', err);
    return [];
  }
}

export function saveTransactionsToStorage(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to storage:', err);
  }
}

export interface BackupData {
  appName: string;
  version: string;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
}

export function exportBackupData(): void {
  const transactions = loadTransactionsFromStorage();
  const categories = loadCategoriesFromStorage();
  const data: BackupData = {
    appName: 'BukuKas Rupiah',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `bukukas-rupiah-backup-${getTodayDateString()}.json`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importBackupData(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
      return { success: false, count: 0, error: 'Format berkas cadangan JSON tidak valid.' };
    }

    saveTransactionsToStorage(data.transactions);
    saveCategoriesToStorage(data.categories);
    return { success: true, count: data.transactions.length };
  } catch (err) {
    return { success: false, count: 0, error: 'Gagal membaca berkas JSON: ' + (err instanceof Error ? err.message : String(err)) };
  }
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEY_CATEGORIES);
  saveCategoriesToStorage(DEFAULT_CATEGORIES);
  const seeds = generateSeedTransactions(DEFAULT_CATEGORIES);
  saveTransactionsToStorage(seeds);
}
