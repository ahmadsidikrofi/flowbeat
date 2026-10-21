import { NextResponse } from 'next/server';
import { getPatientsWithVitals, getAssignedPatientsFilter } from '@/lib/mobile-api';

/**
 * GET /api/patients
 *
 * Lists all patients with their latest vitals by calling the Mobile API.
 * Mirrors the logic from Laravel PatientController@index + MobileApiService.
 *
 * Query params:
 *   ?page=1  (for client-side compatibility; pagination handled client-side)
 *
 * Response format matches what PatientList.js expects:
 * {
 *   success: true,
 *   patients: {
 *     data: [...],
 *     last_page: 1
 *   }
 * }
 */
export async function GET(request) {
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

    // Return in the format PatientList.js expects
    return NextResponse.json({
      success: true,
      patients: {
        data: patients,
        last_page: 1, // no server-side pagination for mobile API
      },
    });
  } catch (error) {
    console.error('[API /patients] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
