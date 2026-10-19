# Flowbeat Backend API

Backend integrasi data tanda vital dari tensimeter Omron (HEM-7142T dan HEM-7155T) ke satu skema data kanonis. Hasil tesis S2 Sistem Informasi, Telkom University.

Penulis: Muhamad Ivan Fadilah (branch `ivan`)
Modul terkait: aplikasi mobile dan dasbor web (branch `alaric`)

---

## Daftar Isi
1. [Gambaran Singkat](#1-gambaran-singkat)
2. [Struktur Folder](#2-struktur-folder)
3. [Kebutuhan Perangkat Lunak](#3-kebutuhan-perangkat-lunak)
4. [Clone Proyek](#4-clone-proyek)
5. [Menjalankan Backend Laravel](#5-menjalankan-backend-laravel)
6. [Menjalankan Bridge Omron (FastAPI)](#6-menjalankan-bridge-omron-fastapi)
7. [Alur Pakai dari Awal sampai Data Tersimpan](#7-alur-pakai-dari-awal-sampai-data-tersimpan)
8. [Daftar Endpoint](#8-daftar-endpoint)
9. [Pengujian](#9-pengujian)
10. [Menambah Perangkat Baru](#10-menambah-perangkat-baru)
11. [Masalah yang Sering Muncul](#11-masalah-yang-sering-muncul)
12. [Aturan Git](#12-aturan-git)

---

## 1. Gambaran Singkat

```
Omron (BLE) → Bridge FastAPI → Klien Penerus → Laravel /api/v1/ingest → MySQL
                                (HP / Postman)        ↑
                                              Dasbor baca /api/v1/monitoring/latest
```

Hal paling penting yang harus dipahami:

- **Bridge tidak mengirim data ke Laravel sendiri.** Bridge hanya membaca tensimeter lewat Bluetooth lalu mengembalikan JSON. Yang meneruskan JSON itu ke Laravel adalah **klien**, yaitu aplikasi mobile saat dipakai, atau Postman dan k6 saat pengujian.
- **Satu bridge untuk satu tensimeter.** HEM-7142T di port `8000`, HEM-7155T di port `8001`.
- **Laravel cuma punya satu pintu masuk data**, yaitu `POST /api/v1/ingest`. Laravel sendiri yang mengenali perangkat dari `mac_address`, menyeragamkan data, menyaring data aneh, dan mencegah data ganda.

Diagram lengkap ada di `docs/arsitektur_final.png`.

---

## 2. Struktur Folder

```
flowbeat/
├── flowbeat-be-API/      ← backend Laravel (inti tesis)
├── omron-python/         ← bridge FastAPI untuk HEM-7142T
├── flowbeat-be-python/   ← bridge FastAPI untuk HEM-7155T
├── flowbeat-RN/          ← aplikasi mobile React Native (modul Alaric)
└── flowbeat-nextjs/      ← dasbor web Next.js (modul Alaric)
```

File penting di backend:

| File | Fungsi |
|---|---|
| `routes/api.php` | daftar endpoint |
| `bootstrap/app.php` | pendaftaran middleware keamanan |
| `app/Http/Controllers/ApiAdapterController.php` | gerbang ingest |
| `app/Http/Controllers/MonitoringController.php` | endpoint baca untuk dasbor |
| `app/Adapters/AdapterRegistry.php` | memilih adapter dari `mac_address` |
| `app/Adapters/Hem7142Adapter.php`, `Hem7155Adapter.php`, `VendorBAdapter.php` | penerjemah tiap perangkat |
| `app/Adapters/CanonicalVitalSign.php` | bentuk data seragam |
| `app/Services/DataQualityService.php` | aturan kelogisan medis |
| `app/Services/VitalSignClassifier.php` | status Normal, Waspada, Tinggi |
| `app/Http/Middleware/SecurityHeaders.php`, `RequestLogger.php` | header keamanan dan log permintaan |
| `app/Console/Commands/IntegrationQualityReport.php` | laporan kualitas integrasi |
| `uji-beban.js` | skrip uji beban k6 |

---

## 3. Kebutuhan Perangkat Lunak

| Perangkat lunak | Versi | Untuk |
|---|---|---|
| XAMPP | PHP 8.2 ke atas, MySQL | backend dan basis data |
| Composer | terbaru | dependensi Laravel |
| Python | 3.10 | bridge Omron |
| Postman | terbaru | uji API manual |
| k6 | terbaru | uji beban |
| Git | terbaru | versi kode |

Laptop yang menjalankan bridge **harus punya Bluetooth** (minimal 4.2, lebih baik 5.0).

---

## 4. Clone Proyek

Clone semua:
```bash
git clone <link-repo>
```

Clone branch tertentu saja:
```bash
git clone -b ivan --single-branch <link-repo>
```

Ambil update terbaru:
```bash
git pull origin ivan
```

---

## 5. Menjalankan Backend Laravel

Masuk ke folder backend:
```bash
cd flowbeat-be-API
```

**5.1 Pasang dependensi**
```bash
composer install
```

**5.2 Siapkan file .env**
```bash
copy .env.example .env
php artisan key:generate
```
Lalu buka `.env` dan isi bagian database:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=flowbeat
DB_USERNAME=root
DB_PASSWORD=
```

**5.3 Nyalakan MySQL di XAMPP**, lalu buat database kosong bernama `flowbeat` lewat phpMyAdmin.

**5.4 Buat tabel dan akun uji**
```bash
php artisan migrate --seed
```
Perintah ini membuat tabel `users`, `patient_records`, `anomaly_logs`, `api_request_logs`, dan `personal_access_tokens`, serta satu akun uji:
- email: `test@example.com`
- password: `password`

Mau mulai dari nol lagi (semua data terhapus):
```bash
php artisan migrate:fresh --seed
```

**5.5 Jalankan server**
```bash
php artisan serve --port=8080
```
Backend aktif di `http://127.0.0.1:8080`.

Supaya HP bisa mengakses laptop, jalankan juga ngrok di terminal lain:
```bash
ngrok http 8080
```
Salin alamat `https://....ngrok-free.app` ke konfigurasi aplikasi mobile.

---

## 6. Menjalankan Bridge Omron (FastAPI)

Masuk ke folder bridge (contoh untuk HEM-7142T):
```bash
cd omron-python
pip install -r requirements.txt
```

**6.1 Pairing, cukup sekali per laptop**

1. Hapus tensimeter dari daftar Bluetooth di pengaturan Windows.
2. Tekan dan tahan tombol Bluetooth di tensimeter sampai muncul tanda `-P-`.
3. Jalankan:
   ```bash
   python ./omblepy.py -p -d hem-7142t1
   ```
4. Berhasil kalau layar tensimeter menampilkan ikon berputar atau kotak kecil.

Pesan `Failed disabling callback` boleh diabaikan selama ikon di tensimeter masih berputar.

**6.2 Jalankan bridge**

Cek IP laptop dengan `ipconfig`, lalu:
```bash
python -m uvicorn main:app --reload --host <IP-laptop> --port 8000
```
Untuk HEM-7155T, jalankan dari folder bridge-nya dengan `--port 8001`.

**6.3 Cek bridge berjalan**

Buka `http://<IP-laptop>:8000/docs` di browser. Halaman Swagger FastAPI akan muncul.

**6.4 Jam tensimeter salah?**

Sambungkan dulu ke aplikasi resmi Omron Connect di HP, lakukan satu pengukuran, lalu sambungkan lagi ke laptop. Jam perangkat yang belum disetel akan menghasilkan stempel waktu `2021-01-01`, dan data seperti itu **sengaja ditolak** oleh backend.

---

## 7. Alur Pakai dari Awal sampai Data Tersimpan

Contoh memakai Postman. Pastikan Laravel (port 8080) dan bridge (port 8000) sudah menyala.

**Langkah 1. Login, ambil token**
```
POST http://127.0.0.1:8080/api/login
Body (JSON):
{ "email": "test@example.com", "password": "password" }
```
Salin nilai `access_token`.

**Langkah 2. Baca tensimeter lewat bridge**
```
POST http://<IP-laptop>:8000/connect-and-read
Body (JSON):
{
  "mac_address": "FA:E4:FA:F7:F7:AC",
  "device_name": "BLESmart_00000480FAE4FAF7F7AC",
  "new_records_only": false,
  "sync_time": false,
  "pairing": false
}
```
Pakai `/latest-bp-records` kalau hanya ingin data terakhir. Salin seluruh JSON hasilnya.

**Langkah 3. Kirim ke backend**
```
POST http://127.0.0.1:8080/api/v1/ingest
Authorization: Bearer <token-dari-langkah-1>
Body: tempel JSON dari langkah 2
```
Contoh respons:
```json
{ "status": "berhasil", "tersimpan": 1, "duplikat": 0, "ditolak": 0, "alasan_ditolak": [], "processing_ms": 40 }
```

**Langkah 4. Lihat hasil pemantauan**
```
GET http://127.0.0.1:8080/api/v1/monitoring/latest
Authorization: Bearer <token>
```
Tiap data akan berisi `status`: Normal, Waspada, atau Tinggi.

Arti angka di respons ingest:

| Kolom | Arti |
|---|---|
| `tersimpan` | data baru yang lolos dan disimpan |
| `duplikat` | data yang sudah pernah dikirim, tidak disimpan ulang |
| `ditolak` | data tidak masuk akal, dicatat di `anomaly_logs` |
| `processing_ms` | waktu proses di server, tanpa waktu jaringan |

---

## 8. Daftar Endpoint

**Bridge FastAPI** (port 8000 atau 8001)

| Metode | Path | Fungsi |
|---|---|---|
| GET | `/scan` | mencari perangkat Bluetooth di sekitar |
| POST | `/connect-and-read` | membaca riwayat, hasil berupa larik bersarang `records` |
| POST | `/latest-bp-records` | membaca data terakhir, hasil berupa objek `latest_record` |

**Backend Laravel** (port 8080)

| Metode | Path | Perlu token | Batas | Fungsi |
|---|---|---|---|---|
| POST | `/api/login` | tidak | - | menerbitkan token |
| POST | `/api/v1/ingest` | ya, kemampuan `ingest:write` | 60 per menit | menerima data tanda vital |
| GET | `/api/v1/monitoring/latest` | ya, kemampuan `monitoring:read` | 120 per menit | data terbaru dan status klinis |

Kode respons penting:

| Kode | Arti |
|---|---|
| 200 | berhasil diproses |
| 401 | tanpa token atau token salah |
| 403 | token tidak punya kemampuan yang dibutuhkan |
| 422 | perangkat tidak dikenali atau format salah |
| 429 | terlalu banyak permintaan, tunggu satu menit |

Pemetaan perangkat ke adapter:

| Perangkat | MAC address | Adapter |
|---|---|---|
| HEM-7142T | `FA:E4:FA:F7:F7:AC` | `Hem7142Adapter` |
| HEM-7155T | `00:5F:BF:1B:AF:01` | `Hem7155Adapter` |
| Simulasi | `device_model: VENDOR-B-100` | `VendorBAdapter` |

Kalau memakai tensimeter lain dengan MAC berbeda, ubah nilai `macAddress()` di adapternya.

---

## 9. Pengujian

Semua perintah dijalankan dari folder `flowbeat-be-API`.

**9.1 Uji unit dan integrasi**
```bash
php artisan test
```
Jalankan sebagian saja:
```bash
php artisan test --filter=AdapterTest
php artisan test --filter=IngestTest
php artisan test --filter=SecurityTest
```

**9.2 Uji beban dengan k6**
1. Ambil token lewat login.
2. Buka `uji-beban.js`, tempel token pada baris `const TOKEN = '...'`.
3. Naikkan sementara batas `throttle:60,1` di `routes/api.php` menjadi `throttle:10000,1`. Kalau tidak, sebagian besar permintaan akan ditolak 429 dan hasil uji beban tidak valid.
4. Jalankan (PowerShell):
   ```powershell
   $env:K6_WEB_DASHBOARD="true"
   $env:K6_WEB_DASHBOARD_EXPORT="laporan-k6.html"
   k6 run uji-beban.js
   ```
5. Kembalikan batas throttle ke `60,1` dan hapus token dari `uji-beban.js`.

**9.3 Uji rate limit (harus muncul 429)**
```powershell
for ($i=1; $i -le 70; $i++) { curl.exe -s -o NUL -w "%{http_code}`n" -X POST http://127.0.0.1:8080/api/v1/ingest -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{\"mac_address\":\"FA:E4:FA:F7:F7:AC\",\"records\":[]}' }
```
Permintaan ke-61 dan seterusnya harus berbalas `429`.

**9.4 Laporan kualitas integrasi**
```bash
php artisan flowbeat:integration-report
```

**9.5 Statistik log permintaan**
```bash
php artisan tinker
```
```php
\DB::table('api_request_logs')->selectRaw('path, count(*) as total, avg(duration_ms) as rata_ms, sum(case when status < 400 then 1 else 0 end) as berhasil')->groupBy('path')->get();
```

**9.6 Catatan soal throughput**

Server `php artisan serve` memproses permintaan satu per satu, sehingga throughput hanya sekitar 5 permintaan per detik. Itu batas server pengembangan, bukan batas rancangan. Untuk angka yang lebih realistis, jalankan di Nginx dengan PHP-FPM atau Laravel Octane.

---

## 10. Menambah Perangkat Baru

Cukup dua langkah, tanpa mengubah route, controller, maupun tabel.

**Langkah 1.** Buat kelas baru di `app/Adapters/`, contoh `OksimeterXAdapter.php`, yang mengimplementasikan `VitalSignAdapter`:
```php
class OksimeterXAdapter implements VitalSignAdapter
{
    public function supports(array $payload): bool
    {
        return ($payload['device_model'] ?? '') === 'OKSIMETER-X';
    }

    public function transform(array $payload): array
    {
        // ubah format asli perangkat menjadi daftar CanonicalVitalSign
    }
}
```
Lihat `VendorBAdapter.php` sebagai contoh paling sederhana.

**Langkah 2.** Daftarkan di `AdapterRegistry.php`, tambah satu baris di daftar adapter.

Lalu tambahkan satu uji di `tests/Unit` untuk adapter baru tersebut.

---

## 11. Masalah yang Sering Muncul

| Gejala | Penyebab | Solusi |
|---|---|---|
| Ingest berbalas 401 | token tidak dikirim atau kurang kata `Bearer` | header harus `Authorization: Bearer <token>` |
| Ingest berbalas 403 | token lama tanpa kemampuan | login ulang untuk token baru |
| Ingest berbalas 422 "perangkat tidak dikenali" | MAC tidak terdaftar di adapter | cek `mac_address` di payload dan di adapter |
| Banyak 429 saat uji beban | terkena rate limit | naikkan throttle sementara, lihat 9.2 |
| Semua data `ditolak`, alasan stempel waktu pabrik | jam tensimeter belum disetel | lihat 6.4 |
| Bridge "Device not found" | tensimeter belum menyala atau belum di-pairing | nyalakan, ulangi pairing di 6.1 |
| HP tidak bisa akses bridge | HP dan laptop beda jaringan | pakai Wi-Fi yang sama, pakai IP laptop, bukan 127.0.0.1 |
| HP tidak bisa akses Laravel | belum pakai ngrok | jalankan `ngrok http 8080` |
| `ReferenceError ... is not defined` di k6 | token tidak diberi tanda kutip | `const TOKEN = '1|xxxx';` |
| PowerShell: `SkipHttpErrorCheck` tidak dikenal | PowerShell versi 5 | pakai `curl.exe`, lihat 9.3 |
| Perintah `flowbeat:integration-report` tidak ada | file command belum ada | cek `app/Console/Commands/`, lalu `php artisan list` |
| Tabel `api_request_logs` tidak ada | migrasi belum dijalankan | `php artisan migrate` |
| Waktu proses permintaan pertama lebih dari 1 detik | Laravel baru menyala | wajar, ukur mulai permintaan kedua |

---

## 12. Aturan Git

1. Kerjakan di branch masing-masing, jangan langsung di `main`.
2. **Jangan pernah commit** file `.env`, token, atau password. Pastikan `.env` ada di `.gitignore`.
3. Sebelum commit, kosongkan token di `uji-beban.js`.
4. Alur rutin:
   ```bash
   git pull origin <branch-kamu>
   git add -A
   git status
   git commit -m "feat: jelaskan perubahan singkat"
   git push origin <branch-kamu>
   ```
5. Pola pesan commit: `feat:` fitur baru, `fix:` perbaikan, `test:` pengujian, `docs:` dokumentasi.

---

## Referensi
- omblepy: https://github.com/userx14/omblepy
- Laravel Sanctum: https://laravel.com/docs/sanctum
- FastAPI: https://fastapi.tiangolo.com
- k6: https://grafana.com/docs/k6/latest/
- OWASP API Security Top 10 2023: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
