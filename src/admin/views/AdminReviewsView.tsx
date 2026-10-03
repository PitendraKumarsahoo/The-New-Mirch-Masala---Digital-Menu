import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search,
  CupSoda,
  Percent,
  IndianRupee,
  Check,
  Gift,
  Settings,
  Eye,
} from 'lucide-react';
import { AdminReviewRecord } from '../../types/admin';
import { ReviewOfferConfig } from '../../types';
import { getAdminReviewOffer, saveAdminReviewOffer } from '../services/adminService';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminReviewsViewProps {
  reviews: AdminReviewRecord[];
  averageRating: number;
}

export const AdminReviewsView: React.FC<AdminReviewsViewProps> = ({
  reviews,
  averageRating,
}) => {
  const { isOwner, hasPermission } = useAdminAuth();
  const canManageOffers = isOwner || hasPermission('settings.update') || hasPermission('rewards.update');

  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Offer Customization state
  const [reviewOffer, setReviewOffer] = useState<ReviewOfferConfig>({
    isEnabled: true,
    title: 'Google Review Special Perk',
    rewardType: 'free_item',
    rewardValue: 'Free Chilled Cold Drink',
    description: 'Post an authentic review on Google to enjoy 1 Free Cold Drink with your meal!',
    terms: 'Show verified Google review screen to staff before bill generation.',
    badgeText: 'FREE COLD DRINK',
  });
  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [offerSavedNotice, setOfferSavedNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getAdminReviewOffer().then((offer) => {
      if (isMounted && offer) {
        setReviewOffer(offer);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageOffers) return;
    setIsSavingOffer(true);
    try {
      await saveAdminReviewOffer(reviewOffer);
      setOfferSavedNotice(true);
      setTimeout(() => setOfferSavedNotice(false), 3000);
      setIsEditingOffer(false);
    } finally {
      setIsSavingOffer(false);
    }
  };

  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (starFilter !== null) {
      list = list.filter((r) => r.rating === starFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.feedback.toLowerCase().includes(q) ||
          r.topics?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortOrder === 'oldest') {
      list.reverse();
    }

    return list;
  }, [reviews, starFilter, sortOrder, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Customer Reviews & Feedback</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real diner feedback, Google reviews redirection tracking, and customizable review incentives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2">
            <span className="text-xs text-stone-400">Average Rating:</span>
            <span className="text-base font-black text-amber-400">{averageRating} ★</span>
          </div>
        </div>
      </div>

      {/* Review Offer & Perk Customizer (Admin Full Access) */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Google Review Incentive Offer</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    reviewOffer.isEnabled
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  {reviewOffer.isEnabled ? 'OFFER ACTIVE ON /REVIEW' : 'OFFER DISABLED'}
                </span>
                {offerSavedNotice && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Saved to Firestore!
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Reward diners with a Free Cold Drink or bill discount when they post an authentic review on Google.
              </p>
            </div>
          </div>

          {canManageOffers && (
            <button
              onClick={() => setIsEditingOffer(!isEditingOffer)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditingOffer ? 'Hide Offer Editor' : 'Customize Review Offer'}</span>
            </button>
          )}
        </div>

        {/* Live Customer Preview */}
        {!isEditingOffer && (
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                {reviewOffer.rewardType === 'free_item' ? (
                  <CupSoda className="w-4 h-4" />
                ) : reviewOffer.rewardType === 'percentage' ? (
                  <Percent className="w-4 h-4" />
                ) : (
                  <IndianRupee className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 uppercase">
                    {reviewOffer.badgeText || 'SPECIAL PERK'}
                  </span>
                  <span className="text-xs font-bold text-white">{reviewOffer.title}</span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">{reviewOffer.description}</p>
                {reviewOffer.terms && (
                  <p className="text-[10px] text-stone-500 mt-0.5">Note: {reviewOffer.terms}</p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-stone-500 block">Diner Screen Display:</span>
              <span className="text-xs font-mono text-emerald-400">
                {reviewOffer.isEnabled ? '✓ Visible to customers' : '✕ Hidden from customers'}
              </span>
            </div>
          </div>
        )}

        {/* Editable Form */}
        {isEditingOffer && (
          <form onSubmit={handleSaveOffer} className="pt-3 border-t border-stone-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Offer Headline */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Offer Title / Headline
                </label>
                <input
                  type="text"
                  value={reviewOffer.title}
                  onChange={(e) => setReviewOffer({ ...reviewOffer, title: e.target.value })}
                  placeholder="e.g. Google Review Special Perk"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Offer Badge / Reward Text */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Offer Value / Badge
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewOffer.rewardValue}
                    onChange={(e) =>
                      setReviewOffer({
                        ...reviewOffer,
                        rewardValue: e.target.value,
                        badgeText: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. Free Chilled Cold Drink or 10% OFF"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setReviewOffer({
                          ...reviewOffer,
                          rewardType: 'free_item',
                          rewardValue: 'Free Chilled Cold Drink',
                          badgeText: 'FREE COLD DRINK',
                          description: 'Post an authentic review on Google to enjoy 1 Free Cold Drink with your meal!',
                        })
                      }
                      className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 rounded-lg"
                    >
                      🥤 Cold Drink
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReviewOffer({
                          ...reviewOffer,
                          rewardType: 'percentage',
                          rewardValue: '10% OFF Bill',
                          badgeText: '10% OFF',
                          description: 'Share your Google review to receive 10% discount on your dining bill!',
                        })
                      }
                      className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 rounded-lg"
                    >
                      🏷️ 10% OFF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                Description shown to Diners
              </label>
              <textarea
                rows={2}
                value={reviewOffer.description}
                onChange={(e) => setReviewOffer({ ...reviewOffer, description: e.target.value })}
                placeholder="Post your review on Google and show confirmation to staff to claim your free cold drink!"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Terms */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                Redemption Instruction / Terms
              </label>
              <input
                type="text"
                value={reviewOffer.terms || ''}
                onChange={(e) => setReviewOffer({ ...reviewOffer, terms: e.target.value })}
                placeholder="Show verified Google review screen to staff before bill generation."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Enable/Disable Toggle & Save */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewOffer.isEnabled}
                  onChange={(e) => setReviewOffer({ ...reviewOffer, isEnabled: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-stone-950 border-stone-800"
                />
                <span className="text-xs text-stone-200 font-semibold">
                  Enable this offer banner and reward voucher on Customer Review page
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingOffer(false)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingOffer}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSavingOffer ? (
                    'Saving...'
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Offer to Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Filter and Sort Bar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Star Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-950 border border-stone-800 rounded-xl">
            <button
              onClick={() => setStarFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                starFilter === null
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All Stars ({reviews.length})
            </button>

            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const isActive = starFilter === stars;
              return (
                <button
                  key={stars}
                  onClick={() => setStarFilter(stars)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>{stars}</span>
                  <Star className={`w-3 h-3 ${isActive ? 'fill-stone-950 text-stone-950' : 'fill-amber-400 text-amber-400'}`} />
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search feedback or reviewer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3 h-3 text-stone-400" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Review Cards Grid */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl">
          <MessageSquare className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No reviews found</h3>
          <p className="text-xs text-stone-400 mt-1">
            {searchQuery || starFilter !== null
              ? 'Try changing your search term or star filter.'
              : 'Customer reviews will appear here once submitted.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.reviewId}
              className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{rev.customerName || 'Anonymous Diner'}</h4>
                    <span className="text-[11px] text-stone-500">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <span className="text-xs font-black text-amber-400">{rev.rating}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>

                {rev.topics && rev.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rev.topics.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-stone-300 leading-relaxed italic">
                  "{rev.feedback}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>ID: {rev.reviewId.substring(0, 10)}</span>
                <span
                  className={
                    rev.status === 'google_redirected'
                      ? 'text-blue-400 font-medium'
                      : 'text-emerald-400 font-medium'
                  }
                >
                  {rev.status === 'google_redirected' ? 'Google Redirected' : 'Internal Verified'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
