/**
 * mobile-api.js
 *
 * Server-side utility to call the Mobile API (FastAPI) endpoints.
 * Mirrors the logic from Laravel's MobileApiService.
 *
 * Endpoints used:
 *   GET /api/profiles/{id_user}                → list profiles (name, age, gender, tb, bb)
 *   GET /api/measurements/{id_profile}          → all measurements
 *   GET /api/measurements/{id_profile}/latest   → latest measurement
 *   GET /api/measurements/{id_profile}/spo2     → all SpO2 measurements
 *   GET /api/measurements/{id_profile}/spo2/latest → latest SpO2
 */

import { currentUser } from '@clerk/nextjs/server';

const MOBILE_API_BASE_URL = process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL || 'https://rpms.gilangramadhani.tech';

/**
 * Helper to fetch the logged-in user's assigned patient profile and user IDs.
 */
export async function getAssignedPatientsFilter() {
  const user = await currentUser();
  if (!user) {
    return { isAuthorized: false, apiUserIds: [], assignedProfileIds: [] };
  }

  // Admin has access to all patients configured in MOBILE_API_USER_IDS
  if (user.publicMetadata?.role === 'admin') {
    const userIdsEnv = process.env.MOBILE_API_USER_IDS || '1';
    const apiUserIds = userIdsEnv.split(',').map((id) => Number(id.trim())).filter(Boolean);
    return { isAuthorized: true, apiUserIds, assignedProfileIds: null };
  }

  // Doctor has access only to their assigned patients
  const assignments = user.publicMetadata?.assignments || [];
  const apiUserIds = Array.from(new Set(assignments.map(a => Number(a.api_user_id))));
  const assignedProfileIds = assignments.map(a => Number(a.profile_id));

  return {
    isAuthorized: true,
    apiUserIds,
    assignedProfileIds,
  };
}

async function apiFetch(path) {
  const url = `${MOBILE_API_BASE_URL}${path}`;
  try {
    const headers = { 'Accept': 'application/json' };
    if (process.env.NEXT_PUBLIC_SERVICE_KEY) {
      headers['X-Service-Key'] = process.env.NEXT_PUBLIC_SERVICE_KEY;
    }

    const res = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      return await res.json();
    }
    if (res.status === 404) {
      return null;
    }

    console.warn(`[MobileAPI] ${path} returned ${res.status}`);
    return null;
  } catch (err) {
    console.error(`[MobileAPI] ${path} error:`, err.message);
    return null;
  }
}

// ── PROFILES ────────────────────────────────────────────────────────────────

/**
 * Get all profiles for a given user.
 * @returns {Promise<Array>} array of profile objects, or empty array
 */
export async function getProfiles(idUser) {
  const data = await apiFetch(`/api/profiles/${idUser}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Get a single profile by id_user and id_profile.
 * @returns {Promise<Object|null>}
 */
export async function getProfile(idUser, idProfile) {
  const profiles = await getProfiles(idUser);
  return profiles.find((p) => Number(p.id) === Number(idProfile)) || null;
}

/**
 * Get full patient details directly from Mobile API dashboard router.
 */
export async function getPatientDetail(profileId) {
  return await apiFetch(`/api/patients/${profileId}`);
}

// ── MEASUREMENTS ────────────────────────────────────────────────────────────

/**
 * Get all measurement history for a profile.
 * Each item: { id, id_user, id_profile, bpm, dia, sys, ihb, mov, datetime }
 */
export async function getMeasurements(idProfile) {
  const data = await apiFetch(`/api/measurements/${idProfile}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Get the latest measurement for a profile.
 */
export async function getLatestMeasurement(idProfile) {
  return await apiFetch(`/api/measurements/${idProfile}/latest`);
}

/**
 * Get all SpO2 measurements for a profile.
 * Each item: { id, id_user, id_profile, spo2, bpm, temperature, blood_sugar, datetime }
 */
export async function getSpo2Measurements(idProfile) {
  const data = await apiFetch(`/api/measurements/${idProfile}/spo2`);
  return Array.isArray(data) ? data : [];
}

/**
 * Get the latest SpO2 measurement for a profile.
 */
export async function getLatestSpo2Measurement(idProfile) {
  return await apiFetch(`/api/measurements/${idProfile}/spo2/latest`);
}

// ── HELPER: clinical status (mirrors Laravel's clinicalStatus) ──────────

export function clinicalStatus(bpm, sys, dia) {
  if (!bpm) return 'Tidak ada data';
  if (bpm > 110 || sys >= 140 || dia >= 90) return 'Critical';
  if (bpm > 100 || bpm < 50 || sys >= 130 || dia >= 80) return 'Warning';
  return 'Normal';
}

// ── COMPOSITE: Get patients with latest vitals ──────────────────────────

/**
 * Fetch all profiles for given user IDs and enrich with latest vitals.
 * Mirrors Laravel's getAssignedPatientsWithLatestVitals().
 *
 * @param {number[]} apiUserIds - array of api_user_id to fetch profiles for
 * @returns {Promise<Array>} enriched patient list
 */
export async function getPatientsWithVitals(apiUserIds) {
  const results = [];

  for (const userId of apiUserIds) {
    const profiles = await getProfiles(userId);

    for (const profile of profiles) {
      const [latest, latestSpo2] = await Promise.all([
        getLatestMeasurement(profile.id),
        getLatestSpo2Measurement(profile.id),
      ]);

      const bpm = latest ? Number(latest.bpm) : null;
      const sys = latest ? Number(latest.sys) : null;
      const dia = latest ? Number(latest.dia) : null;

      // Split name into first_name / last_name for compatibility with PatientList.js
      const nameParts = (profile.name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      results.push({
        id: profile.id,
        uuid: String(profile.id), // use profile id as identifier
        first_name: firstName,
        last_name: lastName,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        tb: profile.tb,
        bb: profile.bb,
        image_url: profile.image_url || null,
        health_data: latest
          ? [
              {
                sys: sys,
                dia: dia,
                bpm: bpm,
                status: clinicalStatus(bpm, sys, dia),
                created_at: latest.datetime,
              },
            ]
          : [],
        spo2_data: latestSpo2 || null,
        latest_spo2: latestSpo2
          ? {
              spo2: latestSpo2.spo2,
              temperature: latestSpo2.temperature,
              blood_sugar: latestSpo2.blood_sugar,
            }
          : null,
      });
    }
  }

  return results;
}
