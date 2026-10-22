/**
 * Comprehensive Color & HEX Code Utility for BanglaXpress & Shopify Variants
 * Supports color name-to-HEX resolution and advanced HEX color auto-detection with names
 * (e.g. #F54927 -> Bright Red-Orange / Vermilion)
 */

export interface ColorDefinition {
  name: string;
  hex: string;
}

export interface ColorAnalysis {
  hex: string;
  name: string;
  alias?: string;
  description: string;
  banglaName: string;
  family: string;
  temperature: 'warm' | 'cool' | 'neutral';
  isLight: boolean;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export interface ColorPaletteEntry {
  hex: string;
  name: string;
  alias?: string;
  family: string;
  banglaName: string;
  description: string;
}

// Master color dictionary mapping standard, fashion, apparel & tech color names to actual HEX codes
export const COLOR_HEX_MAP: Record<string, string> = {
  // Vibrant Reds, Red-Oranges & Vermilion
  'bright red-orange': '#F54927',
  'red-orange': '#F54927',
  vermilion: '#F54927',
  'bright vermilion': '#F54927',
  flame: '#E25822',
  persimmon: '#EC5800',
  scarlet: '#FF2400',
  'orange-red': '#FF4500',
  'deep orange': '#FF5722',

  // Blacks & Darks
  black: '#0f172a',
  'jet black': '#000000',
  'midnight black': '#09090b',
  'matte black': '#18181b',
  'phantom black': '#111827',
  'graphite black': '#1f2937',
  charcoal: '#334155',
  'dark gray': '#4b5563',
  'dark grey': '#4b5563',
  onyx: '#1c1917',
  ebony: '#18181b',

  // Whites & Lights
  white: '#ffffff',
  'pure white': '#ffffff',
  'polar white': '#f8fafc',
  'arctic white': '#f8fafc',
  'cosmic white': '#f8fafc',
  'off white': '#fafaf9',
  cream: '#fef3c7',
  'warm cream white': '#fdf6e2',
  ivory: '#fffff0',
  pearl: '#fdfbf7',
  snow: '#fcfcfc',
  milky: '#fefefe',

  // Grays & Silvers
  silver: '#cbd5e1',
  'metallic silver': '#94a3b8',
  'titanium silver': '#cbd5e1',
  gray: '#9ca3af',
  grey: '#9ca3af',
  slate: '#64748b',
  'slate gray': '#64748b',
  'slate grey': '#64748b',
  ash: '#9ca3af',
  'ash gray': '#d1d5db',
  'space gray': '#475569',
  'space grey': '#475569',

  // Blues
  blue: '#2563eb',
  'navy blue': '#1e3a8a',
  navy: '#000080',
  'dark navy': '#172554',
  'deep navy blue': '#1e3a8a',
  'royal blue': '#1d4ed8',
  'sky blue': '#38bdf8',
  'light blue': '#93c5fd',
  'baby blue': '#bfdbfe',
  'ice blue': '#e0f2fe',
  cobalt: '#1e40af',
  cyan: '#06b6d4',
  teal: '#0d9488',
  turquoise: '#2dd4bf',
  aqua: '#00ffff',
  denim: '#2563eb',
  sapphire: '#0f52ba',
  ocean: '#0284c7',

  // Reds & Maroons
  red: '#dc2626',
  'ruby red': '#be123c',
  crimson: '#991b1b',
  maroon: '#800000',
  burgundy: '#831843',
  wine: '#701a75',
  cherry: '#9f1239',
  blood: '#881337',
  brick: '#9a3412',
  chilli: '#b91c1c',

  // Pinks & Magentas
  pink: '#ec4899',
  'light pink': '#fbcfe8',
  'baby pink': '#fce7f3',
  'pastel pink': '#f472b6',
  'sakura pink': '#f472b6',
  'hot pink': '#db2777',
  'deep pink': '#be185d',
  rose: '#f43f5e',
  'dusty rose': '#fda4af',
  'rose gold': '#e0a99e',
  magenta: '#d946ef',
  fuchsia: '#d946ef',
  blush: '#fecdd3',

  // South Asian & Unique Apparel Colors
  paste: '#7fd1b9',
  'mint paste': '#7ee0cb',
  'pesta': '#a7f3d0',
  'pistachio': '#a7f3d0',
  mint: '#6ee7b7',
  'mint green': '#6ee7b7',
  seafoam: '#80e0d0',

  // Greens
  green: '#16a34a',
  'forest green': '#15803d',
  'dark green': '#14532d',
  'emerald green': '#059669',
  emerald: '#10b981',
  olive: '#65a30d',
  'olive green': '#4d7c0f',
  lime: '#84cc16',
  'lime green': '#65a30d',
  army: '#3f6212',
  'army green': '#3f6212',
  khaki: '#78716c',
  'military khaki': '#78716c',
  sage: '#84cc16',
  'sage green': '#84cc16',

  // Oranges & Yellows
  orange: '#ea580c',
  'ocean orange': '#ea580c',
  'burnt orange': '#c2410c',
  tangerine: '#f97316',
  coral: '#fb7185',
  peach: '#fed7aa',
  salmon: '#fb7185',
  yellow: '#eab308',
  'bright yellow': '#facc15',
  'lemon yellow': '#fde047',
  mustard: '#ca8a04',
  amber: '#d97706',
  gold: '#d97706',
  golden: '#eab308',
  'antique gold': '#b45309',
  bronze: '#92400e',
  copper: '#b45309',

  // Purples & Violets
  purple: '#9333ea',
  violet: '#7c3aed',
  lavender: '#c084fc',
  lilac: '#e9d5ff',
  indigo: '#4f46e5',
  plum: '#581c87',
  mauve: '#c084fc',

  // Browns & Earth Tones
  brown: '#78350f',
  chocolate: '#451a03',
  coffee: '#3e2723',
  tan: '#d97706',
  beige: '#f5f5dc',
  camel: '#c2410c',
  taupe: '#78716c',
  sand: '#fef3c7',
  caramel: '#b45309'
};

// Comprehensive reference palette of named shades for accurate nearest-neighbor auto-detection
export const REFERENCE_PALETTE: ColorPaletteEntry[] = [
  // Red-Oranges & Vermilion (Explicitly handling user example #F54927)
  {
    hex: '#F54927',
    name: 'Bright Red-Orange',
    alias: 'Bright Vermilion',
    family: 'Red-Orange',
    banglaName: 'উজ্জ্বল লালচে কমলা (Bright Red-Orange)',
    description: 'A vibrant, warm shade of bright red-orange (or bright vermilion)'
  },
  {
    hex: '#E34234',
    name: 'Vermilion',
    alias: 'Cinnabar',
    family: 'Red-Orange',
    banglaName: 'ভার্মিলিয়ন / সিঁদুরে লাল (Vermilion)',
    description: 'A brilliant, warm scarlet shade of vermilion'
  },
  {
    hex: '#FF4500',
    name: 'Orange-Red',
    alias: 'Flame Red',
    family: 'Red-Orange',
    banglaName: 'কমলাটে লাল (Orange-Red)',
    description: 'An intense, radiant blend of fiery red and orange'
  },
  {
    hex: '#FF5722',
    name: 'Deep Orange',
    alias: 'Sunset Flame',
    family: 'Orange',
    banglaName: 'গাঢ় কমলা (Deep Orange)',
    description: 'A bold, saturated warm sunset shade of deep orange'
  },
  {
    hex: '#EA580C',
    name: 'Vibrant Orange',
    alias: 'Tangerine',
    family: 'Orange',
    banglaName: 'উজ্জ্বল কমলা (Vibrant Orange)',
    description: 'A lively, radiant shade of pure energetic orange'
  },
  {
    hex: '#C2410C',
    name: 'Burnt Orange',
    alias: 'Rust Orange',
    family: 'Orange',
    banglaName: 'বার্নট অরেঞ্জ / পোড়া কমলা',
    description: 'A rich, earthy autumn shade of burnt orange'
  },

  // Reds
  {
    hex: '#DC2626',
    name: 'Bright Red',
    alias: 'Crimson Scarlet',
    family: 'Red',
    banglaName: 'উজ্জ্বল লাল (Bright Red)',
    description: 'A striking, classic pure red with high vitality'
  },
  {
    hex: '#BE123C',
    name: 'Ruby Red',
    alias: 'Carmine',
    family: 'Red',
    banglaName: 'রুবি রেড / রক্তিম লাল',
    description: 'A deep, jewel-toned shade of passionate ruby red'
  },
  {
    hex: '#991B1B',
    name: 'Crimson',
    alias: 'Dark Scarlet',
    family: 'Red',
    banglaName: 'ক্রিমসন / রক্তলাল',
    description: 'A deep, commanding shade of rich crimson red'
  },
  {
    hex: '#800000',
    name: 'Maroon',
    alias: 'Bordeaux',
    family: 'Red',
    banglaName: 'মেরুন (Maroon)',
    description: 'A sophisticated, dark brownish-red wine tone'
  },
  {
    hex: '#831843',
    name: 'Burgundy',
    alias: 'Wine Red',
    family: 'Red',
    banglaName: 'বার্গান্ডি / ওয়াইন রেড',
    description: 'An opulent, deep purplish-red wine shade'
  },

  // Pinks & Rose
  {
    hex: '#E0A99E',
    name: 'Rose Gold',
    alias: 'Metallic Blush',
    family: 'Rose',
    banglaName: 'রোজ গোল্ড (Rose Gold)',
    description: 'A delicate, warm metallic shade of luxurious rose gold'
  },
  {
    hex: '#F472B6',
    name: 'Pastel Pink',
    alias: 'Sakura Pink',
    family: 'Pink',
    banglaName: 'হালকা গোলাপী (Pastel Pink)',
    description: 'A soft, gentle pastel shade of cheerful pink'
  },
  {
    hex: '#EC4899',
    name: 'Hot Pink',
    alias: 'Vivid Pink',
    family: 'Pink',
    banglaName: 'উজ্জ্বল গোলাপী (Hot Pink)',
    description: 'A vibrant, bold punch of playful electric pink'
  },
  {
    hex: '#FB7185',
    name: 'Coral Pink',
    alias: 'Salmon',
    family: 'Pink',
    banglaName: 'কোরাল পিঙ্ক / প্রবাল গোলাপী',
    description: 'A warm, uplifting tropical shade of coral pink'
  },

  // Yellows & Ambers
  {
    hex: '#EAB308',
    name: 'Golden Yellow',
    alias: 'Sunflower',
    family: 'Yellow',
    banglaName: 'সোনালী হলুদ (Golden Yellow)',
    description: 'A warm, sunny golden shade full of energy and light'
  },
  {
    hex: '#D97706',
    name: 'Amber',
    alias: 'Warm Gold',
    family: 'Yellow',
    banglaName: 'অ্যাম্বার / গাঢ় সোনালী',
    description: 'A deep, luminous warm resinous amber tone'
  },
  {
    hex: '#CA8A04',
    name: 'Mustard Yellow',
    alias: 'Ochre',
    family: 'Yellow',
    banglaName: 'সরিষা হলুদ (Mustard)',
    description: 'A trendy, retro earthy shade of warm mustard'
  },

  // Greens
  {
    hex: '#16A34A',
    name: 'Bright Green',
    alias: 'Emerald Flora',
    family: 'Green',
    banglaName: 'উজ্জ্বল সবুজ (Bright Green)',
    description: 'A vivid, lush natural shade of vibrant leafy green'
  },
  {
    hex: '#10B981',
    name: 'Emerald Green',
    alias: 'Jade',
    family: 'Green',
    banglaName: 'পান্না সবুজ (Emerald Green)',
    description: 'A radiant, refreshing jewel tone of pure emerald'
  },
  {
    hex: '#15803D',
    name: 'Forest Green',
    alias: 'Pine Green',
    family: 'Green',
    banglaName: 'গাঢ় সবুজ (Forest Green)',
    description: 'A grounding, deep organic shade of dense forest pine'
  },
  {
    hex: '#84CC16',
    name: 'Lime Green',
    alias: 'Chartreuse',
    family: 'Green',
    banglaName: 'লেমন লাইম (Lime Green)',
    description: 'An electric, zesty yellow-green citrus tone'
  },
  {
    hex: '#65A30D',
    name: 'Olive Green',
    alias: 'Army Green',
    family: 'Green',
    banglaName: 'অলিভ গ্রিন / জলপাই সবুজ',
    description: 'An earthy, distinguished shade of traditional olive'
  },
  {
    hex: '#7FD1B9',
    name: 'Mint Paste',
    alias: 'Pistachio / Seafoam',
    family: 'Green',
    banglaName: 'পেস্ট কালার / মিন্ট গ্রিন (Paste)',
    description: 'A soothing South Asian favorite pastel mint-cyan shade'
  },

  // Blues & Cyans
  {
    hex: '#2563EB',
    name: 'Royal Blue',
    alias: 'Sapphire',
    family: 'Blue',
    banglaName: 'রয়্যাল ব্লু (Royal Blue)',
    description: 'A crisp, confident shade of vivid royal sapphire blue'
  },
  {
    hex: '#1E3A8A',
    name: 'Navy Blue',
    alias: 'Dark Navy',
    family: 'Blue',
    banglaName: 'নেভি ব্লু (Navy Blue)',
    description: 'A distinguished, timeless shade of deep nautical navy'
  },
  {
    hex: '#38BDF8',
    name: 'Sky Blue',
    alias: 'Azure',
    family: 'Blue',
    banglaName: 'আকাশি নীল (Sky Blue)',
    description: 'An airy, clear atmospheric shade of midday sky'
  },
  {
    hex: '#06B6D4',
    name: 'Cyan Blue',
    alias: 'Aqua',
    family: 'Blue',
    banglaName: 'সিয়ান / ফিরোজা (Cyan)',
    description: 'A bright, tropical oceanic tone of pure cyan'
  },
  {
    hex: '#0D9488',
    name: 'Teal',
    alias: 'Dark Cyan',
    family: 'Blue',
    banglaName: 'টিল / নীলচে সবুজ (Teal)',
    description: 'A sophisticated, balanced hybrid of deep blue and green'
  },

  // Purples
  {
    hex: '#9333EA',
    name: 'Vibrant Purple',
    alias: 'Violet',
    family: 'Purple',
    banglaName: 'বেগুনী (Purple)',
    description: 'A rich, majestic shade of royal purple'
  },
  {
    hex: '#4F46E5',
    name: 'Indigo',
    alias: 'Deep Iris',
    family: 'Purple',
    banglaName: 'ইন্ডিগো / নীলচে বেগুনী',
    description: 'A midnight blend bridging electric blue and violet'
  },
  {
    hex: '#C084FC',
    name: 'Lavender',
    alias: 'Lilac',
    family: 'Purple',
    banglaName: 'ল্যাভেন্ডার / হালকা বেগুনী',
    description: 'A gentle, romantic floral pastel lavender'
  },

  // Neutrals, Blacks & Grays
  {
    hex: '#0F172A',
    name: 'Midnight Black',
    alias: 'Dark Slate',
    family: 'Black',
    banglaName: 'মিডনাইট ব্ল্যাক (Midnight Black)',
    description: 'An ultra-modern, deep ink tone with subtle slate undertones'
  },
  {
    hex: '#18181B',
    name: 'Matte Black',
    alias: 'Carbon Black',
    family: 'Black',
    banglaName: 'ম্যাট ব্ল্যাক (Matte Black)',
    description: 'A sleek, contemporary non-reflective carbon black'
  },
  {
    hex: '#000000',
    name: 'Jet Black',
    alias: 'Absolute Black',
    family: 'Black',
    banglaName: 'জেট ব্ল্যাক (Jet Black)',
    description: 'The deepest, purest absolute absence of light'
  },
  {
    hex: '#94A3B8',
    name: 'Metallic Silver',
    alias: 'Slate Silver',
    family: 'Silver',
    banglaName: 'মেটালিক সিলভার (Silver)',
    description: 'A lustrous, tech-inspired shade of anodized aluminum'
  },
  {
    hex: '#CBD5E1',
    name: 'Silver',
    alias: 'Light Titanium',
    family: 'Silver',
    banglaName: 'সিলভার / রূপালী (Silver)',
    description: 'A clean, shimmering light silver gray'
  },
  {
    hex: '#475569',
    name: 'Space Gray',
    alias: 'Titanium Gray',
    family: 'Gray',
    banglaName: 'স্পেস গ্রে (Space Gray)',
    description: 'A premium, modern dark tech gray'
  },
  {
    hex: '#FFFFFF',
    name: 'Pure White',
    alias: 'Bright White',
    family: 'White',
    banglaName: 'সাদা (Pure White)',
    description: 'A clean, luminous, crisp neutral white'
  },
  {
    hex: '#F8FAFC',
    name: 'Arctic White',
    alias: 'Pearl White',
    family: 'White',
    banglaName: 'আর্কটিক হোয়াইট / মুক্তা সাদা',
    description: 'A cool, pristine soft white with subtle luminance'
  },
  {
    hex: '#FEF3C7',
    name: 'Warm Cream',
    alias: 'Ivory',
    family: 'White',
    banglaName: 'ক্রিম / আইভরি (Cream)',
    description: 'A warm, soothing shade of gentle off-white cream'
  },
  {
    hex: '#78350F',
    name: 'Coffee Brown',
    alias: 'Mocha',
    family: 'Brown',
    banglaName: 'কফি ব্রাউন / বাদামী',
    description: 'A warm, rich organic roasted coffee tone'
  },
  {
    hex: '#F5F5DC',
    name: 'Beige',
    alias: 'Sand',
    family: 'Brown',
    banglaName: 'বেইজ / হালকা বাদামী',
    description: 'A calm, understated neutral sand tone'
  }
];

/**
 * Converts any Hex string to RGB
 */
export function hexToRgb(hexInput: string): { r: number; g: number; b: number } {
  let hex = hexInput.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (hex.length !== 6) {
    return { r: 100, g: 116, b: 139 }; // Slate fallback
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

/**
 * Converts RGB to HSL (H: 0-360, S: 0-100, L: 0-100)
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) * 60;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Weighted Euclidean Color Distance (matches human perception of color differences)
 */
function getPerceptualColorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  const rMean = (c1.r + c2.r) / 2;
  const deltaR = c1.r - c2.r;
  const deltaG = c1.g - c2.g;
  const deltaB = c1.b - c2.b;

  return Math.sqrt(
    (2 + rMean / 256) * (deltaR * deltaR) +
      4 * (deltaG * deltaG) +
      (2 + (255 - rMean) / 256) * (deltaB * deltaB)
  );
}

/**
 * Extracts or computes the most authentic HEX code for any given color name or string
 */
export function getColorHex(
  colorInput: string | undefined | null,
  fallbackColors?: { name: string; hex: string }[]
): string {
  if (!colorInput) return '#64748B';

  const raw = String(colorInput).trim();

  // 1. Direct HEX code check (e.g. '#f54927' or '#fff')
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(raw)) {
    return raw.toUpperCase();
  }

  // 2. Check if string starts with hex without hash (e.g. 'F54927')
  if (/^([A-Fa-f0-9]{6})$/.test(raw) || /^([A-Fa-f0-9]{3})$/.test(raw)) {
    return `#${raw.toUpperCase()}`;
  }

  // 3. Check if string contains a hex code inside it (e.g. 'Bright Red-Orange (#F54927)' or 'Red #ff0000')
  const hexMatch = raw.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
  if (hexMatch) {
    return hexMatch[0].toUpperCase();
  }

  // 4. Check fallback array if product has specified colors
  if (fallbackColors && fallbackColors.length > 0) {
    const found = fallbackColors.find(
      (c) => c.name.toLowerCase().trim() === raw.toLowerCase()
    );
    if (found && found.hex) {
      return found.hex.toUpperCase();
    }
  }

  // 5. Exact match in COLOR_HEX_MAP
  const lower = raw.toLowerCase().trim();
  if (COLOR_HEX_MAP[lower]) {
    return COLOR_HEX_MAP[lower].toUpperCase();
  }

  // 6. Clean up descriptors (e.g., "Glossy White", "Matte Black RGB", "Titanium Case", "Strap + Case")
  const sanitized = lower
    .replace(/\b(glossy|matte|metallic|pure|dark|deep|light|bright|pastel|standard|ultra|cosmic|lunar|arctic|phantom|midnight)\b/g, '')
    .replace(/\b(case|strap|edition|rgb|finish|series|trim|handle)\b/g, '')
    .replace(/[+&/\\,.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (COLOR_HEX_MAP[sanitized]) {
    return COLOR_HEX_MAP[sanitized].toUpperCase();
  }

  // 7. Substring scan in COLOR_HEX_MAP
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (key.includes(' ') && lower.includes(key)) {
      return hex.toUpperCase();
    }
  }
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.split(/[\s+/]+/).includes(key)) {
      return hex.toUpperCase();
    }
  }

