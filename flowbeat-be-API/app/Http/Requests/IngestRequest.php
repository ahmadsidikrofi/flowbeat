<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IngestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validasi struktur dan ukuran payload sebelum diproses.
     * Menjawab risiko injeksi dan OWASP API8 (Security Misconfiguration),
     * serta membatasi konsumsi sumber daya (API4).
     */
    public function rules(): array
    {
        return [
            'mac_address'  => ['sometimes', 'string', 'max:32'],
            'device_name'  => ['sometimes', 'string', 'max:96'],
            'device_model' => ['sometimes', 'string', 'max:64'],
            'records'      => ['sometimes', 'array', 'max:500'],
            'latest_record' => ['sometimes', 'array'],
            'measurements' => ['sometimes', 'array', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'records.max'      => 'Jumlah catatan pada satu payload melebihi batas yang diizinkan.',
            'measurements.max' => 'Jumlah pengukuran pada satu payload melebihi batas yang diizinkan.',
        ];
    }
}
