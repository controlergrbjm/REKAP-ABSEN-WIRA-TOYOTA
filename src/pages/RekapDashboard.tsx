import React, { useState } from 'react';
import { Branch, Employee, AttendanceRecord, AttendanceStatus } from '../types';
import { RekapHero } from '../components/RekapHero';
import { StatsOverview } from '../components/StatsOverview';
import { UploadDropzone } from '../components/UploadDropzone';
import { RekapTable } from '../components/RekapTable';
import { parseAttendanceExcel, formatDateKey, getDaysInMonth } from '../utils/parser';
import { exportToExcel } from '../utils/exporter';
import { generateSampleRawExcelBuffer } from '../utils/sampleData';

interface RekapDashboardProps {
  branch: Branch;
  employees: Employee[];
  attendanceMap: Record<string, Record<string, AttendanceRecord>>;
  currentMonth: number;
  currentYear: number;
  availablePeriods: { month: number; year: number }[];
  onPeriodChange: (month: number, year: number) => void;
  onRawDataParsed: (
    parsedResult: ReturnType<typeof parseAttendanceExcel>,
    fileName: string
  ) => void;
  onStatusChange: (employeeId: string, date: string, status: AttendanceStatus) => void;
  onUpdatePosition: (employeeId: string, newPosition: string) => void;
  onClearAllData?: () => void;
}

export const RekapDashboard: React.FC<RekapDashboardProps> = ({
  branch,
  employees,
  attendanceMap,
  currentMonth,
  currentYear,
  availablePeriods,
  onPeriodChange,
  onRawDataParsed,
  onStatusChange,
  onUpdatePosition,
  onClearAllData,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClearAll = () => {
    if (
      confirm(
        `⚠️ HAPUS SEMUA DATA?\n\nApakah Anda yakin ingin menghapus seluruh data absensi dan daftar karyawan di cabang "${branch.name}"?\n\nTindakan ini akan mengosongkan tabel rekap absensi dan master karyawan.`
      )
    ) {
      if (onClearAllData) {
        onClearAllData();
        showToast('Semua data absensi dan karyawan berhasil dihapus!');
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle uploaded raw Excel file
  const handleFileLoaded = (buffer: ArrayBuffer, fileName: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const parsed = parseAttendanceExcel(buffer);
        if (parsed.employees.length === 0) {
          alert('Tidak ditemukan blok data karyawan yang valid pada file Excel ini.');
          setIsProcessing(false);
          return;
        }
        onRawDataParsed(parsed, fileName);
        showToast(`Berhasil memproses ${parsed.employees.length} karyawan dari ${fileName}`);
      } catch (err) {
        console.error('Parsing error:', err);
        alert('Terjadi kesalahan saat mem-parsing file Excel. Pastikan format sesuai.');
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  // Load sample data (July 2026, 75 employees)
  const handleLoadSampleData = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const sampleBuffer = generateSampleRawExcelBuffer();
      const parsed = parseAttendanceExcel(sampleBuffer);
      onRawDataParsed(parsed, 'GR_Jul26.xlsx');
      showToast('Sample data "GR_Jul26.xlsx" (75 karyawan) berhasil dimuat!');
      setIsProcessing(false);
    }, 450);
  };

  // Handle Export to Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel({
        branch,
        month: currentMonth,
        year: currentYear,
        employees,
        attendanceMap,
      });
      showToast('File Excel rekap absensi berhasil diunduh!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengekspor file Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  // Compute global stats
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  let totalH = 0, totalS = 0, totalI = 0, totalA = 0, totalC = 0;
  let totalRecords = 0;

  employees.forEach((emp) => {
    const empRecs = attendanceMap[emp.id] || {};
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const r = empRecs[dateKey];
      if (r?.status) {
        totalRecords++;
        if (r.status === 'H') totalH++;
        else if (r.status === 'S') totalS++;
        else if (r.status === 'I') totalI++;
        else if (r.status === 'A') totalA++;
        else if (r.status === 'C') totalC++;
      }
    }
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-gray-700 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <RekapHero
        branch={branch}
        month={currentMonth}
        year={currentYear}
        availablePeriods={availablePeriods}
        onPeriodChange={onPeriodChange}
        onExport={handleExport}
        onClearAll={employees.length > 0 ? handleClearAll : undefined}
        isExporting={isExporting}
        totalRecords={totalRecords}
      />

      {/* Stats Cards */}
      <StatsOverview
        totalEmployees={employees.length}
        totalH={totalH}
        totalS={totalS}
        totalI={totalI}
        totalA={totalA}
        totalC={totalC}
      />

      {/* Dropzone Upload Area */}
      <UploadDropzone
        onFileLoaded={handleFileLoaded}
        onLoadSampleData={handleLoadSampleData}
        isProcessing={isProcessing}
      />

      {/* Rekap Table Section */}
      {employees.length > 0 ? (
        <RekapTable
          month={currentMonth}
          year={currentYear}
          employees={employees}
          attendanceMap={attendanceMap}
          onStatusChange={onStatusChange}
          onUpdatePosition={onUpdatePosition}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm font-semibold text-gray-700">Belum ada data absensi untuk ditampilkan</p>
          <p className="text-xs text-gray-400 mt-1">
            Silakan upload file mentahan Excel di atas atau klik tombol "Muat Sample Real" untuk memulai.
          </p>
        </div>
      )}
    </div>
  );
};
