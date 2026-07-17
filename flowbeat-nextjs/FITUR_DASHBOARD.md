# 🩺 Fitur-Fitur Dashboard Flowbeat

Dashboard Flowbeat adalah aplikasi web berbasis **Next.js 15** yang berfungsi sebagai antarmuka monitoring pasien untuk tenaga medis. Sistem ini terhubung ke backend Laravel (`flowbeat-be-laravel`) melalui REST API, dan menggunakan **Clerk** untuk autentikasi serta **Laravel Echo + Pusher** untuk data real-time.

---

## 📌 Struktur Halaman

```
/               → Dashboard overview (statistik & grafik)
/patients       → Daftar semua pasien
/patients/[uuid]→ Detail satu pasien (profil, grafik, riwayat, catatan)
/sign-in        → Halaman login (Clerk)
```

---

## 1. 🏠 Dashboard Overview (`/`)

Halaman utama yang menampilkan ringkasan kondisi seluruh pasien secara sekilas.

### Kartu Statistik
| Kartu | Deskripsi |
|---|---|
| **Total Pasien** | Jumlah seluruh pasien yang terdaftar |
| **Pasien Berisiko** | Pasien dengan kondisi tekanan darah tinggi (hipertensi) |
| **Pasien Normal** | Pasien dengan kondisi tekanan darah dalam rentang normal |
| **Pemeriksaan Hari Ini** | Jumlah pasien yang sudah vs belum diperiksa hari ini |

### Grafik & Widget
- **Distribusi Status Tekanan Darah** — chart sebaran status pasien (Normal, Hipertensi Tingkat 1, dst.)
- **Bar Chart Agregat** — visualisasi data pasien keseluruhan
- **Quick Search** — pencarian cepat pasien berdasarkan nama atau ID
- **Tabel Pasien Terbaru** — daftar pasien yang baru-baru ini mengirimkan data pengukuran

---

## 2. 📋 Daftar Pasien (`/patients`)

Tabel lengkap seluruh pasien yang terdaftar di sistem.

### Fitur Tabel
- **Pencarian real-time** — filter nama pasien (first/last name) secara langsung
- **Sorting kolom** — klik header Nama atau Usia untuk sort ascending/descending
- **Pagination** — navigasi antar halaman data pasien

### Kolom Data
| Kolom | Keterangan |
|---|---|
| MRN | ID unik pasien (5 karakter terakhir UUID) |
| Nama | Nama lengkap pasien (klik untuk ke detail) |
| Usia | Umur pasien |
| Tekanan Darah Terakhir | Nilai SYS/DIA pengukuran terakhir |
| Denyut Terakhir | BPM terakhir |
| SpO2 | Saturasi oksigen terakhir |
| Terakhir Diperiksa | Waktu relatif (misal: "2 jam yang lalu") |

### Aksi per Pasien (Dropdown Menu)
- Salin MRN Pasien
- Lihat Detail Pasien
- Laporan

---

## 3. 👤 Detail Pasien (`/patients/[uuid]`)

Halaman lengkap satu pasien, terbagi menjadi dua kolom utama.

### Kolom Kiri — Profil Pasien
- Foto profil pasien
- Nama lengkap, usia, jenis kelamin
- Tinggi badan (TB) dan berat badan (BB)
- Waktu kunjungan/pengukuran terakhir

### Kolom Kanan — Data Medis

#### 📈 Grafik Tekanan Darah
- Visualisasi interaktif data SYS (Systolic) dan DIA (Diastolic) dari waktu ke waktu
- Data diambil dari riwayat pengukuran pasien

#### 📊 Grafik Tanda Vital *(coming soon)*
- Visualisasi BPM (detak jantung) dan SpO2 (saturasi oksigen)

#### 📃 Tabel Riwayat Medis
Tabel historis semua pengukuran pasien dengan kolom:

| Kolom | Keterangan |
|---|---|
| Tanggal | Waktu pengukuran dilakukan |
| SYS / DIA | Tekanan darah sistolik & diastolik |
| Denyut (BPM) | Detak jantung saat pengukuran |
| SpO2 | Saturasi oksigen |
| Pergerakan (MOV) | Ikon merah jika terdeteksi gerakan tubuh saat pengukuran |
| Denyut Tidak Teratur (IHB) | Ikon merah jika detak jantung tidak beraturan |
| Status | Kategori kondisi (Normal, Normal Tinggi, Hipertensi, dst.) |

