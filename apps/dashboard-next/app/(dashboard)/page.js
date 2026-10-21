import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardContainer from "@/components/Dashboard";

export default async function DashboardPage() {
  const user = await currentUser()
  if (user?.publicMetadata?.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div>
      <DashboardContainer />
    </div>
  );
}
