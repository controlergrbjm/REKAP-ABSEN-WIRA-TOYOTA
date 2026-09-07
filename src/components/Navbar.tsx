import React, { useState, useRef, useEffect } from 'react';
import { CalendarCheck2, Users, Building2, Sparkles, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { Branch } from '../types';
import { AppUser } from '../auth/users';

interface NavbarProps {
  currentTab: 'rekap' | 'master';
  onTabChange: (tab: 'rekap' | 'master') => void;
  branches: Branch[];
  currentBranch: Branch | null;
  onBranchChange: (branch: Branch) => void;
  onOpenBranchModal: () => void;
  onOpenDbModal?: () => void;
  currentUser: AppUser;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  branches,
  currentBranch,
  onBranchChange,
  onOpenBranchModal,
  onOpenDbModal,
  currentUser,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B0000] via-[#C00000] to-[#E53935] flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <span className="font-black text-sm tracking-wider">T</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 tracking-tight text-base sm:text-lg">
                WIRA <span className="text-[#C00000]">TOYOTA</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-[#C00000] border border-red-100">
                <Sparkles className="w-2.5 h-2.5" /> Rekap Absensi
              </span>
            </div>
            <p className="text-[11px] text-gray-500 -mt-0.5">Sistem Rekapitulasi Presensi Karyawan Bengkel</p>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/80">
          <button
            onClick={() => onTabChange('rekap')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              currentTab === 'rekap'
                ? 'bg-white text-gray-900 shadow-sm shadow-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <CalendarCheck2 className={`w-4 h-4 ${currentTab === 'rekap' ? 'text-[#C00000]' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">Rekap Absensi</span>
          </button>
          <button
            onClick={() => onTabChange('master')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              currentTab === 'master'
                ? 'bg-white text-gray-900 shadow-sm shadow-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Users className={`w-4 h-4 ${currentTab === 'master' ? 'text-[#C00000]' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">Master Karyawan</span>
          </button>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Branch Selector */}
          <div className="relative hidden md:block">
            <select
              value={currentBranch?.id || ''}
              onChange={(e) => {
                const found = branches.find(b => b.id === e.target.value);
                if (found) onBranchChange(found);
              }}
              className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C00000]/20 transition-all"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            <Building2 className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={onOpenBranchModal}
            title="Kelola Cabang"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
          >
            <Building2 className="w-4 h-4" />
          </button>

          {/* Database Status Button */}
          {onOpenDbModal && (
            <button
              onClick={onOpenDbModal}
              title="Database Supabase Aktif & Terhubung"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-xs font-bold text-emerald-800 transition-all cursor-pointer shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-300" />
              <span className="hidden sm:inline">Supabase</span>
            </button>
          )}

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all group cursor-pointer"
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                style={{ background: currentUser.color }}
              >
                {currentUser.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-gray-900 leading-tight">{currentUser.displayName}</div>
                <div className="text-[10px] text-gray-500 font-medium">{currentUser.roleLabel}</div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 animate-fade-in-up">
                {/* User Info Card */}
                <div className="px-3 py-2.5 mb-1 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm"
                      style={{ background: currentUser.color }}
                    >
                      {currentUser.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{currentUser.displayName}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span className="text-[11px] font-semibold text-emerald-700">{currentUser.roleLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-1" />

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
