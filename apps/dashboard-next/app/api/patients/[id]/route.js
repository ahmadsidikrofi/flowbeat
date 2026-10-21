import { NextResponse } from 'next/server';
import {
  getProfiles,
  getMeasurements,
  getSpo2Measurements,
  getPatientDetail,
  clinicalStatus,
  getAssignedPatientsFilter
} from '@/lib/mobile-api';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const profileId = Number(id);

    const filter = await getAssignedPatientsFilter();
    if (!filter.isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Verify that this profile ID is assigned to this doctor
    if (filter.assignedProfileIds !== null && !filter.assignedProfileIds.includes(profileId)) {
      return NextResponse.json(
        { success: false, message: 'Access Denied: Patient is not assigned to you.' },
        { status: 403 }
      );
    }

    const apiUserIds = filter.apiUserIds;

    // Search for the profile across all authorized user IDs
    let profileData = null;
    for (const userId of apiUserIds) {
      const profiles = await getProfiles(userId);
      const found = profiles.find((p) => Number(p.id) === profileId);
      if (found) {
        profileData = found;
        break;
      }
    }

    if (!profileData) {
      return NextResponse.json(
        { success: false, message: `Profile ${profileId} not found` },
        { status: 404 }
      );
    }

    // Fetch all measurements, SpO2 data, and full patient details
    const [measurements, spo2Measurements, detailRes] = await Promise.all([
      getMeasurements(profileId),
      getSpo2Measurements(profileId),
      getPatientDetail(profileId),
    ]);

    const apiPatientData = detailRes?.patient_data || {};

    // Split name for compatibility
    const nameParts = (profileData.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Format patient data to match old backend's structure
    const latestMeasurement = measurements[0] || null;
    const rawDob = apiPatientData.date_of_birth || profileData.date_of_birth || null;
    const dobFormatted = rawDob ? String(rawDob).split('T')[0] : null;

    // Lookup phone number from doctor assignments metadata in Clerk
    let phoneFromAssignment = null;
    if (filter.assignments) {
      const match = filter.assignments.find((a) => Number(a.profile_id) === profileId);
      if (match?.phone) {
        phoneFromAssignment = match.phone;
      }
    }

    if (!phoneFromAssignment) {
      try {
        const { clerkClient } = await import('@clerk/nextjs/server');
        const client = await clerkClient();
        const { data: allUsers } = await client.users.getUserList({ limit: 200 });
        for (const u of allUsers) {
          for (const a of u.publicMetadata?.assignments || []) {
            if (Number(a.profile_id) === profileId && a.phone) {
              phoneFromAssignment = a.phone;
              break;
            }
          }
          if (phoneFromAssignment) break;
        }
      } catch (e) {
        // Ignore fallback lookup error
      }
    }

    // Fallback lookup by profileId if phone is not yet in Clerk assignment metadata
    if (!phoneFromAssignment) {
      const knownPhoneMap = {
        1: '083844457333',
      };
      if (knownPhoneMap[profileId]) {
        phoneFromAssignment = knownPhoneMap[profileId];
      }
    }

    const patientData = {
      id: profileData.id,
      uuid: String(profileData.id),
      first_name: firstName,
      last_name: lastName,
      name: profileData.name,
      age: profileData.age,
      gender: profileData.gender,
      phone_number: phoneFromAssignment || apiPatientData.phone_number || profileData.phone_number || profileData.phone || null,
      date_of_birth: dobFormatted,
      height: profileData.tb,
      weight: profileData.bb,
      image_url: profileData.image_url || null,
      created_at: null,
      health_data: latestMeasurement ? [{
        sys: Number(latestMeasurement.sys),
        dia: Number(latestMeasurement.dia),
        bpm: Number(latestMeasurement.bpm),
        status: clinicalStatus(Number(latestMeasurement.bpm), Number(latestMeasurement.sys), Number(latestMeasurement.dia)),
        created_at: latestMeasurement.datetime,
      }] : [],
    };

    // Format measurements as health_data (matching old format)
    const healthDataItems = measurements.map((m) => ({
      id: m.id,
      patient_id: profileData.id,
      sys: Number(m.sys),
      dia: Number(m.dia),
      bpm: Number(m.bpm),
      mov: m.mov,
      ihb: m.ihb,
      status: clinicalStatus(Number(m.bpm), Number(m.sys), Number(m.dia)),
      device: 'omron',
      created_at: m.datetime,
    }));

    // Simple client-side pagination (5 per page)
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const perPage = 5;
    const totalItems = healthDataItems.length;
    const lastPage = Math.max(1, Math.ceil(totalItems / perPage));
    const paginatedItems = healthDataItems.slice(
      (page - 1) * perPage,
      page * perPage
    );

    // Format SpO2 data
    const spo2DataItems = spo2Measurements.map((m) => ({
      id: m.id,
      spo2: m.spo2,
      bpm: m.bpm,
      temperature: m.temperature,
      blood_sugar: m.blood_sugar,
      created_at: m.datetime,
    }));

    // Determine last visit
    const lastVisit =
      healthDataItems.length > 0
        ? healthDataItems[0].created_at
        : '-';

    return NextResponse.json({
      success: true,
      patient_data: patientData,
      health_data: {
        data: paginatedItems,
        last_page: lastPage,
        current_page: page,
        total: totalItems,
      },
      spo2_data: spo2DataItems,
      lastVisit: lastVisit,
    });
  } catch (error) {
    console.error('[API /patients/[id]] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
