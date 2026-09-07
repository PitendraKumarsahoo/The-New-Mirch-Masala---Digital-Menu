import React, { useState } from 'react';
import { Heart, Copy, Check, Star, ArrowRight, ExternalLink } from 'lucide-react';
import { Review } from '../../types/review';
import { GoogleReviewButton } from './GoogleReviewButton';

interface ReviewSuccessProps {
  review: Review;
  googleReviewUrl?: string;
  isConfigured?: boolean;
  isLoadingUrl?: boolean;
  onDone: () => void;
  onViewMyReviews?: () => void;
}

export const ReviewSuccess: React.FC<ReviewSuccessProps> = ({
  review,
  googleReviewUrl,
  isConfigured,
  isLoadingUrl,
  onDone,
  onViewMyReviews,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReviewText = async () => {
    if (!review.feedback) return;
    try {
      await navigator.clipboard.writeText(review.feedback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard error
    }
  };

  const effectiveUrl = (googleReviewUrl || review.googleReviewUrl || '').trim();
  const effectiveConfigured = Boolean(isConfigured || effectiveUrl.length > 0);
  const isGoogleAvailable = Boolean(effectiveConfigured && effectiveUrl.length > 0);

  return (
    <div
      id="review-success-card"
      className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm text-center space-y-5 animate-in fade-in duration-200"
    >
      {/* Heart Icon Badge */}
      <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-inner">
        <Heart className="w-8 h-8 fill-red-500 stroke-red-500 animate-pulse" />
      </div>

      {/* Main Title & Confirmation */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-stone-900 tracking-tight">
          Thank You! ❤️
        </h2>
        <p className="text-sm font-semibold text-emerald-700">
          Your feedback has been saved.
        </p>
      </div>

      {/* Automatic Google Review Notification Banner if Auto-opened */}
      {review.wasAutoOpened && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-amber-500/10 border border-blue-200 text-left space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
            <span>Google Review Opened & Text Copied!</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Your review has been automatically copied to your clipboard. Switch to the opened Google tab, <strong>paste (Ctrl+V or tap Paste)</strong>, and click <strong>Post</strong> to finish!
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (review.feedback) navigator.clipboard.writeText(review.feedback);
                window.open(effectiveUrl, '_blank');
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Reopen Google Review</span>
            </button>
            <button
              type="button"
              onClick={handleCopyReviewText}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-[11px] flex items-center gap-1 shadow-2xs hover:bg-stone-50 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text Again'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Submitted Review Summary Box */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-stone-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-stone-400 font-mono">
            {review.reviewId.substring(0, 14)}
          </span>
        </div>

        {review.topics && review.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {review.topics.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {review.feedback && (
          <div className="space-y-1.5 pt-1 border-t border-stone-200/80">
            <p className="text-xs text-stone-700 italic leading-relaxed line-clamp-3">
              "{review.feedback}"
            </p>
            <button
              type="button"
              onClick={handleCopyReviewText}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy review text for Google</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Google Review Prompt Section if not already auto-opened or for manual click */}
      {!review.wasAutoOpened && (
        <>
          {isLoadingUrl ? (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
              <span>Connecting to Google Review service...</span>
            </div>
          ) : isGoogleAvailable ? (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-stone-700">
                Want to share your experience with others?
              </p>
              <GoogleReviewButton
                reviewId={review.reviewId}
                googleReviewUrl={effectiveUrl}
                isConfigured={effectiveConfigured}
              />
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
              Google review is currently unavailable.
            </div>
          )}
        </>
      )}

      {/* Done & View My Reviews Actions */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          type="button"
          id="btn-review-done"
          onClick={onDone}
          className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          Done
        </button>

        {onViewMyReviews && (
          <button
            type="button"
            onClick={onViewMyReviews}
            className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View in My Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
