# 🗄️ Reset Database SMARTB - Panduan Singkat

## 🎯 Tujuan
Menghapus dan membuat ulang database SMARTB dengan struktur yang benar untuk mengatasi masalah registrasi.

## 📋 Langkah-langkah Reset Database

### Method 1: Manual (Recommended)

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project SMARTB Anda

2. **Buka SQL Editor**
   - Klik menu "SQL Editor" di sidebar
   - Klik "New Query" untuk membuat query baru

3. **Reset Database**
   ```sql
   -- Jalankan query ini untuk reset database
   DROP SCHEMA IF EXISTS public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

4. **Jalankan SQL Terbaru**
   - Copy seluruh isi file `reset_database.sql`
   - Paste ke SQL Editor
   - Klik "Run" untuk menjalankan

### Method 2: Script Otomatis

1. **Jalankan script reset**
   ```bash
   node reset_database.js
   ```

2. **Verifikasi hasil**
   - Cek apakah semua tabel terbuat
   - Cek apakah fungsi `create_user` dan `create_user_profile` ada
   - Test registrasi dengan `node register-account.js`

## 🔍 Verifikasi Database

Setelah reset, pastikan tabel dan fungsi berikut sudah terbuat:

### Tabel Utama
- ✅ `users` - Custom users table
- ✅ `user_profiles` - User treatment profiles
- ✅ `daily_inputs` - Daily health data
- ✅ `point_transactions` - Point system
- ✅ `achievements` - Available achievements
- ✅ `reminders` - Scheduled reminders
- ✅ `community_posts` - Community features

### Fungsi Penting
- ✅ `create_user()` - Membuat user di custom table
- ✅ `create_user_profile()` - Membuat user profile

### Policy RLS
- ✅ Users can create own profile
- ✅ Allow function to create user profiles
- ✅ Users can manage own data

## 🧪 Test Registrasi

1. **Jalankan test registrasi**
   ```bash
   node register-account.js
   ```

2. **Cek hasil registrasi**
   - User berhasil dibuat di `auth.users`
   - User berhasil dibuat di `users` (custom table)
   - User profile berhasil dibuat di `user_profiles`

## 🚨 Troubleshooting

### Error: "Function already exists"
```sql
DROP FUNCTION IF EXISTS create_user(UUID, VARCHAR, VARCHAR, VARCHAR, DATE, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS create_user_profile(UUID, DATE, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT);
```

### Error: "Policy already exists"
```sql
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Allow function to create user profiles" ON user_profiles;
```

### Error: "Permission denied"
- Pastikan menggunakan akun admin
- Cek apakah RLS policies sudah benar

## 📞 Support

Jika mengalami masalah:
1. Cek log di Supabase Dashboard → Logs
2. Pastikan konfigurasi URL dan API key benar
3. Test step by step sesuai panduan

## 🎉 Selesai!

Database SMARTB sudah siap digunakan dengan struktur yang benar dan masalah registrasi sudah teratasi.
