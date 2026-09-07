import React, { useState, useMemo, useCallback } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../types';
import { getDaysInMonth, getShortDayName, isWeekend } from '../utils/parser';
import { StatusBadge } from './StatusBadge';
import { Check, Edit2, Search, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Zap } from 'lucide-react';

interface RekapTableProps {
  month: number;
  year: number;
  employees: Employee[];
  attendanceMap: Record<string, Record<string, AttendanceRecord>>;
  onStatusChange: (employeeId: string, date: string, status: AttendanceStatus) => void;
  onUpdatePosition: (employeeId: string, newPosition: string) => void;
  onClearAll?: () => void;
}

interface EmployeeRowProps {
  emp: Employee;
  index: number;
  year: number;
  month: number;
  daysArray: number[];
  records: Record<string, AttendanceRecord>;
  isEditingPosition: boolean;
  tempPosition: string;
  onStartEditPosition: (emp: Employee) => void;
  onSaveEditPosition: (empId: string) => void;
  onCancelEditPosition: () => void;
  onTempPositionChange: (val: string) => void;
  onStatusChange: (employeeId: string, date: string, status: AttendanceStatus) => void;
}

// Memoized row component: Only re-renders if this specific employee's records or edit state changes
const EmployeeRow = React.memo<EmployeeRowProps>(({
  emp,
  index,
  year,
  month,
  daysArray,
  records,
  isEditingPosition,
  tempPosition,
  onStartEditPosition,
  onSaveEditPosition,
  onCancelEditPosition,
  onTempPositionChange,
  onStatusChange,
}) => {
  const isEven = index % 2 === 0;
  const rowBg = isEven ? 'bg-white' : 'bg-[#FFFBF7]/80';

  // Calculate summary counts for this row
  let countH = 0, countS = 0, countI = 0, countA = 0, countC = 0;
  daysArray.forEach((d) => {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const r = records[dateKey];
    if (r?.status === 'H') countH++;
    else if (r?.status === 'S') countS++;
    else if (r?.status === 'I') countI++;
    else if (r?.status === 'A') countA++;
    else if (r?.status === 'C') countC++;
  });

  return (
    <tr className={`${rowBg} hover:bg-amber-50/60 transition-colors duration-100 group`}>
      {/* NO (Sticky) */}
      <td
        className={`sticky left-0 z-20 ${rowBg} group-hover:bg-amber-50/80 text-center font-semibold text-gray-500 px-2 py-2 border-r border-gray-200 text-xs`}
      >
        {index + 1}
      </td>

      {/* NAMA (Sticky) */}
      <td
        className={`sticky left-12 z-20 ${rowBg} group-hover:bg-amber-50/80 px-3 py-2 border-r border-gray-200`}
      >
        <div className="font-bold text-gray-900 truncate max-w-[220px]" title={emp.name}>
          {emp.name}
        </div>
        {emp.pin && (
          <div className="text-[10px] text-gray-400 font-mono">PIN: {emp.pin}</div>
        )}
      </td>

      {/* JABATAN (Sticky with right shadow) */}
      <td
        className={`sticky left-[248px] sm:left-[252px] z-20 ${rowBg} group-hover:bg-amber-50/80 px-3 py-2 border-r border-gray-300 shadow-[4px_0_10px_rgba(0,0,0,0.06)]`}
      >
        {isEditingPosition ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={tempPosition}
              onChange={(e) => onTempPositionChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEditPosition(emp.id);
                if (e.key === 'Escape') onCancelEditPosition();
              }}
              className="w-full text-xs px-2 py-1 bg-white border border-[#C00000] rounded focus:outline-none"
              placeholder="Isi jabatan..."
            />
            <button
              onClick={() => onSaveEditPosition(emp.id)}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              title="Simpan (Enter)"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => onStartEditPosition(emp)}
            className="flex items-center justify-between group/pos cursor-pointer hover:text-[#C00000]"
            title="Klik untuk ubah jabatan"
          >
            <span
              className={`truncate text-xs ${
                emp.position ? 'text-gray-700 font-medium' : 'text-amber-600 italic font-semibold'
              }`}
            >
              {emp.position || '⚠️ Belum diisi'}
            </span>
            <Edit2 className="w-3 h-3 text-gray-300 opacity-0 group-hover/pos:opacity-100 transition-opacity ml-1" />
          </div>
        )}
      </td>

      {/* Date Day Columns */}
      {daysArray.map((d) => {
        const isWk = isWeekend(year, month, d);
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const rec = records[dateKey];
        const status = rec ? rec.status : null;

        return (
          <td
            key={d}
            className={`text-center px-0.5 py-1.5 border-r border-gray-100 ${
              isWk ? 'bg-red-50/40' : ''
            }`}
          >
            <StatusBadge
              status={status}
              checkIn={rec?.check_in}
              checkOut={rec?.check_out}
              onChange={(newStatus) => onStatusChange(emp.id, dateKey, newStatus)}
            />
          </td>
        );
      })}

      {/* Summary Counts */}
      <td className="text-center font-bold text-emerald-700 bg-emerald-50/40 px-1 py-1.5 border-r border-gray-200">
        {countH || '-'}
      </td>
      <td className="text-center font-bold text-amber-800 bg-amber-50/40 px-1 py-1.5 border-r border-gray-200">
        {countS || '-'}
      </td>
      <td className="text-center font-bold text-blue-700 bg-blue-50/40 px-1 py-1.5 border-r border-gray-200">
        {countI || '-'}
      </td>
      <td className="text-center font-bold text-rose-700 bg-rose-50/40 px-1 py-1.5 border-r border-gray-200">
        {countA || '-'}
      </td>
      <td className="text-center font-bold text-purple-700 bg-purple-50/40 px-1 py-1.5">
        {countC || '-'}
      </td>
    </tr>
  );
});

