# RPM — Remote Patient Monitoring

Sistem untuk memantau tanda vital pasien dari jarak jauh. Data diambil dari alat ukur, dikirim ke server, lalu ditampilkan di aplikasi mobile dan dashboard dokter.

Data yang dipantau:

- **Tekanan darah dan detak jantung**: dari tensimeter **Omron** (HEM-7155T / HEM-7142T) lewat Bluetooth
- **SpO₂, BPM, dan suhu**: dari sensor **MAX30102** yang dipasang di board **ESP32**
- **Estimasi gula darah**: dihitung oleh model *Machine Learning* dari data di atas

Repositori ini adalah **monorepo**: semua bagian proyek (aplikasi, backend, firmware) ada di satu tempat.

---

## Daftar Isi

1. [Gambaran Sistem](#1-gambaran-sistem)
2. [Struktur Folder](#2-struktur-folder)
3. [Software yang Perlu Dipasang](#3-software-yang-perlu-dipasang)
4. [Mulai dari Mana?](#4-mulai-dari-mana)
5. [Cara Menjalankan Tiap Bagian](#5-cara-menjalankan-tiap-bagian)
6. [Daftar Port](#6-daftar-port)
7. [Melihat Susunan Folder Lama (`_RawProject`)](#7-melihat-susunan-folder-lama-_rawproject)
8. [Masalah yang Sering Terjadi](#8-masalah-yang-sering-terjadi)
9. [Aturan Penting](#9-aturan-penting)

---

## 1. Gambaran Sistem

```
   ALAT UKUR                     SERVER (BACKEND)                    PENGGUNA
 ┌────────────────┐  Bluetooth  ┌──────────────────────────┐      ┌─────────────────────┐
 │ Tensimeter     │ ──────────► │ sensors-gateway          │ ◄──► │ 📱 apps/mobile       │
 │ Omron          │             │ (Python FastAPI)         │      │    (pasien)          │
 └────────────────┘             │  - login & profil pasien │      └─────────────────────┘
 ┌────────────────┐  WiFi/HTTP  │  - data pengukuran       │      ┌─────────────────────┐
 │ ESP32 +        │ ──────────► │  - prediksi gula darah   │ ◄──► │ 💻 apps/dashboard-*  │
 │ MAX30102       │             └──────────────────────────┘      │    (dokter & admin)  │
 └────────────────┘                                               └─────────────────────┘
                                ┌──────────────────────────┐
                                │ api-laravel              │  Backend tesis Flowbeat:
                                │ (PHP Laravel)            │  menyeragamkan data dari
                                └──────────────────────────┘  berbagai tipe tensimeter
```

Ringkasnya:

- **`sensors-gateway`** adalah backend utama. Aplikasi mobile, dashboard, dan ESP32 semuanya terhubung ke sini.
- **`apps/`** berisi aplikasi yang dipakai langsung oleh pengguna.
- **`firmware/`** berisi kode yang di-*upload* ke board ESP32.

---

## 2. Struktur Folder

```
RPM/
├── apps/                         ← Aplikasi yang dipakai pengguna
│   ├── mobile/                   React Native + Expo, aplikasi pasien
│   ├── dashboard-next/           Next.js, dashboard dokter (login via Clerk)
│   └── dashboard-laravel/        Laravel 13, dashboard dokter & admin (versi lain)
│
├── services/                     ← Backend / server
│   ├── sensors-gateway/          Python FastAPI, backend utama (Omron + SpO₂ + ML)
│   ├── api-laravel/              Laravel 12, backend integrasi data (tesis Flowbeat)
│   └── ml-glucose/               Python, training & API mandiri model gula darah
│
├── firmware/                     ← Kode untuk mikrokontroler (Arduino C++)
│   ├── esp32c3-max30102-oled/    Sensor SpO₂ + layar OLED, kirim data via WiFi
│   └── esp32s3-bridge/           ESP32 sebagai jembatan Bluetooth ke tensimeter Omron
│
├── tools/                        ← Alat bantu pengujian
│   ├── k6_stress_test.js         Uji beban untuk sensors-gateway
│   ├── uji-beban.js              Uji beban untuk api-laravel
│   └── fetching script and gui/  Tampilan web untuk membaca sensor lewat USB
│
├── docs/                         ← Dokumentasi teknis lengkap
├── _archive/                     ← Kode lama yang sudah tidak dipakai
└── _RawProject/                  ← Salinan asli semua repo sebelum digabung (lihat bagian 7)
```

> 💡 Hampir setiap folder di `apps/` dan `services/` punya **`README.md` sendiri** dengan panduan yang lebih lengkap. README ini hanya ringkasan supaya kamu tahu harus mulai dari mana.

---

## 3. Software yang Perlu Dipasang

Kamu **tidak perlu memasang semuanya**. Pasang hanya yang dibutuhkan oleh bagian yang mau kamu kerjakan.

| Software | Versi | Dibutuhkan untuk | Cara cek | Unduh |
|---|---|---|---|---|
| **Git** | terbaru | semua | `git --version` | https://git-scm.com |
| **VS Code** | terbaru | semua (disarankan) | — | https://code.visualstudio.com |
| **Python** | 3.10+ | `sensors-gateway`, `ml-glucose` | `python --version` | https://www.python.org |
| **Node.js** | 20 LTS+ | `mobile`, `dashboard-next`, aset Laravel | `node -v` | https://nodejs.org |
| **PHP** | 8.3+ | `api-laravel`, `dashboard-laravel` | `php -v` | lewat [Laragon](https://laragon.org) / [Herd](https://herd.laravel.com) / XAMPP |
| **Composer** | 2.x | `api-laravel`, `dashboard-laravel` | `composer -V` | https://getcomposer.org |
| **Expo Go** (di HP) | terbaru | `mobile` | — | Play Store / App Store |
| **Arduino IDE** | 2.x | `firmware/` | — | https://www.arduino.cc/en/software |
| **k6** | terbaru | `tools/` (uji beban) | `k6 version` | https://k6.io |

> ⚠️ **Pengguna Windows:** saat memasang Python, **centang "Add Python to PATH"**. Kalau lupa, perintah `python` tidak akan dikenali di terminal.

---

## 4. Mulai dari Mana?

Pilih sesuai tugasmu:

| Saya ingin… | Jalankan | Lihat |
|---|---|---|
| Mengubah **tampilan aplikasi HP** | `apps/mobile` saja (secara default sudah terhubung ke server online) | [5.2](#52-aplikasi-mobile-appsmobile) |
| Mengubah **dashboard dokter** | `apps/dashboard-next` | [5.3](#53-dashboard-dokter-nextjs-appsdashboard-next) |
| Mengubah **backend / API** | `services/sensors-gateway` | [5.1](#51-backend-utama-servicessensors-gateway) |
| Menjalankan **seluruh sistem di laptop** | `sensors-gateway` → `mobile` → `dashboard-next` (berurutan) | bagian 5 |
| Mengutak-atik **sensor ESP32** | `firmware/esp32c3-max30102-oled` | [5.6](#56-firmware-esp32-firmware) |

> 💡 **Paling cepat untuk pemula:** mulai dari `apps/mobile`. Aplikasi ini sudah diarahkan ke server online (`rpms.gilangramadhani.tech`), jadi kamu tidak perlu menyalakan backend sendiri.

### Cara membuka terminal di folder tertentu

1. Buka folder `RPM` di VS Code (**File → Open Folder**).
2. Buka terminal: **Terminal → New Terminal** (atau tekan ``Ctrl + ` ``).
3. Pindah ke folder yang dituju, misalnya:

   ```bash
   cd services/sensors-gateway
   ```

Semua perintah di bagian 5 dijalankan **dari dalam folder komponennya masing-masing**.

---

## 5. Cara Menjalankan Tiap Bagian

### 5.1 Backend utama (`services/sensors-gateway`)

Backend Python yang menerima data dari tensimeter dan ESP32, lalu melayani aplikasi mobile dan dashboard.

```powershell
cd services/sensors-gateway

# 1. Buat virtual environment (cukup sekali)
python -m venv .venv

# 2. Aktifkan virtual environment (lakukan setiap kali membuka terminal baru)
.venv\Scripts\Activate.ps1        # Windows PowerShell
# .venv\Scripts\activate.bat      # Windows Command Prompt
# source .venv/bin/activate       # macOS / Linux

# 3. Pasang library (cukup sekali)
pip install -r requirements.txt

# 4. Siapkan file konfigurasi .env (cukup sekali)
copy .env.example .env
python scripts/secretkey-generate.py
```

Buka file `.env`, lalu isi minimal:

- `SECRET_KEY`: salin hasil dari `secretkey-generate.py`
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`: minta ke tim. Tanpa nilai ini server **gagal menyala** (error `Invalid app id`).

Jalankan server:

```powershell
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Cek di browser: **http://localhost:8000/docs**. Kalau muncul halaman Swagger, berarti server sudah jalan.

📖 Panduan lengkap (pairing Omron, daftar variabel `.env`, arsitektur): [services/sensors-gateway/README.md](services/sensors-gateway/README.md)

---

### 5.2 Aplikasi mobile (`apps/mobile`)

```bash
cd apps/mobile
npm install          # cukup sekali, bisa beberapa menit
npx expo start
```

Scan QR code yang muncul di terminal memakai aplikasi **Expo Go** di HP. HP dan laptop harus terhubung ke **WiFi yang sama**.

**Mau memakai backend di laptop sendiri?** Ubah `BASE_URL` di [apps/mobile/utils/Config.js](apps/mobile/utils/Config.js) menjadi IP laptopmu, misalnya `http://192.168.1.10:8000`.

> ⚠️ Jangan pakai `localhost`. Dari HP, `localhost` berarti HP itu sendiri, bukan laptopmu. Cek IP laptop dengan perintah `ipconfig` (Windows).

📖 Panduan lengkap: [apps/mobile/README.md](apps/mobile/README.md)

---

### 5.3 Dashboard dokter Next.js (`apps/dashboard-next`)

```bash
cd apps/dashboard-next
npm install
copy env.local.example .env.local     # lalu isi nilainya
npm run dev
```

Buka **http://localhost:3000**.

Dashboard ini memakai **Clerk** untuk login. Kamu perlu mengisi kunci Clerk dan alamat backend di `.env.local`; minta nilainya ke tim.

📖 Panduan lengkap (cara mengatur Clerk dan peran admin/dokter): [apps/dashboard-next/README.md](apps/dashboard-next/README.md)

---

### 5.4 Dashboard Laravel (`apps/dashboard-laravel`) — opsional

Versi dashboard lain yang dibuat dengan Laravel. Data pasien diambil dari `sensors-gateway`.

```bash
cd apps/dashboard-laravel
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan db:seed --class=AdminSeeder
php artisan serve --port=8082
```

Buka **http://127.0.0.1:8082**. Akun admin untuk development: `admin@rpms.test` / `admin123`.

Atur `RPMS_API_BASE_URL` di `.env` ke alamat `sensors-gateway` (misalnya `http://127.0.0.1:8000`).

📖 Panduan lengkap: [apps/dashboard-laravel/README.md](apps/dashboard-laravel/README.md)

---

### 5.5 Backend Laravel Flowbeat (`services/api-laravel`) — opsional

Backend hasil tesis yang menyeragamkan data dari beberapa tipe tensimeter Omron ke satu format, lewat endpoint `POST /api/v1/ingest`.

```bash
cd services/api-laravel
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8080
```

Akun uji: `test@example.com` / `password`. Secara default database memakai SQLite. Kalau ingin memakai MySQL, ubah bagian `DB_*` di `.env`.

📖 Panduan lengkap ada di `_RawProject/flowbeat/README.md`, bagian 5 dan 7–12.

---

### 5.6 Firmware ESP32 (`firmware/`)

| Folder | Board | Fungsi |
|---|---|---|
| `esp32c3-max30102-oled/` | ESP32-C3 | Membaca SpO₂ / BPM / suhu, tampil di OLED, kirim ke `sensors-gateway` |
| `esp32s3-bridge/` | ESP32 | Jembatan Bluetooth: laptop ↔ ESP32 (USB) ↔ tensimeter Omron |

Langkah singkat:

1. Buka file `.ino` di dalam folder tersebut dengan Arduino IDE.
2. Sesuaikan nama WiFi, password, alamat server (`server_url`), dan `X-Service-Key` di bagian atas kode.
3. Pilih board dan port yang benar, lalu klik **Upload**.
4. Buka **Serial Monitor** dengan baud rate **115200** untuk melihat log.

> ⚠️ Nama file `.ino` **harus sama** dengan nama foldernya (aturan Arduino IDE). Jangan ganti salah satunya saja.

📖 Wiring dan penjelasan algoritma: [docs/DOKUMENTASI_LENGKAP.md](docs/DOKUMENTASI_LENGKAP.md) bagian 10. Setup bridge: [firmware/esp32s3-bridge/setupArduinoIde.md](firmware/esp32s3-bridge/setupArduinoIde.md).

---

### 5.7 Model gula darah (`services/ml-glucose`) — opsional

Folder ini dipakai untuk **melatih ulang** model. `sensors-gateway` sudah membawa salinan model jadinya di `services/sensors-gateway/ml_model/`, jadi folder ini **tidak perlu dijalankan** untuk pemakaian biasa.

```bash
cd services/ml-glucose
python -m venv venv
venv\Scripts\Activate.ps1
pip install fastapi uvicorn pydantic numpy pandas scikit-learn joblib
python train_v6.py        # melatih ulang model (opsional)
python api_server.py      # API prediksi di http://localhost:8005/docs
```

> Setelah melatih ulang, salin file `model_v6.joblib`, `scaler_v6.joblib`, dan `metadata_v6.joblib` ke `services/sensors-gateway/ml_model/` supaya backend utama memakai model terbaru.

📖 Panduan lengkap: [services/ml-glucose/README.md](services/ml-glucose/README.md)

---

## 6. Daftar Port

Kalau beberapa bagian dijalankan bersamaan di satu laptop, setiap bagian harus memakai **port yang berbeda**. Gunakan pembagian berikut supaya tidak bentrok:

| Bagian | Port | Alamat |
|---|---|---|
| `services/sensors-gateway` | 8000 | http://localhost:8000/docs |
| `services/ml-glucose` | 8005 | http://localhost:8005/docs |
| `services/api-laravel` | 8080 | http://127.0.0.1:8080 |
| `apps/dashboard-laravel` | 8082 | http://127.0.0.1:8082 |
| `apps/dashboard-next` | 3000 | http://localhost:3000 |
| `apps/mobile` (Expo) | 8081 | scan QR code di terminal |

---

## 7. Melihat Susunan Folder Lama (`_RawProject`)

Sebelum digabung menjadi monorepo, proyek ini terdiri dari beberapa repositori terpisah. **Salinan aslinya disimpan apa adanya di folder [`_RawProject/`](_RawProject/)**. Buka folder itu kalau kamu ingin:

- melihat susunan folder sebelum digabung,
- membandingkan kode lama dengan yang sekarang,
- membaca README asli dari tiap repositori.

> ⚠️ Folder `_RawProject` hanya untuk **referensi dan cadangan**. Jangan mengedit atau menjalankan kode dari sana. Semua pengembangan dilakukan di `apps/`, `services/`, dan `firmware/`.

Tabel berikut menunjukkan **folder baru** yang berasal dari **folder lama** di `_RawProject`:

| Folder baru | Berasal dari `_RawProject/…` | Catatan |
|---|---|---|
| `apps/mobile` | `Flowbeat-RN-Expo` | Versi lain: `flowbeat/flowbeat-RN` |
| `apps/dashboard-next` | `Flowbeat_Dashboard` | Versi lain: `flowbeat/flowbeat-nextjs` |
| `apps/dashboard-laravel` | `Dashboard-RPMS` | Versi lain: `Website-Dashboard` |
| `services/sensors-gateway` | `Tensimeter-and-MAX30102` | Versi lain: `SENSOR-MAX-FINAL-OLED`, `flowbeat/flowbeat-be-python`, `flowbeat/omron-python` |
| `services/api-laravel` | `flowbeat/flowbeat-be-API` | — |
| `services/ml-glucose` | `Prediksi-gula-darah` | — |
| `firmware/esp32c3-max30102-oled` | `Tensimeter-and-MAX30102/ESP32-S3 MAX30102/…` | Versi lain: `SENSOR-MAX-FINAL-OLED/…`, `SpO2-sensor/ino` |
| `firmware/esp32s3-bridge` | `Tensimeter-and-MAX30102/omblepy-esp32bridge/esp32bridge` | — |
| `tools/` | `SpO2-sensor/fetching script and gui`, file `k6_stress_test.js` dan `uji-beban.js` | — |
| `docs/` | file `DOKUMENTASI_*.md` dari `Tensimeter-and-MAX30102` | Diagram arsitektur & OpenAPI masih ada di `flowbeat/docs` |

> 📌 README di dalam setiap komponen ditulis saat masih menjadi repositori terpisah, jadi ada yang masih menyebut nama folder lama (misalnya `cd Dashboard-RPMS` atau `cd Flowbeat-RN-Expo`). Ganti dengan path baru dari tabel di atas.

---

## 8. Masalah yang Sering Terjadi

| Masalah | Penyebab | Solusi |
|---|---|---|
| `python` / `node` / `php` tidak dikenali | Software belum terpasang atau belum masuk PATH | Pasang ulang dan centang "Add to PATH", lalu **tutup dan buka lagi** terminal |
| VS Code menandai merah `Cannot find module ...` di file Python | VS Code belum memakai virtual environment | Tekan `Ctrl+Shift+P` → **Python: Select Interpreter** → pilih `services/sensors-gateway/.venv` |
| PowerShell menolak `Activate.ps1` | Kebijakan keamanan PowerShell | Jalankan sekali: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `ValueError: Invalid app id` saat menjalankan `sensors-gateway` | Kredensial Pusher di `.env` kosong | Isi `PUSHER_*` di `.env` |
| `Address already in use` / port sudah dipakai | Dua server memakai port yang sama | Pakai port sesuai [tabel di bagian 6](#6-daftar-port) |
| Aplikasi HP tidak bisa terhubung ke backend lokal | Memakai `localhost`, atau HP dan laptop beda WiFi | Pakai IP laptop (cek dengan `ipconfig`) dan pastikan WiFi sama |
| `npm install` atau `pip install` gagal di WiFi kampus | Proxy/SSL diblokir | Coba pakai hotspot HP, atau lihat solusi proxy di README `sensors-gateway` |
| Arduino IDE: *"The sketch must be in a folder named …"* | Nama file `.ino` berbeda dengan nama folder | Samakan nama file `.ino` dengan nama foldernya |
| Data tensimeter bertanggal `2021-01-01` | Jam tensimeter belum disetel | Sambungkan dulu ke aplikasi resmi Omron Connect di HP, lalu coba lagi |

---

## 9. Aturan Penting

- **Jangan commit file rahasia.** Contohnya `.env`, `.env.local`, password WiFi, `SERVICE_KEY`, dan kunci Clerk/Pusher. Yang boleh di-commit hanya file contohnya (`.env.example`).
- **Jangan commit folder hasil instalasi.** Contohnya `node_modules/`, `vendor/`, `.venv/`, dan `venv/`. Folder ini bisa dibuat ulang dengan `npm install`, `composer install`, atau `pip install`.
- **Jangan commit file database lokal** seperti `omron.db` dan `*.sqlite`.
- **Firmware ESP32 masih menyimpan SSID dan service key langsung di kode.** Ganti nilainya sebelum repositori dibagikan ke publik.
- Dokumentasi teknis lengkap ada di folder [`docs/`](docs/). Kalau kamu mengubah endpoint API, perbarui juga [docs/dokumentasi_api_lengkap.md](docs/dokumentasi_api_lengkap.md).
