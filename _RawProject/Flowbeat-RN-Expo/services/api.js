import Config from '../utils/Config';

async function request(endpoint, options = {}, token) {
  try {
    const BASE_URL = Config.BASE_URL;
    const headers = {
      ...(options.headers || {}),
    };
    if (typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));

      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      if (typeof errorBody.detail === 'string') {
        errorMessage = errorBody.detail;
      } else if (Array.isArray(errorBody.detail)) {
        errorMessage = errorBody.detail.map((err) => `${err.loc?.join('.')} - ${err.msg}`).join(', ');
      } else if (errorBody.detail) {
        errorMessage = JSON.stringify(errorBody.detail);
      } else if (errorBody.message) {
        errorMessage = errorBody.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Tidak dapat terhubung ke server.',
    };
  }
}

// ─── AUTH ────────────────────────────────────────────────

export const authApi = {
  register: (name, email, phone, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    }),

  login: (identifier, password) => {
    const isEmail = identifier.includes('@');
    const payload = isEmail
      ? { email: identifier, password }
      : { phone: identifier, password };

    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ─── PROFILES ───────────────────────────────────────────

export const profileApi = {
  create: (id_user, name, age, gender, tb, bb, token, date_of_birth) => {
    const formData = new FormData();
    formData.append('id_user', String(id_user));
    formData.append('name', name);
    formData.append('age', String(age));
    formData.append('gender', gender);
    formData.append('tb', String(tb));
    formData.append('bb', String(bb));
    if (date_of_birth) {
      formData.append('date_of_birth', date_of_birth);
    }

    return request(`/api/profiles`, {
      method: 'POST',
      body: formData,
    }, token);
  },

  update: (id_profile, data, token) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('age', String(data.umur));
    formData.append('gender', data.gender);
    formData.append('tb', String(data.tinggi_badan));
    formData.append('bb', String(data.berat_badan));
    if (data.tanggal_lahir) {
      formData.append('date_of_birth', data.tanggal_lahir);
    }

    return request(`/api/profiles/${id_profile}`, {
      method: 'PUT',
      body: formData,
    }, token);
  },

  list: (id_user, token) =>
    request(`/api/profiles/${id_user}`, {
      method: 'GET',
    }, token),

  delete: (id_profile, token) =>
    request(`/api/profiles/${id_profile}`, {
      method: 'DELETE',
    }, token),
};

// ─── MEASUREMENTS ───────────────────────────────────────

export const measurementApi = {
  /** Baca data terbaru dari alat Omron via BLE (backend handles BLE connection) */
  readLatestFromDevice: (
    mac_address = Config.DEVICE_MAC,
    device_name = Config.DEVICE_NAME,
    user_index = 0,
  ) =>
    request('/latest-bp-records', {
      method: 'POST',
      body: JSON.stringify({
        mac_address,
        device_name,
        new_records_only: false,
        sync_time: false,
        pairing: false,
        user_index,
      }),
    }),

  /** Simpan hasil pengukuran ke database */
  save: (data, token) =>
    request('/api/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  /** Ambil semua riwayat pengukuran per profil */
  getAll: (id_profile, token) =>
    request(`/api/measurements/${id_profile}`, {
      method: 'GET',
    }, token),

  /** Ambil pengukuran terbaru per profil */
  getLatest: (id_profile, token) =>
    request(`/api/measurements/${id_profile}/latest`, {
      method: 'GET',
    }, token),

  /** Ambil data SpO2 terbaru per profil */
  getLatestSpo2: (id_profile, token) =>
    request(`/api/measurements/${id_profile}/spo2/latest`, {
      method: 'GET',
    }, token),

  /** Ambil semua riwayat SpO2 per profil */
  getAllSpo2: (id_profile, token) =>
    request(`/api/measurements/${id_profile}/spo2`, {
      method: 'GET',
    }, token),

  /** Hapus pengukuran berdasarkan ID */
  delete: (id_measurement, token) =>
    request(`/api/measurements/${id_measurement}`, {
      method: 'DELETE',
    }, token),

  /** Set active session — beri tahu backend siapa yang sedang mengukur SpO2 */
  setActiveSession: (id_user, id_profile, token) =>
    request('/api/measurements/spo2/active-session', {
      method: 'POST',
      body: JSON.stringify({ id_user, id_profile }),
    }, token),
};

// ─── DOCTOR (dari Dashboard RPMS / Laravel) ─────────────

// DASHBOARD_URL dibaca lazy dari Config agar selalu up-to-date

/**
 * Konversi nomor HP format lokal (08xxx) ke format WhatsApp internasional (628xxx).
 */
export function phoneToWhatsApp(phone) {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Buat URL WhatsApp wa.me dengan pesan otomatis.
 */
export function buildWhatsAppUrl(phone, message) {
  const waNumber = phoneToWhatsApp(phone);
  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${waNumber}${encodedMsg}`;
}

export const doctorApi = {
  /** Ambil info dokter pendamping untuk satu profile dari Dashboard RPMS (Laravel) */
  getByProfile: async (profileId) => {
    try {
      const DASHBOARD_URL = Config.DASHBOARD_API_URL;
      const res = await fetch(`${DASHBOARD_URL}/api/doctor/by-profile/${profileId}`);

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errorBody.message || `Error ${res.status}`,
        };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Tidak dapat terhubung ke Dashboard.',
      };
    }
  },
};