  // 8. Deterministic pleasant palette fallback based on string hash if unknown
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  const generatedHex = '#' + '00000'.substring(0, 6 - c.length) + c;
  return generatedHex;
}

/**
 * Determines whether a color is light or dark to choose appropriate contrast text or checkmark
 */
export function isLightColor(hex: string): boolean {
  if (!hex) return false;
  const rgb = hexToRgb(hex);
  // HSP (Highly Sensitive Poo) equation
  const hsp = Math.sqrt(0.299 * (rgb.r * rgb.r) + 0.587 * (rgb.g * rgb.g) + 0.114 * (rgb.b * rgb.b));
  return hsp > 175;
}

/**
 * Advanced Color HEX Auto-Detection with Name and Description
 * E.g., Hex #F54927 -> Bright Red-Orange (or bright vermilion)
 *
 * Combines reference nearest-neighbor matching with analytical HSL colorimetry
 */
export function detectColorName(colorInput: string): ColorAnalysis {
  const hex = getColorHex(colorInput);
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 1. Direct or Nearest match in REFERENCE_PALETTE
  let bestEntry = REFERENCE_PALETTE[0];
  let minDistance = Infinity;

  for (const entry of REFERENCE_PALETTE) {
    if (entry.hex.toUpperCase() === hex.toUpperCase()) {
      bestEntry = entry;
      minDistance = 0;
      break;
    }
    const entryRgb = hexToRgb(entry.hex);
    const dist = getPerceptualColorDistance(rgb, entryRgb);
    if (dist < minDistance) {
      minDistance = dist;
      bestEntry = entry;
    }
  }

  // 2. Analytical classification using HSL
  let hueFamily = 'Red';
  let banglaHue = 'লাল';
  let temperature: 'warm' | 'cool' | 'neutral' = 'warm';

  if (hsl.s < 12) {
    // Grayscale
    temperature = 'neutral';
    if (hsl.l > 88) {
      hueFamily = 'Pure White';
      banglaHue = 'সাদা';
    } else if (hsl.l > 60) {
      hueFamily = 'Silver Gray';
      banglaHue = 'রূপালী ধূসর';
    } else if (hsl.l > 25) {
      hueFamily = 'Slate Gray';
      banglaHue = 'ধূসর';
    } else {
      hueFamily = 'Midnight Black';
      banglaHue = 'কালো';
    }
  } else {
    // Chromatic Hues
    const h = hsl.h;
    if (h >= 355 || h < 8) {
      hueFamily = 'Red';
      banglaHue = 'লাল';
      temperature = 'warm';
    } else if (h >= 8 && h < 24) {
      hueFamily = 'Red-Orange';
      banglaHue = 'লালচে কমলা';
      temperature = 'warm';
    } else if (h >= 24 && h < 42) {
      hueFamily = 'Orange';
      banglaHue = 'কমলা';
      temperature = 'warm';
    } else if (h >= 42 && h < 55) {
      hueFamily = 'Amber';
      banglaHue = 'অ্যাম্বার';
      temperature = 'warm';
    } else if (h >= 55 && h < 70) {
      hueFamily = 'Yellow';
      banglaHue = 'হলুদ';
      temperature = 'warm';
    } else if (h >= 70 && h < 90) {
      hueFamily = 'Lime Green';
      banglaHue = 'লাইম গ্রিন';
      temperature = 'warm';
    } else if (h >= 90 && h < 155) {
      hueFamily = 'Green';
      banglaHue = 'সবুজ';
      temperature = 'cool';
    } else if (h >= 155 && h < 185) {
      hueFamily = 'Teal / Seafoam';
      banglaHue = 'টিল / পেস্ট';
      temperature = 'cool';
    } else if (h >= 185 && h < 210) {
      hueFamily = 'Cyan / Aqua';
      banglaHue = 'সিয়ান';
      temperature = 'cool';
    } else if (h >= 210 && h < 250) {
      hueFamily = 'Blue';
      banglaHue = 'নীল';
      temperature = 'cool';
    } else if (h >= 250 && h < 280) {
      hueFamily = 'Indigo';
      banglaHue = 'ইন্ডিগো';
      temperature = 'cool';
    } else if (h >= 280 && h < 320) {
      hueFamily = 'Purple';
      banglaHue = 'বেগুনী';
      temperature = 'cool';
    } else if (h >= 320 && h < 340) {
      hueFamily = 'Magenta';
      banglaHue = 'ম্যাজেন্টা';
      temperature = 'warm';
    } else {
      hueFamily = 'Rose';
      banglaHue = 'গোলাপী';
      temperature = 'warm';
    }
  }

  // Exact or close match (< 28 distance)
  if (minDistance < 28) {
    return {
      hex,
      name: bestEntry.name,
      alias: bestEntry.alias,
      description: bestEntry.description,
      banglaName: bestEntry.banglaName,
      family: bestEntry.family,
      temperature,
      isLight: isLightColor(hex),
      rgb,
      hsl
    };
  }

  // Analytical synthetic name synthesis for custom hex codes
  let tone = 'A vibrant, warm shade';
  if (hsl.l < 25) tone = 'A deep, rich dark shade';
  else if (hsl.l > 75) tone = 'A soft, pale pastel shade';
  else if (hsl.s < 35) tone = 'A muted, elegant shade';
  else if (temperature === 'cool') tone = 'A vibrant, cool shade';

  const syntheticName =
    hsl.l > 70
      ? `Light ${hueFamily}`
      : hsl.l < 30
      ? `Deep ${hueFamily}`
      : hsl.s > 80
      ? `Bright ${hueFamily}`
      : hueFamily;

  const syntheticDescription = `${tone} of ${syntheticName.toLowerCase()} (closest to ${bestEntry.name.toLowerCase()})`;

  return {
    hex,
    name: syntheticName,
    alias: bestEntry.name,
    description: syntheticDescription,
    banglaName: `${banglaHue} (${syntheticName})`,
    family: hueFamily,
    temperature,
    isLight: isLightColor(hex),
    rgb,
    hsl
  };
}

