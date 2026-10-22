import React from 'react';
import { X, Flame, Truck, Phone, MessageCircle, UserCheck, LayoutGrid, ChevronRight, Zap, Scale, Globe } from 'lucide-react';
import { Category } from '../types';
import { STORE_SETTINGS } from '../data/mockData';
import { TRANSLATIONS, getCategoryDisplayName } from '../utils/translations';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectCategory: (cat: string) => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
  onScrollToFlash: () => void;
  compareCount?: number;
  onOpenCompare?: () => void;
  lang?: 'en' | 'bn';
  onSelectLanguage?: (lang: 'en' | 'bn') => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  onSelectCategory,
  onOpenTracking,
  onOpenAdmin,
  onScrollToFlash,
  compareCount = 0,
  onOpenCompare,
  lang = 'bn',
  onSelectLanguage
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-start">
      <div
        className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight font-sans">
              Bangla<span className="text-rose-500">Xpress</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Bar inside Mobile Drawer */}
        {onSelectLanguage && (
          <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'en' ? 'Language' : 'ভাষা নির্বাচন'}</span>
            </span>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => onSelectLanguage('bn')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  lang === 'bn' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇧🇩</span> বাংলা
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇬🇧</span> EN
              </button>
            </div>
          </div>
        )}

        {/* Links list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
          
          <div className="space-y-1">
            <button
              onClick={() => {
                onScrollToFlash();
                onClose();
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 fill-rose-600 text-rose-600" />
                <span>{lang === 'en' ? 'Flash Deals' : 'ফ্ল্যাশ ডিলস (Flash Deals)'}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onOpenTracking();
                onClose();
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-gray-100 text-slate-800 text-xs font-semibold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>{t.trackOrder}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {onOpenCompare && (
              <button
                onClick={() => {
                  onOpenCompare();
                  onClose();
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-rose-50 text-slate-800 hover:text-rose-600 text-xs font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-500" />
                  <span>{lang === 'en' ? `Compare Products (${compareCount})` : `পণ্য তুলনা (${compareCount} টি)`}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="pt-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-3">
              {t.allCategories}
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onClose();
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{lang === 'en' ? 'All Products' : 'সব প্রোডাক্ট (All Products)'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCategory(c.name);
                    onClose();
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-xs font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-between"
                >
                  <span>{getCategoryDisplayName(c, lang)}</span>
                  <span className="text-[10px] text-gray-400">{c.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
          <a
            href={`tel:${STORE_SETTINGS.phone}`}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-rose-400" />
            <span>{lang === 'en' ? `Call Us: ${STORE_SETTINGS.phone}` : `কল করুন: ${STORE_SETTINGS.phone}`}</span>
          </a>

          <button
            onClick={() => {
              onOpenAdmin();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl border border-rose-300 text-rose-600 bg-rose-50 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.shopAdmin}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
