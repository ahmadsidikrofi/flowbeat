import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import "./globals.css";

import { Inter } from 'next/font/google'
import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const poppins = Inter({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] })

export const metadata = {
  title: "Monitor tekanan darah pasien dengan mudah",
  description: "Monitor kesehatan pasien dengan mudah",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`antialiased ${poppins.className} h-screen flex`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
          </header>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 flex flex-col h-full">
              {children}
            </main>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
