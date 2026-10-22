import React from 'react';
import { Phone, MessageCircle, Truck, UserCheck, Sparkles } from 'lucide-react';
import { STORE_SETTINGS } from '../../data/mockData';
import { ThemeConfig } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';

interface TopBarProps {
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
  lang: 'en' | 'bn';
  setLang: (l: 'en' | 'bn') => void;
  announcementConfig?: ThemeConfig['announcementBar'];
  onOpenThemeCustomizer?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenTracking,
  onOpenAdmin,
  lang,
  setLang,
  announcementConfig,
  onOpenThemeCustomizer
}) => {
  if (announcementConfig && !announcementConfig.enabled) {
    return null;
  }

  const t = TRANSLATIONS[lang];
  const phone = announcementConfig?.phone || STORE_SETTINGS.phone;
  const whatsapp = announcementConfig?.whatsapp || STORE_SETTINGS.whatsapp;
  const announcementText =
    announcementConfig?.text ||
    t.topAnnouncement;
  const bgColor = announcementConfig?.bgColor || '#0f172a';
  const textColor = announcementConfig?.textColor || '#cbd5e1';

  return (
    <div
      id="top-announcement-bar"
      style={{ backgroundColor: bgColor, color: textColor }}
      className="text-xs py-2 border-b border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Hotline & WhatsApp */}
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
          <a
            id="topbar-phone-link"
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold text-white tracking-wide">
              {t.hotline}: {phone}
            </span>
          </a>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <a
            id="topbar-whatsapp-link"
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t.whatsappOrder}</span>
          </a>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden lg:flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>{announcementText}</span>
          </span>
        </div>

        {/* Right: Quick actions & Theme Customizer / Admin toggle */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {onOpenThemeCustomizer && (
            <button
              id="topbar-customize-theme-btn"
              onClick={onOpenThemeCustomizer}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all text-[11px] font-bold"
              title="শপিফাই নো-কোড থিম এডিটর ওপেন করুন"
            >
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>🎨 {t.customizeTheme}</span>
            </button>
          )}

          <button
            id="topbar-track-order-btn"
            onClick={onOpenTracking}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.trackOrder}</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            id="topbar-admin-portal-btn"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 hover:text-white border border-rose-500/30 transition-all text-[11px] font-medium cursor-pointer"
            title="Shop Admin Panel & Order Fulfillment Dashboard"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.shopAdmin}</span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Language Switch */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80 shadow-xs">
            <button
              id="lang-btn-bn"
              onClick={() => setLang('bn')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                lang === 'bn'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="বাংলা ভাষা নির্বাচন করুন"
            >
              <span className="text-[10px]">🇧🇩</span>
              <span>বাংলা</span>
            </button>
            <button
              id="lang-btn-en"
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Switch to English"
            >
              <span className="text-[10px]">🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
