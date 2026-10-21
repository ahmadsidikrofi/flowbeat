# Prediksi Gula Darah (Glucose Prediction API v6)

Proyek ini adalah **backend API** untuk memprediksi kadar gula darah (mg/dL) berdasarkan data pasien dan sinyal sensor:

- **Data pasien**: jenis kelamin, usia, tinggi, berat badan
- **Tensimeter Omron**: tekanan darah sistolik (SBP) dan diastolik (DBP)
- **Sensor MAX30102 (PPG)**: detak jantung (BPM), *Ratio R*, serta komponen sinyal AC/DC merah (Red) dan inframerah (IR)

Model yang dipakai adalah **Random Forest Regressor** (scikit-learn), dilatih dengan dataset `Hb_PPG_processed_dataset.csv`. API dibuat dengan **FastAPI**.

Selain angka gula darah, API juga memberikan:
- Kategori gula darah (Normal / Prediabetes / Diabetes, dll.) beserta tingkat risikonya
- Analisis kardiovaskular: BMI, tekanan nadi, *Mean Arterial Pressure* (MAP), kategori tekanan darah, dan *Rate Pressure Product* (RPP)

> ⚠️ **Catatan:** Hasil prediksi ini untuk keperluan penelitian dan **bukan pengganti alat ukur medis**.

---

## 📁 Struktur Folder

```
Prediksi-gula-darah/
├── api_server.py                 # Server API (FastAPI) untuk melayani prediksi
├── train_v6.py                   # Script untuk melatih ulang model
├── Hb_PPG_processed_dataset.csv  # Dataset untuk training
├── model_v6.joblib               # Model hasil training (Random Forest)
├── scaler_v6.joblib              # Scaler untuk normalisasi data input
├── metadata_v6.joblib            # Info model: daftar fitur, rata-rata fitur, skor evaluasi
└── README.md                     # Dokumen ini
```

Alur kerjanya sederhana:

```
Hb_PPG_processed_dataset.csv ──► train_v6.py ──► model_v6.joblib, scaler_v6.joblib, metadata_v6.joblib
                                                          │
                                                          ▼
                                    api_server.py (memuat 3 file .joblib) ──► http://localhost:8005
```

File `.joblib` **sudah tersedia** di folder ini, jadi kamu bisa langsung menjalankan API tanpa training ulang (lihat bagian *Troubleshooting* bila terjadi error saat memuat model).

---

## 🧰 Yang Perlu Disiapkan

1. **Python 3.10 atau lebih baru** — unduh di <https://www.python.org/downloads/>.
   Saat instalasi di Windows, **centang opsi "Add Python to PATH"**.
2. Terminal: Command Prompt, PowerShell, atau terminal bawaan VS Code.

Cek apakah Python sudah terpasang:

```bash
python --version
```

Jika muncul versi (misalnya `Python 3.12.10`), berarti sudah siap.

---

## 🚀 Cara Menjalankan (Langkah demi Langkah)

### 1. Buka terminal di folder proyek

```bash
cd path/ke/folder/Prediksi-gula-darah
```

> Tips: di VS Code, buka folder proyek lalu tekan **Ctrl + `** untuk membuka terminal yang langsung berada di folder ini.

### 2. (Disarankan) Buat *virtual environment*

*Virtual environment* (venv) membuat library proyek ini terpisah dari library Python lain di komputermu.

```bash
python -m venv venv
```

Aktifkan venv:

| Sistem / Terminal         | Perintah                       |
|---------------------------|--------------------------------|
| Windows (PowerShell)      | `venv\Scripts\Activate.ps1`    |
| Windows (Command Prompt)  | `venv\Scripts\activate.bat`    |
| macOS / Linux             | `source venv/bin/activate`     |

Jika berhasil, akan muncul tulisan `(venv)` di awal baris terminal.

> Jika PowerShell menolak menjalankan script, jalankan sekali:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### 3. Install library yang dibutuhkan

```bash
pip install fastapi uvicorn pydantic numpy pandas scikit-learn joblib
```

### 4. (Opsional) Latih ulang model

Lewati langkah ini jika file `model_v6.joblib`, `scaler_v6.joblib`, dan `metadata_v6.joblib` sudah ada dan bisa dimuat.

```bash
python train_v6.py
```

Script ini akan:
1. Membaca dataset dan membuang baris yang datanya kosong/tidak valid
2. Menghitung rata-rata tiap fitur (dipakai API sebagai nilai pengganti jika data opsional tidak dikirim)
3. Menormalisasi data dengan `StandardScaler`
4. Mengevaluasi model dengan **5-Fold Cross Validation** (menampilkan skor R² dan MAE)
5. Melatih model final dengan seluruh data, lalu menyimpan 3 file `.joblib`

### 5. Jalankan server API

```bash
python api_server.py
```

Jika berhasil, terminal akan menampilkan info model, contohnya:

```
[OK] Model Loaded: Random Forest Regressor (v6)
     Train samples: ...
     CV R2: ...
     CV MAE: ... mg/dL
