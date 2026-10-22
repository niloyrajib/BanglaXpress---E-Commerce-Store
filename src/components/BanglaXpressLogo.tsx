import React from 'react';

interface BanglaXpressLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'horizontal' | 'compact' | 'receipt';
  showTagline?: boolean;
  showWebsite?: boolean;
  theme?: 'light' | 'dark';
}

export const BanglaXpressLogo: React.FC<BanglaXpressLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showTagline = true,
  showWebsite = true,
  theme = 'light'
}) => {
  // Height / scale mappings
  const sizeStyles = {
    sm: { container: 'h-12', emblem: 'w-10 h-10', text: 'text-base', subtext: 'text-[8px]', website: 'text-[9px] px-2 py-0.5' },
    md: { container: 'h-20', emblem: 'w-16 h-16', text: 'text-2xl', subtext: 'text-[10px]', website: 'text-[11px] px-3 py-1' },
    lg: { container: 'h-28', emblem: 'w-24 h-24', text: 'text-3xl', subtext: 'text-xs', website: 'text-xs px-3.5 py-1' },
    xl: { container: 'h-36', emblem: 'w-32 h-32', text: 'text-4xl', subtext: 'text-sm', website: 'text-sm px-4 py-1.5' }
  }[size];

  // The Bag + BX Speed Lines SVG Emblem
  const Emblem = ({ width = 120, height = 120, className: emblemClass = '' }: { width?: number; height?: number; className?: string }) => (
    <svg
      viewBox="0 0 160 160"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${emblemClass}`}
    >
      {/* Handle of Shopping Bag */}
      <path
        d="M 68 36 C 68 18, 92 18, 92 36"
        stroke="#006838"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Speed lines on left (Green & Red) */}
      <rect x="48" y="42" width="22" height="4.5" rx="2.25" fill="#006838" />
      <rect x="42" y="52" width="26" height="4.5" rx="2.25" fill="#006838" />
      <rect x="28" y="64" width="38" height="4.5" rx="2.25" fill="#e30613" />
      <circle cx="23" cy="66.25" r="2.5" fill="#e30613" />
      <rect x="40" y="76" width="26" height="4.5" rx="2.25" fill="#006838" />
      <rect x="35" y="88" width="31" height="4.5" rx="2.25" fill="#e30613" />

      {/* Main Green Shopping Bag Body with Angled Shape */}
      <path
        d="M 66 36 L 94 36 L 100 114 L 60 114 Z"
        fill="#006838"
        rx="2"
      />

      {/* Stylized White 'B' and speed cutout */}
      <path
        d="M 52 46 C 75 46 92 46 94 54 C 95 58 92 63 85 66 C 94 69 98 76 96 84 C 94 92 84 96 68 96 L 62 108 L 78 108 C 82 108 86 106 88 103 L 64 103 L 68 76 L 78 76 C 85 76 89 74 90 70 C 91 66 87 64 81 64 L 63 64 L 52 46 Z"
        fill="#ffffff"
      />

      {/* Internal cutouts of B */}
      <path
        d="M 72 54 L 80 54 C 84 54 86 56 85 58 C 84 60 82 61 78 61 L 70 61 Z"
        fill="#006838"
      />
      <path
        d="M 70 70 L 82 70 C 86 70 88 73 87 76 C 86 79 83 81 78 81 L 68 81 Z"
        fill="#006838"
      />

      {/* Red 'X' Accent on the right of the bag */}
      <path
        d="M 82 82 L 102 114 L 91 114 L 74 88 Z"
        fill="#e30613"
      />
      <path
        d="M 85 82 L 100 58 L 91 58 L 78 78 Z"
        fill="#e30613"
      />
    </svg>
  );

  // Variant: Receipt / Money Receipt Special Format (Clear, High Contrast, Centered for Invoice)
  if (variant === 'receipt') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Emblem */}
        <div className="relative mb-0.5">
          <Emblem width={64} height={64} />
        </div>

        {/* Wordmark: BANGLAXPRESS */}
        <div className="flex items-center justify-center leading-none tracking-tight">
          <span className="font-black text-xl sm:text-2xl text-[#006838] tracking-tighter">
            BANGLA
          </span>
          <span className="font-black text-xl sm:text-2xl text-[#e30613] italic tracking-tight ml-0.5">
            XPRESS
          </span>
        </div>

        {/* Tagline with green & red side lines */}
        {showTagline && (
          <div className="flex items-center justify-center gap-2 mt-1 w-full max-w-[240px]">
            <div className="h-[1.5px] bg-[#006838] flex-1 rounded-full" />
            <span className="text-[8.5px] sm:text-[9.5px] font-bold text-gray-800 tracking-wider uppercase whitespace-nowrap">
              SHOP MORE, LIVE BETTER
            </span>
            <div className="h-[1.5px] bg-[#e30613] flex-1 rounded-full" />
          </div>
        )}

        {/* Website Pill */}
        {showWebsite && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 bg-[#005a30] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-2xs">
            <svg
              className="w-2.5 h-2.5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span className="tracking-wide">banglaxpress.store</span>
          </div>
        )}
      </div>
    );
  }

  // Variant: Horizontal (ideal for navbars, compact headers)
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <Emblem width={44} height={44} />
        <div className="flex flex-col">
          <div className="flex items-center leading-none">
            <span
              className={`font-black text-lg sm:text-xl tracking-tighter ${
                theme === 'dark' ? 'text-white' : 'text-[#006838]'
              }`}
            >
              BANGLA
            </span>
            <span className="font-black text-lg sm:text-xl text-[#e30613] italic tracking-tight ml-0.5">
              XPRESS
            </span>
          </div>
          {showTagline && (
            <span
              className={`text-[7.5px] sm:text-[8.5px] font-bold tracking-wider uppercase mt-0.5 ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              SHOP MORE, LIVE BETTER
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant: Compact (single row, no tagline)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <Emblem width={36} height={36} />
        <div className="flex items-center leading-none">
          <span
            className={`font-black text-base sm:text-lg tracking-tighter ${
              theme === 'dark' ? 'text-white' : 'text-[#006838]'
            }`}
          >
            BANGLA
          </span>
          <span className="font-black text-base sm:text-lg text-[#e30613] italic tracking-tight ml-0.5">
            XPRESS
          </span>
        </div>
      </div>
    );
  }

  // Variant: Full Stacked (Standard)
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Emblem */}
      <Emblem width={size === 'sm' ? 44 : size === 'md' ? 68 : size === 'lg' ? 96 : 120} height={size === 'sm' ? 44 : size === 'md' ? 68 : size === 'lg' ? 96 : 120} />

      {/* Wordmark: BANGLAXPRESS */}
      <div className="flex items-center justify-center leading-none mt-1">
        <span
          className={`font-black tracking-tighter ${
            theme === 'dark' ? 'text-white' : 'text-[#006838]'
          } ${sizeStyles.text}`}
        >
          BANGLA
        </span>
        <span className={`font-black text-[#e30613] italic tracking-tight ml-1 ${sizeStyles.text}`}>
          XPRESS
        </span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <div className="flex items-center justify-center gap-2 mt-1 w-full max-w-xs px-2">
          <div className="h-[1.5px] bg-[#006838] flex-1 rounded-full" />
          <span
            className={`font-bold tracking-wider uppercase whitespace-nowrap ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-800'
            } ${sizeStyles.subtext}`}
          >
            SHOP MORE, LIVE BETTER
          </span>
          <div className="h-[1.5px] bg-[#e30613] flex-1 rounded-full" />
        </div>
      )}

      {/* Website Badge */}
      {showWebsite && (
        <div className={`mt-1.5 inline-flex items-center gap-1.5 bg-[#005a30] text-white rounded-full font-bold shadow-xs ${sizeStyles.website}`}>
          <svg
            className="w-3 h-3 fill-current shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <span className="tracking-wide">banglaxpress.store</span>
        </div>
      )}
    </div>
  );
};
