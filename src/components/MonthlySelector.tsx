import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, ArrowDownToLine } from 'lucide-react';
import { MONTH_NAMES_ID } from '../utils/formatters';

interface MonthlySelectorProps {
  selectedMonth: number; // 0-11
  selectedYear: number;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
}

export const MonthlySelector: React.FC<MonthlySelectorProps> = ({
  selectedMonth,
  selectedYear,
  onSelectMonth,
  onSelectYear,
  onDownloadPdf,
  isDownloadingPdf = false,
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onSelectMonth(11);
      onSelectYear(selectedYear - 1);
    } else {
      onSelectMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onSelectMonth(0);
      onSelectYear(selectedYear + 1);
    } else {
      onSelectMonth(selectedMonth + 1);
    }
  };

  const handleResetToCurrent = () => {
    onSelectMonth(currentMonth);
    onSelectYear(currentYear);
  };

  // Generate range of available years (e.g. currentYear - 4 to currentYear + 1)
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Month Navigation Control */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              {/* Month Dropdown */}
              <select
                value={selectedMonth}
                onChange={(e) => onSelectMonth(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                {MONTH_NAMES_ID.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={selectedYear}
                onChange={(e) => onSelectYear(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={handleResetToCurrent}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
            >
              Kembali ke Bulan Ini
            </button>
          )}
        </div>

        {/* PDF Download Button & Period Label */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Rekap Keuangan: <strong className="text-slate-800">{MONTH_NAMES_ID[selectedMonth]} {selectedYear}</strong>
          </span>

          <button
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors shadow-2xs whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            <span>{isDownloadingPdf ? 'Menyiapkan PDF...' : 'Unduh Laporan PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
