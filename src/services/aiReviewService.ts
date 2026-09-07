/**
 * AI Review Assistant Service
 * Connects to server-side Gemini API (/api/gemini/suggest-review)
 * with instant authentic fallback suggestions for The New Mirch Masala.
 */

export interface AiSuggestReviewParams {
  rating: number;
  topics?: string[];
  currentFeedback?: string;
  customerName?: string;
  tone?: 'quick' | 'foodie' | 'family' | 'polish';
}

export interface AiSuggestReviewResult {
  success: boolean;
  reviewText: string;
  source: 'gemini' | 'template';
  error?: string;
}

export interface QuickReviewTemplate {
  id: string;
  label: string;
  text: string;
  minRating: number;
}

export const QUICK_REVIEW_TEMPLATES: QuickReviewTemplate[] = [
  {
    id: 'biryani-tandoori',
    label: '🍗 Best Biryani & Tandoori',
    text: 'The New Mirch Masala in Gunupur serves incredible food! The Chicken Biryani was rich, aromatic, and perfectly cooked, and the Tandoori Chicken was succulent with authentic smoky flavors. Quick service and great hospitality!',
    minRating: 5,
  },
  {
    id: 'family-dinner',
    label: '👨‍👩‍👧 Family Dinner & Ambiance',
    text: 'Had a wonderful family dinner at The New Mirch Masala. Delicious curries, soft butter naan, and the staff was extremely polite and attentive. Best restaurant in Gunupur for family gatherings!',
    minRating: 5,
  },
  {
    id: 'fast-fresh',
    label: '⚡ Quick Service & Fresh Food',
    text: 'Consistently delicious and fresh food at The New Mirch Masala! Ordered both Indian and Chinese dishes, and everything arrived hot and tasty. Super fast service and excellent value for money.',
    minRating: 4,
  },
  {
    id: 'foodie-must-try',
    label: '🌶️ Must-Visit in Gunupur',
    text: 'Definitely the top dining destination in Gunupur, Odisha! The spice blends and flavors at The New Mirch Masala are spot-on. Generous portion sizes, clean seating, and warm staff.',
    minRating: 5,
  },
  {
    id: 'good-experience',
    label: '👍 Great Taste & Value',
    text: 'Really enjoyable meal at The New Mirch Masala. The Paneer Butter Masala and Fried Rice were very tasty, and the pricing is very reasonable. Will definitely be coming back!',
    minRating: 4,
  },
];

/**
 * Generates an authentic review using server-side Gemini API.
 * Falls back to context-aware templates if server or network is unavailable.
 */
export async function generateAiReview(
  params: AiSuggestReviewParams
): Promise<AiSuggestReviewResult> {
  const { rating, topics = [], currentFeedback = '', customerName = '', tone = 'foodie' } = params;

  // 1. Try server-side Gemini endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/gemini/suggest-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating,
        topics,
        currentFeedback,
        customerName,
        tone,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.reviewText && data.reviewText.trim().length > 0) {
        return {
          success: true,
          reviewText: data.reviewText.trim(),
          source: 'gemini',
        };
      }
    }
  } catch {
    // Network error or timeout - proceed to smart fallback
  }

  // 2. Intelligent Context-Aware Fallback Templates
  let matchingTemplate = QUICK_REVIEW_TEMPLATES.find((t) => t.minRating <= rating);

  if (topics.includes('Great Taste') || topics.includes('Fresh Food')) {
    matchingTemplate = QUICK_REVIEW_TEMPLATES[0];
  } else if (topics.includes('Friendly Staff') || topics.includes('Nice Ambience')) {
    matchingTemplate = QUICK_REVIEW_TEMPLATES[1];
  } else if (topics.includes('Fast Service') || topics.includes('Good Value')) {
    matchingTemplate = QUICK_REVIEW_TEMPLATES[2];
  }

  if (rating <= 3) {
    return {
      success: true,
      reviewText:
        'Good flavors and clean seating at The New Mirch Masala. The food was tasty, though service could be slightly faster during busy peak hours. Overall a pleasant meal in Gunupur.',
      source: 'template',
    };
  }

  return {
    success: true,
    reviewText:
      matchingTemplate?.text ||
      'Loved the dining experience at The New Mirch Masala in Gunupur! Fresh ingredients, mouthwatering dishes, and very warm service. Highly recommended to everyone!',
    source: 'template',
  };
}
