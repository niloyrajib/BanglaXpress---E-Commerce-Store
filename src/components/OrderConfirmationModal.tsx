import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Copy,
  Check,
  Printer,
  Truck,
  Phone,
  Package,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  X
} from 'lucide-react';
import { Order } from '../types';
import { STORE_SETTINGS } from '../data/mockData';
import { BanglaXpressLogo } from './BanglaXpressLogo';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
  lang?: 'en' | 'bn';
  title?: string;
  isMerchantReceipt?: boolean;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  lang = 'bn',
  title,
  isMerchantReceipt = false
}) => {
  if (!order) return null;

  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `BX-INV-${order.id.replace('#', '')}`;
  const isPaid = order.paymentStatus === 'paid';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-h-none print:max-w-none print:w-full print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating (X) Close Option for Customers & Admins */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-white/95 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center border border-gray-200 shadow-sm transition-all cursor-pointer print:hidden group"
          title="রিসিট বন্ধ করুন (Close Receipt)"
          aria-label="Close receipt"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
        </button>

        {/* ============================================================== */}
        {/* OFFICIAL BANGLAXPRESS MONEY RECEIPT & INVOICE HEADER           */}
        {/* ============================================================== */}
        <div className="p-6 text-center bg-gradient-to-b from-emerald-50/90 via-teal-50/40 to-white border-b border-gray-200 relative">
          {/* Top Success Floating Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold mb-3 shadow-2xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {title
                ? title
                : isMerchantReceipt
                ? lang === 'en'
                  ? 'Official Store Money Receipt & Cash Memo'
                  : 'অফিশিয়াল মানি রিসিট ও ক্যাশ চালান'
                : lang === 'en'
                ? 'Order Placed Successfully!'
                : 'অর্ডারটি সফলভাবে গৃহীত হয়েছে (Order Placed)'}
            </span>
          </div>

          {/* OFFICIAL BANGLAXPRESS LOGO ON MONEY RECEIPT */}
          <div className="my-2 flex justify-center">
            <BanglaXpressLogo
              variant="receipt"
              size="md"
              showTagline={true}
              showWebsite={true}
              className="drop-shadow-xs"
            />
          </div>

          {/* Official Money Receipt Badge */}
          <div className="mt-3">
            <span className="inline-block px-3 py-0.5 rounded-md bg-gray-900 text-white font-mono text-[10.5px] uppercase font-bold tracking-widest shadow-2xs">
              {lang === 'en' ? 'Official Money Receipt • CASH MEMO' : 'মানি রিসিট ও ক্যাশ মেমো • CASH MEMO'}
            </span>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {lang === 'en' ? 'Official receipt of your order. Please save this invoice.' : 'আপনার ক্রয়ের অফিশিয়াল মানি রিসিট। চালানটি সংরক্ষণ করুন।'}
            </p>
          </div>

          {/* Order ID & Invoice Metadata Row */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-gray-500 font-medium">{lang === 'en' ? 'Order ID:' : 'অর্ডার আইডি:'}</span>
              <span className="font-bold font-mono text-gray-900">
                {order.id.startsWith('#') ? order.id : `#${order.id}`}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="ml-1 p-0.5 hover:bg-gray-100 text-gray-600 rounded transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 rounded-xl shadow-2xs font-mono text-gray-600">
              <span className="text-gray-400">{lang === 'en' ? 'Invoice:' : 'ইনভয়েস:'}</span>
              <span className="font-semibold text-gray-800">{invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RECEIPT / INVOICE BODY                                         */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Customer & Delivery Bill To */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 text-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/80">
              <span className="font-bold text-gray-900 uppercase tracking-wider text-[10.5px]">
                {lang === 'en' ? 'Customer & Delivery Info (Bill To)' : 'গ্রাহক ও ডেলিভারি বিবরণ (Bill To)'}
              </span>
              <span className="text-[10.5px] font-mono text-gray-500">
                {lang === 'en' ? 'Date: ' : 'তারিখ: '}{order.createdAt || new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-gray-400 block text-[10px]">{lang === 'en' ? 'Customer Name:' : 'গ্রাহকের নাম:'}</span>
                <span className="font-bold text-gray-900 text-xs">{order.customerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">{lang === 'en' ? 'Phone Number:' : 'মোবাইল নাম্বার:'}</span>
                <span className="font-bold font-mono text-gray-900 text-xs">{order.phone}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-gray-400 block text-[10px]">{lang === 'en' ? 'Delivery Address:' : 'ডেলিভারি ঠিকানা:'}</span>
              <span className="font-medium text-gray-900 leading-snug block">
                {order.address} {order.district ? `, ${order.district}` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-200/60">
              <div>
                <span className="text-gray-400 block text-[10px]">{lang === 'en' ? 'Payment Method:' : 'পেমেন্ট মেথড:'}</span>
                <span className="font-bold uppercase text-gray-900 text-[11px]">
                  {order.paymentMethod === 'cod' ? (lang === 'en' ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (COD)') : order.paymentMethod}
                </span>
                <span
                  className={`ml-1.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                    isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">{lang === 'en' ? 'Delivery Zone:' : 'ডেলিভারি জোন:'}</span>
                <span className="font-semibold text-gray-800 text-[11px] flex items-center gap-1">
                  <Truck className="w-3 h-3 text-emerald-600" />
                  <span>{order.cityDivision}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'en' ? 'Purchased Items List' : 'অর্ডারকৃত পণ্যের তালিকা (Purchased Items)'}</span>
              </h4>
              <span className="text-[11px] text-gray-500 font-mono">
                {order.items.length} {lang === 'en' ? 'items' : 'টি আইটেম'}
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-gray-100 bg-white">
              {order.items.map((it, i) => (
                <div key={i} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-50"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 leading-snug truncate max-w-xs sm:max-w-sm">
                        {it.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        {it.color && <span>{lang === 'en' ? 'Color: ' : 'কালার: '}{it.color}</span>}
                        {it.color && <span>•</span>}
                        <span>{lang === 'en' ? 'Qty: ' : 'পরিমাণ: '}{it.quantity}</span>
                        <span>•</span>
                        <span className="font-mono">৳{it.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900 font-mono text-xs">
                      ৳{(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Financial Calculation */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-0.5">
              <span>{lang === 'en' ? 'Subtotal:' : 'সাবটোটাল (পণ্যমূল্য):'}</span>
              <span className="font-mono font-semibold text-gray-900">
                ৳{order.subtotal.toLocaleString()}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between py-0.5 text-emerald-700 font-semibold">
                <span>{lang === 'en' ? 'Discount Voucher' : 'ডিসকাউন্ট ভাউচার'} {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                <span className="font-mono">-৳{order.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between py-0.5">
              <span>{lang === 'en' ? 'Delivery Charge' : 'ডেলিভারি চার্জ'} ({order.cityDivision}):</span>
              <span className="font-mono font-semibold text-gray-900">
                ৳{order.deliveryCharge.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-2.5 border-t border-gray-300">
              <span className="flex items-center gap-1.5">
                <span>{lang === 'en' ? 'Total Payable:' : 'সর্বমোট প্রদেয় বিল (Total Payable):'}</span>
              </span>
              <span className="text-lg font-black text-emerald-700 font-mono">
                ৳{order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Money Receipt Official Verification & Seal */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-950 text-[11.5px]">
                  BanglaXpress অফিশিয়াল মানি রিসিট
                </p>
                <p className="text-[10px] text-emerald-700">
                  ২৪/৭ হেল্পলাইন: {STORE_SETTINGS.phone} • banglaxpress.store
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9.5px] font-mono font-bold text-gray-500 uppercase tracking-wider block">
                Official Seal
              </span>
              <span className="text-[10px] font-bold text-emerald-800">✓ Verified</span>
            </div>
          </div>

          {/* Action Buttons (Hidden when printing paper receipt) */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 print:hidden">
            <button
              type="button"
              onClick={() => {
                onClose();
                onTrackOrder(order.id);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'en' ? 'Track Live Parcel' : 'লাইভ পার্সেল ট্র্যাক করুন'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-gray-700" />
              <span>{lang === 'en' ? 'Print Money Receipt' : 'প্রিন্ট মানি রিসিট'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-[#006838] hover:bg-[#005a30] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              {isMerchantReceipt
                ? lang === 'en'
                  ? 'Done / Close Receipt'
                  : 'সম্পন্ন / বন্ধ করুন'
                : lang === 'en'
                ? 'Continue Shopping'
                : 'শপিং চালিয়ে যান'}
            </button>
          </div>

        </div>

        {/* Printable Footer Stamp */}
        <div className="hidden print:block p-4 border-t border-gray-300 text-center text-[10px] text-gray-500">
          <p>This is a computer-generated money receipt from BanglaXpress Store (banglaxpress.store).</p>
          <p>Helpline: {STORE_SETTINGS.phone} | Shop More, Live Better</p>
        </div>

      </div>
    </div>
  );
};
