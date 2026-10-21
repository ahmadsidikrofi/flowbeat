# Omblepy

Cli tool to read records from Omron Bluetooth-LE measurement instruments

## OS support

| operating system / hardware | supported | install instruction / comment |
|---|---|---|
| win10 | ✅ | install <a href="https://www.python.org/downloads/">python</a>, enable installer checkbox `add to path` <br> in cmd `pip install terminaltables bleak` |
| win11 | ❌ | instructions of win10 work in principle, but win11 ble pairing dialog timeout is only 1 second. |
| nixos23.05 | ✅ | in configuration.nix, set `hardware.bluetooth.enable = true;`. For temporary python shell:<br> `nix-shell -p python3.11 python311Packages.bleak python311Packages.terminaltables` |
| debian11/12 | ❓/❌ | unreliable, depends on bt-hardware / bluez-version if pairing will work. <br>Install python and packages with `apt install python3.12` `pip3 install bleak terminaltables` |
| raspberry pi os <br>+ PI 4B / 5 | ✅ | see debian 12 for install instructions |
| mac | ❌ | the used bluetooth library bleak is missing the pairing feature on osx |
| all os <br>+ esp32 | ✅ | see under-development [esp32 bridge version](https://github.com/userx14/omblepy/tree/esp32bridge). |

## Usage
For the first time pairing process you need to use the -p flag and enable pairing mode by holding the bluetooth button until you see the blinking -P- in the display:
```
python ./omblepy.py -p -d HEM-7322T
```

## Next.js Frontend Prototype

Kalau kamu ingin frontend yang lebih proper, route-based, dan lebih dekat ke alur produksi, pakai prototype ini:

```text
d:\Multiuser\flowbeat\flowbeat-be-python\frontend-next
```

Run dari folder tersebut:

```bash
cd frontend-next
npm install
npm run dev
```

Lalu buka:

```text
http://localhost:3000
```

Frontend ini punya route:

- `/register`
- `/login`
- `/profiles`
- `/dashboard`

Alurnya dibuat seperti Netflix profile picker: login dulu, pilih profile, lalu scan device BLE dan simpan measurement ke profile aktif.

## Postman Test Guide

## Simple Frontend

Kalau kamu ingin cek alur login, pilih profile, dan simpan measurement lewat browser tanpa Postman, buka:

```text
http://192.168.1.16:8000/ui
```

Halaman ini menyediakan:

- register dan login user
- load dan pilih profile
- scan BLE device dan pilih device aktif
- simpan measurement ke profile yang dipilih
- ambil hasil measurement terbaru dari device lalu simpan otomatis ke profile aktif
- log response dari backend

Gunakan base URL berikut saat backend sudah berjalan:

```text
http://127.0.0.1:8000
```

Jika dijalankan dari device lain di jaringan yang sama, ganti `127.0.0.1` dengan IP PC server, misalnya:

```text
http://192.168.1.16:8000
```

### 1) Root check

- Method: `GET`
- URL: `/`
- Contoh full URL: `http://127.0.0.1:8000/`
- Body: tidak perlu

Tujuan: memastikan server aktif.

### 2) Register user

- Method: `POST`
- URL: `/api/auth/register`
- Contoh full URL: `http://127.0.0.1:8000/api/auth/register`
- Header: `Content-Type: application/json`
- Body raw JSON:

```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "password": "123456"
}
```

Tujuan: membuat akun user baru.

### 3) Login user

- Method: `POST`
- URL: `/api/auth/login`
- Contoh full URL: `http://127.0.0.1:8000/api/auth/login`
- Header: `Content-Type: application/json`
- Body raw JSON:

```json
{
  "email": "budi@example.com",
  "password": "123456"
}
```

Respons sukses akan berisi `id_user`, `name`, `email`, dan `token`.

### 4) Create profile

- Method: `POST`
- URL: `/api/profiles?id_user=1`
- Contoh full URL: `http://127.0.0.1:8000/api/profiles?id_user=1`
- Header: `Content-Type: application/json`
- Body raw JSON:

```json
{
  "name": "Ayah"
}
```

Catatan: `id_user` dikirim lewat query parameter, bukan body.

### 5) Get all profiles by user

- Method: `GET`
- URL: `/api/profiles/1`
- Contoh full URL: `http://127.0.0.1:8000/api/profiles/1`
- Body: tidak perlu

Tujuan: melihat semua profile milik user tertentu.

### 6) Delete profile

- Method: `DELETE`
- URL: `/api/profiles/1`
- Contoh full URL: `http://127.0.0.1:8000/api/profiles/1`
- Body: tidak perlu

Tujuan: menghapus profile berdasarkan ID.

### 7) Save measurement

- Method: `POST`
- URL: `/api/measurements`
- Contoh full URL: `http://127.0.0.1:8000/api/measurements`
- Header: `Content-Type: application/json`
- Body raw JSON:

```json
{
  "id_user": 1,
  "id_profile": 1,
  "mov": 0,
  "ihb": 0,
  "bpm": 72,
  "dia": 80,
  "sys": 120,
  "datetime": "2026-05-09T10:30:00"
}
```

Catatan: `id_profile` harus milik `id_user` yang sama.

### 8) Get all measurements by profile

- Method: `GET`
- URL: `/api/measurements/1`
- Contoh full URL: `http://127.0.0.1:8000/api/measurements/1`
- Body: tidak perlu

Tujuan: melihat riwayat pengukuran dari profile tertentu.

### 9) Get latest measurement by profile

- Method: `GET`
- URL: `/api/measurements/1/latest`
- Contoh full URL: `http://127.0.0.1:8000/api/measurements/1/latest`
- Body: tidak perlu

Tujuan: melihat data pengukuran terbaru.

### 10) Scan BLE device

- Method: `GET`
- URL: `/scan`
- Contoh full URL: `http://127.0.0.1:8000/scan`
- Body: tidak perlu

Tujuan: memindai device BLE yang tersedia.

### 11) Connect and read

- Method: `POST`
- URL: `/connect-and-read`
- Contoh full URL: `http://127.0.0.1:8000/connect-and-read`
- Header: `Content-Type: application/json`
- Body raw JSON:

```json
{
  "mac_address": "11:22:33:44:55:66",
  "device_name": "HEM-7322T",
  "new_records_only": false,
  "sync_time": false,
  "pairing": false
}
```

Catatan: endpoint ini bergantung pada device fisik dan Bluetooth aktif.

### 12) Latest BP records

- Method: `POST`
- URL: `/latest-bp-records`
- Contoh full URL: `http://127.0.0.1:8000/latest-bp-records`
- Header: `Content-Type: application/json`
- Body raw JSON:

```json
{
  "mac_address": "11:22:33:44:55:66",
  "device_name": "HEM-7322T",
  "new_records_only": false,
  "sync_time": false,
  "pairing": false
}
```

### Urutan cek yang disarankan

1. `GET /`
2. `POST /api/auth/register`
3. `POST /api/auth/login`
4. `POST /api/profiles?id_user=...`
5. `GET /api/profiles/{id_user}`
6. `POST /api/measurements`
7. `GET /api/measurements/{id_profile}`
8. `GET /api/measurements/{id_profile}/latest`
9. `GET /scan`
10. `POST /connect-and-read`
11. `POST /latest-bp-records`

### Catatan penting

- Simpan hasil login karena respons berisi `token` JWT.
- Pada kode saat ini, endpoint profile dan measurement belum memakai `Authorization: Bearer <token>`.
- Pastikan file `.env` sudah ada dan `SECRET_KEY` sudah diisi sebelum menjalankan backend.
- Jika muncul error `bcrypt version` atau `password cannot be longer than 72 bytes`, reinstall dependency setelah mengunci `bcrypt<5` di `requirements.txt`.

### JWT secret key
Backend login sekarang membaca secret key dari environment variable `SECRET_KEY`.

Buat file `.env` di root project, lalu isi seperti ini:
```env
SECRET_KEY=replace-this-with-a-long-random-secret
```

Windows PowerShell:
```powershell
$env:SECRET_KEY = "isi-secret-random-yang-panjang"
python main.py
```

Windows Command Prompt:
```bat
set SECRET_KEY=isi-secret-random-yang-panjang
python main.py
```

Linux/macOS:
```bash
export SECRET_KEY="isi-secret-random-yang-panjang"
python main.py
```

Linux might start python2.X, use the correct command to launch a python3.X interpreter on your machine e.g. `python3`.
After the first connection the -p flag can be omitted, even when executing omblepy on a different device:
```
python ./omblepy.py -d HEM-7322T
```
### Pairing for Universal Blood Pressure Manager (UBPM)

If you preform this pairing for <a href="https://codeberg.org/LazyT/ubpm/">Universal Blood Pressure Manager (UBPM)</a>, just use one of the supported devices (e.g. `-d HEM-7322T`), even if your device model is different. As far as I know the pairing process is similar for all omron devices. If you use an unsupported device it is expected that the pairing will work and that the `-P- `on the display of the omron device will change to a small square. But the tool will crash further in the readout, because the data format / readout commands for the stored records are different. Nevertheless your omron device is now bound to the mac address of your pc and UBPM should work without mac address spoofing. <br>
If you see the message "Could not enter key programming mode." or "Failure to program new key." the pairing procedure did NOT work. Please see the troubleshooting section and if the problem persists please open an issue. <br>
Success is indicated by the message "Paired device successfully with new key".

### Flags table
| flag  | alternative long flag  | always required | required on first connection | potentially dangerous eeprom write | description | usage example |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `-h`  | `--help` | - | - | - | display help for all possible flags, similar to this table | `python3 ./omblepy.py -h` |
| `-d`  | `--device` |✔️ | ✔️ | - | select which device library will be loaded from [here](deviceSpecific) | `python3 ./omblepy.py -d HEM-7322T` |
| `-p`  | `--pair` | ❌ | ✔️ | - | use to write pairing key on first connection with this pc | `python3 ./omblepy.py -d HEM-7322T -p` |
| `-m`  | `--mac` |❌ | ❌ | - | select omron devices mac and skip bluetooth scan and device selection dialog | `python3 ./omblepy.py -d HEM-7322T -m 11:22:33:44:55:66` |
| `-n`  | `--newRecOnly` | ❌ | ❌ | ❗ | instead of downloading all records, check and update the "new records couter" and only transfer new records | `python3 ./omblepy.py -d HEM-7322T -n` |
| `-t`  | `--timeSync` | ❌ | ❌ | ❗ | synchronize omron internal clock with system time | `python3 ./omblepy.py -d HEM-7322T -t` |
|  |`--loggerDebug`  | ❌ | ❌ | - | displays every ingoing and outgoing data for debugging purposes | `python3 ./omblepy.py -d HEM-7322T --loggerDebug` |

Potentially dangerous, refers to the possibility to mess up the calibration data for the pressure sensor, which is likely stored in the eeprom in the settings region.<br>
This is most important when you are trying to add support for a new device.

## Omron device support matrix

| device model | sold under name |  pairing | basic data readout | new record counter | time sync | contributors / testers / help by |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| [HEM-7150T](deviceSpecific/hem-7150t.py) | BP7250  | ✔️ | ✔️ | ❓ | ❓ | Toei79, userx14  |
| [HEM-7155T](deviceSpecific/hem-7155t.py) | M400 / M4		      	            | ✔️ | ✔️ | ✔️ | ✔️ | dromie, RobertWojtowicz   |
| [HEM-7322T](deviceSpecific/hem-7322t.py) | M700 Intelli IT 				        	| ✔️ | ✔️ | ✔️ | ✔️ | userx14 				  	      |
| [HEM-7342T](deviceSpecific/hem-7342t.py) | BP7450                           | ✔️ | ✔️ | ❓  | ❓ | Toei79, userx14           |
| [HEM-7361T](deviceSpecific/hem-7361t.py) | M500 Intelli IT / M7 Intelli IT 	| ✔️ | ✔️ | ✔️ | ✔️ | LazyT, userx14, zivanfi, RobertWojtowicz |
| [HEM-7530T](deviceSpecific/hem-7530t.py) | Omron Complete                   | ✔️ | ✔️ (no EKG) | ❌ | ❌ | Toei79, userx14  |
| [HEM-7600T](deviceSpecific/hem-7600t.py) | Omron Evolv 				      	      | ✔️ | ✔️ | ✔️ | ✔️ | vulcainman 				        |

✔️=tested working, ❓=not tested , ❌=not supported yet <br>

Please open an issue if you can test a feature or an currently unsupported device. <br>
It is potentially dangerous to write to the eeprom on devices where the eeprom layout is unknown (see Flags table), <br>
since the calibration data for the pressure sensor is likeley also stored there.

## Troubleshooting
- Remove the pairing with the omron device using your os bluetooth dialog.
- Use a bluetooth chipset/dongle which supports at least bluetooth 4.2, better 5.0
- On the devices I had available for testing, win10 did always work, while ubuntu didn't work on some versions.
- If the pairing works and there is an error in the readout use the `--loggerDebug` flag and please open an issue.
- Windows specific
  - Do not use the CSR harmony stack (CSR 8510 based usb dongles), it is incompatible.
- Linux specific
  - Preferably test on a device with only one bluetooth adapter connected.
  - on non gui systems open `bluetoothctl` in a second multiplexed terminal for the bluetooth pairing to work,
    for an automated solution see [this issue](https://github.com/userx14/omblepy/issues/25#issuecomment-2175493249)
  - Restart the bluetooth stack `sudo systemctl restart bluetooth`.
  - Delete the bluetooth adapter cache with `sudo rm -r /var/lib/bluetooth/$yourBtCardMacAddress`.
  - If you have two bluetooth adapters in your system, open a second terminal alongside omblepy and use `bluetoothctl` to confirm pairing dialogs by typing `yes` when promped, some graphical interfaces will not show the pairing dialog for the second adapter.
  - When you are on ubuntu, install blueman, since it seems to be designed with multiple adapters in mind.
  - Try other versions of bluez, for me versions around bluez 5.55 worked best.

## Documentation
The general communication is handled in the first 250 lines of [omblepy.py](./omblepy.py).

### command types (bytes 1-3 of header):
PC -> omron device
 command type bytes | function | packet size
 --- | --- | ---
`0000` | start of transmission / read device id from eeprom | 0x08 bytes with checksum
`0100` | read data from eeprom | 0x08 bytes with checksum
`01c0` | write data to eeprom | 0x08 bytes + sizeof(data to write)
`0f00` | end of transmission | 0x08 bytes

omron device -> PC
response type bytes | function | packet size
 --- | --- | ---
`8000` | response start transmission | 0x18 bytes with checksum
`8100` | response read data | 0x08 bytes + sizeof(attached data read from eeprom)
`81c0` | response write data | same size as corresponding write command
`8f00` | response end transmission | 0x08 bytes

### Packet header for reads:
Example message sent to request a read of 0x26 bytes starting from address 0x0260:
messagelength | command type      | start address | readsize | padding     | crc, such that all bytes xored = 0
---           | ---               | ---           | ---      | ---         | ---
0x08          | 0x0100            | 0x0260        | 0x26     | 0x00        | 0x4d


## Related Projects
A huge thank you goes to LazyT and his <a href=https://codeberg.org/LazyT/ubpm>UBPM project</a>
which provided extremely usefull insight how the reception with multiple bluetooth channels works.

The <a href=https://github.com/RobertWojtowicz/export2garmin>export2garmin</a> project
can be used to import the data from the omron device into Garmin Connect.

The USB communication of selected omron medical equipment is implemented by <a href=https://github.com/openyou/libomron>libomron</a>
and shares some similarities with the bluetooth communication.
