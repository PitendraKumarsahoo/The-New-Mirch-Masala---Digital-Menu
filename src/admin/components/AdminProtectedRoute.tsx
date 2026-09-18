import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminPermission, AdminRole } from '../types/auth';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
  allowedRoles?: AdminRole[];
  tabName?: string;
  onNavigateFallback?: () => void;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requiredPermission,
  allowedRoles,
  tabName,
  onNavigateFallback,
}) => {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-stone-300 text-sm font-semibold">Validating Session Authority...</p>
          <p className="text-stone-500 text-xs mt-1">Verifying role permissions and restaurant isolation</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AdminLogin />;
  }

  // Check role restrictions if specified
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 text-stone-100">
        <div className="w-full max-w-md bg-stone-900 border border-red-900/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-red-950 text-red-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-red-800/60">
              Access Denied (403 Forbidden)
            </span>
            <h2 className="text-xl font-bold text-white">Restricted Area</h2>
            <p className="text-sm text-stone-400 mt-2 leading-relaxed">
              You don't have permission to access this page ({tabName || 'Admin Area'}). Your role ({user.role}) has limited operational privileges.
            </p>
          </div>

          <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 text-left text-xs space-y-1.5 text-stone-400">
            <p><span className="text-stone-300 font-semibold">User:</span> {user.name} ({user.role})</p>
            <p><span className="text-stone-300 font-semibold">Restaurant:</span> {user.restaurantId}</p>
            <p><span className="text-stone-300 font-semibold">Status:</span> Active Session</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {onNavigateFallback && (
              <button
                type="button"
                id="btn-access-denied-return"
                onClick={onNavigateFallback}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Allowed Section</span>
              </button>
            )}
            <button
              type="button"
              id="btn-access-denied-logout"
              onClick={() => logout()}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check specific permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 text-stone-100">
        <div className="w-full max-w-md bg-stone-900 border border-amber-900/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-amber-950 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-amber-800/60">
              Permission Required
            </span>
            <h2 className="text-xl font-bold text-white">Feature Unauthorized</h2>
            <p className="text-sm text-stone-400 mt-2 leading-relaxed">
              You don't have permission to access this page. This action requires the <code className="text-amber-400 bg-stone-950 px-1.5 py-0.5 rounded text-xs">{requiredPermission}</code> capability.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {onNavigateFallback && (
              <button
                type="button"
                id="btn-perm-denied-return"
                onClick={onNavigateFallback}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Allowed Section</span>
              </button>
            )}
            <button
              type="button"
              id="btn-perm-denied-logout"
              onClick={() => logout()}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
