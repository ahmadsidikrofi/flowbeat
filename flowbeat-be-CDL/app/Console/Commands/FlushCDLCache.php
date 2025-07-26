<?php

namespace App\Console\Commands;

use App\Models\BloodPressureModel;
use App\Models\PatientModel;
use App\Models\VitalSignModel;
use App\Services\CDL\BpmTransmissionRule;
use App\Services\CDL\Max30100TransmissionRule;
use App\Services\CDL\OmronTransmissionRule;
use App\Services\CDL\SpO2TransmissionRule;
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
        $this->info('Starting CDL buffer flush...');

        $rules = [
            new OmronTransmissionRule(),
            new BpmTransmissionRule(),
            new SpO2TransmissionRule(),
        ];
        $statusToModelMap = [];

        foreach ($rules as $rule) {
            $statuses = array_keys($rule->getIntervals());
            foreach($statuses as $status) {
                $statusToModelMap[$status] = $rule->getModelClass();
            }
        }

        $cdlService = new CDLService(new OmronTransmissionRule());
        foreach ($statusToModelMap as $status => $model) {
            $cdlService->flushBufferedData($status, $model);
        }

        $this->info("CDL Buffered Flushed.");
    }
}
