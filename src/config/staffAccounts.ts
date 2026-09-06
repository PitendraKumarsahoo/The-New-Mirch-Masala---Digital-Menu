export interface StaffAccount {
  id: string; // Login ID / username
  name: string;
  role: 'Owner' | 'Manager' | 'Staff';
  password: string;
  title: string;
  badgeColor: string;
}

export const STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'rajesh',
    name: 'Rajesh Sharma',
    role: 'Owner',
    password: 'mirchowner123',
    title: 'Restaurant Owner',
    badgeColor: 'bg-amber-500 text-white',
  },
  {
    id: 'vikram',
    name: 'Vikram Singh',
    role: 'Manager',
    password: 'mirchmanager123',
    title: 'Store Manager',
    badgeColor: 'bg-orange-500 text-white',
  },
  {
    id: 'pooja',
    name: 'Pooja Verma',
    role: 'Staff',
    password: 'mirchstaff123',
    title: 'Cashier & Front Desk Staff',
    badgeColor: 'bg-stone-700 text-white',
  },
];

export function findStaffAccount(id: string, password?: string): StaffAccount | null {
  const cleanId = (id || '').trim().toLowerCase();
  const staff = STAFF_ACCOUNTS.find(
    (s) => s.id.toLowerCase() === cleanId || s.name.toLowerCase().includes(cleanId)
  );
  if (!staff) return null;
  if (password !== undefined) {
    if (staff.password !== password.trim()) return null;
  }
  return staff;
}
