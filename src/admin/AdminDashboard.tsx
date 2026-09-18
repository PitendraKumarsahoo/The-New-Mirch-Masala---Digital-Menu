import React, { useState, useEffect, useCallback } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminBottomNav } from './components/AdminBottomNav';
import { Toast, ToastMessage } from './components/Toast';

// Views
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminMenuView } from './views/AdminMenuView';
import { AdminCustomersView } from './views/AdminCustomersView';
import { AdminVisitsView } from './views/AdminVisitsView';
import { AdminRewardsView } from './views/AdminRewardsView';
import { AdminReviewsView } from './views/AdminReviewsView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { AdminStaffView } from './views/AdminStaffView';
import { AdminAuditView } from './views/AdminAuditView';

// Services
import {
  getAdminDashboardStats,
  getAdminMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuAvailability,
  toggleMenuPopular,
  getAdminCustomers,
  getAdminVisits,
  getAdminRewards,
  createAdminReward,
  updateAdminReward,
  toggleAdminReward,
  getAdminReviews,
  getAdminRestaurantSettings,
  updateAdminRestaurantSettings,
} from './services/adminService';

import {
  AdminDashboardStats,
  AdminMenuItem,
  AdminCustomerSummary,
  AdminVisitRecord,
  AdminRewardItem,
  AdminReviewRecord,
  AdminRestaurantSettings,
} from '../types/admin';
import { X, Star, Settings, Award, UserCheck, Activity } from 'lucide-react';

const TAB_FROM_PATH: Record<string, AdminTab> = {
  '/admin': 'dashboard',
  '/admin/': 'dashboard',
  '/admin/menu': 'menu',
  '/admin/customers': 'customers',
  '/admin/visits': 'visits',
  '/admin/rewards': 'rewards',
  '/admin/reviews': 'reviews',
  '/admin/staff': 'staff',
  '/admin/audit': 'audit',
  '/admin/settings': 'settings',
};

const PATH_FROM_TAB: Record<AdminTab, string> = {
  dashboard: '/admin',
  menu: '/admin/menu',
  customers: '/admin/customers',
  visits: '/admin/visits',
  rewards: '/admin/rewards',
  reviews: '/admin/reviews',
  staff: '/admin/staff',
  audit: '/admin/audit',
  settings: '/admin/settings',
};

