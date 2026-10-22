export type Language = 'bn' | 'en';

export interface Translations {
  // TopBar
  hotline: string;
  whatsappOrder: string;
  topAnnouncement: string;
  trackOrder: string;
  shopAdmin: string;
  customizeTheme: string;

  // MainNavbar
  allCategoriesDropdown: string;
  searchPlaceholder: string;
  searchBtn: string;
  searchResults: string;
  clickToView: string;
  orderHotline: string;
  myCart: string;
  wishlist: string;
  compare: string;

  // CategoryBar
  allCategories: string;
  home: string;
  flashDealsNav: string;
  orderTrackingNav: string;
  codBadgeNav: string;

  // HeroBanner
  heroOfferBadge: string;
  heroWatchTitle: string;
  heroWatchSubtitle: string;
  heroOnlyPrice: string;
  heroDiscount: string;
  heroOrderNow: string;
  heroViewCollection: string;
  hero7DaysReplacement: string;
  heroCod: string;
  heroGanTitle: string;
  heroGanSubtitle: string;
  heroGanStarting: string;
  hero24hTitle: string;
  hero24hSubtitle: string;
  heroViewAll: string;

  // TrustBadges
  trustFastDelivery: string;
  trustFastDeliverySub: string;
  trustOriginal: string;
  trustOriginalSub: string;
  trustReplacement: string;
  trustReplacementSub: string;
  trustSupport: string;
  trustSupportSub: string;

  // FlashDeals
  flashDealsTitle: string;
  flashDealsSubtitle: string;
  endsIn: string;
  hours: string;
  mins: string;
  secs: string;
  sold: string;

  // Catalog & Product Section
  popularCategories: string;
  exploreCategoriesSub: string;
  allProductsTitle: string;
  allProductsSubtitle: string;
  tabAll: string;
  tabFeatured: string;
  tabBestsellers: string;
  tabTrending: string;
  sortBy: string;
  sortPopular: string;
  sortPriceLow: string;
  sortPriceHigh: string;
  sortDiscount: string;

  // Product Card & Actions
  inStock: string;
  outOfStock: string;
  reviewsCount: string;
  buyNow: string;
  addToCart: string;
  quickView: string;
  off: string;
  tkSymbol: string;

  // Cart Drawer
  yourCart: string;
  emptyCart: string;
  emptyCartSub: string;
  startShopping: string;
  subtotal: string;
  estimatedDelivery: string;
  total: string;
  proceedToCheckout: string;
  continueShopping: string;
  itemsInCart: string;

  // Checkout Modal
  codCheckoutTitle: string;
  codCheckoutSubtitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  addressLabel: string;
  addressPlaceholder: string;
  deliveryArea: string;
  insideDhaka: string;
  outsideDhaka: string;
  confirmOrderBtn: string;
  orderNotes: string;
  orderSummary: string;
  advancePaymentNotice: string;

