import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin Portal — Flowbeat' }

export default async function AdminLayout({ children }) {
  // Server-side guard: pastikan user adalah admin
  const user = await currentUser()
  const role = user?.publicMetadata?.role
  if (role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex w-screen h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-slate-50">
        {children}
      </main>
    </div>
  )
}
