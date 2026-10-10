'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Edit3, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

export interface CustomerReviewItem {
  id: string;
  productId: string;
  rating: number; // 1 to 5
  authorName: string;
  isVerifiedPurchase: boolean;
  date: string;
  comment: string;
}

interface ProductCustomerReviewsProps {
  productId: string;
  productSlug?: string;
  productName: string;
  initialReviews?: CustomerReviewItem[];
  initialSummary?: {
    total: number;
    averageRating: string | null;
  };
  onSummaryChange?: (summary: { total: number; averageRating: string | null }) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export function formatReviewDate(dateString: string): string {
  try {
    const d = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) return dateString;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;

    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function ProductCustomerReviews({
  productId,
  productSlug,
  productName,
  initialReviews,
  initialSummary,
  onSummaryChange,
}: ProductCustomerReviewsProps) {
  const { customer } = useStore();

  const [reviews, setReviews] = useState<CustomerReviewItem[]>(initialReviews || []);
  const [totalReviews, setTotalReviews] = useState<number>(
    initialSummary ? initialSummary.total : (initialReviews?.length || 0)
  );
  const [averageRating, setAverageRating] = useState<string | null>(
    initialSummary ? initialSummary.averageRating : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialReviews);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Pre-fill customer name if logged in
  useEffect(() => {
    if (customer?.name && !authorName) {
      setAuthorName(customer.name);
    }
  }, [customer?.name, authorName]);

  // Keep reviews & summary synced when product changes
  useEffect(() => {
    if (initialReviews) {
      setReviews(initialReviews);
    }
    if (initialSummary) {
      setTotalReviews(initialSummary.total);
      setAverageRating(initialSummary.averageRating);
    }
    setValidationError(null);
  }, [productId, productSlug, initialReviews, initialSummary]);

  // Fetch reviews for THIS specific product only
  const fetchReviews = useCallback(async (showLoadingSpinner = true) => {
    if (!productId && !productSlug) return;
    try {
      if (showLoadingSpinner) {
        setIsLoading(true);
      }
      const queryParam = productSlug
        ? `slug=${encodeURIComponent(productSlug)}`
        : `productId=${encodeURIComponent(productId)}`;

      const res = await fetch(`/api/reviews?${queryParam}`);
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await res.json();
      const rawReviews = data.data || [];

      const formatted: CustomerReviewItem[] = rawReviews.map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        rating: r.rating,
        authorName: r.customer_name || 'Verified Homeowner',
        isVerifiedPurchase: Boolean(r.is_verified_purchase === 1),
        date: formatReviewDate(r.created_at),
        comment: r.comment,
      }));

      const newTotal = typeof data.total === 'number' ? data.total : formatted.length;
      const newAvg = data.averageRating || null;

      setReviews(formatted);
      setTotalReviews(newTotal);
      setAverageRating(newAvg);
      onSummaryChange?.({ total: newTotal, averageRating: newAvg });
    } catch (err) {
      console.error('Error fetching product reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, productSlug, onSummaryChange]);

  useEffect(() => {
    // Only fetch on mount if initialReviews were not passed from server
    if (!initialReviews) {
      fetchReviews(true);
    }
  }, [fetchReviews, initialReviews]);

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate customer name (REQUIRED)
    const trimmedName = authorName.trim();
    if (!trimmedName) {
      setValidationError('Please enter your name.');
      return;
    }

    // 2. Validate star rating (1-5)
    if (selectedRating === 0) {
      setValidationError('Please select a star rating between 1 and 5.');
      return;
    }

    // 3. Validate review text (min 5 chars)
    const trimmedComment = comment.trim();
    if (trimmedComment.length < 5) {
      setValidationError('Please enter a review of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          slug: productSlug,
          rating: selectedRating,
          comment: trimmedComment,
          customerName: trimmedName,
        }),
      });

      let result: any = null;
      try {
        result = await res.json();
      } catch {
        result = null;
      }

      if (!res.ok) {
        const errorMsg =
          result?.error ||
          (res.status === 400
            ? 'Invalid review submission. Please check all fields and try again.'
            : res.status === 404
            ? 'The product was not found. Please refresh the page.'
            : res.status === 401 || res.status === 403
            ? 'Authentication required to submit this review.'
            : 'Unable to submit your review at this time. Please try again.');
        setValidationError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Optimistically insert newly created review into state immediately
      if (result?.data) {
        const newReview: CustomerReviewItem = {
          id: result.data.id,
          productId: result.data.product_id,
          rating: result.data.rating,
          authorName: result.data.customer_name || trimmedName,
          isVerifiedPurchase: Boolean(result.data.is_verified_purchase === 1),
          date: 'Just now',
          comment: result.data.comment,
        };
        setReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
      }

      // Reset form on success
      setSelectedRating(0);
      setHoverRating(0);
      if (!customer?.name) {
        setAuthorName('');
      }
      setComment('');
      setIsFormOpen(false);
      setValidationError(null);
      setSuccessNotice(true);

      // Re-fetch reviews to update average rating and count automatically in background
      await fetchReviews(false);

      setTimeout(() => {
        setSuccessNotice(false);
      }, 5000);
    } catch (err) {
      console.error('Submit review error:', err);
      setValidationError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="reviews"
      aria-label="Customer Reviews"
      className="scroll-mt-24 mt-8 sm:mt-10 rounded-xl bg-white border border-[#EDE8DE] p-4 sm:p-5 lg:p-6 shadow-[0_2px_8px_rgba(28,25,23,0.02)]"
    >
      {/* ─── 1. TOP HEADER WITH RATING SUMMARY & ACTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#EAE4D8]">
        <div>
          <span className="text-[9.5px] uppercase tracking-[0.18em] text-[#9A7B56] font-semibold block mb-0.5">
            Authentic Experiences
          </span>
          <h2 className="font-serif text-[17px] sm:text-[19px] font-medium text-[#2C221E]">
            Customer Reviews
          </h2>

          {/* Dynamic Rating Summary when real reviews exist */}
          {!isLoading && totalReviews > 0 && averageRating && (
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <div className="flex items-center gap-0.5" aria-label={`Rating: ${averageRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const numAvg = parseFloat(averageRating);
                  const isFilled = star <= Math.round(numAvg);
                  return (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        isFilled
                          ? 'fill-[#9A7B56] text-[#9A7B56]'
                          : 'text-[#D8D2C4]'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="font-serif text-[15px] sm:text-[16px] font-semibold text-[#2C221E]">
                {averageRating} / 5
              </span>
              <span className="text-[11px] text-[#78716C]">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>

        {/* Top Action Button */}
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(true);
              setValidationError(null);
            }}
            className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-lg bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs cursor-pointer active:scale-95 w-full sm:w-auto shrink-0"
          >
            <Edit3 className="w-3 h-3 text-[#E6C687]" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* ─── 2. SUCCESS CONFIRMATION NOTICE ─── */}
      {successNotice && (
        <div className="my-3.5 p-3 rounded-lg bg-[#FBF8F3] border-[#E8DFC8] text-[#7A5832] text-[11.5px] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#9A7B56] shrink-0" />
          <span>
            Thank you for sharing your experience! Your review has been saved and published.
          </span>
        </div>
      )}

      {/* ─── 3. WRITE A REVIEW FORM (EXPANDABLE, COMPACT, DYNAMIC) ─── */}
      {isFormOpen && (
        <div className="my-3.5 p-3.5 sm:p-4 rounded-lg bg-[#FAF7F2] border border-[#E5DEC9] animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#E5DEC9]">
            <div>
              <h3 className="font-serif text-[15px] sm:text-[16px] font-medium text-[#2C221E]">
                Write a Review
              </h3>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Share your feedback on {productName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setValidationError(null);
              }}
              aria-label="Close review form"
              className="p-1 text-[#78716C] hover:text-[#9A7B56] rounded hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-3">
            {/* Validation Message */}
            {validationError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11.5px] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Interactive Star Selection */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                Your Rating <span className="text-rose-600">*</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || selectedRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setSelectedRating(star);
                        if (validationError) setValidationError(null);
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 text-[#C4B9A1] hover:text-[#9A7B56] transition-colors cursor-pointer focus:outline-none"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-5.5 h-5.5 sm:w-6 sm:h-6 transition-transform hover:scale-110 ${
                          isFilled
                            ? 'fill-[#9A7B56] text-[#9A7B56]'
                            : 'text-[#C4B9A1]'
                        }`}
                      />
                    </button>
                  );
                })}
                {selectedRating > 0 && (
                  <span className="ml-2 text-[11.5px] font-medium text-[#2C221E]">
                    {RATING_LABELS[selectedRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Reviewer Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10.5px] font-semibold text-[#44403C] uppercase tracking-wider">
                  Your Name <span className="text-rose-600">*</span>
                </label>
                {customer && (
                  <span className="text-[10px] text-[#9A7B56] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#9A7B56]" /> Logged In
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Priya Sharma"
                className="w-full h-8.5 px-3 rounded-lg border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12px] text-[#1C1917] outline-none transition-colors"
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-[10.5px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                Review <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Share your experience with this product... (e.g. fabric texture, drape, blackout performance, stitching quality)"
                className="w-full p-2.5 rounded-lg border border-[#D5CCBA] focus:border-[#9A7B56] bg-white text-[12px] text-[#1C1917] outline-none resize-none transition-colors"
              />
              <div className="flex justify-between items-center text-[10.5px] text-[#8C827A] mt-0.5">
                <span>Minimum 5 characters</span>
                <span>{comment.length} / 2000</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-8.5 px-4 rounded-lg bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs cursor-pointer active:scale-95 disabled:opacity-70 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-[#E6C687]" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setValidationError(null);
                }}
                disabled={isSubmitting}
                className="h-8.5 px-3.5 rounded-lg border border-[#D5CCBA] text-[#57534E] hover:bg-white text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── 4. LOADING STATE ─── */}
      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-5 h-5 text-[#9A7B56] animate-spin mb-2" />
          <span className="text-[11.5px] text-[#8C827A]">Loading reviews...</span>
        </div>
      )}

      {/* ─── 5. EMPTY STATE (WHEN NO REVIEWS EXIST YET IN DATABASE) ─── */}
      {!isLoading && totalReviews === 0 && !isFormOpen && (
        <div className="text-center py-5 sm:py-6 px-3">
          <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E5DEC9] flex items-center justify-center mx-auto mb-2.5 text-[#9A7B56]">
            <Star className="w-4 h-4 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-[15px] sm:text-[16px] font-medium text-[#2C221E] mb-1">
            No reviews yet
          </h3>
          <p className="text-[12px] text-[#78716C] max-w-sm mx-auto mb-3.5 leading-relaxed">
            Be the first to share your experience with this product.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(true);
              setValidationError(null);
            }}
            className="inline-flex items-center justify-center gap-1.5 h-8.5 px-4 rounded-lg border border-[#2C221E] text-[#2C221E] hover:bg-[#1C1714] hover:text-white text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Write a Review</span>
          </button>
        </div>
      )}

      {/* ─── 6. INDIVIDUAL REVIEWS LIST (DYNAMIC DATABASE REVIEWS) ─── */}
      {!isLoading && totalReviews > 0 && (
        <div className="divide-y divide-[#EAE4D8] mt-1">
          {reviews.map((rev) => (
            <article key={rev.id} className="py-3.5 sm:py-4 first:pt-3 last:pb-1">
              {/* Star Rating & Timestamp */}
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-0.5" aria-label={`${rev.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= rev.rating
                          ? 'fill-[#9A7B56] text-[#9A7B56]'
                          : 'text-[#D8D2C4]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10.5px] text-[#8C827A] font-normal">
                  {rev.date}
                </span>
              </div>

              {/* Author Name & Verified Badge (Only if genuinely verified) */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-medium text-[12.5px] text-[#1C1917]">
                  {rev.authorName}
                </span>
                {rev.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FBF8F3] border border-[#E8DFC8] text-[10px] text-[#7A5832] font-medium tracking-wide">
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#9A7B56]" />
                    Verified Purchase
                  </span>
                )}
              </div>

              {/* Review Comment Body */}
              <p className="text-[12px] sm:text-[12.5px] text-[#44403C] leading-relaxed font-normal">
                {rev.comment}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