EmployeeRow.displayName = 'EmployeeRow';

export const RekapTable: React.FC<RekapTableProps> = ({
  month,
  year,
  employees,
  attendanceMap,
  onStatusChange,
  onUpdatePosition,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [tempPosition, setTempPosition] = useState('');
  const [pageSize, setPageSize] = useState<number | 'all'>(25);
  const [currentPage, setCurrentPage] = useState(1);

  const totalDays = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const daysArray = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);

  // Filter employees with useMemo
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        (e.position && e.position.toLowerCase().includes(term)) ||
        (e.pin && e.pin.includes(term))
    );
  }, [employees, searchTerm]);

  // Reset current page when search term or page size changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPageSize(val === 'all' ? 'all' : Number(val));
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalItems = filteredEmployees.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEmployees = useMemo(() => {
    if (pageSize === 'all') return filteredEmployees;
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return filteredEmployees.slice(startIdx, startIdx + pageSize);
  }, [filteredEmployees, safeCurrentPage, pageSize]);

  const startIndex = pageSize === 'all' ? 0 : (safeCurrentPage - 1) * pageSize;

  const startEditPosition = useCallback((emp: Employee) => {
    setEditingPositionId(emp.id);
    setTempPosition(emp.position || '');
  }, []);

  const saveEditPosition = useCallback((empId: string) => {
    onUpdatePosition(empId, tempPosition.trim());
    setEditingPositionId(null);
  }, [onUpdatePosition, tempPosition]);

  const cancelEditPosition = useCallback(() => {
    setEditingPositionId(null);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col lg:flex-row items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama karyawan, jabatan, PIN..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C00000]/20 text-gray-800 transition-all"
            />
          </div>

          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap bg-white px-2.5 py-1.5 rounded-xl border border-gray-200">
            {filteredEmployees.length} dari {employees.length} Karyawan
          </span>

          {/* Performance Anti-Lag Badge */}
          <div
            title="Optimasi Anti-Lag aktif: Baris tabel termemo & rendering halaman super cepat"
            className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 select-none"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            <span>Anti-Lag Mode</span>
          </div>

          {onClearAll && (
            <button
              onClick={onClearAll}
              title="Hapus / Reset semua data absensi dan karyawan"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600 flex-wrap justify-end">
          <span className="text-gray-400 uppercase tracking-wider text-[10px]">Keterangan:</span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              H
            </span>{' '}
            Hadir
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold bg-amber-100 text-amber-900 border border-amber-300">
              S
            </span>{' '}
            Sakit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold bg-blue-100 text-blue-900 border border-blue-300">
              I
            </span>{' '}
            Izin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold bg-rose-100 text-rose-900 border border-rose-300">
              A
            </span>{' '}
            Alpha
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold bg-purple-100 text-purple-900 border border-purple-300">
              C
            </span>{' '}
            Cuti
          </span>
        </div>
      </div>

      {/* Main Scrollable Table Wrapper */}
      <div className="relative overflow-x-auto max-h-[640px] border-t border-gray-100">
        <table className="w-full border-collapse text-left text-xs">
          {/* Header */}
          <thead className="sticky top-0 z-30 bg-white shadow-xs">
            {/* Row 1: Date Numbers + Merged Sticky Column Headers */}
            <tr className="bg-gray-100/90 border-b border-gray-200">
              {/* NO */}
              <th
                rowSpan={2}
                className="sticky left-0 z-30 bg-gray-100 text-center font-bold text-gray-700 w-12 px-2 py-2.5 border-r border-gray-200"
              >
                NO
              </th>
              {/* NAMA */}
              <th
                rowSpan={2}
                className="sticky left-12 z-30 bg-gray-100 text-left font-bold text-gray-700 min-w-[200px] max-w-[240px] px-3 py-2.5 border-r border-gray-200"
              >
                NAMA KARYAWAN
              </th>
              {/* JABATAN */}
              <th
                rowSpan={2}
                className="sticky left-[248px] sm:left-[252px] z-30 bg-gray-100 text-left font-bold text-gray-700 min-w-[160px] max-w-[180px] px-3 py-2.5 border-r border-gray-300 shadow-[4px_0_10px_rgba(0,0,0,0.06)]"
              >
                JABATAN
              </th>

              {/* Date Numbers */}
              {daysArray.map((d) => {
                const isWk = isWeekend(year, month, d);
                return (
                  <th
                    key={d}
                    className={`text-center font-bold w-9 min-w-[36px] px-1 py-1.5 border-r border-gray-200 ${
                      isWk ? 'bg-red-100/70 text-[#C00000]' : 'text-gray-800'
                    }`}
                  >
                    <span className="text-xs">{d}</span>
                  </th>
                );
              })}

              {/* Summary Headers */}
              <th
                rowSpan={2}
                className="bg-emerald-50 text-emerald-800 text-center font-bold w-11 px-1 py-2 border-r border-gray-200"
                title="Total Hadir"
              >
                H
              </th>
              <th
                rowSpan={2}
                className="bg-amber-50 text-amber-800 text-center font-bold w-11 px-1 py-2 border-r border-gray-200"
                title="Total Sakit"
              >
                S
              </th>
              <th
                rowSpan={2}
                className="bg-blue-50 text-blue-800 text-center font-bold w-11 px-1 py-2 border-r border-gray-200"
                title="Total Izin"
              >
                I
              </th>
              <th
                rowSpan={2}
                className="bg-rose-50 text-rose-800 text-center font-bold w-11 px-1 py-2 border-r border-gray-200"
                title="Total Alpha"
              >
                A
              </th>
              <th
                rowSpan={2}
                className="bg-purple-50 text-purple-800 text-center font-bold w-11 px-1 py-2"
                title="Total Cuti"
              >
                C
              </th>
            </tr>

            {/* Row 2: Short Day Names */}
            <tr className="bg-gray-50 border-b-2 border-gray-300 shadow-xs">
              {daysArray.map((d) => {
                const isWk = isWeekend(year, month, d);
                const dayName = getShortDayName(year, month, d);
                return (
                  <th
                    key={`dn_${d}`}
                    className={`text-center font-semibold text-[10px] py-1 border-r border-gray-200 uppercase ${
                      isWk ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-500'
                    }`}
                  >
                    {dayName}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={totalDays + 8} className="py-12 text-center text-gray-400">
                  Tidak ada data karyawan yang cocok dengan pencarian
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp, idx) => {
                const actualIndex = startIndex + idx;
                const empRecords = attendanceMap[emp.id] || {};
                return (
                  <EmployeeRow
                    key={emp.id}
                    emp={emp}
                    index={actualIndex}
                    year={year}
                    month={month}
                    daysArray={daysArray}
                    records={empRecords}
                    isEditingPosition={editingPositionId === emp.id}
                    tempPosition={tempPosition}
                    onStartEditPosition={startEditPosition}
                    onSaveEditPosition={saveEditPosition}
                    onCancelEditPosition={cancelEditPosition}
                    onTempPositionChange={setTempPosition}
                    onStatusChange={onStatusChange}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Anti-Lag Controls) */}
      <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan{' '}
            <strong className="text-gray-900">
              {totalItems === 0 ? 0 : startIndex + 1} -{' '}
              {pageSize === 'all' ? totalItems : Math.min(startIndex + pageSize, totalItems)}
            </strong>{' '}
            dari <strong className="text-gray-900">{totalItems}</strong> Karyawan
          </span>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Baris:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C00000]/20"
            >
              <option value={20}>20 / hal</option>
              <option value={25}>25 / hal (Cepat)</option>
              <option value={50}>50 / hal</option>
              <option value={100}>100 / hal</option>
              <option value="all">Semua</option>
            </select>
          </div>
        </div>

        {pageSize !== 'all' && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-gray-800 text-xs bg-white rounded-lg border border-gray-200 shadow-2xs">
              Hal {safeCurrentPage} dari {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
