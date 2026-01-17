"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AdminHeader } from "@/components/features/admin/AdminHeader";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/services/auth.service";
import { Loader2, ShieldAlert } from "lucide-react";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If not authenticated, middleware will handle redirect to login
    if (!isAuthenticated) {
      return;
    }

    // Check if user has admin or super_admin role
    if (user && isAdminRole(user.role)) {
      setIsAuthorized(true);
    } else {
      // User is authenticated but not authorized (regular user)
      // Redirect to home page
      router.replace('/');
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message briefly before redirect
  if (!isAuthorized && isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <ShieldAlert className="h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don&apos;t have permission to access the admin area. 
            Only administrators can view this page.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated - let middleware handle it
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on left, hidden on mobile, drawer on mobile */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      
      {/* Main Content Area - No margin needed on desktop since sidebar is static */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header - Fixed at top */}
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
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

