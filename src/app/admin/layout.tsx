import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AdminHeader } from "@/components/features/admin/AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-flame-red to-flame-orange">
      <AdminSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">{children}test</main>
      </div>
    </div>
  );
}
