# SpO2 Sensor (ESP32-C3 + MAX30102)

Proyek ini adalah **alat ukur detak jantung (HR) dan saturasi oksigen darah (SpO2)** sederhana. Isinya dua bagian:

1. **Firmware (kode Arduino)**: berjalan di board **ESP32-C3**. Kode ini membaca sensor **MAX30102**, lalu mengirim hasilnya ke komputer lewat kabel USB (Serial).
2. **Dashboard web**: halaman web yang dibuka di browser (Chrome/Edge). Halaman ini membaca data dari USB dan menampilkan HR, SpO2, suhu, dan waktu pengukuran secara langsung.

```
[Jari] → [Sensor MAX30102] → (I2C) → [ESP32-C3] → (USB Serial) → [Browser: Dashboard]
```

---

## Daftar Isi

- [Struktur Folder](#struktur-folder)
- [Yang Perlu Disiapkan](#yang-perlu-disiapkan)
- [Langkah 1: Merangkai Hardware](#langkah-1-merangkai-hardware)
- [Langkah 2: Menyiapkan Arduino IDE](#langkah-2-menyiapkan-arduino-ide)
- [Langkah 3: Upload Firmware ke ESP32-C3](#langkah-3-upload-firmware-ke-esp32-c3)
- [Langkah 4: Cek Data di Serial Monitor](#langkah-4-cek-data-di-serial-monitor)
- [Langkah 5: Menjalankan Dashboard Web](#langkah-5-menjalankan-dashboard-web)
- [Format Data Serial](#format-data-serial)
- [Masalah yang Sering Terjadi](#masalah-yang-sering-terjadi)

---

## Struktur Folder

```
SpO2-sensor/
├── ino/
│   └── max30102_esp32c3_oled_oximeter.ino   ← Kode utama firmware (Arduino)
├── fetching script and gui/
│   ├── script.js                            ← Logika dashboard: koneksi Serial & update tampilan
│   └── style.css                            ← Tampilan (warna, layout) dashboard
└── README.md
```

### ⚠️ File yang belum ada di folder ini

Supaya proyek bisa jalan, beberapa file berikut **wajib ada** tapi **belum ada** di repositori ini.

| File | Letakkan di | Fungsi |
|---|---|---|
| `max30102.h` & `max30102.cpp` | `ino/` | Driver untuk berkomunikasi dengan sensor MAX30102 |
| `algorithm.h` & `algorithm.cpp` | `ino/` | Algoritma HR/SpO2 bawaan Maxim |
| `algorithm_by_RF.h` & `algorithm_by_RF.cpp` | `ino/` | Algoritma HR/SpO2 versi Robert Fraczkiewicz (lebih akurat) |
| `median_filter.h` | `ino/` | Filter median untuk menghaluskan hasil pembacaan |
| `index.html` | `fetching script and gui/` | Halaman utama dashboard (memanggil `style.css` dan `script.js`) |

> 💡 File `max30102`, `algorithm`, dan `algorithm_by_RF` berasal dari proyek open-source **"MAX30102 by RF"** karya Robert Fraczkiewicz (cari `aromring MAX30102_by_RF` di GitHub). Perhatikan: di proyek ini fungsi `maxim_max30102_init()` menerima **pin SDA dan SCL** sebagai parameter, jadi versi `max30102.cpp` yang dipakai sudah dimodifikasi. Pakai file dari pemilik proyek kalau ada.

---

## Yang Perlu Disiapkan

### Hardware
- 1× board **ESP32-C3** (misalnya ESP32-C3 SuperMini)
- 1× modul sensor **MAX30102**
- Kabel jumper
- Kabel USB (yang bisa transfer data, bukan sekadar kabel charger)
- *(Opsional)* 1× LED + resistor ±220Ω untuk indikator detak jantung

### Software
- [Arduino IDE](https://www.arduino.cc/en/software) versi 2.x
- Browser **Google Chrome** atau **Microsoft Edge** (desktop). Firefox dan Safari **tidak bisa** karena belum mendukung Web Serial API.
- *(Opsional)* [VS Code](https://code.visualstudio.com/) + ekstensi **Live Server**, atau Python, untuk menjalankan dashboard

---

## Langkah 1: Merangkai Hardware

Hubungkan sensor MAX30102 ke ESP32-C3 seperti tabel berikut:

| MAX30102 | ESP32-C3 |
|---|---|
| VIN | 3.3V |
| GND | GND |
| SDA | GPIO **8** |
| SCL | GPIO **9** |
| INT | *(tidak perlu disambung)* |

LED indikator detak jantung (opsional):

| LED | ESP32-C3 |
|---|---|
| Kaki panjang (+) | 3.3V (lewat resistor) |
| Kaki pendek (−) | GPIO **10** |

> LED ini bersifat *active low*, artinya LED **menyala saat pin bernilai LOW**. Kalau ingin wiring biasa (pin → resistor → LED → GND), ubah `HEARTBEAT_LED_ACTIVE_LOW` menjadi `false` di file `.ino`.

Pin-pin ini bisa diganti di bagian atas file `.ino`:

```cpp
const int SENSOR_I2C_SDA_PIN = 8;
const int SENSOR_I2C_SCL_PIN = 9;
const int HEARTBEAT_LED_PIN = 10;
```

---

## Langkah 2: Menyiapkan Arduino IDE

1. Buka Arduino IDE.
2. Masuk ke **File → Preferences**. Di kolom **Additional boards manager URLs**, tempel URL berikut:
   ```
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
3. Buka **Tools → Board → Boards Manager**, cari **esp32** (oleh Espressif Systems), lalu klik **Install**.
4. Tidak perlu install library tambahan. Driver sensor sudah berupa file `.h/.cpp` di dalam folder `ino/` (lihat [file yang belum ada](#️-file-yang-belum-ada-di-folder-ini)).

> Library **U8g2** (untuk layar OLED) hanya diperlukan kalau kamu mengaktifkan kembali kode OLED yang saat ini di-*comment*.

---

## Langkah 3: Upload Firmware ke ESP32-C3

1. **Penting:** Arduino IDE mewajibkan nama folder **sama** dengan nama file `.ino`. Ubah nama folder `ino/` menjadi:
   ```
   max30102_esp32c3_oled_oximeter/
   ```
   (atau biarkan saja, nanti Arduino IDE akan menawarkan untuk memindahkannya otomatis, cukup klik **OK**).
2. Pastikan semua file driver (`max30102.*`, `algorithm.*`, `algorithm_by_RF.*`, `median_filter.h`) ada di folder yang sama dengan file `.ino`.
3. Buka file `max30102_esp32c3_oled_oximeter.ino` di Arduino IDE.
4. Colok ESP32-C3 ke komputer pakai kabel USB.
5. Pilih board: **Tools → Board → esp32 → ESP32C3 Dev Module**.
6. Pilih port: **Tools → Port → (COM yang muncul)**, misalnya `COM5`.
7. Aktifkan **Tools → USB CDC On Boot → Enabled** supaya output Serial muncul lewat USB.
8. Klik tombol **Upload** (ikon panah →) dan tunggu sampai muncul tulisan `Done uploading`.

> Kalau upload gagal, tekan dan tahan tombol **BOOT** di board, klik Upload, lalu lepas tombol BOOT saat muncul tulisan `Connecting...`.

---

## Langkah 4: Cek Data di Serial Monitor

1. Buka **Tools → Serial Monitor**.
2. Atur baud rate ke **115200** (pojok kanan bawah).
3. Tunggu sekitar 3 detik setelah board menyala, lalu letakkan **ujung jari** di atas sensor dengan tekanan ringan dan jangan bergerak.
4. Akan muncul data seperti ini:
   ```
   Time[s]  SpO2   HR  SpO2_MX  HR_MX  Clock    Ratio  Corr  Temp[C]
   5        97.80  76  96.50    74     0:0:5    0.52   0.93  31.25
   ```
   Data pertama baru muncul setelah buffer sensor terisi penuh, jadi tunggu beberapa detik.

> ❗ **Tutup Serial Monitor sebelum lanjut ke Langkah 5.** Port USB hanya bisa dipakai oleh satu program sekaligus.

---

## Langkah 5: Menjalankan Dashboard Web

Pastikan file `index.html` sudah ada di folder `fetching script and gui/`.

Pilih salah satu cara berikut:

**Cara A: VS Code + Live Server (paling mudah)**
1. Buka folder proyek di VS Code.
2. Klik kanan `fetching script and gui/index.html` → **Open with Live Server**.

**Cara B: Python**
```bash
cd "fetching script and gui"
python -m http.server 8000
```
Lalu buka `http://localhost:8000` di Chrome/Edge.

**Cara C: Buka langsung**
Klik dua kali `index.html` dan buka dengan Chrome/Edge.

### Cara memakai dashboard
1. Klik tombol **Connect Serial**.
2. Pilih port ESP32-C3 (misalnya `USB JTAG/serial debug unit (COM5)`), lalu klik **Connect**.
3. Status berubah menjadi **Connected** dan angka HR, SpO2, suhu, serta waktu mulai muncul.
4. Tombol **Show/Hide** menampilkan atau menyembunyikan log data mentah.
5. Tombol **Reset** mengosongkan tampilan.
6. Klik **Disconnect** jika sudah selesai.

---

## Format Data Serial

Firmware mengirim satu baris data setiap kali perhitungan selesai. Kolomnya dipisahkan **tab** (`\t`):

| Kolom | Arti |
|---|---|
| `Time[s]` | Lama pengukuran (detik) |
| `SpO2` | SpO2 hasil algoritma RF + filter median (%) → **ditampilkan di dashboard** |
| `HR` | Detak jantung hasil algoritma RF + filter median (BPM) → **ditampilkan di dashboard** |
| `SpO2_MX` | SpO2 hasil algoritma Maxim (pembanding) |
| `HR_MX` | Detak jantung hasil algoritma Maxim (pembanding) |
| `Clock` | Lama pengukuran dalam format `jam:menit:detik` |
| `Ratio` | Rasio sinyal merah/inframerah (dipakai untuk hitung SpO2) |
| `Corr` | Korelasi sinyal merah & inframerah (makin mendekati 1, makin bagus kualitas sinyal) |
| `Temp[C]` | Suhu chip sensor (°C), **bukan** suhu tubuh |

Nilai **`-999`** artinya pembacaan tidak valid (misalnya jari tidak menempel atau bergerak). Dashboard akan menampilkannya sebagai `--`.

---

## Masalah yang Sering Terjadi

| Masalah | Penyebab & Solusi |
|---|---|
| `fatal error: algorithm_by_RF.h: No such file or directory` | File driver belum ada. Lihat [file yang belum ada](#️-file-yang-belum-ada-di-folder-ini). |
| Port COM tidak muncul | Ganti kabel USB (pastikan bisa transfer data), atau install driver USB. |
| Serial Monitor kosong | Cek baud rate **115200** dan pastikan **USB CDC On Boot → Enabled**. |
| Nilai selalu `-999` | Jari belum menempel dengan benar. Tempelkan dengan tekanan ringan dan jangan bergerak. Cek juga kabel SDA/SCL. |
| Dashboard: *"Failed to connect to serial port"* | Port sedang dipakai program lain. Tutup Serial Monitor Arduino IDE lalu coba lagi. |
| Tombol **Connect Serial** tidak memunculkan apa-apa | Browser tidak mendukung Web Serial. Gunakan Chrome atau Edge versi desktop. |
| LED indikator tidak menyala / terbalik | Sesuaikan nilai `HEARTBEAT_LED_ACTIVE_LOW` dengan cara kamu merangkai LED. |

---

> ⚕️ **Catatan:** Alat ini dibuat untuk keperluan belajar dan riset, **bukan** alat medis yang tersertifikasi. Jangan gunakan hasilnya untuk diagnosis.
