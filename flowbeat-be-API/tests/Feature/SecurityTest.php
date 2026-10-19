<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_ingest_tanpa_token_ditolak_401(): void
    {
        $this->postJson('/api/v1/ingest', [])->assertStatus(401);
    }

    public function test_ingest_tanpa_kewenangan_ditolak_403(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['monitoring:read']);
        $this->postJson('/api/v1/ingest', ['mac_address' => 'FA:E4:FA:F7:F7:AC'])
             ->assertStatus(403);
    }

    public function test_masukan_injeksi_diperlakukan_sebagai_teks(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['ingest:write']);
        $payload = [
            'mac_address' => "FA'; DROP TABLE patient_records; --",
            'records'     => [],
        ];
        $this->postJson('/api/v1/ingest', $payload);

        // Tabel tetap ada, membuktikan injeksi tidak dieksekusi
        $this->assertTrue(Schema::hasTable('patient_records'));
    }
}
