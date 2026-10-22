import React, { useState, useEffect } from 'react';
import {
  Globe,
  DownloadCloud,
  Check,
  AlertCircle,
  Sparkles,
  Sliders,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Truck,
  DollarSign,
  PackagePlus,
  Percent,
  CheckCircle2,
  Info,
  Layers,
  Search,
  Filter,
  Plus,
  Zap,
  Key,
  Lock,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
  ShieldCheck,
  Copy,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Product, DropshipPlatform } from '../../../types';
import {
  DROPSHIP_PLATFORMS,
  CURATED_DROPSHIP_CATALOG,
  DropshipPricingRule,
  getStoredPricingRule,
  saveStoredPricingRule,
  detectPlatformFromUrl,
  calculateDropshipPricing,
  parseDropshipUrl
} from '../../../utils/dropshipImporter';
import {
  CJApiConfig,
  getStoredCJConfig,
  saveStoredCJConfig,
  testCJApiConnection,
  fetchCJProductData,
  searchCJLiveCatalog,
  convertCJItemToStoreProduct,
  CJProductDetailResult,
  CJ_WINNING_CATALOG_DATABASE,
  CJConnectionResult,
  fetchLiveCJProductList,
  fetchLiveCJProductDetail
} from '../../../utils/cjDropshippingApi';

interface ShopifyDropshipImportViewProps {
  products?: Product[];
  onAddNewProduct?: (product: Product) => void;
  onBulkImport?: (products: Product[], replaceExisting: boolean) => void;
  showToast?: (message: string) => void;
}

