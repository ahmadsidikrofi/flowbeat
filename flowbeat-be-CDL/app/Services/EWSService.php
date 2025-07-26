<?php

namespace App\Services;

use App\Models\BloodPressureModel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EWSService
{
    public function calculateEWS( int $systolicBP, int $heartrate, int $spo2 ): array
    {
        $scoreBP = 0;
        $scoreHr = 0;
        $scoreSpo2 = 0;

        // Skor BP
        if ( $systolicBP <= 90 ) $scoreBP = 3;
        else if ( $systolicBP >= 91 && $systolicBP <= 100 ) $scoreBP = 2;
        else if ( $systolicBP >= 101 && $systolicBP <= 110 ) $scoreBP = 1;
        else if ( $systolicBP >= 111 && $systolicBP <= 219 ) $scoreBP = 0;
        else if ( $systolicBP >= 220 ) $scoreBP = 3;

        // Skor saturasi oksigen
        if ( $spo2 <= 91 ) $scoreSpo2 = 3;
        else if ( $spo2 >= 92 && $spo2 <= 93 ) $scoreSpo2 = 2;
        else if ( $spo2 >= 94 && $spo2 <= 95 ) $scoreSpo2 = 1;
        else if ( $spo2 >= 96 ) $scoreSpo2 = 0;

        // Skor HR
        if ( $heartrate <= 40 ) $scoreHr = 3;
        else if ( $heartrate >= 41 && $heartrate <= 50 ) $scoreHr = 1;
        else if ( $heartrate >= 51 && $heartrate <= 90 ) $scoreHr = 0;
        else if ( $heartrate >= 91 && $heartrate <= 110 ) $scoreHr = 1;
        else if ( $heartrate >= 111 && $heartrate <= 130 ) $scoreHr = 2;
        else if ( $heartrate >= 131 ) $scoreHr = 3;

        $totalScore = $scoreBP + $scoreHr + $scoreSpo2;

        $riskLevel = 'Low';
        if ( $totalScore >= 7 ) {
            $riskLevel = 'High';
        } else if ( $totalScore >= 5 ) {
            $riskLevel = 'Medium';
        }

        return [ $totalScore, $riskLevel ];
    }
}
