import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, ExternalLink, X, RefreshCw, Copy, Check } from 'lucide-react';
import { checkSupabaseConnection, ConnectionStatus, isSupabaseConfigured } from '../backend';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConfigured: isSupabaseConfigured,
    isConnected: false,
    message: 'Memeriksa status database...',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const verifyConnection = async () => {
    setIsChecking(true);
    const result = await checkSupabaseConnection();
    setStatus(result);
    setIsChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      verifyConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyEnvSample = () => {
    const text = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${status.isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Status Database Supabase</h3>
              <p className="text-xs text-gray-300">Wira Toyota Rekap Absensi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            status.isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {status.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {status.isConnected
                  ? 'Supabase PostgreSQL Terhubung'
                  : 'Mode Database Lokal (Offline)'}
              </div>
              <p className="text-xs mt-1 text-gray-600 leading-relaxed">
                {status.message}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {!status.isConnected && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-700">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <span>Cara Mengaktifkan Database Supabase:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-600 leading-normal">
                <li>Buka proyek di <strong>Supabase.com</strong></li>
                <li>Jalankan skema SQL dari file <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono">database/schema.sql</code> di SQL Editor Supabase</li>
                <li>Jalankan data awal dari file <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono">database/seed.sql</code></li>
                <li>Buat file <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono">.env</code> di root folder dan isi:</li>
              </ol>

              <div className="relative mt-2 bg-gray-900 text-gray-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed">
                <div>VITE_SUPABASE_URL=https://proyek-anda.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                <button
                  onClick={copyEnvSample}
                  className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-gray-300 hover:text-white transition-all cursor-pointer"
                  title="Salin contoh format .env"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={verifyConnection}
              disabled={isChecking}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Mengecek...' : 'Uji Koneksi Ulang'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#C00000] hover:bg-[#A00000] text-white font-bold text-xs shadow-md shadow-red-900/20 transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
