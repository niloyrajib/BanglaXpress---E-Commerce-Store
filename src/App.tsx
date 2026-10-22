import React, { useState, useMemo } from 'react';
import { TopBar } from './components/Header/TopBar';
import { MainNavbar } from './components/Header/MainNavbar';
import { CategoryBar } from './components/Header/CategoryBar';
import { HeroBanner } from './components/Hero/HeroBanner';
import { TrustBadges } from './components/TrustBadges';
import { FlashDeals } from './components/FlashDeals';
import { CategoryNavGrid } from './components/CategoryNavGrid';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
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
import { DropshipProductImportModal } from './components/Admin/DropshipProductImportModal';
import { PRODUCTS, CATEGORIES, INITIAL_ORDERS, STORE_SETTINGS } from './data/mockData';
import { Product, CartItem, Order, Coupon, OrderStatus, ThemeConfig, DynamicSectionItem } from './types';
import { DEFAULT_THEME_CONFIG, DEFAULT_DYNAMIC_SECTIONS } from './data/defaultThemeConfig';
import { FeatureGridSection } from './components/DynamicSections/FeatureGridSection';
import { FaqAccordionSection } from './components/DynamicSections/FaqAccordionSection';
import { VideoBannerSection } from './components/DynamicSections/VideoBannerSection';
import { NewsletterSection } from './components/DynamicSections/NewsletterSection';
import { CustomPromoSection } from './components/DynamicSections/CustomPromoSection';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Truck, ShieldCheck, Zap, DownloadCloud, CheckCircle2 } from 'lucide-react';

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
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'initial-item-1',
      product: PRODUCTS[0],
      quantity: 1,
      selectedColor: 'Midnight Black + Matte Black Case'
    }
  ]);
  const [wishlist, setWishlist] = useState<Product[]>([PRODUCTS[1], PRODUCTS[5]]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'bestsellers' | 'trending'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'discount'>('popular');
  const [lang, setLang] = useState<'en' | 'bn'>('bn');

  // Modals & Drawers state
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
  const [isDropshipImportOpen, setIsDropshipImportOpen] = useState(false);
  const [appToast, setAppToast] = useState<string | null>(null);

  const showAppToast = (msg: string) => {
    setAppToast(msg);
    window.setTimeout(() => setAppToast(null), 3000);
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

  const handleDropshipImportProducts = (newProds: Product[]) => {
    if (newProds.length === 0) return;
    setProducts((prev) => [...newProds, ...prev]);
    showAppToast(`${newProds.length} টি ড্রপশিপিং পণ্য স্টোরে ইমপোর্ট করা হয়েছে!`);
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

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
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
  const renderCatalogSection = () => (
    <section key="catalog-section" id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Filter Tabs */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {selectedCategory === 'all'
                ? 'সকল পণ্যের কালেকশন'
                : `${selectedCategory}`}
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {filteredProducts.length} টি
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'সব প্রোডাক্ট' },
              { id: 'featured', label: 'ফিচার্ড ডিল' },
              { id: 'bestsellers', label: 'টপ সেলিং' },
              { id: 'trending', label: 'ট্রেন্ডিং গ্যাজেট' }
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
            <span>সাজান:</span>
          </div>
          <select
            id="catalog-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-50 border border-gray-300 text-xs font-bold text-gray-800 py-2 px-3 rounded-xl outline-none focus:border-rose-600 cursor-pointer shadow-xs"
          >
            <option value="popular">জনপ্রিয়তা (Best Selling)</option>
            <option value="discount">সর্বোচ্চ ছাড় (Highest Discount)</option>
            <option value="price-low">দাম: কম থেকে বেশি (Price: Low to High)</option>
            <option value="price-high">দাম: বেশি থেকে কম (Price: High to Low)</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <p className="text-base font-bold text-gray-800">
            দুঃখিত, কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি
          </p>
          <p className="text-xs text-gray-500 mt-1">
            অন্য কোনো ক্যাটাগরি বা কি-ওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            সকল পণ্য দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={(p) => setQuickViewProduct(p)}
              onAddToCart={(p) => handleAddToCart(p)}
              onFastBuyNow={(p) => handleFastBuyNow(p)}
              isWishlisted={wishlist.some((w) => w.id === product.id)}
              onToggleWishlist={(p) => handleToggleWishlist(p)}
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

  const activeSections = theme.sectionsOrder && theme.sectionsOrder.length > 0
    ? theme.sectionsOrder
    : DEFAULT_DYNAMIC_SECTIONS;

  const storeCategories =
    theme.categoriesSection?.items && theme.categoriesSection.items.length > 0
      ? theme.categoriesSection.items
      : CATEGORIES;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70 font-sans">
      
      {/* Top Announcement Bar */}
      <TopBar
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        lang={lang}
        setLang={setLang}
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
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(true)}
        onOpenDropshipImport={() => setIsDropshipImportOpen(true)}
        onGoHome={() => {
          setSelectedCategory('all');
          setSearchQuery('');
          setActiveTab('all');
        }}
      />

      {/* Category Bar */}
      <CategoryBar
        categories={storeCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        onScrollToFlashSale={scrollToFlashSale}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Main Content Area - Dynamic CMS Page Builder Sections */}
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
                />
              );
            case 'trustBadges':
              return <TrustBadges key={sec.id} trustConfig={theme.trustBadges} />;
            case 'flashDeals':
              return (
                <FlashDeals
                  key={sec.id}
                  products={products}
                  onSelectProduct={(p) => setQuickViewProduct(p)}
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

      {/* Rich Footer */}
      <Footer
        onOpenTracking={() => setIsTrackingOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        footerConfig={theme.footer}
      />

      {/* Floating Call & WhatsApp Buttons */}
      <FloatingHotline
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenDropshipImport={() => setIsDropshipImportOpen(true)}
      />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, qty, color, size) => handleAddToCart(p, qty, color, size)}
        onFastBuyNow={(p, qty, color, size) => handleFastBuyNow(p, qty, color, size)}
        isWishlisted={quickViewProduct ? wishlist.some((w) => w.id === quickViewProduct.id) : false}
        onToggleWishlist={(p) => handleToggleWishlist(p)}
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
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onAddToCart={(p) => handleAddToCart(p)}
        onFastBuyNow={(p) => handleFastBuyNow(p)}
      />

      {/* Fast 1-Click Checkout Modal */}
      <FastCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        directProduct={directCheckoutProduct}
        appliedCoupon={appliedCoupon}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderConfirmationModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
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
      />

      {/* Shopify Merchant & Fulfillment Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        products={products}
        onAddNewProduct={handleAddNewProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetDefaultProducts={handleResetDefaultProducts}
        onBulkImportProducts={handleBulkImportProducts}
        themeConfig={theme}
        onSaveTheme={handleSaveTheme}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={storeCategories}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToCatalog();
        }}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToFlash={scrollToFlashSale}
        onOpenDropshipImport={() => setIsDropshipImportOpen(true)}
      />

      {/* Dropshipping Product Direct 1-Click Import Modal */}
      <DropshipProductImportModal
        isOpen={isDropshipImportOpen}
        onClose={() => setIsDropshipImportOpen(false)}
        onImportProducts={handleDropshipImportProducts}
        showToast={showAppToast}
      />

      {/* Storefront Toast Notification */}
      {appToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 bg-slate-900 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{appToast}</span>
          </div>
        </div>
      )}

    </div>
  );
}
