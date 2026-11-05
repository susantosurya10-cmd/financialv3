import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Check, Tag } from 'lucide-react';
import { Category, TransactionType } from '../types/finance';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#059669', // Emerald
  '#10b981', // Green
  '#0284c7', // Sky blue
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#d946ef', // Fuchsia
  '#e11d48', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#d97706', // Amber
  '#14b8a6', // Teal
  '#64748b', // Slate
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Nama kategori tidak boleh kosong.');
      return;
    }
    // Check duplicate
    const exists = categories.some(
      (c) => c.type === activeTab && c.name.toLowerCase() === newName.trim().toLowerCase()
    );
    if (exists) {
      setError(`Kategori "${newName.trim()}" sudah ada.`);
      return;
    }

    onAddCategory({
      name: newName.trim(),
      type: activeTab,
      color: newColor,
    });

    setNewName('');
    setError('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleSaveEdit = (cat: Category) => {
    if (!editName.trim()) return;
    onUpdateCategory({
      ...cat,
      name: editName.trim(),
      color: editColor,
    });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Kustomisasi Kategori Keuangan
              </h3>
              <p className="text-xs text-slate-500">
                Atur pos pengeluaran dan sumber pemasukan sesuai kebutuhan Anda
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

        {/* Segmented Tab */}
        <div className="flex p-1 bg-slate-100 rounded-xl my-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('expense');
              setError('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pos Pengeluaran ({categories.filter((c) => c.type === 'expense').length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('income');
              setError('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sumber Pemasukan ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleCreate} className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tambah Kategori {activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'} Baru
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: Skincare, Katering, Donasi..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            {/* Color Palette Picker */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 sm:py-0">
              {PRESET_COLORS.slice(0, 6).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setNewColor(col)}
                  className={`w-6 h-6 rounded-full shrink-0 transition-transform cursor-pointer ${
                    newColor === col ? 'scale-125 ring-2 ring-slate-800' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
          {error && <p className="text-[11px] text-rose-600 mt-1.5">{error}</p>}
        </form>

        {/* Categories List */}
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
          {filteredCategories.map((cat) => {
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 group hover:bg-slate-50/80 px-2 py-1.5 rounded-lg transition-colors"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-white border border-emerald-400 rounded-md focus:outline-hidden"
                      autoFocus
                    />
                    <div className="flex items-center gap-1">
                      {PRESET_COLORS.slice(0, 5).map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setEditColor(col)}
                          className={`w-4 h-4 rounded-full ${
                            editColor === col ? 'ring-2 ring-slate-800' : ''
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleSaveEdit(cat)}
                      className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-800">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        title="Ubah Nama"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
