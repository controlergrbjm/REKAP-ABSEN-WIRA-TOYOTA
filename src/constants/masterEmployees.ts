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
export const MASTER_EMPLOYEES: readonly MasterEmployee[] = [
  { name: 'Junaidi',                   position: 'Koordinator SP' },
  { name: 'Rizky N Dimas',             position: 'Trainee Leader Operation W/S' },
  { name: 'Rezky Satrio Suseno',       position: 'Trainee Leader Operation TMS' },
  { name: 'Leonardo H. S.',            position: 'CR Bengkel Trainee' },
  { name: 'Wayan Sadnye',              position: 'Service Advisor' },
  { name: 'Rudi Setya Darma',          position: 'Service Advisor' },
  { name: 'Sugjanto',                  position: 'Service Advisor' },
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
  { name: 'M. Dhani',                  position: 'Technical Leader' },
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
  { name: 'M. Arul',                   position: 'Dispatcher CR BJm' },
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
 * Alias nama-nama yang sering berbeda dari mesin fingerprint vs daftar master.
 * Key   = cleanName(nama di mesin/file absen)
 * Value = nama PERSIS di MASTER_EMPLOYEES
 */
export const NAME_ALIASES: Record<string, string> = {
  // Ronny Fernanda
  'ronyfernanda'           : 'Ronny Fernanda',
  'ronifernanda'           : 'Ronny Fernanda',

  // Rudi Setya Darma
  'rudis'                  : 'Rudi Setya Darma',
  'rudisetya'              : 'Rudi Setya Darma',

  // Luckyta Dewi K
  'luckytadewi'            : 'Luckyta Dewi K',
  'lukytadewik'            : 'Luckyta Dewi K',

  // BUDI HARIYADI
  'budihariyad'            : 'BUDI HARIYADI',
  'budihariyardi'          : 'BUDI HARIYADI',
  'budihariyards'          : 'BUDI HARIYADI',

  // FRENGKY AGUS MULIYANTO
  'frengky'                : 'FRENGKY AGUS MULIYANTO',
  'frengkyagus'            : 'FRENGKY AGUS MULIYANTO',

  // RICHARD TANUJAYA SANTOSO
  'richardt'               : 'RICHARD TANUJAYA SANTOSO',
  'richardtanujaya'        : 'RICHARD TANUJAYA SANTOSO',
  'richardts'              : 'RICHARD TANUJAYA SANTOSO',

  // Azizah Rahmaniah
  'azizahr'                : 'Azizah Rahmaniah',
  'azizahrahmania'         : 'Azizah Rahmaniah',
  'azizahrahmanian'        : 'Azizah Rahmaniah',

  // BAGAS ADE PRASETYO
  'bagasade'               : 'BAGAS ADE PRASETYO',
  'bagasadep'              : 'BAGAS ADE PRASETYO',

  // SYARIF HIDAYAT
  'syarifh'                : 'SYARIF HIDAYAT',
  'syarifhidayat'          : 'SYARIF HIDAYAT',

  // Ahmad Fasya Ramadhani
  'afasyar'                : 'Ahmad Fasya Ramadhani',
  'ahmadfasya'             : 'Ahmad Fasya Ramadhani',
  'ahmadfasyar'            : 'Ahmad Fasya Ramadhani',

  // M. Husein — backup (seharusnya match via clean tapi jaga-jaga)
  'mhusein'                : 'M. Husein',

  // M. Ramadani — backup
  'mramadani'              : 'M. Ramadani',

  // Abdu Rahman — backup
  'abdurahman'             : 'Abdu Rahman',

  // Muhamad Zaki
  'mzaki'                  : 'Muhamad Zaki',
  'muhamadzaki'            : 'Muhamad Zaki',

  // FIRMAN ABDI
  'firmana'                : 'FIRMAN ABDI',
  'firmanabdi'             : 'FIRMAN ABDI',

  // A. Siddiq. M
  'ahmadshiddiqm'          : 'A. Siddiq. M',
  'asiddiqm'               : 'A. Siddiq. M',
  'ahmadsiddiqm'           : 'A. Siddiq. M',

  // Sugjanto — backup
  'sugjanto'               : 'Sugjanto',

  // M.Subhan
  'subhan'                 : 'M.Subhan',
  'msubhan'                : 'M.Subhan',

  // ILHAM MAULANA
  'ilhammaulana'           : 'ILHAM MAULANA',

  // Eka Wahyu Yuliana
  'ekawahyuyuliana'        : 'Eka Wahyu Yuliana',
  'ekawahyu'               : 'Eka Wahyu Yuliana',

  // M.Fahmi
  'mfahmi'                 : 'M.Fahmi',
  'fahmi'                  : 'M.Fahmi',
};

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

  // 4. Alias lookup (nama dari mesin fingerprint yang berbeda dari master)
  const aliasTarget = NAME_ALIASES[clean];
  if (aliasTarget) {
    const aliasIdx = MASTER_EMPLOYEE_ORDER.findIndex(m => m === aliasTarget);
    if (aliasIdx !== -1) return aliasIdx + 1;
  }

  // Karyawan baru -> letakkan di bawah
  return 9999;
}

/**
 * Mendapatkan jabatan default dari daftar master berdasarkan nama karyawan.
 * Berguna saat import data yang tidak menyertakan jabatan.
 */
export function getMasterPosition(name: string): string | null {
  if (!name) return null;
  const trimmed = name.trim();

  // 1. Exact match
  let entry = MASTER_EMPLOYEES.find(m => m.name === trimmed);
  if (entry) return entry.position;

  // 2. Case-insensitive
  const lower = trimmed.toLowerCase();
  entry = MASTER_EMPLOYEES.find(m => m.name.toLowerCase() === lower);
  if (entry) return entry.position;

  // 3. Clean alphanumeric
  const clean = cleanName(name);
  entry = MASTER_EMPLOYEES.find(m => cleanName(m.name) === clean);
  if (entry) return entry.position;

  // 4. Alias lookup
  const aliasTarget = NAME_ALIASES[clean];
  if (aliasTarget) {
    entry = MASTER_EMPLOYEES.find(m => m.name === aliasTarget);
    if (entry) return entry.position;
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
