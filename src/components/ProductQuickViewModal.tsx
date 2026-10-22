import React, { useState } from 'react';
import { X, Star, ShoppingCart, Zap, ShieldCheck, Truck, RotateCcw, Check, Heart, Share2, Sliders, FileText, Sparkles, Palette } from 'lucide-react';
import { Product } from '../types';
import { STORE_SETTINGS } from '../data/mockData';
import { TRANSLATIONS, getProductTitle, getProductDescription } from '../utils/translations';
import { getColorHex, isLightColor } from '../utils/colorUtils';
import { ProductReviewCarousel } from './ProductReviewCarousel';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onFastBuyNow: (product: Product, quantity: number, color?: string, size?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  lang?: 'en' | 'bn';
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onFastBuyNow,
  isWishlisted,
  onToggleWishlist,
  onSelectCategory,
  lang = 'bn'
}) => {
  if (!product) return null;
  const t = TRANSLATIONS[lang];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          init[opt.name] = opt.values[0];
        }
      });
    }
    if (product.colors && product.colors.length > 0 && !init['Color']) {
      init['Color'] = product.colors[0].name;
    }
    if (product.sizes && product.sizes.length > 0 && !init['Size']) {
      init['Size'] = product.sizes[0];
    }
    return init;
  });

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bottomTab, setBottomTab] = useState<'specs' | 'desc' | 'warranty' | 'reviews'>('specs');

  // Match active variant
  const activeVariant = React.useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((v) => {
        if (!v.options) return false;
        return Object.entries(selectedOptions).every(([optName, optVal]) => {
          const matchKey = Object.keys(v.options).find(
            (k) => k.toLowerCase() === optName.toLowerCase()
          );
          if (!matchKey) return true;
          return v.options[matchKey] === optVal;
        });
      }) || product.variants[0]
    );
  }, [product.variants, selectedOptions]);

  const currentPrice = activeVariant?.price ?? product.price;
  const currentOriginalPrice = activeVariant?.compareAtPrice ?? product.originalPrice;
  const currentSavings = Math.max(0, currentOriginalPrice - currentPrice);
  const currentDiscountPercent =
    currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : product.discountPercent;
  const currentStock = activeVariant?.inventory ?? product.stockCount;

  const handleSelectOption = (optName: string, val: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optName]: val }));
    if (optName.toLowerCase() === 'color') setSelectedColor(val);
    if (optName.toLowerCase() === 'size') setSelectedSize(val);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const savings = currentSavings;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left: Images Gallery (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              {/* Active Image */}
              <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 relative group">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-600 text-white shadow-xs">
                  -{product.discountPercent}% OFF
                </span>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-rose-600 ring-2 ring-rose-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Delivery info card */}
              <div className="mt-2 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-rose-600" />
                  <span>
                    ঢাকা সিটি: <strong>{STORE_SETTINGS.deliveryInsideDhaka}৳</strong> (২৪-৪৮ ঘণ্টা) | বাইরে: <strong>{STORE_SETTINGS.deliveryOutsideDhaka}৳</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>ওয়ারেন্টি: {product.warranty}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>অরিজিনাল সকল প্রোডাক্ট ডেলিভারির সময় চেক করে দেখে মূল্য পরিশোধ করুন।</span>
                </div>
              </div>

            </div>

            {/* Right: Product Details & Purchase Form (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                {/* Category Breadcrumb Navigation */}
                <nav className="flex items-center gap-1.5 text-xs text-sky-600 font-normal mb-2 flex-wrap" aria-label="Breadcrumb">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('all');
                      onClose();
                    }}
                    className="hover:underline text-sky-600 cursor-pointer"
                  >
                    Home
                  </button>
                  <span className="text-gray-400 select-none">›</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(product.category);
                      onClose();
                    }}
                    className="hover:underline text-sky-600 cursor-pointer font-medium"
                  >
                    {product.category}
                  </button>
                  <span className="text-gray-400 select-none">›</span>
                  <span className="text-gray-600 truncate max-w-[220px] sm:max-w-xs font-normal">
                    {product.name}
                  </span>
                  {product.sku && (
                    <span className="text-gray-400 font-mono text-[10.5px] ml-auto">
                      SKU: {product.sku}
                    </span>
                  )}
                </nav>

                {/* Name */}
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug">
                  {getProductTitle(product, lang)}
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                  {lang === 'bn' ? product.name : (product.banglaName || '')}
                </p>

                {/* Rating & In stock */}
                <div className="flex items-center gap-3 mt-3 pb-3 border-b border-gray-100 flex-wrap">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200 fill-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-800 ml-1.5">
                      {product.rating} ({product.reviewCount} কাস্টমার রিভিউ)
                    </span>
                  </div>

                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    স্টকে আছে ({product.stockCount} টি)
                  </span>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`ml-auto text-xs font-medium flex items-center gap-1 transition-colors ${
                      isWishlisted ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                    <span>{isWishlisted ? 'উইশলিস্টে আছে' : 'উইশলিস্ট'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'শেয়ার'}</span>
                  </button>
                </div>

                {/* Pricing Box */}
                <div className="mt-4 p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600">
                    ৳{currentPrice.toLocaleString()}
                  </span>
                  {currentOriginalPrice > currentPrice && (
                    <span className="text-sm sm:text-base text-gray-400 line-through">
                      ৳{currentOriginalPrice.toLocaleString()}
                    </span>
                  )}
                  {currentDiscountPercent > 0 && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">
                      -{currentDiscountPercent}% ছাড়
                    </span>
                  )}
                  {currentSavings > 0 && (
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded ml-auto">
                      আপনার সাশ্রয় ৳{currentSavings.toLocaleString()}!
                    </span>
                  )}
                </div>

                {/* Key Features Spotlight */}
                {((product.features && product.features.length > 0) || (product.categoryMetafields?.features && product.categoryMetafields.features.length > 0)) && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'en' ? 'Key Features:' : 'প্রধান সুবিধাসমূহ:'}</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(product.features || product.categoryMetafields?.features || []).slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px] text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Options or Fallback Color & Size */}
                {product.options && product.options.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {product.options.map((opt) => {
                      const isColor =
                        opt.name.toLowerCase() === 'color' ||
                        opt.name.toLowerCase() === 'colour' ||
                        opt.name === 'কালার' ||
                        opt.name.toLowerCase().includes('color');
                      const selectedVal = selectedOptions[opt.name] || opt.values[0];
                      const selectedHex = isColor ? getColorHex(selectedVal, product.colors) : '';

                      if (isColor) {
                        return (
                          <div key={opt.id || opt.name} className="space-y-2">
                            <label className="text-xs font-bold text-gray-800 flex items-center justify-between flex-wrap gap-2">
                              <span className="flex items-center gap-1.5">
                                <Palette className="w-4 h-4 text-rose-600" />
                                <span>{opt.name}:</span>
                                <span className="text-gray-900 font-extrabold text-sm ml-1">{selectedVal}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-800 shadow-2xs">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-xs"
                                  style={{ backgroundColor: selectedHex }}
                                />
                                <span>{selectedHex}</span>
                              </span>
                            </label>

                            <div className="flex items-center gap-3 flex-wrap pt-0.5">
                              {opt.values.map((val) => {
                                const isSelected = selectedVal.toLowerCase() === val.toLowerCase();
                                const hex = getColorHex(val, product.colors);
                                const isLight = isLightColor(hex);

                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                      handleSelectOption(opt.name, val);
                                      setSelectedColor(val);
                                    }}
                                    title={`${val} (${hex})`}
                                    aria-label={`Color ${val} - ${hex}`}
                                    className="group relative flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
                                  >
                                    <div
                                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                        isSelected
                                          ? 'ring-3 ring-rose-600 ring-offset-2 ring-offset-white shadow-md scale-105'
                                          : 'ring-1 ring-black/15 hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:scale-105 shadow-2xs'
                                      }`}
                                      style={{ backgroundColor: hex }}
                                    >
                                      <span className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />
                                      {isSelected && (
                                        <Check
                                          className={`w-3.5 h-3.5 stroke-[3] transition-transform duration-200 ${
                                            isLight ? 'text-gray-900' : 'text-white'
                                          }`}
                                        />
                                      )}
                                    </div>
                                    <span
                                      className={`text-[11px] max-w-[70px] truncate text-center leading-tight ${
                                        isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                                      }`}
                                    >
                                      {val}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={opt.id || opt.name}>
                          <label className="text-xs font-bold text-gray-700 block mb-1.5">
                            {opt.name}: <span className="text-rose-600 font-semibold">{selectedVal}</span>
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {opt.values.map((val) => {
                              const isSelected = selectedVal === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleSelectOption(opt.name, val)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-200 shadow-2xs'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {/* Color Variations */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <label className="text-xs font-bold text-gray-800 flex items-center justify-between flex-wrap gap-2">
                          <span className="flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-rose-600" />
                            <span>{lang === 'en' ? 'Select Color:' : 'কালার সিলেক্ট করুন (Color):'}</span>
                            <span className="text-gray-900 font-extrabold text-sm ml-1">{selectedColor}</span>
                          </span>
                        </label>
                        <div className="flex items-center gap-3 flex-wrap pt-0.5">
                          {product.colors.map((c) => {
                            const isSelected = selectedColor === c.name;
                            const hex = c.hex ? c.hex.toUpperCase() : getColorHex(c.name, product.colors);
                            const isLight = isLightColor(hex);

                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => {
                                  setSelectedColor(c.name);
                                  handleSelectOption('Color', c.name);
                                }}
                                title={c.name}
                                aria-label={`Color ${c.name}`}
                                className="group relative flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
                              >
                                <div
                                  className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    isSelected
                                      ? 'ring-3 ring-rose-600 ring-offset-2 ring-offset-white shadow-md scale-105'
                                      : 'ring-1 ring-black/15 hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:scale-105 shadow-2xs'
                                  }`}
                                  style={{ backgroundColor: hex }}
                                >
                                  <span className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />
                                  {isSelected && (
                                    <Check
                                      className={`w-3.5 h-3.5 stroke-[3] transition-transform duration-200 ${
                                        isLight ? 'text-gray-900' : 'text-white'
                                      }`}
                                    />
                                  )}
                                </div>
                                <span
                                  className={`text-[11px] max-w-[70px] truncate text-center leading-tight ${
                                    isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                                  }`}
                                >
                                  {c.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Quantity */}
                <div className="mt-4 flex items-center gap-4">
                  <label className="text-xs font-bold text-gray-700">পরিমাণ (Quantity):</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-bold text-gray-900 min-w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    মোট: <strong>৳{(currentPrice * quantity).toLocaleString()}</strong>
                  </span>
                </div>

                {/* Short Specs / Features */}
                <div className="mt-4">
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {getProductDescription(product, lang)}
                  </p>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-500">{lang === 'en' ? 'Tags:' : 'ট্যাগস:'}</span>
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={() => {
                    const customizedProduct: Product = {
                      ...product,
                      price: currentPrice,
                      originalPrice: currentOriginalPrice,
                      sku: activeVariant?.sku || product.sku,
                      stockCount: currentStock
                    };
                    onAddToCart(customizedProduct, quantity, selectedColor, selectedSize);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-rose-600 text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t.addToCart}</span>
                </button>

                <button
                  id="modal-order-now-btn"
                  onClick={() => {
                    const customizedProduct: Product = {
                      ...product,
                      price: currentPrice,
                      originalPrice: currentOriginalPrice,
                      sku: activeVariant?.sku || product.sku,
                      stockCount: currentStock
                    };
                    onFastBuyNow(customizedProduct, quantity, selectedColor, selectedSize);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all cursor-pointer animate-pulse"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{lang === 'en' ? 'Order Now (Cash on Delivery)' : 'সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* Customer Reviews Spotlight Carousel */}
          <ProductReviewCarousel product={product} lang={lang} />

          {/* Bottom Tabs: Specifications, Description, Warranty, Reviews */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-px overflow-x-auto">
              <button
                onClick={() => setBottomTab('specs')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  bottomTab === 'specs'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Specifications' : 'স্পেসিফিকেশন (Specifications)'}</span>
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 text-gray-600 font-mono">
                    {Object.keys(product.specifications).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setBottomTab('desc')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  bottomTab === 'desc'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Description & Highlights' : 'বিস্তারিত বিবরণ ও ফিচার্স'}</span>
              </button>

              <button
                onClick={() => setBottomTab('warranty')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  bottomTab === 'warranty'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Warranty & Policies' : 'ওয়ারেন্টি ও পলিসি'}</span>
              </button>

              <button
                onClick={() => setBottomTab('reviews')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  bottomTab === 'reviews'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>{lang === 'en' ? 'Customer Reviews' : 'কাস্টমার রিভিউ'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-mono">
                  {product.rating || 4.9}★
                </span>
              </button>
            </div>

            {/* Tab 1: Specifications */}
            {bottomTab === 'specs' && (
              <div className="py-4 animate-in fade-in duration-150">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(product.specifications).map(([k, v], idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                            <td className="py-2.5 px-4 font-bold text-gray-800 w-1/3 border-r border-gray-100">
                              {k}
                            </td>
                            <td className="py-2.5 px-4 text-gray-600 font-medium">
                              {v}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-2">
                    এই পণ্যের জন্য কোনো অতিরিক্ত স্পেসিফিকেশন উল্লেখ করা নেই।
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: Full Description & Features */}
            {bottomTab === 'desc' && (
              <div className="py-4 space-y-4 animate-in fade-in duration-150">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || product.banglaDescription || product.shortDescription}
                </p>

                {product.features && product.features.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-gray-900">মূল আকর্ষণীয় ফিচার্স:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                      {product.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 block mb-1.5">ট্যাগসমূহ:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Warranty & Policies */}
            {bottomTab === 'warranty' && (
              <div className="py-4 space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>ওয়ারেন্টি কভারেজ</span>
                    </div>
                    <p className="text-slate-700 font-medium">{product.warranty || '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি'}</p>
                    <p className="text-[11px] text-slate-500 mt-1">অফিসিয়াল অনুমোদিত পণ্য</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 text-xs">
                    <div className="flex items-center gap-2 text-sky-800 font-bold mb-1">
                      <RotateCcw className="w-4 h-4 text-sky-600" />
                      <span>৭ দিনের সহজ রিটার্ন</span>
                    </div>
                    <p className="text-slate-700 font-medium">আনবক্সিং ভিডিও সহ ইনস্ট্যান্ট এক্সচেঞ্জ</p>
                    <p className="text-[11px] text-slate-500 mt-1">ত্রুটিপূর্ণ পণ্য সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                    <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span>ডেলিভারি ও ক্যাশ অন</span>
                    </div>
                    <p className="text-slate-700 font-medium">ঢাকা: ৬০৳ | বাইরে: ১২০৳</p>
                    <p className="text-[11px] text-slate-500 mt-1">ডেলিভারিম্যানের সামনে চেক করার সুযোগ</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Customer Reviews Details */}
            {bottomTab === 'reviews' && (
              <div className="py-4 animate-in fade-in duration-150 space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-4xl sm:text-5xl font-black text-amber-500 font-mono">
                      {product.rating || 4.9}
                    </span>
                    <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-1 block">
                      {lang === 'en' ? `Based on ${product.reviewCount || 128} verified reviews` : `সর্বমোট ${product.reviewCount || 128} জন ভেরিফাইড ক্রেতার মতামত`}
                    </span>
                  </div>

                  <div className="flex-1 max-w-xs w-full space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-12 font-semibold">৫ স্টার</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[92%]" />
                      </div>
                      <span className="font-mono text-[11px]">92%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 font-semibold">৪ স্টার</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[7%]" />
                      </div>
                      <span className="font-mono text-[11px]">7%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 font-semibold">৩ স্টার</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[1%]" />
                      </div>
                      <span className="font-mono text-[11px]">1%</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'en'
                      ? 'All reviews displayed in the carousel above are from verified customers who purchased this item on BanglaXpress.'
                      : 'উপরের ক্যারোসেলের সকল রিভিউ ও রেটিং BanglaXpress থেকে পণ্য ক্রয়কারী ভেরিফাইড গ্রাহকদের দ্বারা প্রদত্ত।'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
