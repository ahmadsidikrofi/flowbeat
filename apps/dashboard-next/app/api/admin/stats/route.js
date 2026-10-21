import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getPatientsWithVitals } from '@/lib/mobile-api';

export async function GET() {
  try {
    const client = await clerkClient();
    const { data: allUsers } = await client.users.getUserList({ limit: 200 });
    const doctors = allUsers.filter(
      (u) => u.publicMetadata?.role === 'dokter'
    );

    const userIdsEnv = process.env.MOBILE_API_USER_IDS || '1';
    const apiUserIds = userIdsEnv.split(',').map((id) => Number(id.trim())).filter(Boolean);
    const patients = await getPatientsWithVitals(apiUserIds);

    return NextResponse.json({
      success: true,
      doctor_count: doctors.length,
      total_patients: patients.length,
    });
  } catch (error) {
    console.error('[API /admin/stats]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
