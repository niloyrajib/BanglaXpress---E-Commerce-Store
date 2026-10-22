import React, { useState } from 'react';
import { X, Trash2, Heart, ShoppingCart, Zap, Share2, Copy, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { getProductTitle } from '../utils/translations';
import { ShareWishlistModal } from './ShareWishlistModal';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onFastBuyNow: (product: Product) => void;
  onAddAllToCart?: (products: Product[]) => void;
  lang?: 'en' | 'bn';
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onFastBuyNow,
  onAddAllToCart,
  lang = 'bn'
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedQuickLink, setCopiedQuickLink] = useState(false);

  if (!isOpen) return null;

  // Calculate totals
  const totalAmount = wishlist.reduce((sum, item) => sum + item.price, 0);

  // Quick share URL
  const productIds = wishlist.map((p) => p.id).join(',');
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareUrl = `${currentUrl}?shared_wishlist=${encodeURIComponent(productIds)}`;

  const handleQuickCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedQuickLink(true);
      setTimeout(() => setCopiedQuickLink(false), 2200);
    } catch {
      setIsShareModalOpen(true);
    }
  };

  const handleQuickWhatsApp = () => {
    const text = lang === 'en'
      ? `🛍️ Check out my wishlist on BanglaXpress (${wishlist.length} items, Total: ৳${totalAmount.toLocaleString()}):\n${shareUrl}`
      : `🛍️ BanglaXpress-এ আমার পছন্দের উইশলিস্ট দেখুন (${wishlist.length} টি পণ্য, মোট: ৳${totalAmount.toLocaleString()}):\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddAll = () => {
    if (onAddAllToCart) {
      onAddAllToCart(wishlist);
    } else {
      wishlist.forEach((p) => onAddToCart(p));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
        <div
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-rose-600 text-white shadow-xs">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-white" />
              <h2 className="text-sm font-bold tracking-wide">
                {lang === 'en' ? `Wishlist (${wishlist.length})` : `পছন্দের তালিকা / উইশলিস্ট (${wishlist.length})`}
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5">
              {wishlist.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title={lang === 'en' ? 'Share Wishlist' : 'উইশলিস্ট শেয়ার করুন'}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Share' : 'শেয়ার'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-rose-700 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Share Strip when items exist */}
          {wishlist.length > 0 && (
            <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 px-4 py-2.5 border-b border-rose-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {lang === 'en' ? 'Share your picks with friends:' : 'পছন্দের পণ্যগুলো বন্ধুদের পাঠান:'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* WhatsApp Quick Button */}
                <button
                  type="button"
                  onClick={handleQuickWhatsApp}
                  className="px-2 py-1 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="WhatsApp-এ শেয়ার করুন"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.186 1.564 5.938l-1.564 5.714 5.86-1.536c1.71.942 3.684 1.484 5.788 1.484 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Quick Copy Link Button */}
                <button
                  type="button"
                  onClick={handleQuickCopyLink}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs border ${
                    copiedQuickLink
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                  title="লিংক কপি করুন"
                >
                  {copiedQuickLink ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{lang === 'en' ? 'Copied' : 'কপি হয়েছে'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{lang === 'en' ? 'Copy Link' : 'লিংক'}</span>
                    </>
                  )}
                </button>

                {/* More Share Modal Trigger */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Share All' : 'সব অপশন'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-gray-800">
                  {lang === 'en' ? 'Your Wishlist is Empty' : 'উইশলিস্ট খালি রয়েছে'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'en'
                    ? 'Click the heart icon on any product to save it here for later.'
                    : 'যেকোনো পণ্যের হৃদপিণ্ড (Heart) আইকনে চাপ দিলে তা এখানে জমা থাকবে।'}
                </p>
              </div>
            ) : (
              wishlist.map((prod) => (
                <div key={prod.id} className="py-3 flex gap-3 items-center group">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {getProductTitle(prod, lang)}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-rose-600 font-mono">
                        ৳{prod.price.toLocaleString()}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-[11px] text-gray-400 line-through font-mono">
                          ৳{prod.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onAddToCart(prod)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Cart' : 'কার্ট'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onFastBuyNow(prod);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Zap className="w-3 h-3 fill-white" />
                        <span>{lang === 'en' ? 'Order' : 'অর্ডার'}</span>
                      </button>
                      <button
                        onClick={() => onRemoveFromWishlist(prod.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 ml-auto cursor-pointer transition-colors"
                        title={lang === 'en' ? 'Remove' : 'বাদ দিন'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Add All to Cart and Share Wishlist */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2.5">
            {wishlist.length > 0 && (
              <div className="flex items-center justify-between pb-1 text-xs">
                <span className="font-bold text-gray-600">
                  {lang === 'en' ? `Total (${wishlist.length} items):` : `সর্বমোট (${wishlist.length} টি পণ্য):`}
                </span>
                <span className="text-base font-black text-rose-600 font-mono">
                  ৳{totalAmount.toLocaleString()}
                </span>
              </div>
            )}

            {wishlist.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'en' ? 'Add All to Cart' : 'সব কার্টে নিন'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Share Wishlist' : 'উইশলিস্ট শেয়ার'}</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer transition-colors"
            >
              {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
            </button>
          </div>

        </div>
      </div>

      {/* Share Wishlist Modal */}
      <ShareWishlistModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        wishlist={wishlist}
        lang={lang}
      />
    </>
  );
};

