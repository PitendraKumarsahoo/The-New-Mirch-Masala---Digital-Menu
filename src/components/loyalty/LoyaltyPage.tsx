import React, { useState, useEffect } from 'react';
import { Customer, LoyaltyStatus, Visit } from '../../types';
import {
  getCustomerSession,
  clearCustomerSession,
  getLoyaltyStatus,
} from '../../services/loyaltyService';
import { LoyaltyRegistration } from './LoyaltyRegistration';
import { LoyaltyDashboard } from './LoyaltyDashboard';
import { StaffVerification } from './StaffVerification';
import { ShieldCheck, Lock, ChevronLeft } from 'lucide-react';
import { StaffAccount } from '../../config/staffAccounts';

interface LoyaltyPageProps {
  onBackToMenu?: () => void;
  customer?: Customer | null;
  loyalty?: LoyaltyStatus | null;
  onLogout?: () => void;
  onCustomerUpdated?: (customer: Customer, loyalty: LoyaltyStatus) => void;
  onStaffLoginSuccess?: (staff: StaffAccount) => void;
}

export const LoyaltyPage: React.FC<LoyaltyPageProps> = ({
  onBackToMenu,
  customer: propCustomer,
  loyalty: propLoyalty,
  onLogout: propOnLogout,
  onCustomerUpdated: propOnCustomerUpdated,
  onStaffLoginSuccess: propOnStaffLoginSuccess,
}) => {
  const [internalCustomer, setInternalCustomer] = useState<Customer | null>(propCustomer || null);
  const [internalLoyalty, setInternalLoyalty] = useState<LoyaltyStatus | null>(propLoyalty || null);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(!propCustomer);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffAccount | null>(() => {
    try {
      const saved = sessionStorage.getItem('mirch_staff_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const activeCustomer = propCustomer !== undefined ? propCustomer : internalCustomer;
  const activeLoyalty = propLoyalty !== undefined ? propLoyalty : internalLoyalty;

  useEffect(() => {
    if (propCustomer) {
      setInternalCustomer(propCustomer);
      if (propLoyalty) setInternalLoyalty(propLoyalty);
      setLoading(false);
      return;
    }

    const session = getCustomerSession();
    if (session && session.customerId) {
      getLoyaltyStatus(session.customerId, session.phone, session.restaurantId)
        .then((res) => {
          if (res.success && res.customer && res.loyalty) {
            setInternalCustomer(res.customer);
            setInternalLoyalty(res.loyalty);
            setRecentVisits(res.recentVisits || []);
            if (propOnCustomerUpdated) {
              propOnCustomerUpdated(res.customer, res.loyalty);
            }
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [propCustomer, propLoyalty, propOnCustomerUpdated]);

  const handleRegistrationSuccess = (
    newCustomer: Customer,
    newLoyalty: LoyaltyStatus
  ) => {
    setInternalCustomer(newCustomer);
    setInternalLoyalty(newLoyalty);
    setRecentVisits([]);
    if (propOnCustomerUpdated) {
      propOnCustomerUpdated(newCustomer, newLoyalty);
    }
  };

  const handleLogout = () => {
    clearCustomerSession();
    setInternalCustomer(null);
    setInternalLoyalty(null);
    setRecentVisits([]);
    if (propOnLogout) {
      propOnLogout();
    }
  };

  const handleCustomerUpdated = (updatedCustomer: Customer, updatedLoyalty: LoyaltyStatus) => {
    setInternalCustomer(updatedCustomer);
    setInternalLoyalty(updatedLoyalty);
    if (propOnCustomerUpdated) {
      propOnCustomerUpdated(updatedCustomer, updatedLoyalty);
    }
    // Reload recent visits
    getLoyaltyStatus(updatedCustomer.customerId, updatedCustomer.phone, updatedCustomer.restaurantId).then(
      (res) => {
        if (res.recentVisits) setRecentVisits(res.recentVisits);
      }
    );
  };

  const handleStaffLogin = (staff: StaffAccount) => {
    setActiveStaff(staff);
    setStaffModalOpen(true);
    if (propOnStaffLoginSuccess) {
      propOnStaffLoginSuccess(staff);
    }
  };

  const handleExitStaff = () => {
    try {
      sessionStorage.removeItem('mirch_staff_account');
    } catch {
      // ignore
    }
    setActiveStaff(null);
    setStaffModalOpen(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-500">Loading loyalty strikes...</p>
      </div>
    );
  }

  return (
    <div id="loyalty-page-container" className="px-4 py-4 max-w-lg mx-auto">
      {/* Active Staff Terminal Banner */}
      {activeStaff && (
        <div className="mb-4 p-3 rounded-2xl bg-stone-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{activeStaff.name} ({activeStaff.role})</p>
              <p className="text-[10px] text-stone-400">Staff Verification Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStaffModalOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
            >
              Terminal
            </button>
            <button
              type="button"
              onClick={handleExitStaff}
              className="text-[11px] text-stone-400 hover:text-stone-200 px-2 py-1 transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Main View: Dashboard if logged in, Registration if not */}
      {activeCustomer && activeLoyalty ? (
        <LoyaltyDashboard
          customer={activeCustomer}
          loyalty={activeLoyalty}
          recentVisits={recentVisits}
          onLogout={handleLogout}
          onOpenStaffModal={() => setStaffModalOpen(true)}
          onUpdateData={(c, l, v) => {
            handleCustomerUpdated(c, l);
            setRecentVisits(v);
          }}
        />
      ) : (
        <LoyaltyRegistration
          onSuccess={handleRegistrationSuccess}
          onStaffLoginSuccess={handleStaffLogin}
        />
      )}

      {/* Discreet Staff / Owner Terminal Access */}
      {activeCustomer && (
        <div className="mt-8 pt-4 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-400">
          <span>The New Mirch Masala Loyalty</span>
          <button
            type="button"
            onClick={() => setStaffModalOpen(true)}
            className="hover:text-stone-700 flex items-center gap-1 transition-colors cursor-pointer font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Owner / Staff Verification</span>
          </button>
        </div>
      )}

      {/* Staff Verification Modal */}
      <StaffVerification
        isOpen={staffModalOpen}
        initialStaff={activeStaff}
        onClose={() => {
          setStaffModalOpen(false);
          try {
            const saved = sessionStorage.getItem('mirch_staff_account');
            setActiveStaff(saved ? JSON.parse(saved) : null);
          } catch {
            // ignore
          }
        }}
        prefillCustomer={activeCustomer}
        onCustomerUpdated={handleCustomerUpdated}
      />
    </div>
  );
};
