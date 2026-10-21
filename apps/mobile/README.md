# Flowbeat 🩺

Flowbeat adalah aplikasi mobile **Remote Patient Monitoring (RPM)** yang dibuat dengan **React Native + Expo**. Aplikasi ini dipakai untuk:

- Daftar & login pasien
- Memilih / menambah profil pasien
- Mengukur tekanan darah dari tensimeter Omron (melalui backend), lalu lanjut ke SpO2 / gula darah
- Melihat riwayat & grafik tekanan darah, vital sign, dan insight kesehatan
- Menghubungi dokter pendamping / panggilan darurat via WhatsApp

Panduan ini ditujukan untuk developer yang **baru pertama kali** menjalankan proyek ini. Ikuti langkahnya dari atas ke bawah.

---

## 1. Yang Perlu Disiapkan

Install dulu software berikut di komputer kamu:

| Software | Keterangan | Link |
|---|---|---|
| **Node.js** (versi LTS, minimal 20) | Untuk menjalankan JavaScript & `npm` | https://nodejs.org |
| **Git** (opsional) | Untuk clone / mengelola kode | https://git-scm.com |
| **VS Code** (disarankan) | Code editor | https://code.visualstudio.com |
| **Expo Go** di HP | Aplikasi untuk membuka proyek di HP Android/iOS | Play Store / App Store |

Cek apakah Node.js sudah terpasang dengan membuka terminal lalu ketik:

```bash
node -v
npm -v
```

Kalau keluar nomor versi (misalnya `v20.x.x`), berarti sudah siap.

> 💡 **Opsional:** Kalau ingin menjalankan di emulator (tanpa HP), install **Android Studio** (untuk emulator Android) atau **Xcode** (khusus Mac, untuk simulator iOS).

---

## 2. Menjalankan Proyek (Langkah demi Langkah)

### Langkah 1 — Buka folder proyek

Buka terminal di folder proyek ini (di VS Code: menu **Terminal → New Terminal**).

```bash
cd Flowbeat-RN-Expo
```

### Langkah 2 — Install dependency

Perintah ini akan mengunduh semua library yang dibutuhkan ke folder `node_modules`. Cukup dilakukan **sekali** (atau setiap kali `package.json` berubah).

```bash
npm install
```

Tunggu sampai selesai (bisa beberapa menit tergantung internet).

### Langkah 3 — Jalankan aplikasi

```bash
npx expo start
```

Setelah itu akan muncul **QR code** di terminal beserta beberapa pilihan menu.

### Langkah 4 — Buka di HP atau emulator

Pilih salah satu cara:

- **📱 HP (paling mudah):**
  1. Pastikan HP dan komputer terhubung ke **WiFi yang sama**.
  2. Buka aplikasi **Expo Go**.
  3. Android: scan QR code dari dalam Expo Go. iOS: scan pakai aplikasi Kamera.
- **🤖 Emulator Android:** jalankan emulator dari Android Studio, lalu tekan `a` di terminal.
- **🍎 Simulator iOS (Mac saja):** tekan `i` di terminal.
- **🌐 Browser:** tekan `w` di terminal (beberapa fitur mungkin tidak berjalan sempurna di web).

Selesai! Aplikasi akan terbuka dan menampilkan halaman login. 🎉

> 💡 Setiap kali kamu menyimpan perubahan kode, aplikasi akan otomatis ter-refresh (*Fast Refresh*). Tekan `r` di terminal untuk reload manual.

---

## 3. Konfigurasi Server (Backend)

Aplikasi ini butuh backend untuk login dan menyimpan data. Alamat server diatur di file [utils/Config.js](utils/Config.js):

```js
const DEFAULTS = {
    BASE_URL: "https://rpms.gilangramadhani.tech",          // Backend utama (auth + data pasien)
    DASHBOARD_API_URL: "https://rpms.gilangramadhani.tech", // Dashboard RPMS (info dokter)
    DEVICE_MAC: "00:5F:BF:1B:AF:01",                         // MAC address tensimeter
    DEVICE_NAME: "HEM-7155T",                                // Nama/model tensimeter
};
```

- Kalau server default sudah aktif, kamu **tidak perlu mengubah apa pun**.
- Kalau ingin memakai backend lokal, ganti `BASE_URL` dengan IP komputer kamu, misalnya `http://192.168.1.10:8000`.
  - ⚠️ Jangan pakai `localhost` — dari HP, `localhost` berarti HP itu sendiri, bukan komputer kamu.
  - Pastikan HP dan komputer berada di jaringan WiFi yang sama.
- Nilai konfigurasi bisa tersimpan di penyimpanan HP (AsyncStorage). Jika perubahan di `Config.js` tidak terasa, hapus data aplikasi / logout lalu buka ulang.

