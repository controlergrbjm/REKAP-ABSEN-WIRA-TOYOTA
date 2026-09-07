-- ==============================================================================
-- WIRA TOYOTA ATTENDANCE MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension (Supabase default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- Table 1: USERS (Akun Login & Role)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('service_manager', 'staff_digitalisasi', 'operation_leader')),
    role_label VARCHAR(100) NOT NULL,
    avatar VARCHAR(10) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#C00000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 2: BRANCHES (Cabang Bengkel)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Table 3: EMPLOYEES (Master Karyawan Bengkel)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    pin VARCHAR(50),
    name VARCHAR(150) NOT NULL,
    position VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_pin ON employees(pin);
CREATE INDEX IF NOT EXISTS idx_employees_sort_order ON employees(sort_order);

-- ------------------------------------------------------------------------------
-- Table 4: ATTENDANCE UPLOADS (Riwayat Unggah File Excel)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_uploads_branch ON attendance_uploads(branch_id, period_year, period_month);

-- ------------------------------------------------------------------------------
-- Table 5: ATTENDANCE RECORDS (Data Presensi Harian Karyawan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(5) CHECK (status IN ('H', 'S', 'I', 'A', 'C')),
    check_in TIME,
    check_out TIME,
    source VARCHAR(20) DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
    upload_id UUID REFERENCES attendance_uploads(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_emp_date UNIQUE (employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_emp_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) - Izinkan Read & Write untuk Aplikasi
-- ------------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for branches" ON branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for attendance_uploads" ON attendance_uploads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for attendance_records" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
