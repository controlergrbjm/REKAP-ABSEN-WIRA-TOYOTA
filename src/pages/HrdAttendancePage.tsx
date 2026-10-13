import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  Eye,
  Info,
} from 'lucide-react';
import { Branch } from '../types';
import { HrdDataset, HrdDayColumn, HrdEmployeeRecord, HrdDayCell, HrdCutoffPeriod } from '../types/hrd';
import {
  generateHrdDateColumns,
  createStandardCutoffPeriod,
  parseHrdAttendanceExcel,
  getExcelSheetNames,
  MONTH_NAMES_ID,
} from '../utils/hrdParser';
import { generateSampleHrdDataset, generateSampleHrdExcelBuffer } from '../utils/hrdSampleData';
import { exportHrdToExcel } from '../utils/hrdExporter';
import {
  getHrdDataset,
  saveHrdDataset,
  clearHrdDataset,
  listHrdDatasets,
} from '../lib/hrdStore';

interface HrdAttendancePageProps {
  branch: Branch;
}

const STATUS_BADGE_STYLE: Record<
  string,
  { bg: string; text: string; border: string; label: string; desc: string }
> = {
  H: {
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'H',
    desc: 'Hadir (Jam Scan)',
  },
  S: {
    bg: 'bg-amber-100 hover:bg-amber-200',
    text: 'text-amber-900',
    border: 'border-amber-400',
    label: 'S',
    desc: 'Sakit',
  },
  I: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'I',
    desc: 'Izin',
  },
  A: {
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
    label: 'A',
    desc: 'Alpha / Tanpa Ket.',
  },
  C: {
    bg: 'bg-purple-50 hover:bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'C',
    desc: 'Cuti',
  },
};

