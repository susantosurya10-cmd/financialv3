import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Radio, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';
import { getActiveBookId, setActiveBookId } from '../utils/storage';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBookId: string;
  onBookIdChanged: (newBookId: string) => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  currentBookId,
  onBookIdChanged,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputBookId, setInputBookId] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen) return null;

  // Generate shareable link
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareableUrl = `${currentUrl}?buku=${encodeURIComponent(currentBookId)}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSwitchBook = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputBookId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) return;

    setActiveBookId(clean);
    onBookIdChanged(clean);
    setIsSwitching(false);
    setInputBookId('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Sinkronisasi Antar Perangkat Realtime
              </h3>
              <p className="text-xs text-slate-500">
                Buka di HP dan Laptop sekaligus tanpa perlu login akun
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

        <div className="mt-4 space-y-4">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Otomatis Tersinkronisasi Langsung (Live Sync)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800/90">
              Setiap kali Anda menambah atau mengedit transaksi di HP, layar di laptop atau perangkat lain akan <strong>langsung berganti secara otomatis</strong> dalam 1 detik.
            </p>
          </div>

          {/* Active Book Identifier */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Kode / ID Buku Kas Saat Ini:
              </span>
              <button
                onClick={() => setIsSwitching(!isSwitching)}
                className="text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer"
              >
                {isSwitching ? 'Batal' : 'Ganti Kode / Masuk Buku Lain'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold font-mono text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                {currentBookId}
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Cloud Terhubung
              </span>
            </div>

            {/* Switch Book Form */}
            {isSwitching && (
              <form onSubmit={handleSwitchBook} className="mt-3 pt-3 border-t border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masukkan Kode Buku Kas (misal: keluarga-surya, toko-jaya):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputBookId}
                    onChange={(e) => setInputBookId(e.target.value)}
                    placeholder="nama-buku-atau-kode"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Buka
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Step 1: Copy Link for Phone / Other Device */}
          <div className="p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Cara Buka di HP atau Perangkat Lain:</span>
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Kirim tautan ini via WhatsApp / pesan ke HP Anda, lalu buka di browser HP. Anda tidak perlu mendaftar atau login akun.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-700 select-all"
              />
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
              </button>
            </div>
          </div>
        </div>

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
