import { NextResponse } from 'next/server';
import { getPatientsWithVitals, getAssignedPatientsFilter } from '@/lib/mobile-api';

export async function GET() {
  try {
    const filter = await getAssignedPatientsFilter();
    if (!filter.isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let patients = await getPatientsWithVitals(filter.apiUserIds);

    // Filter patients to keep only those assigned to this doctor
    if (filter.assignedProfileIds !== null) {
      patients = patients.filter((p) => filter.assignedProfileIds.includes(Number(p.id)));
    }

    // Sort by latest measurement date (most recent first)
    const sorted = [...patients].sort((a, b) => {
      const dateA = a.health_data?.[0]?.created_at || '';
      const dateB = b.health_data?.[0]?.created_at || '';
      return dateB.localeCompare(dateA);
    });

    // Take top 10
    const recent = sorted.slice(0, 10).map((p) => {
      const hd = p.health_data?.[0];
      return {
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        lastBP: hd ? `${hd.sys}/${hd.dia}` : 'N/A',
        bpm: hd?.bpm ? `${hd.bpm} bpm` : '-',
        blood_sugar: p.latest_spo2?.blood_sugar ? `${p.latest_spo2.blood_sugar} mg/dL` : '-',
        status: hd?.status || 'Tidak ada data',
        lastVisit: hd?.created_at || '-',
      };
    });

    return NextResponse.json({
      success: true,
      recent_patients: recent,
    });
  } catch (error) {
    console.error('[API /patients/recent] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
