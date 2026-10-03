import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser, AdminRole, AdminPermission, hasPermission, hasRole, canAccessTab, AuthErrorType } from '../types/auth';
import { loginAdmin, fetchCurrentSession, logoutAdmin, getStoredAuthToken, setStoredAuthToken } from '../services/adminAuthService';
import { auth } from '../../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { signInWithGoogle, signInWithEmail } from '../../services/firebaseAuthService';
import { isAuthorizedAdminEmail, createAdminUserFromFirebaseAuth } from '../config/authorizedAdmins';

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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; unauthorizedEmail?: string }>;
  loginWithFirebaseEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string; unauthorizedEmail?: string }>;
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

  // Restore authenticated session from backend session endpoint or Firebase Auth
  const restoreSession = useCallback(async () => {
    setIsLoading(true);

    // First check if current Firebase Auth user is authorized
    const currentFbUser = auth.currentUser;
    if (currentFbUser?.email) {
      if (isAuthorizedAdminEmail(currentFbUser.email)) {
        const adminUser = createAdminUserFromFirebaseAuth(
          currentFbUser.email,
          currentFbUser.displayName,
          currentFbUser.photoURL
        );
        setUser(adminUser);
        setSessionError(null);
        setIsLoading(false);
        return;
      }
    }

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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser?.email) {
        if (isAuthorizedAdminEmail(fbUser.email)) {
          const adminUser = createAdminUserFromFirebaseAuth(
            fbUser.email,
            fbUser.displayName,
            fbUser.photoURL
          );
          setUser(adminUser);
          setSessionError(null);
          setIsLoading(false);
        } else {
          // Signed in with unauthorized email
          // We do not set user as admin; let AdminLogin show the unauthorized warning overlay
          setIsLoading(false);
        }
      } else {
        // If not logged in via Firebase, check stored token
        restoreSession();
      }
    });

    return () => unsubscribe();
  }, [restoreSession]);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; unauthorizedEmail?: string }> => {
    setIsLoading(true);
    setSessionError(null);

    try {
      const res = await signInWithGoogle();
      if (!res.success || !res.user) {
        setIsLoading(false);
        return { success: false, error: res.error || 'Google sign-in was cancelled or failed.' };
      }

      const email = res.user.email;
      if (!email || !isAuthorizedAdminEmail(email)) {
        setIsLoading(false);
        const err = `Access Denied: ${email || 'This account'} is not an authorized administrator.`;
        setSessionError(err);
        return {
          success: false,
          error: err,
          unauthorizedEmail: email || undefined,
        };
      }

      const adminUser = createAdminUserFromFirebaseAuth(
        email,
        res.user.displayName,
        res.user.photoURL
      );
      setUser(adminUser);
      setStoredAuthToken(`fb_${res.user.uid}`);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || 'Failed to authenticate via Google.';
      setSessionError(msg);
      return { success: false, error: msg };
    }
  };

  const loginWithFirebaseEmail = async (
    emailInput: string,
    passInput: string
  ): Promise<{ success: boolean; error?: string; unauthorizedEmail?: string }> => {
    setIsLoading(true);
    setSessionError(null);

    const cleanEmail = emailInput.trim().toLowerCase();

    // Check authorization first
    if (!isAuthorizedAdminEmail(cleanEmail)) {
      setIsLoading(false);
      const err = `Access Denied: ${cleanEmail} is not in the authorized administrator list.`;
      setSessionError(err);
      return { success: false, error: err, unauthorizedEmail: cleanEmail };
    }

    try {
      const res = await signInWithEmail(cleanEmail, passInput);
      if (!res.success || !res.user) {
        setIsLoading(false);
        return { success: false, error: res.error || 'Invalid email or password.' };
      }

      const adminUser = createAdminUserFromFirebaseAuth(
        cleanEmail,
        res.user.displayName,
        res.user.photoURL
      );
      setUser(adminUser);
      setStoredAuthToken(`fb_${res.user.uid}`);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || 'Authentication failed.';
      setSessionError(msg);
      return { success: false, error: msg };
    }
  };

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
        return { success: false, error: 'Please enter your username, ID or email.' };
      }

      if (!cleanPassword) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your password.' };
      }

      // If username is an authorized email, check authorization
      if (cleanUsername.includes('@') && !isAuthorizedAdminEmail(cleanUsername)) {
        setIsLoading(false);
        return {
          success: false,
          error: `Access Denied: ${cleanUsername} is not an authorized administrator.`,
          errorCode: 'UNAUTHORIZED',
        };
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
      await signOut(auth).catch(() => {});
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
        loginWithGoogle,
        loginWithFirebaseEmail,
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

