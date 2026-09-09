import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Employee, AttendanceRecord, Branch } from '../types';
import { getDaysInMonth, getShortDayName, isWeekend, INDONESIAN_MONTHS } from './parser';
import { sortEmployeesByMasterOrder } from '../constants/masterEmployees';

interface ExportOptions {
  branch: Branch;
  month: number;
  year: number;
  employees: Employee[];
  attendanceMap: Record<string, Record<string, AttendanceRecord>>; // employeeId -> dateKey -> record
}

// Color definitions matching Toyota & reference styling
const COLORS = {
  headerRed: 'C00000',      // Toyota Dark Red
  bannerYellow: 'FFD600',   // Toyota Yellow
  headerRedDark: '8B0000',
  white: 'FFFFFF',
  black: '000000',
  weekendPink: 'FFEBEB',
  weekendHeaderPink: 'FFD2D2',
  zebraPeach: 'FFF6F0',
  borderGray: 'D9D9D9',
  borderDark: '808080',
  badgeH: 'E2F0D9', // soft green
  badgeS: 'FFF2CC', // soft orange/yellow
  badgeI: 'DDEBF7', // soft blue
  badgeA: 'FCE4D6', // soft red
  badgeC: 'EDEDF7', // soft purple
};

export async function exportToExcel({
  branch,
  month,
  year,
  employees,
  attendanceMap,
}: ExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WIRA Toyota Attendance System';
  workbook.lastModifiedBy = 'WIRA Toyota Attendance System';
  workbook.created = new Date();
  workbook.modified = new Date();

  const monthName = INDONESIAN_MONTHS[month - 1] || `BULAN ${month}`;
  const totalDays = getDaysInMonth(year, month);
  const totalCols = 3 + totalDays + 5; // NO, NAMA, JABATAN + Days + H, S, I, A, C

  const sheet = workbook.addWorksheet(`${monthName} ${year}`, {
    views: [{ showGridLines: true, state: 'frozen', xSplit: 3, ySplit: 7 }],
  });

  // Set column widths
  const columnsConfig: Partial<ExcelJS.Column>[] = [
    { key: 'no', width: 6 },
    { key: 'nama', width: 28 },
    { key: 'jabatan', width: 24 },
  ];

  for (let d = 1; d <= totalDays; d++) {
    columnsConfig.push({ key: `d_${d}`, width: 4.8 });
  }

  // Summary columns
  columnsConfig.push(
    { key: 'tot_h', width: 5.5 },
    { key: 'tot_s', width: 5.5 },
    { key: 'tot_i', width: 5.5 },
    { key: 'tot_a', width: 5.5 },
    { key: 'tot_c', width: 5.5 }
  );

  sheet.columns = columnsConfig;

  // ── ROW 1: YEAR BANNER (Dark Red) ──
  sheet.mergeCells(1, 1, 1, totalCols);
  const r1 = sheet.getRow(1);
  r1.height = 32;
  const cellR1 = r1.getCell(1);
  cellR1.value = `${year}`;
  cellR1.font = { name: 'Arial Black', size: 18, bold: true, color: { argb: COLORS.white } };
  cellR1.alignment = { horizontal: 'center', vertical: 'middle' };
  cellR1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };

  // ── ROW 2: ABSENSI TITLE (Yellow) ──
  sheet.mergeCells(2, 1, 2, totalCols);
  const r2 = sheet.getRow(2);
  r2.height = 30;
  const cellR2 = r2.getCell(1);
  cellR2.value = 'ABSENSI';
  cellR2.font = { name: 'Arial Black', size: 16, bold: true, color: { argb: COLORS.black } };
  cellR2.alignment = { horizontal: 'center', vertical: 'middle' };
  cellR2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.bannerYellow } };

  // ── ROW 3: BRANCH NAME (Dark Red) ──
  sheet.mergeCells(3, 1, 3, totalCols);
  const r3 = sheet.getRow(3);
  r3.height = 24;
  const cellR3 = r3.getCell(1);
  cellR3.value = branch.name.toUpperCase();
  cellR3.font = { name: 'Calibri', size: 13, bold: true, color: { argb: COLORS.white } };
  cellR3.alignment = { horizontal: 'center', vertical: 'middle' };
  cellR3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRedDark } };

  // ── ROW 4: BRANCH CODE SUBTITLE (Dark Red) ──
  sheet.mergeCells(4, 1, 4, totalCols);
  const r4 = sheet.getRow(4);
  r4.height = 20;
  const cellR4 = r4.getCell(1);
  cellR4.value = `(${branch.code.toUpperCase()})`;
  cellR4.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.white } };
  cellR4.alignment = { horizontal: 'center', vertical: 'middle' };
  cellR4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRedDark } };

  // ── ROW 5: MONTH NAME BANNER (Red) ──
  sheet.mergeCells(5, 1, 5, totalCols);
  const r5 = sheet.getRow(5);
  r5.height = 28;
  const cellR5 = r5.getCell(1);
  cellR5.value = monthName;
  cellR5.font = { name: 'Arial Black', size: 14, bold: true, color: { argb: COLORS.white } };
  cellR5.alignment = { horizontal: 'center', vertical: 'middle' };
  cellR5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };

  // ── ROW 6 & 7: TABLE HEADERS ──
  // Row 6: Day numbers + Merged NO, NAMA, JABATAN + Summary Header
  const r6 = sheet.getRow(6);
  const r7 = sheet.getRow(7);
  r6.height = 22;
  r7.height = 20;

  // NO
  sheet.mergeCells(6, 1, 7, 1);
  const cellNo = r6.getCell(1);
  cellNo.value = 'NO';
  cellNo.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.white } };
  cellNo.alignment = { horizontal: 'center', vertical: 'middle' };
  cellNo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };

  // NAMA
  sheet.mergeCells(6, 2, 7, 2);
  const cellNama = r6.getCell(2);
  cellNama.value = 'NAMA';
  cellNama.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.white } };
  cellNama.alignment = { horizontal: 'center', vertical: 'middle' };
  cellNama.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };

  // JABATAN
  sheet.mergeCells(6, 3, 7, 3);
  const cellJabatan = r6.getCell(3);
  cellJabatan.value = 'JABATAN';
  cellJabatan.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.white } };
  cellJabatan.alignment = { horizontal: 'center', vertical: 'middle' };
  cellJabatan.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };

  // Date Headers (Row 6: Date Number, Row 7: Short Day Name)
  for (let d = 1; d <= totalDays; d++) {
    const colIdx = 3 + d;
    const isWk = isWeekend(year, month, d);
    const dayShort = getShortDayName(year, month, d);

    // Row 6: Date number
    const cellDateNum = r6.getCell(colIdx);
    cellDateNum.value = d;
    cellDateNum.font = {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: isWk ? 'C00000' : COLORS.black },
    };
    cellDateNum.alignment = { horizontal: 'center', vertical: 'middle' };
    cellDateNum.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isWk ? COLORS.weekendHeaderPink : 'F2F2F2' },
    };

    // Row 7: Short day name
    const cellDayName = r7.getCell(colIdx);
    cellDayName.value = dayShort;
    cellDayName.font = {
      name: 'Calibri',
      size: 8,
      bold: true,
      color: { argb: isWk ? 'C00000' : '595959' },
    };
    cellDayName.alignment = { horizontal: 'center', vertical: 'middle' };
    cellDayName.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isWk ? COLORS.weekendHeaderPink : 'F2F2F2' },
    };
  }

  // Summary headers (Merged across rows 6 & 7)
  const summaries = ['H', 'S', 'I', 'A', 'C'];
  summaries.forEach((sumKey, idx) => {
    const colIdx = 3 + totalDays + 1 + idx;
    sheet.mergeCells(6, colIdx, 7, colIdx);
    const cellSum = r6.getCell(colIdx);
    cellSum.value = sumKey;
    cellSum.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
    cellSum.alignment = { horizontal: 'center', vertical: 'middle' };
    cellSum.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };
  });

  // Borders for header rows 6 & 7
  for (let r = 6; r <= 7; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= totalCols; c++) {
      row.getCell(c).border = {
        top: { style: 'thin', color: { argb: COLORS.borderDark } },
        left: { style: 'thin', color: { argb: COLORS.borderDark } },
        bottom: { style: 'thin', color: { argb: COLORS.borderDark } },
        right: { style: 'thin', color: { argb: COLORS.borderDark } },
      };
    }
  }

  // ── TABLE DATA ROWS ──
  // Urutan karyawan persis seperti susunan Master 73 Karyawan (foto referensi).
  // Karyawan baru (yang tidak ada di daftar 73 nama master) otomatis diletakkan di paling bawah.
  const sortedEmployees = sortEmployeesByMasterOrder(employees);

  let currentRowIdx = 8;
  sortedEmployees.forEach((emp, index) => {
    const row = sheet.getRow(currentRowIdx);
    row.height = 20;
    const isEven = index % 2 === 0;
    const defaultBg = isEven ? COLORS.white : COLORS.zebraPeach;

    // NO
    const cellNo = row.getCell(1);
    cellNo.value = index + 1;
    cellNo.alignment = { horizontal: 'center', vertical: 'middle' };
    cellNo.font = { name: 'Calibri', size: 10 };
    cellNo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };

    // NAMA
    const cellNama = row.getCell(2);
    cellNama.value = emp.name;
    cellNama.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    cellNama.font = { name: 'Calibri', size: 10, bold: true };
    cellNama.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };

    // JABATAN
    const cellJabatan = row.getCell(3);
    cellJabatan.value = emp.position || '-';
    cellJabatan.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    cellJabatan.font = { name: 'Calibri', size: 9.5, italic: !emp.position };
    cellJabatan.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };

    const empRecords = attendanceMap[emp.id] || {};
    let countH = 0, countS = 0, countI = 0, countA = 0, countC = 0;

    // Date Columns
    for (let d = 1; d <= totalDays; d++) {
      const colIdx = 3 + d;
      const isWk = isWeekend(year, month, d);
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = empRecords[dateKey];
      const status = rec ? rec.status : null;

      const cell = row.getCell(colIdx);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { name: 'Calibri', size: 9.5, bold: !!status };

      let cellColor = isWk ? COLORS.weekendPink : defaultBg;

      if (status === 'H') {
        cell.value = 'H';
        countH++;
      } else if (status === 'S') {
        cell.value = 'S';
        cellColor = COLORS.badgeS;
        countS++;
      } else if (status === 'I') {
        cell.value = 'I';
        cellColor = COLORS.badgeI;
        countI++;
      } else if (status === 'A') {
        cell.value = 'A';
        cellColor = COLORS.badgeA;
        countA++;
      } else if (status === 'C') {
        cell.value = 'C';
        cellColor = COLORS.badgeC;
        countC++;
      } else {
        cell.value = '';
      }

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellColor } };
    }

    // Summary counts
    const sumCells = [
      { key: 'H', count: countH, bg: COLORS.badgeH },
      { key: 'S', count: countS, bg: countS > 0 ? COLORS.badgeS : defaultBg },
      { key: 'I', count: countI, bg: countI > 0 ? COLORS.badgeI : defaultBg },
      { key: 'A', count: countA, bg: countA > 0 ? COLORS.badgeA : defaultBg },
      { key: 'C', count: countC, bg: countC > 0 ? COLORS.badgeC : defaultBg },
    ];

    sumCells.forEach((sum, sIdx) => {
      const colIdx = 3 + totalDays + 1 + sIdx;
      const cell = row.getCell(colIdx);
      cell.value = sum.count > 0 ? sum.count : '-';
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { name: 'Calibri', size: 9.5, bold: sum.count > 0 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sum.bg } };
    });

    // Row borders
    for (let c = 1; c <= totalCols; c++) {
      row.getCell(c).border = {
        top: { style: 'thin', color: { argb: COLORS.borderGray } },
        left: { style: 'thin', color: { argb: COLORS.borderGray } },
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
        right: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    }

    currentRowIdx++;
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `REKAP_ABSENSI_${branch.code.replace(/\s+/g, '_')}_${monthName}_${year}.xlsx`;
  saveAs(blob, filename);
}
