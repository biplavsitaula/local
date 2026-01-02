"use client";

import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AdminHeader } from "@/components/features/admin/AdminHeader";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen gradient-galaxy">
            <AdminSidebar />
            <div className="ml-64 min-h-screen flex flex-col relative">
              <AdminHeader />
              <main className="flex-1 p-6 overflow-auto relative z-10">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}










