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

    const totalPatient = patients.length;

    let normalPatient = 0;
    let warningPatient = 0;
    let criticalPatient = 0;
    let checkedToday = 0;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    for (const p of patients) {
      const hd = p.health_data;
      if (hd && hd.length > 0) {
        const status = hd[0].status;
        if (status === 'Normal') normalPatient++;
        if (status === 'Warning') warningPatient++;
        if (status === 'Critical') criticalPatient++;

        // Check if measured today
        const measDate = (hd[0].created_at || '').slice(0, 10);
        if (measDate === today) checkedToday++;
      }
    }

    return NextResponse.json({
      success: true,
      total_patient: totalPatient,
      normal_patient: normalPatient,
      warning_patient: warningPatient,
      critical_patient: criticalPatient,
      checked_today: checkedToday,
      not_checked_today: totalPatient - checkedToday,
    });
  } catch (error) {
    console.error('[API /patients/summary/status] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
