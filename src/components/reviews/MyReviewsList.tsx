import React from 'react';
import { Star, Calendar, ExternalLink, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { Review } from '../../types/review';
import { GoogleReviewButton } from './GoogleReviewButton';

interface MyReviewsListProps {
  reviews: Review[];
  googleReviewUrl?: string;
  isConfigured?: boolean;
  onRedirected?: (reviewId: string) => void;
  onWriteNewReview?: () => void;
}

export const MyReviewsList: React.FC<MyReviewsListProps> = ({
  reviews,
  googleReviewUrl,
  isConfigured,
  onRedirected,
  onWriteNewReview,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'google_redirected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <ExternalLink className="w-3 h-3" />
            <span>Google review page opened</span>
          </span>
        );
      case 'google_failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            <AlertCircle className="w-3 h-3" />
            <span>Google review link unavailable</span>
          </span>
        );
      case 'submitted_internal':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Clock className="w-3 h-3" />
            <span>Submitted on website</span>
          </span>
        );
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-stone-900">No Reviews Yet</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Share your dine-in or takeaway experience at The New Mirch Masala.
          </p>
        </div>
        {onWriteNewReview && (
          <button
            type="button"
            onClick={onWriteNewReview}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Rate Your Experience
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-stone-900">My Past Reviews ({reviews.length})</h3>
        {onWriteNewReview && (
          <button
            type="button"
            onClick={onWriteNewReview}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
          >
            + Write Another
          </button>
        )}
      </div>

      <div className="space-y-3">
        {reviews.map((r) => {
          const canPostOnGoogle =
            r.status === 'submitted_internal' &&
            isConfigured &&
            Boolean(googleReviewUrl);

          return (
            <div
              key={r.reviewId}
              className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-3 transition-all"
            >
              {/* Header: Stars & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-black text-stone-800 ml-1">
                      {r.rating}.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                </div>

                <div>{getStatusBadge(r.status)}</div>
              </div>

              {/* Topics */}
              {r.topics && r.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Feedback comment */}
              {r.feedback && (
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-150">
                  "{r.feedback}"
                </p>
              )}

              {/* Opportunity to post on Google if not yet opened */}
              {canPostOnGoogle && (
                <div className="pt-1">
                  <GoogleReviewButton
                    reviewId={r.reviewId}
                    googleReviewUrl={googleReviewUrl}
                    isConfigured={isConfigured}
                    onRedirected={() => onRedirected && onRedirected(r.reviewId)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
