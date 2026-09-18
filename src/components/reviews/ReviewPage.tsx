import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ArrowLeft, History, PenLine } from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { ReviewSuccess } from './ReviewSuccess';
import { MyReviewsList } from './MyReviewsList';
import {
  submitReview,
  getCustomerReviews,
} from '../../services/reviewService';
import { fetchGoogleReviewUrlFromServer } from '../../services/googleBusinessProfileService';
import { getCustomerSession, getLoyaltyStatus } from '../../services/loyaltyService';
import { copyToClipboard } from '../../utils/clipboard';
import { Review, ReviewSubmissionInput } from '../../types/review';
import { Customer } from '../../types';

interface ReviewPageProps {
  onBackToMenu: () => void;
  restaurantId?: string;
  initialCustomer?: Customer | null;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  onBackToMenu,
  restaurantId = 'mirch-masala-01',
  initialCustomer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'history'>('form');
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer || null);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(true);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Load customer session & fetch Google Review URL securely from the server only after component mounts
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Fetch Google Review URL securely from the server endpoint /api/google-review-url after component mounts
      try {
        setIsLoadingUrl(true);
        const urlConfig = await fetchGoogleReviewUrlFromServer(restaurantId);
        if (isMounted) {
          setGoogleReviewUrl(urlConfig.googleReviewUrl);
          setIsConfigured(urlConfig.isConfigured);
          setIsLoadingUrl(false);
        }
      } catch {
        if (isMounted) {
          setIsLoadingUrl(false);
        }
      }

      // 2. Customer session and history
      let currentCust = initialCustomer;
      if (!currentCust) {
        const session = getCustomerSession();
        if (session) {
          const res = await getLoyaltyStatus(session.customerId, session.phone, restaurantId);
          if (res.success && res.customer) {
            currentCust = res.customer;
          }
        }
      }

      if (isMounted && currentCust) {
        setCustomer(currentCust);
        const reviewsRes = await getCustomerReviews(currentCust.customerId, restaurantId);
        if (reviewsRes.success) {
          setMyReviews(reviewsRes.reviews);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [initialCustomer, restaurantId]);

  const handleSubmitReview = async (input: ReviewSubmissionInput) => {
    setIsSubmitting(true);
    setPopupBlocked(false);

    let internalSavedReview: Review | null = null;

    try {
      // 1. Save internally to the database first
      const res = await submitReview({
        ...input,
        restaurantId,
        customerId: customer?.customerId,
      });

      if (res.success && res.review) {
        internalSavedReview = res.review;
      } else {
        throw new Error(res.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      throw err;
    }

    // 2. Decoupled step: internal save has succeeded!
    // Immediately copy review text to clipboard & auto-open Google review URL in a new tab
    const targetUrl = (googleReviewUrl || internalSavedReview.googleReviewUrl || '').trim();
    const textToCopy = (input.feedback || '').trim();

    if (textToCopy) {
      try {
        await copyToClipboard(textToCopy);
      } catch (clipErr) {
        console.warn('Clipboard write failed:', clipErr);
      }
    }

    let isBlocked = false;
    if (targetUrl) {
      try {
        const newWin = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
          isBlocked = true;
        }
      } catch (openErr) {
        console.warn('Auto-open Google tab blocked:', openErr);
        isBlocked = true;
      }
    } else {
      isBlocked = true;
    }

    setPopupBlocked(isBlocked);

    const finalReview: Review = {
      ...internalSavedReview,
      googleReviewUrl: targetUrl || internalSavedReview.googleReviewUrl,
      wasAutoOpened: !isBlocked,
      status: !isBlocked ? 'google_redirected' : internalSavedReview.status,
    };

    setSubmittedReview(finalReview);
    setMyReviews((prev) => [finalReview, ...prev]);
    setIsSubmitting(false);
  };

  const handleResetForNewReview = () => {
    setSubmittedReview(null);
    setActiveSubTab('form');
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col relative bg-stone-50/80 pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToMenu}
            className="p-1 -ml-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="Back to menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-stone-900 leading-tight">
              Customer Reviews
            </h1>
            <p className="text-[11px] text-stone-500">The New Mirch Masala</p>
          </div>
        </div>

        {/* View switcher: Write Review vs My Reviews */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200/80 text-xs">
          <button
            type="button"
            onClick={() => {
              setSubmittedReview(null);
              setActiveSubTab('form');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'form' && !submittedReview
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <PenLine className="w-3 h-3" />
            <span>Rate</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'history'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <History className="w-3 h-3" />
            <span>My Reviews</span>
            {myReviews.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {myReviews.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 max-w-md mx-auto w-full space-y-4">
        {submittedReview ? (
          /* Success Screen with One-Click Google Review Button */
          <ReviewSuccess
            review={submittedReview}
            googleReviewUrl={googleReviewUrl}
            isConfigured={isConfigured}
            isLoadingUrl={isLoadingUrl}
            popupBlocked={popupBlocked}
            onDone={onBackToMenu}
            onViewMyReviews={() => {
              setSubmittedReview(null);
              setActiveSubTab('history');
            }}
          />
        ) : activeSubTab === 'form' ? (
          /* Review Form (Stars, Topics, Feedback, AI Assistant, Auto-post) */
          <ReviewForm
            restaurantId={restaurantId}
            customer={customer}
            googleReviewUrl={googleReviewUrl}
            isConfigured={isConfigured}
            isLoadingUrl={isLoadingUrl}
            onSubmit={handleSubmitReview}
            isSubmitting={isSubmitting}
          />
        ) : (
          /* Past Reviews */
          <MyReviewsList
            reviews={myReviews}
            googleReviewUrl={googleReviewUrl}
            isConfigured={isConfigured}
            onRedirected={(reviewId) => {
              setMyReviews((prev) =>
                prev.map((r) =>
                  r.reviewId === reviewId ? { ...r, status: 'google_redirected' } : r
                )
              );
            }}
            onWriteNewReview={handleResetForNewReview}
          />
        )}
      </div>
    </div>
  );
};
