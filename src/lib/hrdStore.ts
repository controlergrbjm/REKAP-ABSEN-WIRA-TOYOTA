import { HrdDataset, HrdDayCell } from '../types/hrd';

const STORAGE_PREFIX = 'wira_hrd_dataset_';
const LIST_KEY = 'wira_hrd_dataset_index';

interface DatasetMeta {
  id: string;
  branchId: string;
  periodKey: string;
  label: string;
  fileName: string;
  sheetName: string;
  employeeCount: number;
  uploadedAt: string;
}

function getIndex(): DatasetMeta[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIndex(items: DatasetMeta[]): void {
  localStorage.setItem(LIST_KEY, JSON.stringify(items));
}

export function saveHrdDataset(dataset: HrdDataset): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${dataset.branchId}_${dataset.period.periodKey}`;
    localStorage.setItem(storageKey, JSON.stringify(dataset));

    // Update index
    const index = getIndex().filter(
      item => !(item.branchId === dataset.branchId && item.periodKey === dataset.period.periodKey)
    );
    index.unshift({
      id: dataset.id,
      branchId: dataset.branchId,
      periodKey: dataset.period.periodKey,
      label: dataset.period.label,
      fileName: dataset.fileName,
      sheetName: dataset.sheetName,
      employeeCount: dataset.employees.length,
      uploadedAt: dataset.uploadedAt,
    });
    saveIndex(index);
  } catch (e) {
    console.error('Failed to save HRD dataset in localStorage:', e);
  }
}

export function getHrdDataset(branchId: string, periodKey?: string): HrdDataset | null {
  try {
    // If specific periodKey provided
    if (periodKey) {
      const storageKey = `${STORAGE_PREFIX}${branchId}_${periodKey}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    }

    // Otherwise find the latest one for this branch
    const index = getIndex().filter(i => i.branchId === branchId);
    if (index.length > 0) {
      const latestMeta = index[0];
      const storageKey = `${STORAGE_PREFIX}${branchId}_${latestMeta.periodKey}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    }
    return null;
  } catch {
    return null;
  }
}

export function listHrdDatasets(branchId: string): DatasetMeta[] {
  return getIndex().filter(i => i.branchId === branchId);
}

export function clearHrdDataset(branchId: string, periodKey?: string): void {
  try {
    if (periodKey) {
      const storageKey = `${STORAGE_PREFIX}${branchId}_${periodKey}`;
      localStorage.removeItem(storageKey);
      const index = getIndex().filter(
        i => !(i.branchId === branchId && i.periodKey === periodKey)
      );
      saveIndex(index);
    } else {
      // Clear all for branch
      const index = getIndex();
      const branchItems = index.filter(i => i.branchId === branchId);
      branchItems.forEach(i => {
        localStorage.removeItem(`${STORAGE_PREFIX}${branchId}_${i.periodKey}`);
      });
      saveIndex(index.filter(i => i.branchId !== branchId));
    }
  } catch (e) {
    console.error('Failed to clear HRD dataset:', e);
  }
}

export function updateHrdCellStatus(
  branchId: string,
  datasetPeriodKey: string,
  employeeId: string,
  dateKey: string,
  newStatus: string
): HrdDataset | null {
  const current = getHrdDataset(branchId, datasetPeriodKey);
  if (!current) return null;

  const emp = current.employees.find(e => e.id === employeeId);
  if (!emp) return null;

  const existingCell = emp.cells[dateKey] || {
    statusCode: '',
    rawText: '',
    checkIn: null,
    checkOut: null,
  };

  emp.cells[dateKey] = {
    ...existingCell,
    statusCode: newStatus,
    isManual: true,
  };

  saveHrdDataset(current);
  return current;
}
