import React, { useState } from 'react';
import { Employee, Branch } from '../types';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Search,
  Check,
  X,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface MasterEmployeesProps {
  branch: Branch;
  employees: Employee[];
  onAddEmployee: (name: string, pin: string | null, position: string | null) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
  onReorderEmployees: (orderedIds: string[]) => void;
  onSeedStandardPositions: () => void;
  onClearAllEmployees?: () => void;
}

export const MasterEmployees: React.FC<MasterEmployeesProps> = ({
  branch,
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onReorderEmployees,
  onSeedStandardPositions,
  onClearAllEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; pin: string; position: string; sort_order: number }>({
    name: '',
    pin: '',
    position: '',
    sort_order: 1,
  });

  // Add new employee state
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', pin: '', position: '' });

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.position && e.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.pin && e.pin.includes(searchTerm))
  );

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({
      name: emp.name,
      pin: emp.pin || '',
      position: emp.position || '',
      sort_order: emp.sort_order,
    });
  };

  const saveEdit = (id: string) => {
    onUpdateEmployee(id, {
      name: editForm.name.trim(),
      pin: editForm.pin.trim() || null,
      position: editForm.position.trim() || null,
      sort_order: Number(editForm.sort_order),
    });
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;
    onAddEmployee(
      newForm.name.trim(),
      newForm.pin.trim() || null,
      newForm.position.trim() || null
    );
    setNewForm({ name: '', pin: '', position: '' });
    setIsAdding(false);
  };

  const moveEmployee = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= employees.length) return;

    const newOrder = [...employees];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    onReorderEmployees(newOrder.map((e) => e.id));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#C00000] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Master Data Karyawan
              </h1>
              <p className="text-xs text-gray-500">
                Cabang: <span className="font-semibold text-gray-700">{branch.name} ({branch.code})</span> • {employees.length} Karyawan Terdaftar
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onSeedStandardPositions}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
            title="Isi contoh susunan jabatan Toyota standar (Koordinator, Trainee Leader, SA, Foreman, Ptgs MRA)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Isi Template Jabatan Toyota</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C00000] hover:bg-[#8B0000] text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>

          {onClearAllEmployees && employees.length > 0 && (
            <button
              onClick={onClearAllEmployees}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
              title="Hapus semua karyawan cabang ini"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>Aturan Urutan Rekap:</strong> Urutan baris di rekap absensi mengikuti nomor urut (
          <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-bold">Urutan</code>) di bawah ini.
          Gunakan tombol panah naik/turun atau ubah nomor urut untuk mengelompokkan karyawan berdasarkan hierarki jabatan (Koordinator SP → Trainee Leader → Service Advisor → Ptgs MRA, dsb).
        </div>
      </div>

      {/* Add Modal / Section */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-red-50/50 border-2 border-red-200 rounded-3xl p-5 sm:p-6 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#8B0000] flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Karyawan Baru
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                placeholder="mis. AHMAD FAUZI"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C00000]/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                PIN / NIP (Mesin Absen)
              </label>
              <input
                type="text"
                placeholder="mis. 1024"
                value={newForm.pin}
                onChange={(e) => setNewForm({ ...newForm, pin: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C00000]/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Jabatan / Posisi Kerja
              </label>
              <input
                type="text"
                placeholder="mis. Service Advisor / Ptgs MRA"
                value={newForm.position}
                onChange={(e) => setNewForm({ ...newForm, position: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C00000]/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#C00000] hover:bg-[#8B0000] text-white rounded-xl shadow-sm"
            >
              Simpan Karyawan
            </button>
          </div>
        </form>
      )}

      {/* Employees Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, jabatan, atau PIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C00000]/20 text-gray-800"
            />
          </div>
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
            {filtered.length} Karyawan Ditampilkan
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100/80 text-gray-700 font-bold border-b border-gray-200">
                <th className="w-16 px-3 py-3 text-center">URUTAN</th>
                <th className="px-4 py-3">NAMA KARYAWAN</th>
                <th className="px-4 py-3">PIN / NIP</th>
                <th className="px-4 py-3">JABATAN</th>
                <th className="w-28 px-3 py-3 text-center">POSISI URUT</th>
                <th className="w-24 px-3 py-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Belum ada data karyawan. Upload file Excel mentahan di Rekap Absensi atau tambah manual.
                  </td>
                </tr>
              ) : (
                filtered.map((emp, index) => {
                  const isEditing = editingId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Urutan */}
                      <td className="px-3 py-3 text-center font-bold text-gray-500">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.sort_order}
                            onChange={(e) =>
                              setEditForm({ ...editForm, sort_order: parseInt(e.target.value) || 0 })
                            }
                            className="w-12 text-center border rounded py-1 text-xs"
                          />
                        ) : (
                          <span className="inline-block w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs leading-6 font-mono">
                            {emp.sort_order}
                          </span>
                        )}
                      </td>

                      {/* Nama */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full text-xs px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="font-bold text-gray-900">{emp.name}</div>
                        )}
                      </td>

                      {/* PIN */}
                      <td className="px-4 py-3 font-mono text-gray-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.pin}
                            onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                            className="w-24 text-xs px-2 py-1 border rounded font-mono"
                          />
                        ) : (
                          emp.pin || '-'
                        )}
                      </td>

                      {/* Jabatan */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.position}
                            onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                            className="w-full text-xs px-2 py-1 border rounded"
                          />
                        ) : (
                          <span
                            className={
                              emp.position
                                ? 'font-medium text-gray-800'
                                : 'text-amber-600 italic font-semibold'
                            }
                          >
                            {emp.position || '⚠️ Belum diisi'}
                          </span>
                        )}
                      </td>

                      {/* Reorder Up / Down Buttons */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => moveEmployee(index, 'up')}
                            disabled={index === 0}
                            title="Pindah ke atas"
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveEmployee(index, 'down')}
                            disabled={index === employees.length - 1}
                            title="Pindah ke bawah"
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveEdit(emp.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Simpan"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => startEdit(emp)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus karyawan "${emp.name}"?`)) {
                                  onDeleteEmployee(emp.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