  // Product Detail Page
  productDescription: string;
  keyFeatures: string;
  specifications: string;
  customerReviews: string;
  warrantyInfo: string;
  deliveryInfo: string;
  relatedProducts: string;
  colorSelect: string;
  quantitySelect: string;
  backToStore: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  bn: {
    // TopBar
    hotline: 'হটলাইন',
    whatsappOrder: 'WhatsApp অর্ডার',
    topAnnouncement: 'সারাদেশে ক্যাশ অন ডেলিভারি (ঢাকা ৬০৳, বাইরে ১২০৳) • দ্রুত ডেলিভারি',
    trackOrder: 'অর্ডার ট্র্যাক করুন',
    shopAdmin: 'Shop Admin Panel',
    customizeTheme: 'Customize Theme',

    // MainNavbar
    allCategoriesDropdown: 'সকল ক্যাটাগরি (All)',
    searchPlaceholder: 'পণ্য বা মডেল সার্চ করুন (যেমন: T900 Smartwatch, Earbuds, Trimmer...)',
    searchBtn: 'সার্চ',
    searchResults: 'অনুসন্ধানের ফলাফল',
    clickToView: 'সরাসরি দেখতে ক্লিক করুন',
    orderHotline: 'অর্ডার হটলাইন',
    myCart: 'মাই কার্ট',
    wishlist: 'উইশলিস্ট',
    compare: 'পণ্য তুলনা',

    // CategoryBar
    allCategories: 'সকল ক্যাটাগরি',
    home: 'হোম',
    flashDealsNav: 'ফ্ল্যাশ সেল (Flash Deals)',
    orderTrackingNav: 'অর্ডার ট্র্যাকিং',
    codBadgeNav: '১০০% ক্যাশ অন ডেলিভারি',

    // HeroBanner
    heroOfferBadge: 'মেগা গ্যাজেট অফার ২০২৬',
    heroWatchTitle: 'T900 Ultra 2 স্মার্টওয়াচ',
    heroWatchSubtitle: 'বিশাল ২.০৯ ইঞ্চি এইচডি ডিসপ্লে, কলিং সুবিধা ও ওয়্যারলেস চার্জার',
    heroOnlyPrice: 'মাত্র ১৩৯০৳',
    heroDiscount: '৩৮% ছাড়',
    heroOrderNow: 'এখনই অর্ডার করুন',
    heroViewCollection: 'কালেকশন দেখুন',
    hero7DaysReplacement: '৭ দিনের রিপ্লেসমেন্ট',
    heroCod: 'ক্যাশ অন ডেলিভারি',
    heroGanTitle: '৬৫ ওয়াট GaN চার্জার',
    heroGanSubtitle: 'ল্যাপটপ ও ফোনে সুপার ফাস্ট স্পিড',
    heroGanStarting: 'শুরু মাত্র ১৮৫০৳',
    hero24hTitle: '২৪ ঘণ্টার মধ্যে ডেলিভারি',
    hero24hSubtitle: 'ঢাকা সিটিতে দ্রুততম হোম ডেলিভারি',
    heroViewAll: 'সকল পণ্য দেখুন',

    // TrustBadges
    trustFastDelivery: 'দ্রুততম হোম ডেলিভারি',
    trustFastDeliverySub: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, সারাদেশে ৪৮-৭২ ঘণ্টায় ক্যাশ অন ডেলিভারি',
    trustOriginal: '১০০% অরিজিনাল পণ্য',
    trustOriginalSub: 'সরাসরি অফিসিয়াল ব্র্যান্ড ও বিশ্বস্ত ফ্যাক্টরি থেকে আমদানিকৃত পণ্য',
    trustReplacement: '৭ দিনের সহজ রিপ্লেসমেন্ট',
    trustReplacementSub: 'পণ্য সংক্রান্ত যেকোনো ত্রুটিতে দ্রুততম রিপ্লেসমেন্ট সুবিধা',
    trustSupport: '২৪/৭ কাস্টমার সাপোর্ট',
    trustSupportSub: 'যেকোনো প্রশ্ন বা অর্ডারে ফোন ও হোয়াটসঅ্যাপে সার্বক্ষণিক সহায়তা',

    // FlashDeals
    flashDealsTitle: 'সীমিত সময়ের ফ্ল্যাশ ডিল',
    flashDealsSubtitle: 'অসাধারণ ছাড়ে সেরা গ্যাজেট কিনুন স্টক শেষ হওয়ার আগেই!',
    endsIn: 'অফিসিয়াল অফার শেষ হতে বাকি:',
    hours: 'ঘণ্টা',
    mins: 'মিনিট',
    secs: 'সেকেন্ড',
    sold: 'বিক্রি হয়েছে',

    // Catalog & Product Section
    popularCategories: 'জনপ্রিয় ক্যাটাগরি সমূহ',
    exploreCategoriesSub: 'আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং দারুণ অফারে কিনুন',
    allProductsTitle: 'আমাদের সকল গ্যাজেট ও পণ্য',
    allProductsSubtitle: 'সেরা কোয়ালিটি এবং সাশ্রয়ী মূল্যে ট্রেন্ডিং গ্যাজেট কালেকশন',
    tabAll: 'সকল পণ্য',
    tabFeatured: 'ফিচার্ড ডিল',
    tabBestsellers: 'বেস্টসেলার',
    tabTrending: 'হট ট্রেন্ডিং',
    sortBy: 'সাজান:',
    sortPopular: 'জনপ্রিয় পণ্য',
    sortPriceLow: 'মূল্য: কম থেকে বেশি',
    sortPriceHigh: 'মূল্য: বেশি থেকে কম',
    sortDiscount: 'সর্বোচ্চ ছাড়',

    // Product Card & Actions
    inStock: 'ইন-স্টক',
    outOfStock: 'স্টক শেষ',
    reviewsCount: 'রিভিউ',
    buyNow: 'অর্ডার করুন',
    addToCart: 'কার্টে যোগ করুন',
    quickView: 'কুইক ভিউ',
    off: 'ছাড়',
    tkSymbol: '৳',

    // Cart Drawer
    yourCart: 'আপনার শপিং ব্যাগ',
    emptyCart: 'আপনার শপিং ব্যাগটি খালি!',
    emptyCartSub: 'আপনার পছন্দের পণ্য কার্টে যোগ করে কেনাকাটা শুরু করুন।',
    startShopping: 'শপিং শুরু করুন',
    subtotal: 'সাবটোটাল',
    estimatedDelivery: 'ডেলিভারি চার্জ',
    total: 'মোট প্রদেয়',
    proceedToCheckout: 'চেকআউট করুন',
    continueShopping: 'আরও কেনাকাটা করুন',
    itemsInCart: 'টি পণ্য কার্টে আছে',

    // Checkout Modal
    codCheckoutTitle: 'ক্যাশ অন ডেলিভারি অর্ডার',
    codCheckoutSubtitle: 'অর্ডার সম্পন্ন করতে নিচের তথ্যগুলো সঠিক ও নির্ভুলভাবে দিন',
    fullName: 'আপনার সম্পূর্ণ নাম',
    fullNamePlaceholder: 'উদা: মোঃ আরিফুল ইসলাম',
    phoneLabel: 'মোবাইল নম্বর',
    phonePlaceholder: 'উদা: 01712345678 (১১ ডিজিট)',
    addressLabel: 'সম্পূর্ণ ডেলিভারি ঠিকানা',
    addressPlaceholder: 'বাসা/ফ্ল্যাট নং, রোড নং, থানা, জেলা',
    deliveryArea: 'ডেলিভারি এলাকা নির্বাচন করুন',
    insideDhaka: 'ঢাকার ভিতরে (৬০৳)',
    outsideDhaka: 'ঢাকার বাইরে (১২০৳)',
    confirmOrderBtn: 'অর্ডার কনফার্ম করুন',
    orderNotes: 'অর্ডার নোট (ঐচ্ছিক)',
    orderSummary: 'অর্ডারের বিবরণ',
    advancePaymentNotice: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন (ক্যাশ অন ডেলিভারি)।',

    // Product Detail Page
    productDescription: 'পণ্যের বিস্তারিত বিবরণ',
    keyFeatures: 'প্রধান বৈশিষ্ট্যসমূহ',
    specifications: 'টেকনিক্যাল স্পেসিফিকেশন',
    customerReviews: 'গ্রাহক মতামত ও রিভিউ',
    warrantyInfo: 'ওয়ারেন্টি ও গ্যারান্টি',
    deliveryInfo: 'ডেলিভারি ও পেমেন্ট পলিসি',
    relatedProducts: 'সম্পর্কিত অন্যান্য পণ্য',
    colorSelect: 'কালার নির্বাচন করুন',
    quantitySelect: 'পরিমাণ',
    backToStore: 'স্টোরে ফিরে যান'
  },

