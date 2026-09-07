import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Calendar,
  Award,
  Phone,
  Eye,
  X,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AdminCustomerSummary, AdminCustomerDetails } from '../../types/admin';
import { getAdminCustomerDetails } from '../services/adminService';

interface AdminCustomersViewProps {
  customers: AdminCustomerSummary[];
}

export const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<AdminCustomerDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.customerId.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleOpenDetails = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsLoadingDetails(true);
    try {
      const details = await getAdminCustomerDetails(customerId);
      setCustomerDetails(details);
    } catch (err) {
      console.warn('Error fetching customer details', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCustomerId(null);
    setCustomerDetails(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Customer Directory & Loyalty Profiles</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Registered diner accounts, check-in history, unlocked rewards, and review submissions.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 font-medium">
          Total Registered: <strong className="text-amber-400">{customers.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, mobile number (+91...), or ID..."
            className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/50 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Mobile</th>
                <th className="py-3 px-4 font-semibold text-center">Total Visits</th>
                <th className="py-3 px-4 font-semibold text-center">Available Rewards</th>
                <th className="py-3 px-4 font-semibold">Last Visit</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No customers found.</p>
                    <p className="text-xs mt-1">Try modifying your search term.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-stone-850/50 transition-colors">
                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-stone-100 text-sm">{c.name}</p>
                        <p className="text-[11px] font-mono text-stone-500">{c.customerId}</p>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="py-3 px-4 font-mono text-stone-300">{c.mobile}</td>

                    {/* Total Visits */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {c.totalVisits} visits
                      </span>
                    </td>

                    {/* Available Rewards */}
                    <td className="py-3 px-4 text-center">
                      {c.availableRewards > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Award className="w-3 h-3" />
                          {c.availableRewards} available
                        </span>
                      ) : (
                        <span className="text-stone-500 text-xs">0 perks</span>
                      )}
                    </td>

                    {/* Last Visit Date */}
                    <td className="py-3 px-4 text-stone-400">
                      {c.lastVisitDate || c.createdAt || 'Recent'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                        {c.status || 'ACTIVE'}
                      </span>
                    </td>

                    {/* View Details Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(c.customerId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Slide-over / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {customerDetails?.customer?.name || 'Customer Profile'}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    ID: {selectedCustomerId} • Mobile: {customerDetails?.customer?.mobile}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseDetails}
                className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {isLoadingDetails ? (
                <div className="py-12 text-center text-stone-400">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p>Loading loyalty records...</p>
                </div>
              ) : (
                <>
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center">
                      <p className="text-[11px] text-stone-400 uppercase font-semibold">Total Visits</p>
                      <p className="text-xl font-bold text-amber-400 mt-1">
                        {customerDetails?.customer?.totalVisits ?? 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center">
                      <p className="text-[11px] text-stone-400 uppercase font-semibold">Current Progress</p>
                      <p className="text-xl font-bold text-white mt-1">
                        {customerDetails?.customer?.currentVisits ?? 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center">
                      <p className="text-[11px] text-stone-400 uppercase font-semibold">Available Rewards</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">
                        {customerDetails?.customer?.availableRewards ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Visit History Section */}
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Visit History</span>
                    </h4>
                    {customerDetails?.visits && customerDetails.visits.length > 0 ? (
                      <div className="border border-stone-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                              <th className="py-2 px-3 font-semibold">Date</th>
                              <th className="py-2 px-3 font-semibold">Time</th>
                              <th className="py-2 px-3 font-semibold">Staff Verified</th>
                              <th className="py-2 px-3 font-semibold text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800/60">
                            {customerDetails.visits.map((v) => (
                              <tr key={v.visitId} className="hover:bg-stone-800/40">
                                <td className="py-2 px-3 font-medium text-stone-200">{v.visitDate}</td>
                                <td className="py-2 px-3 text-stone-400">{v.visitTime}</td>
                                <td className="py-2 px-3 text-stone-300">{v.verifiedBy}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                                    {v.status || 'VERIFIED'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-stone-500 text-xs italic">No visit logs recorded yet.</p>
                    )}
                  </div>

                  {/* Rewards Unlocked & Redeemed */}
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Rewards & Milestones</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {customerDetails?.rewards?.list && customerDetails.rewards.list.length > 0 ? (
                        customerDetails.rewards.list.map((r, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2"
                          >
                            <div>
                              <p className="font-bold text-stone-200 text-xs">{r.rewardName}</p>
                              {r.description && (
                                <p className="text-[11px] text-stone-500 mt-0.5">{r.description}</p>
                              )}
                              {r.unlockedAt && (
                                <p className="text-[10px] text-stone-400 mt-1">Unlocked: {r.unlockedAt}</p>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                r.status === 'AVAILABLE'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-stone-800 text-stone-400'
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-500 text-xs italic sm:col-span-2">
                          No loyalty rewards redeemed yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer Reviews Section */}
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Reviews Submitted</span>
                    </h4>
                    {customerDetails?.reviews && customerDetails.reviews.length > 0 ? (
                      <div className="space-y-2">
                        {customerDetails.reviews.map((rev) => (
                          <div
                            key={rev.reviewId}
                            className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-400 flex items-center gap-1 text-xs">
                                {rev.rating} ★ Rating
                              </span>
                              <span className="text-[11px] text-stone-500">{rev.createdAt}</span>
                            </div>
                            <p className="text-stone-300 text-xs leading-relaxed">{rev.feedback}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-500 text-xs italic">No reviews submitted yet.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-stone-800 flex justify-end shrink-0">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
