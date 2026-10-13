import * as XLSX from 'xlsx';
import { HrdDataset, HrdEmployeeRecord, HrdDayCell } from '../types/hrd';
import { createStandardCutoffPeriod, generateHrdDateColumns } from './hrdParser';

interface SampleEmployeeDef {
  no: number;
  name: string;
  category: string;
  note?: string;
  sDays?: number[]; // days with 'S' (Sakit)
  iDays?: number[]; // days with 'I' (Izin)
  aDays?: number[]; // days with 'A' (Alpha)
  cDays?: number[]; // days with 'C' (Cuti)
}

export const SAMPLE_HRD_EMPLOYEES: SampleEmployeeDef[] = [
  // GAJI STAFF CABANG
  { no: 1,  name: 'Stephanoe Tjostjodianto',    category: 'GAJI STAFF CABANG' },
  { no: 2,  name: 'Ahmad Fauzie',               category: 'GAJI STAFF CABANG' },
  { no: 3,  name: 'Markus Andriyani',           category: 'GAJI STAFF CABANG' },
  { no: 4,  name: 'Nur Mutia',                  category: 'GAJI STAFF CABANG' },
  { no: 5,  name: 'Riky Brizal',                category: 'GAJI STAFF CABANG' },
  { no: 6,  name: 'Elisabeth Veronica Tjandra', category: 'GAJI STAFF CABANG' },
  { no: 7,  name: 'Lilando Krisdila',           category: 'GAJI STAFF CABANG' },
  { no: 8,  name: 'Subhan Helmi',               category: 'GAJI STAFF CABANG' },
  { no: 9,  name: 'Harjo Akbar',                category: 'GAJI STAFF CABANG' },
  { no: 10, name: 'Hardy Ramadhan',             category: 'GAJI STAFF CABANG' },
  { no: 11, name: 'Adelia Eka Permana',         category: 'GAJI STAFF CABANG' },
  { no: 12, name: 'Nur Kamali',                 category: 'GAJI STAFF CABANG', note: 'PDS',    sDays: [11] },
  { no: 13, name: 'Ahmad Fitriansyah',          category: 'GAJI STAFF CABANG' },
  { no: 14, name: 'Muhammad Khaliq Al Farisi',  category: 'GAJI STAFF CABANG', note: 'Tr PDS', sDays: [28] },
  { no: 15, name: 'Muhammad Tahir',             category: 'GAJI STAFF CABANG', note: 'PHL' },
  { no: 16, name: 'Gafar',                      category: 'GAJI STAFF CABANG', note: 'PHL' },

  // GAJI STAFF BENGKEL
  { no: 17, name: 'Angga Perdana Kusuma',       category: 'GAJI STAFF BENGKEL' },
  { no: 18, name: 'Yulianor',                   category: 'GAJI STAFF BENGKEL' },
  { no: 19, name: 'Febriyadi',                  category: 'GAJI STAFF BENGKEL' },
  { no: 20, name: 'Muhammad Rizki',             category: 'GAJI STAFF BENGKEL' },

  // GAJI STAFF OUTLET
  { no: 21, name: 'Akhmad Budiman Petty (KM2)', category: 'GAJI STAFF OUTLET' },
  { no: 22, name: 'Fony Hendrawan (PLH)',       category: 'GAJI STAFF OUTLET' },
  { no: 23, name: "Muhammad Ahya' (BTL)",       category: 'GAJI STAFF OUTLET' },
  { no: 24, name: 'Gusti Raldian Muliana (KTG)',category: 'GAJI STAFF OUTLET' },
  { no: 25, name: 'Ahmad Fauzan Rahman (MRB)',  category: 'GAJI STAFF OUTLET', note: '[RNA]' },

  // BANJARMASIN
  { no: 26, name: 'M. Azhari',                  category: 'BANJARMASIN', note: 'GSO' },
  { no: 27, name: 'Yovino Yohanes Mastiono',    category: 'BANJARMASIN', note: 'GSO' },
];

/**
 * Generate in-memory HrdDataset for demo (16 Agustus s.d 15 September 2026)
 */
