"use client";
import { useState } from 'react';
import { Search, User, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddProductModal } from '@/components/features/admin/products/AddProductModal';
import { NotificationDropdown } from '@/components/features/admin/NotificationDropdown';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export function AdminHeader({ onSearch, onMenuClick }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Format role for display
  const formatRole = (role?: string) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1).replace('admin', ' Admin');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 gap-2 sm:gap-4">
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

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border">
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
        </div>
      </div>
    </header>
  );
}
