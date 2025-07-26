// layout yang pakai sidebar
import { AppSidebar } from '@/components/ui/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}