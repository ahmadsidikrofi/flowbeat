import { NextResponse } from 'next/server';

/**
 * GET /api/patients/statistics/distribution
 *
 * Returns blood pressure status distribution over the last 5 weeks.
 * Mirrors old Laravel PatientController@DistributionBPStatus.
 * 
 * Note: Since the Mobile API doesn't support time-range queries,
 * this returns empty distribution data for now.
 */
export async function GET() {
  try {
    // Build 5 weeks of empty distribution data
    const data = [];
    const today = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay() + 1);
      
      const month = weekStart.toLocaleString('id-ID', { month: 'short' });
      const day = weekStart.getDate();
      
      data.push({
        date: `${day} ${month}`,
        normal: 0,
        'Normal Tinggi': 0,
        'Hipertensi Tinggi': 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('[API /patients/statistics/distribution] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
