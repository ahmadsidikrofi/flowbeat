import { NextResponse } from 'next/server';
import { getPatientsWithVitals, getAssignedPatientsFilter } from '@/lib/mobile-api';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

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

    const criticalPatients = patients
      .filter(p => p.health_data?.[0]?.status === 'Critical')
      .map(p => {
        const hd = p.health_data[0];
        let lastVisit = '-';
        try {
          if (hd.created_at) {
            lastVisit = formatDistanceToNow(new Date(hd.created_at), {
              addSuffix: true,
              locale: idLocale,
            });
          }
        } catch {}

        return {
          id: p.uuid || String(p.id),
          name: p.name || `${p.first_name} ${p.last_name || ''}`.trim(),
          lastBP: `${hd.sys}/${hd.dia}`,
          lastBPM: hd.bpm ? `${hd.bpm} BPM` : null,
          lastVisit,
          status: 'Critical',
        };
      });

    return NextResponse.json({
      success: true,
      critical_patients: criticalPatients,
    });
  } catch (error) {
    console.error('[API /patients/alerts] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
