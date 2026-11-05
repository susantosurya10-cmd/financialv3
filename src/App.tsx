/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MonthlySelector } from './components/MonthlySelector';
import { SummaryCards } from './components/SummaryCards';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BackupModal } from './components/BackupModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { Category, Transaction } from './types/finance';
import {
  loadCategoriesFromStorage,
  loadTransactionsFromStorage,
  saveCategoriesToStorage,
  saveTransactionsToStorage,
  getActiveBookId,
  setActiveBookId,
  fetchLedgerFromServer,
  pushLedgerToServer,
} from './utils/storage';
import { computeMonthlyStats, filterTransactionsByMonth } from './utils/calculator';
import { generateMonthlyReportPdf } from './utils/pdfGenerator';
import { CheckCircle2, Shield, Heart, Radio, Smartphone } from 'lucide-react';
import { MONTH_NAMES_ID } from './utils/formatters';

export default function App() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'categories' | 'backup'>('dashboard');

  const [currentBookId, setCurrentBookId] = useState<string>(getActiveBookId());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Sync state
  const lastModifiedRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(true);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Initial load: fast local cache first, then fetch latest from cloud server
  const reloadData = useCallback(async (bookId: string) => {
    // 1. Read from local storage cache for instant UI
    const cachedCats = loadCategoriesFromStorage();
    const cachedTx = loadTransactionsFromStorage();
    if (cachedCats.length > 0) setCategories(cachedCats);
    if (cachedTx.length > 0) setTransactions(cachedTx);

    // 2. Fetch fresh data from sync server
    try {
      const serverData = await fetchLedgerFromServer(bookId);
      if (serverData && serverData.success) {
        setCategories(serverData.categories);
        setTransactions(serverData.transactions);
        lastModifiedRef.current = serverData.lastModified;
      }
    } catch (err) {
      console.warn('Sync server initial fetch failed, using local cache:', err);
    }
  }, []);

  useEffect(() => {
    reloadData(currentBookId);
  }, [currentBookId, reloadData]);

  // Realtime long-polling listener: whenever ANY device modifies this book, update instantly!
  useEffect(() => {
    isPollingRef.current = true;
    let abortController = new AbortController();

    async function poll() {
      while (isPollingRef.current) {
        try {
          const res = await fetch(
            `/api/ledger/${encodeURIComponent(currentBookId)}/poll?since=${lastModifiedRef.current}`,
            { signal: abortController.signal }
          );

          if (res.ok) {
            const data = await res.json();
            if (data.modified && isPollingRef.current) {
              setTransactions(data.transactions);
              setCategories(data.categories);
              lastModifiedRef.current = data.lastModified;
              saveTransactionsToStorage(data.transactions);
              saveCategoriesToStorage(data.categories);
              showToast('Data otomatis tersinkronisasi dari perangkat lain!');
            }
          }
        } catch (err: any) {
          if (err.name === 'AbortError') break;
          // Wait 2 seconds before retrying on network hiccup
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }

    poll();

    // Also poll immediately when tab regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reloadData(currentBookId);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isPollingRef.current = false;
      abortController.abort();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentBookId, reloadData, showToast]);

  // Compute monthly statistics
  const currentMonthStats = useMemo(() => {
    return computeMonthlyStats(transactions, categories, selectedMonth, selectedYear);
  }, [transactions, categories, selectedMonth, selectedYear]);

  // Transactions for the currently selected month
  const currentMonthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth, selectedYear);
  }, [transactions, selectedMonth, selectedYear]);

  // Handle Save / Update Transaction
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Transaction[];

    if (existingId) {
      updated = transactions.map((t) =>
        t.id === existingId ? { ...t, ...txData } : t
      );
      showToast('Transaksi berhasil diperbarui.');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: Date.now(),
      };
      updated = [newTx, ...transactions];
      showToast('Transaksi baru berhasil dicatat!');

      // If added transaction is in a different month, switch view to that month so the user sees it immediately
      const [txY, txM] = txData.date.split('-').map(Number);
      if (txY && txM) {
        setSelectedYear(txY);
        setSelectedMonth(txM - 1);
      }
    }

    setTransactions(updated);
    saveTransactionsToStorage(updated);
    setEditingTransaction(null);

    // Push to server to notify other devices immediately
    pushLedgerToServer(currentBookId, updated, categories);
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactionsToStorage(updated);
    showToast('Catatan transaksi telah dihapus.');

    // Push to server
    pushLedgerToServer(currentBookId, updated, categories);
  };

  // Handle Category Add
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const cat: Category = {
      ...newCat,
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    const updated = [...categories, cat];
    setCategories(updated);
    saveCategoriesToStorage(updated);
    showToast(`Kategori "${cat.name}" berhasil ditambahkan.`);

    pushLedgerToServer(currentBookId, transactions, updated);
  };

  // Handle Category Update
  const handleUpdateCategory = (updatedCat: Category) => {
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    saveCategoriesToStorage(updated);

    const updatedTx = transactions.map((t) => {
      if (t.categoryId === updatedCat.id) {
        return { ...t, categoryName: updatedCat.name };
      }
      return t;
    });
    setTransactions(updatedTx);
    saveTransactionsToStorage(updatedTx);

    showToast(`Kategori "${updatedCat.name}" diperbarui.`);
    pushLedgerToServer(currentBookId, updatedTx, updated);
  };

  // Handle Category Delete
  const handleDeleteCategory = (catId: string) => {
    const inUse = transactions.some((t) => t.categoryId === catId);
    if (inUse) {
      if (!window.confirm('Kategori ini sedang digunakan oleh beberapa transaksi. Yakin ingin menghapusnya?')) {
        return;
      }
    }
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    saveCategoriesToStorage(updated);
    if (selectedCategoryFilter === catId) {
      setSelectedCategoryFilter(null);
    }
    showToast('Kategori telah dihapus.');
    pushLedgerToServer(currentBookId, transactions, updated);
  };

  // Handle Book ID Change
  const handleBookIdChange = (newBookId: string) => {
    setCurrentBookId(newBookId);
    setActiveBookId(newBookId);
    reloadData(newBookId);
    showToast(`Buku Kas dialihkan ke: ${newBookId}`);
  };

  // Handle PDF Export
  const handleDownloadPdf = () => {
    try {
      setIsDownloadingPdf(true);
      generateMonthlyReportPdf({
        stats: currentMonthStats,
        transactions: currentMonthTransactions,
        month: selectedMonth,
        year: selectedYear,
      });
      showToast(`Laporan PDF bulan ${MONTH_NAMES_ID[selectedMonth]} ${selectedYear} berhasil diunduh!`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Gagal membuat file PDF. Silakan coba kembali.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsTxModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Cloud Sync Information Bar */}
      <div className="bg-emerald-50 border-b border-emerald-100 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>
              Sinkronisasi Cloud Realtime Aktif: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{currentBookId}</strong>
            </span>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="text-emerald-700 hover:text-emerald-950 font-semibold underline flex items-center gap-1 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Buka / Sambungkan di HP Anda</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Month Selector is always accessible at top */}
        <MonthlySelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onSelectMonth={setSelectedMonth}
          onSelectYear={setSelectedYear}
          onDownloadPdf={handleDownloadPdf}
          isDownloadingPdf={isDownloadingPdf}
        />

        {/* Tab 1: Dashboard / Rekap Bulanan */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <SummaryCards stats={currentMonthStats} />

            {/* Pengeluaran untuk apa saja & Pemasukan dari mana saja */}
            <CategoryBreakdownChart
              stats={currentMonthStats}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={(catId) => {
                setSelectedCategoryFilter(catId === selectedCategoryFilter ? null : catId);
              }}
            />

            {/* Riwayat Transaksi Harian Bulan Ini */}
            <TransactionList
              transactions={currentMonthTransactions}
              categories={categories}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onDownloadPdf={handleDownloadPdf}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
            />
          </div>
        )}

        {/* Tab 2: Catatan Harian (Focused View) */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <SummaryCards stats={currentMonthStats} />
            <TransactionList
              transactions={currentMonthTransactions}
              categories={categories}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onDownloadPdf={handleDownloadPdf}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
            />
          </div>
        )}

        {/* Tab 3: Custom Kategori View */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Manajemen Kategori Finansial
                </h2>
                <p className="text-xs text-slate-500">
                  Kustomisasi pos belanja dan sumber pemasukan sesuai gaya hidup keluarga Anda
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                + Tambah Kategori
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expense Categories */}
              <div>
                <h3 className="text-sm font-bold text-rose-700 mb-3 flex items-center justify-between">
                  <span>Pos Pengeluaran</span>
                  <span className="text-xs font-normal text-slate-400">
                    {categories.filter((c) => c.type === 'expense').length} kategori
                  </span>
                </h3>
                <div className="space-y-2">
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-slate-800">{cat.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Income Categories */}
              <div>
                <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center justify-between">
                  <span>Sumber Pemasukan</span>
                  <span className="text-xs font-normal text-slate-400">
                    {categories.filter((c) => c.type === 'income').length} kategori
                  </span>
                </h3>
                <div className="space-y-2">
                  {categories
                    .filter((c) => c.type === 'income')
                    .map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-slate-800">{cat.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Cadangan Data View */}
        {activeTab === 'backup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Penyimpanan & Cadangan Mandiri
                  </h2>
                  <p className="text-xs text-slate-500">
                    Data Anda tersinkronisasi otomatis di cloud tanpa perlu password atau akun
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Aplikasi ini menggunakan sistem <strong>Sinkronisasi Cloud Realtime</strong> berbasis Kode Buku Kas (<strong>{currentBookId}</strong>). Saat Anda menambah atau mengubah transaksi di HP, layar laptop akan otomatis berubah dalam 1 detik. Anda juga dapat mengunduh berkas cadangan offline berformat JSON kapan saja.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Buka Tautan Akses untuk HP
                </button>
                <button
                  onClick={() => setIsBackupModalOpen(true)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Ekspor / Impor File JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">BukuKas Rupiah</span>
            <span>·</span>
            <span>Laporan Keuangan Harian & Rekap Bulanan Realtime</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Privat & Aman</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              Dibuat dengan <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> untuk keluarga Indonesia
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        initialTransaction={editingTransaction}
        onOpenCategoryManager={() => {
          setIsTxModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={() => reloadData(currentBookId)}
      />

      <DeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentBookId={currentBookId}
        onBookIdChanged={handleBookIdChange}
      />
    </div>
  );
}
