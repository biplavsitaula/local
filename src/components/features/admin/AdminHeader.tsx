"use client";
import { useState, useRef, useEffect } from 'react';
import { Search, User, Menu, LogOut, Settings, ChevronDown, Loader2, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddProductModal } from '@/components/features/admin/products/AddProductModal';
import { NotificationDropdown } from '@/components/features/admin/NotificationDropdown';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import RegisterModal from '@/components/RegisterModal';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export function AdminHeader({ onSearch, onMenuClick }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'superadmin';

  // Format role for display
  const formatRole = (role?: string) => {
    if (!role) return 'User';
    if (role === 'super_admin' || role === 'superadmin') return 'Super Admin';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 gap-2 sm:gap-4 relative z-[100]">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xs sm:max-w-sm md:w-80">
        {/* <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search products, categories..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8 sm:pl-10 bg-secondary/50 border-border text-sm"
        /> */}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2 sm:gap-4">
          <ExportButton />
          <AddProductModal />
        </div>
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border hover:bg-secondary/50 rounded-lg p-1.5 sm:p-2 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{user?.fullName || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">{formatRole(user?.role)}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-gold flex items-center justify-center shrink-0">
              {user?.fullName ? (
                <span className="text-xs sm:text-sm font-bold text-primary-foreground">
                  {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              ) : (
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-2xl z-[9999] overflow-visible">
              {/* User Info (Mobile) */}
              <div className="sm:hidden px-4 py-3 border-b border-border bg-secondary/30 rounded-t-xl">
                <p className="text-sm font-medium text-foreground">{user?.fullName || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-flame-orange mt-1">{formatRole(user?.role)}</p>
              </div>

              {/* Desktop User Info */}
              <div className="hidden sm:block px-4 py-3 border-b border-border bg-secondary/30 rounded-t-xl">
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {/* Add Admin - Only for Super Admin */}
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowRegisterModal(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    Add Admin User
                  </button>
                )}

                <Link
                  href="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer rounded-b-xl"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal for adding new admin users */}
      <RegisterModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => setShowRegisterModal(false)}
        isAdminContext={true}
      />
    </header>
  );
}
