<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BatchingService;

class FlushBloodPressureBatch extends Command
{
    protected $signature = 'bp:flush-batch';
    protected $description = 'Flushes the buffered blood pressure data to the database.';
    protected BatchingService $batchingService;

    public function __construct(BatchingService $batchingService)
    {
        parent::__construct();
        $this->batchingService = $batchingService;
    }

    public function handle()
    {
        $this->info('Flushing blood pressure data batch...');
        $flushedCount = $this->batchingService->flushBatch();

        if ($flushedCount > 0) {
            $this->info("Successfully flushed {$flushedCount} records.");
        } elseif ($flushedCount === 0) {
            $this->info('No records to flush.');
        } else {
            $this->error('An error occurred during batch flush. Check logs.');
        }
        return 0;
    }
}
