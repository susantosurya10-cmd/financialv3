import React from 'react';
import { ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { MonthlyStats } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface CategoryBreakdownChartProps {
  stats: MonthlyStats;
  onSelectCategoryFilter?: (categoryId: string) => void;
  selectedCategoryFilter?: string | null;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  stats,
  onSelectCategoryFilter,
  selectedCategoryFilter,
}) => {
  const hasExpenses = stats.expenseCategories.length > 0;
  const hasIncomes = stats.incomeCategories.length > 0;

  return (
    <div className="space-y-6">
      {/* Visual Cashflow Balance Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Perbandingan Arus Kas Bulanan
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Pemasukan: {formatRupiah(stats.totalIncome)}
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              Pengeluaran: {formatRupiah(stats.totalExpense)}
            </span>
          </div>
        </div>

        {/* Ratio Stacked Bar */}
        {stats.totalIncome + stats.totalExpense > 0 ? (
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
            {stats.totalIncome > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${(stats.totalIncome / (stats.totalIncome + stats.totalExpense)) * 100}%`,
                }}
                title={`Pemasukan: ${((stats.totalIncome / (stats.totalIncome + stats.totalExpense)) * 100).toFixed(1)}%`}
              />
            )}
            {stats.totalExpense > 0 && (
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{
                  width: `${(stats.totalExpense / (stats.totalIncome + stats.totalExpense)) * 100}%`,
                }}
                title={`Pengeluaran: ${((stats.totalExpense / (stats.totalIncome + stats.totalExpense)) * 100).toFixed(1)}%`}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-3.5 bg-slate-100 rounded-full text-center text-xs text-slate-400">
            Belum ada transaksi di bulan ini
          </div>
        )}
      </div>

      {/* Grid: Pengeluaran untuk apa saja & Pemasukan dari mana saja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Pengeluaran Untuk Apa Saja */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pengeluaran Untuk Apa Saja
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rincian alokasi belanja & pos dana bulanan
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 font-mono tabular-nums">
                {formatRupiah(stats.totalExpense)}
              </span>
            </div>

            {hasExpenses ? (
              <div className="space-y-3.5">
                {stats.expenseCategories.map((item) => {
                  const isSelected = selectedCategoryFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectCategoryFilter?.(item.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-rose-300 bg-rose-50/60 ring-1 ring-rose-300'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                          <span className="text-slate-400 font-normal">
                            ({item.count}x transaksi)
                          </span>
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {formatRupiah(item.total)}
                          </span>
                          <span className="text-slate-500 ml-1.5 font-mono tabular-nums">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Distribution progress bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada data pengeluaran untuk bulan yang dipilih.
              </div>
            )}
          </div>

          {selectedCategoryFilter && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-600">Filter aktif berdasarkan kategori</span>
              <button
                onClick={() => onSelectCategoryFilter?.('')}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Hapus Filter Kategori
              </button>
            </div>
          )}
        </div>

        {/* Kolom 2: Pemasukan Dari Mana Saja */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pemasukan Dari Mana Saja
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rincian sumber pendapatan & penghasilan
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 font-mono tabular-nums">
                {formatRupiah(stats.totalIncome)}
              </span>
            </div>

            {hasIncomes ? (
              <div className="space-y-3.5">
                {stats.incomeCategories.map((item) => {
                  const isSelected = selectedCategoryFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectCategoryFilter?.(item.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-50/60 ring-1 ring-emerald-300'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                          <span className="text-slate-400 font-normal">
                            ({item.count}x transaksi)
                          </span>
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {formatRupiah(item.total)}
                          </span>
                          <span className="text-slate-500 ml-1.5 font-mono tabular-nums">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Distribution progress bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada data pemasukan untuk bulan yang dipilih.
              </div>
            )}
          </div>

          {selectedCategoryFilter && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-600">Filter aktif berdasarkan kategori</span>
              <button
                onClick={() => onSelectCategoryFilter?.('')}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Hapus Filter Kategori
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
