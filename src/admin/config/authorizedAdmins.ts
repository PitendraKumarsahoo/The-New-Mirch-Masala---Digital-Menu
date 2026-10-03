/**
 * Authorized Administrator Accounts Configuration
 * The New Mirch Masala — Restaurant Operations
 * 
 * Only email addresses listed or approved here are authorized
 * to access the /admin route and operations dashboard.
 */

import { AdminRole, AdminPermission, ROLE_PERMISSIONS, AdminUser } from '../types/auth';

export interface AuthorizedAdminConfig {
  email: string;
  name: string;
  role: AdminRole;
  title: string;
  isOwner?: boolean;
}

export const AUTHORIZED_ADMIN_LIST: AuthorizedAdminConfig[] = [
  {
    email: 'kumarpitendra9@gmail.com',
    name: 'Pitendra Kumar',
    role: 'OWNER',
    title: 'Restaurant Owner & Super Admin',
    isOwner: true,
  },
  {
    email: 'admin@mirchmasala.com',
    name: 'Administrator',
    role: 'OWNER',
    title: 'System Administrator',
    isOwner: true,
  },
  {
    email: 'owner@mirchmasala.com',
    name: 'Restaurant Owner',
    role: 'OWNER',
    title: 'Executive Owner',
    isOwner: true,
  },
  {
    email: 'rajesh@mirchmasala.com',
    name: 'Rajesh Sharma',
    role: 'OWNER',
    title: 'Restaurant Owner & General Manager',
    isOwner: true,
  },
  {
    email: 'vikram@mirchmasala.com',
    name: 'Vikram Singh',
    role: 'MANAGER',
    title: 'Floor & Kitchen Manager',
    isOwner: false,
  },
  {
    email: 'pooja@mirchmasala.com',
    name: 'Pooja Verma',
    role: 'STAFF',
    title: 'Cashier & Front Desk Operations',
    isOwner: false,
  },
];

/**
 * Validates whether an email address is authorized for admin portal access
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  
  // Exact match in authorized list
  if (AUTHORIZED_ADMIN_LIST.some((a) => a.email.toLowerCase() === clean)) {
    return true;
  }
  
  // Mirch Masala internal domain emails are authorized
  if (clean.endsWith('@mirchmasala.com')) {
    return true;
  }

  return false;
}

/**
 * Returns the admin config for an email, or defaults to STAFF for unknown authorized domain
 */
export function getAdminConfigForEmail(email: string): AuthorizedAdminConfig {
  const clean = email.trim().toLowerCase();
  const match = AUTHORIZED_ADMIN_LIST.find((a) => a.email.toLowerCase() === clean);
  if (match) return match;

  if (clean.includes('manager')) {
    return {
      email: clean,
      name: clean.split('@')[0],
      role: 'MANAGER',
      title: 'Store Manager',
      isOwner: false,
    };
  }

  if (clean.includes('owner') || clean.includes('admin')) {
    return {
      email: clean,
      name: clean.split('@')[0],
      role: 'OWNER',
      title: 'Restaurant Owner',
      isOwner: true,
    };
  }

  return {
    email: clean,
    name: clean.split('@')[0],
    role: 'STAFF',
    title: 'Restaurant Staff',
    isOwner: false,
  };
}

/**
 * Creates an AdminUser object from a Firebase Auth User
 */
export function createAdminUserFromFirebaseAuth(
  firebaseEmail: string,
  displayName?: string | null,
  photoURL?: string | null
): AdminUser {
  const config = getAdminConfigForEmail(firebaseEmail);
  const permissions = ROLE_PERMISSIONS[config.role];

  return {
    userId: firebaseEmail.toLowerCase(),
    restaurantId: 'mirch-masala-01',
    name: displayName || config.name,
    email: firebaseEmail.toLowerCase(),
    role: config.role,
    title: config.title,
    isActive: true,
    createdAt: new Date().toISOString(),
    permissions,
  };
}
