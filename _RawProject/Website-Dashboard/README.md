# RPMS Portal — Website Dashboard

Dashboard web untuk **Remote Patient Monitoring System (RPMS)**. Dokter bisa login, melihat daftar pasien, dan membuka laporan hasil pengukuran tekanan darah (sistolik, diastolik, detak jantung) yang dikirim dari aplikasi mobile/alat Omron.

Proyek ini dibuat dengan **Laravel 13** (PHP). Data pasien dan hasil pengukuran **tidak disimpan di website ini**, tetapi diambil dari **API backend mobile** (FastAPI/Python) lewat HTTP.

```
┌──────────────────┐      HTTP (X-Service-Key)      ┌──────────────────────┐
│ Website Dashboard│ ─────────────────────────────▶ │ Backend Mobile (API) │
│ (Laravel, proyek │   /api/profiles/...            │ FastAPI + SQLite     │
│  ini)            │   /api/measurements/...        │ (port 8000)          │
└──────────────────┘                                └──────────────────────┘
        │
        ▼
 Database lokal (SQLite): akun dokter/admin + daftar pasien yang di-assign ke dokter
```

---

## Daftar Isi

1. [Fitur](#fitur)
2. [Yang Perlu Diinstal](#yang-perlu-diinstal)
3. [Langkah Menjalankan Proyek](#langkah-menjalankan-proyek)
4. [Akun Login Bawaan](#akun-login-bawaan)
5. [Cara Pakai Singkat](#cara-pakai-singkat)
6. [Struktur Folder](#struktur-folder)
7. [Perintah yang Sering Dipakai](#perintah-yang-sering-dipakai)
8. [Masalah yang Sering Muncul](#masalah-yang-sering-muncul)

---

## Fitur

| Peran      | Yang bisa dilakukan                                                                 |
|------------|--------------------------------------------------------------------------------------|
| **Dokter** | Login, melihat dashboard, melihat daftar pasien yang di-assign, membuka laporan pasien |
| **Admin**  | Membuat akun dokter baru, meng-assign pasien (profile dari API mobile) ke dokter     |

---

## Yang Perlu Diinstal

Pastikan program berikut sudah terpasang di komputer kamu:

| Program      | Versi minimal | Cek versi dengan          | Link unduh |
|--------------|---------------|---------------------------|------------|
| **PHP**      | **8.3**       | `php -v`                  | https://www.php.net/downloads (Windows: bisa pakai [Laragon](https://laragon.org) atau [XAMPP](https://www.apachefriends.org) versi PHP 8.3+) |
| **Composer** | 2.x           | `composer -V`             | https://getcomposer.org/download |
| **Node.js**  | 20 atau lebih baru | `node -v` dan `npm -v` | https://nodejs.org |

> ⚠️ **Penting:** Laravel 13 **wajib PHP 8.3 ke atas**. Kalau `php -v` menampilkan 8.2 atau lebih rendah, perintah `composer install` akan gagal. Perbarui PHP dulu.

Pastikan juga ekstensi PHP berikut aktif (di file `php.ini`, hapus tanda `;` di depan barisnya):

```ini
extension=pdo_sqlite
extension=sqlite3
extension=mbstring
extension=openssl
extension=fileinfo
extension=curl
```

---

## Langkah Menjalankan Proyek

Jalankan semua perintah di bawah dari **folder proyek ini** (folder yang berisi file `artisan`). Di VS Code, buka terminal dengan menu **Terminal → New Terminal**.

### 1. Instal dependency PHP

```bash
composer install
```

Perintah ini mengunduh semua library PHP ke folder `vendor/`.

### 2. Instal dependency JavaScript

```bash
npm install
```

### 3. Buat file `.env`

File `.env` berisi pengaturan aplikasi (nama aplikasi, database, alamat API, dll). Buat file baru bernama **`.env`** di folder utama proyek, lalu isi dengan:

```env
APP_NAME="RPMS Portal"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
APP_LOCALE=id

DB_CONNECTION=sqlite

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

LOG_CHANNEL=stack
LOG_LEVEL=debug

# ── Koneksi ke Backend Mobile (API) ──
# Ganti dengan alamat IP/port tempat backend mobile berjalan
RPMS_API_BASE_URL=http://10.20.31.178:8000
RPMS_API_TIMEOUT=10
# Harus sama dengan service key yang diset di backend mobile
RPMS_SERVICE_KEY=
```

> 💡 `APP_KEY` sengaja dikosongkan — akan diisi otomatis di langkah berikutnya.

### 4. Buat application key

```bash
php artisan key:generate
```

Setelah ini, baris `APP_KEY=` di file `.env` akan terisi otomatis.

### 5. Siapkan database

Proyek ini memakai **SQLite**, jadi kamu tidak perlu instal MySQL. Cukup buat file kosong `database/database.sqlite`:

**Windows (PowerShell):**
```powershell
New-Item database/database.sqlite -ItemType File
```

**Mac/Linux/Git Bash:**
```bash
touch database/database.sqlite
```

Lalu buat tabel-tabelnya:

```bash
php artisan migrate
```

### 6. Isi akun awal (seeder)

```bash
# Membuat 4 akun dokter contoh
php artisan db:seed

# Membuat akun admin
php artisan db:seed --class=AdminSeeder
```

### 7. Jalankan aplikasi

Buka **dua terminal** (keduanya di folder proyek):

**Terminal 1** — server Laravel:
```bash
php artisan serve
```

**Terminal 2** — Vite (untuk CSS/JS):
```bash
npm run dev
```

Lalu buka browser ke: **http://127.0.0.1:8000**

Kamu akan otomatis diarahkan ke halaman login. 🎉

> 💡 **Alternatif satu perintah:** `composer run dev` menjalankan server, queue, log, dan Vite sekaligus.

---

## Akun Login Bawaan

Setelah menjalankan seeder di langkah 6, kamu bisa login dengan akun berikut:

| Peran  | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | `admin@rpms.test`      | `admin123` |
| Dokter | `dr.fauzi@rpms.test`   | `password` |
| Dokter | `dr.rahayu@rpms.test`  | `password` |
| Dokter | `dr.santoso@rpms.test` | `password` |
| Dokter | `dr.lestari@rpms.test` | `password` |

> ⚠️ Akun-akun ini hanya untuk development. **Jangan dipakai di server produksi.**

---

## Cara Pakai Singkat

Agar dokter bisa melihat data pasien, **backend mobile harus berjalan** dan alamatnya sudah benar di `RPMS_API_BASE_URL`.

1. Login sebagai **admin** → buka `/admin`.
2. (Opsional) Buat akun dokter baru di menu **Create Doctor** (`/admin/create-doctor`).
3. Buka **Assign Patient** (`/admin/assign-patient`), masukkan **ID user dari aplikasi mobile**, pilih profile pasien, lalu pilih dokter yang akan menanganinya.
4. Logout, lalu login sebagai **dokter** tersebut.
5. Buka **Patients** (`/patients`) → klik pasien untuk melihat laporan pengukurannya.

### Daftar halaman (routes)

| URL                        | Keterangan                  | Akses   |
|----------------------------|-----------------------------|---------|
| `/login`                   | Halaman login               | Semua   |
| `/dashboard`               | Dashboard dokter            | Dokter  |
| `/patients`                | Daftar pasien               | Dokter  |
| `/patients/{id}/report`    | Laporan detail pasien       | Dokter  |
| `/admin`                   | Dashboard admin             | Admin   |
| `/admin/create-doctor`     | Form buat akun dokter       | Admin   |
| `/admin/assign-patient`    | Form assign pasien ke dokter| Admin   |

Untuk melihat semua route: `php artisan route:list`

---

## Struktur Folder

Folder-folder yang paling sering kamu sentuh:

```
Website-Dashboard/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/AdminController.php   ← logika halaman admin
│   │   │   ├── Auth/                       ← login, logout, register
│   │   │   ├── DashboardController.php     ← dashboard dokter
│   │   │   └── PatientController.php       ← daftar & laporan pasien
│   │   └── Middleware/AdminMiddleware.php  ← membatasi halaman khusus admin
│   ├── Models/
│   │   ├── User.php                        ← akun dokter/admin
│   │   └── DoctorProfile.php               ← relasi dokter ↔ pasien
│   └── Services/MobileApiService.php       ← semua pemanggilan ke API mobile
├── config/services.php                     ← konfigurasi rpms_api (dibaca dari .env)
├── database/
│   ├── migrations/                         ← struktur tabel database
│   └── seeders/                            ← data awal (akun admin & dokter)
├── resources/views/                        ← tampilan HTML (Blade)
│   ├── auth/login.blade.php
│   ├── dashboard/index.blade.php
│   ├── patients/                           ← index & report pasien
│   └── admin/                              ← halaman admin
├── routes/web.php                          ← daftar URL aplikasi
├── backend_mobile/                         ← cuplikan kode backend mobile (referensi saja)
└── .env                                    ← pengaturan lokal (buat sendiri, jangan di-commit)
```

**Alur kerja singkat Laravel:** URL di `routes/web.php` → memanggil method di `Controller` → controller mengambil data (dari database atau `MobileApiService`) → hasilnya ditampilkan lewat file di `resources/views/`.

### Tentang folder `backend_mobile/`

Folder ini **bukan bagian yang dijalankan** oleh website. Isinya hanya sebagian file backend FastAPI (Python) sebagai referensi endpoint. Backend mobile yang lengkap dijalankan terpisah — lihat [backend_mobile/README.md](backend_mobile/README.md) untuk daftar endpoint API-nya.

### File lain di folder utama

- `dashboard.html` — mockup/desain statis halaman detail pasien (tidak dipakai Laravel).
- `Dashboard_RPMS` — salinan database SQLite lama. Tidak dipakai secara default; aplikasi memakai `database/database.sqlite`.

---

## Perintah yang Sering Dipakai

| Perintah                                   | Fungsi                                              |
|--------------------------------------------|-----------------------------------------------------|
| `php artisan serve`                        | Menjalankan server di http://127.0.0.1:8000         |
| `npm run dev`                              | Menjalankan Vite (auto-reload CSS/JS)               |
| `npm run build`                            | Build CSS/JS untuk produksi                         |
| `php artisan migrate`                      | Menjalankan migrasi database                        |
| `php artisan migrate:fresh --seed`         | **Hapus semua tabel**, buat ulang, lalu isi seeder  |
| `php artisan db:seed --class=AdminSeeder`  | Membuat/memperbarui akun admin                      |
| `php artisan route:list`                   | Melihat semua URL/route                             |
| `php artisan optimize:clear`               | Membersihkan cache (config, route, view)            |
| `php artisan test`                         | Menjalankan test                                    |
| `php artisan tinker`                       | Konsol interaktif untuk mencoba kode/query          |

---

## Masalah yang Sering Muncul

**❌ `composer install` gagal: "Your PHP version does not satisfy that requirement"**
Versi PHP kamu di bawah 8.3. Perbarui PHP, lalu cek lagi dengan `php -v`.

**❌ `No application encryption key has been specified`**
Jalankan `php artisan key:generate`.

**❌ `Database file at path [...database.sqlite] does not exist`**
File database belum dibuat. Ulangi [langkah 5](#5-siapkan-database).

**❌ `could not find driver` (SQLite)**
Ekstensi `pdo_sqlite` belum aktif. Buka `php.ini`, hapus `;` di depan `extension=pdo_sqlite` dan `extension=sqlite3`, lalu restart terminal.

**❌ `no such table: sessions` / `no such table: users`**
Migrasi belum dijalankan. Jalankan `php artisan migrate`.

**❌ Daftar pasien kosong / data pengukuran tidak muncul**
- Pastikan backend mobile sedang berjalan.
- Cek `RPMS_API_BASE_URL` di `.env` sudah sesuai IP & port backend. Coba buka alamat itu di browser — harus ada respons.
- Pastikan `RPMS_SERVICE_KEY` sama dengan yang diset di backend.
- Pastikan pasien sudah di-assign ke dokter oleh admin.
- Lihat detail error di file `storage/logs/laravel.log` (cari kata `MobileApi`).

**❌ Perubahan di `.env` tidak berpengaruh**
Jalankan `php artisan config:clear`, lalu restart `php artisan serve`.

**❌ Tampilan berantakan / tanpa style**
Halaman memakai Tailwind dari CDN, jadi butuh koneksi internet. Pastikan juga `npm run dev` sedang berjalan.

**❌ Port 8000 sudah dipakai (misalnya oleh backend mobile di komputer yang sama)**
Jalankan Laravel di port lain: `php artisan serve --port=8080`, lalu buka http://127.0.0.1:8080.
