/**
 * Urutan Master Karyawan Standar (73 Karyawan)
 * Sesuai foto susunan master absensi WIRA TOYOTA.
 *
 * Aturan Urutan:
 * 1. Urutan 1 s/d 73 mengikuti persis daftar di bawah ini.
 * 2. Karyawan baru (yang tidak terdaftar di 73 nama ini) OTOMATIS diletakkan di bagian paling bawah.
 */

export interface MasterEmployee {
  name: string;
  position: string;
}

/** 73 karyawan master beserta jabatan sesuai foto referensi */
/** 73 karyawan master beserta jabatan sesuai foto referensi */
export const MASTER_EMPLOYEES: readonly MasterEmployee[] = [
  { name: 'Junaidi',                   position: 'Koordinator SP' },
  { name: 'Rizky N Dimas',             position: 'Trainee Leader Operation W/S' },
  { name: 'Rezky Satrio Suseno',       position: 'Trainee Leader Operation TMS' },
  { name: 'Leonardo H. S.',            position: 'CR Bengkel Trainee' },
  { name: 'Wayan Sadnye',              position: 'Service Advisor' },
  { name: 'Rudi Setya Darma',          position: 'Service Advisor' },
  { name: 'Sugianto',                  position: 'Service Advisor' },
  { name: 'Anang Helmi',               position: 'Service Advisor' },
  { name: 'M. Fajar',                  position: 'Service Advisor' },
  { name: 'Ronny Fernanda',            position: 'Service Advisor' },
  { name: 'Luckyta Dewi K',            position: 'Ptgs MRA (Leader)' },
  { name: 'Normansyah',                position: 'Ptgs MRA (Booking)' },
  { name: 'Sapriati',                  position: 'Ptgs MRA (Call)' },
  { name: 'Marissa',                   position: 'Ptgs MRA (Call)' },
  { name: 'M. Rizky Fadillah',         position: 'Ptgs MRA (Follow Up)' },
  { name: 'Yuliana',                   position: 'Ptgs MRA (Booking)' },
  { name: 'Nurul Laili',               position: 'Ptgs MRA (Support SA)' },
  { name: 'Azizah Rahmaniah',          position: 'Ptgs MRA (Support SSC & Warranty)' },
  { name: 'Yunita',                    position: 'Trainee Ptgs MRA (Support TMS)' },
  { name: 'M. Dhani',                  position: 'Trainee Technical Leader' },
  { name: 'Fahrurrazi',                position: 'Foreman GR' },
  { name: 'M. Ramadani',               position: 'Foreman GR' },
  { name: 'Safrudin',                  position: 'Foreman' },
  { name: 'M. Husein',                 position: 'Foreman' },
  { name: 'Anto',                      position: 'Foreman (Controller)' },
  { name: 'Hairuddin',                 position: 'Foreman (Controller)' },
  { name: 'Aminuddin',                 position: 'Technician' },
  { name: 'BUDI HARIYADI',             position: 'Technician GR' },
  { name: 'FRENGKY AGUS MULIYANTO',    position: 'Technician GR' },
  { name: 'Mohamad nor',               position: 'Technician' },
  { name: 'Lendi bagus wicaksono',     position: 'Technician GR' },
  { name: 'RICHARD TANUJAYA SANTOSO',  position: 'Technician GR' },
  { name: 'ADITIO',                    position: 'Technician' },
  { name: 'Muhamad Zaki',              position: 'Helper Technician' },
  { name: 'FIRMAN ABDI',               position: 'Technician' },
  { name: 'DAVA',                      position: 'Technician' },
  { name: 'TOYEF',                     position: 'Technician GR' },
  { name: 'ILHAM MAULANA',             position: 'Trainee Technician GR' },
  { name: 'AWALUDIN',                  position: 'Trainee Technician' },
  { name: 'BAGAS ADE PRASETYO',        position: 'Trainee Technician GR' },
  { name: 'RAMANA',                    position: 'Trainee Technician GR' },
  { name: 'M FAJAR',                   position: 'Trainee Technician' },
  { name: 'Fauzi',                     position: 'Trainee Technician' },
  { name: 'SYARIF HIDAYAT',            position: 'Trainee Technician' },
  { name: 'Ahmad Fasya Ramadhani',     position: 'Trainee Technician' },
  { name: 'M. Hanafiah',               position: 'Ptgs Gudang Bahan' },
  { name: 'M.Subhan',                  position: 'Ptgs Ganti Oli' },
  { name: 'Bagus Widya Pratama',       position: 'Ptgs Gudang SST' },
  { name: 'Rezky Anugrah',             position: 'Ptgs Coating' },
  { name: 'Aditya Ridho',              position: 'Part Man' },
  { name: 'Sudarno',                   position: 'Part Man' },
  { name: 'Rangga Permana',            position: 'Part Man' },
  { name: 'Eka Wahyu Yuliana',         position: 'Petugas Billing Tagihan SBE' },
  { name: 'M.Fahmi',                   position: 'Petugas Billing' },
  { name: 'Restian',                   position: 'Petugas Validasi Tagihan SBE' },
  { name: 'A. Siddiq. M',              position: 'Ptgs Vallet' },
  { name: 'Anang',                     position: 'Ptgs Vallet' },
  { name: 'M. Arul',                   position: 'Dispatcher GR Bjm' },
  { name: 'Surya Paloh',               position: 'Trainee Ptgs MRA' },
  { name: 'Debby Marisa',              position: 'Trainee Ptgs MRA (Follow Up)' },
  { name: 'Kevin Aditya W',            position: 'WASHING' },
  { name: 'Lukman Nul H',              position: 'WASHING' },
  { name: 'M Aditiya F',               position: 'WASHING' },
  { name: 'Bima R',                    position: 'Maintenance' },
  { name: 'Iqbal baihaki',             position: 'Trainee Admin Control' },
  { name: 'Aulia Akbar',               position: 'Trainee Technician OJT' },
  { name: 'Abdu Rahman',               position: 'Trainee Technician OJT Magang' },
  { name: 'Nor Kamali',                position: 'PDS' },
  { name: 'M Khaliq',                  position: 'OJT PDS' },
  { name: 'Yoga Setiawan',             position: 'OJT PDS' },
  { name: 'GAFUR',                     position: 'WASHING PDS' },
  { name: 'TAHIR',                     position: 'WASHING PDS' },
  { name: 'A Fitriansyah',             position: 'DRIVER PDS' },
] as const;