INFO:     Uvicorn running on http://0.0.0.0:8005
```

Server berjalan di **port 8005**. Untuk menghentikannya, tekan **Ctrl + C**.

### 6. Coba API lewat browser

Buka alamat berikut di browser:

- <http://localhost:8005/> — info model dan daftar endpoint
- <http://localhost:8005/health> — cek apakah server hidup
- <http://localhost:8005/docs> — **dokumentasi interaktif (Swagger UI)**

Di halaman `/docs`, kamu bisa mencoba endpoint `/predict` langsung: klik **POST /predict** → **Try it out** → isi data → **Execute**.

---

## 📡 Daftar Endpoint

| Method | Endpoint   | Fungsi                                  |
|--------|------------|-----------------------------------------|
| GET    | `/`        | Info API, nama model, dan skor evaluasi |
| GET    | `/health`  | Cek status server                       |
| POST   | `/predict` | Prediksi kadar gula darah               |

### Data input `POST /predict`

| Field     | Wajib? | Tipe   | Rentang valid | Keterangan                              |
|-----------|--------|--------|---------------|-----------------------------------------|
| `gender`  | Ya     | string | `M` / `F`     | Jenis kelamin (boleh juga `male`/`female`, huruf besar/kecil bebas) |
| `age`     | Ya     | int    | 1 – 120       | Usia (tahun)                            |
| `height`  | Ya     | float  | 50 – 250      | Tinggi badan (cm)                       |
| `weight`  | Ya     | float  | 10 – 300      | Berat badan (kg)                        |
| `sbp`     | Ya     | float  | 50 – 250      | Tekanan darah sistolik (mmHg), dari Omron |
| `dbp`     | Ya     | float  | 30 – 150      | Tekanan darah diastolik (mmHg), dari Omron |
| `bpm`     | Ya     | float  | 30 – 220      | Detak jantung, dari MAX30102            |
| `ratio_r` | Ya     | float  | 0 – 10        | *Ratio of Ratios* R, dari MAX30102      |
| `ac_red`  | Tidak  | float  | –             | Komponen AC kanal merah                 |
| `dc_red`  | Tidak  | float  | –             | Komponen DC kanal merah                 |
| `ac_ir`   | Tidak  | float  | –             | Komponen AC kanal inframerah            |
| `dc_ir`   | Tidak  | float  | –             | Komponen DC kanal inframerah            |

Jika field opsional (`ac_red`, `dc_red`, `ac_ir`, `dc_ir`) tidak dikirim, API akan otomatis mengisinya dengan **nilai rata-rata dari dataset training**. Field yang diisi otomatis ini dicantumkan di `inputs.imputed_fields` pada respons.

### Contoh request

**Menggunakan `curl` (macOS/Linux/Git Bash):**

```bash
curl -X POST http://localhost:8005/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "M",
    "age": 25,
    "height": 176,
    "weight": 83,
    "sbp": 135,
    "dbp": 83,
    "bpm": 88.9,
    "ratio_r": 1.01
  }'
