import axios from 'axios'

/**
 * Mobile API Service — mengakses FastAPI Python backend
 * Meniru pola MobileApiService.php dari Dashboard_RPMS
 *
 * Endpoint yang digunakan:
 *   GET /api/doctor                            → mapping Clerk user → id_user FastAPI
 *   GET /api/profiles/{id_user}               → daftar profile (pasien)
 *   GET /api/profiles/search?phone={phone}    → cari user by nomor telepon
 *   GET /api/measurements/{id_profile}        → semua riwayat pengukuran
 *   GET /api/measurements/{id_profile}/latest → pengukuran terbaru
 *
 * Variabel ENV yang dibutuhkan di .env.local:
 *   NEXT_PUBLIC_MOBILE_API_BASE_URL    → base URL FastAPI
 *   NEXT_PUBLIC_DOCTOR_PROFILE_ENDPOINT → endpoint mapping dokter (default: /api/doctor)
 */

const mobileApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
})

// ── Auth Interceptor (Clerk JWT) ──────────────────────────────────────────────
let mobileInterceptorId = null

export const setupMobileAuthInterceptor = (getToken) => {
    if (mobileInterceptorId !== null) {
        mobileApi.interceptors.request.eject(mobileInterceptorId)
    }
    mobileInterceptorId = mobileApi.interceptors.request.use(
        async (config) => {
            const token = await getToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => Promise.reject(error)
    )
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const mobileApiService = {

    /**
     * Ambil id_user FastAPI dari dokter yang sedang login.
     * Endpoint ini perlu dibuat di backend.
     *
     * Response yang diharapkan dari backend:
     * {
     *   "id_user": 5,
     *   "name": "Dr. Budi",
     *   "email": "budi@email.com"
     * }
     */
    async getDoctorProfile() {
        try {
            const endpoint = process.env.NEXT_PUBLIC_DOCTOR_PROFILE_ENDPOINT || '/api/doctor'
            const res = await mobileApi.get(endpoint)
            return res.data ?? null
        } catch (err) {
            console.warn('[MobileAPI] /api/doctor belum tersedia (offline):', err?.response?.status ?? err?.code)
            return null
        }
    },

    /**
     * Ambil semua profile (pasien) milik satu id_user.
     * Response: [{ id, id_user, name, age, gender, tb, bb, image_url }]
     */
    async getProfiles(idUser) {
        try {
            const res = await mobileApi.get(`/api/profiles/${idUser}`)
            return Array.isArray(res.data) ? res.data : []
        } catch (err) {
            if (err?.response?.status === 404) return []
            console.error('[MobileAPI] getProfiles error:', err?.response?.status)
            return []
        }
    },

    /**
     * Cari user berdasarkan nomor telepon.
     * Response: { id_user, name, phone, profiles: [...] }
     */
    async searchUserByPhone(phone) {
        try {
            const res = await mobileApi.get('/api/profiles/search', { params: { phone } })
            return res.data ?? null
        } catch (err) {
            if (err?.response?.status === 404) return null
            console.error('[MobileAPI] searchUserByPhone error:', err?.response?.status)
            return null
        }
    },

    /**
     * Ambil semua riwayat pengukuran untuk satu profile.
     * Menerjemahkan format FastAPI ke format yang diharapkan frontend (systolic, diastolic, date, created_at, status).
     */
    async getMeasurements(idProfile) {
        try {
            const res = await mobileApi.get(`/api/measurements/${idProfile}`)
            const rawData = Array.isArray(res.data) ? res.data : []
            return rawData.map(item => {
                const sys = item.sys ?? 0
                const dia = item.dia ?? 0
                const bpm = item.bpm ?? 0
                return {
                    ...item,
                    systolic: sys,
                    diastolic: dia,
                    date: item.datetime,
                    created_at: item.datetime ? new Date(item.datetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—',
                    status: this.getClinicalStatus(bpm, sys, dia)
                }
            })
        } catch (err) {
            if (err?.response?.status === 404) return []
            console.error('[MobileAPI] getMeasurements error:', err?.response?.status)
            return []
        }
    },

    /**
     * Ambil pengukuran terbaru untuk satu profile.
     */
    async getLatestMeasurement(idProfile) {
        try {
            const res = await mobileApi.get(`/api/measurements/${idProfile}/latest`)
            const item = res.data ?? null
            if (!item) return null
            const sys = item.sys ?? 0
            const dia = item.dia ?? 0
            const bpm = item.bpm ?? 0
            return {
                ...item,
                systolic: sys,
                diastolic: dia,
                date: item.datetime,
                created_at: item.datetime ? new Date(item.datetime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—',
                status: this.getClinicalStatus(bpm, sys, dia)
            }
        } catch (err) {
            if (err?.response?.status === 404) return null
            console.error('[MobileAPI] getLatestMeasurement error:', err?.response?.status)
            return null
        }
    },

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Hitung status klinis berdasarkan nilai vital.
     * Sama dengan clinicalStatus() di Dashboard_RPMS PatientController.php
     */
    getClinicalStatus(bpm, sys, dia) {
        if (!bpm && !sys) return 'Tidak ada data'
        if (bpm > 110 || sys >= 140 || dia >= 90) return 'Hipertensi Tinggi'
        if (bpm > 100 || bpm < 50 || sys >= 130 || dia >= 80) return 'Normal Tinggi'
        if (sys < 90 || dia < 60) return 'Rendah'
        return 'Normal'
    },

    /**
     * Ambil semua profiles + latest measurement sekaligus.
     * Meniru getAssignedPatientsWithLatestVitals() dari MobileApiService.php
     */
    async getPatientsWithLatestVitals(idUser) {
        const profiles = await this.getProfiles(idUser)
        if (profiles.length === 0) return []

        const results = await Promise.all(
            profiles.map(async (profile) => {
                const latest = await this.getLatestMeasurement(profile.id)
                const bpm = latest?.bpm ?? 0
                const sys = latest?.sys ?? 0
                const dia = latest?.dia ?? 0
                return {
                    ...profile,
                    latest,
                    lastBP: latest ? `${sys}/${dia}` : 'N/A',
                    lastBPM: latest ? `${bpm} BPM` : 'N/A',
                    lastVisit: latest?.datetime ?? null,
                    status: this.getClinicalStatus(bpm, sys, dia),
                }
            })
        )
        return results
    },

    /**
     * Hitung statistik ringkasan dari array pasien (sudah punya latest vitals).
     * Menggantikan endpoint /patients/summary/status dari Laravel CDL.
     */
    computeStats(patients) {
        const total = patients.length
        const withData = patients.filter(p => p.latest !== null)
        const normal = patients.filter(p => p.status === 'Normal').length
        const risk = patients.filter(p => p.status === 'Hipertensi Tinggi').length
        const normalTinggi = patients.filter(p => p.status === 'Normal Tinggi').length
        const rendah = patients.filter(p => p.status === 'Rendah').length

        return {
            total_patient: total,
            normal_patient: normal,
            hyper_patient: risk,
            normal_tinggi: normalTinggi,
            rendah,
            checked_today: withData.length,
            not_checked_today: total - withData.length,
        }
    },
}

export default mobileApiService
