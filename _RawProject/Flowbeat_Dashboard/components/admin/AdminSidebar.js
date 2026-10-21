'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UserCheck, Shield, UserPlus, LogOut, ExternalLink } from 'lucide-react'
import { SignOutButton, useUser } from '@clerk/nextjs'

const navItems = [
  { href: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard },
  { href: '/admin/create-doctor', label: 'Buat Akun Dokter', icon: UserPlus },
  { href: '/admin/assign-patient', label: 'Assign Pasien', icon: UserCheck },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <aside style={{
      width: 260,
      height: '100%',
      background: '#fff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
        }}>
          <Shield style={{ height: 20, width: 20, color: '#fff' }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1d4ed8', lineHeight: 1.2 }}>Flowbeat Admin</p>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 500, marginTop: 2 }}>Control Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? '#1d4ed8' : '#64748b',
                background: active ? '#eff6ff' : 'transparent',
                textDecoration: 'none',
                borderLeft: active ? '3px solid #1d4ed8' : '3px solid transparent',
                paddingLeft: active ? 13 : 16,
                transition: 'all 0.15s'
              }}
              onMouseOver={e => {
                if (!active) {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#1e293b'
                }
              }}
              onMouseOut={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748b'
                }
              }}
            >
              <Icon style={{ height: 16, width: 16, flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            color: '#64748b',
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <ExternalLink style={{ height: 14, width: 14 }} />
          Lihat Dashboard Dokter
        </Link>

        <SignOutButton>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            color: '#64748b',
            background: 'none',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut style={{ height: 14, width: 14 }} />
            Logout
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
