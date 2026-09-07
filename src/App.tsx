import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Branch, Employee, AttendanceRecord, AttendanceStatus, MonthPeriod } from './types';
import { Navbar } from './components/Navbar';
import { RekapDashboard } from './pages/RekapDashboard';
import { MasterEmployees } from './pages/MasterEmployees';
import { BranchSettingsModal } from './components/BranchSettingsModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { LoginPage } from './pages/LoginPage';
import {
  AppUser,
  loadSession,
  clearSession,
  fetchBranches,
  createBranch,
  updateBranch as updateBranchDb,
  deleteBranch as deleteBranchDb,
  fetchEmployees,
  upsertEmployee,
  updateEmployee,
  deleteEmployee,
  reorderEmployees,
  clearEmployeesByBranch,
  fetchAttendanceRecords,
  upsertAttendanceRecord,
  updateAttendanceStatus,
  saveAttendanceUpload,
  fetchAvailablePeriods,
  clearAllAttendance,
} from './backend';
import { parseAttendanceExcel, formatDateKey } from './utils/parser';
import { STANDARD_TOYOTA_ROLES } from './utils/sampleData';

export function App() {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => loadSession());

  const handleLogin = (user: AppUser) => setCurrentUser(user);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
  };

  // ── APP STATE ─────────────────────────────────────────────────────────────
  const [currentTab, setCurrentTab] = useState<'rekap' | 'master'>('rekap');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<number>(7);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [availablePeriods, setAvailablePeriods] = useState<MonthPeriod[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Load branches once on mount (after login)
  useEffect(() => {
    if (!currentUser) return;
    async function initBranches() {
      const bList = await fetchBranches();
      setBranches(bList);
      if (bList.length > 0) setCurrentBranch(bList[0]);
    }
    initBranches();
  }, [currentUser]);

  // ── DATA RELOAD ────────────────────────────────────────────────────────────
  const refreshData = useCallback(async () => {
    if (!currentBranch) return;
    const [empList, periods] = await Promise.all([
      fetchEmployees(currentBranch.id),
      fetchAvailablePeriods(),
    ]);
    setEmployees(empList);
    setAvailablePeriods(periods);

    const empIds = empList.map(e => e.id);
    const recList = await fetchAttendanceRecords(empIds, currentMonth, currentYear);
    setRecords(recList);
  }, [currentBranch, currentMonth, currentYear]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ── MEMOIZED DERIVED STATE ─────────────────────────────────────────────────
  const attendanceMap = useMemo(() => {
    const map: Record<string, Record<string, AttendanceRecord>> = {};
    for (const r of records) {
      if (!map[r.employee_id]) map[r.employee_id] = {};
      map[r.employee_id][r.date] = r;
    }
    return map;
  }, [records]);

  const periodsWithFallback = useMemo(() => {
    const hasCurrent = availablePeriods.some(p => p.month === currentMonth && p.year === currentYear);
    return hasCurrent ? availablePeriods : [{ month: currentMonth, year: currentYear }, ...availablePeriods];
  }, [currentMonth, currentYear, availablePeriods]);

  // ── HANDLERS ───────────────────────────────────────────────────────────────

  const handleRawDataParsed = useCallback(async (
    parsed: ReturnType<typeof parseAttendanceExcel>,
    fileName: string
  ) => {
    if (!currentBranch) return;
    const month = parsed.month || 7;
    const year = parsed.year || 2026;
    setCurrentMonth(month);
    setCurrentYear(year);

    const upload = await saveAttendanceUpload({
      branch_id: currentBranch.id,
      file_name: fileName,
      period_month: month,
      period_year: year,
    });

    for (const parsedEmp of parsed.employees) {
      const emp = await upsertEmployee(currentBranch.id, parsedEmp.pin, parsedEmp.name);
      for (const rec of parsedEmp.records) {
        await upsertAttendanceRecord({
          employee_id: emp.id,
          date: formatDateKey(rec.date),
          status: 'H',
          check_in: rec.checkIn,
          check_out: rec.checkOut,
          source: 'auto',
          upload_id: upload.id,
        });
      }
    }

    await refreshData();
  }, [currentBranch, refreshData]);

  const handleStatusChange = useCallback(async (
    employeeId: string, date: string, status: AttendanceStatus
  ) => {
    // Optimistic UI update for instant response
    setRecords(prev => {
      const next = [...prev];
      const idx = next.findIndex(r => r.employee_id === employeeId && r.date === date);
      if (idx !== -1) {
        next[idx] = { ...next[idx], status, source: 'manual' };
      } else if (status !== null) {
        next.push({
          id: `${employeeId}_${date}`,
          employee_id: employeeId,
          date,
          status,
          check_in: null,
          check_out: null,
          source: 'manual',
          upload_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      return next;
    });

    await updateAttendanceStatus(employeeId, date, status);
  }, []);

  const handleUpdatePosition = useCallback(async (employeeId: string, newPosition: string) => {
    setEmployees(prev =>
      prev.map(e => e.id === employeeId ? { ...e, position: newPosition } : e)
    );
    await updateEmployee(employeeId, { position: newPosition });
  }, []);

  const handleAddEmployee = useCallback(async (
    name: string, pin: string | null, position: string | null
  ) => {
    if (!currentBranch) return;
    const emp = await upsertEmployee(currentBranch.id, pin, name);
    if (position) await updateEmployee(emp.id, { position });
    await refreshData();
  }, [currentBranch, refreshData]);

  const handleUpdateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    await updateEmployee(id, updates);
    await refreshData();
  }, [refreshData]);

  const handleDeleteEmployee = useCallback(async (id: string) => {
    await deleteEmployee(id);
    await refreshData();
  }, [refreshData]);

  const handleReorderEmployees = useCallback(async (orderedIds: string[]) => {
    if (!currentBranch) return;
    await reorderEmployees(currentBranch.id, orderedIds);
    await refreshData();
  }, [currentBranch, refreshData]);

  const handleSeedStandardPositions = useCallback(async () => {
    if (employees.length === 0) {
      alert('Tambahkan atau upload karyawan terlebih dahulu.');
      return;
    }
    for (let index = 0; index < employees.length; index++) {
      const emp = employees[index];
      const role = STANDARD_TOYOTA_ROLES[index % STANDARD_TOYOTA_ROLES.length];
      await updateEmployee(emp.id, { position: role });
    }
    await refreshData();
  }, [employees, refreshData]);

  const handleAddBranch = useCallback(async (name: string, code: string) => {
    const newB = await createBranch({ name, code });
    const bList = await fetchBranches();
    setBranches(bList);
    setCurrentBranch(newB);
  }, []);

  const handleUpdateBranch = useCallback(async (id: string, name: string, code: string) => {
    await updateBranchDb(id, { name, code });
    const bList = await fetchBranches();
    setBranches(bList);
    const updated = bList.find(b => b.id === id);
    if (updated && currentBranch?.id === id) setCurrentBranch(updated);
  }, [currentBranch]);

  const handleDeleteBranch = useCallback(async (id: string) => {
    await deleteBranchDb(id);
    const bList = await fetchBranches();
    setBranches(bList);
    if (currentBranch?.id === id && bList.length > 0) setCurrentBranch(bList[0]);
  }, [currentBranch]);

  const handleClearAllData = useCallback(async () => {
    if (!currentBranch) return;
    await clearAllAttendance(currentBranch.id);
    await refreshData();
  }, [currentBranch, refreshData]);

  const handleClearAllEmployees = useCallback(async () => {
    if (!currentBranch) return;
    if (confirm(`⚠️ Hapus SEMUA karyawan di cabang "${currentBranch.name}"?\n\nSemua data absensi dan master karyawan akan dikosongkan.`)) {
      await clearEmployeesByBranch(currentBranch.id);
      await refreshData();
    }
  }, [currentBranch, refreshData]);

  // ── RENDER ─────────────────────────────────────────────────────────────────

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        branches={branches}
        currentBranch={currentBranch}
        onBranchChange={setCurrentBranch}
        onOpenBranchModal={() => setIsBranchModalOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentBranch ? (
          currentTab === 'rekap' ? (
            <RekapDashboard
              branch={currentBranch}
              employees={employees}
              attendanceMap={attendanceMap}
              currentMonth={currentMonth}
              currentYear={currentYear}
              availablePeriods={periodsWithFallback}
              onPeriodChange={(m, y) => { setCurrentMonth(m); setCurrentYear(y); }}
              onRawDataParsed={handleRawDataParsed}
              onStatusChange={handleStatusChange}
              onUpdatePosition={handleUpdatePosition}
              onClearAllData={handleClearAllData}
            />
          ) : (
            <MasterEmployees
              branch={currentBranch}
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onReorderEmployees={handleReorderEmployees}
              onSeedStandardPositions={handleSeedStandardPositions}
              onClearAllEmployees={handleClearAllEmployees}
            />
          )
        ) : (
          <div className="p-12 text-center text-gray-400 font-medium">Memuat data cabang...</div>
        )}
      </main>

      <BranchSettingsModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        branches={branches}
        currentBranch={currentBranch}
        onSelectBranch={(b) => { setCurrentBranch(b); setIsBranchModalOpen(false); }}
        onAddBranch={handleAddBranch}
        onUpdateBranch={handleUpdateBranch}
        onDeleteBranch={handleDeleteBranch}
      />

      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

      <footer className="border-t border-gray-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-gray-700">WIRA TOYOTA</span> • Sistem Rekapitulasi Presensi Karyawan
          </div>
          {currentUser && (
            <div className="text-gray-400">
              Login sebagai <span className="font-semibold text-gray-600">{currentUser.displayName}</span> —{' '}
              <span>{currentUser.roleLabel}</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
