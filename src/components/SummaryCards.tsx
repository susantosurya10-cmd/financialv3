import React from 'react';
import { TrendingUp, TrendingDown, Scale, Hash } from 'lucide-react';
import { MonthlyStats } from '../types/finance';
import { formatRupiah, MONTH_NAMES_ID } from '../utils/formatters';

interface SummaryCardsProps {
  stats: MonthlyStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const isSurplus = stats.netBalance >= 0;
  const monthName = MONTH_NAMES_ID[stats.month];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pemasukan */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pemasukan
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
          {formatRupiah(stats.totalIncome)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="text-emerald-700 font-semibold">{stats.incomeCategories.length} sumber</span>
          <span>·</span>
          <span>Bulan {monthName}</span>
        </div>
      </div>

      {/* 2. Total Pengeluaran */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
          {formatRupiah(stats.totalExpense)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="text-rose-700 font-semibold">{stats.expenseCategories.length} pos</span>
          <span>·</span>
          <span>Bulan {monthName}</span>
        </div>
      </div>

      {/* 3. Saldo Bersih / Arus Kas */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saldo Bersih (Arus Kas)
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isSurplus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
            isSurplus ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {isSurplus ? '+' : '-'} {formatRupiah(Math.abs(stats.netBalance))}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span
            className={`font-semibold ${
              isSurplus ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isSurplus ? 'Surplus (Hemat)' : 'Defisit (Minus)'}
          </span>
          <span>·</span>
          <span>{stats.savingsRate}% tabungan</span>
        </div>
      </div>

      {/* 4. Total Transaksi */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Transaksi
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Hash className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
          {stats.transactionCount}{' '}
          <span className="text-sm font-normal text-slate-500">Catatan</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>Tercatat pada {monthName} {stats.year}</span>
        </div>
      </div>
    </div>
  );
};
