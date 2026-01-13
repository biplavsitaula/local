"use client";

import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AdminHeader } from "@/components/features/admin/AdminHeader";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Fixed on left, hidden on mobile */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      
      {/* Main Content Area - Offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header - Fixed at top */}
        <AdminHeader />
        
        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