/**
 * Returns a clean customer-facing display name for a variant value
 * If value is a raw HEX code (e.g. #F54927), auto-detects its name e.g. "Bright Red-Orange"
 */
export function getDisplayNameForColor(val: string): string {
  if (!val) return '';
  const clean = val.trim();
  // Check if it's purely a HEX code
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(clean) || /^([A-Fa-f0-9]{6})$/.test(clean)) {
    const analysis = detectColorName(clean);
    return analysis.name;
  }
  return clean;
}

/**
 * Returns a complete informative statement for a HEX code
 * E.g., "Hex color #F54927 is a vibrant, warm shade of bright red-orange (or bright vermilion)."
 */
export function getColorSummaryStatement(colorInput: string): string {
  const analysis = detectColorName(colorInput);
  let desc = analysis.description.trim();
  // Ensure lowercase starter 'a / an'
  desc = desc.replace(/^(A|An)\s+/i, (m) => m.toLowerCase());
  // Ensure trailing period
  if (!desc.endsWith('.')) {
    desc += '.';
  }
  return `Hex color ${analysis.hex} is ${desc}`;
}

/**
 * Returns complete auto-detection object with statement, analysis, and contrast
 */
export function getHexAutoDetection(colorInput: string): ColorAnalysis & { statement: string } {
  const analysis = detectColorName(colorInput);
  return {
    ...analysis,
    statement: getColorSummaryStatement(colorInput)
  };
}
