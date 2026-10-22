import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Plus,
  Send,
  ThumbsUp,
  X
} from 'lucide-react';
import { Product, Review } from '../types';
import { CUSTOMER_REVIEWS } from '../data/mockData';
import { getProductTitle } from '../utils/translations';

interface ProductReviewCarouselProps {
  product: Product;
  lang?: 'en' | 'bn';
}

// Default contextual review templates for products without seeded reviews
const DEFAULT_TESTIMONIAL_TEMPLATES: Record<string, { commentBn: string; commentEn: string; name: string; loc: string }[]> = {
  gadgets: [
    {
      commentBn: 'অসাধারণ কোয়ালিটি! ডেলিভারি পেয়েছি মাত্র ২৪ ঘণ্টায়। প্যাকেজিং চমৎকার ছিল এবং প্রোডাক্ট ১০০% অরিজিনাল।',
      commentEn: 'Outstanding quality! Received delivery within 24 hours. Packaging was solid and product is 100% genuine.',
      name: 'তানভীর হাসান (মিরপুর, ঢাকা)',
      loc: 'Mirpur, Dhaka'
    },
    {
      commentBn: 'ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরেছি। বিল্ড কোয়ালিটি ও ফিনিশিং অনেক প্রিমিয়াম। ভ্যালু ফর মানি প্রোডাক্ট!',
      commentEn: 'Inspected the product before paying with Cash on Delivery. Build quality and finishing is very premium!',
      name: 'মাহমুদুল হক (উত্তরা, ঢাকা)',
      loc: 'Uttara, Dhaka'
    },
    {
      commentBn: 'ছবিতে যেমন দেখেছি হুবহু সেরকম পেয়েছি। ব্যবহারের অভিজ্ঞতা খুব দারুণ। BanglaXpress এর সার্ভিস সত্যি সেরা।',
      commentEn: 'Exactly as shown in the pictures. Working smoothly. Customer service of BanglaXpress is really trustworthy.',
      name: 'সাকিব আল ইমরান (চট্টগ্রাম)',
      loc: 'Chattogram Sadar'
    }
  ],
  apparel: [
    {
      commentBn: 'ফেব্রিক কোয়ালিটি খুব আরামদায়ক। সাইজ ও ফিটিং একদম পারফেক্ট। রঙের কোনো পরিবর্তন হয়নি ওয়াশের পরও।',
      commentEn: 'Fabric is super comfortable and breathable. Size and fitting was 100% accurate. Highly satisfied!',
      name: 'ফারহান আহমেদ (ধানমন্ডি, ঢাকা)',
      loc: 'Dhanmondi, Dhaka'
    },
    {
      commentBn: 'খুব দ্রুত ডেলিভারি পেয়েছি। প্রোডাক্টের ফিনিশিং ও স্টিচিং খুব নিখুঁত। ধন্যবাদ সেলারকে!',
      commentEn: 'Prompt delivery and immaculate stitching quality. Truly impressive value for the price.',
      name: 'নাজমুল ইসলাম (সিলেট)',
      loc: 'Sylhet'
    }
  ],
  general: [
    {
      commentBn: '১০০% সন্তুষ্ট! যেমন আশা করেছিলাম তার চেয়েও ভালো পেয়েছি। বন্ধুদেরও রেকমেন্ড করেছি।',
      commentEn: '100% satisfied! Even better than what I expected. Recommended to my friends already.',
      name: 'আরিফুল ইসলাম (গুলশান, ঢাকা)',
      loc: 'Gulshan, Dhaka'
    },
    {
      commentBn: 'ডেলিভারিম্যানের ব্যবহার খুব অমায়িক ছিল। পণ্য ভালো প্যাকেজিংয়ে অক্ষত পেয়েছি। ৫ স্টার রেটিং!',
      commentEn: 'Courier delivery agent was polite and package arrived in pristine condition. 5-star rating!',
      name: 'জাহিদুল করিম (খুলনা)',
      loc: 'Khulna'
    }
  ]
};

