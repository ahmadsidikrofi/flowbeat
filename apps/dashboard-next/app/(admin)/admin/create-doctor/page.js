'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowLeft, UserPlus, ShieldAlert, Loader2, CheckCircle } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 13,
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

export default function CreateDoctorPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/create-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await res.json()

      if (data.success) {
        const fullName = [data.name].filter(Boolean).join('') || email
        setSuccess(`✓ Akun dokter "${fullName}" berhasil dibuat! Dokter dapat login menggunakan email ${data.email}.`)
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
      } else {
        setError(data.message || 'Gagal membuat akun dokter.')
      }
    } catch (e) {
      setError('Gagal menghubungi server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <AdminHeader title="Buat Akun Dokter Baru — Flowbeat Portal" />

      <div style={{ padding: '32px', flex: 1, maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          <Link href="/admin" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard Admin</Link>
          <ChevronRight style={{ width: 14, height: 14 }} />
          <span style={{ color: '#1e293b', fontWeight: 600 }}>Buat Akun Dokter</span>
        </nav>

        {/* Form Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Card Header */}
          <div style={{
            padding: '24px 32px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(to right, #eff6ff, #f8fafc)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#1d4ed8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UserPlus style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Akun Dokter Baru</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Akun akan langsung aktif dan terdaftar di Flowbeat Portal
              </p>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Success */}
            {success && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '14px 16px', background: '#d1fae5',
                border: '1px solid #a7f3d0', borderRadius: 10,
                fontSize: 13, color: '#065f46', fontWeight: 500,
              }}>
                <CheckCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                <span>{success}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '14px 16px', background: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: 10,
                fontSize: 13, color: '#dc2626', fontWeight: 500,
              }}>
                <ShieldAlert style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {/* First Name + Last Name (row) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>
                  Nama Depan <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Ahmad"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Nama Belakang</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Fauzi"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dr.ahmad@flowbeat.id"
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
                style={inputStyle}
              />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>
                * Password mengikuti kebijakan keamanan Clerk (min. 8 karakter)
              </p>
            </div>

            {/* Role info */}
            <div style={{
              padding: '10px 14px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              fontSize: 12,
              color: '#166534',
            }}>
              <strong>Role otomatis:</strong> Akun ini akan mendapatkan role <code style={{ background: '#dcfce7', padding: '1px 6px', borderRadius: 4 }}>dokter</code> secara otomatis di Clerk.
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9', paddingTop: 20, marginTop: 4,
            }}>
              <Link
                href="/admin"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}
              >
                <ArrowLeft style={{ width: 15, height: 15 }} />
                Kembali
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: loading ? '#93c5fd' : '#1d4ed8',
                  color: '#fff', padding: '10px 22px', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(29, 78, 216, 0.15)',
                  transition: 'background 0.2s',
                }}
              >
                {loading && <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Membuat Akun...' : 'Buat Akun Dokter'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
