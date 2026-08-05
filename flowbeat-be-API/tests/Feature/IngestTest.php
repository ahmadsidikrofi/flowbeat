<?php
 
namespace Tests\Feature;
 
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
 
class IngestTest extends TestCase
{
    use RefreshDatabase;
 
    private function payloadContoh(): array
    {
        return [
            'mac_address' => 'FA:E4:FA:F7:F7:AC',
            'records' => [[
                ['sys' => 123, 'dia' => 91, 'bpm' => 85,
                 'datetime' => '2026-05-09 01:48:24'],
            ]],
        ];
    }
 
    public function test_data_valid_tersimpan()
    {
        $res = $this->postJson('/api/v1/ingest', $this->payloadContoh());
        $res->assertStatus(200)->assertJson(['tersimpan' => 1]);
        $this->assertDatabaseHas('patient_records', ['systolic' => 123]);
    }
 
    public function test_pengiriman_kedua_terdeteksi_duplikat()
    {
        $this->postJson('/api/v1/ingest', $this->payloadContoh());
        $res = $this->postJson('/api/v1/ingest', $this->payloadContoh());
        $res->assertJson(['tersimpan' => 0, 'duplikat' => 1]);
    }
 
    public function test_perangkat_tak_dikenali_ditolak()
    {
        $res = $this->postJson('/api/v1/ingest', ['mac_address' => 'AA:BB:CC:DD:EE:FF']);
        $res->assertStatus(422);
    }

    protected function setUp(): void
{
    parent::setUp();
    Sanctum::actingAs(User::factory()->create());
}
}
