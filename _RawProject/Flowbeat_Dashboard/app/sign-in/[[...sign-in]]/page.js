'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Activity, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.message || 'Email atau password salah.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: '0 16px',
      }}>
        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {/* Card Header */}
          <div style={{
            padding: '32px 32px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            {/* Logo */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}>
              <Activity style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                Flowbeat
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                Remote Patient Monitoring System
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '28px 32px 32px' }}>
            <p style={{ margin: '0 0 24px', fontSize: 14, fontWeight: 600, color: '#334155' }}>
              Masuk ke akun Anda
            </p>

            {/* Error Alert */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                marginBottom: 20,
              }}>
                <AlertCircle style={{ width: 14, height: 14, color: '#ef4444', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 15,
                    height: 15,
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      fontSize: 13,
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      outline: 'none',
                      color: '#1e293b',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 15,
                    height: 15,
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 38px',
                      fontSize: 13,
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      outline: 'none',
                      color: '#1e293b',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: '#94a3b8',
                    }}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 15, height: 15 }} />
                      : <Eye style={{ width: 15, height: 15 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login"
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '11px',
                  background: loading ? '#93c5fd' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8' }}
                onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#2563eb' }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Masuk...
                  </>
                ) : 'Masuk'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 11,
          color: '#94a3b8',
        }}>
          Flowbeat RPMS &copy; {new Date().getFullYear()} &mdash; Universitas Telkom
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}