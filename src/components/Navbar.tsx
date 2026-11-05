import React from 'react';
import { Plus, Wallet, BarChart3, ReceiptText, Tag, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'transactions' | 'categories' | 'backup';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'categories' | 'backup') => void;
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSyncModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left cursor-pointer group"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                BukuKas <span className="text-emerald-600">Rupiah</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Rekap Bulanan</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'transactions'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ReceiptText className="w-4 h-4 text-emerald-600" />
              <span>Catatan Harian</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'categories'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Custom Kategori</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'backup'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Cadangan Data</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Multi-Device Sync */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={onOpenSyncModal}
              title="Hubungkan ke HP atau Laptop lain"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Buka di HP / Multi-Device</span>
              <span className="sm:hidden">Sync HP</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Catat</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
              activeTab === 'dashboard' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Rekap</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
              activeTab === 'transactions' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Harian</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
              activeTab === 'categories' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Kategori</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
              activeTab === 'backup' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Cadangan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
