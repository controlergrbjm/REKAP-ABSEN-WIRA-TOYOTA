import * as XLSX from 'xlsx';

// Standard Toyota GR positions in hierarchical order
export const STANDARD_TOYOTA_ROLES = [
  'Koordinator SP',
  'Trainee Leader',
  'Service Advisor',
  'Service Advisor',
  'Service Advisor',
  'Foreman GR',
  'Foreman GR',
  'Ptgs MRA',
  'Ptgs MRA',
  'Teknisi Master',
  'Teknisi Pro',
  'Teknisi Pro',
  'Teknisi Pro',
  'Teknisi Muda',
  'Teknisi Muda',
  'Teknisi Muda',
  'Partman',
  'Partman',
  'Admin Service',
  'Admin Service',
  'Cashier',
  'Customer Relation Officer',
  'Toolkeeper',
  'Driver Delivery',
  'Security',
  'Cleaning Service',
];

export const REAL_SAMPLE_NAMES = [
  'BAMBANG WIDODO',
  'MOHAMMAD RIZKY',
  'HENDRA SETIAWAN',
  'DWI CAHYONO',
  'AGUS PRASETYO',
  'FAJAR NUGROHO',
  'MUHAMMAD ILHAM',
  'SURYA KUSUMA',
  'AHMAD RIFAI',
  'WAHYU HIDAYAT',
  'TRI WIDYASTUTI',
  'EKO PRASETYO',
  'BAGUS SAPUTRA',
  'DEDI KURNIAWAN',
  'ARI WIJAYA',
  'BAYU PRATAMA',
  'DENI SAPUTRA',
  'SIGIT PURNOMO',
  'YUDI KURNIAWAN',
  'ANDI SUSANTO',
  'GUNTUR PERDANA',
  'RIAN ARDIYANTO',
  'FARHAN MAULANA',
  'IRFAN HAKIM',
  'NOVIANTO',
  'DIMAS ADITYA',
  'RUDI HARTONO',
  'SLAMET RIYADI',
  'BUDI SANTOSO',
  'JOKO SUSILO',
  'ANTO WIJAYA',
  'SUPRIYANTO',
  'HARI KURNIAWAN',
  'TEGUH PRAKOSO',
  'SUKRI ANWAR',
  'ARIS MUNANDAR',
  'FITRI RAMADHANI',
  'NUR HIDAYATI',
  'SITI FATIMAH',
  'RATNA DEWI',
  'DEWI ANGGRAENI',
  'LINA MARLINA',
  'MAYA INDAH',
  'PUTRI LESTARI',
  'INDAH PERMATASARI',
  'RIZAL ADI NUGRAHA',
  'FIKRI HAIKAL',
  'ILHAM AKBAR',
  'GILANG RAMADHAN',
  'DICKY WAHYUDI',
  'ALDI FIRMANSYAH',
  'YOGI SAPUTRA',
  'ZAINAL ARIFIN',
  'HASAN BASRI',
  'M. YUSUF',
  'ALI IMRAN',
  'SYAHRUL RAMADHAN',
  'RIDHO PRATAMA',
  'AGUNG WIBOWO',
  'HERI KUSWANTO',
  'DANANG SETIAWAN',
  'FERDIANSYAH',
  'IQBAL TAWAKAL',
  'REZA FAHLEVI',
  'LUKMAN HAKIM',
  'FAUZAN AZHIM',
  'SANDI IRAWAN',
  'VICKY PRASETYO',
  'WILDAN NUGRAHA',
  'YOPY SAPUTRA',
  'ANGGA DWI SAPUTRA',
  'RENDY KURNIAWAN',
  'DONY PRASETYA',
  'PANJI ASMARA',
  'KURNIAWAN EFFENDI',
];

/**
 * Generate a realistic raw Excel file buffer matching the single-sheet format:
 * Nama                  : <nama karyawan>
 * PIN / NIP             : <angka> / <angka>
 * Divisi                : GR
 * Departemen / Kantor   : Workshop
 * Tanggal        | Jam
 * Rabu, 01-07-2026   | 08:26:54 | 17:00:30
 * ...
 */
export function generateSampleRawExcelBuffer(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const rows: (string | null)[][] = [];

  const daysInJuly = 31;
  const idDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  REAL_SAMPLE_NAMES.forEach((name, empIdx) => {
    const pin = 1000 + empIdx + 1;

    // Header block
    rows.push([`Nama                  : ${name}`, null, null]);
    rows.push([`PIN / NIP             : ${pin} / ${pin * 2}`, null, null]);
    rows.push([`Divisi                : GR`, null, null]);
    rows.push([`Departemen / Kantor   : Workshop BJM`, null, null]);
    rows.push([`Tanggal`, `Jam Masuk`, `Jam Keluar`]);

    // Attendance records for July 2026 (01-07-2026 to 31-07-2026)
    for (let day = 1; day <= daysInJuly; day++) {
      const date = new Date(2026, 6, day); // Month 6 = July
      const dayOfWeek = date.getDay(); // 0 = Sunday

      // Most attend on workdays, occasionally off/absent
      const isSunday = dayOfWeek === 0;
      const isAbsent = !isSunday && (empIdx + day) % 17 === 0; // occasional absent for realistic look

      if (!isSunday && !isAbsent) {
        const dayStr = String(day).padStart(2, '0');
        const dayName = idDays[dayOfWeek];
        const dateFormatted = `${dayName}, ${dayStr}-07-2026`;

        const checkInMin = 20 + (day % 15);
        const checkInSec = 10 + ((empIdx * 7 + day) % 45);
        const checkIn = `08:${String(checkInMin).padStart(2, '0')}:${String(checkInSec).padStart(2, '0')}`;

        const checkOutMin = 10 + (day % 20);
        const checkOutSec = 15 + ((empIdx * 3 + day) % 40);
        const checkOut = `17:${String(checkOutMin).padStart(2, '0')}:${String(checkOutSec).padStart(2, '0')}`;

        rows.push([dateFormatted, checkIn, checkOut]);
      }
    }

    // Blank row separator between employee blocks
    rows.push([null, null, null]);
    rows.push([null, null, null]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'ScanLog');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}
