import React, { useState } from 'react';
import { ExternalLink, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { markReviewRedirected } from '../../services/reviewService';

interface GoogleReviewButtonProps {
  reviewId?: string;
  googleReviewUrl?: string;
  isConfigured?: boolean;
  reviewText?: string;
  rating?: number;
  onRedirected?: () => void;
  className?: string;
}

export const GoogleReviewButton: React.FC<GoogleReviewButtonProps> = ({
  reviewId,
  googleReviewUrl,
  isConfigured,
  reviewText,
  rating,
  onRedirected,
  className = '',
}) => {
  const [hasClicked, setHasClicked] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUrlValid = Boolean(isConfigured && googleReviewUrl && googleReviewUrl.trim().length > 0);

  const handleOpenGoogle = async () => {
    if (!isUrlValid || !googleReviewUrl) return;

    // 1. Automatically copy review text to clipboard for effortless pasting on Google Maps
    if (reviewText && reviewText.trim().length > 0) {
      try {
        await navigator.clipboard.writeText(reviewText.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    }

    setHasClicked(true);

    // 2. Mark review as redirected in backend
    if (reviewId) {
      try {
        await markReviewRedirected(reviewId);
      } catch {
        // Continue opening link
      }
    }

    if (onRedirected) {
      onRedirected();
    }

    // 3. Open official Google Maps review destination
    window.open(googleReviewUrl.trim(), '_blank', 'noopener,noreferrer');
  };

  if (!isUrlValid) {
    return (
      <div className={`p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center ${className}`}>
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-600">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Google review link is not available right now.</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-1">
          Your feedback has been safely recorded in the restaurant's internal database.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      <button
        type="button"
        id="btn-post-on-google"
        onClick={handleOpenGoogle}
        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
      >
        <span className="text-amber-300 text-base">⭐</span>
        <span>Post This Review on Google</span>
        <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
      </button>

      {/* Guidance note explaining the clipboard copy and Google Maps one-tap submission */}
      <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-left space-y-1">
        <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>
            {copied
              ? 'Review text copied! Paste it in Google Maps.'
              : 'Auto-copies your review text to clipboard on click.'}
          </span>
        </div>
        <p className="text-[10.5px] text-stone-600 leading-normal">
          Google Maps opens in a new tab. Just <strong>paste your review</strong>, confirm your <strong>{rating ? `${rating}★` : ''} rating</strong>, and tap <strong>Post</strong>.
        </p>
      </div>

      {hasClicked && (
        <p className="text-center text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
          <span>Google review tab opened! Complete your post on Google.</span>
        </p>
      )}
    </div>
  );
};