const AdminDashboardInner: React.FC = () => {
  const { user, canAccessTab } = useAdminAuth();

  // Tab State
  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      return TAB_FROM_PATH[path] || 'dashboard';
    }
    return 'dashboard';
  });

  // Data State
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalCustomers: 128,
    todayVisits: 34,
    totalVisits: 1245,
    activeRewards: 3,
    totalReviews: 96,
    averageRating: 4.6,
    weeklyVisits: 198,
    monthlyVisits: 780,
    newCustomersThisMonth: 42,
    rewardsUnlocked: 88,
    rewardsRedeemed: 64,
    ratingDistribution: { 5: 68, 4: 18, 3: 6, 2: 3, 1: 1 },
    visitsLast7Days: [],
  });

  const [menu, setMenu] = useState<AdminMenuItem[]>([]);
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [visits, setVisits] = useState<AdminVisitRecord[]>([]);
  const [rewards, setRewards] = useState<AdminRewardItem[]>([]);
  const [reviews, setReviews] = useState<AdminReviewRecord[]>([]);
  const [settings, setSettings] = useState<AdminRestaurantSettings>({
    restaurantId: 'mirch-masala-01',
    restaurantName: 'The New Mirch Masala',
    tagline: 'Indian • Chinese • Biryani • Tandoori',
    location: 'Gunupur, Odisha',
    phone: '+91 94370 12345',
    openingTime: '11:00 AM',
    closingTime: '10:30 PM',
    googleReviewUrl: 'https://www.google.com/maps/search/?api=1&query=The+New+Mirch+Masala+Gunupur+Odisha',
    logo: '',
  });

  const [visitFilter, setVisitFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('all');
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    });
  };

  // Sync tab with browser URL history
  const navigateTo = (tab: AdminTab) => {
    setCurrentTab(tab);
    setIsMobileDrawerOpen(false);
    setIsMoreMenuOpen(false);
    if (typeof window !== 'undefined') {
      const targetPath = PATH_FROM_TAB[tab];
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const matched = TAB_FROM_PATH[path] || 'dashboard';
      setCurrentTab(matched);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch initial data
  const loadAllData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);

    try {
      const [fetchedStats, fetchedMenu, fetchedCustomers, fetchedVisits, fetchedRewards, fetchedReviews, fetchedSettings] =
        await Promise.all([
          getAdminDashboardStats(),
          getAdminMenu(),
          getAdminCustomers(),
          getAdminVisits(visitFilter),
          getAdminRewards(),
          getAdminReviews(),
          getAdminRestaurantSettings(),
        ]);

      if (fetchedStats) setStats(fetchedStats);
      if (fetchedMenu) setMenu(fetchedMenu);
      if (fetchedCustomers) setCustomers(fetchedCustomers);
      if (fetchedVisits) setVisits(fetchedVisits);
      if (fetchedRewards) setRewards(fetchedRewards);
      if (fetchedReviews) setReviews(fetchedReviews);
      if (fetchedSettings) setSettings(fetchedSettings);

      if (isManualRefresh) {
        showToast('Data refreshed from Google Sheets.', 'info');
      }
    } catch (err) {
      console.warn('Error loading admin dashboard data', err);
      if (isManualRefresh) {
        showToast('Refresh encountered a problem. Using synced cache.', 'error');
      }
    } finally {
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, [visitFilter]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Refetch visits when date filter changes
  useEffect(() => {
    getAdminVisits(visitFilter).then((res) => {
      if (res) setVisits(res);
    });
  }, [visitFilter]);

  // Menu Handlers
  const handleSaveMenuItem = async (itemData: Omit<AdminMenuItem, 'id'> & { id?: string }) => {
    if (itemData.id) {
      // Update
      const res = await updateMenuItem(itemData as AdminMenuItem);
      if (res.success) {
        setMenu((prev) => prev.map((m) => (m.id === itemData.id ? ({ ...m, ...itemData } as AdminMenuItem) : m)));
        showToast('Menu item updated.');
      }
    } else {
      // Create
      const res = await createMenuItem(itemData);
      if (res.success && res.item) {
        setMenu((prev) => [res.item!, ...prev]);
        showToast('New menu item created.');
      }
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    await deleteMenuItem(id);
    setMenu((prev) => prev.filter((m) => m.id !== id));
    showToast('Menu item removed from catalog.');
  };

  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    await toggleMenuAvailability(id, isAvailable);
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, isAvailable } : m)));
    showToast(isAvailable ? 'Item marked as Available.' : 'Item marked as Out of Stock.');
  };

  const handleTogglePopular = async (id: string, isPopular: boolean) => {
    await toggleMenuPopular(id, isPopular);
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, isPopular } : m)));
    showToast(isPopular ? 'Featured as Popular Chef Special.' : 'Removed from Popular Specials.');
  };

  // Reward Handlers
  const handleSaveReward = async (
    rewardData: Omit<AdminRewardItem, 'rewardId' | 'restaurantId'> & { rewardId?: string }
  ) => {
    if (rewardData.rewardId) {
      await updateAdminReward(rewardData as AdminRewardItem);
      setRewards((prev) =>
        prev.map((r) => (r.rewardId === rewardData.rewardId ? ({ ...r, ...rewardData } as AdminRewardItem) : r))
      );
      showToast('Reward tier updated.');
    } else {
      const res = await createAdminReward(rewardData);
      if (res.success && res.reward) {
        setRewards((prev) => [...prev, res.reward!]);
        showToast('Reward tier created.');
      }
    }
  };

  const handleToggleRewardActive = async (rewardId: string, isActive: boolean) => {
    await toggleAdminReward(rewardId, isActive);
    setRewards((prev) => prev.map((r) => (r.rewardId === rewardId ? { ...r, isActive } : r)));
    showToast(isActive ? 'Reward tier activated.' : 'Reward tier deactivated.');
  };

  // Settings Handlers
  const handleSaveSettings = async (newSettings: AdminRestaurantSettings) => {
    await updateAdminRestaurantSettings(newSettings);
    setSettings(newSettings);
    showToast('Restaurant information updated.');
  };

  // Header Titles
  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Restaurant Operations Dashboard',
      subtitle: `Google Sheets synced • Logged in as ${user?.name || 'Owner'} (${user?.title || 'Administrator'})`,
    },
    menu: {
      title: 'Menu Catalog & Pricing',
      subtitle: `${menu.length} total food items • Instant availability & Chef Specials controls`,
    },
    customers: {
      title: 'Diner Loyalty Directory',
      subtitle: `${customers.length} registered customers • Visit history & reward milestone tracking`,
    },
    visits: {
      title: 'Customer Visit Logs',
      subtitle: `${visits.length} recorded dining check-ins`,
    },
    rewards: {
      title: 'Loyalty Rewards Program',
      subtitle: `${rewards.filter((r) => r.isActive !== false).length} active milestone tiers`,
    },
    reviews: {
      title: 'Diner Reviews & Ratings',
      subtitle: `${reviews.length} feedback submissions • ${stats.averageRating} average rating`,
    },
    staff: {
      title: 'Staff & Access Control',
      subtitle: 'Provision accounts, assign role permissions, and control access status',
    },
    audit: {
      title: 'Security Audit Logs',
      subtitle: 'Immutable chronological record of administrative actions and access events',
    },
    settings: {
      title: 'Restaurant Settings & Profile',
      subtitle: 'Store identity, address, timings, and Google Maps review link',
    },
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col lg:flex-row antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* Desktop Sidebar */}
      <AdminSidebar currentTab={currentTab} onNavigate={navigateTo} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Admin Header */}
        <AdminHeader
          title={tabTitles[currentTab].title}
          subtitle={tabTitles[currentTab].subtitle}
          onRefresh={() => loadAllData(true)}
          isRefreshing={isRefreshing}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          isMobileMenuOpen={isMobileDrawerOpen}
          currentTab={currentTab}
          onNavigate={navigateTo}
        />

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <AdminDashboardView
              stats={stats}
              recentVisits={visits}
              onNavigate={navigateTo}
              onOpenAddDish={() => {
                setCurrentTab('menu');
                setIsAddDishModalOpen(true);
              }}
            />
          )}

          {currentTab === 'menu' && (
            <AdminMenuView
              menu={menu}
              onSaveItem={handleSaveMenuItem}
              onDeleteItem={handleDeleteMenuItem}
              onToggleAvailability={handleToggleAvailability}
              onTogglePopular={handleTogglePopular}
              isAddModalOpen={isAddDishModalOpen}
              onCloseAddModal={() => setIsAddDishModalOpen(false)}
            />
          )}

          {currentTab === 'customers' && <AdminCustomersView customers={customers} />}

          {currentTab === 'visits' && (
            <AdminVisitsView
              visits={visits}
              activeFilter={visitFilter}
              onChangeFilter={setVisitFilter}
            />
          )}

          {currentTab === 'rewards' && (
            <AdminRewardsView
              rewards={rewards}
              onSaveReward={handleSaveReward}
              onToggleActive={handleToggleRewardActive}
            />
          )}

          {currentTab === 'reviews' && (
            <AdminReviewsView
              reviews={reviews}
              averageRating={stats.averageRating}
            />
          )}

          {currentTab === 'staff' && (
            <AdminProtectedRoute requiredPermission="staff.manage" onNavigateFallback={() => navigateTo('dashboard')}>
              <AdminStaffView />
            </AdminProtectedRoute>
          )}

          {currentTab === 'audit' && (
            <AdminProtectedRoute requiredPermission="audit.read" onNavigateFallback={() => navigateTo('dashboard')}>
              <AdminAuditView />
            </AdminProtectedRoute>
          )}

          {currentTab === 'settings' && (
            <AdminProtectedRoute requiredPermission="settings.read" onNavigateFallback={() => navigateTo('dashboard')}>
              <AdminSettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
              />
            </AdminProtectedRoute>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav
        currentTab={currentTab}
        onNavigate={navigateTo}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {/* Mobile "More" Sheet */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-stone-950/80 backdrop-blur-xs lg:hidden">
          <div className="bg-stone-900 border-t border-stone-800 rounded-t-3xl p-5 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-sm">More Management Pages</h3>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {canAccessTab('reviews') && (
              <button
                onClick={() => navigateTo('reviews')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-950 text-left text-sm font-medium text-stone-200 hover:bg-stone-800"
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span>Customer Reviews & Feedback</span>
              </button>
            )}

            {canAccessTab('staff') && (
              <button
                onClick={() => navigateTo('staff')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-950 text-left text-sm font-medium text-stone-200 hover:bg-stone-800"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Staff & Access Management</span>
              </button>
            )}

            {canAccessTab('audit') && (
              <button
                onClick={() => navigateTo('audit')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-950 text-left text-sm font-medium text-stone-200 hover:bg-stone-800"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Security Audit Logs</span>
              </button>
            )}

            {canAccessTab('settings') && (
              <button
                onClick={() => navigateTo('settings')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-950 text-left text-sm font-medium text-stone-200 hover:bg-stone-800"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Restaurant Settings & Profile</span>
              </button>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-950 text-left text-sm font-medium text-stone-400 hover:text-amber-400"
            >
              <span>View Customer Digital Menu (/)</span>
            </a>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-stone-950/80 backdrop-blur-xs lg:hidden">
          <div className="w-72 bg-stone-900 border-r border-stone-800 h-full p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
                <div>
                  <h3 className="font-bold text-white text-sm">The New Mirch Masala</h3>
                  <p className="text-xs text-amber-400">Admin Portal</p>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {(
                  [
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'menu', label: 'Menu Management' },
                    { id: 'customers', label: 'Customers' },
                    { id: 'visits', label: 'Visits' },
                    { id: 'rewards', label: 'Rewards' },
                    { id: 'reviews', label: 'Reviews' },
                    { id: 'staff', label: 'Staff & Access' },
                    { id: 'audit', label: 'Security Audit' },
                    { id: 'settings', label: 'Restaurant Settings' },
                  ] as const
                )
                  .filter((tab) => canAccessTab(tab.id))
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => navigateTo(tab.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        currentTab === tab.id
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800">
              <a
                href="/"
                className="block text-center py-2 bg-stone-800 text-xs text-stone-300 rounded-xl"
              >
                Return to Customer Menu
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminProtectedRoute>
        <AdminDashboardInner />
      </AdminProtectedRoute>
    </AdminAuthProvider>
  );
};

export default AdminDashboard;
