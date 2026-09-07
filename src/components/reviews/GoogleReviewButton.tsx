import React, { useState } from 'react';
import { ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { markReviewRedirected } from '../../services/reviewService';

interface GoogleReviewButtonProps {
  reviewId?: string;
  googleReviewUrl?: string;
  isConfigured?: boolean;
  onRedirected?: () => void;
  className?: string;
}

export const GoogleReviewButton: React.FC<GoogleReviewButtonProps> = ({
  reviewId,
  googleReviewUrl,
  isConfigured,
  onRedirected,
  className = '',
}) => {
  const [hasClicked, setHasClicked] = useState(false);

  const isUrlValid = Boolean(isConfigured && googleReviewUrl && googleReviewUrl.trim().length > 0);

  const handleOpenGoogle = async () => {
    if (!isUrlValid || !googleReviewUrl) return;

    setHasClicked(true);

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

    // Open official Google Business Profile review URL in new tab
    window.open(googleReviewUrl.trim(), '_blank', 'noopener,noreferrer');
  };

  if (!isUrlValid) {
    return (
      <div className={`p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center ${className}`}>
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-600">
          <AlertCircle className="w-4 h-4 text-stone-400 shrink-0" />
          <span>Google review link is not configured yet.</span>
        </div>
        <p className="text-[11px] text-stone-400 mt-1">
          Your feedback has been saved internally for the restaurant team.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 w-full ${className}`}>
      <button
        type="button"
        id="btn-post-on-google"
        onClick={handleOpenGoogle}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
      >
        <span className="text-amber-300 text-base">⭐</span>
        <span>Post This Review on Google</span>
        <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
      </button>

      <p className="text-center text-xs text-stone-500 px-2 leading-relaxed">
        {hasClicked ? (
          <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
            Google review page opened. Please complete your submission on Google.
          </span>
        ) : (
          'Your review is ready. Google will open in a new page so you can submit it.'
        )}
      </p>
    </div>
  );
};
