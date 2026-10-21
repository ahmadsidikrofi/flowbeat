'use client'

import { useUser } from '@clerk/nextjs'

export default function AdminHeader({ title = 'Admin Dashboard — Flowbeat Portal' }) {
  const { user } = useUser()
  
  const displayName = user?.fullName || 'Admin Flowbeat'
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'A'

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 70,
      flexShrink: 0
    }}>
      {/* Title */}
      <h2 style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 700,
        color: '#334155'
      }}>
        {title}
      </h2>

      {/* User Block */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <div style={{
          textAlign: 'right'
        }}>
          <p style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            color: '#1e293b',
            lineHeight: 1.2
          }}>
            {displayName}
          </p>
          <p style={{
            margin: 0,
            fontSize: 10,
            color: '#94a3b8',
            marginTop: 1
          }}>
            Administrator
          </p>
        </div>

        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#1d4ed8',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700
        }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
