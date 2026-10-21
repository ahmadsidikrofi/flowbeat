<?php
 
namespace Tests\Unit;
 
use PHPUnit\Framework\TestCase;
use App\Adapters\Hem7142Adapter;
use App\Services\DataQualityService;
use App\Domain\CanonicalVitalSign;
 
class AdapterTest extends TestCase
{
    public function test_adapter_mengenali_payload_miliknya()
    {
        $adapter = new Hem7142Adapter();
        $this->assertTrue($adapter->supports([
            'mac_address' => 'FA:E4:FA:F7:F7:AC'
        ]));
    }
 
    public function test_adapter_menyeragamkan_nilai_bertipe_teks()
    {
        $adapter = new Hem7142Adapter();
        $hasil = $adapter->transform([
            'mac_address' => 'FA:E4:FA:F7:F7:AC',
            'records' => [[
                ['sys' => '123', 'dia' => '91', 'bpm' => '85',
                 'datetime' => '2026-05-09 01:48:24'],
            ]],
        ]);
        $this->assertIsInt($hasil[0]->systolic);
        $this->assertSame(123, $hasil[0]->systolic);
    }
 
    public function test_adapter_menyeragamkan_waktu_iso()
    {
        $adapter = new Hem7142Adapter();
        $hasil = $adapter->transform([
            'mac_address' => 'FA:E4:FA:F7:F7:AC',
            'latest_record' => [
                'sys' => 123, 'dia' => 85, 'bpm' => 109,
                'datetime' => '2026-07-22T18:38:33.252978'
            ],
        ]);
        $this->assertSame('2026-07-22 18:38:33', $hasil[0]->measuredAt);
    }
 
    public function test_menolak_stempel_waktu_pabrik()
    {
        $v = new CanonicalVitalSign('HEM-7155T', 119, 84, 83, '2021-01-01 00:00:59');
        $cek = (new DataQualityService())->periksa($v);
        $this->assertFalse($cek['lolos']);
    }
 
    public function test_menolak_sistolik_tidak_lebih_besar()
    {
        $v = new CanonicalVitalSign('HEM-7142T', 80, 90, 70, '2026-05-01 10:00:00');
        $cek = (new DataQualityService())->periksa($v);
        $this->assertFalse($cek['lolos']);
    }
 
    public function test_menerima_data_wajar()
    {
        $v = new CanonicalVitalSign('HEM-7142T', 120, 80, 75, '2026-05-01 10:00:00');
        $cek = (new DataQualityService())->periksa($v);
        $this->assertTrue($cek['lolos']);
    }
}