  en: {
    // TopBar
    hotline: 'Hotline',
    whatsappOrder: 'WhatsApp Order',
    topAnnouncement: 'Cash on Delivery Nationwide (Dhaka ৳60, Outside ৳120) • Fast Delivery',
    trackOrder: 'Track Order',
    shopAdmin: 'Shop Admin Panel',
    customizeTheme: 'Customize Theme',

    // MainNavbar
    allCategoriesDropdown: 'All Categories',
    searchPlaceholder: 'Search products or models (e.g. T900 Smartwatch, Earbuds, Trimmer...)',
    searchBtn: 'Search',
    searchResults: 'Search Results',
    clickToView: 'Click to view product',
    orderHotline: 'Order Hotline',
    myCart: 'My Cart',
    wishlist: 'Wishlist',
    compare: 'Compare',

    // CategoryBar
    allCategories: 'All Categories',
    home: 'Home',
    flashDealsNav: 'Flash Deals',
    orderTrackingNav: 'Order Tracking',
    codBadgeNav: '100% Cash on Delivery',

    // HeroBanner
    heroOfferBadge: 'Mega Gadget Deals 2026',
    heroWatchTitle: 'T900 Ultra 2 Smartwatch',
    heroWatchSubtitle: 'Huge 2.09" HD Display, Bluetooth Calling & Wireless Fast Charger',
    heroOnlyPrice: 'Only ৳1,390',
    heroDiscount: '38% OFF',
    heroOrderNow: 'Order Now',
    heroViewCollection: 'Explore Collection',
    hero7DaysReplacement: '7 Days Replacement',
    heroCod: 'Cash on Delivery',
    heroGanTitle: '65W GaN Fast Charger',
    heroGanSubtitle: 'Super Fast Speed for Laptop & Smartphones',
    heroGanStarting: 'Starting at ৳1,850',
    hero24hTitle: '24-Hour Express Delivery',
    hero24hSubtitle: 'Fastest Home Delivery inside Dhaka City',
    heroViewAll: 'View All Products',

    // TrustBadges
    trustFastDelivery: 'Fast Home Delivery',
    trustFastDeliverySub: '24-48 hours in Dhaka, 48-72 hours nationwide cash on delivery',
    trustOriginal: '100% Original Products',
    trustOriginalSub: 'Directly sourced and imported from official brands & factories',
    trustReplacement: '7 Days Easy Replacement',
    trustReplacementSub: 'Fast hassle-free replacement for any manufacturer defects',
    trustSupport: '24/7 Customer Support',
    trustSupportSub: 'Instant support via phone and WhatsApp for any questions or orders',

    // FlashDeals
    flashDealsTitle: 'Limited Time Flash Deals',
    flashDealsSubtitle: 'Grab the best gadgets at unbeatable discounts before stock runs out!',
    endsIn: 'Official Offer Ends In:',
    hours: 'Hours',
    mins: 'Mins',
    secs: 'Secs',
    sold: 'Sold',

    // Catalog & Product Section
    popularCategories: 'Popular Categories',
    exploreCategoriesSub: 'Choose your desired category and explore exciting offers',
    allProductsTitle: 'All Gadgets & Products',
    allProductsSubtitle: 'Top quality and trending gadget collection at reasonable prices',
    tabAll: 'All Products',
    tabFeatured: 'Featured Deals',
    tabBestsellers: 'Bestsellers',
    tabTrending: 'Hot Trending',
    sortBy: 'Sort by:',
    sortPopular: 'Most Popular',
    sortPriceLow: 'Price: Low to High',
    sortPriceHigh: 'Price: High to Low',
    sortDiscount: 'Biggest Discount',

    // Product Card & Actions
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    reviewsCount: 'reviews',
    buyNow: 'Buy Now',
    addToCart: 'Add to Cart',
    quickView: 'Quick View',
    off: 'OFF',
    tkSymbol: '৳',

    // Cart Drawer
    yourCart: 'Your Shopping Bag',
    emptyCart: 'Your shopping bag is empty!',
    emptyCartSub: 'Add your favorite gadgets to your bag to begin shopping.',
    startShopping: 'Start Shopping',
    subtotal: 'Subtotal',
    estimatedDelivery: 'Delivery Fee',
    total: 'Total Amount',
    proceedToCheckout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    itemsInCart: 'items in cart',

    // Checkout Modal
    codCheckoutTitle: 'Cash on Delivery Checkout',
    codCheckoutSubtitle: 'Please provide your accurate delivery details below',
    fullName: 'Your Full Name',
    fullNamePlaceholder: 'e.g. John Doe / Ariful Islam',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'e.g. 01712345678 (11 digits)',
    addressLabel: 'Full Delivery Address',
    addressPlaceholder: 'House/Flat No, Road No, Area, City, District',
    deliveryArea: 'Select Delivery Area',
    insideDhaka: 'Inside Dhaka (৳60)',
    outsideDhaka: 'Outside Dhaka (৳120)',
    confirmOrderBtn: 'Confirm Order',
    orderNotes: 'Order Notes (Optional)',
    orderSummary: 'Order Summary',
    advancePaymentNotice: 'Pay cash only after inspecting and receiving your package.',

    // Product Detail Page
    productDescription: 'Product Description',
    keyFeatures: 'Key Highlights & Features',
    specifications: 'Technical Specifications',
    customerReviews: 'Customer Reviews',
    warrantyInfo: 'Warranty & Guarantee',
    deliveryInfo: 'Delivery & Return Policies',
    relatedProducts: 'Related Products',
    colorSelect: 'Select Color',
    quantitySelect: 'Quantity',
    backToStore: 'Back to Store'
  }
};

/**
 * Helper to get the translated product title
 */
export function getProductTitle(product: { name: string; banglaName?: string }, lang: Language | string = 'bn'): string {
  if (lang === 'en') {
    return product.name;
  }
  return product.banglaName || product.name;
}

/**
 * Helper to get the translated product description
 */
export function getProductDescription(
  product: { shortDescription?: string; description?: string; banglaDescription?: string },
  lang: Language | string = 'bn'
): string {
  if (lang === 'en') {
    return product.shortDescription || product.description || '';
  }
  return product.banglaDescription || product.shortDescription || product.description || '';
}

/**
 * Helper to get category name
 */
export function getCategoryDisplayName(
  category: { name: string; banglaName?: string },
  lang: Language | string = 'bn'
): string {
  if (lang === 'en') {
    return category.name;
  }
  return category.banglaName || category.name;
}
