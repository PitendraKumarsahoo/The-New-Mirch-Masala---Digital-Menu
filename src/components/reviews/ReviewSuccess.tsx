import React, { useState } from 'react';
import {
  Heart,
  Copy,
  Check,
  Star,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { Review } from '../../types/review';
import { copyToClipboard } from '../../utils/clipboard';

interface ReviewSuccessProps {
  review: Review;
  googleReviewUrl?: string;
  isConfigured?: boolean;
  isLoadingUrl?: boolean;
  popupBlocked?: boolean;
  onDone: () => void;
  onViewMyReviews?: () => void;
}

export const ReviewSuccess: React.FC<ReviewSuccessProps> = ({
  review,
  googleReviewUrl,
  isConfigured,
  isLoadingUrl = false,
  popupBlocked = false,
  onDone,
  onViewMyReviews,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReviewText = async () => {
    if (!review.feedback) return;
    const ok = await copyToClipboard(review.feedback);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const effectiveUrl = (googleReviewUrl || review.googleReviewUrl || '').trim();
  const effectiveConfigured = Boolean(isConfigured && effectiveUrl.length > 0);
  const isGoogleAvailable = !isLoadingUrl && effectiveConfigured && effectiveUrl.length > 0;

  return (
    <div
      id="review-success-card"
      className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm text-center space-y-5 animate-in fade-in duration-200"
    >
      {/* Heart / Success Emblem */}
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
        <Heart className="w-8 h-8 fill-emerald-500 stroke-emerald-500 animate-pulse" />
      </div>

      {/* Main Title & Confirmation */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-stone-900 tracking-tight">
          Thank You! ❤️
        </h2>
        <p className="text-xs text-stone-500">
          Your feedback has been received and verified.
        </p>
      </div>

      {/* Clear Status Message: Review saved internally */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-950">
                Review saved internally
              </h3>
              <p className="text-[11px] text-emerald-700">
                Saved securely in The New Mirch Masala database
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
            Verified
          </span>
        </div>

        <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-800">
          <span className="flex items-center gap-1 font-mono">
            <Database className="w-3 h-3 text-emerald-600 inline" />
            <span>Ref ID: #{review.reviewId.substring(0, 12).toUpperCase()}</span>
          </span>
          <span className="font-bold text-emerald-700">
            {review.rating}★ Recorded
          </span>
        </div>
      </div>

      {/* Google Review Automatic Post or Fallback Status */}
      <div className="space-y-3 pt-1 text-left">
        {isLoadingUrl ? (
          /* Loading State */
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-stone-700">
              Connecting to Google Review...
            </p>
          </div>
        ) : isGoogleAvailable ? (
          popupBlocked ? (
            /* POPUP BLOCKER FALLBACK: Browser blocked the automatic new tab */
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
                    Redirecting you to Google to post your review — your review text has been copied, just paste it in!
                  </h4>
                  <p className="text-[11.5px] text-amber-800 leading-relaxed">
                    Your browser paused the automatic pop-up. Tap below to open Google Maps directly and complete your post.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-open-google-review-fallback"
                onClick={() => {
                  if (review.feedback) copyToClipboard(review.feedback);
                  window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Google Review</span>
              </button>
            </div>
          ) : (
            /* AUTOMATIC REDIRECT SUCCESS: Tab opened automatically & review text copied */
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-200 text-left space-y-2.5">
              <div className="flex items-start gap-2.5 text-blue-950 font-bold text-xs sm:text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="leading-snug">
                  Redirecting you to Google to post your review — your review text has been copied, just paste it in!
                </span>
              </div>

              <p className="text-[11.5px] text-stone-600 leading-relaxed pl-8">
                Google Maps has been opened in a new tab. In that tab, confirm your <strong>{review.rating}★ rating</strong>, <strong>paste (tap Paste or Ctrl+V)</strong> your review text, and tap <strong>Post</strong>.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2 pl-8">
                <button
                  type="button"
                  id="btn-reopen-google-review"
                  onClick={() => {
                    if (review.feedback) copyToClipboard(review.feedback);
                    window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Reopen Google Review</span>
                </button>
                <button
                  type="button"
                  id="btn-copy-again"
                  onClick={handleCopyReviewText}
                  className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-stone-50 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Review Text Again'}</span>
                </button>
              </div>
            </div>
          )
        ) : (
          /* Graceful Unavailable State */
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-600">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Google Review link is currently unavailable.</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Your feedback is already safely recorded in our restaurant database. Thank you for visiting!
            </p>
          </div>
        )}
      </div>

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
            Rating: {review.rating}.0
          </span>
        </div>

        {review.topics && review.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {review.topics.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900"
              >
                #{t}
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