- **Pagination** untuk navigasi riwayat pengukuran yang panjang
- **Health Insight Popup** — panduan kategori tekanan darah:
  - 🟢 Normal: SYS 90–120 / DIA 60–80
  - 🟡 Normal Tinggi: SYS 121–139 / DIA 81–89
  - 🟠 Hipertensi Stage 1: SYS 140–159 / DIA 90–99
  - 🔴 Hipertensi Stage 2: SYS ≥160 / DIA ≥100
  - ⚠️ Krisis Hipertensi: SYS ≥180 / DIA ≥110

---

## 4. 📝 Catatan Medis

Terintegrasi di halaman detail pasien. Memungkinkan tenaga medis mencatat informasi klinis per pasien.

### Manajemen Catatan
- **Tambah** catatan baru melalui dialog/modal
- **Edit** catatan yang sudah ada
- **Hapus** catatan dengan dialog konfirmasi

### Properti Catatan
| Field | Keterangan |
|---|---|
| Judul | Judul singkat catatan |
| Isi | Konten catatan (mendukung multi-baris) |
| Kategori | Konsultasi / Diagnosis / Pemeriksaan / Pengobatan / Penting |
| Tag | Label bebas yang bisa ditambahkan (contoh: #hipertensi, #rutin) |
| Tanggal | Otomatis terisi waktu pembuatan |

### Filter Catatan
- Filter berdasarkan **Kategori**
- Filter berdasarkan **Tanggal** (pemilih kalender)
- Filter berdasarkan **Kata Kunci** — mencari di judul, isi, maupun tag

---

## 5. ⏱️ Control Delay (Interval Monitoring)

Dropdown di halaman detail pasien untuk mengatur frekuensi refresh data secara otomatis.

| Mode | Interval |
|---|---|
| Real-time monitoring | 3 detik |
| Respon cepat | 30 detik |
| Normal monitoring | 1 menit |
| Hemat data | 5 menit |

---

## 6. 🔐 Autentikasi & Keamanan

- Login menggunakan **Clerk** (email + password)
- Seluruh route dashboard dilindungi **middleware Clerk** — pengguna yang belum login otomatis diarahkan ke `/sign-in`
- Akun pengguna dikelola melalui Clerk Dashboard (tidak ada halaman sign-up mandiri)
- Token autentikasi dikirim sebagai `Bearer` header ke setiap request API

---

## 7. 🔄 Real-Time Data (WebSocket)

- Menggunakan **Laravel Echo** + **Pusher** untuk menerima data baru secara real-time
- Ketika pasien mengirim pengukuran baru dari mobile app, halaman detail dokter langsung memperbarui data tanpa perlu refresh manual
- Channel WebSocket: `patient.{id}`
- Event yang didengarkan: `.BloodPressureDataEvent`

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|---|---|
| Next.js 15 (Turbopack) | Framework frontend |
| React 19 | UI library |
| Tailwind CSS | Styling |
| Radix UI | Komponen UI (Dialog, Dropdown, Select, dll.) |
| Recharts | Visualisasi grafik |
| Clerk | Autentikasi |
| Axios | HTTP client ke backend API |
| Laravel Echo + Pusher | WebSocket real-time |
| Day.js | Format tanggal & waktu relatif |

---

## 🔗 Koneksi ke Backend

Semua data diambil dari backend Laravel melalui variabel:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

Endpoint utama yang digunakan:

| Endpoint | Kegunaan |
|---|---|
| `GET /patients` | Daftar semua pasien |
| `GET /patients/summary/status` | Statistik status pasien |
| `GET /patients/recent` | Pasien terbaru |
| `GET /patients/statistics/distribution` | Distribusi tekanan darah |
| `GET /patients/{uuid}` | Detail satu pasien |
| `GET /patients/{uuid}/notes` | Catatan medis pasien |
| `POST /patients/{uuid}/notes` | Tambah catatan baru |
| `PUT /notes/{id}` | Edit catatan |
| `DELETE /notes/{id}` | Hapus catatan |
| `GET /patients/{id}/blood-pressures` | Riwayat tekanan darah |
| `GET /patients/{id}/vital-signs` | Riwayat tanda vital |
