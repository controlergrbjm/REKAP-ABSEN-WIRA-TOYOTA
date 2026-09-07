-- ==============================================================================
-- WIRA TOYOTA ATTENDANCE SYSTEM - SEED DATA
-- Jalankan query ini di SQL Editor Supabase setelah menjalankan schema.sql
-- ==============================================================================

-- 1. Seed Default Branch
INSERT INTO branches (id, name, code)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'WIRA MEGAH BANJARMASIN', 'GR BJM')
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Default Users sesuai permintaan:
-- Hendri: PW 'BISMILLAH', Role 'Service Manager'
-- Surya Paloh: PW '1', Role 'Staff Digitalisasi'
-- Rizky / Leader: PW '1', Role 'Operation Leader'

INSERT INTO users (username, password, display_name, role, role_label, avatar, color)
VALUES 
    ('HENDRI', 'BISMILLAH', 'Hendri', 'service_manager', 'Service Manager', 'H', '#C00000'),
    ('SURYA PALOH', '1', 'Surya Paloh', 'staff_digitalisasi', 'Staff Digitalisasi', 'SP', '#1D4ED8'),
    ('RIZKY', '1', 'Rizky', 'operation_leader', 'Operation Leader', 'R', '#7C3AED'),
    ('LEADER', '1', 'Rizky', 'operation_leader', 'Operation Leader', 'OL', '#7C3AED')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    role_label = EXCLUDED.role_label;
