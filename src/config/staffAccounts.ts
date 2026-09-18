/**
 * Public Staff Role Display Metadata
 * IMPORTANT: Passwords are NEVER stored in client-side code.
 * Authentication is processed securely by the server-side auth provider.
 */

export interface StaffAccountMeta {
  id: string; // Login ID / username
  name: string;
  role: 'Owner' | 'Manager' | 'Staff';
  title: string;
  badgeColor: string;
}

export const STAFF_METADATA: StaffAccountMeta[] = [
  {
    id: 'rajesh',
    name: 'Rajesh Sharma',
    role: 'Owner',
    title: 'Restaurant Owner',
    badgeColor: 'bg-amber-500 text-white',
  },
  {
    id: 'vikram',
    name: 'Vikram Singh',
    role: 'Manager',
    title: 'Store Manager',
    badgeColor: 'bg-orange-500 text-white',
  },
  {
    id: 'pooja',
    name: 'Pooja Verma',
    role: 'Staff',
    title: 'Cashier & Front Desk Staff',
    badgeColor: 'bg-stone-700 text-white',
  },
];

// Backwards-compatible interface without plaintext passwords
export interface StaffAccount extends StaffAccountMeta {
  password?: string;
}

export const STAFF_ACCOUNTS: StaffAccount[] = STAFF_METADATA;

export function findStaffAccount(id: string): StaffAccount | null {
  const cleanId = (id || '').trim().toLowerCase();
  const staff = STAFF_METADATA.find(
    (s) => s.id.toLowerCase() === cleanId || s.name.toLowerCase().includes(cleanId)
  );
  return staff || null;
}
