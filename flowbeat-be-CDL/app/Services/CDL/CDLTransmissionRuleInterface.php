<?php

namespace App\Services\CDL;

use App\Services\CDLService;

interface CDLTransmissionRuleInterface
{
    public function getIntervals(): array;

    /** Mendapatkan interval delay untuk setiap status. */
    public function calculateStatus(array $data): string;

    /** Menangani logika buffering yang spesifik berdasarkan device. */
    public function handleBuffering(string $status, array $data, CDLService $cdlService): void;

    /** Mendapatkan kelas Model yang berasosiasi dengan Rule ini. */
    public function getModelClass(): string;

}
