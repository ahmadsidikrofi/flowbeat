<?php

namespace App\Console\Commands;

use App\Models\PatientModel;
use App\Services\CDLService;
use Illuminate\Console\Command;

class FlushCDLCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cdl:flush';
    protected $description = 'Flush buffered CDL data to database';

    /**
     * The console command description.
     *
     * @var string
     */

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // $patientIds = PatientModel::pluck('id');
        $statuses = ['Normal', 'Normal Tinggi', 'Rendah', 'Hipertensi Tinggi'];
        $CDLService = new CDLService();

        foreach( $statuses as $status ) {
            $CDLService->flushBufferedData($status);
        }
        $this->info("CDL Buffered Flushed.");
    }
}
