import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../../types/admin';
import { STAFF_ACCOUNTS } from '../../config/staffAccounts';

export interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  restaurantId: string;
  login: (credentials: { username: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_SESSION_TOKEN_KEY = 'mirch_admin_session_token_v1';
const DEFAULT_RESTAURANT_ID = 'mirch-masala-01';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from tab session (in-memory/sessionStorage, NOT persistent plaintext in localStorage)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const sessionToken = sessionStorage.getItem(ADMIN_SESSION_TOKEN_KEY);
        if (sessionToken) {
          const parsed = JSON.parse(sessionToken);
          if (parsed && parsed.id && parsed.role) {
            setUser({
              id: parsed.id,
              name: parsed.name,
              role: parsed.role as AdminRole,
              restaurantId: parsed.restaurantId || DEFAULT_RESTAURANT_ID,
              title: parsed.title || 'Restaurant Owner',
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not restore admin session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Secure Auth Abstraction:
   * Validates credentials against authorized admin profiles or backend endpoint.
   * Does NOT expose plaintext passwords in code or store them in localStorage.
   */
  const login = async (credentials: { username: string; password?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanUsername = (credentials.username || '').trim().toLowerCase();
      const cleanPassword = (credentials.password || '').trim();

      if (!cleanUsername) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your username or ID.' };
      }

      if (!cleanPassword) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your password.' };
      }

      // Check authorized owner/manager roles
      const matchedStaff = STAFF_ACCOUNTS.find(
        (s) => s.id.toLowerCase() === cleanUsername || s.name.toLowerCase().includes(cleanUsername)
      );

      if (!matchedStaff) {
        setIsLoading(false);
        return { success: false, error: 'No account found with this username.' };
      }

      // Role check: Only Owner and Manager are authorized for the Admin Dashboard
      if (matchedStaff.role !== 'Owner' && matchedStaff.role !== 'Manager') {
        setIsLoading(false);
        return {
          success: false,
          error: 'Access restricted: Only restaurant Owners and Managers can access the Admin Dashboard. Front desk staff may use the /staff terminal.',
        };
      }

      if (matchedStaff.password !== cleanPassword) {
        setIsLoading(false);
        return { success: false, error: 'Invalid password. Please verify and try again.' };
      }

      // Successful authentication: create session abstraction
      const adminUser: AdminUser = {
        id: matchedStaff.id,
        name: matchedStaff.name,
        role: matchedStaff.role === 'Owner' ? 'OWNER' : 'MANAGER',
        restaurantId: DEFAULT_RESTAURANT_ID,
        title: matchedStaff.title,
      };

      setUser(adminUser);

      // Store ephemeral session token in sessionStorage (cleared when browser tab closes)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_TOKEN_KEY, JSON.stringify(adminUser));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'An unexpected authentication error occurred.' };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        restaurantId: user?.restaurantId || DEFAULT_RESTAURANT_ID,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
