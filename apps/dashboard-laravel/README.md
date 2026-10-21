# Dashboard RPMS (Remote Patient Monitoring System)

Dashboard web untuk dokter dan admin dalam memantau data kesehatan pasien (tekanan darah, detak jantung, SpO2) yang dikirim dari aplikasi mobile RPMS. Dashboard dibangun dengan **Laravel 13** dan mengambil data pasien dari **backend mobile (FastAPI/Python)** melalui REST API.

---

## Daftar Isi

- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Kebutuhan Sistem](#kebutuhan-sistem)
- [Instalasi](#instalasi)
- [Konfigurasi `.env`](#konfigurasi-env)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Akun Default](#akun-default)
- [Daftar Route](#daftar-route)
- [Struktur Folder](#struktur-folder)
- [Troubleshooting](#troubleshooting)

---

## Fitur

**Dokter**
- Login ke dashboard
- Melihat daftar pasien yang ditugaskan beserta tanda vital terbaru
- Melihat laporan/riwayat pengukuran pasien dalam bentuk grafik (Chart.js)

**Admin**
- Membuat akun dokter baru
- Menugaskan (assign) pasien/profil ke dokter, dengan pencarian pasien berdasarkan nomor telepon

**API untuk aplikasi mobile**
- `GET /api/doctor/by-profile/{profile_id}` — mengembalikan nama dan nomor telepon dokter pendamping untuk sebuah profil pasien

---

## Arsitektur

```
┌──────────────────┐      BLE      ┌────────────────────────┐      HTTP (X-Service-Key)     ┌─────────────────────┐
│ Alat ukur Omron  │ ────────────► │ Backend Mobile         │ ◄──────────────────────────── │ Dashboard RPMS       │
│ (tensimeter dll) │               │ (FastAPI, port 8000)   │                                │ (Laravel, port 8000) │
└──────────────────┘               │ data user, profil,     │ ──── GET /api/doctor/... ────► │ data dokter & admin  │
                                   │ pengukuran             │                                │ (SQLite)             │
                                   └────────────────────────┘                                └─────────────────────┘
```

- **Dashboard (repo ini)** menyimpan data dokter, admin, dan relasi dokter–pasien (`doctor_profiles`) di database lokal (SQLite secara default).
- **Data pasien dan pengukuran** tidak disimpan di dashboard, melainkan diambil dari backend mobile lewat [app/Services/MobileApiService.php](app/Services/MobileApiService.php).
- Folder [backend_mobile/](backend_mobile/) hanya berisi sebagian file referensi dari backend mobile (FastAPI). Backend lengkapnya dijalankan dari repositori/proyek tersendiri.

---

## Kebutuhan Sistem

| Komponen | Versi | Keterangan |
|---|---|---|
| PHP | **8.3 atau lebih baru** | Wajib (Laravel 13) |
| Composer | 2.x | Untuk dependensi PHP |
| Node.js | 20.19+ atau 22.x | Untuk Vite & Tailwind |
| npm | 10.x | Ikut terpasang bersama Node.js |
| SQLite | 3.x | Database default (sudah tersedia lewat ekstensi PHP) |
| MySQL/MariaDB | opsional | Jika tidak ingin memakai SQLite |
| Backend Mobile RPMS | — | Harus berjalan dan bisa diakses dari jaringan yang sama |
| Koneksi internet | — | Tampilan memuat Tailwind CDN dan Chart.js dari CDN |

**Ekstensi PHP yang perlu aktif** (cek dengan `php -m`):
`pdo_sqlite`, `sqlite3`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`.
Jika memakai MySQL, aktifkan juga `pdo_mysql`.

> **Pengguna Windows:** cara termudah adalah memasang [Laragon](https://laragon.org/) atau [Laravel Herd](https://herd.laravel.com/) yang sudah menyertakan PHP, Composer, dan Node.js. Jika memakai XAMPP, pastikan versi PHP-nya 8.3+ dan baris `extension=pdo_sqlite`, `extension=sqlite3`, serta `extension=fileinfo` di `php.ini` tidak diberi tanda `;`.

---

## Instalasi

### 1. Masuk ke folder proyek

```bash
cd Dashboard-RPMS
```

### 2. Pasang dependensi PHP

```bash
composer install
```

### 3. Pasang dependensi JavaScript

```bash
npm install
```

### 4. Siapkan file environment

```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Kemudian buat application key:

```bash
php artisan key:generate
```

### 5. Siapkan database

**Opsi A — SQLite (default, paling mudah)**

Buat file database kosong:

```bash
# Linux / macOS / Git Bash
touch database/database.sqlite

# Windows PowerShell
New-Item database/database.sqlite -ItemType File
```

**Opsi B — MySQL/MariaDB**

Buat database baru (misalnya `dashboard_rpms`), lalu ubah `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dashboard_rpms
DB_USERNAME=root
DB_PASSWORD=
```

### 6. Jalankan migrasi dan seeder

```bash
php artisan migrate
php artisan db:seed                      # membuat akun-akun dokter
php artisan db:seed --class=AdminSeeder  # membuat akun admin
```

> `AdminSeeder` tidak dipanggil otomatis oleh `DatabaseSeeder`, sehingga perlu dijalankan terpisah seperti di atas.

### 7. Build aset frontend

```bash
npm run build
```

---

## Konfigurasi `.env`

Selain konfigurasi standar Laravel, dashboard membutuhkan koneksi ke backend mobile:

```env
APP_NAME="Dashboard RPMS"
APP_URL=http://localhost:8000

# Alamat backend mobile (FastAPI). Gunakan IP komputer yang menjalankan backend.
RPMS_API_BASE_URL=http://192.168.1.100:8000

# Batas waktu request ke backend mobile (detik)
RPMS_API_TIMEOUT=10

# Kunci layanan; dikirim sebagai header X-Service-Key.
# Nilainya harus sama dengan yang dikonfigurasi di backend mobile.
RPMS_API_KEY=isi_dengan_kunci_dari_backend_mobile
```

Setiap kali `.env` diubah, bersihkan cache konfigurasi:

```bash
php artisan config:clear
```

---

## Menjalankan Aplikasi

### 1. Jalankan backend mobile terlebih dahulu

Backend mobile (FastAPI) harus aktif agar daftar pasien dan grafik pengukuran bisa tampil. Contoh dari folder backend mobile:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Pastikan alamatnya sama dengan `RPMS_API_BASE_URL` di `.env`, dan dapat dibuka dari komputer yang menjalankan dashboard (coba buka `http://<IP-backend>:8000/docs` di browser).

### 2. Jalankan dashboard

**Cara cepat (server + queue + log + Vite sekaligus):**

```bash
composer run dev
```

**Atau cukup server saja:**

```bash
php artisan serve
```

Buka di browser: **http://127.0.0.1:8000**

> **Bentrok port:** jika backend mobile dan dashboard berjalan di komputer yang sama, keduanya tidak bisa memakai port 8000. Jalankan dashboard di port lain:
>
> ```bash
> php artisan serve --port=8080
> ```
>
> Agar dashboard bisa diakses dari perangkat lain di jaringan yang sama:
>
> ```bash
> php artisan serve --host=0.0.0.0 --port=8080
> ```

---

## Akun Default

Akun berikut dibuat oleh seeder dan **hanya untuk keperluan pengembangan**. Ganti password sebelum dipakai di lingkungan produksi.

| Role | Nama | Email | Password |
|---|---|---|---|
| Admin | Admin RPMS | `admin@rpms.test` | `admin123` |
| Dokter | Dr. Ahmad Fauzi | `dr.fauzi@rpms.test` | `password` |
| Dokter | Dr. Siti Rahayu | `dr.rahayu@rpms.test` | `password` |
| Dokter | Dr. Budi Santoso | `dr.santoso@rpms.test` | `password` |
| Dokter | Dr. Dewi Lestari | `dr.lestari@rpms.test` | `password` |

Admin diarahkan ke `/admin`, dokter diarahkan ke `/dashboard`.

---

## Daftar Route

| Method | URL | Akses | Keterangan |
|---|---|---|---|
| GET | `/login` | Publik | Halaman login |
| POST | `/login` | Publik | Proses login |
| POST | `/register` | Publik | Registrasi dari halaman login |
| POST | `/logout` | Login | Keluar |
| GET | `/dashboard` | Dokter | Ringkasan pasien |
| GET | `/patients` | Dokter | Daftar pasien |
| GET | `/patients/{id}/report` | Dokter | Laporan & grafik pasien |
| GET | `/admin` | Admin | Dashboard admin |
| GET/POST | `/admin/create-doctor` | Admin | Membuat akun dokter |
| GET/POST | `/admin/assign-patient` | Admin | Menugaskan pasien ke dokter |
| GET | `/api/doctor/by-profile/{profile_id}` | Publik | Data dokter untuk aplikasi mobile |
| GET | `/up` | Publik | Health check |

Endpoint backend mobile yang dipanggil dashboard:

- `GET /api/profiles/{id_user}`
- `GET /api/profiles/search?phone={phone}`
- `GET /api/measurements/{id_profile}` dan `/latest`
- `GET /api/measurements/{id_profile}/spo2` dan `/spo2/latest`

---

## Struktur Folder

```
Dashboard-RPMS/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/AdminController.php     # kelola dokter & assign pasien
│   │   ├── Api/DoctorApiController.php   # API untuk aplikasi mobile
│   │   ├── Auth/                         # login & register
│   │   ├── DashboardController.php
│   │   └── PatientController.php
│   ├── Http/Middleware/AdminMiddleware.php
│   ├── Models/                           # User, DoctorProfile
│   └── Services/MobileApiService.php     # klien HTTP ke backend mobile
├── backend_mobile/                       # file referensi backend FastAPI (tidak lengkap)
├── config/services.php                   # konfigurasi rpms_api
├── database/
│   ├── migrations/
│   └── seeders/                          # AdminSeeder, DoctorSeeder
├── resources/views/                      # tampilan Blade (admin, auth, dashboard, patients)
├── routes/web.php
└── .env.example
```

---

## Perintah Berguna

```bash
php artisan migrate:fresh --seed          # reset database + seed dokter
php artisan db:seed --class=AdminSeeder   # tambah akun admin
php artisan route:list                    # lihat semua route
php artisan optimize:clear                # bersihkan semua cache
php artisan test                          # jalankan pengujian
./vendor/bin/pint                         # merapikan format kode PHP
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Your Composer dependencies require a PHP version ">= 8.3"` | Perbarui PHP ke versi 8.3 atau lebih baru. |
| `could not find driver` | Aktifkan ekstensi `pdo_sqlite` (atau `pdo_mysql`) di `php.ini`. |
| `Database file at path [...] does not exist` | Buat file `database/database.sqlite` (lihat langkah 5). |
| `No application encryption key has been specified` | Jalankan `php artisan key:generate`. |
| Daftar pasien kosong / grafik tidak muncul | Pastikan backend mobile berjalan, `RPMS_API_BASE_URL` benar, `RPMS_API_KEY` sama dengan backend, lalu jalankan `php artisan config:clear`. Cek detail error di `storage/logs/laravel.log`. |
| `Connection timed out` ke backend | Pastikan kedua komputer ada di jaringan yang sama dan firewall mengizinkan port backend. |
| `Address already in use` saat `php artisan serve` | Gunakan port lain: `php artisan serve --port=8080`. |
| Tampilan berantakan tanpa styling | Tailwind dimuat dari CDN; pastikan ada koneksi internet. |
| `Vite manifest not found` | Jalankan `npm run build` atau `npm run dev`. |
| Error 403 di halaman `/admin` | Akun yang dipakai bukan admin. Login dengan akun admin. |