export const ShopifyDropshipImportView: React.FC<ShopifyDropshipImportViewProps> = ({
  products = [],
  onAddNewProduct,
  onBulkImport,
  showToast = (_message?: string) => {}
}) => {
  const [activeTab, setActiveTab] = useState<'url_import' | 'catalog' | 'batch' | 'pricing' | 'imported_history' | 'cj_api'>('url_import');
  const [selectedPlatform, setSelectedPlatform] = useState<DropshipPlatform>('aliexpress');
  const [pricingRule, setPricingRule] = useState<DropshipPricingRule>(() => getStoredPricingRule());

  // CJ Dropshipping API State
  const [cjConfig, setCjConfig] = useState<CJApiConfig>(() => getStoredCJConfig());
  const [isTestingCJ, setIsTestingCJ] = useState(false);
  const [cjTestResult, setCjTestResult] = useState<CJConnectionResult | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [cjSearchQuery, setCjSearchQuery] = useState('');
  const [cjQuickFilter, setCjQuickFilter] = useState('all');
  const [importedPids, setImportedPids] = useState<Record<string, boolean>>({});
  const [isSavingCJ, setIsSavingCJ] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // CJ Live API Search and Catalog State
  const [cjLiveProducts, setCjLiveProducts] = useState<CJProductDetailResult[]>([]);
  const [isLoadingCJLive, setIsLoadingCJLive] = useState(false);
  const [cjPage, setCjPage] = useState(1);
  const [cjTotalPages, setCjTotalPages] = useState(1);
  const [cjTotalRecords, setCjTotalRecords] = useState(0);
  const [cjSearchMode, setCjSearchMode] = useState<'live' | 'curated'>('live');
  const [isLoadingDetailModal, setIsLoadingDetailModal] = useState(false);

  // Mode 1: Single URL
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionLog, setExtractionLog] = useState<string[]>([]);
  const [extractedProduct, setExtractedProduct] = useState<Product | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<ReturnType<typeof calculateDropshipPricing> | null>(null);
  const [selectedPreviewImageIdx, setSelectedPreviewImageIdx] = useState(0);
  const [extractedDetailsTab, setExtractedDetailsTab] = useState<'specs' | 'images' | 'features' | 'variants' | 'description'>('specs');

  // CJ Detail Modal Preview state
  const [viewingCJDetailItem, setViewingCJDetailItem] = useState<CJProductDetailResult | null>(null);
  const [cjModalImageIdx, setCjModalImageIdx] = useState(0);

  // Mode 2: Batch URLs
  const [batchInput, setBatchInput] = useState('');
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchImportedList, setBatchImportedList] = useState<Product[]>([]);

  // Mode 3: Catalog Filter
  const [catalogFilter, setCatalogFilter] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Detect platform automatically
  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    const detected = detectPlatformFromUrl(val);
    if (detected) {
      setSelectedPlatform(detected);
    }
  };

  const handleExtractSingle = async () => {
    if (!urlInput.trim()) {
      showToast('অনুগ্রহ করে পণ্যের URL বা লিঙ্ক প্রবেশ করান');
      return;
    }

    setIsExtracting(true);
    setExtractionLog([]);
    setExtractedProduct(null);

    const platformConfig = DROPSHIP_PLATFORMS[selectedPlatform];
    const isCJ = selectedPlatform === 'cjdropshipping';
    
    const logs = isCJ
      ? [
          `Connecting to CJ Dropshipping Open API 2.0 gateway (developers.cjdropshipping.com)...`,
          `Authenticating API Key & Token (${cjConfig.isConnected ? 'Status: Active Connected' : 'Status: API Ready'})...`,
          `Querying CJ product catalog by PID/SKU/URL with live variants & stock...`,
          `Converting CJ Price ($ USD to BDT at ৳${pricingRule.usdRate}) with ${cjConfig.shippingMethod}...`,
          `Applying markup rule (${pricingRule.markupMultiplier}x multiplier + ৳${pricingRule.fixedMarkupBDT})...`,
          `CJ Dropshipping product synchronized successfully! Ready for publishing.`
        ]
      : [
          `Connecting to ${platformConfig.name} API gateway (${platformConfig.domain})...`,
          `Extracting product title, high-res images, and SKU parameters...`,
          `Converting currency (${platformConfig.currency} to BDT at ৳${platformConfig.currency === 'USD' ? pricingRule.usdRate : pricingRule.cnyRate})...`,
          `Applying markup rule (${pricingRule.markupMultiplier}x multiplier + ৳${pricingRule.fixedMarkupBDT})...`,
          `Auto-generating Bangla title, specs & warranty...`,
          `Product parsed successfully! Ready for publishing.`
        ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setExtractionLog((prev) => [...prev, logs[i]]);
    }

    try {
      if (isCJ) {
        const cjResult = await fetchCJProductData(urlInput, cjConfig, pricingRule);
        setExtractedProduct(cjResult.product);
        setPriceBreakdown(cjResult.profitCalculation);
        setSelectedPreviewImageIdx(0);
        showToast('CJ Dropshipping পণ্য সফলভাবে ফেচ করা হয়েছে!');
      } else {
        const parsed = parseDropshipUrl(urlInput, selectedPlatform, pricingRule);
        setExtractedProduct(parsed.product);
        setPriceBreakdown(parsed.profitCalculation);
        setSelectedPreviewImageIdx(0);
        showToast(`${platformConfig.name} থেকে পণ্য সফলভাবে এক্সট্রাক্ট করা হয়েছে!`);
      }
    } catch (e) {
      showToast('পণ্য এক্সট্রাক্ট করতে সমস্যা হয়েছে। লিঙ্কটি পুনরায় চেক করুন।');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePublishSingle = (status: 'active' | 'draft' = 'active') => {
    if (!extractedProduct) return;
    const finalProd = { ...extractedProduct, status };
    if (onAddNewProduct) {
      onAddNewProduct(finalProd);
    }
    showToast(`'${finalProd.name}' সফলভাবে আপনার স্টোরে যুক্ত হয়েছে!`);
    setExtractedProduct(null);
    setUrlInput('');
  };

  const handleBatchImportRun = async () => {
    const rawUrls = batchInput
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 5);

    if (rawUrls.length === 0) {
      showToast('কমপক্ষে ১টি ভ্যালিড পণ্যের লিঙ্ক দিন');
      return;
    }

    setIsBatchRunning(true);
    setBatchProgress(0);
    setBatchImportedList([]);

    const items: Product[] = [];
    for (let i = 0; i < rawUrls.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const parsed = parseDropshipUrl(rawUrls[i], undefined, pricingRule);
      items.push(parsed.product);
      setBatchImportedList([...items]);
      setBatchProgress(Math.round(((i + 1) / rawUrls.length) * 100));
    }

    setIsBatchRunning(false);
    showToast(`${items.length} টি ড্রপশিপিং পণ্য প্রস্তুত হয়েছে!`);
  };

  const handlePublishBatch = () => {
    if (batchImportedList.length === 0) return;
    if (onBulkImport) {
      onBulkImport(batchImportedList, false);
    } else if (onAddNewProduct) {
      batchImportedList.forEach((p) => onAddNewProduct(p));
    }
    showToast(`${batchImportedList.length} টি ড্রপশিপিং পণ্য স্টোরে যুক্ত হয়েছে!`);
    setBatchImportedList([]);
    setBatchInput('');
  };

  // Curated Catalog single import
  const handleImportCuratedItem = (item: Product) => {
    const calc = calculateDropshipPricing(
      item.dropship!.sourcePrice,
      item.dropship!.sourceCurrency,
      pricingRule
    );

    const readyProduct: Product = {
      ...item,
      id: `ds-${item.dropship?.platform || 'imp'}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      price: calc.sellingPrice,
      originalPrice: calc.compareAtPrice,
      discountPercent: Math.round(((calc.compareAtPrice - calc.sellingPrice) / calc.compareAtPrice) * 100)
    };

    if (onAddNewProduct) {
      onAddNewProduct(readyProduct);
    }
    showToast(`'${readyProduct.name}' সরাসরি স্টোরে ইমপোর্ট হয়েছে!`);
  };

  // Filter dropshipped products already in store
  const existingDropshipProducts = products.filter((p) => !!p.dropship);

  const filteredCatalog = CURATED_DROPSHIP_CATALOG.filter((item) => {
    const matchesPlatform = catalogFilter === 'all' || item.dropship?.platform === catalogFilter;
    const matchesSearch =
      !catalogSearch ||
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.banglaName && item.banglaName.toLowerCase().includes(catalogSearch.toLowerCase()));
    return matchesPlatform && matchesSearch;
  });

  // Handle CJ API Test Connection
  const handleTestCJConnection = async () => {
    setIsTestingCJ(true);
    setCjTestResult(null);
    try {
      const res = await testCJApiConnection(cjConfig);
      setCjTestResult(res);
      if (res.success) {
        const updated: CJApiConfig = {
          ...cjConfig,
          isConnected: true,
          accessToken: res.token || cjConfig.accessToken,
          lastTestedAt: new Date().toLocaleTimeString('bn-BD')
        };
        setCjConfig(updated);
        saveStoredCJConfig(updated);
        showToast('CJ Dropshipping API সফলভাবে কানেক্ট হয়েছে!');
      } else {
        showToast(res.message);
      }
    } catch (e) {
      setCjTestResult({
        success: false,
        message: 'কানেকশন এরর: CJ API সার্ভারে সংযোগ স্থাপন করা যায়নি।'
      });
      showToast('CJ API কানেকশন ফেইল্ড');
    } finally {
      setIsTestingCJ(false);
    }
  };

  // Handle Save CJ Config
  const handleSaveCJConfig = () => {
    setIsSavingCJ(true);
    saveStoredCJConfig(cjConfig);
    setTimeout(() => {
      setIsSavingCJ(false);
      showToast('CJ Dropshipping API কনফিগারেশন সংরক্ষণ করা হয়েছে!');
    }, 300);
  };

  // Live CJ Open API Search Handler
  const handleSearchCJLive = async (pageToFetch = 1, queryOverride?: string) => {
    setIsLoadingCJLive(true);
    const q = queryOverride !== undefined ? queryOverride : cjSearchQuery;
    try {
      const res = await fetchLiveCJProductList(q, pageToFetch, 12, cjConfig);
      setCjLiveProducts(res.products);
      setCjTotalRecords(res.total);
      setCjTotalPages(res.totalPages);
      setCjPage(pageToFetch);
      setCjSearchMode('live');
    } catch (e) {
      console.warn('CJ live search failed:', e);
      showToast('CJ লাইভ সার্চে সমস্যা হয়েছে। লোকাল ক্যাটালগ দেখানো হচ্ছে।');
      setCjSearchMode('curated');
    } finally {
      setIsLoadingCJLive(false);
    }
  };

  // Auto load live CJ products when opening the CJ tab for the first time
  useEffect(() => {
    if (activeTab === 'cj_api' && cjLiveProducts.length === 0 && !isLoadingCJLive) {
      handleSearchCJLive(1, '');
    }
  }, [activeTab]);

  // Handle Quick Import from CJ Live Catalog with Full Variant Enrichment
  const handleQuickImportCJItem = async (cjItem: CJProductDetailResult) => {
    let finalItem = cjItem;
    // If item came from list search, query full detail so all variants & high-res images are imported
    if (cjItem.variants.length <= 1 || cjItem.galleryImages.length <= 1) {
      try {
        const fullDetail = await fetchLiveCJProductDetail(cjItem.pid, cjConfig);
        if (fullDetail) {
          finalItem = fullDetail;
        }
      } catch (e) {
        console.warn('Could not fetch full details, using item data', e);
      }
    }

    const { product } = convertCJItemToStoreProduct(finalItem, pricingRule);
    if (onAddNewProduct) {
      onAddNewProduct(product);
    }
    setImportedPids((prev) => ({ ...prev, [cjItem.pid]: true }));
    showToast(`'${product.name}' সরাসরি স্টোরে যুক্ত হয়েছে!`);
  };

  // Handle Open CJ Detail Modal with Full Variants Fetch
  const handleOpenDetailModal = async (item: CJProductDetailResult) => {
    setViewingCJDetailItem(item);
    setCjModalImageIdx(0);
    if (item.variants.length <= 1 || item.galleryImages.length <= 1) {
      setIsLoadingDetailModal(true);
      try {
        const full = await fetchLiveCJProductDetail(item.pid, cjConfig);
        if (full) {
          setViewingCJDetailItem(full);
        }
      } catch (e) {
        console.warn('Failed to load full detail modal', e);
      } finally {
        setIsLoadingDetailModal(false);
      }
    }
  };

  // Filter CJ Products for Local Curated Browser
  const filteredCJProducts = CJ_WINNING_CATALOG_DATABASE.filter((item) => {
    const matchesSearch =
      !cjSearchQuery.trim() ||
      item.productName.toLowerCase().includes(cjSearchQuery.toLowerCase()) ||
      item.banglaName.toLowerCase().includes(cjSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(cjSearchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(cjSearchQuery.toLowerCase()) ||
      item.pid.includes(cjSearchQuery.trim());

    const matchesFilter =
      cjQuickFilter === 'all' ||
      (cjQuickFilter === 'humidifier' && item.productName.toLowerCase().includes('humidifier')) ||
      (cjQuickFilter === 'powerbank' && (item.productName.toLowerCase().includes('magsafe') || item.productName.toLowerCase().includes('power'))) ||
      (cjQuickFilter === 'massager' && item.productName.toLowerCase().includes('massager')) ||
      (cjQuickFilter === 'gadgets' && (item.category.toLowerCase().includes('gadget') || item.productName.toLowerCase().includes('ring') || item.productName.toLowerCase().includes('gimbal'))) ||
      (cjQuickFilter === 'home' && item.category.toLowerCase().includes('home'));

    return matchesSearch && matchesFilter;
  });

  const displayedCJProducts = cjSearchMode === 'live' && cjLiveProducts.length > 0
    ? cjLiveProducts
    : filteredCJProducts;

  return (
    <div className="space-y-5">
      {/* Top Banner / Hero Card */}
      <div className="bg-gradient-to-r from-gray-900 via-[#1e2229] to-gray-900 rounded-2xl p-5 text-white shadow-sm border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/30 shrink-0">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  ড্রপশিপিং প্রোডাক্ট ডাইরেক্ট ইম্পোর্টার (Dropship Direct Import Hub)
                </h2>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  5 Platforms Direct
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  ⚡ CJ Dropshipping API Ready
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                AliExpress, 1688, Alibaba, CJ Dropshipping এবং Taobao থেকে যেকোনো পণ্য সরাসরি ইম্পোর্ট করে অটোমেটিক কারেন্সি রূপান্তর (USD/CNY to BDT) ও প্রফিট মার্জিন সেট করুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
              <span className="text-gray-300">ইমপোর্টকৃত প্রোডাক্ট:</span>
              <span className="font-mono font-bold text-amber-300">
                {existingDropshipProducts.length} টি
              </span>
            </div>
          </div>
        </div>

        {/* 5 Platforms Row */}
        <div className="mt-4 pt-4 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {(Object.keys(DROPSHIP_PLATFORMS) as DropshipPlatform[]).map((pid) => {
            const p = DROPSHIP_PLATFORMS[pid];
            const isSelected = selectedPlatform === pid;
            const isCJ = pid === 'cjdropshipping';
            return (
              <button
                key={pid}
                type="button"
                onClick={() => {
                  setSelectedPlatform(pid);
                  if (activeTab === 'url_import') {
                    setUrlInput(p.sampleUrls[0].url);
                  }
                }}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-white/15 border-rose-500 ring-2 ring-rose-500/40 text-white'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentColor }} />
                  <span className="font-bold text-xs truncate">{p.name}</span>
                  {isCJ && (
                    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      cjConfig.isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                    }`}>
                      {cjConfig.isConnected ? '⚡ Connected' : '⚡ API'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {p.currencySymbol} {p.currency} ({p.currency === 'USD' ? `$1 = ৳${pricingRule.usdRate}` : `¥1 = ৳${pricingRule.cnyRate}`})
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick CJ API banner when CJ Dropshipping is selected */}
        {selectedPlatform === 'cjdropshipping' && (
          <div className="mt-3 p-3 bg-blue-950/70 border border-blue-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-blue-200">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <div>
                <span className="font-bold text-white">CJ Dropshipping Open API 2.0 ইন্টিগ্রেশন:</span>{' '}
                <span className="text-blue-200">
                  {cjConfig.isConnected
                    ? `সক্রিয় ও সংযুক্ত (${cjConfig.email || 'API Key Active'})। সরাসরি লিঙ্ক, PID বা SKU দিয়ে ইম্পোর্ট করুন।`
                    : 'আপনার নিজস্ব CJ API Key যোগ করে রিয়েলটাইম ইনভেন্টরি, লাইভ কস্ট ও ১-ক্লিক ড্রপশিপিং আনলক করুন।'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('cj_api')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>CJ API সেটিংস ও লাইভ সার্চ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('url_import')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'url_import' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PackagePlus className="w-3.5 h-3.5 text-amber-300" />
          <span>URL ডাইরেক্ট ইম্পোর্ট (Direct Link)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cj_api')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'cj_api'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100 font-semibold border border-blue-200/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-blue-400 fill-current" />
          <span>🔌 CJ Dropshipping API & লাইভ সার্চ</span>
          <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
            cjConfig.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-200/80 text-blue-900'
          }`}>
            {cjConfig.isConnected ? 'কানেক্টেড' : 'API অপশন'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batch')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'batch' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>ব্যাচ ইম্পোর্ট (Multi-URL)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalog' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          <span>টপ উইনিং ক্যাটালগ (Winning Catalog)</span>
          <span className="text-[9.5px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
            {CURATED_DROPSHIP_CATALOG.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'pricing' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>কারেন্সি ও প্রাইসিং রুলস</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('imported_history')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'imported_history' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
          <span>স্টোরে বিদ্যমান ড্রপশিপ আইটেম ({existingDropshipProducts.length})</span>
        </button>
      </div>

      {/* VIEW 1: URL DIRECT IMPORT */}
      {activeTab === 'url_import' && (
        <div className="space-y-4">
          {/* CJ Dropshipping API Integration Info Card */}
          {selectedPlatform === 'cjdropshipping' && (
            <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-500/20">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-xs">CJ Dropshipping Open API 2.0 Direct Fetch</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cjConfig.isConnected ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {cjConfig.isConnected ? '✓ API সংযুক্ত ও লাইভ' : '⚡ Direct Mode Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    সরাসরি CJ লিঙ্ক, Product ID (যেমন: <strong className="font-mono text-blue-700">162948102948</strong>) বা SKU পেস্ট করে ফেচ করুন।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('cj_api')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>CJ API সেটিংস ও সার্চ</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-rose-600" />
                <span>প্রোডাক্ট লিঙ্ক বা URL দিন (AliExpress, 1688, Alibaba, CJ, Taobao):</span>
              </label>
              <span className="text-xs text-gray-500">
                প্ল্যাটফর্ম: <strong className="text-gray-900">{DROPSHIP_PLATFORMS[selectedPlatform].name}</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={selectedPlatform === 'cjdropshipping' ? "যেমন: https://cjdropshipping.com/product/item-p-162948102948.html অথবা PID: 162948102948" : `যেমন: ${DROPSHIP_PLATFORMS[selectedPlatform].placeholderUrl}`}
                className="flex-1 px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100 font-mono"
              />
              <button
                type="button"
                onClick={handleExtractSingle}
                disabled={isExtracting || !urlInput.trim()}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>এক্সট্রাক্ট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Fetch Product Data</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo links */}
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 text-[11px] font-medium flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                টেস্ট লিঙ্ক:
              </span>
              {DROPSHIP_PLATFORMS[selectedPlatform].sampleUrls.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrlInput(sample.url);
                    setExtractedProduct(null);
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 border border-gray-200 text-gray-700 rounded-lg text-[11px] font-medium transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extraction Logs */}
          {isExtracting && (
            <div className="bg-gray-900 text-gray-200 p-4 rounded-xl font-mono text-xs space-y-1.5 border border-gray-800 shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Scraping & Parsing Product Data in Realtime...</span>
              </div>
              {extractionLog.map((log, index) => (
                <div key={index} className="flex items-center gap-2 text-[11.5px] text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

          {/* Extracted Product Card */}
          {extractedProduct && priceBreakdown && (
            <div className="bg-white rounded-2xl border-2 border-rose-500/40 p-5 shadow-md space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    সফলভাবে এক্সট্রাক্ট হয়েছে
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${DROPSHIP_PLATFORMS[extractedProduct.dropship?.platform as DropshipPlatform || 'aliexpress']?.badgeBg}`}
                  >
                    {DROPSHIP_PLATFORMS[extractedProduct.dropship?.platform as DropshipPlatform || 'aliexpress']?.name} Direct
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">উৎস মূল্য:</span>
                  <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {DROPSHIP_PLATFORMS[extractedProduct.dropship?.platform as DropshipPlatform || 'aliexpress']?.currencySymbol}
                    {extractedProduct.dropship?.sourcePrice} {extractedProduct.dropship?.sourceCurrency}
                  </span>
                </div>
              </div>

              {/* Main Product Layout with All Images and Specs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left: Interactive Multi-Image Gallery */}
                <div className="md:col-span-5 space-y-2.5">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner group">
                    <img
                      src={extractedProduct.images[selectedPreviewImageIdx] || extractedProduct.images[0]}
                      alt={extractedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-900/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <ImageIcon className="w-3 h-3 text-amber-300" />
                        <span>ছবি {selectedPreviewImageIdx + 1} / {extractedProduct.images.length}</span>
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-xs">
                        ✓ HD কোয়ালিটি
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Row of ALL Captured Images */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1 px-0.5">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        ক্যাপচার্ড সব ছবি ({extractedProduct.images.length}টি ইমেজ):
                      </span>
                      <span className="text-[10px] text-gray-400">ক্লিক করে বড় ছবি দেখুন</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {extractedProduct.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedPreviewImageIdx(i)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative bg-gray-50 ${
                            selectedPreviewImageIdx === i
                              ? 'border-rose-600 ring-2 ring-rose-200 scale-102 shadow-xs'
                              : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-[8px] font-bold text-white px-1 rounded">
                            #{i + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Supplier & Delivery Badges */}
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">সাপ্লায়ার হাব</span>
                      <strong className="text-gray-800 truncate block">
                        {extractedProduct.dropship?.supplierName || 'Verified Factory Direct'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">শিপিং ডেলিভারি</span>
                      <strong className="text-blue-700 truncate block flex items-center gap-1">
                        <Truck className="w-3 h-3 text-blue-500" />
                        {extractedProduct.dropship?.shippingDays || '7-14 Days Air'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">রেটিং ও রিভিউ</span>
                      <strong className="text-amber-600">
                        ★ {extractedProduct.rating} ({extractedProduct.reviewCount}+ রেটিং)
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">লাইভ স্টক ইনভেন্টরি</span>
                      <strong className="text-emerald-700 font-mono">
                        {extractedProduct.stockCount} Available
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Right: Editable Info & Tabbed Specs */}
                <div className="md:col-span-7 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">প্রোডাক্টের নাম (English Title):</label>
                    <input
                      type="text"
                      value={extractedProduct.name}
                      onChange={(e) =>
                        setExtractedProduct({ ...extractedProduct, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">বাংলা নাম (Bangla Title):</label>
                    <input
                      type="text"
                      value={extractedProduct.banglaName || ''}
                      onChange={(e) =>
                        setExtractedProduct({ ...extractedProduct, banglaName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি:</label>
                      <select
                        value={extractedProduct.category}
                        onChange={(e) =>
                          setExtractedProduct({ ...extractedProduct, category: e.target.value })
                        }
                        className="w-full px-2.5 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:border-rose-600 outline-none"
                      >
                        <option value="Smart Watches">Smart Watches</option>
                        <option value="Earbuds & Audio">Earbuds & Audio</option>
                        <option value="Power & Charging">Power & Charging</option>
                        <option value="Computer & Gaming">Computer & Gaming</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Men's Caps & Fashion">Men's Caps & Fashion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">বিক্রয় মূল্য (৳ BDT):</label>
                      <input
                        type="number"
                        value={extractedProduct.price}
                        onChange={(e) =>
                          setExtractedProduct({ ...extractedProduct, price: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-2 border border-gray-300 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">পূর্বের মূল্য (৳ BDT):</label>
                      <input
                        type="number"
                        value={extractedProduct.originalPrice}
                        onChange={(e) =>
                          setExtractedProduct({
                            ...extractedProduct,
                            originalPrice: Number(e.target.value)
                          })
                        }
                        className="w-full px-2.5 py-2 border border-gray-300 rounded-xl text-xs font-mono text-gray-500 focus:border-rose-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Profit Margin Analysis Banner */}
                  <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <p className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>প্রফিট মার্জিন বিশ্লেষণ (Automatic Profit Calculation):</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        ফ্যাক্টরি খরচ: ৳{priceBreakdown.landedCostBDT} | স্টোরে বিক্রয় মূল্য: ৳{extractedProduct.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-mono font-bold text-xs shadow-xs">
                        +৳{extractedProduct.price - priceBreakdown.landedCostBDT} লাভ
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        ({Math.round(((extractedProduct.price - priceBreakdown.landedCostBDT) / extractedProduct.price) * 100)}% মার্জিন)
                      </span>
                    </div>
                  </div>

                  {/* Secondary Details Tabs (Specifications, Features, Variants, Description) */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <div className="flex items-center border-b border-gray-200 bg-gray-50/70 p-1 overflow-x-auto text-[11px] font-semibold gap-1">
                      <button
                        type="button"
                        onClick={() => setExtractedDetailsTab('specs')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          extractedDetailsTab === 'specs'
                            ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200/80'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        ⚙️ স্পেসিফিকেশন ({Object.keys(extractedProduct.specifications || {}).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtractedDetailsTab('features')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          extractedDetailsTab === 'features'
                            ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200/80'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        ✨ মূল ফিচার ({extractedProduct.features?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtractedDetailsTab('variants')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          extractedDetailsTab === 'variants'
                            ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200/80'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        🎨 কালার ও ভ্যারিয়েন্ট ({extractedProduct.colors?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtractedDetailsTab('description')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          extractedDetailsTab === 'description'
                            ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200/80'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        📝 সম্পূর্ণ বিবরণ
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtractedDetailsTab('images')}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          extractedDetailsTab === 'images'
                            ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-200/80'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        🖼️ সব ছবি ({extractedProduct.images.length})
                      </button>
                    </div>

                    <div className="p-3.5 max-h-48 overflow-y-auto text-xs bg-white">
                      {extractedDetailsTab === 'specs' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(extractedProduct.specifications || {}).map(([key, val]) => (
                            <div key={key} className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col">
                              <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">{key}</span>
                              <span className="font-semibold text-gray-800 text-[11.5px] mt-0.5">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {extractedDetailsTab === 'features' && (
                        <ul className="space-y-1.5">
                          {(extractedProduct.features || []).map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11.5px] text-gray-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {extractedDetailsTab === 'variants' && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-gray-500">পণ্যটির সাথে অন্তর্ভুক্ত কালার ও স্টাইল অপশনসমূহ:</p>
                          <div className="flex flex-wrap gap-2">
                            {(extractedProduct.colors || []).map((col, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800"
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs"
                                  style={{ backgroundColor: col.hex }}
                                />
                                <span>{col.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {extractedDetailsTab === 'description' && (
                        <div className="space-y-2 text-[11.5px] text-gray-700 leading-relaxed">
                          <p className="font-medium text-gray-900">{extractedProduct.banglaDescription}</p>
                          <p className="text-gray-600">{extractedProduct.description}</p>
                        </div>
                      )}

                      {extractedDetailsTab === 'images' && (
                        <div className="grid grid-cols-4 gap-2">
                          {extractedProduct.images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-200 relative group bg-gray-50">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                <a
                                  href={img}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded bg-white text-gray-800 text-[10px]"
                                  title="ওপেন করুন"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={extractedProduct.dropship?.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>উৎস পেজ দেখুন ({DROPSHIP_PLATFORMS[extractedProduct.dropship?.platform as DropshipPlatform || 'aliexpress']?.name})</span>
                </a>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handlePublishSingle('draft')}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    ড্রাফট হিসেবে রাখুন (Save Draft)
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublishSingle('active')}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>⚡ ১-ক্লিকে সব তথ্য ও ছবি সহ ইম্পোর্ট করুন (1-Click Import All)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BATCH URLS */}
      {activeTab === 'batch' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-600" />
              <span>একাধিক প্রোডাক্ট লিঙ্ক পেস্ট করুন (প্রতি লাইনে একটি করে):</span>
            </label>

            <textarea
              rows={6}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder={`https://www.aliexpress.com/item/1005005829103948.html\nhttps://detail.1688.com/offer/684920194821.html\nhttps://cjdropshipping.com/product/anti-gravity-water-drop-air-humidifier-p-162948102948.html`}
              className="w-full px-3.5 py-2.5 text-xs font-mono border border-gray-300 rounded-xl outline-none focus:border-rose-600"
            />

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setBatchInput([
                    'https://www.aliexpress.com/item/1005005829103948.html',
                    'https://detail.1688.com/offer/684920194821.html',
                    'https://www.alibaba.com/product-detail/GaN-100W-Fast-Charge-Powerbank_160089201948.html',
                    'https://cjdropshipping.com/product/anti-gravity-water-drop-air-humidifier-p-162948102948.html',
                    'https://item.taobao.com/item.htm?id=729481029481'
                  ].join('\n'));
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                + ৫টি ডেমো লিঙ্ক পূরণ করুন
              </button>

              <button
                type="button"
                onClick={handleBatchImportRun}
                disabled={isBatchRunning || !batchInput.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {isBatchRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ইমপোর্ট হচ্ছে ({batchProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Start Batch Import</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {batchImportedList.length > 0 && (
            <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900">
                  ইমপোর্টকৃত প্রোডাক্ট ({batchImportedList.length} টি)
                </h4>
                <button
                  type="button"
                  onClick={handlePublishBatch}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>সবগুলো স্টোরে যোগ করুন (Confirm & Publish)</span>
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {batchImportedList.map((p, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8.5px] font-bold px-1 rounded-tl">
                          {p.images.length}P
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 font-mono mt-0.5">
                          <span className="font-semibold text-rose-600 uppercase">
                            {p.dropship?.platform || 'DROPSHIP'}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700">৳{p.price.toLocaleString()}</span>
                          {p.originalPrice > p.price && (
                            <span className="line-through text-gray-400">৳{p.originalPrice.toLocaleString()}</span>
                          )}
                          <span>•</span>
                          <span className="text-gray-500">{p.images.length}টি হাই-রেজ্যুলেশন ইমেজ</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddNewProduct) {
                            onAddNewProduct(p);
                            setBatchImportedList(prev => prev.filter((_, i) => i !== idx));
                            showToast(`'${p.name}' ১-ক্লিকে সফলভাবে স্টোরে যুক্ত হয়েছে!`);
                          }
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>১-ক্লিক ইম্পোর্ট</span>
                      </button>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shrink-0">
                        Ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: WINNING CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="ক্যাটালগে সার্চ করুন..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-gray-900"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
              <button
                type="button"
                onClick={() => setCatalogFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  catalogFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Platforms
              </button>

              {(Object.keys(DROPSHIP_PLATFORMS) as DropshipPlatform[]).map((pid) => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setCatalogFilter(pid)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                    catalogFilter === pid
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {DROPSHIP_PLATFORMS[pid].name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCatalog.map((item) => {
              const pid = (item.dropship?.platform as DropshipPlatform) || 'aliexpress';
              const platformConfig = DROPSHIP_PLATFORMS[pid];
              const calc = calculateDropshipPricing(
                item.dropship!.sourcePrice,
                item.dropship!.sourceCurrency,
                pricingRule
              );

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-xs flex flex-col justify-between space-y-3 hover:border-gray-300 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${platformConfig.badgeBg}`}>
                        {platformConfig.name}
                      </span>
                      <h5 className="text-xs font-bold text-gray-900 truncate mt-1" title={item.name}>
                        {item.name}
                      </h5>
                      {item.banglaName && (
                        <p className="text-[10.5px] text-gray-500 truncate">{item.banglaName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-bold font-mono text-emerald-700">
                          ৳{calc.sellingPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 line-through font-mono">
                          ৳{calc.compareAtPrice.toLocaleString()}
                        </span>
                        <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                          +৳{calc.estimatedProfitBDT} লাভ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-[10.5px]">
                    <span className="text-gray-500 truncate">
                      {item.dropship?.shippingDays}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleImportCuratedItem(item)}
                      className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-amber-300" />
                      <span>1-Click Import</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: CJ DROPSHIPPING API & LIVE SEARCH */}
      {activeTab === 'cj_api' && (
        <div className="space-y-6">
          {/* Card 1: API Configuration & Live Status */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900">
                      CJ Dropshipping Open API 2.0 ইন্টিগ্রেশন
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      cjConfig.isConnected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cjConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {cjConfig.isConnected ? 'লাইভ কানেক্টেড (Active)' : 'কনফিগারেশন অপেক্ষমাণ'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    অফিশিয়াল CJ Developers API কী দিয়ে আপনার স্টোর সরাসরি সিজে ড্রপশিপিংয়ের সাথে সিঙ্ক করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>{showGuide ? 'গাইড লুকান' : 'কিভাবে API Key পাবেন?'}</span>
                </button>
              </div>
            </div>

            {/* Guide Accordion */}
            {showGuide && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs space-y-3">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>CJ Dropshipping API Key পাওয়ার ৪টি সহজ ধাপ:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">1</div>
                    <div className="font-bold text-gray-900">অ্যাকাউন্টে লগইন</div>
                    <div className="text-[11px] text-gray-500">cjdropshipping.com এ বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">2</div>
                    <div className="font-bold text-gray-900">API পেজে যান</div>
                    <div className="text-[11px] text-gray-500">My CJ &gt; Authorization &gt; API মেনুতে যান।</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">3</div>
                    <div className="font-bold text-gray-900">Key জেনারেট করুন</div>
                    <div className="text-[11px] text-gray-500">'Generate API Key' বাটনে ক্লিক করে কী কপি করুন।</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">4</div>
                    <div className="font-bold text-gray-900">এখানে পেস্ট করুন</div>
                    <div className="text-[11px] text-gray-500">নিচে API Key পেস্ট করে 'টেস্ট কানেকশন' ও 'সেভ' করুন।</div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* API Key */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    CJ Developer API Key:
                  </span>
                  <span className="text-[10px] text-blue-600 font-mono font-normal">Secret Token</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={cjConfig.apiKey}
                    onChange={(e) => setCjConfig({ ...cjConfig, apiKey: e.target.value })}
                    placeholder="যেমন: cj_live_8f3a9b2c1d4e7f6a5b8c9d0e..."
                    className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10.5px] text-gray-500">
                  CJ Open API গেটওয়েতে রিকোয়েস্ট ভ্যালিডেশনের জন্য প্রয়োজনীয়।
                </p>
              </div>

              {/* Account Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  CJ অ্যাকাউন্ট ইমেইল:
                </label>
                <input
                  type="email"
                  value={cjConfig.email}
                  onChange={(e) => setCjConfig({ ...cjConfig, email: e.target.value })}
                  placeholder="যেমন: merchant@banglaxpress.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-[10.5px] text-gray-500">
                  আপনার CJ Dropshipping রেজিস্টার্ড ইমেইল অ্যাড্রেস।
                </p>
              </div>

              {/* Target Warehouse */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                  টার্গেট ওয়্যারহাউজ (Warehouse):
                </label>
                <select
                  value={cjConfig.warehouse}
                  onChange={(e) => setCjConfig({ ...cjConfig, warehouse: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium"
                >
                  <option value="China Warehouse (Yiwu/Shenzhen)">China Warehouse (Yiwu / Shenzhen) - সর্বনিম্ন রেট</option>
                  <option value="US East Warehouse">US East Warehouse (2-5 Days Delivery)</option>
                  <option value="US West Warehouse">US West Warehouse (2-5 Days Delivery)</option>
                  <option value="Germany Warehouse">Germany European Hub</option>
                  <option value="Thailand Warehouse">Thailand Southeast Asia Hub</option>
                </select>
                <p className="text-[10.5px] text-gray-500">
                  পণ্য যে ওয়্যারহাউজ থেকে সরাসরি কাস্টমারের ঠিকানায় ডিসপ্যাচ করা হবে।
                </p>
              </div>

              {/* Shipping Carrier */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  ডিফল্ট শিপিং লাইন (Shipping Carrier):
                </label>
                <select
                  value={cjConfig.shippingMethod}
                  onChange={(e) => setCjConfig({ ...cjConfig, shippingMethod: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium"
                >
                  <option value="CJ Packet VIP (7-14 Days)">CJ Packet VIP Express (৭-১৪ দিন, ট্র্যাকিং সহ)</option>
                  <option value="CJ Packet Ordinary (10-18 Days)">CJ Packet Ordinary (১০-১৮ দিন)</option>
                  <option value="DHL Express (3-7 Days)">DHL Express (৩-৭ দিন, প্রিমিয়াম)</option>
                  <option value="CJ Special Line (Liquid & Battery)">CJ Special Line (ব্যাটারি ও লিকুইড আইটেমের জন্য)</option>
                </select>
                <p className="text-[10.5px] text-gray-500">
                  আন্তর্জাতিক শিপিং লাইন যা কাস্টমারের কাছে দ্রুত ডেলিভারি নিশ্চিত করে।
                </p>
              </div>
            </div>

            {/* Connection Test Results */}
            {cjTestResult && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                cjTestResult.success
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {cjTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{cjTestResult.message}</span>
                </div>
                {cjTestResult.success && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-gray-700">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-gray-400 block text-[9.5px]">PING LATENCY</span>
                      <strong className="text-emerald-700">{cjTestResult.latencyMs}ms</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-gray-400 block text-[9.5px]">ACCOUNT TIER</span>
                      <strong className="text-blue-700">{cjTestResult.accountTier}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-gray-400 block text-[9.5px]">DAILY API QUOTA</span>
                      <strong className="text-gray-900">{cjTestResult.apiQuotaDaily}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-gray-400 block text-[9.5px]">OPEN API STATUS</span>
                      <strong className="text-emerald-700">Active Live</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>আপনার API কী ব্রাউজারে সুরক্ষিতভাবে সংরক্ষিত থাকে।</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestCJConnection}
                  disabled={isTestingCJ}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingCJ ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>টেস্টিং হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-blue-600 fill-current" />
                      <span>টেস্ট কানেকশন (Test Connection)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveCJConfig}
                  disabled={isSavingCJ}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingCJ ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>কনফিগারেশন সেভ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Quick PID / SKU Fetch Tool */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-sm border border-blue-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                  PID
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>CJ Product ID বা SKU দিয়ে তাৎক্ষণিক ফেচ করুন</span>
                    <span className="text-[10px] bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full font-normal">
                      Instant Sync
                    </span>
                  </h4>
                  <p className="text-xs text-blue-200 mt-0.5">
                    যেকোনো CJ প্রোডাক্টের আইডি বা SKU দিলে রিয়েলটাইম ভ্যারিয়েন্ট ও প্রাইস লোড হবে।
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="যেমন: 162948102948 অথবা CJ-HUM-ANTIG01"
                className="flex-1 px-3.5 py-2.5 text-xs bg-white/10 border border-white/20 text-white placeholder:text-gray-400 rounded-xl outline-none focus:border-blue-400 font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.currentTarget.value.trim();
                    if (target) {
                      setUrlInput(target);
                      setSelectedPlatform('cjdropshipping');
                      setActiveTab('url_import');
                      setTimeout(() => handleExtractSingle(), 100);
                    }
                  }
                }}
                id="cjPidInstantInput"
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('cjPidInstantInput') as HTMLInputElement;
                  const val = el?.value?.trim();
                  if (!val) {
                    showToast('CJ Product ID বা SKU লিখুন');
                    return;
                  }
                  setUrlInput(val);
                  setSelectedPlatform('cjdropshipping');
                  setActiveTab('url_import');
                  setTimeout(() => handleExtractSingle(), 100);
                }}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ফেচ ও রিভিউ করুন</span>
              </button>
            </div>

            {/* Quick Demo PIDs */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-blue-300 text-[11px] font-medium flex items-center gap-1">
                <Info className="w-3 h-3" />
                উইনিং স্যাম্পল PID:
              </span>
              {CJ_WINNING_CATALOG_DATABASE.slice(0, 5).map((item) => (
                <button
                  key={item.pid}
                  type="button"
                  onClick={() => {
                    setUrlInput(item.pid);
                    setSelectedPlatform('cjdropshipping');
                    setActiveTab('url_import');
                    setTimeout(() => handleExtractSingle(), 100);
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-blue-100 rounded-lg text-[11px] font-medium transition-colors border border-white/10 cursor-pointer"
                >
                  {item.productName.split(' ')[0]} {item.productName.split(' ')[1]} (PID: {item.pid.slice(0, 6)}...)
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Live CJ Winning Catalog Browser & 1-Click Store Importer */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>CJ Dropshipping লাইভ প্রোডাক্ট সার্চ ও ১-ক্লিক ইম্পোর্ট</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {cjSearchMode === 'live'
                      ? `লাইভ API ফলাফল (${cjTotalRecords > 0 ? cjTotalRecords.toLocaleString() : displayedCJProducts.length} টি পণ্য)`
                      : `বাছাইকৃত উইনিং তালিকা (${displayedCJProducts.length} টি)`}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  সিজের ১.৫+ মিলিয়ন পণ্যের ডাটাবেজ থেকে সরাসরি সার্চ করে আপনার দোকানে ১-ক্লিকে প্রাইস, ভ্যারিয়েন্ট ও ছবি সহ যুক্ত করুন।
                </p>
              </div>

              {/* Search Mode Toggle & Search Bar */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="inline-flex rounded-xl bg-gray-100 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setCjSearchMode('live');
                      if (cjLiveProducts.length === 0) handleSearchCJLive(1, cjSearchQuery);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      cjSearchMode === 'live'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🌐 লাইভ API
                  </button>
                  <button
                    type="button"
                    onClick={() => setCjSearchMode('curated')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      cjSearchMode === 'curated'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ⭐ উইনিং
                  </button>
                </div>

                <div className="relative w-full sm:w-72 flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={cjSearchQuery}
                    onChange={(e) => setCjSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchCJLive(1, cjSearchQuery);
                      }
                    }}
                    placeholder="যেমন: drone, watch, humidifier..."
                    className="w-full pl-8 pr-16 py-1.5 text-xs border border-gray-300 rounded-xl outline-none focus:border-blue-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchCJLive(1, cjSearchQuery)}
                    disabled={isLoadingCJLive}
                    className="absolute right-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingCJLive ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'সার্চ'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filter Chips (Triggers Live Search) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-gray-400 text-[11px] font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                ট্রেন্ডিং বিষয়:
              </span>
              {[
                { id: 'all', label: 'সবগুলো (All)', query: '' },
                { id: 'humidifier', label: 'হিউমিডিফায়ার', query: 'humidifier' },
                { id: 'powerbank', label: 'পাওয়ার ব্যাংক', query: 'power bank' },
                { id: 'watch', label: 'স্মার্টওয়াচ', query: 'smart watch' },
                { id: 'drone', label: 'ড্রোন ও আরসি', query: 'drone' },
                { id: 'earbuds', label: 'ইয়ারবাডস', query: 'earbuds' },
                { id: 'massager', label: 'ম্যাসেজার', query: 'massager' },
                { id: 'lamp', label: 'নাইট ল্যাম্প', query: 'lamp' },
                { id: 'kitchen', label: 'হোম ও কিচেন', query: 'kitchen' }
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setCjQuickFilter(chip.id);
                    setCjSearchQuery(chip.query);
                    handleSearchCJLive(1, chip.query);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    cjQuickFilter === chip.id
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Loading State or Products Grid */}
            {isLoadingCJLive ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <div className="font-bold text-sm text-gray-800">
                  CJ Dropshipping ওপেন API থেকে পণ্য লোড হচ্ছে...
                </div>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  রিয়েলটাইম ফ্যাক্টরি স্টক, ছবি ও ভ্যারিয়েন্ট তথ্য সংগ্রহ করা হচ্ছে।
                </p>
              </div>
            ) : displayedCJProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <div className="font-bold text-sm text-gray-800">কোনো পণ্য পাওয়া যায়নি</div>
                <p className="text-xs text-gray-500">অন্য কোনো ইংরেজি কীওয়ার্ড দিয়ে আবার সার্চ করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedCJProducts.map((item) => {
                  const bdtFactoryCost = Math.round(item.sourcePriceUSD * pricingRule.usdRate);
                  const suggestedSellingPrice = Math.round(
                    bdtFactoryCost * pricingRule.markupMultiplier + pricingRule.fixedMarkupBDT
                  );
                  const profitBDT = suggestedSellingPrice - bdtFactoryCost;
                  const profitPercent = Math.round((profitBDT / suggestedSellingPrice) * 100);
                  const isImported = !!importedPids[item.pid];

                  return (
                    <div
                      key={item.pid}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
                    >
                      {/* Image with Badges */}
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={item.productImage || item.galleryImages[0]}
                          alt={item.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-600 text-white shadow-2xs">
                            CJ Dropshipping
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5 text-amber-300" />
                            <span>{item.galleryImages?.length || 1} Photos</span>
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-600 text-white shadow-2xs">
                            +{profitPercent}% মার্জিন
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 text-xs">
                        <div>
                          <div className="text-[10.5px] text-gray-400 font-medium">
                            {item.category} • স্টক: {(item.stockCount || 500).toLocaleString()} টি
                          </div>
                          <h5 className="font-bold text-gray-900 line-clamp-1 mt-0.5 group-hover:text-blue-600 transition-colors">
                            {item.banglaName || item.productName}
                          </h5>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {item.productName}
                          </p>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">সিজে ফ্যাক্টরি খরচ:</span>
                            <span className="font-mono font-bold text-gray-700">
                              ${item.sourcePriceUSD} (৳{bdtFactoryCost.toLocaleString()})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-0.5 border-t border-blue-200/50">
                            <span className="font-bold text-gray-800">স্টোরে বিক্রয় মূল্য:</span>
                            <span className="font-mono font-bold text-emerald-700 text-sm">
                              ৳{suggestedSellingPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10.5px] text-emerald-800">
                            <span>প্রত্যাশিত মুনাফা:</span>
                            <span className="font-mono font-bold">
                              +৳{profitBDT.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Delivery & Carrier info */}
                        <div className="flex items-center justify-between text-[10.5px] text-gray-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-500" />
                            <span className="truncate max-w-[130px]">{item.shippingDays}</span>
                          </span>
                          <span className="font-mono text-gray-400">
                            {item.ordersCount}
                          </span>
                        </div>

                        {/* Dual Action Buttons: Details Modal & 1-Click Import */}
                        <div className="space-y-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(item)}
                            className="w-full py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>👁️ সব ছবি ও বিস্তারিত প্রিভিউ</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickImportCJItem(item)}
                            disabled={isImported}
                            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              isImported
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                            }`}
                          >
                            {isImported ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                <span>✓ স্টোরে যুক্ত হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>⚡ ১-ক্লিকে সম্পূর্ণ ইম্পোর্ট করুন</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {cjSearchMode === 'live' && cjTotalPages > 1 && (
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 text-xs">
                <div className="text-gray-500">
                  মোট {cjTotalRecords.toLocaleString()} টি পণ্য পাওয়া গেছে
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSearchCJLive(Math.max(1, cjPage - 1))}
                    disabled={cjPage <= 1 || isLoadingCJLive}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    পূর্ববর্তী পেজ
                  </button>
                  <span className="font-bold text-gray-800 px-2">
                    পৃষ্ঠা {cjPage} / {cjTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSearchCJLive(Math.min(cjTotalPages, cjPage + 1))}
                    disabled={cjPage >= cjTotalPages || isLoadingCJLive}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    পরবর্তী পেজ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CJ PRODUCT DETAILS & ALL IMAGES MODAL */}
          {viewingCJDetailItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
                {/* Modal Header */}
                <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-600 text-white">
                      CJ Dropshipping Live Item
                    </span>
                    <span className="font-mono text-xs text-gray-500">
                      PID: {viewingCJDetailItem.pid} | SKU: {viewingCJDetailItem.sku}
                    </span>
                    {isLoadingDetailModal && (
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        লাইভ ভ্যারিয়েন্ট ও ছবি সিঙ্ক হচ্ছে...
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingCJDetailItem(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Left: Gallery */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                        <img
                          src={
                            (viewingCJDetailItem.galleryImages && viewingCJDetailItem.galleryImages[cjModalImageIdx]) ||
                            viewingCJDetailItem.productImage
                          }
                          alt={viewingCJDetailItem.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* All Captured Images Row */}
                      <div>
                        <span className="text-[10.5px] text-gray-500 font-semibold block mb-1">
                          ক্যাপচার্ড ফটো ({viewingCJDetailItem.galleryImages.length}টি ছবি):
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {viewingCJDetailItem.galleryImages.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCjModalImageIdx(idx)}
                              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                cjModalImageIdx === idx ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 opacity-80'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Info */}
                    <div className="md:col-span-7 space-y-3">
                      <div>
                        <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider block">
                          {viewingCJDetailItem.category}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                          {viewingCJDetailItem.banglaName}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {viewingCJDetailItem.productName}
                        </p>
                      </div>

                      {/* Pricing Grid */}
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-gray-500 block text-[10px]">ফ্যাক্টরি খরচ</span>
                          <strong className="text-gray-800 text-xs font-mono">
                            ${viewingCJDetailItem.sourcePriceUSD} (৳{Math.round(viewingCJDetailItem.sourcePriceUSD * pricingRule.usdRate)})
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">বিক্রয় মূল্য</span>
                          <strong className="text-emerald-700 text-sm font-mono font-bold">
                            ৳{Math.round(viewingCJDetailItem.sourcePriceUSD * pricingRule.usdRate * pricingRule.markupMultiplier + pricingRule.fixedMarkupBDT)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">শিপিং লাইন</span>
                          <strong className="text-blue-700 text-[10.5px] truncate block">
                            {viewingCJDetailItem.shippingDays.split(' ')[0]} {viewingCJDetailItem.shippingDays.split(' ')[1]}
                          </strong>
                        </div>
                      </div>

                      {/* Specifications Table */}
                      <div>
                        <span className="font-bold text-gray-800 text-xs block mb-1">
                          ⚙️ টেকনিক্যাল স্পেসিফিকেশন:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                          {Object.entries(viewingCJDetailItem.specifications).map(([k, v]) => (
                            <div key={k} className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                              <span className="text-gray-400 block text-[9.5px]">{k}</span>
                              <span className="font-semibold text-gray-800 text-[11px] truncate block">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Color variants */}
                      <div>
                        <span className="font-bold text-gray-800 text-xs block mb-1">
                          🎨 কালার ও ভ্যারিয়েন্ট:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {viewingCJDetailItem.variants.map((v) => (
                            <span
                              key={v.variantId}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 text-[11px] font-medium"
                            >
                              {v.variantName} ({v.inventory} pcs)
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <span className="font-bold text-gray-800 text-xs block mb-1">
                          ✨ মূল সুবিধাসমূহ:
                        </span>
                        <ul className="space-y-1">
                          {viewingCJDetailItem.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
                  <a
                    href={`https://cjdropshipping.com/product/item-p-${viewingCJDetailItem.pid}.html`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>সিজে অফিশিয়াল পেজ দেখুন</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingCJDetailItem(null)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleQuickImportCJItem(viewingCJDetailItem);
                        setViewingCJDetailItem(null);
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>⚡ সব তথ্য ও ছবি সহ ১-ক্লিকে স্টোরে ইম্পোর্ট করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: PRICING RULES */}
      {activeTab === 'pricing' && (
        <div className="max-w-2xl bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-rose-600" />
              <span>কারেন্সি এক্সচেঞ্জ ও প্রাইসিং রুলস কনফিগারেশন</span>
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              উৎস সাইটের মূল্য থেকে বিক্রয় মূল্য ও প্রফিট মার্জিন হিসেব করার সূত্র।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
              <label className="font-bold text-gray-700 block">USD রেট ($1 = ৳):</label>
              <input
                type="number"
                value={pricingRule.usdRate}
                onChange={(e) => setPricingRule({ ...pricingRule, usdRate: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono font-bold bg-white"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
              <label className="font-bold text-gray-700 block">CNY / RMB রেট (¥1 = ৳):</label>
              <input
                type="number"
                step="0.1"
                value={pricingRule.cnyRate}
                onChange={(e) => setPricingRule({ ...pricingRule, cnyRate: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono font-bold bg-white"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
              <label className="font-bold text-gray-700 block">মার্কআপ মাল্টিপ্লায়ার:</label>
              <input
                type="number"
                step="0.1"
                value={pricingRule.markupMultiplier}
                onChange={(e) => setPricingRule({ ...pricingRule, markupMultiplier: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono font-bold bg-white"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
              <label className="font-bold text-gray-700 block">ফিক্সড হ্যান্ডলিং ফি (৳):</label>
              <input
                type="number"
                value={pricingRule.fixedMarkupBDT}
                onChange={(e) => setPricingRule({ ...pricingRule, fixedMarkupBDT: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono font-bold bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                saveStoredPricingRule(pricingRule);
                showToast('প্রাইসিং রুলস সংরক্ষিত হয়েছে!');
              }}
              className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>রুলস সেভ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 5: IMPORTED HISTORY */}
      {activeTab === 'imported_history' && (
        <div className="space-y-4">
          {existingDropshipProducts.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">এখনও কোনো ড্রপশিপিং পণ্য স্টোরে যুক্ত করা হয়নি</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                URL ডাইরেক্ট ইম্পোর্ট বা টপ উইনিং ক্যাটালগ ট্যাব থেকে পণ্য পছন্দ করে স্টোরে যুক্ত করুন।
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>ক্যাটালগ ব্রাউজ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900">
                  স্টোরে ড্রপশিপ প্রোডাক্ট তালিকা ({existingDropshipProducts.length} টি)
                </h4>
              </div>

              <div className="divide-y divide-gray-100">
                {existingDropshipProducts.map((p) => {
                  const pid = (p.dropship?.platform as DropshipPlatform) || 'aliexpress';
                  const pConfig = DROPSHIP_PLATFORMS[pid];
                  return (
                    <div key={p.id} className="p-3.5 flex items-center gap-3 hover:bg-gray-50/60">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${pConfig?.badgeBg || 'bg-gray-100'}`}>
                            {pConfig?.name || p.dropship?.platform}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">SKU: {p.sku}</span>
                        </div>
                        <h5 className="text-xs font-bold text-gray-900 truncate mt-0.5">{p.name}</h5>
                        <p className="text-[11px] text-gray-500">
                          বিক্রয়: <strong className="font-mono text-emerald-700">৳{p.price.toLocaleString()}</strong> |
                          মূল খরচ: <span className="font-mono">{p.dropship?.sourceCurrency} {p.dropship?.sourcePrice}</span> |
                          শিপিং: {p.dropship?.shippingDays}
                        </p>
                      </div>

                      {p.dropship?.sourceUrl && (
                        <a
                          href={p.dropship.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>উৎস লিঙ্ক</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
