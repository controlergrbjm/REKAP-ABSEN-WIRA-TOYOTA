/**
 * Urutan Master Karyawan Standar (73 Karyawan)
 * Sesuai foto susunan master absensi WIRA TOYOTA.
 * 
 * Aturan Urutan:
 * 1. Urutan 1 s/d 73 mengikuti persis daftar di bawah ini.
 * 2. Karyawan baru (yang tidak terdaftar di 73 nama ini) OTOMATIS diletakkan di bagian paling bawah.
 */

export const MASTER_EMPLOYEE_ORDER: readonly string[] = [
  'Junaidi',
  'Rizky N Dimas',
  'Rezky Satrio Suseno',
  'Leonardo H. S.',
  'Wayan Sadnye',
  'Rudi Setya Darma',
  'Sugjanto',
  'Anang Helmi',
  'M. Fajar',
  'Ronny Fernanda',
  'Luckyta Dewi K',
  'Normansyah',
  'Sapriati',
  'Marissa',
  'M. Rizky Fadillah',
  'Yuliana',
  'Nurul Laili',
  'Azizah Rahmaniah',
  'Yunita',
  'M. Dhani',
  'Fahrurrazi',
  'M. Ramadani',
  'Safrudin',
  'M. Husein',
  'Anto',
  'Hairuddin',
  'Aminuddin',
  'BUDI HARIYADI',
  'FRENGKY AGUS MULIYANTO',
  'Mohamad nor',
  'Lendi bagus wicaksono',
  'RICHARD TANUJAYA SANTOSO',
  'ADITIO',
  'Muhamad Zaki',
  'FIRMAN ABDI',
  'DAVA',
  'TOYEF',
  'ILHAM MAULANA',
  'AWALUDIN',
  'BAGAS ADE PRASETYO',
  'RAMANA',
  'M FAJAR',
  'Fauzi',
  'SYARIF HIDAYAT',
  'Ahmad Fasya Ramadhani',
  'M. Hanafiah',
  'M.Subhan',
  'Bagus Widya Pratama',
  'Rezky Anugrah',
  'Aditya Ridho',
  'Sudarno',
  'Rangga Permana',
  'Eka Wahyu Yuliana',
  'M.Fahmi',
  'Restian',
  'A. Siddiq. M',
  'Anang',
  'M. Arul',
  'Surya Paloh',
  'Debby Marisa',
  'Kevin Aditya W',
  'Lukman Nul H',
  'M Aditiya F',
  'Bima R',
  'Iqbal baihaki',
  'Aulia Akbar',
  'Abdu Rahman',
  'Nor Kamali',
  'M Khaliq',
  'Yoga Setiawan',
  'GAFUR',
  'TAHIR',
  'A Fitriansyah',
] as const;

export function cleanName(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Mencari posisi nomor urut (1-based index) dari nama karyawan sesuai urutan master 73 foto.
 * Menggunakan pencocokan berjenjang:
 * 1. Exact match (case & simbol)
 * 2. Case-insensitive exact match
 * 3. Clean alphanumeric match (abaikan spasi, titik, dll)
 * 
 * Jika tidak ditemukan (karyawan baru), mengembalikan 9999 agar otomatis ke bawah.
 */
export function getMasterOrderIndex(name: string): number {
  if (!name) return 9999;
  const trimmed = name.trim();

  // 1. Exact match
  const exactIdx = MASTER_EMPLOYEE_ORDER.findIndex(m => m === trimmed);
  if (exactIdx !== -1) return exactIdx + 1;

  // 2. Case-insensitive
  const lowerTrimmed = trimmed.toLowerCase();
  const lowerIdx = MASTER_EMPLOYEE_ORDER.findIndex(m => m.toLowerCase() === lowerTrimmed);
  if (lowerIdx !== -1) return lowerIdx + 1;

  // 3. Clean alphanumeric (menangani perbedaan spasi / titik seperti M.Subhan vs M. Subhan)
  const clean = cleanName(name);
  const cleanIdx = MASTER_EMPLOYEE_ORDER.findIndex(m => cleanName(m) === clean);
  if (cleanIdx !== -1) return cleanIdx + 1;

  // Karyawan baru -> letakkan di bawah
  return 9999;
}

export function isMasterEmployee(name: string): boolean {
  return getMasterOrderIndex(name) <= MASTER_EMPLOYEE_ORDER.length;
}

/**
 * Mengurutkan array karyawan persis sesuai foto susunan 73 karyawan master.
 * Karyawan baru yang tidak ada di foto akan otomatis diletakkan di paling bawah.
 */
export function sortEmployeesByMasterOrder<T extends { name: string; sort_order?: number }>(
  employees: T[]
): T[] {
  return [...employees].sort((a, b) => {
    const orderA = getMasterOrderIndex(a.name);
    const orderB = getMasterOrderIndex(b.name);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Jika keduanya karyawan baru di luar master 73, urutkan berdasarkan sort_order atau nama
    const sortA = a.sort_order ?? 0;
    const sortB = b.sort_order ?? 0;
    if (sortA !== sortB) {
      return sortA - sortB;
    }

    return a.name.localeCompare(b.name);
  });
}
