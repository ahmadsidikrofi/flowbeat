'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserCheck, Users, Stethoscope, Plus, UserPlus } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ doctor_count: 0, total_patients: 0 })
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, doctorsRes] = await Promise.all([
          fetch('/api/admin/stats').then(r => r.json()),
          fetch('/api/admin/doctors').then(r => r.json()),
        ])
        if (statsRes.success) setStats(statsRes)
        if (doctorsRes.success) setDoctors(doctorsRes.doctors)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Admin Header */}
      <AdminHeader title="Admin Dashboard — Flowbeat Portal" />

      {/* Main Content Area */}
      <div style={{ padding: '32px', flex: 1, maxWidth: 1200 }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Total Dokter */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 20
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Stethoscope style={{ width: 26, height: 26, color: '#1d4ed8' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 4 }}>Total Dokter</p>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: '#1d4ed8', lineHeight: 1 }}>
                {loading ? '—' : stats.doctor_count}
              </p>
            </div>
          </div>

          {/* Total Pasien */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 20
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Users style={{ width: 26, height: 26, color: '#059669' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 4 }}>Total Pasien</p>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: '#059669', lineHeight: 1 }}>
                {loading ? '—' : stats.total_patients}
              </p>
            </div>
          </div>

          {/* Quick Actions (Aksi Cepat) */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
            borderRadius: 16,
            padding: '24px',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 12
          }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd', marginBottom: 2 }}>Aksi Cepat</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link
                href="/admin/create-doctor"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.12)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
              >
                <UserPlus style={{ width: 14, height: 14 }} />
                Buat Akun Dokter
              </Link>
              <Link
                href="/admin/assign-patient"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.12)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
              >
                <UserCheck style={{ width: 14, height: 14 }} />
                Assign Pasien
              </Link>
            </div>
          </div>
        </div>

        {/* Doctor List Table */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div>
              <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: 16, margin: 0 }}>Daftar Dokter</h3>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 0 }}>Semua akun dokter yang terdaftar di sistem</p>
            </div>
            <Link
              href="/admin/create-doctor"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#1d4ed8',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(29, 78, 216, 0.15)'
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Tambah Dokter
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Nama Dokter</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Email</th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Jumlah Pasien</th>
                  <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      Memuat data...
                    </td>
                  </tr>
                ) : doctors.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      Belum ada akun dokter dengan role &quot;dokter&quot; di Clerk.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doc) => (
                    <tr
                      key={doc.id}
                      style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 12,
                            flexShrink: 0
                          }}>
                            {doc.initials}
                          </div>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{doc.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px', color: '#64748b' }}>{doc.email}</td>
                      <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: doc.patient_count > 0 ? '#d1fae5' : '#f1f5f9',
                          color: doc.patient_count > 0 ? '#065f46' : '#94a3b8'
                        }}>
                          <Users style={{ width: 11, height: 11 }} />
                          {doc.patient_count} pasien
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                        <Link
                          href="/admin/assign-patient"
                          style={{ color: '#1d4ed8', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                        >
                          Assign Pasien
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
