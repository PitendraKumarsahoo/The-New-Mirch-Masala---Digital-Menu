import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  User,
  KeyRound,
  AlertCircle,
  RefreshCw,
  Search,
  Lock,
} from 'lucide-react';
import {
  getAdminStaffAccounts,
  createAdminStaffAccount,
  toggleAdminStaffAccount,
  StaffAccountSummary,
} from '../services/adminService';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminStaffView: React.FC = () => {
  const { user } = useAdminAuth();
  const [staffList, setStaffList] = useState<StaffAccountSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New staff form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'STAFF' | 'MANAGER'>('STAFF');
  const [newTitle, setNewTitle] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminStaffAccounts();
      setStaffList(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleActive = async (staffId: string) => {
    try {
      const res = await toggleAdminStaffAccount(staffId);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.userId === staffId ? { ...s, isActive: !s.isActive } : s))
        );
        setToastMessage(`Staff account ${staffId} status updated successfully.`);
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(res.error || 'Could not update staff status.');
      }
    } catch {
      alert('Network error while updating staff account.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!newUsername.trim() || !newName.trim() || !newPassword.trim()) {
      setFormError('Username, name, and temporary password are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createAdminStaffAccount({
        username: newUsername.trim(),
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        role: newRole,
        title: newTitle.trim() || undefined,
        password: newPassword.trim(),
      });

      if (res.success && res.user) {
        setStaffList((prev) => [...prev, res.user!]);
        setShowAddModal(false);
        setNewUsername('');
        setNewName('');
        setNewEmail('');
        setNewTitle('');
        setNewPassword('');
        setToastMessage('New staff account provisioned securely.');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        setFormError(res.error || 'Failed to create staff account.');
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Staff & Access Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Manage authenticated staff credentials, operational roles, and access status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchStaff}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors cursor-pointer"
            title="Refresh Staff List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search staff by name, username, or role..."
          className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Staff Table / Cards */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-stone-950 text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-4 sm:px-6">Staff Member</th>
                <th className="py-3 px-4">Role & Privileges</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 hidden md:table-cell">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500 text-xs sm:text-sm">
                    {isLoading ? 'Loading staff directory...' : 'No staff accounts found.'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isCurrentUser = user?.userId.toLowerCase() === staff.userId.toLowerCase();
                  return (
                    <tr key={staff.userId} className="hover:bg-stone-800/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{staff.name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-md">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-stone-500">@{staff.userId}</span>
                              {staff.email && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[140px] sm:max-w-none">{staff.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            staff.role === 'OWNER'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : staff.role === 'MANAGER'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-stone-800 text-stone-300 border border-stone-700'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{staff.role}</span>
                        </span>
                        {staff.title && (
                          <span className="block text-[11px] text-stone-500 mt-0.5">{staff.title}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                            staff.isActive
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-red-950/60 text-red-400 border border-red-800/60'
                          }`}
                        >
                          {staff.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Deactivated</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-stone-400">
                        {staff.lastLoginAt ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-500" />
                            <span>{new Date(staff.lastLoginAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-stone-600 italic">Never logged in</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {staff.role !== 'OWNER' && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(staff.userId)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              staff.isActive
                                ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50'
                            }`}
                          >
                            {staff.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Staff Account */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Create Staff Account</h3>
                  <p className="text-xs text-stone-400">Assign role and initial credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  required
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Username (Staff ID)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. ramesh"
                  required
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'STAFF' | 'MANAGER')}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-stone-200"
                  >
                    <option value="STAFF">Staff (Visit Verification)</option>
                    <option value="MANAGER">Manager (Menu & Operations)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Floor Captain"
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh@mirchmasala.com"
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set initial password"
                  required
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