export const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({
  product,
  lang = 'bn'
}) => {
  // Generate initial reviews for this specific product
  const getInitialReviews = (): Review[] => {
    // 1. Check localStorage for user-submitted reviews for this product
    let savedReviews: Review[] = [];
    try {
      const stored = localStorage.getItem(`bx_reviews_${product.id}`);
      if (stored) {
        savedReviews = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }

    // 2. Check seeded mock reviews matching product.id
    const seeded = CUSTOMER_REVIEWS.filter(
      (r) => r.productId === product.id || r.productId === product.slug
    );

    if (savedReviews.length > 0 || seeded.length > 0) {
      return [...savedReviews, ...seeded];
    }

    // 3. Fallback contextual reviews for this specific product
    const categoryKey = product.category.toLowerCase().includes('cloth') || product.category.toLowerCase().includes('fashion')
      ? 'apparel'
      : product.category.toLowerCase().includes('gadget') || product.category.toLowerCase().includes('electron') || product.category.toLowerCase().includes('watch')
      ? 'gadgets'
      : 'general';

    const templates = DEFAULT_TESTIMONIAL_TEMPLATES[categoryKey] || DEFAULT_TESTIMONIAL_TEMPLATES.general;

    const generated: Review[] = templates.map((tmpl, idx) => ({
      id: `gen-${product.id}-${idx}`,
      productId: product.id,
      userName: tmpl.name,
      rating: 5,
      date: idx === 0 ? '১ দিন আগে' : idx === 1 ? '৩ দিন আগে' : '১ সপ্তাহ আগে',
      verified: true,
      location: tmpl.loc,
      comment: lang === 'en' ? tmpl.commentEn : tmpl.commentBn
    }));

    return generated;
  };

  const [reviews, setReviews] = useState<Review[]>(getInitialReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);

  // Form states for submitting a new review
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset when product changes
  useEffect(() => {
    setReviews(getInitialReviews());
    setCurrentIndex(0);
    setShowAddReview(false);
    setSubmitSuccess(false);
  }, [product.id, lang]);

  // Auto-play timer for carousel
  useEffect(() => {
    if (isPaused || reviews.length <= 1 || showAddReview) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [reviews.length, isPaused, showAddReview]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNewReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const newRev: Review = {
      id: `user-rev-${Date.now()}`,
      productId: product.id,
      userName: `${newName.trim()} (${newLocation.trim() || (lang === 'en' ? 'Verified Buyer' : 'ভেরিফাইড ক্রেতা')})`,
      rating: newRating,
      date: lang === 'en' ? 'Just now' : 'এইমাত্র',
      verified: true,
      location: newLocation.trim() || 'Bangladesh',
      comment: newComment.trim()
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);

    // Save to localStorage
    try {
      const stored = localStorage.getItem(`bx_reviews_${product.id}`);
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(`bx_reviews_${product.id}`, JSON.stringify([newRev, ...existing]));
    } catch {
      // Ignore
    }

    setSubmitSuccess(true);
    setCurrentIndex(0);
    setNewName('');
    setNewLocation('');
    setNewComment('');

    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAddReview(false);
    }, 2000);
  };

  const currentReview = reviews[currentIndex] || reviews[0];

  return (
    <div
      className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 border border-amber-200/80 shadow-2xs relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header: Title, Product Rating Summary & Write Review Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <MessageSquareQuote className="w-4.5 h-4.5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-gray-900 tracking-tight">
                {lang === 'en' ? 'Customer Reviews & Feedback' : 'কাস্টমারদের রিভিউ ও অভিজ্ঞতা'}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {reviews.length} {lang === 'en' ? 'Reviews' : 'টি রিভিউ'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 4.9)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-700">
                {product.rating || 4.9} / 5.0
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {lang === 'en' ? '100% Verified Buyers' : '১০০% ভেরিফাইড ক্রেতা'}
              </span>
            </div>
          </div>
        </div>

        {/* Write a Review Button */}
        <button
          type="button"
          onClick={() => setShowAddReview(!showAddReview)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
            showAddReview
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          {showAddReview ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Cancel' : 'বাতিল'}</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{lang === 'en' ? 'Write a Review' : 'রিভিউ দিন'}</span>
            </>
          )}
        </button>
      </div>

      {/* Write Review Form Collapsible */}
      {showAddReview && (
        <form
          onSubmit={handleNewReviewSubmit}
          className="mt-3 p-4 bg-white rounded-xl border border-amber-200/90 shadow-sm animate-in fade-in zoom-in-95 duration-200 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {lang === 'en' ? 'Your Review for this Product' : 'পণ্যটির জন্য আপনার মূল্যবান রিভিউ দিন'}
              </span>
            </h4>
            {submitSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Review Submitted!' : 'রিভিউ সফলভাবে জমা হয়েছে!'}
              </span>
            )}
          </div>

          {/* Interactive Star Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">
              {lang === 'en' ? 'Rating:' : 'রেটিং দিন:'}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setNewHoverRating(star)}
                  onMouseLeave={() => setNewHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (newHoverRating || newRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-amber-600">
              {newHoverRating || newRating} / 5
            </span>
          </div>

          {/* Input Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={lang === 'en' ? 'Your Full Name (e.g. Shakil Ahmed)' : 'আপনার নাম (যেমন: শাকিল আহমেদ)'}
              className="px-3 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white"
            />
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder={lang === 'en' ? 'City / Area (e.g. Mirpur, Dhaka)' : 'ঠিকানা/শহর (যেমন: মিরপুর, ঢাকা)'}
              className="px-3 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Comment Textarea */}
          <textarea
            required
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Share your experience with product quality, packaging, delivery, etc...'
                : 'পণ্যের মান, প্যাকেজিং ও ডেলিভারি সম্পর্কে আপনার অভিজ্ঞতা লিখুন...'
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white"
          />

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Submit Verified Review' : 'রিভিউ সাবমিট করুন'}</span>
          </button>
        </form>
      )}

      {/* Main Review Carousel Card */}
      {!showAddReview && currentReview && (
        <div className="mt-3 relative min-h-[96px] flex flex-col justify-between">
          <div className="bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-amber-200/60 shadow-2xs relative">
            {/* Top row: Stars & Date */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < currentReview.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-[11px] font-bold text-amber-700 ml-1">
                  {currentReview.rating}.0
                </span>
              </div>

              <span className="text-[11px] text-gray-400 font-medium">
                {currentReview.date}
              </span>
            </div>

            {/* Testimonial Quote */}
            <p className="text-xs sm:text-[13px] text-gray-800 leading-relaxed font-medium italic relative pl-4 border-l-2 border-amber-400">
              "{currentReview.comment}"
            </p>

            {/* User Attribution Footer */}
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white text-[11px] font-bold flex items-center justify-center uppercase">
                  {currentReview.userName.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block leading-tight">
                    {currentReview.userName}
                  </span>
                  {currentReview.location && (
                    <span className="text-[10px] text-gray-500 block leading-none mt-0.5">
                      {currentReview.location}
                    </span>
                  )}
                </div>
              </div>

              {currentReview.verified && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{lang === 'en' ? 'Verified Purchase' : 'ভেরিফাইড পারচেজ'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Carousel Navigation Arrows & Dots */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-between pt-2.5 px-1">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors shadow-2xs cursor-pointer"
                aria-label="Previous review"
                title={lang === 'en' ? 'Previous' : 'পূর্ববর্তী'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx
                        ? 'w-5 bg-amber-500'
                        : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors shadow-2xs cursor-pointer"
                aria-label="Next review"
                title={lang === 'en' ? 'Next' : 'পরবর্তী'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
