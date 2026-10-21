<?php
 
namespace App\Adapters;
 
class Hem7155Adapter extends OmronBaseAdapter
{
    protected function macAddress(): string
    {
        return '00:5F:BF:1B:AF:01';
    }
 
    protected function deviceModel(): string
    {
        return 'HEM-7155T';
    }
}
