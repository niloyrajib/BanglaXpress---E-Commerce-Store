import React, { useState } from 'react';
import { LayoutGrid, Flame, Sparkles, Tag, ChevronDown, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types';
import { TRANSLATIONS, getCategoryDisplayName } from '../../utils/translations';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onScrollToFlashSale: () => void;
  onOpenTracking: () => void;
  lang?: 'en' | 'bn';
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onScrollToFlashSale,
  onOpenTracking,
  lang = 'bn'
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  return (
    <nav className="bg-white border-b border-gray-100 hidden md:block relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* All Categories Dropdown Menu */}
        <div className="relative">
          <button
            id="all-categories-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t.allCategories}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Dropdown Menu */}
          {dropdownOpen && (
            <div
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute top-full left-0 w-64 bg-white border border-gray-200 shadow-xl rounded-b-xl z-50 py-2 divide-y divide-gray-100 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                  selectedCategory === 'all' ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                }`}
              >
                <span>{lang === 'en' ? 'All Products' : 'সব প্রোডাক্ট (All Products)'}</span>
                <span className="text-[11px] text-gray-400">View all</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                    selectedCategory === cat.name ? 'bg-rose-50 text-rose-600 font-bold' : 'text-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{getCategoryDisplayName(cat, lang)}</span>
                    <span className="text-[10px] text-gray-400">
                      {lang === 'bn' ? cat.name : (cat.banglaName || '')}
                    </span>
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                    {cat.itemCount}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Quick Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-4 lg:gap-6 text-xs font-medium text-gray-700">
          <button
            onClick={() => onSelectCategory('all')}
            className={`py-3 hover:text-rose-600 transition-colors flex items-center gap-1 ${
              selectedCategory === 'all' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : ''
            }`}
          >
            <span>{t.home}</span>
          </button>

          <button
            onClick={onScrollToFlashSale}
            className="py-3 text-rose-600 hover:text-rose-700 font-bold transition-colors flex items-center gap-1.5 animate-pulse"
          >
            <Flame className="w-4 h-4 fill-rose-600 text-rose-600" />
            <span>{t.flashDealsNav}</span>
          </button>

          <button
            onClick={() => onSelectCategory('Smart Watches')}
            className={`py-3 hover:text-rose-600 transition-colors ${
              selectedCategory === 'Smart Watches' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : ''
            }`}
          >
            {lang === 'en' ? 'Smart Watches' : 'স্মার্টওয়াচ'}
          </button>

          <button
            onClick={() => onSelectCategory('Earbuds & Audio')}
            className={`py-3 hover:text-rose-600 transition-colors ${
              selectedCategory === 'Earbuds & Audio' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : ''
            }`}
          >
            {lang === 'en' ? 'Earbuds & Audio' : 'ইয়ারবাডস ও অডিও'}
          </button>

          <button
            onClick={() => onSelectCategory("Men's Caps & Fashion")}
            className={`py-3 hover:text-rose-600 transition-colors ${
              selectedCategory === "Men's Caps & Fashion" ? 'text-rose-600 font-bold border-b-2 border-rose-600' : ''
            }`}
          >
            {lang === 'en' ? 'Caps Collection' : 'ক্যাপ কালেকশন'}
          </button>

          <button
            onClick={() => onSelectCategory('Home & Kitchen')}
            className={`py-3 hover:text-rose-600 transition-colors ${
              selectedCategory === 'Home & Kitchen' ? 'text-rose-600 font-bold border-b-2 border-rose-600' : ''
            }`}
          >
            {lang === 'en' ? 'Home Appliances' : 'হোম এপ্লায়েন্স'}
          </button>

          <button
            onClick={onOpenTracking}
            className="py-3 text-sky-600 hover:text-sky-700 font-medium transition-colors flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.orderTrackingNav}</span>
          </button>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold">{t.codBadgeNav}</span>
          </div>
        </div>

      </div>
    </nav>
  );
};
