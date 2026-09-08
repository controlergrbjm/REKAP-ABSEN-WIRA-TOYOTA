import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Shield, Building2 } from 'lucide-react';
import { authenticate, saveSession, AppUser } from '../auth/users';

interface LoginPageProps {
  onLogin: (user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const user = authenticate(username, password);
      if (user) {
        saveSession(user);
        onLogin(user);
      } else {
        setError('Username atau Password salah. Silakan coba lagi.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0000] via-[#2D0000] to-[#8B0000] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/3 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C00000] to-[#8B0000] shadow-2xl shadow-red-900/50 mb-4 border border-white/10">
            <span className="text-white font-black text-3xl tracking-tight">T</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            WIRA <span className="text-amber-400">TOYOTA</span>
          </h1>
          <p className="text-red-200/70 text-sm mt-1 font-medium">
            Sistem Rekapitulasi Presensi Karyawan Bengkel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl p-8 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Masuk ke Sistem</h2>
              <p className="text-xs text-white/50">Akses hanya untuk staf berwenang</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Masukkan username Anda"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <p className="text-rose-300 text-xs font-semibold">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#C00000] to-[#E53935] hover:from-[#A00000] hover:to-[#C00000] text-white font-extrabold text-sm shadow-lg shadow-red-900/40 transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer branding */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
          <Building2 className="w-3.5 h-3.5" />
          <span>PT. Wira Megah Toyota Banjarmasin • Sistem Internal</span>
        </div>
      </div>
    </div>
  );
};
