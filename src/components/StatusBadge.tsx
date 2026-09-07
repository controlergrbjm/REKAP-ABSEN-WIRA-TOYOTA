import React, { useState, useRef, useEffect } from 'react';
import { AttendanceStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus;
  checkIn?: string | null;
  checkOut?: string | null;
  onChange: (newStatus: AttendanceStatus) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; desc: string; bg: string; text: string; border: string; dot: string }
> = {
  H: {
    label: 'H',
    desc: 'Hadir',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  S: {
    label: 'S',
    desc: 'Sakit',
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dot: 'bg-amber-500',
  },
  I: {
    label: 'I',
    desc: 'Izin',
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  A: {
    label: 'A',
    desc: 'Alpha / Tanpa Ket.',
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
    dot: 'bg-rose-500',
  },
  C: {
    label: 'C',
    desc: 'Cuti',
    bg: 'bg-purple-50 hover:bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  checkIn,
  checkOut,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentCfg = status ? STATUS_CONFIG[status] : null;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={
          status
            ? `${currentCfg?.desc}${checkIn ? ` (${checkIn} - ${checkOut || '?'})` : ''} - Klik untuk ganti`
            : 'Klik untuk isi status'
        }
        className={`w-7 h-6 rounded-md flex items-center justify-center font-bold text-[11px] transition-all duration-150 shadow-xs border ${
          currentCfg
            ? `${currentCfg.bg} ${currentCfg.text} ${currentCfg.border} scale-100 active:scale-95`
            : 'bg-transparent hover:bg-gray-100 text-gray-300 hover:text-gray-500 border-transparent hover:border-gray-200'
        }`}
      >
        {status || '·'}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 z-50 w-36 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 animate-fade-in-up">
          <div className="text-[10px] font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
            Status Absen
          </div>
          <div className="space-y-0.5">
            {(['H', 'S', 'I', 'A', 'C'] as const).map((opt) => {
              const cfg = STATUS_CONFIG[opt];
              const isSelected = status === opt;
              return (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gray-100 font-bold text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                    >
                      {opt}
                    </span>
                    <span className="text-[11px]">{cfg.desc}</span>
                  </div>
                  {isSelected && <span className="text-xs text-[#C00000]">✓</span>}
                </button>
              );
            })}

            <div className="h-px bg-gray-100 my-1" />

            <button
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full text-left px-2 py-1 text-[11px] text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            >
              Reset (Kosongkan)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
