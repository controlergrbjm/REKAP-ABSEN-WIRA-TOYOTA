import React, { useState } from 'react';
import { Branch } from '../types';
import { X, Building2, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface BranchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  currentBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
  onAddBranch: (name: string, code: string) => void;
  onUpdateBranch: (id: string, name: string, code: string) => void;
  onDeleteBranch: (id: string) => void;
}

export const BranchSettingsModal: React.FC<BranchSettingsModalProps> = ({
  isOpen,
  onClose,
  branches,
  currentBranch,
  onSelectBranch,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    onAddBranch(newName.trim(), newCode.trim());
    setNewName('');
    setNewCode('');
    setIsAdding(false);
  };

  const startEdit = (b: Branch) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditCode(b.code);
  };

  const saveEdit = (id: string) => {
    onUpdateBranch(id, editName.trim(), editCode.trim());
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#C00000] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Kelola Cabang Bengkel</h2>
              <p className="text-xs text-gray-500">Multi-cabang WIRA Toyota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List branches */}
        <div className="py-4 space-y-2 max-h-72 overflow-y-auto">
          {branches.map((b) => {
            const isCurrent = currentBranch?.id === b.id;
            const isEditing = editingId === b.id;

            return (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'border-[#C00000] bg-red-50/40'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 border rounded-lg"
                      placeholder="Nama Cabang"
                    />
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="w-24 text-xs px-2.5 py-1.5 border rounded-lg uppercase"
                      placeholder="Kode"
                    />
                    <button
                      onClick={() => saveEdit(b.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => onSelectBranch(b)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{b.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                          {b.code}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-[#C00000]">
                            (Aktif)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(b)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        title="Ubah"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {branches.length > 1 && (
                        <button
                          onClick={() => onDeleteBranch(b.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Branch Form */}
        {isAdding ? (
          <form onSubmit={handleAdd} className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="text-xs font-bold text-gray-800 mb-2">Tambah Cabang Baru</div>
            <div className="space-y-2 mb-3">
              <input
                type="text"
                required
                placeholder="Nama Cabang (misal: WIRA BANJARBARU)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Kode Cabang (misal: GR BJB)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-xl uppercase"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#C00000] text-white rounded-lg hover:bg-[#8B0000]"
              >
                Simpan
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:border-[#C00000] hover:text-[#C00000] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang Baru</span>
          </button>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
