export interface HrdCutoffPeriod {
  startDay: number;      // e.g. 16
  startMonth: number;    // 1-12
  startYear: number;
  endDay: number;        // e.g. 15
  endMonth: number;      // 1-12
  endYear: number;
  label: string;         // e.g. "16 Agustus s.d 15 September 2026"
  periodKey: string;     // e.g. "2026-08-16_2026-09-15"
}

export interface HrdDayColumn {
  dayNumber: number;     // 16, 17, ... 31, 1, 2, ... 15
  dateKey: string;       // YYYY-MM-DD
  month: number;         // 1-12
  year: number;
  dayOfWeek: number;     // 0 (Min) - 6 (Sab)
  dayName: string;       // Min, Sen, Sel, Rab, Kam, Jum, Sab
  isSunday: boolean;
  isHoliday?: boolean;
}

export interface HrdDayCell {
  statusCode: string;    // 'H', 'S', 'I', 'A', 'C', or custom like 'D', 'OFF'
  rawText: string;       // original text from Excel cell, e.g. "08:15\n17:01" or "S"
  checkIn: string | null;  // "08:15"
  checkOut: string | null; // "17:01"
  isManual?: boolean;
}

export interface HrdEmployeeRecord {
  id: string;
  no: number;
  name: string;
  category: string;      // e.g. "GAJI STAFF CABANG", "GAJI STAFF BENGKEL", etc.
  note: string;          // e.g. "PDS", "Tr PDS", "PHL", "GSO", "KM2", "[RNA]"
  cells: Record<string, HrdDayCell>; // key is dateKey (YYYY-MM-DD)
  deductionCount?: number; // Total potongan
}

export interface HrdDataset {
  id: string;
  branchId: string;
  branchName: string;
  fileName: string;
  sheetName: string;
  period: HrdCutoffPeriod;
  categories: string[];
  employees: HrdEmployeeRecord[];
  uploadedAt: string;
}
