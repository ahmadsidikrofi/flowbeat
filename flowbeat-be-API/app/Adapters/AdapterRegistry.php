<?php
 
namespace App\Adapters;
 
class AdapterRegistry
{
    private array $adapters;
 
    public function __construct()
    {
        // menambah perangkat baru cukup menambahkan satu baris di sini
        $this->adapters = [
            new Hem7155Adapter(),
            new Hem7142Adapter(),
            new VendorBAdapter(),
        ];
    }
 
    public function pilih(array $payload): ?VitalSignAdapter
    {
        foreach ($this->adapters as $adapter) {
            if ($adapter->supports($payload)) {
                return $adapter;
            }
        }
        return null;
    }
}
