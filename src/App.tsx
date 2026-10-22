import React, { useState, useMemo } from 'react';
import { TopBar } from './components/Header/TopBar';
import { MainNavbar } from './components/Header/MainNavbar';
import { CategoryBar } from './components/Header/CategoryBar';
import { HeroBanner } from './components/Hero/HeroBanner';
import { TrustBadges } from './components/TrustBadges';
import { FlashDeals } from './components/FlashDeals';
import { CategoryNavGrid } from './components/CategoryNavGrid';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { ProductCompareModal } from './components/ProductCompareModal';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { FastCheckoutModal } from './components/FastCheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { FloatingHotline } from './components/FloatingHotline';
import { MobileDrawer } from './components/MobileDrawer';
import { PRODUCTS, CATEGORIES, INITIAL_ORDERS, STORE_SETTINGS, VALID_COUPONS, INITIAL_COLLECTIONS } from './data/mockData';
import { Product, CartItem, Order, Coupon, OrderStatus, ThemeConfig, DynamicSectionItem } from './types';
import { DEFAULT_THEME_CONFIG, DEFAULT_DYNAMIC_SECTIONS } from './data/defaultThemeConfig';
import { applySEOMetaTags } from './utils/seoHelper';
import { FeatureGridSection } from './components/DynamicSections/FeatureGridSection';
import { FaqAccordionSection } from './components/DynamicSections/FaqAccordionSection';
import { VideoBannerSection } from './components/DynamicSections/VideoBannerSection';
import { NewsletterSection } from './components/DynamicSections/NewsletterSection';
import { CustomPromoSection } from './components/DynamicSections/CustomPromoSection';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Truck, ShieldCheck, Zap, Heart, X, Share2 } from 'lucide-react';
import { TRANSLATIONS } from './utils/translations';

