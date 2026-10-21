# RPM (Remote Patient Monitoring) — Panduan Folder

Dokumen ini menjelaskan **isi tiap folder** di proyek ini dan **urutan mana yang perlu dijalankan lebih dulu**. Cocok dibaca pertama kali oleh developer yang baru bergabung.

> Detail cara instalasi tiap komponen ada di `README.md` masing-masing folder. Dokumen ini hanya peta besarnya.

---

## Asal Proyek

Proyek ini adalah **gabungan dari dua sumber** di GitHub:

| Sumber | Folder di proyek ini |
|---|---|
| Organisasi [TA-Remote-Patient-Monitoring](https://github.com/TA-Remote-Patient-Monitoring) (8 repo) | `Tensimeter-and-MAX30102/`, `SENSOR-MAX-FINAL-OLED/`, `Flowbeat-RN-Expo/`, `Flowbeat_Dashboard/`, `Dashboard-RPMS/`, `Website-Dashboard/`, `Prediksi-gula-darah/`, `SpO2-sensor/` |
| Repo [ahmadsidikrofi/flowbeat](https://github.com/ahmadsidikrofi/flowbeat/tree/ivan), branch `ivan` | `flowbeat/` |

Tiap folder di atas awalnya adalah **repo terpisah**. Karena itu ada beberapa folder yang isinya mirip (lihat [Folder Duplikat](#6-folder-duplikat)). Jika ingin melihat riwayat perubahan (commit) sebuah folder, buka repo asalnya.

---

## Daftar Isi

1. [Gambaran Sistem](#1-gambaran-sistem)
2. [Ringkasan Prioritas](#2-ringkasan-prioritas)
3. [Penjelasan Tiap Folder](#3-penjelasan-tiap-folder)
4. [Urutan Menjalankan](#4-urutan-menjalankan)
5. [Daftar Port](#5-daftar-port)
6. [Folder Duplikat](#6-folder-duplikat)
7. [Masalah yang Sering Terjadi](#7-masalah-yang-sering-terjadi)

---

## 1. Gambaran Sistem

Sistem ini memantau tanda vital pasien (tekanan darah, detak jantung, SpO2, dan perkiraan gula darah) dari jarak jauh.

```
 PERANGKAT                    BACKEND UTAMA                       TAMPILAN
 ─────────                    ─────────────                       ────────
 Tensimeter Omron ──(BLE)──┐
                           ├──► Tensimeter-and-MAX30102 ◄────── Flowbeat-RN-Expo   (aplikasi HP pasien)
 ESP32 + MAX30102 ─(WiFi)──┘    FastAPI, port 8000        ◄────── Dashboard-RPMS     (web dokter, Laravel)
                                + database SQLite         ◄────── Flowbeat_Dashboard (web admin, Next.js)
                                + model ML gula darah
```

Intinya:

- **Ada satu backend utama**, yaitu `Tensimeter-and-MAX30102`. Hampir semua komponen lain bergantung padanya. Jalankan ini lebih dulu.
- **Aplikasi HP dan dashboard web hanya menampilkan data.** Mereka mengambil data dari backend utama.
- **Perangkat keras (tensimeter, ESP32)** saat development. Tanpa alat pun, API tetap bisa dicoba lewat Swagger (`/docs`).

---

## 2. Ringkasan Prioritas

| Prioritas | Arti |
|---|---|
| 🔴 **1 — Wajib** | Harus jalan dulu, komponen lain bergantung padanya |
| 🟠 **2 — Utama** | Aplikasi yang dipakai pengguna. Jalankan sesuai bagian yang sedang dikerjakan |
| 🟡 **3 — Perangkat keras** | Hanya perlu jika kamu punya alatnya |
| ⚪ **4 — Opsional / Duplikat** | Versi lama, salinan, atau proyek terpisah. Boleh dilewati |

| Folder | Fungsi singkat | Teknologi | Prioritas |
|---|---|---|---|
| `Tensimeter-and-MAX30102/` | Backend utama (API, database, Omron, ML) | Python FastAPI | 🔴 1 |
| `Flowbeat-RN-Expo/` | Aplikasi HP untuk pasien | React Native (Expo) | 🟠 2 |
| `Dashboard-RPMS/` | Website untuk dokter | Laravel (PHP) | 🟠 2 |
| `Flowbeat_Dashboard/` | Website dashboard admin | Next.js | 🟠 2 |
| `Tensimeter-and-MAX30102/ESP32-S3 MAX30102/` | Firmware sensor SpO2 / detak jantung | Arduino (C++) | 🟡 3 |
| `Tensimeter-and-MAX30102/omblepy-esp32bridge/` | ESP32 sebagai jembatan Bluetooth ke Omron | Arduino + Python | 🟡 3 |
| `SpO2-sensor/` | Demo sensor SpO2 lewat kabel USB | Arduino + HTML/JS | 🟡 3 (opsional) |
| `Prediksi-gula-darah/` | Melatih ulang / mencoba model ML | Python | ⚪ 4 |
| `SENSOR-MAX-FINAL-OLED/` | Versi lama backend utama | Python FastAPI | ⚪ 4 (duplikat) |
| `Website-Dashboard/` | Salinan lain dari `Dashboard-RPMS` | Laravel (PHP) | ⚪ 4 (duplikat) |
| `flowbeat/` | Proyek tesis terpisah (Ivan) | Laravel + Python + RN + Next.js | ⚪ 4 (terpisah) |

---

## 3. Penjelasan Tiap Folder

### 🔴 `Tensimeter-and-MAX30102/` — Backend Utama

**Ini jantung sistem.** Server API yang:

- menyimpan akun, profil pasien, dan hasil pengukuran (database SQLite `omron.db`),
- membaca tensimeter **Omron** lewat Bluetooth (`omblepy.py`, folder `deviceSpecific/`),
- menerima data SpO2 dari **ESP32 + MAX30102**,
- menghitung **perkiraan gula darah** dengan model ML di folder `ml_model/` (dimuat langsung, tidak perlu server ML terpisah),
- menyediakan endpoint untuk dokter, catatan, dan dashboard (folder `routers/`).

| | |
|---|---|
| Cara jalan | `python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000` |
| Cek berhasil | Buka `http://localhost:8000/docs` |
| Dokumentasi | `README.md`, `DOKUMENTASI_LENGKAP.md`, `dokumentasi_api_lengkap.md` |

Sub-folder yang perlu diketahui:

| Sub-folder | Isi |
|---|---|
| `routers/` | Kode endpoint API (auth, profiles, measurements, doctor, notes, dashboard) |
| `ml_model/` | Model prediksi gula darah (`.joblib`) dan `predictor.py` |
| `deviceSpecific/` | Driver untuk tiap tipe tensimeter Omron (HEM-7155T, HEM-7142T, dll.) |
| `ESP32-S3 MAX30102/` | Firmware sensor SpO2 (lihat prioritas 3) |
| `omblepy-esp32bridge/` | ESP32 sebagai pengganti Bluetooth laptop (lihat prioritas 3) |

---

### 🟠 `Flowbeat-RN-Expo/` — Aplikasi HP Pasien

Aplikasi mobile tempat pasien login, mengukur tekanan darah, dan melihat riwayat.

| | |
|---|---|
| Cara jalan | `npm install` lalu `npx expo start` |
| Butuh | Backend utama. Alamatnya diatur di `utils/Config.js` (`BASE_URL`) |
| Dokumentasi | `README.md`, `guide.md` (daftar endpoint yang dipakai) |

---

### 🟠 `Dashboard-RPMS/` — Website Dokter

Website untuk dokter melihat daftar pasien dan laporan pengukurannya. Data diambil dari backend utama.

| | |
|---|---|
| Cara jalan | `composer install`, `npm install`, atur `.env`, `php artisan migrate --seed`, lalu `php artisan serve --port=8080` |
| Butuh | Backend utama. Alamatnya diatur di `.env` (`RPMS_API_BASE_URL`) |
| Dokumentasi | `README.md` (berisi akun login bawaan) |

> Folder `backend_mobile/` di dalamnya **tidak dijalankan**. Itu hanya salinan sebagian kode backend utama sebagai referensi.

---

### 🟠 `Flowbeat_Dashboard/` — Website Admin

Dashboard web berbasis Next.js untuk admin (daftar pasien, grafik tekanan darah, notifikasi real-time).

| | |
|---|---|
| Cara jalan | `npm install`, salin `env.local.example` jadi `.env.local`, lalu `npm run dev` |
| Butuh | Akun **Clerk** (untuk login), backend utama (`NEXT_PUBLIC_MOBILE_API_BASE_URL`) |
| Dokumentasi | `README.md` |

---

### 🟡 Perangkat Keras

Bagian ini hanya perlu jika kamu memegang alatnya.

| Folder | Fungsi |
|---|---|
| `Tensimeter-and-MAX30102/ESP32-S3 MAX30102/` | Firmware sensor MAX30102 dengan layar OLED. Mengirim hasil SpO2 ke backend lewat WiFi. **Ubah SSID WiFi dan `server_url` di file `.ino` sebelum upload.** |
| `Tensimeter-and-MAX30102/omblepy-esp32bridge/` | Dipakai jika Bluetooth laptop tidak stabil. ESP32 yang terhubung ke Omron, laptop cukup lewat kabel USB. |
| `SpO2-sensor/` | Versi sederhana: sensor dibaca lewat kabel USB dan tampil di halaman web (Chrome/Edge). Tidak butuh backend. Cocok untuk belajar atau tes sensor. |

---

### ⚪ `Prediksi-gula-darah/` — Eksperimen Model ML

Tempat **melatih ulang** model gula darah (`train_v6.py`) dan mencobanya sebagai API terpisah di port 8005.

- **Tidak wajib dijalankan.** Backend utama sudah memuat salinan model yang sama di `ml_model/`.
- Jika kamu melatih ulang model, **salin file `.joblib` hasilnya** ke `Tensimeter-and-MAX30102/ml_model/` supaya backend memakai versi baru.

---

### ⚪ `flowbeat/` — Proyek Tesis Terpisah

Sistem lain hasil tesis (Ivan) dengan arsitektur berbeda: data Omron masuk lewat **Laravel** (`flowbeat-be-API`, endpoint `/api/v1/ingest`) ke MySQL.

| Sub-folder | Isi |
|---|---|
| `flowbeat-be-API/` | Backend Laravel tesis |
| `omron-python/` | Bridge Omron untuk HEM-7142T (port 8000) |
| `flowbeat-be-python/` | Bridge Omron untuk HEM-7155T (port 8001) |
| `flowbeat-RN/` | Versi lain aplikasi HP (mirip `Flowbeat-RN-Expo`) |
| `flowbeat-nextjs/` | Versi lain dashboard (mirip `Flowbeat_Dashboard`) |
| `docs/` | Diagram arsitektur dan `openapi.yaml` |

Jalankan hanya jika kamu memang mengerjakan bagian tesis tersebut. Panduannya ada di `flowbeat/README.md`.

---

## 4. Urutan Menjalankan

Untuk mencoba sistem dari awal sampai data tampil:

```
Langkah 1  Tensimeter-and-MAX30102   → cek http://localhost:8000/docs
Langkah 2  Pilih tampilan yang ingin dikerjakan:
             • Flowbeat-RN-Expo      (aplikasi HP)
             • Dashboard-RPMS        (web dokter, port 8080)
             • Flowbeat_Dashboard    (web admin, port 3000)
Langkah 3  (Opsional) Hubungkan alat: Omron atau ESP32 + MAX30102
```

Tips untuk pemula:

1. **Selalu jalankan backend utama dulu.** Jika aplikasi HP atau dashboard menampilkan error koneksi, biasanya backend belum jalan atau alamatnya salah.
2. **Tiap komponen dijalankan di terminal masing-masing.** Jangan ditutup selama dipakai.
3. **Untuk aplikasi HP dan ESP32, jangan pakai `localhost`.** Gunakan IP laptop (misalnya `http://192.168.1.10:8000`), dan pastikan HP/ESP32 berada di WiFi yang sama.
4. Cek IP laptop di Windows dengan perintah `ipconfig` (lihat baris `IPv4 Address`).

---

## 5. Daftar Port

| Port | Dipakai oleh |
|---|---|
| `8000` | Backend utama (`Tensimeter-and-MAX30102`) |
| `8080` | `Dashboard-RPMS` (supaya tidak bentrok dengan 8000) |
| `3000` | `Flowbeat_Dashboard` |
| `8081` | Expo dev server (`Flowbeat-RN-Expo`) |
| `8005` | `Prediksi-gula-darah` (opsional) |

> Satu port hanya bisa dipakai satu program. Jika muncul error `address already in use`, ganti port atau tutup program yang memakainya.

---

## 6. Folder Duplikat

Beberapa folder isinya **mirip tapi tidak identik**. Gunakan versi utama, kecuali ada alasan khusus.

| Versi utama ✅ | Duplikat / versi lain ⚪ | Catatan |
|---|---|---|
| `Tensimeter-and-MAX30102/` | `SENSOR-MAX-FINAL-OLED/` | Versi utama punya fitur dokter, catatan, dan dashboard. Versi lama hanya auth, profil, dan pengukuran. |
| `Dashboard-RPMS/` | `Website-Dashboard/` | Sekitar 87 file berbeda. Versi utama punya `.env.example` dan controller API. |
| `Flowbeat-RN-Expo/` | `flowbeat/flowbeat-RN/` | Versi di dalam `flowbeat/` mengikuti backend tesis. |
| `Flowbeat_Dashboard/` | `flowbeat/flowbeat-nextjs/` | Sama seperti di atas. |
| `Tensimeter-and-MAX30102/ml_model/` | `Prediksi-gula-darah/` | File model **sama persis**. |
| `Tensimeter-and-MAX30102/ESP32-S3 MAX30102/` | `SENSOR-MAX-FINAL-OLED/max30102_esp32c3_oled_oximeter/`, `SpO2-sensor/ino/` | Firmware untuk board berbeda (ESP32-S3 vs ESP32-C3) atau mode berbeda (WiFi vs USB). |

> **Jangan menghapus folder duplikat** sebelum dipastikan tidak ada kode penting yang hanya ada di sana. Bandingkan dulu dengan versi utama.

---

## 7. Masalah yang Sering Terjadi

| Masalah | Penyebab umum | Solusi |
|---|---|---|
| Aplikasi/dashboard tidak bisa ambil data | Backend utama belum jalan, atau alamat salah | Jalankan backend, cek `BASE_URL` / `RPMS_API_BASE_URL` |
| HP tidak bisa konek ke backend | Pakai `localhost`, atau beda WiFi | Pakai IP laptop, satu WiFi, izinkan port di Windows Firewall |
| `address already in use` | Port sudah dipakai | Lihat [Daftar Port](#5-daftar-port), ganti port |
| Tensimeter Omron tidak terdeteksi | Belum pairing, atau Bluetooth laptop lemah | Lakukan pairing (lihat README backend utama), atau pakai `omblepy-esp32bridge` |
| `ModuleNotFoundError` di Python | Library belum terpasang | Aktifkan virtual environment, jalankan `pip install -r requirements.txt` |
| Error setelah `npm install` | Cache rusak | Hapus folder `node_modules`, lalu `npm install` lagi |
