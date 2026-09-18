import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser, AdminRole, AdminPermission, hasPermission, hasRole, canAccessTab, AuthErrorType } from '../types/auth';
import { loginAdmin, fetchCurrentSession, logoutAdmin, getStoredAuthToken } from '../services/adminAuthService';

export interface AdminAuthContextType {
  user: AdminUser | null;
  role: AdminRole | null;
  isOwner: boolean;
  isStaff: boolean;
  isManager: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  restaurantId: string;
  sessionError: string | null;
  login: (credentials: { username: string; password?: string }) => Promise<{ success: boolean; error?: string; errorCode?: AuthErrorType }>;
  logout: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
  hasRole: (allowedRoles: AdminRole[]) => boolean;
  canAccessTab: (tab: string) => boolean;
  clearSessionError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const DEFAULT_RESTAURANT_ID = 'mirch-masala-01';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Restore authenticated session from backend session endpoint
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    const token = getStoredAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchCurrentSession();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setSessionError(null);
      } else {
        setUser(null);
        if (res.errorCode === 'SESSION_EXPIRED') {
          setSessionError('Your session has expired. Please sign in again.');
        } else if (res.errorCode === 'ACCOUNT_DISABLED') {
          setSessionError('Your account has been deactivated. Please contact the restaurant owner.');
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (credentials: {
    username: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string; errorCode?: AuthErrorType }> => {
    setIsLoading(true);
    setSessionError(null);

    try {
      const cleanUsername = (credentials.username || '').trim();
      const cleanPassword = (credentials.password || '').trim();

      if (!cleanUsername) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your username or ID.' };
      }

      if (!cleanPassword) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your password.' };
      }

      const res = await loginAdmin(cleanUsername, cleanPassword);

      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return {
          success: false,
          error: res.error || 'Authentication failed. Please verify your credentials.',
          errorCode: res.errorCode,
        };
      }
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: 'An unexpected authentication error occurred. Please try again.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
      setSessionError(null);
      setIsLoading(false);
      // Ensure Back button cannot access protected page
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/admin');
      }
    }
  };

  const checkPermission = useCallback(
    (permission: AdminPermission): boolean => {
      return hasPermission(user, permission);
    },
    [user]
  );

  const checkRole = useCallback(
    (allowedRoles: AdminRole[]): boolean => {
      return hasRole(user, allowedRoles);
    },
    [user]
  );

  const checkCanAccessTab = useCallback(
    (tab: string): boolean => {
      return canAccessTab(user, tab);
    },
    [user]
  );

  const clearSessionError = () => {
    setSessionError(null);
  };

  const role = user?.role || null;
  const isOwner = !!user && user.isActive && user.role === 'OWNER';
  const isManager = !!user && user.isActive && user.role === 'MANAGER';
  const isStaff = !!user && user.isActive && user.role === 'STAFF';

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role,
        isOwner,
        isManager,
        isStaff,
        isAuthenticated: !!user && user.isActive,
        isLoading,
        restaurantId: user?.restaurantId || DEFAULT_RESTAURANT_ID,
        sessionError,
        login,
        logout,
        hasPermission: checkPermission,
        hasRole: checkRole,
        canAccessTab: checkCanAccessTab,
        clearSessionError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
