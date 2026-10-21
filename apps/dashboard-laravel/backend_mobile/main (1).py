from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from bleak import BleakClient, BleakScanner
from omblepy import bluetoothTxRxHandler, scanBLEDevices, appendCsv, saveUBPMJson
import logging
import os
import datetime
import sqlite3

from deviceSpecific.hem_7142t import deviceSpecificDriver

# ── TAMBAHAN BARU ──────────────────────────────────────────
from database import engine, Base
import models
from routers import auth, profiles, measurements

Base.metadata.create_all(bind=engine)  # buat tabel otomatis saat start


def ensure_sqlite_columns() -> None:
    db_path = os.path.join(os.path.dirname(__file__), "omron.db")
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()

        cursor.execute("PRAGMA table_info(users)")
        user_columns = {row[1] for row in cursor.fetchall()}
        if "phone" not in user_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")

        cursor.execute("PRAGMA table_info(profiles)")
        profile_columns = {row[1] for row in cursor.fetchall()}
        if "age" not in profile_columns:
            cursor.execute("ALTER TABLE profiles ADD COLUMN age INTEGER")
        if "gender" not in profile_columns:
            cursor.execute("ALTER TABLE profiles ADD COLUMN gender TEXT")
        if "tb" not in profile_columns:
            cursor.execute("ALTER TABLE profiles ADD COLUMN tb FLOAT")
        if "bb" not in profile_columns:
            cursor.execute("ALTER TABLE profiles ADD COLUMN bb FLOAT")
        if "image_path" not in profile_columns:
            cursor.execute("ALTER TABLE profiles ADD COLUMN image_path TEXT")

        conn.commit()
    finally:
        conn.close()


ensure_sqlite_columns()
# ───────────────────────────────────────────────────────────

json_path      = os.path.join('ubpm.json')
logger         = logging.getLogger("omblepy")
bleClient      = None
deviceSpecific = None
ble_client     = None

app = FastAPI()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://192.168.1.16:3000",
        "http://10.20.31.178:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Daftarkan router baru ──────────────────────────────────
app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(profiles.router,     prefix="/api/profiles",     tags=["Profiles"])
app.include_router(measurements.router, prefix="/api/measurements", tags=["Measurements"])
# ───────────────────────────────────────────────────────────


# ── Model input (tidak diubah) ─────────────────────────────
class BLEDevice(BaseModel):
    mac_address: str
    device_name: str

class ReadRecordsInput(BaseModel):
    mac_address      : str
    new_records_only : bool = False
    sync_time        : bool = False
    device_name      : str

class ConnectAndReadInput(BaseModel):
    mac_address      : str
    device_name      : str
    new_records_only : bool
    sync_time        : bool
    pairing          : bool

RX_CHANNEL_UUIDS = [
    "49123040-aee8-11e1-a74d-0002a5d5c51b",
    "4d0bf320-aee8-11e1-a0d9-0002a5d5c51b",
    "5128ce60-aee8-11e1-b84b-0002a5d5c51b",
    "560f1420-aee8-11e1-8184-0002a5d5c51b",
]


# ── Route lama (tidak diubah sama sekali) ──────────────────
@app.get("/")
def read_root():
    return {"message": "Omron BLE Python Backend is running"}


@app.get("/ui")
def read_ui():
    ui_path = os.path.join(os.path.dirname(__file__), "frontend", "index.html")
    return FileResponse(ui_path)


@app.post("/connect-and-read")
async def connect_and_read(data: ConnectAndReadInput):
    """
    Menghubungkan ke perangkat Omron, membaca data, dan menyimpannya ke CSV/JSON.
    - pairing: Jika True, hanya melakukan pairing.
    - new_records_only: Jika True, hanya membaca catatan baru.
    - sync_time: Jika True, menyinkronkan waktu perangkat.
    """
    try:
        devices = await BleakScanner.discover()
        selected_device = next(
            (dev for dev in devices if dev.address == data.mac_address), None
        )
        if not selected_device:
            raise HTTPException(status_code=404, detail="Device not found during scan.")

        client = BleakClient(selected_device.address)
        print("Device: ", selected_device.address, selected_device.name)

        try:
            await client.connect()
            await client.pair(protection_level=2)
            if not client.is_connected:
                raise HTTPException(status_code=500, detail="Failed to connect to the BLE device.")

            bluetoothTxRxObj = bluetoothTxRxHandler(client)
            dev_driver       = deviceSpecificDriver()

            if data.pairing:
                if dev_driver.deviceUseLockUnlock:
                    await bluetoothTxRxObj.writeNewUnlockKey()
                await bluetoothTxRxObj.startTransmission()
                await bluetoothTxRxObj.endTransmission()
                return {"message": "Pairing sucessful."}
            else:
                await bluetoothTxRxObj.startTransmission()
                records = await dev_driver.getRecords(
                    btobj            = bluetoothTxRxObj,
                    useUnreadCounter = data.new_records_only,
                    syncTime         = data.sync_time,
                )
                await bluetoothTxRxObj.endTransmission()
                appendCsv(records)
                saveUBPMJson(records)
                return {
                    "message"     : "Data read successfully.",
                    "mac_address" : selected_device.address,
                    "device_name" : selected_device.name,
                    "records"     : records
                }
        finally:
            if client.is_connected:
                await client.disconnect()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/scan")
async def scan_devices():
    """Memindai perangkat BLE."""
    try:
        devices = await scanBLEDevices()
        return {"devices": devices, "message": "Perangkat BLE berhasil dipindai"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tolong hidupkan bluetooth: {str(e)}")


@app.post("/latest-bp-records")
async def connect_and_read_latest(data: ConnectAndReadInput):
    """
    Menghubungkan ke perangkat Omron dan hanya membaca data pengukuran terbaru.
    - pairing: Jika True, hanya melakukan pairing.
    - sync_time: Jika True, menyinkronkan waktu perangkat.
    """
    try:
        devices = await BleakScanner.discover()
        selected_device = next(
            (dev for dev in devices if dev.address == data.mac_address), None
        )
        if not selected_device:
            raise HTTPException(status_code=404, detail="Device not found during scan.")

        client = BleakClient(selected_device.address)
        print("Device: ", selected_device.address, selected_device.name)

        try:
            await client.connect()
            await client.pair(protection_level=2)
            if not client.is_connected:
                raise HTTPException(status_code=500, detail="Failed to connect to the BLE device.")

            bluetoothTxRxObj = bluetoothTxRxHandler(client)
            dev_driver       = deviceSpecificDriver()

            if data.pairing:
                if dev_driver.deviceUseLockUnlock:
                    await bluetoothTxRxObj.writeNewUnlockKey()
                await bluetoothTxRxObj.startTransmission()
                await bluetoothTxRxObj.endTransmission()
                return {"message": "Pairing successful."}
            else:
                await bluetoothTxRxObj.startTransmission()
                records = await dev_driver.getRecords(
                    btobj            = bluetoothTxRxObj,
                    useUnreadCounter = data.new_records_only,
                    syncTime         = data.sync_time,
                )
                await bluetoothTxRxObj.endTransmission()

                if not records:
                    raise HTTPException(status_code=404, detail="No records found.")

                latest_record             = records[-1][-1]
                latest_record['datetime'] = datetime.datetime.now()
                return {
                    "message"       : "Newest record read with success.",
                    "mac_address"   : selected_device.address,
                    "device_name"   : selected_device.name,
                    "latest_record" : latest_record
                }
        finally:
            if client.is_connected:
                await client.disconnect()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")