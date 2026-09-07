import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Calendar, FileSpreadsheet, Sparkles, Trash2 } from 'lucide-react';
import { Branch } from '../types';
import { INDONESIAN_MONTHS } from '../utils/parser';

interface RekapHeroProps {
  branch: Branch;
  month: number;
  year: number;
  availablePeriods: { month: number; year: number }[];
  onPeriodChange: (month: number, year: number) => void;
  onExport: () => void;
  onClearAll?: () => void;
  isExporting: boolean;
  totalRecords: number;
}

export const RekapHero: React.FC<RekapHeroProps> = ({
  branch,
  month,
  year,
  availablePeriods,
  onPeriodChange,
  onExport,
  onClearAll,
  isExporting,
  totalRecords,
}) => {
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPeriodDropdownOpen(false);
      }
    };
    if (periodDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [periodDropdownOpen]);

  const monthName = INDONESIAN_MONTHS[month - 1] || `Bulan ${month}`;

  // Generate some standard months if availablePeriods is empty
  const periodsToShow =
    availablePeriods.length > 0
      ? availablePeriods
      : [
          { month: 7, year: 2026 },
          { month: 8, year: 2026 },
          { month: 9, year: 2026 },
        ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6A040F] via-[#9D0208] to-[#D00000] text-white shadow-xl shadow-red-950/20 p-6 sm:p-8">
      {/* Decorative Background Elements */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 -bottom-20 w-60 h-60 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Branch Info & Month Display */}
        <div className="space-y-3">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-black shadow-sm tracking-wider uppercase">
              ABSENSI
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20">
              {branch.name} ({branch.code})
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/25 text-red-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {totalRecords} Record Terproses
            </span>
          </div>

          {/* Large Month & Year Title */}
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
              {monthName}
            </h1>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-300">
              {year}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-red-100/80 max-w-xl">
            Rekapitulasi kehadiran karyawan bengkel Toyota. Data scan masuk & keluar
            dipadankan secara otomatis dengan Master Karyawan.
          </p>
        </div>

        {/* Right: Period Selector & Export Button */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Custom Period Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>
                {monthName} {year}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${
                  periodDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 text-gray-800 animate-fade-in-up">
                <div className="text-[11px] font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                  Pilih Periode Rekap
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {periodsToShow.map((p, idx) => {
                    const isSelected = p.month === month && p.year === year;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onPeriodChange(p.month, p.year);
                          setPeriodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-red-50 text-[#C00000] font-bold'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>
                          {INDONESIAN_MONTHS[p.month - 1]} {p.year}
                        </span>
                        {isSelected && <span className="text-[#C00000]">●</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export to Excel Button */}
          <button
            onClick={onExport}
            disabled={isExporting || totalRecords === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-[#8B0000] font-extrabold text-xs sm:text-sm shadow-lg shadow-black/20 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C00000]" />
            <span>{isExporting ? 'Mengekspor...' : 'Export ke Excel'}</span>
          </button>

          {/* Delete All Button */}
          {onClearAll && (
            <button
              onClick={onClearAll}
              title="Hapus / Reset semua data absensi"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-black/30 hover:bg-rose-950/80 text-rose-200 hover:text-white text-xs font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
