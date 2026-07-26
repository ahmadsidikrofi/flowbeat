<?php

namespace App\Domain;

class CanonicalVitalSign
{
    public function __construct(
        public string $deviceModel,
        public int $systolic,
        public int $diastolic,
        public int $pulse,
        public string $measuredAt,
    ) {}
}