export default function App() {
  // Theme state (Visual Theme Editor)
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('bx_theme_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Failed to load theme config:', e);
    }
    return DEFAULT_THEME_CONFIG;
  });

  const handleSaveTheme = (updatedTheme: ThemeConfig) => {
    setTheme(updatedTheme);
    try {
      localStorage.setItem('bx_theme_config', JSON.stringify(updatedTheme));
    } catch (e) {
      console.error('Failed to save theme config:', e);
    }
  };

  // Sync Dynamic SEO, OpenGraph and Meta tags to DOM
  React.useEffect(() => {
    applySEOMetaTags(theme.seo, theme.footer?.brandName || 'BanglaXpress');
  }, [theme.seo, theme.footer?.brandName]);

  // Master state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bx_custom_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return PRODUCTS;
  });

  // Save products to localStorage on changes
  React.useEffect(() => {
    try {
      localStorage.setItem('bx_custom_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bx_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((it: CartItem) => it.id !== 'initial-item-1');
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Save cart changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('bx_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bx_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Save wishlist changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('bx_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Shared Wishlist detection from URL
  const [sharedWishlistNotification, setSharedWishlistNotification] = useState<{
    count: number;
  } | null>(null);

  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedParam = urlParams.get('shared_wishlist') || urlParams.get('wishlist');
      if (sharedParam) {
        const ids = sharedParam.split(',').map((id) => decodeURIComponent(id.trim())).filter(Boolean);
        if (ids.length > 0) {
          const matched = products.filter((p) => ids.includes(p.id) || ids.includes(p.slug));
          if (matched.length > 0) {
            setWishlist((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newItems = matched.filter((p) => !existingIds.has(p.id));
              const combined = [...prev, ...newItems];
              try {
                localStorage.setItem('bx_wishlist', JSON.stringify(combined));
              } catch (e) {
                console.error(e);
              }
              return combined;
            });
            setSharedWishlistNotification({ count: matched.length });
            setIsWishlistOpen(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [products]);
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('bx_active_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return VALID_COUPONS;
  });

  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev.filter((c) => c.code !== newCoupon.code)];
      try {
        localStorage.setItem('bx_active_coupons', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleUpdateCoupon = (updatedCoupon: Coupon) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.code === updatedCoupon.code ? updatedCoupon : c));
      try {
        localStorage.setItem('bx_active_coupons', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.code !== code);
      try {
        localStorage.setItem('bx_active_coupons', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    if (appliedCoupon?.code === code) {
      setAppliedCoupon(null);
    }
  };

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'bestsellers' | 'trending'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'discount'>('popular');
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    try {
      const saved = localStorage.getItem('banglaxpress_lang');
      if (saved === 'en' || saved === 'bn') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'bn';
  });

  const handleSetLang = (newLang: 'en' | 'bn') => {
    setLang(newLang);
    try {
      localStorage.setItem('banglaxpress_lang', newLang);
    } catch (e) {
      console.error(e);
    }
  };

  // Modals & Drawers state
  const [selectedProductForPage, setSelectedProductForPage] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutProduct, setDirectCheckoutProduct] = useState<{
    product: Product;
    quantity: number;
    color?: string;
    size?: string;
  } | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareToast, setCompareToast] = useState<string | null>(null);

  // Compare handlers
  const handleToggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        setCompareToast(
          lang === 'en'
            ? `"${product.name.slice(0, 28)}..." removed from comparison`
            : `"${product.name.slice(0, 28)}..." তুলনা তালিকা থেকে সরানো হয়েছে`
        );
        setTimeout(() => setCompareToast(null), 3000);
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        setCompareToast(
          lang === 'en'
            ? 'You can compare up to 4 products at once. Please remove one first.'
            : 'একসাথে সর্বোচ্চ ৪টি পণ্য তুলনা করা যায়। অনুগ্রহ করে একটি বাদ দিন।'
        );
        setTimeout(() => setCompareToast(null), 3500);
        return prev;
      }
      setCompareToast(
        lang === 'en'
          ? `"${product.name.slice(0, 28)}..." added to comparison`
          : `"${product.name.slice(0, 28)}..." তুলনা তালিকায় যুক্ত হয়েছে`
      );
      setTimeout(() => setCompareToast(null), 3000);
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearAllCompare = () => {
    setCompareProducts([]);
  };

  // Cart calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedColor === color && it.selectedSize === size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random()}`,
            product,
            quantity,
            selectedColor: color || (product.colors?.[0]?.name),
            selectedSize: size || (product.sizes?.[0])
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: qty } : it)));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  // Direct 1-Click Buy Now (Opens Fast Checkout with single item)
  const handleFastBuyNow = (product: Product, quantity = 1, color?: string, size?: string) => {
    setDirectCheckoutProduct({
      product,
      quantity,
      color: color || (product.colors?.[0]?.name),
      size: size || (product.sizes?.[0])
    });
    setIsCheckoutOpen(true);
  };

  // Open Standard Checkout with Cart items
  const handleProceedToCartCheckout = () => {
    setDirectCheckoutProduct(null);
    setIsCheckoutOpen(true);
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Order placed handler
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    // Clear cart if ordered via cart
    if (!directCheckoutProduct) {
      setCart([]);
      setAppliedCoupon(null);
    }
    setDirectCheckoutProduct(null);
  };

  // Admin order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedTimeline = ord.timeline.map((step) => {
            if (step.status === newStatus) {
              return { ...step, completed: true, timestamp: 'Updated Just Now' };
            }
            return step;
          });
          return {
            ...ord,
            status: newStatus,
            timeline: updatedTimeline
          };
        }
        return ord;
      })
    );
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) => prev.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord)));
  };

  // Admin product operations
  const handleAddNewProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // If quickView is showing this product, update it too
    if (quickViewProduct?.id === updated.id) {
      setQuickViewProduct(updated);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (quickViewProduct?.id === productId) {
      setQuickViewProduct(null);
    }
  };

  const handleBulkImportProducts = (newProds: Product[], replace: boolean) => {
    if (replace) {
      setProducts(newProds);
    } else {
      setProducts((prev) => [...newProds, ...prev]);
    }
  };

  const handleResetDefaultProducts = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem('bx_custom_products');
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
            p.category.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Category & Collection filter
        if (selectedCategory !== 'all') {
          const sel = selectedCategory.toLowerCase().trim();
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subcategory || '').toLowerCase();
          const colls = (p.collections || []).map((c) => c.toLowerCase());
          const tags = (p.tags || []).map((t) => t.toLowerCase());

          const matchesCat =
            cat === sel ||
            sub === sel ||
            colls.includes(sel) ||
            tags.includes(sel) ||
            cat.includes(sel) ||
            sel.includes(cat) ||
            (sel.includes('gadget') && (cat.includes('gadget') || cat.includes('watch') || cat.includes('audio') || cat.includes('power'))) ||
            (sel.includes('computer') && (cat.includes('computer') || cat.includes('gaming') || cat.includes('stand') || cat.includes('it'))) ||
            (sel.includes('electronic') && (cat.includes('audio') || cat.includes('watch') || cat.includes('gadget') || cat.includes('power'))) ||
            (sel.includes('best seller') && (p.soldCount > 50 || p.rating >= 4.8 || p.isFeatured)) ||
            (sel.includes('health') && (cat.includes('health') || cat.includes('grooming') || cat.includes('fitness'))) ||
            (sel.includes('home') && (cat.includes('home') || cat.includes('kitchen') || cat.includes('appliance'))) ||
            (sel.includes('cap') && (cat.includes('cap') || cat.includes('fashion') || (p.name && p.name.toLowerCase().includes('cap'))));

          if (!matchesCat) return false;
        }

        // Tab filter
        if (activeTab === 'featured' && !p.isFeatured) return false;
        if (activeTab === 'bestsellers' && p.soldCount < 200) return false;
        if (activeTab === 'trending' && !p.isTrending) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
        // Default popular: soldCount + rating
        return b.soldCount - a.soldCount;
      });
  }, [products, searchQuery, selectedCategory, activeTab, sortBy]);

  const scrollToFlashSale = () => {
    const el = document.getElementById('flash-sale-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic Catalog Section Renderer for CMS Block Builder
  const renderCatalogSection = () => {
    const t = TRANSLATIONS[lang];
    return (
      <section key="catalog-section" id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Filter Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {selectedCategory === 'all'
                  ? (lang === 'en' ? 'All Products Collection' : 'সকল পণ্যের কালেকশন')
                  : `${selectedCategory}`}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {filteredProducts.length} {lang === 'en' ? 'items' : 'টি'}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: t.tabAll },
                { id: 'featured', label: t.tabFeatured },
                { id: 'bestsellers', label: t.tabBestsellers },
                { id: 'trending', label: t.tabTrending }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <span>{t.sortBy}</span>
            </div>
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-300 text-xs font-bold text-gray-800 py-2 px-3 rounded-xl outline-none focus:border-rose-600 cursor-pointer shadow-xs"
            >
              <option value="popular">{t.sortPopular}</option>
              <option value="discount">{t.sortDiscount}</option>
              <option value="price-low">{t.sortPriceLow}</option>
              <option value="price-high">{t.sortPriceHigh}</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-base font-bold text-gray-800">
              {lang === 'en' ? 'Sorry, no products found' : 'দুঃখিত, কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'en' ? 'Try searching with another category or keyword.' : 'অন্য কোনো ক্যাটাগরি বা কি-ওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              {lang === 'en' ? 'View All Products' : 'সকল পণ্য দেখুন'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onSelectProduct={(p) => {
                  setSelectedProductForPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onAddToCart={(p) => handleAddToCart(p)}
                onFastBuyNow={(p) => handleFastBuyNow(p)}
                isWishlisted={wishlist.some((w) => w.id === product.id)}
                onToggleWishlist={(p) => handleToggleWishlist(p)}
                isCompared={compareProducts.some((c) => c.id === product.id)}
                onToggleCompare={(p) => handleToggleCompare(p)}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  scrollToCatalog();
                }}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  const activeSections = theme.sectionsOrder && theme.sectionsOrder.length > 0
    ? theme.sectionsOrder
    : DEFAULT_DYNAMIC_SECTIONS;

  const storeCategories = useMemo(() => {
    const themeItems = theme.categoriesSection?.items || [];
    try {
      const savedCols = localStorage.getItem('bx_collections');
      const collectionsSource = savedCols ? JSON.parse(savedCols) : INITIAL_COLLECTIONS;
      if (Array.isArray(collectionsSource) && collectionsSource.length > 0) {
        const colCategories = collectionsSource.map((col: any) => ({
          id: col.id.startsWith('cat-') ? col.id : `cat-${col.id}`,
          name: col.title,
          banglaName: col.title,
          slug: col.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
          iconName: 'Sparkles',
          image: col.image,
          itemCount: col.productsCount || 0
        }));

        const merged = [...colCategories];
        themeItems.forEach((it) => {
          if (!merged.some((m) => m.name.toLowerCase() === it.name.toLowerCase())) {
            merged.push(it);
          }
        });
        return merged;
      }
    } catch {
      // fallback
    }

    if (themeItems.length > 0) return themeItems;
    return CATEGORIES;
  }, [theme.categoriesSection?.items]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70 font-sans">
      
      {/* Top Announcement Bar */}
      <TopBar
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        lang={lang}
        setLang={handleSetLang}
        announcementConfig={theme.announcementBar}
        onOpenThemeCustomizer={() => setIsAdminOpen(true)}
      />

      {/* Main Navbar */}
      <MainNavbar
        categories={storeCategories}
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlist.length}
        compareCount={compareProducts.length}
        lang={lang}
        onSelectLanguage={handleSetLang}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onSelectProduct={(p) => {
          setSelectedProductForPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(true)}
        onGoHome={() => {
          setSelectedProductForPage(null);
          setSelectedCategory('all');
          setSearchQuery('');
          setActiveTab('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Category Bar */}
      <CategoryBar
        categories={storeCategories}
        selectedCategory={selectedCategory}
        lang={lang}
        onSelectCategory={(cat) => {
          setSelectedProductForPage(null);
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        onScrollToFlashSale={() => {
          setSelectedProductForPage(null);
          scrollToFlashSale();
        }}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Main Content Area - Full-Screen Product Page OR Dynamic CMS Page Builder Sections */}
      {selectedProductForPage ? (
        <ProductDetailPage
          product={selectedProductForPage}
          lang={lang}
          onBackToStore={() => {
            setSelectedProductForPage(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAddToCart={(p, qty, color, size) => handleAddToCart(p, qty, color, size)}
          onFastBuyNow={(p, qty, color, size) => handleFastBuyNow(p, qty, color, size)}
          isWishlisted={wishlist.some((w) => w.id === selectedProductForPage.id)}
          onToggleWishlist={(p) => handleToggleWishlist(p)}
          onSelectCategory={(cat) => {
            setSelectedProductForPage(null);
            setSelectedCategory(cat);
            scrollToCatalog();
          }}
          allProducts={products}
          onSelectRelatedProduct={(rel) => {
            setSelectedProductForPage(rel);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isCompared={compareProducts.some((c) => c.id === selectedProductForPage.id)}
          onToggleCompare={(p) => handleToggleCompare(p)}
          onOpenCart={() => setIsCartOpen(true)}
        />
      ) : (
        <main className="flex-1">
          {activeSections.map((sec) => {
            if (!sec.enabled) return null;
            switch (sec.type) {
              case 'hero':
                return (
                  <HeroBanner
                    key={sec.id}
                    onShopNow={scrollToCatalog}
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      scrollToCatalog();
                    }}
                    heroConfig={theme.hero}
                    lang={lang}
                  />
                );
              case 'trustBadges':
                return <TrustBadges key={sec.id} trustConfig={theme.trustBadges} lang={lang} />;
              case 'flashDeals':
                return (
                  <FlashDeals
                    key={sec.id}
                    products={products}
                    lang={lang}
                    onSelectProduct={(p) => {
                      setSelectedProductForPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onAddToCart={(p) => handleAddToCart(p)}
                    onFastBuyNow={(p) => handleFastBuyNow(p)}
                    flashConfig={theme.flashDeals}
                  />
                );
              case 'categoriesSection':
                return (
                  <CategoryNavGrid
                    key={sec.id}
                    categories={storeCategories}
                    title={theme.categoriesSection?.title}
                    subtitle={theme.categoriesSection?.subtitle}
                    selectedCategory={selectedCategory}
                    lang={lang}
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      scrollToCatalog();
                    }}
                  />
                );
              case 'catalogSection':
                return renderCatalogSection();
              case 'promoBanner':
                return (
                  <CustomPromoSection
                    key={sec.id}
                    customData={sec.customData || {
                      badge: theme.promoBanner.badge,
                      subtitle: theme.promoBanner.title,
                      description: theme.promoBanner.subtitle,
                      buttonText: theme.promoBanner.buttonText,
                      bgGradient: theme.promoBanner.bgGradient
                    }}
                    onAction={scrollToCatalog}
                  />
                );
              case 'reviewsSection':
                return <CustomerReviews key={sec.id} />;
              case 'featureGrid':
                return <FeatureGridSection key={sec.id} customData={sec.customData} />;
              case 'faqAccordion':
                return <FaqAccordionSection key={sec.id} customData={sec.customData} />;
              case 'videoBanner':
                return (
                  <VideoBannerSection
                    key={sec.id}
                    customData={sec.customData}
                    onShopNow={scrollToCatalog}
                  />
                );
              case 'newsletter':
                return <NewsletterSection key={sec.id} customData={sec.customData} />;
              default:
                return null;
            }
          })}
        </main>
      )}

      {/* Rich Footer */}
      <Footer
        onOpenTracking={() => setIsTrackingOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        footerConfig={theme.footer}
        lang={lang}
      />

      {/* Floating Call & WhatsApp Buttons */}
      <FloatingHotline
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        lang={lang}
      />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, qty, color, size) => handleAddToCart(p, qty, color, size)}
        onFastBuyNow={(p, qty, color, size) => handleFastBuyNow(p, qty, color, size)}
        isWishlisted={quickViewProduct ? wishlist.some((w) => w.id === quickViewProduct.id) : false}
        onToggleWishlist={(p) => handleToggleWishlist(p)}
        lang={lang}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCartCheckout}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(c) => setAppliedCoupon(c)}
        coupons={coupons}
        lang={lang}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onAddToCart={(p) => handleAddToCart(p)}
        onFastBuyNow={(p) => handleFastBuyNow(p)}
        onAddAllToCart={(productsToAdd) => {
          productsToAdd.forEach((p) => handleAddToCart(p, 1));
          setIsWishlistOpen(false);
          setIsCartOpen(true);
        }}
        lang={lang}
      />

      {/* Fast 1-Click Checkout Modal */}
      <FastCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        directProduct={directCheckoutProduct}
        appliedCoupon={appliedCoupon}
        coupons={coupons}
        lang={lang}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderConfirmationModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
        lang={lang}
        onTrackOrder={(orderId) => {
          setTrackingOrderId(orderId);
          setIsTrackingOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingOrderId('');
        }}
        orders={orders}
        initialOrderId={trackingOrderId}
        lang={lang}
      />

      {/* Shopify Merchant & Fulfillment Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrder={handleUpdateOrder}
        products={products}
        onAddNewProduct={handleAddNewProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetDefaultProducts={handleResetDefaultProducts}
        onBulkImportProducts={handleBulkImportProducts}
        themeConfig={theme}
        onSaveTheme={handleSaveTheme}
        coupons={coupons}
        onAddCoupon={handleAddCoupon}
        onUpdateCoupon={handleUpdateCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        onSelectCategory={(cat) => {
          setSelectedProductForPage(null);
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={storeCategories}
        onSelectCategory={(cat) => {
          setSelectedProductForPage(null);
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToFlash={() => {
          setSelectedProductForPage(null);
          scrollToFlashSale();
        }}
        compareCount={compareProducts.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        lang={lang}
        onSelectLanguage={handleSetLang}
      />

      {/* Product Compare Modal */}
      <ProductCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareProducts={compareProducts}
        onRemoveProduct={handleRemoveFromCompare}
        onClearAll={handleClearAllCompare}
        onAddToCart={(p) => handleAddToCart(p)}
        onFastBuyNow={(p) => handleFastBuyNow(p)}
        lang={lang}
        onSelectProduct={(p) => {
          setIsCompareOpen(false);
          setSelectedProductForPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Compare Floating Dock Bar */}
      <CompareFloatingBar
        compareProducts={compareProducts}
        onOpenCompareModal={() => setIsCompareOpen(true)}
        onRemoveProduct={handleRemoveFromCompare}
        onClearAll={handleClearAllCompare}
        lang={lang}
      />

      {/* Compare Toast Notification */}
      {compareToast && (
        <div
          id="compare-notification-toast"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{compareToast}</span>
        </div>
      )}

      {/* Shared Wishlist Notification Banner */}
      {sharedWishlistNotification && (
        <div
          id="shared-wishlist-notification-banner"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-md w-[92vw]"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="w-4.5 h-4.5 fill-white" />
          </div>
          <div className="text-xs flex-1 min-w-0">
            <p className="font-bold truncate text-rose-300">
              {lang === 'en'
                ? `Friend's Shared Wishlist (${sharedWishlistNotification.count} items)`
                : `বন্ধুর শেয়ারকৃত উইশলিস্ট (${sharedWishlistNotification.count} টি পণ্য)`}
            </p>
            <p className="text-gray-300 text-[11px] truncate">
              {lang === 'en' ? 'Loaded into your wishlist.' : 'পণ্যগুলো আপনার তালিকায় যুক্ত করা হয়েছে।'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            {lang === 'en' ? 'View' : 'দেখুন'}
          </button>
          <button
            type="button"
            onClick={() => setSharedWishlistNotification(null)}
            className="p-1 text-gray-400 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
