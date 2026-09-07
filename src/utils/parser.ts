import * as XLSX from 'xlsx';
import { ParsedEmployee, ParsedDailyRecord } from '../types/index';

/**
 * Normalize cell value to clean string
 */
function cellStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Format Excel time value (handles strings "08:26:54" and numeric fractions)
 */
function formatTimeVal(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s || s === '-' || s === ':') return null;
    return s;
  }
  if (typeof val === 'number') {
    if (val >= 0 && val < 1) {
      const totalSeconds = Math.round(val * 86400);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }
  const s = String(val).trim();
  return s || null;
}

/**
 * Flexible field extractor across all cells in a row.
 * Handles cases where:
 * - Col A = "Nama : Budi" (all in one cell)
 * - Col A = "Nama", Col B = "", Col C = ": M R Akhsyadi" (like real scanner export!)
 * - Col A = "Nama", Col B = ":", Col C = "M R Akhsyadi"
 */
function extractFieldValue(row: unknown[], keyPrefix: string): string {
  const prefix = keyPrefix.toLowerCase();

  for (let i = 0; i < row.length; i++) {
    const cell = cellStr(row[i]);
    if (!cell) continue;

    const lower = cell.toLowerCase();
    // Check if this cell starts with or equals the key (e.g. "nama", "pin / nip", "divisi")
    if (lower === prefix || lower.startsWith(prefix) || (prefix.includes('/') && lower.includes(prefix.split('/')[0].trim()))) {
      // Case 1: Key and value in same cell separated by ':'
      if (cell.includes(':')) {
        const afterColon = cell.split(':').slice(1).join(':').trim();
        if (afterColon) return afterColon;
      }

      // Case 2: Value is in subsequent cells
      for (let j = i + 1; j < row.length; j++) {
        let nextVal = cellStr(row[j]);
        if (!nextVal) continue;

        // Strip leading ':' if present
        if (nextVal.startsWith(':')) {
          nextVal = nextVal.substring(1).trim();
        }
        if (nextVal) return nextVal;
      }
    }
  }
  return '';
}

/**
 * Find date in any cell of a row.
 * Matches Indonesian formats: "Rabu, 01-07-2026", "01-07-2026", "01/07/2026"
 */
function findDateInRow(row: unknown[]): { date: Date; colIdx: number } | null {
  for (let i = 0; i < row.length; i++) {
    const cell = cellStr(row[i]);
    if (!cell) continue;

    const match = cell.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      const d = parseInt(dd, 10);
      const m = parseInt(mm, 10);
      const y = parseInt(yyyy, 10);

      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2100) {
        return {
          date: new Date(y, m - 1, d),
          colIdx: i,
        };
      }
    }
  }
  return null;
}

/**
 * Parse the raw Excel file buffer into an array of ParsedEmployee objects.
 * Handles the single vertical sheet with multiple employee blocks.
 */
export function parseAttendanceExcel(buffer: ArrayBuffer): {
  employees: ParsedEmployee[];
  month: number;
  year: number;
} {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to 2D array of raw values
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  // Also convert to formatted string rows to handle any cell format conversions
  const formattedRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: false,
  });

  const employees: ParsedEmployee[] = [];
  let currentEmployee: ParsedEmployee | null = null;
  let inRecords = false;

  let globalMonth = 0;
  let globalYear = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i] || [];
    const fmtRow = formattedRows[i] || [];

    // Check if any cell indicates a "Nama" label
    const nameExtracted = extractFieldValue(row, 'nama');

    if (nameExtracted) {
      // Save previous employee
      if (currentEmployee && currentEmployee.name) {
        employees.push(currentEmployee);
      }

      currentEmployee = {
        name: nameExtracted,
        pin: null,
        division: null,
        department: null,
        records: [],
      };
      inRecords = false;
      continue;
    }

    if (!currentEmployee) continue;

    // Parse PIN / NIP
    if (!currentEmployee.pin) {
      const pinExtracted = extractFieldValue(row, 'pin') || extractFieldValue(row, 'nip');
      if (pinExtracted) {
        // Look for numbers: "16 / 16" or "1024"
        const numMatch = pinExtracted.match(/(\d+)/);
        if (numMatch) {
          currentEmployee.pin = numMatch[1];
        } else {
          currentEmployee.pin = pinExtracted;
        }
        continue;
      }
    }

    // Parse Divisi
    if (!currentEmployee.division) {
      const divExtracted = extractFieldValue(row, 'divisi');
      if (divExtracted) {
        currentEmployee.division = divExtracted;
        continue;
      }
    }

    // Parse Departemen / Kantor
    if (!currentEmployee.department) {
      const deptExtracted = extractFieldValue(row, 'departemen') || extractFieldValue(row, 'kantor');
      if (deptExtracted) {
        currentEmployee.department = deptExtracted;
        continue;
      }
    }

    // Detect header row for records (contains "Tanggal")
    const isHeaderRow = row.some((c) => cellStr(c).toLowerCase().includes('tanggal'));
    if (isHeaderRow) {
      inRecords = true;
      continue;
    }

    // Check for empty row: 3 or more consecutive empty cells can signal record boundary
    const isRowEmpty = row.every((c) => !cellStr(c));
    if (isRowEmpty) {
      inRecords = false;
      continue;
    }

    // Parse date records
    const dateResult = findDateInRow(row);
    if (dateResult) {
      const { date, colIdx } = dateResult;

      // Track global period
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      if (!globalMonth) globalMonth = m;
      if (!globalYear) globalYear = y;

      // Find check-in and check-out in subsequent columns
      // Check formatted row first (gives nice "8:26:54"), fallback to raw
      let checkIn: string | null = null;
      let checkOut: string | null = null;

      const timeCandidates: string[] = [];
      for (let c = colIdx + 1; c < Math.max(row.length, fmtRow.length); c++) {
        const fmtVal = formatTimeVal(fmtRow[c]);
        const rawVal = formatTimeVal(row[c]);
        const timeVal = fmtVal || rawVal;
        if (timeVal) {
          timeCandidates.push(timeVal);
        }
      }

      if (timeCandidates.length >= 1) checkIn = timeCandidates[0];
      if (timeCandidates.length >= 2) checkOut = timeCandidates[1];

      currentEmployee.records.push({
        date,
        checkIn,
        checkOut,
      });
    }
  }

  // Push last employee
  if (currentEmployee && currentEmployee.name) {
    employees.push(currentEmployee);
  }

  return {
    employees,
    month: globalMonth || 7,
    year: globalYear || 2026,
  };
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get short day name (Mon, Tue, Wed...)
 */
export function getShortDayName(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Check if a given day is a weekend (0=Sun, 6=Sat)
 */
export function isWeekend(year: number, month: number, day: number): boolean {
  const dow = new Date(year, month - 1, day).getDay();
  return dow === 0 || dow === 6;
}

/**
 * Get full Indonesian month name
 */
export const INDONESIAN_MONTHS = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER',
];