```

**Menggunakan PowerShell (Windows):**

```powershell
$body = @{
    gender  = "M"
    age     = 25
    height  = 176
    weight  = 83
    sbp     = 135
    dbp     = 83
    bpm     = 88.9
    ratio_r = 1.01
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8005/predict -Method Post -ContentType "application/json" -Body $body
```

**Menggunakan Python (`requests`):**

```python
import requests

data = {
    "gender": "M", "age": 25, "height": 176, "weight": 83,
    "sbp": 135, "dbp": 83, "bpm": 88.9, "ratio_r": 1.01,
}
res = requests.post("http://localhost:8005/predict", json=data)
print(res.json())
```

### Contoh respons

(Angka di bawah hanya ilustrasi; nilai sebenarnya tergantung model.)

```json
{
  "status": "success",
  "predicted_glucose_mg_dl": 85.42,
  "glucose_category": "Normal",
  "risk_level": "RENDAH",
  "inputs": {
    "gender": "M",
    "age": 25,
    "height_cm": 176,
    "weight_kg": 83,
    "sbp_mmHg": 135,
    "dbp_mmHg": 83,
    "bpm": 88.9,
    "ratio_r": 1.01,
    "imputed_fields": ["ac_red", "dc_red", "ac_ir", "dc_ir"]
  },
  "cardiovascular_analysis": {
    "bmi": 26.8,
    "bmi_category": "Overweight",
    "pulse_pressure_mmHg": 52.0,
    "mean_arterial_pressure_mmHg": 100.33,
    "bp_category": "Hypertension Stage 1",
    "rate_pressure_product_bpm_mmHg": 12001,
    "rpp_category": "Tinggi (Stres Miokardial)"
  },
  "model_version": "6.0.0-rf-clinical",
  "timestamp": "2026-10-24T10:00:00.000000"
}
```

---

## 📊 Cara Membaca Hasil

### Kategori gula darah (berdasarkan standar ADA)

Hasil prediksi dibatasi pada rentang **50 – 300 mg/dL**.

| Gula darah (mg/dL) | Kategori              | Tingkat risiko |
|--------------------|-----------------------|----------------|
| < 70               | Hypoglycemia (Rendah) | TINGGI         |
| 70 – 99            | Normal                | RENDAH         |
| 100 – 125          | Prediabetes (IFG)     | SEDANG         |
| 126 – 199          | Diabetes              | TINGGI         |
| ≥ 200              | Diabetes Berat        | KRITIS         |

### Analisis kardiovaskular

| Parameter | Rumus | Kategori |
|-----------|-------|----------|
| **BMI** | berat (kg) / tinggi (m)² | < 18,5 Underweight · 18,5–24,9 Normal · 25–29,9 Overweight · ≥ 30 Obese |
| **Pulse Pressure** | SBP − DBP | – |
| **MAP** | DBP + (SBP − DBP) / 3 | – |
| **Kategori tekanan darah** | dari SBP & DBP | Normal · Elevated · Hypertension Stage 1 · Hypertension Stage 2 |
| **RPP** | BPM × SBP | < 10.000 Normal (Rendah) · 10.000–12.000 Normal (Aktif) · > 12.000 Tinggi (Stres Miokardial) |

---

## 🗂️ Tentang Dataset

File `Hb_PPG_processed_dataset.csv` berisi kolom berikut:

| Kolom | Keterangan |
|-------|------------|
| `Subject_ID` | ID subjek (tidak dipakai untuk training) |
| `Gender_Male` | 1 = laki-laki, 0 = perempuan |
| `Age`, `Height_cm`, `Weight_kg` | Usia, tinggi, berat badan |
| `SBP`, `DBP` | Tekanan darah sistolik & diastolik |
| `BPM`, `Ratio_R` | Detak jantung & Ratio R dari sinyal PPG |
| `AC_Red`, `DC_Red`, `AC_IR`, `DC_IR` | Komponen sinyal PPG kanal merah & inframerah |
| `Glucose_mg_dL` | **Target**: kadar gula darah sebenarnya (mg/dL) |

Jika ingin menambah data, tambahkan baris baru dengan format kolom yang sama, lalu jalankan ulang `python train_v6.py`.

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `'python' is not recognized...` | Python belum masuk PATH. Install ulang Python dan centang **"Add Python to PATH"**, atau coba perintah `py` sebagai ganti `python`. |
| `ModuleNotFoundError: No module named '...'` | Library belum terpasang. Pastikan venv aktif, lalu jalankan lagi perintah `pip install` di langkah 3. |
| `[ERROR] Model files missing! Please run train_v6.py first.` | File `.joblib` tidak ditemukan. Jalankan `python train_v6.py`, dan pastikan kamu menjalankan perintah **dari dalam folder proyek**. |
| Error/peringatan saat memuat model (misalnya `InconsistentVersionWarning` atau error unpickle) | Versi scikit-learn di komputermu berbeda dengan saat model dibuat. Jalankan `python train_v6.py` untuk membuat ulang file model. |
| `[Errno 10048] ... address already in use` | Port 8005 sedang dipakai program lain. Tutup program tersebut, atau ganti angka `port=8005` di baris terakhir `api_server.py`. |
| Respons `422 Unprocessable Entity` | Ada field wajib yang kosong atau nilainya di luar rentang valid. Cek tabel *Data input* di atas. |
| Respons error `Gender must be 'M' or 'F'` | Isi `gender` dengan `M`, `F`, `male`, atau `female`. |
| API tidak bisa diakses dari HP/perangkat lain (misalnya ESP32) | Gunakan alamat IP komputer (contoh `http://192.168.1.10:8005`), pastikan satu jaringan WiFi, dan izinkan port 8005 di Windows Firewall. |

---

## 🧑‍💻 Teknologi yang Digunakan

- [Python](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/) — framework API
- [Uvicorn](https://www.uvicorn.org/) — server untuk menjalankan FastAPI
- [scikit-learn](https://scikit-learn.org/) — Random Forest & StandardScaler
- [pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/) — pengolahan data
- [joblib](https://joblib.readthedocs.io/) — menyimpan & memuat model
