import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Heart,
  Share2,
  Sliders,
  FileText,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  Eye,
  Scale,
  Package,
  Clock,
  ThumbsUp,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Phone,
  Palette
} from 'lucide-react';
import { Product, ThemeConfig } from '../types';
import { STORE_SETTINGS } from '../data/mockData';
import { TRANSLATIONS, getProductTitle, getProductDescription } from '../utils/translations';
import { getColorHex, isLightColor } from '../utils/colorUtils';

interface ProductDetailPageProps {
  product: Product;
  onBackToStore: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onFastBuyNow: (product: Product, quantity: number, color?: string, size?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  allProducts: Product[];
  onSelectRelatedProduct: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  onOpenCart?: () => void;
  lang?: 'en' | 'bn';
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBackToStore,
  onAddToCart,
  onFastBuyNow,
  isWishlisted,
  onToggleWishlist,
  onSelectCategory,
  allProducts,
  onSelectRelatedProduct,
  isCompared = false,
  onToggleCompare,
  onOpenCart,
  lang = 'bn'
}) => {
  const t = TRANSLATIONS[lang];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'warranty'>('desc');
  const [addedAlert, setAddedAlert] = useState(false);

  // Dynamic Option selection map e.g. { Color: 'Orange', Size: 'M', Material: 'Aluminum', Features: 'Foldable' }
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

  // Hover-to-Zoom states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2.2); // 2.2x zoom magnification
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 }); // percentage
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Mouse move handler for calculating lens position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate cursor position in percentages (0 to 100)
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Reset image and selections when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsZoomed(false);
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
    setSelectedOptions(init);
    setSelectedColor(init['Color'] || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined));
    setSelectedSize(init['Size'] || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined));
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id, product.options]);

  // Find matching variant based on selectedOptions
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

  // Sync active variant image if available
  useEffect(() => {
    if (activeVariant?.image) {
      const idx = product.images.indexOf(activeVariant.image);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [activeVariant, product.images]);

  const handleSelectOptionValue = (optName: string, val: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optName]: val
    }));
    if (optName.toLowerCase() === 'color') {
      setSelectedColor(val);
    }
    if (optName.toLowerCase() === 'size') {
      setSelectedSize(val);
    }
  };

  const currentPrice = activeVariant?.price ?? product.price;
  const currentOriginalPrice = activeVariant?.compareAtPrice ?? product.originalPrice;
  const currentSavings = Math.max(0, currentOriginalPrice - currentPrice);
  const currentDiscountPercent =
    currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : product.discountPercent;
  const currentStock = activeVariant?.inventory ?? product.stockCount;
  const currentSku = activeVariant?.sku || product.sku;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddToCartWithFeedback = () => {
    const customizedProduct: Product = {
      ...product,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      sku: currentSku,
      stockCount: currentStock
    };
    onAddToCart(customizedProduct, quantity, selectedColor, selectedSize);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 3000);
  };

  const handleFastBuyNowWithVariant = () => {
    const customizedProduct: Product = {
      ...product,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      sku: currentSku,
      stockCount: currentStock
    };
    onFastBuyNow(customizedProduct, quantity, selectedColor, selectedSize);
  };

  const savings = currentSavings;

  // Filter related products in the same category
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.vendor === product.vendor))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 sm:pb-16 animate-in fade-in duration-200">
      
      {/* Top Sticky Breadcrumbs & Quick Back Navigation Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          
          {/* Back button & Breadcrumb Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              id="back-to-store-btn"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0"
              title="শপে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
              <span className="hidden sm:inline">হোমে ফিরে যান</span>
              <span className="sm:hidden">ফিরে যান</span>
            </button>

            <div className="h-4 w-px bg-gray-300 hidden sm:block" />

            <nav className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 font-medium truncate" aria-label="Breadcrumb">
              <button
                type="button"
                onClick={onBackToStore}
                className="hover:text-rose-600 cursor-pointer"
              >
                Home
              </button>
              <span className="text-gray-400">›</span>
              <button
                type="button"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(product.category);
                  onBackToStore();
                }}
                className="hover:text-rose-600 text-sky-700 cursor-pointer font-semibold"
              >
                {product.category}
              </button>
              <span className="text-gray-400">›</span>
              <span className="text-gray-800 truncate font-semibold">
                {product.name}
              </span>
            </nav>
          </div>

          {/* Quick Header Actions: Wishlist, Share, Hotline */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(product)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  isCompared
                    ? 'bg-rose-50 border-rose-400 text-rose-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title="তুলনা তালিকায় যুক্ত করুন"
              >
                <Scale className="w-4 h-4" />
                <span className="hidden lg:inline">{isCompared ? 'তুলনায় যুক্ত' : 'তুলনা'}</span>
              </button>
            )}

            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-400 text-rose-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title="উইশলিস্টে রাখুন"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span className="hidden sm:inline">{isWishlisted ? 'উইশলিস্টে আছে' : 'উইশলিস্ট'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="লিংক শেয়ার করুন"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline">{copiedLink ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Full-Screen Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Added Alert Toast */}
        {addedAlert && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>পণ্যটি সফলভাবে শপিং কার্টে যুক্ত হয়েছে!</span>
            </div>
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="px-3 py-1 bg-white text-emerald-800 text-xs font-black rounded-lg hover:bg-emerald-50 transition-colors"
              >
                কার্ট দেখুন
              </button>
            )}
          </div>
        )}

        {/* 2-Column Product Showcase Grid */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Gallery Showcase (5 or 6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* Primary High-Resolution Display Stage with Interactive Hover-to-Zoom */}
              <div className="relative">
                <div
                  ref={imageContainerRef}
                  id="product-image-zoom-container"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className={`w-full aspect-square sm:h-[480px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 relative flex items-center justify-center p-2 select-none ${
                    isZoomed ? 'cursor-crosshair' : 'cursor-zoom-in'
                  }`}
                >
                  {/* Base Product Image */}
                  <img
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={product.name}
                    className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-200 pointer-events-none ${
                      isZoomed ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  {/* High-Resolution Zoomed Layer (Follows cursor smoothly) */}
                  {isZoomed && (
                    <div
                      className="absolute inset-0 w-full h-full pointer-events-none bg-no-repeat transition-[background-position] duration-75 ease-out"
                      style={{
                        backgroundImage: `url(${product.images[activeImageIndex] || product.images[0]})`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundSize: `${zoomLevel * 100}%`,
                        backgroundColor: '#ffffff'
                      }}
                    />
                  )}

                  {/* Floating Discount Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-rose-600 text-white shadow-md">
                      -{product.discountPercent}% OFF
                    </span>
                    {product.badge && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 text-amber-400 shadow-md">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Free Delivery Tag if high value */}
                  {product.price >= 2000 && (
                    <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md pointer-events-none z-10">
                      <Truck className="w-3.5 h-3.5" /> ফ্রি ডেলিভারি অফার
                    </span>
                  )}

                  {/* Zoom Hint / Magnifier Indicator Pill */}
                  <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg pointer-events-none transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isZoomed ? `${zoomLevel}x জুম সক্রিয়` : 'হোভার করে জুম দেখুন'}</span>
                  </div>
                </div>

                {/* Interactive Zoom Level Controller (1.8x, 2.2x, 3.0x) */}
                <div className="flex items-center justify-between mt-2 px-1 text-xs text-gray-500">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <ZoomIn className="w-3 h-3 text-gray-400" /> ছবির উপর মাউস আনলে ডিটেইল জুম হবে
                  </span>

                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                    <span className="text-[10px] text-gray-600 px-1 font-bold">জুম লেভেল:</span>
                    {[1.8, 2.2, 3.0].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setZoomLevel(lvl)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          zoomLevel === lvl
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {lvl}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multiple Thumbnails Row */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all p-1 bg-white cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-rose-600 ring-2 ring-rose-200 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              )}

              {/* Fast Assurance Info Box (Bangladesh Courier & Warranty Standard) */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mt-2">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ডেলিভারি ও কাস্টমার সার্ভিস নিশ্চয়তা</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">এক্সপ্রেস ডেলিভারি</h4>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        ঢাকা: {STORE_SETTINGS.deliveryInsideDhaka}৳ | ঢাকার বাইরে: {STORE_SETTINGS.deliveryOutsideDhaka}৳
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">৭ দিনের রিপ্লেসমেন্ট</h4>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        ত্রুটি থাকলে সহজে রিটার্ন বা বদল
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">১০০% আসল পণ্য</h4>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        ওয়ারেন্টি: {product.warranty || '7 Days Replacement Guarantee'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs flex items-start gap-2.5">
                    <Package className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">ক্যাশ অন ডেলিভারি</h4>
                      <p className="text-[10.5px] text-gray-500 mt-0.5 leading-snug">
                        অরিজিনাল সকল প্রোডাক্ট ডেলিভারির সময় চেক করে দেখে মূল্য পরিশোধ করুন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Full Product Information, Pricing, Variants & Purchase Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                
                {/* Category / Collection Badge Box & SKU (Matching Sample Reference) */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Collections & Categories Pill / Tag Box */}
                  <div
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(product.category);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md text-xs font-bold text-emerald-700 bg-emerald-50 border-2 border-emerald-500 shadow-xs hover:bg-emerald-100/70 transition-all cursor-pointer group"
                    title="ক্যাটাগরি ব্রাউজ করুন"
                  >
                    <span>
                      {product.category || (product.collections && product.collections[0]) || 'Gadgets & Accessories'}
                    </span>
                  </div>

                  {currentSku && (
                    <span className="font-mono text-xs text-gray-400">SKU: {currentSku}</span>
                  )}
                </div>

                {/* Primary Bengali / English Title */}
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-snug tracking-tight">
                    {getProductTitle(product, lang)}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1.5 font-medium leading-relaxed">
                    {lang === 'bn' ? product.name : (product.banglaName || '')}
                  </p>
                </div>

                {/* Rating & Stock Status */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap pb-1 border-b border-gray-100">
                  <div className="flex items-center gap-1">
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
                    <span className="text-xs font-bold text-gray-800 ml-1">
                      {product.rating} ({product.reviewCount} {lang === 'en' ? 'Reviews' : 'কাস্টমার রিভিউ'})
                    </span>
                  </div>

                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'en' ? `In Stock (${currentStock} available)` : `স্টকে আছে (${currentStock} টি এভেইলেবল)`}
                  </span>
                </div>

                {/* Attractive Pricing Box */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 rounded-2xl border border-rose-200 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 block mb-1">
                      {lang === 'en' ? 'Special Offer Price' : 'অফার মূল্য (Special Offer Price)'}
                    </span>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-black text-rose-600 font-mono">
                        ৳{currentPrice.toLocaleString()}
                      </span>
                      {currentOriginalPrice > currentPrice && (
                        <span className="text-base sm:text-lg text-gray-400 line-through font-mono">
                          ৳{currentOriginalPrice.toLocaleString()}
                        </span>
                      )}
                      {currentDiscountPercent > 0 && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-600 text-white shadow-xs">
                          -{currentDiscountPercent}% {lang === 'en' ? 'OFF' : 'ছাড়'}
                        </span>
                      )}
                    </div>
                  </div>

                  {currentSavings > 0 && (
                    <div className="text-right">
                      <span className="text-xs text-emerald-800 font-bold bg-white border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs block">
                        {lang === 'en' ? 'Save: ' : 'সাশ্রয়: '}<strong>৳{currentSavings.toLocaleString()}!</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Dynamic Product Options / Variants (e.g. Size, Color, Fabric, Features, etc.) */}
                {product.options && product.options.length > 0 ? (
                  <div className="space-y-5 pt-1">
                    {product.options.map((opt) => {
                      const isColor =
                        opt.name.toLowerCase() === 'color' ||
                        opt.name.toLowerCase() === 'colour' ||
                        opt.name === 'কালার' ||
                        opt.name.toLowerCase().includes('color');
                      const isSize = opt.name.toLowerCase() === 'size';
                      const selectedVal = selectedOptions[opt.name] || opt.values[0];
                      const selectedHex = isColor ? getColorHex(selectedVal, product.colors) : '';

                      if (isColor) {
                        return (
                          <div key={opt.id || opt.name} className="space-y-2.5">
                            {/* Color Header with selected color name */}
                            <label className="text-xs font-bold text-gray-800 flex items-center justify-between flex-wrap gap-2">
                              <span className="flex items-center gap-1.5">
                                <Palette className="w-4 h-4 text-rose-600" />
                                <span>{opt.name}:</span>
                                <span className="text-gray-900 font-extrabold text-sm ml-1">{selectedVal}</span>
                              </span>
                            </label>

                            {/* Visual Circles with actual background color and clear ring highlight */}
                            <div className="flex items-center gap-3.5 flex-wrap pt-0.5">
                              {opt.values.map((val) => {
                                const isSelected = selectedVal.toLowerCase() === val.toLowerCase();
                                const hex = getColorHex(val, product.colors);
                                const isLight = isLightColor(hex);

                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                      handleSelectOptionValue(opt.name, val);
                                      setSelectedColor(val);
                                    }}
                                    title={val}
                                    aria-label={`Color ${val}`}
                                    className="group relative flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                                  >
                                    {/* Visual Circle Swatch */}
                                    <div
                                      className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                                        isSelected
                                          ? 'ring-3 ring-rose-600 ring-offset-2 ring-offset-white shadow-md scale-105'
                                          : 'ring-1 ring-black/15 hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:scale-105 shadow-2xs'
                                      }`}
                                      style={{ backgroundColor: hex }}
                                    >
                                      {/* Subtle inner border to keep pure white or very light pastel colors crisp */}
                                      <span className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />

                                      {/* Selection Checkmark */}
                                      {isSelected && (
                                        <Check
                                          className={`w-4 h-4 stroke-[3] transition-transform duration-200 ${
                                            isLight ? 'text-gray-900' : 'text-white'
                                          }`}
                                        />
                                      )}
                                    </div>

                                    {/* Color Name Only */}
                                    <span
                                      className={`text-xs max-w-[80px] truncate text-center leading-tight transition-colors ${
                                        isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700 group-hover:text-gray-900'
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
                        <div key={opt.id || opt.name} className="space-y-2">
                          <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-gray-500" />
                              <span>{opt.name}:</span>
                            </span>
                            <span className="text-rose-600 font-black">{selectedVal}</span>
                          </label>

                          <div className="flex items-center gap-2 flex-wrap">
                            {opt.values.map((val) => {
                              const isSelected = selectedVal === val;

                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleSelectOptionValue(opt.name, val)}
                                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-200 shadow-xs'
                                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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
                    {/* Fallback Color Variations */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-gray-800 flex items-center justify-between flex-wrap gap-2">
                          <span className="flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-rose-600" />
                            <span>{lang === 'en' ? 'Select Color:' : 'কালার পছন্দ করুন (Color):'}</span>
                            <span className="text-gray-900 font-extrabold text-sm ml-1">{selectedColor}</span>
                          </span>
                        </label>
                        <div className="flex items-center gap-3.5 flex-wrap pt-0.5">
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
                                  handleSelectOptionValue('Color', c.name);
                                }}
                                title={c.name}
                                aria-label={`Color ${c.name}`}
                                className="group relative flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                              >
                                {/* Visual circle swatch with actual background color and clear ring highlight */}
                                <div
                                  className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    isSelected
                                      ? 'ring-3 ring-rose-600 ring-offset-2 ring-offset-white shadow-md scale-105'
                                      : 'ring-1 ring-black/15 hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:scale-105 shadow-2xs'
                                  }`}
                                  style={{ backgroundColor: hex }}
                                >
                                  {/* Subtle inner border to keep pure white or very light pastel colors crisp */}
                                  <span className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />

                                  {/* Selection Checkmark */}
                                  {isSelected && (
                                    <Check
                                      className={`w-4 h-4 stroke-[3] transition-transform duration-200 ${
                                        isLight ? 'text-gray-900' : 'text-white'
                                      }`}
                                    />
                                  )}
                                </div>

                                {/* Color Name Only */}
                                <span
                                  className={`text-xs max-w-[80px] truncate text-center leading-tight transition-colors ${
                                    isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700 group-hover:text-gray-900'
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

                    {/* Fallback Size Variations */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                          <span>{lang === 'en' ? 'Select Size:' : 'সাইজ নির্বাচন করুন (Size):'}</span>
                          <span className="text-rose-600 font-black">{selectedSize}</span>
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {product.sizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                setSelectedSize(sz);
                                handleSelectOptionValue('Size', sz);
                              }}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                selectedSize === sz
                                  ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Quantity Selector & Total Calculation */}
                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-700">{lang === 'en' ? 'Quantity:' : 'পরিমাণ (Quantity):'}</label>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-1.5 text-base font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-sm font-bold text-gray-900 min-w-10 text-center font-mono">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3.5 py-1.5 text-base font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-500 block">{lang === 'en' ? 'Total Price:' : 'মোট মূল্য:'}</span>
                    <span className="text-sm font-black text-rose-600 font-mono">
                      ৳{(currentPrice * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Purchase Buttons (Primary 2 CTAs matching user layout) */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button
                  id="page-order-now-btn"
                  onClick={handleFastBuyNowWithVariant}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#00966a] hover:bg-[#00815b] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{lang === 'en' ? 'Order Now (Cash on Delivery)' : 'সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)'}</span>
                </button>

                <button
                  id="page-add-to-cart-btn"
                  onClick={handleAddToCartWithFeedback}
                  className="py-3.5 px-6 rounded-xl border-2 border-[#00966a] text-[#00966a] hover:bg-emerald-50 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Add to Cart' : 'কার্টে যোগ করুন'}</span>
                </button>
              </div>

              {/* Specification Comparison Action */}
              {onToggleCompare && (
                <button
                  type="button"
                  onClick={() => onToggleCompare(product)}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lang === 'en' ? '+ Compare with Other Products' : '+ অন্য পণ্যের সাথে স্পেসিফিকেশন তুলনা করুন'}</span>
                </button>
              )}

              {/* Product Inspection Reassurance */}
              <div className="flex items-center justify-center gap-2 py-0.5 text-xs text-gray-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Inspect all original products upon delivery before payment.'
                    : 'অরিজিনাল সকল প্রোডাক্ট ডেলিভারির সময় চেক করে দেখে মূল্য পরিশোধ করুন।'}
                </span>
              </div>

              {/* Direct Phone & WhatsApp Order Banner (Exact match with user requested design) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {lang === 'en' ? 'Want to order directly via Phone or WhatsApp?' : 'ফোনে বা WhatsApp এ সরাসরি অর্ডার করতে চান?'}
                  </p>
                  <a
                    href={`tel:${(STORE_SETTINGS.phone || '09678-123456').replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-base sm:text-lg tracking-wide transition-colors"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{STORE_SETTINGS.phone || '09678-123456'}</span>
                  </a>
                </div>

                <a
                  href={`https://wa.me/${(STORE_SETTINGS.whatsapp || '+8801700123456').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I want to order "${product.name}". Price: ৳${(product.price * quantity).toLocaleString()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>{lang === 'en' ? 'WhatsApp Order' : 'WhatsApp এ অর্ডার'}</span>
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* Extended Tabs: Detailed Description, Specs, Reviews, Warranty */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 sm:px-6 overflow-x-auto bg-gray-50/70">
            <button
              onClick={() => setActiveTab('desc')}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'desc'
                  ? 'border-rose-600 text-rose-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'en' ? 'Description' : 'বিস্তারিত বিবরণ (Description)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-rose-600 text-rose-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{lang === 'en' ? 'Specifications' : 'স্পেসিফিকেশন (Specifications)'}</span>
              {product.specifications && (
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700 font-mono">
                  {Object.keys(product.specifications).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'warranty'
                  ? 'border-rose-600 text-rose-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'en' ? 'Warranty & Delivery' : 'ওয়ারেন্টি ও ডেলিভারি পলিসি'}</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-rose-600 text-rose-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>{lang === 'en' ? `Customer Reviews (${product.reviewCount})` : `কাস্টমার রিভিউ (${product.reviewCount})`}</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-5 sm:p-8">
            
            {/* Tab 1: Description */}
            {activeTab === 'desc' && (
              <div className="space-y-6 text-sm text-gray-700 leading-relaxed animate-in fade-in duration-200">
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                    {product.description || product.banglaDescription || product.shortDescription}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>প্রধান ফিচার এবং সুবিধাসমূহ:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-gray-800 font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-500 block mb-2">সম্পর্কিত ট্যাগসমূহ:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Specifications Table */}
            {activeTab === 'specs' && (
              <div className="animate-in fade-in duration-200">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-w-3xl">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(product.specifications).map(([k, v], idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}>
                            <td className="py-3 px-4 font-bold text-gray-800 w-1/3 border-r border-gray-200">
                              {k}
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {v}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4">
                    এই পণ্যের জন্য নির্দিষ্ট কোনো অতিরিক্ত স্পেসিফিকেশন তালিকাভুক্ত নেই।
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: Warranty & Delivery Details */}
            {activeTab === 'warranty' && (
              <div className="space-y-5 animate-in fade-in duration-200 max-w-4xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>ওয়ারেন্টি কভারেজ</span>
                    </div>
                    <p className="text-slate-800 font-bold text-sm">{product.warranty || '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি'}</p>
                    <p className="text-slate-600 leading-relaxed">
                      পণ্যের কোনো টেকনিক্যাল ত্রুটি থাকলে নির্ধারিত সময়ের মধ্যে ফ্রি সার্ভিসিং বা রিপ্লেসমেন্ট প্রযোজ্য।
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-sky-800 font-bold">
                      <RotateCcw className="w-5 h-5 text-sky-600" />
                      <span>৭ দিনের সহজ রিটার্ন</span>
                    </div>
                    <p className="text-slate-800 font-bold text-sm">ইনস্ট্যান্ট এক্সচেঞ্জ সুবিধা</p>
                    <p className="text-slate-600 leading-relaxed">
                      পার্সেল রিসিভ করার পর আনবক্সিং ভিডিও সহ যোগাযোগ করলে দ্রুত সমাধান প্রদান করা হবে।
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-800 font-bold">
                      <Truck className="w-5 h-5 text-amber-600" />
                      <span>কুরিয়ার ডেলিভারি পলিসি</span>
                    </div>
                    <p className="text-slate-800 font-bold text-sm">ঢাকা: ৬০৳ | বাইরে: ১২০৳</p>
                    <p className="text-slate-600 leading-relaxed">
                      স্টেডফাস্ট ও পাঠাও কুরিয়ারের মাধ্যমে দ্রুততম সময়ে সারা বাংলাদেশে হোম ডেলিভারি।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Customer Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-amber-50/50 border border-amber-200 max-w-3xl">
                  <div className="text-center sm:text-left">
                    <span className="text-4xl sm:text-5xl font-black text-amber-500 font-mono">
                      {product.rating}
                    </span>
                    <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-1 block">
                      সর্বমোট {product.reviewCount} কাস্টমার রিভিউ
                    </span>
                  </div>

                  <div className="h-16 w-px bg-amber-200 hidden sm:block" />

                  <div className="flex-1 space-y-1.5 text-xs text-gray-600 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span>৫ স্টার</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[88%]" />
                      </div>
                      <span className="font-mono">88%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>৪ স্টার</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[10%]" />
                      </div>
                      <span className="font-mono">10%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>৩ স্টার</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[2%]" />
                      </div>
                      <span className="font-mono">2%</span>
                    </div>
                  </div>
                </div>

                {/* Sample Verified Customer Feedbacks */}
                <div className="space-y-3 pt-2 max-w-3xl">
                  <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">শাকিল আহমেদ</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ভেরিফাইড ক্রেতা
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">২ দিন আগে</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700">
                      যেমনটা চেয়েছি ঠিক তেমনই পেয়েছি। প্যাকেজিং খুব ভালো ছিল এবং ডেলিভারি মাত্র ২৪ ঘণ্টার মধ্যেই পেয়ে গেছি। অসংখ্য ধন্যবাদ!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">ফারহানা করিম</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ভেরিফাইড ক্রেতা
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">১ সপ্তাহ আগে</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700">
                      কালার ও কোয়ালিটি ১০০% জেনুইন। ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরে খুব ভালো লেগেছে।
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Similar / Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {lang === 'en' ? 'Related Products' : 'সম্পর্কিত অন্যান্য পণ্যসমূহ (Related Products)'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'en' ? 'Other popular gadgets from this category' : 'এই ক্যাটাগরির আরও কিছু জনপ্রিয় ও ট্রেন্ডিং পণ্য'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map((relProduct) => (
                <div
                  key={relProduct.id}
                  onClick={() => onSelectRelatedProduct(relProduct)}
                  className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all p-3 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="w-full h-36 bg-gray-50 rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={relProduct.images[0]}
                      alt={relProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                      -{relProduct.discountPercent}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                      {getProductTitle(relProduct, lang)}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-sm font-black text-rose-600 font-mono">
                        ৳{relProduct.price.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-400 line-through font-mono">
                        ৳{relProduct.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRelatedProduct(relProduct);
                    }}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg bg-gray-100 group-hover:bg-rose-600 group-hover:text-white text-gray-800 text-xs font-bold transition-colors text-center cursor-pointer"
                  >
                    {lang === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Floating Action Bar for 1-Tap Purchase */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:hidden flex items-center gap-2 shadow-2xl">
        <button
          onClick={handleAddToCartWithFeedback}
          className="flex-1 py-3 px-2 rounded-xl border border-rose-600 text-rose-600 bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{lang === 'en' ? 'Add to Cart' : 'কার্টে যোগ'}</span>
        </button>

        <button
          onClick={() => onFastBuyNow(product, quantity, selectedColor, selectedSize)}
          className="flex-2 py-3 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{lang === 'en' ? 'Order Now' : 'সরাসরি অর্ডার করুন'}</span>
        </button>
      </div>

    </div>
  );
};
