# Endpoint Guide - flowbeat-RN

Dokumen ini merangkum endpoint yang saat ini dipakai oleh aplikasi mobile di project ini.

## 1) Base URL yang dipakai

### A. Backend utama (auth + data pasien)
- Base URL: `http://172.20.10.3:8000`
- Sumber: `utils/Config.js`

### B. Service device bridge (scan/read tensimeter)
Dipanggil langsung lewat hardcoded IP, tidak lewat `Config.BASE_URL`:
- `http://192.168.223.236:8000`
- `http://192.168.239.236:8000`

## 2) Endpoint backend utama

## Auth

### POST /api/auth/sign-up
- Full URL: `${BASE_URL}/api/auth/sign-up`
- Auth: Tidak perlu Bearer token
- Body JSON:
```json
{
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string",
  "password": "string"
}
```
- Dipakai di: `components/AuthComponent/SignUp.js`

### POST /api/auth/sign-in
- Full URL: `${BASE_URL}/api/auth/sign-in`
- Auth: Tidak perlu Bearer token
- Body JSON:
```json
{
  "phone_number": "string",
  "password": "string"
}
```
- Respons dipakai: `access_token`
- Dipakai di: `components/AuthComponent/SignIn.js`

### GET /api/auth/patient
- Full URL: `${BASE_URL}/api/auth/patient`
- Auth: `Authorization: Bearer <token>`
- Fungsi: Ambil profil patient yang sedang login
- Dipakai di: `utils/AuthProvider.js`

## Blood pressure data

### POST /api/patient-bp-data/{uuid}
- Full URL: `${BASE_URL}/api/patient-bp-data/${user.uuid}`
- Auth: `Authorization: Bearer <token>`
- Body JSON:
```json
{
  "sys": 120,
  "dia": 80,
  "bpm": 70,
  "mov": 0,
  "ihb": 0,
  "device": "BLESmart_...",
  "patient_id": 123
}
```
- Fungsi: Sinkron data hasil baca device ke backend
- Dipakai di: `utils/useLatestBloodPressure.js`

### GET /api/patients/blood-pressure-data/latest
- Full URL: `${BASE_URL}/api/patients/blood-pressure-data/latest`
- Auth: `Authorization: Bearer <token>`
- Fungsi: Ambil data tekanan darah terbaru dari DB
- Catatan: Di app dipakai `res.data[0]`
- Dipakai di: `utils/useLatestBloodPressure.js`

### GET /api/patients/blood-pressures
- Full URL: `${BASE_URL}/api/patients/blood-pressures`
- Auth: `Authorization: Bearer <token>`
- Fungsi: Ambil list histori tekanan darah
- Catatan: Di app biasanya dipakai `res.data.health_data`
- Dipakai di:
  - `utils/useLatestBloodPressure.js`
  - `components/BPChart.js`

### GET /api/patients/blood-pressures/{id}
- Full URL: `${BASE_URL}/api/patients/blood-pressures/${id}`
- Auth: `Authorization: Bearer <token>`
- Fungsi: Ambil detail 1 data tekanan darah
- Dipakai di: `components/BPChart.js`

### DELETE /api/patients/blood-pressures/{id}
- Full URL: `${BASE_URL}/api/patients/blood-pressures/${id}`
- Auth: `Authorization: Bearer <token>`
- Fungsi: Hapus 1 data tekanan darah
- Dipakai di: `components/BPDataByID.js`

## Vital signs

### GET /api/patients/vital-signs/latest
- Full URL: `${BASE_URL}/api/patients/vital-signs/latest`
- Auth: `Authorization: Bearer <token>`
- Fungsi: Ambil vital sign terbaru (contoh: bpm, spo2)
- Catatan: Di app dipakai `res.data[0]`
- Dipakai di: `components/LatestVitalSign.js`

## 3) Endpoint service device bridge (lokal)

Endpoint ini dipakai untuk komunikasi ke perangkat tensimeter/BLE pada jaringan lokal.

### GET /scan
- Full URL aktif: `http://192.168.223.236:8000/scan`
- Auth: Tidak ada
- Fungsi: Scan device BLE di sekitar
- Dipakai di: `components/DeviceModal.js`

### POST /connect-and-read
- Full URL aktif: `http://192.168.223.236:8000/connect-and-read`
- Auth: Tidak ada
- Body JSON:
```json
{
  "mac_address": "FA:E4:FA:F7:F7:AC",
  "device_name": "BLESmart_00000480FAE4FAF7F7AC",
  "new_records_only": false,
  "sync_time": false,
  "pairing": false
}
```
- Fungsi: Koneksi ke device dan baca data
- Dipakai di: `components/ConnectingModal.js`

### POST /latest-bp-records
- Full URL aktif: `http://192.168.239.236:8000/latest-bp-records`
- Auth: Tidak ada
- Body JSON:
```json
{
  "mac_address": "FA:E4:FA:F7:F7:AC",
  "device_name": "BLESmart_00000480FAE4FAF7F7AC",
  "new_records_only": false,
  "sync_time": false,
  "pairing": false
}
```
- Fungsi: Ambil record BP terbaru dari device bridge
- Dipakai di: `utils/useLatestBloodPressure.js`

## 4) Header auth yang dipakai

Untuk endpoint private, app mengirim header:

```http
Authorization: Bearer <access_token>
```

Token disimpan di AsyncStorage key:
- `UserToken`

## 5) Catatan penting

- Saat ini ada lebih dari satu IP lokal untuk service device bridge (`192.168.223.236` dan `192.168.239.236`).
- Sebaiknya endpoint device juga dipusatkan ke satu file config/env agar mudah ganti saat pindah jaringan.
- Ada endpoint komentar lama yang sudah tidak dipakai (misalnya `192.168.0.102` dan `192.168.1.3`), bisa dibersihkan untuk mengurangi kebingungan.
