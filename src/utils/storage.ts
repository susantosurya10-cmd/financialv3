import { Category, Transaction } from '../types/finance';
import { getTodayDateString } from './formatters';

const STORAGE_KEY_TRANSACTIONS = 'bukukas_rupiah_transactions_v1';
const STORAGE_KEY_CATEGORIES = 'bukukas_rupiah_categories_v1';
const STORAGE_KEY_BOOK_ID = 'bukukas_active_book_id';

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'exp-1', name: 'Makan & Minum', type: 'expense', color: '#f97316' },
  { id: 'exp-2', name: 'Belanja Harian & Sayur', type: 'expense', color: '#10b981' },
  { id: 'exp-3', name: 'Listrik, Air & WiFi', type: 'expense', color: '#06b6d4' },
  { id: 'exp-4', name: 'Transportasi & Bensin', type: 'expense', color: '#3b82f6' },
  { id: 'exp-5', name: 'Kesehatan & Obat', type: 'expense', color: '#ef4444' },
  { id: 'exp-6', name: 'Pendidikan & Kursus', type: 'expense', color: '#8b5cf6' },
  { id: 'exp-7', name: 'Hiburan & Rekreasi', type: 'expense', color: '#ec4899' },
  { id: 'exp-8', name: 'Cicilan & Tagihan', type: 'expense', color: '#64748b' },
  { id: 'exp-9', name: 'Zakat, Infaq & Sosial', type: 'expense', color: '#14b8a6' },
  { id: 'exp-10', name: 'Kebutuhan Rumah Tangga', type: 'expense', color: '#d97706' },
  { id: 'exp-11', name: 'Pengeluaran Lainnya', type: 'expense', color: '#94a3b8' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'inc-1', name: 'Gaji Bulanan', type: 'income', color: '#059669' },
  { id: 'inc-2', name: 'Bonus & THR', type: 'income', color: '#10b981' },
  { id: 'inc-3', name: 'Bisnis & Jualan', type: 'income', color: '#0284c7' },
  { id: 'inc-4', name: 'Freelance & Sampingan', type: 'income', color: '#7c3aed' },
  { id: 'inc-5', name: 'Investasi & Dividen', type: 'income', color: '#0d9488' },
  { id: 'inc-6', name: 'Transfer & Hadiah', type: 'income', color: '#d946ef' },
  { id: 'inc-7', name: 'Pemasukan Lainnya', type: 'income', color: '#64748b' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

/**
 * Get or determine the active Book ID (shared across devices via URL or local memory)
 */
export function getActiveBookId(): string {
  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlBook = urlParams.get('buku');
      if (urlBook && urlBook.trim()) {
        const clean = urlBook.trim().toLowerCase();
        localStorage.setItem(STORAGE_KEY_BOOK_ID, clean);
        return clean;
      }
      const saved = localStorage.getItem(STORAGE_KEY_BOOK_ID);
      if (saved && saved.trim()) {
        return saved.trim().toLowerCase();
      }
    }
  } catch (err) {
    console.error('Error getting bookId:', err);
  }
  return 'kas-utama';
}

export function setActiveBookId(bookId: string): void {
  const clean = (bookId || 'kas-utama').trim().toLowerCase();
  try {
    localStorage.setItem(STORAGE_KEY_BOOK_ID, clean);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('buku', clean);
      window.history.replaceState({}, '', url.toString());
    }
  } catch (err) {
    console.error('Error saving active book id:', err);
  }
}

/**
 * Load categories from local storage cache
 */
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
    console.error('Error loading categories:', err);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategoriesToStorage(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

/**
 * Load transactions from local storage cache
 */
export function loadTransactionsFromStorage(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (err) {
    console.error('Error loading transactions:', err);
    return [];
  }
}

export function saveTransactionsToStorage(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions:', err);
  }
}

// -------------------------------------------------------------
// Realtime Cloud Server Sync Engine
// -------------------------------------------------------------

export interface ServerSyncResponse {
  success: boolean;
  bookId: string;
  lastModified: number;
  transactions: Transaction[];
  categories: Category[];
}

export async function fetchLedgerFromServer(bookId: string): Promise<ServerSyncResponse | null> {
  try {
    const res = await fetch(`/api/ledger/${encodeURIComponent(bookId)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data && data.success) {
      saveTransactionsToStorage(data.transactions);
      saveCategoriesToStorage(data.categories);
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Could not reach sync server (offline or local fallback):', err);
    return null;
  }
}

export async function pushLedgerToServer(
  bookId: string,
  transactions: Transaction[],
  categories: Category[]
): Promise<boolean> {
  try {
    const res = await fetch(`/api/ledger/${encodeURIComponent(bookId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, categories }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not push ledger to sync server:', err);
    return false;
  }
}

export interface BackupData {
  appName: string;
  version: string;
  bookId: string;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
}

export function exportBackupData(): void {
  const transactions = loadTransactionsFromStorage();
  const categories = loadCategoriesFromStorage();
  const bookId = getActiveBookId();
  const data: BackupData = {
    appName: 'BukuKas Rupiah',
    version: '1.0',
    bookId,
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `bukukas-${bookId}-${getTodayDateString()}.json`;
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
    const bookId = getActiveBookId();
    pushLedgerToServer(bookId, data.transactions, data.categories);

    return { success: true, count: data.transactions.length };
  } catch (err) {
    return { success: false, count: 0, error: 'Gagal membaca berkas JSON: ' + (err instanceof Error ? err.message : String(err)) };
  }
}

export function resetAllDataToDefault(): void {
  saveCategoriesToStorage(DEFAULT_CATEGORIES);
  saveTransactionsToStorage([]);
  const bookId = getActiveBookId();
  pushLedgerToServer(bookId, [], DEFAULT_CATEGORIES);
}

