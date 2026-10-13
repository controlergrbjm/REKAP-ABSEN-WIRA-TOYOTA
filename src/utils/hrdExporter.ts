import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { HrdDataset, HrdDayColumn } from '../types/hrd';
import { generateHrdDateColumns } from './hrdParser';

const COLORS = {
  headerRed: 'C00000',
  headerDark: '8B0000',
  sundayGreen: '2E7D32', // Emerald green from HRD screenshot
  sundayLightGreen: 'E8F5E9',
  white: 'FFFFFF',
  black: '000000',
  grayBorder: 'D9D9D9',
  categoryBg: 'E0F2FE', // Light blue/cyan for section headers
  categoryText: '0369A1',
  subtotalBg: 'F3F4F6',
  badgeH: 'E2F0D9', // soft green
  badgeS: 'FFF2CC', // soft orange/yellow
  badgeI: 'DDEBF7', // soft blue
  badgeA: 'FCE4D6', // soft red
  badgeC: 'EDEDF7', // soft purple
};

export async function exportHrdToExcel(
  dataset: HrdDataset,
  viewMode: 'code' | 'raw' = 'code'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WIRA Toyota Rekap HRD';
  workbook.created = new Date();

  const sheetName = dataset.sheetName || 'Rekap HRD';
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true, state: 'frozen', xSplit: 3, ySplit: 2 }],
  });

  const dateColumns: HrdDayColumn[] = generateHrdDateColumns(dataset.period);
  const totalCols = 3 + dateColumns.length + 6; // No, Nama, Note + Days + H, S, I, A, C, Potongan

  // Columns definition
  const columnsConfig: Partial<ExcelJS.Column>[] = [
    { key: 'no', width: 6 },
    { key: 'name', width: 28 },
    { key: 'note', width: 14 },
  ];

  dateColumns.forEach((col) => {
    columnsConfig.push({ key: `day_${col.dateKey}`, width: 5.2 });
  });

  // Summary columns
  columnsConfig.push(
    { key: 'tot_h', width: 5.5 },
    { key: 'tot_s', width: 5.5 },
    { key: 'tot_i', width: 5.5 },
    { key: 'tot_a', width: 5.5 },
    { key: 'tot_c', width: 5.5 },
    { key: 'tot_potongan', width: 12 }
  );

  sheet.columns = columnsConfig;

  // ── ROW 1: HEADER (BANJARMASIN & CUTOFF PERIOD) ──
  const r1 = sheet.getRow(1);
  r1.height = 26;

  sheet.getCell(1, 1).value = dataset.branchName.toUpperCase();
  sheet.getCell(1, 1).font = { bold: true, color: { argb: COLORS.white }, size: 11 };
  sheet.getCell(1, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };
  sheet.getCell(1, 1).alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.getCell(1, 2).value = '';
  sheet.getCell(1, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };

  sheet.getCell(1, 3).value = 'Note';
  sheet.getCell(1, 3).font = { bold: true, color: { argb: COLORS.white }, size: 10 };
  sheet.getCell(1, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };
  sheet.getCell(1, 3).alignment = { horizontal: 'center', vertical: 'middle' };

  // Merge middle cells for cutoff label (e.g. "16 Agustus s.d 15 September 2026")
  sheet.mergeCells(1, 4, 1, 3 + dateColumns.length);
  const midCell = sheet.getCell(1, 4);
  midCell.value = dataset.period.label.toUpperCase();
  midCell.font = { bold: true, color: { argb: COLORS.white }, size: 11 };
  midCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerDark } };
  midCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Right summary header
  sheet.mergeCells(1, 4 + dateColumns.length, 1, totalCols);
  const sumHeader = sheet.getCell(1, 4 + dateColumns.length);
  sumHeader.value = 'REKAP & POTONGAN';
  sumHeader.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
  sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerRed } };
  sumHeader.alignment = { horizontal: 'center', vertical: 'middle' };

  // ── ROW 2: DAY NUMBERS (16, 17 ... 31, 1, ... 15) ──
  const r2 = sheet.getRow(2);
  r2.height = 22;

  sheet.getCell(2, 1).value = 'No';
  sheet.getCell(2, 1).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell(2, 1).font = { bold: true, size: 9 };

  sheet.getCell(2, 2).value = 'Nama Karyawan';
  sheet.getCell(2, 2).alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getCell(2, 2).font = { bold: true, size: 9 };

  sheet.getCell(2, 3).value = 'Jabatan / Note';
  sheet.getCell(2, 3).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell(2, 3).font = { bold: true, size: 9 };

  dateColumns.forEach((col, idx) => {
    const cell = sheet.getCell(2, 4 + idx);
    cell.value = col.dayNumber;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { bold: true, size: 9, color: { argb: col.isSunday ? COLORS.white : COLORS.black } };
    if (col.isSunday) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sundayGreen } };
    }
  });

  // Summary labels
  const sumLabels = ['H', 'S', 'I', 'A', 'C', 'Total Potongan'];
  sumLabels.forEach((lbl, idx) => {
    const cell = sheet.getCell(2, 4 + dateColumns.length + idx);
    cell.value = lbl;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { bold: true, size: 9 };
  });

  // ── ROWS BY CATEGORY ──
  let currentRow = 3;

  dataset.categories.forEach((category) => {
    // Section Header row
    sheet.mergeCells(currentRow, 1, currentRow, totalCols);
    const catCell = sheet.getCell(currentRow, 1);
    catCell.value = category;
    catCell.font = { bold: true, size: 10, color: { argb: COLORS.categoryText } };
    catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.categoryBg } };
    catCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    sheet.getRow(currentRow).height = 20;
    currentRow++;

    // Employees in this category
    const catEmps = dataset.employees.filter((e) => e.category === category);
    catEmps.forEach((emp) => {
      const row = sheet.getRow(currentRow);
      row.height = viewMode === 'raw' ? 24 : 19;

      sheet.getCell(currentRow, 1).value = emp.no;
      sheet.getCell(currentRow, 1).alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.getCell(currentRow, 2).value = emp.name;
      sheet.getCell(currentRow, 2).alignment = { horizontal: 'left', vertical: 'middle' };

      sheet.getCell(currentRow, 3).value = emp.note || '';
      sheet.getCell(currentRow, 3).alignment = { horizontal: 'center', vertical: 'middle' };

      let cntH = 0, cntS = 0, cntI = 0, cntA = 0, cntC = 0;

      dateColumns.forEach((col, idx) => {
        const cellData = emp.cells[col.dateKey];
        const targetCell = sheet.getCell(currentRow, 4 + idx);
        targetCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        if (col.isSunday) {
          targetCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sundayLightGreen } };
        }

        if (cellData) {
          const status = cellData.statusCode;
          if (status === 'H') cntH++;
          else if (status === 'S') cntS++;
          else if (status === 'I') cntI++;
          else if (status === 'A') cntA++;
          else if (status === 'C') cntC++;

          if (viewMode === 'raw' && cellData.rawText) {
            targetCell.value = cellData.rawText;
            targetCell.font = { size: 7.5 };
          } else {
            targetCell.value = status || '';
            targetCell.font = { bold: true, size: 9 };
            if (status === 'H') {
              targetCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.badgeH } };
            } else if (status === 'S') {
              targetCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.badgeS } };
            } else if (status === 'I') {
              targetCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.badgeI } };
            } else if (status === 'A') {
              targetCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.badgeA } };
            } else if (status === 'C') {
              targetCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.badgeC } };
            }
          }
        }
      });

      // Summary values
      sheet.getCell(currentRow, 4 + dateColumns.length).value = cntH;
      sheet.getCell(currentRow, 5 + dateColumns.length).value = cntS;
      sheet.getCell(currentRow, 6 + dateColumns.length).value = cntI;
      sheet.getCell(currentRow, 7 + dateColumns.length).value = cntA;
      sheet.getCell(currentRow, 8 + dateColumns.length).value = cntC;
      sheet.getCell(currentRow, 9 + dateColumns.length).value = emp.deductionCount || 0;

      for (let s = 0; s < 6; s++) {
        const c = sheet.getCell(currentRow, 4 + dateColumns.length + s);
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.font = { bold: true, size: 9 };
      }

      currentRow++;
    });

    // Subtotal Row
    const subtotalRow = sheet.getRow(currentRow);
    subtotalRow.height = 18;
    sheet.getCell(currentRow, 1).value = 'Total';
    sheet.getCell(currentRow, 1).font = { bold: true, size: 9 };
    sheet.getCell(currentRow, 1).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(currentRow, 2).value = `${catEmps.length} Karyawan`;
    sheet.getCell(currentRow, 2).font = { italic: true, size: 8 };

    for (let c = 1; c <= totalCols; c++) {
      const cell = sheet.getCell(currentRow, c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subtotalBg } };
    }

    currentRow++;
  });

  // Borders for all cells
  for (let r = 1; r < currentRow; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.grayBorder } },
        left: { style: 'thin', color: { argb: COLORS.grayBorder } },
        bottom: { style: 'thin', color: { argb: COLORS.grayBorder } },
        right: { style: 'thin', color: { argb: COLORS.grayBorder } },
      };
    }
  }

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `REKAP_HRD_${dataset.period.label.replace(/\s+/g, '_')}.xlsx`);
}