Daftar lengkap endpoint API yang dipakai aplikasi ada di [guide.md](guide.md).

---

## 4. Struktur Folder

```
Flowbeat-RN-Expo/
├── app/                  # Halaman aplikasi (routing berbasis file / Expo Router)
│   ├── _layout.tsx       # Layout utama + logika redirect (login → profil → beranda)
│   ├── (auth)/           # Halaman login, register, lupa password
│   ├── (profiles)/       # Pilih & tambah profil pasien
│   ├── (tabs)/           # Halaman utama dengan tab bawah (Beranda, Perangkat, Profil, dll.)
│   └── measure.js        # Alur pengukuran (tensi → SpO2/gula darah)
├── components/           # Komponen UI yang dipakai ulang (grafik, kartu, modal, dll.)
├── services/api.js       # Fungsi pemanggilan API ke backend
├── utils/                # Konfigurasi, AuthProvider (state login), helper
├── hooks/                # Custom React hooks (tema/warna)
├── constants/            # Konstanta warna
├── assets/               # Gambar, ikon, font
├── guide.md              # Dokumentasi endpoint API
├── app.json              # Konfigurasi Expo (nama app, ikon, splash screen)
└── package.json          # Daftar library & script npm
```

> 📌 **Expo Router:** setiap file di folder `app/` otomatis menjadi sebuah halaman. Contohnya `app/(auth)/login.js` menjadi halaman `/login`. Folder dengan tanda kurung seperti `(auth)` hanya untuk pengelompokan dan tidak muncul di URL.

### Alur aplikasi

1. Belum login → diarahkan ke **halaman login** (`app/(auth)/login.js`).
2. Sudah login tapi belum memilih profil → diarahkan ke **pilih profil** (`app/(profiles)/`).
3. Sudah login & sudah pilih profil → masuk ke **beranda** (`app/(tabs)/`).

Logika ini ada di [app/_layout.tsx](app/_layout.tsx).

---

## 5. Perintah yang Sering Dipakai

| Perintah | Fungsi |
|---|---|
| `npm install` | Install semua dependency |
| `npx expo start` atau `npm start` | Menjalankan development server |
| `npm run android` | Menjalankan & langsung membuka di Android |
| `npm run ios` | Menjalankan & langsung membuka di iOS (Mac) |
| `npm run web` | Menjalankan di browser |
| `npm run lint` | Mengecek gaya penulisan kode |
| `npm test` | Menjalankan unit test (Jest) |
| `npx expo start -c` | Menjalankan sambil menghapus cache (berguna saat error aneh) |

> ⚠️ Jangan jalankan `npm run reset-project` — perintah ini bawaan template Expo dan akan memindahkan seluruh isi folder `app/`.

---

## 6. Masalah yang Sering Terjadi (Troubleshooting)

**❓ QR code sudah di-scan tapi aplikasi tidak terbuka / loading terus**
- Pastikan HP dan komputer di WiFi yang sama.
- Coba mode tunnel: `npx expo start --tunnel`
- Matikan sementara firewall / VPN di komputer.

**❓ Muncul error setelah `npm install` atau setelah ganti branch**
Hapus cache dan install ulang:
```bash
# hapus folder node_modules lalu install ulang
rm -rf node_modules        # Windows PowerShell: Remove-Item -Recurse -Force node_modules
npm install
npx expo start -c
```

**❓ Versi Expo Go tidak cocok ("Project is incompatible with this version of Expo Go")**
Proyek ini memakai **Expo SDK 54**. Update aplikasi Expo Go di HP ke versi terbaru.

**❓ Tidak bisa login / "Network Error"**
- Cek apakah server di `BASE_URL` ([utils/Config.js](utils/Config.js)) sedang aktif — coba buka alamatnya di browser HP.
- Kalau memakai backend lokal, pastikan memakai IP komputer (bukan `localhost`).

**❓ Pengukuran tensi gagal**
Pengukuran dilakukan lewat backend yang terhubung ke tensimeter. Pastikan backend aktif, tensimeter menyala, dan `DEVICE_MAC` di `Config.js` sesuai dengan alat yang dipakai.

---

## 7. Teknologi yang Digunakan

- [Expo SDK 54](https://docs.expo.dev/) & [React Native 0.81](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/) — navigasi berbasis file
- [React Native Paper](https://callstack.github.io/react-native-paper/) — komponen UI
- [Axios](https://axios-http.com/) — HTTP request ke backend
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — penyimpanan lokal (token, konfigurasi)

## 8. Belajar Lebih Lanjut

- Dokumentasi Expo: https://docs.expo.dev
- Tutorial Expo untuk pemula: https://docs.expo.dev/tutorial/introduction/
- Dokumentasi React Native: https://reactnative.dev/docs/getting-started
