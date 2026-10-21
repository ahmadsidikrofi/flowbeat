# Flowbeat Dashboard

Dashboard web untuk **Remote Patient Monitoring (RPM)**. Dokter dapat memantau data vital pasien (detak jantung, tekanan darah, SpO2, suhu, gula darah) yang dikirim dari aplikasi mobile Flowbeat, sedangkan admin dapat membuat akun dokter dan menugaskan pasien ke dokter.

Proyek ini dibangun dengan [Next.js 15](https://nextjs.org) (App Router), React 19, Tailwind CSS, dan [Clerk](https://clerk.com) untuk login.

---

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Mengunduh Proyek](#2-mengunduh-proyek)
3. [Menginstal Dependensi](#3-menginstal-dependensi)
4. [Mengatur Environment Variable (`.env.local`)](#4-mengatur-environment-variable-envlocal)
5. [Menyiapkan Clerk (Login)](#5-menyiapkan-clerk-login)
6. [Menjalankan Proyek](#6-menjalankan-proyek)
7. [Struktur Folder](#7-struktur-folder)
8. [Perintah yang Tersedia](#8-perintah-yang-tersedia)
9. [Masalah yang Sering Terjadi](#9-masalah-yang-sering-terjadi)
10. [Referensi Belajar](#10-referensi-belajar)

---

## 1. Prasyarat

Pastikan perangkat lunak berikut sudah terpasang di komputer Anda:

| Perangkat lunak | Versi minimal | Cara cek | Unduh |
| --- | --- | --- | --- |
| **Node.js** | 18.18 atau lebih baru (disarankan versi LTS terbaru) | `node -v` | https://nodejs.org |
| **npm** | ikut terpasang bersama Node.js | `npm -v` | — |
| **Git** (opsional) | versi apa saja | `git --version` | https://git-scm.com |
| **Code editor** | — | — | disarankan [VS Code](https://code.visualstudio.com) |

> **Tips:** Buka terminal (Command Prompt / PowerShell di Windows, Terminal di macOS/Linux), lalu ketik `node -v`. Jika muncul nomor versi seperti `v20.11.0`, berarti Node.js sudah terpasang.

Anda juga membutuhkan:

- **Akun Clerk** (gratis) untuk fitur login — lihat [langkah 5](#5-menyiapkan-clerk-login).
- **Alamat backend API** Flowbeat dan **service key**. Minta nilai-nilai ini ke pembimbing/anggota tim yang mengelola server.

---

## 2. Mengunduh Proyek

Jika menggunakan Git:

```bash
git clone <URL-repository>
cd Flowbeat_Dashboard
```

Jika mendapatkan proyek dalam bentuk file `.zip`, ekstrak terlebih dahulu, lalu buka folder `Flowbeat_Dashboard` di terminal:

```bash
cd path/ke/folder/Flowbeat_Dashboard
```

> **Tips VS Code:** Buka folder proyek lewat menu **File → Open Folder**, lalu buka terminal bawaan dengan **Terminal → New Terminal**. Terminal tersebut otomatis berada di folder proyek.

---

## 3. Menginstal Dependensi

Jalankan perintah berikut **satu kali** setelah mengunduh proyek (dan setiap kali `package.json` berubah):

```bash
npm install
```

Perintah ini akan membuat folder `node_modules` yang berisi semua library yang dibutuhkan. Prosesnya bisa memakan waktu beberapa menit.

> Proyek ini juga menyertakan `bun.lockb`, jadi Anda bisa memakai [Bun](https://bun.sh) (`bun install`) jika lebih suka. Namun untuk pemula, **cukup gunakan npm**.

---

## 4. Mengatur Environment Variable (`.env.local`)

Aplikasi membutuhkan beberapa konfigurasi rahasia (alamat server, kunci API, dsb.) yang **tidak disimpan di repository**. Konfigurasi ini ditulis di file bernama `.env.local`.

1. Buat file baru bernama **`.env.local`** di folder utama proyek (sejajar dengan `package.json`).
2. Salin template berikut, lalu isi nilainya:

```env
# ── Clerk (login) ── didapat dari dashboard Clerk, lihat langkah 5
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

# ── Backend API utama (Laravel) ──
NEXT_PUBLIC_API_BASE_URL=https://alamat-backend-anda/api
NEXT_PUBLIC_SERVICE_KEY=isi-service-key-dari-tim

# ── Mobile API (FastAPI) – sumber data profil & pengukuran pasien ──
NEXT_PUBLIC_MOBILE_API_BASE_URL=https://rpms.gilangramadhani.tech
# ID user mobile yang pasiennya bisa dilihat admin, pisahkan dengan koma
MOBILE_API_USER_IDS=1

# ── Laravel Reverb (notifikasi real-time via WebSocket) ──
NEXT_PUBLIC_REVERB_APP_KEY=isi-app-key-reverb
NEXT_PUBLIC_REVERB_HOST=alamat-host-reverb
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

Penjelasan setiap variabel:

| Variabel | Wajib? | Fungsi |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Ya | Kunci publik Clerk untuk halaman login. |
| `CLERK_SECRET_KEY` | Ya | Kunci rahasia Clerk, dipakai server (mis. membuat akun dokter). **Jangan dibagikan.** |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Disarankan | Alamat halaman login di aplikasi ini (`/sign-in`). |
| `NEXT_PUBLIC_API_BASE_URL` | Ya | Alamat backend API utama (catatan pasien, autentikasi WebSocket). |
| `NEXT_PUBLIC_SERVICE_KEY` | Ya | Kunci layanan yang dikirim di header `X-Service-Key` ke backend. |
| `NEXT_PUBLIC_MOBILE_API_BASE_URL` | Tidak | Alamat Mobile API. Jika kosong, otomatis memakai `https://rpms.gilangramadhani.tech`. |
| `MOBILE_API_USER_IDS` | Tidak | Daftar ID user mobile yang pasiennya tampil untuk admin. Default `1`. |
| `NEXT_PUBLIC_REVERB_*` | Untuk fitur real-time | Konfigurasi server WebSocket Laravel Reverb. Tanpa ini, notifikasi real-time tidak berjalan. |

> **Penting:**
> - File `.env.local` sudah masuk `.gitignore`, jadi **tidak akan ikut ter-commit**. Jangan pernah mengunggah isinya ke GitHub.
> - Setiap kali Anda mengubah `.env.local`, **hentikan lalu jalankan ulang** server (`Ctrl + C`, lalu `npm run dev`).

---

## 5. Menyiapkan Clerk (Login)

Aplikasi ini memakai Clerk untuk login. Semua halaman kecuali `/sign-in` wajib login.

1. Daftar/masuk di https://dashboard.clerk.com dan buat **Application** baru (atau minta akses ke aplikasi Clerk milik tim).
2. Buka menu **API Keys**, salin **Publishable key** dan **Secret key**, lalu tempel ke `.env.local` (langkah 4).
3. Buat user pertama lewat menu **Users → Create user** di dashboard Clerk.

### Peran (role) pengguna

Peran disimpan di **Public metadata** user Clerk:

| Peran | Akses |
| --- | --- |
| `admin` | Bisa membuka **Admin Portal** (`/admin`): membuat akun dokter, menugaskan pasien ke dokter, dan melihat semua pasien dari `MOBILE_API_USER_IDS`. |
| `dokter` | Hanya melihat pasien yang sudah ditugaskan kepadanya oleh admin. |

Untuk menjadikan user pertama sebagai admin:

1. Di dashboard Clerk, buka **Users** → pilih user.
2. Gulir ke bagian **Metadata → Public**, klik **Edit**, lalu isi:

   ```json
   { "role": "admin" }
   ```

3. Simpan. Setelah itu, login ke aplikasi dengan user tersebut dan buka `http://localhost:3000/admin`.

Akun dokter berikutnya cukup dibuat dari halaman **Admin → Create Doctor** di dalam aplikasi; peran `dokter` akan diberikan otomatis.

---

## 6. Menjalankan Proyek

### Mode pengembangan (development)

```bash
npm run dev
```

Tunggu hingga muncul tulisan seperti:

```
▲ Next.js 15.1.6
- Local:        http://localhost:3000
✓ Ready
```

Buka **http://localhost:3000** di browser. Anda akan diarahkan ke halaman login. Setelah login, dashboard akan tampil.

Selama mode ini berjalan, setiap perubahan kode akan langsung terlihat di browser tanpa perlu restart. Untuk menghentikan server, tekan **`Ctrl + C`** di terminal.

### Mode produksi (production)

Untuk menguji versi yang siap di-deploy:

```bash
npm run build   # membuat versi produksi di folder .next
npm run start   # menjalankan hasil build di http://localhost:3000
```

---

## 7. Struktur Folder

```
Flowbeat_Dashboard/
├── app/                        # Halaman & API (Next.js App Router)
│   ├── (dashboard)/            # Halaman untuk dokter
│   │   ├── page.js             #   → /            (dashboard utama)
│   │   └── patients/           #   → /patients    (daftar & detail pasien)
│   ├── (admin)/admin/          # Halaman Admin Portal → /admin
│   │   ├── create-doctor/      #   → membuat akun dokter
│   │   └── assign-patient/     #   → menugaskan pasien ke dokter
│   ├── api/                    # API route (berjalan di server Next.js)
│   │   ├── patients/           #   → data pasien, ringkasan, alert, statistik
│   │   └── admin/              #   → dokter, assignment, statistik admin
│   ├── sign-in/                # Halaman login (Clerk)
│   ├── layout.js               # Layout utama aplikasi
│   └── globals.css             # Style global (Tailwind)
├── components/                 # Komponen React (grafik, tabel, kartu, dll.)
│   └── ui/                     #   → komponen UI dasar (shadcn/ui)
├── hooks/                      # Custom React hooks
├── lib/
│   ├── api-client.js           # Axios client ke backend utama
│   ├── mobile-api.js           # Pengambil data dari Mobile API (profil & pengukuran)
│   ├── echo.js                 # Koneksi WebSocket real-time (Laravel Reverb)
│   └── utils.js                # Fungsi bantu
├── public/                     # File statis (gambar, ikon)
├── middleware.js               # Proteksi login: semua halaman wajib login kecuali /sign-in
├── tailwind.config.mjs         # Konfigurasi Tailwind CSS
└── package.json                # Daftar dependensi & script
```

> Tanda kurung pada nama folder seperti `(dashboard)` dan `(admin)` adalah *route group* Next.js. Nama tersebut **tidak muncul di URL**, hanya untuk mengelompokkan halaman yang memakai layout yang sama.

### Alur data singkat

```
Aplikasi Mobile Flowbeat ──► Mobile API (FastAPI) ──► lib/mobile-api.js ──► app/api/patients/* ──► Halaman dashboard
                                                                                    ▲
Clerk (login & role) ───────────────────────────────────────────────────────────────┘
Backend Laravel ──► catatan pasien (api-client.js) & notifikasi real-time (echo.js)
```

---

## 8. Perintah yang Tersedia

| Perintah | Fungsi |
| --- | --- |
| `npm install` | Menginstal semua dependensi. |
| `npm run dev` | Menjalankan server development di `http://localhost:3000`. |
| `npm run build` | Membuat build produksi. |
| `npm run start` | Menjalankan build produksi (jalankan `npm run build` dulu). |
| `npm run lint` | Memeriksa kode dengan ESLint. |

---

## 9. Masalah yang Sering Terjadi

**`'npm' is not recognized` / `command not found: npm`**
Node.js belum terpasang atau terminal belum di-restart setelah instalasi. Pasang Node.js, lalu tutup dan buka kembali terminal/VS Code.

**Error `Missing publishableKey` atau halaman login tidak muncul**
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` belum diisi atau salah. Periksa `.env.local`, pastikan nama filenya tepat (bukan `.env.local.txt`), lalu restart server.

**Setelah login langsung dilempar kembali ke `/` saat membuka `/admin`**
User Anda belum memiliki role admin. Tambahkan `{ "role": "admin" }` di Public metadata user tersebut (lihat [langkah 5](#peran-role-pengguna)), lalu logout dan login lagi.

**Dashboard tampil tetapi daftar pasien kosong**
- Untuk admin: periksa `MOBILE_API_USER_IDS` dan `NEXT_PUBLIC_MOBILE_API_BASE_URL`.
- Untuk dokter: pastikan admin sudah menugaskan pasien ke dokter tersebut di **Admin → Assign Patient**.
- Lihat pesan `[MobileAPI] ...` di terminal tempat `npm run dev` berjalan untuk mengetahui error dari server.

**Port 3000 sudah dipakai (`EADDRINUSE`)**
Hentikan aplikasi lain yang memakai port 3000, atau jalankan di port lain:

```bash
npm run dev -- -p 3001
```

**Perubahan di `.env.local` tidak berpengaruh**
Environment variable hanya dibaca saat server dijalankan. Hentikan (`Ctrl + C`) lalu jalankan lagi `npm run dev`.

**Error aneh setelah menarik (pull) kode terbaru**
Coba instal ulang dependensi:

```bash
# hapus folder node_modules dan .next, lalu:
npm install
npm run dev
```

---

## 10. Referensi Belajar

- [Dokumentasi Next.js](https://nextjs.org/docs) — dasar App Router, halaman, dan API route.
- [Belajar Next.js (tutorial interaktif)](https://nextjs.org/learn)
- [Dokumentasi Clerk untuk Next.js](https://clerk.com/docs/quickstarts/nextjs)
- [Dokumentasi Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com) — komponen UI di folder `components/ui`
- [Recharts](https://recharts.org) — library grafik yang dipakai di dashboard
