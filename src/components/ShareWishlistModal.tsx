import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, MessageCircle, ExternalLink, QrCode, Send, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { getProductTitle } from '../utils/translations';

interface ShareWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  lang?: 'en' | 'bn';
}

export const ShareWishlistModal: React.FC<ShareWishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  lang = 'bn'
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen || wishlist.length === 0) return null;

  // Calculate totals
  const totalAmount = wishlist.reduce((sum, item) => sum + item.price, 0);
  const totalOriginal = wishlist.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  const totalSavings = Math.max(0, totalOriginal - totalAmount);

  // Generate shareable URL with product IDs encoded
  const productIds = wishlist.map((p) => p.id).join(',');
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareUrl = `${currentUrl}?shared_wishlist=${encodeURIComponent(productIds)}`;

  // Formatted chat message
  const itemsTextList = wishlist
    .map((p, idx) => `${idx + 1}. ${getProductTitle(p, lang)} - ৳${p.price.toLocaleString()}`)
    .join('\n');

  const shareMessageBn = `🛍️ BanglaXpress-এ আমার পছন্দের উইশলিস্ট দেখুন (${wishlist.length} টি পণ্য, মোট: ৳${totalAmount.toLocaleString()}):\n\n${itemsTextList}\n\n👉 উইশলিস্ট দেখতে ও অর্ডার করতে এখানে চাপ দিন:\n${shareUrl}`;
  const shareMessageEn = `🛍️ Check out my wishlist on BanglaXpress (${wishlist.length} items, Total: ৳${totalAmount.toLocaleString()}):\n\n${itemsTextList}\n\n👉 View & shop my wishlist here:\n${shareUrl}`;
  const shareMessage = lang === 'en' ? shareMessageEn : shareMessageBn;

  // Handlers
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Ignore
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const tweetText = lang === 'en'
      ? `Check out my BanglaXpress wishlist with ${wishlist.length} awesome items!`
      : `BanglaXpress-এ আমার পছন্দের উইশলিস্টটি দেখুন!`;
    const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tweetText)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'en' ? 'My BanglaXpress Wishlist' : 'আমার পছন্দের উইশলিস্ট',
          text: shareMessage,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                {lang === 'en' ? 'Share Your Wishlist' : 'উইশলিস্ট শেয়ার করুন'}
              </h3>
              <p className="text-[11px] text-rose-100 font-medium leading-none mt-0.5">
                {lang === 'en'
                  ? `Share ${wishlist.length} items with friends & family`
                  : `বন্ধুবান্ধব ও পরিবারের সাথে ${wishlist.length}টি পণ্য শেয়ার করুন`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-gray-800">
          
          {/* Wishlist Overview Summary Card */}
          <div className="p-3.5 bg-gradient-to-br from-rose-50/70 via-orange-50/50 to-amber-50/60 rounded-2xl border border-rose-200/80">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-gray-900">
                  {lang === 'en' ? `${wishlist.length} Items Selected` : `${wishlist.length}টি পছন্দের পণ্য`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-gray-500">
                  {lang === 'en' ? 'Total:' : 'মোট মূল্য:'}
                </span>
                <span className="text-base font-black text-rose-600 font-mono">
                  ৳{totalAmount.toLocaleString()}
                </span>
                {totalSavings > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    {lang === 'en' ? `Save ৳${totalSavings.toLocaleString()}` : `সাশ্রয় ৳${totalSavings.toLocaleString()}`}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail items horizontal preview */}
            <div className="flex items-center gap-2 pt-2.5 overflow-x-auto pb-1 scrollbar-none">
              {wishlist.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="w-12 h-12 rounded-xl border border-white shadow-2xs overflow-hidden bg-white shrink-0 relative group"
                  title={getProductTitle(p, lang)}
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
              {wishlist.length > 5 && (
                <div className="w-12 h-12 rounded-xl bg-white/90 border border-rose-200 text-rose-700 text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                  +{wishlist.length - 5}
                </div>
              )}
              <div className="text-[11px] text-gray-600 ml-1.5 leading-snug">
                {lang === 'en'
                  ? 'Anyone with this link can view these items & add them directly to their cart!'
                  : 'এই লিংকটি পেলে যে কেউ সরাসরি পণ্যগুলো দেখে কার্টে যোগ করে অর্ডার করতে পারবে!'}
              </div>
            </div>
          </div>

          {/* Social Share Channels Grid */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2.5">
              {lang === 'en' ? 'Share Directly via Social Media:' : 'সরাসরি সোশ্যাল মিডিয়ায় শেয়ার করুন:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 transition-all hover:scale-[1.02] cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.186 1.564 5.938l-1.564 5.714 5.86-1.536c1.71.942 3.684 1.484 5.788 1.484 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">WhatsApp</span>
                <span className="text-[10px] text-emerald-600 font-medium">ইনস্ট্যান্ট মেসেজ</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={handleFacebookShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 transition-all hover:scale-[1.02] cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">Facebook</span>
                <span className="text-[10px] text-blue-600 font-medium">টাইমলাইনে শেয়ার</span>
              </button>

              {/* Telegram Button */}
              <button
                type="button"
                onClick={handleTelegramShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-800 transition-all hover:scale-[1.02] cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" />
                </div>
                <span className="text-xs font-bold">Telegram</span>
                <span className="text-[10px] text-sky-600 font-medium">চ্যাটে পাঠান</span>
              </button>

              {/* X / Twitter Button */}
              <button
                type="button"
                onClick={handleTwitterShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 transition-all hover:scale-[1.02] cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs font-bold">X (Twitter)</span>
                <span className="text-[10px] text-gray-500 font-medium">পোস্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Copy Direct Link Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span>{lang === 'en' ? 'Direct Wishlist Link:' : 'সরাসরি উইশলিস্ট লিংক:'}</span>
              <span className="text-[11px] text-gray-400 font-normal">
                {lang === 'en' ? 'One-click shareable' : 'এক ক্লিকে শেয়ারযোগ্য'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-xs font-mono text-gray-800 select-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all pr-8"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{lang === 'en' ? 'Copied!' : 'কপি হয়েছে!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Copy Link' : 'লিংক কপি'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Row: Copy Formatted Chat Text & QR Code Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Copy Formatted Chat Text */}
            <button
              type="button"
              onClick={handleCopyText}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedText
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/80 text-gray-700'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{lang === 'en' ? 'Chat Text Copied!' : 'চ্যাট টেক্সট কপি হয়েছে!'}</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-rose-600" />
                  <span>{lang === 'en' ? 'Copy Text for Chat' : 'চ্যাটের জন্য টেক্সট কপি'}</span>
                </>
              )}
            </button>

            {/* QR Code Toggle or Native Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator ? (
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-3 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'More Share Options...' : 'অন্যান্য অ্যাপে শেয়ার...'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  showQrCode
                    ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/80 text-gray-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-gray-700 group-hover:text-black" />
                <span>{showQrCode ? (lang === 'en' ? 'Hide QR Code' : 'QR কোড লুকান') : (lang === 'en' ? 'Show QR Code' : 'QR কোড দেখুন')}</span>
              </button>
            )}
          </div>

          {/* QR Code Card if toggled */}
          {showQrCode && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-200 space-y-2">
              <span className="text-xs font-bold text-gray-800 block">
                {lang === 'en' ? 'Scan QR Code with Phone Camera:' : 'ফোনের ক্যামেরা দিয়ে স্ক্যান করুন:'}
              </span>
              <div className="inline-block p-2 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <img
                  src={qrCodeUrl}
                  alt="Wishlist QR Code"
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                {lang === 'en'
                  ? 'Open mobile camera to view and shop this wishlist immediately.'
                  : 'ক্যামেরা তাক করলেই সরাসরি উইশলিস্টটি ওপেন হবে।'}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer transition-colors"
          >
            {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>

      </div>
    </div>
  );
};
