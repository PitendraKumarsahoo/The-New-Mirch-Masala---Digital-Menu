import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  FileText,
  Activity,
  Calendar,
} from 'lucide-react';
import { getAdminAuditLogs } from '../services/adminService';
import { AuditLogEntry } from '../types/auth';

export const AdminAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminAuditLogs();
      setLogs(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('failed') || action.includes('blocked')) {
      return 'bg-red-950/60 text-red-400 border border-red-800/60';
    }
    if (action.includes('login') || action.includes('logout')) {
      return 'bg-blue-950/60 text-blue-400 border border-blue-800/60';
    }
    if (action.includes('verify')) {
      return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60';
    }
    if (action.includes('create') || action.includes('update')) {
      return 'bg-amber-950/60 text-amber-400 border border-amber-800/60';
    }
    return 'bg-stone-800 text-stone-300 border border-stone-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-amber-500" />
            <span>Security Audit Log</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Immutable chronological record of administrative operations, logins, and visit verifications
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user, action name, or resource ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-stone-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Audit Actions</option>
          <option value="admin_login">Logins</option>
          <option value="staff_visit_verify">Visit Verifications</option>
          <option value="staff_account_create">Staff Account Created</option>
          <option value="staff_account_toggle">Staff Status Toggled</option>
          <option value="reward_create">Rewards Created</option>
          <option value="restaurant_update">Settings Updated</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-stone-950 text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-4 sm:px-6">Timestamp & ID</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4 hidden lg:table-cell">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500 text-xs sm:text-sm">
                    {isLoading ? 'Loading audit trail...' : 'No audit entries matching filter.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-stone-800/30 transition-colors font-mono text-xs">
                    <td className="py-3.5 px-4 sm:px-6 font-sans">
                      <div className="text-white font-medium text-xs">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-stone-600" />
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span className="text-stone-600">•</span>
                        <span className="font-mono text-[10px] text-stone-500">{log.logId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="text-white font-medium text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{log.userName}</span>
                      </div>
                      <span className="text-[10px] text-amber-400/90 uppercase font-semibold block mt-0.5">
                        {log.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <span className="text-stone-300 font-medium text-xs capitalize">{log.targetType}</span>
                      {log.targetId && (
                        <span className="block text-[11px] font-mono text-stone-500 mt-0.5">{log.targetId}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 hidden lg:table-cell text-stone-400 text-[11px] max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
