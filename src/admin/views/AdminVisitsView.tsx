import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
  Download,
} from 'lucide-react';
import { AdminVisitRecord } from '../../types/admin';

interface AdminVisitsViewProps {
  visits: AdminVisitRecord[];
  activeFilter: 'today' | 'yesterday' | 'week' | 'month' | 'all';
  onChangeFilter: (filter: 'today' | 'yesterday' | 'week' | 'month' | 'all') => void;
}

export const AdminVisitsView: React.FC<AdminVisitsViewProps> = ({
  visits,
  activeFilter,
  onChangeFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVisits = useMemo(() => {
    if (!searchQuery.trim()) return visits;
    const q = searchQuery.toLowerCase();
    return visits.filter(
      (v) =>
        (v.customerName && v.customerName.toLowerCase().includes(q)) ||
        (v.mobile && v.mobile.includes(q)) ||
        v.customerId.toLowerCase().includes(q) ||
        v.verifiedBy.toLowerCase().includes(q)
    );
  }, [visits, searchQuery]);

  // Export CSV functionality for restaurant owner reporting
  const handleExportCsv = () => {
    const headers = ['Visit ID', 'Customer ID', 'Customer Name', 'Mobile', 'Date', 'Time', 'Verified By', 'Status'];
    const rows = filteredVisits.map((v) => [
      v.visitId,
      v.customerId,
      `"${v.customerName || ''}"`,
      v.mobile || '',
      v.visitDate,
      v.visitTime,
      `"${v.verifiedBy}"`,
      v.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mirch_masala_visits_${activeFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            <span>Customer Visit Logs</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real-time verified dining check-ins recorded by waitstaff and front desk.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-950 border border-stone-800 rounded-xl">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'week', label: 'Last 7 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChangeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diner name, phone, or staff..."
              className="w-full pl-10 pr-4 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
          <span>
            Showing <strong className="text-stone-200">{filteredVisits.length}</strong> visits
          </span>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-amber-400 hover:underline cursor-pointer">
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/50 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Visit ID</th>
                <th className="py-3 px-4 font-semibold">Customer Name</th>
                <th className="py-3 px-4 font-semibold">Mobile</th>
                <th className="py-3 px-4 font-semibold">Visit Date</th>
                <th className="py-3 px-4 font-semibold">Visit Time</th>
                <th className="py-3 px-4 font-semibold">Verified By</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-200">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No visits found for this selection.</p>
                    <p className="text-xs mt-1">Try switching date range filter or checking staff terminal.</p>
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.visitId} className="hover:bg-stone-850/50 transition-colors">
                    {/* Visit ID */}
                    <td className="py-3 px-4 font-mono text-xs text-stone-400">{v.visitId}</td>

                    {/* Customer Name */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-stone-100 text-sm">
                          {v.customerName || v.customerId}
                        </p>
                        <p className="text-[11px] font-mono text-stone-500">{v.customerId}</p>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="py-3 px-4 font-mono text-stone-300">{v.mobile || '—'}</td>

                    {/* Visit Date */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-500/80" />
                        <span>{v.visitDate}</span>
                      </div>
                    </td>

                    {/* Visit Time */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{v.visitTime}</span>
                      </div>
                    </td>

                    {/* Verified By */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-stone-200">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{v.verifiedBy}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{v.status || 'VERIFIED'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
