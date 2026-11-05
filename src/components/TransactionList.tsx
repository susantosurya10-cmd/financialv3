import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Plus, Download } from 'lucide-react';
import { Category, Transaction } from '../types/finance';
import { formatDateShort, formatRupiah, MONTH_NAMES_ID } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: number;
  selectedYear: number;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDownloadPdf: () => void;
  selectedCategoryFilter?: string | null;
  onSelectCategoryFilter?: (categoryId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  selectedMonth,
  selectedYear,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onDownloadPdf,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const monthName = MONTH_NAMES_ID[selectedMonth];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter && tx.categoryId !== selectedCategoryFilter && tx.categoryName !== selectedCategoryFilter) {
        return false;
      }

      // Search query (notes, category, wallet)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNotes = (tx.notes || '').toLowerCase().includes(query);
        const matchCategory = (tx.categoryName || '').toLowerCase().includes(query);
        const matchWallet = (tx.wallet || '').toLowerCase().includes(query);
        const matchAmount = tx.amount.toString().includes(query);
        if (!matchNotes && !matchCategory && !matchWallet && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, selectedCategoryFilter, searchQuery]);

  // Sort descending by date, then by creation time
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [filteredTransactions]);

  const handleDelete = (id: string) => {
    onDeleteTransaction(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Filter Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Transaksi Harian
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan transaksi bulan <strong className="text-slate-800">{monthName} {selectedYear}</strong> ({sortedTransactions.length} transaksi)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor PDF</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baru</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi (keterangan, nominal, dompet)..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Segmented Type Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategoryFilter || ''}
              onChange={(e) => onSelectCategoryFilter?.(e.target.value)}
              className="py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              <optgroup label="Pengeluaran">
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Pemasukan">
                {categories
                  .filter((c) => c.type === 'income')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {sortedTransactions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-32">Tanggal</th>
                <th className="py-3 px-4 w-44">Kategori</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 w-36">Dompet/Akun</th>
                <th className="py-3 px-4 text-right w-40">Nominal</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {sortedTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Tanggal */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {formatDateShort(tx.date)}
                    </td>

                    {/* Kategori */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="font-medium text-slate-900 truncate max-w-[140px]">
                          {tx.categoryName}
                        </span>
                      </div>
                    </td>

                    {/* Keterangan */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <p className="line-clamp-1">{tx.notes || '-'}</p>
                    </td>

                    {/* Dompet/Akun */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700">
                        {tx.wallet || 'Kas Fisik'}
                      </span>
                    </td>

                    {/* Nominal */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums font-bold">
                      <span
                        className={
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Ubah Transaksi"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(tx.id)}
                          title="Hapus Transaksi"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1">
              Tidak Ada Transaksi Ditemukan
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery || selectedCategoryFilter || typeFilter !== 'all'
                ? 'Tidak ada data yang cocok dengan filter atau kata kunci pencarian.'
                : `Belum ada catatan keuangan untuk bulan ${monthName} ${selectedYear}. Tambahkan catatan transaksi harian pertama Anda.`}
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi Sekarang</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-2">
              Hapus Catatan Transaksi?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Apakah Anda yakin ingin menghapus data transaksi ini? Data yang dihapus tidak dapat dipulihkan kembali.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
