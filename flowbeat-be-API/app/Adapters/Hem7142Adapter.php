<?php
 
namespace App\Adapters;
 
class Hem7142Adapter extends OmronBaseAdapter
{
    protected function macAddress(): string
    {
        return 'FA:E4:FA:F7:F7:AC';
    }
 
    protected function deviceModel(): string
    {
        return 'HEM-7142T';
    }
}
