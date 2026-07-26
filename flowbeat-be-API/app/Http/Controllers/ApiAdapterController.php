<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\Adapters\AdapterRegistry;
use App\Services\DataQualityService;
use App\Models\PatientRecord;
use App\Models\AnomalyLog;
 
class ApiAdapterController extends Controller
{
    public function ingest(Request $request)
    {
        $mulai   = microtime(true);
        $payload = $request->all();
 
        $adapter = (new AdapterRegistry())->pilih($payload);
        if (!$adapter) {
            return response()->json([
                'status' => 'ditolak',
                'pesan'  => 'perangkat tidak dikenali oleh adapter mana pun',
            ], 422);
        }
 
        $mutu      = new DataQualityService();
        $tersimpan = 0;
        $duplikat  = 0;
        $ditolak   = 0;
        $alasanSemua = [];
 
        foreach ($adapter->transform($payload) as $vital) {
            $cek = $mutu->periksa($vital);
 
            if (!$cek['lolos']) {
                AnomalyLog::create([
                    'device_model' => $vital->deviceModel,
                    'raw_payload'  => json_encode($vital),
                    'reason'       => implode(', ', $cek['alasan']),
                ]);
                $ditolak++;
                $alasanSemua = array_merge($alasanSemua, $cek['alasan']);
                continue;
            }
 
            // sidik jari unik tiap catatan, dasar pencegahan duplikat
            $hash = hash('sha256', implode('|', [
                $vital->deviceModel,
                $vital->measuredAt,
                $vital->systolic,
                $vital->diastolic,
                $vital->pulse,
            ]));
 
            $record = PatientRecord::firstOrCreate(
                ['record_hash' => $hash],
                [
                    'device_model' => $vital->deviceModel,
                    'systolic'     => $vital->systolic,
                    'diastolic'    => $vital->diastolic,
                    'pulse'        => $vital->pulse,
                    'measured_at'  => $vital->measuredAt,
                    'quality_flag' => 'Verified',
                ]
            );
 
            if ($record->wasRecentlyCreated) {
                $tersimpan++;
            } else {
                $duplikat++;
            }
        }
 
        return response()->json([
            'status'         => 'berhasil',
            'tersimpan'      => $tersimpan,
            'duplikat'       => $duplikat,
            'ditolak'        => $ditolak,
            'alasan_ditolak' => array_values(array_unique($alasanSemua)),
            'processing_ms'  => (int) round((microtime(true) - $mulai) * 1000),
        ]);
    }
}
