<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    /**
     * Mencatat tiap permintaan API untuk audit dan penghitungan optimalisasi.
     * Menyimpan metode, jalur, status, durasi, dan pengguna.
     * Menjawab permintaan Penguji 1 soal logging dan pengukuran optimalisasi API.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        $response = $next($request);
        $durationMs = round((microtime(true) - $start) * 1000, 2);

        try {
            DB::table('api_request_logs')->insert([
                'method'      => $request->method(),
                'path'        => $request->path(),
                'status'      => $response->getStatusCode(),
                'duration_ms' => $durationMs,
                'user_id'     => optional($request->user())->id,
                'created_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            // pencatatan tidak boleh mengganggu respons utama
        }

        return $response;
    }
}
