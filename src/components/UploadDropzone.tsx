import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

interface UploadDropzoneProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  onLoadSampleData: () => void;
  isProcessing: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileLoaded,
  onLoadSampleData,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus('error');
      setErrorMessage('Format file harus Excel (.xlsx atau .xls)');
      return;
    }

    setFileName(file.name);
    setUploadStatus('idle');

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        onFileLoaded(e.target.result, file.name);
        setUploadStatus('success');
      }
    };
    reader.onerror = () => {
      setUploadStatus('error');
      setErrorMessage('Gagal membaca file Excel');
    };
    reader.readAsArrayBuffer(file);
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeaveHandler = () => {
    setIsDragOver(false);
  };

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#C00000]" />
            Upload File Mentahan Scan Log
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Format file Excel (.xlsx) satu sheet vertikal hasil export mesin fingerprint.
          </p>
        </div>

        {/* Demo Data Quick Trigger */}
        <button
          onClick={onLoadSampleData}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Muat Sample Real (GR Jul 2026 - 75 Karyawan)</span>
        </button>
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Drop Area */}
      <div
        onDragOver={onDragOverHandler}
        onDragLeave={onDragLeaveHandler}
        onDrop={onDropHandler}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? 'border-[#C00000] bg-red-50/50 scale-[0.99]'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
        }`}
      >
        {isProcessing ? (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C00000] flex items-center justify-center animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Sedang Memproses & Memadankan Data...</p>
              <p className="text-xs text-gray-500">Membaca blok karyawan dan mencocokkan master jabatan</p>
            </div>
            {/* Skeleton bars */}
            <div className="w-64 space-y-2 mt-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5 mx-auto" />
            </div>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#C00000] transition-colors">
              <FileSpreadsheet className="w-7 h-7 text-[#C00000]" />
            </div>

            <div>
              <p className="text-sm font-bold text-gray-800">
                <span className="text-[#C00000] hover:underline">Pilih file Excel</span> atau tarik ke area ini
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Format didukung: .xlsx, .xls • Mendukung ratusan karyawan dalam 1 sheet
              </p>
            </div>

            {uploadStatus === 'success' && fileName && (
              <div className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span>File terpilih: {fileName}</span>
              </div>
            )}

            {uploadStatus === 'error' && errorMessage && (
              <div className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
