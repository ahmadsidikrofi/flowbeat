<?php

namespace App\Adapters;

interface VitalSignAdapter
{
    public function supports(array $payload): bool;
    public function transform(array $payload): array;
}