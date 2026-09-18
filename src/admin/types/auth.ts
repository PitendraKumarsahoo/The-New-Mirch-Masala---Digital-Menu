export type AdminRole = 'OWNER' | 'MANAGER' | 'STAFF';

export type AdminPermission =
  | 'dashboard.view'
  | 'menu.view'
  | 'menu.create'
  | 'menu.update'
  | 'menu.delete'
  | 'menu.toggle'
  | 'customers.view'
  | 'customers.details'
  | 'customers.lookup'
  | 'visits.view'
  | 'visits.verify'
  | 'rewards.view'
  | 'rewards.create'
  | 'rewards.update'
  | 'rewards.toggle'
  | 'rewards.redeem'
  | 'reviews.view'
  | 'reviews.respond'
  | 'settings.view'
  | 'settings.update'
  | 'staff.view'
  | 'staff.manage'
  | 'audit.view';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  OWNER: [
    'dashboard.view',
    'menu.view',
    'menu.create',
    'menu.update',
    'menu.delete',
    'menu.toggle',
    'customers.view',
    'customers.details',
    'customers.lookup',
    'visits.view',
    'visits.verify',
    'rewards.view',
    'rewards.create',
    'rewards.update',
    'rewards.toggle',
    'rewards.redeem',
    'reviews.view',
    'reviews.respond',
    'settings.view',
    'settings.update',
    'staff.view',
    'staff.manage',
    'audit.view',
  ],
  MANAGER: [
    'dashboard.view',
    'menu.view',
    'menu.update',
    'menu.toggle',
    'customers.view',
    'customers.lookup',
    'visits.view',
    'visits.verify',
    'rewards.view',
    'rewards.redeem',
    'reviews.view',
    'settings.view',
    'audit.view',
  ],
  STAFF: [
    'visits.view',
    'visits.verify',
    'rewards.redeem',
    'customers.lookup',
  ],
};

export interface AdminUser {
  userId: string;
  restaurantId: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  title?: string;
  permissions?: AdminPermission[];
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: string;
}

export interface AuditLogEntry {
  logId: string;
  restaurantId: string;
  userId: string;
  userName: string;
  role: AdminRole;
  action: string;
  targetType: string;
  targetId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type AuthErrorType =
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'ACCOUNT_DISABLED'
  | 'SESSION_EXPIRED'
  | 'INVALID_RESTAURANT'
  | 'RESOURCE_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR';

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: AuthErrorType;
}

// Permission checking helpers
export function hasPermission(user: AdminUser | null, permission: AdminPermission): boolean {
  if (!user || !user.isActive) return false;
  const userPermissions = user.permissions || ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

export function hasRole(user: AdminUser | null, allowedRoles: AdminRole[]): boolean {
  if (!user || !user.isActive) return false;
  return allowedRoles.includes(user.role);
}

export function canAccessTab(user: AdminUser | null, tab: string): boolean {
  if (!user || !user.isActive) return false;
  switch (tab) {
    case 'dashboard':
      return hasPermission(user, 'dashboard.view');
    case 'menu':
      return hasPermission(user, 'menu.view');
    case 'customers':
      return hasPermission(user, 'customers.view');
    case 'visits':
      return hasPermission(user, 'visits.view');
    case 'rewards':
      return hasPermission(user, 'rewards.view');
    case 'reviews':
      return hasPermission(user, 'reviews.view');
    case 'settings':
      return hasPermission(user, 'settings.view');
    case 'staff':
      return hasPermission(user, 'staff.view');
    case 'audit':
      return hasPermission(user, 'audit.view');
    default:
      return false;
  }
}
