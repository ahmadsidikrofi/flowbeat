from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
from bleak import BleakClient, BleakScanner
from omblepy import bluetoothTxRxHandler, scanBLEDevices, appendCsv, saveUBPMJson
import logging
import os
json_path = os.path.join('ubpm.json')
from deviceSpecific.hem_7142t import deviceSpecificDriver

logger              = logging.getLogger("omblepy")
bleClient           = None
deviceSpecific = None
bleClient = None

app = FastAPI()
connected_clients = []

# Model untuk input pengguna
class BLEDevice(BaseModel):
    mac_address: str
    device_name: str

class ReadRecordsInput(BaseModel):
    mac_address: str
    new_records_only: bool = False
    sync_time: bool = False
    device_name: str
    
class ConnectAndReadInput(BaseModel):
    mac_address: str
    device_name: str
    new_records_only: bool
    sync_time: bool
    pairing: bool
    
RX_CHANNEL_UUIDS = [
    "49123040-aee8-11e1-a74d-0002a5d5c51b",
    "4d0bf320-aee8-11e1-a0d9-0002a5d5c51b",
    "5128ce60-aee8-11e1-b84b-0002a5d5c51b",
    "560f1420-aee8-11e1-8184-0002a5d5c51b",
]
ble_client = None 

@app.get("/")
def read_root():
    return {"message": "Omron BLE Python Backend is running"}

@app.post("/connect-and-read")
async def connect_and_read(data: ConnectAndReadInput):
    """
    Menghubungkan ke perangkat Omron, membaca data, dan menyimpannya ke CSV/JSON.
    Parameter:
    - `pairing`: Jika True, hanya melakukan pairing.
    - `new_records_only`: Jika True, hanya membaca catatan baru.
    - `sync_time`: Jika True, menyinkronkan waktu perangkat.
    """
    try:
        # Cari perangkat berdasarkan MAC address
        devices = await BleakScanner.discover()
        selected_device = next((dev for dev in devices if dev.address == data.mac_address), None)
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
            dev_driver = deviceSpecificDriver()

            if data.pairing:
                if dev_driver.deviceUseLockUnlock:
                    await bluetoothTxRxObj.writeNewUnlockKey()

                await bluetoothTxRxObj.startTransmission()
                await bluetoothTxRxObj.endTransmission()
                return { "message": "Pairing sucessful." }
            else:
                await bluetoothTxRxObj.startTransmission()
                records = await dev_driver.getRecords(
                    btobj=bluetoothTxRxObj,
                    useUnreadCounter=data.new_records_only,
                    syncTime=data.sync_time,
                )
                await bluetoothTxRxObj.endTransmission()
                appendCsv(records)
                saveUBPMJson(records)
                return {
                    "message": "Data read successfully.", 
                    "mac_address": selected_device.address,
                    "device_name": selected_device.name,  
                    "records": records
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
    Parameter:
    - `pairing`: Jika True, hanya melakukan pairing.
    - `sync_time`: Jika True, menyinkronkan waktu perangkat.
    """
    try:
        devices = await BleakScanner.discover()
        selected_device = next((dev for dev in devices if dev.address == data.mac_address), None)
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
            dev_driver = deviceSpecificDriver()

            if data.pairing:
                if dev_driver.deviceUseLockUnlock:
                    await bluetoothTxRxObj.writeNewUnlockKey()

                await bluetoothTxRxObj.startTransmission()
                await bluetoothTxRxObj.endTransmission()
                return { "message": "Pairing successful." }
            else:
                await bluetoothTxRxObj.startTransmission()
                records = await dev_driver.getRecords(
                    btobj=bluetoothTxRxObj,
                    useUnreadCounter=data.new_records_only,
                    syncTime=data.sync_time,
                )
                await bluetoothTxRxObj.endTransmission()
                if not records:
                    raise HTTPException(status_code=404, detail="No records found.")
                latest_record = records[-1][-1] 
                return {
                    "message": "Newest record read with success.",
                    "mac_address": selected_device.address,
                    "device_name": selected_device.name,
                    "latest_record": latest_record
                }
        finally:
            if client.is_connected:
                await client.disconnect()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")