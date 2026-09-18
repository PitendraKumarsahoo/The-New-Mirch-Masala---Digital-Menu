import {
  AdminUser,
  AdminSession,
  AuthResponse,
  AuthErrorType,
  AdminRole,
  AdminPermission,
  hasPermission,
  hasRole,
  canAccessTab,
} from '../types/auth';

const TOKEN_STORAGE_KEY = 'mirch_admin_auth_token_v2';

let inMemoryToken: string | null = null;

export function getStoredAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    } catch {
      // ignore storage errors
    }
  }
  return null;
}

export function setStoredAuthToken(token: string | null): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }
}

export function clearStoredAuthToken(): void {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      // Clean up any legacy session keys
      sessionStorage.removeItem('mirch_admin_session_token_v1');
      sessionStorage.removeItem('mirch_staff_account');
      sessionStorage.removeItem('mirch_admin_redirect_after_login');
    } catch {
      // ignore
    }
  }
}

// ----------------------------------------------------------------------
// Role & Permission Inspection Helpers
// ----------------------------------------------------------------------

export function isOwner(user: AdminUser | null): boolean {
  return !!user && user.isActive && user.role === 'OWNER';
}

export function isManager(user: AdminUser | null): boolean {
  return !!user && user.isActive && user.role === 'MANAGER';
}

export function isStaff(user: AdminUser | null): boolean {
  return !!user && user.isActive && user.role === 'STAFF';
}

export function isAuthorizedRole(user: AdminUser | null, allowedRoles: AdminRole[]): boolean {
  return hasRole(user, allowedRoles);
}

export function checkUserPermission(user: AdminUser | null, permission: AdminPermission): boolean {
  return hasPermission(user, permission);
}

export function checkTabAccess(user: AdminUser | null, tab: string): boolean {
  return canAccessTab(user, tab);
}

export function isRestaurantAuthorized(user: AdminUser | null, restaurantId: string): boolean {
  if (!user || !user.isActive) return false;
  return user.restaurantId.toLowerCase() === (restaurantId || 'mirch-masala-01').toLowerCase();
}

// ----------------------------------------------------------------------
// Authentication API Requests
// ----------------------------------------------------------------------

export async function loginAdmin(
  username: string,
  password?: string
): Promise<AuthResponse<{ user: AdminUser; token: string; expiresAt: string }>> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password ? password.trim() : '',
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success && data.session) {
      const session: AdminSession = data.session;
      setStoredAuthToken(session.token);
      return {
        success: true,
        data: {
          user: session.user,
          token: session.token,
          expiresAt: session.expiresAt,
        },
      };
    }

    const errorCode: AuthErrorType = data.errorCode || (res.status === 403 ? 'ACCOUNT_DISABLED' : 'UNAUTHORIZED');
    return {
      success: false,
      error: data.error || 'Invalid credentials. Please verify your username and password.',
      errorCode,
    };
  } catch {
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      errorCode: 'NETWORK_ERROR',
    };
  }
}

export async function fetchCurrentSession(): Promise<AuthResponse<{ user: AdminUser; expiresAt: string }>> {
  const token = getStoredAuthToken();
  if (!token) {
    return {
      success: false,
      error: 'No active session token.',
      errorCode: 'UNAUTHENTICATED',
    };
  }

  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success && data.user) {
      return {
        success: true,
        data: {
          user: data.user,
          expiresAt: data.expiresAt,
        },
      };
    }

    // If token invalid, clear it
    clearStoredAuthToken();
    const errorCode: AuthErrorType = data.errorCode || (res.status === 401 ? 'SESSION_EXPIRED' : 'UNAUTHENTICATED');
    return {
      success: false,
      error: data.error || 'Your session has expired. Please sign in again.',
      errorCode,
    };
  } catch {
    return {
      success: false,
      error: 'Network error while validating session.',
      errorCode: 'NETWORK_ERROR',
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  const token = getStoredAuthToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // proceed with local cleanup regardless
    }
  }
  clearStoredAuthToken();
}

