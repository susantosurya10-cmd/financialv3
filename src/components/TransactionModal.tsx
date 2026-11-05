import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Plus, Tag } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types/finance';
import { formatRupiah, getTodayDateString, WALLET_PRESETS } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  categories: Category[];
  initialTransaction?: Transaction | null;
  onOpenCategoryManager: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialTransaction,
  onOpenCategoryManager,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [categoryId, setCategoryId] = useState<string>('');
  const [wallet, setWallet] = useState<string>('Tunai / Kas Fisik');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Available categories for selected type
  const availableCategories = categories.filter((c) => c.type === type);

  // Sync state when editing or opening
  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount);
      setAmountRaw(initialTransaction.amount.toString());
      setDate(initialTransaction.date);
      setCategoryId(initialTransaction.categoryId);
      setWallet(initialTransaction.wallet || 'Tunai / Kas Fisik');
      setNotes(initialTransaction.notes || '');
    } else {
      setType('expense');
      setAmount(0);
      setAmountRaw('');
      setDate(getTodayDateString());
      setWallet('Tunai / Kas Fisik');
      setNotes('');
      // Default to first available expense category
      const firstCat = categories.find((c) => c.type === 'expense');
      if (firstCat) setCategoryId(firstCat.id);
    }
    setError('');
  }, [initialTransaction, isOpen, categories]);

  // When type changes, switch category if current category belongs to different type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstMatching = categories.find((c) => c.type === newType);
    if (firstMatching) {
      setCategoryId(firstMatching.id);
    }
  };

  // Handle amount text change
  const handleAmountChange = (val: string) => {
    // Keep only digits
    const cleaned = val.replace(/\D/g, '');
    setAmountRaw(cleaned);
    const parsed = parseInt(cleaned, 10);
    setAmount(isNaN(parsed) ? 0 : parsed);
  };

  const handleAddQuickAmount = (addition: number) => {
    const newAmt = amount + addition;
    setAmount(newAmt);
    setAmountRaw(newAmt.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Harap masukkan nominal transaksi lebih dari 0.');
      return;
    }
    if (!categoryId) {
      setError('Harap pilih kategori transaksi.');
      return;
    }
    if (!date) {
      setError('Harap tentukan tanggal transaksi.');
      return;
    }

    const categoryObj = categories.find((c) => c.id === categoryId);
    const categoryName = categoryObj ? categoryObj.name : 'Lainnya';

    onSave(
      {
        date,
        type,
        categoryId,
        categoryName,
        amount,
        wallet,
        notes: notes.trim(),
      },
      initialTransaction ? initialTransaction.id : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialTransaction ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Harian'}
            </h3>
            <p className="text-xs text-slate-500">
              Simpan transaksi keuangan harian ke pembukuan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Segmented Type Toggle (Pengeluaran vs Pemasukan) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Nominal Rupiah Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nominal (Rupiah) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount > 0 ? amount.toLocaleString('id-ID') : amountRaw}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 text-lg font-bold text-slate-900 font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {/* Quick add shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 mr-1">Pintasan:</span>
              {[10000, 50000, 100000, 500000, 1000000].map((add) => (
                <button
                  key={add}
                  type="button"
                  onClick={() => handleAddQuickAmount(add)}
                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  +{formatRupiah(add).replace('Rp ', '')}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAmount(0);
                  setAmountRaw('');
                }}
                className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Grid: Tanggal & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Kategori */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} *
                </label>
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Tag className="w-3 h-3" />
                  <span>Kelola</span>
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dompet / Rekening / Metode Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dompet / Rekening / Akun Kas
            </label>
            <select
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {WALLET_PRESETS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Keterangan / Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Belanja mingguan pasar tradisional, makan siang, token PLN..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all shadow-xs cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {initialTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
