import { useState, useMemo, useRef, useEffect, useCallback, type UIEvent, type TouchEvent } from 'react';
import { MenuItem, MenuCategory, DietaryFilter, BottomNavTab, RestaurantInfo } from './types';
import { RESTAURANT_INFO } from './data/menuData';
import { fetchRestaurantAndMenu } from './services/menuService';
import { RestaurantHeader, type SyncConnectionStatus } from './components/RestaurantHeader';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { VegNonVegFilter } from './components/VegNonVegFilter';
import { PopularSection } from './components/PopularSection';
import { MenuSection } from './components/MenuSection';
import { FoodDetail } from './components/FoodDetail';
import { BottomNavigation } from './components/BottomNavigation';
import { ComingSoonModal } from './components/ComingSoonModal';
import { MenuLoadingSkeleton } from './components/MenuLoadingSkeleton';
import { MenuErrorState } from './components/MenuErrorState';
import { LoyaltyPage } from './components/loyalty/LoyaltyPage';
import { ReviewPage } from './components/reviews/ReviewPage';
import { AdminDashboard } from './admin/AdminDashboard';
import { Clock, Search, CheckCircle2, ChevronUp, Database, RefreshCw, ChevronLeft, Gift, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(RESTAURANT_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'sheets' | 'fallback'>('sheets');
  const [connectionStatus, setConnectionStatus] = useState<SyncConnectionStatus>('fresh');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('all');
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<BottomNavTab>('menu');
  const [comingSoonTab, setComingSoonTab] = useState<BottomNavTab | null>(null);

  // Path tracking for dedicated /admin route
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Pull-to-refresh touch tracking
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number | null>(null);

  // Load menu and restaurant data on application start
  const loadData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRetrying(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    const result = await fetchRestaurantAndMenu(forceRefresh);

    if (result.success) {
      setMenuItems(result.menu);
      setRestaurantInfo(result.restaurant);
      setDataSource(result.source);
      setConnectionStatus(result.cached ? 'cached' : 'fresh');
      setFetchError(null);
    } else {
      // If no items are available in state, show error state
      if (menuItems.length === 0) {
        setMenuItems([]);
        setFetchError(result.error || 'Unable to load the menu.');
      }
      setConnectionStatus('offline');
    }
    setIsLoading(false);
    setIsRetrying(false);
  }, [menuItems.length]);

  // Pull-to-refresh gesture handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 0) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;
      if (deltaY > 0) {
        // Natural damping curve
        const distance = Math.min(Math.pow(deltaY, 0.85), 68);
        setPullDistance(distance);
      }
    } else {
      touchStartY.current = null;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance >= 46 && !isRetrying) {
      loadData(true);
    }
    touchStartY.current = null;
    setPullDistance(0);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 5) {
      const progress = (target.scrollTop / maxScroll) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    } else {
      setScrollProgress(0);
    }

    // Show Back to Top after scrolling down past the first two rows of menu items (~280px)
    setShowBackToTop(target.scrollTop > 280);
  }, []);

  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // When switching categories, smoothly scroll back to top of dishes and trigger brief subtle skeleton loader
  useEffect(() => {
    setIsCategoryLoading(true);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setScrollProgress(0);
    }
    const timer = setTimeout(() => {
      setIsCategoryLoading(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Dynamically derive category list directly from API menu data
  const categories = useMemo(() => {
    if (menuItems.length === 0) return ['All'];
    const categoryOrder: string[] = ['All'];
    if (menuItems.some((i) => i.isPopular)) {
      categoryOrder.push('Popular');
    }
    const seen = new Set<string>();
    menuItems.forEach((item) => {
      const cat = item.category?.trim();
      if (cat && cat !== 'All' && cat !== 'Popular' && !seen.has(cat)) {
        seen.add(cat);
        categoryOrder.push(cat);
      }
    });
    return categoryOrder;
  }, [menuItems]);

  // Reset to 'All' if selected category is no longer present in loaded categories
  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  // Filtered menu items based on category, search, and dietary preference (computed locally)
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Dietary filter
      if (dietaryFilter === 'veg' && !item.isVeg) return false;
      if (dietaryFilter === 'non-veg' && item.isVeg) return false;

      // 2. Category filter
      if (selectedCategory === 'Popular' && !item.isPopular) return false;
      if (
        selectedCategory !== 'All' &&
        selectedCategory !== 'Popular' &&
        item.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesSubCategory = item.subCategory?.toLowerCase().includes(query) ?? false;
        const matchesDescription = item.description.toLowerCase().includes(query);

        return matchesName || matchesCategory || matchesSubCategory || matchesDescription;
      }

      return true;
    });
  }, [menuItems, searchQuery, selectedCategory, dietaryFilter]);

  // Pre-calculate category item counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      if (cat === 'All') {
        counts[cat] = menuItems.length;
      } else if (cat === 'Popular') {
        counts[cat] = menuItems.filter((i) => i.isPopular).length;
      } else {
        counts[cat] = menuItems.filter(
          (i) => i.category.toLowerCase() === cat.toLowerCase()
        ).length;
      }
    }
    return counts;
  }, [categories, menuItems]);

  // Popular items list
  const popularItems = useMemo(() => {
    return menuItems.filter((i) => i.isPopular);
  }, [menuItems]);

  // Dietary counts for the filter bar
  const { vegCount, nonVegCount, totalCount } = useMemo(() => {
    let veg = 0;
    let nonVeg = 0;
    const baseItems =
      selectedCategory === 'All'
        ? menuItems
        : selectedCategory === 'Popular'
        ? menuItems.filter((i) => i.isPopular)
        : menuItems.filter(
            (i) => i.category.toLowerCase() === selectedCategory.toLowerCase()
          );

    for (const item of baseItems) {
      if (item.isVeg) veg++;
      else nonVeg++;
    }
    return { vegCount: veg, nonVegCount: nonVeg, totalCount: baseItems.length };
  }, [menuItems, selectedCategory]);

  const handleResetSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setDietaryFilter('all');
  };

  const handleBottomTabSelect = (tab: BottomNavTab) => {
    if (tab === 'menu') {
      setActiveNavTab('menu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'rewards') {
      setActiveNavTab('rewards');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'review') {
      setActiveNavTab('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setComingSoonTab(tab);
    }
  };

  // Phase 6: Dedicated Owner Dashboard Route (/admin)
  if (currentPath.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  return (
    <div
      className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden p-0 sm:py-8 sm:px-4"
      style={{
        backgroundImage:
          'radial-gradient(circle at 10% 20%, rgba(255, 99, 33, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 40%)',
      }}
    >
      <div className="flex items-center justify-center w-full max-w-5xl">
        {/* Mobile App Frame / Screen */}
        <div className="w-full sm:w-[410px] min-h-screen sm:min-h-[850px] sm:max-h-[92vh] bg-white sm:rounded-[3rem] shadow-2xl relative sm:border-[8px] sm:border-slate-900 overflow-hidden flex flex-col">
          {/* Subtle phone speaker notch at top on desktop */}
          <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-b-2xl z-40 pointer-events-none" />

          {/* Scroll progress indicator */}
          <div
            className="w-full h-[3px] bg-slate-100/70 overflow-hidden shrink-0 z-50 relative"
            role="progressbar"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Menu scroll progress"
          >
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-[width] duration-100 ease-out shadow-[0_0_8px_rgba(249,115,22,0.5)] rounded-r-full"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Main Viewport Content */}
          {activeNavTab === 'rewards' ? (
            /* Phase 4: Customer Loyalty & Verified Visits Viewport */
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col relative bg-stone-50/80 pb-20">
              {/* Top Navigation Bar */}
              <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveNavTab('menu')}
                    className="p-1 -ml-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Back to menu"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-sm font-bold text-stone-900 leading-tight">Customer Rewards</h1>
                    <p className="text-[11px] text-stone-500">{restaurantInfo.name}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>5 Visits = ₹50 OFF</span>
                </div>
              </div>

              <LoyaltyPage onBackToMenu={() => setActiveNavTab('menu')} />
            </div>
          ) : activeNavTab === 'review' ? (
            /* Phase 5: Google Review Integration & One-Click Review Flow */
            <ReviewPage
              onBackToMenu={() => setActiveNavTab('menu')}
              restaurantId={restaurantInfo.restaurantId || 'mirch-masala-01'}
            />
          ) : isLoading ? (
            /* Slow loading skeleton */
            <MenuLoadingSkeleton />
          ) : fetchError && menuItems.length === 0 ? (
            /* Safe error state with retry button */
            <MenuErrorState
              onRetry={() => loadData(true)}
              isRetrying={isRetrying}
            />
          ) : (
            /* Full Menu Viewport */
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col relative bg-slate-50/50"
            >
              {/* Pull-to-refresh Visual Indicator */}
              <div
                className="overflow-hidden transition-[height,opacity] duration-150 ease-out flex items-center justify-center bg-orange-50/80 border-b border-orange-100/70 text-orange-700 text-xs font-semibold shrink-0"
                style={{
                  height: isRetrying ? '40px' : `${pullDistance}px`,
                  opacity: isRetrying || pullDistance > 0 ? 1 : 0,
                }}
              >
                <div className="flex items-center gap-2 py-1.5">
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-orange-600 transition-transform ${
                      isRetrying
                        ? 'animate-spin'
                        : pullDistance >= 46
                        ? 'rotate-180'
                        : ''
                    }`}
                  />
                  <span className="text-[11px]">
                    {isRetrying
                      ? 'Syncing menu with Google Sheets...'
                      : pullDistance >= 46
                      ? 'Release to refresh'
                      : 'Pull down to refresh'}
                  </span>
                </div>
              </div>

              {/* Restaurant Header */}
              <RestaurantHeader
                restaurant={restaurantInfo}
                connectionStatus={connectionStatus}
              />

              {/* Sticky Search Bar */}
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={(q) => setSearchQuery(q)}
                resultCount={filteredItems.length}
                isFiltering={Boolean(searchQuery.trim())}
              />

              {/* Horizontal Category Navigation */}
              <CategoryTabs
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  if (searchQuery.trim()) {
                    setSearchQuery('');
                  }
                }}
                categoryItemCounts={categoryCounts}
              />

              {/* Dietary Filter Bar (All / Pure Veg / Non-Veg) */}
              <VegNonVegFilter
                activeFilter={dietaryFilter}
                onChange={setDietaryFilter}
                vegCount={vegCount}
                nonVegCount={nonVegCount}
                totalCount={totalCount}
              />

              {/* Main Dishes Area */}
              <main className="flex-1 pb-24">
                {/* Popular Today Section (Only visible on All category, when not searching, and when popular items exist) */}
                {selectedCategory === 'All' && !searchQuery.trim() && dietaryFilter === 'all' && popularItems.length > 0 && (
                  <PopularSection
                    popularItems={popularItems}
                    onSelectItem={(item) => setSelectedFoodItem(item)}
                  />
                )}

                {/* Menu Dishes List */}
                <MenuSection
                  items={filteredItems}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  onSelectItem={(item) => setSelectedFoodItem(item)}
                  onResetSearch={handleResetSearch}
                  isLoading={isCategoryLoading}
                />

                {/* Rate Your Experience Banner */}
                <div className="px-4 pt-2 pb-6">
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Enjoyed your food?</h4>
                      <p className="text-[11px] text-stone-500">Rate your experience & post to Google</p>
                    </div>
                    <button
                      type="button"
                      id="btn-banner-rate-us"
                      onClick={() => {
                        setActiveNavTab('review');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
                    >
                      Rate Us
                    </button>
                  </div>
                </div>
              </main>

            </div>
          )}

          {/* Floating Back to Top Button */}
          <AnimatePresence>
            {showBackToTop && !isLoading && (
              <motion.button
                id="back-to-top-btn"
                type="button"
                onClick={scrollToTop}
                initial={{ opacity: 0, scale: 0.7, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Back to top"
                className="absolute bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md shadow-[0_8px_20px_-4px_rgba(15,23,42,0.35)] border border-white/20 flex items-center justify-center transition-colors group cursor-pointer"
              >
                <ChevronUp className="w-5 h-5 text-orange-400 group-hover:text-white transition-colors" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Food Detail Modal / Sheet */}
          <FoodDetail
            item={selectedFoodItem}
            onClose={() => setSelectedFoodItem(null)}
          />

          {/* Coming Soon Modal for other tabs */}
          <ComingSoonModal
            tab={comingSoonTab}
            onClose={() => setComingSoonTab(null)}
          />

          {/* Fixed Mobile Bottom Navigation */}
          <BottomNavigation
            activeTab={activeNavTab}
            onTabSelect={handleBottomTabSelect}
          />
        </div>

        {/* Desktop Side Info Panel */}
        <div className="ml-12 hidden lg:block max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-full mb-4 uppercase tracking-widest shadow-md shadow-amber-600/20">
            <Star className="w-3 h-3 fill-white" />
            <span>Phase 5 — Google Review & Loyalty Sync</span>
          </div>
          <h2 className="text-4xl font-black text-white mb-3 leading-tight tracking-tight">
            Digital Menu &<br />Google Reviews
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Connected to Google Sheets via Google Apps Script for <strong className="text-slate-200">{restaurantInfo.name}</strong> in {restaurantInfo.location}. Features dynamic menu syncing, 10-strike customer rewards, and a compliant one-click Google Review experience.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">One-Click Google Reviews</h4>
                <p className="text-slate-400 text-xs">
                  Rate 1–5 stars, select highlights, write feedback, and seamlessly post to the official Google Business Profile review page.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Customer Loyalty & Rewards</h4>
                <p className="text-slate-400 text-xs">
                  10-visit stamp cycle with staff PIN verification terminal and anti-fraud daily visit limits.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Google Sheets Architecture</h4>
                <p className="text-slate-400 text-xs">
                  Synchronized tabs: <code className="text-orange-300 font-mono text-[10px]">Menu</code>, <code className="text-orange-300 font-mono text-[10px]">Restaurant</code>, <code className="text-orange-300 font-mono text-[10px]">Reviews</code>, <code className="text-orange-300 font-mono text-[10px]">Customers</code>, and <code className="text-orange-300 font-mono text-[10px]">Visits</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-800/60 rounded-3xl border border-slate-700/80 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-white font-bold text-xs uppercase tracking-wider">Phase 5 Compliant Flow</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Customer reviews are stored internally with clear status tracking (<code className="text-emerald-300 font-mono text-[10px]">submitted_internal</code> and <code className="text-blue-300 font-mono text-[10px]">google_redirected</code>). The diner remains in full control of their Google review submission.
            </p>
          </div>

          {/* Phase 6 Owner Portal Access (Desktop Preview Only) */}
          <div className="mt-4 p-4 bg-stone-900/90 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">Restaurant Owner Portal</p>
                <p className="text-stone-400 text-[11px]">Phase 6 Admin Operations (/admin)</p>
              </div>
            </div>
            <a
              href="/admin"
              id="desktop-open-admin-link"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/admin');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              Open /admin
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
