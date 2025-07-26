import { SidebarProvider } from "@/components/ui/sidebar";
import "./globals.css";
import { Inter } from 'next/font/google'
import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  ClerkProvider,
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
        <body className={`antialiased ${poppins.className} h-screen flex items-center justify-center`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
