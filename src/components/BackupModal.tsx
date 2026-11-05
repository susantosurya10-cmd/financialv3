import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportBackupData, importBackupData, resetAllDataToDefault } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      exportBackupData();
      setStatusMessage({
        type: 'success',
        text: 'File cadangan JSON berhasil diunduh ke perangkat Anda.',
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Gagal mengekspor file cadangan.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupData(content);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Berhasil memulihkan ${res.count} catatan transaksi dan seluruh kategori kustom.`,
        });
        onDataChanged();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Gagal memulihkan file cadangan.',
        });
      }
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Terjadi kesalahan saat membaca file.',
      });
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    resetAllDataToDefault();
    setShowResetConfirm(false);
    setStatusMessage({
      type: 'success',
      text: 'Data telah direset ke contoh bawaan awal.',
    });
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Cadangan & Keamanan Data
              </h3>
              <p className="text-xs text-slate-500">
                Kelola file cadangan untuk memindahkan data antar perangkat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-start gap-2.5 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Penyimpanan Otomatis & Aman Tanpa Akun
          </p>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Semua catatan keuangan Anda disimpan seketika di peramban (browser) perangkat ini. Anda dapat mengunduh berkas cadangan kapan pun untuk disimpan di Google Drive, flashdisk, atau dipulihkan di HP/laptop lain.
          </p>
        </div>

        {/* Actions Grid */}
        <div className="mt-5 space-y-3">
          {/* 1. Export Data */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Cadangkan Data (Export JSON)
              </h4>
              <p className="text-xs text-slate-500">
                Unduh file data lengkap seluruh transaksi dan kategori
              </p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File</span>
            </button>
          </div>

          {/* 2. Import Data */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Pulihkan Data (Import JSON)
              </h4>
              <p className="text-xs text-slate-500">
                Unggah file cadangan JSON dari perangkat Anda
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File</span>
              </button>
            </div>
          </div>

          {/* 3. Reset Data */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Reset ke Data Awal
              </h4>
              <p className="text-xs text-slate-500">
                Kembalikan data ke contoh transaksi pembukuan awal
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Reset Confirmation Prompt */}
        {showResetConfirm && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <h5 className="text-xs font-bold text-rose-900 mb-1">
              Konfirmasi Reset Data
            </h5>
            <p className="text-xs text-rose-700 mb-3">
              Tindakan ini akan menghapus data yang telah Anda tambahkan dan menggantinya dengan contoh awal. Lanjutkan?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
