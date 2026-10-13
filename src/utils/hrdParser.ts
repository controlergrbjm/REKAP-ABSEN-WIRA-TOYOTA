import * as XLSX from 'xlsx';
import { HrdCutoffPeriod, HrdDayColumn, HrdDataset, HrdEmployeeRecord, HrdDayCell } from '../types/hrd';

export const ID_MONTHS: Record<string, number> = {
  januari: 1, jan: 1,
  februari: 2, feb: 2,
  maret: 3, mar: 3,
  april: 4, apr: 4,
  mei: 5, may: 5,
  juni: 6, jun: 6,
  juli: 7, jul: 7,
  agustus: 8, agu: 8, ags: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  oktober: 10, okt: 10, oct: 10,
  november: 11, nov: 11,
  desember: 12, des: 12, dec: 12,
};

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Generate standard cutoff period for a target month (16 of prev month to 15 of current month)
 * e.g., target Month 9 (September) 2026 => 16 Agustus s.d 15 September 2026
 */
export function createStandardCutoffPeriod(endMonth: number, endYear: number): HrdCutoffPeriod {
  let startMonth = endMonth - 1;
  let startYear = endYear;
  if (startMonth < 1) {
    startMonth = 12;
    startYear = endYear - 1;
  }
  const label = `16 ${MONTH_NAMES_ID[startMonth - 1]} s.d 15 ${MONTH_NAMES_ID[endMonth - 1]} ${endYear}`;
  const periodKey = `${startYear}-${String(startMonth).padStart(2, '0')}-16_${endYear}-${String(endMonth).padStart(2, '0')}-15`;

  return {
    startDay: 16,
    startMonth,
    startYear,
    endDay: 15,
    endMonth,
    endYear,
    label,
    periodKey,
  };
}

/**
 * Generate list of day columns for a given cutoff period
 */