export function generateSampleHrdDataset(branchId: string = 'default_branch'): HrdDataset {
  const period = createStandardCutoffPeriod(9, 2026); // 16 Agu s.d 15 Sep 2026
  const dateColumns = generateHrdDateColumns(period);

  const categories = ['GAJI STAFF CABANG', 'GAJI STAFF BENGKEL', 'GAJI STAFF OUTLET', 'BANJARMASIN'];

  // Off days based on image (17, 24, 31 Aug & 7, 14 Sep)
  const offDays = new Set([17, 24, 31, 7, 14]);

  const employees: HrdEmployeeRecord[] = SAMPLE_HRD_EMPLOYEES.map((empDef) => {
    const cells: Record<string, HrdDayCell> = {};

    dateColumns.forEach((col) => {
      // If it's Sunday or an off day from screenshot
      if (col.isSunday || offDays.has(col.dayNumber)) {
        cells[col.dateKey] = {
          statusCode: '',
          rawText: '',
          checkIn: null,
          checkOut: null,
        };
        return;
      }

      // Check for Sakit (S)
      if (empDef.sDays?.includes(col.dayNumber)) {
        cells[col.dateKey] = {
          statusCode: 'S',
          rawText: 'S',
          checkIn: null,
          checkOut: null,
        };
        return;
      }

      // Check for Izin (I)
      if (empDef.iDays?.includes(col.dayNumber)) {
        cells[col.dateKey] = {
          statusCode: 'I',
          rawText: 'I',
          checkIn: null,
          checkOut: null,
        };
        return;
      }

      // Check for Alpha (A)
      if (empDef.aDays?.includes(col.dayNumber)) {
        cells[col.dateKey] = {
          statusCode: 'A',
          rawText: 'A',
          checkIn: null,
          checkOut: null,
        };
        return;
      }

      // Check for Cuti (C)
      if (empDef.cDays?.includes(col.dayNumber)) {
        cells[col.dateKey] = {
          statusCode: 'C',
          rawText: 'C',
          checkIn: null,
          checkOut: null,
        };
        return;
      }

      // Realistic timestamps like the screenshot:
      // e.g. 08:15 / 17:01, 08:24 / 17:45, 08:05 / 16:48
      const inHour = 8;
      const inMin = 5 + ((empDef.no * 7 + col.dayNumber * 3) % 25);
      const outHour = 16 + ((empDef.no + col.dayNumber) % 3 === 0 ? 1 : 0);
      const outMin = 10 + ((empDef.no * 5 + col.dayNumber * 11) % 40);

      const checkInStr = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}`;
      const checkOutStr = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}`;
      const rawText = `${checkInStr}\n${checkOutStr}`;

      // Because it contains time, status code is 'H' (as per requirement!)
      cells[col.dateKey] = {
        statusCode: 'H',
        rawText,
        checkIn: checkInStr,
        checkOut: checkOutStr,
      };
    });

    return {
      id: `hrd_emp_${empDef.no}_${empDef.name.replace(/\s+/g, '_')}`,
      no: empDef.no,
      name: empDef.name,
      category: empDef.category,
      note: empDef.note || '',
      cells,
      deductionCount: empDef.sDays?.length ? 0 : 0,
    };
  });

  return {
    id: `hrd_demo_${Date.now()}`,
    branchId,
    branchName: 'BANJARMASIN',
    fileName: 'REKAP_HRD_16Agu_15Sep2026.xlsx',
    sheetName: 'September',
    period,
    categories,
    employees,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Generate Excel ArrayBuffer for download or file upload testing
 * Matches the exact structure of the HRD sheet shown in the screenshot!
 */
export function generateSampleHrdExcelBuffer(): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  const period = createStandardCutoffPeriod(9, 2026); // 16 Agu s.d 15 Sep 2026
  const dateColumns = generateHrdDateColumns(period);

  const months = ['BJM Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September'];

  months.forEach(sheetName => {
    const wsData: (string | number)[][] = [];

    // Row 0: Top Header
    // Col 0: "BANJARMASIN", Col 3: "16 Agustus s.d 15 September 2026", Col 3 + days: "Total Potongan"
    const r0: (string | number)[] = ['BANJARMASIN', '', ''];
    r0[3] = '16 Agustus s.d 15 September 2026';
    while (r0.length < 3 + dateColumns.length) r0.push('');
    r0.push('Total Potongan');
    wsData.push(r0);

    // Row 1: Subheaders
    // Col 0: "GAJI STAFF CABANG", Col 1: "", Col 2: "Note", Col 3..: 16, 17... 15, Col last: ""
    const r1: (string | number)[] = ['No', 'Nama Karyawan', 'Note'];
    dateColumns.forEach(col => r1.push(col.dayNumber));
    r1.push('');
    wsData.push(r1);

    // Categories and rows
    const categories = ['GAJI STAFF CABANG', 'GAJI STAFF BENGKEL', 'GAJI STAFF OUTLET', 'BANJARMASIN'];
    const offDays = new Set([17, 24, 31, 7, 14]);

    categories.forEach(cat => {
      // Category header row
      const catRow: (string | number)[] = [cat, '', ''];
      while (catRow.length < 3 + dateColumns.length + 1) catRow.push('');
      wsData.push(catRow);

      const emps = SAMPLE_HRD_EMPLOYEES.filter(e => e.category === cat);
      emps.forEach(emp => {
        const empRow: (string | number)[] = [emp.no, emp.name, emp.note || ''];

        dateColumns.forEach(col => {
          if (col.isSunday || offDays.has(col.dayNumber)) {
            empRow.push('');
          } else if (emp.sDays?.includes(col.dayNumber)) {
            empRow.push('S');
          } else if (emp.iDays?.includes(col.dayNumber)) {
            empRow.push('I');
          } else if (emp.aDays?.includes(col.dayNumber)) {
            empRow.push('A');
          } else if (emp.cDays?.includes(col.dayNumber)) {
            empRow.push('C');
          } else {
            // Real scan times
            const inHour = 8;
            const inMin = 5 + ((emp.no * 7 + col.dayNumber * 3) % 25);
            const outHour = 16 + ((emp.no + col.dayNumber) % 3 === 0 ? 1 : 0);
            const outMin = 10 + ((emp.no * 5 + col.dayNumber * 11) % 40);
            empRow.push(`${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}\n${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}`);
          }
        });

        empRow.push(''); // Total Potongan
        wsData.push(empRow);
      });

      // Total subtotal row
      const totRow: (string | number)[] = ['Total', '', ''];
      while (totRow.length < 3 + dateColumns.length + 1) totRow.push('');
      wsData.push(totRow);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return out as ArrayBuffer;
}
