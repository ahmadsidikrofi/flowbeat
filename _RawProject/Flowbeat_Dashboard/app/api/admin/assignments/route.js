import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * POST /api/admin/assignments
 * Assigns one or more profiles to a doctor in a single atomic Clerk update.
 * Body: { doctorClerkId, apiUserId, profiles: [{ profileId, profileName }], phone }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { doctorClerkId, apiUserId, phone } = body;

    // Support both batch (profiles array) and legacy single (profileId / profileName)
    const profilesToAssign = body.profiles
      ? body.profiles
      : [{ profileId: body.profileId, profileName: body.profileName }];

    if (!doctorClerkId || !apiUserId || profilesToAssign.length === 0) {
      return NextResponse.json(
        { success: false, message: 'doctorClerkId, apiUserId, and profiles are required' },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const doctor = await client.users.getUser(doctorClerkId);
    const meta = doctor.publicMetadata || {};

    let existingAssignments = [...(meta.assignments || [])];
    let existingIds = [...(meta.api_user_ids || [])];

    // Add api_user_id if not already present
    if (!existingIds.includes(Number(apiUserId))) {
      existingIds = [...existingIds, Number(apiUserId)];
    }

    // Add each profile that isn't already assigned (by profile_id + api_user_id)
    for (const { profileId, profileName } of profilesToAssign) {
      const alreadyAssigned = existingAssignments.some(
        (a) =>
          Number(a.profile_id) === Number(profileId) &&
          Number(a.api_user_id) === Number(apiUserId)
      );
      if (!alreadyAssigned) {
        existingAssignments = [
          ...existingAssignments,
          {
            api_user_id: Number(apiUserId),
            profile_id: Number(profileId),
            profile_name: profileName || `Profile #${profileId}`,
            phone: phone || null,
          },
        ];
      }
    }

    // Single atomic write to Clerk
    await client.users.updateUser(doctorClerkId, {
      publicMetadata: {
        ...meta,
        api_user_ids: existingIds,
        assignments: existingAssignments,
      },
    });

    return NextResponse.json({ success: true, message: 'Assignment saved' });
  } catch (error) {
    console.error('[API /admin/assignments POST]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/assignments
 * Removes a single profile assignment from a doctor.
 * Body: { doctorClerkId, profileId, apiUserId }
 */
export async function DELETE(request) {
  try {
    const { doctorClerkId, profileId, apiUserId } = await request.json();

    if (!doctorClerkId || !profileId || !apiUserId) {
      return NextResponse.json(
        { success: false, message: 'doctorClerkId, profileId, and apiUserId are required' },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const doctor = await client.users.getUser(doctorClerkId);
    const meta = doctor.publicMetadata || {};

    // Remove the matching assignment
    const newAssignments = (meta.assignments || []).filter(
      (a) =>
        !(
          Number(a.profile_id) === Number(profileId) &&
          Number(a.api_user_id) === Number(apiUserId)
        )
    );

    // Recalculate api_user_ids from remaining assignments
    const newApiUserIds = Array.from(
      new Set(newAssignments.map((a) => Number(a.api_user_id)))
    );

    await client.users.updateUser(doctorClerkId, {
      publicMetadata: {
        ...meta,
        assignments: newAssignments,
        api_user_ids: newApiUserIds,
      },
    });

    return NextResponse.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    console.error('[API /admin/assignments DELETE]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/assignments
 * Returns all assignments across all doctors.
 */
export async function GET() {
  try {
    const client = await clerkClient();
    const { data: allUsers } = await client.users.getUserList({ limit: 200 });

    const assignments = [];

    for (const u of allUsers) {
      const meta = u.publicMetadata || {};
      if (meta.role !== 'dokter') continue;
      const doctorName =
        [u.firstName, u.lastName].filter(Boolean).join(' ') ||
        u.emailAddresses[0]?.emailAddress ||
        'Unknown';

      for (const a of meta.assignments || []) {
        assignments.push({
          doctor_name: doctorName,
          doctor_clerk_id: u.id,
          profile_id: a.profile_id,
          profile_name: a.profile_name,
          api_user_id: a.api_user_id,
          phone: a.phone || null,
        });
      }
    }

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error('[API /admin/assignments GET]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
