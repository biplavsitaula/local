import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to check user role and permissions
 */
export const useRoleAccess = () => {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isUser = user?.role === 'user';
  const canEdit = isSuperAdmin; // Only super admin can perform CRUD
  const canView = isAdmin; // Admin and super admin can view

  return {
    isSuperAdmin,
    isAdmin,
    isUser,
    canEdit,
    canView,
    role: user?.role || 'user',
  };
};


















