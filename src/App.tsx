/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MonthlySelector } from './components/MonthlySelector';
import { SummaryCards } from './components/SummaryCards';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BackupModal } from './components/BackupModal';
import { Category, Transaction } from './types/finance';
import {
  loadCategoriesFromStorage,
  loadTransactionsFromStorage,
  saveCategoriesToStorage,
  saveTransactionsToStorage,
} from './utils/storage';
import { computeMonthlyStats, filterTransactionsByMonth } from './utils/calculator';
import { generateMonthlyReportPdf } from './utils/pdfGenerator';
import { CheckCircle2, Shield, Heart } from 'lucide-react';
import { MONTH_NAMES_ID } from './utils/formatters';

export default function App() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'categories' | 'backup'>('dashboard');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Initial load from localStorage
  const reloadData = useCallback(() => {
    const loadedCategories = loadCategoriesFromStorage();
    const loadedTransactions = loadTransactionsFromStorage();
    setCategories(loadedCategories);
    setTransactions(loadedTransactions);
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

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
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactionsToStorage(updated);
    showToast('Catatan transaksi telah dihapus.');
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
  };

  // Handle Category Update
  const handleUpdateCategory = (updatedCat: Category) => {
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    saveCategoriesToStorage(updated);

    // Also update any transactions with this category name
    const updatedTx = transactions.map((t) => {
      if (t.categoryId === updatedCat.id) {
        return { ...t, categoryName: updatedCat.name };
      }
      return t;
    });
    setTransactions(updatedTx);
    saveTransactionsToStorage(updatedTx);

    showToast(`Kategori "${updatedCat.name}" diperbarui.`);
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
      />

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
                    Data Anda tersimpan di browser secara terus-menerus tanpa perlu login
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Aplikasi ini tidak membutuhkan registrasi atau login akun sehingga privasi keuangan Anda terjaga 100%. Data tersimpan di memori peramban lokal perangkat. Agar data dapat dipindahkan ke ponsel atau komputer lain, gunakan tombol <strong>Cadangkan Data</strong> di bawah ini untuk mengunduh file JSON, lalu pilih <strong>Pulihkan Data</strong> di perangkat tujuan.
              </p>

              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Buka Panel Cadangan & Pulihkan Data
              </button>
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
            <span>Laporan Keuangan Harian & Rekap Bulanan</span>
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
        onDataChanged={reloadData}
      />
    </div>
  );
}
