import { MapPin, Clock, Star } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';
import { RestaurantInfo } from '../types';

export type SyncConnectionStatus = 'fresh' | 'cached' | 'fallback';

interface RestaurantHeaderProps {
  onOpenInfoModal?: () => void;
  onSelectReview?: () => void;
  restaurant?: RestaurantInfo;
  connectionStatus?: SyncConnectionStatus;
  activeCategory?: string;
  totalItemsCount?: number;
  dataSource?: string;
}

export function RestaurantHeader({
  onOpenInfoModal,
  onSelectReview,
  restaurant = RESTAURANT_INFO,
  connectionStatus = 'fresh',
}: RestaurantHeaderProps) {
  return (
    <header className="w-full px-5 sm:px-6 pt-7 pb-4 bg-white border-b border-slate-100 relative">
      <div className="flex justify-between items-start mb-3">
        {/* Restaurant Avatar / Emblem / Logo */}
        <div className="w-12 h-12 bg-orange-100/90 rounded-2xl flex items-center justify-center border border-orange-200/50 shadow-xs overflow-hidden shrink-0">
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If custom logo image fails, fallback to emblem
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-orange-600 font-black text-xl tracking-tight flex items-center justify-center">
              NM
            </span>
          )}
        </div>

        {/* Status, Timings & Review Pill */}
        <div className="flex items-center gap-1.5">
          {onSelectReview && (
            <button
              type="button"
              id="header-rate-experience-btn"
              onClick={onSelectReview}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-200 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Rate your experience"
            >
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>Rate</span>
            </button>
          )}
          <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>{restaurant.isOpen !== false ? 'Open Now' : 'Closed'}</span>
          </div>
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-400 text-[10px] font-semibold rounded-full border border-slate-100">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{restaurant.timings || '11:00 AM – 10:30 PM'}</span>
          </div>
        </div>
      </div>

      {/* Restaurant Title with subtle Live / Synced indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight tracking-tight uppercase">
          {restaurant.name}
        </h1>

        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border shrink-0 transition-colors ${
            connectionStatus === 'fresh'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : connectionStatus === 'cached'
              ? 'bg-slate-100 text-slate-600 border-slate-200'
              : 'bg-amber-50 text-amber-700 border-amber-200/80'
          }`}
          title={
            connectionStatus === 'fresh'
              ? 'Live: Synced directly with Google Sheets'
              : connectionStatus === 'cached'
              ? 'Cached: Using recently synced local menu data'
              : 'Fallback: Using local menu data'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'fresh'
                ? 'bg-emerald-500 animate-pulse'
                : connectionStatus === 'cached'
                ? 'bg-slate-400'
                : 'bg-amber-500'
            }`}
          />
          <span>
            {connectionStatus === 'fresh'
              ? 'Live'
              : connectionStatus === 'cached'
              ? 'Cached'
              : 'Offline'}
          </span>
        </span>
      </div>

      {/* Subtitle / Location */}
      <p className="text-slate-400 text-[11px] font-medium tracking-wide mt-1 flex items-center gap-1 flex-wrap">
        <span>{restaurant.subtitle}</span>
        <span className="text-slate-300">•</span>
        <span className="inline-flex items-center gap-0.5 text-slate-500 font-semibold">
          <MapPin className="w-3 h-3 text-orange-500" />
          {restaurant.location}
        </span>
      </p>
    </header>
  );
}

