# Panduan Setup Database Supabase - Wira Toyota

Berikut adalah langkah mudah menghubungkan aplikasi Rekap Absensi ini ke database **Supabase**:

---

## Langkah 1: Buat Proyek di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan login ke akun Anda.
2. Klik tombol **"New Project"**.
3. Beri nama proyek (contoh: `wira-rekap-absensi`) dan tentukan Database Password.
4. Pilih region terdekat (misal: `Singapore`).
5. Tunggu 1-2 menit hingga proyek siap digunakan.

---

## Langkah 2: Jalankan Skema Tabel & Data Awal (Seed)
1. Di sidebar kiri dashboard Supabase, klik menu **SQL Editor**.
2. Klik tombol **"New query"**.
3. Buka file [schema.sql](./schema.sql), salin (copy) seluruh kodenya, lalu tempel (paste) ke SQL Editor Supabase, kemudian klik **Run** (Ctrl + Enter).
4. Buat query baru lagi, salin isi file [seed.sql](./seed.sql), tempel dan klik **Run**.
5. Tabel `users`, `branches`, `employees`, `attendance_uploads`, dan `attendance_records` kini telah aktif di database Anda!

---

## Langkah 3: Ambil Kredensial API Supabase
1. Di dashboard Supabase, buka menu **Project Settings** (ikon gerigi di kiri bawah) > **API**.
2. Salin nilai berikut:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **anon / public key** (kunci panjang berawalan `eyJhb...`)

---

## Langkah 4: Pasang ke File `.env` di Aplikasi
Buat atau edit file `.env` di folder utama aplikasi (`c:/WEB REKAP ABSENSI/.env`) dengan format:

```env
VITE_SUPABASE_URL=https://proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Setelah file `.env` disimpan, restart dev server dengan:
```bash
npm run dev
```

Status di pojok kanan atas aplikasi akan berubah menjadi **"Supabase Terhubung"** (Hijau) dan semua data tersimpan langsung ke PostgreSQL Supabase!
