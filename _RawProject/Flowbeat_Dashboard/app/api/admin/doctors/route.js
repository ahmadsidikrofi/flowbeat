import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const client = await clerkClient();
    const { data: allUsers } = await client.users.getUserList({ limit: 200 });

    const doctors = allUsers
      .filter((u) => u.publicMetadata?.role === 'dokter')
      .map((u) => {
        const meta = u.publicMetadata || {};
        const name =
          [u.firstName, u.lastName].filter(Boolean).join(' ') ||
          u.emailAddresses[0]?.emailAddress ||
          'Unknown';
        const initials = name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          id: u.id,
          name,
          email: u.emailAddresses[0]?.emailAddress || '',
          initials,
          patient_count: (meta.api_user_ids || []).length,
          api_user_ids: meta.api_user_ids || [],
        };
      });

    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error('[API /admin/doctors]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
