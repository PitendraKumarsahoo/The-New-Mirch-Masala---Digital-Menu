import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, AlertCircle, Send, Check, ExternalLink, Wand2, RefreshCw } from 'lucide-react';
import { StarRating } from './StarRating';
import { REVIEW_TOPICS } from '../../services/reviewService';
import { generateAiReview, QUICK_REVIEW_TEMPLATES } from '../../services/aiReviewService';
import { ReviewSubmissionInput } from '../../types/review';
import { Customer } from '../../types';

interface ReviewFormProps {
  restaurantId?: string;
  customer?: Customer | null;
  googleReviewUrl?: string;
  isConfigured?: boolean;
  isLoadingUrl?: boolean;
  onSubmit: (input: ReviewSubmissionInput) => Promise<void>;
  isSubmitting?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  restaurantId = 'mirch-masala-01',
  customer,
  googleReviewUrl = 'https://www.google.com/maps/search/?api=1&query=The+New+Mirch+Masala+Gunupur+Odisha',
  isConfigured = true,
  isLoadingUrl = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState<number>(0); // 0 = unselected, must actively select
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [customName, setCustomName] = useState<string>(customer?.name || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Review Suggestion States
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 1000) {
      setFeedback(val);
      if (errorMessage) setErrorMessage(null);
    }
  };

  // AI Review Generator Handler
  const handleGenerateAiReview = async (tone: 'foodie' | 'family' | 'quick' | 'polish' = 'foodie') => {
    if (rating === 0) {
      setErrorMessage('Please select a star rating first so AI can write the best review for you.');
      return;
    }

    setErrorMessage(null);
    setIsAiGenerating(true);
    setAiNotice('✨ AI is crafting your review...');

    try {
      const res = await generateAiReview({
        rating,
        topics: selectedTopics,
        currentFeedback: feedback.trim(),
        customerName: customName.trim() || customer?.name,
        tone: feedback.trim().length > 0 ? 'polish' : tone,
      });

      if (res.success && res.reviewText) {
        setFeedback(res.reviewText);
        setAiNotice(
          res.source === 'gemini'
            ? '✨ AI review generated via Gemini! You can edit or submit.'
            : '✨ Suggested review added! You can edit or submit.'
        );
      } else {
        setAiNotice('✨ Review suggestion ready!');
      }
    } catch {
      setAiNotice('✨ Review suggestion applied!');
    } finally {
      setIsAiGenerating(false);
      setTimeout(() => setAiNotice(null), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5 stars.');
      return;
    }

    const trimmedFeedback = feedback.trim();

    try {
      await onSubmit({
        restaurantId,
        customerId: customer?.customerId,
        customerName: customName.trim() || customer?.name || 'Valued Diner',
        rating,
        topics: selectedTopics,
        feedback: trimmedFeedback,
        autoPostToGoogle: false,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <form
      id="customer-review-form"
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-6"
    >
      {/* Question Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-black text-stone-900 tracking-tight">
          How was your experience?
        </h2>
        <p className="text-xs text-stone-500">
          Your honest feedback helps us serve you better.
        </p>
      </div>

      {/* Star Rating Section (Actively selected, does NOT default to 5) */}
      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex flex-col items-center justify-center">
        <StarRating
          value={rating}
          onChange={(newRating) => {
            setRating(newRating);
            if (errorMessage) setErrorMessage(null);
          }}
          size="lg"
          showLabel={true}
        />
      </div>

      {/* Optional Quick Topics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Highlights (Optional)</span>
          </label>
          <span className="text-[10px] text-stone-400 font-medium">
            Select what stood out
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {REVIEW_TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                id={`topic-chip-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-xs scale-102 ring-1 ring-amber-400'
                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                <span>{topic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment Box with AI Suggestion */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="review-feedback-textarea"
            className="text-xs font-bold text-stone-700 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>Tell us about your experience</span>
          </label>
          <span
            className={`text-[10px] font-mono font-medium ${
              feedback.length >= 950 ? 'text-red-600 font-bold' : 'text-stone-400'
            }`}
          >
            {feedback.length} / 1000
          </span>
        </div>

        {/* AI Suggest / Write Review with AI Toolbar */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-ai-write-review"
              onClick={() => handleGenerateAiReview('foodie')}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isAiGenerating
                  ? 'AI Generating...'
                  : feedback.trim().length > 0
                  ? 'Polish with AI'
                  : 'Write Review with AI'}
              </span>
            </button>

            {feedback.trim().length > 0 && (
              <button
                type="button"
                id="btn-ai-regenerate"
                onClick={() => handleGenerateAiReview('foodie')}
                disabled={isAiGenerating}
                title="Generate another variation"
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-amber-100/80 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-[10px] text-amber-800/80 font-medium hidden sm:inline">
            Gemini AI Assistant
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Quick AI Suggestions (Tap to fill)
            </span>
            {aiNotice && (
              <span className="text-[10px] font-bold text-emerald-600 animate-in fade-in">
                {aiNotice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_REVIEW_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                id={`ai-suggestion-${tmpl.id}`}
                onClick={() => {
                  setFeedback(tmpl.text);
                  setAiNotice('✨ Inserted review!');
                  setTimeout(() => setAiNotice(null), 3000);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200/80 hover:border-amber-300 transition-all cursor-pointer select-none"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="review-feedback-textarea"
          rows={4}
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder="Share details of your visit (e.g. food quality, favorite dishes, or click 'Write Review with AI')..."
          maxLength={1000}
          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-colors"
        />
      </div>

      {/* Customer Name input if not registered */}
      {!customer && (
        <div className="space-y-1">
          <label
            htmlFor="review-customer-name"
            className="text-xs font-bold text-stone-700 block"
          >
            Your Name (Optional)
          </label>
          <input
            id="review-customer-name"
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Rajesh or Leave as Guest Diner"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        id="btn-submit-review"
        disabled={isSubmitting || rating === 0}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
          rating === 0
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white active:scale-[0.99]'
        }`}
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Saving Review...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Review</span>
          </>
        )}
      </button>
    </form>
  );
};