/** Hanya nama karyawan (untuk backward compatibility) */
export const MASTER_EMPLOYEE_ORDER: readonly string[] = MASTER_EMPLOYEES.map(e => e.name);

export function cleanName(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Levenshtein distance sederhana untuk mencocokkan nama dengan toleransi typo kecil (1-2 huruf).
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

/**
 * Alias nama-nama yang sering berbeda dari mesin fingerprint vs daftar master.
 * Key   = cleanName(nama di mesin/file absen)
 * Value = nama PERSIS di MASTER_EMPLOYEES
 */
export const NAME_ALIASES: Record<string, string> = {
  // 4. Leonardo H. S.
  'leonardohs'             : 'Leonardo H. S.',
  'leonardoh'              : 'Leonardo H. S.',

  // 6. Rudi Setya Darma
  'rudis'                  : 'Rudi Setya Darma',
  'rudisetya'              : 'Rudi Setya Darma',

  // 7. Sugianto
  'sugjanto'               : 'Sugianto',
  'sugianto'               : 'Sugianto',

  // 10. Ronny Fernanda
  'ronyfernanda'           : 'Ronny Fernanda',
  'ronifernanda'           : 'Ronny Fernanda',

  // 11. Luckyta Dewi K
  'luckytadewi'            : 'Luckyta Dewi K',
  'lukytadewik'            : 'Luckyta Dewi K',
  'luckytadewik'           : 'Luckyta Dewi K',

  // 14. Marissa
  'marisa'                 : 'Marissa',
  'marissa'                : 'Marissa',

  // 18. Azizah Rahmaniah
  'azizahr'                : 'Azizah Rahmaniah',
  'azizahrahmania'         : 'Azizah Rahmaniah',
  'azizahrahmanian'        : 'Azizah Rahmaniah',

  // 22. M. Ramadani
  'mramadhani'             : 'M. Ramadani',
  'mramadani'              : 'M. Ramadani',
  'ramadhani'              : 'M. Ramadani',

  // 23. Safrudin
  'sapruddin'              : 'Safrudin',
  'saprudin'               : 'Safrudin',
  'safruddin'              : 'Safrudin',

  // 24. M. Husein
  'mhusen'                 : 'M. Husein',
  'mhusein'                : 'M. Husein',
  'husen'                  : 'M. Husein',

  // 28. BUDI HARIYADI
  'budihariyad'            : 'BUDI HARIYADI',
  'budihariyard'           : 'BUDI HARIYADI',
  'budihariyardi'          : 'BUDI HARIYADI',
  'budihariyadi'           : 'BUDI HARIYADI',

  // 29. FRENGKY AGUS MULIYANTO
  'frengky'                : 'FRENGKY AGUS MULIYANTO',
  'frengki'                : 'FRENGKY AGUS MULIYANTO',
  'frengkyagus'            : 'FRENGKY AGUS MULIYANTO',

  // 30. Mohamad nor
  'mnor'                   : 'Mohamad nor',
  'mohamadnor'             : 'Mohamad nor',
  'muhammadnor'            : 'Mohamad nor',

  // 31. Lendi bagus wicaksono
  'lendibagus'             : 'Lendi bagus wicaksono',
  'lendibagusw'            : 'Lendi bagus wicaksono',
  'lendibaguswicaksono'    : 'Lendi bagus wicaksono',

  // 32. RICHARD TANUJAYA SANTOSO
  'richardt'               : 'RICHARD TANUJAYA SANTOSO',
  'richardtanujaya'        : 'RICHARD TANUJAYA SANTOSO',
  'richardts'              : 'RICHARD TANUJAYA SANTOSO',

  // 34. Muhamad Zaki
  'mzaki'                  : 'Muhamad Zaki',
  'muhamadzaki'            : 'Muhamad Zaki',

  // 35. FIRMAN ABDI
  'firmana'                : 'FIRMAN ABDI',
  'firmanabdi'             : 'FIRMAN ABDI',

  // 36. DAVA
  'davaakhmad'             : 'DAVA',
  'davaahmad'              : 'DAVA',
  'dava'                   : 'DAVA',

  // 37. TOYEF
  'mtoyef'                 : 'TOYEF',
  'toyef'                  : 'TOYEF',

  // 39. AWALUDIN
  'awalluddin'             : 'AWALUDIN',
  'awalludin'              : 'AWALUDIN',
  'awaluddin'              : 'AWALUDIN',
  'awaludin'               : 'AWALUDIN',

  // 40. BAGAS ADE PRASETYO
  'bagasade'               : 'BAGAS ADE PRASETYO',
  'bagasadep'              : 'BAGAS ADE PRASETYO',

  // 41. RAMANA
  'ramana'                 : 'RAMANA',
  'ramona'                 : 'RAMANA',

  // 44. SYARIF HIDAYAT
  'syarifh'                : 'SYARIF HIDAYAT',
  'syarifhidayat'          : 'SYARIF HIDAYAT',

  // 45. Ahmad Fasya Ramadhani
  'afasyar'                : 'Ahmad Fasya Ramadhani',
  'ahmadfasya'             : 'Ahmad Fasya Ramadhani',
  'ahmadfasyar'            : 'Ahmad Fasya Ramadhani',

  // 47. M.Subhan
  'subhan'                 : 'M.Subhan',
  'msubhan'                : 'M.Subhan',

  // 48. Bagus Widya Pratama
  'bagusw'                 : 'Bagus Widya Pratama',
  'baguswidya'             : 'Bagus Widya Pratama',
  'baguswidyapratama'      : 'Bagus Widya Pratama',

  // 49. Rezky Anugrah
  'rezkyanugrah'           : 'Rezky Anugrah',
  'rezkyanugraha'          : 'Rezky Anugrah',

  // 53. Eka Wahyu Yuliana
  'ekawyuliana'            : 'Eka Wahyu Yuliana',
  'ekawahyuyuliana'        : 'Eka Wahyu Yuliana',
  'ekawahyu'               : 'Eka Wahyu Yuliana',

  // 54. M.Fahmi
  'mfahmi'                 : 'M.Fahmi',
  'fahmi'                  : 'M.Fahmi',

  // 56. A. Siddiq. M
  'ahmadshiddiqm'          : 'A. Siddiq. M',
  'asiddiqm'               : 'A. Siddiq. M',
  'ahmadsiddiqm'           : 'A. Siddiq. M',
  'ahmadshiddiq'           : 'A. Siddiq. M',

  // 57. Anang
  'ananghusain'            : 'Anang',
  'anang'                  : 'Anang',

  // 60. Debby Marisa
  'debbymarsa'             : 'Debby Marisa',
  'debbymarisa'            : 'Debby Marisa',

  // 63. M Aditiya F
  'adityarf'               : 'M Aditiya F',
  'adityar'                : 'M Aditiya F',
  'maditiyaf'              : 'M Aditiya F',

  // 67. Abdu Rahman
  'abdurahman'             : 'Abdu Rahman',
  'abdurrahman'            : 'Abdu Rahman',
};

/**
 * Mencari posisi nomor urut (1-based index) dari nama karyawan sesuai urutan master 73 foto.
 * Menggunakan pencocokan berjenjang:
 * 1. Exact match (case & simbol)
 * 2. Case-insensitive exact match
 * 3. Special handling untuk M. Fajar (#9) vs M FAJAR (#42)
 * 4. Clean alphanumeric match (abaikan spasi, titik, dll)
 * 5. Alias lookup (nama dari mesin fingerprint yang disingkat/berbeda)
 * 6. Prefix / Substring match aman
 * 7. Levenshtein distance (toleransi typo 1-2 karakter)
 *
 * Jika tidak ditemukan (karyawan baru), mengembalikan 9999 agar otomatis diletakkan di bagian paling bawah.
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

  const clean = cleanName(name);

  // 3. Khusus pembeda M. Fajar (No 9 - Service Advisor) vs M FAJAR (No 42 - Trainee Technician)
  if (clean === 'mfajar') {
    if (trimmed.includes('.')) {
      return 9; // M. Fajar (Service Advisor)
    } else {
      return 42; // M FAJAR (Trainee Technician)
    }
  }

  // 4. Alias lookup (Prioritas tinggi untuk nama mesin fingerprint yang bervariasi)
  const aliasTarget = NAME_ALIASES[clean];
  if (aliasTarget) {
    const aliasIdx = MASTER_EMPLOYEE_ORDER.findIndex(m => m === aliasTarget);
    if (aliasIdx !== -1) return aliasIdx + 1;
  }

  // 5. Clean alphanumeric
  const cleanIdx = MASTER_EMPLOYEE_ORDER.findIndex(m => cleanName(m) === clean);
  if (cleanIdx !== -1) return cleanIdx + 1;

  // 6. Prefix / Substring match aman (panjang minimal 5 karakter)
  if (clean.length >= 5) {
    const prefixIdx = MASTER_EMPLOYEE_ORDER.findIndex(m => {
      const cm = cleanName(m);
      return cm.startsWith(clean) || clean.startsWith(cm);
    });
    if (prefixIdx !== -1) return prefixIdx + 1;
  }

  // 7. Levenshtein distance match (toleransi typo 1 karakter, huruf pertama wajib sama, panjang >= 6)
  if (clean.length >= 6) {
    let bestDist = 2;
    let bestIdx = -1;
    MASTER_EMPLOYEE_ORDER.forEach((m, idx) => {
      const cm = cleanName(m);
      if (cm[0] === clean[0] && Math.abs(cm.length - clean.length) <= 1) {
        const dist = levenshteinDistance(clean, cm);
        if (dist <= 1 && dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }
    });
    if (bestIdx !== -1) {
      return bestIdx + 1;
    }
  }

  // Karyawan baru -> letakkan di bawah
  return 9999;
}

/**
 * Mendapatkan jabatan default dari daftar master berdasarkan nama karyawan.
 */
export function getMasterPosition(name: string): string | null {
  if (!name) return null;
  const idx = getMasterOrderIndex(name);
  if (idx <= MASTER_EMPLOYEES.length) {
    return MASTER_EMPLOYEES[idx - 1].position;
  }
  return null;
}

/**
 * Mendapatkan nama resmi dari daftar master jika karyawan cocok.
 */
export function getMasterOfficialName(name: string): string | null {
  if (!name) return null;
  const idx = getMasterOrderIndex(name);
  if (idx <= MASTER_EMPLOYEES.length) {
    return MASTER_EMPLOYEES[idx - 1].name;
  }
  return null;
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