export const HrdAttendancePage: React.FC<HrdAttendancePageProps> = ({ branch }) => {
  // ── PERIOD STATE ─────────────────────────────────────────────────────────
  // Default target month 9 (September) 2026: 16 Agu s.d 15 Sep 2026 (matching screenshot)
  const [selectedEndMonth, setSelectedEndMonth] = useState<number>(9);
  const [selectedEndYear, setSelectedEndYear] = useState<number>(2026);

  const activePeriod: HrdCutoffPeriod = useMemo(() => {
    return createStandardCutoffPeriod(selectedEndMonth, selectedEndYear);
  }, [selectedEndMonth, selectedEndYear]);

  // ── DATASET STATE ────────────────────────────────────────────────────────
  const [dataset, setDataset] = useState<HrdDataset | null>(() => {
    const saved = getHrdDataset(branch.id, activePeriod.periodKey);
    if (saved) return saved;
    // Auto load sample dataset on initial preview
    return generateSampleHrdDataset(branch.id);
  });

  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('September');
  const [cachedBuffer, setCachedBuffer] = useState<ArrayBuffer | null>(null);

  // ── UI CONTROLS ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'code' | 'raw'>('code');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    empId: string;
    dateKey: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reload dataset whenever branch or period changes
  const loadDatasetForPeriod = useCallback((period: HrdCutoffPeriod) => {
    const existing = getHrdDataset(branch.id, period.periodKey);
    if (existing) {
      setDataset(existing);
    } else {
      // If none saved, create empty structure for this period
      const newEmpty: HrdDataset = {
        id: `hrd_${Date.now()}`,
        branchId: branch.id,
        branchName: branch.name,
        fileName: 'Data Kosong',
        sheetName: MONTH_NAMES_ID[period.endMonth - 1],
        period,
        categories: ['GAJI STAFF CABANG', 'GAJI STAFF BENGKEL', 'GAJI STAFF OUTLET', 'BANJARMASIN'],
        employees: [],
        uploadedAt: new Date().toISOString(),
      };
      setDataset(newEmpty);
    }
  }, [branch.id, branch.name]);

  const handlePeriodChange = (endMonth: number, endYear: number) => {
    setSelectedEndMonth(endMonth);
    setSelectedEndYear(endYear);
    const newPeriod = createStandardCutoffPeriod(endMonth, endYear);
    loadDatasetForPeriod(newPeriod);
  };

  // ── EXCEL FILE UPLOAD ────────────────────────────────────────────────────
  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        setIsProcessing(false);
        return;
      }
      try {
        const sheets = getExcelSheetNames(buffer);
        setAvailableSheets(sheets);
        setCachedBuffer(buffer);

        // Pick matching sheet if possible
        const defaultSheet = sheets.find(s =>
          s.toLowerCase().includes(MONTH_NAMES_ID[selectedEndMonth - 1].toLowerCase())
        ) || sheets[0];

        setSelectedSheet(defaultSheet);

        const parsed = parseHrdAttendanceExcel(buffer, {
          sheetName: defaultSheet,
          branchId: branch.id,
          branchName: branch.name,
          fileName: file.name,
          overridePeriod: activePeriod,
        });

        setDataset(parsed);
        saveHrdDataset(parsed);
        showToast(`Berhasil import ${parsed.employees.length} karyawan dari "${file.name}" (Sheet: ${defaultSheet})!`);
      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat parsing file Excel';
        alert(`Gagal memproses file: ${message}`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheetName: string) => {
    if (!cachedBuffer) return;
    setIsProcessing(true);
    setSelectedSheet(sheetName);
    try {
      const parsed = parseHrdAttendanceExcel(cachedBuffer, {
        sheetName,
        branchId: branch.id,
        branchName: branch.name,
        fileName: dataset?.fileName || 'HRD.xlsx',
        overridePeriod: activePeriod,
      });
      setDataset(parsed);
      saveHrdDataset(parsed);
      showToast(`Sheet "${sheetName}" dimuat (${parsed.employees.length} karyawan)!`);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal memuat sheet: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── DEMO & TEMPLATE ACTIONS ──────────────────────────────────────────────
  const handleLoadDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const demo = generateSampleHrdDataset(branch.id);
      setDataset(demo);
      saveHrdDataset(demo);
      setSelectedEndMonth(9);
      setSelectedEndYear(2026);
      showToast('Contoh data absensi HRD (16 Agu - 15 Sep 2026) berhasil dimuat!');
      setIsProcessing(false);
    }, 300);
  };

  const handleDownloadTemplate = () => {
    const buffer = generateSampleHrdExcelBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Template_Format_HRD_16_sd_15.xlsx';
    link.click();
    showToast('Template Excel format HRD berhasil diunduh!');
  };

  const handleExport = async () => {
    if (!dataset || dataset.employees.length === 0) {
      alert('Tidak ada data absensi untuk diekspor.');
      return;
    }
    setIsExporting(true);
    try {
      await exportHrdToExcel(dataset, viewMode);
      showToast('File Excel Rekap HRD berhasil diekspor!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengekspor file Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    if (confirm(`Hapus data absensi HRD periode ${activePeriod.label}?`)) {
      clearHrdDataset(branch.id, activePeriod.periodKey);
      loadDatasetForPeriod(activePeriod);
      showToast('Data absensi HRD periode ini telah dikosongkan.');
    }
  };

  // ── INLINE STATUS CHANGE ─────────────────────────────────────────────────
  const handleUpdateStatus = (empId: string, dateKey: string, newStatus: string) => {
    if (!dataset) return;
    const updatedEmployees = dataset.employees.map((emp) => {
      if (emp.id !== empId) return emp;
      const currentCell = emp.cells[dateKey] || {
        statusCode: '',
        rawText: '',
        checkIn: null,
        checkOut: null,
      };
      return {
        ...emp,
        cells: {
          ...emp.cells,
          [dateKey]: {
            ...currentCell,
            statusCode: newStatus,
            isManual: true,
          },
        },
      };
    });

    const updatedDataset: HrdDataset = {
      ...dataset,
      employees: updatedEmployees,
    };
    setDataset(updatedDataset);
    saveHrdDataset(updatedDataset);
    setEditingCell(null);
  };

  // ── DERIVED METRICS & FILTERING ──────────────────────────────────────────
  const dateColumns = useMemo(() => {
    return generateHrdDateColumns(dataset?.period || activePeriod);
  }, [dataset?.period, activePeriod]);

  const filteredEmployees = useMemo(() => {
    if (!dataset) return [];
    return dataset.employees.filter((emp) => {
      const matchSearch =
        searchQuery === '' ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'ALL' || emp.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [dataset, searchQuery, selectedCategory]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalH = 0, totalS = 0, totalI = 0, totalA = 0, totalC = 0;
    if (!dataset) return { totalEmployees: 0, totalH: 0, totalS: 0, totalI: 0, totalA: 0, totalC: 0 };

    dataset.employees.forEach((emp) => {
      Object.values(emp.cells).forEach((c) => {
        if (c.statusCode === 'H') totalH++;
        else if (c.statusCode === 'S') totalS++;
        else if (c.statusCode === 'I') totalI++;
        else if (c.statusCode === 'A') totalA++;
        else if (c.statusCode === 'C') totalC++;
      });
    });

    return {
      totalEmployees: dataset.employees.length,
      totalH,
      totalS,
      totalI,
      totalA,
      totalC,
    };
  }, [dataset]);

  // Grouped employees by category
  const categoriesInUse = useMemo(() => {
    if (!dataset) return [];
    const set = new Set<string>();
    dataset.employees.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [dataset]);

  // Cut-off period presets
  const periodPresets = [
    { label: '16 Jun - 15 Jul 2026', m: 7, y: 2026 },
    { label: '16 Jul - 15 Agu 2026', m: 8, y: 2026 },
    { label: '16 Agu - 15 Sep 2026', m: 9, y: 2026 },
    { label: '16 Sep - 15 Okt 2026', m: 10, y: 2026 },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 text-white shadow-xl border border-red-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              Sistem Absensi HRD • Cut-Off 16 s.d 15
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Import & Rekap Absensi HRD
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Format khusus cut-off bulanan HRD (<span className="text-amber-300 font-semibold">16 bulan lalu s.d 15 bulan ini</span>).
              Cell dengan jam scan otomatis menjadi <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">H</span>,
              dan keterangan khusus (<span className="text-amber-300 font-bold">S</span>, <span className="text-blue-300 font-bold">I</span>, <span className="text-rose-300 font-bold">A</span>, <span className="text-purple-300 font-bold">C</span>) tampil sesuai file asli.
            </p>
          </div>

          {/* Quick Period Switcher */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex flex-col gap-2 shrink-0">
            <div className="text-[11px] font-semibold text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Periode Cut-Off Aktif:
              </span>
              <span className="text-white font-bold">{activePeriod.label}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {periodPresets.map((p) => {
                const isActive = selectedEndMonth === p.m && selectedEndYear === p.y;
                return (
                  <button
                    key={p.label}
                    onClick={() => handlePeriodChange(p.m, p.y)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#C00000] text-white shadow-md shadow-red-900/50 scale-102'
                        : 'bg-white/10 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sheet Tabs (if multi-sheet file loaded) */}
        {availableSheets.length > 1 && (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-gray-400 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Pilih Sheet Excel:
            </span>
            {availableSheets.map((sheet) => (
              <button
                key={sheet}
                onClick={() => handleSheetChange(sheet)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedSheet === sheet
                    ? 'bg-amber-400 text-gray-900 shadow-sm'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── STATS CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Karyawan</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalEmployees}</div>
          <div className="text-[10px] text-gray-500 font-medium">Dalam {categoriesInUse.length} Divisi/Bagian</div>
        </div>
        <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200/70 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Hadir (H)
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.totalH}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Otomatis dari jam scan</div>
        </div>
        <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200/70 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Sakit (S)
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.totalS}</div>
          <div className="text-[10px] text-amber-600 font-medium">Keterangan HRD</div>
        </div>
        <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-200/70 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Izin (I)
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.totalI}</div>
          <div className="text-[10px] text-blue-600 font-medium">Keterangan HRD</div>
        </div>
        <div className="bg-rose-50/70 rounded-xl p-3.5 border border-rose-200/70 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Alpha (A)
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{stats.totalA}</div>
          <div className="text-[10px] text-rose-600 font-medium">Tanpa Keterangan</div>
        </div>
        <div className="bg-purple-50/70 rounded-xl p-3.5 border border-purple-200/70 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Cuti (C)
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.totalC}</div>
          <div className="text-[10px] text-purple-600 font-medium">Cuti Terjadwal</div>
        </div>
      </div>

      {/* ── ACTION BAR & CONTROLS ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* File Upload & Demo Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
                e.target.value = '';
              }}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C00000] to-[#E53935] hover:from-[#A00000] hover:to-[#C00000] text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isProcessing ? 'Memproses...' : 'Import File Excel HRD (.xlsx)'}</span>
            </button>

            <button
              onClick={handleLoadDemo}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-bold active:scale-98 transition-all cursor-pointer"
              title="Muat contoh format persis foto referensi 16 Agu - 15 Sep 2026"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Muat Contoh Format HRD</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold active:scale-98 transition-all cursor-pointer"
              title="Download contoh template format HRD untuk diisi dan di-upload"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download Template HRD</span>
            </button>
          </div>

          {/* Export & Clear Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Mengekspor...' : 'Ekspor ke Excel'}</span>
            </button>

            <button
              onClick={handleClearData}
              className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-200"
              title="Hapus data absensi periode ini"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle & Filters */}
        <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama karyawan / note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C00000]/20 transition-all font-medium"
              />
            </div>

            {categoriesInUse.length > 1 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Bagian ({dataset?.employees.length || 0})</option>
                {categoriesInUse.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* View Mode Switch */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 self-start md:self-auto">
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'code'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mode Kode (H, S, I, A)</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'raw'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Mode Jam Scan HRD</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE CONTAINER ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header Info Bar */}
        <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-800">{branch.name}</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-[#C00000]">{activePeriod.label}</span>
            {dataset?.fileName && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 font-mono text-[11px] truncate max-w-[200px]">
                  {dataset.fileName}
                </span>
              </>
            )}
          </div>
          <div className="text-gray-500 text-[11px] flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 inline-block" /> Kolom Hijau = Libur / Minggu
            </span>
            <span>Menampilkan <strong>{filteredEmployees.length}</strong> karyawan</span>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full border-collapse text-left border-spacing-0">
            {/* Table Head */}
            <thead className="sticky top-0 z-30">
              {/* Row 1: Header Titles */}
              <tr className="bg-slate-900 text-white text-[11px]">
                <th className="sticky left-0 z-40 bg-slate-900 px-3 py-2 text-center font-bold w-12 border-r border-slate-800">
                  NO
                </th>
                <th className="sticky left-12 z-40 bg-slate-900 px-3 py-2 font-bold min-w-[200px] border-r border-slate-800">
                  NAMA KARYAWAN
                </th>
                <th className="sticky left-[248px] sm:left-[252px] z-40 bg-slate-900 px-3 py-2 text-center font-bold min-w-[80px] border-r border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.2)]">
                  NOTE
                </th>
                {dateColumns.map((col) => (
                  <th
                    key={col.dateKey}
                    className={`text-center px-1 py-1 min-w-[34px] border-r border-slate-800 font-bold ${
                      col.isSunday ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-900'
                    }`}
                  >
                    <div className="text-[12px] font-black">{col.dayNumber}</div>
                    <div className={`text-[9px] uppercase font-semibold ${col.isSunday ? 'text-emerald-200' : 'text-gray-400'}`}>
                      {col.dayName}
                    </div>
                  </th>
                ))}
                {/* Summary Headers */}
                <th className="text-center px-2 py-2 bg-emerald-950 text-emerald-200 font-bold border-r border-slate-800 w-10" title="Hadir">
                  H
                </th>
                <th className="text-center px-2 py-2 bg-amber-950 text-amber-200 font-bold border-r border-slate-800 w-10" title="Sakit">
                  S
                </th>
                <th className="text-center px-2 py-2 bg-blue-950 text-blue-200 font-bold border-r border-slate-800 w-10" title="Izin">
                  I
                </th>
                <th className="text-center px-2 py-2 bg-rose-950 text-rose-200 font-bold border-r border-slate-800 w-10" title="Alpha">
                  A
                </th>
                <th className="text-center px-2 py-2 bg-purple-950 text-purple-200 font-bold border-r border-slate-800 w-10" title="Cuti">
                  C
                </th>
                <th className="text-center px-3 py-2 bg-slate-800 text-gray-200 font-bold min-w-[80px]">
                  POTONGAN
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={dateColumns.length + 9}
                    className="p-12 text-center text-gray-400 font-medium"
                  >
                    Tidak ada data karyawan ditemukan. Silakan klik{' '}
                    <button
                      onClick={handleLoadDemo}
                      className="text-[#C00000] underline font-bold"
                    >
                      Muat Contoh Format HRD
                    </button>{' '}
                    atau Upload File Excel HRD.
                  </td>
                </tr>
              ) : (
                categoriesInUse.map((catName) => {
                  const catEmps = filteredEmployees.filter((e) => e.category === catName);
                  if (catEmps.length === 0) return null;
                  const isCollapsed = !!collapsedCategories[catName];

                  return (
                    <React.Fragment key={catName}>
                      {/* Section Category Header */}
                      <tr className="bg-sky-50/90 hover:bg-sky-100/90 transition-colors">
                        <td
                          colSpan={dateColumns.length + 9}
                          className="px-4 py-2 font-black text-sky-900 border-y border-sky-200 text-xs"
                        >
                          <button
                            onClick={() =>
                              setCollapsedCategories((prev) => ({
                                ...prev,
                                [catName]: !prev[catName],
                              }))
                            }
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-sky-700" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-sky-700" />
                            )}
                            <span className="tracking-wide">{catName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-200/80 text-sky-800">
                              {catEmps.length} Orang
                            </span>
                          </button>
                        </td>
                      </tr>

                      {/* Employee Rows under this Category */}
                      {!isCollapsed &&
                        catEmps.map((emp, rowIdx) => {
                          const isEven = rowIdx % 2 === 0;
                          const rowBg = isEven ? 'bg-white' : 'bg-[#FFFBF7]/70';

                          // Row summary counts
                          let cntH = 0, cntS = 0, cntI = 0, cntA = 0, cntC = 0;
                          dateColumns.forEach((col) => {
                            const st = emp.cells[col.dateKey]?.statusCode;
                            if (st === 'H') cntH++;
                            else if (st === 'S') cntS++;
                            else if (st === 'I') cntI++;
                            else if (st === 'A') cntA++;
                            else if (st === 'C') cntC++;
                          });

                          return (
                            <tr
                              key={emp.id}
                              className={`${rowBg} hover:bg-amber-50/50 transition-colors group`}
                            >
                              {/* NO (Sticky) */}
                              <td
                                className={`sticky left-0 z-20 ${rowBg} group-hover:bg-amber-50/70 text-center font-semibold text-gray-500 px-2 py-2 border-r border-gray-200 text-xs`}
                              >
                                {emp.no}
                              </td>

                              {/* NAMA (Sticky) */}
                              <td
                                className={`sticky left-12 z-20 ${rowBg} group-hover:bg-amber-50/70 px-3 py-2 border-r border-gray-200`}
                              >
                                <div className="font-bold text-gray-900 truncate max-w-[210px]" title={emp.name}>
                                  {emp.name}
                                </div>
                              </td>

                              {/* NOTE (Sticky) */}
                              <td
                                className={`sticky left-[248px] sm:left-[252px] z-20 ${rowBg} group-hover:bg-amber-50/70 text-center px-2 py-2 border-r border-gray-300 shadow-[4px_0_10px_rgba(0,0,0,0.05)]`}
                              >
                                {emp.note ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                    {emp.note}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-[11px]">-</span>
                                )}
                              </td>

                              {/* DAY CELLS */}
                              {dateColumns.map((col) => {
                                const cellData = emp.cells[col.dateKey];
                                const status = cellData?.statusCode || '';
                                const isSunday = col.isSunday;
                                const isEditing =
                                  editingCell?.empId === emp.id && editingCell?.dateKey === col.dateKey;
                                const badgeCfg = status ? STATUS_BADGE_STYLE[status] : null;

                                return (
                                  <td
                                    key={col.dateKey}
                                    className={`relative text-center px-0.5 py-1 border-r border-gray-100 ${
                                      isSunday ? 'bg-emerald-50/40' : ''
                                    }`}
                                  >
                                    {viewMode === 'raw' ? (
                                      // RAW SCAN TIME VIEW
                                      <div
                                        className="text-[10px] leading-tight font-mono text-gray-700 min-h-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/80 rounded"
                                        onClick={() => setEditingCell({ empId: emp.id, dateKey: col.dateKey })}
                                        title={cellData?.rawText || 'Kosong'}
                                      >
                                        {cellData?.checkIn ? (
                                          <>
                                            <span className="font-semibold text-emerald-800">{cellData.checkIn}</span>
                                            {cellData.checkOut && (
                                              <span className="text-gray-500 text-[9px]">{cellData.checkOut}</span>
                                            )}
                                          </>
                                        ) : status ? (
                                          <span className={`font-bold px-1 rounded ${badgeCfg?.text || 'text-gray-800'}`}>
                                            {status}
                                          </span>
                                        ) : (
                                          <span className="text-gray-300">·</span>
                                        )}
                                      </div>
                                    ) : (
                                      // CODE VIEW (H, S, I, A, C)
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingCell(
                                            isEditing ? null : { empId: emp.id, dateKey: col.dateKey }
                                          )
                                        }
                                        title={
                                          cellData?.checkIn
                                            ? `Jam: ${cellData.checkIn} - ${cellData.checkOut || '?'} (Klik untuk ubah)`
                                            : status
                                            ? `${badgeCfg?.desc || status} (Klik untuk ubah)`
                                            : 'Kosong / Klik untuk isi status'
                                        }
                                        className={`w-7 h-6 rounded flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer border ${
                                          badgeCfg
                                            ? `${badgeCfg.bg} ${badgeCfg.text} ${badgeCfg.border} shadow-xs scale-100 active:scale-95`
                                            : isSunday
                                            ? 'bg-transparent text-emerald-400 hover:text-emerald-700 border-transparent hover:border-emerald-200'
                                            : 'bg-transparent text-gray-300 hover:text-gray-600 border-transparent hover:border-gray-200'
                                        }`}
                                      >
                                        {status || '·'}
                                      </button>
                                    )}

                                    {/* Inline Status Popover Menu */}
                                    {isEditing && (
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 flex flex-col gap-1 min-w-[130px] text-left animate-in fade-in zoom-in-95 duration-100">
                                        <div className="text-[10px] font-bold text-gray-400 px-2 py-0.5 border-b border-gray-100">
                                          Pilih Status ({col.dayNumber} {col.dayName}):
                                        </div>
                                        {(['H', 'S', 'I', 'A', 'C'] as const).map((code) => {
                                          const cfg = STATUS_BADGE_STYLE[code];
                                          return (
                                            <button
                                              key={code}
                                              onClick={() => handleUpdateStatus(emp.id, col.dateKey, code)}
                                              className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold hover:${cfg.bg} ${cfg.text} transition-colors text-left cursor-pointer`}
                                            >
                                              <span className={`w-5 h-5 rounded flex items-center justify-center border ${cfg.border} ${cfg.bg}`}>
                                                {code}
                                              </span>
                                              <span className="text-[11px] text-gray-700 font-medium">
                                                {cfg.desc}
                                              </span>
                                            </button>
                                          );
                                        })}
                                        <button
                                          onClick={() => handleUpdateStatus(emp.id, col.dateKey, '')}
                                          className="text-[11px] text-gray-500 hover:text-rose-600 px-2 py-1 rounded text-left hover:bg-rose-50 transition-colors font-medium border-t border-gray-100"
                                        >
                                          ✕ Kosongkan
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}

                              {/* SUMMARY COUNTS */}
                              <td className="text-center px-1.5 py-1.5 font-bold text-emerald-800 bg-emerald-50/30 border-r border-gray-200">
                                {cntH || '-'}
                              </td>
                              <td className="text-center px-1.5 py-1.5 font-bold text-amber-800 bg-amber-50/30 border-r border-gray-200">
                                {cntS || '-'}
                              </td>
                              <td className="text-center px-1.5 py-1.5 font-bold text-blue-800 bg-blue-50/30 border-r border-gray-200">
                                {cntI || '-'}
                              </td>
                              <td className="text-center px-1.5 py-1.5 font-bold text-rose-800 bg-rose-50/30 border-r border-gray-200">
                                {cntA || '-'}
                              </td>
                              <td className="text-center px-1.5 py-1.5 font-bold text-purple-800 bg-purple-50/30 border-r border-gray-200">
                                {cntC || '-'}
                              </td>
                              <td className="text-center px-2 py-1.5 font-semibold text-gray-600 bg-gray-50/50">
                                {emp.deductionCount ? `Rp ${emp.deductionCount.toLocaleString('id-ID')}` : '-'}
                              </td>
                            </tr>
                          );
                        })}

                      {/* Subtotal Row */}
                      {!isCollapsed && (
                        <tr className="bg-gray-100/80 font-bold text-gray-700 text-xs">
                          <td className="sticky left-0 z-20 bg-gray-100 text-center px-2 py-1.5 border-r border-gray-300">
                            Total
                          </td>
                          <td
                            colSpan={2}
                            className="sticky left-12 z-20 bg-gray-100 px-3 py-1.5 border-r border-gray-300 shadow-[4px_0_10px_rgba(0,0,0,0.05)] text-gray-600 italic text-[11px]"
                          >
                            {catEmps.length} Orang Karyawan ({catName})
                          </td>
                          <td colSpan={dateColumns.length} className="bg-gray-100 border-r border-gray-300" />
                          <td className="text-center px-1 py-1.5 bg-emerald-100/50 text-emerald-900 border-r border-gray-300">
                            {catEmps.reduce((acc, emp) => {
                              return acc + Object.values(emp.cells).filter((c) => c.statusCode === 'H').length;
                            }, 0)}
                          </td>
                          <td className="text-center px-1 py-1.5 bg-amber-100/50 text-amber-900 border-r border-gray-300">
                            {catEmps.reduce((acc, emp) => {
                              return acc + Object.values(emp.cells).filter((c) => c.statusCode === 'S').length;
                            }, 0)}
                          </td>
                          <td className="text-center px-1 py-1.5 bg-blue-100/50 text-blue-900 border-r border-gray-300">
                            {catEmps.reduce((acc, emp) => {
                              return acc + Object.values(emp.cells).filter((c) => c.statusCode === 'I').length;
                            }, 0)}
                          </td>
                          <td className="text-center px-1 py-1.5 bg-rose-100/50 text-rose-900 border-r border-gray-300">
                            {catEmps.reduce((acc, emp) => {
                              return acc + Object.values(emp.cells).filter((c) => c.statusCode === 'A').length;
                            }, 0)}
                          </td>
                          <td className="text-center px-1 py-1.5 bg-purple-100/50 text-purple-900 border-r border-gray-300">
                            {catEmps.reduce((acc, emp) => {
                              return acc + Object.values(emp.cells).filter((c) => c.statusCode === 'C').length;
                            }, 0)}
                          </td>
                          <td className="text-center px-1 py-1.5 bg-gray-100 text-gray-400">-</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend / Info Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-gray-700">Keterangan Status:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <strong>H</strong> = Hadir (Dari Jam Scan HRD)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-400 font-semibold">
              <strong>S</strong> = Sakit (HRD)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              <strong>I</strong> = Izin (HRD)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-300 font-semibold">
              <strong>A</strong> = Alpha (Tanpa Keterangan)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              <strong>C</strong> = Cuti
            </span>
          </div>
          <div className="text-gray-500 text-[11px] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            Klik cell pada tabel untuk mengubah status kehadiran secara manual jika diperlukan.
          </div>
        </div>
      </div>
    </div>
  );
};