export function generateHrdDateColumns(period: HrdCutoffPeriod): HrdDayColumn[] {
  const columns: HrdDayColumn[] = [];

  // Part 1: startMonth, day 16 to end of startMonth
  const daysInStartMonth = new Date(period.startYear, period.startMonth, 0).getDate();
  for (let d = period.startDay; d <= daysInStartMonth; d++) {
    const dt = new Date(period.startYear, period.startMonth - 1, d);
    const dayOfWeek = dt.getDay();
    const dateKey = `${period.startYear}-${String(period.startMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    columns.push({
      dayNumber: d,
      dateKey,
      month: period.startMonth,
      year: period.startYear,
      dayOfWeek,
      dayName: DAY_NAMES_ID[dayOfWeek],
      isSunday: dayOfWeek === 0,
    });
  }

  // Part 2: endMonth, day 1 to endDay (usually 15)
  for (let d = 1; d <= period.endDay; d++) {
    const dt = new Date(period.endYear, period.endMonth - 1, d);
    const dayOfWeek = dt.getDay();
    const dateKey = `${period.endYear}-${String(period.endMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    columns.push({
      dayNumber: d,
      dateKey,
      month: period.endMonth,
      year: period.endYear,
      dayOfWeek,
      dayName: DAY_NAMES_ID[dayOfWeek],
      isSunday: dayOfWeek === 0,
    });
  }

  return columns;
}

/**
 * Get sheet names from workbook
 */
export function getExcelSheetNames(buffer: ArrayBuffer): string[] {
  try {
    const wb = XLSX.read(buffer, { type: 'array' });
    return wb.SheetNames || [];
  } catch {
    return [];
  }
}

/**
 * Check if a cell string represents clock times (e.g., "08:15", "08:15 17:01", "08.15\n17.01", etc.)
 */
export function isTimeString(val: string): boolean {
  if (!val) return false;
  const s = val.trim();
  // Regex matches HH:mm, HH.mm, HH:mm:ss anywhere in the string
  return /\b([01]?\d|2[0-3])[:.][0-5]\d\b/.test(s);
}

/**
 * Extract checkIn and checkOut strings from a cell text
 */
export function extractTimes(val: string): { checkIn: string | null; checkOut: string | null } {
  if (!val) return { checkIn: null, checkOut: null };
  const matches = val.match(/\b([01]?\d|2[0-3])[:.][0-5]\d(?::[0-5]\d)?\b/g);
  if (!matches || matches.length === 0) return { checkIn: null, checkOut: null };

  const normalize = (t: string) => t.replace('.', ':').slice(0, 5);
  const checkIn = normalize(matches[0]);
  const checkOut = matches.length > 1 ? normalize(matches[matches.length - 1]) : null;

  return { checkIn, checkOut };
}

/**
 * Parse an Excel text or cell into an HrdDayCell
 * USER REQUIREMENT:
 * "itu kan jam naa yang ada berisi jam maka dia akan muncul H
 * NANTI KLO ADA KETERANGAN S ATAU YANG LAIN DARI HRD MAKA AKAN MUNCUL SESUAI YANG DI IMPORT YAA"
 */
export function parseCellToHrdStatus(cellVal: unknown): HrdDayCell {
  if (cellVal === null || cellVal === undefined) {
    return { statusCode: '', rawText: '', checkIn: null, checkOut: null };
  }

  const str = String(cellVal).trim();
  if (!str || str === '-' || str === '.') {
    return { statusCode: '', rawText: str, checkIn: null, checkOut: null };
  }

  // Check if it contains clock timestamps
  if (isTimeString(str)) {
    const { checkIn, checkOut } = extractTimes(str);
    return {
      statusCode: 'H', // Clock time -> Mark as 'H' (Hadir)!
      rawText: str,
      checkIn,
      checkOut,
    };
  }

  // Not a time, check for text codes like S, I, A, C, OFF, D, etc.
  const upper = str.toUpperCase().trim();
  if (upper === 'S' || upper === 'SAKIT') {
    return { statusCode: 'S', rawText: str, checkIn: null, checkOut: null };
  }
  if (upper === 'I' || upper === 'IZIN' || upper === 'IJIN') {
    return { statusCode: 'I', rawText: str, checkIn: null, checkOut: null };
  }
  if (upper === 'A' || upper === 'ALPHA' || upper === 'ALPA') {
    return { statusCode: 'A', rawText: str, checkIn: null, checkOut: null };
  }
  if (upper === 'C' || upper === 'CUTI' || upper === 'CT') {
    return { statusCode: 'C', rawText: str, checkIn: null, checkOut: null };
  }
  if (upper === 'D' || upper === 'DINAS') {
    return { statusCode: 'D', rawText: str, checkIn: null, checkOut: null };
  }
  if (upper === 'OFF' || upper === 'LIBUR' || upper === 'L') {
    return { statusCode: 'OFF', rawText: str, checkIn: null, checkOut: null };
  }

  // Any other explicit string code from HRD, keep it as is
  return {
    statusCode: upper.length <= 4 ? upper : upper.slice(0, 4),
    rawText: str,
    checkIn: null,
    checkOut: null,
  };
}

/**
 * Parse text to find period string like "16 Agustus s.d 15 September 2026"
 */
export function parsePeriodFromText(text: string): HrdCutoffPeriod | null {
  if (!text) return null;
  // Match "16 [Month1] s.d 15 [Month2] [Year]" or "16 [Month1] - 15 [Month2] [Year]"
  const pattern = /(\d{1,2})\s+([A-Za-z]+)\s*(?:s\.?d\.?|sampai|-)\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i;
  const m = text.match(pattern);
  if (m) {
    const startDay = parseInt(m[1], 10);
    const m1Str = m[2].toLowerCase();
    const endDay = parseInt(m[3], 10);
    const m2Str = m[4].toLowerCase();
    const year = parseInt(m[5], 10);

    const startMonth = ID_MONTHS[m1Str] || 8;
    const endMonth = ID_MONTHS[m2Str] || 9;
    const startYear = startMonth > endMonth ? year - 1 : year;
    const endYear = year;

    const label = `${startDay} ${MONTH_NAMES_ID[startMonth - 1]} s.d ${endDay} ${MONTH_NAMES_ID[endMonth - 1]} ${endYear}`;
    const periodKey = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}_${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    return {
      startDay,
      startMonth,
      startYear,
      endDay,
      endMonth,
      endYear,
      label,
      periodKey,
    };
  }

  return null;
}

/**
 * Parse HRD Attendance Excel buffer
 */
export function parseHrdAttendanceExcel(
  buffer: ArrayBuffer,
  options?: {
    sheetName?: string;
    branchId?: string;
    branchName?: string;
    fileName?: string;
    overridePeriod?: HrdCutoffPeriod;
  }
): HrdDataset {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetNames = wb.SheetNames;
  const targetSheetName = options?.sheetName && sheetNames.includes(options.sheetName)
    ? options.sheetName
    : sheetNames[0];

  const sheet = wb.Sheets[targetSheetName];
  if (!sheet) {
    throw new Error(`Sheet "${targetSheetName}" tidak ditemukan dalam file.`);
  }

  // Convert to 2D array of raw values
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // 1. Try to detect Period from text in first 5 rows or from sheet name
  let detectedPeriod: HrdCutoffPeriod | null = options?.overridePeriod || null;
  let detectedBranch = options?.branchName || 'BANJARMASIN';

  if (!detectedPeriod) {
    for (let r = 0; r < Math.min(8, rows.length); r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const str = String(row[c] || '').trim();
        if (!str) continue;

        // Check for branch name like "BANJARMASIN"
        if (/BANJARMASIN/i.test(str)) {
          detectedBranch = 'BANJARMASIN';
        }

        const foundPeriod = parsePeriodFromText(str);
        if (foundPeriod) {
          detectedPeriod = foundPeriod;
          break;
        }
      }
      if (detectedPeriod) break;
    }
  }

  // If period not found in text, infer from sheet name (e.g. "September" -> 16 Agu s.d 15 Sep 2026)
  if (!detectedPeriod) {
    const lowerSheet = targetSheetName.toLowerCase().replace(/[^a-z]/g, '');
    for (const [name, monthNum] of Object.entries(ID_MONTHS)) {
      if (lowerSheet.includes(name)) {
        detectedPeriod = createStandardCutoffPeriod(monthNum, 2026);
        break;
      }
    }
  }

  // Default fallback if still not found: 16 Agu s.d 15 Sep 2026
  if (!detectedPeriod) {
    detectedPeriod = createStandardCutoffPeriod(9, 2026);
  }

  // 2. Generate date columns
  const dateColumns = generateHrdDateColumns(detectedPeriod);

  // 3. Find the day header row
  // The day header row contains numbers starting around 16, 17, 18 ... and going to 1, 2, ... 15
  let dayHeaderRowIdx = -1;
  const colIndexToDay: Record<number, HrdDayColumn> = {};
  let noColIdx = -1;
  let nameColIdx = -1;
  let noteColIdx = -1;
  let potonganColIdx = -1;

  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r];
    let matchedDays = 0;
    const tempColToDay: Record<number, number> = {};

    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      const num = typeof val === 'number' ? val : parseInt(String(val).trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 31) {
        tempColToDay[c] = num;
        matchedDays++;
      }
    }

    // If this row matched at least 15 days, it's our day header row!
    if (matchedDays >= 15) {
      dayHeaderRowIdx = r;
      // Map columns to dateColumns in sequence
      // The day numbers start with 16 and sequence up to 15
      const dayColIndices = Object.keys(tempColToDay).map(Number).sort((a, b) => a - b);
      dayColIndices.forEach((cIdx, seqIdx) => {
        if (seqIdx < dateColumns.length) {
          colIndexToDay[cIdx] = dateColumns[seqIdx];
        }
      });
      break;
    }
  }

  // Determine No, Name, Note columns
  if (dayHeaderRowIdx !== -1) {
    const headerRow = rows[dayHeaderRowIdx];
    const prevRow = dayHeaderRowIdx > 0 ? rows[dayHeaderRowIdx - 1] : [];

    for (let c = 0; c < 10; c++) {
      const txt = `${String(prevRow[c] || '')} ${String(headerRow[c] || '')}`.toLowerCase();
      if (txt.includes('no') && noColIdx === -1) noColIdx = c;
      if ((txt.includes('nama') || txt.includes('karyawan')) && nameColIdx === -1) nameColIdx = c;
      if ((txt.includes('note') || txt.includes('ket') || txt.includes('jabatan')) && noteColIdx === -1) noteColIdx = c;
    }

    // Find "Total Potongan" column
    for (let c = 0; c < headerRow.length; c++) {
      const txt = `${String(prevRow[c] || '')} ${String(headerRow[c] || '')}`.toLowerCase();
      if (txt.includes('potongan') || txt.includes('total pot')) {
        potonganColIdx = c;
      }
    }
  }

  // Fallbacks if not explicitly identified by text
  if (noColIdx === -1) noColIdx = 0;
  if (nameColIdx === -1) nameColIdx = 1;
  if (noteColIdx === -1) noteColIdx = 2;

  // 4. Parse employee rows and categories
  const categories: string[] = [];
  let currentCategory = 'GAJI STAFF CABANG';
  const employees: HrdEmployeeRecord[] = [];

  const startRow = dayHeaderRowIdx !== -1 ? dayHeaderRowIdx + 1 : 2;

  for (let r = startRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const col0Str = String(row[noColIdx] || '').trim();
    const col1Str = String(row[nameColIdx] || '').trim();
    const colNoteStr = String(row[noteColIdx] || '').trim();

    // Check if this row is a category header (e.g. "GAJI STAFF CABANG", "GAJI STAFF BENGKEL", "GAJI STAFF OUTLET", "BANJARMASIN")
    const combinedRowStart = `${col0Str} ${col1Str}`.trim().toUpperCase();
    if (
      combinedRowStart.startsWith('GAJI STAFF') ||
      combinedRowStart.startsWith('STAFF') ||
      combinedRowStart === 'BANJARMASIN' ||
      combinedRowStart.startsWith('DIVISI') ||
      combinedRowStart.startsWith('BAGIAN')
    ) {
      currentCategory = combinedRowStart;
      if (!categories.includes(currentCategory)) {
        categories.push(currentCategory);
      }
      continue;
    }

    // Skip "Total" summary rows
    if (combinedRowStart.startsWith('TOTAL')) {
      continue;
    }

    // Check if this is an employee row
    // Either col0 is a number (1, 2, 3...) or col1 is a valid employee name
    const rowNoNum = parseInt(col0Str, 10);
    const hasValidNo = !isNaN(rowNoNum) && rowNoNum > 0;
    const hasValidName = col1Str.length >= 3 && !col1Str.toUpperCase().includes('TOTAL');

    if (!hasValidNo && !hasValidName) {
      continue;
    }

    const empName = hasValidName ? col1Str : col0Str;
    const empNo = hasValidNo ? rowNoNum : employees.length + 1;
    const empNote = colNoteStr;

    // Build day cells
    const cells: Record<string, HrdDayCell> = {};
    for (const [cIdxStr, dayCol] of Object.entries(colIndexToDay)) {
      const cIdx = Number(cIdxStr);
      const cellVal = row[cIdx];
      const parsedCell = parseCellToHrdStatus(cellVal);
      cells[dayCol.dateKey] = parsedCell;
    }

    // Read Total Potongan if column exists
    let deduction = 0;
    if (potonganColIdx !== -1) {
      const potVal = row[potonganColIdx];
      const pNum = typeof potVal === 'number' ? potVal : parseFloat(String(potVal));
      if (!isNaN(pNum)) deduction = pNum;
    }

    if (!categories.includes(currentCategory)) {
      categories.push(currentCategory);
    }

    employees.push({
      id: `hrd_emp_${empNo}_${empName.replace(/\s+/g, '_')}`,
      no: empNo,
      name: empName,
      category: currentCategory,
      note: empNote,
      cells,
      deductionCount: deduction,
    });
  }

  return {
    id: `hrd_${Date.now()}`,
    branchId: options?.branchId || 'default_branch',
    branchName: detectedBranch,
    fileName: options?.fileName || 'HRD_Absensi.xlsx',
    sheetName: targetSheetName,
    period: detectedPeriod,
    categories: categories.length > 0 ? categories : ['GAJI STAFF CABANG'],
    employees,
    uploadedAt: new Date().toISOString(),
  };
}
