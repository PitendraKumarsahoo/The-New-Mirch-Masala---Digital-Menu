import React, { useState, useMemo } from 'react';
import {
  Star,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search,
} from 'lucide-react';
import { AdminReviewRecord } from '../../types/admin';

interface AdminReviewsViewProps {
  reviews: AdminReviewRecord[];
  averageRating: number;
}

export const AdminReviewsView: React.FC<AdminReviewsViewProps> = ({
  reviews,
  averageRating,
}) => {
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

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
            Real diner feedback, Google reviews redirection tracking, and rating analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2">
            <span className="text-xs text-stone-400">Average Rating:</span>
            <span className="text-base font-black text-amber-400">{averageRating} ★</span>
          </div>
        </div>
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
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback..."
                className="pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-stone-900 border border-stone-800 text-stone-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-semibold">No reviews found matching the filters.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.reviewId}
              className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-750 transition-colors text-stone-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {rev.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{rev.customerName}</h3>
                    <p className="text-[11px] font-mono text-stone-500">
                      ID: {rev.customerId} • Ref: {rev.reviewId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Star Rating Display */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-1">{rev.rating}.0</span>
                  </div>

                  {/* Submission Date */}
                  <span className="text-xs text-stone-400">{rev.createdAt}</span>
                </div>
              </div>

              {/* Feedback Body */}
              <p className="text-stone-300 text-sm leading-relaxed mb-3">{rev.feedback}</p>

              {/* Topics & Google Status Footer */}
              <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {rev.topics &&
                    rev.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-stone-950 border border-stone-800 text-[11px] text-stone-400"
                      >
                        #{topic}
                      </span>
                    ))}
                </div>

                <div>
                  {rev.status === 'google_redirected' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                      <Sparkles className="w-3 h-3" />
                      Google Maps Review Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-stone-400">
                      Internal Submission
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
